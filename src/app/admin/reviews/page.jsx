"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Sparkles,
  ExternalLink,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/utils/cn";
import toast from "@/lib/toast";

const STORAGE_REVIEWS_KEY = "findora_admin_reviews_v1";

const INITIAL_REVIEWS = [
  {
    id: "rev-101",
    reviewer: "Imran Hossain",
    reviewerEmail: "imran@example.com",
    avatar: "/default-avatar.png",
    targetItem: "Dell XPS 15 Laptop (Silver)",
    targetOwner: "Tanvir Ahmed",
    rating: 1,
    comment: "This person refused to return my laptop unless I sent 10,000 BDT via bKash! Total extortion scammer, ban them immediately!",
    flagReason: "Extortion / Illegal ransom demand",
    status: "flagged",
    date: "1 hour ago",
    reportCount: 3,
  },
  {
    id: "rev-102",
    reviewer: "CryptoTrader_99",
    reviewerEmail: "spammer99@telegram.xyz",
    avatar: "/default-avatar.png",
    targetItem: "Leather Bifold Wallet",
    targetOwner: "Sarah Khan",
    rating: 5,
    comment: "Nice wallet. Join our telegram channel t.me/fast_recovery_bd for instant crypto recovery tools! Guaranteed results in 5 mins.",
    flagReason: "Spam & unauthorized promotion",
    status: "flagged",
    date: "3 hours ago",
    reportCount: 5,
  },
  {
    id: "rev-103",
    reviewer: "Farhana Yasmin",
    reviewerEmail: "farhana.y@gmail.com",
    avatar: "/default-avatar.png",
    targetItem: "Sony WH-1000XM5 Headphones",
    targetOwner: "Zabed Mahmud",
    rating: 5,
    comment: "Incredible person! Found my headphones at Dhanmondi Lake and handed them back without asking for anything. Restored my faith in humanity.",
    flagReason: null,
    status: "approved",
    date: "Yesterday",
    reportCount: 0,
  },
  {
    id: "rev-104",
    reviewer: "Anonymous_User",
    reviewerEmail: "anon.throwaway@mail.com",
    avatar: "/default-avatar.png",
    targetItem: "Blue Hydro Flask & Car Keys",
    targetOwner: "Rahim Chowdhury",
    rating: 1,
    comment: "Liars and thieves. You guys are all stupid scammers. Don't trust this platform at all.",
    flagReason: "Profanity / abusive language",
    status: "flagged",
    date: "2 days ago",
    reportCount: 2,
  },
  {
    id: "rev-105",
    reviewer: "Kazi Nabil",
    reviewerEmail: "nabil.kazi@outlook.com",
    avatar: "/default-avatar.png",
    targetItem: "Apple iPhone 14 Pro Max",
    targetOwner: "Dr. Ayesha Siddiqua",
    rating: 5,
    comment: "Met up at Banani Police Station for safe handover. Verified IMEI number on spot. Thank you Findora for making this possible!",
    flagReason: null,
    status: "approved",
    date: "3 days ago",
    reportCount: 0,
  },
  {
    id: "rev-106",
    reviewer: "Sabbir Hossain",
    reviewerEmail: "sabbir.bd@yahoo.com",
    avatar: "/default-avatar.png",
    targetItem: "Black Tumi Backpack with Passport",
    targetOwner: "Fahim Shahriar",
    rating: 2,
    comment: "The finder took 4 days to reply to my claim message. My flight almost got missed. Very stressful experience.",
    flagReason: "Disputed service complaint",
    status: "pending",
    date: "4 days ago",
    reportCount: 1,
  },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'flagged' | 'pending' | 'approved' | 'hidden'
  const [ratingFilter, setRatingFilter] = useState("all");

  // Load reviews from localStorage or seed
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_REVIEWS_KEY);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        setReviews(INITIAL_REVIEWS);
        localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
      }
    } catch {
      setReviews(INITIAL_REVIEWS);
    }
  }, []);

  const saveReviews = (nextReviews) => {
    setReviews(nextReviews);
    try {
      localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(nextReviews));
    } catch {}
  };

  // Moderation Actions
  const handleApprove = (id) => {
    const updated = reviews.map((r) =>
      r.id === id ? { ...r, status: "approved", flagReason: null } : r
    );
    saveReviews(updated);
    toast.success("Review approved and marked clean");
  };

  const handleHide = (id) => {
    const updated = reviews.map((r) =>
      r.id === id ? { ...r, status: "hidden" } : r
    );
    saveReviews(updated);
    toast.warning("Inappropriate review hidden from public directory");
  };

  const handleDismissFlag = (id) => {
    const updated = reviews.map((r) =>
      r.id === id ? { ...r, status: "approved", flagReason: null, reportCount: 0 } : r
    );
    saveReviews(updated);
    toast.info("Flag dismissed: review deemed legitimate");
  };

  const handleDelete = (id) => {
    const updated = reviews.filter((r) => r.id !== id);
    saveReviews(updated);
    toast.success("Review permanently deleted from platform");
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.reviewer.toLowerCase().includes(q) ||
          item.comment.toLowerCase().includes(q) ||
          item.targetItem.toLowerCase().includes(q) ||
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

  // Review KPI Metrics
  const metrics = useMemo(() => {
    let flagged = 0;
    let pending = 0;
    let approved = 0;
    let hidden = 0;

    for (const r of reviews) {
      if (r.status === "flagged") flagged++;
      if (r.status === "pending") pending++;
      if (r.status === "approved") approved++;
      if (r.status === "hidden") hidden++;
    }

    return { total: reviews.length, flagged, pending, approved, hidden };
  }, [reviews]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <MessageSquareWarning size={18} />
            </span>
            <h2 className="font-display text-xl font-bold text-slate-950 dark:text-white">
              Community Review Moderation
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Audit user testimonials, remove harassment or scam promotions, and protect community trust.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            saveReviews(INITIAL_REVIEWS);
            toast.success("Demo reviews reset to initial state");
          }}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        >
          Reset Demo Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Total Reviews
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
            {metrics.total}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            All user feedback entries
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
            Reported by community members
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Approved &amp; Live
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics.approved}
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
            {metrics.hidden}
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
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] text-slate-400">
            <p className="font-semibold text-sm">No reviews match your filters</p>
            <p className="text-xs mt-1">Try resetting the status filter or keyword search</p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isFlagged = rev.status === "flagged";
            const isHidden = rev.status === "hidden";
            const isApproved = rev.status === "approved";

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
