"use client";

import React from "react";
import { Skeleton } from "@heroui/react";

/**
 * Placeholder shaped like a ReportCard (image, badge, 2 text lines).
 * @param {number} count - number of skeleton cards to render in the grid
 * @param {string} className - extra classes for the grid wrapper
 */
export default function CardSkeleton({ count = 3, className = "" }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/80"
        >
          {/* Image block with badge in top-left */}
          <div className="relative aspect-16/10 w-full">
            <Skeleton className="h-full w-full rounded-none" />
            <Skeleton className="absolute top-3.5 left-3.5 h-6 w-16 rounded-full" />
          </div>

          {/* Text content */}
          <div className="flex flex-col gap-3 p-6">
            <Skeleton className="h-5 w-4/5 rounded-lg" />
            <Skeleton className="h-4 w-3/5 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}