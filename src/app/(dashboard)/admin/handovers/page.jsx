"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Handshake,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Send,
  X,
  AlertCircle,
  Eye,
  Loader2,
  Building2,
  Check,
} from "lucide-react";
import toast from "@/lib/toast";
import { getHandovers, sendAdminWarning } from "@/services/handoverService";

// Pre-defined security warning templates for fast admin dispatch
const PRESET_WARNING_TEMPLATES = [
  {
    id: "police_station",
    title: "Change Venue to Monitored Police Station",
    message:
      "For your personal safety, Findora Trust & Safety recommends relocating this exchange to a local Police Station reception lobby or 24/7 monitored precinct. Do not meet in secluded or private locations.",
    severity: "high",
  },
  {
    id: "late_night",
    title: "Hazardous Meeting Time: Daylight Reschedule Advised",
    message:
      "This meeting is scheduled during late night hours. We strongly advise rescheduling to daylight hours (10:00 AM - 5:00 PM) in a high-traffic public space such as a transit hub or shopping center.",
    severity: "high",
  },
  {
    id: "no_advance_fee",
    title: "Scam Warning: Never Pay Upfront Ransom or Shipping Fees",
    message:
      "Findora never requires cash deposits or upfront transfer fees to reclaim lost property. Never transfer mobile banking funds before physically examining the verified item.",
    severity: "critical",
  },
  {
    id: "escort_public",
    title: "Bring an Accompanist & Stay in Monitored Area",
    message:
      "Please bring a friend or family member with you and remain under active CCTV surveillance coverage. If the other party asks to move to an unmonitored location, terminate the meeting immediately.",
    severity: "warning",
  },
];

export default function AdminHandoversOversightPage() {
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("suspicious"); // 'suspicious' | 'all' | 'upcoming' | 'completed'
  const [searchQuery, setSearchQuery] = useState("");

  // Warning Modal State
  const [selectedHandover, setSelectedHandover] = useState(null);
  const [warningTarget, setWarningTarget] = useState("finder"); // 'finder' | 'receiver' | 'both'
  const [warningTitle, setWarningTitle] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [warningSeverity, setWarningSeverity] = useState("high");
  const [submittingWarning, setSubmittingWarning] = useState(false);

  // Load handovers
  const loadHandovers = async () => {
    try {
      setLoading(true);
      const data = await getHandovers("all", null, true);
      setHandovers(data.all || []);
    } catch (err) {
      console.error("Failed to load handovers for admin oversight:", err);
      toast.error("Could not fetch handovers database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHandovers();
  }, []);

  // Filtered list
  const filteredHandovers = useMemo(() => {
    return handovers.filter((h) => {
      // Tab filter
      if (activeTab === "suspicious") {
        const isSuspicious =
          (h.suspiciousFlags && h.suspiciousFlags.length > 0) ||
          h.hasWarning ||
          (h.adminWarnings && h.adminWarnings.length > 0);
        if (!isSuspicious) return false;
      } else if (activeTab === "upcoming") {
        if (h.status !== "proposed" && h.status !== "confirmed") return false;
      } else if (activeTab === "completed") {
        if (h.status !== "completed" && h.status !== "reunited") return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (h.itemTitle || "").toLowerCase();
        const loc = (h.location || "").toLowerCase();
        const ownerName = (h.owner?.name || "").toLowerCase();
        const finderName = (h.finder?.name || "").toLowerCase();
        const ownerEmail = (h.owner?.email || "").toLowerCase();
        const finderEmail = (h.finder?.email || "").toLowerCase();
        return (
          title.includes(q) ||
          loc.includes(q) ||
          ownerName.includes(q) ||
          finderName.includes(q) ||
          ownerEmail.includes(q) ||
          finderEmail.includes(q)
        );
      }
      return true;
    });
  }, [handovers, activeTab, searchQuery]);

  // Aggregate telemetry counts
  const counts = useMemo(() => {
    const total = handovers.length;
    const suspicious = handovers.filter(
      (h) =>
        (h.suspiciousFlags && h.suspiciousFlags.length > 0) ||
        h.hasWarning ||
        (h.adminWarnings && h.adminWarnings.length > 0)
    ).length;
    const upcoming = handovers.filter(
      (h) => h.status === "proposed" || h.status === "confirmed"
    ).length;
    const completed = handovers.filter(
      (h) => h.status === "completed" || h.status === "reunited"
    ).length;
    return { total, suspicious, upcoming, completed };
  }, [handovers]);

  // Open warning modal with pre-configured target
  const handleOpenWarningModal = (handover, target = "finder") => {
    setSelectedHandover(handover);
    setWarningTarget(target);
    // Apply a default template if suspicious flags exist
    if (handover.suspiciousFlags && handover.suspiciousFlags.length > 0) {
      const isLateNight = handover.suspiciousFlags.some((f) =>
        f.toLowerCase().includes("night")
      );
      const isIsolated = handover.suspiciousFlags.some(
        (f) =>
          f.toLowerCase().includes("isolated") ||
          f.toLowerCase().includes("private")
      );
      if (isLateNight) {
        setWarningTitle(PRESET_WARNING_TEMPLATES[1].title);
        setWarningMessage(PRESET_WARNING_TEMPLATES[1].message);
        setWarningSeverity(PRESET_WARNING_TEMPLATES[1].severity);
      } else if (isIsolated) {
        setWarningTitle(PRESET_WARNING_TEMPLATES[0].title);
        setWarningMessage(PRESET_WARNING_TEMPLATES[0].message);
        setWarningSeverity(PRESET_WARNING_TEMPLATES[0].severity);
      } else {
        setWarningTitle(PRESET_WARNING_TEMPLATES[0].title);
        setWarningMessage(PRESET_WARNING_TEMPLATES[0].message);
        setWarningSeverity("high");
      }
    } else {
      setWarningTitle(PRESET_WARNING_TEMPLATES[0].title);
      setWarningMessage(PRESET_WARNING_TEMPLATES[0].message);
      setWarningSeverity("warning");
    }
  };

  // Submit warning
  const handleSendWarning = async (e) => {
    e.preventDefault();
    if (!warningTitle.trim() || !warningMessage.trim()) {
      toast.error("Please supply a warning title and detailed message.");
      return;
    }
    setSubmittingWarning(true);
    try {
      const { handover: updated } = await sendAdminWarning(
        selectedHandover._id || selectedHandover.id,
        {
          target: warningTarget,
          title: warningTitle,
          message: warningMessage,
          severity: warningSeverity,
        }
      );

      // Update local handovers state
      setHandovers((prev) =>
        prev.map((h) =>
          h._id === updated._id || h.id === updated.id ? updated : h
        )
      );

      const targetLabel =
        warningTarget === "finder"
          ? `Finder (${selectedHandover.finder?.name || "Finder"})`
          : warningTarget === "receiver"
          ? `Receiver (${selectedHandover.owner?.name || "Receiver"})`
          : "Both Finder & Receiver";

      toast.success(`Safety warning sent to ${targetLabel}!`);
      setSelectedHandover(null);
    } catch (err) {
      console.error("Warning dispatch error:", err);
      toast.error(err.message || "Failed to dispatch safety warning.");
    } finally {
      setSubmittingWarning(false);
    }
  };

  // Apply quick template
  const handleSelectTemplate = (tpl) => {
    setWarningTitle(tpl.title);
    setWarningMessage(tpl.message);
    setWarningSeverity(tpl.severity);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Description & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
          Handovers are auto-approved between Finder and Receiver upon mutual
          confirmation without requiring admin approval. Monitor public meeting
          spots, identify risky exchanges, and send targeted warnings to either
          party.
        </p>

        {/* REFRESH */}
        <button
          onClick={loadHandovers}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-[#9ae600] transition-colors shadow-sm"
        >
          <Clock size={14} className="text-[#72a800] dark:text-[#9ae600]" />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Suspicious / Flagged
            </span>
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <ShieldAlert size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 font-heading">
            {counts.suspicious}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Require admin safety review
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Active / Scheduled
            </span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-heading">
            {counts.upcoming}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Proposed or mutual confirmed
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Reunited &amp; Resolved
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-heading">
            {counts.completed}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mutual 2-party signoff completed
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Total Recorded
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Handshake size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-heading">
            {counts.total}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Platform exchanges to date
          </p>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 self-start">
          <button
            onClick={() => setActiveTab("suspicious")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "suspicious"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ShieldAlert size={14} />
            <span>Suspicious &amp; Flagged</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {counts.suspicious}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "upcoming"
                ? "bg-[#9ae600] text-black shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Upcoming / Active</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
              {counts.upcoming}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "completed"
                ? "bg-[#9ae600] text-black shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Completed</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
              {counts.completed}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>All</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
              {counts.total}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items, locations, parties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#9ae600] transition-colors"
          />
        </div>
      </div>

      {/* HANDOVERS LIST */}
      {loading ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#72a800] dark:text-[#9ae600] mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Loading handover oversight telemetry...
          </p>
        </div>
      ) : filteredHandovers.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
            <ShieldCheck size={28} className="text-[#72a800] dark:text-[#9ae600]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            No handovers matching filter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            {activeTab === "suspicious"
              ? "All active handovers are currently within safe operating thresholds. No suspicious patterns detected."
              : "No records found matching your query."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHandovers.map((h) => {
            const isSuspicious =
              (h.suspiciousFlags && h.suspiciousFlags.length > 0) || h.hasWarning;
            const isCompleted =
              h.status === "completed" || h.status === "reunited";
            const isConfirmed = h.status === "confirmed";

            return (
              <div
                key={h._id || h.id}
                className={`rounded-3xl bg-white dark:bg-slate-900 border p-6 transition-all duration-200 shadow-sm ${
                  isSuspicious
                    ? "border-rose-500/40 bg-rose-500/[0.02]"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Item & Location */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                      <img
                        src={h.itemThumbnail || "/default-avatar.png"}
                        alt={h.itemTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/default-avatar.png";
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                          #{h._id?.slice(-6) || "HND-01"}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                          {h.itemCategory || "Valuables"}
                        </span>

                        {/* Status badge */}
                        <span
                          className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
                            isCompleted
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : isConfirmed
                              ? "bg-[#9ae600]/20 text-[#609100] dark:text-[#9ae600] border-[#9ae600]/40"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {isCompleted
                            ? "Reunited & Closed"
                            : isConfirmed
                            ? "Auto-Confirmed"
                            : "Proposal Pending"}
                        </span>

                        {isSuspicious && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                            <AlertTriangle size={11} />
                            Flagged Suspicious
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading truncate">
                        {h.itemTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar size={13} className="text-[#72a800] dark:text-[#9ae600]" />
                          {h.meetingDate}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock size={13} className="text-[#72a800] dark:text-[#9ae600]" />
                          {h.timeSlot}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                          <MapPin size={13} className="text-rose-500" />
                          <strong className="truncate max-w-xs">{h.location}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Finder & Receiver Contacts */}
                  <div className="grid grid-cols-2 gap-4 lg:w-72 bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        Receiver (Owner)
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {h.owner?.name || "Member"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {h.owner?.email || "No email"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {h.owner?.phone || "No phone"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        Item Finder
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {h.finder?.name || "Finder"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {h.finder?.email || "No email"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {h.finder?.phone || "No phone"}
                      </p>
                    </div>
                  </div>

                  {/* Right: Separate Warning Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenWarningModal(h, "finder")}
                      className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShieldAlert size={14} />
                      <span>Warn Finder</span>
                    </button>

                    <button
                      onClick={() => handleOpenWarningModal(h, "receiver")}
                      className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle size={14} />
                      <span>Warn Receiver</span>
                    </button>
                  </div>
                </div>

                {/* SUSPICIOUS REASON FLAGS & SAFETY NOTE */}
                {(h.suspiciousFlags?.length > 0 || h.safetyNote) && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
                    {h.suspiciousFlags?.map((flag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 font-medium"
                      >
                        <AlertCircle size={13} />
                        {flag}
                      </span>
                    ))}
                    {h.safetyNote && (
                      <span className="text-slate-500 italic truncate max-w-lg">
                        Note: &ldquo;{h.safetyNote}&rdquo;
                      </span>
                    )}
                  </div>
                )}

                {/* DISPATCHED ADMIN WARNINGS RECORD */}
                {h.adminWarnings && h.adminWarnings.length > 0 && (
                  <div className="mt-3 p-3 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 text-xs space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 block">
                      Dispatched Safety Warnings:
                    </span>
                    {h.adminWarnings.map((w, wIdx) => (
                      <div
                        key={w.id || wIdx}
                        className="flex items-center justify-between gap-3 text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              w.target === "finder"
                                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                : w.target === "receiver"
                                ? "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                                : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            Sent to {w.target}
                          </span>
                          <span className="font-semibold">{w.title}</span>
                          <span className="text-slate-400 text-[11px] truncate hidden sm:inline">
                            - {w.message}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {new Date(w.sentAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DISPATCH WARNING MODAL */}
      {selectedHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white font-heading">
                    Dispatch Safety Warning
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Handover #{selectedHandover._id?.slice(-6)} • {selectedHandover.itemTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedHandover(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendWarning} className="space-y-4 overflow-y-auto pr-1">
              {/* TARGET SELECTION: Finder vs Receiver vs Both */}
              <div>
                <label className="text-xs font-mono uppercase font-bold tracking-wider text-slate-600 dark:text-slate-400 block mb-2">
                  Recipient of Warning
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWarningTarget("finder")}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      warningTarget === "finder"
                        ? "border-[#9ae600] bg-[#9ae600]/10 text-slate-900 dark:text-white ring-1 ring-[#9ae600]"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span className="text-xs font-bold block">Finder</span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {selectedHandover.finder?.name || "Finder"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWarningTarget("receiver")}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      warningTarget === "receiver"
                        ? "border-[#9ae600] bg-[#9ae600]/10 text-slate-900 dark:text-white ring-1 ring-[#9ae600]"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span className="text-xs font-bold block">Receiver</span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {selectedHandover.owner?.name || "Owner"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWarningTarget("both")}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      warningTarget === "both"
                        ? "border-[#9ae600] bg-[#9ae600]/10 text-slate-900 dark:text-white ring-1 ring-[#9ae600]"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span className="text-xs font-bold block">Both Parties</span>
                    <span className="text-[10px] text-slate-400 block">
                      Broadcast
                    </span>
                  </button>
                </div>
              </div>

              {/* QUICK SECURITY TEMPLATES */}
              <div>
                <label className="text-xs font-mono uppercase font-bold tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
                  Quick Safety Templates
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_WARNING_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 hover:border-[#9ae600] text-left transition-all"
                    >
                      <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                        {tpl.title}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {tpl.message}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SEVERITY LEVEL */}
              <div>
                <label className="text-xs font-mono uppercase font-bold tracking-wider text-slate-600 dark:text-slate-400 block mb-2">
                  Severity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "warning", label: "Warning", color: "amber" },
                    { key: "high", label: "High Risk", color: "orange" },
                    { key: "critical", label: "Critical", color: "rose" },
                  ].map((lvl) => (
                    <button
                      key={lvl.key}
                      type="button"
                      onClick={() => setWarningSeverity(lvl.key)}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold capitalize transition-all ${
                        warningSeverity === lvl.key
                          ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* WARNING HEADLINE */}
              <div>
                <label className="text-xs font-mono uppercase font-bold tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
                  Warning Headline
                </label>
                <input
                  type="text"
                  value={warningTitle}
                  onChange={(e) => setWarningTitle(e.target.value)}
                  placeholder="e.g. Relocate meeting to verified public police station"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600]"
                  required
                />
              </div>

              {/* WARNING MESSAGE */}
              <div>
                <label className="text-xs font-mono uppercase font-bold tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
                  Detailed Safety Instructions
                </label>
                <textarea
                  rows={3}
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder="Provide precise safety instructions and guidance..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600] resize-none"
                  required
                />
              </div>

              {/* FOOTER ACTIONS */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedHandover(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWarning}
                  className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingWarning ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  <span>Dispatch Warning to {warningTarget.toUpperCase()}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
