import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Calendar, CheckCircle2, ArrowRight } from "lucide-react";

export default function ActionableInsightsSection() {
  const actions = [
    {
      type: "RESTOCK",
      priority: "CRITICAL PRIORITY",
      priorityColor: "bg-rose-100 text-rose-800 border-rose-200",
      title: "Restock Almond Milk Unsweetened (1L)",
      reason: "High velocity · Current shelf stock will deplete in 28 hours",
      actionDesc: "Reorder +36 units from Dairy Direct distributor before 2:00 PM cutoff to ensure arrival by tomorrow morning.",
      impact: "Prevents estimated ₹6,400 in lost revenue this weekend.",
      icon: AlertTriangle,
      iconColor: "text-rose-600 bg-rose-50",
    },
    {
      type: "MARGIN DEFENSE",
      priority: "PROFIT ALERT",
      priorityColor: "bg-amber-100 text-amber-800 border-amber-200",
      title: "Review Artisan Sourdough Shelf Price",
      reason: "Wholesale flour inflation compressed margin from 34% down to 24.2%",
      actionDesc: "Adjust retail shelf price from ₹85 to ₹95. Demand elasticity indicates zero basket drop-off.",
      impact: "Protects ₹3,800 monthly net store profit.",
      icon: TrendingDown,
      iconColor: "text-amber-600 bg-amber-50",
    },
    {
      type: "SURGE PLANNING",
      priority: "DEMAND SPIKE",
      priorityColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      title: "Prepare for Weekend Perishables Spike",
      reason: "Prophet model detects +18% localized volume surge for eggs & milk",
      actionDesc: "Schedule secondary supplier truck delivery for Friday afternoon rather than regular Monday cycle.",
      impact: "Captures 100% of peak holiday foot traffic demand.",
      icon: Calendar,
      iconColor: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Central continuous vertical spine running full section height */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-emerald-600/60 z-0 pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-800 mb-6">
            <span>Decision Engine</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight leading-[1.08] max-w-3xl mx-auto inline-block bg-editorial-shell px-6">
            TODAY'S RETAIL <span className="text-emerald-700">ACTIONS.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-normal bg-editorial-shell px-4">
            Cart Insight tells you what you need to do next, not just what already happened.
          </p>
        </div>

        {/* 3 Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((act, i) => {
            const Icon = act.icon;
            return (
              <motion.div
                key={act.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="shell-card p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${act.priorityColor}`}>
                      {act.priority}
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${act.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-headline text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    {act.title}
                  </h3>

                  <p className="text-xs font-medium text-slate-500 mt-2">
                    {act.reason}
                  </p>

                  <div className="hair-divider my-4" />

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {act.actionDesc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50/80 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{act.impact}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
