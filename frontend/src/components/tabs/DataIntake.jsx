import { Upload, CheckCircle2, RotateCcw, FileText, Download, Terminal } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { resetDataset } from "@/lib/api";
import { toast } from "sonner";
import SchemaDialog from "@/components/SchemaDialog";
import { downloadSampleCSV } from "@/lib/schema";

const CHECKS = [
  { title: "File type", desc: "CSV, XLSX, XLS accepted." },
  { title: "Schema", desc: "Required: date, product, category, quantity, amount. Optional: payment_method, current_stock, reorder_level." },
  { title: "Missing values", desc: "Nulls flagged, dropped when needed." },
  { title: "Duplicates", desc: "Exact-row duplicates removed." },
  { title: "Types", desc: "Coerced to numeric, date, and category." },
  { title: "Ranges", desc: "Anomalies and out-of-range detected." },
  { title: "Format", desc: "UTF-8, delimiter and header consistency." },
];

export default function DataIntake({ onUpload, datasetInfo, onReset }) {
  const [schemaOpen, setSchemaOpen] = useState(false);
  const isLive = datasetInfo && (datasetInfo.has_live_sales || datasetInfo.has_live_inventory);
  const meta = datasetInfo?.latest;

  const handleReset = async () => {
    await resetDataset();
    toast.success("Reverted to demo data");
    onReset && onReset();
  };

  const handleDownloadSample = () => {
    downloadSampleCSV();
    toast.success("Sample template downloaded");
  };

  return (
    <div className="space-y-16 pt-12 sm:pt-16">
      {/* Hero */}
      <section>
        <div className="metadata-label">Data Intake · Insight Cart</div>
        <h1 className="editorial-headline text-5xl sm:text-6xl lg:text-7xl mt-6">
          Drop your <span className="italic text-[color:var(--accent)]">retail data</span><br />
          here.
        </h1>
        <p className="mt-8 max-w-lg text-[color:var(--ink-2)] text-lg leading-relaxed">
          Every transaction and inventory row moves through automated verification and deduplication into your live store ledger.
        </p>
      </section>

      {/* Live banner */}
      {isLive && meta && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="surface-elev p-6 flex items-center gap-5 flex-wrap"
          data-testid="intake-live-banner"
        >
          <div className="w-10 h-10 rounded-full border flex items-center justify-center" style={{ borderColor: "rgba(212,255,58,0.5)", background: "rgba(212,255,58,0.1)" }}>
            <CheckCircle2 className="w-4 h-4 text-[color:var(--accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-[color:var(--accent)]">Live dataset active — every chart reflects your store data</div>
            <div className="text-xs text-[color:var(--ink-muted)] mt-1 font-mono-data tabular truncate">
              {meta.filename} · {meta.kind} · {(meta.persisted || meta.rows).toLocaleString()} rows · {new Date(meta.uploaded_at).toLocaleString("en-IN")}
            </div>
          </div>
          <button data-testid="intake-reset-btn" onClick={handleReset} className="btn-ghost h-10">
            <RotateCcw className="w-3.5 h-3.5" />
            Clear & Reset
          </button>
        </motion.div>
      )}

      {/* Big drop surface */}
      <section className="surface-elev p-12 sm:p-16 text-center relative overflow-hidden" data-testid="intake-drop-hero">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          background: "radial-gradient(600px 300px at 50% 100%, rgba(212,255,58,0.08), transparent 70%)"
        }} />
        <div className="relative">
          <div className="w-20 h-20 mx-auto rounded-full border hairline-strong flex items-center justify-center mb-8">
            <Upload className="w-6 h-6 text-[color:var(--ink)]" />
          </div>
          <h2 className="editorial-headline text-3xl sm:text-4xl">Ingest your store data.</h2>
          <p className="mt-4 text-[color:var(--ink-muted)] max-w-md mx-auto text-sm">
            Sales exports and inventory sheets. Validated, deduped, and indexed in under a second.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <button
              data-testid="intake-open-upload"
              onClick={() => onUpload && onUpload("file")}
              className="btn-primary h-11"
            >
              <Upload className="w-4 h-4" />
              Upload POS Data (CSV / Excel)
            </button>
            <button
              onClick={() => onUpload && onUpload("api")}
              className="btn-ghost h-11 text-xs"
            >
              <Terminal className="w-4 h-4 text-[color:var(--accent)]" />
              Connect POS API Stream
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <button data-testid="intake-see-schema" onClick={() => setSchemaOpen(true)} className="btn-ghost h-9 text-xs">
              <FileText className="w-3.5 h-3.5" />
              See required schema
            </button>
            <button data-testid="intake-download-sample" onClick={handleDownloadSample} className="btn-ghost h-9 text-xs">
              <Download className="w-3.5 h-3.5" />
              Download template CSV
            </button>
          </div>
        </div>
      </section>

      {/* Pipeline steps */}
      <section data-testid="intake-pipeline">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
          <div>
            <div className="metadata-label">Pipeline</div>
            <h2 className="editorial-headline text-3xl sm:text-4xl mt-2">Seven checks. One trusted table.</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHECKS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
              className="surface p-6 lift"
            >
              <div className="metadata-label">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-4 font-editorial text-2xl">{c.title}</div>
              <div className="mt-2 text-sm text-[color:var(--ink-muted)] leading-relaxed">{c.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <SchemaDialog open={schemaOpen} onOpenChange={setSchemaOpen} />
    </div>
  );
}
