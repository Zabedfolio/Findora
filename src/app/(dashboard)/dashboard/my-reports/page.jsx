"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Filter,
  PlusCircle,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  PackageSearch,
  Layers,
  LayoutGrid,
  LayoutList,
  AlertCircle,
  Tag,
  Check,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import {
  getAllUnifiedReports,
  updateReportStatus,
  deleteReport,
  CATEGORIES,
} from "@/services/reportService";
import toast from "@/lib/toast";
import { cn } from "@/utils/cn";

// Default demo report IDs for current user fallback
const DEFAULT_USER_IDS = new Set(["lost-1", "lost-3", "found-1", "found-2"]);

export default function MyReportsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'lost' | 'found'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'resolved'
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'title'
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'

  // Confirm delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load reports for the logged-in user
  const fetchUserReports = () => {
    setIsLoading(true);
    try {
      const all = getAllUnifiedReports();
      const currentUserId = user?.id || user?._id || "user_current";
      const currentUserEmail = user?.email || "";

      const userOnly = all.filter((item) => {
        const id = String(item.id || item._id);
        const ownerId = item.owner?._id || item.owner?.id;
        const ownerEmail = item.owner?.email;

        return (
          item.isUserCreated ||
          ownerId === currentUserId ||
          (currentUserEmail && ownerEmail === currentUserEmail) ||
          item.owner?.isCurrentUser ||
          DEFAULT_USER_IDS.has(id)
        );
      });

      setReports(userOnly);
    } catch (err) {
      console.error("Failed to load user reports:", err);
      toast.error("Failed to load your reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserReports();
  }, [user]);

  // Quick Action: Update Status (Lost, Found, Resolved)
  const handleStatusChange = async (id, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;

    try {
      // Optimistic update
      setReports((prev) =>
        prev.map((r) => {
          const reportId = String(r.id || r._id);
          if (reportId === String(id)) {
            return {
              ...r,
              status: newStatus,
              type: newStatus === "resolved" ? (r.type || "lost") : newStatus,
            };
          }
          return r;
        })
      );

      await updateReportStatus(id, newStatus);
      const label =
        newStatus === "resolved"
          ? "Resolved"
          : newStatus === "found"
          ? "Found"
          : "Lost";
      toast.success(`Status updated to "${label}"`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
      fetchUserReports();
    }
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const id = deleteTarget.id || deleteTarget._id;
      await deleteReport(id);

      setReports((prev) =>
        prev.filter((r) => String(r.id || r._id) !== String(id))
      );
      toast.success("Report deleted successfully");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting report:", err);
      toast.error("Failed to delete report");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered & Sorted reports
  const filteredReports = useMemo(() => {
    let result = [...reports];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((it) => {
        const title = (it.title || "").toLowerCase();
        const desc = (it.description || "").toLowerCase();
        const loc = (it.location || "").toLowerCase();
        const cat = (it.category || "").toLowerCase();
        return (
          title.includes(q) ||
          desc.includes(q) ||
          loc.includes(q) ||
          cat.includes(q)
        );
      });
    }

    // 2. Type Filter
    if (typeFilter !== "all") {
      result = result.filter(
        (it) => it.type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // 3. Status Filter
    if (statusFilter === "active") {
      result = result.filter((it) => it.status !== "resolved");
    } else if (statusFilter === "resolved") {
      result = result.filter((it) => it.status === "resolved");
    }

    // 4. Category Filter
    if (categoryFilter !== "all") {
      result = result.filter(
        (it) => it.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      const timeA = a.dateRaw ? new Date(a.dateRaw).getTime() : 0;
      const timeB = b.dateRaw ? new Date(b.dateRaw).getTime() : 0;
      if (sortBy === "oldest") {
        return timeA - timeB;
      }
      return timeB - timeA; // 'newest'
    });

    return result;
  }, [reports, searchQuery, typeFilter, statusFilter, categoryFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const lostCount = reports.filter(
      (r) => r.type === "lost" && r.status !== "resolved"
    ).length;
    const foundCount = reports.filter(
      (r) => r.type === "found" && r.status !== "resolved"
    ).length;
    const resolvedCount = reports.filter((r) => r.status === "resolved").length;
    return { total, lostCount, foundCount, resolvedCount };
  }, [reports]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    sortBy !== "newest";

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setCategoryFilter("all");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#070905] text-slate-900 dark:text-white py-8 sm:py-12 transition-colors">
        {/* Findora Theme Ambient Glowing Orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-[#9ae600]/[0.08] blur-[140px]" />
          <div className="absolute right-[-120px] top-1/3 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.06] blur-[140px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header Navigation & Title */}
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-slate-950 dark:text-white">
                    My Reports
                  </h1>
                  <span className="rounded-full bg-[#9ae600]/15 px-2.5 py-0.5 text-xs font-mono font-bold text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30">
                    {reports.length} Total
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Filter and manage reports you posted, update their resolution status, or edit report details.
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <Link
                  href="/reports/new"
                  className="btn-primary-glow inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 shadow-md"
                >
                  <PlusCircle size={15} />
                  <span>Report New Item</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
              <span className="text-[11px] font-mono text-slate-400">ALL POSTED</span>
              <p className="mt-1.5 text-2xl font-black text-slate-950 dark:text-white font-heading">
                {stats.total}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">Your total submissions</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
              <span className="text-[11px] font-mono text-rose-500 font-bold">MY LOST ITEMS</span>
              <p className="mt-1.5 text-2xl font-black text-rose-500 font-heading">
                {stats.lostCount}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">Still searching</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
              <span className="text-[11px] font-mono text-[#72a800] dark:text-[#9ae600] font-bold">
                ITEMS I FOUND
              </span>
              <p className="mt-1.5 text-2xl font-black text-[#72a800] dark:text-[#9ae600] font-heading">
                {stats.foundCount}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">Ready for return</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
              <span className="text-[11px] font-mono text-emerald-500 font-bold">RESOLVED</span>
              <p className="mt-1.5 text-2xl font-black text-emerald-500 font-heading">
                {stats.resolvedCount}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">Safely reunited</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, location, category, or description..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#9ae600]"
                />
              </div>

              {/* Type Switcher */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/[0.05] p-1 border border-slate-200 dark:border-white/10 shrink-0">
                {["all", "lost", "found"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase font-mono cursor-pointer",
                      typeFilter === t
                        ? "bg-white dark:bg-[#070b04] text-slate-950 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Status Switcher */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/[0.05] p-1 border border-slate-200 dark:border-white/10 shrink-0">
                {[
                  { key: "all", label: "All Status" },
                  { key: "active", label: "Active" },
                  { key: "resolved", label: "Resolved" },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStatusFilter(s.key)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      statusFilter === s.key
                        ? "bg-white dark:bg-[#070b04] text-slate-950 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Second row: Category, Sort, Reset, View Mode */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
              <div className="flex flex-wrap items-center gap-2">
                {/* Category select */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#9ae600]"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.filter((c) => c !== "All Categories").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Sort select */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#9ae600]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                </select>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/[0.05] p-1 border border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={cn(
                    "p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer",
                    viewMode === "cards" &&
                      "bg-white dark:bg-[#070b04] text-slate-950 dark:text-white shadow-xs"
                  )}
                  title="Card View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer",
                    viewMode === "table" &&
                      "bg-white dark:bg-[#070b04] text-slate-950 dark:text-white shadow-xs"
                  )}
                  title="Table View"
                >
                  <LayoutList size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Report Listings Section */}
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#9ae600] border-t-transparent" />
              <p className="mt-3 text-xs text-slate-400">Loading your reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#070b04] border border-dashed border-slate-200 dark:border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 grid place-items-center mx-auto text-slate-400">
                <PackageSearch size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white font-heading">
                {hasActiveFilters ? "No matching reports" : "No reports posted yet"}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "Try clearing or adjusting your search filters to find what you are looking for."
                  : "You haven't submitted any lost or found item reports on Findora yet."}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    href="/reports/new"
                    className="btn-primary-glow inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950"
                  >
                    <PlusCircle size={15} />
                    <span>Post First Report</span>
                  </Link>
                )}
              </div>
            </div>
          ) : viewMode === "cards" ? (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => {
                const id = String(report.id || report._id);
                const currentStatus = (report.status || report.type || "lost").toLowerCase();
                const isLost = currentStatus === "lost";
                const isFound = currentStatus === "found";
                const isResolved = currentStatus === "resolved";

                return (
                  <div
                    key={id}
                    className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] hover:border-[#9ae600]/40 transition-all shadow-xs overflow-hidden"
                  >
                    <div>
                      {/* Thumbnail & Badges Header */}
                      <div className="relative h-44 w-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                        {report.imageUrl ? (
                          <img
                            src={report.imageUrl}
                            alt={report.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-slate-400">
                            <PackageSearch size={28} />
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-xs transition-colors duration-200",
                              isResolved
                                ? "bg-emerald-500/90 text-white"
                                : isLost
                                ? "bg-rose-500/90 text-white"
                                : "bg-[#9ae600]/90 text-slate-950"
                            )}
                          >
                            {currentStatus}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-xs flex items-center gap-1",
                              isResolved
                                ? "bg-emerald-500/90 text-white"
                                : "bg-slate-900/80 text-white"
                            )}
                          >
                            {isResolved ? (
                              <>
                                <CheckCircle2 size={11} />
                                <span>Resolved</span>
                              </>
                            ) : (
                              <span>Active</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-slate-950 dark:text-white line-clamp-1 font-heading">
                            {report.title}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {report.description || "No description provided."}
                        </p>

                        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <MapPin size={12} className="shrink-0 text-slate-400" />
                            <span className="truncate">{report.location || "Location not stated"}</span>
                          </span>
                          <span className="flex items-center gap-1 shrink-0 font-mono">
                            <Calendar size={12} />
                            <span>{report.date || "Recent"}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick-Action Status Badges & Actions Footer */}
                    <div className="p-4 pt-0 space-y-3">
                      {/* Interactive Status Switcher Badges (Lost, Found, Resolved) */}
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                            Status Quick-Action:
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 capitalize">
                            Current: {currentStatus}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1">
                          {/* Lost Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(id, "lost", currentStatus)}
                            className={cn(
                              "px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer",
                              isLost
                                ? "bg-rose-500 text-white shadow-xs"
                                : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-600"
                            )}
                            title="Mark as Lost"
                          >
                            {isLost && <Check size={10} />}
                            <span>Lost</span>
                          </button>

                          {/* Found Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(id, "found", currentStatus)}
                            className={cn(
                              "px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer",
                              isFound
                                ? "bg-[#9ae600] text-slate-950 shadow-xs"
                                : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-[#9ae600]/10 hover:text-[#72a800]"
                            )}
                            title="Mark as Found"
                          >
                            {isFound && <Check size={10} />}
                            <span>Found</span>
                          </button>

                          {/* Resolved Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(id, "resolved", currentStatus)}
                            className={cn(
                              "px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer",
                              isResolved
                                ? "bg-emerald-500 text-white shadow-xs"
                                : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600"
                            )}
                            title="Mark as Resolved"
                          >
                            {isResolved && <Check size={10} />}
                            <span>Resolved</span>
                          </button>
                        </div>
                      </div>

                      {/* Edit & Delete Actions */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                        <Link
                          href={`/reports/${id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <ExternalLink size={13} />
                          <span>View</span>
                        </Link>

                        <div className="flex items-center gap-1.5">
                          {/* Edit Action Button */}
                          <Link
                            href={`/reports/${id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-[#9ae600]/15 hover:text-[#72a800] dark:hover:text-[#9ae600] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                            title="Edit Report"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </Link>

                          {/* Delete Action Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(report)}
                            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] text-slate-400 font-mono">
                      <th className="py-3 px-4 font-bold uppercase">Item Details</th>
                      <th className="py-3 px-4 font-bold uppercase">Category</th>
                      <th className="py-3 px-4 font-bold uppercase">Location</th>
                      <th className="py-3 px-4 font-bold uppercase">Date</th>
                      <th className="py-3 px-4 font-bold uppercase">Quick Status Badge</th>
                      <th className="py-3 px-4 font-bold uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                    {filteredReports.map((report) => {
                      const id = String(report.id || report._id);
                      const currentStatus = (report.status || report.type || "lost").toLowerCase();
                      const isLost = currentStatus === "lost";
                      const isFound = currentStatus === "found";
                      const isResolved = currentStatus === "resolved";

                      return (
                        <tr
                          key={id}
                          className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          {/* Item Thumbnail & Title */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0">
                                {report.imageUrl ? (
                                  <img
                                    src={report.imageUrl}
                                    alt={report.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full grid place-items-center text-slate-400">
                                    <PackageSearch size={16} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 max-w-[220px]">
                                <p className="font-bold text-slate-950 dark:text-white truncate">
                                  {report.title}
                                </p>
                                <span
                                  className={cn(
                                    "inline-block mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-mono font-bold uppercase transition-colors duration-200",
                                    isResolved
                                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                      : isLost
                                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                      : "bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600]"
                                  )}
                                >
                                  {currentStatus}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {report.category || "General"}
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1 truncate max-w-[160px]">
                              <MapPin size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate">{report.location || "Dhaka"}</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                            {report.date || "Recent"}
                          </td>

                          {/* Quick Action Status Badges (Lost, Found, Resolved) */}
                          <td className="py-3.5 px-4">
                            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-white/[0.05] p-0.5 border border-slate-200 dark:border-white/10 gap-0.5">
                              {/* Lost */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(id, "lost", currentStatus)}
                                className={cn(
                                  "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all cursor-pointer",
                                  isLost
                                    ? "bg-rose-500 text-white shadow-xs"
                                    : "text-slate-500 hover:text-rose-500"
                                )}
                                title="Set to Lost"
                              >
                                Lost
                              </button>

                              {/* Found */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(id, "found", currentStatus)}
                                className={cn(
                                  "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all cursor-pointer",
                                  isFound
                                    ? "bg-[#9ae600] text-slate-950 shadow-xs"
                                    : "text-slate-500 hover:text-[#72a800]"
                                )}
                                title="Set to Found"
                              >
                                Found
                              </button>

                              {/* Resolved */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(id, "resolved", currentStatus)}
                                className={cn(
                                  "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all cursor-pointer",
                                  isResolved
                                    ? "bg-emerald-500 text-white shadow-xs"
                                    : "text-slate-500 hover:text-emerald-500"
                                )}
                                title="Set to Resolved"
                              >
                                Resolved
                              </button>
                            </div>
                          </td>

                          {/* Actions: Edit & Delete */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <Link
                                href={`/reports/${id}`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                title="View Public Page"
                              >
                                <ExternalLink size={14} />
                              </Link>
                              <Link
                                href={`/reports/${id}/edit`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-[#9ae600]/15 hover:text-[#72a800] dark:hover:text-[#9ae600] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                                title="Edit Report"
                              >
                                <Edit3 size={13} />
                                <span>Edit</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(report)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Delete Report"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 grid place-items-center">
                <Trash2 size={24} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white font-heading">
                  Delete Report?
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    "{deleteTarget.title}"
                  </span>
                  ? This will delete the listing from community searches and active match radars.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-colors inline-flex items-center gap-1.5"
                >
                  {isDeleting ? "Deleting..." : "Delete Report"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
