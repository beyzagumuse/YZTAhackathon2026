from fastapi import APIRouter, Header, HTTPException
from app.models.schemas import ProfileUpdate
from app.services import profile_service
from app.core.supabase_client import supabase_client

router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.get("/me")
async def get_profile(x_user_id: str = Header(..., description="The user UUID from auth token payload")):
    """Get the current logged-in user's profile data. (Using header injection for demonstration)"""
    return await profile_service.get_my_profile(x_user_id)

@router.put("/me")
async def update_profile(data: ProfileUpdate, x_user_id: str = Header(...)):
    """Update profile details (except email and TC No)."""
    return await profile_service.update_my_profile(x_user_id, data)

@router.get("/")
async def list_all_customers():
    """Tüm müşterileri (profilleri) listeler."""
    res = supabase_client.table("profiles").select("*").execute()
    return res.data