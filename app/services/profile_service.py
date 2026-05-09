from fastapi import HTTPException
from app.models.schemas import ProfileUpdate
from app.core.supabase_client import supabase_client

async def get_my_profile(user_id: str):
    """Get the current logged-in user's profile data."""
    try:
        res = supabase_client.table("profiles").select("*").eq("id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

async def update_my_profile(user_id: str, data: ProfileUpdate):
    """Update profile details (excluding email and tc_no)."""
    try:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_dict:
            return await get_my_profile(user_id)
            
        res = supabase_client.table("profiles").update(update_dict).eq("id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
