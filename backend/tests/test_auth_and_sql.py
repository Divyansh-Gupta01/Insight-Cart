import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
import pandas as pd
from datetime import datetime, timezone

from sql_database import (
    init_sql_db,
    register_user,
    authenticate_user,
    save_incremental_sales_and_inventory,
    load_store_sales_dataframe,
    load_store_inventory_list,
    get_store_dataset_status,
    reset_store_data,
)


@pytest.mark.anyio
async def test_user_registration_and_authentication():
    await init_sql_db()
    
    unique_user = f"test_shop_{int(datetime.now(timezone.utc).timestamp())}"
    unique_email = f"{unique_user}@retail.com"
    
    # 1. Register new store owner
    user, err = await register_user(
        username=unique_user,
        email=unique_email,
        password="secure_password_123",
        store_name="Metro Hypermarket",
    )
    assert err is None
    assert user is not None
    assert user.store_name == "Metro Hypermarket"
    assert user.api_key.startswith("ci_live_")
    
    # 2. Authenticate
    auth_user = await authenticate_user(unique_user, "secure_password_123")
    assert auth_user is not None
    assert auth_user.id == user.id
    
    # 3. Wrong password fails
    bad_auth = await authenticate_user(unique_user, "wrong_pass")
    assert bad_auth is None


@pytest.mark.anyio
async def test_incremental_sales_and_inventory_ingestion():
    await init_sql_db()
    
    unique_user = f"store_inc_{int(datetime.now(timezone.utc).timestamp())}"
    user, _ = await register_user(unique_user, f"{unique_user}@store.com", "pass123", "City Mart")
    store_id = user.id
    
    # Batch 1: Initial sales and inventory
    df_batch1 = pd.DataFrame([
        {
            "clean_date": "2025-05-01",
            "clean_product": "Amul Milk 1L",
            "clean_category": "Dairy",
            "clean_qty": 5,
            "clean_amount": 340.0,
            "clean_cost": 54.0,
            "clean_stock": 25,
            "clean_reorder": 10,
            "clean_lead_time": 2,
            "clean_payment": "UPI",
            "clean_customer": "CUST-001",
            "clean_invoice": "INV-001",
        },
        {
            "clean_date": "2025-05-01",
            "clean_product": "Whole Wheat Bread",
            "clean_category": "Bakery",
            "clean_qty": 3,
            "clean_amount": 150.0,
            "clean_cost": 36.0,
            "clean_stock": 12,
            "clean_reorder": 8,
            "clean_lead_time": 1,
            "clean_payment": "Cash",
            "clean_customer": "CUST-002",
            "clean_invoice": "INV-002",
        },
    ])
    
    res1 = await save_incremental_sales_and_inventory(
        store_id=store_id,
        filename="batch1.csv",
        dataset_id="DS-BATCH-1",
        cleaned_df=df_batch1,
        mapping={"current_stock": "clean_stock"},
        kind="sales",
    )
    assert res1["new_inserted_rows"] == 2
    assert res1["total_accumulated_sales"] == 2
    
    # Batch 2: New sales on day 2 with updated shelf stock
    df_batch2 = pd.DataFrame([
        {
            "clean_date": "2025-05-02",
            "clean_product": "Amul Milk 1L",
            "clean_category": "Dairy",
            "clean_qty": 8,
            "clean_amount": 544.0,
            "clean_cost": 54.0,
            "clean_stock": 17, # stock decreased from 25 to 17
            "clean_reorder": 10,
            "clean_lead_time": 2,
            "clean_payment": "Card",
            "clean_customer": "CUST-003",
            "clean_invoice": "INV-003",
        },
    ])
    
    res2 = await save_incremental_sales_and_inventory(
        store_id=store_id,
        filename="batch2.csv",
        dataset_id="DS-BATCH-2",
        cleaned_df=df_batch2,
        mapping={"current_stock": "clean_stock"},
        kind="sales",
    )
    assert res2["new_inserted_rows"] == 1
    assert res2["total_accumulated_sales"] == 3 # 2 + 1 = 3 rows total
    
    # Verify accumulated history
    sales_df = await load_store_sales_dataframe(store_id)
    assert len(sales_df) == 3
    
    # Verify product stock was updated to latest 17
    prods = await load_store_inventory_list(store_id)
    milk = next(p for p in prods if p["product"] == "Amul Milk 1L")
    assert milk["current_stock"] == 17
    
    # Clean up test store
    await reset_store_data(store_id)
    status = await get_store_dataset_status(store_id)
    assert status["total_sales_rows"] == 0


@pytest.mark.anyio
async def test_password_reset_otp_workflow():
    await init_sql_db()
    from sql_database import (
        create_password_reset_otp,
        verify_password_reset_otp,
        reset_user_password,
    )
    from mailer import send_otp_email, send_email_with_pdf

    unique_user = f"owner_pwd_{int(datetime.now(timezone.utc).timestamp())}"
    email = f"{unique_user}@supermarket.com"
    user, _ = await register_user(unique_user, email, "old_password_123", "Apex Foods")
    assert user is not None

    # Step 1: Request OTP
    otp_code, reset_token, found_user = await create_password_reset_otp(email)
    assert otp_code is not None
    assert len(otp_code) == 6
    assert found_user.email == email

    # Test mailer dispatch
    mail_res = send_otp_email(email, otp_code, "Apex Foods")
    assert mail_res["success"] is True

    # Step 2: Verify wrong OTP fails
    bad_res, _, bad_err = await verify_password_reset_otp(email, "000000")
    assert bad_res is False
    assert bad_err is not None

    # Verify correct OTP passes
    valid, verified_token, err = await verify_password_reset_otp(email, otp_code)
    assert valid is True
    assert verified_token == reset_token
    assert err is None

    # Step 3: Reset password
    success, reset_err = await reset_user_password(verified_token, "new_super_password_99")
    assert success is True
    assert reset_err is None

    # Step 4: Verify login with new password
    new_auth = await authenticate_user(email, "new_super_password_99")
    assert new_auth is not None
    assert new_auth.id == user.id

    # Old password should fail
    old_auth = await authenticate_user(email, "old_password_123")
    assert old_auth is None

    # Token cannot be re-used
    reuse_success, _ = await reset_user_password(verified_token, "another_password")
    assert reuse_success is False


@pytest.mark.anyio
async def test_email_with_pdf_service():
    from mailer import send_email_with_pdf

    pdf_sample = b"%PDF-1.4 sample pdf content for test"
    res = send_email_with_pdf(
        to_emails=["test@store.com"],
        subject="Test Report Dispatch",
        html_body="<h2>Test Report Ready</h2>",
        pdf_bytes=pdf_sample,
        pdf_filename="Restock_Report.pdf",
    )
    assert res["success"] is True
    assert "Restock_Report.pdf" in res["message"]

