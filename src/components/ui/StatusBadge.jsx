"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * StatusBadge component for Lost & Found items
 * @param {"lost" | "found" | "resolved"} status
 * @param {string} className
 */
export default function StatusBadge({ status = "lost", className = "" }) {
  const { t } = useLanguage();
  const normalized = (status || "").toLowerCase();

  const config = {
    lost: {
      label: t("status.lost", "Lost"),
      bg: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300",
      dot: "bg-rose-500 animate-pulse",
    },
    found: {
      label: t("status.found", "Found"),
      bg: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300",
      dot: "bg-emerald-500",
    },
    resolved: {
      label: t("status.resolved", "Resolved"),
      bg: "bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
      dot: "bg-slate-500",
    },
  }[normalized] || {
    label: status,
    bg: "bg-slate-100 border-slate-200 text-slate-700",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-xs transition-colors ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
