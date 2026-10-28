"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  PackageSearch,
  CheckCircle2,
  ShieldAlert,
  MessageSquareWarning,
  Handshake,
  TrendingUp,
  RefreshCw,
  Loader2,
  ArrowRight,
} from "lucide-react";
import RecoveryCharts from "@/components/admin/RecoveryCharts";
import TopLocationsList from "@/components/admin/TopLocationsList";
import { getAllUnifiedReports } from "@/services/reportService";
import { getHandovers } from "@/services/handoverService";

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [handoverCount, setHandoverCount] = useState(0);

  const fetchAdminMetrics = async () => {
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      if (apiBase) {
        const res = await fetch(`${apiBase}/dashboard/admin-metrics`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setMetrics(json.data);
          }
        }
      }

      // Also fetch live handovers
      const hData = await getHandovers("all", null, true);
      setHandoverCount(hData?.all?.length || 0);
    } catch (err) {
      console.warn("Could not load backend admin metrics, using local store:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdminMetrics();
  }, []);

  const localReports = useMemo(() => {
    try {
      return getAllUnifiedReports();
    } catch {
      return [];
    }
  }, []);

  // Compute stats from backend metrics or local live reports
  const totalReports = metrics?.totalInventory ?? localReports.length;
  const lostCount = metrics?.lostCount ?? localReports.filter((r) => r.type === "lost" || r.status === "lost").length;
  const foundCount = metrics?.foundCount ?? localReports.filter((r) => r.type === "found" || r.status === "found").length;
  const resolvedCount = metrics?.resolvedCount ?? localReports.filter((r) => r.status === "resolved").length;
  const recoveryRate = metrics?.recoveryRate ?? (totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0);

  // Dynamic recent items
  const recentItems = metrics?.recentListings || localReports.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Top Bar with Refresh & Telemetry Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-950 dark:text-white">
            Admin Overview &amp; Telemetry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time platform metrics, security telemetry, and recovery analytics across Findora.
          </p>
        </div>

        <button
          onClick={fetchAdminMetrics}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-[#9ae600] transition-colors shadow-xs"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-[#72a800] dark:text-[#9ae600]" : "text-slate-400"} />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Network Inventory */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Network Inventory
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <PackageSearch size={16} />
            </div>
          </div>
          <p className="font-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalReports}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {lostCount} lost • {foundCount} found
          </p>
        </div>

        {/* Card 2: Reunited & Resolved */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Reunited &amp; Resolved
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="font-heading text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {resolvedCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {recoveryRate}% network recovery rate
          </p>
        </div>

        {/* Card 3: Live Handover Oversight */}
        <Link
          href="/admin/handovers"
          className="p-5 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] hover:border-[#9ae600] transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#72a800] dark:text-[#9ae600]">
              Handover Oversight
            </span>
            <div className="p-2 rounded-xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] group-hover:scale-105 transition-transform">
              <Handshake size={16} />
            </div>
          </div>
          <p className="font-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {handoverCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 group-hover:text-[#72a800] dark:group-hover:text-[#9ae600] transition-colors">
            <span>Audit exchange safety</span>
            <ArrowRight size={11} />
          </p>
        </Link>

        {/* Card 4: Moderation Hub */}
        <Link
          href="/admin/reviews"
          className="p-5 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] hover:border-amber-500 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-500">
              Review Moderation
            </span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 group-hover:scale-105 transition-transform">
              <MessageSquareWarning size={16} />
            </div>
          </div>
          <p className="font-heading text-2xl sm:text-3xl font-black text-amber-500">
            Active
          </p>
          <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 group-hover:text-amber-500 transition-colors">
            <span>Moderate community reviews</span>
            <ArrowRight size={11} />
          </p>
        </Link>
      </div>

      {/* Hotspots Section */}
      <section aria-labelledby="hotspot-analysis-heading">
        <TopLocationsList />
      </section>

      {/* Recovery Trends & Category Breakdown Charts */}
      <section aria-labelledby="analytics-charts-heading">
        <RecoveryCharts items={recentItems.length > 0 ? recentItems : localReports} />
      </section>
    </div>
  );
}
