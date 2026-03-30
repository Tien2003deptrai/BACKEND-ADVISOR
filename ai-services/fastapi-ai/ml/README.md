# ML Training Guide (AI-02 Sentiment)

Tai lieu nay danh rieng cho muc dich train model sentiment (PhoBERT).

## 1) Cai dependencies train

```bash
cd ai-services/fastapi-ai
uv venv
.venv\\Scripts\\activate
uv sync --group train
```

## 2) Chuan bi du lieu

Dat file CSV vao:
- `ml/data/sentiment_train.csv`
- `ml/data/sentiment_valid.csv`
- `ml/data/sentiment_test.csv` (khuyen nghi)

Cot bat buoc:
- `text`
- `sentiment_label` (`NEGATIVE`, `NEUTRAL`, `POSITIVE`)

Cot optional:
- `rating`

## 3) Prepare PhoBERT base

```bash
uv run python ml/scripts/prepare_phobert.py
```

Output:
- `ml/artifacts/checkpoints/phobert-base-initial`

## 4) Train

```bash
uv run python ml/scripts/train_sentiment.py --config ml/configs/sentiment_train.yaml
```

Output checkpoint:
- `ml/artifacts/checkpoints/phobert-sentiment/final`

## 5) Evaluate

```bash
uv run python ml/scripts/eval_sentiment.py --config ml/configs/sentiment_train.yaml
```

## 6) Predict nhanh 1 text

```bash
uv run python ml/scripts/predict_sentiment.py --text "Buoi SHCVHT rat huu ich"
```

## 7) Score mapping mac dinh

`feedback_score = P(POSITIVE) - P(NEGATIVE)`  
Gia tri nam trong `[-1, 1]`.

## 8) Dung checkpoint trong FastAPI

Set env:
- `SENTIMENT_MODEL_DIR=ml/artifacts/checkpoints/phobert-sentiment/final`

Neu khong co checkpoint, service sentiment tra loi `503 model not ready`.
