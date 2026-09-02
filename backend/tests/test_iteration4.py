"""Iteration 4 backend tests: date-range filters + schedules/deliveries."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://cart-insight.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---------- Date range filter ----------
def test_insights_full(s):
    r = s.get(f"{API}/insights", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert data["kpis"]["total_sales"] == 2485630
    assert len(data["daily_sales"]) == 31
    assert "date_range" not in data  # no filter applied


def test_insights_filtered_7d(s):
    r = s.get(f"{API}/insights", params={"start_date": "2025-05-01", "end_date": "2025-05-07"}, timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert "date_range" in data
    assert data["date_range"]["days"] == 7
    assert len(data["daily_sales"]) == 7
    assert data["kpis"]["total_sales"] < 2485630
    assert data["kpis"]["total_sales"] > 0


def test_forecast_filtered(s):
    r = s.get(f"{API}/forecast", params={"start_date": "2025-05-24", "end_date": "2025-05-31"}, timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert 1 <= len(data["history"]) <= 8
    assert len(data["forecast"]) == 7  # default days


# ---------- Schedules ----------
_created = {}


def test_schedules_initial(s):
    r = s.get(f"{API}/schedules", timeout=15)
    assert r.status_code == 200
    assert "schedules" in r.json()


def test_create_schedule(s):
    payload = {
        "name": "TEST_Weekly Ops Report",
        "cadence": "weekly",
        "day_of_week": 0,
        "hour": 9,
        "recipients": ["ops@easybasket.in"],
        "store": "Store 1",
    }
    r = s.post(f"{API}/schedules", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["id"].startswith("SCH-")
    assert data["name"] == payload["name"]
    assert data["cadence"] == "weekly"
    assert data["next_delivery"]
    assert data["active"] is True
    _created["id"] = data["id"]

    # Verify listed
    lr = s.get(f"{API}/schedules", timeout=15).json()
    assert any(x["id"] == data["id"] for x in lr["schedules"])


def test_run_now(s):
    sid = _created["id"]
    r = s.post(f"{API}/schedules/{sid}/run-now", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["status"] == "success"
    assert d["schedule_id"] == sid
    assert d["trigger"] == "manual"


def test_deliveries(s):
    r = s.get(f"{API}/deliveries", timeout=15)
    assert r.status_code == 200
    rows = r.json()["deliveries"]
    assert any(d["schedule_id"] == _created["id"] for d in rows)


def test_delete_schedule(s):
    sid = _created["id"]
    r = s.delete(f"{API}/schedules/{sid}", timeout=15)
    assert r.status_code == 200
    assert r.json()["deleted"] == 1
    # Confirm gone
    lr = s.get(f"{API}/schedules", timeout=15).json()
    assert not any(x["id"] == sid for x in lr["schedules"])


def test_run_now_404(s):
    r = s.post(f"{API}/schedules/does-not-exist/run-now", timeout=15)
    assert r.status_code == 404
