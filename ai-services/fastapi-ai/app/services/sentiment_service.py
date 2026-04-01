import os
from pathlib import Path

from fastapi import HTTPException
from app.schemas.common import Meta
from app.schemas.sentiment import SentimentRequest, SentimentResponse

_MODEL = None
_TOKENIZER = None
_MODEL_NAME = "sentiment-phobert"


def _try_load_trained_model():
    global _MODEL, _TOKENIZER, _MODEL_NAME
    if _MODEL is not None and _TOKENIZER is not None:
        return _MODEL, _TOKENIZER, _MODEL_NAME

    checkpoint = os.getenv(
        "SENTIMENT_MODEL_DIR",
        "ml/sentiment/artifacts/checkpoints/phobert-sentiment/final",
    )
    checkpoint_path = Path(checkpoint)
    if not checkpoint_path.exists():
        raise HTTPException(
            status_code=503,
            detail=f"Sentiment model checkpoint not found at '{checkpoint}'. Please train AI-02 first.",
        )

    try:
        import torch
        from transformers import AutoModelForSequenceClassification, AutoTokenizer

        _TOKENIZER = AutoTokenizer.from_pretrained(checkpoint)
        _MODEL = AutoModelForSequenceClassification.from_pretrained(checkpoint)
        _MODEL.eval()
        _MODEL_NAME = checkpoint_path.name
        return _MODEL, _TOKENIZER, _MODEL_NAME
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=f"Sentiment model failed to load from '{checkpoint}': {error}",
        ) from error


def classify_sentiment(payload: SentimentRequest) -> SentimentResponse:
    model, tokenizer, model_name = _try_load_trained_model()
    import torch

    encoded = tokenizer(
        payload.feedback_text,
        return_tensors="pt",
        truncation=True,
        max_length=256,
        padding=True,
    )
    with torch.no_grad():
        logits = model(**encoded).logits
        probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]

    id2label = model.config.id2label
    labels = [id2label.get(i, str(i)).upper() for i in range(len(probs))]
    prob_map = {labels[i]: float(probs[i]) for i in range(len(probs))}
    pred_idx = int(torch.argmax(logits, dim=-1).cpu().numpy()[0])
    label = labels[pred_idx]
    score = prob_map.get("POSITIVE", 0.0) - prob_map.get("NEGATIVE", 0.0)

    return SentimentResponse(
        meeting_id=payload.meeting_id,
        student_user_id=payload.student_user_id,
        sentiment_label=label,
        sentiment_score=score,
        meta=Meta(model_name=model_name),
    )
