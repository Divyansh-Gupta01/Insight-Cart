"""Iteration 2 backend tests: live dataset wiring, dataset status/reset, compare endpoint."""
import os
import io
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://cart-insight.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    yield s
    # cleanup: leave app in demo state
    try:
        s.post(f"{API}/dataset/reset", timeout=15)
    except Exception:
        pass


@pytest.fixture(autouse=True)
def _reset_before(session):
    # ensure clean state before each test
    session.post(f"{API}/dataset/reset", timeout=15)
    yield


# -------- dataset status/reset --------
def test_status_initial_demo(session):
    r = session.get(f"{API}/dataset/status", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["has_live_sales"] is False
    assert d["has_live_inventory"] is False
    assert "latest" in d


def test_reset_returns_counts(session):
    r = session.post(f"{API}/dataset/reset", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "cleared_sales" in d and "cleared_inventory" in d


# -------- sales upload live wiring --------
SALES_CSV = (
    "date,product,category,quantity,amount,store,payment_method\n"
    "2025-05-01,Milk,Dairy,2,120,Store 1,UPI\n"
    "2025-05-02,Bread,Bakery,1,45,Store 1,Cash\n"
    "2025-05-03,Chips,Snacks,3,90,Store 3,Card\n"
    "2025-05-04,Cola,Beverages,4,200,Store 3,UPI\n"
    "2025-05-05,Milk,Dairy,5,300,Store 1,UPI\n"
)


def _upload(session, csv_text, filename):
    files = {"file": (filename, io.BytesIO(csv_text.encode()), "text/csv")}
    return session.post(f"{API}/upload", files=files, timeout=30)


def test_insights_demo_source_before_upload(session):
    r = session.get(f"{API}/insights", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["kpis"]["total_sales"] == 2485630
    assert d.get("source", "demo") == "demo" or "source" not in d


def test_upload_sales_persists_and_status(session):
    r = _upload(session, SALES_CSV, "sales_test.csv")
    assert r.status_code == 200, r.text
    up = r.json()
    assert up["rows"] == 5
    assert len(up["steps"]) == 7

    st = session.get(f"{API}/dataset/status", timeout=15).json()
    assert st["has_live_sales"] is True
    assert st["latest"]["filename"] == "sales_test.csv"
    assert st["latest"]["kind"] == "sales"


def test_insights_uploaded_source(session):
    _upload(session, SALES_CSV, "sales_test.csv")
    r = session.get(f"{API}/insights", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d.get("source") == "uploaded"
    # sum = 120+45+90+200+300 = 755
    assert d["kpis"]["total_sales"] == 755
    assert d["kpis"]["total_sales"] != 2485630


def test_reset_reverts_to_demo(session):
    _upload(session, SALES_CSV, "sales_test.csv")
    session.post(f"{API}/dataset/reset", timeout=15)
    r = session.get(f"{API}/insights", timeout=15)
    d = r.json()
    assert d["kpis"]["total_sales"] == 2485630


# -------- inventory upload --------
INV_CSV = (
    "product,category,current_stock,reorder_level\n"
    "Milk,Dairy,50,20\n"
    "Bread,Bakery,5,15\n"
    "Chips,Snacks,0,10\n"
)


def test_upload_inventory_source(session):
    r = _upload(session, INV_CSV, "inv_test.csv")
    assert r.status_code == 200, r.text
    st = session.get(f"{API}/dataset/status", timeout=15).json()
    assert st["has_live_inventory"] is True
    assert st["latest"]["kind"] == "inventory"

    inv = session.get(f"{API}/inventory", timeout=15).json()
    assert inv["source"] == "uploaded"
    assert len(inv["items"]) == 3
    products = [i["product"] for i in inv["items"]]
    assert "Milk" in products


# -------- compare endpoint --------
def test_compare_demo(session):
    r = session.get(f"{API}/compare", params={"store_a": "Store 1", "store_b": "Store 3"}, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["store_a"] == "Store 1"
    assert d["store_b"] == "Store 3"
    assert len(d["kpis"]) == 4
    labels = [k["label"] for k in d["kpis"]]
    assert labels == ["Revenue", "Orders", "AOV", "Growth %"]
    for k in d["kpis"]:
        assert k["winner"] in ["a", "b", "tie"]
    for key in ["daily_a", "daily_b", "categories_a", "categories_b", "top_products_a", "top_products_b"]:
        assert key in d, f"missing {key}"
        assert isinstance(d[key], list)


def test_compare_uses_uploaded(session):
    _upload(session, SALES_CSV, "sales_test.csv")
    r = session.get(f"{API}/compare", params={"store_a": "Store 1", "store_b": "Store 3"}, timeout=15)
    assert r.status_code == 200
    d = r.json()
    # Sums per uploaded data: Store1: 120+45+300=465 ; Store3: 90+200=290
    revenue_kpi = next(k for k in d["kpis"] if k["label"] == "Revenue")
    assert revenue_kpi["a"] == 465
    assert revenue_kpi["b"] == 290
    assert revenue_kpi["winner"] == "a"
