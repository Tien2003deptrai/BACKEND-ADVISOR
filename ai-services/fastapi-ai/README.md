# FastAPI AI Services

FastAPI service cho các task AI trong BACKEND-ADVISOR (scope hiện tại):

- Academic Risk Prediction
- Sentiment Analysis

## 1) Cài đặt

Nếu chưa cài `uv` (Windows):
- `winget install --id=astral-sh.uv -e`

```bash
cd ai-services/fastapi-ai
uv venv
.venv\\Scripts\\activate
uv sync
```

## 2) Chạy local

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Docs:
- Swagger: `http://localhost:8001/docs`
- Health: `http://localhost:8001/api/v1/health`

## 3) Biến môi trường

Copy `.env.example` thành `.env` và sửa lại theo hệ thống của bạn.

## 4) Endpoints hiện có

- `GET /api/v1/health`
- `POST /api/v1/risk/predict`
- `POST /api/v1/sentiment/classify`

## 5) Ghi chú

Service risk sẽ ưu tiên model đã train:
- Set `RISK_MODEL_DIR` (default `ml/risk/artifacts/checkpoints/risk-rf/final`)
- Nếu không tìm thấy model, API `/api/v1/risk/predict` sẽ fallback `risk-baseline`

Service sentiment bắt buộc dùng checkpoint đã train:
- Set `SENTIMENT_MODEL_DIR` (hoặc dùng default)
- Nếu không có checkpoint, API `/api/v1/sentiment/classify` sẽ trả `503`

Tài liệu training AI-01 và AI-02 xem tại:
- `ml/README.md`
