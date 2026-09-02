import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComp } from "@/components/ui/calendar";
import { Calendar as CalIcon, X } from "lucide-react";

const DATA_START = new Date(2025, 4, 1);   // May 1, 2025
const DATA_END = new Date(2025, 4, 31);    // May 31, 2025

const PRESETS = [
  { id: "all", label: "Full month", range: () => ({ from: DATA_START, to: DATA_END }) },
  { id: "mtd", label: "MTD", range: () => ({ from: DATA_START, to: new Date(2025, 4, 20) }) },
  { id: "14d", label: "Last 14d", range: () => ({ from: new Date(2025, 4, 18), to: DATA_END }) },
  { id: "7d", label: "Last 7d", range: () => ({ from: new Date(2025, 4, 25), to: DATA_END }) },
];

const iso = (d) => d.toISOString().slice(0, 10);
const label = (d) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
const yearLabel = (d) => d.getFullYear();

export default function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState("all");
  const from = value?.from || DATA_START;
  const to = value?.to || DATA_END;

  const apply = (p) => {
    setPreset(p.id);
    const r = p.range();
    onChange({ from: r.from, to: r.to, start_date: iso(r.from), end_date: iso(r.to), preset: p.id });
  };

  const onCalendarSelect = (range) => {
    if (!range) return;
    setPreset("custom");
    onChange({
      from: range.from || from,
      to: range.to || range.from || to,
      start_date: iso(range.from || from),
      end_date: iso(range.to || range.from || to),
      preset: "custom",
    });
  };

  const reset = () => apply(PRESETS[0]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button data-testid="navbar-date-range" className="btn-ghost h-10 text-sm hidden md:inline-flex">
          <CalIcon className="w-3.5 h-3.5 mr-1.5" />
          <span className="font-mono-data text-xs">
            {label(from)} – {label(to)} {yearLabel(to)}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0 bg-[color:var(--surface-2)] border-[color:var(--hairline-strong)] rounded-2xl overflow-hidden">
        <div className="flex">
          {/* Presets */}
          <div className="w-48 p-3 border-r border-[color:var(--hairline)] space-y-1">
            <div className="metadata-label px-2 pb-2">Presets</div>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                data-testid={`daterange-preset-${p.id}`}
                onClick={() => apply(p)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-[color:var(--ink)] hover:bg-white/[0.05] transition-colors"
                style={{ background: preset === p.id ? "rgba(212,255,58,0.08)" : "transparent", color: preset === p.id ? "var(--accent)" : "var(--ink)" }}
              >
                {p.label}
              </button>
            ))}
            <div className="pt-2 mt-2 border-t border-[color:var(--hairline)]">
              <button
                data-testid="daterange-preset-custom"
                onClick={() => setPreset("custom")}
                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/[0.05] transition-colors"
                style={{ background: preset === "custom" ? "rgba(212,255,58,0.08)" : "transparent", color: preset === "custom" ? "var(--accent)" : "var(--ink)" }}
              >
                Custom range
              </button>
              <button
                onClick={reset}
                className="w-full text-left px-3 py-2 mt-1 rounded-lg text-xs text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] transition-colors inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
          {/* Calendar */}
          <div className="p-3">
            <CalendarComp
              mode="range"
              defaultMonth={from}
              numberOfMonths={2}
              selected={{ from, to }}
              onSelect={onCalendarSelect}
              disabled={{ before: new Date(2024, 11, 1), after: new Date(2025, 4, 31) }}
              className="text-[color:var(--ink)]"
            />
            <div className="mt-2 pt-3 border-t border-[color:var(--hairline)] flex items-center justify-between">
              <div className="text-xs text-[color:var(--ink-muted)] font-mono-data tabular">
                {label(from)} – {label(to)}
              </div>
              <button onClick={() => setOpen(false)} className="btn-primary h-9 text-xs" data-testid="daterange-apply">
                Apply
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
