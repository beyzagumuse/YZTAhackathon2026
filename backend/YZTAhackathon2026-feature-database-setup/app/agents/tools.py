from app.core.supabase_client import supabase_client

def normalize_tr(text: str) -> str:
    """Türkçe karakterleri güvenli bir şekilde küçültür ve aramayı esnek hale getirir."""
    if not text: return ""
    return text.replace("I", "ı").replace("İ", "i").replace("Ğ", "ğ").replace("Ü", "ü").replace("Ş", "ş").replace("Ö", "ö").replace("Ç", "ç").lower()

def check_stock_and_price(product_name: str) -> str:
    """
    Ürün adı verildiğinde ürünün fiyatını ve güncel stok miktarını döndürür.
    Müşteriler ürünlerin stokta olup olmadığını veya fiyatını sorduğunda bu aracı kullanın.
    """
    try:
        # Bütün ürünleri çekip Python tarafında eşleşme arıyoruz
        res = supabase_client.table("products").select("id, name, price").execute()
        
        if not res.data:
            return "Sistemde hiç kayıtlı ürün bulunamadı."
        
        search_term = normalize_tr(product_name)
        matched_product = None
        
        for p in res.data:
            # Aranan kelime, ürünün adının içinde geçiyorsa eşleşmeyi kabul et
            if search_term in normalize_tr(p["name"]):
                matched_product = p
                break
        
        if not matched_product:
            return f"Maalesef stoklarımızda '{product_name}' kelimesini içeren bir ürün bulamadım."
        
        # Ürünün stok bilgisini inventory tablosundan çek
        inv_res = supabase_client.table("inventory").select("quantity").eq("product_id", matched_product["id"]).execute()
        stock = inv_res.data[0]["quantity"] if inv_res.data else 0
        
        return f"Ürün: {matched_product['name']}, Fiyat: {matched_product['price']} TL, Güncel Stok: {stock} adet."
    except Exception as e:
        return f"Stok sorgulanırken sistemde bir hata oluştu: {str(e)}"
    

def get_order_status(order_id: str) -> str:
    """
    Müşteri bir sipariş numarası (order_id) verdiğinde siparişin ve kargonun güncel durumunu sorgular.
    Müşteriler 'Siparişim nerede?', 'Kargom ne zaman gelir?' gibi sorularla sipariş numarası verdiğinde bu aracı kullanın.
    """
    try:
        # 1. Kullanıcının girdiği ID'den '#' işaretini ve boşlukları temizle, küçük harfe çevir
        clean_id = order_id.replace("#", "").strip().lower()
        
        # 2. Bütün siparişleri çekip Python tarafında eşleşme arıyoruz 
        all_orders = supabase_client.table("orders").select("id, status, total_amount").execute()
        
        matched_order = None
        for o in all_orders.data:
            # Eğer veritabanındaki uzun ID, kullanıcının girdiği kısa ID ile başlıyorsa eşleşme sağlanır
            if o["id"].lower().startswith(clean_id) or clean_id in o["id"].lower():
                matched_order = o
                break
                
        if not matched_order:
            return f"Sistemde '{order_id}' numaralı bir sipariş bulunamadı. Lütfen numarayı kontrol etmesini isteyin."
        
        full_order_id = matched_order["id"]
        
        # 3. Siparişe ait Kargo (Shipping) bilgisini tam ID ile çek
        shipping_res = supabase_client.table("shipping").select("carrier_name, tracking_number, status, estimated_delivery").eq("order_id", full_order_id).execute()
        
        if shipping_res.data:
            ship = shipping_res.data[0]
            shipping_info = f"\nKargo Firması: {ship['carrier_name']}\nTakip No: {ship['tracking_number']}\nKargo Durumu: {ship['status']}\nTahmini Teslimat: {ship['estimated_delivery']}"
        else:
            shipping_info = "\nHenüz kargo çıkışı yapılmamış veya kargo atanmamış."
        
        return f"Sipariş Durumu: {matched_order['status']} (Tutar: {matched_order['total_amount']} TL){shipping_info}"
    
    except Exception as e:
        return f"Sipariş sorgulanırken veritabanında bir hata oluştu: {str(e)}"


def list_user_orders(customer_id: str) -> str:
    """
    Giriş yapmış bir müşteriye (customer_id) ait geçmiş siparişleri listeler.
    Kullanıcı siparişlerini sorduğunda bu aracı kullanarak ona ait siparişlerin listesini çekin.
    """
    if not customer_id or customer_id == 'Giriş yapılmamış' or customer_id == 'None':
        return "Sistemsel uyarı: Siparişleri listelemek için kullanıcının giriş yapmış olması gerekiyor. Lütfen kullanıcıdan sipariş numarasını manuel olarak isteyin."
    
    try:
        # Müşteriye ait siparişleri tarihe göre azalan (en yeni en üstte) sırayla çekiyoruz
        res = supabase_client.table("orders").select("id, total_amount, status, created_at").eq("customer_id", customer_id).order("created_at", desc=True).execute()
        
        if not res.data:
            return "Bu müşteriye ait hiçbir geçmiş sipariş bulunmuyor."
        
        orders_text = "Müşterinin Siparişleri:\n"
        for i, order in enumerate(res.data):
            # Tarihi okunabilir formata çevir (Örn: 2026-05-12)
            date_str = order['created_at'].split('T')[0]
            # Kısa ID (Kullanıcı seçerken kolaylık olsun diye ilk bölüm)
            short_id = order['id'].split('-')[0].upper()
            
            orders_text += f"{i+1}. Sipariş -> Tam ID: {order['id']} | Kısa ID: #{short_id} | Tarih: {date_str} | Tutar: {order['total_amount']} TL | Durum: {order['status']}\n"
        
        return orders_text
    except Exception as e:
        return f"Siparişler listelenirken veritabanında bir hata oluştu: {str(e)}"