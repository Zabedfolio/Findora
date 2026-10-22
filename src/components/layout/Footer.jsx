"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer
      role="contentinfo"
      className="relative w-full bg-[#050703] text-white pt-16 md:pt-24 pb-0 overflow-hidden"
    >
      {/* 1. Ambient Background Layer: Orbital Rings & Bottom #9ae600 Dome Glow */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Top-to-bottom subtle gradient mask */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050703]/80 to-[#050703]" />

        {/* Concentric Thin Orbital Wireframe Rings */}
        <svg
          className="absolute left-1/2 -bottom-24 -translate-x-1/2 w-[1100px] h-[750px] opacity-25"
          viewBox="0 0 1100 750"
          fill="none"
        >
          <circle
            cx="550"
            cy="750"
            r="380"
            stroke="rgba(154, 230, 0, 0.4)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <circle
            cx="550"
            cy="750"
            r="540"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
          />
          <circle
            cx="550"
            cy="750"
            r="700"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
          {/* Subtle node indicator dots on orbits */}
          <circle cx="280" cy="500" r="3.5" fill="#9ae600" opacity="0.8" />
          <circle cx="820" cy="500" r="3.5" fill="#9ae600" opacity="0.8" />
        </svg>

        {/* Luminous Bottom #9ae600 Glow Dome */}
        <div
          className="absolute -bottom-36 left-1/2 -translate-x-1/2 w-[720px] sm:w-[950px] md:w-[1200px] h-[450px] rounded-t-full opacity-85 blur-[90px]"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(154, 230, 0, 0.55) 0%, rgba(154, 230, 0, 0.28) 35%, rgba(68, 107, 0, 0.12) 65%, transparent 85%)",
          }}
        />

        {/* Subtle upper glow aura under email */}
        <div
          className="absolute top-12 left-28 w-[380px] h-[180px] rounded-full opacity-35 blur-[75px]"
          style={{
            background: "radial-gradient(circle, rgba(154, 230, 0, 0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 2. Top Header Row: "Let's collaborate! Say hi" + Big Email + Action Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-white/10">
          <div className="flex flex-col">
            <span className="text-slate-400 text-sm sm:text-base font-medium mb-1">
              {t("footer.sayHi")}
            </span>
            <a
              href="mailto:hello@findora.app"
              className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-[#f4ffe0] to-[#9ae600] bg-clip-text text-transparent hover:opacity-90 transition-opacity inline-block drop-shadow-[0_4px_30px_rgba(154,230,0,0.2)]"
            >
              {t("footer.email")}
            </a>
          </div>

          <div className="shrink-0">
            <Link
              href="/reports/new"
              className="inline-flex items-center gap-3 bg-[#9ae600] hover:bg-[#88cc00] active:scale-95 text-slate-950 font-bold px-6 py-3 rounded-full text-sm sm:text-base transition-all duration-200 shadow-[0_0_25px_rgba(154,230,0,0.35)] hover:shadow-[0_0_35px_rgba(154,230,0,0.6)] group"
            >
              <span>{t("footer.ctaTop")}</span>
              <span className="w-6 h-6 rounded-full bg-slate-950 text-[#9ae600] flex items-center justify-center transition-transform duration-200 group-hover:rotate-45">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>

        {/* 3. Middle Columns Grid */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Column 1: Brand Info & Company Deck Pill (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-6">
            <div className="flex items-center gap-3.5 mb-1">
              <img
                src="/findora-logo-clean.png"
                alt="Findora Logo"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_22px_rgba(154,230,0,0.45)] shrink-0 transition-transform duration-300 hover:scale-105"
              />
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  findora
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-400">
                  &reg;
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-3.5 mb-6 max-w-sm">
              {t("footer.description")}
            </p>

            {/* Deck / Guidelines Pill Button */}
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#9ae600]/40 rounded-full px-4 py-2.5 transition-all group shadow-xs"
            >
              <div className="w-7 h-7 rounded-full bg-[#9ae600] text-slate-950 flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white group-hover:text-[#9ae600] transition-colors leading-tight">
                  {t("footer.deckTitle")}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-tight">
                  {t("footer.deckSub")}
                </span>
              </div>
            </Link>
          </div>

          {/* Column 2: Quick Links & Follow Us (lg:col-span-2) */}
          <div className="lg:col-span-2 flex flex-col space-y-8">
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-3.5 tracking-tight">
                {t("footer.quickLinks")}
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    {t("footer.home")}
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    {t("footer.aboutUs")}
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="hover:text-white transition-colors">
                    {t("footer.browse")}
                  </Link>
                </li>
                <li>
                  <Link href="/match-radar" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <span>{t("nav.matchRadar", "Match Radar")}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9ae600]" />
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-3.5 tracking-tight">
                {t("footer.followUs")}
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
                <li>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Twitter / X
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Services & Reviews/Trust (lg:col-span-2) */}
          <div className="lg:col-span-2 flex flex-col space-y-8">
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-3.5 tracking-tight">
                {t("footer.features")}
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
                <li>
                  <Link href="/reports?type=lost" className="hover:text-white transition-colors">
                    {t("footer.lostReports")}
                  </Link>
                </li>
                <li>
                  <Link href="/reports?type=found" className="hover:text-white transition-colors">
                    {t("footer.foundReports")}
                  </Link>
                </li>
                <li>
                  <Link href="/trust" className="hover:text-white transition-colors">
                    {t("footer.safeHandover")}
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="hover:text-white transition-colors">
                    {t("footer.aiMatch")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-3.5 tracking-tight">
                {t("footer.trust")}
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
                <li>
                  <Link href="/trust" className="hover:text-white transition-colors">
                    {t("footer.safety")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    {t("footer.communityRules")}
                  </Link>
                </li>
                <li>
                  <Link href="/trust" className="hover:text-white transition-colors">
                    {t("footer.verification")}
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-white transition-colors">
                    {t("footer.faqs")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: Contact (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <h3 className="text-white font-semibold text-sm sm:text-base mb-1 tracking-tight">
              {t("footer.contact")}
            </h3>

            {/* Dhaka Contact Block */}
            <div className="space-y-1">
              <a
                href="tel:+8801618599106"
                className="text-sm sm:text-base font-bold text-white hover:text-[#9ae600] transition-colors inline-block"
              >
                {t("footer.phone1")}
              </a>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t("footer.addr1")}
              </p>
            </div>

            {/* Global Contact Block */}
            <div className="space-y-1">
              <a
                href="tel:+16038422765"
                className="text-sm sm:text-base font-bold text-white hover:text-[#9ae600] transition-colors inline-block"
              >
                {t("footer.phone2")}
              </a>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t("footer.addr2")}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Bottom Row: Flags, Copyright & Legal Policies */}
        <div className="pt-8 pb-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">🇺🇸 🇧🇩</span>
            <span className="text-[#9ae600]">✦</span>
            <span>
              {t("footer.copyright")} &copy; {currentYear}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/terms" className="hover:text-white transition-colors">
              {t("footer.paymentPolicy")}
            </Link>
            <span className="text-[#9ae600]">✦</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Massive Watermark Typography at Bottom Edge */}
      <div className="relative w-full overflow-hidden flex items-end justify-center pointer-events-none select-none -mb-6 sm:-mb-10 md:-mb-14 pt-4">
        <span
          className="text-[17vw] font-black tracking-tight leading-none text-center bg-gradient-to-t from-white/35 via-white/15 to-transparent bg-clip-text text-transparent"
          style={{
            textShadow: "0 0 80px rgba(154, 230, 0, 0.4)",
            filter: "drop-shadow(0 0 40px rgba(154, 230, 0, 0.25))",
          }}
        >
          findora&reg;
        </span>
      </div>
    </footer>
  );
}
