import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, Package, ShieldAlert } from "lucide-react";

export default function InventoryRiskSection() {
  const inventoryItems = [
    {
      sku: "Almond Milk Unsweetened (1L)",
      category: "Dairy & Plant Milk",
      stock: 4,
      reorder: 20,
      daysSupply: "1.2 Days",
      risk: "CRITICAL",
      riskBg: "bg-rose-50 text-rose-700 border-rose-200",
      abc: "A",
      action: "Order +36 units immediately",
    },
    {
      sku: "Artisan Sourdough Bread",
      category: "Bakery",
      stock: 8,
      reorder: 25,
      daysSupply: "2.4 Days",
      risk: "HIGH",
      riskBg: "bg-amber-50 text-amber-700 border-amber-200",
      abc: "A",
      action: "Order +24 units today",
    },
    {
      sku: "Organic Greek Yogurt (500g)",
      category: "Dairy",
      stock: 15,
      reorder: 30,
      daysSupply: "4.8 Days",
      risk: "MEDIUM",
      riskBg: "bg-yellow-50 text-yellow-700 border-yellow-200",
      abc: "B",
      action: "Supplier window in 2 days",
    },
    {
      sku: "Cold Pressed Olive Oil (500ml)",
      category: "Pantry",
      stock: 64,
      reorder: 20,
      daysSupply: "18.5 Days",
      risk: "HEALTHY",
      riskBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      abc: "A",
      action: "Optimal buffer maintained",
    },
    {
      sku: "Gluten-Free Granola Clusters",
      category: "Breakfast",
      stock: 92,
      reorder: 15,
      daysSupply: "45.0 Days",
      risk: "OVERSTOCK",
      riskBg: "bg-slate-100 text-slate-700 border-slate-200",
      abc: "C",
      action: "Tie up risk · Discount bundle",
    },
  ];

  return (
    <section id="inventory" className="relative py-20 sm:py-28 overflow-hidden">
      {/* Central continuous vertical spine running full section height */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-emerald-600/60 z-0 pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-800 mb-6">
            <span>Inventory &amp; Shelf Risk</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight leading-[1.08] max-w-3xl mx-auto inline-block bg-editorial-shell px-6">
            KNOW WHAT'S AT RISK <span className="text-emerald-700">BEFORE IT HURTS.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-normal bg-editorial-shell px-4">
            Automated Days-of-Supply indexing and ABC Pareto stratification protect your working capital.
          </p>
        </div>

        {/* Matrix Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="shell-card p-6 sm:p-10 overflow-hidden"
        >
          {/* Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Monitored SKUs</span>
              <div className="font-headline text-2xl font-bold text-slate-900 mt-1">20 Catalog SKUs</div>
              <div className="text-[11px] text-slate-500 mt-0.5">6 Retail Categories</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
              <span className="text-[10px] font-mono text-rose-600 uppercase font-bold">Critical Stockout Risk</span>
              <div className="font-headline text-2xl font-bold text-rose-950 mt-1">2 SKUs Alert</div>
              <div className="text-[11px] text-rose-700 mt-0.5">Supply &lt; 48 hours</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold">Pareto Class A</span>
              <div className="font-headline text-2xl font-bold text-emerald-950 mt-1">82.4% Revenue</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">Protected from stockout</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Shelf Velocity</span>
              <div className="font-headline text-2xl font-bold text-slate-900 mt-1">7.4 Days</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Fast-turning perishables</div>
            </div>
          </div>

          {/* Interactive Inventory Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="pb-3 font-semibold">SKU / Item</th>
                  <th className="pb-3 font-semibold">Pareto</th>
                  <th className="pb-3 font-semibold">Current Stock</th>
                  <th className="pb-3 font-semibold">Supply Left</th>
                  <th className="pb-3 font-semibold">Risk Tier</th>
                  <th className="pb-3 font-semibold text-right">Prescribed Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryItems.map((item) => (
                  <tr key={item.sku} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 font-medium text-slate-900">
                      <div>{item.sku}</div>
                      <div className="text-[11px] text-slate-400">{item.category}</div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        item.abc === "A"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.abc === "B"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-slate-50 text-slate-400"
                      }`}>
                        Class {item.abc}
                      </span>
                    </td>
                    <td className="py-4 font-mono font-bold text-slate-800">
                      {item.stock} units
                      <div className="text-[10px] font-normal text-slate-400">Reorder at {item.reorder}</div>
                    </td>
                    <td className="py-4 font-mono font-bold text-slate-800">
                      {item.daysSupply}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${item.riskBg}`}>
                        {item.risk}
                      </span>
                    </td>
                    <td className="py-4 text-right font-medium text-slate-700">
                      {item.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
