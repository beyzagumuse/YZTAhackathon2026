from app.core.supabase_client import supabase_client


def get_anomalies() -> str:
    """
    Stok miktarı emniyet stoğunun (reorder point) altında olan ürünleri listeler.
    Anomali, kritik stok uyarısı, yeniden sipariş noktası, reorder point sorularında kullan.
    """
    try:
        items = supabase_client.table("inventory").select("quantity, safety_stock, products(name)").execute().data or []
        anomalies = [
            i for i in items
            if (i.get("safety_stock") or 0) > 0
            and (i.get("quantity") or 0) < (i.get("safety_stock") or 0)
        ]
        if not anomalies:
            return "Şu an anomali tespit edilmedi: tüm ürünlerin stoğu emniyet seviyesinin üzerinde."
        lines = [
            f"- {(i.get('products') or {}).get('name', '?')}: stok={i['quantity']}, emniyet stoğu={i['safety_stock']} (fark: {i['safety_stock'] - i['quantity']})"
            for i in sorted(anomalies, key=lambda x: x["safety_stock"] - x["quantity"], reverse=True)
        ]
        return f"Emniyet stoğu altında {len(anomalies)} ürün (anomali):\n" + "\n".join(lines)
    except Exception as e:
        return f"Anomali verisi alınamadı (hata: {type(e).__name__}: {e})"


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
        res = supabase_client.table("products").select("id, name, price").ilike("name", f"%{product_name}%").execute()
        if not res.data:
            return f"'{product_name}' adında ürün bulunamadı."

        product = res.data[0]
        pid = product["id"]

        inv = supabase_client.table("inventory").select("quantity").eq("product_id", pid).execute()
        stock = inv.data[0]["quantity"] if inv.data else 0

        sold_res = supabase_client.table("order_items").select("quantity").eq("product_id", pid).execute().data or []
        total_sold = sum(i.get("quantity", 0) for i in sold_res)

        return (
            f"Ürün: {product['name']}\n"
            f"Fiyat: {product['price']} TL\n"
            f"Mevcut stok: {stock} adet\n"
            f"Toplam satılan: {total_sold} adet"
        )
    except Exception as e:
        return f"Ürün detayı alınamadı (hata: {type(e).__name__}: {e})"


def list_all_orders_for_admin() -> str:
    """
    Sistemdeki tüm siparişleri müşteri isimleri ve durumlarıyla listeler.
    Admin 'tüm siparişleri göster', 'hangi müşteri sipariş verdi' gibi sorularda kullan.
    """
    try:
        res = supabase_client.table("orders").select("*, profiles(full_name, email)").order("created_at", desc=True).execute()
        if not res.data:
            return "Sistemde henüz hiç sipariş bulunmuyor."
        output = "Tüm siparişler:\n"
        for o in res.data:
            customer = (o.get("profiles") or {}).get("full_name", "Bilinmeyen")
            output += f"- {o['id'][:8]} | {customer} | {o['total_amount']} TL | {o['status']} | {o['created_at'].split('T')[0]}\n"
        return output
    except Exception as e:
        return f"Sipariş listesi alınamadı (hata: {type(e).__name__}: {e})"


def get_inventory_report() -> str:
    """
    Tüm ürünlerin stok miktarlarını ve emniyet stoğu durumunu raporlar.
    Detaylı stok raporu, tam envanter listesi sorularında kullan.
    """
    try:
        res = supabase_client.table("inventory").select("quantity, safety_stock, products(name)").execute()
        if not res.data:
            return "Stok verisi bulunamadı."
        lines = []
        for item in res.data:
            name = (item.get("products") or {}).get("name", "?")
            qty = item.get("quantity", 0)
            safety = item.get("safety_stock", 0)
            flag = " [ANOMALİ]" if safety > 0 and qty < safety else (" [KRİTİK]" if qty <= 5 else "")
            lines.append(f"- {name}: {qty} adet (emniyet: {safety}){flag}")
        return "Stok raporu:\n" + "\n".join(lines)
    except Exception as e:
        return f"Stok raporu alınamadı (hata: {type(e).__name__}: {e})"


def list_all_customers() -> str:
    """
    Sistemdeki tüm kayıtlı müşterileri listeler.
    Müşteri sayısı, müşteri listesi, kim kayıtlı sorularında kullan.
    """
    try:
        res = supabase_client.table("profiles").select("full_name, email, address").execute()
        if not res.data:
            return "Kayıtlı müşteri bulunamadı."
        output = f"Kayıtlı müşteriler ({len(res.data)} kişi):\n"
        for c in res.data:
            output += f"- {c['full_name']} ({c['email']})\n"
        return output
    except Exception as e:
        return f"Müşteri listesi alınamadı (hata: {type(e).__name__}: {e})"
