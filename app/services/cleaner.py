import pandas as pd
import numpy as np

df = pd.read_csv("././data/cart_insight_supermarket_2025_profit_tax.csv")

df.drop_duplicates(subset=["transaction_id"], inplace=True)

df["date"] = pd.to_datetime(df["date"], errors="coerce")
df = df.dropna(subset=["date"])

df["day_name_check"] = df["date"].dt.strftime("%A")
mismatch = df[df["day_name"] != df["day_name_check"]]
print(f"Day name mismatches: {len(mismatch)}")  # should be 0

df["gross_check"] = (df["quantity_sold"] * df["mrp"]).round(2)
df["gross_error"] = abs(df["gross_sales"] - df["gross_check"]) > 0.05
print(f"Gross sales errors: {df['gross_error'].sum()}")

df["net_check"] = (df["gross_sales"] - df["discount_amount"]).round(2)
df["net_error"] = abs(df["net_sales"] - df["net_check"]) > 0.05
print(f"Net sales errors: {df['net_error'].sum()}")

df["stock_check"] = df["stock_before_sale"] - df["quantity_sold"]
df["stock_error"] = df["stock_after_sale"] != df["stock_check"]
print(f"Stock logic errors: {df['stock_error'].sum()}")

print(df[df["quantity_sold"] <= 0])  # should be empty
print(df[df["mrp"] < df["selling_price"]])  # MRP < selling price = problem


print(df.isnull().sum())

df["payment_mode"] = df["payment_mode"].str.lower().str.strip()
df["category"] = df["category"].str.strip()
df["gender"] = df["gender"].str.lower().str.strip()

df["low_stock_check"] = (df["stock_after_sale"] < df["reorder_level"]).astype(int)
df["low_stock_error"] = df["low_stock_flag"] != df["low_stock_check"]
print(f"Low stock flag errors: {df['low_stock_error'].sum()}")

df.drop(
    columns=[
        "gross_check",
        "net_check",
        "stock_check",
        "day_name_check",
        "gross_error",
        "net_error",
        "stock_error",
        "low_stock_check",
        "low_stock_error",
    ],
    inplace=True,
)

print("\n Clean shape:", df.shape)
