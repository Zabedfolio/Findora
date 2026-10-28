"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Ban,
  Clock,
  UserX,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  X,
  Send,
  Lock,
  Unlock,
  Activity,
  Smartphone,
  Globe,
  FileWarning,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import toast from "@/lib/toast";

const STORAGE_FRAUD_KEY = "findora_admin_fraud_v1";

export default function AdminFraudPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all"); // 'all' | 'high' | 'medium' | 'low'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'investigating' | 'warning_issued' | 'suspended' | 'banned' | 'cleared'

  // Detail Modal State
  const [activeCase, setActiveCase] = useState(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Clear legacy mock fraud cases storage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_FRAUD_KEY);
      }
    } catch {}
  }, []);

  // Fetch real fraud cases from backend MongoDB
  const fetchFraudCases = useCallback(async () => {
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiBase}/fraud?limit=100`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const rawCases = Array.isArray(json?.data) ? json.data : [];
        const normalized = rawCases.map((c) => {
          const score = Number(c.riskScore) || 50;
          let calculatedRisk = c.riskLevel;
          if (!calculatedRisk || calculatedRisk === "critical") {
            calculatedRisk = score >= 75 ? "high" : score >= 40 ? "medium" : "low";
          }

          return {
            id: c.caseId || c._id,
            _id: c._id,
            caseId: c.caseId || `FRD-${String(c._id).slice(-4)}`,
            user: c.targetUser?.name || "Flagged User",
            email: c.targetUser?.email || "user@findora.app",
            avatar: c.targetUser?.avatar || "/default-avatar.png",
            ipAddress: c.ipAddress || "103.205.71.18",
            riskScore: score,
            riskLevel: calculatedRisk,
            triggerReason: c.triggerReason || "Suspicious anomaly detected",
            reportedAt: c.createdAt
              ? new Date(c.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently",
            status: c.status || "investigating",
            evidence: c.evidence || "Automated system detected anomaly in claim activity.",
            deviceFingerprint: c.deviceFingerprint || "Standard web browser",
            totalClaims: c.totalClaims || 1,
            disputesCount: c.disputesCount || 0,
          };
        });
        setCases(normalized);
        return;
      }
      setCases([]);
    } catch (err) {
      console.warn("Could not fetch fraud telemetry from database:", err.message);
      toast.error("Could not fetch fraud investigations from backend.");
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFraudCases();
  }, [fetchFraudCases]);

  // Administrative Actions wired to MongoDB
  const updateStatusInDb = async (id, nextStatus, notes = "") => {
    try {
      setIsSubmittingAction(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const targetCase = cases.find((c) => c.id === id || c._id === id);
      const targetDbId = targetCase?._id || id;

      const res = await fetch(`${apiBase}/fraud/${targetDbId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          actionNotes: notes || `Admin updated status to ${nextStatus}`,
        }),
      });

      if (!res.ok) throw new Error("Failed to update case in database");

      setCases((prev) =>
        prev.map((c) =>
          c.id === id || c._id === id ? { ...c, status: nextStatus } : c
        )
      );

      if (activeCase && (activeCase.id === id || activeCase._id === id)) {
        setActiveCase((prev) => ({ ...prev, status: nextStatus }));
      }
      return true;
    } catch (err) {
      console.error("Failed to update fraud status in DB:", err);
      toast.error("Failed to record administrative action in database.");
      return false;
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSuspend = async (id) => {
    const success = await updateStatusInDb(id, "suspended", "Account suspended for 14 days pending review");
    if (success) {
      toast.warning("Account suspended for 14 days recorded in database");
    }
  };

  const handleBan = async (id) => {
    const success = await updateStatusInDb(id, "banned", "Account permanently banned from Findora platform");
    if (success) {
      toast.error("Account permanently banned in database");
    }
  };

  const handleClear = async (id) => {
    const success = await updateStatusInDb(id, "cleared", "False positive resolved by admin investigation");
    if (success) {
      toast.success("Investigation cleared and false positive resolved in database");
    }
  };

  const handleWarn = async (id) => {
    const success = await updateStatusInDb(id, "warning_issued", "Formal trust & safety warning issued to user");
    if (success) {
      toast.info("Formal warning notice recorded in database");
    }
  };

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (item.user || "").toLowerCase().includes(q) ||
          (item.email || "").toLowerCase().includes(q) ||
          (item.ipAddress || "").includes(q) ||
          (item.triggerReason || "").toLowerCase().includes(q) ||
          (item.caseId || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Risk Filter
      if (riskFilter !== "all" && item.riskLevel !== riskFilter) {
        return false;
      }

      // 3. Status Filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [cases, searchQuery, riskFilter, statusFilter]);

  // Fraud KPIs from database
  const metrics = useMemo(() => {
    let highRisk = 0;
    let investigating = 0;
    let banned = 0;

    for (const c of cases) {
      if (c.riskScore >= 80) highRisk++;
      if (c.status === "investigating") investigating++;
      if (c.status === "banned" || c.status === "suspended") banned++;
    }

    return { total: cases.length, highRisk, investigating, banned };
  }, [cases]);

  return (
    <div className="space-y-5">
      {/* Subheader with Description & Sync Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Real-time security telemetry, multi-claim anomaly audits, and syndicate detection.
        </p>

        <button
          type="button"
          onClick={fetchFraudCases}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-[#9ae600] transition-colors shadow-xs"
        >
          <RefreshCw
            size={13}
            className={loading ? "animate-spin text-[#72a800] dark:text-[#9ae600]" : "text-slate-400"}
          />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-500">
            Active Investigations
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-rose-500">
            {loading ? "..." : metrics.investigating}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Under active human review
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-500">
            Critical Risk Scores
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-500">
            {loading ? "..." : metrics.highRisk}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Risk rating &ge; 80%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Sanctioned Accounts
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : metrics.banned}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Suspended or banned
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#72a800] dark:text-[#9ae600]">
            Database Cases
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-[#72a800] dark:text-[#9ae600]">
            {loading ? "..." : metrics.total}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Logged incidents &amp; signals
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
              placeholder="Search by user, email, IP address, or pattern…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9ae600]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#9ae600] cursor-pointer"
            >
              <option value="all">Risk Level: All</option>
              <option value="high">High Risk (&ge; 75%)</option>
              <option value="medium">Medium Risk (40-74%)</option>
              <option value="low">Low Risk (&le; 39%)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#9ae600] cursor-pointer"
            >
              <option value="all">Case Status: All</option>
              <option value="investigating">Open Investigation</option>
              <option value="warning_issued">Warning Issued</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
              <option value="cleared">Cleared</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Table */}
      <div className="rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] text-slate-400 font-mono">
                <th className="py-3 px-4 font-bold uppercase">Flagged Account</th>
                <th className="py-3 px-4 font-bold uppercase">Risk Score</th>
                <th className="py-3 px-4 font-bold uppercase">Detection Trigger</th>
                <th className="py-3 px-4 font-bold uppercase">Network IP</th>
                <th className="py-3 px-4 font-bold uppercase">Status</th>
                <th className="py-3 px-4 font-bold uppercase text-right">Investigation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#72a800] dark:text-[#9ae600] mb-2" />
                    <p className="font-semibold text-xs">Loading database investigations...</p>
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">No fraud cases match your criteria</p>
                    <p className="text-xs mt-1">Try resetting the risk filter or search query</p>
                  </td>
                </tr>
              ) : (
                filteredCases.map((item) => {
                  const isHigh = item.riskScore >= 75;
                  const isMedium = item.riskScore >= 40 && item.riskScore < 75;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Flagged Account */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10 shrink-0 border border-slate-200 dark:border-white/10">
                            <img
                              src={item.avatar}
                              alt={item.user}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-[190px]">
                            <p className="font-bold text-slate-950 dark:text-white truncate">
                              {item.user}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold",
                              isHigh
                                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                                : isMedium
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            )}
                          >
                            {item.riskScore}%
                          </span>
                        </div>
                      </td>

                      {/* Trigger Reason */}
                      <td className="py-3.5 px-4 max-w-[260px]">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.triggerReason}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          Case: {item.caseId} • {item.disputesCount} disputes
                        </p>
                      </td>

                      {/* Network IP */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {item.ipAddress}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase",
                            item.status === "banned"
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                              : item.status === "suspended"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : item.status === "warning_issued"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : item.status === "cleared"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          )}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveCase(item)}
                          className="px-3 py-1.5 rounded-xl font-semibold bg-[#9ae600]/15 hover:bg-[#9ae600]/25 text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30 transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs"
                        >
                          <Eye size={12} />
                          <span>Investigate</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigation Deep Dive Modal */}
      {activeCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-xl w-full rounded-3xl bg-white dark:bg-[#070b04] border border-rose-500/30 p-6 shadow-2xl relative text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveCase(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <ShieldAlert size={22} />
              </span>
              <div>
                <h4 className="font-display font-bold text-lg text-slate-950 dark:text-white">
                  Fraud Case Investigation #{activeCase.caseId}
                </h4>
                <p className="text-xs text-slate-500">
                  Target Account: {activeCase.user} ({activeCase.email})
                </p>
              </div>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Assigned Risk
                </span>
                <p className="font-bold text-base text-rose-500 mt-0.5 font-mono">
                  {activeCase.riskScore}%
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Total Claims
                </span>
                <p className="font-bold text-base text-slate-900 dark:text-white mt-0.5 font-mono">
                  {activeCase.totalClaims}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Disputes
                </span>
                <p className="font-bold text-base text-amber-500 mt-0.5 font-mono">
                  {activeCase.disputesCount}
                </p>
              </div>
            </div>

            {/* Technical Evidence Details */}
            <div className="space-y-3 mb-5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Detection Trigger
                </span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {activeCase.triggerReason}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Audited Evidence &amp; Behavioral Fingerprint
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeCase.evidence}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Device &amp; Network Telemetry
                </span>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  {activeCase.deviceFingerprint} • IP: {activeCase.ipAddress}
                </p>
              </div>
            </div>

            {/* Administrative Action Dispatch */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10">
              <p className="text-xs font-bold text-slate-900 dark:text-white mb-2.5">
                Dispatch Administrative Sanction:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isSubmittingAction}
                  onClick={() => handleWarn(activeCase.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={12} />
                  <span>Issue Formal Warning</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmittingAction}
                  onClick={() => handleSuspend(activeCase.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <UserX size={12} />
                  <span>Suspend 14 Days</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmittingAction}
                  onClick={() => handleBan(activeCase.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Ban size={12} />
                  <span>Permanent Ban</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmittingAction}
                  onClick={() => handleClear(activeCase.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5 ml-auto disabled:opacity-50"
                >
                  <CheckCircle2 size={12} />
                  <span>Clear Case (False Positive)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
