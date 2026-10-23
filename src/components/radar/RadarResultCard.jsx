"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, Calendar, CheckCircle2, ShieldCheck, Tag } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

export default function RadarResultCard({ matchItem, rank }) {
  const { report, score, confidenceTier, reasons } = matchItem;

  // Determine accent color and badge based on confidence tier
  const isHighMatch = score >= 80;
  const isMedMatch = score >= 60 && score < 80;

  const scoreBadgeBg = isHighMatch
    ? "bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] border-[#9ae600]/40 shadow-[0_0_15px_rgba(154,230,0,0.25)]"
    : isMedMatch
    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
    : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30";

  return (
    <div
      className="radar-card-entry group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:border-[#9ae600]/50 hover:-translate-y-1 flex flex-col justify-between"
    >
      {/* Top Header: Rank, Type Badge, and Confidence Score */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-950 text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
              #{rank}
            </span>
            <StatusBadge status={report.type} />
          </div>

          {/* Match Score Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${scoreBadgeBg}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{score}% MATCH</span>
          </div>
        </div>

        {/* Card Body: Image & Details */}
        <div className="flex gap-4 items-start">
          {/* Image Thumbnail */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-750 shrink-0">
            {report.image ? (
              <img
                src={report.image}
                alt={report.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px] p-2 text-center">
                <Tag className="w-6 h-6 mb-1 opacity-40" />
                <span>No Photo</span>
              </div>
            )}
          </div>

          {/* Information */}
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#72a800] dark:group-hover:text-[#9ae600] transition-colors">
              {report.title}
            </h4>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
              {report.description}
            </p>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-2.5">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[140px]">{report.location}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{report.date || "Recently"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Why this is a match breakdown reasons */}
        {reasons && reasons.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Confidence Signals
            </p>
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((reason, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#72a800] dark:text-[#9ae600]" />
                  <span>{reason}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-3 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Ref: #{report.id}
        </span>

        <Link
          href={`/reports/${report.id}`}
          className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm group/btn"
        >
          <span>Inspect Match</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}
