#!/usr/bin/env python3
"""
Fill NULL addresses and emails in profiles table with random data.

Usage:
  python datasets/fill_profile_nulls.py

Requires SUPABASE_SERVICE_KEY and SUPABASE_URL in .env
"""

import os
import sys
import random
from typing import List, Dict

# Allow imports from project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client

# ── Turkish Address and Email Data ────────────────────────────────────────────

CITIES = [
    "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Konya", "Gaziantep",
    "Diyarbakır", "Kayseri", "Samsun", "Mersin", "Eskişehir", "Malatya",
    "Erzurum", "Adana", "Denizli", "Elazığ", "Sakarya", "Van", "Rize",
    "Trabzon", "Kütahya", "Ağrı", "Batman", "Bağcılar", "Çankırı", "Giresun",
]

DISTRICTS = {
    "İstanbul": ["Bahçelievler", "Beşiktaş", "Esenler", "Fatih", "Kadıköy", "Kartal", "Maltepe", "Taksim", "Ümraniye", "Üsküdar"],
    "Ankara": ["Çankaya", "Keçiören", "Kızılcaahamam", "Anıtkabir", "Altındağ", "Cebeci", "Keçiören", "Kızılay"],
    "İzmir": ["Alsancak", "Balçova", "Bornova", "Karşıyaka", "Konak", "Alsancak", "Ege", "Güzelbahçe"],
}

STREETS = [
    "Atatürk Caddesi", "Cumhuriyet Caddesi", "Büyük Ay", "Türk İnönü Sokak",
    "Aziz Sancar Sokak", "Şehit Caddesi", "Mimar Sinan Sokak", "Malazgirt Caddesi",
    "Kışla Caddesi", "Yıldız Sokak", "Güven Caddesi", "Başakşehir Sokak",
]

EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "yandex.com"]

FIRST_NAMES_TR = [
    "Ahmet", "Ali", "Aykut", "Barış", "Berin", "Can", "Cengiz", "Cem", "Cüneyt",
    "Derya", "Dilek", "Doğan", "Ece", "Elif", "Emre", "Engin", "Erdal", "Erdem",
    "Erol", "Esra", "Evin", "Ezgi", "Fatih", "Faysal", "Feriha", "Filiz", "Fuat",
    "Galip", "Gizem", "Gönül", "Gülay", "Güler", "Gülhan", "Gülizar", "Gün",
    "Gündüz", "Günsel", "Hakan", "Halil", "Halis", "Hamza", "Hanif", "Hasan",
    "Hazel", "Hayati", "Hazine", "Hepsi", "Herkes", "Hüdai", "Hümar", "Hüseyin",
    "İbrahim", "İdil", "İdris", "İhsan", "İlhan", "İlyas", "İmam", "İrfan",
    "İsmail", "İsmet", "İsyan", "İvan", "İvo", "İzzet", "Jale", "Janer", "Japon",
    "Jasmine", "Javidan", "Jehan", "Jemil", "Jenna", "Jere", "Jeremias", "Jeri",
    "Jestine", "Jesús", "Jeter", "Jetro", "Jevin", "Jey", "Jibrail", "Jiddo",
    "Jigme", "Jihye", "Jill", "Jillian", "Jilly", "Jim", "Jimena", "Jimi", "Jimil",
    "Kadir", "Kader", "Kadri", "Kağan", "Kahya", "Kamal", "Kamer", "Kamil", "Kani",
    "Kankut", "Kappa", "Karacan", "Karanfil", "Karayılan", "Kardemir", "Karem",
    "Karer", "Kari", "Karib", "Karim", "Kariman", "Karimi", "Karis", "Karişma",
    "Laif", "Lail", "Lebedev", "Laziz", "Leblanc", "Leblond", "Lece", "Lecureur",
    "Ledwon", "Lefevre", "Lefèvre", "Leff", "Leffler", "Leforte", "Leger", "Legrand",
    "Maati", "Maan", "Maar", "Maaren", "Maarten", "Maas", "Maat", "Macana", "Macan",
    "Magda", "Magdi", "Maglione", "Magda", "Mahmoud", "Mahmud", "Mahrin", "Mahyar",
    "Majed", "Majid", "Major", "Mak", "Makbule", "Makilim", "Makimovic", "Makka",
    "Nakiye", "Namık", "Nami", "Nana", "Nandana", "Nanette", "Nanine", "Naomi",
    "Naphtali", "Nappah", "Naqliya", "Narc", "Narcis", "Narcisse", "Nardella",
    "Oba", "Obadah", "Obadias", "Obadit", "Obadu", "Obaid", "Obaidi", "Obaidullah",
    "Obaiyya", "Obaiyyin", "Obaiyy", "Obaiyye", "Obakiti", "Obalabisi", "Obalabou",
    "Paca", "Pacal", "Pacaya", "Pace", "Pacenko", "Pacio", "Paciolla", "Pacita",
    "Pachacama", "Pachacoti", "Pachacutec", "Pachacutí", "Pacheño", "Pachen",
    "Rafail", "Rafale", "Rafaela", "Rafahel", "Rafah", "Rafai", "Rafala", "Rafale",
    "Rafalek", "Rafalovich", "Rafalov", "Rafanya", "Rafarafah", "Rafat", "Rafata",
    "Sabahat", "Sabah", "Sabahudin", "Sabai", "Sabaka", "Sabalai", "Sabalath",
    "Sabale", "Sabana", "Sabandia", "Saband", "Sabandija", "Sabando", "Sabane",
    "Tahir", "Tahira", "Tahiyya", "Tahiyye", "Tahki", "Tahkim", "Tahköz", "Tahlil",
    "Tahmane", "Tahmasb", "Tahmatan", "Tahmat", "Tahmata", "Tahmatcan", "Tahmey",
]

LAST_NAMES_TR = [
    "Acar", "Acar", "Açar", "Ataç", "Atay", "Atağ", "Aydan", "Aykan", "Aykaç",
    "Aydoğan", "Aydoğdu", "Aydın", "Ayhan", "Aykol", "Aykut", "Aylak", "Aymacı",
    "Aynamara", "Aynalı", "Aynur", "Ayoğlu", "Ayık", "Ayışık", "Aytekin", "Ayteman",
    "Babacan", "Babaev", "Babail", "Babaian", "Babajian", "Babak", "Babakan", "Babaker",
    "Babalı", "Babana", "Babanın", "Babaoğlu", "Babashev", "Babashoff", "Babatunde",
    "Cabana", "Cabanaj", "Cabanas", "Cabanelas", "Cabanero", "Cabaneta", "Cabanica",
    "Dağ", "Dağ", "Dağalı", "Dağan", "Dağar", "Dağasa", "Dağaşan", "Dağasoylu",
    "Dağatepe", "Dağavul", "Dağayar", "Dağbağlı", "Dağbaşı", "Dağbitik", "Dağbiçer",
    "Erbaş", "Erbay", "Erberk", "Erbil", "Erbilen", "Erbiş", "Erbostan", "Erbul",
    "Famur", "Farabi", "Faramazi", "Faramettin", "Faran", "Farangi", "Farber", "Farberjan",
    "Gazi", "Gaziantep", "Gazibo", "Gazier", "Gazif", "Gazil", "Gazim", "Gazimbe",
    "Hacı", "Hacıbektaş", "Hacıbektas", "Hacıcan", "Hacıcaoğlu", "Hacıdede", "Hacıdemirci",
    "Kapıcı", "Kapiç", "Kapkara", "Kapok", "Kapolai", "Kapon", "Kaporc", "Kaporçe",
    "Lale", "Laleci", "Laleli", "Laleliçin", "Lalelisoyu", "Lalespor", "Laleyetiş",
    "Maçka", "Maça", "Maçak", "Maçaklı", "Maçalan", "Maçalı", "Maçama", "Maçan",
    "Nacak", "Nacakçı", "Nacaklan", "Naçaklı", "Naçak", "Naçakçoğlu", "Naca", "Nacadır",
    "Ödül", "Ödüm", "Ödün", "Ödüncü", "Ödünç", "Ödünlü", "Ödünov", "Ödüntaş",
    "Pala", "Palabey", "Palabığı", "Palaç", "Paladüz", "Palaepoch", "Palaer", "Palaf",
    "Şahin", "Şahman", "Şahmaran", "Şahnazar", "Şahpalı", "Şahsaman", "Şahsavari",
    "Talı", "Talıbey", "Talıçı", "Talıoğlu", "Talıpaman", "Talıpasa", "Talır", "Talıtaş",
    "Üzeyir", "Üzeyli", "Üzkaya", "Üzkan", "Üzlü", "Üzmen", "Üzoel", "Üzöz", "Üztaş",
    "Vafai", "Vafakış", "Vafal", "Vafan", "Vafiades", "Vafiadis", "Vafiadou", "Vafiakis",
    "Yağız", "Yağlı", "Yağma", "Yağmaci", "Yağmacı", "Yağmadağ", "Yağmadan", "Yağmador",
    "Zafer", "Zaffari", "Zaffero", "Zafferos", "Zaffira", "Zaffirelli", "Zaffironi",
]

# ── Database Connection ───────────────────────────────────────────────────────

def _make_client():
    service_key = os.getenv("SUPABASE_SERVICE_KEY", "").strip()
    url = os.getenv("SUPABASE_URL", "").replace("/rest/v1", "").strip("/")
    if not service_key:
        print("ERROR: SUPABASE_SERVICE_KEY is not set in .env")
        print("  Go to Supabase Dashboard > Settings > API > service_role")
        sys.exit(1)
    return create_client(url, service_key)

db = _make_client()

# ── Random Data Generators ────────────────────────────────────────────────────

def generate_random_email() -> str:
    """Generate a random Turkish-style email address."""
    first = random.choice(FIRST_NAMES_TR).lower()
    last = random.choice(LAST_NAMES_TR).lower()
    domain = random.choice(EMAIL_DOMAINS)
    # Add a number to avoid duplicates
    num = random.randint(1, 999)
    return f"{first}.{last}{num}@{domain}"

def generate_random_address() -> str:
    """Generate a random Turkish address."""
    city = random.choice(CITIES)
    
    # Get district for major cities, or use a random one
    if city in DISTRICTS:
        district = random.choice(DISTRICTS[city])
    else:
        district = f"{city} Mahallesi"
    
    street = random.choice(STREETS)
    building_no = random.randint(1, 250)
    apt_no = random.randint(1, 50)
    postal_code = f"{random.randint(10000, 99999)}"
    
    return f"{street} No:{building_no}/Daire:{apt_no}, {district}, {city} {postal_code}, Turkey"

# ── Main Logic ────────────────────────────────────────────────────────────────

def get_profiles_with_null_fields() -> List[Dict]:
    """Fetch profiles with NULL address or email."""
    try:
        # First check if email column exists
        response = db.table("profiles").select("id, full_name, address").limit(1).execute()
        
        # Get all profiles and filter those with NULL address
        all_profiles = db.table("profiles").select("id, full_name, address").execute().data
        
        null_profiles = [p for p in all_profiles if p.get("address") is None or p.get("address") == ""]
        return null_profiles
    except Exception as e:
        print(f"ERROR fetching profiles: {e}")
        return []

def fill_null_addresses_and_emails():
    """Fill NULL addresses in profiles table."""
    print("Fetching profiles with NULL addresses...")
    profiles = get_profiles_with_null_fields()
    
    if not profiles:
        print("✓ No profiles with NULL addresses found!")
        return
    
    print(f"Found {len(profiles)} profiles with NULL addresses")
    
    updated_count = 0
    
    for i, profile in enumerate(profiles, 1):
        profile_id = profile["id"]
        new_address = generate_random_address()
        
        try:
            db.table("profiles").update({
                "address": new_address
            }).eq("id", profile_id).execute()
            
            updated_count += 1
            print(f"  [{i}/{len(profiles)}] Updated {profile['full_name']}")
        except Exception as e:
            print(f"  [ERROR] Failed to update {profile_id}: {e}")
    
    print(f"\n✓ Successfully updated {updated_count} profiles")

# ── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 70)
    print("Filling NULL addresses in profiles table")
    print("=" * 70)
    print()
    
    fill_null_addresses_and_emails()
    
    print()
    print("=" * 70)
    print("Done!")
    print("=" * 70)
