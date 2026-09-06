import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, TrendingUp, ShieldCheck, Zap } from "lucide-react";

export default function FinalCTASection({ onInstantDemo, onOpenAuth }) {
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden">
      {/* Background illumination */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Floating Retail Badges around CTA inspired by Fynza stamps */}
        <motion.div
          initial={{ opacity: 0, y: -20, rotate: -4 }}
          whileInView={{ opacity: 1, y: 0, rotate: -4 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="hidden md:inline-flex absolute top-4 left-8 lg:left-16 shell-card px-4 py-2.5 items-center gap-2 text-xs font-mono font-bold text-slate-800 shadow-md"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          <span>Restock Guard: +36 Units</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20, rotate: 6 }}
          whileInView={{ opacity: 1, y: 0, rotate: 6 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden md:inline-flex absolute top-8 right-8 lg:right-16 shell-card px-4 py-2.5 items-center gap-2 text-xs font-mono font-bold text-slate-800 shadow-md"
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
          <span>Prophet AI: +14.2% Spike</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, rotate: 3 }}
          whileInView={{ opacity: 1, y: 0, rotate: 3 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:inline-flex absolute bottom-8 left-20 shell-card px-4 py-2.5 items-center gap-2 text-xs font-mono font-bold text-slate-800 shadow-md"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>27.6% Margin Protected</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, rotate: -5 }}
          whileInView={{ opacity: 1, y: 0, rotate: -5 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="hidden lg:inline-flex absolute bottom-8 right-20 shell-card px-4 py-2.5 items-center gap-2 text-xs font-mono font-bold text-slate-800 shadow-md"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-700" />
          <span>Live POS Streaming</span>
        </motion.div>

        {/* Section Headline */}
        <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-slate-900 tracking-tight leading-[1.05] max-w-4xl mx-auto">
          READY TO <span className="text-emerald-700">UNLOCK YOUR STORE'S SIGNAL?</span>
        </h2>

        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
          Zero setup required. Unlock instant demo access with our verified supermarket dataset, or connect your live store.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onInstantDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white text-base font-bold shadow-xl shadow-emerald-700/25 transition-all"
          >
            <Sparkles className="w-4 h-4 text-lime-300" />
            <span>Instant Demo Access</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 border border-slate-200 text-base font-semibold shadow-sm transition-all"
          >
            <span>Store Sign In / Register</span>
          </button>
        </div>

        <div className="mt-8 text-xs font-mono text-slate-500">
          No credit card · Instant browser unlock · Full feature set
        </div>
      </div>
    </section>
  );
}
