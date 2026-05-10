from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, inventory, orders, products, profiles, shadow_profiles, shipping

app = FastAPI(title="AI-driven ERP for SMEs", version="1.0.0")

@app.exception_handler(Exception)
async def supabase_exception_handler(request: Request, exc: Exception):
    exc_type = type(exc).__name__
    if exc_type in ("APIError", "AuthApiError", "PostgrestAPIError"):
        msg = getattr(exc, "message", str(exc))
        return JSONResponse(status_code=400, content={"detail": msg})
    raise exc

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(inventory.router)
app.include_router(orders.router)
app.include_router(profiles.router)
app.include_router(shadow_profiles.router)
app.include_router(shipping.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the AI-driven ERP API"}
