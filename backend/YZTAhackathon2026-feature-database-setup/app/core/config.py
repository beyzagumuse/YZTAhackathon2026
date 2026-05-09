import os
from pathlib import Path
from dotenv import load_dotenv

# Dinamik kök dizin belirleme
BASE_DIR = Path(__file__).resolve().parent.parent.parent #

load_dotenv(os.path.join(BASE_DIR, ".env")) #

class Settings:
    PROJECT_NAME: str = "SmartOps AI"
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")
    
    # Dil Seçenekleri
    DEFAULT_LANGUAGE: str = "tr" # tr veya eng
    SUPPORTED_LANGUAGES: list = ["tr", "eng"]
    
    # Dosya yollarını dinamik hale getiriyoruz
    APP_DIR: str = os.path.join(BASE_DIR, "app")

settings = Settings()