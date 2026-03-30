from pydantic import BaseModel, Field

from app.schemas.common import Meta


class SentimentRequest(BaseModel):
    meeting_id: str
    student_user_id: str
    feedback_text: str = Field(min_length=30)


class SentimentResponse(BaseModel):
    meeting_id: str
    student_user_id: str
    sentiment_label: str
    sentiment_score: float
    meta: Meta
