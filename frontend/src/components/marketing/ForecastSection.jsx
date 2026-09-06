import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, Sparkles, Calendar, Layers } from "lucide-react";

export default function ForecastSection() {
  const [activeSku, setActiveSku] = useState("all");

  const skuDatasets = {
    all: {
      name: "Store-Wide Aggregate Revenue",
      projected: "₹2,81,000",
      trend: "+14.2% Expected Growth",
      confidence: "95% Confidence Band",
      points: [
        { d: "May 18", actual: 8200, fc: null },
        { d: "May 19", actual: 8900, fc: null },
        { d: "May 20", actual: 9400, fc: null },
        { d: "May 21", actual: 9100, fc: null },
        { d: "May 22", actual: 10200, fc: null },
        { d: "May 23", actual: 11500, fc: null },
        { d: "May 24", actual: 12400, fc: 12400 },
        { d: "May 25", actual: null, fc: 13100 },
        { d: "May 26", actual: null, fc: 12800 },
        { d: "May 27", actual: null, fc: 13400 },
        { d: "May 28", actual: null, fc: 13900 },
        { d: "May 29", actual: null, fc: 14600 },
        { d: "May 30", actual: null, fc: 15800 },
        { d: "May 31", actual: null, fc: 16400 },
      ],
    },
    milk: {
      name: "Almond Milk Unsweetened (1L)",
      projected: "385 Units",
      trend: "+22.4% Surge Alert",
      confidence: "98% Model Fit",
      points: [
        { d: "May 18", actual: 24, fc: null },
        { d: "May 19", actual: 28, fc: null },
        { d: "May 20", actual: 32, fc: null },
        { d: "May 21", actual: 30, fc: null },
        { d: "May 22", actual: 38, fc: null },
        { d: "May 23", actual: 44, fc: null },
        { d: "May 24", actual: 48, fc: 48 },
        { d: "May 25", actual: null, fc: 52 },
        { d: "May 26", actual: null, fc: 50 },
        { d: "May 27", actual: null, fc: 56 },
        { d: "May 28", actual: null, fc: 58 },
        { d: "May 29", actual: null, fc: 64 },
        { d: "May 30", actual: null, fc: 72 },
        { d: "May 31", actual: null, fc: 75 },
      ],
    },
    bread: {
      name: "Artisan Sourdough Loaf",
      projected: "290 Units",
      trend: "+11.6% Weekend Spike",
      confidence: "94% Model Fit",
      points: [
        { d: "May 18", actual: 18, fc: null },
        { d: "May 19", actual: 20, fc: null },
        { d: "May 20", actual: 22, fc: null },
        { d: "May 21", actual: 25, fc: null },
        { d: "May 22", actual: 30, fc: null },
        { d: "May 23", actual: 36, fc: null },
        { d: "May 24", actual: 40, fc: 40 },
        { d: "May 25", actual: null, fc: 42 },
        { d: "May 26", actual: null, fc: 38 },
        { d: "May 27", actual: null, fc: 40 },
        { d: "May 28", actual: null, fc: 45 },
        { d: "May 29", actual: null, fc: 52 },
        { d: "May 30", actual: null, fc: 58 },
        { d: "May 31", actual: null, fc: 60 },
      ],
    },
  };

  const current = skuDatasets[activeSku];

  return (
    <section id="forecast" className="relative py-20 sm:py-28 overflow-hidden">
      {/* Central continuous vertical spine running full section height */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-emerald-600/60 z-0 pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-800 mb-6">
            <span>Demand Forecasting</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight leading-[1.08] max-w-3xl mx-auto inline-block bg-editorial-shell px-6">
            SEE WHAT <span className="text-emerald-700">COMES NEXT.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-normal bg-editorial-shell px-4">
            Meta Prophet time-series models isolate recurring weekly spikes so you order exactly what will sell.
          </p>
        </div>

        {/* Forecast Card Frame */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="shell-card p-6 sm:p-10 md:p-12 relative overflow-hidden"
        >
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                <span>7-DAY WALK-FORWARD PROJECTION</span>
                <span>·</span>
                <span className="text-emerald-700 font-bold">{current.confidence}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-headline font-bold text-slate-900 mt-1">
                {current.name}
              </h3>
            </div>

            {/* SKU Switcher Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full self-start md:self-auto">
              {[
                { id: "all", label: "Store Total" },
                { id: "milk", label: "Almond Milk" },
                { id: "bread", label: "Sourdough" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSku(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeSku === tab.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Projected Horizon</div>
              <div className="font-headline text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{current.projected}</div>
              <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">{current.trend}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Forecast Engine</div>
              <div className="font-headline text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Prophet v1.1</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Additive Seasonality</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Validation WAPE</div>
              <div className="font-headline text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">6.2%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Industry Target &lt; 10%</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Restock Buffer</div>
              <div className="font-headline text-2xl sm:text-3xl font-bold text-slate-900 mt-1">+15% Safety</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Lead Time: 2 Days</div>
            </div>
          </div>

          {/* Large Interactive Visual Curve */}
          <div className="mt-4 p-6 rounded-3xl bg-slate-950 text-white border border-slate-900 relative">
            <div className="flex items-center justify-between text-xs font-mono mb-4 text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-slate-300 inline-block" /> Historical Actual
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-3 h-0.5 bg-emerald-400 border-dashed inline-block" /> Prophet Prediction
                </span>
              </div>
              <span className="hidden sm:inline">Confidence Interval: 95%</span>
            </div>

            {/* SVG Visual Display */}
            <div className="h-56 sm:h-64 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="forecastGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Soft Area fill under forecast */}
                <polygon
                  points="350,110 400,90 450,96 500,80 550,70 600,50 650,30 650,200 350,200"
                  fill="url(#forecastGlow)"
                />

                {/* Vertical Cutoff Separator */}
                <line x1="350" y1="0" x2="350" y2="200" stroke="#334155" strokeDasharray="4 4" strokeWidth="1.5" />
                
                {/* Historical Solid Curve */}
                <path
                  d="M 50 160 Q 100 150, 150 140 T 250 130 T 350 110"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="3"
                />

                {/* Forecast Dashed Curve */}
                <path
                  d="M 350 110 Q 450 90, 550 70 T 650 30"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                />

                {/* Key Anchor Nodes */}
                <circle cx="350" cy="110" r="5" fill="#10b981" />
                <circle cx="650" cy="30" r="5" fill="#10b981" />
              </svg>

              {/* Callout Marker */}
              <div className="absolute top-4 right-6 bg-slate-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-mono shadow-xl hidden sm:block">
                <div className="text-emerald-400 font-bold">+18% Peak Weekend Surge</div>
                <div className="text-slate-400 text-[10px]">Restock by Thursday</div>
              </div>
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2 border-t border-slate-900 pt-3">
              <span>DAY -7 (PAST ACTUALS)</span>
              <span className="text-slate-300 font-bold">TODAY (CUTOFF)</span>
              <span className="text-emerald-400 font-bold">DAY +7 (AI HORIZON)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
