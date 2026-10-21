"use client";

import React from "react";

/**
 * CardSkeleton component for loading states in report grids
 * @param {Object} props
 * @param {number} [props.count=8] - Number of skeleton cards to render
 * @param {string} [props.className] - Optional custom grid container classes
 */
export default function CardSkeleton({ count = 8, className = "" }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {items.map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs overflow-hidden animate-pulse flex flex-col justify-between"
        >
          <div>
            {/* Image Placeholder */}
            <div className="w-full aspect-[4/3] rounded-xl bg-slate-200 dark:bg-slate-800 mb-4" />

            {/* Badges Line */}
            <div className="flex items-center justify-between mb-3">
              <div className="w-16 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="w-20 h-4 rounded bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Title Line */}
            <div className="w-3/4 h-5 rounded bg-slate-200 dark:bg-slate-800 mb-2" />
            <div className="w-1/2 h-4 rounded bg-slate-200 dark:bg-slate-800 mb-4" />
          </div>

          {/* Location Line */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="w-32 h-4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-12 h-4 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
