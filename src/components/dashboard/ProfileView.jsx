"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Lock,
  Bell,
  Award,
  Zap,
  Camera,
  CheckCircle2,
  Fingerprint,
  LogOut,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import ProfileForm from "@/components/auth/ProfileForm";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { cn } from "@/utils/cn";

export default function ProfileView() {
  const { user, isAdmin, logout } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState("personal"); // 'personal' | 'security' | 'privacy' | 'reputation'

  // Privacy toggles
  const [maskPhone, setMaskPhone] = useState(true);
  const [approxLocation, setApproxLocation] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);

  const displayName = user?.name || "Zabed Mahmud";
  const displayEmail = user?.email || "zabed@findora.app";
  const displayPhone = user?.phone || "+880 1712-345678";
  const avatarSrc = user?.image?.trim() ? user.image : "/default-avatar.png";

  return (
    <div className="space-y-6 pt-2">
      {/* 1. Header Profile Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#9ae600]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Camera Badge */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-[#9ae600]/40 shadow-xl bg-slate-800">
              <img
                src={avatarSrc}
                alt={displayName}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#9ae600] text-slate-950 shadow-md">
              <Camera size={14} strokeWidth={2.5} />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-white">
                {displayName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#9ae600]/20 text-[#9ae600] border border-[#9ae600]/40">
                {isAdmin ? "ADMINISTRATOR" : "VERIFIED CITIZEN"}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Member ID: <span className="font-mono text-slate-300">FND-94812</span> · Joined October 2026
            </p>

            <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Mail size={13} className="text-[#9ae600]" />
                <span className="font-medium">{displayEmail}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={13} className="text-[#9ae600]" />
                <span className="font-medium">{displayPhone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#9ae600]" />
                <span className="font-medium">Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Trust Score Card */}
          <div className="rounded-2xl bg-white/[0.06] backdrop-blur border border-white/10 p-4 text-center shrink-0 w-full sm:w-48">
            <div className="flex items-center justify-center gap-1.5 text-[#9ae600] text-xs font-mono font-bold mb-1">
              <ShieldCheck size={14} />
              <span>TRUST SCORE</span>
            </div>
            <p className="text-3xl font-black text-white font-heading">
              98<span className="text-sm font-normal text-slate-400">/100</span>
            </p>
            <p className="mt-1 text-[11px] text-emerald-400 font-semibold">Zero Scam Reports</p>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "personal", label: "Personal Information", icon: User },
          { id: "security", label: "Security & Login", icon: Lock },
          { id: "privacy", label: "Privacy & Alerts", icon: Bell },
          { id: "reputation", label: "Trust & Badges", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-[#9ae600] text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-950 dark:hover:text-white"
              )}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Sub-Tab Content */}

      {/* TAB: Personal Information -> ProfileForm */}
      {activeSubTab === "personal" && (
        <ProfileForm />
      )}

      {/* TAB: Security & Login -> ChangePasswordForm + 2FA / Session */}
      {activeSubTab === "security" && (
        <div className="space-y-6">
          <ChangePasswordForm />

          {/* Two-Factor Authentication & Device Sessions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Fingerprint size={18} className="text-[#72a800] dark:text-[#9ae600]" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Two-Factor Authentication (2FA)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Require an SMS verification code for claim approvals.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactor(!twoFactor)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    twoFactor ? "bg-[#9ae600]" : "bg-slate-300 dark:bg-slate-700"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      twoFactor ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Active Session
                </h4>
                <p className="text-[11px] text-slate-500">
                  Chrome on macOS · Dhaka, Bangladesh (Current)
                </p>
              </div>
              {logout && (
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Privacy & Alerts */}
      {activeSubTab === "privacy" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Privacy &amp; Notification Controls
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize how your contact information is revealed and when you receive automated updates.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/[0.06] text-xs">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Blind Phone Masking</p>
                <p className="text-slate-500 text-[11.5px]">
                  Never reveal your phone number on public reports. Only verified claimants receive masked access.
                </p>
              </div>
              <input
                type="checkbox"
                checked={maskPhone}
                onChange={(e) => setMaskPhone(e.target.checked)}
                className="h-4 w-4 rounded accent-[#9ae600] cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Approximate Area Display</p>
                <p className="text-slate-500 text-[11.5px]">
                  Display neighborhood landmark (e.g. &quot;Dhanmondi Lake&quot;) instead of exact residential addresses.
                </p>
              </div>
              <input
                type="checkbox"
                checked={approxLocation}
                onChange={(e) => setApproxLocation(e.target.checked)}
                className="h-4 w-4 rounded accent-[#9ae600] cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Instant Email Alerts</p>
                <p className="text-slate-500 text-[11.5px]">
                  Receive an automated email when an item matching your lost report is turned in.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 rounded accent-[#9ae600] cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">WhatsApp / SMS Telemetry Updates</p>
                <p className="text-slate-500 text-[11.5px]">
                  Get instant messaging notifications for claim approvals and safe handover scheduling.
                </p>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="h-4 w-4 rounded accent-[#9ae600] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB: Trust & Badges */}
      {activeSubTab === "reputation" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] flex items-center justify-center mb-3">
              <ShieldCheck size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">ID Verified Citizen</h4>
            <p className="mt-1 text-[11px] text-slate-500">
              Government National ID and phone verified through Findora Trust Protocol.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={12} /> VERIFIED
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] flex items-center justify-center mb-3">
              <Award size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Honest Finder Level 2</h4>
            <p className="mt-1 text-[11px] text-slate-500">
              Successfully turned in 3+ items with verified handover confirmations.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#72a800] dark:text-[#9ae600]">
              <ShieldCheck size={12} /> ACTIVE BADGE
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] flex items-center justify-center mb-3">
              <Zap size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Fast Responder</h4>
            <p className="mt-1 text-[11px] text-slate-500">
              Average response time under 15 minutes when claimants ask verification questions.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={12} /> 100% RELIABILITY
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
