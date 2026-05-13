# 🚀 SmartOps — AI-Powered Intelligent ERP & Logistics System

> YZTA Hackathon 2026 kapsamında geliştirilen, yapay zeka destekli otonom lojistik ve ERP yönetim platformu.

---

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Sistem Mimarisi](#-sistem-mimarisi)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Katkı Sağlama](#-katkı-sağlama)

---

## 🎯 Proje Hakkında

**SmartOps**, lojistik süreçlerini otonomlaştırmak ve veri analitiği ile desteklemek amacıyla kurgulanmış, FastAPI ve Next.js tabanlı bir ERP çözümüdür.

Platform; stok takibi, sipariş yönetimi, kargo/lojistik süreçleri ve yapay zeka destekli müşteri analitiğini tek çatı altında birleştirir. İki temel kullanıcı kitlesi hedeflenmektedir:

- **Yöneticiler / Operatörler** — Stok, sipariş ve kargo süreçlerini takip eden admin paneli
- **Müşteriler** — Ürünleri listeleyip sipariş verebildiği alışveriş arayüzü (marketplace)

### ✨ Temel Özellikler

- 🔐 Kullanıcı kimlik doğrulama ve yetkilendirme
- 📦 Akıllı ürün ve stok yönetimi (emniyet stoku desteği ile)
- 🛒 Sipariş oluşturma ve takibi
- 🚚 Lojistik ve sevkiyat operasyonları
- 👤 Müşteri profilleme ve shadow profil analizi
- 📊 RFM & Apriori tabanlı veri analitiği
- 🤖 Gemini 2.5 Flash ile otonom AI ajanları
- 💬 WhatsApp Cloud API ile NLP destekli iletişim
- 🔌 Model Context Protocol (MCP) sunucusu

---

## 🏗 Sistem Mimarisi

SmartOps dört ana katmandan oluşmaktadır:

```
┌─────────────────────────────────────────────────────┐
│         Sunum Katmanı (Presentation Layer)          │
│         Next.js Dashboard + WhatsApp Cloud API      │
├─────────────────────────────────────────────────────┤
│       Orkestrasyon Katmanı (Backend Layer)          │
│       FastAPI + Pydantic (iş mantığı & doğrulama)  │
├─────────────────────────────────────────────────────┤
│          Zeka Katmanı (Intelligence Layer)          │
│    RFM / Apriori Analitik + Gemini 2.5 Flash Ajan  │
├─────────────────────────────────────────────────────┤
│        Veri Katmanı (Data Persistence Layer)        │
│        Supabase (PostgreSQL) + Elastic Search       │
└─────────────────────────────────────────────────────┘
```

---

## 🛠 Teknoloji Yığını

| Alan | Teknolojiler |
|------|-------------|
| **Backend** | FastAPI, Python, Pydantic |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Yapay Zeka** | Google Gemini 2.5 Flash, Otonom AI Ajanları |
| **Veri Bilimi** | RFM Analizi, Apriori Algoritması, Pandas |
| **Arama** | Elastic Search |
| **Veritabanı** | Supabase (PostgreSQL) + RLS Politikaları |
| **İletişim** | WhatsApp Cloud API, NLP |
| **Protokol** | Model Context Protocol (MCP) |

---

## 📁 Proje Yapısı

```
YZTAhackathon2026/
├── backend/
│   └── app/
│       ├── agents/              # AI & LLM Orkestrasyonu (Gemini Servisleri)
│       ├── api/                 # API Rotaları ve İş Mantığı
│       │   ├── analytics.py     # RFM ve Apriori algoritmaları
│       │   ├── auth.py          # Güvenlik ve yetkilendirme
│       │   ├── chat.py          # WhatsApp ve NLP iletişimi
│       │   ├── inventory.py     # Stok yönetim algoritmaları
│       │   ├── orders.py        # Sipariş yönetimi
│       │   ├── products.py      # Ürün kataloğu
│       │   ├── profiles.py      # Müşteri profilleme
│       │   ├── shadow_profiles.py # Anonim müşteri analizi
│       │   └── shipment.py      # Lojistik ve sevkiyat operasyonları
│       ├── core/
│       │   ├── config.py        # Sistem ayarları (.env)
│       │   └── supabase_client.py # Veritabanı bağlantı yönetimi
│       ├── models/              # Pydantic veri şemaları
│       ├── routers/             # API uç noktası yönlendirmeleri
│       └── services/            # Yardımcı servis modülleri
├── frontend/
│   └── lojistik-dashboard/      # Next.js UI katmanı
│       ├── app/                 # App Router ve sayfalar
│       ├── components/
│       │   ├── dashboard/       # Admin ve stok görünümleri
│       │   ├── marketplace/     # Müşteri alışveriş bileşenleri
│       │   └── layout/          # Header ve Sidebar
│       ├── public/
│       ├── package.json
│       └── tailwind.config.ts
├── mcp_server/                  # Model Context Protocol sunucusu
├── database/
│   └── schema.sql               # PostgreSQL tablo yapıları ve RLS politikaları
├── datasets/
│   └── seed.py                  # Başlangıç verisi yükleme scripti
├── seed_safety_stock.py         # Emniyet stoku başlangıç scripti
├── CLAUDE.md                    # Geliştirici rehberi ve komutlar
└── README.md                    # Bu dosya
```

---

## ⚙️ Kurulum

### Gereksinimler

- Python 3.10+
- Node.js 18+
- Supabase hesabı
- Google Gemini API anahtarı
- WhatsApp Cloud API erişimi (opsiyonel)

---

### 1. Repoyu Klonlayın

```bash
git clone https://github.com/beyzagumuse/YZTAhackathon2026.git
cd YZTAhackathon2026
```

---

### 2. Veritabanını Kurun

Supabase projenizde `database/schema.sql` dosyasını çalıştırarak tabloları ve RLS politikalarını oluşturun.

Başlangıç verilerini yüklemek için:

```bash
cd datasets
python seed.py

# Emniyet stoku verilerini yüklemek için:
cd ..
python seed_safety_stock.py
```

---

### 3. Backend Kurulumu

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

`.env` dosyası oluşturun:

```env
SUPABASE_URL=https://<proje-id>.supabase.co
SUPABASE_KEY=<supabase-anon-key>
GEMINI_API_KEY=<google-gemini-api-key>
WHATSAPP_TOKEN=<whatsapp-cloud-api-token>   # opsiyonel
```

Backend'i başlatın:

```bash
uvicorn app.main:app --reload
```

API şu adreste çalışır: `http://localhost:8000`  
Swagger dokümantasyonu: `http://localhost:8000/docs`

---

### 4. Frontend Kurulumu

```bash
cd frontend/lojistik-dashboard
npm install
```

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<proje-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Frontend'i başlatın:

```bash
npm run dev
```

Uygulama şu adreste çalışır: `http://localhost:3000`

---

## 🖥 Kullanım

### Admin / Yönetici Paneli

- Stok takibi ve emniyet stoku yönetimi
- Sipariş listesi ve durum güncellemeleri
- Kargo ve lojistik operasyonları
- RFM & Apriori tabanlı analitik raporlar
- AI ajan çıktıları ve önerileri

### Marketplace (Müşteri Arayüzü)

- Ürün listeleme ve arama
- Sepete ekleme ve sipariş oluşturma
- Sipariş geçmişi

### WhatsApp Entegrasyonu

WhatsApp Cloud API üzerinden NLP destekli müşteri iletişimi sağlanır. Müşteriler sipariş sorgulama ve bildirim alma işlemlerini WhatsApp üzerinden gerçekleştirebilir.

---

## 📡 API Dokümantasyonu

Backend çalışırken otomatik oluşturulan Swagger arayüzüne erişebilirsiniz:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Başlıca Endpoint'ler

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| POST | `/auth/register` | Kullanıcı kaydı |
| POST | `/auth/login` | Giriş ve yetkilendirme |
| GET | `/products` | Ürün listesi |
| POST | `/orders` | Yeni sipariş oluştur |
| GET | `/inventory` | Stok durumu |
| GET | `/shipment` | Kargo ve sevkiyat takibi |
| GET | `/analytics` | RFM & Apriori analitik veriler |
| GET | `/profiles` | Müşteri profilleri |
| GET | `/shadow-profiles` | Anonim müşteri analizi |
| POST | `/chat` | WhatsApp / NLP mesajlaşma |

---

## 🤝 Katkı Sağlama

1. Bu repoyu fork'layın
2. Yeni bir branch oluşturun: `git checkout -b feature/ozellik-adi`
3. Değişikliklerinizi commit'leyin: `git commit -m "feat: yeni özellik eklendi"`
4. Branch'inizi push'layın: `git push origin feature/ozellik-adi`
5. Pull Request açın

Geliştirme rehberi ve komutlar için `CLAUDE.md` dosyasına bakınız.


## Geliştirenler

- Ahmet Özdoğan
- Duran Utku Gebeş
- Emine Beyza Gümüş
- Ömer Faruk Yurtdakal

---

## 📄 Lisans

Bu proje YZTA Hackathon 2026 kapsamında geliştirilmiştir.
