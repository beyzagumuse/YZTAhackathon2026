from fastapi import HTTPException
from app.models.schemas import UserSignup, UserLogin
from app.core.supabase_client import supabase_client

async def signup(user_data: UserSignup):
    # Check if TC No already exists in profiles
    try:
        existing_profile = supabase_client.table("profiles").select("id").eq("tc_no", user_data.tc_no).execute()
        if existing_profile.data:
            raise HTTPException(status_code=400, detail="Duplicate TC No")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

    # Sign up via Supabase Auth
    try:
        auth_response = supabase_client.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")

    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Signup failed, user not created.")

    user_id = auth_response.user.id

    # Insert extra info into profiles table
    try:
        supabase_client.table("profiles").insert({
            "id": user_id,
            "tc_no": user_data.tc_no,
            "full_name": user_data.full_name
        }).execute()
    except Exception as e:
        # Ideally, we should rollback auth signup here, but Supabase doesn't easily allow deleting users from client side
        raise HTTPException(status_code=500, detail=f"Failed to create user profile: {str(e)}")

    return {"message": "User signed up successfully", "user_id": user_id}

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
