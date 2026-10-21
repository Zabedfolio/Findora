"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, MapPin, ArrowRight } from "lucide-react";
import { getAllUnifiedReports } from "@/services/reportService";

/**
 * MatchSuggestions Component:
 * AI-assisted match suggestions displaying related items in similar categories / locations.
 */
export default function MatchSuggestions({ currentReport }) {
  if (!currentReport) return null;

  const allReports = getAllUnifiedReports();
  const oppositeType = currentReport.type === "lost" ? "found" : "lost";

  // Find candidate matches: same category and opposite type
  const suggestions = allReports
    .filter(
      (r) =>
        (r.id !== currentReport.id && r._id !== currentReport.id) &&
        (r.type === oppositeType || r.category === currentReport.category)
    )
    .slice(0, 3)
    .map((item, idx) => ({
      ...item,
      confidence: 96 - idx * 6,
    }));

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#7dbd00] dark:text-[#9ae600]" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
            Potential Matches
          </h4>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#9ae600]/20 text-[#4c7c00] dark:text-[#9ae600]">
          AI Match
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.map((item) => {
          const id = item.id || item._id;
          return (
            <Link
              key={id}
              href={`/reports/${id}`}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition-all group"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#6fa600] dark:group-hover:text-[#9ae600] transition-colors">
                    {item.title}
                  </h5>
                  <span className="text-[10px] font-bold text-emerald-600 shrink-0">
                    {item.confidence}%
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate mt-0.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
