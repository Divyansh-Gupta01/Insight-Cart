import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { fmtINR, fmtCompact } from "@/lib/format";
import { motion } from "framer-motion";

export default function Trends({ insights }) {
  if (!insights) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-[color:var(--ink-muted)] text-sm tracking-widest uppercase">Reading signals…</div>
    </div>
  );
  const { day_of_week, monthly, heatmap } = insights;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const grid = days.map((d) => ({
    day: d,
    cells: new Array(24).fill(0).map((_, h) => heatmap.find((x) => x.day === d && x.hour === h)?.value || 0),
  }));
  const maxVal = Math.max(1, ...heatmap.map((h) => h.value));

  return (
    <div className="space-y-16 pt-12 sm:pt-16">
      {/* Hero */}
      <section>
        <div className="metadata-label">Trends</div>
        <h1 className="editorial-headline text-5xl sm:text-6xl lg:text-7xl mt-6">
          What the days<br />
          <span className="italic text-[color:var(--accent)]">are telling you.</span>
        </h1>
      </section>

      {/* DoW + Monthly */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface-elev p-8" data-testid="chart-day-of-week">
          <div className="metadata-label">Weekly rhythm</div>
          <h3 className="editorial-headline text-2xl sm:text-3xl mt-2">Sales, by day of week.</h3>
          <div className="mt-8">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={day_of_week} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: "#8a8a83", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5a5a56", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} axisLine={false} tickLine={false} width={54} />
                <Tooltip formatter={(v) => [fmtINR(v), "Revenue"]} cursor={{ fill: "rgba(255,255,255,0.03)" }} contentStyle={{ background: "rgba(20,20,24,0.94)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {day_of_week.map((d, i) => (
                    <Cell key={i} fill={i >= 5 ? "#d4ff3a" : "#efece5"} fillOpacity={i >= 5 ? 1 : 0.75} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-elev p-8" data-testid="chart-monthly">
          <div className="metadata-label">Six months</div>
          <h3 className="editorial-headline text-2xl sm:text-3xl mt-2">Month over month.</h3>
          <div className="mt-8">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: "#8a8a83", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5a5a56", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} axisLine={false} tickLine={false} width={54} />
                <Tooltip formatter={(v) => [fmtINR(v), "Revenue"]} cursor={{ fill: "rgba(255,255,255,0.03)" }} contentStyle={{ background: "rgba(20,20,24,0.94)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {monthly.map((_, i) => (
                    <Cell key={i} fill={i === monthly.length - 1 ? "#d4ff3a" : "#efece5"} fillOpacity={i === monthly.length - 1 ? 1 : 0.55} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Heatmap */}
      <section className="surface-elev p-8" data-testid="chart-heatmap">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="metadata-label">Density map</div>
            <h3 className="editorial-headline text-2xl sm:text-3xl mt-2">When customers arrive.</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-[color:var(--ink-muted)]">
            <span>Quiet</span>
            <div className="flex gap-0.5">
              {[0.1, 0.25, 0.45, 0.7, 1].map((o, i) => (
                <div key={i} className="w-5 h-3 rounded-sm" style={{ background: `rgba(212, 255, 58, ${o})` }} />
              ))}
            </div>
            <span>Peak</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex items-center gap-1 ml-12 mb-1.5">
              {[...Array(24)].map((_, h) => (
                <div key={h} className="w-6 text-[10px] text-[color:var(--ink-dim)] font-mono-data text-center tabular">
                  {h % 3 === 0 ? String(h).padStart(2, "0") : ""}
                </div>
              ))}
            </div>
            {grid.map((row) => (
              <div key={row.day} className="flex items-center gap-1 mb-1">
                <div className="w-12 text-xs text-[color:var(--ink-muted)] font-medium">{row.day}</div>
                {row.cells.map((v, h) => {
                  const opacity = Math.max(0.05, v / maxVal);
                  return (
                    <motion.div
                      key={h}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (row.day.charCodeAt(0) * 24 + h) * 0.0008 }}
                      className="w-6 h-6 rounded-sm hover:ring-1 hover:ring-[color:var(--accent)] transition-shadow cursor-pointer"
                      style={{ background: `rgba(212, 255, 58, ${opacity})`, border: "1px solid rgba(255,255,255,0.03)" }}
                      title={`${row.day} ${h}:00 · ${v}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
