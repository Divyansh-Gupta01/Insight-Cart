import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

from forecasting import (
    holt_winters_additive,
    holts_linear_trend,
    simple_exponential_smoothing,
    naive_forecast,
    seasonal_naive_forecast,
    walk_forward_cv_score,
    select_best_model_walk_forward,
    generate_sales_forecast,
    generate_sku_demand_forecast,
    _calculate_metrics,
)
from etl import (
    clean_currency_value,
    map_columns,
    detect_dataset_kind,
    clean_and_validate_dataset,
)
from analytics import (
    compute_sales_metrics,
    classify_inventory_status,
    get_restock_priority,
    compute_abc_classification,
    simulate_stockout_timeline,
    get_multi_factor_stockout_risk,
    compute_inventory_decisions,
    generate_action_center,
    _calculate_pop_trend,
)
from server import app


client = TestClient(app)


# ============================================================================
# 1. FORECASTING & WALK-FORWARD CV TESTS
# ============================================================================
class TestForecastingEngine:
    def test_calculate_metrics(self):
        actual = np.array([100.0, 110.0, 120.0, 130.0])
        predicted = np.array([105.0, 108.0, 122.0, 128.0])
        metrics = _calculate_metrics(actual, predicted)
        assert metrics["mae"] > 0
        assert metrics["rmse"] >= metrics["mae"]
        assert 0 < metrics["wape"] < 10
        assert 0 < metrics["smape"] < 10

    def test_walk_forward_model_selection(self):
        # 28 days of daily retail data with clear weekly cycle
        base = 50.0
        series = np.array([
            base + (i % 7) * 5.0 + (10.0 if (i % 7) in (5, 6) else 0)
            for i in range(28)
        ], dtype=float)

        model_name, params, fitted, forecasts, metrics = select_best_model_walk_forward(
            series, horizon=7
        )
        assert len(fitted) == 28
        assert len(forecasts) == 7
        assert "wape" in metrics
        assert metrics["wape"] >= 0.0
        assert (forecasts > 0).all()

    def test_sku_demand_forecast_pipeline(self):
        dates = [f"2025-05-{d+1:02d}" for d in range(25)]
        sales_records = []
        for d in dates:
            sales_records.append({
                "date": d,
                "product": "Organic Milk",
                "category": "Dairy",
                "quantity": 12,
                "amount": 600,
                "cost": 450,
            })
        df = pd.DataFrame(sales_records)
        res = generate_sku_demand_forecast(df, "Organic Milk", days_to_predict=7)
        assert res["product"] == "Organic Milk"
        assert res["total_forecast_units"] > 0
        assert res["total_forecast_revenue"] > 0
        assert len(res["forecast"]) == 7
        assert res["unit_price"] == 50.0

    def test_holt_winters_forecast_length_and_validity(self):
        base = 50000
        series = np.array([
            base + (i % 7) * 5000 + (10000 if (i % 7) in (5, 6) else 0)
            for i in range(28)
        ], dtype=float)

        fitted, forecasts = holt_winters_additive(
            series, season_length=7, alpha=0.3, beta=0.1, gamma=0.2, forecast_steps=7
        )

        assert len(fitted) == 28
        assert len(forecasts) == 7
        assert not np.isnan(forecasts).any()
        assert (forecasts > 0).all()

    def test_holts_linear_trend_medium_series(self):
        series = np.array([1000.0, 1200.0, 1400.0, 1600.0, 1800.0, 2000.0, 2200.0, 2400.0])
        fitted, forecasts = holts_linear_trend(series, alpha=0.3, beta=0.1, forecast_steps=7)

        assert len(fitted) == len(series)
        assert len(forecasts) == 7
        assert not np.isnan(forecasts).any()
        # Should project upward trend
        assert forecasts[-1] > forecasts[0]

    def test_simple_exponential_smoothing_short_series(self):
        series = np.array([500.0, 520.0, 510.0])
        fitted, forecasts = simple_exponential_smoothing(series, alpha=0.3, forecast_steps=5)

        assert len(fitted) == 3
        assert len(forecasts) == 5
        assert not np.isnan(forecasts).any()

    def test_parameter_optimization(self):
        series = np.array([100.0 + (i % 7) * 20 for i in range(21)], dtype=float)
        score = walk_forward_cv_score(
            series, "holt_winters", {"alpha": 0.3, "beta": 0.1, "gamma": 0.2, "season_length": 7}, horizon=7
        )
        assert score >= 0.0

    def test_generate_sales_forecast_pipeline(self):
        start = datetime(2025, 5, 1)
        daily_sales = [
            {"date": (start + timedelta(days=i)).strftime("%Y-%m-%d"), "revenue": 80000 + (i % 7) * 4000}
            for i in range(21)
        ]
        result = generate_sales_forecast(daily_sales, days_to_predict=7)
        assert len(result["history"]) == 21
        assert len(result["forecast"]) == 7
        assert len(result["model"]) > 0
        assert "metrics" in result
        assert result["metrics"]["rmse"] >= 0


# ============================================================================
# 2. ETL & SANITIZATION TESTS
# ============================================================================
class TestETLPipeline:
    def test_clean_currency_value(self):
        assert clean_currency_value("₹ 1,234.50") == 1234.50
        assert clean_currency_value("Rs. 50,000") == 50000.0
        assert clean_currency_value("$99.99") == 99.99
        assert clean_currency_value("INR 1000") == 1000.0
        assert clean_currency_value(None) == 0.0
        assert clean_currency_value("invalid") == 0.0

    def test_map_columns(self):
        cols = ["Order_Date", "SKU_Name", "Product_Category", "Qty", "Line_Total", "Payment_Mode"]
        mapping = map_columns(cols)
        assert mapping["date"] == "Order_Date"
        assert mapping["product"] == "SKU_Name"
        assert mapping["category"] == "Product_Category"
        assert mapping["quantity"] == "Qty"
        assert mapping["amount"] == "Line_Total"
        assert mapping["payment_method"] == "Payment_Mode"

    def test_detect_dataset_kind(self):
        sales_map = {"date": "Date", "amount": "Sales", "product": "Item"}
        assert detect_dataset_kind(sales_map) == "sales"

        inv_map = {"product": "Item", "current_stock": "Qty_On_Hand"}
        assert detect_dataset_kind(inv_map) == "inventory"

    def test_clean_and_validate_dataset_sales(self):
        data = {
            "date": ["2025-05-01", "2025-05-02", "2025-05-02"],
            "item_name": ["Milk 1L", "Bread", "Bread"],
            "category": ["Dairy", "Bakery", "Bakery"],
            "quantity": ["2", "1", "1"],
            "price": ["₹60", "₹40", "₹40"],  # duplicate row
            "payment": ["UPI", "Cash", "Cash"],
        }
        df = pd.DataFrame(data)
        cleaned_df, mapping, kind, steps = clean_and_validate_dataset(df, "sales.csv")

        assert kind == "sales"
        assert len(cleaned_df) == 2  # duplicate removed
        assert (cleaned_df["clean_qty"] == [2.0, 1.0]).all()
        assert (cleaned_df["clean_amount"] == [120.0, 40.0]).all()  # unit price multiplied by qty
        assert len(steps) == 7
        assert all(s["passed"] for s in steps)


# ============================================================================
# 3. ANALYTICS & DECISION ENGINE TESTS
# ============================================================================
class TestAnalyticsEngine:
    def test_inventory_classification(self):
        assert classify_inventory_status(0, 50) == "out_of_stock"
        assert classify_inventory_status(20, 50) == "low_stock"
        assert classify_inventory_status(200, 50) == "overstock"
        assert classify_inventory_status(60, 50) == "healthy"

    def test_abc_pareto_classification(self):
        data = {
            "product": ["Milk", "Bread", "Eggs", "Candy", "Matchbox"],
            "amount": [8000, 1500, 300, 150, 50],
            "cost": [5000, 1000, 200, 100, 30],
        }
        df = pd.DataFrame(data)
        abc = compute_abc_classification(df)
        assert abc["Milk"] == "A"
        assert abc["Bread"] == "B"
        assert abc["Matchbox"] == "C"

    def test_simulate_stockout_timeline(self):
        # Stock: 25. Daily forecast: [8, 12, 10, 5, 5, 5, 5] -> Cumulative: Day 1: 8, Day 2: 20, Day 3: 30 (exceeds 25 on Day 3)
        days, date_str = simulate_stockout_timeline(25, [8, 12, 10, 5, 5, 5, 5])
        assert days == 3

    def test_multi_factor_risk(self):
        assert get_multi_factor_stockout_risk(2, "A", stock=10) == "CRITICAL"
        assert get_multi_factor_stockout_risk(2, "C", stock=10) == "MEDIUM"
        assert get_multi_factor_stockout_risk(6, "A", stock=40) == "HIGH"
        assert get_multi_factor_stockout_risk(20, "A", stock=200) == "NONE"

    def test_action_center_generation(self):
        inv = [
            {
                "id": "SKU-1", "product": "Amul Milk 1L", "category": "Dairy",
                "current_stock": 10, "reorder_level": 40, "lead_time": 2,
                "is_assumed_lead_time": False, "lead_time_demand": 20,
                "safety_stock": 10, "forecast_demand_7d": 60,
                "recommended_order_qty": 60, "stockout_days": 2,
                "stockout_date": "2025-05-10", "stockout_risk": "CRITICAL",
                "abc_class": "A", "unit_price": 60, "unit_cost": 45,
                "capital_tied_up": 450, "days_since_last_sale": 1,
                "is_slow_moving": False, "status": "low_stock",
            },
            {
                "id": "SKU-2", "product": "Old Tea", "category": "Beverages",
                "current_stock": 50, "reorder_level": 10, "lead_time": 3,
                "is_assumed_lead_time": True, "lead_time_demand": 1,
                "safety_stock": 5, "forecast_demand_7d": 2,
                "recommended_order_qty": 0, "stockout_days": 90,
                "stockout_date": "2025-08-10", "stockout_risk": "NONE",
                "abc_class": "C", "unit_price": 200, "unit_cost": 150,
                "capital_tied_up": 7500, "days_since_last_sale": 35,
                "is_slow_moving": True, "status": "overstock",
            }
        ]
        sales_df = pd.DataFrame([
            {"date": "2025-05-01", "product": "Amul Milk 1L", "quantity": 10, "amount": 600}
        ])
        actions = generate_action_center(inv, sales_df)
        assert len(actions) >= 2
        restock_act = next((a for a in actions if a["type"] == "RESTOCK"), None)
        assert restock_act is not None
        assert "why" in restock_act
        assert restock_act["why"]["recommended_order_qty"] == 60

        reduce_act = next((a for a in actions if a["type"] == "REDUCE INVENTORY"), None)
        assert reduce_act is not None
        assert reduce_act["why"]["capital_tied_up"] == 7500

    def test_pop_trend_calculation(self):
        assert _calculate_pop_trend(120.0, 100.0) == 20.0
        assert _calculate_pop_trend(80.0, 100.0) == -20.0
        assert _calculate_pop_trend(100.0, 0.0) == 100.0


# ============================================================================
# 4. FASTAPI APP TESTS (ASYNC)
# ============================================================================
@pytest.mark.anyio
class TestServerEndpoints:
    async def test_root_endpoint(self):
        from httpx import AsyncClient, ASGITransport
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/")
            assert response.status_code == 200
            assert response.json()["status"] == "ok"

    async def test_login_demo(self):
        from httpx import AsyncClient, ASGITransport
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/login", json={"username": "demo", "password": "any", "demo": True})
            assert response.status_code == 200
            assert "token" in response.json()
            assert response.json()["user"]["role"] == "manager"

    async def test_insights_action_center(self):
        from httpx import AsyncClient, ASGITransport
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/insights")
            assert response.status_code == 200
            data = response.json()
            assert "kpis" in data
            assert "daily_sales" in data
            assert "categories" in data
            assert "action_center" in data
            assert len(data["action_center"]) > 0

    async def test_forecast_overall_and_sku(self):
        from httpx import AsyncClient, ASGITransport
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # Overall store forecast
            r_all = await ac.get("/api/forecast?days=7")
            assert r_all.status_code == 200
            d_all = r_all.json()
            assert len(d_all["forecast"]) == 7
            assert "available_products" in d_all

            # SKU forecast
            r_sku = await ac.get("/api/forecast?days=7&product=Amul+Gold+Milk+1L")
            assert r_sku.status_code == 200
            d_sku = r_sku.json()
            assert d_sku["product"] == "Amul Gold Milk 1L"
            assert "total_forecast_units" in d_sku
            assert "total_forecast_revenue" in d_sku
            assert "metrics" in d_sku

    async def test_inventory_endpoint(self):
        from httpx import AsyncClient, ASGITransport
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/inventory")
            assert response.status_code == 200
            data = response.json()
            assert "items" in data
            assert "counts" in data

    async def test_report_pdf_endpoint(self):
        from httpx import AsyncClient, ASGITransport
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/report/pdf")
            assert response.status_code == 200
            assert "application/pdf" in response.headers.get("content-type", "")
            assert len(response.content) > 1000

    async def test_dataset_status_and_reset(self):
        from httpx import AsyncClient, ASGITransport
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            r = await ac.get("/api/dataset/status")
            assert r.status_code == 200
            data = r.json()
            assert "has_live_sales" in data
            assert "has_live_inventory" in data

            r_reset = await ac.post("/api/dataset/reset")
            assert r_reset.status_code == 200

    async def test_schedules_lifecycle(self):
        from httpx import AsyncClient, ASGITransport
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # List initial
            r = await ac.get("/api/schedules")
            assert r.status_code == 200

            # Create schedule
            payload = {
                "name": "Weekly Retail Summary",
                "cadence": "weekly",
                "day_of_week": 0,
                "hour": 9,
                "minute": 0,
                "recipients": ["manager@store.com"],
            }
            create_res = await ac.post("/api/schedules", json=payload)
            assert create_res.status_code == 200
            sch = create_res.json()
            assert "id" in sch
            assert sch["name"] == "Weekly Retail Summary"

            # Run schedule now
            run_res = await ac.post(f"/api/schedules/{sch['id']}/run-now")
            assert run_res.status_code == 200
            dlv = run_res.json()
            assert dlv["status"] == "success"

            # Check deliveries
            deliv_res = await ac.get("/api/deliveries")
            assert deliv_res.status_code == 200
            assert len(deliv_res.json()["deliveries"]) >= 1

            # Delete schedule
            del_res = await ac.delete(f"/api/schedules/{sch['id']}")
            assert del_res.status_code == 200

