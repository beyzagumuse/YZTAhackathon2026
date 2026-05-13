from fastapi import APIRouter
from app.models.schemas import InventoryChange, InventoryUpdate
from app.services import inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/")
async def get_inventory():
    return await inventory_service.get_all_inventory()

# Static routes MUST come before /{product_id} to avoid being swallowed as path param
@router.get("/anomalies")
async def get_anomalies():
    """Items where quantity < safety_stock."""
    return await inventory_service.get_anomalies()

@router.get("/anomaly-report")
async def get_anomaly_report():
    """Multi-criteria anomaly report: safety stock, critical stock, pending overload, slow movers."""
    return await inventory_service.get_full_anomaly_report()

@router.post("/day-end")
async def trigger_day_end_analysis():
    return await inventory_service.run_day_end_process()

@router.post("/update")
async def change_stock(update_data: InventoryChange):
    return await inventory_service.update_stock(update_data)

@router.patch("/{product_id}")
async def patch_stock(product_id: str, data: InventoryUpdate):
    return await inventory_service.set_inventory_stock(product_id, data)

@router.get("/{product_id}")
async def get_inventory_item(product_id: str):
    return await inventory_service.get_inventory_by_product(product_id)
