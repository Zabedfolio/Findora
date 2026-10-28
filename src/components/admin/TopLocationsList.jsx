"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  MapPin,
  TrendingUp,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Filter,
  Layers,
  Search,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * TopLocationsList Component
 * Displays the real database hotspot locations with incident count,
 * proportion of network losses, and smooth horizontal progress bars.
 */
export default function TopLocationsList({ locations: propLocations, className }) {
  const [filterType, setFilterType] = useState("all"); // 'all' | 'lost' | 'found'
  const [searchQuery, setSearchQuery] = useState("");
  const [dbLocations, setDbLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch real aggregated hotspot locations from database telemetry
  const fetchDbLocations = useCallback(async () => {
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiBase}/dashboard/admin-metrics`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const locs = json?.data?.topLocations;
        if (Array.isArray(locs)) {
          setDbLocations(locs);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not load backend location hotspots:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!propLocations || propLocations.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDbLocations();
    }
  }, [propLocations, fetchDbLocations]);

  // Combined source: prop locations or fetched database locations
  const rawLocations = useMemo(() => {
    const list = propLocations && propLocations.length > 0 ? propLocations : dbLocations;
    return list.map((loc) => {
      const name = (loc.name || loc.location || "Central Metropolitan Area").trim();
      const lost = Number(loc.lost) || 0;
      const found = Number(loc.found) || 0;
      const total = Number(loc.total) || Number(loc.count) || lost + found || 0;
      const resolved = Number(loc.resolved) || 0;
      return {
        name,
        location: name,
        lost,
        found,
        total,
        resolved,
      };
    });
  }, [propLocations, dbLocations]);

  // Filter & Sort based on active tab and search query
  const processedLocations = useMemo(() => {
    let list = rawLocations.map((loc) => {
      const value =
        filterType === "lost"
          ? loc.lost
          : filterType === "found"
          ? loc.found
          : loc.total;
      return { ...loc, displayValue: value };
    });

    // In 'lost' or 'found' mode, filter out locations with 0 relevant items
    if (filterType !== "all") {
      list = list.filter((l) => l.displayValue > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((l) => l.name.toLowerCase().includes(q));
    }

    list.sort((a, b) => b.displayValue - a.displayValue);
    return list.slice(0, 10);
  }, [rawLocations, filterType, searchQuery]);

  const maxVal = useMemo(() => {
    if (processedLocations.length === 0) return 1;
    return Math.max(...processedLocations.map((l) => l.displayValue), 1);
  }, [processedLocations]);

  const totalIncidents = useMemo(() => {
    return processedLocations.reduce((sum, l) => sum + l.displayValue, 0);
  }, [processedLocations]);

  return (
    <div
      className={cn(
        "rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] p-5 shadow-xs transition-all",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Flame size={16} />
            </span>
            <h3 className="font-display text-base font-bold text-slate-950 dark:text-white">
              Loss Location Hotspots
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30">
              TOP {Math.min(10, Math.max(1, processedLocations.length))}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            High-frequency loss and recovery zones across the city network from live database
          </p>
        </div>

        {/* Filter Pills & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl border border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-all cursor-pointer",
                filterType === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterType("lost")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-all cursor-pointer",
                filterType === "lost"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
              )}
            >
              Lost
            </button>
            <button
              type="button"
              onClick={() => setFilterType("found")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-all cursor-pointer",
                filterType === "found"
                  ? "bg-[#9ae600] text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-[#72a800] dark:hover:text-[#9ae600]"
              )}
            >
              Found
            </button>
          </div>

          <button
            type="button"
            onClick={fetchDbLocations}
            disabled={loading}
            title="Refresh database hotspots"
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin text-[#72a800] dark:text-[#9ae600]" : ""}
            />
          </button>
        </div>
      </div>

      {/* Top List with Horizontal Progress Bars */}
      <div className="mt-4 space-y-3.5">
        {loading && processedLocations.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 size={24} className="animate-spin mx-auto text-[#72a800] dark:text-[#9ae600] mb-2" />
            <p className="text-xs font-semibold">Aggregating database location hotspots...</p>
          </div>
        ) : processedLocations.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <MapPin size={24} className="mx-auto text-slate-400 mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              No location incidents recorded
            </p>
            <p className="text-xs mt-1 text-slate-500">
              Reports filed with location coordinates will automatically populate here.
            </p>
          </div>
        ) : (
          processedLocations.map((item, index) => {
            const rank = index + 1;
            const percentage = Math.max(8, Math.round((item.displayValue / maxVal) * 100));
            const shareOfTotal =
              totalIncidents > 0
                ? ((item.displayValue / totalIncidents) * 100).toFixed(1)
                : 0;

            // Rank styling accents
            const isTop3 = rank <= 3;
            const rankBadgeStyle =
              rank === 1
                ? "bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-400/40"
                : rank === 2
                ? "bg-slate-300/30 text-slate-700 dark:text-slate-200 border-slate-300/50"
                : rank === 3
                ? "bg-amber-700/15 text-amber-800 dark:text-amber-400 border-amber-700/30"
                : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10";

            return (
              <div
                key={item.name}
                className="group p-2.5 rounded-xl hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                  {/* Left: Rank & Location */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        "w-6 h-6 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center shrink-0 border",
                        rankBadgeStyle
                      )}
                    >
                      #{rank}
                    </span>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin
                        size={13}
                        className={cn(
                          "shrink-0",
                          isTop3
                            ? "text-rose-500"
                            : "text-slate-400 dark:text-slate-500"
                        )}
                      />
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#72a800] dark:group-hover:text-[#9ae600] transition-colors">
                        {item.name}
                      </span>
                    </div>
                  </div>

                  {/* Right: Count & Percentage */}
                  <div className="flex items-center gap-2.5 shrink-0 text-right">
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">
                      <span>{item.displayValue}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {filterType === "lost"
                          ? "lost"
                          : filterType === "found"
                          ? "found"
                          : "reports"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 w-11 text-right">
                      {shareOfTotal}%
                    </span>
                  </div>
                </div>

                {/* Horizontal Progress Bar */}
                <div className="h-2 w-full bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden p-[1px]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out shadow-xs",
                      filterType === "lost"
                        ? "bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                        : filterType === "found"
                        ? "bg-gradient-to-r from-[#9ae600] to-emerald-400 shadow-[0_0_8px_rgba(154,230,0,0.4)]"
                        : isTop3
                        ? "bg-gradient-to-r from-rose-500 via-amber-400 to-[#9ae600]"
                        : "bg-gradient-to-r from-[#9ae600] to-emerald-500"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Sub-breakdown: Lost vs Found Split */}
                <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 px-0.5">
                  <span>
                    Lost: <strong className="text-rose-500">{item.lost}</strong>
                  </span>
                  <span>
                    Found: <strong className="text-[#72a800] dark:text-[#9ae600]">{item.found}</strong>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span className="text-[11px]">
          Showing top {processedLocations.length} hotspot areas out of {rawLocations.length} monitored database zones
        </span>
        <span className="text-[11px] font-mono text-[#72a800] dark:text-[#9ae600] flex items-center gap-1 font-semibold">
          <TrendingUp size={12} />
          Live database telemetry
        </span>
      </div>
    </div>
  );
}
