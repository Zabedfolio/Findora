"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import {
  Handshake,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  PackageCheck,
  RotateCcw,
  Star,
  X,
  FileCheck,
} from "lucide-react";
import toast from "@/lib/toast";
import useAuth from "@/hooks/useAuth";
import HandoverCard from "@/components/handover/HandoverCard";
import HandoverProposalForm from "@/components/handover/HandoverProposalForm";
import ReviewForm from "@/components/reviews/ReviewForm";
import { getHandovers } from "@/services/handoverService";

function HandoversDashboardContent() {
  const { user } = useAuth();
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' | 'past' | 'all'
  const [searchQuery, setSearchQuery] = useState("");
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [reviewModalHandover, setReviewModalHandover] = useState(null);

  // Fetch handovers strictly for the authenticated user
  const loadHandovers = useCallback(async () => {
    if (!user) {
      setHandovers([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getHandovers("all", user);
      setHandovers(data.all || []);
    } catch (err) {
      console.error("Failed to load handovers:", err);
      toast.error("Could not load handover records.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHandovers();
  }, [loadHandovers]);

  // Filter handovers based on activeTab and searchQuery
  const filteredHandovers = useMemo(() => {
    return handovers.filter((h) => {
      // Tab filter
      if (activeTab === "upcoming") {
        if (h.status !== "proposed" && h.status !== "confirmed") return false;
      } else if (activeTab === "past") {
        if (h.status !== "completed" && h.status !== "reunited") return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (h.itemTitle || "").toLowerCase();
        const loc = (h.location || "").toLowerCase();
        const owner = (h.owner?.name || "").toLowerCase();
        const finder = (h.finder?.name || "").toLowerCase();
        return (
          title.includes(q) || loc.includes(q) || owner.includes(q) || finder.includes(q)
        );
      }
      return true;
    });
  }, [handovers, activeTab, searchQuery]);

  // Derived KPI Counts
  const counts = useMemo(() => {
    const total = handovers.length;
    const upcoming = handovers.filter(
      (h) => h.status === "proposed" || h.status === "confirmed"
    ).length;
    const confirmed = handovers.filter((h) => h.status === "confirmed").length;
    const completed = handovers.filter(
      (h) => h.status === "completed" || h.status === "reunited"
    ).length;
    return { total, upcoming, confirmed, completed };
  }, [handovers]);

  // Handle Handover State Changes (Accept, Counter-proposal, Completion)
  const handleStatusChange = (updatedHandover) => {
    setHandovers((prev) =>
      prev.map((item) =>
        item._id === updatedHandover._id || item.id === updatedHandover.id
          ? updatedHandover
          : item
      )
    );
  };

  // Triggered when completing a handover or clicking "Rate & Review Exchange"
  const handleOpenReview = (handover) => {
    setReviewModalHandover(handover);
  };

  const handleReviewSubmit = async (reviewData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("Thank you! Your verified community rating has been recorded.");
    setReviewModalHandover(null);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-950 dark:text-white tracking-tight">
              Safe Handovers &amp; Return Meetings
            </h1>
            <span className="rounded-full bg-[#9ae600]/20 text-[#689c00] dark:text-[#9ae600] border border-[#9ae600]/40 text-xs font-mono font-bold px-2.5 py-0.5">
              PHASE 6 &amp; 7
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Coordinate verified physical meeting locations, exchange custody with two-party confirmation, and unlock member reputation reviews.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsProposalModalOpen(true)}
          className="btn-primary-glow inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#9ae600] hover:bg-[#88cc00] text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Propose Handover Meeting</span>
        </button>
      </div>

      {/* 2. Built-in Safety Protocol Banner */}
      <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 flex items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="text-xs">
            <p className="font-bold tracking-tight text-slate-950 dark:text-white">
              Official Safety Protocol: &ldquo;Always meet in a well-lit, public place.&rdquo;
            </p>
            <p className="text-amber-800/90 dark:text-amber-300/90 mt-0.5">
              Recommended locations: Police station lobbies, campus security gates, or metro station ticket concourses. Never conduct private exchanges.
            </p>
          </div>
        </div>

        <Link
          href="/trust"
          className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 hover:underline shrink-0"
        >
          <span>Safety Guidelines</span>
          <FileCheck size={13} />
        </Link>
      </div>

      {/* 3. Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Total Handover Records
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
            {counts.total}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">Scheduled exchanges</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-500">
            Upcoming Meetings
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-500">
            {counts.upcoming}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">Proposed &amp; active</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#72a800] dark:text-[#9ae600]">
            Confirmed Schedules
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-[#72a800] dark:text-[#9ae600]">
            {counts.confirmed}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">Both parties aligned</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Reunited &amp; Resolved
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {counts.completed}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">2-party verified returns</p>
        </div>
      </div>

      {/* 4. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Tabs: Upcoming Handovers vs Past Exchanges */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "upcoming"
                ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Upcoming Handovers ({counts.upcoming})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "past"
                ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Past Exchanges ({counts.completed})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({counts.total})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by item or location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9ae600]"
          />
        </div>
      </div>

      {/* 5. Handover Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-850 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : filteredHandovers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredHandovers.map((item) => {
            const isFinder =
              (user?.id && (item.finder?.id === user.id || item.finder?.id === user._id)) ||
              (user?.email && item.finder?.email?.toLowerCase() === user.email?.toLowerCase());
            const role = isFinder ? "finder" : "owner";

            return (
              <HandoverCard
                key={item._id || item.id}
                handover={item}
                onStatusChange={handleStatusChange}
                onOpenReview={handleOpenReview}
                currentRole={role}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] flex items-center justify-center mx-auto mb-3">
            <Handshake size={28} />
          </div>
          <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
            {handovers.length === 0
              ? "No Safe Handovers Yet"
              : `No ${activeTab === "upcoming" ? "upcoming" : activeTab === "past" ? "completed" : ""} handovers found`}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? "No handover meetings match your search query."
              : handovers.length === 0
              ? "Safe handovers appear here automatically once an ownership claim is verified and accepted by both parties."
              : "No exchanges currently match this filter tab."}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard?tab=claims"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              <span>View Claims &amp; Verification</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsProposalModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#9ae600] hover:bg-[#88cc00] text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Propose Handover Meeting</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. Handover Proposal Modal */}
      {isProposalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl">
            <HandoverProposalForm
              onClose={() => setIsProposalModalOpen(false)}
              onSuccess={(newProposal) => {
                setHandovers((prev) => [newProposal, ...prev]);
                setActiveTab("upcoming");
              }}
            />
          </div>
        </div>
      )}

      {/* 7. Phase 7 Rating & Review Modal (Triggered on Reunited / Completed) */}
      {reviewModalHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setReviewModalHandover(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>

            <div className="mb-4">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#9ae600]/20 text-[#679900] dark:text-[#9ae600] text-[10px] font-mono font-bold uppercase mb-2">
                Phase 7 Rating Unlocked
              </div>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white font-heading">
                Rate &amp; Review Exchange
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Share your return experience to build trusted community reputation for{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  {reviewModalHandover?.finder?.name || "Finder"}
                </strong>
                .
              </p>
            </div>

            <ReviewForm
              reportId={reviewModalHandover?.reportId}
              reviewee={{
                _id: reviewModalHandover?.finder?.id || "finder_01",
                name: reviewModalHandover?.finder?.name || "Finder",
                avatar: reviewModalHandover?.finder?.avatar || "/default-avatar.png",
                role: "finder",
              }}
              onSubmit={handleReviewSubmit}
              onSuccess={() => setReviewModalHandover(null)}
            />
          </div>
        </div>
      )}

      {/* Footer Branding Strip */}
      <p className="pt-6 text-center text-[11px] font-mono text-slate-400 dark:text-slate-600">
        Findora Trust Protocol · Secure Public Handover Verification System
      </p>

    </div>
  );
}

export default function HandoversDashboardPage() {
  return (
    <Suspense fallback={null}>
      <HandoversDashboardContent />
    </Suspense>
  );
}
