"use client";

import React from "react";
import ReportCard from "./ReportCard";
import CardSkeleton from "@/components/ui/CardSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { SearchX } from "lucide-react";

/**
 * Responsive ReportGrid component handling loading, empty, and populated states.
 *
 * @param {Object} props
 * @param {Array} props.reports - List of report items
 * @param {boolean} [props.isLoading=false] - Whether data is being fetched
 * @param {string} [props.emptyTitle] - Custom title for empty state
 * @param {string} [props.emptyDescription] - Custom description for empty state
 * @param {() => void} [props.onResetFilters] - Handler to reset active search & filters
 * @param {string} [props.className] - Additional classes
 */
export default function ReportGrid({
  reports = [],
  isLoading = false,
  emptyTitle = "No reports found",
  emptyDescription = "There are no listings matching your current search criteria. Try modifying your filters or clearing search terms.",
  onResetFilters,
  className = "",
}) {
  // 1. Loading State
  if (isLoading) {
    return <CardSkeleton count={9} />;
  }

  // 2. Empty State
  if (!reports || reports.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onResetFilters ? "Reset Filters" : undefined}
        onAction={onResetFilters}
        secondaryActionLabel="Report an Item"
        secondaryActionHref="/reports/new"
        className={className}
      />
    );
  }

  // 3. Populated Data State
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 ${className}`}
    >
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
