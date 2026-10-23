"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070905] text-slate-900 dark:text-white py-14 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold mb-4">
            <Lock className="w-4 h-4" />
            <span>DATA PRIVACY &amp; SECURITY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-950 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Findora is built with privacy-first architecture to protect lost property without compromising personal safety.
          </p>
        </div>

        {/* Content Body */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-lg font-bold font-heading text-slate-950 dark:text-white mb-2.5">
              1. Information We Collect
            </h2>
            <p>
              When you create an account or publish a report, we collect information necessary to facilitate recovery: your name, email, report descriptions, approximate locations, and uploaded images. We do not sell your personal data to any advertisers or third-party brokers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-heading text-slate-950 dark:text-white mb-2.5">
              2. Automatic Identifier Masking
            </h2>
            <p>
              To protect users from fraudulent claims, sensitive identifiers such as partial serial numbers, IMEIs, and identification document card numbers are masked from public listings. Only authorized parties involved in verified claims can access masked verification fields.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-heading text-slate-950 dark:text-white mb-2.5">
              3. Communication Privacy
            </h2>
            <p>
              Direct contact information (personal phone numbers, private physical addresses) is never exposed on open listings. Communication remains channeled through Findora&apos;s internal verification interface until both parties consent to coordinate an exchange.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-heading text-slate-950 dark:text-white mb-2.5">
              4. Data Deletion &amp; Resolution
            </h2>
            <p>
              Once a report is marked as resolved and reunited, users may request the archiving or deletion of associated images and identifying records.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
