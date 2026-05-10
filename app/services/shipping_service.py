from fastapi import HTTPException
from app.models.schemas import ShippingCreate, ShippingUpdate
from app.core.supabase_client import supabase_client
import uuid

async def create_shipping_record(shipping_data: ShippingCreate):
    try:
        shipping_id = str(uuid.uuid4())
        data = shipping_data.model_dump()
        data["id"] = shipping_id
        res = supabase_client.table("shipping").insert(data).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

async def get_shipping_by_order_id(order_id: str):
    try:
        res = supabase_client.table("shipping").select("*").eq("order_id", order_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Shipping record not found")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

async def update_shipping_status(order_id: str, update_data: ShippingUpdate):
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        if not update_dict:
            raise HTTPException(status_code=400, detail="No valid fields to update")
            
        res = supabase_client.table("shipping").update(update_dict).eq("order_id", order_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Shipping record not found")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
