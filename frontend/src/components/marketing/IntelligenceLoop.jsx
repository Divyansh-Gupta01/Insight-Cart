import { motion } from "framer-motion";
import { Database, Sparkles, TrendingUp, ShoppingBag } from "lucide-react";

export default function IntelligenceLoop() {
  return (
    <section id="engine" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Central continuous spine background guide */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-emerald-600/60 z-0 pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-800 mb-6">
          <span>The Intelligence Flywheel</span>
        </div>

        {/* Section Headline */}
        <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight leading-[1.08] max-w-4xl mx-auto inline-block bg-editorial-shell px-6">
          POWERING A SELF-REINFORCING{" "}
          <span className="text-emerald-700">RETAIL ENGINE.</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal bg-editorial-shell px-4">
          Every purchase fine-tunes your inventory model, prevents stockouts, and maximizes cash turnover.
        </p>

        {/* Desktop Flywheel Construction (Exact Fynza Geometry & Zero Overlap) */}
        <div className="hidden md:flex relative mt-16 sm:mt-20 w-full max-w-4xl mx-auto h-[620px] lg:h-[660px] items-center justify-center">
          <div className="relative w-[600px] h-[600px] scale-[0.88] lg:scale-100 origin-center transition-transform">
            {/* Concentric Halftone Field & Rings in the background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[450px] h-[450px] rounded-full border border-slate-200/80 bg-gradient-to-b from-slate-100/40 to-transparent flex items-center justify-center">
                <div className="w-[330px] h-[330px] rounded-full border border-slate-200/90 bg-white/50 flex items-center justify-center">
                  <div className="w-[210px] h-[210px] rounded-full border border-emerald-600/20 bg-emerald-50/30" />
                </div>
              </div>
            </div>

            {/* SVG Orbit Track with Exact Directional Chevrons & Connecting Stems */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10"
              viewBox="0 0 600 600"
            >
              {/* Circular Orbit Path (radius 155, center 300, 300) */}
              <circle
                cx="300"
                cy="300"
                r="155"
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeOpacity="0.8"
              />

              {/* Directional Chevron Markers along orbit (clockwise) */}
              {/* Top-Right: 45 deg at (410, 190) */}
              <g transform="translate(410, 190) rotate(45)">
                <polygon points="-4,-6 4,0 -4,6 -1,0" fill="#059669" />
              </g>
              {/* Bottom-Right: 135 deg at (410, 410) */}
              <g transform="translate(410, 410) rotate(135)">
                <polygon points="-4,-6 4,0 -4,6 -1,0" fill="#059669" />
              </g>
              {/* Bottom-Left: 225 deg at (190, 410) */}
              <g transform="translate(190, 410) rotate(225)">
                <polygon points="-4,-6 4,0 -4,6 -1,0" fill="#059669" />
              </g>
              {/* Top-Left: 315 deg at (190, 190) */}
              <g transform="translate(190, 190) rotate(315)">
                <polygon points="-4,-6 4,0 -4,6 -1,0" fill="#059669" />
              </g>

              {/* Stems connecting Orbit Nodes directly into Cards with Zero Overlap */}
              {/* Top stem: from node top edge (300, 125) up to card bottom (300, 95) */}
              <line x1="300" y1="125" x2="300" y2="95" stroke="#059669" strokeWidth="2" />
              {/* Right stem: from node right edge (475, 300) right to card left (505, 300) */}
              <line x1="475" y1="300" x2="505" y2="300" stroke="#059669" strokeWidth="2" />
              {/* Bottom stem: from node bottom edge (300, 475) down to card top (300, 505) */}
              <line x1="300" y1="475" x2="300" y2="505" stroke="#059669" strokeWidth="2" />
              {/* Left stem: from node left edge (125, 300) left to card right (95, 300) */}
              <line x1="125" y1="300" x2="95" y2="300" stroke="#059669" strokeWidth="2" />
            </svg>

            {/* 4 Circular Orbit Nodes Sitting Cleanly on the Orbit Line */}
            {/* Top Node (300, 145) */}
            <div className="absolute left-[300px] top-[145px] -translate-x-1/2 -translate-y-1/2 z-30">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <Database className="w-4 h-4" />
              </div>
            </div>

            {/* Right Node (455, 300) */}
            <div className="absolute left-[455px] top-[300px] -translate-x-1/2 -translate-y-1/2 z-30">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Bottom Node (300, 455) */}
            <div className="absolute left-[300px] top-[455px] -translate-x-1/2 -translate-y-1/2 z-30">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            {/* Left Node (145, 300) */}
            <div className="absolute left-[145px] top-[300px] -translate-x-1/2 -translate-y-1/2 z-30">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>

            {/* Center Brand Logo Hub */}
            <div className="absolute left-[300px] top-[300px] -translate-x-1/2 -translate-y-1/2 z-20">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 lg:w-36 lg:h-36 rounded-full bg-white shadow-xl border-2 border-emerald-600 flex flex-col items-center justify-center p-3"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center mb-1 shadow-xs">
                  <div className="grid grid-cols-2 gap-1 p-1">
                    <span className="w-2 h-2 rounded-xs bg-lime-400" />
                    <span className="w-2 h-2 rounded-xs bg-white" />
                    <span className="w-2 h-2 rounded-xs bg-white" />
                    <span className="w-2 h-2 rounded-xs bg-lime-400" />
                  </div>
                </div>
                <span className="font-headline font-black text-xs lg:text-sm text-slate-900 tracking-tight">
                  CART INSIGHT
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-700 font-bold">
                  ENGINE
                </span>
              </motion.div>
            </div>

            {/* 4 Narrative Cards Positioned Beyond the Nodes (Mathematically Zero Overlap) */}
            {/* Top Card: bottom edge docked at y=95 */}
            <div className="absolute left-[300px] top-[95px] -translate-x-1/2 -translate-y-full z-20">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="shell-card p-3 sm:p-4 text-center w-[230px] lg:w-[250px] shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl border border-slate-200"
              >
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 mb-0.5">
                  STEP 01 // INGESTION
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 font-headline uppercase tracking-tight">
                  Raw Sales Data
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  POS &amp; CSV streams ingested seamlessly without manual re-entry.
                </div>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-700 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  99.98% Parse Reliability
                </div>
              </motion.div>
            </div>

            {/* Right Card: left edge docked at x=505 */}
            <div className="absolute left-[505px] top-[300px] -translate-y-1/2 z-20">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="shell-card p-3 sm:p-4 text-center w-[200px] lg:w-[220px] shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl border border-slate-200"
              >
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 mb-0.5">
                  STEP 02 // SYNTHESIS
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 font-headline uppercase tracking-tight">
                  Signals &amp; KPIs
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Pareto ABC classification &amp; margin compression identified.
                </div>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-700 border border-emerald-100">
                  Pareto 80/20 Profit Drivers
                </div>
              </motion.div>
            </div>

            {/* Bottom Card: top edge docked at y=505 */}
            <div className="absolute left-[300px] top-[505px] -translate-x-1/2 z-20">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="shell-card p-3 sm:p-4 text-center w-[230px] lg:w-[250px] shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl border border-slate-200"
              >
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 mb-0.5">
                  STEP 03 // FORECAST
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 font-headline uppercase tracking-tight">
                  7-Day Demand Forecast
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Prophet models isolate seasonality, velocity, and holiday trends.
                </div>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-700 border border-emerald-100">
                  94.2% Horizon Accuracy
                </div>
              </motion.div>
            </div>

            {/* Left Card: right edge docked at x=95 */}
            <div className="absolute left-[95px] top-[300px] -translate-x-full -translate-y-1/2 z-20">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="shell-card p-3 sm:p-4 text-center w-[200px] lg:w-[220px] shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl border border-slate-200"
              >
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 mb-0.5">
                  STEP 04 // ACTION
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 font-headline uppercase tracking-tight">
                  Automated Restock
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Morning PDF dossier &amp; purchase alerts dispatched to vendors.
                </div>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-700 border border-emerald-100">
                  Zero Stockout Protection
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Viewport Layout (< md) */}
        <div className="md:hidden mt-12 relative flex flex-col gap-5 items-center">
          {/* Central Vertical Connector Spine */}
          <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-emerald-600/30" />

          {/* Step 1 */}
          <div className="w-full flex items-start gap-3.5 relative z-10 pl-1">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md border-2 border-white mt-1">
              <Database className="w-4 h-4" />
            </div>
            <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700">
                STEP 01 // INGESTION
              </div>
              <div className="text-sm font-bold text-slate-900 font-headline uppercase">
                Raw Sales Data
              </div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                POS &amp; CSV streams ingested seamlessly without manual re-entry.
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                99.98% Parse Reliability
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="w-full flex items-start gap-3.5 relative z-10 pl-1">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md border-2 border-white mt-1">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700">
                STEP 02 // SYNTHESIS
              </div>
              <div className="text-sm font-bold text-slate-900 font-headline uppercase">
                Signals &amp; KPIs
              </div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pareto ABC classification &amp; margin compression identified in real-time.
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                Pareto 80/20 Profit Drivers
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="w-full flex items-start gap-3.5 relative z-10 pl-1">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md border-2 border-white mt-1">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700">
                STEP 03 // FORECAST
              </div>
              <div className="text-sm font-bold text-slate-900 font-headline uppercase">
                7-Day Demand Forecast
              </div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                Prophet models isolate seasonality, velocity, and holiday trend vectors.
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                94.2% Horizon Accuracy
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="w-full flex items-start gap-3.5 relative z-10 pl-1">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md border-2 border-white mt-1">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700">
                STEP 04 // ACTION
              </div>
              <div className="text-sm font-bold text-slate-900 font-headline uppercase">
                Automated Restock
              </div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                Morning PDF dossier &amp; purchase alerts dispatched to vendors.
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                Zero Stockout Protection
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
