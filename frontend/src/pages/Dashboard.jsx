import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import UploadModal from "@/components/UploadModal";
import Overview from "@/components/tabs/Overview";
import DataIntake from "@/components/tabs/DataIntake";
import Trends from "@/components/tabs/Trends";
import Inventory from "@/components/tabs/Inventory";
import Forecast from "@/components/tabs/Forecast";
import Reports from "@/components/tabs/Reports";
import { fetchInsights, fetchDatasetStatus } from "@/lib/api";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "intake", label: "Data Intake" },
  { id: "trends", label: "Trends" },
  { id: "inventory", label: "Inventory" },
  { id: "forecast", label: "Forecast" },
  { id: "reports", label: "Reports" },
];

export default function Dashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("overview");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [insights, setInsights] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dateRange, setDateRange] = useState({
    from: new Date(2025, 4, 1), to: new Date(2025, 4, 31),
    start_date: "2025-05-01", end_date: "2025-05-31", preset: "all",
  });

  useEffect(() => {
    if (!localStorage.getItem("ci_token")) nav("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  useEffect(() => {
    fetchInsights(dateRange.start_date, dateRange.end_date).then(setInsights).catch(() => setInsights(null));
    fetchDatasetStatus().then(setDatasetInfo).catch(() => setDatasetInfo(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, dateRange.start_date, dateRange.end_date]);

  const [uploadTab, setUploadTab] = useState("file");

  const openUpload = (targetTab = "file") => {
    setUploadTab(targetTab);
    setUploadOpen(true);
  };

  const handleUploaded = () => setRefreshKey((k) => k + 1);

  const active = TABS.findIndex((t) => t.id === tab);

  return (
    <div className="min-h-screen relative ambient-bg noise">
      <Navbar
        onUpload={() => openUpload("file")}
        datasetInfo={datasetInfo}
        onReset={handleUploaded}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      {/* Floating pill nav */}
      <div className="sticky top-4 z-30 px-4 sm:px-8 flex justify-center pointer-events-none mt-2">
        <div
          role="tablist"
          aria-label="Dashboard views"
          className="pointer-events-auto rounded-full px-1.5 py-1 flex items-center gap-1 elevation-floating"
          data-testid="dashboard-tabs"
        >
          {TABS.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${t.id}`}
                tabIndex={isActive ? 0 : -1}
                data-testid={`tab-${t.id}`}
                onClick={() => setTab(t.id)}
                data-active={isActive}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${
                  isActive ? "text-[color:var(--ink)]" : "text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 rounded-full bg-slate-100/90 border border-slate-200/60 shadow-sm"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-12 pt-6 pb-20 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            role="tabpanel"
            id={`tabpanel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            tabIndex={0}
            className="focus:outline-none"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === "overview" && <Overview insights={insights} dateRange={dateRange} />}
            {tab === "intake" && <DataIntake onUpload={openUpload} datasetInfo={datasetInfo} onReset={handleUploaded} />}
            {tab === "trends" && <Trends insights={insights} />}
            {tab === "inventory" && <Inventory refreshKey={refreshKey} />}
            {tab === "forecast" && <Forecast dateRange={dateRange} />}
            {tab === "reports" && <Reports />}
          </motion.div>
        </AnimatePresence>
      </div>

      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={handleUploaded}
        initialTab={uploadTab}
      />
    </div>
  );
}
