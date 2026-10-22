"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  PackageSearch,
  Search,
  PackageCheck,
  CheckCircle2,
} from "lucide-react";
import { ALL_ITEMS, bucketize, aggregateByCategory } from "@/lib/data";
import { cn } from "@/utils/cn";

// Curated harmonious color palette for charts matching Findora design system
const COLORS = {
  lost: "#F43F5E", // Rose
  found: "#9AE600", // Findora Brand Lime
  returned: "#10B981", // Emerald
  palette: [
    "#9AE600",
    "#38BDF8",
    "#F43F5E",
    "#FBBF24",
    "#A855F7",
    "#EC4899",
    "#14B8A6",
    "#64748B",
  ],
};

// Custom Tooltip for Line & Bar charts with glassmorphic styling
function CustomChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-2xl bg-white/95 dark:bg-[#070b04]/95 border border-slate-200 dark:border-white/10 p-3.5 shadow-xl backdrop-blur-md text-xs min-w-[170px]">
      <p className="font-bold text-slate-900 dark:text-white font-mono pb-1.5 mb-2 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[10px] text-slate-400 font-normal">Telemetry</span>
      </p>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={`entry-${index}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}
              />
              <span className="text-slate-600 dark:text-slate-300 capitalize text-[11.5px]">
                {entry.name}
              </span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {Number(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Custom Tooltip for Pie / Donut chart
function CustomPieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];

  return (
    <div className="rounded-2xl bg-white/95 dark:bg-[#070b04]/95 border border-slate-200 dark:border-white/10 p-3 shadow-xl backdrop-blur-md text-xs min-w-[150px]">
      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-white/10">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: data.payload.fill || data.color }}
        />
        <span className="font-bold text-slate-900 dark:text-white truncate">
          {data.name}
        </span>
      </div>
      <div className="mt-2 space-y-1 text-[11px] font-mono">
        <div className="flex items-center justify-between gap-3 text-slate-600 dark:text-slate-300">
          <span>Reports:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {Number(data.value).toLocaleString()}
          </span>
        </div>
        {data.payload.percent !== undefined && (
          <div className="flex items-center justify-between gap-3 text-slate-600 dark:text-slate-300">
            <span>Share:</span>
            <span className="font-bold text-[#72a800] dark:text-[#9ae600]">
              {(data.payload.percent * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecoveryCharts({
  items = ALL_ITEMS,
  className,
  title = "Recovery & Trend Analytics",
  subtitle = "Monthly telemetry and category-based breakdown for admin trend intelligence",
}) {
  const [mounted, setMounted] = useState(false);
  const [categoryView, setCategoryView] = useState("bar"); // 'bar' | 'pie'
  const [lineActiveMetric, setLineActiveMetric] = useState("all"); // 'all' | 'lost' | 'found' | 'returned'

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Monthly line chart data (Last 12 Months)
  const monthlyData = useMemo(() => {
    const rawBuckets = bucketize(items, "12m");
    return rawBuckets.map((b) => ({
      month: b.label,
      lost: b.lost,
      found: b.found,
      returned: b.returned,
      total: b.lost + b.found,
    }));
  }, [items]);

  // 2. Category data with colors
  const categoryData = useMemo(() => {
    const rawCategories = aggregateByCategory(items);
    const grandTotal = rawCategories.reduce((acc, cur) => acc + cur.total, 0) || 1;

    return rawCategories.map((c, index) => ({
      category: c.label,
      total: c.total,
      lost: c.lost,
      found: c.found,
      percent: c.total / grandTotal,
      fill: COLORS.palette[index % COLORS.palette.length],
    }));
  }, [items]);

  // 3. Summary KPI highlights
  const summary = useMemo(() => {
    const totalLost = monthlyData.reduce((acc, cur) => acc + cur.lost, 0);
    const totalFound = monthlyData.reduce((acc, cur) => acc + cur.found, 0);
    const totalReturned = monthlyData.reduce((acc, cur) => acc + cur.returned, 0);
    const totalItems = totalLost + totalFound;
    const recoveryRate = totalItems > 0 ? ((totalReturned / totalItems) * 100).toFixed(1) : "0.0";

    const topCategory = categoryData[0] ? categoryData[0].category : "General";

    // Find peak month
    let peakMonth = "N/A";
    let peakVal = 0;
    monthlyData.forEach((m) => {
      if (m.total > peakVal) {
        peakVal = m.total;
        peakMonth = m.month;
      }
    });

    return {
      totalLost,
      totalFound,
      totalReturned,
      recoveryRate,
      topCategory,
      peakMonth,
    };
  }, [monthlyData, categoryData]);

  if (!mounted) {
    return (
      <div className="w-full min-h-[420px] rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9ae600] border-t-transparent" />
          <p className="text-xs text-slate-400 font-mono">Initializing chart telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header & KPI Highlights Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9ae600]/15 border border-[#9ae600]/30 text-[#72a800] dark:text-[#9ae600] text-xs font-mono font-bold mb-2">
            <TrendingUp size={13} />
            <span>ADMIN TELEMETRY SYSTEM</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-slate-950 dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        {/* Quick Highlights Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Recovery Rate</span>
            <p className="text-lg font-black text-emerald-500 font-heading">
              {summary.recoveryRate}%
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Top Category</span>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
              {summary.topCategory}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Peak Month</span>
            <p className="text-xs font-bold text-[#72a800] dark:text-[#9ae600] truncate mt-1 font-mono">
              {summary.peakMonth}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Returned Total</span>
            <p className="text-lg font-black text-[#72a800] dark:text-[#9ae600] font-heading font-mono">
              {summary.totalReturned.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* CHART 1: Monthly Line Chart (Lost vs Found vs Returned per Month - Last 12 Months) */}
        <div className="xl:col-span-7 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white font-heading flex items-center gap-2">
                  <Calendar size={16} className="text-[#72a800] dark:text-[#9ae600]" />
                  <span>Monthly Trends (Last 12 Months)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lost vs Found reports compared with successfully verified returns
                </p>
              </div>

              {/* Metric Filter Tabs */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/[0.05] p-1 border border-slate-200 dark:border-white/10 shrink-0 self-start sm:self-auto">
                {[
                  { key: "all", label: "All Lines" },
                  { key: "lost", label: "Lost" },
                  { key: "found", label: "Found" },
                  { key: "returned", label: "Returned" },
                ].map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setLineActiveMetric(m.key)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                      lineActiveMetric === m.key
                        ? "bg-white dark:bg-[#070b04] text-slate-950 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Legend Header */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono mb-4 px-1">
              {(lineActiveMetric === "all" || lineActiveMetric === "lost") && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 rounded-full bg-rose-500" />
                  <span className="text-slate-600 dark:text-slate-300">Lost Items</span>
                </div>
              )}
              {(lineActiveMetric === "all" || lineActiveMetric === "found") && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 rounded-full bg-[#9ae600]" />
                  <span className="text-slate-600 dark:text-slate-300">Found Items</span>
                </div>
              )}
              {(lineActiveMetric === "all" || lineActiveMetric === "returned") && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300">Returned to Owner</span>
                </div>
              )}
            </div>
          </div>

          {/* Recharts Responsive Line Chart */}
          <div className="h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#888888"
                  opacity={0.12}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
                  dy={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
                  dx={-4}
                />
                <Tooltip content={<CustomChartTooltip />} />

                {/* Lost Line */}
                {(lineActiveMetric === "all" || lineActiveMetric === "lost") && (
                  <Line
                    type="monotone"
                    dataKey="lost"
                    name="Lost Reports"
                    stroke={COLORS.lost}
                    strokeWidth={2.4}
                    dot={{ r: 3, fill: COLORS.lost, strokeWidth: 1.5, stroke: "#ffffff" }}
                    activeDot={{ r: 6, fill: COLORS.lost, stroke: "#ffffff", strokeWidth: 2 }}
                  />
                )}

                {/* Found Line */}
                {(lineActiveMetric === "all" || lineActiveMetric === "found") && (
                  <Line
                    type="monotone"
                    dataKey="found"
                    name="Found Reports"
                    stroke={COLORS.found}
                    strokeWidth={2.4}
                    dot={{ r: 3, fill: COLORS.found, strokeWidth: 1.5, stroke: "#ffffff" }}
                    activeDot={{ r: 6, fill: COLORS.found, stroke: "#ffffff", strokeWidth: 2 }}
                  />
                )}

                {/* Returned Line */}
                {(lineActiveMetric === "all" || lineActiveMetric === "returned") && (
                  <Line
                    type="monotone"
                    dataKey="returned"
                    name="Returned to Owner"
                    stroke={COLORS.returned}
                    strokeWidth={2.4}
                    dot={{ r: 3, fill: COLORS.returned, strokeWidth: 1.5, stroke: "#ffffff" }}
                    activeDot={{ r: 6, fill: COLORS.returned, stroke: "#ffffff", strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Reports by Category (Bar Chart or Donut Pie Chart) */}
        <div className="xl:col-span-5 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white font-heading flex items-center gap-2">
                  <Layers size={16} className="text-[#72a800] dark:text-[#9ae600]" />
                  <span>Reports by Category</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Distribution of reported items across product categories
                </p>
              </div>

              {/* Toggle: Bar vs Pie */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/[0.05] p-1 border border-slate-200 dark:border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setCategoryView("bar")}
                  className={cn(
                    "p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer",
                    categoryView === "bar" &&
                      "bg-white dark:bg-[#070b04] text-slate-950 dark:text-white shadow-xs"
                  )}
                  title="Bar Chart View"
                >
                  <BarChart3 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryView("pie")}
                  className={cn(
                    "p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer",
                    categoryView === "pie" &&
                      "bg-white dark:bg-[#070b04] text-slate-950 dark:text-white shadow-xs"
                  )}
                  title="Pie / Donut View"
                >
                  <PieIcon size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Conditional Rendering: Bar Chart vs Pie Chart */}
          <div className="h-[320px] w-full pt-2">
            {categoryView === "bar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#888888"
                    opacity={0.12}
                  />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    width={95}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar
                    dataKey="total"
                    name="Total Reports"
                    radius={[0, 8, 8, 0]}
                    animationDuration={600}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    animationDuration={600}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`pie-cell-${index}`}
                        fill={entry.fill}
                        stroke="#070b04"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: "11px",
                      paddingTop: "14px",
                      lineHeight: "16px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
