"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getReportById } from "@/services/reportService";
import ImageGallery from "@/components/reports/ImageGallery";
import ReportDetailsInfo from "@/components/reports/ReportDetailsInfo";
import PosterCard from "@/components/reports/PosterCard";
import ReportActions from "@/components/reports/ReportActions";
import ClaimButton from "@/components/reports/ClaimButton";
import MatchSuggestions from "@/components/reports/MatchSuggestions";
import EmptyState from "@/components/ui/EmptyState";
import {
  ArrowLeft,
  Loader2,
  PackageSearch,
  Share2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import toast from "@/lib/toast";

function ReportDetailsSkeleton() {
  return (
    <div className="min-h-screen py-8 sm:py-12 bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="aspect-16/10 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportDetailsContent() {
  const router = useRouter();
  const rawParams = useParams();
  const id = rawParams?.id;

  // Fetch single report by ID using React Query
  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: () => getReportById(id),
    enabled: Boolean(id),
  });

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Report link copied to clipboard!");
    } else {
      toast("Report link ready to share");
    }
  };

  // 1. Loading State (Sleek Skeleton Loader)
  if (isLoading) {
    return (
      <div className="min-h-screen py-8 sm:py-12 bg-slate-50/50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="aspect-16/10 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error or Not Found State
  if (isError || !report) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <EmptyState
            icon={PackageSearch}
            title="Report Not Found"
            description="The listing you are looking for may have been resolved, deleted, or the URL address is incorrect."
            actionLabel="Back to browse"
            actionHref="/reports"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Quick Actions Bar */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Browse Reports</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {/* Owner/Admin Action dropdown */}
            <ReportActions report={report} onUpdate={refetch} />
          </div>
        </div>

        {/* Main 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Image Gallery + Comprehensive Info */}
          <div className="lg:col-span-8 space-y-8">
            <ImageGallery report={report} />
            <ReportDetailsInfo report={report} />
          </div>

          {/* Right Sidebar: Poster Card, Claim Button, Match Suggestions */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Poster Author Card */}
            <PosterCard report={report} />

            {/* Reserved Area for Claim/Found Action Button */}
            <ClaimButton report={report} />

            {/* Reserved Area for AI Match Suggestions */}
            <MatchSuggestions currentReport={report} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportDetailsPage() {
  return (
    <Suspense fallback={<ReportDetailsSkeleton />}>
      <ReportDetailsContent />
    </Suspense>
  );
}
