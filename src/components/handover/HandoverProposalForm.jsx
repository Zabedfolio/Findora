"use client";

import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Send,
  Loader2,
  ShieldCheck,
  Building2,
  GraduationCap,
  Train,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  X,
  Info,
} from "lucide-react";
import toast from "@/lib/toast";
import useAuth from "@/hooks/useAuth";
import { createHandoverProposal } from "@/services/handoverService";

const PUBLIC_LOCATION_SUGGESTIONS = [
  { label: "Police Station Lobby", icon: Building2, desc: "Monitored & secure" },
  { label: "Campus Gate / Security Desk", icon: GraduationCap, desc: "High foot-traffic" },
  { label: "Metro / Transit Station", icon: Train, desc: "CCTV surveillance" },
  { label: "Shopping Mall Information Desk", icon: ShoppingBag, desc: "Well-lit & staffed" },
];

const PRESET_TIME_SLOTS = [
  "Morning (09:30 AM - 11:30 AM)",
  "Lunch Hour (01:00 PM - 02:00 PM)",
  "Afternoon (03:30 PM - 05:00 PM)",
  "Evening (05:30 PM - 07:00 PM)",
];

export default function HandoverProposalForm({
  claim,
  claimId,
  reportId,
  itemTitle,
  itemCategory,
  itemThumbnail,
  onClose,
  onSubmitProposal,
  onSuccess,
}) {
  const { user } = useAuth();
  // Prevent selecting any dates before today
  const todayStr = new Date().toISOString().split("T")[0];

  const effectiveTitle = claim?.itemTitle || claim?.item?.title || itemTitle || "Verified Belonging";
  const effectiveCategory = claim?.category || itemCategory || "Valuables";
  const effectiveThumbnail =
    claim?.itemThumbnail || claim?.item?.thumbnail || itemThumbnail || "";
  const effectiveClaimId = claim?.id || claim?._id || claimId || "";
  const effectiveReportId = claim?.reportId || claim?.report?._id || reportId || "";

  const [meetingDate, setMeetingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(PRESET_TIME_SLOTS[0]);
  const [customTime, setCustomTime] = useState("");
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [location, setLocation] = useState("");
  const [safetyNote, setSafetyNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSpotSelect = (spotLabel) => {
    setLocation(spotLabel);
    if (error) setError("");
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (val < todayStr) {
      setError("Cannot schedule handovers in the past. Please choose a future date.");
      return;
    }
    setMeetingDate(val);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!meetingDate) {
      setError("Please select a valid meeting date.");
      toast.error("Please pick a meeting date.");
      return;
    }

    if (meetingDate < todayStr) {
      setError("Selected date has already passed. Please pick today or a future date.");
      toast.error("Invalid meeting date.");
      return;
    }

    const finalTimeSlot = isCustomTime ? customTime.trim() : timeSlot;
    if (!finalTimeSlot) {
      setError("Please select or enter a meeting time slot.");
      toast.error("Please choose a time slot.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter a safe public meeting location.");
      toast.error("Please specify a meeting spot.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        claimId: effectiveClaimId,
        reportId: effectiveReportId,
        itemTitle: effectiveTitle,
        itemCategory: effectiveCategory,
        itemThumbnail: effectiveThumbnail,
        meetingDate,
        timeSlot: finalTimeSlot,
        location: location.trim(),
        safetyNote: safetyNote.trim() || "Please meet inside the public lobby next to security.",
        proposedBy: "owner",
        owner: claim?.owner || claim?.claimant || {
          id: user?.id || user?._id || "usr_owner",
          name: user?.name || claim?.claimantName || "Verified Owner",
          email: user?.email || "owner@findora.app",
          avatar: user?.avatar || claim?.claimantAvatar || "/default-avatar.png",
          role: "owner",
        },
        finder: claim?.finder || {
          id: claim?.finder?.id || claim?.finder?._id || "usr_finder",
          name: claim?.finderName || claim?.finder?.name || "Verified Finder",
          email: claim?.finder?.email || "finder@findora.app",
          avatar: claim?.finderAvatar || claim?.finder?.avatar || "/default-avatar.png",
          role: "finder",
        },
      };

      let result;
      if (onSubmitProposal) {
        result = await onSubmitProposal(payload);
      } else {
        result = await createHandoverProposal(payload);
      }

      toast.success("Safe Handover meeting proposed successfully!");
      if (onSuccess) onSuccess(result);
      if (onClose) onClose();
    } catch (err) {
      const msg = err.message || "Failed to create handover proposal.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      
      {/* Background glowing ambient mesh */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#9ae600]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Close Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10"
          aria-label="Close form"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-start gap-3.5 mb-5 pr-8">
        <div className="w-11 h-11 rounded-2xl bg-[#9ae600]/20 border border-[#9ae600]/40 flex items-center justify-center text-[#72a800] dark:text-[#9ae600] shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white font-heading">
              Propose Safe Handover
            </h2>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5">
              APPROVED CLAIM
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Coordinate a safe, public meeting to return{" "}
            <strong className="text-slate-800 dark:text-slate-200 font-semibold truncate">
              {effectiveTitle}
            </strong>
            .
          </p>
        </div>
      </div>

      {/* MANDATORY SAFETY WARNING BANNER */}
      <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-bold tracking-tight">Safety First Protocol</p>
          <p className="text-amber-800/90 dark:text-amber-300/90 mt-0.5 font-medium">
            &ldquo;Always meet in a well-lit, public place.&rdquo; Never arrange handovers at private residences or isolated locations.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Meeting Date with past-date blocking validation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Meeting Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                min={todayStr}
                required
                value={meetingDate}
                onChange={handleDateChange}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#9ae600] transition-all scheme-light dark:scheme-dark"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Validation blocks selecting past dates.
            </p>
          </div>

          {/* Time Slot */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Time Slot <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomTime(!isCustomTime)}
                className="text-[10px] font-bold text-[#72a800] dark:text-[#9ae600] hover:underline cursor-pointer"
              >
                {isCustomTime ? "Use Presets" : "Custom Time"}
              </button>
            </div>

            {isCustomTime ? (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. 04:30 PM"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#9ae600] transition-all"
                />
              </div>
            ) : (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </span>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#9ae600] transition-all cursor-pointer"
                >
                  {PRESET_TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Public Meeting Location */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Public Meeting Location <span className="text-rose-500">*</span>
          </label>
          <div className="relative mb-2">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4 text-[#72a800] dark:text-[#9ae600]" />
            </span>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g., Central Police Station Lobby or Campus Gate 1"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9ae600] transition-all"
            />
          </div>

          {/* Quick Safe Suggestion Pills */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
              Verified Spots:
            </span>
            {PUBLIC_LOCATION_SUGGESTIONS.map((spot) => {
              const Icon = spot.icon;
              const isSelected = location.includes(spot.label);
              return (
                <button
                  key={spot.label}
                  type="button"
                  onClick={() => handleSpotSelect(spot.label)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#9ae600]/20 border-[#9ae600]/50 text-slate-950 dark:text-white font-bold"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#72a800] dark:text-[#9ae600]" />
                  <span>{spot.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Safety Note */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Safety Note / Handover Instructions
          </label>
          <textarea
            rows={2}
            value={safetyNote}
            onChange={(e) => setSafetyNote(e.target.value)}
            placeholder="e.g., Meet by the main security reception desk. I will be wearing a grey jacket and carry an ID."
            className="w-full p-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9ae600] transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#9ae600] hover:bg-[#88cc00] active:scale-98 text-slate-950 font-bold text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Proposal...</span>
              </>
            ) : (
              <>
                <span>Send Handover Proposal</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
