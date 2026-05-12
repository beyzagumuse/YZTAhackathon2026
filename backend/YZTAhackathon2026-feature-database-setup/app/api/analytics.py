from fastapi import APIRouter
from app.services import rfm_service, recommendation_service, campaign_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/rfm")
async def get_rfm():
    return await rfm_service.get_rfm()


@router.get("/recommendations")
async def get_recommendations():
    return await recommendation_service.get_recommendations()


@router.get("/campaigns")
async def get_campaigns():
    return await campaign_service.get_campaigns()
