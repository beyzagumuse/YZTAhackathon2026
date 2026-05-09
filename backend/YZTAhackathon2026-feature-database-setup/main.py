import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# Supabase ve Gemini servisleri (Kendi yollarınıza göre import edin)
from app.core.supabase_client import supabase_client
from app.agents.gemini_service import ask_ai

load_dotenv()

app = FastAPI(title="SmartOps Cooperative API")

# CORS AYARLARI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Frontend adresi
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ŞEMALAR (Sipariş için) ---
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

# --- ŞEMALAR (Chat için) ---
class ChatRequest(BaseModel):
    message: str

# --- ENDPOINT: SİPARİŞİ VERİTABANINA KAYDET ---
@app.post("/checkout/")
async def create_order(order: CheckoutRequest):
    try:
        # 1. Ana Sipariş Kaydı
        order_payload = {
            "total_amount": order.total_amount,
            "guest_name": order.full_name,
            "guest_email": order.email,
            "guest_phone": order.phone,
            "address": order.address,
            "user_id": order.user_id,
            "status": "Hazırlanıyor"
        }
        
        response = supabase_client.table("orders").insert(order_payload).execute()
        new_order_id = response.data[0]['id']

        # 2. Sipariş Kalemleri Kaydı
        items_payload = []
        for item in order.items:
            items_payload.append({
                "order_id": new_order_id,
                "product_id": item.id,
                "product_name": item.name,
                "quantity": item.quantity,
                "price": item.price
            })
        
        supabase_client.table("order_items").insert(items_payload).execute()

        return {"status": "success", "order_id": new_order_id}

    except Exception as e:
        print(f"Hata: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT: AI CHAT ---
@app.post("/chat/")
async def chat_with_ai(request: ChatRequest):
    try:
        reply = await ask_ai(request.message)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "SmartOps API is online"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)