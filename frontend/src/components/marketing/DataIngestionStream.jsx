import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Flame, 
  CreditCard, 
  FileSpreadsheet,
  Layers,
  Sparkles
} from "lucide-react";

export default function DataIngestionStream() {
  const tiers = [
    {
      left: {
        name: "Shopify POS",
        badgeBg: "bg-[#008060]",
        icon: (
          <ShoppingBag className="w-4 h-4 text-white" />
        ),
      },
      right: {
        name: "Square POS",
        badgeBg: "bg-slate-900",
        icon: (
          <div className="w-3.5 h-3.5 rounded-[2px] border-2 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-[1px]" />
          </div>
        ),
      },
    },
    {
      left: {
        name: "Lightspeed",
        badgeBg: "bg-[#E2231A]",
        icon: (
          <Flame className="w-4 h-4 text-white" />
        ),
      },
      right: {
        name: "WooCommerce",
        badgeBg: "bg-[#7F54B3]",
        icon: (
          <span className="font-serif font-black text-xs text-white leading-none">W</span>
        ),
      },
    },
    {
      left: {
        name: "Clover POS",
        badgeBg: "bg-[#2E7D32]",
        icon: (
          <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        ),
      },
      right: {
        name: "Toast POS",
        badgeBg: "bg-[#FF5A00]",
        icon: (
          <Layers className="w-4 h-4 text-white" />
        ),
      },
    },
    {
      left: {
        name: "Stripe Terminal",
        badgeBg: "bg-[#635BFF]",
        icon: (
          <span className="font-sans font-black text-xs text-white leading-none italic">S</span>
        ),
      },
      right: {
        name: "Tally & Excel CSV",
        badgeBg: "bg-[#0F766E]",
        icon: (
          <FileSpreadsheet className="w-4 h-4 text-white" />
        ),
      },
    },
  ];

  return (
    <section className="relative pt-0 pb-8 overflow-hidden">
      {/* Continuous central vertical green spine spanning full section height */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-emerald-600/70 z-0 pointer-events-none" />

      {/* Container holding the retail integrations */}
      <div className="max-w-2xl mx-auto px-4 relative pt-8 sm:pt-10">
        {/* 4 Tiers of Retail Integrations */}
        <div className="flex flex-col relative z-10">
          {tiers.map((tier, idx) => (
            <div key={idx} className="relative py-3.5 sm:py-4 flex items-center justify-between">
              {/* Horizontal dashed divider line crossing the spine */}
              {idx > 0 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] sm:w-[440px] border-t border-dashed border-slate-300/80 pointer-events-none" />
              )}

              {/* Left Side: [Icon] [Name] (right aligned towards spine) */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="flex-1 flex items-center justify-end gap-3 sm:gap-3.5 pr-6 sm:pr-8"
              >
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${tier.left.badgeBg} flex items-center justify-center shrink-0 shadow-xs border border-white/40`}
                >
                  {tier.left.icon}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight font-headline">
                  {tier.left.name}
                </span>
              </motion.div>

              {/* Central Spine Anchor Node */}
              <div className="relative z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />
              </div>

              {/* Right Side: [Name] [Icon] (left aligned towards spine) */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="flex-1 flex items-center justify-start gap-3 sm:gap-3.5 pl-6 sm:pl-8"
              >
                <span className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight font-headline">
                  {tier.right.name}
                </span>
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${tier.right.badgeBg} flex items-center justify-center shrink-0 shadow-xs border border-white/40`}
                >
                  {tier.right.icon}
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Bottom anchor flowing directly into "The Problem" */}
        <div id="problem" className="relative z-10 flex flex-col items-center pt-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-800"
          >
            <span>The Problem</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
