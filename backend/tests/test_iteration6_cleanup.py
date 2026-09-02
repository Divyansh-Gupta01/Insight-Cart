"""Iteration 6 backend cleanup tests - verify multi-store removal without regression."""
import os
import io
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cart-insight.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module", autouse=True)
def reset_dataset():
    # Ensure we start in demo state
    requests.post(f"{API}/dataset/reset", timeout=30)
    yield
    requests.post(f"{API}/dataset/reset", timeout=30)


class TestInsights:
    def test_insights_no_params_demo_kpis(self):
        r = requests.get(f"{API}/insights", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "stores" not in data, f"'stores' key must be removed. Keys: {list(data.keys())}"
        assert data.get("source") == "demo"
        k = data["kpis"]
        assert k["total_sales"] == 2485630
        assert k["total_orders"] == 18742
        assert k["aov"] == 1326
        assert k["gross_profit"] == 618540
        assert k["profit_margin"] == 24.9
        assert k["total_customers"] == 9842

    def test_insights_date_range_preserves_aov(self):
        r = requests.get(f"{API}/insights", params={"start_date": "2025-05-25", "end_date": "2025-05-31"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "stores" not in data
        assert data["kpis"]["aov"] == 1326
        assert data["kpis"]["total_sales"] < 2485630  # proportional slice


class TestInventory:
    def test_inventory_no_store_param(self):
        r = requests.get(f"{API}/inventory", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data["items"]) == 20
        assert "counts" in data and isinstance(data["counts"], dict)


class TestForecast:
    def test_forecast_counts(self):
        r = requests.get(f"{API}/forecast", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data["history"]) == 31
        assert len(data["forecast"]) == 7


class TestReportPDF:
    def test_report_pdf_no_store(self):
        r = requests.get(f"{API}/report/pdf", timeout=60)
        assert r.status_code == 200
        assert "application/pdf" in r.headers.get("content-type", "")
        assert len(r.content) > 2048


class TestCompareRemoved:
    def test_compare_404(self):
        r = requests.get(f"{API}/compare", timeout=30)
        assert r.status_code == 404


class TestSchedules:
    schedule_id = None

    def test_create_schedule_no_store(self):
        payload = {
            "name": "TEST_Weekly Ops",
            "cadence": "weekly",
            "day_of_week": 0,
            "hour": 9,
            "recipients": ["ops@x.in"],
        }
        r = requests.post(f"{API}/schedules", json=payload, timeout=30)
        assert r.status_code == 200
        doc = r.json()
        assert "store" not in doc, f"'store' must not be in schedule doc: {doc}"
        assert doc["name"] == "TEST_Weekly Ops"
        TestSchedules.schedule_id = doc["id"]

    def test_run_now(self):
        assert TestSchedules.schedule_id
        r = requests.post(f"{API}/schedules/{TestSchedules.schedule_id}/run-now", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["report"] == "Retail Analytics · Manual run"
        assert "store" not in d

    def test_delete(self):
        if TestSchedules.schedule_id:
            r = requests.delete(f"{API}/schedules/{TestSchedules.schedule_id}", timeout=30)
            assert r.status_code == 200


class TestUpload:
    def test_upload_sales_no_store_column(self):
        csv = "date,product,category,quantity,amount,payment_method\n2025-05-01,Milk,Dairy,2,100,UPI\n2025-05-02,Bread,Bakery,1,50,Cash\n"
        files = {"file": ("sales.csv", io.BytesIO(csv.encode()), "text/csv")}
        r = requests.post(f"{API}/upload", files=files, timeout=60)
        assert r.status_code == 200, r.text
        assert r.json()["rows"] == 2
        requests.post(f"{API}/dataset/reset", timeout=30)

    def test_upload_sales_with_store_column_ignored(self):
        csv = "date,product,category,quantity,amount,payment_method,store\n2025-05-01,Milk,Dairy,2,100,UPI,ChennaiA\n2025-05-02,Bread,Bakery,1,50,Cash,BengaluruB\n"
        files = {"file": ("sales_with_store.csv", io.BytesIO(csv.encode()), "text/csv")}
        r = requests.post(f"{API}/upload", files=files, timeout=60)
        assert r.status_code == 200, r.text
        assert r.json()["rows"] == 2
        # verify insights returns uploaded source
        ins = requests.get(f"{API}/insights", timeout=30).json()
        assert ins["source"] == "uploaded"
        assert "stores" not in ins
        requests.post(f"{API}/dataset/reset", timeout=30)


class TestLogin:
    def test_login_no_store_in_user(self):
        r = requests.post(f"{API}/login", json={"username": "demo", "password": "demo"}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert "token" in d and "user" in d
        assert "store" not in d["user"], f"'store' must not be in user: {d['user']}"


class TestDatasetReset:
    def test_reset(self):
        r = requests.post(f"{API}/dataset/reset", timeout=30)
        assert r.status_code == 200
