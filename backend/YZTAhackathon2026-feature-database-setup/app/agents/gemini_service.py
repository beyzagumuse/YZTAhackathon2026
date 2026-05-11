import google.generativeai as genai
from app.core.config import settings
from app.agents.tools import check_stock_and_price

# Gemini API anahtarını tanımla
genai.configure(api_key=settings.GEMINI_API_KEY)

# Ajanın kişiliği (System Prompt)
SYSTEM_PROMPT = """
Sen SmartOps şirketinin zeki ve yardımsever ERP ve E-Ticaret asistanısın. 
Müşterilere kibar, samimi ve profesyonel bir dille yardımcı ol.
Ürün fiyatı veya stok durumu sorulduğunda DAİMA sana verilen 'check_stock_and_price' aracını (tool) kullan.
Kendi kendine tahminde bulunma, sadece aracın sana döndürdüğü gerçek verileri kullanarak cevap ver.
Cevaplarını kısa, anlaşılır ve Türkçe ver.
"""

# Modeli Başlat (Aracı modele tanıtıyoruz)
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=SYSTEM_PROMPT,
    tools=[check_stock_and_price] # Yapay zekaya alet çantasını verdik!
)

async def chat_with_agent(user_message: str) -> str:
    try:
        # enable_automatic_function_calling=True sayesinde model gerektiğinde 
        # kodumuzdaki fonksiyonu kendi kendine çalıştırıp cevabını alır.
        chat = model.start_chat(enable_automatic_function_calling=True)
        response = chat.send_message(user_message)
        return response.text
    except Exception as e:
        return f"Yapay zeka asistanında geçici bir sorun var: {str(e)}"