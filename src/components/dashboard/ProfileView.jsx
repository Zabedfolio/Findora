"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Lock,
  Bell,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Save,
  KeyRound,
  Smartphone,
  LogOut,
  Award,
  Sparkles,
  RefreshCw,
  Fingerprint,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

export default function ProfileView() {
  const { user, isAdmin, logout } = useAuth();

  // Profile editable fields
  const [name, setName] = useState(user?.name || "Zabed Mahmud");
  const [email, setEmail] = useState(user?.email || "zabed@findora.app");
  const [phone, setPhone] = useState(user?.phone || "+880 1712-345678");
  const [altPhone, setAltPhone] = useState("+880 1987-654321");
  const [city, setCity] = useState("Dhaka");
  const [area, setArea] = useState("Dhanmondi, Sector 27");
  const [bio, setBio] = useState(
    "Active university student and community volunteer. Passionate about returning lost belongings safely."
  );

  // Security password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Privacy toggles
  const [maskPhone, setMaskPhone] = useState(true);
  const [approxLocation, setApproxLocation] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);

  // Feedback status
  const [savedMessage, setSavedMessage] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("personal"); // 'personal' | 'security' | 'privacy' | 'reputation'

  const avatarSrc = user?.image?.trim() ? user.image : "/default-avatar.png";

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavedMessage("Profile details updated successfully!");
    setTimeout(() => setSavedMessage(""), 3500);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert("Please fill in current and new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match.");
      return;
    }
    setSavedMessage("Security credentials updated securely!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSavedMessage(""), 3500);
  };

  return (
    <div className="space-y-6 pt-2">
      {/* 1. Header Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#9ae600]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Camera Overlay */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-[#9ae600]/40 shadow-xl bg-slate-800">
              <img
                src={avatarSrc}
                alt={name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
            </div>
            <button
              type="button"
              title="Change avatar photo"
              className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#9ae600] text-slate-950 shadow-md hover:bg-[#88cc00] transition-transform hover:scale-110 cursor-pointer"
            >
              <Camera size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-white">
                {name}
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
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={13} className="text-[#9ae600]" />
                <span className="font-medium">{phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#9ae600]" />
                <span className="font-medium">{city}, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Trust Score Card */}
          <div className="rounded-2xl bg-white/[0.06] backdrop-blur border border-white/10 p-4 text-center shrink-0 w-full sm:w-48">
            <div className="flex items-center justify-center gap-1.5 text-[#9ae600] text-xs font-mono font-bold mb-1">
              <ShieldCheck size={14} />
              <span>TRUST SCORE</span>
            </div>
            <p className="text-3xl font-black text-white font-heading">98<span className="text-sm font-normal text-slate-400">/100</span></p>
            <p className="mt-1 text-[11px] text-emerald-400 font-semibold">Zero Fraud Reports</p>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {savedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold"
        >
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{savedMessage}</span>
        </motion.div>
      )}

      {/* 2. Sub-Tabs */}
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

      {/* TAB: Personal Information */}
      {activeSubTab === "personal" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Phone Number (WhatsApp Enabled)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Alternative Emergency Contact
              </label>
              <input
                type="tel"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                City / Division
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Area / Primary Neighborhood
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Short Community Bio & Verification Note
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Changes are saved to your active Findora profile.
            </span>
            <button
              type="submit"
              className="btn-primary-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 shadow-md cursor-pointer"
            >
              <Save size={14} />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB: Security & Login */}
      {activeSubTab === "security" && (
        <div className="space-y-6">
          <form onSubmit={handleUpdatePassword} className="p-6 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound size={17} className="text-[#72a800] dark:text-[#9ae600]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Change Account Password
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPassword ? "Hide" : "Show"} password characters</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </form>

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
                    <p className="text-[11px] text-slate-500">Require an SMS verification code for claim approvals.</p>
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
              Privacy & Notification Controls
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
              <Sparkles size={12} /> ACTIVE BADGE
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] flex items-center justify-center mb-3">
              <Sparkles size={18} />
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
