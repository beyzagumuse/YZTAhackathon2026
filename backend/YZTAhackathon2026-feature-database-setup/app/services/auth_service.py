from fastapi import HTTPException
from app.models.schemas import UserSignup, UserLogin
from app.core.supabase_client import supabase_client

async def signup(user_data: UserSignup):
    # Supabase Auth üzerinden kayıt
    try:
        auth_response = supabase_client.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")

    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Signup failed. Email might already be in use.")

    user_id = auth_response.user.id

    # Profiller tablosuna ekstra bilgileri (role dahil) ekle
    try:
        supabase_client.table("profiles").insert({
            "id": user_id,
            "full_name": user_data.full_name,
            "email": user_data.email,
            "role": user_data.role  # EKLENDİ
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user profile: {str(e)}")

    # Shadow Profile (Misafir Sipariş) Aktarım Mantığı
    try:
        supabase_client.table("orders") \
            .update({"customer_id": user_id}) \
            .eq("guest_email", user_data.email) \
            .execute()
        
        supabase_client.table("shadow_profiles") \
            .delete() \
            .eq("email", user_data.email) \
            .execute()
    except Exception as e:
        print(f"Shadow profile merge failed for {user_data.email}: {e}")

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

async def create_shadow_profile(session_id: str, email: str = None, phone: str = None, ip_address: str = None, user_agent: str = None):
    try:
        response = supabase_client.table("shadow_profiles").insert({
            "session_id": session_id,
            "email": email,      
            "phone": phone,      
            "ip_address": ip_address,
            "user_agent": user_agent
        }).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create shadow profile: {str(e)}")