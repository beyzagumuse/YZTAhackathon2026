from fastapi import HTTPException
from app.core.config import settings
from app.core.supabase_client import supabase_client
import httpx

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gemma4:31b"
GEMINI_MODEL = "gemini-2.5-flash"


def _build_system_prompt() -> str:
    try:
        orders = supabase_client.table("orders").select("status").execute().data or []
        counts = {"pending": 0, "shipped": 0, "delivered": 0}
        for o in orders:
            s = o.get("status", "")
            if s in counts:
                counts[s] += 1

        inv = supabase_client.table("inventory").select("quantity, products(name)").execute().data or []
        critical = [(i["products"]["name"], i["quantity"]) for i in inv if (i.get("quantity") or 0) <= 5 and i.get("products")]
        low_count = sum(1 for i in inv if 5 < (i.get("quantity") or 0) <= 20)

        # En çok satan ürünler (order_items toplamı)
        items = supabase_client.table("order_items").select("quantity, products(name)").execute().data or []
        sales: dict = {}
        for it in items:
            name = (it.get("products") or {}).get("name")
            if name:
                sales[name] = sales.get(name, 0) + it["quantity"]
        top5 = sorted(sales.items(), key=lambda x: x[1], reverse=True)[:5]
        top5_str = "\n".join(f"  {i+1}. {name}: {qty} adet" for i, (name, qty) in enumerate(top5)) or "  Veri yok"

        # Kritik stok listesi
        critical_str = "\n".join(f"  - {name}: {qty} adet" for name, qty in critical[:5]) or "  Yok"

    except Exception:
        counts = {"pending": "?", "shipped": "?", "delivered": "?"}
        top5_str = "  Veri alinamadi"
        critical_str = "  Veri alinamadi"
        low_count = "?"

    return f"""Sen SmartOps ERP sisteminin AI asistanısın. Türkçe yanıt ver.

KURAL: Sadece aşağıdaki gerçek verileri kullan. Bu verilerin dışında tahmin veya uydurma yapma.
Eğer bir soruyu yanıtlamak için yeterli verin yoksa bunu açıkça söyle.
Yanıtlarında markdown formatı kullanma, yıldız (*) veya diyez (#) karakteri yazma, düz metin yaz.

Güncel sistem durumu:
- Siparişler: {counts['pending']} hazırlanıyor, {counts['shipped']} kargoda, {counts['delivered']} teslim edildi
- Kritik stok (<=5 adet):
{critical_str}
- Düşük stok ürün sayısı (6-20 adet): {low_count}

En çok satan 5 ürün (toplam sipariş adedi):
{top5_str}

Bu veriler dışında (örn. gelir, müşteri adları, tarih aralıkları) soru gelirse "Bu bilgiye şu an erişimim yok" de."""


async def chat_gemini(message: str) -> str:
    import google.generativeai as genai
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY tanımlı değil.")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            system_instruction=_build_system_prompt(),
        )
        response = model.generate_content(message)
        return response.text
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini hatası: {str(e)}")


async def chat_ollama(message: str) -> str:
    system = _build_system_prompt()
    prompt = f"{system}\n\nKullanıcı: {message}\nAsistan:"
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            res = await client.post(OLLAMA_URL, json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            })
            if res.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Ollama hatası: {res.text}")
            return res.json().get("response", "")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ollama bağlantı hatası: {str(e)}")
