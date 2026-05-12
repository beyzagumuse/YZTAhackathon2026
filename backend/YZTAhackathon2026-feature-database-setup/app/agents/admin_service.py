import google.generativeai as genai
from app.core.config import settings
from app.agents.admin_tools import list_all_orders_for_admin, get_inventory_report, list_all_customers
from typing import Dict, List

# API Ayarı
genai.configure(api_key=settings.GEMINI_API_KEY)

# Admin Paneli için özel kişilik
ADMIN_SYSTEM_PROMPT = """
Sen SmartOps ERP Sisteminin Kıdemli Analist ve Yönetici Asistanısın. 
Sadece yöneticilerle muhatap oluyorsun, bu yüzden profesyonel, veri odaklı ve ciddi bir dil kullan.

YETKİLERİN:
1. Sistemdeki TÜM siparişleri görebilir ve analiz edebilirsin ('list_all_orders_for_admin').
2. Tüm stok durumunu ve envanteri sorgulayabilirsin ('get_inventory_report').
3. Tüm müşteri veritabanına erişebilirsin ('list_all_customers').

ANALİZ YETENEĞİ:
- Siparişler listelendiğinde toplam ciro hesabı yapabilirsin.
- Hangi müşterilerin daha aktif olduğunu veya hangi ürünlerin stoklarının bittiğini yorumlayabilirsin.
- Atıl stoktaki ürünler için kampanya önerileri sunabilirsin.

Cevaplarını Türkçe ve anlaşılır bir formatta ver.
"""

admin_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=ADMIN_SYSTEM_PROMPT,
    tools=[list_all_orders_for_admin, get_inventory_report, list_all_customers]
)

_admin_sessions: Dict[str, List] = {}

async def chat_with_admin(user_message: str, session_id: str = None, use_ollama: bool = False) -> str:
    # use_ollama şimdilik pasif, Gemini üzerinden ilerliyoruz
    try:
        history = _admin_sessions.get(session_id, []) if session_id else []
        
        chat = admin_model.start_chat(
            history=history,
            enable_automatic_function_calling=True
        )
        
        response = chat.send_message(user_message)
        
        if session_id:
            _admin_sessions[session_id] = list(chat.history)[-20:] # Son 10 tur hafıza
            
        return response.text
    except Exception as e:
        return f"Admin asistanında bir sorun oluştu: {str(e)}"