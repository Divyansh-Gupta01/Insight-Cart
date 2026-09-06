import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Sparkles, FileSpreadsheet } from "lucide-react";

export default function ComparisonSection() {
  const ciFeatures = [
    {
      title: "Real-Time POS & Automated Ingestion",
      desc: "Live stream or drop raw CSV files. Headers, dates, and currency are normalized automatically.",
    },
    {
      title: "Prophet 7-Day Demand Forecasting",
      desc: "Time-series decomposition isolates weekend spikes and holiday surges with 95% confidence intervals.",
    },
    {
      title: "Automated ABC Pareto Stratification",
      desc: "Instantly reveals which 20% of your product catalog generates 80% of your retail profit.",
    },
    {
      title: "Active Stockout Prevention Guard",
      desc: "Flags low stock 48 hours before exhaustion based on sales velocity and supplier lead times.",
    },
    {
      title: "Automated Morning Restock PDF Reports",
      desc: "In-memory generated restock dossiers dispatched via SMTP directly to store email at 08:00 AM.",
    },
    {
      title: "Real-Time Margin Compression Alerts",
      desc: "Monitors wholesale cost fluctuations and warns when shelf prices need immediate adjustment.",
    },
  ];

  const legacyFeatures = [
    {
      title: "Manual Spreadsheet Entry & Fragile Formulas",
      desc: "Requires hours of manual bookkeeping, vlookups, and pivot tables prone to human calculation error.",
    },
    {
      title: "Historical Hindsight Only",
      desc: "Spreadsheets show what you sold last month, leaving you completely blind to next weekend's demand.",
    },
    {
      title: "Zero Automated SKU Prioritization",
      desc: "Every product looks identical on an Excel sheet, hiding high-margin heroes behind deadweight inventory.",
    },
    {
      title: "Stockouts Caught Too Late",
      desc: "Empty shelves are only noticed after frustrated shoppers leave empty-handed for a competitor.",
    },
    {
      title: "Manual Weekly Report Scrambles",
      desc: "Store managers spend Sunday evenings building static tables instead of running retail operations.",
    },
    {
      title: "Invisible Margin Erosion",
      desc: "Wholesale cost hikes quietly eat store margins for months before quarterly books reveal the loss.",
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
            <span>Our Edge</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight leading-[1.08] max-w-4xl mx-auto inline-block bg-editorial-shell px-6">
            SPREADSHEETS SHOW NUMBERS.{" "}
            <span className="text-emerald-700">WE REVEAL WHAT THEY MEAN.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-normal bg-editorial-shell px-4">
            Compare modern automated retail intelligence against traditional manual guesswork.
          </p>
        </div>

        {/* Side-by-Side Comparison Cards (Inspired by Fynza) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left Card: Cart Insight */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="shell-card p-6 sm:p-10 border-2 border-emerald-600/30 shadow-xl relative z-10 bg-white flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center p-1.5">
                    <div className="grid grid-cols-3 gap-0.5 w-full h-full">
                      <div className="bg-emerald-600 rounded-[1px]" />
                      <div className="bg-emerald-600 rounded-[1px]" />
                      <div className="bg-emerald-600 rounded-[1px]" />
                      <div className="bg-emerald-600 rounded-[1px]" />
                      <div className="bg-emerald-500 rounded-[1px]" />
                      <div className="bg-emerald-600 rounded-[1px]" />
                      <div className="bg-emerald-600 rounded-[1px]" />
                      <div className="bg-emerald-600 rounded-[1px]" />
                      <div className="bg-emerald-400 rounded-[1px]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-headline font-black text-xl text-slate-900 leading-none">
                      CART INSIGHT
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                      Automated Retail Operating System
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                  Recommended
                </span>
              </div>

              <div className="space-y-5">
                {ciFeatures.map((f) => (
                  <div key={f.title} className="flex items-start gap-3.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-headline">
                        {f.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-xs font-mono text-emerald-800 font-semibold bg-emerald-50/60 -mx-6 -mb-6 p-4 rounded-b-[26px] flex items-center justify-between">
              <span>Time saved per store: ~12 hours / week</span>
              <span className="font-bold">+9.3% Margin</span>
            </div>
          </motion.div>

          {/* Right Card: Traditional Spreadsheets */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="shell-card p-6 sm:p-10 bg-white border border-slate-200 relative z-10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-200/80 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-xl text-slate-800 leading-none">
                      Traditional Methods
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                      Manual Spreadsheets &amp; Guesswork
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-mono font-bold">
                  Legacy
                </span>
              </div>

              <div className="space-y-5">
                {legacyFeatures.map((f) => (
                  <div key={f.title} className="flex items-start gap-3.5 opacity-75">
                    <div className="w-5 h-5 rounded-full bg-slate-200/70 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 font-headline">
                        {f.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 text-xs font-mono text-slate-500 bg-slate-100/60 -mx-6 -mb-6 p-4 rounded-b-[26px] flex items-center justify-between">
              <span>Risk: 15-25% uncaptured revenue &amp; stockouts</span>
              <span className="font-bold text-rose-600">Manual Lag</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
