# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-driven ERP (Enterprise Resource Planning) system for SMEs, built as a FastAPI backend with Supabase (PostgreSQL) as the database and auth provider. 

## Commands

### Run the server
```bash
uvicorn main:app --reload
```

### Install dependencies
```bash
pip install -r requirements.txt
```

### Environment setup
Requires a `.env` file with:
```
SUPABASE_URL=...
SUPABASE_KEY=...
```

## Architecture

**Layered 3-tier structure, organized by domain:**

- `main.py` — FastAPI app entry point; registers all routers, CORS middleware, and a global Supabase error handler
- `app/core/` — Config (loads env vars) and Supabase singleton client
- `app/api/` — Route handlers; thin layer, delegates to services
- `app/services/` — Business logic and all Supabase queries
- `app/models/schemas.py` — All Pydantic request/response schemas

**Routers registered in `main.py`:**

| Prefix | Module | Responsibility |
|--------|--------|----------------|
| `/auth` | auth | Signup, login, shadow profiles |
| `/products` | products | Product CRUD |
| `/inventory` | inventory | Stock levels + audit logs |
| `/orders` | orders | Order creation + status tracking |
| `/profiles` | profiles | User profile management |
| `/shadow-profiles` | shadow_profiles | Anonymous session tracking |
| `/shipping` | shipping | Shipping record management |

## Key Domain Rules

- **Inventory:** Orders automatically deduct stock; negative inventory is blocked; all stock changes are recorded in `inventory_logs`
- **Orders → Shipping:** When an order's status changes to `"shipped"`, a shipping record is auto-created
- **Profiles:** `email` and `tc_no` (Turkish national ID) are immutable after creation
- **Password policy:** Min 8 chars, must include uppercase, lowercase, digit, and special character
- **TC No:** Must be exactly 11 digits

## Database Tables (Supabase)

`profiles`, `products`, `inventory`, `inventory_logs`, `orders`, `order_items`, `shipping`, `shadow_profiles`

All database interactions go through the Supabase Python client (`app/core/supabase_client.py`), not raw SQL.

## Project Theme and Definition

Project scenarios, constraints and requirements are defined in `Temalar.docx` file in the project route.