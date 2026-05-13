from fastapi import HTTPException
from app.models.schemas import OrderCreate
from app.core.supabase_client import supabase_client
import uuid

async def list_orders(status: str = None, date: str = None, customer_id: str = None):
    """List all orders with optional status, date and customer filters."""
    try:
        query = supabase_client.table("orders").select("*, order_items(*, products(name, price))")
        if status:
            query = query.eq("status", status)
        if date:
            query = query.gte("created_at", f"{date}T00:00:00").lte("created_at", f"{date}T23:59:59")
        if customer_id:
            query = query.eq("customer_id", customer_id)

        res = query.order("created_at", desc=True).execute()
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
    """Create a new order and automatically deduct stock for sales."""
    try:
        total_amount = 0
        order_id = str(uuid.uuid4())

        for item in order_data.items:
            inventory_record = supabase_client.table("inventory").select("quantity").eq("product_id", item.product_id).execute()
            if not inventory_record.data:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found in inventory")
            
            current_stock = inventory_record.data[0]["quantity"]
            if current_stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Out of Stock for product {item.product_id}")

        order_items_data = []
        for item in order_data.items:
            inventory_record = supabase_client.table("inventory").select("quantity").eq("product_id", item.product_id).execute()
            current_stock = inventory_record.data[0]["quantity"]
            new_stock = current_stock - item.quantity

            supabase_client.table("inventory").update({"quantity": new_stock}).eq("product_id", item.product_id).execute()

            supabase_client.table("inventory_logs").insert({
                "product_id": item.product_id,
                "change_amount": -item.quantity,
                "reason": f"Order placement: {order_id}"
            }).execute()

            total_amount += item.quantity * item.unit_price_at_sale
            order_items_data.append({
                "order_id": order_id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price_at_sale": item.unit_price_at_sale,
            })

        supabase_client.table("orders").insert({
            "id": order_id,
            "customer_id": order_data.customer_id,
            "total_amount": round(total_amount, 2),
            "address": order_data.address,
            "status": "pending"
        }).execute()

        if order_items_data:
            supabase_client.table("order_items").insert(order_items_data).execute()

        return {"message": "Order created successfully", "order_id": order_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def update_order_status(order_id: str, status: str):
    """Update an order's status; auto-creates shipping on 'shipped', closes it on 'delivered'."""
    import random, string
    try:
        res = supabase_client.table("orders").update({"status": status}).eq("id", order_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Order not found")

        if status == "shipped":
            tracking = "TRK" + "".join(random.choices(string.digits, k=9))
            existing = supabase_client.table("shipping").select("id").eq("order_id", order_id).execute()
            if not existing.data:
                supabase_client.table("shipping").insert({
                    "order_id": order_id,
                    "carrier_name": "Aras Kargo",
                    "tracking_number": tracking,
                    "status": "in_transit",
                }).execute()
            else:
                supabase_client.table("shipping").update({"status": "in_transit"}).eq("order_id", order_id).execute()

        elif status == "delivered":
            supabase_client.table("shipping").update({"status": "delivered"}).eq("order_id", order_id).execute()

        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    
async def get_stats():
    """Aggregate dashboard stats: order counts, revenue, top products, category sales, stock summary."""
    try:
        orders = supabase_client.table("orders").select("status, total_amount").execute().data or []
        counts = {"pending": 0, "shipped": 0, "delivered": 0}
        revenue = 0.0
        for o in orders:
            s = o.get("status", "")
            if s in counts:
                counts[s] += 1
            revenue += float(o.get("total_amount") or 0)

        items = supabase_client.table("order_items").select("quantity, products(name, category)").execute().data or []
        prod_sales: dict = {}
        cat_sales: dict = {}
        for item in items:
            prod = item.get("products") or {}
            name = prod.get("name") or "?"
            cat = prod.get("category") or "Diğer"
            qty = item.get("quantity") or 0
            prod_sales[name] = prod_sales.get(name, 0) + qty
            cat_sales[cat] = cat_sales.get(cat, 0) + qty

        top_products = sorted(prod_sales.items(), key=lambda x: x[1], reverse=True)[:8]
        category_sales = sorted(cat_sales.items(), key=lambda x: x[1], reverse=True)[:8]

        inv = supabase_client.table("inventory").select("quantity, safety_stock, products(name)").execute().data or []
        stock = {"critical": 0, "low": 0, "normal": 0}
        anomaly_products = []
        for i in inv:
            q = i.get("quantity", 0)
            s = i.get("safety_stock") or 0
            if s > 0 and q < s:
                anomaly_products.append({
                    "name": (i.get("products") or {}).get("name", "?"),
                    "quantity": q,
                    "safety_stock": s,
                    "diff": s - q,
                })
            if q <= 5:
                stock["critical"] += 1
            elif q <= 20:
                stock["low"] += 1
            else:
                stock["normal"] += 1

        anomaly_products.sort(key=lambda x: x["diff"], reverse=True)

        return {
            "total_orders": len(orders),
            "pending": counts["pending"],
            "shipped": counts["shipped"],
            "delivered": counts["delivered"],
            "total_revenue": round(revenue, 2),
            "top_products": [{"name": n, "quantity": q} for n, q in top_products],
            "category_sales": [{"category": c, "quantity": q} for c, q in category_sales],
            "stock_summary": stock,
            "anomaly_products": anomaly_products,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_orders(customer_id: str = None):
    query = supabase_client.table("orders").select("*, profiles(full_name, email), order_items(*, products(name))")
    if customer_id:
        query = query.eq("customer_id", customer_id)
    
    res = query.order("created_at", desc=True).execute()
    return res.data