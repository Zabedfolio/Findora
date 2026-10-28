"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquareWarning,
  Star,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  EyeOff,
  User,
  Clock,
  ExternalLink,
  X,
  Check,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import toast from "@/lib/toast";

const STORAGE_REVIEWS_KEY = "findora_admin_reviews_v1";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'flagged' | 'pending' | 'approved' | 'hidden'
  const [ratingFilter, setRatingFilter] = useState("all");

  // Clear legacy mock reviews storage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_REVIEWS_KEY);
      }
    } catch {}
  }, []);

  // Fetch real reviews from backend MongoDB
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiBase}/reviews`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const rawReviews = Array.isArray(json?.data) ? json.data : [];
        const normalized = rawReviews.map((rev) => {
          const rawStatus = rev.status || "published";
          const status = rawStatus === "published" ? "approved" : rawStatus;
          return {
            id: rev._id,
            _id: rev._id,
            reviewer: rev.reviewer?.name || "Verified Member",
            reviewerEmail: rev.reviewer?.email || "verified@findora.app",
            avatar: rev.reviewer?.avatar || "/default-avatar.png",
            targetItem: rev.targetItem?.title || "Returned Property",
            targetOwner: rev.targetUser?.name || "Community Member",
            rating: Number(rev.rating) || 5,
            comment: rev.comment || "",
            flagReason: rev.flagReason || null,
            status,
            date: rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently",
            reportCount: rev.reportCount || 0,
          };
        });
        setReviews(normalized);
        return;
      }
      setReviews([]);
    } catch (err) {
      console.warn("Could not fetch reviews from database:", err.message);
      toast.error("Could not fetch reviews from backend.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [fetchReviews]);

  // Moderation Actions
  const handleApprove = async (id) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiBase}/reviews/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published", flagReason: "" }),
      });

      if (!res.ok) throw new Error("Server rejected review approval");

      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "approved", flagReason: null, reportCount: 0 } : r
        )
      );
      toast.success("Review approved and marked clean in database");
    } catch (err) {
      console.error("Approve review failed:", err);
      toast.error("Failed to approve review.");
    }
  };

  const handleHide = async (id) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiBase}/reviews/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "hidden" }),
      });

      if (!res.ok) throw new Error("Server rejected review status change");

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "hidden" } : r))
      );
      toast.warning("Review hidden from public view in database");
    } catch (err) {
      console.error("Hide review failed:", err);
      toast.error("Failed to hide review.");
    }
  };

  const handleDismissFlag = async (id) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiBase}/reviews/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published", flagReason: "" }),
      });

      if (!res.ok) throw new Error("Server rejected flag dismissal");

      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "approved", flagReason: null, reportCount: 0 } : r
        )
      );
      toast.info("Flag dismissed: review deemed legitimate");
    } catch (err) {
      console.error("Dismiss flag failed:", err);
      toast.error("Failed to dismiss flag.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiBase}/reviews/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Server rejected deletion");

      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review permanently deleted from database");
    } catch (err) {
      console.error("Delete review failed:", err);
      toast.error("Failed to delete review.");
    }
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (item.reviewer || "").toLowerCase().includes(q) ||
          (item.comment || "").toLowerCase().includes(q) ||
          (item.targetItem || "").toLowerCase().includes(q) ||
          (item.flagReason || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Status Filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // 3. Rating Filter
      if (ratingFilter !== "all" && item.rating !== Number(ratingFilter)) {
        return false;
      }

      return true;
    });
  }, [reviews, searchQuery, statusFilter, ratingFilter]);

  // Review KPI Metrics computed from database
  const metrics = useMemo(() => {
    let flagged = 0;
    let pending = 0;
    let approved = 0;
    let hidden = 0;

    for (const r of reviews) {
      if (r.status === "flagged") flagged++;
      if (r.status === "pending") pending++;
      if (r.status === "approved" || r.status === "published") approved++;
      if (r.status === "hidden") hidden++;
    }

    return { total: reviews.length, flagged, pending, approved, hidden };
  }, [reviews]);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-950 dark:text-white">
            Community Reviews Moderation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit verified feedback and ratings submitted after completed handovers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReviews}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-[#9ae600] transition-colors shadow-xs"
        >
          <RefreshCw
            size={13}
            className={loading ? "animate-spin text-[#72a800] dark:text-[#9ae600]" : "text-slate-400"}
          />
          <span>Sync Reviews</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Total Reviews
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : metrics.total}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            All database feedback entries
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-500">
            Flagged for Audit
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-rose-500">
            {loading ? "..." : metrics.flagged}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Reported by community members
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Approved &amp; Live
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {loading ? "..." : metrics.approved}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Clean verified feedback
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Hidden / Moderated
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-700 dark:text-slate-300">
            {loading ? "..." : metrics.hidden}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Removed from public view
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by reviewer, comment keywords, or target item…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9ae600]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#9ae600] cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="flagged">Flagged Only</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="hidden">Hidden</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#9ae600] cursor-pointer"
            >
              <option value="all">Rating: All</option>
              <option value="1">1 Star (Negative)</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Moderation Cards Grid */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] text-slate-400">
            <Loader2 size={24} className="animate-spin mx-auto text-[#72a800] dark:text-[#9ae600] mb-2" />
            <p className="font-semibold text-xs">Loading database reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] text-slate-400">
            <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-2 opacity-80" />
            <p className="font-semibold text-sm text-slate-900 dark:text-white">
              No reviews match your filters
            </p>
            <p className="text-xs mt-1 text-slate-500">
              {reviews.length === 0
                ? "There are currently no reviews in the database."
                : "Try resetting the status filter or keyword search."}
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isFlagged = rev.status === "flagged";
            const isHidden = rev.status === "hidden";
            const isApproved = rev.status === "approved" || rev.status === "published";

            return (
              <div
                key={rev.id}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-200 shadow-xs",
                  isFlagged
                    ? "bg-rose-500/[0.03] dark:bg-rose-500/[0.02] border-rose-500/30"
                    : isHidden
                    ? "bg-slate-50/60 dark:bg-white/[0.01] border-slate-200 dark:border-white/5 opacity-70"
                    : "bg-white dark:bg-[#070b04] border-slate-200 dark:border-white/[0.08]"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  {/* Reviewer Details & Rating */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10 shrink-0 border border-slate-200 dark:border-white/10">
                      <img
                        src={rev.avatar}
                        alt={rev.reviewer}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-950 dark:text-white">
                          {rev.reviewer}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({rev.reviewerEmail})
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          • {rev.date}
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={cn(
                              star <= rev.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300 dark:text-slate-700"
                            )}
                          />
                        ))}
                        <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400">
                          on <strong className="text-slate-700 dark:text-slate-200">{rev.targetItem}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="self-start md:self-auto flex items-center gap-2">
                    {isFlagged ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        <AlertTriangle size={11} />
                        FLAGGED ({rev.reportCount} reports)
                      </span>
                    ) : isHidden ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10">
                        <EyeOff size={11} />
                        HIDDEN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 size={11} />
                        APPROVED
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment Body */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <p>{rev.comment}</p>
                </div>

                {/* Flag Reason Alert Banner */}
                {rev.flagReason && (
                  <div className="mt-2.5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-medium">
                    <ShieldAlert size={13} className="shrink-0" />
                    <span>Flagged Violation: <strong>{rev.flagReason}</strong></span>
                  </div>
                )}

                {/* Moderation Controls Footer */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-[11px] font-mono text-slate-400">
                    Review ID: #{rev.id}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Approve button */}
                    {!isApproved && (
                      <button
                        type="button"
                        onClick={() => handleApprove(rev.id)}
                        className="px-3 py-1.5 rounded-xl font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1 text-xs"
                      >
                        <Check size={12} />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Hide button */}
                    {!isHidden && (
                      <button
                        type="button"
                        onClick={() => handleHide(rev.id)}
                        className="px-3 py-1.5 rounded-xl font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1 text-xs"
                      >
                        <EyeOff size={12} />
                        <span>Hide from Public</span>
                      </button>
                    )}

                    {/* Dismiss flag */}
                    {isFlagged && (
                      <button
                        type="button"
                        onClick={() => handleDismissFlag(rev.id)}
                        className="px-3 py-1.5 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer text-xs"
                      >
                        Dismiss Flag
                      </button>
                    )}

                    {/* Delete permanently */}
                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Delete review permanently"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
