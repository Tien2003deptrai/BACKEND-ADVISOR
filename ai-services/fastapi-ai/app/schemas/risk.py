from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import Meta


class RiskRequest(BaseModel):
    student_user_id: str
    term_id: str
    gpa_current: float = Field(ge=0, le=4)
    attendance_rate: float = Field(ge=0, le=1)
    num_failed: int = Field(ge=0, le=5)
    stress_level: int = Field(ge=1, le=5)
    motivation_score: int = Field(ge=1, le=5)
    shcvht_participation: float = Field(ge=0, le=5)
    study_hours: float = Field(ge=0, le=30)
    sentiment_score: float = Field(ge=-1, le=1)


class RiskResponse(BaseModel):
    student_user_id: str
    term_id: str
    risk_score: float
    risk_label: Literal[-1, 0, 1]
    meta: Meta
