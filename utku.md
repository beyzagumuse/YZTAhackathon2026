# Projeyi Ayağa Kaldırma

## Backend (FastAPI) — Terminal 1

```powershell
cd "c:\Users\W-11\Desktop\hackathon\YZTAhackathon2026\backend\YZTAhackathon2026-feature-database-setup"
& "c:\Users\W-11\Desktop\hackathon\YZTAhackathon2026\venv\Scripts\uvicorn.exe" main:app --reload
```

- Çalışır: http://localhost:8000
- API dokümantasyonu: http://localhost:8000/docs

## Frontend (Next.js) — Terminal 2

```powershell
cd "c:\Users\W-11\Desktop\hackathon\YZTAhackathon2026\frontend\YZTAhackathon2026-feature-frontend-update\lojistik-dashboard"
npm run dev
```

- Çalışır: http://localhost:3000

## MCP Server (Arkadaşın agent'ı için) — Terminal 3

```powershell
cd "c:\Users\W-11\Desktop\hackathon\YZTAhackathon2026"
.\venv\Scripts\python.exe mcp_server/server.py
```

- stdio transport ile çalışır
- Araçlar: `query_orders`, `query_inventory`, `query_products`, `query_customers`, `get_order_summary`, `get_stock_summary`
- Claude Code'dan bağlanmak için: `claude mcp add smartops -- python mcp_server/server.py`

## Paket Kurma (yeni paket gerekirse)

```powershell
& "c:\Users\W-11\Desktop\hackathon\YZTAhackathon2026\venv\Scripts\python.exe" -m pip install <paket>
```

## Notlar

- Backend `.env` dosyası: `backend/YZTAhackathon2026-feature-database-setup/.env`
  - `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY` olmalı
- `venv` proje kökünde: `c:\Users\W-11\Desktop\hackathon\YZTAhackathon2026\venv`
- Tüm terminaller aynı anda açık olmalı
