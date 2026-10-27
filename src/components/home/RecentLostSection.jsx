"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import StatusBadge from "@/components/ui/StatusBadge";
import { MapPin, Calendar, ArrowUpRight, Tag, AlertCircle, Eye } from "lucide-react";

export default function RecentLostSection() {
  const { t, lang } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLost = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBase}/items?type=lost&limit=4&status=active`);
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json?.data) ? json.data : [];
          if (isMounted) {
            setReports(items);
          }
        }
      } catch (err) {
        console.error("Failed to fetch recent lost items:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLost();
    return () => {
      isMounted = false;
    };
  }, []);

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

        {/* 4 Cards Grid / Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex flex-col bg-slate-50/50 rounded-3xl overflow-hidden border border-slate-200 animate-pulse"
              >
                <div className="aspect-4/3 w-full bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="h-3 bg-slate-200 rounded-md w-2/3" />
                    <div className="h-3 bg-slate-200 rounded-md w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 border border-dashed border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No active lost reports found right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reports.map((report) => {
              const reportId = report._id || report.id;
              const img = (report.images && report.images[0]) || report.imageUrl || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80";
              const formattedDate = report.date ? new Date(report.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Recently";

              return (
                <Link
                  key={reportId}
                  href={`/reports/${reportId}`}
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300"
                >
                  {/* Media Container */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={img}
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
                    {report.category && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-950/80 backdrop-blur-xs text-white">
                          <Tag className="w-3 h-3 text-rose-400" />
                          <span>{report.category}</span>
                        </span>
                      </div>
                    )}
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
                        <span className="truncate">{report.location || "Dhaka, Bangladesh"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formattedDate}</span>
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
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
