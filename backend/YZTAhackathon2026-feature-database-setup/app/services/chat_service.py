from fastapi import HTTPException
from app.core.config import settings
from app.core.supabase_client import supabase_client
import httpx

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gemma4:31b"


def _build_system_prompt() -> str:
    """Veritabanı anlık özetini alıp sistem promptuna gömer."""
    try:
        orders = supabase_client.table("orders").select("status").execute().data or []
        counts = {"pending": 0, "shipped": 0, "delivered": 0}
        for o in orders:
            s = o.get("status", "")
            if s in counts:
                counts[s] += 1

        inv = supabase_client.table("inventory").select("quantity").execute().data or []
        critical = sum(1 for i in inv if (i.get("quantity") or 0) <= 5)
        low = sum(1 for i in inv if 5 < (i.get("quantity") or 0) <= 20)
    except Exception:
        counts = {"pending": "?", "shipped": "?", "delivered": "?"}
        critical = low = "?"

    return f"""Sen SmartOps ERP sisteminin AI asistanısın. Türkçe yanıt ver.

Güncel sistem durumu:
- Siparişler: {counts['pending']} hazırlanıyor, {counts['shipped']} kargoda, {counts['delivered']} teslim edildi
- Stok: {critical} kritik ürün (≤5 adet), {low} düşük stok ürün (6-20 adet)

Veritabanı tablolar: orders, order_items, products, inventory, inventory_logs, profiles, shipping
Admin sorularına kısa ve analitik cevap ver. Sayısal veri varsa onu öne çıkar."""


async def chat_gemini(message: str) -> str:
    import google.generativeai as genai
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY tanımlı değil.")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=_build_system_prompt(),
    )
    response = model.generate_content(message)
    return response.text


async def chat_ollama(message: str) -> str:
    system = _build_system_prompt()
    prompt = f"{system}\n\nKullanıcı: {message}\nAsistan:"
    async with httpx.AsyncClient(timeout=120.0) as client:
        res = await client.post(OLLAMA_URL, json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
        })
        if res.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Ollama hatası: {res.text}")
        return res.json().get("response", "")


async def chat_customer(message: str, customer_id: str = None) -> str:
    """Müşteri chatbotu — sadece sipariş sorgularını yanıtlar."""
    import google.generativeai as genai
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY tanımlı değil.")

    order_context = ""
    if customer_id:
        try:
            orders = supabase_client.table("orders") \
                .select("id, status, total_amount, created_at, order_items(quantity, unit_price_at_sale, products(name))") \
                .eq("customer_id", customer_id) \
                .order("created_at", desc=True).limit(5).execute().data or []
            if orders:
                lines = []
                for o in orders:
                    items_str = ", ".join(
                        f"{it['products']['name']} x{it['quantity']}" for it in (o.get("order_items") or []) if it.get("products")
                    )
                    lines.append(f"- Sipariş #{o['id'][:8].upper()}: {o['status']} | {o['total_amount']} ₺ | {items_str}")
                order_context = "Müşterinin son siparişleri:\n" + "\n".join(lines)
        except Exception:
            pass

    system = f"""Sen SmartOps mağazasının müşteri hizmetleri asistanısın. Türkçe, kısa ve samimi cevap ver.
Sadece sipariş durumu, ürünler ve teslimat konularında yardım et.
{order_context}"""

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name="gemini-2.0-flash", system_instruction=system)
    response = model.generate_content(message)
    return response.text
