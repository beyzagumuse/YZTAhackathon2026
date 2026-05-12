import google.generativeai as genai
from app.core.config import settings
from app.core.supabase_client import supabase_client
from app.agents.admin_tools import (
    get_sales_ranking,
    get_stock_status,
    get_order_statistics,
    get_product_detail,
    get_anomalies,
    list_all_orders_for_admin,
    get_inventory_report,
    list_all_customers,
)
from typing import Dict, List
import httpx

genai.configure(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """
Sen SmartOps ERP sisteminin admin asistanısın. Türkçe, kısa ve analitik cevap ver.

KURALLAR:
1. Satış, en çok/az satan ürün sorularında DAİMA 'get_sales_ranking' aracını kullan.
2. Stok, envanter, kritik stok sorularında DAİMA 'get_stock_status' veya 'get_inventory_report' aracını kullan.
3. Ciro, gelir, kazanç, sipariş sayısı sorularında DAİMA 'get_order_statistics' aracını kullan.
4. Belirli bir ürün sorulduğunda DAİMA 'get_product_detail' aracını kullan.
5. Anomali, emniyet stoğu altı, reorder point sorularında DAİMA 'get_anomalies' aracını kullan.
6. Tüm siparişleri veya müşteri bilgisini içeren sorularda 'list_all_orders_for_admin' veya 'list_all_customers' aracını kullan.
7. Aracın döndürdüğü veri dışında tahminde bulunma.
8. Yıldız (*) veya diyez (#) gibi markdown karakteri kullanma, düz metin yaz.
"""

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    system_instruction=SYSTEM_PROMPT,
    tools=[
        get_sales_ranking, get_stock_status, get_order_statistics,
        get_product_detail, get_anomalies,
        list_all_orders_for_admin, get_inventory_report, list_all_customers,
    ],
)

_sessions: Dict[str, List] = {}
WINDOW_SIZE = 10


def _fetch_db_context() -> str:
    """Ollama için DB'den güncel özet çeker."""
    try:
        orders = supabase_client.table("orders").select("status, total_amount").execute().data or []
        counts = {"pending": 0, "shipped": 0, "delivered": 0}
        revenue = 0.0
        for o in orders:
            s = o.get("status", "")
            if s in counts:
                counts[s] += 1
            revenue += float(o.get("total_amount") or 0)

        items = supabase_client.table("order_items").select("quantity, products(name)").execute().data or []
        sales: dict = {}
        for it in items:
            name = (it.get("products") or {}).get("name")
            if name:
                sales[name] = sales.get(name, 0) + (it.get("quantity") or 0)
        top5 = sorted(sales.items(), key=lambda x: x[1], reverse=True)[:5]
        bot5 = sorted(sales.items(), key=lambda x: x[1])[:5]

        inv = supabase_client.table("inventory").select("quantity, safety_stock, products(name)").execute().data or []
        critical = [(i.get("products", {}).get("name", "?"), i["quantity"]) for i in inv if (i.get("quantity") or 0) <= 5]
        low = sum(1 for i in inv if 5 < (i.get("quantity") or 0) <= 20)
        anomalies = [
            i for i in inv
            if (i.get("safety_stock") or 0) > 0
            and (i.get("quantity") or 0) < (i.get("safety_stock") or 0)
        ]
        anomaly_str = ', '.join(
            f"{(i.get('products') or {}).get('name','?')}(stok={i['quantity']},emniyet={i['safety_stock']})"
            for i in anomalies[:5]
        ) or 'yok'

        return f"""Güncel sistem verileri (hallüsinasyon yapma, sadece bu verileri kullan):
Siparişler: {len(orders)} toplam | {counts['pending']} hazırlanıyor | {counts['shipped']} kargoda | {counts['delivered']} teslim
Toplam ciro: {revenue:,.2f} TL
En çok satan 5 ürün: {', '.join(f'{n}({q})' for n, q in top5)}
En az satan 5 ürün: {', '.join(f'{n}({q})' for n, q in bot5)}
Kritik stok (<=5): {', '.join(f'{n}:{q}' for n, q in critical[:5]) or 'yok'}
Düşük stok (6-20): {low} ürün
Anomaliler (stok < emniyet stoğu): {len(anomalies)} ürün — {anomaly_str}"""
    except Exception as e:
        return f"Veri alınamadı: {e}"


async def chat_with_admin(user_message: str, session_id: str = None, use_ollama: bool = False) -> str:
    if use_ollama:
        context = _fetch_db_context()
        prompt = f"""Sen SmartOps ERP sisteminin admin asistanısın. Türkçe, kısa ve analitik cevap ver.
Markdown karakteri kullanma. Sadece aşağıdaki gerçek verileri kullan, tahmin yapma.

{context}

Soru: {user_message}
Cevap:"""
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                res = await client.post("http://localhost:11434/api/generate", json={
                    "model": "gemma4:31b",
                    "prompt": prompt,
                    "stream": False,
                })
                if res.status_code != 200:
                    return f"Ollama hatası: {res.text}"
                return res.json().get("response", "Yanıt alınamadı.")
        except Exception as e:
            return f"Ollama bağlantı hatası: {e}"

    try:
        history = _sessions.get(session_id, []) if session_id else []
        chat = model.start_chat(history=history, enable_automatic_function_calling=True)
        response = chat.send_message(user_message)
        if session_id:
            _sessions[session_id] = list(chat.history)[-(WINDOW_SIZE * 2):]
        return response.text
    except Exception as e:
        return f"Asistanda geçici bir sorun oluştu: {str(e)}"
