from fastapi import APIRouter
from app.models.schemas import UserSignup, UserLogin, ShadowProfileCreate
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
async def signup(user_data: UserSignup):
    return await auth_service.signup(user_data)

@router.post("/login")
async def login(user_data: UserLogin):
    return await auth_service.login(user_data)

@router.post("/shadow-profile")
async def create_shadow_profile(data: ShadowProfileCreate):
    return await auth_service.create_shadow_profile(data.session_id, data.ip_address, data.user_agent)
