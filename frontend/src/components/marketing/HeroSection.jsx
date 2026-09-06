import { useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, AlertTriangle, ArrowUpRight, BarChart3, ShieldCheck } from "lucide-react";

export default function HeroSection({ onInstantDemo, onExploreDashboard }) {
  const containerRef = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);
  const card4Ref = useRef(null);
  const funnelRef = useRef(null);

  const [paths, setPaths] = useState(null);

  const updatePaths = () => {
    if (!containerRef.current || !funnelRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    const fnRect = funnelRef.current.getBoundingClientRect();

    if (window.innerWidth < 640) {
      setPaths(null);
      return;
    }

    const fx = fnRect.left + fnRect.width / 2 - cRect.left;
    const fy = fnRect.top - cRect.top;

    let p1 = null, p2 = null, p3 = null, p4 = null;

    if (card1Ref.current) {
      const r = card1Ref.current.getBoundingClientRect();
      const x1 = r.left + r.width / 2 - cRect.left;
      const y1 = r.bottom - cRect.top;
      p1 = {
        d: `M ${x1} ${y1} C ${x1} ${(y1 + fy) / 2}, ${fx} ${(y1 + fy) / 2}, ${fx} ${fy}`,
        x1, y1, fx, fy
      };
    }

    if (card2Ref.current) {
      const r = card2Ref.current.getBoundingClientRect();
      const x2 = r.right - cRect.left;
      const y2 = r.top + r.height / 2 - cRect.top;
      p2 = {
        d: `M ${x2} ${y2} C ${(x2 + fx) / 2} ${y2}, ${(x2 + fx) / 2} ${fy}, ${fx} ${fy}`,
        x1: x2, y1: y2, fx, fy
      };
    }

    if (card3Ref.current) {
      const r = card3Ref.current.getBoundingClientRect();
      const x3 = r.left + r.width / 2 - cRect.left;
      const y3 = r.bottom - cRect.top;
      p3 = {
        d: `M ${x3} ${y3} C ${x3} ${(y3 + fy) / 2}, ${fx} ${(y3 + fy) / 2}, ${fx} ${fy}`,
        x1: x3, y1: y3, fx, fy
      };
    }

    if (card4Ref.current) {
      const r = card4Ref.current.getBoundingClientRect();
      const x4 = r.left - cRect.left;
      const y4 = r.top + r.height / 2 - cRect.top;
      p4 = {
        d: `M ${x4} ${y4} C ${(x4 + fx) / 2} ${y4}, ${(x4 + fx) / 2} ${fy}, ${fx} ${fy}`,
        x1: x4, y1: y4, fx, fy
      };
    }

    setPaths({ p1, p2, p3, p4, fx, fy, height: cRect.height });
  };

  useLayoutEffect(() => {
    updatePaths();
    const handleResize = () => updatePaths();
    window.addEventListener("resize", handleResize);

    const observer = new ResizeObserver(() => updatePaths());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapsuleClick = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative pt-44 sm:pt-52 md:pt-56 pb-0 overflow-hidden">
      {/* Background soft ambient halo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[400px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Eyebrow Capsule Badge */}
        <motion.button
          type="button"
          onClick={handleCapsuleClick}
          aria-label="Learn more about Cart Insight 2.0 Retail Intelligence and Stockout Prevention"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-700 mb-8 hover:border-emerald-400/60 hover:bg-emerald-50/30 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer select-none"
        >
          <div className="flex items-center -space-x-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
              AI
            </span>
            <span className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
              POS
            </span>
            <span className="w-5 h-5 rounded-full bg-lime-400 flex items-center justify-center text-[10px] font-bold text-slate-900 shadow-xs">
              7D
            </span>
          </div>
          <span className="text-slate-900 font-bold group-hover:text-emerald-800 transition-colors">Cart Insight 2.0</span>
          <span className="text-slate-300">·</span>
          <span className="group-hover:text-slate-900 transition-colors">Retail Intelligence &amp; Stockout Prevention</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all ml-0.5" />
        </motion.button>

        {/* Massive Editorial Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-headline text-4xl sm:text-6xl md:text-7xl lg:text-[5.2rem] text-slate-900 tracking-tight leading-[1.04] max-w-5xl mx-auto"
        >
          STOP FLYING BLIND ON{" "}
          <span className="text-emerald-700">RETAIL INVENTORY</span>
        </motion.h1>

        {/* Concise Supporting Editorial Copy */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Turn daily transactions into verified KPIs, 7-day SKU demand forecasts,
          margin alerts, and automated morning restock plans.
        </motion.p>

        {/* Primary High-Contrast Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <button
            onClick={onInstantDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white text-base font-bold shadow-lg shadow-emerald-700/25 transition-all"
          >
            <Sparkles className="w-4 h-4 text-lime-300" />
            <span>Instant Demo Access</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 border border-slate-200 text-base font-semibold shadow-sm transition-all"
          >
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>Explore Dashboard</span>
          </button>
        </motion.div>

        {/* Micro-Features Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono"
        >
          <span>KPIs &amp; Pareto</span>
          <span>·</span>
          <span>Prophet 7-Day AI</span>
          <span>·</span>
          <span>Restock Decision Logic</span>
          <span>·</span>
          <span className="hidden sm:inline">PDF Morning Dossier</span>
        </motion.div>

        {/* Floating Analytical Composition with Mathematically Measured SVG Anchors */}
        <div
          ref={containerRef}
          className="relative mt-16 sm:mt-20 max-w-5xl mx-auto min-h-[340px] sm:min-h-[400px]"
        >
          {/* Dynamic SVG Connectors Overlay */}
          {paths && (
            <svg
              className="hidden sm:block absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            >
              {/* Card 1 to Funnel (Dashed Bezier) */}
              {paths.p1 && (
                <g>
                  <path
                    d={paths.p1.d}
                    stroke="#059669"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    strokeOpacity="0.75"
                    fill="none"
                  />
                  <circle cx={paths.p1.x1} cy={paths.p1.y1} r="3.5" fill="#059669" />
                </g>
              )}

              {/* Card 2 to Funnel (Solid Bezier) */}
              {paths.p2 && (
                <g>
                  <path
                    d={paths.p2.d}
                    stroke="#059669"
                    strokeWidth="2"
                    strokeOpacity="0.85"
                    fill="none"
                  />
                  <circle cx={paths.p2.x1} cy={paths.p2.y1} r="3.5" fill="#059669" />
                </g>
              )}

              {/* Card 3 to Funnel (Dashed Bezier) */}
              {paths.p3 && (
                <g>
                  <path
                    d={paths.p3.d}
                    stroke="#059669"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    strokeOpacity="0.75"
                    fill="none"
                  />
                  <circle cx={paths.p3.x1} cy={paths.p3.y1} r="3.5" fill="#059669" />
                </g>
              )}

              {/* Card 4 to Funnel (Solid Bezier) */}
              {paths.p4 && (
                <g>
                  <path
                    d={paths.p4.d}
                    stroke="#059669"
                    strokeWidth="2"
                    strokeOpacity="0.85"
                    fill="none"
                  />
                  <circle cx={paths.p4.x1} cy={paths.p4.y1} r="3.5" fill="#059669" />
                </g>
              )}

              {/* Funnel Center Beacon */}
              <circle cx={paths.fx} cy={paths.fy} r="5" fill="#059669" />

              {/* Continuous vertical stem connecting downward to the timeline */}
              <line
                x1={paths.fx}
                y1={paths.fy}
                x2={paths.fx}
                y2={paths.height}
                stroke="#059669"
                strokeWidth="2"
                strokeOpacity="0.8"
              />
            </svg>
          )}

          {/* Floating Card 1: Revenue KPI (Top-Left) */}
          <motion.div
            ref={card1Ref}
            initial={{ opacity: 0, x: -30, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute top-2 left-2 sm:left-6 md:left-12 shell-card p-3.5 sm:p-4 text-left max-w-[210px] sm:max-w-[230px] z-20 shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Store Revenue
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-2.5 h-2.5" /> +12.8%
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-headline tracking-tight">
              ₹2,48,540
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              1,280 Orders · AOV ₹482
            </div>
          </motion.div>

          {/* Floating Card 2: Prophet Model Forecast (Mid-Left) */}
          <motion.div
            ref={card2Ref}
            initial={{ opacity: 0, x: -30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute top-44 left-0 sm:left-4 md:left-8 shell-card p-3.5 sm:p-4 text-left max-w-[220px] sm:max-w-[240px] z-20 shadow-md"
          >
            <div className="flex items-center gap-1.5 mb-1 text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                Prophet Model
              </span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              7-Day Forecast
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-700 font-headline mt-0.5">
              ₹2,81,000 projected
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              95% Confidence · WAPE 6.2%
            </div>
          </motion.div>

          {/* Floating Card 3: Stockout Prevention (Top-Right) */}
          <motion.div
            ref={card3Ref}
            initial={{ opacity: 0, x: 30, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute top-2 right-2 sm:right-6 md:right-12 shell-card p-3.5 sm:p-4 text-left max-w-[230px] sm:max-w-[250px] z-20 shadow-md"
          >
            <div className="flex items-center justify-between gap-1 mb-1 text-slate-400">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                Stockout Prevention
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mt-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>12 SKUs at Critical Risk</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1 truncate">
              Almond Milk &amp; Fresh Bread
            </div>
          </motion.div>

          {/* Floating Card 4: Gross Margin (Mid-Right) */}
          <motion.div
            ref={card4Ref}
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute top-44 right-0 sm:right-4 md:right-8 shell-card p-3.5 sm:p-4 text-left max-w-[200px] sm:max-w-[220px] z-20 shadow-md"
          >
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1">
              <span>Gross Margin</span>
              <span className="text-emerald-700 font-bold">27.6%</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-headline tracking-tight">
              ₹68,540
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              +9.3% vs previous month
            </div>
          </motion.div>

          {/* Central Funnel Convergence Node */}
          <div
            ref={funnelRef}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-emerald-600/40 shadow-md text-xs font-bold text-slate-900 pointer-events-auto"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>THE INTELLIGENCE FUNNEL</span>
            </motion.div>
            {/* Direct vertical stem extending downwards from badge into next section */}
            <div className="w-[2px] h-10 bg-emerald-600/70" />
          </div>

          {/* Unbroken connection line from funnel bottom to HeroSection bottom edge */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 h-10 w-[2px] bg-emerald-600/70 pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
}
