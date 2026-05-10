#!/usr/bin/env python3
"""
Database seed script.

Sources:
  datasets/sales.xlsx       -> products, profiles, orders, order_items
  datasets/supply_chain.csv -> inventory quantities, inventory_logs

Requires SUPABASE_SERVICE_KEY in .env (service role key, not the publishable key).
Find it in: Supabase Dashboard > Settings > API > service_role
"""

import os
import sys
import uuid
import random
from datetime import datetime, timedelta

import pandas as pd

# Allow imports from project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client

def _make_client():
    service_key = os.getenv("SUPABASE_SERVICE_KEY", "").strip()
    url = os.getenv("SUPABASE_URL", "").replace("/rest/v1", "").strip("/")
    if not service_key:
        print("ERROR: SUPABASE_SERVICE_KEY is not set in .env")
        print("  Go to Supabase Dashboard > Settings > API > service_role")
        print("  Copy the key and paste it as SUPABASE_SERVICE_KEY=<key> in .env")
        sys.exit(1)
    return create_client(url, service_key)

db = _make_client()

# ── Limits ────────────────────────────────────────────────────────────────────
PRODUCTS_LIMIT  = 80
CUSTOMERS_LIMIT = 30
ORDERS_LIMIT    = 200
CARRIERS = ["MNG Kargo", "Yurtici Kargo", "Aras Kargo", "PTT Kargo", "Surat Kargo"]

# ── Helpers ───────────────────────────────────────────────────────────────────

def make_tc_no(seed_val: int) -> str:
    rng = random.Random(seed_val)
    digits = [str(rng.randint(1, 9))] + [str(rng.randint(0, 9)) for _ in range(10)]
    return "".join(digits)


def batch_insert(table: str, rows: list, batch_size: int = 100) -> int:
    inserted = 0
    for i in range(0, len(rows), batch_size):
        try:
            db.table(table).insert(rows[i:i + batch_size]).execute()
            inserted += len(rows[i:i + batch_size])
        except Exception as e:
            print(f"    [warn] batch {i // batch_size} into {table}: {e}")
    return inserted


# ── Step 1: Products ──────────────────────────────────────────────────────────

def seed_products(sales: pd.DataFrame) -> pd.DataFrame:
    top_codes = sales["ITEMCODE"].value_counts().head(PRODUCTS_LIMIT).index
    df = (
        sales[sales["ITEMCODE"].isin(top_codes)]
        .drop_duplicates("ITEMCODE")[["ITEMCODE", "ITEMNAME", "BRAND", "CATEGORY_NAME1", "PRICE"]]
        .reset_index(drop=True)
        .copy()
    )
    df["id"] = [str(uuid.uuid4()) for _ in range(len(df))]
    df["PRICE"] = df["PRICE"].fillna(1.0)

    rows = []
    for _, r in df.iterrows():
        brand = str(r["BRAND"]) if pd.notna(r["BRAND"]) else ""
        cat   = str(r["CATEGORY_NAME1"]) if pd.notna(r["CATEGORY_NAME1"]) else ""
        desc  = " - ".join(filter(None, [brand, cat])) or None
        rows.append({
            "id":          r["id"],
            "name":        str(r["ITEMNAME"]),
            "description": desc,
            "price":       round(float(r["PRICE"]), 2),
        })

    n = batch_insert("products", rows)
    print(f"  OK: {n} products inserted")
    return df


# ── Step 2: Inventory ─────────────────────────────────────────────────────────

def seed_inventory(products: pd.DataFrame, supply: pd.DataFrame):
    supply["Date"] = pd.to_datetime(supply["Date"])
    latest = (
        supply.sort_values("Date")
        .groupby("SKU_ID")
        .last()
        .reset_index()
    )

    rows = []
    for i, (_, prod) in enumerate(products.iterrows()):
        qty = int(latest.iloc[i % len(latest)]["Inventory_Level"])
        rows.append({"product_id": prod["id"], "quantity": qty})

    n = batch_insert("inventory", rows)
    print(f"  OK: inventory set for {n} products")


# ── Step 3: Inventory logs ────────────────────────────────────────────────────

def seed_inventory_logs(products: pd.DataFrame, supply: pd.DataFrame):
    supply["Date"] = pd.to_datetime(supply["Date"])
    cutoff = supply["Date"].max() - timedelta(days=30)
    recent = supply[supply["Date"] >= cutoff].copy()

    product_ids = products["id"].tolist()

    def sku_to_idx(sku: str) -> int:
        try:
            return int(sku.replace("SKU_", "")) - 1
        except ValueError:
            return -1

    logs = []
    for _, r in recent.iterrows():
        idx = sku_to_idx(str(r["SKU_ID"]))
        if idx < 0 or idx >= len(product_ids):
            continue
        pid = product_ids[idx]
        date_str = r["Date"].strftime("%Y-%m-%d")

        if r["Units_Sold"] > 0:
            logs.append({
                "product_id":    pid,
                "change_amount": -int(r["Units_Sold"]),
                "reason":        f"Gunluk satis ({date_str})",
            })
        if r["Order_Quantity"] > 0:
            logs.append({
                "product_id":    pid,
                "change_amount": int(r["Order_Quantity"]),
                "reason":        f"Tedarikci girisi - {r['Supplier_ID']} ({date_str})",
            })

    n = batch_insert("inventory_logs", logs)
    print(f"  OK: {n} inventory log entries inserted")


# ── Step 4: Customer profiles ─────────────────────────────────────────────────

def seed_profiles(sales: pd.DataFrame) -> dict:
    valid = sales[sales["CLIENTCODE"].astype(str).str.match(r"^\d+\.?\d*$")].dropna(subset=["CLIENTNAME"])
    top_codes = valid["CLIENTCODE"].value_counts().head(CUSTOMERS_LIMIT).index
    df = (
        valid[valid["CLIENTCODE"].isin(top_codes)]
        .drop_duplicates("CLIENTCODE")[["CLIENTCODE", "CLIENTNAME"]]
        .reset_index(drop=True)
        .copy()
    )

    rows = []
    profile_map: dict = {}

    for _, r in df.iterrows():
        code      = int(float(r["CLIENTCODE"]))
        user_id   = str(uuid.uuid4())
        tc_no     = make_tc_no(code)
        full_name = str(r["CLIENTNAME"])

        rows.append({"id": user_id, "tc_no": tc_no, "full_name": full_name})
        profile_map[str(code)] = user_id

    n = batch_insert("profiles", rows)
    print(f"  OK: {n} customer profiles inserted")
    return profile_map


# ── Step 5: Orders + order_items + shipping ───────────────────────────────────

def seed_orders(sales: pd.DataFrame, profile_map: dict, products: pd.DataFrame):
    code_to_id  = dict(zip(products["ITEMCODE"].astype(str), products["id"]))
    valid_sales = sales[sales["ITEMCODE"].isin(products["ITEMCODE"])].copy()
    valid_sales = valid_sales[
        valid_sales["CLIENTCODE"].astype(str).str.match(r"^\d+\.?\d*$")
    ]
    valid_sales = valid_sales[
        valid_sales["CLIENTCODE"].astype(float).astype(int).astype(str).isin(profile_map.keys())
    ]

    fichenums = valid_sales["FICHENO"].value_counts().head(ORDERS_LIMIT * 3).index

    orders_ok = 0
    shipping_rows = []

    for ficheno in fichenums:
        if orders_ok >= ORDERS_LIMIT:
            break

        invoice    = valid_sales[valid_sales["FICHENO"] == ficheno]
        client_key = str(int(float(invoice.iloc[0]["CLIENTCODE"])))
        if client_key not in profile_map:
            continue

        customer_id = profile_map[client_key]
        order_date  = pd.to_datetime(invoice.iloc[0]["DATE_"]).isoformat()

        items = []
        total = 0.0
        for _, row in invoice.iterrows():
            pid = code_to_id.get(str(row["ITEMCODE"]))
            if not pid:
                continue
            qty   = max(1, int(row["AMOUNT"]))
            price = round(float(row["PRICE"]), 2)
            items.append({
                "product_id":         pid,
                "quantity":           qty,
                "unit_price_at_sale": price,
            })
            total += qty * price

        if not items:
            continue

        ratio = orders_ok / ORDERS_LIMIT
        if ratio < 0.35:
            status = "delivered"
        elif ratio < 0.65:
            status = "shipped"
        else:
            status = "pending"

        order_id = str(uuid.uuid4())

        try:
            db.table("orders").insert({
                "id":           order_id,
                "customer_id":  customer_id,
                "total_amount": round(total, 2),
                "status":       status,
                "created_at":   order_date,
            }).execute()
        except Exception as e:
            print(f"    [warn] order {ficheno}: {e}")
            continue

        for item in items:
            item["order_id"] = order_id
        try:
            db.table("order_items").insert(items).execute()
        except Exception as e:
            print(f"    [warn] order_items {ficheno}: {e}")

        if status in ("shipped", "delivered"):
            shipping_rows.append({
                "order_id":           order_id,
                "carrier_name":       random.choice(CARRIERS),
                "tracking_number":    f"TRK{random.randint(1_000_000, 9_999_999)}",
                "status":             "delivered" if status == "delivered" else "in_transit",
                "estimated_delivery": (
                    datetime.now() + timedelta(days=random.randint(1, 5))
                ).strftime("%Y-%m-%d"),
            })

        orders_ok += 1

    n_ship = batch_insert("shipping", shipping_rows)
    print(f"  OK: {orders_ok} orders  |  {n_ship} shipping records")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("Loading datasets...")
    sales  = pd.read_excel("datasets/sales.xlsx")
    supply = pd.read_csv("datasets/supply_chain.csv")
    print(f"  sales: {len(sales):,} rows  |  supply_chain: {len(supply):,} rows")

    print("\n1. Products")
    products = seed_products(sales)

    print("\n2. Inventory")
    seed_inventory(products, supply)

    print("\n3. Inventory logs")
    seed_inventory_logs(products, supply)

    print("\n4. Customer profiles")
    profile_map = seed_profiles(sales)

    print("\n5. Orders, order items, shipping")
    seed_orders(sales, profile_map, products)

    print("\nSeeding complete.")


if __name__ == "__main__":
    main()
