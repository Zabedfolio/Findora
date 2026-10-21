"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Search, 
  ArrowUpRight, 
  MapPin, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from "lucide-react";

import HeroMatchShowcase from "./HeroMatchShowcase";

export default function Hero() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/reports?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/reports");
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 lg:pt-24 lg:pb-32 bg-white">
      {/* Ambient background glow & crisp dot grid like screenshot */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Luminous lime center aura */}
        <div className="absolute top-10 sm:top-14 left-1/2 -translate-x-1/2 w-[650px] sm:w-[850px] h-[450px] sm:h-[550px] bg-gradient-to-b from-[#9ae600]/30 via-[#9ae600]/15 to-transparent blur-[110px] rounded-full" />
        
        {/* Soft secondary emerald glow */}
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-emerald-200/25 blur-[120px] rounded-full" />

        {/* Crisp, clearly visible dot grid matching screenshot */}
        <div 
          className="absolute inset-0 bg-[radial-gradient(rgba(100,116,139,0.22)_1.5px,transparent_1.5px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_85%_75%_at_50%_35%,#000_75%,transparent_100%)]" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Professional Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-slate-200/90 bg-white/95 backdrop-blur-xs text-xs sm:text-sm text-slate-800 shadow-xs mb-8 hover:border-slate-300 transition-all">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9ae600] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7bb800]"></span>
            </span>
            <span className="font-semibold text-slate-900 tracking-tight">
              {t("home.hero.badge", "Intelligent Lost & Found Network")}
            </span>
          </div>

          {/* Main Headline with Highlight Gradient */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.12] mb-6">
            {lang === "bn" ? (
              <>
                বিশ্বাস ও নিরাপত্তার সাথে{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-[#7bb800] to-[#9ae600] bg-clip-text text-transparent">
                  হারানো জিনিস পুনরুদ্ধার
                </span>{" "}
                এর আধুনিক প্ল্যাটফর্ম
              </>
            ) : (
              <>
                Reuniting{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-[#7bb800] to-[#9ae600] bg-clip-text text-transparent">
                  Lost Belongings
                </span>{" "}
                with Speed, Trust &amp; Security
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed mb-10">
            {t(
              "home.hero.subtitle",
              "Findora connects people who lost items with honest finders through AI matching, secure proof verification, and safe local handovers."
            )}
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-12">
            {/* I Lost Something Button */}
            <Link
              href="/reports/new?type=lost"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white text-base font-semibold shadow-lg shadow-slate-950/15 hover:shadow-xl hover:shadow-slate-950/20 active:scale-[0.98] transition-all group"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 group-hover:rotate-12 transition-transform" />
              <span>{t("home.hero.lostBtn", "I Lost Something")}</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            {/* I Found Something Button (Theme Glowing) */}
            <Link
              href="/reports/new?type=found"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#9ae600] hover:bg-[#8fd800] text-slate-950 text-base font-bold shadow-lg shadow-[#9ae600]/30 hover:shadow-xl hover:shadow-[#9ae600]/40 active:scale-[0.98] transition-all group"
            >
              <CheckCircle2 className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>{t("home.hero.foundBtn", "I Found Something")}</span>
              <ArrowUpRight className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Interactive Search Bar */}
          <div className="w-full max-w-2xl">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-[#9ae600] focus-within:ring-4 focus-within:ring-[#9ae600]/20 rounded-full shadow-lg shadow-slate-200/50 p-1.5 transition-all"
            >
              <div className="pl-4 pr-2 text-slate-400 flex items-center pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  "home.hero.searchPlaceholder",
                  "Search by item name, model, color, or location..."
                )}
                className="w-full py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent outline-hidden"
              />
              <button
                type="submit"
                className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-sm font-medium transition-colors shadow-sm"
              >
                <span>{t("home.hero.searchBtn", "Search Items")}</span>
              </button>
            </form>
          </div>

          {/* Trust badges below search */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-[#7bb800] font-bold text-sm">✓</span>
              <span>Verified Claims</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#7bb800] font-bold text-sm">✓</span>
              <span>Privacy-First Handover</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#7bb800] font-bold text-sm">✓</span>
              <span>100% Free for Community</span>
            </div>
          </div>
        </div>

        {/* Real-time Match Card Showcase */}
        <HeroMatchShowcase />
      </div>
    </section>
  );
}
