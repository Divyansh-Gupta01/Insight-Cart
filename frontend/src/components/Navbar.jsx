import { Upload, RotateCcw, LogOut, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { resetDataset } from "@/lib/api";
import { toast } from "sonner";
import DateRangePicker from "@/components/DateRangePicker";

export default function Navbar({
  onUpload,
  datasetInfo,
  onReset,
  dateRange,
  setDateRange,
}) {
  const nav = useNavigate();
  const isLive =
    datasetInfo &&
    (datasetInfo.has_live_sales || datasetInfo.has_live_inventory);
  const logout = () => {
    localStorage.removeItem("ci_token");
    nav("/");
  };

  const handleReset = async () => {
    await resetDataset();
    toast.success("Reverted to demo dataset");
    onReset && onReset();
  };

  return (
    <div className="relative z-40 px-4 sm:px-8 lg:px-12 pt-5">
      <div className="flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl border hairline-strong bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex items-center justify-center transition-colors group-hover:border-slate-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4H5.5L8 16H18.5L21 7H6.5" stroke="#0f172a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.5" fill="#15803d" />
              <circle cx="17.5" cy="20" r="1.5" fill="#15803d" />
              <path d="M11 9.5L13.5 12L17 7.5" stroke="#15803d" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="font-editorial text-xl leading-none tracking-tight">
              Insight Cart
            </div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--ink-dim)] mt-1 font-semibold">
              {(() => {
                try {
                  const u = JSON.parse(localStorage.getItem("ci_user") || "{}");
                  return u.store_name || datasetInfo?.store_name || "Retail Intelligence Platform";
                } catch {
                  return "Retail Intelligence Platform";
                }
              })()}
            </div>
          </div>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {/* Date range */}
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          {/* Live dataset badge */}
          {isLive && (
            <div
              className="hidden md:inline-flex items-center gap-2 px-3 h-9 rounded-full border"
              style={{
                borderColor: "rgba(21,128,61,0.25)",
                background: "rgba(21,128,61,0.06)",
              }}
              data-testid="navbar-live-badge"
            >
              <Circle className="w-2 h-2 fill-[color:var(--accent)] text-[color:var(--accent)]" />
              <span className="text-[11px] tracking-[0.16em] uppercase text-[color:var(--accent)] font-semibold">
                Live
              </span>
              <span className="text-[10px] font-mono-data text-[color:var(--ink-muted)] truncate max-w-[140px]">
                {datasetInfo?.latest?.filename}
              </span>
              <button
                onClick={handleReset}
                data-testid="navbar-reset-dataset"
                className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                title="Revert to demo data"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          )}

          {/* Upload */}
          <button
            data-testid="navbar-upload-btn"
            onClick={onUpload}
            className="btn-primary h-9"
          >
            <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Upload data</span>
          </button>

          <button
            data-testid="navbar-logout"
            onClick={logout}
            className="w-9 h-9 rounded-full border hairline hover:hairline-strong flex items-center justify-center text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-slate-100 active:scale-95 transition-all"
            title="Log out"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
