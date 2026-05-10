from fastapi import APIRouter, status
from app.models.schemas import ProductCreate, ProductUpdate
from app.services import product_service

# Prefix "/products" olarak tanımlandı
router = APIRouter(prefix="/products", tags=["Products"])

# Hata Çözümü: Hem "/products" hem de "/products/" isteklerini karşılamak için çift dekoratör kullanıyoruz
@router.get("")
@router.get("/")
async def list_products():
    """Tüm ürünleri listeler."""
    return await product_service.list_products()

@router.get("/{product_id}")
async def get_product(product_id: str):
    """Belirli bir ürünün detaylarını getirir."""
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