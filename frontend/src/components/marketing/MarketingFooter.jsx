import { useNavigate } from "react-router-dom";

export default function MarketingFooter({ onExploreDashboard }) {
  const nav = useNavigate();

  return (
    <footer className="relative border-t border-slate-200/80 bg-white/60 py-16 sm:py-20 text-slate-600">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-100">
          {/* Brand Col */}
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center p-1.5">
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
              <span className="font-headline text-lg font-black text-slate-900 tracking-tight">
                CART <span className="text-emerald-700">INSIGHT</span>
              </span>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed font-normal">
              Autonomous retail intelligence platform for supermarket managers and store operators.
              Time-series forecasting, ABC Pareto analysis, and automated morning restock dispatches.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>FastAPI &amp; Meta Prophet Engine · Operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <div className="font-headline font-bold text-xs uppercase tracking-wider text-slate-900 mb-4">
              Product
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={onExploreDashboard} className="hover:text-emerald-700 transition-colors">
                  Store Dashboard
                </button>
              </li>
              <li>
                <a href="#forecast" className="hover:text-emerald-700 transition-colors">
                  Demand Forecasting
                </a>
              </li>
              <li>
                <a href="#inventory" className="hover:text-emerald-700 transition-colors">
                  Inventory &amp; Stockout Risk
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">
                  POS Live Streaming
                </a>
              </li>
            </ul>
          </div>

          {/* Intelligence Links */}
          <div>
            <div className="font-headline font-bold text-xs uppercase tracking-wider text-slate-900 mb-4">
              Intelligence
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#kpis" className="hover:text-emerald-700 transition-colors">
                  ABC Pareto Matrix
                </a>
              </li>
              <li>
                <a href="#forecast" className="hover:text-emerald-700 transition-colors">
                  Time-Series Prophet
                </a>
              </li>
              <li>
                <a href="#engine" className="hover:text-emerald-700 transition-colors">
                  The Intelligence Loop
                </a>
              </li>
              <li>
                <a href="#timeline" className="hover:text-emerald-700 transition-colors">
                  Restock Decision Logic
                </a>
              </li>
            </ul>
          </div>

          {/* Resources & Legal */}
          <div>
            <div className="font-headline font-bold text-xs uppercase tracking-wider text-slate-900 mb-4">
              Platform
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <span className="text-slate-500">API Documentation</span>
              </li>
              <li>
                <span className="text-slate-500">CSV &amp; Excel Specs</span>
              </li>
              <li>
                <span className="text-slate-500">Security Architecture</span>
              </li>
              <li>
                <span className="text-slate-500">Privacy Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            © {new Date().getFullYear()} Cart Insight. All rights reserved.
          </div>
          <div>
            Built with React 18, FastAPI, Meta Prophet &amp; Tailwind CSS.
          </div>
        </div>
      </div>
    </footer>
  );
}
