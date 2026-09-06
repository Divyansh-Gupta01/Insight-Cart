import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Database, BarChart2, AlertCircle, Send, CheckCircle2 } from "lucide-react";

export default function RetailTimeline() {
  const containerRef = useRef(null);
  const nodeRefs = useRef([]);
  const anchorRefs = useRef([]);
  const [connectors, setConnectors] = useState([]);

  const steps = [
    {
      stepNum: "DAY 0",
      side: "left",
      badge: "Zero Latency",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      impact: "Instant Capture",
      title: "Sale Ingested",
      desc: "Transactions stream from Tally, Square, Vyapar or spreadsheet CSV without manual re-entry.",
      icon: ShoppingCart,
    },
    {
      stepNum: "DAY 1",
      side: "right",
      badge: "Automated ETL",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      impact: "0 Missing Values",
      title: "Ledger Normalized",
      desc: "Deduplication, currency sanitization, and date formatting occur in-memory instantaneously.",
      icon: Database,
    },
    {
      stepNum: "DAY 2",
      side: "left",
      badge: "ABC Pareto",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
      impact: "82.4% Profit Driver",
      title: "Performance Classification",
      desc: "Top 80% revenue drivers (Class A) are isolated from slow-moving deadweight capital.",
      icon: BarChart2,
    },
    {
      stepNum: "DAY 4",
      side: "right",
      badge: "-₹18K Stockout Risk",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      impact: "12 Critical SKUs",
      title: "Shelf Risk Flagged",
      desc: "Exhaustion velocity shows 12 SKUs will hit zero inventory before supplier replenishment window.",
      icon: AlertCircle,
    },
    {
      stepNum: "DAY 7",
      side: "left",
      badge: "+₹32K Retained Profit",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      impact: "Action Complete",
      title: "Restock Report Dispatched",
      desc: "Automated morning PDF dossier sent to store email with exact supplier reorder units.",
      icon: Send,
    },
  ];

  // Dynamic Anchor Measurement System (Solves Section 7, 8, 9, 10)
  const updateConnectors = () => {
    if (!containerRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      setConnectors([]);
      return;
    }

    const lines = steps.map((step, idx) => {
      const nodeEl = nodeRefs.current[idx];
      const anchorEl = anchorRefs.current[idx];
      if (!nodeEl || !anchorEl) return null;

      const nRect = nodeEl.getBoundingClientRect();
      const aRect = anchorEl.getBoundingClientRect();

      const isLeft = step.side === "left";
      // Exact center Y of the milestone node
      const y = nRect.top + nRect.height / 2 - cRect.top;

      if (isLeft) {
        // Starts at right edge of the card/badge, ends at left edge of milestone node
        const x1 = aRect.right - cRect.left;
        const x2 = nRect.left - cRect.left;
        return { x1, y1: y, x2, y2: y, side: "left", key: step.stepNum };
      } else {
        // Starts at right edge of milestone node, ends at left edge of the card/badge
        const x1 = nRect.right - cRect.left;
        const x2 = aRect.left - cRect.left;
        return { x1, y1: y, x2, y2: y, side: "right", key: step.stepNum };
      }
    });

    setConnectors(lines.filter(Boolean));
  };

  useLayoutEffect(() => {
    updateConnectors();
    const handleResize = () => updateConnectors();
    window.addEventListener("resize", handleResize);

    const observer = new ResizeObserver(() => updateConnectors());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="timeline" className="relative pt-4 pb-20 sm:pb-28 overflow-hidden">
      {/* Central continuous spine background guide extending from top */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-emerald-600/60 z-0 pointer-events-none" />

      {/* Central continuous spine header */}
      <div className="text-center relative z-10 mb-14 sm:mb-20">
        <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight max-w-4xl mx-auto px-4 leading-[1.08]">
          YOU HAVE THE NUMBERS. BUT DO YOU{" "}
          <span className="text-emerald-700">SEE THE SIGNAL?</span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto px-4 font-normal">
          Static spreadsheets explain what happened yesterday. Cart Insight models what happens tomorrow.
        </p>
      </div>

      {/* Central Timeline Spine Container */}
      <div
        ref={containerRef}
        className="max-w-5xl mx-auto px-4 sm:px-6 relative"
      >
        {/* Continuous Central Vertical Spine (One single unbroken construction) */}
        <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-emerald-600/60 z-0" />

        {/* Dynamic SVG Connectors Overlay (Mathematically anchored with 0px gaps) */}
        <svg
          className="hidden sm:block absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
        >
          {connectors.map((c) => (
            <g key={c.key}>
              {/* Horizontal Dashed Line */}
              <line
                x1={c.x1}
                y1={c.y1}
                x2={c.x2}
                y2={c.y2}
                stroke="#059669"
                strokeWidth="2"
                strokeDasharray="5 5"
                strokeOpacity="0.8"
              />
              {/* Anchor Dots at Both Physical Terminus Points */}
              <circle cx={c.x1} cy={c.y1} r="3.5" fill="#059669" />
              <circle cx={c.x2} cy={c.y2} r="3.5" fill="#059669" />
            </g>
          ))}
        </svg>

        {/* Milestone Rows */}
        <div className="space-y-12 sm:space-y-20 relative z-20">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isLeft = s.side === "left";

            return (
              <div
                key={s.stepNum}
                className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0"
              >
                {/* Left Content Slot */}
                <div
                  className={`w-full sm:w-[calc(50%-3.5rem)] ${
                    isLeft ? "block" : "hidden sm:block sm:invisible"
                  }`}
                >
                  {isLeft && (
                    <motion.div
                      ref={(el) => (anchorRefs.current[idx] = el)}
                      initial={{ opacity: 0, x: -24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.5 }}
                      className="shell-card p-5 sm:p-6 text-left relative shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold border ${s.badgeColor}`}
                        >
                          {s.badge}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2 font-headline tracking-tight">
                        {s.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
                        {s.desc}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Central Milestone Card (Locked absolutely to central vertical spine) */}
                <div
                  ref={(el) => (nodeRefs.current[idx] = el)}
                  className="relative sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-30 shrink-0 mx-auto sm:mx-0"
                >
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-emerald-600 shadow-md flex flex-col items-center justify-center text-center p-2"
                  >
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                      PHASE
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 font-mono tracking-tight">
                      {s.stepNum}
                    </span>
                  </motion.div>
                </div>

                {/* Right Content Slot */}
                <div
                  className={`w-full sm:w-[calc(50%-3.5rem)] sm:ml-auto ${
                    !isLeft ? "block" : "hidden sm:block sm:invisible"
                  }`}
                >
                  {!isLeft && (
                    <motion.div
                      ref={(el) => (anchorRefs.current[idx] = el)}
                      initial={{ opacity: 0, x: 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.5 }}
                      className="shell-card p-5 sm:p-6 text-left relative shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold border ${s.badgeColor}`}
                        >
                          {s.badge}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2 font-headline tracking-tight">
                        {s.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
                        {s.desc}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Spine Conclusion Box (Intersecting the line directly at bottom) */}
        <div className="mt-16 sm:mt-20 relative z-20 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white border-2 border-emerald-600/30 shadow-md text-xs sm:text-sm font-semibold text-slate-800"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Result: <strong className="text-slate-950 font-bold">Zero Stockouts</strong> ·{" "}
              <strong className="text-slate-950 font-bold">Safe Margins</strong> · Fully Automated Retail Intelligence.
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
