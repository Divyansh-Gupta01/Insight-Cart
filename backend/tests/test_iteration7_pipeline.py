"""Iteration 7 backend tests: uploaded CSV as single source of truth."""
import io
import os
import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") + "/api"

SAMPLE_HEADER = "date,product,category,quantity,amount,payment_method,current_stock,reorder_level"


def _sample_csv():
    rows = [SAMPLE_HEADER]
    # Create 15 unique products across 10 days
    products = [
        ("Amul Gold Milk 1L", "Dairy", 60, 62, 42, 60),
        ("Lay's Classic 52g", "Snacks", 30, 30, 320, 200),
        ("Coca Cola 750ml", "Beverages", 40, 40, 12, 80),
        ("Aashirvaad Atta 5kg", "Others", 260, 260, 88, 40),
        ("Maggi 2-Min Noodles", "Snacks", 20, 20, 0, 100),
    ]
    for d in range(1, 11):
        for i, (p, c, price, amt, stock, reorder) in enumerate(products):
            rows.append(f"2025-05-{d:02d} 10:{i:02d},{p},{c},2,{amt*2},UPI,{stock},{reorder}")
    return "\n".join(rows).encode("utf-8")


@pytest.fixture(scope="module", autouse=True)
def clean_state():
    # Ensure clean start
    requests.post(f"{BASE_URL}/dataset/reset", timeout=30)
    yield
    # Leave in demo state at end
    requests.post(f"{BASE_URL}/dataset/reset", timeout=30)


class TestPipeline:
    def test_status_initial_no_live(self):
        r = requests.get(f"{BASE_URL}/dataset/status", timeout=30)
        assert r.status_code == 200
        assert r.json()["has_live_sales"] is False

    def test_upload_missing_required_amount(self):
        # Missing 'amount'
        header = "date,product,category,quantity,payment_method"
        csv = f"{header}\n2025-05-01,Milk,Dairy,2,UPI\n".encode()
        files = {"file": ("bad.csv", csv, "text/csv")}
        r = requests.post(f"{BASE_URL}/upload", files=files, timeout=30)
        assert r.status_code == 400, r.text
        detail = r.json().get("detail", "")
        assert "Missing required columns for sales dataset" in detail
        assert "amount" in detail

    def test_upload_valid_sample_persists_sales_and_inventory(self):
        files = {"file": ("sample.csv", _sample_csv(), "text/csv")}
        r = requests.post(f"{BASE_URL}/upload", files=files, timeout=60)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["rows"] > 0

        st = requests.get(f"{BASE_URL}/dataset/status", timeout=30).json()
        assert st["has_live_sales"] is True
        assert st["has_live_inventory"] is True
        assert st["latest"]["filename"] == "sample.csv"

    def test_insights_source_uploaded(self):
        r = requests.get(f"{BASE_URL}/insights", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["source"] == "uploaded"
        # Uploaded totals should NOT equal seed 2485630
        assert data["kpis"]["total_sales"] != 2485630
        assert data["kpis"]["total_orders"] > 0
        assert data["kpis"]["aov"] > 0
        assert data["kpis"]["gross_profit"] > 0

    def test_inventory_source_uploaded_unique_products(self):
        r = requests.get(f"{BASE_URL}/inventory", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["source"] == "uploaded"
        # 5 unique products in sample
        assert len(data["items"]) == 5
        prods = {i["product"] for i in data["items"]}
        assert "Amul Gold Milk 1L" in prods

    def test_forecast_derived_from_upload(self):
        r = requests.get(f"{BASE_URL}/forecast", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data["forecast"]) == 7
        # History from uploaded aggregates: 10 days
        assert len(data["history"]) == 10

    def test_products_uploaded(self):
        r = requests.get(f"{BASE_URL}/products", timeout=30)
        assert r.status_code == 200
        prods = r.json()["products"]
        names = {p["name"] for p in prods}
        assert names == {"Amul Gold Milk 1L", "Lay's Classic 52g", "Coca Cola 750ml", "Aashirvaad Atta 5kg", "Maggi 2-Min Noodles"}

    def test_categories_uploaded(self):
        r = requests.get(f"{BASE_URL}/categories", timeout=30)
        assert r.status_code == 200
        cats = r.json()["categories"]
        assert cats[0] == "All"
        assert set(cats[1:]) == {"Dairy", "Snacks", "Beverages", "Others"}

    def test_report_pdf_valid(self):
        r = requests.get(f"{BASE_URL}/report/pdf", timeout=60)
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("application/pdf")
        assert r.content[:4] == b"%PDF"
        assert len(r.content) > 2000

    def test_reset_returns_to_demo(self):
        r = requests.post(f"{BASE_URL}/dataset/reset", timeout=30)
        assert r.status_code == 200
        # Now insights should be demo again
        ins = requests.get(f"{BASE_URL}/insights", timeout=30).json()
        assert ins["source"] == "demo"
        assert ins["kpis"]["total_sales"] == 2485630
