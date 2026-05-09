import os
from dotenv import load_dotenv
import google.generativeai as genai
from fastapi import HTTPException
from app.agents.tools import get_stock_level, get_order_status

# .env dosyasındaki değişkenleri sisteme yükler (500 hatasını çözen kısım)
load_dotenv()

# API Key .env dosyasından okunur
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠️ DİKKAT: GEMINI_API_KEY .env dosyasından okunamadı! Lütfen .env dosyasını kontrol edin.")

# Gemini'a kim olduğunu ve araçları nasıl kullanacağını anlattığımız sistem komutu
system_prompt = """
Sen SmartOps KOBİ asistanısın. Müşterilerin stok ve kargo sorularını yanıtlarsın.
Her zaman sana verilen araçları (tools) kullanarak veritabanından gerçek verileri çek.
Cevapların kısa, net ve profesyonel olsun. Türkçe yanıt ver.
"""

# Modeli başlat
model = genai.GenerativeModel(
    model_name='gemini-1.5-flash-latest',
    tools=[get_stock_level, get_order_status],
    system_instruction=system_prompt
)

# Otomatik fonksiyon çağırma (Function Calling) özellikli sohbet oturumu
chat_session = model.start_chat(enable_automatic_function_calling=True)

async def ask_ai(user_message: str) -> str:
    """Kullanıcı mesajını Gemini'a gönderir ve yanıtı döner."""
    if not GEMINI_API_KEY:
         raise HTTPException(status_code=500, detail="GEMINI_API_KEY is missing. Check .env file.")
    try:
        response = chat_session.send_message(user_message)
        return response.text
    except Exception as e:
        print(f"AI İşlem Hatası: {str(e)}") # Konsola hatanın detayını yazar
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")