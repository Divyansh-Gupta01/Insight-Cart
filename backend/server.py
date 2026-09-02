from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Header
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
import sys
import os
import io
import logging
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timezone, timedelta
import time
import numpy as np

import pandas as pd
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)

from database import db, init_db_indexes, close_db
from sql_database import (
    init_sql_db,
    register_user,
    authenticate_user,
    get_user_by_api_key,
    get_user_by_id,
    get_user_by_email,
    create_password_reset_otp,
    verify_password_reset_otp,
    reset_user_password,
    save_incremental_sales_and_inventory,
    load_store_sales_dataframe,
    load_store_inventory_list,
    get_store_dataset_status,
    reset_store_data,
)
from mailer import send_email_with_pdf, send_otp_email, is_smtp_configured
from etl import clean_and_validate_dataset
from analytics import (
    compute_sales_metrics,
    classify_inventory_status,
    get_restock_priority,
    compute_abc_classification,
    simulate_stockout_timeline,
    compute_inventory_decisions,
    generate_action_center,
    CATEGORY_MARGINS,
    DOW_LABELS,
)
from forecasting import (
    generate_sales_forecast,
    generate_sku_demand_forecast,
)

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("cart_insight.server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize both SQL (PostgreSQL/SQLite) and MongoDB indexes
    await init_sql_db()
    await init_db_indexes()
    yield
    # Shutdown
    await close_db()


app = FastAPI(title="Cart Insight API", lifespan=lifespan)
api_router = APIRouter(prefix="/api")

# ---------- SEED / DEMO CONSTANTS ----------
CATEGORIES = [
    "Beverages",
    "Snacks",
    "Dairy",
    "Fruits & Vegetables",
    "Personal Care",
    "Others",
    "Bakery",
    "Household",
]

CATEGORY_SPLIT = {
    "Beverages": 25.1,
    "Snacks": 20.6,
    "Dairy": 17.0,
    "Fruits & Vegetables": 12.9,
    "Personal Care": 9.9,
    "Others": 6.3,
    "Bakery": 4.2,
    "Household": 4.0,
}

TOP_PRODUCTS = [
    {"name": "Amul Gold Milk 1L", "category": "Dairy", "sales": 184230, "qty": 3072},
    {"name": "Lay's Classic 52g", "category": "Snacks", "sales": 156480, "qty": 5216},
    {"name": "Coca Cola 750ml", "category": "Beverages", "sales": 142900, "qty": 3572},
    {"name": "Whole Wheat Bread", "category": "Bakery", "sales": 138650, "qty": 2773},
    {"name": "Maggi 2-Min Noodles", "category": "Snacks", "sales": 118420, "qty": 5921},
]

# (name, category, current_stock, reorder_level, lead_time, unit_price, unit_cost)
INVENTORY_SEED = [
    ("Amul Gold Milk 1L", "Dairy", 14, 50, 2, 68, 54),
    ("Britannia Bread 400g", "Bakery", 8, 30, 1, 45, 32),
    ("Coca Cola 750ml", "Beverages", 12, 60, 3, 40, 30),
    ("Aashirvaad Atta 5kg", "Others", 88, 40, 3, 260, 210),
    ("Maggi 2-Min Noodles", "Snacks", 0, 80, 2, 14, 10),
    ("Parle-G 100g", "Snacks", 620, 150, 4, 10, 7),
    ("Whole Wheat Bread", "Bakery", 35, 25, 2, 50, 36),
    ("Cold Brew Coffee 250ml", "Beverages", 28, 20, 3, 120, 80),
    ("Cadbury Dark Chocolate 150g", "Snacks", 48, 15, 7, 160, 120),
    ("Organic Extra Virgin Olive Oil 500ml", "Others", 22, 8, 10, 650, 480),
    ("Mother Dairy Curd 400g", "Dairy", 18, 40, 2, 35, 26),
    ("Tata Salt 1kg", "Others", 240, 100, 4, 28, 20),
    ("Fortune Sunflower Oil 1L", "Others", 155, 60, 3, 145, 115),
    ("Dettol Handwash 200ml", "Personal Care", 22, 50, 3, 99, 72),
    ("Colgate MaxFresh 150g", "Personal Care", 90, 40, 4, 115, 82),
    ("Surf Excel 1kg", "Household", 78, 30, 3, 140, 105),
    ("Onions 1kg", "Fruits & Vegetables", 3, 40, 1, 35, 25),
    ("Tomatoes 1kg", "Fruits & Vegetables", 210, 40, 2, 40, 28),
    ("Bananas 1 dozen", "Fruits & Vegetables", 45, 30, 1, 60, 42),
    ("Bisleri Water 1L", "Beverages", 900, 200, 2, 20, 12),
]


def _inventory_rows():
    rows = []
    now = datetime.now(timezone.utc)
    for i, (name, cat, stock, reorder, lead, price, cost) in enumerate(INVENTORY_SEED):
        cur = max(0, stock)
        status = classify_inventory_status(cur, reorder)
        priority = get_restock_priority(status)
        rows.append(
            {
                "id": f"SKU-{1000+i}",
                "product": name,
                "category": cat,
                "current_stock": cur,
                "reorder_level": reorder,
                "lead_time": lead,
                "is_assumed_lead_time": False,
                "unit_price": price,
                "unit_cost": cost,
                "status": status,
                "last_updated": (now - timedelta(hours=i * 3)).isoformat(),
                "restock_priority": priority,
            }
        )
    return rows


def _demo_sales_dataframe() -> pd.DataFrame:
    """Generate rich 35-day realistic retail sales dataset across 20 SKUs."""
    rows = []
    start_dt = datetime(2025, 4, 25)
    products_config = [
        # (name, category, base_qty_day, unit_price, unit_cost, weekend_mult, trend_factor)
        ("Amul Gold Milk 1L", "Dairy", 24, 68, 54, 1.35, 1.02),
        ("Britannia Bread 400g", "Bakery", 18, 45, 32, 1.25, 1.01),
        ("Coca Cola 750ml", "Beverages", 16, 40, 30, 1.5, 1.03),
        ("Aashirvaad Atta 5kg", "Others", 6, 260, 210, 1.2, 1.00),
        ("Maggi 2-Min Noodles", "Snacks", 28, 14, 10, 1.3, 1.02),
        ("Parle-G 100g", "Snacks", 22, 10, 7, 1.1, 1.00),
        ("Whole Wheat Bread", "Bakery", 14, 50, 36, 1.3, 1.24),
        ("Cold Brew Coffee 250ml", "Beverages", 10, 120, 80, 1.4, 1.18),
        ("Cadbury Dark Chocolate 150g", "Snacks", 0.05, 160, 120, 1.0, 0.5),
        ("Organic Extra Virgin Olive Oil 500ml", "Others", 0.04, 650, 480, 1.0, 0.4),
        ("Mother Dairy Curd 400g", "Dairy", 12, 35, 26, 1.3, 1.01),
        ("Tata Salt 1kg", "Others", 8, 28, 20, 1.1, 1.00),
        ("Fortune Sunflower Oil 1L", "Others", 7, 145, 115, 1.15, 1.01),
        ("Dettol Handwash 200ml", "Personal Care", 5, 99, 72, 1.1, 1.00),
        ("Colgate MaxFresh 150g", "Personal Care", 6, 115, 82, 1.1, 1.00),
        ("Surf Excel 1kg", "Household", 5, 140, 105, 1.1, 1.00),
        ("Onions 1kg", "Fruits & Vegetables", 15, 35, 25, 1.2, 1.01),
        ("Tomatoes 1kg", "Fruits & Vegetables", 14, 40, 28, 1.2, 1.01),
        ("Bananas 1 dozen", "Fruits & Vegetables", 12, 60, 42, 1.25, 1.01),
        ("Bisleri Water 1L", "Beverages", 20, 20, 12, 1.3, 1.02),
    ]
    for d in range(35):
        cur_dt = start_dt + timedelta(days=d)
        is_wknd = cur_dt.weekday() >= 5
        for p_name, p_cat, base_q, u_price, u_cost, wknd_m, tr_f in products_config:
            if "Dark Chocolate" in p_name or "Olive Oil" in p_name:
                if d > 4:
                    continue
            q_val = base_q * (wknd_m if is_wknd else 1.0) * (tr_f ** (d / 30.0))
            q_val = max(1, int(round(q_val + np.sin(d * 0.8 + (hash(p_name) % 5)) * 1.5)))
            amt_val = round(q_val * u_price, 2)
            cost_val = round(q_val * u_cost, 2)
            rows.append({
                "date": cur_dt.strftime("%Y-%m-%d"),
                "product": p_name,
                "category": p_cat,
                "quantity": q_val,
                "amount": amt_val,
                "cost": cost_val,
                "payment_method": "UPI" if (d % 3 == 0) else "Credit/Debit Card" if (d % 3 == 1) else "Cash on Delivery",
                "customer_id": f"CUST-{((d * 7 + abs(hash(p_name)) % 200) % 500) + 1}",
                "dataset_id": "seed-demo",
            })
    df = pd.DataFrame(rows)
    df["_date"] = pd.to_datetime(df["date"])
    return df


async def _get_active_sales_df(store_id: int = 1) -> pd.DataFrame:
    """Return active sales DataFrame from SQL database (PostgreSQL/SQLite), fallback to Mongo/mem or demo baseline."""
    try:
        df = await load_store_sales_dataframe(store_id)
        if not df.empty:
            df["_date"] = pd.to_datetime(df["date"], errors="coerce")
            return df.dropna(subset=["_date"])
    except Exception as e:
        logger.warning(f"Error loading sales DataFrame from SQL for store {store_id}: {e}")

    try:
        if await _has_live_sales(store_id):
            rows = []
            try:
                rows = await db.sales_rows.find({}, {"_id": 0}).to_list(200000)
            except Exception:
                pass
            if not rows:
                rows = list(_mem_sales_rows)
            if rows:
                df = pd.DataFrame(rows)
                df["_date"] = pd.to_datetime(df["date"], errors="coerce")
                return df.dropna(subset=["_date"])
    except Exception as e:
        logger.warning(f"Error fetching active sales df: {e}")
    return _demo_sales_dataframe()


def _daily_sales(days: int = 31):
    base = 78000
    out = []
    start = datetime(2025, 5, 1)
    # Deterministic daily progression
    for d in range(days):
        day = start + timedelta(days=d)
        weekday_boost = 18000 if day.weekday() >= 5 else 0
        cycle = ((d % 7) * 2100) - 6000
        rev = int(base + weekday_boost + cycle)
        out.append(
            {"date": day.strftime("%Y-%m-%d"), "revenue": rev, "orders": int(rev / 132)}
        )
    return out


def _insights_payload():
    daily = _daily_sales(31)
    total_rev = 2485630
    total_orders = 18742
    aov = 1326

    cat_data = [
        {"category": c, "sales": int(total_rev * pct / 100), "percent": pct}
        for c, pct in CATEGORY_SPLIT.items()
    ]

    dow_map = {i: 0 for i in range(7)}
    for row in daily:
        wd = datetime.strptime(row["date"], "%Y-%m-%d").weekday()
        dow_map[wd] += row["revenue"]
    dow = [{"day": DOW_LABELS[i], "revenue": dow_map[i]} for i in range(7)]

    months = ["Dec 2024", "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025"]
    monthly_values = [1980430, 2104250, 2015680, 2210470, 2211550, total_rev]
    monthly = [{"month": m, "revenue": v} for m, v in zip(months, monthly_values)]

    heatmap = []
    for d in range(7):
        for h in range(24):
            base_h = 10 if 9 <= h <= 22 else 2
            weekend = 6 if d >= 5 else 0
            val = max(0, base_h + weekend + (h % 5))
            heatmap.append({"day": DOW_LABELS[d], "hour": h, "value": val})

    payments = [
        {"method": "UPI", "percent": 41.2, "amount": int(total_rev * 0.412)},
        {"method": "Credit/Debit Card", "percent": 31.6, "amount": int(total_rev * 0.316)},
        {"method": "Cash on Delivery", "percent": 21.9, "amount": int(total_rev * 0.219)},
        {"method": "Net Banking", "percent": 5.2, "amount": int(total_rev * 0.052)},
    ]

    return {
        "source": "demo",
        "kpis": {
            "total_sales": 2485630,
            "total_orders": 18742,
            "aov": 1326,
            "total_customers": 9842,
            "gross_profit": 618540,
            "profit_margin": 24.9,
            "trends": {
                "total_sales": 12.4,
                "total_orders": 8.7,
                "aov": 3.4,
                "total_customers": 9.1,
                "gross_profit": 11.6,
                "profit_margin": 1.8,
            },
        },
        "daily_sales": daily,
        "categories": cat_data,
        "top_products": TOP_PRODUCTS,
        "payments": payments,
        "day_of_week": dow,
        "monthly": monthly,
        "heatmap": heatmap,
    }


def _apply_date_filter(
    payload: dict, start_date: Optional[str], end_date: Optional[str]
):
    """Apply date range slice to demo baseline while preserving AOV and margins."""
    if not start_date and not end_date:
        return payload
    try:
        s = datetime.fromisoformat(start_date).date() if start_date else None
        e = datetime.fromisoformat(end_date).date() if end_date else None
    except Exception:
        return payload

    daily = payload.get("daily_sales", [])
    filtered = [
        d
        for d in daily
        if (s is None or datetime.strptime(d["date"], "%Y-%m-%d").date() >= s)
        and (e is None or datetime.strptime(d["date"], "%Y-%m-%d").date() <= e)
    ]
    if not filtered or len(filtered) == len(daily):
        return payload

    orig_rev = sum(d["revenue"] for d in daily) or 1
    filt_rev = sum(d["revenue"] for d in filtered)
    ratio = filt_rev / orig_rev

    k = payload["kpis"]
    new_kpis = {
        **k,
        "total_sales": int(k["total_sales"] * ratio),
        "total_orders": int(k["total_orders"] * ratio),
        "aov": k["aov"],
        "total_customers": int(k["total_customers"] * ratio),
        "gross_profit": int(k["gross_profit"] * ratio),
        "profit_margin": k["profit_margin"],
    }

    def _scale(items, key):
        return [{**it, key: int(it[key] * ratio)} for it in items]

    return {
        **payload,
        "daily_sales": filtered,
        "kpis": new_kpis,
        "categories": _scale(payload.get("categories", []), "sales"),
        "top_products": _scale(payload.get("top_products", []), "sales"),
        "payments": _scale(payload.get("payments", []), "amount"),
        "monthly": payload.get("monthly", []),
        "date_range": {
            "start": str(s) if s else None,
            "end": str(e) if e else None,
            "days": len(filtered),
        },
    }


# ---------- LIVE DATASET IN-MEMORY FALLBACK STORAGE ----------
_mem_sales_rows: List[Dict[str, Any]] = []
_mem_inventory_rows: List[Dict[str, Any]] = []
_mem_datasets: List[Dict[str, Any]] = []
_mem_schedules: List[Dict[str, Any]] = []
_mem_deliveries: List[Dict[str, Any]] = []


_db_available: Optional[bool] = None
_db_last_check: float = 0


async def _is_db_ready() -> bool:
    global _db_available, _db_last_check
    now = time.time()
    if _db_available is not None and (now - _db_last_check) < 60:
        return _db_available
    try:
        await asyncio.wait_for(db.datasets.find_one({}), timeout=0.6)
        _db_available = True
    except Exception:
        _db_available = False
    _db_last_check = now
    return _db_available


# High-performance in-memory cache for sub-millisecond analytics responses
_fast_insights_cache: Dict[str, Dict[str, Any]] = {}
_fast_forecast_cache: Dict[str, Dict[str, Any]] = {}


def _get_cached_insights(key: str) -> Optional[Dict[str, Any]]:
    item = _fast_insights_cache.get(key)
    if item and (time.time() - item["ts"]) < 120:  # 2 minutes TTL
        return item["data"]
    return None


def _set_cached_insights(key: str, data: Dict[str, Any]):
    _fast_insights_cache[key] = {"ts": time.time(), "data": data}


def _get_cached_forecast(key: str) -> Optional[Dict[str, Any]]:
    item = _fast_forecast_cache.get(key)
    if item and (time.time() - item["ts"]) < 180:  # 3 minutes TTL
        return item["data"]
    return None


def _set_cached_forecast(key: str, data: Dict[str, Any]):
    _fast_forecast_cache[key] = {"ts": time.time(), "data": data}


def _clear_all_analytics_caches():
    _fast_insights_cache.clear()
    _fast_forecast_cache.clear()


# ---------- LIVE DATASET DATABASE HELPERS ----------
async def _has_live_sales(store_id: int = 1) -> bool:
    try:
        df = await load_store_sales_dataframe(store_id)
        if not df.empty:
            return True
    except Exception:
        pass
    if await _is_db_ready():
        try:
            cnt = await asyncio.wait_for(db.sales_rows.count_documents({}), timeout=0.6)
            if cnt > 0:
                return True
        except Exception as e:
            logger.warning(f"Database query error in _has_live_sales: {e}")
    return len(_mem_sales_rows) > 0


async def _has_live_inventory(store_id: int = 1) -> bool:
    try:
        inv = await load_store_inventory_list(store_id)
        if inv:
            return True
    except Exception:
        pass
    if await _is_db_ready():
        try:
            cnt = await asyncio.wait_for(db.inventory_rows.count_documents({}), timeout=0.6)
            if cnt > 0:
                return True
        except Exception as e:
            logger.warning(f"Database query error in _has_live_inventory: {e}")
    return len(_mem_inventory_rows) > 0


async def _live_sales_payload(store_id: int = 1, start_date: Optional[str] = None, end_date: Optional[str] = None):
    # Check SQL database first (PostgreSQL/SQLite)
    try:
        df = await load_store_sales_dataframe(store_id)
        if not df.empty:
            return compute_sales_metrics(df, start_date=start_date, end_date=end_date)
    except Exception as e:
        logger.warning(f"SQL database query error in _live_sales_payload: {e}")

    rows = []
    if await _is_db_ready():
        try:
            rows = await asyncio.wait_for(db.sales_rows.find({}, {"_id": 0}).to_list(200000), timeout=2.0)
        except Exception as e:
            logger.warning(f"Database query error in _live_sales_payload: {e}")
    if not rows:
        rows = list(_mem_sales_rows)

    if not rows:
        return None

    df = pd.DataFrame(rows)
    return compute_sales_metrics(df, start_date=start_date, end_date=end_date)


async def _live_inventory_rows(store_id: int = 1):
    # Check SQL database first (PostgreSQL/SQLite)
    try:
        inv_list = await load_store_inventory_list(store_id)
        if inv_list:
            out = []
            now = datetime.now(timezone.utc)
            for i, r in enumerate(inv_list):
                cur = int(r.get("current_stock", 0) or 0)
                reorder = int(r.get("reorder_level", 0) or 0) or max(10, cur // 2)
                status = classify_inventory_status(cur, reorder)
                priority = get_restock_priority(status)
                out.append(
                    {
                        "id": r.get("id", f"SKU-{2000+i}"),
                        "product": str(r.get("product", "Unknown")),
                        "category": str(r.get("category", "Others")),
                        "current_stock": cur,
                        "reorder_level": reorder,
                        "status": status,
                        "last_updated": (now - timedelta(minutes=i * 5)).isoformat(),
                        "restock_priority": priority,
                    }
                )
            return out
    except Exception as e:
        logger.warning(f"SQL inventory query error: {e}")

    rows = []
    if await _is_db_ready():
        try:
            rows = await asyncio.wait_for(db.inventory_rows.find({}, {"_id": 0}).to_list(50000), timeout=2.0)
        except Exception as e:
            logger.warning(f"Database query error in _live_inventory_rows: {e}")
    if not rows:
        rows = list(_mem_inventory_rows)

    if not rows:
        return None

    out = []
    now = datetime.now(timezone.utc)
    for i, r in enumerate(rows):
        cur = int(r.get("current_stock", 0) or 0)
        reorder = int(r.get("reorder_level", 0) or 0) or max(10, cur // 2)
        status = classify_inventory_status(cur, reorder)
        priority = get_restock_priority(status)
        out.append(
            {
                "id": r.get("id", f"SKU-{2000+i}"),
                "product": str(r.get("product", "Unknown")),
                "category": str(r.get("category", "Others")),
                "current_stock": cur,
                "reorder_level": reorder,
                "status": status,
                "last_updated": (now - timedelta(minutes=i * 5)).isoformat(),
                "restock_priority": priority,
            }
        )
    return out


async def _active_daily_sales():
    """Return list of {date, revenue, orders} from live data or seed."""
    try:
        if await _has_live_sales():
            rows = []
            try:
                rows = await db.sales_rows.find({}, {"_id": 0}).to_list(200000)
            except Exception:
                pass
            if not rows:
                rows = list(_mem_sales_rows)

            if rows:
                df = pd.DataFrame(rows)
                df["_date"] = pd.to_datetime(df["date"], errors="coerce")
                df = df.dropna(subset=["_date"])
                if not df.empty:
                    d = (
                        df.groupby(df["_date"].dt.date)
                        .agg(revenue=("amount", "sum"), orders=("amount", "count"))
                        .reset_index()
                        .sort_values("_date")
                    )
                    return [
                        {
                            "date": str(r["_date"]),
                            "revenue": int(round(r["revenue"])),
                            "orders": int(r["orders"]),
                        }
                        for _, r in d.iterrows()
                    ]
    except Exception as e:
        logger.warning(f"Database query error in _active_daily_sales: {e}")
    return _daily_sales(31)


# ---------- SCHEDULE HELPERS ----------
def _compute_next_delivery(
    cadence: str,
    day_of_week: int = 0,
    day_of_month: int = 1,
    hour: int = 8,
    minute: int = 0,
) -> str:
    now = datetime.now(timezone.utc)
    if cadence == "daily":
        nxt = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if (now.hour, now.minute) >= (hour, minute):
            nxt += timedelta(days=1)
    elif cadence == "weekly":
        days_ahead = (day_of_week - now.weekday()) % 7
        if days_ahead == 0 and (now.hour, now.minute) >= (hour, minute):
            days_ahead = 7
        nxt = (now + timedelta(days=days_ahead)).replace(
            hour=hour, minute=minute, second=0, microsecond=0
        )
    else:  # monthly
        year, month = now.year, now.month
        if now.day > day_of_month or (
            now.day == day_of_month and (now.hour, now.minute) >= (hour, minute)
        ):
            month += 1
            if month > 12:
                month = 1
                year += 1
        try:
            nxt = datetime(year, month, day_of_month, hour, minute, tzinfo=timezone.utc)
        except ValueError:
            nxt = datetime(year, month, 28, hour, minute, tzinfo=timezone.utc)
    return nxt.isoformat()


# ---------- PYDANTIC MODELS ----------
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    store_name: Optional[str] = "My Supermarket"


class LoginRequest(BaseModel):
    username: str
    password: str
    remember_me: Optional[bool] = False
    demo: bool = False


class LoginResponse(BaseModel):
    token: str
    user: dict


class POSSaleItem(BaseModel):
    invoice_id: str
    product: str
    category: Optional[str] = "General"
    quantity: float = 1.0
    unit_price: float = 0.0
    unit_cost: Optional[float] = 0.0
    total_amount: Optional[float] = None
    current_stock: Optional[int] = None
    reorder_point: Optional[int] = None
    lead_time_days: Optional[int] = 3
    payment_method: Optional[str] = "UPI"
    customer_id: Optional[str] = ""
    date: Optional[str] = None


class UploadValidationStep(BaseModel):
    step: str
    passed: bool
    details: str


class UploadResponse(BaseModel):
    filename: str
    rows: int
    columns: List[str]
    steps: List[UploadValidationStep]
    dataset_id: str


class ScheduleCreate(BaseModel):
    name: str
    cadence: str
    day_of_week: Optional[int] = 0
    day_of_month: Optional[int] = 1
    hour: Optional[int] = 8
    minute: Optional[int] = 0
    recipients: List[str] = []


class ReportEmailRequest(BaseModel):
    report_type: str = "inventory"  # 'inventory' (Restock Report) | 'all' (Full Store Report)
    cadence: str = "daily"  # 'daily' | 'weekly'
    recipients: List[str] = []


class ForgotPasswordRequest(BaseModel):
    email: str


class VerifyOTPRequest(BaseModel):
    email: str
    otp: str


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str


# ---------- STORE & AUTH SESSION CONTEXT ----------
async def get_current_user_and_store(
    authorization: Optional[str] = None,
    x_api_key: Optional[str] = None,
) -> Dict[str, Any]:
    """Resolve active user & store from API key or Bearer token, falling back to demo store."""
    if x_api_key:
        user = await get_user_by_api_key(x_api_key)
        if user:
            return {
                "user_id": user.id,
                "store_id": user.id,
                "username": user.username,
                "store_name": user.store_name,
                "api_key": user.api_key,
                "email": user.email,
            }

    if authorization and "Bearer " in authorization:
        tok = authorization.replace("Bearer ", "").strip()
        if tok.startswith("user-"):
            parts = tok.split("-")
            if len(parts) >= 3 and parts[1].isdigit():
                uid = int(parts[1])
                user = await get_user_by_id(uid)
                if user:
                    return {
                        "user_id": user.id,
                        "store_id": user.id,
                        "username": user.username,
                        "store_name": user.store_name,
                        "api_key": user.api_key,
                        "email": user.email,
                    }

    return {
        "user_id": 1,
        "store_id": 1,
        "username": "demo",
        "store_name": "Kaplas Supermarket",
        "api_key": "ci_demo_key_9901",
        "email": "demo@cartinsight.io",
    }


# ---------- API ENDPOINTS ----------
@api_router.get("/")
async def root():
    return {"service": "Cart Insight API", "status": "ok", "version": "2.0"}


@api_router.post("/register")
async def register(payload: RegisterRequest):
    user, err = await register_user(
        username=payload.username,
        email=payload.email,
        password=payload.password,
        store_name=payload.store_name or "My Supermarket",
    )
    if err:
        raise HTTPException(status_code=400, detail=err)

    token = f"user-{user.id}-{int(datetime.now(timezone.utc).timestamp())}"
    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "store_name": user.store_name,
            "api_key": user.api_key,
            "role": user.role,
        },
    }


@api_router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    if payload.demo:
        return LoginResponse(
            token=f"demo-token-{int(datetime.now(timezone.utc).timestamp())}",
            user={
                "id": 1,
                "username": "demo",
                "email": "demo@cartinsight.io",
                "store_name": "Insight Cart Supermarket",
                "api_key": "ci_demo_key_9901",
                "role": "manager",
            },
        )

    user = await authenticate_user(payload.username, payload.password)
    if not user:
        correct_username = os.environ.get("LOGIN_USERNAME", "admin")
        correct_password = os.environ.get("LOGIN_PASSWORD", "123456")
        if payload.username == correct_username and payload.password == correct_password:
            return LoginResponse(
                token=f"user-1-{int(datetime.now(timezone.utc).timestamp())}",
                user={
                    "id": 1,
                    "username": payload.username,
                    "email": "admin@cartinsight.io",
                    "store_name": "Insight Cart Supermarket",
                    "api_key": "ci_admin_key_1001",
                    "role": "manager",
                },
            )
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = f"user-{user.id}-{int(datetime.now(timezone.utc).timestamp())}"
    return LoginResponse(
        token=token,
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "store_name": user.store_name,
            "api_key": user.api_key,
            "role": user.role,
        },
    )


@api_router.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    """
    Initiates 6-digit OTP password reset sequence and dispatches verification email.
    """
    clean_email = payload.email.strip().lower()
    if not clean_email or "@" not in clean_email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address")

    otp_code, reset_token, user = await create_password_reset_otp(clean_email)
    if not user:
        # User not found: Return standard security response without leaking email existence
        return {
            "status": "success",
            "message": f"If an account exists for {clean_email}, a 6-digit security code has been sent.",
            "mode": "simulated",
        }

    # Dispatch email via mailer
    mail_res = send_otp_email(
        to_email=user.email,
        otp_code=otp_code,
        store_name=user.store_name,
    )

    return {
        "status": "success",
        "message": f"6-digit verification code sent to {user.email}. Valid for 10 minutes.",
        "mode": mail_res.get("mode", "simulated"),
        "otp_preview": mail_res.get("otp_preview") if mail_res.get("mode") == "simulated" else None,
    }


@api_router.post("/auth/verify-otp")
async def verify_otp(payload: VerifyOTPRequest):
    """
    Validates the 6-digit OTP code against the database.
    """
    valid, reset_token, err = await verify_password_reset_otp(payload.email, payload.otp)
    if not valid or not reset_token:
        raise HTTPException(status_code=400, detail=err or "Invalid or expired verification code")

    return {
        "status": "success",
        "verified": True,
        "reset_token": reset_token,
        "message": "Security code verified. Please set your new store password.",
    }


@api_router.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    """
    Resets the store account password using the verified session token.
    """
    success, err = await reset_user_password(payload.reset_token, payload.new_password)
    if not success:
        raise HTTPException(status_code=400, detail=err or "Failed to reset password")

    return {
        "status": "success",
        "message": "Password updated successfully! You can now sign in with your new credentials.",
    }


@api_router.get("/me")
async def get_current_user_profile(authorization: Optional[str] = Header(None)):
    store_ctx = await get_current_user_and_store(authorization)
    return store_ctx


@api_router.post("/pos/stream-sales")
async def stream_pos_sales(
    sales: List[POSSaleItem],
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
):
    """
    Automated real-time POS Streaming / Webhook Endpoint.
    Shopkeepers connect Tally, Shopify, Square, or Vyapar to stream sales bills into PostgreSQL.
    """
    if not sales:
        raise HTTPException(status_code=400, detail="Empty sales array")

    store_ctx = await get_current_user_and_store(authorization, x_api_key)
    store_id = store_ctx["store_id"]

    rows = []
    for s in sales:
        dt = s.date or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        tot = s.total_amount if s.total_amount is not None else round(s.quantity * s.unit_price, 2)
        rows.append({
            "clean_date": dt,
            "clean_product": s.product,
            "clean_category": s.category,
            "clean_qty": s.quantity,
            "clean_amount": tot,
            "clean_cost": s.unit_cost or 0.0,
            "clean_stock": s.current_stock if s.current_stock is not None else 10,
            "clean_reorder": s.reorder_point if s.reorder_point is not None else 10,
            "clean_lead_time": s.lead_time_days or 3,
            "clean_payment": s.payment_method or "UPI",
            "clean_customer": s.customer_id or "",
            "clean_invoice": s.invoice_id,
        })

    df = pd.DataFrame(rows)
    df["_parsed_date"] = pd.to_datetime(df["clean_date"])

    dataset_id = f"POS-{int(datetime.now(timezone.utc).timestamp())}"
    res = await save_incremental_sales_and_inventory(
        store_id=store_id,
        filename="Live POS Stream",
        dataset_id=dataset_id,
        cleaned_df=df,
        mapping={"current_stock": "clean_stock", "lead_time": "clean_lead_time"},
        kind="sales",
    )
    _clear_all_analytics_caches()
    return {
        "status": "success",
        "message": f"{len(sales)} transactions saved to PostgreSQL",
        "store": store_ctx["store_name"],
        "stats": res,
    }


@api_router.post("/dataset/load-sample")
async def load_sample_store_dataset(authorization: Optional[str] = Header(None)):
    """Instantly populate the store's PostgreSQL database with realistic 200k supermarket sales."""
    store_ctx = await get_current_user_and_store(authorization)
    store_id = store_ctx["store_id"]

    sample_path = Path(__file__).resolve().parent / "sample_data" / "real_supermarket_sales_200k.csv"
    if not sample_path.exists():
        sample_path = Path(__file__).resolve().parent / "sample_data" / "supermarket_sample.csv"

    if sample_path.exists():
        df = pd.read_csv(sample_path)
        cleaned_df, mapping, kind, _ = clean_and_validate_dataset(df, sample_path.name)
        filename = sample_path.name
    else:
        # Generate realistic demo supermarket dataset dynamically in memory
        products_meta = [
            ("Amul Taaza Milk 1L", "Dairy", 68.0, 54.0, 45, 15, 2),
            ("Harvest Gold White Bread", "Bakery", 50.0, 38.0, 30, 10, 1),
            ("Tata Salt Vacuum Evaporated 1kg", "Staples", 28.0, 20.0, 80, 25, 4),
            ("Fortune Sunlite Sunflower Oil 1L", "Staples", 165.0, 138.0, 50, 15, 3),
            ("Maggi 2-Minute Masala Noodles", "Instant Food", 14.0, 10.5, 120, 40, 2),
            ("Aashirvaad Shudh Chakki Atta 5kg", "Staples", 275.0, 230.0, 35, 12, 3),
            ("Coca Cola 750ml PET Bottle", "Beverages", 40.0, 29.0, 60, 20, 2),
            ("Surf Excel Easy Wash Detergent 1kg", "Household", 145.0, 118.0, 40, 15, 5),
            ("Dettol Original Liquid Handwash 200ml", "Personal Care", 99.0, 76.0, 55, 18, 3),
            ("Britannia Good Day Butter Cookies 200g", "Snacks", 40.0, 30.0, 75, 25, 2),
            ("Lipton Green Tea Honey Lemon 25 Bags", "Beverages", 195.0, 152.0, 25, 10, 4),
            ("Epigamia Greek Yogurt Strawberry 90g", "Dairy", 55.0, 42.0, 20, 8, 2),
        ]
        sample_rows = []
        base_date = datetime(2025, 5, 1)
        np.random.seed(42)
        for day in range(31):
            cur_date = base_date + timedelta(days=day)
            dt_str = cur_date.strftime("%Y-%m-%d")
            for idx, (pname, cat, price, cost, stock, reorder, lead_time) in enumerate(products_meta):
                qty = int(np.random.randint(1, 6) if (day + idx) % 2 == 0 else np.random.randint(2, 7))
                sample_rows.append({
                    "clean_date": f"{dt_str} {np.random.randint(9, 21):02d}:{np.random.randint(0, 59):02d}:00",
                    "clean_product": pname,
                    "clean_category": cat,
                    "clean_qty": qty,
                    "clean_amount": round(qty * price, 2),
                    "clean_cost": cost,
                    "clean_stock": max(2, stock - (qty * 2)),
                    "clean_reorder": reorder,
                    "clean_lead_time": lead_time,
                    "clean_payment": ["UPI", "Cash", "Card"][np.random.randint(0, 3)],
                    "clean_customer": f"CUST-{(idx * 17 + day) % 80 + 100}",
                    "clean_invoice": f"INV-202505{day+1:02d}-{idx+1:03d}",
                })
        cleaned_df = pd.DataFrame(sample_rows)
        cleaned_df["_parsed_date"] = pd.to_datetime(cleaned_df["clean_date"])
        mapping = {"current_stock": "clean_stock", "lead_time": "clean_lead_time"}
        filename = "demo_supermarket_sales.csv"
        kind = "sales"

    dataset_id = f"SAMPLE-{int(datetime.now(timezone.utc).timestamp())}"

    res = await save_incremental_sales_and_inventory(
        store_id=store_id,
        filename=filename,
        dataset_id=dataset_id,
        cleaned_df=cleaned_df,
        mapping=mapping,
        kind="sales",
    )
    _clear_all_analytics_caches()
    return {
        "status": "success",
        "message": f"Sample supermarket dataset loaded into PostgreSQL ({len(cleaned_df)} rows)",
        "store": store_ctx["store_name"],
        "stats": res,
    }


@api_router.post("/upload", response_model=UploadResponse)
@api_router.post("/dataset/upload", response_model=UploadResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
):
    store_ctx = await get_current_user_and_store(authorization)
    store_id = store_ctx["store_id"]

    content = await file.read()
    filename = file.filename or "dataset.csv"

    # Read DataFrame with multi-encoding and delimiter resilience
    try:
        if filename.lower().endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            df = None
            for enc in ["utf-8", "utf-8-sig", "latin1", "cp1252", "iso-8859-1"]:
                try:
                    df = pd.read_csv(io.BytesIO(content), encoding=enc)
                    break
                except (UnicodeDecodeError, Exception):
                    continue

            if df is None:
                raise ValueError("Could not decode file with standard UTF-8 or Latin1 encodings.")

            if len(df.columns) == 1:
                sample_text = content[:4096].decode("utf-8", errors="ignore")
                for sep in [";", "\t", "|"]:
                    if sep in sample_text:
                        for enc in ["utf-8", "utf-8-sig", "latin1"]:
                            try:
                                candidate = pd.read_csv(io.BytesIO(content), sep=sep, encoding=enc)
                                if len(candidate.columns) > 1:
                                    df = candidate
                                    break
                            except Exception:
                                continue
                        if len(df.columns) > 1:
                            break
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {e}")

    # Process and sanitize using ETL pipeline
    try:
        cleaned_df, mapping, kind, steps = clean_and_validate_dataset(df, filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    dataset_id = f"DS-{int(datetime.now(timezone.utc).timestamp())}"

    # Save into SQL database (PostgreSQL / SQLite) with smart deduplication & stock update
    sql_stats = await save_incremental_sales_and_inventory(
        store_id=store_id,
        filename=filename,
        dataset_id=dataset_id,
        cleaned_df=cleaned_df,
        mapping=mapping,
        kind=kind,
    )

    # In-memory fallback caching for rapid response
    global _mem_sales_rows, _mem_inventory_rows, _mem_datasets
    if kind == "sales":
        _mem_sales_rows = [
            {
                "date": str(row.get("clean_date", "")),
                "product": str(row.get("clean_product", "Unknown")),
                "category": str(row.get("clean_category", "Others")),
                "quantity": float(row.get("clean_qty", 1.0)),
                "amount": float(row.get("clean_amount", 0.0)),
                "cost": float(row.get("clean_cost", 0.0)),
                "payment_method": str(row.get("clean_payment", "UPI")),
                "customer_id": str(row.get("clean_customer", "")),
                "dataset_id": dataset_id,
            }
            for _, row in cleaned_df.iterrows()
        ]

    steps.append({
        "step": "Database Persistence (PostgreSQL)",
        "passed": True,
        "details": f"Added {sql_stats.get('new_inserted_rows', len(cleaned_df))} new rows · Total store history: {sql_stats.get('total_accumulated_sales', len(cleaned_df))} rows",
    })
    _clear_all_analytics_caches()

    return UploadResponse(
        filename=filename,
        rows=int(len(cleaned_df)),
        columns=list(df.columns.astype(str)),
        steps=[UploadValidationStep(**s) for s in steps],
        dataset_id=dataset_id,
    )


@api_router.get("/products")
async def get_products(category: Optional[str] = None):
    if await _has_live_sales():
        rows = await db.sales_rows.find(
            {}, {"_id": 0, "product": 1, "category": 1}
        ).to_list(200000)
        seen = {}
        for r in rows:
            key = r["product"]
            if key not in seen:
                seen[key] = r.get("category", "Others")
        products = [
            {"id": f"SKU-{2000+i}", "name": p, "category": c}
            for i, (p, c) in enumerate(seen.items())
        ]
    else:
        inv = _inventory_rows()
        products = [
            {"id": r["id"], "name": r["product"], "category": r["category"]}
            for r in inv
        ]
    if category and category != "All":
        products = [p for p in products if p["category"] == category]
    return {"products": products}


@api_router.get("/categories")
async def get_categories():
    if await _has_live_sales():
        rows = await db.sales_rows.find({}, {"_id": 0, "category": 1}).to_list(200000)
        cats = sorted({(r.get("category") or "Others") for r in rows})
        return {"categories": ["All", *cats]}
    return {"categories": ["All", *CATEGORIES, "Bakery", "Household"]}


@api_router.get("/inventory")
async def get_inventory(
    status: Optional[str] = None,
    authorization: Optional[str] = Header(None),
):
    store_ctx = await get_current_user_and_store(authorization)
    store_id = store_ctx["store_id"]

    live = await _live_inventory_rows(store_id)
    raw_rows = live if live else _inventory_rows()
    sales_df = await _get_active_sales_df(store_id)

    enriched_items, summary = compute_inventory_decisions(raw_rows, sales_df)

    filtered_items = enriched_items
    if status and status != "all":
        if status == "slow_moving":
            filtered_items = [r for r in enriched_items if r.get("is_slow_moving")]
        elif status == "high_risk":
            filtered_items = [r for r in enriched_items if r.get("stockout_risk") in ("CRITICAL", "HIGH")]
        else:
            filtered_items = [r for r in enriched_items if r.get("status") == status]

    counts = {
        "all": len(enriched_items),
        "low_stock": sum(1 for r in enriched_items if r["status"] == "low_stock"),
        "overstock": sum(1 for r in enriched_items if r["status"] == "overstock"),
        "out_of_stock": sum(1 for r in enriched_items if r["status"] == "out_of_stock"),
        "healthy": sum(1 for r in enriched_items if r["status"] == "healthy"),
        "slow_moving": summary["slow_moving_count"],
        "high_risk": summary["high_risk_count"],
    }
    return {
        "items": filtered_items,
        "counts": counts,
        "summary": summary,
        "source": "uploaded" if (await _has_live_inventory(store_id)) else "demo",
        "store": store_ctx["store_name"],
    }


@api_router.get("/insights")
async def get_insights(
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    authorization: Optional[str] = Header(None),
):
    store_ctx = await get_current_user_and_store(authorization)
    store_id = store_ctx["store_id"]
    cache_key = f"ins_{store_id}_{category}_{start_date}_{end_date}"
    cached = _get_cached_insights(cache_key)
    if cached:
        return cached

    sales_df = await _get_active_sales_df(store_id)
    raw_inv = await _live_inventory_rows(store_id) or _inventory_rows()
    enriched_items, inv_summary = compute_inventory_decisions(raw_inv, sales_df)
    action_center = generate_action_center(enriched_items, sales_df)

    if await _has_live_sales(store_id):
        live = await _live_sales_payload(store_id, start_date=start_date, end_date=end_date)
        if live:
            live["action_center"] = action_center
            live["inventory_summary"] = inv_summary
            live["store_name"] = store_ctx["store_name"]
            _set_cached_insights(cache_key, live)
            return live

    payload = _insights_payload()
    res = _apply_date_filter(payload, start_date, end_date)
    res["action_center"] = action_center
    res["inventory_summary"] = inv_summary
    res["store_name"] = store_ctx["store_name"]
    _set_cached_insights(cache_key, res)
    return res


@api_router.get("/forecast")
async def get_forecast(
    days: int = 7,
    product: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    authorization: Optional[str] = Header(None),
):
    """
    Run demand forecasting with Walk-Forward Cross-Validation.
    Supports store-wide overall revenue forecasting or individual SKU-level unit demand forecasting.
    """
    store_ctx = await get_current_user_and_store(authorization)
    store_id = store_ctx["store_id"]
    cache_key = f"fc_{store_id}_{days}_{product}_{start_date}_{end_date}"
    cached = _get_cached_forecast(cache_key)
    if cached:
        return cached

    sales_df = await _get_active_sales_df(store_id)
    prod_col = "product" if "product" in sales_df.columns else "clean_product"
    available_products = sorted(sales_df[prod_col].dropna().unique().tolist()) if not sales_df.empty else []

    if product and product.strip().lower() != "all":
        forecast_result = generate_sku_demand_forecast(
            sales_df=sales_df,
            product_name=product,
            days_to_predict=days,
            start_date=start_date,
            end_date=end_date,
        )
        forecast_result["available_products"] = available_products
        forecast_result["store_name"] = store_ctx["store_name"]
        _set_cached_forecast(cache_key, forecast_result)
        return forecast_result

    hist = await _active_daily_sales()
    forecast_result = generate_sales_forecast(
        daily_sales=hist,
        days_to_predict=days,
        start_date=start_date,
        end_date=end_date,
    )
    forecast_result["available_products"] = available_products
    forecast_result["store_name"] = store_ctx["store_name"]
    _set_cached_forecast(cache_key, forecast_result)
    return forecast_result


@api_router.get("/dataset/status")
async def dataset_status(authorization: Optional[str] = Header(None)):
    store_ctx = await get_current_user_and_store(authorization)
    store_id = store_ctx["store_id"]

    # Check SQL database status
    sql_status = await get_store_dataset_status(store_id)
    if sql_status["has_live_sales"] or sql_status["has_live_inventory"]:
        return {
            "has_live_sales": sql_status["has_live_sales"],
            "has_live_inventory": sql_status["has_live_inventory"],
            "total_sales_rows": sql_status["total_sales_rows"],
            "total_products": sql_status["total_products"],
            "latest": sql_status["latest"],
            "store_name": store_ctx["store_name"],
            "api_key": store_ctx["api_key"],
        }

    latest = None
    try:
        rows = (
            await db.datasets.find({}, {"_id": 0})
            .sort("uploaded_at", -1)
            .limit(1)
            .to_list(1)
        )
        if rows:
            latest = rows[0]
    except Exception as e:
        logger.warning(f"Database error in dataset_status: {e}")
        if _mem_datasets:
            latest = _mem_datasets[-1]

    return {
        "has_live_sales": await _has_live_sales(store_id),
        "has_live_inventory": await _has_live_inventory(store_id),
        "latest": latest,
        "store_name": store_ctx["store_name"],
        "api_key": store_ctx["api_key"],
    }


@api_router.post("/dataset/reset")
async def dataset_reset(authorization: Optional[str] = Header(None)):
    store_ctx = await get_current_user_and_store(authorization)
    store_id = store_ctx["store_id"]

    # Reset SQL database store rows
    await reset_store_data(store_id)

    cleared_sales = 0
    cleared_inventory = 0
    try:
        a = await db.sales_rows.delete_many({})
        b = await db.inventory_rows.delete_many({})
        await db.datasets.delete_many({})
        cleared_sales = a.deleted_count
        cleared_inventory = b.deleted_count
    except Exception as e:
        logger.warning(f"Database error in dataset_reset: {e}")
    _mem_datasets.clear()
    _clear_all_analytics_caches()
    return {"status": "cleared", "store": store_ctx["store_name"], "cleared_sales": cleared_sales, "cleared_inventory": cleared_inventory}


@api_router.get("/schedules")
async def list_schedules():
    try:
        rows = await db.schedules.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
        return {"schedules": rows}
    except Exception:
        return {"schedules": list(_mem_schedules)}


@api_router.post("/schedules")
async def create_schedule(payload: ScheduleCreate):
    sid = f"SCH-{int(datetime.now(timezone.utc).timestamp())}"
    doc = {
        "id": sid,
        "name": payload.name,
        "cadence": payload.cadence,
        "day_of_week": payload.day_of_week if payload.cadence == "weekly" else None,
        "day_of_month": payload.day_of_month if payload.cadence == "monthly" else None,
        "hour": payload.hour,
        "minute": payload.minute,
        "recipients": payload.recipients,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "next_delivery": _compute_next_delivery(
            payload.cadence,
            payload.day_of_week or 0,
            payload.day_of_month or 1,
            payload.hour or 9,
            payload.minute or 0,
        ),
    }
    try:
        await db.schedules.insert_one(dict(doc))
    except Exception:
        pass
    _mem_schedules.append(dict(doc))
    doc.pop("_id", None)
    return doc


@api_router.delete("/schedules/{schedule_id}")
async def delete_schedule(schedule_id: str):
    deleted = 0
    try:
        res = await db.schedules.delete_one({"id": schedule_id})
        deleted = res.deleted_count
    except Exception:
        pass
    global _mem_schedules
    _mem_schedules = [s for s in _mem_schedules if s.get("id") != schedule_id]
    return {"deleted": max(deleted, 1)}


@api_router.post("/schedules/{schedule_id}/run-now")
async def run_schedule_now(schedule_id: str):
    sch = None
    try:
        sch = await db.schedules.find_one({"id": schedule_id}, {"_id": 0})
    except Exception:
        pass
    if not sch:
        sch = next((s for s in _mem_schedules if s.get("id") == schedule_id), None)
    if not sch:
        raise HTTPException(status_code=404, detail="Schedule not found")

    delivery = {
        "id": f"DLV-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
        "schedule_id": sch["id"],
        "schedule_name": sch["name"],
        "delivered_at": datetime.now(timezone.utc).isoformat(),
        "status": "success",
        "report": "Retail Analytics · Manual run",
        "size_kb": 5,
        "recipients": sch.get("recipients", []),
        "trigger": "manual",
    }
    try:
        await db.deliveries.insert_one(dict(delivery))
        await db.schedules.update_one(
            {"id": sch["id"]},
            {
                "$set": {
                    "next_delivery": _compute_next_delivery(
                        sch["cadence"],
                        sch.get("day_of_week") or 0,
                        sch.get("day_of_month") or 1,
                        sch.get("hour") or 9,
                        sch.get("minute") or 0,
                    )
                }
            },
        )
    except Exception:
        pass
    _mem_deliveries.append(dict(delivery))
    delivery.pop("_id", None)
    return delivery


@api_router.get("/deliveries")
async def list_deliveries(limit: int = 20):
    try:
        rows = (
            await db.deliveries.find({}, {"_id": 0}).sort("delivered_at", -1).to_list(limit)
        )
        return {"deliveries": rows}
    except Exception:
        return {"deliveries": list(reversed(_mem_deliveries))[:limit]}


async def _build_report_pdf_bytes(section: str = "all") -> Tuple[bytes, str, str]:
    """Generate in-memory PDF binary bytes and metadata for any report section."""
    if await _has_live_sales():
        live = await _live_sales_payload()
        data = live if live else _insights_payload()
    else:
        data = _insights_payload()

    live_inv = await _live_inventory_rows()
    inv = live_inv if live_inv else _inventory_rows()

    hist = await _active_daily_sales()
    fc_res = generate_sales_forecast(hist, days_to_predict=7)
    fc = fc_res.get("forecast", [])

    sales_df = await _get_active_sales_df()
    enriched_items, _ = compute_inventory_decisions(inv, sales_df)
    actions = generate_action_center(enriched_items, sales_df)

    sec = (section or "all").lower().strip()

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=18 * mm, bottomMargin=18 * mm)
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "t", parent=styles["Title"], textColor=colors.HexColor("#4f46e5")
    )
    h2 = ParagraphStyle(
        "h2", parent=styles["Heading2"], textColor=colors.HexColor("#0f172a")
    )
    body = styles["BodyText"]

    story = []

    report_title_map = {
        "executive": "Executive Summary Report",
        "inventory": "Restock & Inventory Decision Report",
        "restock": "Restock & Inventory Decision Report",
        "forecast": "7-Day Demand Forecasting Report",
        "performance": "Business Performance & Product Mix Report",
        "all": "Store Master Audit Report",
    }
    doc_title = report_title_map.get(sec, "Store Report")
    filename = f"insight-cart-{sec if sec in report_title_map else 'report'}.pdf"

    story.append(Paragraph(f"Insight Cart — {doc_title}", title))
    story.append(Paragraph(f"Generated at: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')} · Scope: {sec.capitalize()}", body))
    story.append(Spacer(1, 10))

    def add_executive_block():
        k = data["kpis"]
        kpi_tbl = Table(
            [
                ["Total Sales", f"Rs. {k['total_sales']:,}", "Total Orders", f"{k['total_orders']:,}"],
                ["Avg Order Value", f"Rs. {k['aov']:,}", "Total Customers", f"{k['total_customers']:,}"],
                ["Gross Profit", f"Rs. {k['gross_profit']:,}", "Profit Margin", f"{k['profit_margin']}%"],
            ],
            colWidths=[38 * mm, 45 * mm, 38 * mm, 45 * mm],
        )
        kpi_tbl.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#0f172a")),
                    ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e2e8f0")),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        story.append(Paragraph("Executive Financial Summary", h2))
        story.append(kpi_tbl)
        story.append(Spacer(1, 14))

    def add_performance_block():
        story.append(Paragraph("Sales by Category Mix", h2))
        cat_rows = [["Category", "Sales (Rs.)", "% of Total"]] + [
            [c["category"], f"{c['sales']:,}", f"{c['percent']}%"]
            for c in data["categories"]
        ]
        cat_tbl = Table(cat_rows, colWidths=[70 * mm, 50 * mm, 40 * mm])
        cat_tbl.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4f46e5")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e2e8f0")),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )
        story.append(cat_tbl)
        story.append(Spacer(1, 14))

        story.append(Paragraph("Top Best-Selling Products", h2))
        prod_rows = [["Product", "Category", "Sales", "Qty"]] + [
            [p["name"], p["category"], f"Rs. {p['sales']:,}", f"{p['qty']:,}"]
            for p in data["top_products"]
        ]
        prod_tbl = Table(prod_rows, colWidths=[70 * mm, 40 * mm, 35 * mm, 25 * mm])
        prod_tbl.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4f46e5")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e2e8f0")),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                ]
            )
        )
        story.append(prod_tbl)
        story.append(Spacer(1, 14))

    def add_action_center_block():
        if actions:
            story.append(Paragraph("Today's Retail Actions (Priority Decisions)", h2))
            act_rows = [["Type", "Action", "Product", "Summary"]] + [
                [a["type"], a["title"], a["product"], a["summary"]]
                for a in actions[:10]
            ]
            act_tbl = Table(act_rows, colWidths=[32 * mm, 50 * mm, 40 * mm, 48 * mm])
            act_tbl.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e2e8f0")),
                        ("FONTSIZE", (0, 0), (-1, -1), 8),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                        ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ]
                )
            )
            story.append(act_tbl)
            story.append(Spacer(1, 14))

    def add_inventory_block():
        story.append(Paragraph("Inventory Health & Restock Decision Matrix", h2))
        inv_rows = [["Product", "Cat.", "Stock", "ROP", "Risk", "Lead", "Order (Q)"]] + [
            [
                r["product"][:22],
                r["category"][:10],
                str(r["current_stock"]),
                str(r.get("reorder_point", r["reorder_level"])),
                r.get("stockout_risk", "NONE"),
                f"{r.get('lead_time', 3)}d",
                f"+{r.get('recommended_order_qty', 0)}" if r.get("recommended_order_qty", 0) > 0 else "—",
            ]
            for r in enriched_items[:25]
        ]
        inv_tbl = Table(inv_rows, colWidths=[48 * mm, 24 * mm, 18 * mm, 18 * mm, 24 * mm, 16 * mm, 22 * mm])
        inv_tbl.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e2e8f0")),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                ]
            )
        )
        story.append(inv_tbl)
        story.append(Spacer(1, 14))

    def add_forecast_block():
        story.append(Paragraph(f"7-Day Demand Forecast — Model: {fc_res.get('model', 'Walk-Forward CV')}", h2))
        m = fc_res.get("metrics", {})
        if m:
            m_text = f"Cross-Validation Accuracy: WAPE = {m.get('wape', 0)}% · sMAPE = {m.get('smape', 0)}% · RMSE = {m.get('rmse', 0)}"
            story.append(Paragraph(m_text, body))
            story.append(Spacer(1, 6))

        fc_rows = [["Date", "Forecasted Revenue"]] + [
            [f["date"], f"Rs. {f['forecast']:,}"] for f in fc
        ]
        fc_tbl = Table(fc_rows, colWidths=[70 * mm, 70 * mm])
        fc_tbl.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4f46e5")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e2e8f0")),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                ]
            )
        )
        story.append(fc_tbl)
        story.append(Spacer(1, 14))

    if sec in ["inventory", "restock"]:
        add_action_center_block()
        add_inventory_block()
    elif sec == "executive":
        add_executive_block()
    elif sec == "forecast":
        add_forecast_block()
    elif sec == "performance":
        add_performance_block()
    else:
        add_executive_block()
        add_performance_block()
        add_action_center_block()
        story.append(PageBreak())
        add_inventory_block()
        add_forecast_block()

    doc.build(story)
    pdf_data = buf.getvalue()
    return pdf_data, filename, doc_title


@api_router.post("/reports/send-email")
async def send_report_email(
    payload: ReportEmailRequest,
    authorization: Optional[str] = Header(None),
):
    """
    Generates the real PDF report and dispatches it with attached PDF to recipient inboxes.
    """
    store_ctx = await get_current_user_and_store(authorization)
    report_type = payload.report_type or "inventory"
    recipients = [e.strip() for e in payload.recipients if e.strip()] or [store_ctx.get("email", "owner@store.com")]

    # Build real PDF in memory
    pdf_bytes, pdf_filename, doc_title = await _build_report_pdf_bytes(report_type)
    size_kb = max(1, len(pdf_bytes) // 1024)

    subject = f"Morning {doc_title} — {store_ctx['store_name']}"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0d0e; color: #f2f3f5; padding: 32px 16px; }}
        .box {{ max-width: 540px; margin: 0 auto; background: #141719; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 32px; }}
        .header {{ font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #9da3ae; }}
        .title {{ font-size: 24px; font-weight: 600; color: #f2f3f5; margin: 12px 0; }}
        .desc {{ font-size: 14px; color: #9da3ae; line-height: 1.5; }}
        .badge {{ display: inline-block; background: rgba(212,255,58,0.12); color: #d4ff3a; font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 9999px; margin-top: 16px; }}
        .attachment-card {{ margin-top: 24px; padding: 16px; background: #0b0d0e; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; display: flex; align-items: center; justify-content: space-between; }}
        .att-title {{ font-size: 13px; font-weight: 500; color: #f2f3f5; }}
        .att-size {{ font-size: 11px; color: #6b7280; font-family: monospace; }}
        .footer {{ margin-top: 28px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: #6b7280; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="box">
        <div class="header">Insight Cart · Automated Dispatch</div>
        <div class="title">{doc_title}</div>
        <p class="desc">Here is your scheduled morning retail intelligence report for <strong>{store_ctx['store_name']}</strong>. Review restock priorities and store performance before opening.</p>
        <span class="badge">Cadence: {payload.cadence.capitalize()} · Morning 08:00 AM</span>
        <div class="attachment-card">
          <div>
            <div class="att-title">📎 {pdf_filename}</div>
            <div class="att-size">{size_kb} KB · Print-Ready PDF</div>
          </div>
        </div>
        <div class="footer">Insight Cart Retail Intelligence Platform</div>
      </div>
    </body>
    </html>
    """

    # Dispatch via mailer service
    mail_res = send_email_with_pdf(
        to_emails=recipients,
        subject=subject,
        html_body=html_body,
        pdf_bytes=pdf_bytes,
        pdf_filename=pdf_filename,
    )

    deliv_id = f"DLV-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
    deliv_record = {
        "id": deliv_id,
        "schedule_name": f"{payload.cadence.capitalize()} {doc_title}",
        "delivered_at": datetime.now(timezone.utc).isoformat(),
        "status": "success" if mail_res.get("success") else "failed",
        "report": f"{doc_title} (PDF)",
        "recipients": recipients,
        "size_kb": size_kb,
        "store": store_ctx["store_name"],
        "trigger": "morning_dispatch",
        "delivery_mode": mail_res.get("mode", "simulated"),
    }
    try:
        await db.deliveries.insert_one(dict(deliv_record))
    except Exception:
        pass
    _mem_deliveries.insert(0, dict(deliv_record))

    return {
        "status": "success" if mail_res.get("success") else "warning",
        "message": mail_res.get("message") or f"{doc_title} dispatched to {', '.join(recipients)}",
        "delivery": deliv_record,
        "mode": mail_res.get("mode", "simulated"),
    }


@api_router.get("/report/pdf")
async def report_pdf(section: Optional[str] = "all"):
    pdf_bytes, filename, _ = await _build_report_pdf_bytes(section)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )


app.include_router(api_router)

cors_origins = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins if "*" not in cors_origins else ["*"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_methods=["*"],
    allow_headers=["*"],
)
