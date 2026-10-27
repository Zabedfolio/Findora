"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ArrowRight,
  Handshake,
  Search,
  MessageSquare,
  AlertCircle,
  Package,
  Calendar,
  User,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/utils/cn";
import useAuth from "@/hooks/useAuth";
import toast from "@/lib/toast";
import {
  getMyClaims,
  approveClaim,
  rejectClaim,
} from "@/services/claimService";

export default function ClaimsView() {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState("outgoing"); // 'outgoing' | 'incoming'
  const [outgoingClaims, setOutgoingClaims] = useState([]);
  const [incomingClaims, setIncomingClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  const loadClaims = useCallback(async () => {
    if (!user) {
      setOutgoingClaims([]);
      setIncomingClaims([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [outRes, inRes] = await Promise.all([
        getMyClaims({ type: "outgoing" }, user),
        getMyClaims({ type: "incoming" }, user),
      ]);
      setOutgoingClaims(outRes?.claims || []);
      setIncomingClaims(inRes?.claims || []);
    } catch (err) {
      console.error("Failed to load claims in ClaimsView:", err);
      toast.error("Could not load your claims data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const handleApproveIncoming = async (id) => {
    try {
      setActionLoading(`approve-${id}`);
      const updated = await approveClaim(id, "Verified by item finder. Handover authorized.");
      if (updated) {
        setIncomingClaims((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "approved", statusLabel: "Claim Approved" } : c))
        );
        setActionMessage("Claim approved! Safe handover has been scheduled and appears in your Handovers tab.");
        toast.success("Claim approved! Handover proposal created.");
        setTimeout(() => setActionMessage(""), 5000);
      }
    } catch (err) {
      console.error("Failed to approve claim:", err);
      toast.error("Could not approve claim.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineIncoming = async (id) => {
    try {
      setActionLoading(`decline-${id}`);
      const updated = await rejectClaim(id, "Proof details did not match the physical item.");
      if (updated) {
        setIncomingClaims((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "rejected", statusLabel: "Claim Declined" } : c))
        );
        setActionMessage("Claim request declined.");
        toast.success("Claim declined.");
        setTimeout(() => setActionMessage(""), 4000);
      }
    } catch (err) {
      console.error("Failed to decline claim:", err);
      toast.error("Could not decline claim.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
              Claims &amp; Verification Hub
            </h2>
            <span className="rounded-full bg-[#9ae600]/15 px-2.5 py-0.5 text-xs font-mono font-bold text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30">
              {outgoingClaims.length + incomingClaims.length} Active
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track ownership claims you submitted or review incoming proof claims on items you found.
          </p>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/[0.06] p-1 border border-slate-200 dark:border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setSubTab("outgoing")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              subTab === "outgoing"
                ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Claims I Made ({outgoingClaims.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab("incoming")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              subTab === "incoming"
                ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Claims Received ({incomingClaims.length})
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-[#9ae600]/15 border border-[#9ae600]/30 text-[#629400] dark:text-[#9ae600] text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <Link
            href="/dashboard/handovers"
            className="underline font-bold hover:opacity-80 shrink-0 inline-flex items-center gap-1"
          >
            <span>View Handovers</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4 py-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : subTab === "outgoing" ? (
        /* OUTGOING CLAIMS (Claims made by this user) */
        outgoingClaims.length === 0 ? (
          <div className="p-10 sm:p-12 rounded-3xl bg-white dark:bg-[#070b04] border border-dashed border-slate-300 dark:border-white/10 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
              No Claims Submitted Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
              If you lost an item and spot a matching found listing in the community catalog, submit an ownership claim to coordinate safe recovery.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                href="/reports?type=found"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9ae600] hover:bg-[#88cc00] text-slate-950 text-xs font-bold transition-all shadow-xs"
              >
                <span>Browse Found Listings</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {outgoingClaims.map((claim) => {
              const isApproved = claim.status === "approved" || claim.status === "in_handover";
              const isRejected = claim.status === "rejected";

              return (
                <div
                  key={claim.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs hover:border-[#9ae600]/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Claim #{claim.claimNumber || claim.id} · Submitted {claim.claimedDateFormatted || "Recently"}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading mt-0.5">
                        {claim.itemTitle}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Finder:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {claim.finder?.name || claim.finderName || "Item Finder"}
                        </strong>
                      </p>
                    </div>

                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto",
                        isApproved
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : isRejected
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      )}
                    >
                      {isApproved ? (
                        <CheckCircle2 size={13} />
                      ) : isRejected ? (
                        <XCircle size={13} />
                      ) : (
                        <Clock size={13} />
                      )}
                      {claim.statusLabel || (isApproved ? "Claim Approved" : isRejected ? "Verification Declined" : "Under Review")}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                      <p className="text-[11px] font-mono text-slate-400">Your Submitted Proof of Ownership:</p>
                      <p className="mt-1 text-slate-700 dark:text-slate-300 italic">
                        {claim.claimantProof?.description || claim.proofSubmitted || "Detailed distinguishing description provided."}
                      </p>
                    </div>

                    {isApproved && (
                      <div className="p-3.5 rounded-xl bg-[#9ae600]/10 border border-[#9ae600]/25 text-slate-900 dark:text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Handshake size={18} className="text-[#72a800] dark:text-[#9ae600] shrink-0" />
                          <div>
                            <p className="text-[11px] font-mono font-bold text-[#72a800] dark:text-[#9ae600]">
                              Claim Verified &amp; Handover Ready
                            </p>
                            <p className="font-medium text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                              Coordinate safe exchange date and public spot with finder.
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/dashboard/handovers"
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#9ae600] hover:bg-[#88cc00] text-slate-950 font-bold text-xs shrink-0 shadow-xs"
                        >
                          <span>Manage Handover</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* INCOMING CLAIMS (Claims submitted on items reported by this user) */
        incomingClaims.length === 0 ? (
          <div className="p-10 sm:p-12 rounded-3xl bg-white dark:bg-[#070b04] border border-dashed border-slate-300 dark:border-white/10 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] flex items-center justify-center mx-auto mb-3">
              <Package size={28} />
            </div>
            <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
              No Claims Received Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
              When community members submit proof of ownership for items you found and reported, their claims will appear here for your review and approval.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                href="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9ae600] hover:bg-[#88cc00] text-slate-950 text-xs font-bold transition-all shadow-xs"
              >
                <span>Report a Found Item</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {incomingClaims.map((claim) => {
              const isApproved = claim.status === "approved" || claim.status === "in_handover";
              const isDeclined = claim.status === "rejected" || claim.status === "declined";
              const isPending = !isApproved && !isDeclined;

              return (
                <div
                  key={claim.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Claim #{claim.claimNumber || claim.id} · Received {claim.claimedDateFormatted || "Recently"}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading mt-0.5">
                        {claim.itemTitle}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Claimant:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {claim.claimant?.name || claim.claimantName || "Community Member"}
                        </strong>
                      </p>
                    </div>

                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto",
                        isApproved
                          ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                          : isDeclined
                          ? "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                          : "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                      )}
                    >
                      {isApproved ? (
                        <CheckCircle2 size={13} />
                      ) : isDeclined ? (
                        <XCircle size={13} />
                      ) : (
                        <Clock size={13} />
                      )}
                      {claim.statusLabel || (isApproved ? "Claim Approved" : isDeclined ? "Claim Declined" : "Awaiting Your Decision")}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                      <p className="text-[11px] font-mono text-slate-400">Claimant&apos;s Submitted Proof of Ownership:</p>
                      <p className="mt-1 text-slate-700 dark:text-slate-300 italic">
                        {claim.claimantProof?.description || claim.proofAnswer || "Proof description provided."}
                      </p>
                    </div>

                    {isPending && (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          disabled={actionLoading === `decline-${claim.id}`}
                          onClick={() => handleDeclineIncoming(claim.id)}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {actionLoading === `decline-${claim.id}` ? (
                            <Loader2 size={13} className="animate-spin inline" />
                          ) : (
                            "Decline Proof"
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === `approve-${claim.id}`}
                          onClick={() => handleApproveIncoming(claim.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {actionLoading === `approve-${claim.id}` ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          <span>Approve &amp; Coordinate Handover</span>
                        </button>
                      </div>
                    )}

                    {isApproved && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                        <span className="text-emerald-800 dark:text-emerald-300 font-semibold">
                          Verified! You can coordinate exchange details with claimant.
                        </span>
                        <Link
                          href="/dashboard/handovers"
                          className="text-emerald-700 dark:text-emerald-400 font-bold underline inline-flex items-center gap-1"
                        >
                          <span>Open Handovers Hub</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
