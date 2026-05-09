from fastapi import HTTPException
from app.models.schemas import ProductCreate, ProductUpdate
from app.core.supabase_client import supabase_client
import uuid

async def list_products():
    """List all products."""
    try:
        res = supabase_client.table("products").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_product(product_id: str):
    """Get details of a specific product."""
    try:
        res = supabase_client.table("products").select("*").eq("id", product_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Product not found")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

async def create_product(data: ProductCreate):
    """Create a new product."""
    try:
        prod_id = str(uuid.uuid4())
        res = supabase_client.table("products").insert({
            "id": prod_id,
            "name": data.name,
            "description": data.description,
            "price": data.price
        }).execute()
        
        # Initialize inventory to 0 for new product
        supabase_client.table("inventory").insert({
            "product_id": prod_id,
            "quantity": 0
        }).execute()
        
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def update_product(product_id: str, data: ProductUpdate):
    """Update product information (partial)."""
    try:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_dict:
            return await get_product(product_id)
            
        res = supabase_client.table("products").update(update_dict).eq("id", product_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Product not found")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

async def delete_product(product_id: str):
    """Remove a product and its associated inventory gracefully."""
    try:
        # First delete inventory dependencies to maintain relational integrity
        supabase_client.table("inventory").delete().eq("product_id", product_id).execute()
        res = supabase_client.table("products").delete().eq("id", product_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
