"use client";

import React, { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Trash2, X, Loader2 } from "lucide-react";

/**
 * ConfirmModal Component:
 * Reusable modal for destructive (Delete) or critical (Resolve) confirmation flows.
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger", // 'danger' | 'warning' | 'primary'
  isLoading = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDanger
                ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
            }`}
          >
            {isDanger ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white font-heading">
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-7 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md cursor-pointer disabled:opacity-60 ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 active:scale-98"
                : "bg-[#9ae600] text-slate-950 hover:bg-[#85c900] shadow-[#9ae600]/30 active:scale-98"
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
