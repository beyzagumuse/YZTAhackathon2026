from fastapi import APIRouter, Query, status
from app.models.schemas import ProductCreate, ProductUpdate
from app.services import product_service

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("")
@router.get("/")
async def list_products():
    return await product_service.list_products()

@router.get("/categories")
async def list_categories():
    """Distinct kategoriler ve ürün sayısını döndürür."""
    return await product_service.get_categories()

@router.get("/search")
async def search_products(
    q: str = Query(default="", description="Arama terimi"),
    category: str = Query(default="", description="Kategori filtresi"),
):
    """Ürünleri isme ve/veya kategoriye göre filtreler."""
    return await product_service.search_products(q=q, category=category)

@router.get("/{product_id}")
async def get_product(product_id: str):
    return await product_service.get_product(product_id)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_product(data: ProductCreate):
    """Yeni bir ürün oluşturur."""
    return await product_service.create_product(data)

@router.put("/{product_id}")
async def update_product(product_id: str, data: ProductUpdate):
    """Ürün bilgilerini günceller."""
    return await product_service.update_product(product_id, data)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    """Bir ürünü siler."""
    await product_service.delete_product(product_id)