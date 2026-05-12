from fastapi import APIRouter
from typing import Optional
from app.services import shipment_service

router = APIRouter(prefix="/shipments", tags=["Shipments"])

@router.get("/")
async def list_shipments(status: Optional[str] = None):
    return await shipment_service.list_shipments(status)

@router.get("/order/{order_id}")
async def get_shipment_by_order(order_id: str):
    return await shipment_service.get_shipment_by_order(order_id)

@router.patch("/{shipping_id}/status")
async def update_shipping_status(shipping_id: str, body: dict):
    return await shipment_service.update_shipping_status(shipping_id, body["status"])

@router.post("/watchdog")
async def trigger_shipment_watchdog():
    return await shipment_service.check_delayed_shipments()
