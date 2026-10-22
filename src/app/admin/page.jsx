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
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#071305] to-slate-950 p-6 sm:p-8 text-white border border-[#9ae600]/30 shadow-xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 bg-[#9ae600]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold uppercase bg-[#9ae600]/20 text-[#9ae600] border border-[#9ae600]/30">
                <Shield size={11} />
                Findora Administrative Suite
              </span>
              <span className="text-xs text-slate-400 font-mono">v2.4 Live</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Platform Telemetry &amp; Control Center
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time surveillance on metropolitan recovery metrics, hotspot density, user compliance, and automated fraud prevention.
            </p>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-2 gap-2.5 shrink-0">
            <Link
              href="/admin/reports"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all hover:scale-[1.02]"
            >
              <FileText size={14} className="text-[#9ae600]" />
              <span>Listings</span>
              <ArrowUpRight size={12} className="ml-auto opacity-60" />
            </Link>

            <Link
              href="/admin/reviews"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all hover:scale-[1.02]"
            >
              <MessageSquareWarning size={14} className="text-amber-400" />
              <span>Reviews</span>
              <ArrowUpRight size={12} className="ml-auto opacity-60" />
            </Link>

            <Link
              href="/admin/fraud"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all hover:scale-[1.02]"
            >
              <ShieldAlert size={14} className="text-rose-400" />
              <span>Fraud Hub</span>
              <ArrowUpRight size={12} className="ml-auto opacity-60" />
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all hover:scale-[1.02]"
            >
              <Users size={14} className="text-purple-400" />
              <span>Users</span>
              <ArrowUpRight size={12} className="ml-auto opacity-60" />
            </Link>
          </div>
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
