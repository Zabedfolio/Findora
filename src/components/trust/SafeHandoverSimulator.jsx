"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Lock,
  PhoneCall,
  QrCode,
  UserCheck,
  Sparkles,
} from "lucide-react";

export default function SafeHandoverSimulator() {
  const [role, setRole] = useState("owner"); // 'owner' | 'finder'
  const [completedSteps, setCompletedSteps] = useState({});

  const toggleStep = (id) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const ownerSteps = [
    {
      id: "owner_1",
      title: "Verify Finder Credentials Before Meeting",
      detail:
        "Check that the finder has confirmed specific, non-public details (e.g., color of the internal lining, specific keychain, or partial serial number). Never send money upfront under any circumstance.",
      icon: Lock,
      critical: true,
    },
    {
      id: "owner_2",
      title: "Select a Verified Public Safe Zone",
      detail:
        "Agree to meet during daylight hours inside a public lobby with CCTV, such as a university security desk, local police station reception, or a well-lit metro station info counter.",
      icon: Building2,
      critical: true,
    },
    {
      id: "owner_3",
      title: "Bring a Friend or Inform Someone",
      detail:
        "Always inform a trusted friend or family member of the meeting location, time, and the finder's contact details, or bring someone along with you.",
      icon: PhoneCall,
      critical: false,
    },
    {
      id: "owner_4",
      title: "Physical Inspection & Digital Reunited Handshake",
      detail:
        "Inspect your item, test electronic devices, and confirm ownership in person. Then mark the listing as 'Resolved' in Findora to complete the verified record.",
      icon: CheckCircle2,
      critical: false,
    },
  ];

  const finderSteps = [
    {
      id: "finder_1",
      title: "Perform Blind Ownership Verification",
      detail:
        "Ask the claimant questions only the real owner could answer. For smartphones: ask them to unlock the passcode in front of you. For wallets: ask for the name on ID cards inside.",
      icon: ShieldCheck,
      critical: true,
    },
    {
      id: "finder_2",
      title: "Never Meet in Isolated or Residential Areas",
      detail:
        "Do not invite strangers to your home, apartment lobby, or secluded parking lots. Always select busy public locations with security cameras.",
      icon: Building2,
      critical: true,
    },
    {
      id: "finder_3",
      title: "Refuse Demands for Unmonitored Couriers",
      detail:
        "If a claimant refuses to meet in person and demands courier delivery with complex third-party payment links, decline and advise them to collect it through campus lost property.",
      icon: AlertTriangle,
      critical: true,
    },
    {
      id: "finder_4",
      title: "Mutual Confirmation on Findora",
      detail:
        "After handing over the item to the verified owner, mark the report as Reunited on Findora so the community recognizes your honest contribution.",
      icon: UserCheck,
      critical: false,
    },
  ];

  const currentSteps = role === "owner" ? ownerSteps : finderSteps;
  const totalCount = currentSteps.length;
  const completedCount = currentSteps.filter((s) => completedSteps[s.id]).length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <section id="safe-handover" className="py-20 bg-slate-50 dark:bg-[#070a05] border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>INTERACTIVE SAFE PROTOCOL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-950 dark:text-white tracking-tight">
            The Safe Exchange Simulator
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Select your role to review the mandatory pre-meeting checklist and verified handover requirements.
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="max-w-md mx-auto mb-10">
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              type="button"
              onClick={() => setRole("owner")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                role === "owner"
                  ? "bg-[#9ae600] text-slate-950 shadow-md font-extrabold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>I am the Owner</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("finder")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                role === "finder"
                  ? "bg-[#9ae600] text-slate-950 shadow-md font-extrabold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>I am the Finder</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Step-by-Step Protocol Checklist (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Protocol Checklist ({completedCount}/{totalCount} Completed)
              </span>
              <span className="text-xs font-mono font-bold text-[#72a800] dark:text-[#9ae600]">
                {progressPct}% Readiness
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-[#9ae600] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {currentSteps.map((step, idx) => {
              const Icon = step.icon;
              const isChecked = !!completedSteps[step.id];

              return (
                <div
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer ${
                    isChecked
                      ? "bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-950/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox circle */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? "bg-[#9ae600] border-[#9ae600] text-slate-950"
                          : "border-slate-300 dark:border-slate-700 bg-transparent"
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          STAGE 0{idx + 1}
                        </span>
                        {step.critical && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            MANDATORY
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-base font-bold font-heading mt-1 ${
                          isChecked
                            ? "text-slate-900 dark:text-white line-through opacity-80"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {step.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Safe Zones vs Danger Zones Directory (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Safe Zones Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-base font-bold font-heading">
                  Approved Safe Exchange Zones
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Always insist on meeting in one of these designated public hubs equipped with active security:
              </p>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-[#72a800] dark:text-[#9ae600] shrink-0 mt-0.5" />
                  <span>University Campus Security Desks or Student Center Reception</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#72a800] dark:text-[#9ae600] shrink-0 mt-0.5" />
                  <span>Local Police Precinct Visitor / Inquiry Lobby</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#72a800] dark:text-[#9ae600] shrink-0 mt-0.5" />
                  <span>Metro Rail Station Customer Information Booths</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-[#72a800] dark:text-[#9ae600] shrink-0 mt-0.5" />
                  <span>Bank Lobbies or Shopping Mall Main Information Counters</span>
                </li>
              </ul>
            </div>

            {/* Danger Zones Card */}
            <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-3">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold font-heading">
                  High-Risk Meeting Spots to Refuse
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                If the other party suggests any of the following, decline immediately and report the conversation:
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Private residential apartments or dorm rooms</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Unlit parking structures or roadside alleys after dusk</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Requests to get inside an unfamiliar vehicle</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Unverified &quot;courier drops&quot; requiring non-refundable deposits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
