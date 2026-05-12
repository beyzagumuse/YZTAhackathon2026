import os
from pathlib import Path
from dotenv import load_dotenv

# Dinamik kök dizin belirleme
BASE_DIR = Path(__file__).resolve().parent.parent.parent
WORKSPACE_ROOT = BASE_DIR.parent.parent

# Load .env from backend app folder, then fallback to workspace root
for env_path in (BASE_DIR / ".env", WORKSPACE_ROOT / ".env"):
    if env_path.exists():
        load_dotenv(env_path)
        break

class Settings:
    PROJECT_NAME: str = "SmartOps AI"
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Dil Seçenekleri
    DEFAULT_LANGUAGE: str = "tr" # tr veya eng
    SUPPORTED_LANGUAGES: list = ["tr", "eng"]
    
    # Dosya yollarını dinamik hale getiriyoruz
    APP_DIR: str = os.path.join(BASE_DIR, "app")

settings = Settings()