import { useState, useEffect } from "react";
import { Download, ArrowRight, Mail, Clock, CheckCircle2, Trash2, Send, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { downloadReport, listSchedules, createSchedule, deleteSchedule, sendReportEmail } from "@/lib/api";

const REPORTS = [
  { id: "inventory", title: "Restock Report", type: "Operational", desc: "Urgent stockout alerts, safety stock buffers, supplier lead times, and recommended order units.", pages: 2, badge: "Daily Favorite" },
  { id: "all", title: "Store Report", type: "Comprehensive", desc: "Complete 360° retail dossier: Executive KPIs, Category Pareto, 7-Day Prophet Forecast, and Stock Matrix.", pages: 4, badge: "Full Dossier" },
  { id: "executive", title: "Executive Summary", type: "Financial", desc: "Revenue, orders, average transaction value, gross margin, and day-over-day growth signals.", pages: 1 },
  { id: "forecast", title: "7-Day Demand Forecast", type: "Predictive", desc: "Walk-Forward model predictions with confidence bands, WAPE, and sMAPE validation.", pages: 1 },
  { id: "performance", title: "Category Performance", type: "Merchandising", desc: "Category contribution matrix, fast-moving vs slow-moving goods, and profit drivers.", pages: 2 },
];

export default function Reports() {
  const [schedules, setSchedules] = useState([]);
  const [reportType, setReportType] = useState("inventory"); // 'inventory' (Restock Report) | 'all' (Store Report)
  const [cadence, setCadence] = useState("daily"); // 'daily' | 'weekly' only
  const [emailInput, setEmailInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendingNow, setSendingNow] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("ci_user") || "{}");
      if (u.email) setEmailInput(u.email);
    } catch {}
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const res = await listSchedules();
      setSchedules(res.schedules || []);
    } catch {
      setSchedules([]);
    }
  };

  const handleDownload = (section = "all", title = "Store Report") => {
    toast.success(`Generating ${title}…`);
    downloadReport(section);
  };

  const handleCreateSchedule = async (e) => {
    e && e.preventDefault();
    if (!emailInput.trim()) {
      toast.error("Please enter a recipient email address");
      return;
    }
    const recipients = emailInput.split(",").map((s) => s.trim()).filter(Boolean);
    const reportName = reportType === "inventory" ? "Restock Report" : "Store Report";
    const cadenceLabel = cadence === "daily" ? "Every Morning (08:00 AM)" : "Every Week (Monday 08:00 AM)";

    setSaving(true);
    try {
      await createSchedule({
        name: `${cadence === "daily" ? "Daily" : "Weekly"} ${reportName}`,
        cadence: cadence,
        day_of_week: 0,
        hour: 8,
        minute: 0,
        recipients: recipients,
      });
      toast.success(`Automated dispatch saved · ${reportName} will send ${cadenceLabel}`);
      loadSchedules();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await deleteSchedule(id);
      toast.success("Scheduled dispatch removed");
      loadSchedules();
    } catch {
      toast.error("Failed to remove schedule");
    }
  };

  const handleSendNow = async () => {
    if (!emailInput.trim()) {
      toast.error("Please enter a recipient email");
      return;
    }
    const recipients = emailInput.split(",").map((s) => s.trim()).filter(Boolean);
    const reportName = reportType === "inventory" ? "Restock Report" : "Store Report";
    setSendingNow(true);
    try {
      const res = await sendReportEmail({
        report_type: reportType,
        cadence: cadence,
        recipients: recipients,
      });
      toast.success(res.message || `${reportName} dispatched successfully!`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to dispatch test email");
    } finally {
      setSendingNow(false);
    }
  };

  const now = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-16 pt-12 sm:pt-16">
      {/* Hero */}
      <section>
        <div className="metadata-label">Reports & Automated Intelligence</div>
        <h1 className="editorial-headline text-5xl sm:text-6xl lg:text-7xl mt-6">
          Every decision,<br />
          <span className="italic text-[color:var(--accent)]">delivered to your inbox.</span>
        </h1>
        <p className="mt-8 max-w-xl text-[color:var(--ink-2)] text-lg leading-relaxed">
          Configure automated morning report dispatches for your store management or download instant print-ready files.
        </p>
      </section>

      {/* AUTOMATED MORNING DISPATCH CARD */}
      <section className="surface-elev p-8 sm:p-12 relative overflow-hidden rounded-3xl border hairline-strong" data-testid="morning-dispatch-card">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          background: "radial-gradient(800px 400px at 100% 0%, rgba(212,255,58,0.12), transparent 70%)"
        }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full accent-bg dot-pulse" />
            <span className="metadata-label text-[color:var(--accent)]">AUTOMATED MORNING DISPATCH</span>
          </div>

          <h2 className="editorial-headline text-3xl sm:text-4xl text-[color:var(--ink)]">
            Send Restock & Store Reports Every Morning
          </h2>
          <p className="mt-3 text-sm text-[color:var(--ink-muted)] max-w-2xl leading-relaxed">
            Choose between your urgent Restock Report or the complete Store Report, delivered automatically to your store team.
          </p>

          {/* Form Controls */}
          <form onSubmit={handleCreateSchedule} className="mt-8 space-y-6 max-w-3xl">
            {/* 1. Report Type Selection (2 distinct options: Restock Report & Store Report) */}
            <div>
              <label className="metadata-label block mb-2">1. Select Report</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReportType("inventory")}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    reportType === "inventory"
                      ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]/20 shadow-sm"
                      : "border-[color:var(--hairline-strong)] hover:border-white/20 surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[color:var(--accent)]">Option A</span>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[color:var(--accent)]/10 text-[color:var(--accent)]">Recommended</span>
                  </div>
                  <div className="font-editorial text-xl text-[color:var(--ink)] mt-2">Restock Report</div>
                  <div className="text-xs text-[color:var(--ink-muted)] mt-1">
                    Urgent stockout alerts, lead-time buffers, and recommended reorder quantities.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType("all")}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    reportType === "all"
                      ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]/20 shadow-sm"
                      : "border-[color:var(--hairline-strong)] hover:border-white/20 surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[color:var(--ink-dim)]">Option B</span>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-[color:var(--ink-dim)]">360° View</span>
                  </div>
                  <div className="font-editorial text-xl text-[color:var(--ink)] mt-2">Store Report</div>
                  <div className="text-xs text-[color:var(--ink-muted)] mt-1">
                    Complete store dossier with Executive KPIs, Category Pareto, 7-Day Forecast, and Restock Matrix.
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Cadence Selection (Only 2 options: Every Day or Every Week) */}
            <div>
              <label className="metadata-label block mb-2">2. Delivery Schedule Cadence</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCadence("daily")}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    cadence === "daily"
                      ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]/20 font-medium"
                      : "border-[color:var(--hairline-strong)] hover:border-white/20 surface text-[color:var(--ink-muted)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[color:var(--accent)]" />
                    <div>
                      <div className="text-sm text-[color:var(--ink)]">Every Day</div>
                      <div className="text-[11px] text-[color:var(--ink-dim)]">Daily Morning Store Digest</div>
                    </div>
                  </div>
                  {cadence === "daily" && <CheckCircle2 className="w-4 h-4 text-[color:var(--accent)]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setCadence("weekly")}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    cadence === "weekly"
                      ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]/20 font-medium"
                      : "border-[color:var(--hairline-strong)] hover:border-white/20 surface text-[color:var(--ink-muted)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[color:var(--accent)]" />
                    <div>
                      <div className="text-sm text-[color:var(--ink)]">Every Week</div>
                      <div className="text-[11px] text-[color:var(--ink-dim)]">Weekly Monday Store Digest</div>
                    </div>
                  </div>
                  {cadence === "weekly" && <CheckCircle2 className="w-4 h-4 text-[color:var(--accent)]" />}
                </button>
              </div>
            </div>

            {/* 3. Recipient Email */}
            <div>
              <label className="metadata-label block mb-2">3. Destination Email Address(es)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[color:var(--ink-dim)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="owner@store.com, manager@store.com"
                  className="w-full bg-black/40 border hairline-strong rounded-xl pl-10 pr-4 py-2.5 text-xs text-[color:var(--ink)] focus:outline-none focus:border-[color:var(--accent)] font-mono-data"
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary h-11 px-6 text-xs uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {saving ? "Saving Schedule…" : "Save Automated Schedule"}
              </button>

              <button
                type="button"
                onClick={handleSendNow}
                disabled={sendingNow}
                className="btn-ghost h-11 px-5 text-xs"
              >
                <Send className="w-3.5 h-3.5 text-[color:var(--accent)]" />
                {sendingNow ? "Dispatching…" : "Send Test PDF to Email Now"}
              </button>
            </div>
          </form>

          {/* Active Schedules List */}
          {schedules.length > 0 && (
            <div className="mt-10 pt-8 border-t hairline-strong">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-[color:var(--accent)]" />
                <span className="metadata-label">Active Automated Dispatches ({schedules.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {schedules.map((s) => (
                  <div key={s.id} className="surface p-4 rounded-2xl border hairline flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[color:var(--ink)] font-medium">{s.name}</div>
                      <div className="text-xs text-[color:var(--ink-dim)] mt-0.5 font-mono-data">
                        {s.cadence === "daily" ? "Every Day @ 08:00 AM" : "Every Monday @ 08:00 AM"} · {s.recipients?.join(", ")}
                      </div>
                      {s.next_delivery && (
                        <div className="text-[10px] text-[color:var(--accent)] mt-1 font-mono-data">
                          Next run: {new Date(s.next_delivery).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteSchedule(s.id)}
                      className="text-[color:var(--ink-dim)] hover:text-red-400 p-2 transition-colors"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Report library for instant downloads */}
      <section data-testid="reports-sections">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="metadata-label">Report Library</div>
            <h2 className="editorial-headline text-3xl sm:text-4xl mt-2">Print-Ready Store Reports.</h2>
          </div>
          <button data-testid="reports-download-btn" onClick={() => handleDownload("all", "Store Report")} className="btn-primary h-11">
            <Download className="w-4 h-4" />
            Download Complete Store Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {REPORTS.map((r, i) => (
            <motion.div
              key={r.title}
              data-testid={`report-card-${r.id}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              className="surface-elev lift p-8 group cursor-pointer relative overflow-hidden"
              onClick={() => handleDownload(r.id, r.title)}
            >
              <div className="absolute right-6 top-6 w-14 h-16 rounded-md border hairline-strong opacity-40 rotate-[6deg] pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), transparent)" }} />
              <div className="absolute right-8 top-4 w-14 h-16 rounded-md border hairline opacity-30 rotate-[-4deg] pointer-events-none" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="metadata-label">{r.type}</div>
                  <span className="text-[10px] text-[color:var(--ink-dim)] font-mono-data tabular">· {r.pages} page{r.pages > 1 ? "s" : ""}</span>
                </div>
                {r.badge && (
                  <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-[color:var(--accent)]/10 text-[color:var(--accent)] font-semibold">
                    {r.badge}
                  </span>
                )}
              </div>
              <div className="mt-6 font-editorial text-3xl leading-tight">{r.title}</div>
              <div className="mt-3 text-sm text-[color:var(--ink-muted)] max-w-sm">{r.desc}</div>

              <div className="mt-8 flex items-center justify-between border-t hairline pt-5">
                <div>
                  <div className="metadata-label">Generated</div>
                  <div className="text-xs text-[color:var(--ink-muted)] mt-1 font-mono-data tabular">{now}</div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-[color:var(--ink-2)] group-hover:text-[color:var(--accent)] transition-colors">
                  Download PDF <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
