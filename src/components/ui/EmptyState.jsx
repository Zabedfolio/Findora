"use client";

import React from "react";
import Link from "next/link";
import { PackageOpen, ArrowRight } from "lucide-react";

/**
 * Friendly EmptyState component for lists and search results with no data
 *
 * @param {Object} props
 * @param {React.ElementType} [props.icon] - Lucide icon component
 * @param {string} [props.title] - Header message
 * @param {string} [props.description] - Subtitle explanation
 * @param {string} [props.actionLabel] - Primary action button text
 * @param {string} [props.actionHref] - Primary action link URL
 * @param {() => void} [props.onAction] - Primary action click handler
 * @param {string} [props.secondaryActionLabel] - Secondary action button text
 * @param {string} [props.secondaryActionHref] - Secondary action link URL
 * @param {string} [props.className] - Extra wrapper classes
 */
export default function EmptyState({
  icon: Icon = PackageOpen,
  title = "No results found",
  description = "We couldn't find any reports matching your criteria. Try adjusting your search or filters.",
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs ${className}`}
    >
      {/* Icon with glowing ring */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-5 shadow-inner">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
      </div>

      {/* Headings */}
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 font-heading tracking-tight">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && (
          actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#9ae600] dark:hover:bg-[#88cc00] dark:text-slate-950 transition-all duration-200 shadow-sm hover:shadow"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#9ae600] dark:hover:bg-[#88cc00] dark:text-slate-950 transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
            >
              <span>{actionLabel}</span>
            </button>
          )
        )}

        {secondaryActionLabel && secondaryActionHref && (
          <Link
            href={secondaryActionHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
          >
            <span>{secondaryActionLabel}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
