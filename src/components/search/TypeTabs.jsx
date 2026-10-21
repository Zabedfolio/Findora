"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Layers } from "lucide-react";

/**
 * Modern TypeTabs component for switching between All, Lost, and Found listings.
 * Designed with high-contrast pills, status indicator dots, and readable count badges.
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
    {
      id: "all",
      label: "All Items",
      count: counts.all,
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: "lost",
      label: "Lost Items",
      count: counts.lost,
      dot: "bg-rose-500 animate-pulse",
    },
    {
      id: "found",
      label: "Found Items",
      count: counts.found,
      dot: "bg-emerald-500",
    },
  ];

  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1.5 bg-slate-100/80 dark:bg-slate-900 border border-slate-100 rounded-xl sm:rounded-2xl shadow-xs ${className}`}
      role="tablist"
      aria-label="Listing Type Tabs"
    >
      {tabs.map((tab) => {
        const isActive = currentType === tab.id;

        // Custom style schemes based on tab type and active state (no borders)
        let activeStyles = "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white";
        let countStyles = "bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200";

        if (isActive) {
          if (tab.id === "lost") {
            activeStyles =
              "bg-rose-50 text-rose-700 shadow-sm dark:bg-rose-950/80 dark:text-rose-200";
            countStyles =
              "bg-rose-100 text-rose-800 dark:bg-rose-900/90 dark:text-rose-100";
          } else if (tab.id === "found") {
            activeStyles =
              "bg-emerald-50 text-emerald-800 shadow-sm dark:bg-emerald-950/80 dark:text-emerald-200";
            countStyles =
              "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/90 dark:text-emerald-100";
          }
        } else {
          activeStyles =
            "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50";
          countStyles =
            "bg-slate-200/80 text-slate-600 dark:bg-slate-700/80 dark:text-slate-300";
        }

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleTabChange(tab.id)}
            className={`group relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none ${activeStyles}`}
          >
            {/* Visual indicator (icon or colored status dot) */}
            {tab.icon ? (
              <span className={`${isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
                {tab.icon}
              </span>
            ) : (
              <span className={`w-2 h-2 rounded-full shrink-0 ${tab.dot}`} />
            )}

            <span>{tab.label}</span>

            {/* High-contrast readable count badge */}
            {typeof tab.count === "number" && (
              <span
                className={`inline-flex items-center justify-center min-w-[20px] px-2 py-0.5 rounded-md sm:rounded-lg text-[11px] font-bold transition-colors ${countStyles}`}
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
