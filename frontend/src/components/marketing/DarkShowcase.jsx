import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, BarChart3, Database, FileText, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function DarkShowcase({ onExploreDashboard }) {
  const [activeTab, setActiveTab] = useState(0);

  const modules = [
    {
      id: "overview",
      title: "Store Overview & KPI Matrix",
      desc: "Live gross profit calculation, basket size trends, customer counts, and category contribution breakdown.",
      kpis: [
        { l: "Revenue", v: "₹2,48,540", t: "+12.8%" },
        { l: "Margin", v: "27.6%", t: "+2.4%" },
        { l: "Basket", v: "₹482", t: "+4.1%" },
      ],
      tag: "CORE_ANALYTICS",
    },
    {
      id: "forecasting",
      title: "Prophet 7-Day Demand Projection",
      desc: "Time-series decomposition separates weekly seasonality from baseline trend. Accurately anticipates weekend peaks.",
      kpis: [
        { l: "Forecast Units", v: "385 SKUs", t: "95% Conf" },
        { l: "Model Accuracy", v: "93.8%", t: "WAPE 6.2%" },
        { l: "Spike Alert", v: "+18% Sat/Sun", t: "Actionable" },
      ],
      tag: "PREDICTIVE_AI",
    },
    {
      id: "inventory",
      title: "Inventory & Stockout Risk Matrix",
      desc: "Automated Days-of-Supply calculation, supplier lead time tracking, and ABC Pareto revenue tiering.",
      kpis: [
        { l: "Tracked SKUs", v: "20 Items", t: "100% Monitored" },
        { l: "Class A Drivers", v: "82.4% Profit", t: "4 SKUs" },
        { l: "Buffer Guard", v: "15% Safety", t: "Zero Stockouts" },
      ],
      tag: "SHELF_PROTECTION",
    },
    {
      id: "reports",
      title: "Scheduled Restock PDF Reports",
      desc: "In-memory binary PDF rendering delivered straight to your email every morning at 08:00 AM before opening.",
      kpis: [
        { l: "Dispatch Time", v: "08:00 AM", t: "Daily Schedule" },
        { l: "PDF Engine", v: "ReportLab", t: "In-Memory" },
        { l: "Recipients", v: "Store Manager", t: "SMTP TLS" },
      ],
      tag: "AUTOMATED_OPS",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      {/* Central continuous vertical spine running full section height */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-emerald-600/60 z-0 pointer-events-none" />

      <div className="max-w-[1240px] mx-auto rounded-[36px] bg-[#0c1222] text-white p-8 sm:p-14 lg:p-18 border border-slate-800 shadow-2xl relative z-10 overflow-hidden">
        {/* Ambient glow inside dark box */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Heading */}
        <div className="relative z-10 text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono font-bold text-emerald-400 mb-6">
            <span>DARK PRODUCT SHOWCASE</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.08]">
            BUILT FOR REAL <span className="text-emerald-400">RETAIL DECISIONS.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-normal">
            A high-density operational engine engineered to replace fragile manual spreadsheets with automated intelligence.
          </p>
        </div>

        {/* Module Selector Pills */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 mb-12">
          {modules.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setActiveTab(idx)}
              className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold transition-all ${
                activeTab === idx
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-500"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              0{idx + 1} {m.title.split("&")[0].split("·")[0]}
            </button>
          ))}
        </div>

        {/* Active Module Showcase Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 rounded-3xl bg-slate-900/90 border border-slate-800 p-8 sm:p-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                  MODULE // {modules[activeTab].tag}
                </span>
                <h3 className="font-headline text-2xl sm:text-4xl text-white font-bold leading-tight">
                  {modules[activeTab].title}
                </h3>
                <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  {modules[activeTab].desc}
                </p>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8">
                  {modules[activeTab].kpis.map((k) => (
                    <div key={k.l} className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <div className="text-[10px] sm:text-xs font-mono text-slate-500 uppercase">{k.l}</div>
                      <div className="font-headline text-lg sm:text-2xl text-white font-bold mt-1">{k.v}</div>
                      <div className="text-[10px] sm:text-xs font-mono text-emerald-400 mt-0.5">{k.t}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button
                    onClick={onExploreDashboard}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-lg transition-all"
                  >
                    <span>Launch In Full Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Graphic Terminal Visual */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800/80 shadow-2xl font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-slate-500 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span>ci_engine.py — live</span>
                  </div>

                  <div className="space-y-2 text-slate-300">
                    <div className="text-slate-500"># Initializing engine routines...</div>
                    <div className="text-emerald-400">&gt; loading dataset from cart_insight.db [OK]</div>
                    <div>&gt; computing Pareto ABC splits... done (20 SKUs)</div>
                    <div>&gt; fitting Prophet 7-day walk-forward... done</div>
                    <div className="text-amber-300">&gt; warning: 2 SKUs low stock threshold breached</div>
                    <div className="text-emerald-400">&gt; generated restock recommendations [36, 24]</div>
                    <div className="text-slate-500">&gt; schedule ready for 08:00 AM SMTP dispatch</div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Memory: 14.2 MB</span>
                    <span>Status: RUNNING</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
