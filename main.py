from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, inventory, orders, products, profiles, shadow_profiles

app = FastAPI(title="AI-driven ERP for SMEs", version="1.0.0")

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

@app.get("/")
async def root():
    return {"message": "Welcome to the AI-driven ERP API"}
