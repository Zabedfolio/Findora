"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "./LanguageSwitcher";

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
          className="btn-primary-glow w-full text-center py-2.5 text-sm font-bold text-slate-950 rounded-xl"
        >
          {t("nav.register")}
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

      {/* Primary Action Glow Button */}
      <Link
        href="/register"
        className="btn-primary-glow px-4 sm:px-5 py-2 rounded-xl text-sm font-bold text-slate-950 tracking-tight whitespace-nowrap inline-flex items-center justify-center cursor-pointer"
      >
        {t("nav.register")}
      </Link>
    </div>
  );
}
