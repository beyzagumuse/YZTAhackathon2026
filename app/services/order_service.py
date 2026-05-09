from fastapi import HTTPException
from app.models.schemas import OrderCreate
from app.core.supabase_client import supabase_client
import uuid

async def list_orders(status: str = None, date: str = None):
    """List all orders with optional status and date filters."""
    try:
        query = supabase_client.table("orders").select("*")
        if status:
            query = query.eq("status", status)
        if date:
            # Assuming 'created_at' is a timestamp column and date is 'YYYY-MM-DD'
            query = query.gte("created_at", f"{date}T00:00:00").lte("created_at", f"{date}T23:59:59")
            
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_order(order_id: str):
    """Get details for a specific order."""
    try:
        res = supabase_client.table("orders").select("*").eq("id", order_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Order not found")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

async def create_order(order_data: OrderCreate):
    """Create a new order, check stock, and log inventory deductions."""
    try:
        total_amount = 0
        order_id = str(uuid.uuid4())

        # Step 1: Check stock for all items
        for item in order_data.items:
            inventory_record = supabase_client.table("inventory").select("quantity").eq("product_id", item.product_id).execute()
            if not inventory_record.data:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found in inventory")
            
            current_stock = inventory_record.data[0]["quantity"]
            if current_stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Out of Stock for product {item.product_id}")

        # Step 2: Deduct stock, log inventory changes
        for item in order_data.items:
            inventory_record = supabase_client.table("inventory").select("quantity").eq("product_id", item.product_id).execute()
            current_stock = inventory_record.data[0]["quantity"]
            new_stock = current_stock - item.quantity
            
            # Update inventory
            supabase_client.table("inventory").update({"quantity": new_stock}).eq("product_id", item.product_id).execute()
            
            # Create inventory log
            supabase_client.table("inventory_logs").insert({
                "product_id": item.product_id,
                "change_amount": -item.quantity,
                "reason": f"Order placement: {order_id}"
            }).execute()

        # Step 3: Create the order record
        supabase_client.table("orders").insert({
            "id": order_id,
            "customer_id": order_data.customer_id,
            "total_amount": total_amount,
            "status": "pending"
        }).execute()

        return {"message": "Order created successfully", "order_id": order_id}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

async def update_order_status(order_id: str, status: str):
    """Update an order's status explicitly."""
    try:
        res = supabase_client.table("orders").update({"status": status}).eq("id", order_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Order not found")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
