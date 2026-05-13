from app.core.supabase_client import supabase_client
from fastapi import HTTPException
from collections import defaultdict


async def get_recommendations():
    try:
        items = (
            supabase_client.table("order_items")
            .select("order_id, products(name)")
            .execute()
            .data or []
        )

        baskets: dict = defaultdict(set)
        for item in items:
            oid = item.get("order_id")
            name = (item.get("products") or {}).get("name")
            if oid and name:
                baskets[oid].add(name)

        transactions = [list(v) for v in baskets.values() if len(v) >= 2]
        n_baskets = len(baskets)

        if len(transactions) >= 10:
            result = _apriori(transactions, n_baskets)
            if result:
                return {"rules": result, "method": "apriori", "basket_count": n_baskets}

        return {
            "rules": _co_occurrence(baskets),
            "method": "co_occurrence",
            "basket_count": n_baskets,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _apriori(transactions: list, n_baskets: int) -> list:
    try:
        import pandas as pd
        from mlxtend.preprocessing import TransactionEncoder
        from mlxtend.frequent_patterns import apriori, association_rules

        te = TransactionEncoder()
        te_array = te.fit(transactions).transform(transactions)
        df = pd.DataFrame(te_array, columns=te.columns_)

        min_support = max(0.03, 4 / n_baskets)
        frequent = apriori(df, min_support=min_support, use_colnames=True, max_len=2)
        if frequent.empty:
            return []

        rules = association_rules(frequent, metric="confidence", min_threshold=0.2)
        if rules.empty:
            return []

        rules = rules.sort_values("lift", ascending=False).head(20)
        result = []
        for _, row in rules.iterrows():
            ant = list(row["antecedents"])[0]
            con = list(row["consequents"])[0]
            result.append({
                "if_product": ant,
                "then_product": con,
                "confidence": round(float(row["confidence"]), 2),
                "lift": round(float(row["lift"]), 2),
                "support": round(float(row["support"]), 3),
            })
        return result
    except Exception:
        return []


def _co_occurrence(baskets: dict) -> list:
    co: dict = defaultdict(int)
    item_count: dict = defaultdict(int)
    n = len(baskets)

    for items in baskets.values():
        items = list(items)
        for item in items:
            item_count[item] += 1
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                pair = tuple(sorted([items[i], items[j]]))
                co[pair] += 1

    rules = []
    for (a, b), count in sorted(co.items(), key=lambda x: x[1], reverse=True)[:20]:
        conf_ab = count / item_count[a] if item_count[a] else 0
        conf_ba = count / item_count[b] if item_count[b] else 0
        support = count / n if n else 0

        if conf_ab >= conf_ba:
            lift = conf_ab / (item_count[b] / n) if item_count[b] and n else 1.0
            rules.append({
                "if_product": a, "then_product": b,
                "confidence": round(conf_ab, 2),
                "lift": round(lift, 2),
                "support": round(support, 3),
            })
        else:
            lift = conf_ba / (item_count[a] / n) if item_count[a] and n else 1.0
            rules.append({
                "if_product": b, "then_product": a,
                "confidence": round(conf_ba, 2),
                "lift": round(lift, 2),
                "support": round(support, 3),
            })

    return rules[:15]
