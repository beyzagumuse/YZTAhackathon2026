from app.core.supabase_client import supabase_client

def check_stock_and_price(product_name: str) -> str:
    """
    Ürün adı verildiğinde ürünün fiyatını ve güncel stok miktarını döndürür.
    Müşteriler ürünlerin stokta olup olmadığını veya fiyatını sorduğunda bu aracı kullanın.
    """
    try:
        # 1. Ürünü adına göre ara (ilike sayesinde büyük/küçük harf duyarsız kısmi arama yapar)
        res = supabase_client.table("products").select("id, name, price").ilike("name", f"%{product_name}%").execute()
        
        if not res.data:
            return f"Maalesef stoklarımızda '{product_name}' adında bir ürün bulamadım."
        
        product = res.data[0] # İlk eşleşen ürünü al
        
        # 2. Ürünün stok bilgisini inventory tablosundan çek
        inv_res = supabase_client.table("inventory").select("quantity").eq("product_id", product["id"]).execute()
        stock = inv_res.data[0]["quantity"] if inv_res.data else 0
        
        return f"Ürün: {product['name']}, Fiyat: {product['price']} TL, Güncel Stok: {stock} adet."
    except Exception as e:
        return f"Stok sorgulanırken sistemde bir hata oluştu: {str(e)}"