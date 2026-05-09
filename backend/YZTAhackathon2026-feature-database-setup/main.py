import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# Kendi yolunuza göre içe aktarın (Örnek yollar)
from app.core.supabase_client import supabase_client
from app.agents.gemini_service import ask_ai

load_dotenv()

app = FastAPI(title="SmartOps Cooperative API")

# --- CORS AYARLARI ---
# Next.js'in API'mize sorunsuzca istek atabilmesi için
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Modelleri (Şemalar) ---
class OrderItem(BaseModel):
    id: int
    name: str
    price: float
    quantity: int

class CheckoutRequest(BaseModel):
    items: List[OrderItem]
    total_amount: float
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    user_id: Optional[str] = None

class ChatRequest(BaseModel):
    message: str

# --- ENDPOINT: SİPARİŞİ VERİTABANINA KAYDET ---
@app.post("/checkout/")
async def create_order(order: CheckoutRequest):
    try:
        # 1. Eksik Alan Validasyonu
        if not order.email or not order.full_name:
            raise HTTPException(status_code=400, detail="E-posta ve İsim alanları zorunludur!")

        # 2. Misafir Kullanıcıya Otomatik Benzersiz ID Ataması
        if not order.user_id:
            order.user_id = str(uuid.uuid4())

        # 3. Ana Sipariş (orders) Payload Hazırlığı
        order_payload = {
            "total_amount": order.total_amount,
            "guest_name": order.full_name,
            "guest_email": order.email,
            "guest_phone": order.phone,
            "address": order.address,
            "user_id": order.user_id,
            "status": "Hazırlanıyor"
        }
        
        # Supabase 'orders' tablosuna kayıt
        response = supabase_client.table("orders").insert(order_payload).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Sipariş kaydedilirken Supabase'den boş yanıt döndü.")
            
        new_order_id = response.data[0]['id']

        # 4. Sipariş Edilen Ürünlerin (order_items) Payload Hazırlığı
        items_payload = []
        for item in order.items:
            items_payload.append({
                "order_id": new_order_id,
                "product_id": item.id,
                "product_name": item.name,
                "quantity": item.quantity,
                "price": item.price
            })
        
        # Supabase 'order_items' tablosuna kayıt
        supabase_client.table("order_items").insert(items_payload).execute()

        return {"status": "success", "order_id": new_order_id, "message": "Sipariş veritabanına başarıyla işlendi."}

    except Exception as e:
        print(f"Backend Kayıt Hatası: {e}")
        # Hata mesajını frontend'e iletmek için HTTPException kullanıyoruz
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT: AI CHAT ---
@app.post("/chat/")
async def chat_with_ai(request: ChatRequest):
    try:
        reply = await ask_ai(request.message)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Sağlık Kontrolü ---
@app.get("/")
async def root():
    return {"message": "SmartOps API is running smoothly!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)