import os
import pickle
from pathlib import Path
from typing import Any

from app.schemas.common import Meta
from app.schemas.risk import RiskRequest, RiskResponse

_RISK_ARTIFACT: dict[str, Any] | None = None


def _label_from_rule(payload: RiskRequest) -> int:
    # Hard rule priority
    if payload.gpa_current < 2.0 or payload.num_failed >= 3:
        return -1

    high_count = (
        int(payload.gpa_current < 2.5)
        + int(payload.num_failed >= 2)
        + int(payload.stress_level >= 3)
        + int(payload.sentiment_score < -0.2)
        + int(payload.attendance_rate < 0.7)
    )

    low_count = (
        int(payload.gpa_current >= 2.8)
        + int(payload.num_failed == 0)
        + int(payload.stress_level <= 2)
        + int(payload.sentiment_score >= 0.2)
        + int(payload.attendance_rate >= 0.8)
    )

    if high_count >= 3:
        return -1
    if low_count >= 3:
        return 1
    return 0


def _baseline(payload: RiskRequest) -> tuple[float, int, str]:
    base = (
        (1 - (payload.gpa_current / 4)) * 0.3
        + (1 - payload.attendance_rate) * 0.15
        + min(payload.num_failed / 5, 1) * 0.15
        + ((payload.stress_level - 1) / 4) * 0.1
        + ((5 - payload.motivation_score) / 4) * 0.1
        + (1 - min(payload.shcvht_participation / 5, 1)) * 0.1
        + (1 - min(payload.study_hours / 30, 1)) * 0.1
        + ((1 - payload.sentiment_score) / 2) * 0.1
    )
    risk_score = round(max(0.0, min(base, 1.0)), 4)
    risk_label = _label_from_rule(payload)
    return risk_score, risk_label, "RandomForest"


def _try_load_risk_artifact() -> dict[str, Any] | None:
    global _RISK_ARTIFACT
    if _RISK_ARTIFACT is not None:
        return _RISK_ARTIFACT

    checkpoint = os.getenv("RISK_MODEL_DIR", "ml/risk/artifacts/checkpoints/risk-rf/final")
    model_file = Path(checkpoint) / "model.pkl"
    if not model_file.exists():
        return None

    try:
        with open(model_file, "rb") as f:
            artifact = pickle.load(f)
        required = {"model", "feature_columns"}
        if not required.issubset(set(artifact.keys())):
            return None
        _RISK_ARTIFACT = artifact
        return _RISK_ARTIFACT
    except Exception:
        return None


def _predict_with_artifact(payload: RiskRequest, artifact: dict[str, Any]) -> tuple[float, int, str]:
    model = artifact["model"]
    features = {
        "gpa_current": payload.gpa_current,
        "attendance_rate": payload.attendance_rate,
        "num_failed": payload.num_failed,
        "stress_level": payload.stress_level,
        "motivation_score": payload.motivation_score,
        "shcvht_participation": payload.shcvht_participation,
        "study_hours": payload.study_hours,
        "sentiment_score": payload.sentiment_score,
    }

    ordered = [features[col] for col in artifact["feature_columns"]]
    probs = model.predict_proba([ordered])[0].tolist()
    classes = list(model.classes_)

    if -1 in classes:
        risk_idx = classes.index(-1)
    else:
        risk_idx = max(range(len(probs)), key=lambda i: probs[i])

    raw_score = float(probs[risk_idx])
    risk_score = round(max(0.0, min(raw_score, 1.0)), 4)
    # Keep label logic consistent with business rule.
    risk_label = _label_from_rule(payload)
    model_name = str(artifact.get("model_name", "RandomForest"))
    return risk_score, risk_label, model_name


def predict_risk(payload: RiskRequest) -> RiskResponse:
    artifact = _try_load_risk_artifact()
    if artifact is None:
        risk_score, risk_label, model_name = _baseline(payload)
    else:
        risk_score, risk_label, model_name = _predict_with_artifact(payload, artifact)

    return RiskResponse(
        student_user_id=payload.student_user_id,
        term_id=payload.term_id,
        risk_score=risk_score,
        risk_label=risk_label,
        meta=Meta(model_name=model_name),
    )
