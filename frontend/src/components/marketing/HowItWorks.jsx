import { motion } from "framer-motion";
import { UploadCloud, CheckCircle2, TrendingUp, AlertOctagon, Mail, FileText, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Connect POS and drop transaction sheets.",
      desc: "Link real-time POS webhooks from Tally, Square, Shopify, or Vyapar, or drop raw CSV / Excel files. The intake engine automatically normalizes columns, validates schemas, and drops duplicate invoices.",
      visualType: "pos_hub",
    },
    {
      num: "02",
      title: "Decode performance, velocity, and margins.",
      desc: "Cart Insight computes real-time gross profit, average order value, category Pareto splits, and inventory turns. You instantly see which 20% of your SKUs generate 80% of your revenue.",
      visualType: "kpi_cards",
    },
    {
      num: "03",
      title: "7-Day demand forecasting with Prophet.",
      desc: "Time-series decomposition separates day-of-week seasonality from baseline trends. Forecast demand for aggregate store revenue or individual SKUs with 95% confidence intervals.",
      visualType: "forecast_chart",
    },
    {
      num: "04",
      title: "Automate stockout prevention and restock dispatches.",
      desc: "The decision engine computes days-of-supply, safety buffers, and supplier lead times. Download restock PDFs or schedule automated 8:00 AM email digests straight to your phone.",
      visualType: "report_card",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden scroll-mt-16">
      {/* Central continuous vertical spine running full section height */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-emerald-600/60 z-0 pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-800 mb-6">
            <span>How It Works</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight leading-[1.08] max-w-4xl mx-auto inline-block bg-editorial-shell px-6">
            FROM STORE DATA TO{" "}
            <span className="text-emerald-700">SMARTER DECISIONS.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal bg-editorial-shell px-4">
            Four disciplined steps from chaotic retail spreadsheets to automated stockout prevention.
          </p>
        </div>

        {/* Large Numbered Story Cards (Inspired by Fynza) */}
        <div className="space-y-8 sm:space-y-12">
          {/* Card 01: Connect Data */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="shell-card p-6 sm:p-10 md:p-12 relative z-10 bg-white"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-headline font-bold text-xl flex items-center justify-center mb-6 shadow-sm shadow-emerald-700/30">
                  01
                </div>
                <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl text-slate-900 tracking-tight leading-tight">
                  Connect POS and drop transaction sheets.
                </h3>
                <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  Link live POS streams or upload CSV / Excel files. The engine sanitizes columns, resolves header aliases, and strips duplicate invoices in memory within milliseconds.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["CSV / Excel", "Tally ERP", "Shopify POS", "Square", "Vyapar"].map((src) => (
                    <span key={src} className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-medium text-slate-700">
                      {src}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual 01: Ingestion Architecture Mockup */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl bg-slate-900 p-6 sm:p-8 text-white relative overflow-hidden border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>LIVE_INGESTION_PIPELINE</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded">
                      IDEMPOTENT
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Input Sanitization</div>
                      <div className="text-sm font-bold text-slate-100 mt-1">UTF-8 &amp; Delimiters</div>
                      <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Auto-Normalized
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Schema Verification</div>
                      <div className="text-sm font-bold text-slate-100 mt-1">Date · SKU · Qty · Price</div>
                      <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 0 Missing Values
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-400 font-bold">POST</span> /api/upload
                      <span className="text-slate-500 ml-2">5,420 rows</span>
                    </div>
                    <span className="text-slate-400">0.14s</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 02: Decode Performance */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="shell-card p-6 sm:p-10 md:p-12 relative z-10 bg-white"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Visual Left on Card 02 */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                      Executive Metrics Matrix
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      May 2025
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[11px] font-mono text-slate-500">Gross Margin</div>
                      <div className="font-headline text-2xl text-slate-900 mt-1 font-bold">27.6%</div>
                      <div className="text-[11px] text-emerald-700 font-bold mt-1">+2.4% vs Apr</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[11px] font-mono text-slate-500">Avg Basket Value</div>
                      <div className="font-headline text-2xl text-slate-900 mt-1 font-bold">₹482</div>
                      <div className="text-[11px] text-emerald-700 font-bold mt-1">1,280 Orders</div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-900">
                      Pareto Class A: 4 SKUs deliver 82.4% profit
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-800">82.4%</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-headline font-bold text-xl flex items-center justify-center mb-6 shadow-sm shadow-emerald-700/30">
                  02
                </div>
                <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl text-slate-900 tracking-tight leading-tight">
                  Decode performance, velocity, and margins.
                </h3>
                <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  Our Pareto classification algorithm continuously identifies which SKUs are genuine growth engines and which ones tie up working capital on dusty shelves.
                </p>
                <div className="mt-6 space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>Real-time Gross Margin &amp; Cost-of-Goods tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>ABC Pareto prioritization (Class A, Class B, Class C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>Automatic customer basket size and velocity indexing</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 03: Forecast What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="shell-card p-6 sm:p-10 md:p-12 relative z-10 bg-white"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-headline font-bold text-xl flex items-center justify-center mb-6 shadow-sm shadow-emerald-700/30">
                  03
                </div>
                <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl text-slate-900 tracking-tight leading-tight">
                  7-Day demand forecasting with Prophet.
                </h3>
                <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  Stop placing wholesale orders by gut feel. Our machine learning engine models holiday surges, weekend spikes, and day-of-week trends to forecast exact unit demand for the coming 7 days.
                </p>
                <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-emerald-950">MODEL_VALIDATION</span>
                    <span className="text-emerald-700">WAPE 6.2% · sMAPE 7.8%</span>
                  </div>
                  <div className="mt-2 text-xs text-emerald-800 font-medium leading-relaxed">
                    Walk-forward validation prevents over-ordering and eliminates speculative inventory lockups.
                  </div>
                </div>
              </div>

              {/* Visual 03: Mini Forecast Curve */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl bg-slate-950 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs font-mono text-slate-400">SKU_PREDICTION_CURVE</div>
                      <div className="text-base font-bold text-slate-100 mt-0.5">Whole Organic Milk (1L)</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                      +14.5% Surge
                    </span>
                  </div>

                  {/* SVG Chart Preview */}
                  <div className="h-32 w-full mt-4">
                    <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Area */}
                      <polygon
                        points="0,90 60,80 120,70 180,65 240,50 240,120 0,120"
                        fill="url(#curveGrad)"
                      />
                      {/* Historical Solid Line */}
                      <polyline
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="2.5"
                        points="0,90 60,80 120,70 180,65 240,50"
                      />
                      {/* Forecast Dashed Line */}
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                        points="240,50 300,35 350,42 400,20"
                      />
                      <circle cx="240" cy="50" r="4" fill="#10b981" />
                      <line x1="240" y1="0" x2="240" y2="120" stroke="#475569" strokeDasharray="2 2" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
                    <span>HISTORICAL (MAY 1-24)</span>
                    <span className="text-emerald-400 font-bold">7-DAY PROPHET PROJECTION</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 04: Automate Prevention */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="shell-card p-6 sm:p-10 md:p-12 relative z-10 bg-white"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Visual Left on Card 04 */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-mono font-bold text-slate-900">DAILY_RESTOCK_DISPATCH</span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      08:00 AM IST
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-rose-950">Almond Milk 1L</div>
                        <div className="text-[10px] text-rose-700 font-mono">Stock: 4 units · Lead Time: 2d</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-rose-800 bg-rose-200/60 px-2 py-1 rounded">
                        Reorder +36
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-amber-950">Artisan Sourdough</div>
                        <div className="text-[10px] text-amber-700 font-mono">Stock: 8 units · Lead Time: 1d</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-800 bg-amber-200/60 px-2 py-1 rounded">
                        Reorder +24
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>PDF Binary Attached</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-headline font-bold text-xl flex items-center justify-center mb-6 shadow-sm shadow-emerald-700/30">
                  04
                </div>
                <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl text-slate-900 tracking-tight leading-tight">
                  Automate stockout prevention and restock dispatches.
                </h3>
                <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  Every morning at 08:00 AM, Cart Insight generates a complete PDF restock dossier and emails it to store operations. No manual counting, no missed vendor deadlines.
                </p>
                <div className="mt-6">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>ReportLab In-Memory PDF Generation · SMTP TLS</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
