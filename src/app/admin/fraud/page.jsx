"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Sparkles,
  Smartphone,
  Globe,
  FileWarning,
} from "lucide-react";
import { cn } from "@/utils/cn";
import toast from "@/lib/toast";

const STORAGE_FRAUD_KEY = "findora_admin_fraud_v1";

const INITIAL_FRAUD_CASES = [
  {
    id: "fraud-501",
    user: "Kabir Hossain",
    email: "kabir.claim_bot@mailnesia.com",
    avatar: "/default-avatar.png",
    ipAddress: "103.205.71.18",
    riskScore: 94,
    riskLevel: "high",
    triggerReason: "Multi-claim surge: 6 MacBook Pro laptops claimed in 24 hours",
    reportedAt: "35 mins ago",
    status: "investigating",
    evidence: "User submitted identical proof answers across 6 separate MacBook reports with generic stock descriptions.",
    deviceFingerprint: "Chrome 122 on Windows (Headless browser signals detected)",
    totalClaims: 14,
    disputesCount: 6,
  },
  {
    id: "fraud-502",
    user: "GoldHunter_X",
    email: "hunter_x99@tempmail.plus",
    avatar: "/default-avatar.png",
    ipAddress: "185.220.101.5",
    riskScore: 88,
    riskLevel: "high",
    triggerReason: "Stock photo fraud: Image matches Shutterstock watermark",
    reportedAt: "2 hours ago",
    status: "investigating",
    evidence: "Found report for 22k Gold Wedding Ring uploaded cropped image traced to stock photography catalog.",
    deviceFingerprint: "TOR Exit Node / Unknown Linux distro",
    totalClaims: 3,
    disputesCount: 2,
  },
  {
    id: "fraud-503",
    user: "Shuvo Rahman",
    email: "shuvo.r@gmail.com",
    avatar: "/default-avatar.png",
    ipAddress: "27.147.202.94",
    riskScore: 65,
    riskLevel: "medium",
    triggerReason: "VPN IP hopping: 12 proxy connections in 30 minutes",
    reportedAt: "5 hours ago",
    status: "warning_issued",
    evidence: "Frequent geo-location shifts during claim verification process for iPhone 14 Pro Max.",
    deviceFingerprint: "Safari on iOS 17.4 (NordVPN Data Center IP)",
    totalClaims: 5,
    disputesCount: 1,
  },
  {
    id: "fraud-504",
    user: "Rafiqul Islam",
    email: "rafiqul.claim@gmail.com",
    avatar: "/default-avatar.png",
    ipAddress: "118.67.215.42",
    riskScore: 91,
    riskLevel: "high",
    triggerReason: "Extortion demand in claim chat: Demanding 5,000 BDT cash",
    reportedAt: "Yesterday",
    status: "action_taken",
    evidence: "Chat transcripts confirmed finder refused handover unless claimant wired money via personal bKash.",
    deviceFingerprint: "Android Mobile (Dhaka Mobile Network)",
    totalClaims: 2,
    disputesCount: 2,
  },
  {
    id: "fraud-505",
    user: "Nusrat Jahan",
    email: "nusrat.jahan99@yahoo.com",
    avatar: "/default-avatar.png",
    ipAddress: "182.160.103.14",
    riskScore: 28,
    riskLevel: "low",
    triggerReason: "Typo in warranty serial number submission",
    reportedAt: "2 days ago",
    status: "cleared",
    evidence: "Claimant accidentally inverted two digits of MacBook serial number. Verified with legitimate purchase receipt.",
    deviceFingerprint: "macOS Sonoma on MacBook Air",
    totalClaims: 1,
    disputesCount: 0,
  },
];

export default function AdminFraudPage() {
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all"); // 'all' | 'high' | 'medium' | 'low'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'investigating' | 'action_taken' | 'banned' | 'cleared'

  // Detail Modal State
  const [activeCase, setActiveCase] = useState(null);

  // Load cases from storage or initial seed
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_FRAUD_KEY);
      if (stored) {
        setCases(JSON.parse(stored));
      } else {
        setCases(INITIAL_FRAUD_CASES);
        localStorage.setItem(STORAGE_FRAUD_KEY, JSON.stringify(INITIAL_FRAUD_CASES));
      }
    } catch {
      setCases(INITIAL_FRAUD_CASES);
    }
  }, []);

  const saveCases = (nextCases) => {
    setCases(nextCases);
    try {
      localStorage.setItem(STORAGE_FRAUD_KEY, JSON.stringify(nextCases));
    } catch {}
  };

  // Administrative Actions
  const handleSuspend = (id) => {
    const updated = cases.map((c) =>
      c.id === id ? { ...c, status: "suspended" } : c
    );
    saveCases(updated);
    toast.warning("Account suspended for 14 days pending review");
    if (activeCase?.id === id) setActiveCase((prev) => ({ ...prev, status: "suspended" }));
  };

  const handleBan = (id) => {
    const updated = cases.map((c) =>
      c.id === id ? { ...c, status: "banned" } : c
    );
    saveCases(updated);
    toast.error("Account permanently banned from platform");
    if (activeCase?.id === id) setActiveCase((prev) => ({ ...prev, status: "banned" }));
  };

  const handleClear = (id) => {
    const updated = cases.map((c) =>
      c.id === id ? { ...c, status: "cleared", riskScore: 12, riskLevel: "low" } : c
    );
    saveCases(updated);
    toast.success("Flags cleared: False positive resolved");
    if (activeCase?.id === id) setActiveCase((prev) => ({ ...prev, status: "cleared" }));
  };

  const handleWarn = (id) => {
    const updated = cases.map((c) =>
      c.id === id ? { ...c, status: "warning_issued" } : c
    );
    saveCases(updated);
    toast.info("Formal warning notice dispatched to user email");
    if (activeCase?.id === id) setActiveCase((prev) => ({ ...prev, status: "warning_issued" }));
  };

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.user.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.ipAddress.includes(q) ||
          item.triggerReason.toLowerCase().includes(q);
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

  // Fraud KPIs
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
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-500">
            Active Investigations
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-rose-500">
            {metrics.investigating}
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
            {metrics.highRisk}
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
            {metrics.banned}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Suspended or banned
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#72a800] dark:text-[#9ae600]">
            Prevented Loss Value
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-[#72a800] dark:text-[#9ae600]">
            $14,850
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Protected community property
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

            <button
              type="button"
              onClick={() => {
                saveCases(INITIAL_FRAUD_CASES);
                toast.success("Fraud cases reset to initial telemetry");
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer ml-auto"
            >
              Reset Telemetry
            </button>
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
              {filteredCases.length === 0 ? (
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
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Reported {item.reportedAt} • {item.disputesCount} disputes
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
                  Fraud Case Investigation #{activeCase.id}
                </h4>
                <p className="text-xs text-slate-500">
                  Target Account: {activeCase.user} ({activeCase.email})
                </p>
              </div>
            </div>

            {/* Risk Badge Bar */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                  Algorithmic Risk Score
                </span>
                <p className="text-xl font-bold font-mono text-rose-500">
                  {activeCase.riskScore}% Confidence
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                  Current Status
                </span>
                <p className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-200 mt-0.5">
                  {activeCase.status.replace("_", " ")}
                </p>
              </div>
            </div>

            {/* Telemetry Breakdown */}
            <div className="space-y-3 mb-5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1.5">
                <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <FileWarning size={13} className="text-rose-500" />
                  Primary Detection Trigger
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeCase.triggerReason}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1.5">
                <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Activity size={13} className="text-amber-500" />
                  Investigative Evidence
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeCase.evidence}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Network IP
                  </span>
                  <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {activeCase.ipAddress}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Claims / Disputes
                  </span>
                  <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {activeCase.totalClaims} Claims / {activeCase.disputesCount} Disputes
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Device Fingerprint
                </span>
                <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  {activeCase.deviceFingerprint}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleClear(activeCase.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
              >
                Clear / Dismiss Flag
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleWarn(activeCase.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
                >
                  Send Warning
                </button>

                <button
                  type="button"
                  onClick={() => handleSuspend(activeCase.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                >
                  Suspend Account
                </button>

                <button
                  type="button"
                  onClick={() => handleBan(activeCase.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Ban size={12} />
                  <span>Permanent Ban</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
