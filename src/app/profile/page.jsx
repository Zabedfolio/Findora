"use client";

import React from "react";
import Link from "next/link";
import { User, Mail, Shield, Calendar, PackageSearch, PlusCircle, ArrowLeft, LogOut, Edit3 } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user, isAdmin, logout } = useAuth();

  const displayName = user?.name || "Findora Member";
  const displayEmail = user?.email || "member@findora.org";
  const avatarSrc = user?.image?.trim() ? user.image : "/default-avatar.png";

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

        {/* Profile Card Header */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800 shadow-md shrink-0">
              <img
                src={avatarSrc}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#9ae600] border-2 border-white dark:border-slate-900" />
            </div>

            {/* User Meta */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-950 dark:text-white truncate">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#9ae600]/20 text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30">
                  {isAdmin ? "ADMINISTRATOR" : "VERIFIED MEMBER"}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{displayEmail}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account Status: Active</span>
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex sm:flex-col items-center gap-2.5 shrink-0">
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#72a800] dark:text-[#9ae600]" />
                <span>Edit Profile</span>
              </Link>

              <Link
                href="/reports/new"
                className="inline-flex items-center gap-1.5 btn-primary-glow px-4 py-2 rounded-xl text-slate-950 font-bold text-xs shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Report</span>
              </Link>

              {logout && (
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 dark:text-rose-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard & Reports Directory Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/dashboard"
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#9ae600]/50 transition-all shadow-sm group"
          >
            <h3 className="text-base font-bold font-heading text-slate-950 dark:text-white group-hover:text-[#72a800] dark:group-hover:text-[#9ae600] transition-colors">
              Analytics &amp; Console Dashboard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              View recovery statistics, status breakdowns, and administrative telemetry.
            </p>
          </Link>

          <Link
            href="/reports"
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#9ae600]/50 transition-all shadow-sm group"
          >
            <h3 className="text-base font-bold font-heading text-slate-950 dark:text-white group-hover:text-[#72a800] dark:group-hover:text-[#9ae600] transition-colors">
              Community Reports Directory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse lost and found items or filter by category and location.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
