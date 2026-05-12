"""
supply_chain.csv'deki ilk 100 satırın Reorder_Point değerlerini
inventory tablosundaki safety_stock kolonuna yazar.
"""
import csv
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend", "YZTAhackathon2026-feature-database-setup"))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "backend", "YZTAhackathon2026-feature-database-setup", ".env"))

from app.core.supabase_client import supabase_client

csv_path = os.path.join(os.path.dirname(__file__), "datasets", "supply_chain.csv")

reorder_points = []
with open(csv_path, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        if i >= 100:
            break
        reorder_points.append(int(float(row["Reorder_Point"])))

print(f"CSV'den {len(reorder_points)} reorder_point değeri okundu.")

inv = supabase_client.table("inventory").select("product_id").execute().data
print(f"Inventory'de {len(inv)} kayıt bulundu.")

if not inv:
    print("Inventory boş, çıkılıyor.")
    sys.exit(1)

for i, item in enumerate(inv):
    safety = reorder_points[i % len(reorder_points)]
    supabase_client.table("inventory").update({"safety_stock": safety}).eq("product_id", item["product_id"]).execute()
    print(f"  {item['product_id'][:8]}... -> safety_stock={safety}")

print("Tamamlandı.")
