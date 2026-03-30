from app.schemas.common import Meta
from app.schemas.risk import RiskRequest, RiskResponse


def predict_risk(payload: RiskRequest) -> RiskResponse:
    base = (
        (1 - (payload.gpa_current / 4)) * 0.4
        + (1 - payload.attendance_rate) * 0.2
        + min(payload.num_failed / 5, 1) * 0.2
        + ((payload.stress_level - 1) / 4) * 0.1
        + ((5 - payload.motivation_score) / 4) * 0.1
    )
    risk_score = round(max(0.0, min(base, 1.0)), 4)
    risk_label = 1 if risk_score >= 0.5 else 0
    return RiskResponse(
        student_user_id=payload.student_user_id,
        term_code=payload.term_code,
        risk_score=risk_score,
        risk_label=risk_label,
        meta=Meta(model_name="risk-baseline"),
    )
