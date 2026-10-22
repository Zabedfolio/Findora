"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, User, ShieldCheck } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfileForm from "@/components/auth/ProfileForm";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export default function DashboardProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50/60 dark:bg-[#070905] text-slate-900 dark:text-white py-8 sm:py-12 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header Navigation */}
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-slate-950 dark:text-white">
                  Profile &amp; Account Settings
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Manage your personal contact details, security credentials, and identity status.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9ae600]/15 border border-[#9ae600]/30 text-[#72a800] dark:text-[#9ae600] text-xs font-mono font-bold self-start sm:self-auto">
                <ShieldCheck size={14} />
                <span>PROTECTED SESSION</span>
              </div>
            </div>
          </div>

          {/* 1. Profile Information Form */}
          <ProfileForm />

          {/* 2. Change Password Form */}
          <ChangePasswordForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
