from fastapi import HTTPException
from app.models.schemas import UserSignup, UserLogin
from app.core.supabase_client import supabase_client

async def signup(user_data: UserSignup):
    # Sign up via Supabase Auth. The database trigger handles the profile creation.
    try:
        auth_response = supabase_client.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name,
                    "tc_no": user_data.tc_no
                }
            }
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")

    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Signup failed, user not created.")

    return {"message": "User signed up successfully", "user_id": auth_response.user.id}

async def login(user_data: UserLogin):
    try:
        auth_response = supabase_client.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password,
        })
        return {"access_token": auth_response.session.access_token, "user": auth_response.user}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

async def create_shadow_profile(session_id: str, ip_address: str = None, user_agent: str = None):
    try:
        response = supabase_client.table("shadow_profiles").insert({
            "session_id": session_id,
            "ip_address": ip_address,
            "user_agent": user_agent
        }).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create shadow profile: {str(e)}")
