import google.generativeai as genai
from app.core.config import settings


from app.agents.tools import check_stock_and_price, get_order_status

# Gemini API anahtarını tanımla
genai.configure(api_key=settings.GEMINI_API_KEY)

# Ajanın kişiliği ve kuralları (System Prompt)
SYSTEM_PROMPT = """
Sen SmartOps şirketinin zeki ve yardımsever ERP ve E-Ticaret asistanısın. 
Müşterilere kibar, samimi ve profesyonel bir dille yardımcı ol.

KURALLAR:
1. Ürün fiyatı veya stok sorulduğunda DAİMA 'check_stock_and_price' aracını kullan.
2. Kullanıcı sipariş durumunu veya kargosunu sorduğunda DAİMA 'get_order_status' aracını kullan.
3. Eğer sipariş durumu soruyor ama sipariş numarası (ID) vermediyse, aracı çalıştırmadan önce nazikçe sipariş numarasını iste.
4. Kendi kendine tahminde bulunma, sadece araçların sana döndürdüğü gerçek verileri kullanarak cevap ver.
5. Cevaplarını kısa, anlaşılır ve Türkçe ver.
"""


model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=SYSTEM_PROMPT,
    tools=[check_stock_and_price, get_order_status] 
)

async def chat_with_agent(user_message: str) -> str:
    try:
        chat = model.start_chat(enable_automatic_function_calling=True)
        response = chat.send_message(user_message)
        return response.text
    except Exception as e:
        return f"Yapay zeka asistanında geçici bir sorun var: {str(e)}"