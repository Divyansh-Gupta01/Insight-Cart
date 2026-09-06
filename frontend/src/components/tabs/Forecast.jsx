import { useEffect, useState } from "react";
import { fetchForecast } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import CountUp from "@/lib/CountUp";
import { fmtINR, fmtCompact } from "@/lib/format";
import { motion } from "framer-motion";

const forecastClientCache = new Map();

export default function Forecast({ dateRange }) {
  const [data, setData] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = `${dateRange?.start_date}_${dateRange?.end_date}_${selectedProduct}`;
    if (forecastClientCache.has(cacheKey)) {
      setData(forecastClientCache.get(cacheKey));
      setLoading(false);
    } else if (!data) {
      setLoading(true);
    }

    fetchForecast(
      7,
      dateRange?.start_date,
      dateRange?.end_date,
      selectedProduct === "all" ? null : selectedProduct
    )
      .then((res) => {
        forecastClientCache.set(cacheKey, res);
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange?.start_date, dateRange?.end_date, selectedProduct]);

  if (!data && loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-[color:var(--ink-muted)] text-sm tracking-widest uppercase">Fitting model…</div>
    </div>
  );

  if (!data) return null;

  const isSku = Boolean(data.product);
  const historySeries = data.history || [];
  const forecastSeries = data.forecast || [];

  const getActualValue = (h) => {
    if (!h) return 0;
    if (isSku) {
      if (h.units !== undefined && h.units !== null) return Number(h.units);
      if (h.quantity !== undefined && h.quantity !== null) return Number(h.quantity);
      if (h.actual !== undefined && h.actual !== null) return Number(h.actual);
      return 0;
    }
    if (h.revenue !== undefined && h.revenue !== null) return Number(h.revenue);
    if (h.actual !== undefined && h.actual !== null) return Number(h.actual);
    return 0;
  };

  const getForecastValue = (f) => {
    if (!f) return 0;
    if (isSku) {
      if (f.forecast_units !== undefined && f.forecast_units !== null) return Number(f.forecast_units);
      if (f.units !== undefined && f.units !== null) return Number(f.units);
      if (f.quantity !== undefined && f.quantity !== null) return Number(f.quantity);
      if (f.forecast !== undefined && f.forecast !== null) return Number(f.forecast);
      return 0;
    }
    if (f.forecast !== undefined && f.forecast !== null) return Number(f.forecast);
    if (f.revenue !== undefined && f.revenue !== null) return Number(f.revenue);
    return 0;
  };

  const lastHistory = historySeries.length > 0 ? historySeries[historySeries.length - 1] : null;

  const merged = [
    ...historySeries.map((h) => ({
      date: h.date,
      actual: getActualValue(h),
      forecast: null,
    })),
    ...(lastHistory
      ? [
          {
            date: lastHistory.date,
            actual: getActualValue(lastHistory),
            forecast: getActualValue(lastHistory),
          },
        ]
      : []),
    ...forecastSeries.map((f) => ({
      date: f.date,
      actual: null,
      forecast: getForecastValue(f),
      revenue: f.revenue || f.forecast_revenue,
    })),
  ].filter((d) => d.date);

  const total7 = forecastSeries.reduce((s, x) => s + (x.forecast || 0), 0);
  const avg7 = forecastSeries.length > 0 ? Math.round(total7 / forecastSeries.length) : 0;
  const peak = forecastSeries.length > 0
    ? forecastSeries.reduce((a, b) => (b.forecast > a.forecast ? b : a))
    : { forecast: 0, date: "" };
  const boundaryDate = historySeries.length > 0 ? historySeries[historySeries.length - 1].date : "";

  return (
    <div className="space-y-16 pt-12 sm:pt-16">
      {/* Hero */}
      <section>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="metadata-label">Demand forecast · statistical estimate</div>
            <h1 className="editorial-headline text-5xl sm:text-6xl lg:text-7xl mt-6">
              The next<br />
              <span className="italic text-[color:var(--accent)]">seven days.</span>
            </h1>
            <p className="mt-8 max-w-lg text-[color:var(--ink-2)] text-lg leading-relaxed">
              Historical performance projected forward via Walk-Forward Cross-Validation. Estimates, not certainties.
            </p>
          </div>

          {/* Product selector dropdown */}
          <div className="surface-elev p-5 rounded-xl border hairline min-w-[280px]">
            <div className="metadata-label mb-2">Select Forecast View</div>
            <select
              data-testid="forecast-sku-selector"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full bg-[color:var(--surface)] text-[color:var(--ink)] border border-[color:var(--hairline-strong)] rounded-lg px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-[color:var(--accent)] transition-colors cursor-pointer"
            >
              <option value="all">All Products (Total Store Revenue)</option>
              {(data.available_products || []).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {isSku && (
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono-data text-[color:var(--accent)]">
                <span>SKU Unit Demand Mode</span>
                <span>₹{data.unit_price} / unit</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            label: isSku ? "Predicted Units · 7 days" : "Predicted · 7 days",
            value: isSku ? data.total_forecast_units : total7,
            prefix: isSku ? "" : "₹",
            suffix: isSku ? " units" : "",
            sub: isSku
              ? `≈ ₹${(data.total_forecast_revenue || 0).toLocaleString("en-IN")} projected revenue`
              : "Total revenue",
            testid: "forecast-total",
          },
          {
            label: isSku ? "Average Daily Demand" : "Average daily",
            value: isSku ? (data.avg_daily_demand || avg7) : avg7,
            prefix: isSku ? "" : "₹",
            suffix: isSku ? " units/day" : "",
            sub: isSku ? "Mean daily velocity" : "Mean of forecast",
          },
          {
            label: "Peak day",
            value: peak.forecast,
            prefix: isSku ? "" : "₹",
            suffix: isSku ? " units" : "",
            sub: peak.date ? `Projected peak on ${peak.date}` : "Peak period",
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i }}
            className="surface-elev p-8 lift"
            data-testid={k.testid}
          >
            <div className="metadata-label">{k.label}</div>
            <div className="editorial-num text-5xl sm:text-6xl mt-6">
              <CountUp value={k.value} prefix={k.prefix} suffix={k.suffix || ""} duration={1200} />
            </div>
            <div className="mt-3 text-sm text-[color:var(--ink-muted)]">{k.sub}</div>
          </motion.div>
        ))}
      </section>

      {/* Main chart */}
      <section className="surface-elev p-8 sm:p-10" data-testid="forecast-chart">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="metadata-label">Historical · projected</div>
            <h2 className="editorial-headline text-3xl sm:text-4xl mt-2">
              {isSku ? `${data.product} Demand Curve.` : "Revenue curve."}
            </h2>
          </div>
          <div className="flex items-center gap-6 text-xs text-[color:var(--ink-muted)]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-[2px]" style={{ background: "#efece5" }} />
              <span>Historical {isSku ? "(Units)" : "(₹)"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0 border-t-2 border-dashed" style={{ borderColor: "var(--accent)" }} />
              <span>Forecast {isSku ? "(Units)" : "(₹)"}</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={merged} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(15,23,42,0.06)" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickFormatter={(v) => (v ? v.slice(5) : "")}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(v) => (isSku ? v : fmtCompact(v))}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip
              formatter={(v, n) => {
                if (!v) return ["—", ""];
                if (isSku) return [`${v} units`, n === "actual" ? "Historical Sales" : "Forecasted Demand"];
                return [fmtINR(v), n === "actual" ? "Historical" : "Forecast"];
              }}
              contentStyle={{
                background: "#ffffff",
                border: "1px solid rgba(15,23,42,0.12)",
                borderRadius: 12,
                boxShadow: "0 10px 25px -5px rgba(15,23,42,0.1)",
              }}
            />
            {boundaryDate && (
              <ReferenceLine x={boundaryDate} stroke="rgba(15,23,42,0.2)" strokeDasharray="3 3" />
            )}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#94a3b8"
              strokeWidth={1.8}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#15803d"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 3.5, fill: "#15803d" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Day-by-day predictions */}
      <section data-testid="forecast-table">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="metadata-label">Day by day</div>
            <h2 className="editorial-headline text-3xl sm:text-4xl mt-2">Where each day lands.</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {forecastSeries.map((f, i) => (
            <motion.div
              key={f.date}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className="surface p-4 lift"
            >
              <div className="text-[10px] text-[color:var(--ink-dim)] font-mono-data tabular">
                Day +{i + 1}
              </div>
              <div className="font-editorial text-2xl mt-3">
                {isSku ? `${f.forecast} units` : fmtINR(f.forecast)}
              </div>
              {isSku && f.revenue && (
                <div className="mt-1 text-[11px] text-[color:var(--accent)] font-mono-data">
                  {fmtINR(f.revenue)}
                </div>
              )}
              <div className="mt-2 text-[10px] text-[color:var(--ink-dim)] font-mono-data tabular">{f.date}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 text-[10px] text-[color:var(--ink-dim)] tracking-widest uppercase flex items-center justify-between flex-wrap gap-2">
          <span>
            Selected Model: <strong className="text-[color:var(--ink-2)]">{data.model}</strong>
            {data.metrics?.wape !== undefined && ` · CV WAPE: ${data.metrics.wape}%`}
            {data.metrics?.smape !== undefined && ` · sMAPE: ${data.metrics.smape}%`}
          </span>
          <span>Forecasts are directional, not guaranteed.</span>
        </div>
      </section>
    </div>
  );
}
