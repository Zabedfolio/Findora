"use client";

import React, { useState, useEffect } from "react";
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
  Star,
  Check,
  Send,
  X,
  ShieldAlert,
  Info,
  PackageCheck,
  ArrowRight,
  Building2,
  AlertCircle,
  Flag,
} from "lucide-react";
import toast from "@/lib/toast";
import useAuth from "@/hooks/useAuth";
import {
  proposeHandoverMeeting,
  acceptHandoverProposal,
  suggestAlternativeProposal,
  acceptCounterProposal,
  declineCounterProposal,
  reportRiskyLocation,
  completeHandover,
} from "@/services/handoverService";

const VERIFIED_SPOTS = [
  "Local Police Station Reception Desk",
  "Bashundhara City Mall Level 1 Information Desk",
  "Metro Station Security Booth / Customer Desk",
  "University Campus Security Gate",
];

const TIME_SLOTS = [
  "Morning (10:00 AM - 12:00 PM)",
  "Afternoon (02:30 PM - 04:30 PM)",
  "Evening (05:00 PM - 07:00 PM)",
];

const RISKY_REASONS = [
  "Private residence or isolated venue instead of public spot",
  "Late night or dark meeting time proposed",
  "Counterparty refused to meet in monitored public safe zone",
  "Suspicious requests or unexpected fee demands",
  "Other safety or security risk",
];

export default function HandoverCard({
  handover = {},
  onStatusChange,
  onOpenReview,
  currentRole = "receiver", // 'receiver' | 'finder' | 'admin'
}) {
  const { user } = useAuth();
  const [data, setData] = useState(handover);
  const [loadingAction, setLoadingAction] = useState(null);

  // Sync prop changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(handover);
  }, [handover]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Finder initial proposal form state
  const [isProposing, setIsProposing] = useState(data?.status === "pending_proposal");
  const [proposalForm, setProposalForm] = useState({
    meetingDate: data?.meetingDate || "",
    timeSlot: data?.timeSlot || "Afternoon (02:30 PM - 04:30 PM)",
    location: data?.location || "",
    safetyNote: data?.safetyNote || "Meet inside public reception under security surveillance.",
  });

  // Receiver counter-proposal drawer state
  const [isAlternativeOpen, setIsAlternativeOpen] = useState(false);
  const [alternativeForm, setAlternativeForm] = useState({
    meetingDate: data?.counterProposal?.meetingDate || data?.meetingDate || "",
    timeSlot: data?.counterProposal?.timeSlot || data?.timeSlot || "Afternoon (02:30 PM - 04:30 PM)",
    location: data?.counterProposal?.location || data?.location || "",
    safetyNote: data?.counterProposal?.safetyNote || "",
  });

  // Risky location reporting modal state
  const [isRiskyModalOpen, setIsRiskyModalOpen] = useState(false);
  const [riskyReason, setRiskyReason] = useState(RISKY_REASONS[0]);
  const [customRiskyNote, setCustomRiskyNote] = useState("");

  const status = data?.status || "pending_proposal";
  const isPendingProposal = status === "pending_proposal";
  const isProposed = status === "proposed";
  const isCounterProposed = status === "counter_proposed";
  const isConfirmed = status === "confirmed";
  const isCompleted = status === "completed" || status === "reunited";

  const confirmations = data?.confirmations || {
    ownerConfirmed: false,
    finderConfirmed: false,
  };

  const currentUserId = String(user?.id || user?._id || user?.userId || "").toLowerCase();
  const currentUserEmail = String(user?.email || "").toLowerCase();

  // Strict role detection
  const isFinder = Boolean(
    (currentUserId && String(data.finder?.userId || data.finder?.id || data.finder?._id || "").toLowerCase() === currentUserId) ||
    (currentUserEmail && String(data.finder?.email || "").toLowerCase() === currentUserEmail) ||
    currentRole === "finder"
  );

  const isReceiver = Boolean(
    !isFinder && (
      (currentUserId && String(data.owner?.userId || data.owner?.id || data.owner?._id || "").toLowerCase() === currentUserId) ||
      (currentUserEmail && String(data.owner?.email || "").toLowerCase() === currentUserEmail) ||
      currentRole === "receiver" ||
      currentRole === "owner"
    )
  );

  const thumbnailSrc = data?.itemThumbnail || "/default-avatar.png";
  const itemTitle = data?.itemTitle || "Reported Item";

  // Stepper calculations
  const STEPS = [
    { key: "proposal", label: isPendingProposal ? "Awaiting Proposal" : "Meeting Proposed" },
    { key: "confirmed", label: "Confirmed" },
    { key: "completed", label: "Reunited & Closed" },
  ];
  const currentStepIndex = isCompleted ? 2 : isConfirmed ? 1 : 0;

  // 1. Finder creates initial proposal
  const handleFinderSubmitProposal = async (e) => {
    e.preventDefault();
    if (!proposalForm.meetingDate || !proposalForm.location) {
      toast.error("Please provide both a meeting date and a public safe location.");
      return;
    }
    setLoadingAction("propose");
    try {
      const updated = await proposeHandoverMeeting(data._id || data.id, proposalForm);
      setData(updated);
      setIsProposing(false);
      toast.success("Safe handover proposal created and sent to receiver!");
      if (onStatusChange) onStatusChange(updated);
    } catch (err) {
      toast.error(err.message || "Failed to submit proposal.");
    } finally {
      setLoadingAction(null);
    }
  };

  // 2. Receiver accepts proposal (Auto-confirms)
  const handleReceiverAccept = async () => {
    setLoadingAction("accept");
    try {
      const updated = await acceptHandoverProposal(data._id || data.id, "owner");
      setData(updated);
      toast.success("Meeting proposal accepted! Safe handover is confirmed.");
      if (onStatusChange) onStatusChange(updated);
    } catch (err) {
      toast.error(err.message || "Could not accept proposal.");
    } finally {
      setLoadingAction(null);
    }
  };

  // 3. Receiver sends alternative suggestion (counter-proposal)
  const handleReceiverSuggestAlternative = async (e) => {
    e.preventDefault();
    if (!alternativeForm.location || !alternativeForm.meetingDate) {
      toast.error("Please provide both a meeting date and safe location.");
      return;
    }
    setLoadingAction("alternative");
    try {
      const updated = await suggestAlternativeProposal(data._id || data.id, {
        ...alternativeForm,
        suggestedBy: "owner",
      });
      setData(updated);
      setIsAlternativeOpen(false);
      toast.success("Alternative schedule counter-proposal sent to finder!");
      if (onStatusChange) onStatusChange(updated);
    } catch (err) {
      toast.error(err.message || "Could not submit alternative schedule.");
    } finally {
      setLoadingAction(null);
    }
  };

  // 4. Finder accepts receiver's counter-proposal
  const handleFinderAcceptCounter = async () => {
    setLoadingAction("accept_counter");
    try {
      const updated = await acceptCounterProposal(data._id || data.id);
      setData(updated);
      toast.success("Alternative schedule accepted! Meeting confirmed.");
      if (onStatusChange) onStatusChange(updated);
    } catch (err) {
      toast.error(err.message || "Failed to accept counter-proposal.");
    } finally {
      setLoadingAction(null);
    }
  };

  // 5. Finder declines receiver's counter-proposal
  const handleFinderDeclineCounter = async () => {
    setLoadingAction("decline_counter");
    try {
      const updated = await declineCounterProposal(data._id || data.id);
      setData(updated);
      toast.info("Alternative schedule declined. Original proposal maintained.");
      if (onStatusChange) onStatusChange(updated);
    } catch (err) {
      toast.error(err.message || "Failed to decline counter-proposal.");
    } finally {
      setLoadingAction(null);
    }
  };

  // 6. Report risky location to admin
  const handleReportRiskySubmit = async (e) => {
    e.preventDefault();
    setLoadingAction("report_risky");
    try {
      const fullReason = customRiskyNote.trim()
        ? `${riskyReason}: ${customRiskyNote.trim()}`
        : riskyReason;

      const updated = await reportRiskyLocation(data._id || data.id, {
        reason: fullReason,
        role: isFinder ? "finder" : "receiver",
        userId: currentUserId,
      });
      setData(updated);
      setIsRiskyModalOpen(false);
      setCustomRiskyNote("");
      toast.success("Location safety concern reported to Findora Trust & Safety team.");
      if (onStatusChange) onStatusChange(updated);
    } catch (err) {
      toast.error(err.message || "Failed to submit safety report.");
    } finally {
      setLoadingAction(null);
    }
  };

  // 7. Dual confirmation (physical exchange confirmation)
  const handlePartyConfirm = async (roleToConfirm) => {
    setLoadingAction(roleToConfirm);
    try {
      const { handover: updated, isFullyCompleted } = await completeHandover(
        data._id || data.id,
        roleToConfirm,
        user
      );
      setData(updated);
      if (isFullyCompleted) {
        toast.success("🎉 Both parties confirmed! Handover mutually verified & completed.");
        if (isReceiver && onOpenReview) {
          onOpenReview(updated);
        }
      } else {
        toast.success(
          `Delivery confirmed as ${roleToConfirm === "owner" ? "Receiver" : "Finder"}. Awaiting counterparty confirmation.`
        );
      }
      if (onStatusChange) onStatusChange(updated);
    } catch (err) {
      toast.error(err.message || "Failed to confirm handover.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-lg transition-all duration-200 relative overflow-hidden flex flex-col justify-start gap-5 h-fit self-start w-full">
      {/* Background glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#9ae600]/10 rounded-full blur-2xl pointer-events-none" />

      {/* TOP: Item & Role Info */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailSrc}
                alt={itemTitle}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Handover Ticket
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {itemTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Receiver: <strong className="text-slate-800 dark:text-slate-200">{data.owner?.name || "Claimant"}</strong>
                {" • "}
                Finder: <strong className="text-slate-800 dark:text-slate-200">{data.finder?.name || "Finder"}</strong>
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-tight shrink-0 border ${
              isCompleted
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : isConfirmed
                ? "bg-[#9ae600]/20 text-[#609100] dark:text-[#9ae600] border-[#9ae600]/40"
                : isCounterProposed
                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
                : isProposed
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
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
            ) : isCounterProposed ? (
              <>
                <Clock size={13} />
                <span>Alternative Suggested</span>
              </>
            ) : isProposed ? (
              <>
                <Clock size={13} />
                <span>Proposal Pending</span>
              </>
            ) : (
              <>
                <Clock size={13} />
                <span>Awaiting Proposal</span>
              </>
            )}
          </span>
        </div>

        {/* STEPPER PROGRESS BAR */}
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
                        isActive ? "bg-[#9ae600]" : "bg-slate-200 dark:bg-slate-800"
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

      {/* OFFICIAL SAFETY / RISKY LOCATION WARNING BANNER */}
      {(data.hasWarning || (data.suspiciousFlags && data.suspiciousFlags.length > 0)) && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs space-y-1 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400">
            <ShieldAlert size={15} />
            <span>Safety Notice: Flagged Location / Alert</span>
          </div>
          {(data.suspiciousFlags || []).map((flag, idx) => (
            <p key={idx} className="pl-6 text-[11px] leading-relaxed">
              • {flag}
            </p>
          ))}
          <p className="pl-6 text-[10.5px] italic text-rose-700/80 dark:text-rose-300/80">
            Always meet inside well-lit public areas with security cameras (e.g. Police Station reception, Metro info desk).
          </p>
        </div>
      )}

      {/* BODY SECTION: Dynamic based on pipeline stage */}

      {/* STAGE 1: PENDING PROPOSAL (Finder must create proposal first) */}
      {isPendingProposal && (
        <div className="space-y-3">
          {isFinder ? (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-500/30 dark:bg-emerald-950/20 dark:border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>You approved this claim! Schedule the safe handover meeting:</span>
              </div>

              <form onSubmit={handleFinderSubmitProposal} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1">
                      Meeting Date
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      required
                      value={proposalForm.meetingDate}
                      onChange={(e) =>
                        setProposalForm({ ...proposalForm, meetingDate: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1">
                      Time Slot
                    </label>
                    <select
                      value={proposalForm.timeSlot}
                      onChange={(e) =>
                        setProposalForm({ ...proposalForm, timeSlot: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1">
                    Safe Public Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Police Station Lobby or Mall Information Desk"
                    value={proposalForm.location}
                    onChange={(e) =>
                      setProposalForm({ ...proposalForm, location: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                  {/* Quick-select verified spots */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {VERIFIED_SPOTS.map((spot) => (
                      <button
                        key={spot}
                        type="button"
                        onClick={() => setProposalForm({ ...proposalForm, location: spot })}
                        className="px-2 py-0.5 rounded-lg bg-white/80 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition"
                      >
                        + {spot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1">
                    Meeting Note / Instructions for Receiver
                  </label>
                  <input
                    type="text"
                    value={proposalForm.safetyNote}
                    onChange={(e) =>
                      setProposalForm({ ...proposalForm, safetyNote: e.target.value })
                    }
                    placeholder="e.g. Meet near the security desk under cameras."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingAction === "propose"}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loadingAction === "propose" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Send Handover Proposal to Receiver</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/40 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300">
                <Clock size={15} />
                <span>Awaiting Finder&apos;s Meeting Proposal</span>
              </div>
              <p className="text-blue-800/90 dark:text-blue-300/90 leading-relaxed text-[11.5px]">
                The finder ({data.finder?.name || "Finder"}) verified your claim! They are currently selecting a verified safe public location, date, and time. You will receive the proposal here to review or suggest changes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* STAGE 2: PROPOSED / COUNTER_PROPOSED / CONFIRMED COORDINATES CARD */}
      {!isPendingProposal && (
        <div className="space-y-3 bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <MapPin className="w-4 h-4 text-[#72a800] dark:text-[#9ae600] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                  Public Meeting Spot
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {data.location || "Public Police Station Lobby"}
                </p>
              </div>
            </div>

            {data.handoverCode && (
              <div className="text-right shrink-0">
                <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                  Exchange Code
                </span>
                <span className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  {data.handoverCode}
                </span>
              </div>
            )}
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
      )}

      {/* HIGHLIGHTED COUNTER-PROPOSAL REVIEW (When receiver suggested an alternative) */}
      {isCounterProposed && data.counterProposal && (
        <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 dark:bg-purple-950/20 dark:border-purple-800/40 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
              <Clock size={14} className="text-purple-600 dark:text-purple-400" />
              <span>Receiver Suggested Alternative Schedule:</span>
            </span>
            <span className="text-[10px] font-bold uppercase rounded-md bg-purple-600/10 text-purple-700 dark:text-purple-300 px-2 py-0.5">
              Pending Finder Decision
            </span>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30 space-y-1.5">
            <p className="font-semibold text-slate-900 dark:text-white">
              📍 {data.counterProposal.location}
            </p>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-300">
              📅 {data.counterProposal.meetingDate} • ⏰ {data.counterProposal.timeSlot}
            </p>
            {data.counterProposal.safetyNote && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                Reason: &ldquo;{data.counterProposal.safetyNote}&rdquo;
              </p>
            )}
          </div>

          {/* Finder Decision on Counter-Proposal */}
          {isFinder && (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={handleFinderAcceptCounter}
                className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                {loadingAction === "accept_counter" ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                <span>Accept Alternative (Update &amp; Confirm)</span>
              </button>

              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={handleFinderDeclineCounter}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                {loadingAction === "decline_counter" ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <X size={13} />
                )}
                <span>Decline (Keep Original)</span>
              </button>
            </div>
          )}

          {isReceiver && (
            <p className="text-[11px] text-purple-700 dark:text-purple-300 italic">
              Your alternative schedule was sent to the finder. Waiting for them to accept or decline.
            </p>
          )}
        </div>
      )}

      {/* TWO-PARTY DIRECT PHYSICAL CONFIRMATION STATUS (When Confirmed) */}
      {!isCompleted && isConfirmed && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>Two-Party Dual Physical Confirmation</span>
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
            {/* Receiver Confirmed Pill */}
            <div
              className={`p-2 rounded-xl flex items-center justify-between gap-1.5 border ${
                confirmations.ownerConfirmed
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {confirmations.ownerConfirmed ? <Check size={13} className="text-emerald-500" /> : <Clock size={13} />}
                <span>Receiver</span>
              </div>
              {isReceiver && !confirmations.ownerConfirmed && (
                <button
                  type="button"
                  disabled={loadingAction !== null}
                  onClick={() => handlePartyConfirm("owner")}
                  className="px-2 py-0.5 rounded-md bg-[#9ae600] text-slate-950 font-bold text-[10px] hover:bg-[#88cc00] cursor-pointer"
                >
                  Confirm
                </button>
              )}
            </div>

            {/* Finder Confirmed Pill */}
            <div
              className={`p-2 rounded-xl flex items-center justify-between gap-1.5 border ${
                confirmations.finderConfirmed
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {confirmations.finderConfirmed ? <Check size={13} className="text-emerald-500" /> : <Clock size={13} />}
                <span>Finder</span>
              </div>
              {isFinder && !confirmations.finderConfirmed && (
                <button
                  type="button"
                  disabled={loadingAction !== null}
                  onClick={() => handlePartyConfirm("finder")}
                  className="px-2 py-0.5 rounded-md bg-[#9ae600] text-slate-950 font-bold text-[10px] hover:bg-[#88cc00] cursor-pointer"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-[10.5px] text-slate-400 dark:text-slate-500">
            Both parties must physically meet and confirm custody on their respective devices before handover completes.
          </p>
        </div>
      )}

      {/* BOTTOM ACTION CONTROLS */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* State A: PROPOSED -> Receiver Controls */}
        {isProposed && (
          <div>
            {isReceiver ? (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  disabled={loadingAction !== null}
                  onClick={handleReceiverAccept}
                  className="flex-1 py-2.5 px-4 bg-[#9ae600] hover:bg-[#88cc00] text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loadingAction === "accept" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Handshake className="w-4 h-4" />
                  )}
                  <span>Accept &amp; Auto-Confirm</span>
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
            ) : isFinder ? (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Clock size={14} className="text-amber-500" />
                <span>Proposal sent to receiver ({data.owner?.name || "Claimant"}). Awaiting their confirmation or suggestion.</span>
              </div>
            ) : null}
          </div>
        )}

        {/* State B: CONFIRMED -> Two-party dual completion */}
        {isConfirmed && (
          <div className="space-y-2.5">
            {isReceiver && !confirmations.ownerConfirmed && (
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handlePartyConfirm("owner")}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loadingAction === "owner" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PackageCheck className="w-4 h-4" />
                )}
                <span>I Received My Item</span>
              </button>
            )}

            {isReceiver && confirmations.ownerConfirmed && !confirmations.finderConfirmed && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2 font-semibold">
                <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                <span>You confirmed receipt! Waiting for finder to confirm item handover.</span>
              </div>
            )}

            {isFinder && !confirmations.finderConfirmed && (
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handlePartyConfirm("finder")}
                className="w-full py-2.5 px-4 bg-[#9ae600] hover:bg-[#88cc00] text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loadingAction === "finder" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Handshake className="w-4 h-4" />
                )}
                <span>I Handed Over Item</span>
              </button>
            )}

            {isFinder && confirmations.finderConfirmed && !confirmations.ownerConfirmed && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2 font-semibold">
                <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                <span>You confirmed handover! Waiting for receiver to confirm item receipt.</span>
              </div>
            )}
          </div>
        )}

        {/* State C: COMPLETED -> Review unlocks strictly for Receiver */}
        {isCompleted && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <div className="flex items-center gap-2 pl-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Reunited &amp; Verified by Both Parties
              </span>
            </div>

            {isReceiver && !data.isReviewed && (
              <button
                type="button"
                onClick={() => onOpenReview && onOpenReview(data)}
                className="py-2 px-3.5 rounded-xl bg-slate-950 dark:bg-[#9ae600] text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
              >
                <Star size={13} className="fill-amber-400 text-amber-400 dark:fill-slate-950 dark:text-slate-950" />
                <span>Rate &amp; Review Finder</span>
              </button>
            )}

            {isReceiver && data.isReviewed && (
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Verified Review Submitted</span>
              </span>
            )}

            {isFinder && (
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Item Returned Safely
              </span>
            )}
          </div>
        )}

        {/* Safety Reporting Footer Button (Accessible to both parties) */}
        {!isCompleted && (
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] text-slate-400">
              Need assistance or feel unsafe?
            </span>
            <button
              type="button"
              onClick={() => setIsRiskyModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition"
            >
              <ShieldAlert size={12} />
              <span>Report Risky Location to Admin</span>
            </button>
          </div>
        )}
      </div>

      {/* INLINE ALTERNATIVE SUGGESTION DRAWER (FOR RECEIVER) */}
      {isAlternativeOpen && isReceiver && (
        <div className="mt-2 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={13} />
              <span>Suggest Alternative Time / Location</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAlternativeOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleReceiverSuggestAlternative} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  required
                  value={alternativeForm.meetingDate}
                  onChange={(e) =>
                    setAlternativeForm({ ...alternativeForm, meetingDate: e.target.value })
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  New Time Slot
                </label>
                <select
                  value={alternativeForm.timeSlot}
                  onChange={(e) =>
                    setAlternativeForm({ ...alternativeForm, timeSlot: e.target.value })
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                New Public Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bashundhara police station"
                value={alternativeForm.location}
                onChange={(e) =>
                  setAlternativeForm({ ...alternativeForm, location: e.target.value })
                }
                className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Reason / Note for Finder
              </label>
              <input
                type="text"
                placeholder="e.g. Police station lobby is safer and closer to metro station."
                value={alternativeForm.safetyNote}
                onChange={(e) =>
                  setAlternativeForm({ ...alternativeForm, safetyNote: e.target.value })
                }
                className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAlternativeOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingAction === "alternative"}
                className="px-3.5 py-1.5 rounded-lg bg-[#9ae600] text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loadingAction === "alternative" ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Send Counter Proposal</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REPORT RISKY LOCATION MODAL */}
      {isRiskyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsRiskyModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900/50 dark:bg-slate-900 z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsRiskyModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <ShieldAlert size={22} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Trust &amp; Safety Alert
                </span>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Report Risky Meeting Location
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              If the counterparty proposed an isolated, private, or hazardous meeting venue, report it directly to Findora administrators. We will flag the record and review immediately.
            </p>

            <form onSubmit={handleReportRiskySubmit} className="space-y-3">
              <div>
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                  Safety Concern Category
                </label>
                <select
                  value={riskyReason}
                  onChange={(e) => setRiskyReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {RISKY_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                  Additional Details / Risk Description
                </label>
                <textarea
                  rows={3}
                  value={customRiskyNote}
                  onChange={(e) => setCustomRiskyNote(e.target.value)}
                  placeholder="e.g. Counterparty insisted on meeting behind an unlit warehouse instead of the police station."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRiskyModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction === "report_risky"}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                >
                  {loadingAction === "report_risky" ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Flag size={13} />
                  )}
                  <span>Report to Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
