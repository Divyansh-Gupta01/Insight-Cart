"""Iteration 5: verify AOV/orders/revenue regression fix in _apply_date_filter."""
import os
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://cart-insight.preview.emergentagent.com").rstrip("/")

EXPECTED_FULL = {
    "total_sales": 2485630,
    "total_orders": 18742,
    "aov": 1326,
    "gross_profit": 618540,
    "profit_margin": 24.9,
    "total_customers": 9842,
}


def _kpis(params=None):
    r = requests.get(f"{BASE}/api/insights", params=params, timeout=15)
    assert r.status_code == 200
    return r.json()["kpis"]


def test_insights_no_params_matches_seed():
    k = _kpis()
    for key, val in EXPECTED_FULL.items():
        assert k[key] == val, f"{key} expected {val} got {k[key]}"


def test_insights_full_range_matches_seed_exact():
    k = _kpis({"start_date": "2025-05-01", "end_date": "2025-05-31"})
    for key, val in EXPECTED_FULL.items():
        assert k[key] == val, f"{key} expected {val} got {k[key]}"


def test_insights_last_week_reduced_but_aov_preserved():
    k = _kpis({"start_date": "2025-05-25", "end_date": "2025-05-31"})
    assert k["aov"] == 1326
    assert k["total_sales"] < EXPECTED_FULL["total_sales"]
    assert k["total_orders"] < EXPECTED_FULL["total_orders"]
    assert k["profit_margin"] == 24.9


def test_insights_midweek_reduced_but_aov_preserved():
    k = _kpis({"start_date": "2025-05-15", "end_date": "2025-05-20"})
    assert k["aov"] == 1326
    assert k["total_sales"] < EXPECTED_FULL["total_sales"]
    assert k["total_orders"] < EXPECTED_FULL["total_orders"]


def test_forecast_and_schedules_endpoints():
    r = requests.get(f"{BASE}/api/forecast", timeout=15)
    assert r.status_code == 200 and "forecast" in r.json()
    r = requests.get(f"{BASE}/api/schedules", timeout=15)
    assert r.status_code == 200
    r = requests.get(f"{BASE}/api/deliveries", timeout=15)
    assert r.status_code == 200
