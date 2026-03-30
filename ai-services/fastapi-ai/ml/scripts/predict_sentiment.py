from __future__ import annotations

import argparse

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from sentiment_common import load_config, normalize_label


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Predict sentiment and feedback_score for one text.")
    parser.add_argument("--text", required=True, help="Input feedback_text")
    parser.add_argument(
        "--config",
        default="ml/configs/sentiment_train.yaml",
        help="Path to yaml config",
    )
    parser.add_argument(
        "--checkpoint",
        default=None,
        help="Checkpoint path (default: <output_dir>/final)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    cfg = load_config(args.config)
    train_cfg = cfg["train"]
    model_cfg = cfg["model"]
    score_cfg = cfg.get("score_mapping", {})

    labels = [normalize_label(label) for label in model_cfg["labels"]]
    checkpoint = args.checkpoint or f"{train_cfg['output_dir']}/final"

    tokenizer = AutoTokenizer.from_pretrained(checkpoint)
    model = AutoModelForSequenceClassification.from_pretrained(checkpoint)
    model.eval()

    encoded = tokenizer(
        args.text,
        return_tensors="pt",
        truncation=True,
        max_length=int(cfg["data"].get("max_length", 256)),
        padding=True,
    )

    with torch.no_grad():
        logits = model(**encoded).logits
        probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]

    prob_map = {label: float(probs[idx]) for idx, label in enumerate(labels)}
    pred_idx = int(torch.argmax(logits, dim=-1).cpu().numpy()[0])
    pred_label = labels[pred_idx]

    method = str(score_cfg.get("method", "pos_minus_neg"))
    if method != "pos_minus_neg":
        raise ValueError(f"Unsupported score mapping method: {method}")

    feedback_score = prob_map.get("POSITIVE", 0.0) - prob_map.get("NEGATIVE", 0.0)

    print("Prediction done")
    print(f"checkpoint={checkpoint}")
    print(f"label={pred_label}")
    print(f"probabilities={prob_map}")
    print(f"feedback_score={feedback_score:.6f}")


if __name__ == "__main__":
    main()
