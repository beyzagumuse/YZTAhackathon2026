from app.core.supabase_client import supabase_client
from fastapi import HTTPException
from datetime import datetime, timezone
import math

SEGMENTS = {
    "Champions":  {"label": "Şampiyonlar",        "color": "#7c3aed"},
    "Loyal":      {"label": "Sadık Müşteriler",    "color": "#2563eb"},
    "Potential":  {"label": "Potansiyel Sadıklar", "color": "#0891b2"},
    "At Risk":    {"label": "Risk Altında",         "color": "#f59e0b"},
    "Lost":       {"label": "Kayıp Müşteriler",     "color": "#ef4444"},
    "New":        {"label": "Yeni Müşteriler",      "color": "#10b981"},
    "Others":     {"label": "Diğer",                "color": "#94a3b8"},
}


def _rank_scores(values: list, reverse: bool = False) -> list:
    """Map values to 1-4 scores by relative rank. reverse=True means lower value → higher score."""
    n = len(values)
    if n == 0:
        return []
    indexed = sorted(enumerate(values), key=lambda x: x[1], reverse=reverse)
    scores = [0] * n
    for rank, (idx, _) in enumerate(indexed):
        scores[idx] = min(4, max(1, math.ceil((rank + 1) / n * 4)))
    return scores


def _assign_segment(r: int, f: int, m: int) -> str:
    if r >= 3 and f >= 3 and m >= 3:
        return "Champions"
    if f >= 3 or m >= 3:
        return "Loyal"
    if r >= 3 and f == 1:
        return "New"
    if r >= 3:
        return "Potential"
    if r <= 2 and f >= 2:
        return "At Risk"
    if r == 1:
        return "Lost"
    return "Others"


async def get_rfm():
    try:
        orders = supabase_client.table("orders").select("customer_id, total_amount, created_at").execute().data or []
        profiles = supabase_client.table("profiles").select("id, full_name, email").execute().data or []
        profile_map = {p["id"]: p for p in profiles}

        customer_data: dict = {}
        for o in orders:
            cid = o.get("customer_id")
            if not cid or cid not in profile_map:
                continue
            if cid not in customer_data:
                customer_data[cid] = {"dates": [], "total": 0.0}
            customer_data[cid]["dates"].append(o["created_at"])
            customer_data[cid]["total"] += float(o.get("total_amount") or 0)

        if not customer_data:
            return {"customers": [], "segments": []}

        now = datetime.now(timezone.utc)
        rows = []
        for cid, data in customer_data.items():
            last = max(data["dates"])
            try:
                dt = datetime.fromisoformat(last.replace("Z", "+00:00"))
                recency_days = max(0, (now - dt).days)
            except Exception:
                recency_days = 999
            rows.append({
                "customer_id": cid,
                "name": profile_map[cid].get("full_name") or profile_map[cid].get("email", "?").split("@")[0],
                "email": profile_map[cid].get("email", ""),
                "recency_days": recency_days,
                "frequency": len(data["dates"]),
                "monetary": round(data["total"], 2),
            })

        recency_vals = [r["recency_days"] for r in rows]
        freq_vals    = [r["frequency"]     for r in rows]
        mon_vals     = [r["monetary"]      for r in rows]

        r_scores = _rank_scores(recency_vals, reverse=True)   # lower days = higher score
        f_scores = _rank_scores(freq_vals)
        m_scores = _rank_scores(mon_vals)

        customers = []
        segment_counts: dict = {}
        for i, row in enumerate(rows):
            r, f, m = r_scores[i], f_scores[i], m_scores[i]
            seg = _assign_segment(r, f, m)
            segment_counts[seg] = segment_counts.get(seg, 0) + 1
            customers.append({
                **row,
                "r_score": r,
                "f_score": f,
                "m_score": m,
                "rfm_score": r + f + m,
                "segment": seg,
                "segment_label": SEGMENTS[seg]["label"],
                "segment_color": SEGMENTS[seg]["color"],
            })

        customers.sort(key=lambda x: x["rfm_score"], reverse=True)

        segments = [
            {
                "key": k,
                "label": SEGMENTS[k]["label"],
                "color": SEGMENTS[k]["color"],
                "count": segment_counts.get(k, 0),
            }
            for k in SEGMENTS
            if segment_counts.get(k, 0) > 0
        ]

        return {"customers": customers, "segments": segments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
