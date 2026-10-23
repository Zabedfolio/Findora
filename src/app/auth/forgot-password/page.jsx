"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import toast from "@/lib/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    // Simulate reset request
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
    toast.success("Password reset instructions sent if an account exists.");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070905] text-slate-900 dark:text-white flex items-center justify-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] flex items-center justify-center mb-5">
            <Mail className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-black font-heading text-slate-950 dark:text-white">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Enter your email address and we&apos;ll send you instructions to safely reset your password.
          </p>

          {submitted ? (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <h2 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Check Your Inbox
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                We sent a secure recovery link to <span className="font-semibold">{email}</span>.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-bold text-emerald-800 dark:text-emerald-200 underline cursor-pointer"
              >
                Send to another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="recovery-email"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="recovery-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9ae600]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 btn-primary-glow py-3 px-6 rounded-xl text-slate-950 font-bold text-sm tracking-tight cursor-pointer disabled:opacity-60 shadow-md"
              >
                {loading ? (
                  <span>Sending Instructions...</span>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
