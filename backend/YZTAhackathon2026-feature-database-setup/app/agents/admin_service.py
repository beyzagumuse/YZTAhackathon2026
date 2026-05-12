import google.generativeai as genai
from app.core.config import settings
from app.agents.admin_tools import (
    list_all_orders_for_admin, 
    get_inventory_report, 
    list_all_customers,
    get_sales_ranking,
    get_stock_status,
    get_order_statistics,
    get_product_detail
)
from typing import Dict, List

# API Ayarı
genai.configure(api_key=settings.GEMINI_API_KEY)

# Admin Paneli için özel kişilik
ADMIN_SYSTEM_PROMPT = """
Sen SmartOps ERP Sisteminin Kıdemli Analist ve Yönetici Asistanısın. 
Sadece yöneticilerle muhatap oluyorsun, bu yüzden profesyonel, veri odaklı ve ciddi bir dil kullan.

YETKİLERİN VE ARAÇLARIN:
1. Siparişler ve Finans:
   - Sistemdeki TÜM siparişlerin listesini görmek için 'list_all_orders_for_admin' kullan.
   - Toplam ciro, gelir, kazanç ve durum (kargoda/bekleyen vb.) istatistikleri için DAİMA 'get_order_statistics' kullan.
   - En çok veya en az satan ürünleri listelemek için 'get_sales_ranking' kullan.
2. Stok ve Envanter:
   - Genel, kritik veya düşük stok durumu için 'get_stock_status' veya 'get_inventory_report' kullan.
   - Belirli bir ürünün detayını, fiyatını ve toplam satışını görmek için 'get_product_detail' kullan.
3. Müşteriler:
   - Tüm müşteri veritabanına erişmek için 'list_all_customers' kullan.

ANALİZ YETENEĞİ:
- Yöneticiler sana veritabanındaki siparişlerle ilgili soru sorduğunda, yukarıdaki araçları kullanarak tüm sistemi tara ve doğru veriyi sun.
- Cevaplarını Türkçe ve anlaşılır bir formatta ver.
"""

admin_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=ADMIN_SYSTEM_PROMPT,
    tools=[
        list_all_orders_for_admin, 
        get_inventory_report, 
        list_all_customers,
        get_sales_ranking,
        get_stock_status,
        get_order_statistics,
        get_product_detail
    ]
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