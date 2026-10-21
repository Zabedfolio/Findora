"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, Chip } from "@heroui/react";
import { format, isValid, parseISO } from "date-fns";
import { MapPin, Calendar, ImageOff, CheckCircle2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useLanguage } from "@/context/LanguageContext";

/**
 * ReportCard: a single lost/found listing, the whole card is a link.
 *
 * @param {Object} props
 * @param {Object} props.report
 * @param {string} props.report.id
 * @param {'lost' | 'found'} props.report.type
 * @param {string} props.report.title
 * @param {string} [props.report.description]
 * @param {string} props.report.category
 * @param {string} props.report.location
 * @param {string} props.report.date        ISO date string (falls back to dateRaw)
 * @param {string[]} [props.report.images]
 * @param {'lost' | 'found' | 'resolved'} [props.report.status]
 * @param {string} [props.className]
 */

function formatReportDate(report) {
  // Prefer a real date; demo data has relative strings in `date` and ISO in `dateRaw`.
  const candidates = [report.date, report.dateRaw];
  for (const value of candidates) {
    if (!value) continue;
    const parsed = typeof value === "string" ? parseISO(value) : new Date(value);
    if (isValid(parsed)) return format(parsed, "MMM d, yyyy");
  }
  return report.date || "";
}

export default function ReportCard({ report, className = "" }) {
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);

  if (!report) return null;

  // Support images[] (spec: strings or { url } objects) and legacy imageUrl
  const rawImage = Array.isArray(report.images) && report.images.length > 0 ? report.images[0] : null;
  const image = (typeof rawImage === "object" && rawImage !== null ? rawImage.url : rawImage) ?? report.imageUrl;
  const isResolved = report.status === "resolved";
  const reportId = report.id || report._id;
  const href = `/reports/${reportId}`;
  const dateLabel = formatReportDate(report);

  return (
    <Link
      href={href}
      aria-label={`${t("reports.viewDetails", "View details of")} ${report.title}`}
      className={`group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-[#9ae600] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${className}`}
    >
      <Card
        className="h-full p-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs group-hover:shadow-lg group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
      >
        {/* Card Media */}
        <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {image && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={report.title}
              onError={() => setImageError(true)}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                isResolved ? "grayscale" : ""
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80">
              <ImageOff className="w-10 h-10 mb-2 opacity-60" />
              <span className="text-xs font-medium">
                {t("reports.noPhoto", "No photo provided")}
              </span>
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-3 left-3 z-10">
            <StatusBadge status={report.type} />
          </div>

          {/* Resolved Overlay */}
          {isResolved && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px]">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-[#9ae600] text-sm font-bold tracking-wide shadow-lg border border-slate-200/60 dark:border-slate-700/60">
                <CheckCircle2 className="w-4 h-4" />
                {t("status.resolved", "Resolved")}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <Card.Content className="p-4 sm:p-5 flex-1">
          {/* Category Chip */}
          <div className="mb-2">
            <Chip
              size="sm"
              variant="soft"
              className="rounded-md text-[11px] font-semibold tracking-wide uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
            >
              {report.category || t("reports.general", "General")}
            </Chip>
          </div>

          {/* Title */}
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-slate-700 dark:group-hover:text-[#9ae600] transition-colors font-heading">
            {report.title}
          </h4>
        </Card.Content>

        {/* Footer: Location + Date */}
        <Card.Footer className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
            <span className="truncate">{report.location}</span>
          </div>

          {dateLabel && (
            <div className="flex items-center gap-1.5 shrink-0 text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <time dateTime={report.dateRaw || report.date}>{dateLabel}</time>
            </div>
          )}
        </Card.Footer>
      </Card>
    </Link>
  );
}