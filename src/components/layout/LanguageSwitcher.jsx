"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  return (
    <div
      role="group"
      aria-label="Language selector"
      className="inline-flex items-center p-0.5 rounded-full bg-slate-100/80 border border-slate-200/80 shadow-xs backdrop-blur-xs text-xs font-medium"
    >
      <span className="sr-only">Choose language</span>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
          lang === "en"
            ? "bg-[#9ae600] text-slate-950 font-semibold shadow-xs"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("bn")}
        aria-pressed={lang === "bn"}
        className={`px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
          lang === "bn"
            ? "bg-[#9ae600] text-slate-950 font-semibold shadow-xs"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}
