"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SearchX,
  PlusCircle,
  Edit3,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  CheckCircle2,
  PackageSearch,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/utils/cn";
import {
  getAllUnifiedReports,
  updateReportStatus,
  deleteReport,
} from "@/services/reportService";
import useAuth from "@/hooks/useAuth";
import toast from "@/lib/toast";

const DEFAULT_USER_ITEM_IDS = new Set(["lost-1", "lost-3", "found-1", "found-2"]);
const PAGE_SIZE = 6;

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "lost", label: "Lost", color: "#F43F5E" },
  { key: "found", label: "Found", color: "#9AE600" },
  { key: "resolved", label: "Resolved", color: "#10B981" },
];

export default function MyReportsTable() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch reports for current user
  const loadReports = () => {
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
          DEFAULT_USER_ITEM_IDS.has(id)
        );
      });

      setReports(userOnly);
    } catch (err) {
      console.error("Error loading user reports in table:", err);
    }
  };

  useEffect(() => {
    loadReports();
  }, [user?.id, user?.email]);

  // Handle Quick Status Action (Lost, Found, Resolved)
  const handleStatusChange = async (id, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;

    // Optimistic UI update: sync both status and type so column 1 updates instantly
    setReports((prev) =>
      prev.map((r) => {
        const rId = String(r.id || r._id);
        if (rId === String(id)) {
          return {
            ...r,
            status: newStatus,
            type: newStatus === "resolved" ? (r.type || "lost") : newStatus,
          };
        }
        return r;
      })
    );

    try {
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
      loadReports();
    }
  };

  // Handle Delete
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

  // Search filter
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((it) => {
      const title = (it.title || "").toLowerCase();
      const loc = (it.location || "").toLowerCase();
      const cat = (it.category || "").toLowerCase();
      const id = String(it.id || it._id || "").toLowerCase();
      return (
        title.includes(q) ||
        loc.includes(q) ||
        cat.includes(q) ||
        id.includes(q)
      );
    });
  }, [reports, query]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { all: searched.length, lost: 0, found: 0, resolved: 0 };
    for (const it of searched) {
      const cur = it.status || it.type;
      if (cur === "resolved") {
        counts.resolved++;
      } else if (cur === "found") {
        counts.found++;
      } else {
        counts.lost++;
      }
    }
    return counts;
  }, [searched]);

  // Filtered reports
  const filtered = useMemo(() => {
    if (status === "all") return searched;
    if (status === "resolved") {
      return searched.filter((it) => (it.status || it.type) === "resolved");
    }
    if (status === "lost") {
      return searched.filter((it) => (it.status || it.type) === "lost");
    }
    if (status === "found") {
      return searched.filter((it) => (it.status || it.type) === "found");
    }
    return searched;
  }, [searched, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(0);
  }, [query, status, reports]);

  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="flex h-full flex-col">
      {/* Table Header: Title, Search & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
              My Reports
            </h3>
            <span className="rounded-full bg-[#9ae600]/15 px-2 py-0.2 text-[10.5px] font-mono font-bold text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30">
              Personal
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {filtered.length}
            </span>{" "}
            records posted by you
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search my reports…"
              className="h-8.5 w-36 sm:w-48 rounded-full bg-slate-100/80 pl-8 pr-3 text-[12px] text-slate-700 ring-1 ring-transparent transition-all placeholder:text-slate-400 focus:w-56 focus:bg-white focus:ring-[#9ae600]/60 dark:bg-white/[0.06] dark:text-slate-200 dark:focus:bg-[#070b04]"
            />
          </div>

          {/* Report New Item CTA */}
          <Link
            href="/reports/new"
            className="flex h-8.5 items-center gap-1.5 rounded-full bg-slate-950 px-3.5 text-[11.5px] font-bold text-white transition-all hover:scale-[1.02] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shrink-0"
          >
            <PlusCircle size={13} strokeWidth={2.4} />
            <span className="hidden sm:inline">New Report</span>
          </Link>

          {/* Full Hub Link */}
          <Link
            href="/dashboard/my-reports"
            className="flex h-8.5 items-center gap-1 rounded-full bg-slate-100 px-3 text-[11.5px] font-semibold text-slate-600 hover:text-slate-950 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:text-white transition-colors shrink-0"
            title="View Full Hub"
          >
            <span>All Hub</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-5 pb-1 pt-3.5 sm:px-6">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-200 ring-1 cursor-pointer",
                active
                  ? "bg-slate-900 text-white ring-slate-900 dark:bg-white dark:text-slate-900 dark:ring-white"
                  : "bg-white text-slate-500 ring-slate-200 hover:text-slate-800 hover:ring-slate-300 dark:bg-white/[0.04] dark:text-slate-400 dark:ring-white/10 dark:hover:text-slate-200"
              )}
            >
              {f.color && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: f.color }}
                />
              )}
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-mono",
                  active
                    ? "bg-white/20 dark:bg-slate-900/10"
                    : "bg-slate-100 dark:bg-white/10"
                )}
              >
                {statusCounts[f.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Table Content */}
      <div className="mt-2 flex-1 overflow-x-auto px-3 pb-2">
        <table className="w-full min-w-[700px] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-slate-100 dark:[&>th]:border-white/[0.06] text-slate-400 font-mono text-[10.5px] uppercase">
              <th className="py-2.5 px-4 pl-3">Item</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4">Location</th>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4">Quick Status</th>
              <th className="py-2.5 px-4 text-right pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {pageItems.map((it, i) => {
                const id = String(it.id || it._id);
                const currentStatus = (it.status || it.type || "lost").toLowerCase();
                const isResolved = currentStatus === "resolved";
                const isLost = currentStatus === "lost";
                const isFound = currentStatus === "found";

                return (
                  <motion.tr
                    key={id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                  >
                    {/* Item Thumbnail & Title */}
                    <td className="border-b border-slate-50 px-4 py-3 pl-3 dark:border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0">
                          {it.imageUrl ? (
                            <img
                              src={it.imageUrl}
                              alt={it.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-slate-400">
                              <PackageSearch size={15} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-[190px]">
                          <p className="truncate text-[12.5px] font-semibold text-slate-900 dark:text-slate-100">
                            {it.title}
                          </p>
                          <p className="text-[10.5px] text-slate-400 truncate">
                            {it.category || "General"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Type Badge (Automatically updates when Quick Status changes) */}
                    <td className="border-b border-slate-50 px-4 py-3 dark:border-white/[0.04]">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-mono font-bold uppercase transition-colors duration-200",
                          isResolved
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : isLost
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600]"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full transition-colors duration-200",
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
                    <td className="border-b border-slate-50 px-4 py-3 dark:border-white/[0.04]">
                      <div className="flex items-center gap-1 text-[11.5px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                        <MapPin size={11} className="shrink-0 text-slate-400" />
                        <span className="truncate">{it.location || "Dhaka"}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="border-b border-slate-50 px-4 py-3 dark:border-white/[0.04]">
                      <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {it.date || "Recent"}
                      </span>
                    </td>

                    {/* Quick-Action Status Badges (Lost, Found, Resolved) */}
                    <td className="border-b border-slate-50 px-4 py-3 dark:border-white/[0.04]">
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
                          title="Set status to Lost"
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
                          title="Set status to Found"
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
                          title="Set status to Resolved"
                        >
                          Resolved
                        </button>
                      </div>
                    </td>

                    {/* Actions: View, Edit, Delete */}
                    <td className="border-b border-slate-50 px-4 py-3 pr-3 text-right dark:border-white/[0.04]">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/reports/${id}`}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="View public page"
                        >
                          <ExternalLink size={13} />
                        </Link>

                        <Link
                          href={`/reports/${id}/edit`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-[#9ae600]/15 hover:text-[#72a800] dark:hover:text-[#9ae600] text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-all"
                          title="Edit this report"
                        >
                          <Edit3 size={11} />
                          <span>Edit</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(it)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete report"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {pageItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.06]">
              <SearchX size={18} />
            </span>
            <p className="mt-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              No matching reports found
            </p>
            <p className="mt-0.5 text-[11.5px] text-slate-400">
              Try adjusting your search or post a new item report.
            </p>
            <Link
              href="/reports/new"
              className="mt-3.5 inline-flex items-center gap-1.5 btn-primary-glow px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950"
            >
              <PlusCircle size={13} />
              <span>Report New Item</span>
            </Link>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 sm:px-6 dark:border-white/[0.06]">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            {page * PAGE_SIZE + 1}–{Math.min(filtered.length, (page + 1) * PAGE_SIZE)} of{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="grid h-7 w-7 place-items-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-white/[0.07] cursor-pointer"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="text-xs font-mono px-2 text-slate-600 dark:text-slate-300">
              {page + 1} / {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
              className="grid h-7 w-7 place-items-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-white/[0.07] cursor-pointer"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/10 p-5 shadow-2xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 grid place-items-center">
              <Trash2 size={20} />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-950 dark:text-white font-heading">
                Delete Report?
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  "{deleteTarget.title}"
                </span>
                ?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
