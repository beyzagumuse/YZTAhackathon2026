from fastapi import APIRouter
from app.services import shipment_service

router = APIRouter(prefix="/shipments", tags=["Shipments"])

@router.post("/watchdog")
async def trigger_shipment_watchdog():
    """
    Scan for delayed shipments (48+ hours without update) and mark them as delayed.
    """
    return await shipment_service.check_delayed_shipments()