from fastapi import APIRouter
from app.models.schemas import ShippingCreate, ShippingUpdate
from app.services import shipping_service

router = APIRouter(prefix="/shipping", tags=["Shipping"])

@router.post("/")
async def create_shipping(shipping_data: ShippingCreate):
    return await shipping_service.create_shipping_record(shipping_data)

@router.get("/order/{order_id}")
async def get_shipping(order_id: str):
    return await shipping_service.get_shipping_by_order_id(order_id)

@router.patch("/order/{order_id}")
async def update_shipping(order_id: str, update_data: ShippingUpdate):
    return await shipping_service.update_shipping_status(order_id, update_data)
