from fastapi import APIRouter
from typing import Optional
from app.models.schemas import OrderCreate, OrderUpdate
from app.services import order_service

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("/")
async def list_orders(status: Optional[str] = None, date: Optional[str] = None, customer_id: Optional[str] = None):
    """List all orders with optional filters (status, date, customer_id)."""
    return await order_service.list_orders(status, date, customer_id)

@router.get("/stats")
async def get_order_stats():
    """Aggregated dashboard stats: counts, revenue, top products, category sales, stock summary."""
    return await order_service.get_stats()


@router.get("/{order_id}")
async def get_order(order_id: str):
    """Get specific order details."""
    return await order_service.get_order(order_id)

@router.post("/create")
async def create_order(order_data: OrderCreate):
    """Create a new order and deduct inventory."""
    return await order_service.create_order(order_data)

@router.patch("/{order_id}/status")
async def update_order_status(order_id: str, update_data: OrderUpdate):
    """Update only the order status (e.g., pending -> shipped)."""
    return await order_service.update_order_status(order_id, update_data.status)
