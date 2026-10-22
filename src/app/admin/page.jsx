"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  FileText,
  MessageSquareWarning,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Activity,
  Flame,
  PackageSearch,
} from "lucide-react";
import RecoveryCharts from "@/components/admin/RecoveryCharts";
import TopLocationsList from "@/components/admin/TopLocationsList";
import { getAllUnifiedReports } from "@/services/reportService";

export default function AdminOverviewPage() {
  const reports = useMemo(() => {
    try {
      return getAllUnifiedReports();
    } catch {
      return [];
    }
  }, []);

  const totalReports = reports.length;
  const lostCount = reports.filter((r) => r.type === "lost" || r.status === "lost").length;
  const foundCount = reports.filter((r) => r.type === "found" || r.status === "found").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="space-y-6">
      {/* Quick Action Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30">
            <Shield size={11} />
            Administrative Hub
          </span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">v2.4 Live Telemetry</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <FileText size={13} className="text-[#9ae600]" />
            <span>Listings</span>
            <ArrowUpRight size={11} className="opacity-50" />
          </Link>

          <Link
            href="/admin/reviews"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <MessageSquareWarning size={13} className="text-amber-500" />
            <span>Reviews</span>
            <ArrowUpRight size={11} className="opacity-50" />
          </Link>

          <Link
            href="/admin/fraud"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ShieldAlert size={13} className="text-rose-500" />
            <span>Fraud Hub</span>
            <ArrowUpRight size={11} className="opacity-50" />
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Users size={13} className="text-purple-400" />
            <span>Users</span>
            <ArrowUpRight size={11} className="opacity-50" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Network Inventory
          </p>
          <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {totalReports}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {lostCount} lost items • {foundCount} found items
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Reunited &amp; Resolved
          </p>
          <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {resolvedCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Safe handovers confirmed
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-500">
            High-Risk Abuse Flags
          </p>
          <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-rose-500">
            4
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Multi-claim surge &amp; ransom signals
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-500">
            Pending Moderations
          </p>
          <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-amber-500">
            3
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Reported community reviews
          </p>
        </div>
      </div>

      {/* Hotspots Section (Top 10 Locations with Horizontal Progress Bars) */}
      <section aria-labelledby="hotspot-analysis-heading">
        <TopLocationsList />
      </section>

      {/* Recovery Trends & Category Breakdown Charts */}
      <section aria-labelledby="analytics-charts-heading">
        <RecoveryCharts />
      </section>
    </div>
  );
}
