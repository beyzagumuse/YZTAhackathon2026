from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# ÇÖZÜM: 'shipping' yerine 'shipment' yazıldı
from app.api import auth, inventory, orders, products, profiles, shadow_profiles, shipment, chat, analytics

app = FastAPI(title="AI-driven ERP for SMEs", version="1.0.0")

# Supabase ve veritabanı hatalarını yakalayan özel hata işleyici
@app.exception_handler(Exception)
async def supabase_exception_handler(request: Request, exc: Exception):
    exc_type = type(exc).__name__
    # Supabase API veya Auth hataları oluşursa kullanıcıya 400 hatası döner
    if exc_type in ("APIError", "AuthApiError", "PostgrestAPIError"):
        msg = getattr(exc, "message", str(exc))
        return JSONResponse(status_code=400, content={"detail": msg})
    raise exc

# CORS Ayarları: Frontend'in backend ile sorunsuz konuşmasını sağlar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Tüm kaynaklara izin verir
    allow_credentials=True,
    allow_methods=["*"], # Tüm HTTP metodlarına (GET, POST, PUT, DELETE vb.) izin verir
    allow_headers=["*"],
)

# Tüm modüllerin rotalarını uygulamaya dahil ediyoruz
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(inventory.router)
app.include_router(orders.router)
app.include_router(profiles.router)
app.include_router(shadow_profiles.router)
# ÇÖZÜM: 'shipping.router' yerine 'shipment.router' eklendi
app.include_router(shipment.router)
app.include_router(chat.router)
app.include_router(analytics.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the AI-driven ERP API"}