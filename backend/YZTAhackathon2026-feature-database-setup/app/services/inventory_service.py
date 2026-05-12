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
    """List current stock levels for all products with product names."""
    try:
        res = supabase_client.table("inventory").select("*, products(name, price)").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_anomalies():
    """Return inventory items where quantity < safety_stock (reorder point breached)."""
    try:
        res = supabase_client.table("inventory").select("*, products(name, price)").execute()
        anomalies = [
            item for item in (res.data or [])
            if (item.get("safety_stock") or 0) > 0
            and (item.get("quantity") or 0) < (item.get("safety_stock") or 0)
        ]
        return anomalies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_full_anomaly_report():
    """Multi-criteria anomaly detection: safety stock, critical stock, pending overload, slow movers."""
    from datetime import datetime, timezone, timedelta
    try:
        now = datetime.now(timezone.utc)
        cutoff_30d = (now - timedelta(days=30)).isoformat()

        anomalies = []

        # 1. Safety stock breaches
        inv = supabase_client.table("inventory").select("product_id, quantity, safety_stock, products(name)").execute().data or []
        safety_breach_pids = set()
        for item in sorted(inv, key=lambda x: (x.get("safety_stock") or 0) - (x.get("quantity") or 0), reverse=True):
            qty = item.get("quantity", 0)
            safety = item.get("safety_stock") or 0
            name = (item.get("products") or {}).get("name", "?")
            pid = item.get("product_id")
            if safety > 0 and qty < safety:
                safety_breach_pids.add(pid)
                anomalies.append({
                    "type": "safety_stock",
                    "label": "Emniyet Stoğu İhlali",
                    "severity": "high",
                    "product": name,
                    "detail": f"Stok: {qty} / Min: {safety} (Eksik: {safety - qty})",
                })

        # 2. Critical stock (qty <= 2, not already caught above)
        for item in inv:
            qty = item.get("quantity", 0)
            pid = item.get("product_id")
            name = (item.get("products") or {}).get("name", "?")
            if qty <= 2 and pid not in safety_breach_pids:
                anomalies.append({
                    "type": "critical_stock",
                    "label": "Kritik Stok",
                    "severity": "high",
                    "product": name,
                    "detail": f"Sadece {qty} adet kaldı",
                })

        # 3. Pending order overload (> 40% of orders still pending)
        orders = supabase_client.table("orders").select("status").execute().data or []
        if orders:
            pending = sum(1 for o in orders if o.get("status") == "pending")
            ratio = pending / len(orders)
            if ratio > 0.40:
                anomalies.append({
                    "type": "pending_overload",
                    "label": "Bekleyen Sipariş Yığılması",
                    "severity": "medium",
                    "product": None,
                    "detail": f"{pending}/{len(orders)} sipariş hâlâ hazırlanıyor (%{ratio*100:.0f})",
                })

        # 4. Slow-moving stock (qty > 10, sold < 2 in last 30 days)
        recent_items = supabase_client.table("order_items").select("product_id, orders(created_at)").execute().data or []
        sales_30d: dict = {}
        for item in recent_items:
            if (item.get("orders") or {}).get("created_at", "") >= cutoff_30d:
                pid = item.get("product_id")
                sales_30d[pid] = sales_30d.get(pid, 0) + 1

        for item in inv:
            pid = item.get("product_id")
            qty = item.get("quantity", 0)
            name = (item.get("products") or {}).get("name", "?")
            sold = sales_30d.get(pid, 0)
            if qty > 10 and sold < 2:
                anomalies.append({
                    "type": "slow_moving",
                    "label": "Hareketsiz Stok",
                    "severity": "low",
                    "product": name,
                    "detail": f"{qty} adet stok, 30 günde {sold} satış",
                })

        return {
            "anomalies": anomalies,
            "total": len(anomalies),
            "by_type": {
                "safety_stock":    sum(1 for a in anomalies if a["type"] == "safety_stock"),
                "critical_stock":  sum(1 for a in anomalies if a["type"] == "critical_stock"),
                "pending_overload":sum(1 for a in anomalies if a["type"] == "pending_overload"),
                "slow_moving":     sum(1 for a in anomalies if a["type"] == "slow_moving"),
            },
        }
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

        inv_update: dict = {"quantity": data.stock_quantity}
        if data.safety_stock is not None:
            inv_update["safety_stock"] = data.safety_stock
        supabase_client.table("inventory").update(inv_update).eq("product_id", product_id).execute()

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