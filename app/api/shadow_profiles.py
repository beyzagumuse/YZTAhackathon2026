from fastapi import APIRouter, status
from app.services import shadow_profile_service

router = APIRouter(prefix="/shadow-profiles", tags=["Shadow Profiles"])

@router.get("/")
async def list_shadow_profiles():
    """List active guest sessions."""
    return await shadow_profile_service.list_shadow_profiles()

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shadow_profile(session_id: str):
    """Manual deletion endpoint for administrative control."""
    await shadow_profile_service.delete_shadow_profile(session_id)
