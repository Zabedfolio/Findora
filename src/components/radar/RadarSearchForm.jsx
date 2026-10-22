"use client";

import React from "react";
import {
  Search,
  MapPin,
  Tag,
  SlidersHorizontal,
  Sparkles,
  X,
  ArrowRight,
  PackageSearch,
  PackageCheck,
  Globe,
} from "lucide-react";
import { CATEGORIES, POPULAR_LOCATIONS } from "@/services/reportService";

const QUICK_TAGS = [
  "iPhone",
  "Leather Wallet",
  "House Keys",
  "MacBook Pro",
  "Backpack",
  "National ID Card",
  "AirPods",
];

export default function RadarSearchForm({
  query,
  setQuery,
  category,
  setCategory,
  location,
  setLocation,
  scanMode,
  setScanMode,
  onPerformScan,
  isScanning,
}) {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#9ae600]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* 1. Mode Selector Tabs */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
          Step 1: What is your situation?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setScanMode("lost")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              scanMode === "lost"
                ? "bg-[#9ae600] text-slate-950 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <PackageSearch className="w-4 h-4 shrink-0" />
            <span>I Lost an Item</span>
          </button>

          <button
            type="button"
            onClick={() => setScanMode("found")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              scanMode === "found"
                ? "bg-[#9ae600] text-slate-950 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <PackageCheck className="w-4 h-4 shrink-0" />
            <span>I Found an Item</span>
          </button>

          <button
            type="button"
            onClick={() => setScanMode("omni")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              scanMode === "omni"
                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span>Omni Scan</span>
          </button>
        </div>
      </div>

      {/* 2. Main Search Query Input */}
      <div className="mb-5">
        <label
          htmlFor="radar-query"
          className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2"
        >
          Step 2: Describe the item
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            id="radar-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onPerformScan()}
            placeholder="e.g. Black Sony wireless headphones, Blue leather wallet with ID..."
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#9ae600] transition-all shadow-inner"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#9ae600]" /> Try:
          </span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuery(tag);
                onPerformScan();
              }}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Category & Location Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Category Selector */}
        <div>
          <label
            htmlFor="radar-category"
            className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2"
          >
            Category
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Tag className="w-4 h-4" />
            </div>
            <select
              id="radar-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-10 pr-8 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#9ae600] transition-all cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Selector */}
        <div>
          <label
            htmlFor="radar-location"
            className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2"
          >
            Location Area
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              id="radar-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-8 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#9ae600] transition-all cursor-pointer"
            >
              {POPULAR_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Action Trigger */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          Radar will analyze semantic descriptions, photo tags, and location coordinates.
        </p>

        <button
          type="button"
          onClick={onPerformScan}
          disabled={isScanning}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-primary-glow px-6 py-3 rounded-2xl text-slate-950 font-bold text-sm tracking-tight cursor-pointer disabled:opacity-60 shadow-lg whitespace-nowrap shrink-0"
        >
          {isScanning ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span className="whitespace-nowrap">Sweeping Network...</span>
            </>
          ) : (
            <>
              <span className="whitespace-nowrap">Execute Radar Scan</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
