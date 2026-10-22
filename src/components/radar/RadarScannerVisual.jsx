"use client";

import React, { useMemo } from "react";
import { Radio, Crosshair, Sparkles, Activity } from "lucide-react";

/**
 * RadarScannerVisual:
 * A high-tech HUD radar visualizer with concentric range rings, sweeping radar beam,
 * and pinging target blips representing matched reports on the grid.
 */
export default function RadarScannerVisual({
  matches = [],
  isScanning = false,
  scanMode = "lost",
  onSelectMatch,
}) {
  // Generate deterministic polar coordinates for up to 6 top matches on the radar grid
  const blips = useMemo(() => {
    return matches.slice(0, 6).map((m, idx) => {
      // Deterministic angle and radius based on score & index
      const angle = (idx * 55 + (m.score * 3.7)) % 360;
      // High score = closer to center (15% to 80% radius)
      const radiusPct = Math.max(18, 90 - (m.score * 0.75));
      const rad = (angle * Math.PI) / 180;
      const x = 50 + (radiusPct / 2) * Math.cos(rad);
      const y = 50 + (radiusPct / 2) * Math.sin(rad);

      return {
        ...m,
        x: Math.min(88, Math.max(12, x)),
        y: Math.min(88, Math.max(12, y)),
        delay: (idx * 0.4).toFixed(1),
      };
    });
  }, [matches]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square rounded-3xl bg-[#050703] border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 overflow-hidden flex flex-col justify-between select-none">
      {/* 1. Radar Ambience Glow & Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(154,230,0,0.12)_0%,transparent_75%)] pointer-events-none" />

      {/* Top HUD Telemetry Header */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9ae600] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9ae600]" />
          </span>
          <span className="text-white font-semibold">FINDORA RADAR HUD</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#9ae600] font-semibold bg-[#9ae600]/10 px-2 py-0.5 rounded-full border border-[#9ae600]/25">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>{isScanning ? "SWEEPING..." : `${matches.length} DETECTIONS`}</span>
        </div>
      </div>

      {/* 2. Central Radar Sphere Container */}
      <div className="relative flex-1 flex items-center justify-center my-2">
        <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-full border border-[#9ae600]/20 flex items-center justify-center overflow-hidden bg-[#070b04]">
          {/* Concentric Rings */}
          <div className="absolute w-[80%] aspect-square rounded-full border border-[#9ae600]/15" />
          <div className="absolute w-[56%] aspect-square rounded-full border border-[#9ae600]/20" />
          <div className="absolute w-[30%] aspect-square rounded-full border border-[#9ae600]/25" />
          <div className="absolute w-[6px] h-[6px] rounded-full bg-[#9ae600] shadow-[0_0_12px_#9ae600]" />

          {/* Crosshair Axes */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-[#9ae600]/15 -translate-y-1/2 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-[#9ae600]/15 -translate-x-1/2 pointer-events-none" />

          {/* Diagonal Guides */}
          <div className="absolute w-full h-px bg-[#9ae600]/10 rotate-45 pointer-events-none" />
          <div className="absolute w-full h-px bg-[#9ae600]/10 -rotate-45 pointer-events-none" />

          {/* Rotating Radar Sweep Cone */}
          <div className="absolute inset-0 pointer-events-none animate-radar-sweep origin-center">
            <div
              className="w-1/2 h-1/2 origin-bottom-right"
              style={{
                background:
                  "conic-gradient(from 180deg at 100% 100%, rgba(154, 230, 0, 0.45) 0deg, rgba(154, 230, 0, 0.15) 30deg, transparent 75deg)",
              }}
            />
            {/* Bright leading sweep line */}
            <div className="absolute bottom-1/2 right-1/2 w-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-[#9ae600] to-white shadow-[0_0_8px_#9ae600]" />
          </div>

          {/* Dynamic Target Blips on Grid */}
          {blips.map((blip, index) => (
            <button
              key={blip.report.id || index}
              type="button"
              onClick={() => onSelectMatch?.(blip.report)}
              title={`${blip.report.title} (${blip.score}% Match)`}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-125 focus:outline-none z-20"
              style={{
                left: `${blip.x}%`,
                top: `${blip.y}%`,
              }}
            >
              <div className="relative flex items-center justify-center">
                {/* Sonar Ping Ring */}
                <span
                  className="animate-radar-ping absolute inline-flex h-6 w-6 rounded-full bg-[#9ae600] opacity-60"
                  style={{ animationDelay: `${blip.delay}s` }}
                />
                {/* Blip Core */}
                <span className="relative flex items-center justify-center h-3.5 w-3.5 rounded-full bg-[#9ae600] border-2 border-slate-950 shadow-[0_0_10px_#9ae600]">
                  <span className="text-[7px] font-bold text-slate-950">
                    {index + 1}
                  </span>
                </span>
                {/* Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                  <div className="bg-slate-950/95 text-white text-[10px] font-mono px-2 py-1 rounded-md border border-[#9ae600]/40 shadow-lg whitespace-nowrap">
                    <span className="text-[#9ae600] font-bold">{blip.score}%</span> · {blip.report.title}
                  </div>
                  <div className="w-1.5 h-1.5 bg-slate-950 rotate-45 -mt-0.5 border-r border-b border-[#9ae600]/40" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Telemetry Info */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-3">
        <div className="flex items-center gap-1.5 truncate">
          <Crosshair className="w-3.5 h-3.5 text-[#9ae600]" />
          <span className="truncate">
            TARGET: {scanMode === "lost" ? "FOUND ITEMS" : scanMode === "found" ? "LOST REPORTS" : "ALL DIRECTORIES"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 shrink-0">
          <Sparkles className="w-3 h-3 text-[#9ae600]" />
          <span>CONFIDENCE ALGO v2.4</span>
        </div>
      </div>
    </div>
  );
}
