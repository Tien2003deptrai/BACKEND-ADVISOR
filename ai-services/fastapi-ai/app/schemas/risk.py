from pydantic import BaseModel, Field

from app.schemas.common import Meta


class RiskRequest(BaseModel):
    student_user_id: str
    term_code: str
    gpa_current: float = Field(ge=0, le=4)
    attendance_rate: float = Field(ge=0, le=1)
    num_failed: int = Field(ge=0)
    stress_level: int = Field(ge=1, le=5)
    motivation_score: int = Field(ge=1, le=5)


class RiskResponse(BaseModel):
    student_user_id: str
    term_code: str
    risk_score: float
    risk_label: int
    meta: Meta
