"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/utils/cn";

const DEMO_OUTGOING_CLAIMS = [
  {
    id: "clm-101",
    itemTitle: "Apple iPhone 15 Pro (Natural Titanium)",
    itemType: "lost",
    finderName: "Tanvir Rahman",
    date: "Yesterday at 4:15 PM",
    proofSubmitted: "Clear MagSafe case with small scratch near charging port; family wallpaper on lock screen.",
    status: "approved",
    statusLabel: "Claim Approved",
    handoverDate: "Oct 23, 2026 at 3:00 PM (Dhanmondi Lake Police Box)",
  },
  {
    id: "clm-102",
    itemTitle: "Black Leather Bifold Wallet with National ID",
    itemType: "lost",
    finderName: "Farhan Ahmed",
    date: "2 days ago",
    proofSubmitted: "Contains Smart NID ending in 3821 and blue metro card inside left fold.",
    status: "in_review",
    statusLabel: "Under Finder Verification",
    handoverDate: null,
  },
];

const DEMO_INCOMING_CLAIMS = [
  {
    id: "clm-201",
    itemTitle: "Toyota Smart Key with Blue Leather Fob",
    claimantName: "Kamrul Islam",
    date: "3 hours ago",
    proofAnswer: "Fob has a miniature brass ring with engraved initials 'K.I.' on the back clip.",
    status: "pending_review",
    statusLabel: "Awaiting Your Decision",
  },
];

export default function ClaimsView() {
  const [subTab, setSubTab] = useState("outgoing"); // 'outgoing' | 'incoming'
  const [outgoingClaims, setOutgoingClaims] = useState(DEMO_OUTGOING_CLAIMS);
  const [incomingClaims, setIncomingClaims] = useState(DEMO_INCOMING_CLAIMS);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  const handleApproveIncoming = (id) => {
    setIncomingClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "approved", statusLabel: "Claim Accepted" } : c))
    );
    setActionMessage("Claim approved! You can now coordinate safe handover.");
    setTimeout(() => setActionMessage(""), 3500);
  };

  const handleDeclineIncoming = (id) => {
    setIncomingClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "declined", statusLabel: "Claim Declined" } : c))
    );
    setActionMessage("Claim request declined.");
    setTimeout(() => setActionMessage(""), 3500);
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
        <div className="p-3.5 rounded-2xl bg-[#9ae600]/15 border border-[#9ae600]/30 text-[#629400] dark:text-[#9ae600] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Content */}
      {subTab === "outgoing" ? (
        <div className="space-y-4">
          {outgoingClaims.map((claim) => {
            const isApproved = claim.status === "approved";
            return (
              <div
                key={claim.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs hover:border-[#9ae600]/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Claim ID: {claim.id} · Submitted {claim.date}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading mt-0.5">
                      {claim.itemTitle}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Finder: <strong className="text-slate-800 dark:text-slate-200">{claim.finderName}</strong>
                    </p>
                  </div>

                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto",
                      isApproved
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    )}
                  >
                    {isApproved ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    {claim.statusLabel}
                  </span>
                </div>

                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                    <p className="text-[11px] font-mono text-slate-400">Your Submitted Proof of Ownership:</p>
                    <p className="mt-1 text-slate-700 dark:text-slate-300 italic">{claim.proofSubmitted}</p>
                  </div>

                  {claim.handoverDate && (
                    <div className="p-3 rounded-xl bg-[#9ae600]/10 border border-[#9ae600]/25 text-slate-900 dark:text-white flex items-center gap-2">
                      <Handshake size={15} className="text-[#72a800] dark:text-[#9ae600] shrink-0" />
                      <div>
                        <p className="text-[11px] font-mono font-bold text-[#72a800] dark:text-[#9ae600]">
                          Safe Handover Meeting Scheduled:
                        </p>
                        <p className="font-semibold text-xs mt-0.5">{claim.handoverDate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {incomingClaims.map((claim) => {
            const isApproved = claim.status === "approved";
            const isDeclined = claim.status === "declined";

            return (
              <div
                key={claim.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Claim ID: {claim.id} · Received {claim.date}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading mt-0.5">
                      {claim.itemTitle}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Claimant: <strong className="text-slate-800 dark:text-slate-200">{claim.claimantName}</strong>
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
                    {isApproved ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    {claim.statusLabel}
                  </span>
                </div>

                <div className="mt-3.5 space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                    <p className="text-[11px] font-mono text-slate-400">Claimant&apos;s Proof Answer:</p>
                    <p className="mt-1 text-slate-700 dark:text-slate-300 italic">{claim.proofAnswer}</p>
                  </div>

                  {!isApproved && !isDeclined && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDeclineIncoming(claim.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Decline Proof
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveIncoming(claim.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={13} />
                        <span>Approve &amp; Coordinate Handover</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
