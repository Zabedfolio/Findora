"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Trash2,
  RotateCcw,
  ExternalLink,
  Edit3,
  PackageSearch,
  MapPin,
  Calendar,
  X,
  Check,
  CheckCheck,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/utils/cn";
import {
  getAllUnifiedReports,
  updateReportStatus,
} from "@/services/reportService";
import toast from "@/lib/toast";

const STORAGE_VERIFICATIONS = "findora_report_verifications_v1";
const STORAGE_REMOVALS = "findora_report_removals_v1";

const REMOVAL_REASONS = [
  "Counterfeit item or fraudulent reward bounty",
  "Duplicate submission or spam listing",
  "Prohibited or restricted category item",
  "Inappropriate content or offensive imagery",
  "User requested permanent removal",
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [verifications, setVerifications] = useState({});
  const [removals, setRemovals] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'lost' | 'found'
  const [verifyFilter, setVerifyFilter] = useState("all"); // 'all' | 'verified' | 'unverified' | 'flagged'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'open' | 'resolved' | 'removed'

  // Removal Modal State
  const [removingTarget, setRemovingTarget] = useState(null);
  const [removalReason, setRemovalReason] = useState(REMOVAL_REASONS[0]);

  // Load verified & removed maps from localStorage
  const loadState = () => {
    try {
      const all = getAllUnifiedReports();
      setReports(all);

      if (typeof window !== "undefined") {
        const rawVer = localStorage.getItem(STORAGE_VERIFICATIONS);
        const rawRem = localStorage.getItem(STORAGE_REMOVALS);
        if (rawVer) setVerifications(JSON.parse(rawVer));
        if (rawRem) setRemovals(JSON.parse(rawRem));
      }
    } catch (err) {
      console.error("Error loading admin reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  // Save verifications
  const saveVerifications = (nextMap) => {
    setVerifications(nextMap);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_VERIFICATIONS, JSON.stringify(nextMap));
    }
  };

  // Save removals
  const saveRemovals = (nextMap) => {
    setRemovals(nextMap);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_REMOVALS, JSON.stringify(nextMap));
    }
  };

  // Toggle Verification (verified <-> unverified)
  const handleToggleVerify = (id) => {
    const isCurrentlyVerified = verifications[id] === "verified";
    const nextStatus = isCurrentlyVerified ? "unverified" : "verified";
    const updated = { ...verifications, [id]: nextStatus };
    saveVerifications(updated);

    if (nextStatus === "verified") {
      toast.success("Listing verified with official safety badge");
    } else {
      toast.info("Verification status removed");
    }
  };

  // Flag Report for Review
  const handleFlagReport = (id) => {
    const updated = { ...verifications, [id]: "flagged" };
    saveVerifications(updated);
    toast.warning("Report flagged for administrator inspection");
  };

  // Confirm Removal
  const confirmRemoveListing = () => {
    if (!removingTarget) return;
    const id = String(removingTarget.id || removingTarget._id);
    const updated = {
      ...removals,
      [id]: {
        removed: true,
        reason: removalReason,
        timestamp: Date.now(),
      },
    };
    saveRemovals(updated);
    toast.success(`Listing removed from public view: "${removalReason}"`);
    setRemovingTarget(null);
  };

  // Restore removed listing
  const handleRestoreListing = (id) => {
    const updated = { ...removals };
    delete updated[id];
    saveRemovals(updated);
    toast.success("Listing restored to public search");
  };

  // Update Status (lost, found, resolved)
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateReportStatus(id, newStatus);
      setReports((prev) =>
        prev.map((r) => {
          if (String(r.id || r._id) === String(id)) {
            return {
              ...r,
              status: newStatus,
              type: newStatus === "resolved" ? (r.type || "lost") : newStatus,
            };
          }
          return r;
        })
      );
      toast.success(`Status updated to "${newStatus}"`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const id = String(item.id || item._id);
      const isRemoved = Boolean(removals[id]?.removed);
      const vStatus = verifications[id] || (id === "1" || id === "2" ? "verified" : "unverified");
      const currentStatus = item.status || item.type || "lost";

      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (item.title || "").toLowerCase().includes(q) ||
          (item.location || "").toLowerCase().includes(q) ||
          (item.category || "").toLowerCase().includes(q) ||
          id.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Type Filter
      if (typeFilter !== "all" && item.type !== typeFilter) {
        return false;
      }

      // 3. Verification Filter
      if (verifyFilter !== "all") {
        if (verifyFilter === "verified" && vStatus !== "verified") return false;
        if (verifyFilter === "unverified" && vStatus !== "unverified") return false;
        if (verifyFilter === "flagged" && vStatus !== "flagged") return false;
      }

      // 4. Status Filter
      if (statusFilter !== "all") {
        if (statusFilter === "removed") return isRemoved;
        if (isRemoved) return false; // don't show removed items in other status views
        if (statusFilter === "resolved" && currentStatus !== "resolved") return false;
        if (statusFilter === "open" && currentStatus === "resolved") return false;
      } else {
        // In "all", still allow removed items to be visible
      }

      return true;
    });
  }, [reports, verifications, removals, searchQuery, typeFilter, verifyFilter, statusFilter]);

  // Overall metrics
  const metrics = useMemo(() => {
    let verifiedCount = 0;
    let flaggedCount = 0;
    let removedCount = Object.keys(removals).length;
    let resolvedCount = 0;

    for (const r of reports) {
      const id = String(r.id || r._id);
      const vStatus = verifications[id] || (id === "1" || id === "2" ? "verified" : "unverified");
      if (vStatus === "verified") verifiedCount++;
      if (vStatus === "flagged") flaggedCount++;
      if (r.status === "resolved") resolvedCount++;
    }

    return {
      total: reports.length,
      verified: verifiedCount,
      flagged: flaggedCount,
      removed: removedCount,
      resolved: resolvedCount,
    };
  }, [reports, verifications, removals]);

  return (
    <div className="space-y-5">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Total Listings
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
            {metrics.total}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Unified platform inventory
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Verified Badges
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics.verified}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Identity &amp; photo validated
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-500">
            Flagged for Audit
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-rose-500">
            {metrics.flagged}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Requires admin inspection
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Removed Listings
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-700 dark:text-slate-300">
            {metrics.removed}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Hidden from public directory
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, location, category, or ID…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9ae600]"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#9ae600] cursor-pointer"
            >
              <option value="all">Type: All</option>
              <option value="lost">Lost Only</option>
              <option value="found">Found Only</option>
            </select>

            {/* Verification Filter */}
            <select
              value={verifyFilter}
              onChange={(e) => setVerifyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#9ae600] cursor-pointer"
            >
              <option value="all">Verification: All</option>
              <option value="verified">Verified Badged</option>
              <option value="unverified">Unverified</option>
              <option value="flagged">Flagged</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#9ae600] cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="open">Active / Open</option>
              <option value="resolved">Resolved</option>
              <option value="removed">Removed Only</option>
            </select>

            <Link
              href="/reports/new"
              className="btn-primary-glow inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-950 shadow-xs ml-auto"
            >
              <PlusCircle size={13} />
              <span>Post Official Report</span>
            </Link>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Showing {filteredReports.length} matching reports out of {reports.length} total
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] text-slate-400 font-mono">
                <th className="py-3 px-4 font-bold uppercase">Item Details</th>
                <th className="py-3 px-4 font-bold uppercase">Type</th>
                <th className="py-3 px-4 font-bold uppercase">Location</th>
                <th className="py-3 px-4 font-bold uppercase">Verification</th>
                <th className="py-3 px-4 font-bold uppercase">Report Status</th>
                <th className="py-3 px-4 font-bold uppercase text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">No reports match your filters</p>
                    <p className="text-xs mt-1">Try resetting the search terms or dropdown filters</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const id = String(report.id || report._id);
                  const isRemoved = Boolean(removals[id]?.removed);
                  const vStatus =
                    verifications[id] || (id === "1" || id === "2" ? "verified" : "unverified");
                  const currentStatus = (report.status || report.type || "lost").toLowerCase();
                  const isLost = currentStatus === "lost";
                  const isFound = currentStatus === "found";
                  const isResolved = currentStatus === "resolved";

                  return (
                    <tr
                      key={id}
                      className={cn(
                        "hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors",
                        isRemoved && "opacity-60 bg-rose-500/[0.03]"
                      )}
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
                          <div className="min-w-0 max-w-[210px]">
                            <p className="font-bold text-slate-950 dark:text-white truncate">
                              {report.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="truncate">{report.category || "General"}</span>
                              <span>•</span>
                              <span className="font-mono">#{id.slice(-6)}</span>
                            </div>
                            {isRemoved && (
                              <span className="inline-block mt-1 text-[10px] font-mono text-rose-500 font-semibold truncate">
                                Reason: {removals[id]?.reason}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase",
                            isResolved
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : isLost
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : "bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              isResolved
                                ? "bg-emerald-500"
                                : isLost
                                ? "bg-rose-500"
                                : "bg-[#9ae600]"
                            )}
                          />
                          {currentStatus}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1 truncate max-w-[140px]">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{report.location || "Central Metro"}</span>
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4">
                        {vStatus === "verified" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <ShieldCheck size={11} />
                            Verified
                          </span>
                        ) : vStatus === "flagged" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            <ShieldAlert size={11} />
                            Flagged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10">
                            <Clock size={11} />
                            Unverified
                          </span>
                        )}
                      </td>

                      {/* Quick Status Control */}
                      <td className="py-3.5 px-4">
                        {isRemoved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold uppercase bg-rose-500/10 text-rose-600 border border-rose-500/30">
                            <ShieldX size={11} />
                            Removed
                          </span>
                        ) : (
                          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-white/[0.05] p-0.5 border border-slate-200 dark:border-white/10 gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(id, "lost")}
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer",
                                isLost
                                  ? "bg-rose-500 text-white shadow-xs"
                                  : "text-slate-500 hover:text-rose-500"
                              )}
                              title="Set status to Lost"
                            >
                              Lost
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(id, "found")}
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer",
                                isFound
                                  ? "bg-[#9ae600] text-slate-950 shadow-xs"
                                  : "text-slate-500 hover:text-[#72a800]"
                              )}
                              title="Set status to Found"
                            >
                              Found
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(id, "resolved")}
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer",
                                isResolved
                                  ? "bg-emerald-500 text-white shadow-xs"
                                  : "text-slate-500 hover:text-emerald-500"
                              )}
                              title="Set status to Resolved"
                            >
                              Resolved
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Moderation Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Verify Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleVerify(id)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer border",
                              vStatus === "verified"
                                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : "bg-slate-100 hover:bg-emerald-500/10 hover:text-emerald-600 dark:bg-white/5 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10"
                            )}
                            title={vStatus === "verified" ? "Remove verified badge" : "Grant official verified badge"}
                          >
                            <ShieldCheck size={12} />
                            <span>{vStatus === "verified" ? "Verified" : "Verify"}</span>
                          </button>

                          {/* Flag Button */}
                          {vStatus !== "flagged" && (
                            <button
                              type="button"
                              onClick={() => handleFlagReport(id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-500/10 hover:text-amber-500 transition-colors cursor-pointer"
                              title="Flag listing for safety inspection"
                            >
                              <AlertTriangle size={13} />
                            </button>
                          )}

                          {/* Remove or Restore */}
                          {isRemoved ? (
                            <button
                              type="button"
                              onClick={() => handleRestoreListing(id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#9ae600]/15 hover:bg-[#9ae600]/25 text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30 transition-all cursor-pointer flex items-center gap-1"
                              title="Restore to public listings"
                            >
                              <RotateCcw size={11} />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setRemovingTarget(report)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Remove listing from public view"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}

                          {/* Public Page Link */}
                          <Link
                            href={`/reports/${id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                            title="View public report"
                          >
                            <ExternalLink size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remove Listing Confirmation Modal */}
      {removingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#070b04] border border-rose-500/30 p-6 shadow-2xl relative text-slate-900 dark:text-white">
            <button
              type="button"
              onClick={() => setRemovingTarget(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <span className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <Trash2 size={20} />
              </span>
              <div>
                <h4 className="font-display font-bold text-base text-slate-950 dark:text-white">
                  Remove Listing From Directory
                </h4>
                <p className="text-xs text-slate-500">
                  Target: {removingTarget.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Removing this report will hide it from the public directory, search results, and matching radar. Please select an audit reason for platform compliance records:
            </p>

            <div className="space-y-2 mb-5">
              {REMOVAL_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all",
                    removalReason === reason
                      ? "bg-rose-500/10 border-rose-500/40 text-slate-900 dark:text-white font-medium"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                  )}
                >
                  <input
                    type="radio"
                    name="removalReason"
                    checked={removalReason === reason}
                    onChange={() => setRemovalReason(reason)}
                    className="accent-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setRemovingTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveListing}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Confirm Removal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
