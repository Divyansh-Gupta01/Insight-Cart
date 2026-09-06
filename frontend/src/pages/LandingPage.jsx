import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login as apiLogin } from "@/lib/api";

import FloatingNavbar from "@/components/marketing/FloatingNavbar";
import HeroSection from "@/components/marketing/HeroSection";
import DataIngestionStream from "@/components/marketing/DataIngestionStream";
import RetailTimeline from "@/components/marketing/RetailTimeline";
import HowItWorks from "@/components/marketing/HowItWorks";
import KPISection from "@/components/marketing/KPISection";
import ForecastSection from "@/components/marketing/ForecastSection";
import InventoryRiskSection from "@/components/marketing/InventoryRiskSection";
import ActionableInsightsSection from "@/components/marketing/ActionableInsightsSection";
import DarkShowcase from "@/components/marketing/DarkShowcase";
import IntelligenceLoop from "@/components/marketing/IntelligenceLoop";
import ComparisonSection from "@/components/marketing/ComparisonSection";
import DashboardHeroSection from "@/components/marketing/DashboardHeroSection";
import FinalCTASection from "@/components/marketing/FinalCTASection";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AuthModal from "@/components/marketing/AuthModal";

export default function LandingPage() {
  const nav = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");

  const handleOpenAuth = (mode = "signin") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleInstantDemo = async () => {
    try {
      const res = await apiLogin("demo", "demo", true, true);
      localStorage.setItem("ci_token", res.token);
      localStorage.setItem("ci_user", JSON.stringify(res.user));
      toast.success("Instant demo access unlocked!");
      nav("/dashboard");
    } catch (e) {
      // Fallback if backend demo mode is offline: simulate local demo token to guarantee zero crashes
      localStorage.setItem("ci_token", "demo_token_instant_access");
      localStorage.setItem("ci_user", JSON.stringify({ username: "demo", store_name: "Fresh Foods Supermarket" }));
      toast.success("Demo dataset active");
      nav("/dashboard");
    }
  };

  const handleExploreDashboard = () => {
    const token = localStorage.getItem("ci_token");
    if (token) {
      nav("/dashboard");
    } else {
      handleInstantDemo();
    }
  };

  return (
    <div className="bg-editorial-shell bg-dot-matrix min-h-screen text-slate-900 selection:bg-emerald-600 selection:text-white relative">
      {/* Floating Navbar inspired by Fynza */}
      <FloatingNavbar
        onOpenAuth={() => handleOpenAuth("signin")}
        onInstantDemo={handleInstantDemo}
      />

      {/* Main Storytelling Narrative */}
      <main className="relative z-10">
        {/* 01. Hero with Floating Analytical Composition & Curved SVG Paths */}
        <HeroSection
          onInstantDemo={handleInstantDemo}
          onExploreDashboard={handleExploreDashboard}
        />

        {/* 01b. Retail Data Ingestion Stream (Exact Fynza 8-Channel Symmetrical Spine) */}
        <DataIngestionStream />

        {/* 02. The Problem & Central Retail Timeline Spine */}
        <RetailTimeline />

        {/* 03. How It Works (Large Numbered Cards 01, 02, 03, 04) */}
        <HowItWorks />

        {/* 04. KPI Intelligence Section ("Know Your Store At A Glance") */}
        <KPISection />

        {/* 05. 7-Day Demand Forecasting ("See What Comes Next") */}
        <ForecastSection />

        {/* 06. Inventory Risk & Shelf Matrix ("Know Before It Hurts") */}
        <InventoryRiskSection />

        {/* 07. Actionable Decision Engine ("Today's Retail Actions") */}
        <ActionableInsightsSection />

        {/* 08. Dark Product Showcase Container ("Built For Real Retail Decisions") */}
        <DarkShowcase
          onExploreDashboard={handleExploreDashboard}
        />

        {/* 09. The Circular Flywheel ("The Intelligence Loop") */}
        <IntelligenceLoop />

        {/* 10. Side-by-Side Comparison ("Spreadsheets vs Cart Insight") */}
        <ComparisonSection />

        {/* 11. Live Product UI Hero ("See Your Store Clearly") */}
        <DashboardHeroSection
          onExploreDashboard={handleExploreDashboard}
        />

        {/* 12. Final CTA with Floating Retail Badges */}
        <FinalCTASection
          onInstantDemo={handleInstantDemo}
          onOpenAuth={() => handleOpenAuth("signin")}
        />
      </main>

      {/* 13. Clean Structured Enterprise Footer */}
      <MarketingFooter
        onExploreDashboard={handleExploreDashboard}
      />

      {/* Complete Authentication Modal */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
