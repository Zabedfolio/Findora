"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import NavAuthButtons from "./NavAuthButtons";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/reports", label: t("nav.browse") },
    { href: "/categories", label: t("nav.categories") },
    { href: "/how-it-works", label: t("nav.howItWorks") },
    { href: "/trust", label: t("nav.trust") },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-200 border-b ${
        isScrolled ? "border-slate-200 shadow-xs" : "border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo + Nav Links (Lendora style) */}
          <div className="flex items-center gap-8 lg:gap-10">
            {/* Logo with vibrant green background and black logo inside */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0 group focus:outline-hidden"
              aria-label="Findora Home"
            >
              <img
                src="/findora-icon.png"
                alt="Findora"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-xl shadow-[0_2px_10px_rgba(154,230,0,0.35)] transition-transform group-hover:scale-105 shrink-0"
              />
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Findora
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-slate-500">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors whitespace-nowrap ${
                      isActive ? "text-slate-950 font-semibold" : "hover:text-slate-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Elements (Desktop) */}
          <NavAuthButtons />

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/register"
              className="btn-primary-glow px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950"
            >
              {t("nav.register")}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-5 pt-3 pb-6 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 transition-colors ${
                    isActive ? "text-slate-950 font-semibold" : "hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <NavAuthButtons isMobile onActionClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
