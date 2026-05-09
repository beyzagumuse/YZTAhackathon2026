from fastapi import HTTPException
from app.models.schemas import InventoryChange, InventoryUpdate
from app.core.supabase_client import supabase_client
import datetime

async def update_stock(update_data: InventoryChange):
    """Incrementally update stock based on barcode scans or dynamic changes."""
    try:
        inventory_record = supabase_client.table("inventory").select("*").eq("product_id", update_data.product_id).execute()
        if not inventory_record.data:
            raise HTTPException(status_code=404, detail="Product not found in inventory")
        
        current_stock = inventory_record.data[0].get("quantity", 0)
        new_stock = current_stock + update_data.change_amount

        if new_stock < 0:
            raise HTTPException(status_code=400, detail="Insufficient stock")

        supabase_client.table("inventory").update({"quantity": new_stock}).eq("product_id", update_data.product_id).execute()

        supabase_client.table("inventory_logs").insert({
            "product_id": update_data.product_id,
            "change_amount": update_data.change_amount,
            "reason": update_data.reason
        }).execute()

        return {"message": "Stock updated successfully", "new_stock": new_stock}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

async def get_all_inventory():
    """List current stock levels for all products."""
    try:
        res = supabase_client.table("inventory").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_inventory_by_product(product_id: str):
    """Get specific stock info for a single product."""
    try:
        res = supabase_client.table("inventory").select("*").eq("product_id", product_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Inventory not found")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

async def set_inventory_stock(product_id: str, data: InventoryUpdate):
    """Update stock quantity directly for manual end-of-day counts."""
    try:
        inventory_record = supabase_client.table("inventory").select("*").eq("product_id", product_id).execute()
        if not inventory_record.data:
            raise HTTPException(status_code=404, detail="Product not found in inventory")
        
        current_stock = inventory_record.data[0].get("quantity", 0)
        change_amount = data.stock_quantity - current_stock
        
        if data.stock_quantity < 0:
            raise HTTPException(status_code=400, detail="Stock cannot be negative")

        supabase_client.table("inventory").update({"quantity": data.stock_quantity}).eq("product_id", product_id).execute()

        if change_amount != 0:
            supabase_client.table("inventory_logs").insert({
                "product_id": product_id,
                "change_amount": change_amount,
                "reason": data.reason or "Manual end-of-day count"
            }).execute()

        return {"message": "Stock set successfully", "new_stock": data.stock_quantity}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

async def run_day_end_process():
    """Run daily inventory analysis to find products below their minimum threshold."""
    try:
        today_str = datetime.datetime.utcnow().date().isoformat()
        
        products_res = supabase_client.table("products").select("id, name, min_threshold").execute()
        if not products_res.data:
            return {"message": "No products found for analysis."}

        inventory_res = supabase_client.table("inventory").select("product_id, quantity").execute()
        stock_map = {item["product_id"]: item["quantity"] for item in inventory_res.data}
        
        alerts = []
        healthy_count = 0
        
        for prod in products_res.data:
            pid = prod["id"]
            current_stock = stock_map.get(pid, 0)
            threshold = prod.get("min_threshold", 10)
            
            if current_stock <= threshold:
                alerts.append({
                    "product_id": pid,
                    "product_name": prod["name"],
                    "current_stock": current_stock,
                    "threshold": threshold,
                    "status": "CRITICAL",
                    "action_required": "Restock immediately"
                })
            else:
                healthy_count += 1
                
        report = {
            "date": today_str,
            "total_products_checked": len(products_res.data),
            "healthy_products": healthy_count,
            "critical_alerts_count": len(alerts),
            "alerts": alerts
        }
        
        return {"message": "Daily analysis completed.", "report": report}

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Process failed: {str(e)}")