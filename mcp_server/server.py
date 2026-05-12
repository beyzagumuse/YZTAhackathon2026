"""
SmartOps MCP Server
Supabase veritabanını sorgulayan araçlar sağlar.
Bağlanmak için: mcp install mcp_server/server.py
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Backend .env dosyasını yükle
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / "backend" / "YZTAhackathon2026-feature-database-setup" / ".env"
load_dotenv(ENV_PATH)

from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("SmartOps ERP")


@mcp.tool()
def query_orders(status: str = None, customer_id: str = None, limit: int = 20) -> list:
    """
    Sipariş tablosunu sorgular.
    status: 'pending' | 'shipped' | 'delivered' (opsiyonel filtre)
    customer_id: belirli bir müşterinin siparişleri (opsiyonel)
    limit: kaç sipariş döneceği (varsayılan 20)
    """
    query = supabase.table("orders").select("*, order_items(*, products(name, price))")
    if status:
        query = query.eq("status", status)
    if customer_id:
        query = query.eq("customer_id", customer_id)
    res = query.order("created_at", desc=True).limit(limit).execute()
    return res.data


@mcp.tool()
def query_inventory(low_stock_only: bool = False) -> list:
    """
    Envanter/stok durumunu sorgular.
    low_stock_only: True ise sadece stoku 20 veya altındaki ürünleri döner.
    """
    res = supabase.table("inventory").select("*, products(name, price)").execute()
    items = res.data or []
    if low_stock_only:
        items = [i for i in items if (i.get("quantity") or 0) <= 20]
    return items


@mcp.tool()
def query_products(search: str = None, limit: int = 50) -> list:
    """
    Ürün kataloğunu sorgular.
    search: ürün adında arama (opsiyonel)
    """
    query = supabase.table("products").select("*")
    if search:
        query = query.ilike("name", f"%{search}%")
    res = query.limit(limit).execute()
    return res.data


@mcp.tool()
def query_customers(limit: int = 30) -> list:
    """
    Kayıtlı müşteri profillerini sorgular.
    """
    res = supabase.table("profiles").select("id, full_name, address, created_at").limit(limit).execute()
    return res.data


@mcp.tool()
def get_order_summary() -> dict:
    """
    Sipariş durumlarının özet sayımını döner: kaç pending, shipped, delivered var.
    """
    orders = supabase.table("orders").select("status").execute().data or []
    summary = {"pending": 0, "shipped": 0, "delivered": 0, "total": len(orders)}
    for o in orders:
        s = o.get("status", "")
        if s in summary:
            summary[s] += 1
    return summary


@mcp.tool()
def get_stock_summary() -> dict:
    """
    Stok durumunun özetini döner: kaç ürün kritik (<= 5), düşük (6-20), normal (> 20).
    """
    items = supabase.table("inventory").select("quantity, products(name)").execute().data or []
    critical = [i for i in items if (i.get("quantity") or 0) <= 5]
    low = [i for i in items if 5 < (i.get("quantity") or 0) <= 20]
    normal = [i for i in items if (i.get("quantity") or 0) > 20]
    return {
        "total_products": len(items),
        "critical_count": len(critical),
        "low_count": len(low),
        "normal_count": len(normal),
        "critical_products": [{"name": i.get("products", {}).get("name"), "quantity": i.get("quantity")} for i in critical],
    }


if __name__ == "__main__":
    mcp.run()
