from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

# Tüm API rotalarının import edilmesi
from app.api import (
    auth, 
    inventory, 
    orders, 
    products, 
    profiles, 
    shadow_profiles, 
    shipment, 
    chat
)

app = FastAPI(title="SmartOps KOBİ: AI-Driven ERP", version="1.0.0")

# CORS ayarları: Frontend ile sorunsuz iletişim için
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ların uygulamaya dahil edilmesi (Include Routers)
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(inventory.router)
app.include_router(orders.router)
app.include_router(profiles.router)
app.include_router(shadow_profiles.router)
app.include_router(shipment.router) # Kargo Watchdog Servisi
app.include_router(chat.router)      # Gemini AI Chatbot Servisi

@app.get("/")
async def root():
    """Uygulamanın çalışıp çalışmadığını kontrol etmek için ana endpoint."""
    return {"message": "Welcome to the SmartOps AI-driven ERP API"}

# Prometheus Monitoring (Sistem İzleme) Başlatıcısı
# Bu sayede http://localhost:8000/metrics adresinden Grafana için canlı veri akışı sağlanır.
Instrumentator().instrument(app).expose(app)