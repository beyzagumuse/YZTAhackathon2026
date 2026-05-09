from fastapi import HTTPException
from app.models.schemas import UserSignup, UserLogin
from app.core.supabase_client import supabase_client

async def signup(user_data: UserSignup):
    # Supabase Auth üzerinden kayıt (Aynı e-posta varsa Supabase hata fırlatır)
    try:
        auth_response = supabase_client.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")

    # Eğer e-posta daha önce kullanılmışsa veya auth başarısızsa
    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Signup failed. Email might already be in use.")

    user_id = auth_response.user.id

    # Profiller tablosuna ekstra bilgileri ekle (TC no çıkarıldı)
    try:
        supabase_client.table("profiles").insert({
            "id": user_id,
            "full_name": user_data.full_name,
            "email": user_data.email  # İleride sorgulama kolaylığı için email'i profilde de tutabiliriz
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user profile: {str(e)}")

    # --- SHADOW PROFILE (MİSAFİR SİPARİŞ) AKTARIM MANTIĞI ---
    try:
        # Eğer bu e-posta adresiyle daha önce verilmiş misafir siparişler varsa, asıl hesaba bağla
        supabase_client.table("orders") \
            .update({"customer_id": user_id}) \
            .eq("guest_email", user_data.email) \
            .execute()
        
        # Kullanıcı artık üye olduğu için shadow profile (misafir) kaydını sil (Temizlik)
        supabase_client.table("shadow_profiles") \
            .delete() \
            .eq("email", user_data.email) \
            .execute()
    except Exception as e:
        # Kayıt başarılı olduğu için sipariş aktarım hatasını sadece logluyoruz
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
            "email": email,      # E-posta eklendi
            "phone": phone,      # Telefon eklendi
            "ip_address": ip_address,
            "user_agent": user_agent
        }).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create shadow profile: {str(e)}")