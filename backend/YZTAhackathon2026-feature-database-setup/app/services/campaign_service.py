from app.services.rfm_service import get_rfm
from app.services.recommendation_service import get_recommendations
from fastapi import HTTPException

TEMPLATES = {
    "Champions": {
        "title": "🏆 VIP Sadakat Programı",
        "description": "En değerli müşterilerinize özel ayrıcalıklar sunun.",
        "offer": "%10 Cashback",
        "message": "Sizi tanıdık, bize özelsiniz! Her alışverişinizde %10 geri ödeme kazanın.",
        "color": "#7c3aed",
    },
    "Loyal": {
        "title": "💎 Çapraz Satış Kampanyası",
        "description": "Sadık müşterilere tamamlayıcı ürünler önerin.",
        "offer": "Bundle İndirimi",
        "message": "Sevdiğiniz ürünlerin yanında bunları da denediniz mi?",
        "color": "#2563eb",
    },
    "Potential": {
        "title": "🌱 Sadakat Teşvik Kampanyası",
        "description": "Potansiyel sadık müşterileri kazanın.",
        "offer": "%15 İndirim Kuponu",
        "message": "Bir sonraki alışverişinizde %15 indirim sizi bekliyor!",
        "color": "#0891b2",
    },
    "At Risk": {
        "title": "⚠️ Geri Kazanım Kampanyası",
        "description": "Uzaklaşmakta olan müşterileri geri çekin.",
        "offer": "%20 Özel İndirim",
        "message": "Sizi özledik! Size özel %20 indirimle geri dönün.",
        "color": "#f59e0b",
    },
    "Lost": {
        "title": "😴 Yeniden Aktivasyon",
        "description": "Kaybedilen müşterilere çarpıcı teklifler sunun.",
        "offer": "%25 + Ücretsiz Kargo",
        "message": "Uzun zamandır görüşemedik. %25 indirim + ücretsiz kargo ile tekrar alışveriş yapın.",
        "color": "#ef4444",
    },
    "New": {
        "title": "🆕 Hoşgeldin Paketi",
        "description": "Yeni müşterileri sadık hale getirin.",
        "offer": "İlk 3 Alışverişe %10 İndirim",
        "message": "Aramıza hoş geldiniz! İlk 3 alışverişinizde %10 indirim kazanın.",
        "color": "#10b981",
    },
    "Others": {
        "title": "📢 Genel Promosyon",
        "description": "Genel müşteri kitlesine promosyon gönderin.",
        "offer": "%5 İndirim",
        "message": "Yeni ürünlerimizi keşfedin, size özel %5 indirimden yararlanın.",
        "color": "#94a3b8",
    },
}


async def get_campaigns():
    try:
        rfm_data, rec_data = await get_rfm(), await get_recommendations()

        rules = rec_data.get("rules", [])
        top_recommended = []
        seen: set = set()
        for r in rules:
            prod = r["then_product"]
            if prod not in seen:
                top_recommended.append(prod)
                seen.add(prod)
            if len(top_recommended) >= 5:
                break

        seg_customers: dict = {}
        for c in rfm_data["customers"]:
            seg_customers.setdefault(c["segment"], []).append(c)

        campaigns = []
        for seg_key, customers in seg_customers.items():
            tmpl = TEMPLATES.get(seg_key, TEMPLATES["Others"])
            campaigns.append({
                "segment": seg_key,
                "title": tmpl["title"],
                "description": tmpl["description"],
                "offer": tmpl["offer"],
                "message": tmpl["message"],
                "color": tmpl["color"],
                "customer_count": len(customers),
                "sample_customers": [
                    {"name": c["name"], "email": c["email"], "monetary": c["monetary"]}
                    for c in sorted(customers, key=lambda x: x["rfm_score"], reverse=True)[:5]
                ],
                "recommended_products": top_recommended[:3],
            })

        campaigns.sort(key=lambda x: x["customer_count"], reverse=True)

        return {
            "campaigns": campaigns,
            "total_customers": len(rfm_data["customers"]),
            "recommendation_method": rec_data.get("method", "unknown"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
