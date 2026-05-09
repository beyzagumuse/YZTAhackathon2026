from fastapi import APIRouter, status
from app.models.schemas import ProductCreate, ProductUpdate
from app.services import product_service

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/")
async def list_products():
    """List all products."""
    return await product_service.list_products()

@router.get("/{product_id}")
async def get_product(product_id: str):
    """Get details of a specific product."""
    return await product_service.get_product(product_id)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_product(data: ProductCreate):
    """Create a new product."""
    return await product_service.create_product(data)

@router.put("/{product_id}")
async def update_product(product_id: str, data: ProductUpdate):
    """Update product information (name, price, etc.)."""
    return await product_service.update_product(product_id, data)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    """Remove a product."""
    await product_service.delete_product(product_id)
