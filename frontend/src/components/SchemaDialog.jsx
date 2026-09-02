import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, X, Download } from "lucide-react";
import { SCHEMA, downloadSampleCSV } from "@/lib/schema";
import { toast } from "sonner";

export default function SchemaDialog({ open, onOpenChange }) {
  const doDownload = () => {
    downloadSampleCSV();
    toast.success("Sample dataset downloaded");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[color:var(--surface-1)] border-[color:var(--hairline-strong)] max-w-3xl rounded-3xl p-8" data-testid="schema-dialog">
        <DialogHeader>
          <div className="metadata-label">Data contract</div>
          <DialogTitle className="font-editorial text-3xl text-[color:var(--ink)] mt-2">Required dataset schema</DialogTitle>
          <DialogDescription className="text-[color:var(--ink-muted)] text-sm mt-2">
            One CSV/XLSX that powers every module. Required columns must be present;
            optional columns unlock extra analytics.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 overflow-hidden rounded-2xl border hairline">
          <div className="max-h-[52vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[color:var(--surface-2)]">
                <tr className="text-left border-b hairline">
                  <th className="px-4 py-3 metadata-label font-normal">Column</th>
                  <th className="px-4 py-3 metadata-label font-normal">Required</th>
                  <th className="px-4 py-3 metadata-label font-normal">Type</th>
                  <th className="px-4 py-3 metadata-label font-normal">Example</th>
                  <th className="px-4 py-3 metadata-label font-normal">Powers</th>
                </tr>
              </thead>
              <tbody>
                {SCHEMA.map((s) => (
                  <tr key={s.column} className="border-b hairline last:border-b-0 hover:bg-white/[0.02]" data-testid={`schema-row-${s.column}`}>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-[color:var(--ink)]">{s.column}</span>
                    </td>
                    <td className="px-4 py-3">
                      {s.required ? (
                        <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--accent)" }}>
                          <Check className="w-3 h-3" /> Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-muted)]">
                          <X className="w-3 h-3" /> Optional
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[color:var(--ink-muted)]">{s.type}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-[10px] text-[color:var(--ink-2)] tabular">{s.example}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[color:var(--ink-muted)]">
                      <ul className="list-disc list-inside space-y-0.5">
                        {s.powers.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-[color:var(--ink-dim)] max-w-md leading-relaxed">
            The uploaded dataset becomes the <span className="text-[color:var(--ink-2)]">single source of truth</span> —
            Overview, Trends, Products, Categories, Inventory, Forecast and Reports all read from it.
          </div>
          <button onClick={doDownload} data-testid="schema-download-sample" className="btn-primary h-11">
            <Download className="w-4 h-4" />
            Download sample CSV
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
