"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import StatusBadge from "@/components/ui/StatusBadge";
import { MapPin, Calendar, ArrowUpRight, Tag, AlertCircle, Eye } from "lucide-react";
import { lostReports } from "@/demo-data";

export default function RecentLostSection() {
  const { t, lang } = useLanguage();

  return (
    <section id="lost-items" className="py-20 lg:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>{t("home.lostSection.badge", "Active Community Searches")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight mb-3 font-heading">
              {lang === "bn" ? (
                <>
                  সাম্প্রতিক{" "}
                  <span className="bg-gradient-to-r from-rose-600 via-red-500 to-amber-600 bg-clip-text text-transparent">
                    হারানো আইটেমসমূহ
                  </span>
                </>
              ) : (
                <>
                  Recently{" "}
                  <span className="bg-gradient-to-r from-rose-600 via-red-500 to-amber-600 bg-clip-text text-transparent">
                    Lost Items
                  </span>
                </>
              )}
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              {t(
                "home.lostSection.subtitle",
                "Items reported missing by community members. Have you spotted any of these?"
              )}
            </p>
          </div>

          <Link
            href="/reports?type=lost"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-rose-50/50 border border-slate-200 text-slate-900 hover:text-rose-700 text-sm font-semibold shadow-xs hover:border-rose-300 transition-all group shrink-0 self-start md:self-auto"
          >
            <span>{t("home.lostSection.viewAll", "View All Lost Items")}</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {lostReports.map((report) => (
            <Link
              key={report.id}
              href={`/reports/${report.id}`}
              className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300"
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
                  <StatusBadge status="lost" />
                </div>

                {/* Category tag in top-right */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-950/80 backdrop-blur-xs text-white">
                    <Tag className="w-3 h-3 text-rose-400" />
                    <span>{report.category}</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-col flex-1 p-5">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1 mb-2 font-heading">
                  {report.title}
                </h3>

                {/* Location and Date */}
                <div className="mt-auto space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{report.date}</span>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="mt-3.5 pt-2.5 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-rose-600">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t("home.lostSection.action", "I Saw This")}</span>
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
