"use client";

import React, { useState } from "react";
import { z } from "zod";
import { Lock, Eye, EyeOff, KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import toast from "@/lib/toast";
import { cn } from "@/utils/cn";

// Zod Schema based on registration password standards
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  });

export default function ChangePasswordForm() {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // 1. Zod Validation
    const validation = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      const fieldErrors = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setFormErrors(fieldErrors);
      const firstError = validation.error.errors[0]?.message;
      if (firstError) toast.error(firstError);
      return;
    }

    // 2. Call changePassword
    setSubmitting(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Change password error:", err);
      const msg = err?.message || "Failed to change password. Please check your current password.";
      setFormErrors({ currentPassword: msg });
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-6"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <KeyRound size={18} className="text-[#72a800] dark:text-[#9ae600]" />
            <span>Change Account Password</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Ensure your account stays protected by using a unique password with at least 6 characters.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Current Password
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (formErrors.currentPassword) {
                  setFormErrors((prev) => ({ ...prev, currentPassword: "" }));
                }
              }}
              placeholder="Enter your existing password"
              required
              className={cn(
                "w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border text-xs font-medium text-slate-900 dark:text-white focus:outline-none transition-colors",
                formErrors.currentPassword
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-slate-200 dark:border-white/10 focus:border-[#9ae600]"
              )}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {formErrors.currentPassword && (
            <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
              <AlertCircle size={12} />
              <span>{formErrors.currentPassword}</span>
            </p>
          )}
        </div>

        {/* New Password & Confirm Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (formErrors.newPassword) {
                    setFormErrors((prev) => ({ ...prev, newPassword: "" }));
                  }
                }}
                placeholder="At least 6 characters"
                required
                className={cn(
                  "w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border text-xs font-medium text-slate-900 dark:text-white focus:outline-none transition-colors",
                  formErrors.newPassword
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-slate-200 dark:border-white/10 focus:border-[#9ae600]"
                )}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {formErrors.newPassword && (
              <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                <AlertCircle size={12} />
                <span>{formErrors.newPassword}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword) {
                    setFormErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }
                }}
                placeholder="Confirm new password"
                required
                className={cn(
                  "w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border text-xs font-medium text-slate-900 dark:text-white focus:outline-none transition-colors",
                  formErrors.confirmPassword
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-slate-200 dark:border-white/10 focus:border-[#9ae600]"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                <AlertCircle size={12} />
                <span>{formErrors.confirmPassword}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-white/[0.06]">
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-2",
            submitting && "opacity-75 cursor-wait"
          )}
        >
          {submitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <KeyRound size={14} />
          )}
          <span>{submitting ? "Updating Password..." : "Update Password"}</span>
        </button>
      </div>
    </form>
  );
}
