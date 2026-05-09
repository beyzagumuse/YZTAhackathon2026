from fastapi import HTTPException
from app.models.schemas import InventoryChange, InventoryUpdate
from app.core.supabase_client import supabase_client

async def update_stock(update_data: InventoryChange):
    """
    Incrementally update stock using a change amount.
    Logs the adjustment in inventory_logs.
    """
    try:
        # Fetch current stock
        inventory_record = supabase_client.table("inventory").select("*").eq("product_id", update_data.product_id).execute()
        if not inventory_record.data:
            raise HTTPException(status_code=404, detail="Product not found in inventory")
        
        current_stock = inventory_record.data[0].get("quantity", 0)
        new_stock = current_stock + update_data.change_amount

        if new_stock < 0:
            raise HTTPException(status_code=400, detail="Insufficient stock")

        # Update inventory
        supabase_client.table("inventory").update({"quantity": new_stock}).eq("product_id", update_data.product_id).execute()

        # Create inventory log
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
    """
    List current stock levels for all products.
    """
    try:
        res = supabase_client.table("inventory").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_inventory_by_product(product_id: str):
    """
    Get specific stock info for a single product.
    """
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
    """
    PATCH stock quantity explicitly and log the manual adjustment.
    """
    try:
        # Fetch current stock to calculate the change_amount for the logs
        inventory_record = supabase_client.table("inventory").select("*").eq("product_id", product_id).execute()
        if not inventory_record.data:
            raise HTTPException(status_code=404, detail="Product not found in inventory")
        
        current_stock = inventory_record.data[0].get("quantity", 0)
        change_amount = data.stock_quantity - current_stock
        
        if data.stock_quantity < 0:
            raise HTTPException(status_code=400, detail="Stock cannot be negative")

        supabase_client.table("inventory").update({"quantity": data.stock_quantity}).eq("product_id", product_id).execute()

        # Only create a log if the stock actually changed
        if change_amount != 0:
            supabase_client.table("inventory_logs").insert({
                "product_id": product_id,
                "change_amount": change_amount,
                "reason": data.reason or "Manual Adjustment"
            }).execute()

        return {"message": "Stock set successfully", "new_stock": data.stock_quantity}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
