"""
Statistical Time-Series Demand Forecasting Engine for Insight Cart.
Provides store-level revenue forecasting and SKU-level unit demand forecasting.
Features adaptive model selection (Naive, Seasonal Naive, SES, Holt's Linear, Holt-Winters)
with Walk-Forward Time-Series Cross-Validation and WAPE / sMAPE / MAE / RMSE metrics.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd


def _calculate_metrics(actual: np.ndarray, predicted: np.ndarray) -> Dict[str, float]:
    """
    Calculate comprehensive error metrics:
    - WAPE: Weighted Absolute Percentage Error (sum(|actual-pred|) / sum(actual) * 100)
    - sMAPE: Symmetric Mean Absolute Percentage Error
    - MAE: Mean Absolute Error
    - RMSE: Root Mean Squared Error
    - MAPE: Mean Absolute Percentage Error (where actual > 0)
    """
    if len(actual) == 0 or len(predicted) == 0 or len(actual) != len(predicted):
        return {"wape": 0.0, "mae": 0.0, "rmse": 0.0, "smape": 0.0, "mape": 0.0}

    errors = actual - predicted
    abs_errors = np.abs(errors)
    mae = float(np.mean(abs_errors))
    rmse = float(np.sqrt(np.mean(errors ** 2)))

    # WAPE (Weighted Absolute Percentage Error) - ideal for retail demand with zero-sales days
    total_actual = float(np.sum(actual))
    if total_actual > 0:
        wape = float((np.sum(abs_errors) / total_actual) * 100.0)
    else:
        wape = 0.0

    # sMAPE (Symmetric MAPE)
    denom = np.abs(actual) + np.abs(predicted)
    valid_mask = denom > 0
    if np.any(valid_mask):
        smape = float(np.mean(2.0 * abs_errors[valid_mask] / denom[valid_mask]) * 100.0)
    else:
        smape = 0.0

    # Standard MAPE where actual > 0
    non_zero = actual > 0
    if np.any(non_zero):
        mape = float(np.mean(abs_errors[non_zero] / actual[non_zero]) * 100.0)
    else:
        mape = 0.0

    return {
        "wape": round(wape, 2),
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "smape": round(smape, 2),
        "mape": round(mape, 2),
    }


# ============================================================================
# CANDIDATE TIME-SERIES MODELS
# ============================================================================

def naive_forecast(series: np.ndarray, forecast_steps: int = 7) -> Tuple[np.ndarray, np.ndarray]:
    """Naive model: projects the most recent observed value forward."""
    n = len(series)
    if n == 0:
        return np.array([]), np.zeros(forecast_steps)
    fitted = np.zeros(n)
    fitted[0] = series[0]
    for i in range(1, n):
        fitted[i] = series[i - 1]
    forecast = np.full(forecast_steps, max(0.0, float(series[-1])))
    return fitted, forecast


def seasonal_naive_forecast(
    series: np.ndarray, season_length: int = 7, forecast_steps: int = 7
) -> Tuple[np.ndarray, np.ndarray]:
    """Seasonal Naive model: projects the value from the same day last week."""
    n = len(series)
    if n < season_length:
        return naive_forecast(series, forecast_steps=forecast_steps)

    fitted = np.zeros(n)
    for i in range(n):
        if i < season_length:
            fitted[i] = series[i]
        else:
            fitted[i] = series[i - season_length]

    forecast = np.zeros(forecast_steps)
    for h in range(1, forecast_steps + 1):
        idx = (n + h - 1) % season_length
        last_season_start = n - season_length
        forecast[h - 1] = max(0.0, float(series[last_season_start + idx]))

    return fitted, forecast


def simple_exponential_smoothing(
    series: np.ndarray,
    alpha: float = 0.3,
    forecast_steps: int = 7,
) -> Tuple[np.ndarray, np.ndarray]:
    """Simple Exponential Smoothing for stationary or short series."""
    n = len(series)
    if n == 0:
        return np.array([]), np.zeros(forecast_steps)

    level = float(series[0])
    fitted = np.zeros(n)
    fitted[0] = series[0]

    for i in range(1, n):
        val = series[i]
        level = alpha * val + (1.0 - alpha) * level
        fitted[i] = max(0.0, level)

    forecasts = np.full(forecast_steps, max(0.0, level))
    return fitted, forecasts


def holts_linear_trend(
    series: np.ndarray,
    alpha: float = 0.3,
    beta: float = 0.1,
    forecast_steps: int = 7,
) -> Tuple[np.ndarray, np.ndarray]:
    """Holt's Linear Trend model for series exhibiting steady growth or decline."""
    n = len(series)
    if n == 0:
        return np.array([]), np.zeros(forecast_steps)
    if n == 1:
        return np.array([series[0]]), np.full(forecast_steps, series[0])

    level = float(series[0])
    trend = float(series[1] - series[0])
    fitted = np.zeros(n)
    fitted[0] = series[0]

    for i in range(1, n):
        val = series[i]
        last_level = level
        level = alpha * val + (1.0 - alpha) * (last_level + trend)
        trend = beta * (level - last_level) + (1.0 - beta) * trend
        fitted[i] = max(0.0, last_level + trend)

    forecasts = np.zeros(forecast_steps)
    for h in range(1, forecast_steps + 1):
        forecasts[h - 1] = max(0.0, level + h * trend)

    return fitted, forecasts


def holt_winters_additive(
    series: np.ndarray,
    season_length: int = 7,
    alpha: float = 0.2,
    beta: float = 0.1,
    gamma: float = 0.2,
    forecast_steps: int = 7,
) -> Tuple[np.ndarray, np.ndarray]:
    """Holt-Winters Additive Method with Level, Trend, and Weekly Seasonality."""
    n = len(series)
    if n < season_length * 2:
        return holts_linear_trend(series, alpha=alpha, beta=beta, forecast_steps=forecast_steps)

    num_seasons = n // season_length
    season_averages = [
        np.mean(series[i * season_length : (i + 1) * season_length])
        for i in range(num_seasons)
    ]

    seasonals = np.zeros(season_length)
    for i in range(season_length):
        season_sum = sum(
            series[k * season_length + i] - season_averages[k]
            for k in range(num_seasons)
        )
        seasonals[i] = season_sum / num_seasons

    seasonals = seasonals - np.mean(seasonals)
    seasonal_factors = list(seasonals)

    level = float(np.mean(series[:season_length]))
    trend = float((season_averages[1] - season_averages[0]) / season_length) if num_seasons > 1 else 0.0

    fitted = np.zeros(n)

    for i in range(n):
        val = series[i]
        last_level = level
        season_idx = i % season_length
        last_season = seasonal_factors[season_idx]

        level = alpha * (val - last_season) + (1.0 - alpha) * (last_level + trend)
        trend = beta * (level - last_level) + (1.0 - beta) * trend
        seasonal_factors[season_idx] = gamma * (val - level) + (1.0 - gamma) * last_season

        fitted[i] = max(0.0, last_level + trend + last_season)

    forecasts = np.zeros(forecast_steps)
    for h in range(1, forecast_steps + 1):
        season_idx = (n + h - 1) % season_length
        f_val = level + h * trend + seasonal_factors[season_idx]
        forecasts[h - 1] = max(0.0, f_val)

    return fitted, forecasts


# ============================================================================
# WALK-FORWARD TIME-SERIES CROSS-VALIDATION
# ============================================================================

def walk_forward_cv_score(
    series: np.ndarray,
    model_name: str,
    params: Dict[str, float],
    horizon: int = 7,
    min_train: int = 7,
) -> float:
    """
    Perform expanding-window time-series cross validation (walk-forward).
    Calculates out-of-sample WAPE across multiple forward folds.
    """
    n = len(series)
    if n < min_train + horizon:
        # Fallback to in-sample error if series is too short for split
        if model_name == "holt_winters":
            fitted, _ = holt_winters_additive(series, season_length=7, **params, forecast_steps=horizon)
        elif model_name == "holt":
            fitted, _ = holts_linear_trend(series, **params, forecast_steps=horizon)
        elif model_name == "seasonal_naive":
            fitted, _ = seasonal_naive_forecast(series, season_length=7, forecast_steps=horizon)
        elif model_name == "ses":
            fitted, _ = simple_exponential_smoothing(series, **params, forecast_steps=horizon)
        else:
            fitted, _ = naive_forecast(series, forecast_steps=horizon)
        m = _calculate_metrics(series, fitted)
        return m["wape"]

    fold_errors = []
    total_actuals = []

    # Roll forward in 3-day increments
    for split_idx in range(min_train, n - horizon + 1, 3):
        train_sub = series[:split_idx]
        test_sub = series[split_idx : split_idx + horizon]

        if model_name == "holt_winters":
            _, f_sub = holt_winters_additive(
                train_sub, season_length=7, alpha=params.get("alpha", 0.2),
                beta=params.get("beta", 0.1), gamma=params.get("gamma", 0.2),
                forecast_steps=horizon
            )
        elif model_name == "holt":
            _, f_sub = holts_linear_trend(
                train_sub, alpha=params.get("alpha", 0.3),
                beta=params.get("beta", 0.1), forecast_steps=horizon
            )
        elif model_name == "seasonal_naive":
            _, f_sub = seasonal_naive_forecast(train_sub, season_length=7, forecast_steps=horizon)
        elif model_name == "ses":
            _, f_sub = simple_exponential_smoothing(
                train_sub, alpha=params.get("alpha", 0.3), forecast_steps=horizon
            )
        else:
            _, f_sub = naive_forecast(train_sub, forecast_steps=horizon)

        fold_errors.append(np.sum(np.abs(test_sub - f_sub[:len(test_sub)])))
        total_actuals.append(np.sum(test_sub))

    sum_act = sum(total_actuals)
    if sum_act > 0:
        return float((sum(fold_errors) / sum_act) * 100.0)
    return float(np.mean(fold_errors)) if fold_errors else 0.0


def compute_day_of_week_indices(series: np.ndarray, dates: Optional[List[Any]] = None) -> np.ndarray:
    """
    Computes normalized day-of-week retail demand multipliers (0=Mon ... 6=Sun).
    Ensures the mean multiplier across the 7 days equals 1.0.
    """
    if dates is None or len(dates) != len(series) or len(series) < 7:
        return np.array([0.92, 0.90, 0.92, 0.96, 1.06, 1.22, 1.18])

    dow_sums = np.zeros(7)
    dow_counts = np.zeros(7)

    for val, dt_val in zip(series, dates):
        if isinstance(dt_val, str):
            try:
                dt = datetime.strptime(dt_val[:10], "%Y-%m-%d")
            except Exception:
                continue
        elif hasattr(dt_val, "weekday"):
            dt = dt_val
        else:
            continue
        dow = dt.weekday()
        dow_sums[dow] += val
        dow_counts[dow] += 1

    dow_means = np.zeros(7)
    for i in range(7):
        dow_means[i] = (dow_sums[i] / dow_counts[i]) if dow_counts[i] > 0 else (np.mean(series) if len(series) else 1.0)

    overall_mean = np.mean(dow_means)
    if overall_mean > 0:
        indices = dow_means / overall_mean
    else:
        indices = np.ones(7)

    # Bound indices to realistic retail variations (0.65x to 1.55x) so one-off anomalies don't distort
    indices = np.clip(indices, 0.65, 1.55)
    mean_bounded = np.mean(indices)
    if mean_bounded > 0:
        indices = indices / mean_bounded
    return indices


def select_best_model_walk_forward(
    series: np.ndarray,
    horizon: int = 7,
    dates: Optional[List[Any]] = None,
) -> Tuple[str, Dict[str, float], np.ndarray, np.ndarray, Dict[str, float]]:
    """
    Evaluate candidate models via Walk-Forward Validation and return the best predictor.
    Applies Day-of-Week Seasonality Modulation to level/trend models to reflect true retail weekly cycles.
    """
    n = len(series)
    candidates: List[Tuple[str, Dict[str, float]]] = []

    # Build candidate pool based on historical length
    candidates.append(("naive", {}))
    candidates.append(("ses", {"alpha": 0.2}))
    candidates.append(("ses", {"alpha": 0.4}))

    if n >= 7:
        candidates.append(("seasonal_naive", {}))
        candidates.append(("holt", {"alpha": 0.2, "beta": 0.1}))
        candidates.append(("holt", {"alpha": 0.3, "beta": 0.05}))

    if n >= 14:
        for a in [0.1, 0.2, 0.3]:
            for b in [0.05, 0.1]:
                for g in [0.1, 0.2]:
                    candidates.append(("holt_winters", {"alpha": a, "beta": b, "gamma": g}))

    best_score = float("inf")
    best_model_name = "ses"
    best_params: Dict[str, float] = {"alpha": 0.3}

    min_train = 7 if n < 21 else 14

    for m_name, p in candidates:
        score = walk_forward_cv_score(series, m_name, p, horizon=horizon, min_train=min_train)
        if score < best_score:
            best_score = score
            best_model_name = m_name
            best_params = p

    # Fit final model on complete historical series
    if best_model_name == "holt_winters":
        fitted, forecasts = holt_winters_additive(
            series, season_length=7, alpha=best_params["alpha"],
            beta=best_params["beta"], gamma=best_params["gamma"],
            forecast_steps=horizon
        )
        display_name = (
            f"Holt-Winters (Weekly m=7, α={best_params['alpha']}, β={best_params['beta']}, γ={best_params['gamma']})"
        )
    elif best_model_name == "holt":
        fitted, forecasts = holts_linear_trend(
            series, alpha=best_params["alpha"], beta=best_params["beta"],
            forecast_steps=horizon
        )
        display_name = f"Holt's Linear Trend (α={best_params['alpha']}, β={best_params['beta']})"
    elif best_model_name == "seasonal_naive":
        fitted, forecasts = seasonal_naive_forecast(series, season_length=7, forecast_steps=horizon)
        display_name = "Seasonal Naive (7-Day Weekly Cycle)"
    elif best_model_name == "naive":
        fitted, forecasts = naive_forecast(series, forecast_steps=horizon)
        display_name = "Naive Run-Rate"
    else:
        fitted, forecasts = simple_exponential_smoothing(
            series, alpha=best_params.get("alpha", 0.3), forecast_steps=horizon
        )
        display_name = f"Simple Exponential Smoothing (α={best_params.get('alpha', 0.3)})"

    # For level and trend models, apply day-of-week seasonality index to mirror realistic weekly patterns
    if dates and len(dates) >= 7 and best_model_name in ("ses", "naive", "holt"):
        dow_indices = compute_day_of_week_indices(series, dates)
        last_date = dates[-1]
        if isinstance(last_date, str):
            try:
                last_dt = datetime.strptime(last_date[:10], "%Y-%m-%d")
            except Exception:
                last_dt = datetime.now()
        elif hasattr(last_date, "weekday"):
            last_dt = last_date
        else:
            last_dt = datetime.now()

        modulated_forecasts = np.zeros(horizon)
        for h in range(1, horizon + 1):
            next_dow = (last_dt + timedelta(days=h)).weekday()
            modulated_forecasts[h - 1] = max(0.0, forecasts[h - 1] * dow_indices[next_dow])

        # Preserve total 7-day expected demand volume
        raw_sum = float(np.sum(forecasts))
        mod_sum = float(np.sum(modulated_forecasts))
        if mod_sum > 0 and raw_sum > 0:
            modulated_forecasts = modulated_forecasts * (raw_sum / mod_sum)

        forecasts = modulated_forecasts
        display_name += " + Weekly Seasonality Profile"

    metrics = _calculate_metrics(series, fitted)
    metrics["val_wape"] = round(best_score, 2)

    return display_name, best_params, fitted, forecasts, metrics


# ============================================================================
# STORE-LEVEL REVENUE FORECASTING PIPELINE (PRESERVED)
# ============================================================================

def generate_sales_forecast(
    daily_sales: List[Dict[str, Any]],
    days_to_predict: int = 7,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Dict[str, Any]:
    """
    End-to-end Store-Level Revenue Forecasting pipeline.
    Preserves overall store sales projection with walk-forward validated metrics.
    """
    if not daily_sales:
        return {
            "history": [],
            "forecast": [],
            "model": "Insufficient historical data",
            "metrics": {"wape": 0, "rmse": 0, "mae": 0, "smape": 0, "mape": 0},
        }

    df = pd.DataFrame(daily_sales)
    df["_date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["_date"]).sort_values("_date")

    if df.empty:
        return {
            "history": [],
            "forecast": [],
            "model": "No valid transaction dates",
            "metrics": {"wape": 0, "rmse": 0, "mae": 0, "smape": 0, "mape": 0},
        }

    daily_df = (
        df.groupby(df["_date"].dt.date)["revenue"]
        .sum()
        .reset_index()
        .rename(columns={"_date": "date"})
    )
    daily_df["date"] = pd.to_datetime(daily_df["date"])

    # Calendar date regularization
    min_date = daily_df["date"].min()
    max_date = daily_df["date"].max()

    full_idx = pd.date_range(start=min_date, end=max_date, freq="D")
    daily_df = (
        daily_df.set_index("date")
        .reindex(full_idx, fill_value=0)
        .rename_axis("date")
        .reset_index()
    )

    original_daily_df = daily_df.copy()
    if start_date:
        try:
            s_dt = pd.to_datetime(start_date)
            daily_df = daily_df[daily_df["date"] >= s_dt]
        except Exception:
            pass
    if end_date:
        try:
            e_dt = pd.to_datetime(end_date)
            daily_df = daily_df[daily_df["date"] <= e_dt]
        except Exception:
            pass

    if daily_df.empty:
        daily_df = original_daily_df

    if daily_df.empty:
        return {
            "history": [],
            "forecast": [],
            "model": "No data available",
            "metrics": {"wape": 0, "rmse": 0, "mae": 0, "smape": 0, "mape": 0},
        }

    rev_series = daily_df["revenue"].to_numpy(dtype=float)
    dates = daily_df["date"].dt.strftime("%Y-%m-%d").tolist()

    display_name, _, _, f_values, metrics = select_best_model_walk_forward(
        rev_series, horizon=days_to_predict, dates=dates
    )

    history_list = [
        {"date": d, "revenue": int(r)}
        for d, r in zip(dates, rev_series)
    ]

    last_dt = daily_df["date"].iloc[-1]
    forecast_list = []
    for i in range(days_to_predict):
        next_dt = last_dt + timedelta(days=i + 1)
        pred_val = int(round(max(0.0, f_values[i])))
        forecast_list.append({
            "date": next_dt.strftime("%Y-%m-%d"),
            "forecast": pred_val,
        })

    return {
        "history": history_list,
        "forecast": forecast_list,
        "model": display_name,
        "metrics": metrics,
    }


# ============================================================================
# SKU-LEVEL DEMAND FORECASTING PIPELINE (NEW)
# ============================================================================

def generate_sku_demand_forecast(
    sales_df: pd.DataFrame,
    product_name: str,
    days_to_predict: int = 7,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate unit demand forecast for an individual product/SKU.
    1. Filters sales transactions for the target product.
    2. Constructs continuous daily demand series (units sold).
    3. Derives average selling unit price.
    4. Selects optimal model via Walk-Forward Validation.
    5. Returns projected daily units and derived revenue.
    """
    if sales_df.empty:
        return {
            "product": product_name,
            "unit_price": 0.0,
            "history": [],
            "forecast": [],
            "total_forecast_units": 0,
            "total_forecast_revenue": 0,
            "avg_daily_demand": 0.0,
            "model": "No data available",
            "metrics": {"wape": 0, "rmse": 0, "mae": 0, "smape": 0, "mape": 0},
        }

    df = sales_df.copy()
    if "_date" not in df.columns:
        date_candidates = ["clean_date", "date", "Date", "DATE", "Timestamp", "timestamp", "Invoice_Date", "invoice_date"]
        d_col = next((c for c in date_candidates if c in df.columns), None)
        if d_col:
            df["_date"] = pd.to_datetime(df[d_col], errors="coerce")
        else:
            for col in df.columns:
                try:
                    parsed = pd.to_datetime(df[col], errors="coerce")
                    if parsed.notna().sum() > 0:
                        df["_date"] = parsed
                        break
                except Exception:
                    continue

    if "_date" not in df.columns:
        return {
            "product": product_name,
            "unit_price": 0.0,
            "history": [],
            "forecast": [],
            "total_forecast_units": 0,
            "total_forecast_revenue": 0,
            "avg_daily_demand": 0.0,
            "model": "Date column not found",
            "metrics": {"wape": 0, "rmse": 0, "mae": 0, "smape": 0, "mape": 0},
        }

    df = df.dropna(subset=["_date"]).sort_values("_date")

    # Match product name
    prod_candidates = ["clean_product", "product", "Product", "PRODUCT", "item", "Item", "sku", "SKU", "item_name"]
    prod_col = next((c for c in prod_candidates if c in df.columns), None)
    if not prod_col:
        return {
            "product": product_name,
            "unit_price": 0.0,
            "history": [],
            "forecast": [],
            "total_forecast_units": 0,
            "total_forecast_revenue": 0,
            "avg_daily_demand": 0.0,
            "model": "Product column not found",
            "metrics": {"wape": 0, "rmse": 0, "mae": 0, "smape": 0, "mape": 0},
        }

    p_df = df[df[prod_col].astype(str).str.strip().str.lower() == product_name.strip().lower()].copy()

    if p_df.empty:
        return {
            "product": product_name,
            "unit_price": 0.0,
            "history": [],
            "forecast": [],
            "total_forecast_units": 0,
            "total_forecast_revenue": 0,
            "avg_daily_demand": 0.0,
            "model": f"No sales history for {product_name}",
            "metrics": {"wape": 0, "rmse": 0, "mae": 0, "smape": 0, "mape": 0},
        }

    qty_candidates = ["clean_qty", "quantity", "Quantity", "qty", "Qty", "units", "Units"]
    qty_col = next((c for c in qty_candidates if c in p_df.columns), "quantity")

    amt_candidates = ["clean_amount", "amount", "Total_Amount", "total_amount", "Amount", "revenue", "Revenue", "sales"]
    amt_col = next((c for c in amt_candidates if c in p_df.columns), "amount")

    total_units_sold = float(pd.to_numeric(p_df[qty_col], errors="coerce").fillna(1.0).sum())
    total_rev = float(pd.to_numeric(p_df[amt_col], errors="coerce").fillna(0.0).sum())
    avg_price = round(total_rev / total_units_sold, 2) if total_units_sold > 0 else 50.0

    # Group daily units
    daily_units = (
        p_df.groupby(p_df["_date"].dt.date)
        .agg(units=(qty_col, "sum"), revenue=(amt_col, "sum"))
        .reset_index()
        .rename(columns={"_date": "date"})
    )
    daily_units["date"] = pd.to_datetime(daily_units["date"])

    min_date = daily_units["date"].min()
    max_date = daily_units["date"].max()
    full_idx = pd.date_range(start=min_date, end=max_date, freq="D")

    daily_units = (
        daily_units.set_index("date")
        .reindex(full_idx, fill_value=0)
        .rename_axis("date")
        .reset_index()
    )

    if start_date:
        try:
            s_dt = pd.to_datetime(start_date)
            daily_units = daily_units[daily_units["date"] >= s_dt]
        except Exception:
            pass
    if end_date:
        try:
            e_dt = pd.to_datetime(end_date)
            daily_units = daily_units[daily_units["date"] <= e_dt]
        except Exception:
            pass

    unit_series = daily_units["units"].to_numpy(dtype=float)
    dates = daily_units["date"].dt.strftime("%Y-%m-%d").tolist()

    display_name, _, _, f_units, metrics = select_best_model_walk_forward(
        unit_series, horizon=days_to_predict, dates=dates
    )

    history_list = [
        {
            "date": d,
            "units": int(u),
            "quantity": int(u),
            "revenue": int(round(u * avg_price)),
            "actual": int(u),
        }
        for d, u in zip(dates, unit_series)
    ]

    last_dt = daily_units["date"].iloc[-1]
    forecast_list = []
    total_f_units = 0
    total_f_rev = 0

    for i in range(days_to_predict):
        next_dt = last_dt + timedelta(days=i + 1)
        pred_u = int(round(max(0.0, f_units[i])))
        pred_r = int(round(pred_u * avg_price))
        total_f_units += pred_u
        total_f_rev += pred_r
        forecast_list.append({
            "date": next_dt.strftime("%Y-%m-%d"),
            "forecast_units": pred_u,
            "forecast_revenue": pred_r,
            "units": pred_u,
            "quantity": pred_u,
            "forecast": pred_u,
            "revenue": pred_r,
        })

    avg_daily_demand = round(float(np.mean(unit_series[-14:])) if len(unit_series) >= 14 else float(np.mean(unit_series)), 2)
    std_daily_demand = round(float(np.std(unit_series[-14:])) if len(unit_series) >= 14 else float(np.std(unit_series)), 2)

    return {
        "product": product_name,
        "unit_price": avg_price,
        "history": history_list,
        "forecast": forecast_list,
        "total_forecast_units": total_f_units,
        "total_forecast_revenue": total_f_rev,
        "avg_daily_demand": avg_daily_demand,
        "std_daily_demand": std_daily_demand,
        "model": display_name,
        "metrics": metrics,
    }
