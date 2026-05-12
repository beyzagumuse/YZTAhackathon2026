from fastapi import APIRouter
from app.models.schemas import InventoryChange, InventoryUpdate
from app.services import inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/")
async def get_inventory():
    """List current stock levels for all products."""
    return await inventory_service.get_all_inventory()

@router.get("/{product_id}")
async def get_inventory_item(product_id: str):
    """Get specific stock info for a product."""
    return await inventory_service.get_inventory_by_product(product_id)

@router.post("/update")
async def change_stock(update_data: InventoryChange):
    """Increment or decrement stock by a specific change amount."""
    return await inventory_service.update_stock(update_data)

@router.patch("/{product_id}")
async def patch_stock(product_id: str, data: InventoryUpdate):
    """Update absolute stock quantity for manual end-of-day counts."""
    return await inventory_service.set_inventory_stock(product_id, data)

@router.get("/anomalies")
async def get_anomalies():
    """Stok miktarı emniyet stoğunun altında olan ürünleri döndürür."""
    return await inventory_service.get_anomalies()

@router.post("/day-end")
async def trigger_day_end_analysis():
    """Trigger the daily inventory analysis and generate a procurement report."""
    return await inventory_service.run_day_end_process()