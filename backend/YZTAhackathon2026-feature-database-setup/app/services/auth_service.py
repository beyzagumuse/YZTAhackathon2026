from fastapi import HTTPException
from app.models.schemas import UserSignup, UserLogin, ShadowProfileCreate
from app.core.supabase_client import supabase_client

async def signup(user_data: UserSignup):
    """
    Supabase Auth üzerinden yeni kullanıcı kaydı yapar. 
    Veritabanındaki trigger otomatik olarak profil satırını oluşturur.
    """
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
        raise HTTPException(status_code=400, detail=f"Kayıt hatası: {str(e)}")

    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Kayıt başarısız, kullanıcı oluşturulamadı.")

    return {"message": "Kullanıcı başarıyla kaydedildi", "user_id": auth_response.user.id}


async def login(user_data: UserLogin):
    """
    Giriş işlemini yönetir.
    Sırasıyla: Admins tablosu -> Profiles tablosu (test userlar) -> Supabase Auth kontrol edilir.
    """
    try:
        # 1. ADMİN KONTROLÜ (Hatayı çözdüğümüz kısım)
        admin_res = supabase_client.table("admins").select("*").eq("email", user_data.email).eq("password", user_data.password).execute()
        
        if admin_res.data:
            return {
                "access_token": "admin_token", 
                "user": admin_res.data[0],
                "role": "admin"
            }

        # 2. TEST KULLANICILARI KONTROLÜ (user1@user.com ve 112358 şifresi için)
        profile_res = supabase_client.table("profiles").select("*").eq("email", user_data.email).eq("password", user_data.password).execute()
        
        if profile_res.data:
            user = profile_res.data[0]
            # Güvenlik önlemi: E-posta admin@koop.com ise admin rolü ver
            role = "admin" if user_data.email == "admin@koop.com" else "kayıtlıuser"
            return {
                "access_token": "hackathon_test_token", 
                "user": user,
                "role": role
            }

        # 3. STANDART SUPABASE AUTH GİRİŞİ (Siteden yeni kayıt olanlar)
        auth_response = supabase_client.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password,
        })
        
        # Giriş yapan kullanıcının isim vb. bilgilerini profiller tablosundan çek
        auth_prof = supabase_client.table("profiles").select("*").eq("id", auth_response.user.id).execute()
        final_user = auth_prof.data[0] if auth_prof.data else {
            "id": auth_response.user.id, 
            "email": user_data.email, 
            "full_name": "Yeni Kullanıcı"
        }
        
        return {
            "access_token": auth_response.session.access_token, 
            "user": final_user,
            "role": "admin" if user_data.email == "admin@koop.com" else "kayıtlıuser"
        }
    except Exception as e:
        # Hata durumunda (yanlış şifre vb.) 401 döner
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı!")


async def create_shadow_profile(session_id: str, ip_address: str = None, user_agent: str = None):
    """
    Misafir kullanıcılar için anonim oturum profili oluşturur.
    """
    try:
        response = supabase_client.table("shadow_profiles").insert({
            "session_id": session_id,
            "ip_address": ip_address,
            "user_agent": user_agent
        }).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gölge profil oluşturulamadı: {str(e)}")