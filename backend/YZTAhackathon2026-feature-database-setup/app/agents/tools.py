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
    

def get_order_status(order_id: str) -> str:
    """
    Müşteri bir sipariş numarası (order_id) verdiğinde siparişin ve kargonun güncel durumunu sorgular.
    Müşteriler 'Siparişim nerede?', 'Kargom ne zaman gelir?' gibi sorularla sipariş numarası verdiğinde bu aracı kullanın.
    """
    try:
        # 1. Sipariş genel bilgisini çek
        order_res = supabase_client.table("orders").select("id, status, total_amount").eq("id", order_id).execute()
        
        if not order_res.data:
            return f"Sistemde '{order_id}' numaralı bir sipariş bulunamadı. Lütfen numarayı kontrol etmesini isteyin."
        
        order = order_res.data[0]
        
        # 2. Siparişe ait Kargo (Shipping) bilgisini çek
        shipping_res = supabase_client.table("shipping").select("carrier_name, tracking_number, status, estimated_delivery").eq("order_id", order_id).execute()
        
        if shipping_res.data:
            ship = shipping_res.data[0]
            shipping_info = f"\nKargo Firması: {ship['carrier_name']}\nTakip No: {ship['tracking_number']}\nKargo Durumu: {ship['status']}\nTahmini Teslimat: {ship['estimated_delivery']}"
        else:
            shipping_info = "\nHenüz kargo çıkışı yapılmamış veya kargo atanmamış."
        
        return f"Sipariş Durumu: {order['status']} (Tutar: {order['total_amount']} TL){shipping_info}"
    
    except Exception as e:
        return f"Sipariş sorgulanırken veritabanında bir hata oluştu: {str(e)}"