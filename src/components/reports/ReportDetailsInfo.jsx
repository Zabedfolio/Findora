"use client";

import React from "react";
import {
  Calendar,
  MapPin,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
} from "lucide-react";

/**
 * ReportDetailsInfo Component:
 * Displays title, metadata attributes, location, full description,
 * item current status, and safety tips for claiming.
 */
export default function ReportDetailsInfo({ report }) {
  if (!report) return null;

  const isFound = report.type === "found";
  const formattedDate = report.dateRaw
    ? new Date(report.dateRaw).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : report.date || "Recently";

  return (
    <div className="space-y-6">
      {/* Title & Date */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white font-heading tracking-tight leading-tight">
          {report.title}
        </h1>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {isFound ? "Found on" : "Lost on"}: <strong>{formattedDate}</strong>
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{report.location}</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-slate-400" />
            <span>{report.category}</span>
          </div>
        </div>
      </div>

      {/* "Where is the item now?" Highlight Box (For Found Items) */}
      {isFound && report.itemCurrentLocation && (
        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Current Location of Item
            </h4>
            <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100 mt-0.5">
              {report.itemCurrentLocation}
            </p>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
          Detailed Description
        </h3>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {report.description}
          </p>
        </div>
      </div>

      {/* Safety & Verification Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-[#6fa600] dark:text-[#9ae600] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
            Findora Safe Handover Guarantee
          </strong>
          Always arrange handovers in well-lit, public locations (e.g. metro stations, shopping malls). Never send money or sensitive passwords before receiving verified proof.
        </div>
      </div>
    </div>
  );
}
