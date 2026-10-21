"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * TypeTabs component for switching between All, Lost, and Found listings.
 *
 * @param {Object} props
 * @param {{ all?: number, lost?: number, found?: number }} [props.counts] - Item counts for each tab
 * @param {string} [props.className] - Extra classes
 */
export default function TypeTabs({ counts = {}, className = "" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = (searchParams.get("type") || "all").toLowerCase();

  const handleTabChange = (type) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const tabs = [
    { id: "all", label: "All Items", count: counts.all },
    { id: "lost", label: "Lost Items", count: counts.lost },
    { id: "found", label: "Found Items", count: counts.found },
  ];

  return (
    <div
      className={`inline-flex items-center p-1 bg-slate-100 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-2xl ${className}`}
      role="tablist"
      aria-label="Listing Type Tabs"
    >
      {tabs.map((tab) => {
        const isActive = currentType === tab.id;
        const isLostTab = tab.id === "lost";
        const isFoundTab = tab.id === "found";

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? isLostTab
                  ? "bg-rose-500 text-white shadow-xs"
                  : isFoundTab
                  ? "bg-slate-900 text-white dark:bg-[#9ae600] dark:text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? isLostTab
                      ? "bg-white/20 text-white"
                      : isFoundTab
                      ? "bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-950"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    : "bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
