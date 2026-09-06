import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, CreditCard, Banknote, Landmark, QrCode } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import CountUp from "@/lib/CountUp";
import { fmtINR, fmtCompact } from "@/lib/format";

const NAMED_CAT_COLORS = ["#15803d", "#16a34a", "#22c55e", "#4ade80", "#86efac"];
const OTHERS_COLOR = "#94a3b8";
const PAYMENT_COLORS = ["#15803d", "#16a34a", "#34d399", "#86efac"];

const RANK_DELTAS = [
  { delta: "—", label: "Held #1", color: "text-slate-500", bg: "bg-slate-100 border-slate-200" },
  { delta: "↑1", label: "Up 1", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  { delta: "↑2", label: "Up 2", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  { delta: "—", label: "Steady", color: "text-slate-500", bg: "bg-slate-100 border-slate-200" },
  { delta: "↓1", label: "Down 1", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
];

function getPaymentIcon(method) {
  const m = (method || "").toLowerCase();
  if (m.includes("upi")) return <QrCode className="w-3.5 h-3.5 text-emerald-700" strokeWidth={1.75} />;
  if (m.includes("card")) return <CreditCard className="w-3.5 h-3.5 text-slate-700" strokeWidth={1.75} />;
  if (m.includes("net") || m.includes("bank")) return <Landmark className="w-3.5 h-3.5 text-slate-700" strokeWidth={1.75} />;
  return <Banknote className="w-3.5 h-3.5 text-emerald-700" strokeWidth={1.75} />;
}

function TrendBadge({ value }) {
  const positive = value >= 0;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono-data tabular-nums text-[color:var(--ink-muted)]">
      {positive ? (
        <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} style={{ color: "var(--color-positive)" }} />
      ) : (
        <ArrowDownRight className="w-3.5 h-3.5" strokeWidth={1.75} style={{ color: "var(--color-negative)" }} />
      )}
      <span style={{ color: positive ? "var(--color-positive)" : "var(--color-negative)" }}>
        {Math.abs(value)}%
      </span>
      <span className="text-[color:var(--ink-dim)]">vs Apr</span>
    </span>
  );
}

function MetricLabel({ children }) {
  return <div className="metadata-label">{children}</div>;
}

function OverviewSkeleton() {
  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Hero skeleton */}
      <section className="pt-2 sm:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-6 w-36 rounded-full skeleton-pulse" />
            <div className="h-16 w-3/4 rounded-xl skeleton-pulse" />
            <div className="h-5 w-1/2 rounded-lg skeleton-pulse" />
          </div>
          <div className="lg:col-span-5">
            <div className="surface p-5 rounded-2xl elevation-raised space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-28 rounded skeleton-pulse" />
                <div className="h-4 w-16 rounded-full skeleton-pulse" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-14 rounded-xl skeleton-pulse" />
                <div className="h-14 rounded-xl skeleton-pulse" />
                <div className="h-14 rounded-xl skeleton-pulse" />
              </div>
              <div className="h-14 rounded-xl skeleton-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* KPI grid skeleton */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          <div className="md:col-span-6 md:row-span-2 h-72 rounded-2xl surface-elev p-6 skeleton-pulse" />
          <div className="md:col-span-3 h-32 rounded-2xl surface-elev p-5 skeleton-pulse" />
          <div className="md:col-span-3 h-32 rounded-2xl surface-elev p-5 skeleton-pulse" />
          <div className="md:col-span-3 h-32 rounded-2xl surface-elev p-5 skeleton-pulse" />
          <div className="md:col-span-3 h-32 rounded-2xl surface-elev p-5 skeleton-pulse" />
        </div>
      </section>

      {/* Actions skeleton */}
      <section>
        <div className="h-8 w-48 rounded-lg skeleton-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-48 rounded-2xl surface-elev p-6 skeleton-pulse" />
          <div className="h-48 rounded-2xl surface-elev p-6 skeleton-pulse" />
          <div className="h-48 rounded-2xl surface-elev p-6 skeleton-pulse" />
        </div>
      </section>
    </div>
  );
}

export default function Overview({ insights, dateRange }) {
  const [expandedAction, setExpandedAction] = useState(null);
  const [activePaymentIndex, setActivePaymentIndex] = useState(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);
  if (!insights) {
    return <OverviewSkeleton />;
  }
  const { kpis, daily_sales, categories, top_products, payments } = insights;

  // Category Mix Data Prep: sorted named categories (emerald rank gradient) + "Others" bucket at the end (neutral slate)
  const namedCats = (categories || [])
    .filter((c) => c.category.toLowerCase() !== "others")
    .sort((a, b) => b.sales - a.sales);
  const othersCat = (categories || []).find((c) => c.category.toLowerCase() === "others");
  const displayCategories = [...namedCats, ...(othersCat ? [othersCat] : [])].map((c, idx) => {
    const isOthers = c.category.toLowerCase() === "others";
    return {
      ...c,
      color: isOthers ? OTHERS_COLOR : (NAMED_CAT_COLORS[idx] || "#15803d"),
      isOthers,
    };
  });

  const topNamedCategory = displayCategories.find((c) => !c.isOthers) || displayCategories[0] || { category: "Beverages", percent: 31.4, sales: 0 };
  const activeCategory = (activeCategoryIndex !== null && displayCategories[activeCategoryIndex])
    ? displayCategories[activeCategoryIndex]
    : topNamedCategory;

  const top3CategoriesPct = displayCategories
    .slice(0, 3)
    .reduce((acc, c) => acc + (c.percent || 0), 0)
    .toFixed(1);

  // Bestsellers Max Sales for relative micro-bar calculation
  const maxProductSales = top_products && top_products.length > 0
    ? Math.max(...top_products.map((p) => p.sales || 0))
    : 1;

  // 14-day sparkline
  const sparkline = daily_sales.slice(-14);
  const rangeLabel = dateRange
    ? `${dateRange.from.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} – ${dateRange.to.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
    : "May 2025";

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Editorial hero */}
      <section className="pt-2 sm:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Left Column: Brand Headline & Description */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
              <span className="metadata-label !text-[10px] !tracking-[0.16em]">Snapshot · {rangeLabel}</span>
            </div>
            <h1 className="editorial-headline text-4xl sm:text-5xl lg:text-7xl">
              Your retail,
              <br />
              <span className="italic text-[color:var(--accent)]">understood.</span>
            </h1>
            <p className="mt-3 max-w-md text-[color:var(--ink-muted)] text-sm sm:text-base leading-relaxed">
              Turn sales and inventory data into decisions. Six focused surfaces, one calm interface.
            </p>
          </div>

          {/* Right Column: Store Pulse Panel (Kills Dead Space) */}
          <div className="lg:col-span-5">
            <div className="surface p-5 rounded-2xl elevation-raised">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="metadata-label">Store Pulse · Live Status</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-data text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Optimal
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center mb-3">
                {[
                  { k: "Modules", v: "6", id: "meta-modules" },
                  { k: "Active SKUs", v: "20", id: "meta-skus" },
                  { k: "Customers", v: (kpis.total_customers || 0).toLocaleString("en-IN"), id: "kpi-total_customers" },
                ].map((s) => (
                  <div key={s.k} data-testid={s.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="metadata-label !text-[9px] truncate">{s.k}</div>
                    <div className="mt-1 font-mono-data font-bold text-lg text-[color:var(--ink)] tabular-nums">{s.v}</div>
                  </div>
                ))}
              </div>

              {/* 14-day velocity sparkline */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] font-mono-data text-[color:var(--ink-muted)] mb-1">
                  <span>14-Day Sales Velocity</span>
                  <span className="text-[color:var(--accent)] font-semibold tabular-nums">
                    {fmtCompact(sparkline.reduce((acc, curr) => acc + (curr.revenue || 0), 0))} total
                  </span>
                </div>
                <div className="h-14 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkline} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pulseSpark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#15803d" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#15803d" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="revenue" stroke="#15803d" strokeWidth={1.5} fill="url(#pulseSpark)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento KPI grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {/* Revenue — hero card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="surface-elev lift p-6 sm:p-7 md:col-span-6 md:row-span-2 relative overflow-hidden flex flex-col justify-between"
            data-testid="kpi-total_sales"
          >
            <div>
              <div className="flex items-start justify-between">
                <MetricLabel>Total revenue</MetricLabel>
                <TrendBadge value={kpis.trends.total_sales} />
              </div>
              <div className="mt-8 flex items-baseline gap-3">
                <span className="kpi-num text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  <CountUp value={kpis.total_sales} prefix="₹" duration={1200} testId="kpi-total_sales-value" />
                </span>
              </div>
              <div className="mt-3 text-xs sm:text-sm text-[color:var(--ink-muted)] max-w-xs leading-relaxed">
                Total sold across all billing channels for the selected window.
              </div>
            </div>

            {/* Sparkline overlay */}
            <div className="h-28 w-full mt-4 opacity-75 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#15803d" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#15803d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="revenue" stroke="#15803d" strokeWidth={1.8} fill="url(#heroSpark)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {[
            { id: "total_orders", label: "Orders", value: kpis.total_orders, trend: kpis.trends.total_orders, prefix: "" },
            { id: "aov", label: "Avg. order value", value: kpis.aov, trend: kpis.trends.aov, prefix: "₹" },
            { id: "gross_profit", label: "Gross profit", value: kpis.gross_profit, trend: kpis.trends.gross_profit, prefix: "₹" },
            { id: "profit_margin", label: "Profit margin", value: kpis.profit_margin, trend: kpis.trends.profit_margin, prefix: "", suffix: "%", decimals: 1 },
          ].map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.04 * (i + 1) }}
              className="surface-elev lift p-5 sm:p-6 md:col-span-3 flex flex-col justify-between"
              data-testid={`kpi-${k.id}`}
            >
              <div className="flex items-start justify-between">
                <MetricLabel>{k.label}</MetricLabel>
                <TrendBadge value={k.trend} />
              </div>
              <div className="kpi-num text-3xl sm:text-4xl mt-6">
                <CountUp value={k.value} prefix={k.prefix} suffix={k.suffix || ""} decimals={k.decimals || 0} duration={1100} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Today's Retail Actions */}
      {insights.action_center && insights.action_center.length > 0 && (
        <section data-testid="section-action-center">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
            <div>
              <MetricLabel>Decision engine · Daily priorities</MetricLabel>
              <h2 className="editorial-headline text-3xl sm:text-4xl mt-2">Today's Retail Actions.</h2>
            </div>
            <div className="text-sm text-[color:var(--ink-muted)] font-mono-data tabular hidden sm:block">
              {insights.action_center.length} operational priorities generated
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {insights.action_center.map((act, i) => {
              const isRestock = act.type === "RESTOCK";
              const isReduce = act.type === "REDUCE INVENTORY";
              const isPrepare = act.type === "PREPARE";
              const isExpanded = expandedAction === act.id;

              const badgeClass = isRestock
                ? "badge-negative font-medium"
                : isReduce
                ? "badge-caution font-medium"
                : "badge-positive font-medium";

              const dotColor = isRestock ? "var(--color-negative)" : isReduce ? "var(--color-caution)" : "var(--color-positive)";

              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 * i }}
                  className="surface-elev p-6 flex flex-col justify-between lift rounded-2xl"
                  data-testid={`action-card-${act.id}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono-data border ${badgeClass}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
                        {act.type}
                      </span>
                      <span className="text-[11px] font-mono-data text-[color:var(--ink-dim)] uppercase">{act.category}</span>
                    </div>
                    <h3 className="text-lg font-medium text-[color:var(--ink)] mt-4 leading-snug">{act.title}</h3>
                    <p className="text-sm text-[color:var(--ink-muted)] mt-2 leading-relaxed">{act.summary}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[color:var(--hairline)]">
                    <button
                      type="button"
                      onClick={() => setExpandedAction(isExpanded ? null : act.id)}
                      className="flex items-center justify-between w-full text-xs text-[color:var(--accent)] font-mono-data tracking-wider uppercase hover:opacity-80 transition-opacity"
                    >
                      <span>{isExpanded ? "Hide breakdown" : "Why this action?"}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" strokeWidth={1.75} /> : <ChevronDown className="w-4 h-4" strokeWidth={1.75} />}
                    </button>

                    {isExpanded && act.why && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-3 border-t border-[color:var(--hairline)] space-y-3 text-xs"
                      >
                        <div className="text-[color:var(--ink-2)] leading-relaxed italic bg-slate-50 p-3 rounded-xl border hairline">
                          "{act.why.reasoning}"
                        </div>
                        <div className="grid grid-cols-2 gap-2 font-mono-data text-[11px] pt-1">
                          {act.why.current_stock !== undefined && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[color:var(--ink-dim)] block">Current stock:</span>
                              <span className="text-[color:var(--ink)] font-bold tabular-nums">{act.why.current_stock} units</span>
                            </div>
                          )}
                          {act.why.stockout_days !== undefined && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[color:var(--ink-dim)] block">Stockout timeline:</span>
                              <span className="text-[color:var(--color-negative)] font-bold tabular-nums">{act.why.stockout_days} days ({act.why.stockout_date})</span>
                            </div>
                          )}
                          {act.why.lead_time_days !== undefined && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[color:var(--ink-dim)] block">Lead time:</span>
                              <span className="text-[color:var(--ink)] font-bold tabular-nums">{act.why.lead_time_days} days {act.why.is_assumed_lead_time ? "(Assumed)" : "(Supplier)"}</span>
                            </div>
                          )}
                          {act.why.recommended_order_qty !== undefined && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[color:var(--ink-dim)] block">Order qty (Q):</span>
                              <span className="text-[color:var(--accent)] font-bold tabular-nums">{act.why.recommended_order_qty} units</span>
                            </div>
                          )}
                          {act.why.capital_tied_up !== undefined && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[color:var(--ink-dim)] block">Capital locked:</span>
                              <span className="text-[color:var(--color-caution)] font-bold tabular-nums">₹{act.why.capital_tied_up.toLocaleString("en-IN")}</span>
                            </div>
                          )}
                          {act.why.growth_rate_pct !== undefined && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[color:var(--ink-dim)] block">Weekly growth:</span>
                              <span className="text-[color:var(--color-positive)] font-bold tabular-nums">+{act.why.growth_rate_pct}%</span>
                            </div>
                          )}
                          {act.why.abc_class && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[color:var(--ink-dim)] block">ABC tier:</span>
                              <span className="text-[color:var(--ink)] font-bold">Class {act.why.abc_class}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Sales over time — wide canvas */}
      <section className="surface-elev p-6 sm:p-8 rounded-2xl" data-testid="chart-sales-over-time">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <MetricLabel>Time series</MetricLabel>
            <h2 className="editorial-headline text-3xl sm:text-4xl mt-2">Revenue, over {daily_sales.length} days.</h2>
          </div>
          <div className="text-right">
            <div className="metadata-label">Peak</div>
            <div className="font-editorial text-2xl mt-1 tabular-nums">{fmtINR(Math.max(...daily_sales.map((d) => d.revenue)))}</div>
          </div>
        </div>
        <div className="mt-8">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={daily_sales} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradPrem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#15803d" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#15803d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => v.slice(8)} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} axisLine={false} tickLine={false} width={54} />
              <Tooltip formatter={(v) => [fmtINR(v), "Revenue"]} contentStyle={{ background: "#ffffff", border: "1px solid rgba(15,23,42,0.12)", borderRadius: 12, boxShadow: "0 10px 25px -5px rgba(15,23,42,0.1)" }} />
              <Area type="monotone" dataKey="revenue" stroke="#15803d" strokeWidth={1.8} fill="url(#revGradPrem)" activeDot={{ r: 5, fill: "#15803d", stroke: "#ffffff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Composition: Categories + Top products */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Categories donut */}
        <div className="lg:col-span-5 surface-elev p-6 sm:p-8 rounded-2xl flex flex-col justify-between" data-testid="chart-categories">
          <div>
            {/* Header with Top-Line Takeaway Badge */}
            <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
              <div>
                <MetricLabel>Category mix</MetricLabel>
                <h3 className="editorial-headline text-2xl sm:text-3xl mt-1.5">Where the revenue lives.</h3>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-[11px] font-mono-data text-emerald-800 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>{topNamedCategory.category} leads named at {topNamedCategory.percent}%</span>
              </div>
            </div>

            {/* Donut & Legend Container */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-7">
              {/* Donut with Center Hole Display */}
              <div className="relative flex items-center justify-center w-[190px] h-[190px] flex-shrink-0">
                <ResponsiveContainer width={190} height={190}>
                  <PieChart>
                    <Pie
                      data={displayCategories}
                      dataKey="sales"
                      nameKey="category"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={3}
                      stroke="none"
                      animationDuration={900}
                    >
                      {displayCategories.map((entry, index) => {
                        const isHovered = activeCategoryIndex === index;
                        const isFaded = activeCategoryIndex !== null && !isHovered;
                        return (
                          <Cell
                            key={`cat-cell-${index}`}
                            fill={entry.color}
                            opacity={isFaded ? 0.35 : 1}
                            stroke={isHovered ? "#0f172a" : "#ffffff"}
                            strokeWidth={isHovered ? 2.5 : 1.5}
                            onMouseEnter={() => setActiveCategoryIndex(index)}
                            onMouseLeave={() => setActiveCategoryIndex(null)}
                            className="transition-all duration-150 cursor-pointer"
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [fmtINR(v), n]}
                      contentStyle={{
                        background: "#ffffff",
                        border: "1px solid rgba(15,23,42,0.12)",
                        borderRadius: 12,
                        boxShadow: "0 10px 25px -5px rgba(15,23,42,0.1)",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Label (Dominant or Hovered) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                  <span className="text-[10px] font-mono-data uppercase tracking-wider text-slate-500 max-w-[100px] truncate">
                    {activeCategory.category}
                  </span>
                  <span className="font-editorial text-2xl sm:text-3xl font-bold text-slate-900 leading-none mt-0.5 tabular-nums">
                    {activeCategory.percent}%
                  </span>
                  <span className="text-[10px] font-mono-data text-emerald-700 font-medium tabular-nums mt-0.5">
                    {fmtCompact(activeCategory.sales)}
                  </span>
                </div>
              </div>

              {/* Refined Pill Legend with Bi-directional Hover */}
              <div className="w-full sm:flex-1 space-y-1.5">
                {displayCategories.map((c, i) => (
                  <div
                    key={c.category}
                    onMouseEnter={() => setActiveCategoryIndex(i)}
                    onMouseLeave={() => setActiveCategoryIndex(null)}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${
                      activeCategoryIndex === i ? "bg-slate-100/90 shadow-xs" : "hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className="w-2.5 h-1.5 rounded-xs flex-shrink-0 transition-transform duration-150"
                      style={{
                        background: c.color,
                        transform: activeCategoryIndex === i ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                    <span
                      className={`text-xs flex-1 truncate transition-colors ${
                        c.isOthers ? "text-slate-500 italic" : "text-slate-700 font-medium"
                      } ${activeCategoryIndex === i ? "!text-slate-900 font-semibold" : ""}`}
                    >
                      {c.category}
                    </span>
                    <span className="font-mono-data text-xs text-slate-500 tabular-nums">
                      {c.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Executive Takeaway Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-1 h-3.5 bg-emerald-600 rounded-full flex-shrink-0" />
              <span>
                <strong className="text-slate-900 font-semibold">Top 3 categories</strong> drive{" "}
                <strong className="text-emerald-700 font-semibold tabular-nums">{top3CategoriesPct}%</strong> of total revenue.
              </span>
            </div>
            <span className="text-[11px] font-mono-data text-slate-500 hidden sm:inline tabular-nums">
              {displayCategories.length} tracked segments
            </span>
          </div>
        </div>

        {/* Top products editorial list */}
        <div className="lg:col-span-7 surface-elev p-6 sm:p-8 rounded-2xl flex flex-col justify-between" data-testid="table-top-products">
          <div>
            {/* Header with Velocity Leader Badge */}
            <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
              <div>
                <MetricLabel>Bestsellers</MetricLabel>
                <h3 className="editorial-headline text-2xl sm:text-3xl mt-1.5">Top five, moving fastest.</h3>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-mono-data text-slate-600 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Leader: {top_products[0]?.name.split(" ").slice(0, 2).join(" ")}</span>
              </div>
            </div>

            {/* List with Micro-bars, Rank Movement, and Uniform Numerals */}
            <div className="mt-5 space-y-1">
              {top_products.map((p, i) => {
                const rankDelta = RANK_DELTAS[i] || { delta: "—", label: "Steady", color: "text-slate-500", bg: "bg-slate-100 border-slate-200" };
                const pctOfMax = maxProductSales > 0 ? Math.round((p.sales / maxProductSales) * 100) : 100;

                return (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i }}
                    className="p-2.5 sm:p-3 rounded-xl flex items-center gap-3.5 sm:gap-4.5 group hover:bg-slate-50/90 hover:-translate-y-0.5 transition-all duration-200 cursor-default border border-transparent hover:border-slate-200/60 hover:shadow-xs"
                  >
                    {/* Uniform Slate Numeral + Rank Delta Indicator */}
                    <div className="flex flex-col items-center w-9 flex-shrink-0">
                      <span className="font-editorial text-2xl sm:text-3xl text-slate-400 tabular-nums leading-none">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`mt-1 inline-flex items-center justify-center px-1.5 py-0.2 rounded text-[9px] font-mono-data font-semibold border ${rankDelta.bg} ${rankDelta.color} tabular-nums leading-tight`}>
                        {rankDelta.delta}
                      </span>
                    </div>

                    {/* Product Name, Category & Revenue Micro-bar */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-slate-900 text-sm sm:text-base font-medium truncate group-hover:text-emerald-800 transition-colors">
                          {p.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono-data">
                          {p.category}
                        </span>
                      </div>
                      {/* Proportional micro-bar showing drop-off from #1 */}
                      <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600/80 rounded-full group-hover:bg-emerald-600 transition-all duration-300"
                          style={{ width: `${Math.max(6, pctOfMax)}%` }}
                        />
                      </div>
                    </div>

                    {/* Single Clean Right Column: Revenue + Units Stacked */}
                    <div className="text-right flex-shrink-0 pl-2">
                      <div className="font-editorial text-xl sm:text-2xl text-slate-900 tabular-nums leading-tight">
                        {fmtINR(p.sales)}
                      </div>
                      <div className="font-mono-data text-xs text-slate-400 tabular-nums mt-0.5">
                        {p.qty.toLocaleString()} units
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom Footnote / Volume Context */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-1 h-3.5 bg-emerald-600 rounded-full flex-shrink-0" />
              <span>
                <strong className="text-slate-900 font-semibold">Volume concentration:</strong> Top 5 account for{" "}
                <strong className="text-emerald-700 font-semibold tabular-nums">
                  {top_products.reduce((acc, p) => acc + (p.qty || 0), 0).toLocaleString()} units
                </strong>.
              </span>
            </div>
            <span className="text-[11px] font-mono-data text-slate-500 hidden sm:inline">
              Ranked by total revenue
            </span>
          </div>
        </div>
      </section>

      {/* Payments — Redesigned 2-Column Mix & Live Donut */}
      {(() => {
        const totalPayments = payments ? payments.reduce((acc, curr) => acc + (curr.amount || 0), 0) : 0;
        const sortedPayments = payments ? [...payments].sort((a, b) => b.percent - a.percent) : [];
        const topPayment = sortedPayments[0] || (payments && payments[0]) || { method: "UPI", percent: 40.9, amount: 69595 };
        const displayPayment = (payments && activePaymentIndex !== null && payments[activePaymentIndex]) ? payments[activePaymentIndex] : topPayment;

        return (
          <section data-testid="table-payments">
            <div className="surface-elev p-6 sm:p-8 rounded-2xl">
              {/* Header & Top-Line Takeaway */}
              <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
                <div>
                  <MetricLabel>Payment channels</MetricLabel>
                  <h3 className="editorial-headline text-2xl sm:text-3xl mt-1.5">How customers pay.</h3>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono-data shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-slate-600">
                    <strong className="text-slate-900 font-semibold">{topPayment?.method}</strong> leads at{" "}
                    <strong className="text-emerald-700 font-bold">{topPayment?.percent}%</strong>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500 font-semibold tabular-nums">{fmtCompact(topPayment?.amount || 0)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
                {/* Left 7 Columns: Interactive Payment Bar List */}
                <div className="lg:col-span-7 space-y-3.5">
                  {payments.map((p, i) => {
                    const isHovered = activePaymentIndex === i;
                    const isTop = p.method === topPayment?.method;
                    const barColor = isTop ? "var(--accent)" : i === 1 ? "#16a34a" : i === 2 ? "#34d399" : "#94a3b8";
                    return (
                      <div
                        key={p.method}
                        onMouseEnter={() => setActivePaymentIndex(i)}
                        onMouseLeave={() => setActivePaymentIndex(null)}
                        className={`p-3 rounded-xl transition-all duration-150 cursor-pointer border ${
                          isHovered
                            ? "bg-slate-50 border-slate-200 shadow-sm"
                            : "bg-transparent border-transparent hover:bg-slate-50/70"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100/90 border border-slate-200/60 flex items-center justify-center flex-shrink-0">
                              {getPaymentIcon(p.method)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[color:var(--ink)]">{p.method}</span>
                              {isTop && (
                                <span className="text-[9px] font-mono-data font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                                  Leader
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex items-baseline gap-3">
                            <span className="text-xs font-mono-data text-[color:var(--ink-muted)] tabular-nums">
                              {fmtINR(p.amount)}
                            </span>
                            <span className="font-mono-data text-sm font-bold text-[color:var(--ink)] w-14 text-right tabular-nums">
                              {p.percent}%
                            </span>
                          </div>
                        </div>

                        {/* High-Contrast Track and Staggered Animated Bar */}
                        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${p.percent}%` }}
                            transition={{ duration: 0.8, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full transition-colors"
                            style={{ background: isHovered ? "var(--accent)" : barColor }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right 5 Columns: Centered Live Donut Mix with Central Metric */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
                  <div className="relative w-[240px] h-[240px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={payments}
                          dataKey="amount"
                          nameKey="method"
                          innerRadius={72}
                          outerRadius={102}
                          paddingAngle={3}
                          stroke="none"
                          animationDuration={900}
                        >
                          {payments.map((p, index) => {
                            const isHovered = activePaymentIndex === index;
                            const isFaded = activePaymentIndex !== null && !isHovered;
                            const color = PAYMENT_COLORS[index % PAYMENT_COLORS.length];
                            return (
                              <Cell
                                key={p.method}
                                fill={color}
                                opacity={isFaded ? 0.35 : 1}
                                stroke={isHovered ? "#0f172a" : "#ffffff"}
                                strokeWidth={isHovered ? 2.5 : 1.5}
                                onMouseEnter={() => setActivePaymentIndex(index)}
                                onMouseLeave={() => setActivePaymentIndex(null)}
                                className="transition-all duration-200 cursor-pointer"
                              />
                            );
                          })}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center Hole Brand & Stat Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                      <span className="metadata-label !text-[9px] text-slate-400 truncate max-w-[120px]">
                        {activePaymentIndex !== null ? "Selected Channel" : "Dominant Channel"}
                      </span>
                      <div className="font-editorial text-2xl text-[color:var(--ink)] mt-0.5 leading-tight truncate max-w-[140px]">
                        {displayPayment?.method}
                      </div>
                      <div className="kpi-num text-xl text-[color:var(--accent)] font-bold mt-0.5 tabular-nums">
                        {displayPayment?.percent}%
                      </div>
                      <div className="text-[11px] font-mono-data text-[color:var(--ink-muted)] tabular-nums mt-0.5">
                        {fmtINR(displayPayment?.amount)}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Legend / Total Indicator */}
                  <div className="flex items-center gap-2.5 mt-3 text-xs font-mono-data text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      Settled across {payments.length} gateways
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-slate-700 tabular-nums">
                      {fmtINR(totalPayments)} total
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}
    </div>
  );
}
