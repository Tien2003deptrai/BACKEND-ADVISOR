# FastAPI AI Services

FastAPI service cho cac task AI trong BACKEND-ADVISOR (scope hien tai):

- Academic Risk Prediction
- Sentiment Analysis

## 1) Cai dat

Neu chua cai `uv` (Windows):
- `winget install --id=astral-sh.uv -e`

```bash
cd ai-services/fastapi-ai
uv venv
.venv\\Scripts\\activate
uv sync
```

## 2) Chay local

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Docs:
- Swagger: `http://localhost:8001/docs`
- Health: `http://localhost:8001/api/v1/health`

## 3) Bien moi truong

Copy `.env.example` thanh `.env` va sua lai theo he thong cua ban.

## 4) Endpoints hien co

- `GET /api/v1/health`
- `POST /api/v1/risk/predict`
- `POST /api/v1/sentiment/classify`

## 5) Ghi chu

Service sentiment bat buoc dung checkpoint da train:
- Set `SENTIMENT_MODEL_DIR` (hoac dung default)
- Neu khong co checkpoint, API `/api/v1/sentiment/classify` se tra `503`

Tai lieu training AI-02 xem tai:
- `ml/README.md`
