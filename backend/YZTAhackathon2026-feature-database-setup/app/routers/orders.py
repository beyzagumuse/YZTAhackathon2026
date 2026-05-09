from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.supabase_client import supabase_client

# Bu dosyayı ana uygulamaya bağlamak için bir router tanımlıyoruz
router = APIRouter(
    prefix="/checkout",
    tags=["Orders"]
)

# --- Pydantic Şemaları ---
class OrderItemSchema(BaseModel):
    id: int
    name: str
    price: float
    quantity: int

class CheckoutRequest(BaseModel):
    items: List[OrderItemSchema]
    total_amount: float
    # Misafir / Üye Bilgileri (Hepsi opsiyonel, çünkü duruma göre dolu gelecek)
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    user_id: Optional[str] = None  # Supabase auth.users tablosundaki UUID

# --- Endpoint ---
@router.post("/")
async def create_order(order: CheckoutRequest):
    try:
        # 1. Ana Siparişi (orders tablosu) Hazırla
        # Eğer user_id null ise, Supabase bunu misafir siparişi olarak kabul eder.
        order_data = {
            "total_amount": order.total_amount,
            "guest_name": order.full_name,
            "guest_email": order.email,
            "guest_phone": order.phone,
            "address": order.address,
            "user_id": order.user_id,
            "status": "Hazırlanıyor"
        }
        
        # Siparişi veritabanına yaz ve oluşan yeni ID'yi al
        order_response = supabase_client.table("orders").insert(order_data).execute()
        new_order_id = order_response.data[0]['id']

        # 2. Sepetteki Ürünleri (order_items tablosu) Hazırla
        items_data = []
        for item in order.items:
            items_data.append({
                "order_id": new_order_id,
                "product_id": item.id,
                "product_name": item.name,
                "quantity": item.quantity,
                "price": item.price
            })
        
        # Ürünleri veritabanına yaz
        supabase_client.table("order_items").insert(items_data).execute()

        return {"message": "Sipariş başarıyla alındı!", "order_id": new_order_id}

    except Exception as e:
        print(f"Sipariş Kayıt Hatası: {str(e)}")
        raise HTTPException(status_code=500, detail="Veritabanına kaydedilirken bir hata oluştu.")