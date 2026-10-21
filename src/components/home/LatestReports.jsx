"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import StatusBadge from "@/components/ui/StatusBadge";
import { MapPin, Calendar, ArrowUpRight, Tag } from "lucide-react";

export default function LatestReports() {
  const { t, lang } = useLanguage();

  const sampleReports = [
    {
      id: "rep-1",
      title: "Apple iPhone 15 Pro (Natural Titanium)",
      type: "lost",
      category: "Electronics",
      location: "Dhanmondi Lake Park, Dhaka",
      date: "2 hours ago",
      imageUrl:
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rep-2",
      title: "Black Leather Bifold Wallet with National ID",
      type: "found",
      category: "Personal Accessories",
      location: "City Center Metro Station, Gulshan",
      date: "5 hours ago",
      imageUrl:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rep-3",
      title: "Toyota Smart Key with Blue Leather Fob",
      type: "found",
      category: "Keys & Security",
      location: "Banani 11 Shopping Area",
      date: "Yesterday",
      imageUrl:
        "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rep-4",
      title: "Golden Retriever Puppy with Red Tag ('Max')",
      type: "lost",
      category: "Pets & Animals",
      location: "Uttara Sector 7, Lake View",
      date: "1 day ago",
      imageUrl:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rep-5",
      title: "Apple AirPods Pro 2 Case (Engraved with 'Z')",
      type: "found",
      category: "Electronics",
      location: "Coffee Shop, Bashundhara R/A",
      date: "2 days ago",
      imageUrl:
        "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rep-6",
      title: "North Face Borealis Backpack (Charcoal Grey)",
      type: "lost",
      category: "Bags & Luggage",
      location: "Mohakhali Wireless Gate Bus Stop",
      date: "3 days ago",
      imageUrl:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section id="latest-reports" className="py-20 lg:py-28 bg-slate-50/60 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9ae600]" />
              <span>{t("home.latest.badge", "Community Activity")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight mb-3">
              {lang === "bn" ? (
                <>
                  সাম্প্রতিক{" "}
                  <span className="bg-gradient-to-r from-emerald-600 via-[#7bb800] to-[#9ae600] bg-clip-text text-transparent">
                    হারানো ও প্রাপ্ত
                  </span>{" "}
                  আইটেমসমূহ
                </>
              ) : (
                <>
                  Latest{" "}
                  <span className="bg-gradient-to-r from-emerald-600 via-[#7bb800] to-[#9ae600] bg-clip-text text-transparent">
                    Lost &amp; Found
                  </span>{" "}
                  Items
                </>
              )}
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              {t(
                "home.latest.subtitle",
                "Recently reported items across your local area. Spot something that belongs to you?"
              )}
            </p>
          </div>

          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200/90 text-slate-900 text-sm font-semibold shadow-xs hover:shadow-sm transition-all group shrink-0 self-start md:self-auto"
          >
            <span>{t("home.latest.viewAll", "View All Reports")}</span>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {sampleReports.map((report) => (
            <Link
              key={report.id}
              href={`/reports/${report.id}`}
              className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300"
            >
              {/* Media Container */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                <Image
                  src={report.imageUrl}
                  alt={report.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Status Badge in top-left corner */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <StatusBadge status={report.type} />
                </div>

                {/* Category tag in top-right */}
                <div className="absolute top-3.5 right-3.5 z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900/80 backdrop-blur-xs text-white">
                    <Tag className="w-3 h-3 text-[#9ae600]" />
                    <span>{report.category}</span>
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 p-6">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#7bb800] transition-colors line-clamp-1 mb-2">
                  {report.title}
                </h3>

                {/* Location and Date */}
                <div className="mt-auto space-y-2 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{report.date}</span>
                  </div>
                </div>

                {/* Card footer CTA */}
                <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-[#7bb800]">
                  <span>View Details</span>
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
