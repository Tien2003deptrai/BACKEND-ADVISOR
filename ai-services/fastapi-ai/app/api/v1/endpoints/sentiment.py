from fastapi import APIRouter

from app.schemas.sentiment import SentimentRequest, SentimentResponse
from app.services.sentiment_service import classify_sentiment

router = APIRouter()


@router.post("/classify", response_model=SentimentResponse)
def classify(payload: SentimentRequest) -> SentimentResponse:
    return classify_sentiment(payload)
