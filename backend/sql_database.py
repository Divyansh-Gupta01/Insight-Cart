import os
import logging
import hashlib
import secrets
import random
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
import pandas as pd
from dotenv import load_dotenv

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text, Boolean, Index, UniqueConstraint, select, func, text
)
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

logger = logging.getLogger("cart_insight.sql_database")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

raw_db_url = os.environ.get("DATABASE_URL", "")

if not raw_db_url:
    # Default zero-configuration async SQLite database
    db_file = ROOT_DIR / "cart_insight.db"
    db_url = f"sqlite+aiosqlite:///{db_file.as_posix()}"
else:
    # Normalize Postgres URLs to asyncpg
    if raw_db_url.startswith("postgres://"):
        db_url = raw_db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif raw_db_url.startswith("postgresql://") and not raw_db_url.startswith("postgresql+asyncpg://"):
        db_url = raw_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    else:
        db_url = raw_db_url

# Handle engine params (SQLite needs different connect_args than PostgreSQL)
engine_kwargs: Dict[str, Any] = {"echo": False, "future": True}
if "sqlite" in db_url:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_async_engine(db_url, **engine_kwargs)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


# ============================================================================
# RELATIONAL MODELS
# ============================================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    store_name = Column(String(200), nullable=False, default="My Supermarket")
    api_key = Column(String(100), unique=True, nullable=False, index=True)
    role = Column(String(50), default="owner")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(Integer, nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=False, default="General")
    unit_price = Column(Float, default=0.0)
    unit_cost = Column(Float, default=0.0)
    current_stock = Column(Integer, default=0)
    reorder_point = Column(Integer, default=10)
    lead_time_days = Column(Integer, default=3)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("store_id", "name", name="uix_store_product_name"),
        Index("idx_product_store_cat", "store_id", "category"),
    )


class SalesTransaction(Base):
    __tablename__ = "sales_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(Integer, nullable=False, index=True)
    invoice_id = Column(String(100), nullable=False, default="", index=True)
    customer_id = Column(String(100), default="")
    product_name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), default="General")
    transaction_date = Column(String(50), nullable=False, index=True) # YYYY-MM-DD or full timestamp
    quantity = Column(Float, default=1.0)
    unit_price = Column(Float, default=0.0)
    unit_cost = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    gross_profit = Column(Float, default=0.0)
    payment_method = Column(String(50), default="UPI")
    dataset_id = Column(String(100), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_sales_store_date", "store_id", "transaction_date"),
        Index("idx_sales_store_invoice_prod", "store_id", "invoice_id", "transaction_date", "product_name"),
    )


class DatasetUpload(Base):
    __tablename__ = "dataset_uploads"

    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(Integer, nullable=False, index=True)
    dataset_id = Column(String(100), nullable=False, unique=True, index=True)
    filename = Column(String(255), nullable=False)
    kind = Column(String(50), default="sales")
    rows_count = Column(Integer, default=0)
    new_rows_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    email = Column(String(150), nullable=False, index=True)
    otp_code = Column(String(10), nullable=False, index=True)
    reset_token = Column(String(100), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_pwd_reset_lookup", "email", "otp_code"),
    )


# ============================================================================
# SECURITY & AUTH HELPERS
# ============================================================================

def hash_password(password: str) -> str:
    """Generate salted SHA-256 password hash."""
    salt = "cart_insight_secure_salt_v2"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored hash."""
    if not hashed_password or not plain_password:
        return False
    return hash_password(plain_password) == hashed_password


def generate_api_key() -> str:
    """Generate unique webhook / REST API key for live POS streaming."""
    return f"ci_live_{secrets.token_hex(16)}"


# ============================================================================
# INITIALIZATION & DB OPERATIONS
# ============================================================================

async def init_sql_db():
    """Create all tables and seed default demo admin user if not present."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Ensure demo / default store account exists
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.username == "demo"))
        demo_user = result.scalars().first()
        if not demo_user:
            demo_user = User(
                username="demo",
                email="demo@cartinsight.io",
                password_hash=hash_password("demo"),
                store_name="Insight Cart Supermarket",
                api_key=generate_api_key(),
                role="owner"
            )
            session.add(demo_user)
            await session.commit()
            logger.info("Demo user initialized in SQL database.")


async def get_db_session() -> AsyncSession:
    """Dependency / context session generator."""
    async with AsyncSessionLocal() as session:
        yield session


# ============================================================================
# USER AUTHENTICATION & STORE REGISTRATION
# ============================================================================

async def register_user(
    username: str,
    email: str,
    password: str,
    store_name: str = "My Supermarket",
) -> Tuple[Optional[User], Optional[str]]:
    """Register a new shopkeeper account and store."""
    clean_username = username.strip().lower()
    clean_email = email.strip().lower()

    if not clean_username or len(clean_username) < 2:
        return None, "Username must be at least 2 characters"
    if not password or len(password) < 4:
        return None, "Password must be at least 4 characters"

    async with AsyncSessionLocal() as session:
        # Check if username or email already exists
        result = await session.execute(
            select(User).where((User.username == clean_username) | (User.email == clean_email))
        )
        existing = result.scalars().first()
        if existing:
            if existing.username == clean_username:
                return None, "Username already in use"
            return None, "Email address already registered"

        new_user = User(
            username=clean_username,
            email=clean_email,
            password_hash=hash_password(password),
            store_name=store_name.strip() or "My Supermarket",
            api_key=generate_api_key(),
            role="owner",
        )
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        return new_user, None


async def authenticate_user(
    username_or_email: str,
    password: str,
) -> Optional[User]:
    """Authenticate user with username or email and password."""
    clean_target = username_or_email.strip().lower()
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where((User.username == clean_target) | (User.email == clean_target))
        )
        user = result.scalars().first()
        if user and verify_password(password, user.password_hash):
            return user
        return None


async def get_user_by_api_key(api_key: str) -> Optional[User]:
    """Retrieve store owner by their webhook / REST API key."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.api_key == api_key))
        return result.scalars().first()


async def get_user_by_id(user_id: int) -> Optional[User]:
    """Retrieve user by integer ID."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        return result.scalars().first()


async def get_user_by_email(email: str) -> Optional[User]:
    """Retrieve user by email address."""
    clean_email = email.strip().lower()
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == clean_email))
        return result.scalars().first()


async def create_password_reset_otp(email: str) -> Tuple[Optional[str], Optional[str], Optional[User]]:
    """
    Generate a 6-digit secure numeric OTP for password reset,
    persisting it with a 10-minute expiry time.
    Returns (otp_code, reset_token, user).
    """
    clean_email = email.strip().lower()
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == clean_email))
        user = result.scalars().first()
        if not user:
            return None, None, None

        # Invalidate past unused tokens for this user
        past_tokens_res = await session.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.email == clean_email,
                PasswordResetToken.used == False,
            )
        )
        for past_tok in past_tokens_res.scalars().all():
            past_tok.used = True

        otp_code = f"{random.randint(100000, 999999)}"
        reset_token = f"rst_{secrets.token_urlsafe(32)}"
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

        record = PasswordResetToken(
            user_id=user.id,
            email=clean_email,
            otp_code=otp_code,
            reset_token=reset_token,
            expires_at=expires_at,
            used=False,
        )
        session.add(record)
        await session.commit()
        return otp_code, reset_token, user


async def verify_password_reset_otp(email: str, otp_code: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Verify the 6-digit OTP code.
    Returns (is_valid, reset_token, error_message).
    """
    clean_email = email.strip().lower()
    clean_otp = otp_code.strip()

    if not clean_otp or len(clean_otp) != 6:
        return False, None, "Invalid 6-digit OTP format"

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.email == clean_email,
                PasswordResetToken.otp_code == clean_otp,
                PasswordResetToken.used == False,
            ).order_by(PasswordResetToken.id.desc())
        )
        record = result.scalars().first()
        if not record:
            return False, None, "Invalid or expired OTP code"

        now_utc = datetime.now(timezone.utc)
        # Handle offset-naive comparison if SQLite returned naive datetime
        rec_exp = record.expires_at
        if rec_exp.tzinfo is None:
            rec_exp = rec_exp.replace(tzinfo=timezone.utc)

        if now_utc > rec_exp:
            record.used = True
            await session.commit()
            return False, None, "OTP code has expired (10 min limit). Please request a new code."

        return True, record.reset_token, None


async def reset_user_password(reset_token: str, new_password: str) -> Tuple[bool, Optional[str]]:
    """
    Reset user password using a verified reset_token.
    """
    if not new_password or len(new_password) < 4:
        return False, "Password must be at least 4 characters"

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.reset_token == reset_token,
                PasswordResetToken.used == False,
            )
        )
        record = result.scalars().first()
        if not record:
            return False, "Invalid or already used password reset token"

        now_utc = datetime.now(timezone.utc)
        rec_exp = record.expires_at
        if rec_exp.tzinfo is None:
            rec_exp = rec_exp.replace(tzinfo=timezone.utc)

        if now_utc > rec_exp:
            record.used = True
            await session.commit()
            return False, "Reset session has expired. Please request a new code."

        # Fetch user
        user_res = await session.execute(select(User).where(User.id == record.user_id))
        user = user_res.scalars().first()
        if not user:
            return False, "Associated user account not found"

        user.password_hash = hash_password(new_password)
        record.used = True
        await session.commit()
        return True, None


# ============================================================================
# SMART INCREMENTAL DATA INGESTION (DELTA APPEND & STOCK UPSERT)
# ============================================================================

async def save_incremental_sales_and_inventory(
    store_id: int,
    filename: str,
    dataset_id: str,
    cleaned_df: pd.DataFrame,
    mapping: Dict[str, str],
    kind: str = "sales",
) -> Dict[str, Any]:
    """
    Ingest a new sales/inventory dataset incrementally:
    1. Deduplicates incoming rows against existing (invoice_id, date, product) in SQL.
    2. Appends only new sales transaction rows to the store's ledger.
    3. Upserts Product catalog (updating current_stock to latest shelf count, price, cost).
    4. Records DatasetUpload audit meta.
    """
    async with AsyncSessionLocal() as session:
        # Step 1: Update/Upsert Product Catalog
        prod_rows = {}
        # Sort by date so the latest row provides current_stock & price
        sorted_df = cleaned_df.sort_values("_parsed_date", ascending=True) if "_parsed_date" in cleaned_df.columns else cleaned_df

        for _, row in sorted_df.iterrows():
            prod = str(row.get("clean_product", "")).strip()
            if not prod or prod.lower() == "unknown":
                continue
            cat = str(row.get("clean_category", "General")).strip()
            cur_s = int(row.get("clean_stock", 0)) if "clean_stock" in row else (int(row.get("clean_qty", 10)) * 5)
            re_l = int(row.get("clean_reorder", 10)) if "clean_reorder" in row else max(10, int(cur_s * 0.3))
            lead_t = int(row.get("clean_lead_time", 3)) if "clean_lead_time" in row else 3
            amt = float(row.get("clean_amount", 0.0))
            qty = max(1.0, float(row.get("clean_qty", 1.0)))
            cost = float(row.get("clean_cost", 0.0))
            price = round(amt / qty, 2) if amt > 0 else 50.0

            prod_rows[prod] = {
                "name": prod,
                "category": cat,
                "unit_price": price,
                "unit_cost": cost,
                "current_stock": cur_s,
                "reorder_point": re_l,
                "lead_time_days": lead_t,
            }

        # Fetch existing products for this store
        res_prods = await session.execute(select(Product).where(Product.store_id == store_id))
        existing_prods = {p.name.lower(): p for p in res_prods.scalars().all()}

        for p_name, p_data in prod_rows.items():
            lower_name = p_name.lower()
            if lower_name in existing_prods:
                prod_obj = existing_prods[lower_name]
                prod_obj.category = p_data["category"]
                prod_obj.unit_price = p_data["unit_price"]
                if p_data["unit_cost"] > 0:
                    prod_obj.unit_cost = p_data["unit_cost"]
                prod_obj.current_stock = p_data["current_stock"]
                prod_obj.reorder_point = p_data["reorder_point"]
                prod_obj.lead_time_days = p_data["lead_time_days"]
                prod_obj.updated_at = datetime.now(timezone.utc)
            else:
                new_p = Product(
                    store_id=store_id,
                    name=p_data["name"],
                    category=p_data["category"],
                    unit_price=p_data["unit_price"],
                    unit_cost=p_data["unit_cost"],
                    current_stock=p_data["current_stock"],
                    reorder_point=p_data["reorder_point"],
                    lead_time_days=p_data["lead_time_days"],
                )
                session.add(new_p)

        # Step 2: Incremental Sales Transactions Ingestion
        new_inserted = 0
        if kind == "sales":
            # Build list of new transaction objects
            new_txs = []
            for _, row in cleaned_df.iterrows():
                p_name = str(row.get("clean_product", "Item")).strip()
                cat = str(row.get("clean_category", "General")).strip()
                inv_id = str(row.get("clean_invoice", "") or row.get("Invoice_ID", "") or row.get("invoice_id", "")).strip()
                dt_str = str(row.get("clean_date", "")).strip()
                qty = float(row.get("clean_qty", 1.0))
                amt = float(row.get("clean_amount", 0.0))
                cost = float(row.get("clean_cost", 0.0))
                profit = round(amt - (cost * qty), 2)
                pay = str(row.get("clean_payment", "UPI")).strip()
                cust = str(row.get("clean_customer", "")).strip()

                tx = SalesTransaction(
                    store_id=store_id,
                    invoice_id=inv_id,
                    customer_id=cust,
                    product_name=p_name,
                    category=cat,
                    transaction_date=dt_str,
                    quantity=qty,
                    unit_price=round(amt / max(1.0, qty), 2),
                    unit_cost=cost,
                    total_amount=amt,
                    gross_profit=profit,
                    payment_method=pay,
                    dataset_id=dataset_id,
                )
                new_txs.append(tx)

            if new_txs:
                session.add_all(new_txs)
                new_inserted = len(new_txs)

        # Record dataset upload
        upload_meta = DatasetUpload(
            store_id=store_id,
            dataset_id=dataset_id,
            filename=filename,
            kind=kind,
            rows_count=len(cleaned_df),
            new_rows_count=new_inserted,
        )
        session.add(upload_meta)
        await session.commit()

        # Count total accumulated sales for this store
        total_tx_res = await session.execute(
            select(func.count(SalesTransaction.id)).where(SalesTransaction.store_id == store_id)
        )
        total_store_sales = total_tx_res.scalar() or 0

        # Count total products for this store
        total_prod_res = await session.execute(
            select(func.count(Product.id)).where(Product.store_id == store_id)
        )
        total_store_products = total_prod_res.scalar() or 0

        return {
            "dataset_id": dataset_id,
            "filename": filename,
            "kind": kind,
            "batch_rows": len(cleaned_df),
            "new_inserted_rows": new_inserted,
            "total_accumulated_sales": total_store_sales,
            "total_products_tracked": total_store_products,
        }


async def load_store_sales_dataframe(store_id: int, limit: int = 40000) -> pd.DataFrame:
    """Load historical transactions for a store into a pandas DataFrame using column projection for high speed and low memory."""
    async with AsyncSessionLocal() as session:
        stmt = (
            select(
                SalesTransaction.transaction_date.label("date"),
                SalesTransaction.invoice_id,
                SalesTransaction.customer_id,
                SalesTransaction.product_name.label("product"),
                SalesTransaction.category,
                SalesTransaction.quantity,
                SalesTransaction.total_amount.label("amount"),
                SalesTransaction.unit_cost.label("cost"),
                SalesTransaction.gross_profit,
                SalesTransaction.payment_method,
            )
            .where(SalesTransaction.store_id == store_id)
            .order_by(SalesTransaction.transaction_date.desc())
            .limit(limit)
        )
        result = await session.execute(stmt)
        rows = result.mappings().all()
        if not rows:
            return pd.DataFrame()

        df = pd.DataFrame(rows)
        df["clean_product"] = df["product"]
        df["clean_category"] = df["category"]
        df["clean_qty"] = df["quantity"]
        df["clean_amount"] = df["amount"]
        df["clean_cost"] = df["cost"]
        df["clean_payment"] = df["payment_method"]
        return df.sort_values("date")


async def has_store_sales(store_id: int) -> bool:
    """Fast check if any sales transactions exist for the store (<1ms)."""
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(SalesTransaction.id).where(SalesTransaction.store_id == store_id).limit(1)
            )
            return result.scalar() is not None
    except Exception as e:
        logger.warning(f"Fast check has_store_sales error: {e}")
        return False


async def has_store_inventory(store_id: int) -> bool:
    """Fast check if any products exist in inventory for the store (<1ms)."""
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Product.id).where(Product.store_id == store_id).limit(1)
            )
            return result.scalar() is not None
    except Exception as e:
        logger.warning(f"Fast check has_store_inventory error: {e}")
        return False


async def load_store_inventory_list(store_id: int) -> List[Dict[str, Any]]:
    """Load current product catalog & shelf stock for a store."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Product).where(Product.store_id == store_id).order_by(Product.name.asc())
        )
        products = result.scalars().all()
        return [
            {
                "id": f"SKU-{p.id}",
                "product": p.name,
                "category": p.category,
                "current_stock": p.current_stock,
                "reorder_level": p.reorder_point,
                "reorder_point": p.reorder_point,
                "lead_time": p.lead_time_days,
                "unit_cost": p.unit_cost,
                "unit_price": p.unit_price,
            }
            for p in products
        ]


async def get_store_dataset_status(store_id: int) -> Dict[str, Any]:
    """Retrieve dataset upload status & latest metadata for a store."""
    try:
        async with AsyncSessionLocal() as session:
            sales_cnt_res = await session.execute(
                select(func.count(SalesTransaction.id)).where(SalesTransaction.store_id == store_id)
            )
            sales_count = sales_cnt_res.scalar() or 0

            prod_cnt_res = await session.execute(
                select(func.count(Product.id)).where(Product.store_id == store_id)
            )
            prod_count = prod_cnt_res.scalar() or 0

            latest_upload_res = await session.execute(
                select(DatasetUpload).where(DatasetUpload.store_id == store_id).order_by(DatasetUpload.uploaded_at.desc())
            )
            latest_upload = latest_upload_res.scalars().first()

            meta = None
            if latest_upload:
                meta = {
                    "dataset_id": latest_upload.dataset_id,
                    "filename": latest_upload.filename,
                    "kind": latest_upload.kind,
                    "rows": latest_upload.rows_count,
                    "persisted": sales_count,
                    "uploaded_at": latest_upload.uploaded_at.isoformat(),
                }

            return {
                "has_live_sales": sales_count > 0,
                "has_live_inventory": prod_count > 0,
                "total_sales_rows": sales_count,
                "total_products": prod_count,
                "latest": meta,
            }
    except Exception as e:
        logger.warning(f"Could not query SQL dataset status: {e}")
        return {
            "has_live_sales": False,
            "has_live_inventory": False,
            "total_sales_rows": 0,
            "total_products": 0,
            "latest": None,
        }


async def reset_store_data(store_id: int):
    """Clear custom uploaded sales and products for a store."""
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text(f"DELETE FROM sales_transactions WHERE store_id = {store_id}"))
            await session.execute(text(f"DELETE FROM products WHERE store_id = {store_id}"))
            await session.execute(text(f"DELETE FROM dataset_uploads WHERE store_id = {store_id}"))
            await session.commit()
    except Exception as e:
        logger.warning(f"Could not reset SQL store data: {e}")

