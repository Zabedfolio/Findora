"use client";

import React, { Suspense, useState, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useReports } from "@/hooks/useReports";
import SearchBar from "@/components/search/SearchBar";
import SortDropdown from "@/components/search/SortDropdown";
import TypeTabs from "@/components/search/TypeTabs";
import FilterPanel from "@/components/search/FilterPanel";
import ReportGrid from "@/components/reports/ReportGrid";
import Pagination from "@/components/ui/Pagination";
import CardSkeleton from "@/components/ui/CardSkeleton";
import { SlidersHorizontal, AlertCircle, RefreshCw, PlusCircle, ChevronRight } from "lucide-react";

/**
 * Inner Browse Reports Content using search parameters
 */
function ReportsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract all URL params
  const params = useMemo(() => {
    return {
      q: searchParams.get("q") || "",
      type: searchParams.get("type") || "all",
      category: searchParams.get("category") || "",
      location: searchParams.get("location") || "",
      from: searchParams.get("from") || "",
      to: searchParams.get("to") || "",
      sort: searchParams.get("sort") || "newest",
      filter: searchParams.get("filter") || "",
      page: Number(searchParams.get("page")) || 1,
      limit: 9,
    };
  }, [searchParams]);

  // Query reports with custom hook
  const {
    reports,
    totalReports,
    totalPages,
    currentPage,
    typeCounts,
    isLoading,
    isError,
    error,
    refetch,
  } = useReports(params);

  // Count active filters for mobile badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (params.category && params.category !== "All Categories") count++;
    if (params.location && params.location !== "All Locations") count++;
    if (params.from) count++;
    if (params.to) count++;
    return count;
  }, [params]);

  // Handle page navigation via Pagination component
  const handlePageChange = (newPage) => {
    const updatedParams = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      updatedParams.delete("page");
    } else {
      updatedParams.set("page", String(newPage));
    }
    router.push(`${pathname}?${updatedParams.toString()}`, { scroll: false });
  };

  // Handler to clear all search and filter conditions
  const handleResetFilters = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 1. Header & Breadcrumb */}
      <div className="mb-8">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-3 font-medium">
          <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-semibold">Reports</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight font-heading">
              {params.filter === "my-reports" ? "My Listings" : "Explore Reports"}
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
              {params.filter === "my-reports"
                ? "Manage and monitor the status of lost and found items you have reported."
                : "Browse lost and found items reported across Bangladesh. Search, filter, or report an item to help reunite belongings."}
            </p>
            {params.filter === "my-reports" && (
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30">
                  Filtered: My Reports
                </span>
                <Link
                  href="/reports"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline underline-offset-4"
                >
                  View All Platform Reports
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/reports/new"
            className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#9ae600] dark:hover:bg-[#88cc00] dark:text-slate-950 font-bold rounded-xl text-xs sm:text-sm tracking-tight transition-all duration-200 shadow-sm active:scale-98 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Item</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Controls: SearchBar + SortDropdown + Mobile Filter Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
        <SearchBar placeholder="Search by item name, model, color, or location..." />
        
        <div className="flex items-center gap-2 shrink-0">
          <SortDropdown />

          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Open filter options"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-[#9ae600] text-white dark:text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Below Row: TypeTabs (All / Lost / Found) + Result Count Display */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-100 dark:border-slate-800">
        <TypeTabs counts={typeCounts} />

        {/* Result Count Indicator */}
        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          {isLoading ? (
            <span className="inline-flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Searching items...
            </span>
          ) : (
            <span>
              <strong className="text-slate-900 dark:text-white font-bold">{totalReports}</strong>{" "}
              {totalReports === 1 ? "item found" : "items found"}
            </span>
          )}
        </div>
      </div>

      {/* 4. Main Body Layout: Left FilterPanel + Right ReportGrid + Pagination */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: FilterPanel */}
        <FilterPanel
          isMobileOpen={mobileFilterOpen}
          onMobileClose={() => setMobileFilterOpen(false)}
        />

        {/* Main Column: Reports Grid + States + Pagination */}
        <div className="flex-1 w-full min-w-0">
          {/* Error State */}
          {isError ? (
            <div className="p-8 text-center bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-3xl">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Unable to load reports
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                {error?.message || "An error occurred while fetching reports. Please try again."}
              </p>
              <button
                type="button"
                onClick={refetch}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-[#9ae600] text-white dark:text-slate-950 text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          ) : (
            <>
              {/* Reports Grid (handles loading, empty, and populated states) */}
              <ReportGrid
                reports={reports}
                isLoading={isLoading}
                emptyTitle="No matching reports found"
                emptyDescription="We couldn't find any listings matching your search criteria. Try modifying your search keywords or clearing some filters."
                onResetFilters={handleResetFilters}
              />

              {/* Bottom: Pagination (returns null when totalPages <= 1) */}
              {!isLoading && totalPages > 1 && (
                <div className="mt-10">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Main Reports Page with Suspense boundary for Next.js App Router client navigation
 */
export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-8 animate-pulse" />
          <CardSkeleton count={9} />
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
