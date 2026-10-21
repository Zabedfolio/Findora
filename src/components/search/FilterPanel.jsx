"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CATEGORIES, POPULAR_LOCATIONS } from "@/services/reportService";
import { Filter, X, RotateCcw, Calendar, MapPin, Tag } from "lucide-react";

/**
 * FilterPanel component for category, location, and date range filtering.
 *
 * @param {Object} props
 * @param {boolean} [props.isMobileOpen=false] - Controlled state for mobile modal/drawer
 * @param {() => void} [props.onMobileClose] - Handler to close mobile drawer
 * @param {string} [props.className] - Extra classes
 */
export default function FilterPanel({
  isMobileOpen = false,
  onMobileClose,
  className = "",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("category") || "All Categories";
  const selectedLocation = searchParams.get("location") || "";
  const selectedFrom = searchParams.get("from") || "";
  const selectedTo = searchParams.get("to") || "";

  const hasActiveFilters = Boolean(
    (selectedCategory && selectedCategory !== "All Categories") ||
      selectedLocation ||
      selectedFrom ||
      selectedTo
  );

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "All Categories" || value === "All Locations") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("location");
    params.delete("from");
    params.delete("to");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const content = (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base font-heading">
          <Filter className="w-4 h-4 text-slate-700 dark:text-[#9ae600]" />
          <span>Filter Listings</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          <span>Category</span>
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => updateParam("category", e.target.value)}
          aria-label="Filter by category"
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-[#9ae600] cursor-pointer transition-all"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Location Filter */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>Location</span>
        </label>
        <select
          value={selectedLocation || "All Locations"}
          onChange={(e) => updateParam("location", e.target.value)}
          aria-label="Filter by location"
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-[#9ae600] cursor-pointer transition-all mb-2"
        >
          {POPULAR_LOCATIONS.map((loc) => (
            <option key={loc} value={loc === "All Locations" ? "" : loc.split(",")[0]}>
              {loc}
            </option>
          ))}
        </select>

        {/* Or custom location input */}
        <input
          type="text"
          value={selectedLocation}
          onChange={(e) => updateParam("location", e.target.value)}
          placeholder="Or type specific area..."
          aria-label="Custom location search"
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-[#9ae600]"
        />
      </div>

      {/* 3. Date Range Filter */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Date Range</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="block text-[10px] text-slate-400 mb-1">From</span>
            <input
              type="date"
              value={selectedFrom}
              onChange={(e) => updateParam("from", e.target.value)}
              aria-label="Start date"
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-[#9ae600]"
            />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 mb-1">To</span>
            <input
              type="date"
              value={selectedTo}
              onChange={(e) => updateParam("to", e.target.value)}
              aria-label="End date"
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-[#9ae600]"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:block w-64 shrink-0 self-start sticky top-24 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs ${className}`}
      >
        {content}
      </aside>

      {/* Mobile Drawer / Slide-Over Modal */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onMobileClose}
          />

          {/* Drawer Body */}
          <div className="relative ml-auto w-full max-w-xs h-full bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                  Filter Options
                </span>
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {content}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <button
                type="button"
                onClick={onMobileClose}
                className="w-full py-3 bg-slate-900 dark:bg-[#9ae600] text-white dark:text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all active:scale-98"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
