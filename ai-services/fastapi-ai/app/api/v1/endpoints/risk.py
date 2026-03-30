from fastapi import APIRouter

from app.schemas.risk import RiskRequest, RiskResponse
from app.services.risk_service import predict_risk

router = APIRouter()


@router.post("/predict", response_model=RiskResponse)
def predict(payload: RiskRequest) -> RiskResponse:
    return predict_risk(payload)
