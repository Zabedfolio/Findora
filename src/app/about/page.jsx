"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, HeartHandshake, MapPin, ArrowRight, ArrowLeft, Radio } from "lucide-react";

export default function AboutPage() {
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

        {/* Hero Banner */}
        <div className="rounded-3xl bg-slate-950 text-white border border-slate-800 p-8 sm:p-12 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#9ae600]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9ae600]/15 border border-[#9ae600]/30 text-[#9ae600] text-xs font-mono font-bold mb-4">
            <HeartHandshake className="w-4 h-4" />
            <span>OUR MISSION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-[1.1]">
            Reuniting Communities, <br />
            <span className="text-[#9ae600]">One Belonging at a Time.</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Losing an essential item shouldn&apos;t lead to panic or vulnerability. Findora was created to provide an intelligent, automated, and secure bridge between honest finders and searching owners across campuses, cities, and transit hubs.
          </p>
        </div>

        {/* Core Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] flex items-center justify-center mb-4">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-heading mb-2">Automated Radar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Bi-directional scanning algorithms that correlate descriptions, categories, and coordinates 24/7.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-heading mb-2">Verified Trust</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Anti-scam protocols, blind identifier masking, and safe exchange public zone recommendations.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] flex items-center justify-center mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-heading mb-2">Community First</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Empowering honest citizens, campus staff, and transit security to easily do the right thing.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold font-heading text-slate-950 dark:text-white">
              Ready to explore reports or test Match Radar?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Search active community reports or submit a new listing in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 btn-primary-glow px-6 py-3 rounded-2xl text-slate-950 font-bold text-xs sm:text-sm tracking-tight"
            >
              <span>Explore Reports</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
