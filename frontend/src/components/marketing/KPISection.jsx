import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, ShoppingBag, Percent, RefreshCw } from "lucide-react";

export default function KPISection() {
  const kpiData = [
    {
      id: "revenue",
      label: "Total Store Revenue",
      value: "₹2,48,540",
      trend: "+12.8%",
      positive: true,
      context: "Aggregated across all sales channels",
      sparkline: [28, 35, 42, 38, 55, 62, 70, 68, 85, 92],
    },
    {
      id: "orders",
      label: "Completed Orders",
      value: "1,280",
      trend: "+8.4%",
      positive: true,
      context: "Average 41.2 orders / trading day",
      sparkline: [30, 32, 29, 38, 45, 42, 50, 48, 56, 62],
    },
    {
      id: "aov",
      label: "Avg Basket Value (AOV)",
      value: "₹482",
      trend: "+4.1%",
      positive: true,
      context: "Driven by cross-category bundles",
      sparkline: [420, 430, 415, 450, 460, 455, 470, 465, 480, 482],
    },
    {
      id: "profit",
      label: "Gross Profit",
      value: "₹68,540",
      trend: "+9.3%",
      positive: true,
      context: "Net after wholesale cost-of-goods",
      sparkline: [12, 14, 16, 15, 19, 21, 22, 24, 26, 28],
    },
    {
      id: "margin",
      label: "Gross Margin",
      value: "27.6%",
      trend: "+2.4%",
      positive: true,
      context: "Expanded via dynamic supplier terms",
      sparkline: [24, 24.5, 25, 25.2, 26, 26.5, 27, 27.2, 27.4, 27.6],
    },
    {
      id: "turns",
      label: "Inventory Turnover",
      value: "4.8x",
      trend: "+15.0%",
      positive: true,
      context: "Top quartile retail velocity ratio",
      sparkline: [3.8, 3.9, 4.1, 4.0, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8],
    },
  ];

  return (
    <section id="kpis" className="relative py-20 sm:py-28 overflow-hidden">
      {/* Central continuous vertical spine running full section height */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-emerald-600/60 z-0 pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-800 mb-6">
            <span>Store Intelligence</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight leading-[1.08] max-w-3xl mx-auto inline-block bg-editorial-shell px-6">
            KNOW YOUR STORE <span className="text-emerald-700">AT A GLANCE.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-normal bg-editorial-shell px-4">
            Real metrics calculated directly from your ledger. Every trend is benchmarked to protect margins.
          </p>
        </div>

        {/* Bento Grid of Real KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiData.map((kpi, i) => (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="shell-card p-6 sm:p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                    {kpi.label}
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                    <ArrowUpRight className="w-3 h-3" />
                    {kpi.trend}
                  </span>
                </div>

                <div className="font-headline text-3xl sm:text-4xl text-slate-900 font-black mt-4 tracking-tight">
                  {kpi.value}
                </div>
              </div>

              {/* Sparkline & Contextual Micro-Copy */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 max-w-[180px] leading-tight">
                  {kpi.context}
                </span>

                {/* SVG Mini Sparkline */}
                <div className="w-20 h-8">
                  <svg className="w-full h-full" viewBox="0 0 80 30" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#15803d"
                      strokeWidth="2"
                      points={kpi.sparkline
                        .map((val, idx) => {
                          const x = (idx / (kpi.sparkline.length - 1)) * 76 + 2;
                          const min = Math.min(...kpi.sparkline);
                          const max = Math.max(...kpi.sparkline);
                          const y = 28 - ((val - min) / (max - min || 1)) * 24;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
