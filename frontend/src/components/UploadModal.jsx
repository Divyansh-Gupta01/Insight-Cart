import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Upload, CheckCircle2, XCircle, FileSpreadsheet, Loader2, Copy, Check, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { uploadDataset, streamPosSales, fetchCurrentUser } from "@/lib/api";
import { toast } from "sonner";

export default function UploadModal({ open, onOpenChange, onUploaded, initialTab = "file" }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'file' | 'api'
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [testStreamLoading, setTestStreamLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      try {
        const cached = JSON.parse(localStorage.getItem("ci_user") || "{}");
        setUserProfile(cached);
        fetchCurrentUser()
          .then((u) => {
            if (u) setUserProfile(u);
          })
          .catch(() => {});
      } catch {}
    }
  }, [open, initialTab]);

  const handleFiles = async (f) => {
    if (!f) return;
    setFile(f);
    setStatus("uploading");
    setResult(null);
    setErrorMessage("");
    try {
      const res = await uploadDataset(f);
      for (let i = 1; i <= res.steps.length; i++) {
        await new Promise((r) => setTimeout(r, 200));
        setResult({ ...res, steps: res.steps.slice(0, i) });
      }
      setStatus("done");
      toast.success(`Validated & saved to PostgreSQL · ${res.rows.toLocaleString()} rows`);
      onUploaded && onUploaded();
    } catch (e) {
      setStatus("error");
      const msg = e.response?.data?.detail || e.message || "Failed to process file. Please check required columns.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleTestStream = async () => {
    setTestStreamLoading(true);
    try {
      const sampleItem = [
        {
          invoice_id: `INV-TEST-${Date.now().toString().slice(-4)}`,
          product: "Amul Gold Milk 1L",
          category: "Dairy",
          quantity: 2,
          unit_price: 68.0,
          unit_cost: 54.0,
          total_amount: 136.0,
          current_stock: 18,
          reorder_point: 10,
          lead_time_days: 2,
          payment_method: "UPI",
          customer_id: "CUST-LIVE-101",
        },
      ];
      await streamPosSales(sampleItem, userProfile?.api_key);
      toast.success("Test sale streamed to PostgreSQL successfully!");
      onUploaded && onUploaded();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Stream test failed");
    } finally {
      setTestStreamLoading(false);
    }
  };

  const copyApiKey = () => {
    if (userProfile?.api_key) {
      navigator.clipboard.writeText(userProfile.api_key);
      setCopied(true);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setStatus("idle");
    setErrorMessage("");
  };

  const webhookUrl = `${window.location.origin}/api/pos/stream-sales`;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="bg-[color:var(--surface-1)] border-[color:var(--hairline-strong)] max-w-2xl rounded-3xl p-8" data-testid="upload-modal">
        <DialogHeader>
          <div className="metadata-label">Data Ingestion · Insight Cart</div>
          <DialogTitle className="font-editorial text-3xl text-[color:var(--ink)] mt-2">
            Bring your retail data.
          </DialogTitle>
          <DialogDescription className="text-[color:var(--ink-muted)] text-sm mt-1">
            Connect your store sales and inventory directly via POS files or real-time API.
          </DialogDescription>
        </DialogHeader>

        {/* Modal Method Tabs */}
        <div className="flex border-b hairline-strong mt-4 gap-6">
          {[
            { id: "file", label: "CSV / Excel File Upload" },
            { id: "api", label: "POS API & Webhook Stream" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); reset(); }}
              className={`text-xs uppercase tracking-wider pb-2 transition-colors ${
                activeTab === t.id
                  ? "text-[color:var(--accent)] border-b-2 border-[color:var(--accent)] font-medium"
                  : "text-[color:var(--ink-dim)] hover:text-[color:var(--ink)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: CSV / Excel Upload */}
        {activeTab === "file" && (
          <div>
            {status === "idle" && (
              <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files?.[0]); }}
                className={`mt-6 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 cursor-pointer transition-all ${
                  dragOver ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]" : "border-[color:var(--hairline-strong)] hover:border-white/25"
                }`}
                data-testid="upload-dropzone"
              >
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => handleFiles(e.target.files?.[0])} data-testid="upload-input" />
                <div className="w-12 h-12 rounded-full border hairline-strong flex items-center justify-center mb-4">
                  <Upload className="w-5 h-5 text-[color:var(--ink)]" />
                </div>
                <div className="font-editorial text-xl">Drop your CSV / Excel export here</div>
                <div className="text-xs text-[color:var(--ink-dim)] mt-2 font-mono-data tracking-widest">
                  CSV · XLSX · Auto-Deduplicated & Verified
                </div>
              </label>
            )}

            {(status === "uploading" || status === "done") && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl surface-2">
                  <div className="w-10 h-10 rounded-full accent-soft-bg flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[color:var(--ink)] text-sm truncate">{file?.name}</div>
                    <div className="text-xs text-[color:var(--ink-dim)] font-mono-data tabular">
                      {result ? `${result.rows.toLocaleString()} rows · ${result.columns.length} columns` : "Reading and sanitizing…"}
                    </div>
                  </div>
                  {status === "uploading" && !result && <Loader2 className="w-4 h-4 text-[color:var(--accent)] animate-spin" />}
                </div>

                <div className="space-y-1">
                  {(result?.steps || []).map((s, i) => (
                    <motion.div
                      key={s.step}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 py-2.5 border-b hairline last:border-b-0"
                      data-testid={`validation-step-${i}`}
                    >
                      {s.passed ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--positive)" }} />
                      ) : (
                        <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--negative)" }} />
                      )}
                      <span className="text-sm text-[color:var(--ink)] flex-1">{s.step}</span>
                      <span className="text-xs text-[color:var(--ink-dim)] font-mono-data">{s.details}</span>
                    </motion.div>
                  ))}
                </div>

                {status === "done" && (
                  <button onClick={() => onOpenChange(false)} className="btn-primary w-full h-11 mt-4">
                    Open Dashboard with Ingested Data
                  </button>
                )}
              </div>
            )}

            {status === "error" && (
              <div className="mt-6 p-6 rounded-2xl border border-[color:var(--negative)] bg-red-950/20 text-center">
                <XCircle className="w-8 h-8 mx-auto mb-2 text-[color:var(--negative)]" />
                <div className="text-sm text-[color:var(--ink)] font-medium">Ingestion Issue</div>
                <div className="text-xs text-[color:var(--ink-dim)] mt-1">{errorMessage}</div>
                <button onClick={reset} className="btn-ghost mt-4 h-9 text-xs">
                  Try another file
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: POS API / Webhook Integration */}
        {activeTab === "api" && (
          <div className="mt-6 space-y-4">
            <p className="text-xs text-[color:var(--ink-muted)]">
              Connect your billing POS software (Tally, Vyapar, Marg ERP, Shopify, Square, or custom billing script) to stream live sales directly into your store dashboard.
            </p>

            <div>
              <label className="metadata-label block mb-1">Webhook Endpoint URL</label>
              <div className="flex items-center gap-2 bg-black/40 border hairline-strong rounded-xl px-3 py-2 text-xs font-mono-data text-[color:var(--ink)]">
                <span className="text-[color:var(--accent)]">POST</span>
                <span className="flex-1 truncate">{webhookUrl}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="metadata-label">Store Secret API Key</label>
                <button
                  onClick={copyApiKey}
                  className="text-xs text-[color:var(--accent)] hover:underline flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy Key"}
                </button>
              </div>
              <div className="flex items-center justify-between bg-black/40 border hairline-strong rounded-xl px-3 py-2 text-xs font-mono-data text-[color:var(--ink)]">
                <span>{userProfile?.api_key || "ci_live_key_..."}</span>
              </div>
            </div>

            <div>
              <label className="metadata-label block mb-1">JSON Payload Example</label>
              <pre className="bg-black/60 border hairline rounded-xl p-3 text-[11px] font-mono-data text-[color:var(--ink-2)] overflow-x-auto">
{`[
  {
    "invoice_id": "INV-20250501",
    "product": "Amul Gold Milk 1L",
    "category": "Dairy",
    "quantity": 2,
    "unit_price": 68.0,
    "unit_cost": 54.0,
    "current_stock": 14,
    "lead_time_days": 2,
    "payment_method": "UPI"
  }
]`}
              </pre>
            </div>

            <button
              onClick={handleTestStream}
              disabled={testStreamLoading}
              className="btn-ghost w-full h-10 text-xs justify-center gap-2"
            >
              {testStreamLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Terminal className="w-3.5 h-3.5" />
              )}
              <span>Send Test Transaction to Store</span>
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
