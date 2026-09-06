import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X, Sparkles, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FloatingNavbar({ onOpenAuth, onInstantDemo }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "The Problem", href: "#problem" },
    { label: "Timeline", href: "#timeline" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "KPIs", href: "#kpis" },
    { label: "Forecast", href: "#forecast" },
    { label: "Inventory", href: "#inventory" },
    { label: "Engine", href: "#engine" },
    { label: "Live UI", href: "#dashboard-preview" },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDashboardClick = () => {
    const token = localStorage.getItem("ci_token");
    if (token) {
      nav("/dashboard");
    } else if (onInstantDemo) {
      onInstantDemo();
    } else {
      nav("/dashboard");
    }
  };

  return (
    <>
      <header className="fixed top-4 sm:top-6 inset-x-0 z-50 px-4 sm:px-8 flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto w-full max-w-[1280px] rounded-full transition-all duration-300 ${
            scrolled
              ? "bg-white shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12)] border border-slate-200/90 py-2 px-4 sm:px-6"
              : "bg-white/95 backdrop-blur-sm shadow-[0_8px_24px_-4px_rgba(15,23,42,0.06)] border border-slate-200/70 py-3 px-4 sm:px-6 lg:px-7"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            {/* Logo brand */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-3 text-slate-900 group shrink-0"
            >
              {/* Halftone / dot matrix logo icon inspired by Fynza */}
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
                <div className="grid grid-cols-3 gap-0.5 w-full h-full">
                  <div className="bg-emerald-600 rounded-[1px] opacity-100" />
                  <div className="bg-emerald-600 rounded-[1px] opacity-80" />
                  <div className="bg-emerald-600 rounded-[1px] opacity-60" />
                  <div className="bg-emerald-600 rounded-[1px] opacity-80" />
                  <div className="bg-emerald-500 rounded-[1px] opacity-100" />
                  <div className="bg-emerald-600 rounded-[1px] opacity-70" />
                  <div className="bg-emerald-600 rounded-[1px] opacity-40" />
                  <div className="bg-emerald-600 rounded-[1px] opacity-70" />
                  <div className="bg-emerald-400 rounded-[1px] opacity-100" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-lg tracking-tight font-black leading-none text-slate-900">
                  CART <span className="text-emerald-700">INSIGHT</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-slate-400 font-semibold leading-tight">
                  Retail Intelligence
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink-0">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-2.5 xl:px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right CTAs */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onInstantDemo}
                className="hidden sm:inline-flex lg:hidden xl:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                title="Instant Demo with pre-loaded retail dataset"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="whitespace-nowrap">Instant Demo</span>
              </button>

              <button
                onClick={handleDashboardClick}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-sm shadow-emerald-700/20 transition-all whitespace-nowrap shrink-0"
              >
                <LayoutDashboard className="w-3.5 h-3.5 hidden sm:block shrink-0" />
                <span className="whitespace-nowrap">Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>

              {/* Mobile toggle button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 inset-x-4 z-40 p-5 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl lg:hidden flex flex-col gap-2"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="hair-divider my-2" />
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onInstantDemo && onInstantDemo();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Instant Demo Access
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleDashboardClick();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-700/20"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
