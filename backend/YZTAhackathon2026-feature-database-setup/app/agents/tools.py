from app.core.supabase_client import supabase_client

def get_stock_level(product_name: str) -> dict:
    """Belirli bir ürünün adını kullanarak mevcut stok miktarını bulmak için bu aracı kullanın."""
    try:
        # Ürün ismine göre arama yapıp stok bilgisini getirir
        res = supabase_client.table("products") \
            .select("id, name") \
            .ilike("name", f"%{product_name}%") \
            .execute()
            
        if not res.data:
            return {"error": "Ürün bulunamadı."}
            
        product_id = res.data[0]["id"]
        inv_res = supabase_client.table("inventory").select("quantity").eq("product_id", product_id).execute()
        
        stock = inv_res.data[0]["quantity"] if inv_res.data else 0
        return {"product": res.data[0]["name"], "stock_quantity": stock}
    except Exception as e:
        return {"error": str(e)}

def get_order_status(order_id: str) -> dict:
    """Müşterinin sipariş numarasını (order_id) kullanarak kargo ve sipariş statüsünü kontrol etmek için bu aracı kullanın."""
    try:
        res = supabase_client.table("orders").select("id, status, tracking_code").eq("id", order_id).execute()
        if not res.data:
            return {"error": "Sipariş bulunamadı."}
        return {"order_info": res.data[0]}
    except Exception as e:
        return {"error": str(e)}