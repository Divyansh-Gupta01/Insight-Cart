import pandas as pd


def get_sales_summary(df: pd.DataFrame) -> dict:
    total_gross = df["gross_sales"].sum()
    total_net = df["net_sales"].sum()
    total_discount = df["discount_amount"].sum()
    total_units = df["quantity_sold"].sum()
    total_transactions = len(df)
    avg_order_value = total_net / total_transactions if total_transactions > 0 else 0
    total_profit = df["profit_amount"].sum() if "profit_amount" in df.columns else None
    total_tax = df["tax"].sum() if "tax" in df.columns else None

    return {
        "total_gross_sales": round(total_gross, 2),
        "total_net_sales": round(total_net, 2),
        "total_discount_given": round(total_discount, 2),
        "total_units_sold": int(total_units),
        "total_transactions": total_transactions,
        "avg_order_value": round(avg_order_value, 2),
        "total_profit": round(total_profit, 2) if total_profit else "N/A",
        "total_tax_collected": round(total_tax, 2) if total_tax else "N/A",
    }


def get_daily_trend(df: pd.DataFrame) -> list:
    trend = (
        df.groupby("date")
        .agg(
            net_sales=("net_sales", "sum"),
            gross_sales=("gross_sales", "sum"),
            profit=("profit_amount", "sum"),
            transactions=("bill_number", "count"),
        )
        .reset_index()
    )

    trend["date"] = trend["date"].astype(str)
    trend = trend.round(2)
    return trend.to_dict(orient="records")


def get_top_categories(df: pd.DataFrame, top_n: int = 5) -> list:
    top = (
        df.groupby("category")
        .agg(
            total_net_sales=("net_sales", "sum"),
            total_units_sold=("quantity_sold", "sum"),
            total_profit=("profit_amount", "sum"),
            total_discount=("discount_amount", "sum"),
            avg_selling_price=("selling_price", "mean"),
            transactions=("bill_number", "nunique"),
        )
        .reset_index()
    )

    top["profit_margin_pct"] = top["total_profit"] / top["total_net_sales"] * 100

    top["avg_sale_per_transaction"] = top["total_net_sales"] / top["transactions"]

    top = top.sort_values("total_net_sales", ascending=False).head(top_n).round(2)

    return top.to_dict(orient="records")


def give_top_categories(df: pd.DataFrame, top_n: int = 5) -> pd.DataFrame:
    top = (
        df.groupby("category")
        .agg(
            total_net_sales=("net_sales", "sum"),
            total_units_sold=("quantity_sold", "sum"),
            total_profit=("profit_amount", "sum"),
            total_discount=("discount_amount", "sum"),
            avg_selling_price=("selling_price", "mean"),
            transactions=("bill_number", "nunique"),
        )
        .reset_index()
    )

    top["profit_margin_pct"] = top["total_profit"] / top["total_net_sales"] * 100

    top["avg_sale_per_transaction"] = top["total_net_sales"] / top["transactions"]

    top = top.sort_values("total_net_sales", ascending=False).head(top_n).round(2)

    return top


def get_top_product_in_top_categories(df: pd.DataFrame) -> list:

    # Top 5 categories by sales
    top_categories = (
        df.groupby("category")["net_sales"]
        .sum()
        .sort_values(ascending=False)
        .head(5)
        .index
    )

    results = []

    for category in top_categories:

        top_product = (
            df[df["category"] == category]
            .groupby("product_name")
            .agg(
                total_net_sales=("net_sales", "sum"),
                total_profit=("profit_amount", "sum"),
                total_units_sold=("quantity_sold", "sum"),
            )
            .sort_values("total_net_sales", ascending=False)
            .head(1)
        )

        results.append(
            {
                "category": category,
                "top_product": top_product.index[0],
                "total_net_sales": round(top_product.iloc[0]["total_net_sales"], 2),
                "total_profit": round(top_product.iloc[0]["total_profit"], 2),
                "total_units_sold": int(top_product.iloc[0]["total_units_sold"]),
            }
        )

    return results


def get_profit_margin_by_category(df: pd.DataFrame) -> list:
    grouped = (
        df.groupby("category")
        .agg(
            total_net_sales=("net_sales", "sum"), total_profit=("profit_amount", "sum")
        )
        .reset_index()
    )

    grouped["profit_margin_%"] = (
        (grouped["total_profit"] / grouped["total_net_sales"]) * 100
    ).round(2)

    grouped = grouped.sort_values("profit_margin_%", ascending=False)
    grouped = grouped.round(2)
    return grouped.to_dict(orient="records")


def get_discount_impact(df: pd.DataFrame) -> list:
    impact = (
        df.groupby("category")
        .agg(
            total_discount=("discount_amount", "sum"),
            total_gross=("gross_sales", "sum"),
            total_profit=("profit_amount", "sum"),
        )
        .reset_index()
    )

    impact["discount_rate_%"] = (
        (impact["total_discount"] / impact["total_gross"]) * 100
    ).round(2)

    impact = impact.sort_values("discount_rate_%", ascending=False).round(2)
    return impact.to_dict(orient="records")
    # [{"category": "Snacks", "discount_rate_%": 18.4, "total_discount": 3400}, ...]


def get_slow_movers(df: pd.DataFrame, days: int = 14, threshold: int = 5) -> list:
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    latest_date = df["date"].max()
    cutoff = latest_date - pd.Timedelta(days=days)
    recent = df[df["date"] >= cutoff]

    recent_sales = recent.groupby("category")["quantity_sold"].sum()
    all_categories = df["category"].unique()

    slow = []
    for cat in all_categories:
        units = int(recent_sales.get(cat, 0))
        if units < threshold:
            slow.append(
                {
                    "category": cat,
                    "units_sold_last_14_days": units,
                    "status": "dead stock" if units == 0 else "slow moving",
                }
            )

    return sorted(slow, key=lambda x: x["units_sold_last_14_days"])


def get_payment_mode_breakdown(df: pd.DataFrame) -> list:
    breakdown = (
        df.groupby("payment_mode")
        .agg(
            transactions=("bill_number", "nunique"),
            total_net_sales=("net_sales", "sum"),
        )
        .reset_index()
    )

    total = breakdown["transactions"].sum()
    breakdown["usage_%"] = ((breakdown["transactions"] / total) * 100).round(2)
    breakdown = breakdown.sort_values("transactions", ascending=False).round(2)

    return breakdown.to_dict(orient="records")
    # [{"payment_mode": "upi", "transactions": 340, "usage_%": 45.2}, ...]


# services/analytics.py
