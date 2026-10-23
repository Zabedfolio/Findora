"use client";

import React from "react";
import Link from "next/link";
import { Scale, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9ae600]/15 border border-[#9ae600]/30 text-[#72a800] dark:text-[#9ae600] text-xs font-mono font-bold mb-4">
            <Scale className="w-4 h-4" />
            <span>LEGAL & COMMUNITY STANDARDS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-950 dark:text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Last revised: October 2026 · Effective across all Findora platforms and services.
          </p>
        </div>

        {/* Content Body */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-lg font-bold font-heading text-slate-950 dark:text-white mb-2.5">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or publishing reports on Findora, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, you may not access or use Findora.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-heading text-slate-950 dark:text-white mb-2.5">
              2. User Obligations &amp; Truthful Reporting
            </h2>
            <p>
              Findora is a community trust network. All users agree to submit accurate, non-fraudulent reports. Submitting false reports, fabricating lost or found claims, or claiming items that do not belong to you constitutes grounds for immediate termination of access and reporting to appropriate civil authorities.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-heading text-slate-950 dark:text-white mb-2.5">
              3. Prohibition of Ransom &amp; Extortion
            </h2>
            <p>
              Finders must not hold property hostage, demand upfront courier fees, or require mandatory payments prior to returning items. Holding official identification documents (passports, national IDs, licenses) hostage is a violation of law. Voluntary rewards may be offered by owners upon physical return, but are never compulsory.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-heading text-slate-950 dark:text-white mb-2.5">
              4. Safe Exchange Responsibility
            </h2>
            <p>
              Users are solely responsible for coordinating and conducting item exchanges safely. Findora strongly recommends meeting exclusively in verified public safe zones, campus security desks, or police station lobbies during daylight hours. Findora does not take physical custody of items and accepts no liability for personal safety or disputes arising during peer handovers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-heading text-slate-950 dark:text-white mb-2.5">
              5. Contact &amp; Violations
            </h2>
            <p>
              To report suspicious activities or violations of these terms, please review our{" "}
              <Link href="/trust" className="text-[#72a800] dark:text-[#9ae600] underline font-semibold">
                Trust &amp; Safety Guide
              </Link>{" "}
              or email{" "}
              <a href="mailto:safety@findora.org" className="underline font-semibold">
                safety@findora.org
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
