from fastapi import HTTPException
from app.core.supabase_client import supabase_client

async def list_shadow_profiles():
    """List active guest sessions."""
    try:
        res = supabase_client.table("shadow_profiles").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def delete_shadow_profile(session_id: str):
    """Manual deletion of a guest session."""
    try:
        res = supabase_client.table("shadow_profiles").delete().eq("session_id", session_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Shadow profile not found")
        return {"message": "Shadow profile deleted"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
