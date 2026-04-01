# ML Training Guide (AI-01 + AI-02)

## 1) Cai dependencies train

```bash
cd ai-services/fastapi-ai
uv venv
.venv\\Scripts\\activate
uv sync --group train
```

## 2) Train AI-01 (Risk Prediction)

### 2.1 Chuan bi du lieu AI-01

Dat file CSV vao:
- `ml/risk/data/risk_train.csv`
- `ml/risk/data/risk_valid.csv`
- `ml/risk/data/risk_test.csv` (khuyen nghi)

Cot bat buoc:
- `gpa_current` (0..4)
- `attendance_rate` (0..1)
- `num_failed` (0..5)
- `stress_level` (1..5)
- `motivation_score` (1..5)
- `shcvht_participation` (0..5)
- `study_hours` (0..30)
- `sentiment_score` (-1..1)
- `risk_label` (-1/0/1; High/Medium/Low)

Rule gan nhan de thong nhat:
- `-1 (High)`: `gpa_current < 2.2` hoac `num_failed >= 2`
- `0 (Medium)`: con lai
- `1 (Low)`: `gpa_current > 2.8` va `num_failed = 0`

Neu muon tao du lieu mau de test nhanh:

```bash
uv run python ml/risk/data/gen_risk_data.py
```

### 2.2 Train AI-01

```bash
uv run python ml/risk/scripts/train_risk.py --config ml/risk/configs/risk_train.yaml
```

Output checkpoint:
- `ml/risk/artifacts/checkpoints/risk-rf/final/model.pkl`

### 2.3 Evaluate AI-01

```bash
uv run python ml/risk/scripts/eval_risk.py --config ml/risk/configs/risk_train.yaml
```

### 2.4 Predict nhanh 1 mau AI-01

```bash
uv run python ml/risk/scripts/predict_risk.py ^
  --gpa_current 2.1 ^
  --attendance_rate 0.72 ^
  --num_failed 2 ^
  --stress_level 4 ^
  --motivation_score 2 ^
  --shcvht_participation 0.6 ^
  --study_hours 12 ^
  --sentiment_score -0.2
```

## 3) Train AI-02 (Sentiment PhoBERT)

### 3.1 Chuan bi du lieu AI-02

Dat file CSV vao:
- `ml/sentiment/data/sentiment_train.csv`
- `ml/sentiment/data/sentiment_valid.csv`
- `ml/sentiment/data/sentiment_test.csv` (khuyen nghi)

Cot bat buoc:
- `feedback_text`
- `sentiment_label` (`NEGATIVE`, `NEUTRAL`, `POSITIVE`)

Cot optional:
- `rating`

### 3.2 Prepare PhoBERT base

```bash
uv run python ml/sentiment/scripts/prepare_phobert.py
```

Output:
- `ml/sentiment/artifacts/checkpoints/phobert-base-initial`

### 3.3 Train

```bash
uv run python ml/sentiment/scripts/train_sentiment.py --config ml/sentiment/configs/sentiment_train.yaml
```

Output checkpoint:
- `ml/sentiment/artifacts/checkpoints/phobert-sentiment/final`

### 3.4 Evaluate

```bash
uv run python ml/sentiment/scripts/eval_sentiment.py --config ml/sentiment/configs/sentiment_train.yaml
```

### 3.5 Predict nhanh 1 text

```bash
uv run python ml/sentiment/scripts/predict_sentiment.py --text "Buoi SHCVHT rat huu ich"
```

## 4) Score mapping mac dinh (AI-02)

`feedback_score = P(POSITIVE) - P(NEGATIVE)`  
Gia tri nam trong `[-1, 1]`.

## 5) Dung checkpoint trong FastAPI

Set env cho AI-01:
- `RISK_MODEL_DIR=ml/risk/artifacts/checkpoints/risk-rf/final`

Set env:
- `SENTIMENT_MODEL_DIR=ml/sentiment/artifacts/checkpoints/phobert-sentiment/final`

Neu khong co checkpoint sentiment, service sentiment tra loi `503 model not ready`.
Neu khong co checkpoint risk, service risk fallback sang `risk-baseline`.
