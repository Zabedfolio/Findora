"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Radio,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  BellRing,
  HelpCircle,
  Compass,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import RadarScannerVisual from "@/components/radar/RadarScannerVisual";
import RadarSearchForm from "@/components/radar/RadarSearchForm";
import RadarResultCard from "@/components/radar/RadarResultCard";
import { calculateRadarMatches } from "@/lib/radarMatcher";
import { getReports } from "@/services/reportService";

export default function MatchRadarPage() {
  const router = useRouter();

  // Search parameters
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [scanMode, setScanMode] = useState("lost"); // 'lost' | 'found' | 'omni'

  // State
  const [allReports, setAllReports] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [selectedBlip, setSelectedBlip] = useState(null);

  // Fetch all reports on mount
  useEffect(() => {
    async function loadReports() {
      try {
        const data = await getReports({ limit: 100 });
        if (data && data.reports) {
          setAllReports(data.reports);
        }
      } catch (err) {
        console.error("Failed to load reports for radar:", err);
      }
    }
    loadReports();
  }, []);

  // Compute matches
  const matches = useMemo(() => {
    return calculateRadarMatches(
      {
        query,
        category,
        location,
        scanMode,
      },
      allReports
    );
  }, [query, category, location, scanMode, allReports]);

  // Trigger simulated radar sweep animation
  const handlePerformScan = useCallback(() => {
    setIsScanning(true);
    setHasScanned(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 700);
  }, []);

  // Set initial scan flag after reports load
  useEffect(() => {
    if (allReports.length > 0 && !hasScanned) {
      setHasScanned(true);
    }
  }, [allReports, hasScanned]);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#070905] text-slate-900 dark:text-white pb-24 transition-colors">
      {/* 1. Ambient Hero Header Background */}
      <div className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#050703] pt-12 pb-14">
        {/* Radar concentric glow circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(ellipse_at_center,rgba(154,230,0,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#9ae600]/10 dark:bg-[#9ae600]/15 border border-[#9ae600]/30 text-[#72a800] dark:text-[#9ae600] text-xs font-mono font-bold mb-4 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9ae600] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9ae600]" />
              </span>
              <span>FINDORA RADAR ENGINE • REAL-TIME CROSS-MATCH</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-heading text-slate-950 dark:text-white leading-[1.1]">
              Match Radar<span className="text-[#9ae600]">™</span>
            </h1>

            <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              An intelligent scanning system that cross-references lost items against found listings in real time. Describe your item to detect potential matches with confidence scores.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Radar Interactive Deck */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Radar Search Controls (7 cols) */}
          <div className="lg:col-span-7">
            <RadarSearchForm
              query={query}
              setQuery={setQuery}
              category={category}
              setCategory={setCategory}
              location={location}
              setLocation={setLocation}
              scanMode={scanMode}
              setScanMode={setScanMode}
              onPerformScan={handlePerformScan}
              isScanning={isScanning}
            />
          </div>

          {/* Right Column: Visual Radar HUD Display (5 cols) */}
          <div className="lg:col-span-5">
            <RadarScannerVisual
              matches={matches}
              isScanning={isScanning}
              scanMode={scanMode}
              onSelectMatch={(report) => {
                setSelectedBlip(report);
                const el = document.getElementById(`report-${report.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
            />
          </div>
        </div>

        {/* 3. Detected Match Results Telemetry Section */}
        <div className="mt-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950 dark:text-white">
                  Radar Telemetry Results
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#9ae600]/20 text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30">
                  {matches.length} Matches Found
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Ordered by algorithmic match confidence based on semantic keywords, category, and location proximity.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePerformScan}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
                <span>Re-Sweep</span>
              </button>
            </div>
          </div>

          {/* Results Grid or Empty State */}
          {matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((item, index) => (
                <div key={item.report.id} id={`report-${item.report.id}`}>
                  <RadarResultCard matchItem={item} rank={index + 1} />
                </div>
              ))}
            </div>
          ) : (
            /* Empty State / Fallback CTA */
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-md">
              <div className="w-16 h-16 rounded-3xl bg-[#9ae600]/10 border border-[#9ae600]/30 flex items-center justify-center mx-auto mb-4 text-[#72a800] dark:text-[#9ae600]">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-950 dark:text-white">
                No Direct Radar Match Detected
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                No active listing directly corresponds with your parameters yet. Don't worry — new reports are submitted daily!
              </p>

              {/* Action: Turn search into active report */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/reports/new?type=${scanMode === "lost" ? "lost" : "found"}&title=${encodeURIComponent(
                    query
                  )}&category=${encodeURIComponent(category !== "All Categories" ? category : "")}&location=${encodeURIComponent(
                    location !== "All Locations" ? location : ""
                  )}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-primary-glow px-6 py-3 rounded-2xl text-slate-950 font-bold text-xs sm:text-sm tracking-tight"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post This as a {scanMode === "lost" ? "Lost" : "Found"} Report</span>
                </Link>

                <Link
                  href="/reports"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors"
                >
                  <span>Browse All Reports</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 4. Educational Radar Feature Explanation */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-[#050703] to-[#0c1208] text-white p-6 sm:p-10 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#9ae600]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl relative z-10">
            <span className="text-xs font-mono font-bold text-[#9ae600] uppercase tracking-wider">
              HOW MATCH RADAR WORKS
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-heading mt-1">
              Automated Bi-Directional Intelligence
            </h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              When you submit a report on Findora, our matching algorithm runs in the background 24/7. It correlates items by keyword semantics, category classifications, and temporal GPS proximity to instantly notify you the moment someone reports seeing or finding your item.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#9ae600]/20 text-[#9ae600] font-mono font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span>Semantic token matching across multiple multilingual descriptions.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#9ae600]/20 text-[#9ae600] font-mono font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span>Location radius analysis to detect proximity overlap.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#9ae600]/20 text-[#9ae600] font-mono font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span>Anti-fraud verification before contact info or claims are accepted.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
