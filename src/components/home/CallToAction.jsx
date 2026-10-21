"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowUpRight, ShieldCheck, HeartHandshake } from "lucide-react";

export default function CallToAction() {
  const { t, lang } = useLanguage();

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-16 sm:px-12 sm:py-20 lg:px-20 lg:py-24 text-center shadow-2xl">
          {/* Ambient Glowing Green Mesh & Blur Background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-[#9ae600]/25 via-emerald-500/20 to-[#9ae600]/15 blur-3xl rounded-full" />
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs sm:text-sm font-medium mb-6">
              <span className="h-2 w-2 rounded-full bg-[#9ae600] animate-pulse" />
              <span>{t("home.cta.badge", "Join the Network")}</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
              {lang === "bn" ? (
                <>
                  এমন একটি কমিউনিটির অংশ হোন যা{" "}
                  <span className="bg-gradient-to-r from-[#9ae600] via-lime-300 to-emerald-400 bg-clip-text text-transparent">
                    পরস্পরকে সহায়তা করে
                  </span>
                </>
              ) : (
                <>
                  Be Part of a Community That{" "}
                  <span className="bg-gradient-to-r from-[#9ae600] via-lime-300 to-emerald-400 bg-clip-text text-transparent">
                    Helps Each Other
                  </span>
                </>
              )}
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
              {t(
                "home.cta.subtitle",
                "Create an account in seconds to report items, receive match notifications, and help neighbours recover what they treasure."
              )}
            </p>

            {/* Dual CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#9ae600] hover:bg-[#8fd800] text-slate-950 font-bold text-base shadow-xl shadow-[#9ae600]/30 hover:shadow-2xl hover:shadow-[#9ae600]/40 active:scale-[0.98] transition-all group"
              >
                <span>{t("home.cta.button", "Create Free Account")}</span>
                <ArrowUpRight className="w-5 h-5 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              <Link
                href="/reports"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-base border border-white/15 backdrop-blur-sm transition-all"
              >
                <span>Browse Reports</span>
              </Link>
            </div>

            {/* Micro assurances */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#9ae600]" />
                <span>Verified community members</span>
              </div>
              <span className="hidden sm:inline text-slate-600">•</span>
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-[#9ae600]" />
                <span>Free forever for standard users</span>
              </div>
              <span className="hidden sm:inline text-slate-600">•</span>
              <div>
                <span>Instant match notifications</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
