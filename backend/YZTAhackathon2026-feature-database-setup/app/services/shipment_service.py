from fastapi import HTTPException
from app.core.supabase_client import supabase_client

async def list_shipments(status: str = None):
    try:
        query = supabase_client.table("shipping").select("*, orders(id, total_amount, customer_id, status)")
        if status:
            query = query.eq("status", status)
        res = query.order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_shipment_by_order(order_id: str):
    try:
        res = supabase_client.table("shipping").select("*").eq("order_id", order_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Shipping record not found")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

async def update_shipping_status(shipping_id: str, status: str):
    try:
        res = supabase_client.table("shipping").update({"status": status}).eq("id", shipping_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Shipping record not found")

        order_id = res.data[0]["order_id"]
        if status == "delivered":
            supabase_client.table("orders").update({"status": "delivered"}).eq("id", order_id).execute()
        elif status == "in_transit":
            supabase_client.table("orders").update({"status": "shipped"}).eq("id", order_id).execute()

        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

async def check_delayed_shipments():
    try:
        import datetime
        cutoff = (datetime.datetime.utcnow() - datetime.timedelta(hours=48)).isoformat()
        res = supabase_client.table("shipping").select("*").eq("status", "in_transit").lt("updated_at", cutoff).execute()
        delayed = res.data or []
        for s in delayed:
            supabase_client.table("shipping").update({"status": "delayed"}).eq("id", s["id"]).execute()
        return {"checked": len(delayed), "marked_delayed": len(delayed)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
