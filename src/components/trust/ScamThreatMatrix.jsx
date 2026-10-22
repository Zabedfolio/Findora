"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Lock,
  ArrowRight,
  EyeOff,
  Coins,
  FileX,
  BadgeAlert,
} from "lucide-react";

export default function ScamThreatMatrix() {
  const [activeTab, setActiveTab] = useState(0);

  const threats = [
    {
      id: "courier",
      title: "Advance Delivery Fee Scam",
      severity: "High Frequency",
      threatDescription:
        "A fraudster messages claiming they found your item in another district and promises to ship it via courier once you send an advance fee via bKash or wire transfer. The package never arrives.",
      findoraDefense:
        "Findora explicitly prohibits remote courier requests. Handover must be executed at certified public partner desks or directly between parties with no upfront fees.",
      signals: ["Refuses physical meeting", "Demands urgent digital transfer", "Sends fake delivery receipts"],
      icon: Coins,
    },
    {
      id: "phishing",
      title: "Fake 2FA Verification Phishing",
      severity: "Critical",
      threatDescription:
        "A fraudster sends an external link or text asking for a 6-digit confirmation code under the guise of 'verifying ownership', actually hijacking your account or email.",
      findoraDefense:
        "Findora never requires external codes or links to verify a lost item. All claim confirmations take place within your authenticated session on findora.org.",
      signals: ["SMS with urgent 6-digit codes", "Links to non-Findora domains", "Asks for account credentials"],
      icon: Lock,
    },
    {
      id: "imposter",
      title: "Opportunistic Blind Claiming",
      severity: "Medium",
      threatDescription:
        "Bad actors browse newly published 'Found' reports and attempt to claim high-value electronics without having lost them, guessing serial numbers or colors.",
      findoraDefense:
        "Our system automatically masks serial numbers, IMEI digits, and critical unique identifying marks. The claimant must supply unguessable proof before any contact is permitted.",
      signals: ["Vague descriptions ('It is a black phone')", "Inability to specify wallpaper or marks", "Reluctance to unlock device"],
      icon: EyeOff,
    },
    {
      id: "ransom",
      title: "Reward Extortion / Hostage",
      severity: "Severe",
      threatDescription:
        "A finder holds an essential document (passport, national ID, university certificate) hostage, demanding exorbitant reward fees before returning it.",
      findoraDefense:
        "Holding government-issued identification hostage is a legal violation. Findora coordinates with campus authorities and local police precincts for formal recovery.",
      signals: ["Demands disproportionate cash reward", "Refuses official desk drop-off", "Threatens to discard documents"],
      icon: FileX,
    },
  ];

  const current = threats[activeTab];

  return (
    <section className="py-20 bg-white dark:bg-[#050703] border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold mb-3">
            <ShieldAlert className="w-4 h-4" />
            <span>THREAT RADAR & ANTI-SCAM DEFENSE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-950 dark:text-white tracking-tight">
            How Findora Neutralizes Common Scam Vectors
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Lost and found platforms are frequent targets for opportunistic fraud. Here is how our architecture intercepts them.
          </p>
        </div>

        {/* Interactive Matrix Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Threat Selector List (5 cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            {threats.map((threat, idx) => {
              const Icon = threat.icon;
              const isActive = activeTab === idx;

              return (
                <button
                  key={threat.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-850 dark:border-[#9ae600]/40 shadow-lg"
                      : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isActive
                            ? "bg-[#9ae600] text-slate-950"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold truncate">
                          {threat.title}
                        </h3>
                        <span className="text-[11px] font-mono opacity-60">
                          {threat.severity}
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? "text-[#9ae600] translate-x-1" : "opacity-30"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Threat Detail & Findora Defense Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                <div>
                  <span className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider">
                    Threat Profile #{activeTab + 1}
                  </span>
                  <h3 className="text-xl font-bold font-heading text-slate-950 dark:text-white mt-1">
                    {current.title}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0">
                  {current.severity}
                </span>
              </div>

              {/* Anatomy of the Scam */}
              <div className="mb-6">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                  <span>The Attack Vector</span>
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-750">
                  {current.threatDescription}
                </p>
              </div>

              {/* Findora's Defense System */}
              <div className="mb-6">
                <h4 className="text-xs font-mono font-bold text-[#72a800] dark:text-[#9ae600] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Findora Countermeasure</span>
                </h4>
                <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed bg-[#9ae600]/10 p-4 rounded-2xl border border-[#9ae600]/30">
                  {current.findoraDefense}
                </p>
              </div>

              {/* Red Flag Warning Signals */}
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Red Flag Signals to Watch For
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {current.signals.map((sig, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2"
                    >
                      <BadgeAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
