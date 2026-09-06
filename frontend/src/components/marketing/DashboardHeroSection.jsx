import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, LayoutDashboard, TrendingUp, AlertTriangle, FileText, CheckCircle2, ShieldCheck, Database } from "lucide-react";

export default function DashboardHeroSection({ onExploreDashboard }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <section id="dashboard-preview" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Central continuous spine connector from ComparisonSection into Your Dashboard */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 h-[130px] w-[2px] bg-emerald-600/60 z-0 pointer-events-none" />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-800 mb-6">
          <span>Your Dashboard</span>
        </div>

        {/* Headline */}
        <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight leading-[1.08] max-w-4xl mx-auto">
          SEE YOUR STORE <span className="text-emerald-700">CLEARLY.</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
          The actual Cart Insight operational surface. High-density retail intelligence wrapped in a calm interface.
        </p>

        {/* Large Framed Product Dashboard Display inspired by Fynza */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mt-14 sm:mt-16 rounded-[32px] sm:rounded-[40px] bg-slate-950 p-3 sm:p-5 border-4 border-slate-200 shadow-2xl relative text-left"
        >
          {/* Inner Dashboard Canvas */}
          <div className="rounded-[24px] sm:rounded-[32px] bg-[#0c101c] p-4 sm:p-8 text-white border border-slate-800/80 overflow-hidden">
            {/* Top Chrome Strip */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  app.cartinsight.io / demo-store
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE DATASET
                </span>
              </div>

              {/* Interactive Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-full bg-slate-900 border border-slate-800">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "forecast", label: "Forecast" },
                  { id: "inventory", label: "Inventory" },
                  { id: "reports", label: "Reports" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${
                      activeTab === t.id
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Body Previews */}
            <div className="py-6 sm:py-8">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Top KPI row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Total Revenue</span>
                        <div className="font-headline text-2xl sm:text-3xl text-white font-bold mt-1">₹2,48,540</div>
                        <span className="text-xs font-mono text-emerald-400 font-bold">+12.8% vs Apr</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Gross Profit</span>
                        <div className="font-headline text-2xl sm:text-3xl text-white font-bold mt-1">₹68,540</div>
                        <span className="text-xs font-mono text-emerald-400 font-bold">+9.3% Margin 27.6%</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Total Orders</span>
                        <div className="font-headline text-2xl sm:text-3xl text-white font-bold mt-1">1,280</div>
                        <span className="text-xs font-mono text-emerald-400 font-bold">AOV ₹482</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Stockout Alerts</span>
                        <div className="font-headline text-2xl sm:text-3xl text-amber-400 font-bold mt-1">2 Urgent</div>
                        <span className="text-xs font-mono text-amber-300">Action Center Ready</span>
                      </div>
                    </div>

                    {/* Chart preview */}
                    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono uppercase text-slate-400">
                          May 2025 Daily Sales Curve (INR)
                        </span>
                        <span className="text-xs font-mono text-emerald-400 font-bold">
                          Peak: ₹16,400 (May 24)
                        </span>
                      </div>
                      <div className="h-40 w-full">
                        <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                          <polyline
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            points="0,95 50,85 100,75 150,80 200,60 250,65 300,50 350,45 400,35 450,40 500,25 550,20 600,15"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "forecast" && (
                  <motion.div
                    key="forecast"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-mono text-emerald-400 font-bold">PROPHET 7-DAY WALK-FORWARD</div>
                        <div className="text-xl font-bold text-white mt-0.5">Whole Organic Milk 1L Forecast</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono">
                        95% Confidence
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500">Projected Demand</span>
                        <div className="text-lg font-bold text-white mt-0.5">385 Units</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500">Predicted Revenue</span>
                        <div className="text-lg font-bold text-emerald-400 mt-0.5">₹26,950</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500">Safety Buffer</span>
                        <div className="text-lg font-bold text-amber-400 mt-0.5">+48 Units</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "inventory" && (
                  <motion.div
                    key="inventory"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
                  >
                    <div className="text-xs font-mono text-slate-400 uppercase mb-2">Shelf Velocity Matrix</div>
                    {[
                      { sku: "Almond Milk Unsweetened", stock: "4 units", days: "1.2d", risk: "CRITICAL", color: "text-rose-400" },
                      { sku: "Artisan Sourdough Loaf", stock: "8 units", days: "2.4d", risk: "HIGH", color: "text-amber-400" },
                      { sku: "Organic Greek Yogurt", stock: "15 units", days: "4.8d", risk: "MEDIUM", color: "text-yellow-400" },
                    ].map((row) => (
                      <div key={row.sku} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-200">{row.sku}</span>
                        <span className="text-slate-400">Current: {row.stock}</span>
                        <span className="text-slate-400">Supply: {row.days}</span>
                        <span className={`font-bold ${row.color}`}>{row.risk}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "reports" && (
                  <motion.div
                    key="reports"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between flex-wrap gap-4"
                  >
                    <div>
                      <div className="text-sm font-bold text-white">Daily Morning Restock Report (PDF)</div>
                      <div className="text-xs text-slate-400 font-mono mt-1">Scheduled for 08:00 AM dispatch · ReportLab In-Memory</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono">
                        SMTP TLS ACTIVE
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Launch CTA Bar */}
            <div className="mt-4 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Full access includes live CSV intake, POS webhook streaming, and instant PDF download.</span>
              </div>
              <button
                onClick={onExploreDashboard}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all shrink-0"
              >
                <span>Launch Full Working Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
