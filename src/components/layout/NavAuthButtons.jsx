"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "./LanguageSwitcher";
import { ArrowUpRight } from "lucide-react";

export default function NavAuthButtons({ isMobile = false, onActionClick }) {
  const { t } = useTranslation();

  if (isMobile) {
    return (
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
        <Link
          href="/reports/new"
          onClick={onActionClick}
          className="flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-[#F2FCE2] hover:bg-[#E5F9C9] rounded-xl border border-[#9ae600]/40 transition-colors"
        >
          <span>{t("nav.report")}</span>
          <span className="text-[10px] bg-[#9ae600] text-slate-950 font-black px-2 py-0.5 rounded-md">
            {t("nav.reportBadge")}
          </span>
        </Link>

        <div className="flex items-center justify-between px-1 py-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Language
          </span>
          <LanguageSwitcher />
        </div>

        <Link
          href="/login"
          onClick={onActionClick}
          className="w-full text-center py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
        >
          {t("nav.login")}
        </Link>

        <Link
          href="/register"
          onClick={onActionClick}
          className="inline-flex items-center justify-center gap-2.5 w-full py-2.5 bg-[#9ae600] hover:bg-[#88cc00] active:scale-95 text-slate-950 font-bold rounded-full text-sm tracking-tight transition-all duration-200 shadow-[0_0_20px_rgba(154,230,0,0.45)] group"
        >
          <span>{t("nav.register")}</span>
          <span className="w-6 h-6 rounded-full bg-slate-950 text-[#9ae600] flex items-center justify-center transition-transform duration-200 group-hover:rotate-45 shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-4 shrink-0">
      {/* Highlighted Report Item Badge Pill */}
      <Link
        href="/reports/new"
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-[#457300] bg-[#F2FCE2] hover:bg-[#E5F9C9] border border-[#9ae600]/40 rounded-xl transition-all hover:scale-[1.02] whitespace-nowrap shrink-0 shadow-2xs"
      >
        <span>{t("nav.report")}</span>
        <span className="bg-[#9ae600] text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md">
          {t("nav.reportBadge")}
        </span>
      </Link>

      <div className="h-4 w-px bg-slate-200 mx-0.5 shrink-0" />

      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Sign in text button */}
      <Link
        href="/login"
        className="text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors whitespace-nowrap"
      >
        {t("nav.login")}
      </Link>

      {/* Primary Action Button (Glowing pill with circular arrow badge) */}
      <Link
        href="/register"
        className="inline-flex items-center gap-2.5 bg-[#9ae600] hover:bg-[#88cc00] active:scale-95 text-slate-950 font-bold pl-4 sm:pl-5 pr-2 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm tracking-tight transition-all duration-200 shadow-[0_0_20px_rgba(154,230,0,0.45)] hover:shadow-[0_0_30px_rgba(154,230,0,0.7)] group shrink-0"
      >
        <span>{t("nav.register")}</span>
        <span className="w-6 h-6 rounded-full bg-slate-950 text-[#9ae600] flex items-center justify-center transition-transform duration-200 group-hover:rotate-45 shrink-0">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </Link>
    </div>
  );
}
