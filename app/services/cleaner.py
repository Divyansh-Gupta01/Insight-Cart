from pathlib import Path
import pandas as pd

from pathlib import Path


def load_and_clean(filename: str) -> pd.DataFrame:
    project_root = Path(__file__).resolve().parents[2]
    filepath = project_root / "data" / filename
    print(filepath)

    df = pd.read_csv(filepath, low_memory=False)
    df["festival_season"] = df["festival_season"].astype("string")

    # Standardize column names
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

    # Remove duplicates
    before = len(df)
    df.drop_duplicates(subset=["transaction_id"], inplace=True)
    print(f"Duplicates removed: {before - len(df)}")

    # Parse and validate dates
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])

    # Force numeric types (catches string-number columns
    numeric_cols = [
        "quantity_sold",
        "mrp",
        "selling_price",
        "discount_amount",
        "gross_sales",
        "net_sales",
        "stock_before_sale",
        "stock_after_sale",
        "reorder_level",
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=numeric_cols)

    # Drop invalid business rows
    before = len(df)
    df = df[df["quantity_sold"] > 0]
    df = df[df["mrp"] >= df["selling_price"]]
    print(f"Invalid business rows removed: {before - len(df)}")

    #  Cross-validation checks
    # Day name check
    df["day_name_check"] = df["date"].dt.strftime("%A")
    mismatch = df[df["day_name"] != df["day_name_check"]]
    print(f"Day name mismatches: {len(mismatch)}")
    df = df[df["day_name"] == df["day_name_check"]]

    # Gross sales check
    df["gross_check"] = (df["quantity_sold"] * df["mrp"]).round(2)
    gross_errors = abs(df["gross_sales"] - df["gross_check"]) > 0.05
    print(f"Gross sales errors removed: {gross_errors.sum()}")
    df = df[~gross_errors]

    # Net sales check
    df["net_check"] = (df["gross_sales"] - df["discount_amount"]).round(2)
    net_errors = abs(df["net_sales"] - df["net_check"]) > 0.05
    print(f"Net sales errors removed: {net_errors.sum()}")
    df = df[~net_errors]

    # Stock logic check
    df["stock_check"] = df["stock_before_sale"] - df["quantity_sold"]
    stock_errors = df["stock_after_sale"] != df["stock_check"]
    print(f"Stock logic errors removed: {stock_errors.sum()}")
    df = df[~stock_errors]

    # Low stock flag check
    df["low_stock_check"] = (df["stock_after_sale"] < df["reorder_level"]).astype(int)
    low_stock_errors = df["low_stock_flag"] != df["low_stock_check"]
    print(f"Low stock flag errors removed: {low_stock_errors.sum()}")
    df = df[~low_stock_errors]

    # Standardize text columns
    df["payment_mode"] = df["payment_mode"].str.lower().str.strip()
    df["category"] = df["category"].str.strip().str.title()
    df["gender"] = df["gender"].str.lower().str.strip()

    # Drop  temporary check columns
    temp_cols = [
        "gross_check",
        "net_check",
        "stock_check",
        "day_name_check",
        "low_stock_check",
    ]
    df.drop(columns=[c for c in temp_cols if c in df.columns], inplace=True)

    # Reset index cleanly
    df.reset_index(drop=True, inplace=True)

    print(f"\nClean shape: {df.shape}")
    return df


filepath_str = "cart_insight_supermarket_2025_profit_tax.csv"

load_and_clean(filepath_str)
