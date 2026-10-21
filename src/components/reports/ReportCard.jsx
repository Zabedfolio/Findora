"use client";

import React, { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { MapPin, Clock, ArrowUpRight, ImageOff } from "lucide-react";

/**
 * ReportCard component for displaying individual lost/found item listings.
 *
 * @param {Object} props
 * @param {Object} props.report
 * @param {string} props.report.id
 * @param {'lost' | 'found'} props.report.type
 * @param {string} props.report.title
 * @param {string} [props.report.description]
 * @param {string} props.report.category
 * @param {string} props.report.location
 * @param {string} props.report.date
 * @param {string} [props.report.imageUrl]
 * @param {string} [props.className]
 */
export default function ReportCard({ report, className = "" }) {
  const [imageError, setImageError] = useState(false);

  if (!report) return null;

  const isLost = report.type === "lost";
  const href = `/reports/${report.id}`;

  return (
    <article
      className={`group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Card Media Container */}
        <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {report.imageUrl && !imageError ? (
            <img
              src={report.imageUrl}
              alt={report.title}
              onError={() => setImageError(true)}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80">
              <ImageOff className="w-10 h-10 mb-2 opacity-60" />
              <span className="text-xs font-medium">No photo provided</span>
            </div>
          )}

          {/* Type Badge Overlay */}
          <div className="absolute top-3 left-3 z-10">
            <StatusBadge status={report.type} />
          </div>

          {/* Time Chip Overlay */}
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-slate-950/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 shadow-xs">
            <Clock className="w-3 h-3 text-slate-300" />
            <span>{report.date}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Category Chip */}
          <div className="mb-2">
            <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
              {report.category || "General"}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-slate-700 dark:group-hover:text-[#9ae600] transition-colors font-heading mb-1.5">
            {report.title}
          </h4>

          {/* Brief Description */}
          {report.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {report.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer: Location + Action */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/40 flex items-center justify-between gap-3 text-xs">
        {/* Location Info */}
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
          <span className="truncate">{report.location}</span>
        </div>

        {/* Action Link */}
        <Link
          href={href}
          className={`shrink-0 inline-flex items-center gap-1 font-semibold transition-colors ${
            isLost
              ? "text-rose-600 dark:text-rose-400 hover:text-rose-700"
              : "text-slate-900 dark:text-[#9ae600] hover:text-slate-700"
          }`}
          aria-label={`View details of ${report.title}`}
        >
          <span>Details</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}
