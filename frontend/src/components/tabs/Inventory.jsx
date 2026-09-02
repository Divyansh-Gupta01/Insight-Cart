import { useEffect, useState } from "react";
import { fetchInventory } from "@/lib/api";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import CountUp from "@/lib/CountUp";

const STATUS_MAP = {
  low_stock: { label: "Low stock", color: "var(--warning)", dot: "#f4c26e" },
  overstock: { label: "Overstock", color: "var(--ink-2)", dot: "#d4d1c8" },
  out_of_stock: { label: "Out of stock", color: "var(--negative)", dot: "#ff8a7a" },
  healthy: { label: "Healthy", color: "var(--positive)", dot: "#a8d474" },
};

const RISK_MAP = {
  CRITICAL: { label: "Critical", color: "#ff5c5c", bg: "rgba(255, 92, 92, 0.12)", border: "rgba(255, 92, 92, 0.28)" },
  HIGH: { label: "High", color: "#ff8a7a", bg: "rgba(255, 138, 122, 0.12)", border: "rgba(255, 138, 122, 0.28)" },
  MEDIUM: { label: "Medium", color: "#f4c26e", bg: "rgba(244, 194, 110, 0.12)", border: "rgba(244, 194, 110, 0.28)" },
  LOW: { label: "Low", color: "#a8d474", bg: "rgba(168, 212, 116, 0.12)", border: "rgba(168, 212, 116, 0.28)" },
  NONE: { label: "None", color: "var(--ink-dim)", bg: "transparent", border: "transparent" },
};

const FILTERS = [
  { id: "all", label: "All items" },
  { id: "high_risk", label: "High Risk" },
  { id: "low_stock", label: "Low stock" },
  { id: "out_of_stock", label: "Out of stock" },
  { id: "slow_moving", label: "Slow Moving" },
  { id: "overstock", label: "Overstock" },
  { id: "healthy", label: "Healthy" },
];

function StatDot({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.healthy;
  return (
    <span className="inline-flex items-center gap-2 text-xs" style={{ color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function AbcBadge({ abcClass }) {
  const isA = abcClass === "A";
  const isB = abcClass === "B";
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono-data font-bold border ${
        isA
          ? "bg-[color:var(--accent)]/15 text-[color:var(--accent)] border-[color:var(--accent)]/30"
          : isB
          ? "bg-white/10 text-[color:var(--ink-2)] border-white/15"
          : "bg-white/5 text-[color:var(--ink-dim)] border-white/10"
      }`}
      title={`ABC Pareto Tier ${abcClass} · ${isA ? "Top 80% Revenue/Profit Driver" : isB ? "Secondary 15% Driver" : "Tail 5% SKU"}`}
    >
      Class {abcClass || "B"}
    </span>
  );
}

function RiskBadge({ risk }) {
  const r = RISK_MAP[risk] || RISK_MAP.NONE;
  if (risk === "NONE" || !risk) {
    return <span className="text-[11px] font-mono-data text-[color:var(--ink-dim)]">Safe</span>;
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono-data uppercase tracking-wider"
      style={{ color: r.color, backgroundColor: r.bg, border: `1px solid ${r.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.color }} />
      {r.label}
    </span>
  );
}

export default function Inventory({ refreshKey }) {
  const [filter, setFilter] = useState("all");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchInventory("all")
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  if (!data && loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-[color:var(--ink-muted)] text-sm tracking-widest uppercase">Counting shelves…</div>
    </div>
  );

  if (!data) return null;

  const allItems = data.items || [];
  const c = data.counts || {};
  const total = c.all || 1;
  const segments = [
    { key: "healthy", value: c.healthy || 0, color: "#a8d474" },
    { key: "low_stock", value: c.low_stock || 0, color: "#f4c26e" },
    { key: "overstock", value: c.overstock || 0, color: "#d4d1c8" },
    { key: "out_of_stock", value: c.out_of_stock || 0, color: "#ff8a7a" },
  ];

  // Instant filtering
  const filteredByStatus = allItems.filter((r) => {
    if (filter === "all") return true;
    if (filter === "high_risk") return r.stockout_risk === "CRITICAL" || r.stockout_risk === "HIGH";
    if (filter === "slow_moving") return Boolean(r.is_slow_moving);
    return r.status === filter;
  });

  const items = filteredByStatus.filter((r) =>
    r.product.toLowerCase().includes(query.toLowerCase())
  );

  // Products requiring attention (critical risk or out of stock)
  const critical = allItems
    .filter((r) => r.stockout_risk === "CRITICAL" || r.stockout_risk === "HIGH" || r.status === "out_of_stock" || r.status === "low_stock")
    .sort((a, b) => (a.stockout_risk === "CRITICAL" ? -1 : 1));

  return (
    <div className="space-y-16 pt-12 sm:pt-16">
      {/* Hero */}
      <section>
        <div className="metadata-label">Inventory intelligence · retail decision support</div>
        <h1 className="editorial-headline text-5xl sm:text-6xl lg:text-7xl mt-6">
          Inventory<br />
          <span className="italic text-[color:var(--accent)]">health.</span>
        </h1>
      </section>

      {/* Health bar + stats */}
      <section className="surface-elev p-8 sm:p-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          {segments.map((s) => {
            const isActive = filter === s.key;
            return (
              <button
                key={s.key}
                type="button"
                data-testid={`inv-stat-${s.key}`}
                onClick={() => setFilter(isActive ? "all" : s.key)}
                className={`text-left p-3 -m-3 rounded-xl transition-all cursor-pointer ${
                  isActive ? "bg-white/[0.08] ring-1 ring-[color:var(--accent)]/50" : "hover:bg-white/[0.03]"
                }`}
                title={`Click to filter by ${STATUS_MAP[s.key].label}`}
              >
                <div className="metadata-label flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                  {STATUS_MAP[s.key].label}
                </div>
                <div className="editorial-num text-4xl sm:text-5xl mt-3">
                  <CountUp value={s.value} duration={900} />
                </div>
              </button>
            );
          })}
        </div>
        {/* Segmented health bar */}
        <div className="flex h-2 rounded-full overflow-hidden">
          {segments.map((s) => (
            <motion.div
              key={s.key}
              initial={{ width: 0 }}
              animate={{ width: `${(s.value / total) * 100}%` }}
              transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
              style={{ background: s.color }}
              title={`${STATUS_MAP[s.key].label} · ${s.value}`}
            />
          ))}
        </div>
        <div className="text-xs text-[color:var(--ink-dim)] mt-3 font-mono-data tabular flex items-center justify-between flex-wrap gap-2" data-testid="inv-stat-all">
          <span>{c.all} SKUs tracked · {c.high_risk || 0} high risk of stockout · {c.slow_moving || 0} slow-moving</span>
          <span>Forecast simulation active</span>
        </div>
      </section>

      {/* Critical products */}
      {critical.length > 0 && (
        <section data-testid="inv-critical">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="metadata-label">Requires attention</div>
              <h2 className="editorial-headline text-3xl sm:text-4xl mt-2">Products at risk.</h2>
            </div>
            <div className="text-sm text-[color:var(--ink-muted)] font-mono-data tabular hidden sm:block">
              {critical.length} SKUs requiring restock or attention
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {critical.slice(0, 6).map((r, i) => {
              const s = STATUS_MAP[r.status] || STATUS_MAP.healthy;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                  className="surface p-5 lift relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ background: s.dot }} />
                  <div>
                    <div className="pl-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[color:var(--ink)] text-base truncate font-medium">{r.product}</span>
                          <AbcBadge abcClass={r.abc_class} />
                        </div>
                        <div className="text-xs text-[color:var(--ink-dim)] tracking-widest uppercase mt-1">{r.category}</div>
                      </div>
                      <RiskBadge risk={r.stockout_risk} />
                    </div>

                    <div className="pl-2 mt-6 flex items-baseline justify-between">
                      <div>
                        <div className="metadata-label">In stock</div>
                        <div className="editorial-num text-3xl mt-1">{r.current_stock}</div>
                      </div>
                      <div className="text-right">
                        <div className="metadata-label">Est. Stockout</div>
                        <div className="font-mono-data text-sm text-[color:var(--negative)] mt-1 tabular">
                          {r.stockout_days <= 14 ? `in ${r.stockout_days}d (${r.stockout_date})` : "Safe"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pl-2 mt-4 pt-3 border-t border-[color:var(--hairline)] flex items-center justify-between text-xs font-mono-data">
                    <span className="text-[color:var(--ink-dim)]">
                      Lead time: {r.lead_time}d {r.is_assumed_lead_time ? "(Assumed)" : ""}
                    </span>
                    {r.recommended_order_qty > 0 && (
                      <span className="text-[color:var(--accent)] font-bold">
                        Reorder: +{r.recommended_order_qty} units
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filter + Search + Table */}
      <section>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div className="inline-flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                data-testid={`inv-filter-${f.id}`}
                onClick={() => setFilter(f.id)}
                className="pill-nav"
                data-active={filter === f.id}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--ink-dim)]" />
            <input
              data-testid="inv-search"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-10 w-64 bg-transparent border hairline-strong rounded-full text-sm text-[color:var(--ink)] placeholder:text-[color:var(--ink-dim)] focus:outline-none focus:border-[color:var(--accent)] transition-colors px-3"
            />
          </div>
        </div>

        <div className="surface-elev overflow-hidden" data-testid="inv-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b hairline">
                  <th className="px-5 py-4 metadata-label font-normal">Product</th>
                  <th className="px-5 py-4 metadata-label font-normal">Category</th>
                  <th className="px-5 py-4 metadata-label font-normal text-right">Stock</th>
                  <th className="px-5 py-4 metadata-label font-normal text-right">ROP / SS</th>
                  <th className="px-5 py-4 metadata-label font-normal">Lead Time</th>
                  <th className="px-5 py-4 metadata-label font-normal">Stockout Risk</th>
                  <th className="px-5 py-4 metadata-label font-normal text-right">Reorder (Q)</th>
                  <th className="px-5 py-4 metadata-label font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r, i) => {
                  const pct = Math.min(100, (r.current_stock / (r.reorder_level * 2 || 1)) * 100);
                  const s = STATUS_MAP[r.status] || STATUS_MAP.healthy;
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.02 * i }}
                      className="border-b hairline last:border-b-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[color:var(--ink)] font-medium">{r.product}</span>
                          <AbcBadge abcClass={r.abc_class} />
                        </div>
                        <div className="text-[10px] text-[color:var(--ink-dim)] font-mono-data tabular mt-0.5">{r.id}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-[color:var(--ink-muted)]">{r.category}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="font-editorial text-lg">{r.current_stock}</div>
                        <div className="mt-1 h-[2px] w-20 ml-auto bg-[color:var(--hairline-strong)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.dot }} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono-data text-xs text-[color:var(--ink-muted)] tabular">
                        <div>ROP: <strong className="text-[color:var(--ink)]">{r.reorder_level}</strong></div>
                        <div className="text-[10px] text-[color:var(--ink-dim)]">SS: {r.safety_stock || 0}</div>
                      </td>
                      <td className="px-5 py-4 font-mono-data text-xs text-[color:var(--ink-muted)]">
                        <div>{r.lead_time || 3} days</div>
                        <div className="text-[10px] text-[color:var(--ink-dim)]">
                          {r.is_assumed_lead_time ? "Assumed" : "Supplier"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <RiskBadge risk={r.stockout_risk} />
                          {r.stockout_days <= 14 && (
                            <div className="text-[10px] font-mono-data text-[color:var(--negative)]">
                              in {r.stockout_days}d ({r.stockout_date})
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {r.recommended_order_qty > 0 ? (
                          <span className="font-mono-data text-sm font-bold text-[color:var(--accent)]">
                            +{r.recommended_order_qty}
                          </span>
                        ) : (
                          <span className="font-mono-data text-xs text-[color:var(--ink-dim)]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4"><StatDot status={r.status} /></td>
                    </motion.tr>
                  );
                })}
                {items.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-14 text-[color:var(--ink-dim)] text-sm">No items match this filter</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
