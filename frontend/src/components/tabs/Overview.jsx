import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import CountUp from "@/lib/CountUp";
import { fmtINR, fmtCompact } from "@/lib/format";

const CAT_COLORS = ["#15803d", "#059669", "#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#f59e0b", "#ec4899"];

function TrendBadge({ value }) {
  const positive = value >= 0;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono-data tabular text-[color:var(--ink-muted)]">
      {positive ? <ArrowUpRight className="w-3 h-3" style={{ color: "var(--positive)" }} /> : <ArrowDownRight className="w-3 h-3" style={{ color: "var(--negative)" }} />}
      <span style={{ color: positive ? "var(--positive)" : "var(--negative)" }}>{Math.abs(value)}%</span>
      <span className="text-[color:var(--ink-dim)]">vs Apr</span>
    </span>
  );
}

function MetricLabel({ children }) {
  return <div className="metadata-label">{children}</div>;
}

export default function Overview({ insights, dateRange }) {
  const [expandedAction, setExpandedAction] = useState(null);
  if (!insights) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-[color:var(--ink-muted)] text-sm tracking-widest uppercase">Reading signals…</div>
      </div>
    );
  }
  const { kpis, daily_sales, categories, top_products, payments } = insights;

  // Little sparkline behind hero — last 14 days
  const sparkline = daily_sales.slice(-14);
  const rangeLabel = dateRange ? `${dateRange.from.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} – ${dateRange.to.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : "May 2025";

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Editorial hero */}
      <section className="pt-12 sm:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <MetricLabel>Snapshot · {rangeLabel}</MetricLabel>
            <h1 className="editorial-headline text-5xl sm:text-6xl lg:text-8xl mt-6">
              Your retail,
              <br />
              <span className="italic text-[color:var(--accent)]">understood.</span>
            </h1>
            <p className="mt-8 max-w-lg text-[color:var(--ink-2)] text-lg leading-relaxed">
              Turn sales and inventory data into decisions. Six focused surfaces, one calm interface.
            </p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <div className="grid grid-cols-3 gap-6">
              {[
                { k: "Modules", v: "6", id: "meta-modules" },
                { k: "SKUs", v: "20", id: "meta-skus" },
                { k: "Customers", v: (kpis.total_customers || 0).toLocaleString("en-IN"), id: "kpi-total_customers" },
              ].map((s) => (
                <div key={s.k} data-testid={s.id}>
                  <MetricLabel>{s.k}</MetricLabel>
                  <div className="mt-3 font-editorial text-4xl">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bento KPI grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {/* Revenue — hero card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="surface-elev lift p-8 md:col-span-6 md:row-span-2 relative overflow-hidden"
            data-testid="kpi-total_sales"
          >
            <div className="flex items-start justify-between">
              <MetricLabel>Total revenue</MetricLabel>
              <TrendBadge value={kpis.trends.total_sales} />
            </div>
            <div className="mt-10 flex items-baseline gap-3">
              <span className="editorial-num text-6xl sm:text-7xl">
                <CountUp value={kpis.total_sales} prefix="₹" duration={1400} testId="kpi-total_sales-value" />
              </span>
            </div>
            <div className="mt-4 text-sm text-[color:var(--ink-muted)] max-w-xs">
              Total sold across all channels for the selected window.
            </div>

            {/* Sparkline overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 opacity-70 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
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
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 + i * 0.05 }}
              className="surface-elev lift p-6 md:col-span-3 flex flex-col justify-between"
              data-testid={`kpi-${k.id}`}
            >
              <div className="flex items-start justify-between">
                <MetricLabel>{k.label}</MetricLabel>
                <TrendBadge value={k.trend} />
              </div>
              <div className="editorial-num text-4xl sm:text-5xl mt-8">
                <CountUp value={k.value} prefix={k.prefix} suffix={k.suffix || ""} decimals={k.decimals || 0} duration={1200} />
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
                ? "bg-red-50 text-red-700 border-red-200"
                : isReduce
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200";

              const dotColor = isRestock ? "#dc2626" : isReduce ? "#d97706" : "#15803d";

              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                  className="surface-elev p-6 flex flex-col justify-between lift"
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
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && act.why && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-3 border-t border-[color:var(--hairline)] space-y-3 text-xs"
                      >
                        <div className="text-[color:var(--ink-2)] leading-relaxed italic bg-white/[0.02] p-3 rounded-lg border hairline">
                          "{act.why.reasoning}"
                        </div>
                        <div className="grid grid-cols-2 gap-2 font-mono-data text-[11px] pt-1">
                          {act.why.current_stock !== undefined && (
                            <div className="p-2 rounded bg-white/[0.02]">
                              <span className="text-[color:var(--ink-dim)] block">Current stock:</span>
                              <span className="text-[color:var(--ink)] font-bold">{act.why.current_stock} units</span>
                            </div>
                          )}
                          {act.why.stockout_days !== undefined && (
                            <div className="p-2 rounded bg-white/[0.02]">
                              <span className="text-[color:var(--ink-dim)] block">Stockout timeline:</span>
                              <span className="text-[color:var(--negative)] font-bold">{act.why.stockout_days} days ({act.why.stockout_date})</span>
                            </div>
                          )}
                          {act.why.lead_time_days !== undefined && (
                            <div className="p-2 rounded bg-white/[0.02]">
                              <span className="text-[color:var(--ink-dim)] block">Lead time:</span>
                              <span className="text-[color:var(--ink)] font-bold">{act.why.lead_time_days} days {act.why.is_assumed_lead_time ? "(Assumed)" : "(Supplier)"}</span>
                            </div>
                          )}
                          {act.why.recommended_order_qty !== undefined && (
                            <div className="p-2 rounded bg-white/[0.02]">
                              <span className="text-[color:var(--ink-dim)] block">Order qty (Q):</span>
                              <span className="text-[color:var(--accent)] font-bold">{act.why.recommended_order_qty} units</span>
                            </div>
                          )}
                          {act.why.capital_tied_up !== undefined && (
                            <div className="p-2 rounded bg-white/[0.02]">
                              <span className="text-[color:var(--ink-dim)] block">Capital locked:</span>
                              <span className="text-[color:var(--warning)] font-bold">₹{act.why.capital_tied_up.toLocaleString("en-IN")}</span>
                            </div>
                          )}
                          {act.why.growth_rate_pct !== undefined && (
                            <div className="p-2 rounded bg-white/[0.02]">
                              <span className="text-[color:var(--ink-dim)] block">Weekly growth:</span>
                              <span className="text-[color:var(--positive)] font-bold">+{act.why.growth_rate_pct}%</span>
                            </div>
                          )}
                          {act.why.abc_class && (
                            <div className="p-2 rounded bg-white/[0.02]">
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
      <section className="surface-elev p-8 sm:p-10" data-testid="chart-sales-over-time">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <MetricLabel>Time series</MetricLabel>
            <h2 className="editorial-headline text-3xl sm:text-4xl mt-2">Revenue, over {daily_sales.length} days.</h2>
          </div>
          <div className="text-right">
            <div className="metadata-label">Peak</div>
            <div className="font-editorial text-2xl mt-1">{fmtINR(Math.max(...daily_sales.map((d) => d.revenue)))}</div>
          </div>
        </div>
        <div className="mt-8">
          <ResponsiveContainer width="100%" height={320}>
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
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories donut */}
        <div className="lg:col-span-5 surface-elev p-8" data-testid="chart-categories">
          <MetricLabel>Category mix</MetricLabel>
          <h3 className="editorial-headline text-2xl sm:text-3xl mt-2">Where the revenue lives.</h3>

          <div className="mt-6 grid grid-cols-[auto_1fr] gap-8 items-center">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={categories} dataKey="sales" nameKey="category" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {categories.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v, n) => [fmtINR(v), n]} contentStyle={{ background: "#ffffff", border: "1px solid rgba(15,23,42,0.12)", borderRadius: 12, boxShadow: "0 10px 25px -5px rgba(15,23,42,0.1)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {categories.slice(0, 6).map((c, i) => (
                <div key={c.category} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                  <span className="text-sm text-[color:var(--ink-2)] flex-1 truncate">{c.category}</span>
                  <span className="font-mono-data text-xs text-[color:var(--ink-muted)] tabular">{c.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top products editorial list */}
        <div className="lg:col-span-7 surface-elev p-8" data-testid="table-top-products">
          <div className="flex items-start justify-between">
            <div>
              <MetricLabel>Bestsellers</MetricLabel>
              <h3 className="editorial-headline text-2xl sm:text-3xl mt-2">Top five, moving fastest.</h3>
            </div>
          </div>
          <div className="mt-8 divide-y divide-[color:var(--hairline)]">
            {top_products.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * i }}
                className="py-4 flex items-center gap-6 group"
              >
                <div className="font-editorial text-4xl text-[color:var(--ink-dim)] group-hover:text-[color:var(--accent)] transition-colors w-10 tabular">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[color:var(--ink)] text-base">{p.name}</div>
                  <div className="text-xs text-[color:var(--ink-dim)] tracking-widest uppercase mt-1">{p.category}</div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="font-mono-data text-sm text-[color:var(--ink-muted)] tabular">{p.qty.toLocaleString()} units</div>
                </div>
                <div className="text-right w-32">
                  <div className="font-editorial text-2xl">{fmtINR(p.sales)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payments */}
      <section data-testid="table-payments">
        <div className="surface-elev p-8">
          <MetricLabel>Payment channels</MetricLabel>
          <h3 className="editorial-headline text-2xl sm:text-3xl mt-2">How customers pay.</h3>
          <div className="mt-8 space-y-6 max-w-2xl">
            {payments.map((p, i) => (
              <div key={p.method}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[color:var(--ink)]">{p.method}</span>
                  <span className="font-mono-data text-xs text-[color:var(--ink-muted)] tabular">{p.percent}%</span>
                </div>
                <div className="relative h-[3px] bg-[color:var(--hairline)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${p.percent}%` }} transition={{ duration: 1.2, delay: 0.1 * i, ease: [0.2, 0.8, 0.2, 1] }}
                    className="h-full rounded-full"
                    style={{ background: i === 0 ? "var(--accent)" : "var(--ink-2)" }}
                  />
                </div>
                <div className="mt-1 text-[10px] font-mono-data text-[color:var(--ink-dim)] tabular">{fmtINR(p.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
