"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

/**
 * SortDropdown component for sorting listings by newest, oldest, or relevance.
 *
 * @param {Object} props
 * @param {string} [props.className] - Extra classes
 */
export default function SortDropdown({ className = "" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";
  const hasSearch = Boolean(searchParams.get("q"));

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "newest") {
      params.delete("sort"); // 'newest' is default
    } else {
      params.set("sort", newSort);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="relative flex items-center">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <ArrowUpDown className="w-3.5 h-3.5" />
        </span>

        <select
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          aria-label="Sort reports"
          className="appearance-none pl-8 pr-8 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-[#9ae600] focus:border-transparent shadow-xs cursor-pointer transition-all"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="relevance">
            Most Relevant {hasSearch ? "★" : ""}
          </option>
        </select>

        {/* Custom Chevron Indicator */}
        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
    </div>
  );
}
