"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import StatusBadge from "@/components/ui/StatusBadge";
import { MapPin, Calendar, ArrowUpRight, Tag, ShieldCheck } from "lucide-react";
import { foundReports } from "@/demo-data";

export default function RecentFoundSection() {
  const { t, lang } = useLanguage();

  return (
    <section id="found-items" className="py-20 lg:py-24 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9ae600]/20 border border-[#9ae600]/50 text-slate-950 text-xs sm:text-sm font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7bb800]" />
              <ShieldCheck className="w-3.5 h-3.5 text-[#7bb800]" />
              <span>{t("home.foundSection.badge", "Safe Custody & Storage")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight mb-3 font-heading">
              {lang === "bn" ? (
                <>
                  সাম্প্রতিক{" "}
                  <span className="bg-gradient-to-r from-emerald-600 via-[#7bb800] to-[#9ae600] bg-clip-text text-transparent">
                    প্রাপ্ত আইটেমসমূহ
                  </span>
                </>
              ) : (
                <>
                  Recently{" "}
                  <span className="bg-gradient-to-r from-emerald-600 via-[#7bb800] to-[#9ae600] bg-clip-text text-transparent">
                    Found Items
                  </span>
                </>
              )}
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              {t(
                "home.foundSection.subtitle",
                "Turned in by honest finders and waiting for verified owners to claim them safely."
              )}
            </p>
          </div>

          <Link
            href="/reports?type=found"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#9ae600]/15 border border-slate-200 text-slate-900 hover:text-slate-950 text-sm font-semibold shadow-xs hover:border-[#9ae600]/50 transition-all group shrink-0 self-start md:self-auto"
          >
            <span>{t("home.foundSection.viewAll", "View All Found Items")}</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {foundReports.map((report) => (
            <Link
              key={report.id}
              href={`/reports/${report.id}`}
              className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-[#9ae600]/60 hover:shadow-xl hover:shadow-[#9ae600]/10 transition-all duration-300"
            >
              {/* Media Container */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                <Image
                  src={report.imageUrl}
                  alt={report.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Status Badge in top-left */}
                <div className="absolute top-3 left-3 z-10">
                  <StatusBadge status="found" />
                </div>

                {/* Category tag in top-right */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-950/80 backdrop-blur-xs text-white">
                    <Tag className="w-3 h-3 text-[#9ae600]" />
                    <span>{report.category}</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-col flex-1 p-5">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#7bb800] transition-colors line-clamp-1 mb-2 font-heading">
                  {report.title}
                </h3>

                {/* Location and Date */}
                <div className="mt-auto space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#7bb800] shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{report.date}</span>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="mt-3.5 pt-2.5 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-[#7bb800]">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7bb800]" />
                    <span>{t("home.foundSection.action", "Claim Item")}</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
