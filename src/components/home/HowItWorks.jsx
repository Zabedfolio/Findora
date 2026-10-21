"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { 
  FileText, 
  ScanSearch, 
  ShieldQuestion, 
  UserCheck, 
  HeartHandshake 
} from "lucide-react";

export default function HowItWorks() {
  const { t, lang } = useLanguage();

  const steps = [
    {
      number: "01",
      icon: FileText,
      title: t("home.howItWorks.step1Title", "Report"),
      desc: t(
        "home.howItWorks.step1Desc",
        "Submit details, photos, and location of the lost or found item."
      ),
      accent: "from-blue-500/20 to-blue-500/5 text-blue-600",
    },
    {
      number: "02",
      icon: ScanSearch,
      title: t("home.howItWorks.step2Title", "Find Matches"),
      desc: t(
        "home.howItWorks.step2Desc",
        "Smart similarity matching connects matching listings in real-time."
      ),
      accent: "from-[#9ae600]/30 to-[#9ae600]/5 text-slate-950",
    },
    {
      number: "03",
      icon: ShieldQuestion,
      title: t("home.howItWorks.step3Title", "Submit Claim"),
      desc: t(
        "home.howItWorks.step3Desc",
        "Verify ownership by answering unique questions or sharing proof."
      ),
      accent: "from-amber-500/20 to-amber-500/5 text-amber-600",
    },
    {
      number: "04",
      icon: UserCheck,
      title: t("home.howItWorks.step4Title", "Verify"),
      desc: t(
        "home.howItWorks.step4Desc",
        "Finder confirms the claim through safe, private verification."
      ),
      accent: "from-indigo-500/20 to-indigo-500/5 text-indigo-600",
    },
    {
      number: "05",
      icon: HeartHandshake,
      title: t("home.howItWorks.step5Title", "Return"),
      desc: t(
        "home.howItWorks.step5Desc",
        "Coordinate a safe handover spot and mark the item reunited."
      ),
      accent: "from-emerald-500/20 to-emerald-500/5 text-emerald-600",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9ae600]/15 border border-[#9ae600]/30 text-slate-900 text-xs sm:text-sm font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7bb800]" />
            <span>{t("home.howItWorks.badge", "Simple & Transparent Process")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight mb-4">
            {lang === "bn" ? (
              <>
                <span className="bg-gradient-to-r from-emerald-600 via-[#7bb800] to-[#9ae600] bg-clip-text text-transparent">
                  ফাইন্ডোরা
                </span>{" "}
                যেভাবে কাজ করে
              </>
            ) : (
              <>
                How{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-[#7bb800] to-[#9ae600] bg-clip-text text-transparent">
                  Findora Works
                </span>
              </>
            )}
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            {t(
              "home.howItWorks.subtitle",
              "Five simple steps to reunite lost belongings with their rightful owners safely."
            )}
          </p>
        </div>

        {/* Steps Grid - Horizontal on Desktop, Vertical on Mobile */}
        <div className="relative">
          {/* Subtle horizontal connecting line on desktop */}
          <div 
            aria-hidden="true" 
            className="hidden lg:block absolute top-[52px] left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-slate-200 via-[#9ae600]/60 to-slate-200 -z-0" 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center lg:items-center text-center p-6 rounded-2xl bg-slate-50/60 border border-slate-100 hover:border-slate-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
                >
                  {/* Step Number & Icon badge */}
                  <div className="relative mb-5 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-center group-hover:scale-105 group-hover:border-[#9ae600] transition-all">
                      <Icon className="w-7 h-7 text-slate-800 group-hover:text-slate-950 transition-colors" />
                    </div>
                    <span className="absolute -top-2.5 -right-2.5 px-2 py-0.5 rounded-full bg-slate-950 text-white text-[11px] font-mono font-bold tracking-wider shadow-sm group-hover:bg-[#9ae600] group-hover:text-slate-950 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
