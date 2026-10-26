"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Handshake,
  Loader2,
  User,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Star,
  Check,
  Send,
  X,
  FileCheck,
} from "lucide-react";
import toast from "@/lib/toast";
import {
  acceptHandoverProposal,
  suggestAlternativeProposal,
  completeHandover,
} from "@/services/handoverService";

export default function HandoverCard({
  handover = {},
  onStatusChange,
  onOpenReview,
  currentRole = "owner", // 'owner' | 'finder' | 'admin'
}) {
  const [data, setData] = useState(handover);
  const [loadingAction, setLoadingAction] = useState(null);
  const [isAlternativeOpen, setIsAlternativeOpen] = useState(false);
  const [alternativeForm, setAlternativeForm] = useState({
    meetingDate: handover?.meetingDate || "",
    timeSlot: handover?.timeSlot || "Afternoon (03:30 PM - 05:00 PM)",
    location: handover?.location || "",
    safetyNote: "",
  });

  const todayStr = new Date().toISOString().split("T")[0];

  const status = data?.status || "proposed"; // 'proposed' | 'confirmed' | 'completed'
  const isProposed = status === "proposed";
  const isConfirmed = status === "confirmed";
  const isCompleted = status === "completed" || status === "reunited";

  const confirmations = data?.confirmations || {
    ownerConfirmed: false,
    finderConfirmed: false,
  };

  // Status Stepper Steps
  const STEPS = [
    { key: "proposed", label: "Meeting Proposed" },
    { key: "confirmed", label: "Meeting Confirmed" },
    { key: "completed", label: "Reunited & Closed" },
  ];

  const currentStepIndex = isCompleted ? 2 : isConfirmed ? 1 : 0;

  // 1. Accept Proposal Action
  const handleAccept = async () => {
    setLoadingAction("accept");
    try {
      const updated = await acceptHandoverProposal(data._id || data.id, currentRole);
      setData(updated);
      toast.success("Handover meeting accepted & confirmed!");
      if (onStatusChange) onStatusChange(updated);
    } catch (err) {
      toast.error(err.message || "Could not accept proposal.");
    } finally {
      setLoadingAction(null);
    }
  };

  // 2. Suggest Alternative Action
  const handleSuggestAlternative = async (e) => {
    e.preventDefault();
    if (!alternativeForm.location || !alternativeForm.meetingDate) {
      toast.error("Please provide both a safe location and meeting date.");
      return;
    }
    setLoadingAction("alternative");
    try {
      const updated = await suggestAlternativeProposal(data._id || data.id, {
        ...alternativeForm,
        suggestedBy: currentRole,
      });
      setData(updated);
      setIsAlternativeOpen(false);
      toast.success("Alternative proposal sent to counterparty!");
      if (onStatusChange) onStatusChange(updated);
    } catch (err) {
      toast.error(err.message || "Could not submit alternative.");
    } finally {
      setLoadingAction(null);
    }
  };

  // 3. Complete Handover Action (Two-Party Confirmation)
  const handleConfirmCompletion = async (partyRole = currentRole) => {
    setLoadingAction("complete");
    try {
      const { handover: updated, isFullyCompleted } = await completeHandover(
        data._id || data.id,
        partyRole
      );
      setData(updated);
      if (isFullyCompleted) {
        toast.success("🎉 Reunited & Handover Completed! Report marked Resolved.");
        if (onOpenReview) {
          onOpenReview(updated);
        }
      } else {
        toast.success(`You confirmed the exchange. Waiting for ${partyRole === "owner" ? "Finder" : "Owner"} confirmation.`);
      }
      if (onStatusChange) onStatusChange(updated);
    } catch (err) {
      toast.error(err.message || "Failed to mark handover completed.");
    } finally {
      setLoadingAction(null);
    }
  };

  const thumbnailSrc = data?.itemThumbnail || "/default-avatar.png";
  const itemTitle = data?.itemTitle || "Lost & Found Item";

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-lg transition-all duration-200 relative overflow-hidden flex flex-col justify-between gap-5">
      
      {/* Ambient background glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#9ae600]/10 rounded-full blur-2xl pointer-events-none" />

      {/* TOP: Item & Status Badge */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
              <img
                src={thumbnailSrc}
                alt={itemTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                Ticket #{data._id?.slice(-6) || "HND-01"}
              </span>
              <h3 className="text-base font-bold text-slate-950 dark:text-white truncate font-heading">
                {itemTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {data.itemCategory || "Valuables"} • Coordinator:{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {data.proposedBy === "finder" ? data.finder?.name : data.owner?.name}
                </span>
              </p>
            </div>
          </div>

          {/* Status Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-tight shrink-0 border ${
              isCompleted
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : isConfirmed
                ? "bg-[#9ae600]/20 text-[#609100] dark:text-[#9ae600] border-[#9ae600]/40"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={13} />
                <span>Reunited &amp; Completed</span>
              </>
            ) : isConfirmed ? (
              <>
                <Handshake size={13} />
                <span>Meeting Confirmed</span>
              </>
            ) : (
              <>
                <Clock size={13} />
                <span>Proposal Pending</span>
              </>
            )}
          </span>
        </div>

        {/* STEPPER PROGRESS BAR: proposed -> confirmed -> completed */}
        <div className="py-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            {STEPS.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div className="w-full flex items-center mb-1.5">
                    <div
                      className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-[#9ae600]"
                          : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider font-semibold truncate ${
                      isCurrent
                        ? "text-[#72a800] dark:text-[#9ae600] font-bold"
                        : isActive
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MIDDLE: Meeting Coordinates & Safety Note */}
      <div className="space-y-3 bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-[#72a800] dark:text-[#9ae600] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
              Public Meeting Spot
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              {data.location || "Public Police Station Lobby"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{data.meetingDate || "Pending date"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{data.timeSlot || "Pending time"}</span>
          </div>
        </div>

        {data.safetyNote && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11.5px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Note:</span>
            <span className="italic">{data.safetyNote}</span>
          </div>
        )}
      </div>

      {/* TWO-PARTY CONFIRMATION STATUS (When confirmed or pending completion) */}
      {!isCompleted && isConfirmed && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>Two-Party Handover Verification</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {confirmations.ownerConfirmed && confirmations.finderConfirmed
                ? "2/2 CONFIRMED"
                : confirmations.ownerConfirmed || confirmations.finderConfirmed
                ? "1/2 CONFIRMED"
                : "0/2 CONFIRMED"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11.5px]">
            <div className={`p-2 rounded-xl flex items-center gap-2 border ${
              confirmations.ownerConfirmed
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold"
                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
            }`}>
              {confirmations.ownerConfirmed ? <Check size={13} className="text-emerald-500" /> : <Clock size={13} />}
              <span>Owner Confirmed</span>
            </div>
            <div className={`p-2 rounded-xl flex items-center gap-2 border ${
              confirmations.finderConfirmed
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold"
                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
            }`}>
              {confirmations.finderConfirmed ? <Check size={13} className="text-emerald-500" /> : <Clock size={13} />}
              <span>Finder Confirmed</span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS BASED ON STATUS */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        
        {/* State 1: PROPOSED -> Recipient controls */}
        {isProposed && (
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={handleAccept}
              className="flex-1 py-2.5 px-4 bg-[#9ae600] hover:bg-[#88cc00] text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loadingAction === "accept" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Handshake className="w-4 h-4" />
              )}
              <span>Accept Proposal</span>
            </button>

            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={() => setIsAlternativeOpen(!isAlternativeOpen)}
              className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Suggest Alternative
            </button>
          </div>
        )}

        {/* State 2: CONFIRMED -> Post-exchange action */}
        {isConfirmed && (
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={() => handleConfirmCompletion("both")}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loadingAction === "complete" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Mark as Reunited &amp; Completed</span>
            </button>
          </div>
        )}

        {/* State 3: COMPLETED -> Phase 7 Rating unlock */}
        {isCompleted && (
          <div className="flex items-center justify-between gap-3 p-2 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <div className="flex items-center gap-2 pl-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Reunited &amp; Report Resolved
              </span>
            </div>

            <button
              type="button"
              onClick={() => onOpenReview && onOpenReview(data)}
              className="py-2 px-3.5 rounded-xl bg-slate-950 dark:bg-[#9ae600] text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
            >
              <Star size={13} className="fill-amber-400 text-amber-400 dark:fill-slate-950 dark:text-slate-950" />
              <span>Rate &amp; Review Exchange</span>
            </button>
          </div>
        )}

      </div>

      {/* INLINE ALTERNATIVE SUGGESTION DRAWER */}
      {isAlternativeOpen && (
        <div className="mt-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Suggest Alternative Time / Location
            </h4>
            <button
              type="button"
              onClick={() => setIsAlternativeOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSuggestAlternative} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">New Date</label>
                <input
                  type="date"
                  min={todayStr}
                  required
                  value={alternativeForm.meetingDate}
                  onChange={(e) =>
                    setAlternativeForm({ ...alternativeForm, meetingDate: e.target.value })
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">New Time Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 05:00 PM"
                  value={alternativeForm.timeSlot}
                  onChange={(e) =>
                    setAlternativeForm({ ...alternativeForm, timeSlot: e.target.value })
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">New Public Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Police Station or Campus Gate"
                value={alternativeForm.location}
                onChange={(e) =>
                  setAlternativeForm({ ...alternativeForm, location: e.target.value })
                }
                className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAlternativeOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingAction === "alternative"}
                className="px-3.5 py-1.5 rounded-lg bg-[#9ae600] text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                {loadingAction === "alternative" ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Send Counter Proposal</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
