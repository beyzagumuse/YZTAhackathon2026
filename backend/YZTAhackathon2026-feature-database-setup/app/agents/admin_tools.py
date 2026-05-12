from app.core.supabase_client import supabase_client

def get_sales_ranking(order: str = "desc", limit: int = 5) -> str:
    """
    Ürünleri toplam satış adedine göre sıralar ve listeler.
    En çok satan, en az satan, en popüler, en kötü satan ürün sorularında kullan.
    order parametresi: 'desc' en çok satandan başlar, 'asc' en az satandan başlar.
    limit parametresi: kaç ürün listeleneceği.
    """
    try:
        items = supabase_client.table("order_items").select("quantity, product_id, products(name)").execute().data or []
        sales: dict = {}
        for it in items:
            name = (it.get("products") or {}).get("name") or it.get("product_id", "?")
            qty = it.get("quantity") or 0
            sales[name] = sales.get(name, 0) + qty

        if not sales:
            return "Henüz sipariş verisi bulunmuyor."

        reverse = (order != "asc")
        ranked = sorted(sales.items(), key=lambda x: x[1], reverse=reverse)[:limit]
        label = "En çok" if reverse else "En az"
        lines = [f"{i+1}. {name}: {qty} adet" for i, (name, qty) in enumerate(ranked)]
        return f"{label} satan {len(ranked)} ürün:\n" + "\n".join(lines)
    except Exception as e:
        return f"Satış verileri alınamadı (hata: {type(e).__name__}: {e})"


def get_stock_status(filter: str = "all") -> str:
    """
    Stok ve envanter durumunu listeler.
    Stok, envanter, kritik stok, düşük stok, tükenmek üzere ürün sorularında kullan.
    filter: 'all' tümü, 'critical' kritik (5 ve altı adet), 'low' düşük (6-20 arası), 'normal' yeterli (20 üzeri).
    """
    try:
        items = supabase_client.table("inventory").select("quantity, products(name)").execute().data or []
        if not items:
            return "Stok verisi bulunamadı."

        if filter == "critical":
            filtered = [i for i in items if (i.get("quantity") or 0) <= 5]
            label = "Kritik stok ürünler (5 adet ve altı)"
        elif filter == "low":
            filtered = [i for i in items if 5 < (i.get("quantity") or 0) <= 20]
            label = "Düşük stok ürünler (6-20 adet)"
        elif filter == "normal":
            filtered = [i for i in items if (i.get("quantity") or 0) > 20]
            label = "Normal stok ürünler (20 adet üzeri)"
        else:
            filtered = items
            label = "Tüm stok durumu"

        if not filtered:
            return f"{label}: Bu kategoride ürün bulunmuyor."

        lines = [
            f"- {(i.get('products') or {}).get('name', '?')}: {i.get('quantity', 0)} adet"
            for i in sorted(filtered, key=lambda x: x.get("quantity", 0))[:20]
        ]
        return f"{label} ({len(filtered)} ürün):\n" + "\n".join(lines)
    except Exception as e:
        return f"Stok verisi alınamadı (hata: {type(e).__name__}: {e})"


def get_order_statistics() -> str:
    """
    Sipariş istatistiklerini ve toplam ciroyu (geliri) döndürür.
    Toplam ciro, gelir, kazanç, sipariş sayısı, kaç sipariş var, ne kadar para kazandım sorularında kullan.
    """
    try:
        orders = supabase_client.table("orders").select("status, total_amount").execute().data or []
        if not orders:
            return "Henüz sipariş bulunmuyor."

        counts = {"pending": 0, "shipped": 0, "delivered": 0}
        total_revenue = 0.0
        for o in orders:
            s = o.get("status", "")
            if s in counts:
                counts[s] += 1
            total_revenue += float(o.get("total_amount") or 0)

        return (
            f"Sipariş özeti:\n"
            f"- Toplam sipariş: {len(orders)}\n"
            f"- Hazırlanıyor: {counts['pending']}\n"
            f"- Kargoda: {counts['shipped']}\n"
            f"- Teslim edildi: {counts['delivered']}\n"
            f"- Toplam ciro (gelir): {total_revenue:,.2f} TL\n"
            f"- Ortalama sipariş değeri: {total_revenue/len(orders):,.2f} TL"
        )
    except Exception as e:
        return f"Sipariş istatistikleri alınamadı (hata: {type(e).__name__}: {e})"


def get_product_detail(product_name: str) -> str:
    """
    Belirli bir ürünün fiyatını, stok miktarını ve toplam satışını döndürür.
    Kullanıcı belirli bir ürün adı söylediğinde kullan.
    """
    try:
        # GÜNCELLEME: Tüm ürünleri çekip Python'da normalize ederek karşılaştırıyoruz
        res = supabase_client.table("products").select("id, name, price").execute()
        if not res.data:
            return f"'{product_name}' kelimesiyle eşleşen ürün bulunamadı."
        
        def normalize_tr(text: str) -> str:
            if not text: return ""
            return text.replace("I", "ı").replace("İ", "i").replace("Ğ", "ğ").replace("Ü", "ü").replace("Ş", "ş").replace("Ö", "ö").replace("Ç", "ç").lower()
        
        search_term = normalize_tr(product_name)
        matched_product = None
        
        for p in res.data:
            if search_term in normalize_tr(p["name"]):
                matched_product = p
                break

        if not matched_product:
            return f"'{product_name}' kelimesini içeren bir ürün bulunamadı."

        pid = matched_product["id"]

        inv = supabase_client.table("inventory").select("quantity").eq("product_id", pid).execute()
        stock = inv.data[0]["quantity"] if inv.data else 0

        sold_res = supabase_client.table("order_items").select("quantity").eq("product_id", pid).execute().data or []
        total_sold = sum(i.get("quantity", 0) for i in sold_res)

        return (
            f"Ürün: {matched_product['name']}\n"
            f"Fiyat: {matched_product['price']} TL\n"
            f"Mevcut stok: {stock} adet\n"
            f"Toplam satılan: {total_sold} adet"
        )
    except Exception as e:
        return f"Ürün detayı alınamadı (hata: {type(e).__name__}: {e})"

def list_all_orders_for_admin() -> str:
    """
    Sistemdeki tüm siparişleri, müşteri isimleri ve durumları ile birlikte listeler.
    Admin 'tüm siparişleri göster' veya 'toplam satışlar' dediğinde bu aracı kullanın.
    """
    try:
        # Tüm siparişleri profilleriyle (join) birlikte çekiyoruz
        res = supabase_client.table("orders").select("*, profiles(full_name, email)").order("created_at", desc=True).execute()
        
        if not res.data:
            return "Sistemde henüz hiç sipariş bulunmuyor."
        
        output = "TÜM SİPARİŞLER LİSTESİ:\n"
        for o in res.data:
            customer = o.get('profiles', {}).get('full_name', 'Bilinmeyen')
            output += f"- ID: {o['id']} | Müşteri: {customer} | Tutar: {o['total_amount']} TL | Durum: {o['status']} | Tarih: {o['created_at'].split('T')[0]}\n"
        
        return output
    except Exception as e:
        return f"Sipariş listesi çekilirken hata: {str(e)}"

def get_inventory_report() -> str:
    """
    Tüm ürünlerin stok miktarlarını ve kritik seviyenin altındakileri raporlar.
    """
    try:
        res = supabase_client.table("inventory").select("*, products(name)").execute()
        if not res.data: return "Stok verisi bulunamadı."
        
        report = "GÜNCEL STOK RAPORU:\n"
        for item in res.data:
            name = item.get('products', {}).get('name', 'Bilinmeyen')
            qty = item['quantity']
            status = " [KRİTİK]" if qty < 10 else "" # Örnek kritik eşik
            report += f"- {name}: {qty} adet {status}\n"
        return report
    except Exception as e:
        return f"Stok raporu hatası: {str(e)}"

def list_all_customers() -> str:
    """
    Sistemdeki tüm kayıtlı kullanıcıların listesini ve iletişim bilgilerini getirir.
    """
    try:
        res = supabase_client.table("profiles").select("full_name, email, address").execute()
        if not res.data: return "Müşteri kaydı bulunamadı."
        
        output = "KAYITLI MÜŞTERİLER:\n"
        for c in res.data:
            output += f"- {c['full_name']} ({c['email']}) - Adres: {c['address']}\n"
        return output
    except Exception as e:
        return f"Müşteri listesi hatası: {str(e)}"


def get_anomalies() -> str:
    """
    Stok anomalileri, emniyet stoğu altında veya yeniden sipariş noktası seviyesinde ürünleri listeler.
    Anomali, emniyet stoğu, reorder point, yeniden sipariş sorularında kullan.
    """
    try:
        # Emniyet stoğu eşiği (safety stock threshold)
        SAFETY_STOCK = 10
        # Yeniden sipariş noktası (reorder point)
        REORDER_POINT = 5
        
        items = supabase_client.table("inventory").select("quantity, products(name)").execute().data or []
        
        if not items:
            return "Stok verisi bulunamadı."
        
        anomalies = []
        for item in items:
            qty = item.get("quantity", 0)
            name = (item.get("products") or {}).get("name", "?")
            
            if qty <= REORDER_POINT:
                anomalies.append((name, qty, "Yeniden sipariş gerekli!"))
            elif qty <= SAFETY_STOCK:
                anomalies.append((name, qty, "Emniyet stoğu altında"))
        
        if not anomalies:
            return "Stok anomalisi yok. Tüm ürünler normal seviyelerde."
        
        output = f"STOK ANOMALİLERİ ({len(anomalies)} ürün):\n"
        for name, qty, status in sorted(anomalies, key=lambda x: x[1]):
            output += f"- {name}: {qty} adet - {status}\n"
        
        return output
    except Exception as e:
        return f"Anomali analizi hatası: {str(e)}"