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
    <div className="relative z-40 px-4 sm:px-8 lg:px-12 pt-6">
      <div className="flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border hairline-strong flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full accent-bg dot-pulse" />
          </div>
          <div>
            <div className="font-editorial text-xl leading-none tracking-tight">
              Insight Cart
            </div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--ink-dim)] mt-1">
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
              className="hidden md:inline-flex items-center gap-2 px-3 h-10 rounded-full border"
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
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                title="Revert to demo data"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Upload */}
          <button
            data-testid="navbar-upload-btn"
            onClick={onUpload}
            className="btn-primary h-10"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload data</span>
          </button>

          <button
            data-testid="navbar-logout"
            onClick={logout}
            className="w-10 h-10 rounded-full border hairline hover:hairline-strong flex items-center justify-center text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
