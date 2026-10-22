"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutList,
  LayoutGrid,
  Search,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  ExternalLink,
  Download,
  Filter,
  Package,
  Radio,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { getAllUnifiedReports, resolveReport, deleteReport } from "@/services/reportService";
import { fmtDate } from "@/lib/format";

// Default user listings identifiers if no user items found yet in localStorage
const DEFAULT_USER_ITEM_IDS = new Set(["lost-1", "lost-3", "found-1", "found-2"]);

export default function MyListingsView({ onNewReport }) {
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'in_review' | 'resolved'
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'lost' | 'found'
  const [userReports, setUserReports] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // For detail preview modal
  const [isLoading, setIsLoading] = useState(true);

  // Load user listings
  const loadReports = () => {
    setIsLoading(true);
    try {
      const all = getAllUnifiedReports();
      // Filter for items belonging to current user or default user demo items
      const mine = all.filter((item) => {
        const id = String(item.id || item._id);
        return (
          item.isUserCreated ||
          item.owner?._id === "user_current" ||
          item.owner?.isCurrentUser ||
          DEFAULT_USER_ITEM_IDS.has(id)
        );
      });
      setUserReports(mine);
    } catch (err) {
      console.error("Failed to load user reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Filter listings based on status, type, and search query
  const filteredListings = useMemo(() => {
    return userReports.filter((item) => {
      // 1. Type filter
      if (typeFilter !== "all" && item.type !== typeFilter) return false;

      // 2. Status filter
      if (statusFilter === "active") {
        if (item.status === "resolved") return false;
      } else if (statusFilter === "resolved") {
        if (item.status !== "resolved") return false;
      } else if (statusFilter === "in_review") {
        if (item.status !== "in_review" && item.status !== "matched") return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = (item.title || item.name || "").toLowerCase();
        const loc = (item.location || "").toLowerCase();
        const cat = (item.category || "").toLowerCase();
        if (!title.includes(q) && !loc.includes(q) && !cat.includes(q)) return false;
      }

      return true;
    });
  }, [userReports, typeFilter, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = userReports.length;
    const activeLost = userReports.filter((it) => it.type === "lost" && it.status !== "resolved").length;
    const activeFound = userReports.filter((it) => it.type === "found" && it.status !== "resolved").length;
    const resolved = userReports.filter((it) => it.status === "resolved").length;
    return { total, activeLost, activeFound, resolved };
  }, [userReports]);

  // Handle Mark as Resolved
  const handleMarkResolved = async (id, e) => {
    if (e) e.stopPropagation();
    await resolveReport(id);
    loadReports();
    if (selectedItem && (selectedItem.id === id || selectedItem._id === id)) {
      setSelectedItem((prev) => ({ ...prev, status: "resolved" }));
    }
  };

  // Handle Delete
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this report?")) {
      await deleteReport(id);
      loadReports();
      if (selectedItem && (selectedItem.id === id || selectedItem._id === id)) {
        setSelectedItem(null);
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "ID,Title,Type,Category,Location,Status,Date\n";
    const rows = filteredListings
      .map((it) =>
        [
          it.id || it._id,
          `"${(it.title || it.name || "").replace(/"/g, '""')}"`,
          it.type,
          it.category,
          `"${(it.location || "").replace(/"/g, '""')}"`,
          it.status,
          it.date || "Recent",
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-findora-listings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
              My Reported Listings
            </h2>
            <span className="rounded-full bg-[#9ae600]/15 px-2.5 py-0.5 text-xs font-mono font-bold text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30">
              {userReports.length} {userReports.length === 1 ? "Listing" : "Listings"}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor and manage your active lost and found reports directly inside your dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Table / Cards Switcher */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/[0.06] p-1 border border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Table view"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <LayoutList size={14} />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              title="Cards view"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                viewMode === "cards"
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          {/* Report Item Action */}
          <Link
            href="/reports/new"
            className="btn-primary-glow inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-slate-950 shadow-sm"
          >
            <PlusCircle size={15} />
            <span>Report Item</span>
          </Link>
        </div>
      </div>

      {/* 2. Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Listings</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white font-heading">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-rose-500">Active Lost</p>
          <p className="mt-1 text-2xl font-black text-rose-500 font-heading">{stats.activeLost}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#72a800] dark:text-[#9ae600]">Active Found</p>
          <p className="mt-1 text-2xl font-black text-[#72a800] dark:text-[#9ae600] font-heading">{stats.activeFound}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-500">Reunited / Resolved</p>
          <p className="mt-1 text-2xl font-black text-emerald-500 font-heading">{stats.resolved}</p>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your listings by title, category, or area..."
            className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.04] pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:outline-none focus:border-[#9ae600]"
          />
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter pill group */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/[0.04] p-1 border border-slate-200 dark:border-white/10 text-xs">
            {["all", "active", "resolved"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer text-[11px]",
                  statusFilter === st
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Type filter pill group */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/[0.04] p-1 border border-slate-200 dark:border-white/10 text-xs">
            {["all", "lost", "found"].map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setTypeFilter(tp)}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer text-[11px]",
                  typeFilter === tp
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {tp === "all" ? "All Types" : tp}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            title="Export CSV"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-white/10"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* 4. Listings View: Table or Cards */}
      {filteredListings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#070b04] border border-dashed border-slate-300 dark:border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 mx-auto flex items-center justify-center text-slate-400 mb-3">
            <Package size={22} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            No matching listings found
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No reports match "${searchQuery}". Try adjusting your keywords or clearing filters.`
              : "You haven't submitted any listings yet. Create a lost or found report to get started."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white"
              >
                Clear Filters
              </button>
            )}
            <Link
              href="/reports/new"
              className="btn-primary-glow px-4 py-1.5 text-xs font-bold rounded-xl text-slate-950 inline-flex items-center gap-1.5"
            >
              <PlusCircle size={14} />
              <span>Report an Item</span>
            </Link>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02] text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {filteredListings.map((item) => {
                  const id = item.id || item._id;
                  const isResolved = item.status === "resolved";
                  const isLost = item.type === "lost";

                  return (
                    <tr
                      key={id}
                      onClick={() => setSelectedItem(item)}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      {/* Item Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title || item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Package size={16} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[220px]">
                              {item.title || item.name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 truncate">
                              ID: {id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider",
                            isLost
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : "bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30"
                          )}
                        >
                          {item.type}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {item.category || "General"}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 max-w-[180px] truncate">
                          <MapPin size={12} className="shrink-0 text-slate-400" />
                          <span className="truncate">{item.location || "Dhaka"}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {item.date || "Recent"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={11} />
                            Reunited
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <Clock size={11} />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            title="Quick View"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>

                          {!isResolved && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkResolved(id, e)}
                              title="Mark as Reunited / Resolved"
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold transition-colors cursor-pointer border border-emerald-500/30"
                            >
                              Resolve
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleDelete(id, e)}
                            title="Delete Report"
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
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
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((item) => {
            const id = item.id || item._id;
            const isResolved = item.status === "resolved";
            const isLost = item.type === "lost";

            return (
              <div
                key={id}
                onClick={() => setSelectedItem(item)}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] hover:border-[#9ae600]/40 transition-all shadow-xs overflow-hidden cursor-pointer"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package size={28} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Type & Status Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-xs",
                          isLost
                            ? "bg-rose-600/90 text-white"
                            : "bg-[#9ae600] text-slate-950"
                        )}
                      >
                        {item.type}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      {isResolved ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600/90 text-white backdrop-blur-md shadow-xs">
                          Reunited
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md shadow-xs border border-white/20">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 left-3 text-white">
                      <p className="text-[11px] font-mono opacity-80">{item.category || "General"}</p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#72a800] dark:group-hover:text-[#9ae600] transition-colors line-clamp-1 font-heading">
                      {item.title || item.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description || "No further details recorded."}
                    </p>

                    <div className="mt-3.5 space-y-1.5 pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin size={13} className="shrink-0 text-slate-400" />
                        <span className="truncate">{item.location || "Dhaka"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Calendar size={13} className="shrink-0" />
                        <span>{item.date || "Recent"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div
                  className="p-3 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <Eye size={13} />
                    <span>View Details</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {!isResolved && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkResolved(id, e)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold transition-colors cursor-pointer border border-emerald-500/30"
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(id, e)}
                      title="Delete"
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. In-Dashboard Listing Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/10 shadow-2xl p-6"
            >
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase",
                    selectedItem.type === "lost"
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                      : "bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30"
                  )}
                >
                  {selectedItem.type} item
                </span>
                {selectedItem.status === "resolved" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Reunited / Resolved
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Active on Findora
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-950 dark:text-white font-heading">
                {selectedItem.title || selectedItem.name}
              </h3>

              {selectedItem.imageUrl && (
                <div className="mt-4 h-56 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title || selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Description
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedItem.description || "No additional description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                    <p className="font-mono text-slate-400 text-[11px]">Location</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedItem.location || "Dhaka"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                    <p className="font-mono text-slate-400 text-[11px]">Category</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedItem.category || "General"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons inside modal */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {selectedItem.status !== "resolved" && (
                    <button
                      type="button"
                      onClick={() => handleMarkResolved(selectedItem.id || selectedItem._id)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
                    >
                      Mark as Reunited
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedItem.id || selectedItem._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
