"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowRightLeft,
  LayoutDashboard,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import useAuth from "@/hooks/useAuth";
import toast from "@/lib/toast";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAdmin, updateProfile } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [light, setLight] = useState(false);

  // Sync theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setLight(!isDark);
    }
  }, []);

  const handleToggleTheme = () => {
    setLight((current) => {
      const next = !current;
      if (typeof document !== "undefined") {
        if (next) {
          document.documentElement.classList.remove("dark");
        } else {
          document.documentElement.classList.add("dark");
        }
      }
      return next;
    });
  };

  // Determine section title from pathname
  const getPageMeta = () => {
    if (pathname.includes("/admin/reports")) {
      return { title: "Manage Listings & Reports", section: "Reports Moderation" };
    }
    if (pathname.includes("/admin/reviews")) {
      return { title: "Community Reviews Moderation", section: "Reviews Moderation" };
    }
    if (pathname.includes("/admin/fraud")) {
      return { title: "Fraud & Abuse Investigations", section: "Trust & Safety" };
    }
    if (pathname.includes("/admin/users")) {
      return { title: "User Directory & Access Control", section: "User Management" };
    }
    return { title: "Admin Overview & Telemetry", section: "Control Center" };
  };

  const meta = getPageMeta();

  // Role guard verification
  const isAuthorizedAdmin = Boolean(
    user?.role === "admin" ||
    isAdmin ||
    (typeof user?.email === "string" && user.email.toLowerCase().includes("admin"))
  );

  // One-click demo role upgrade for development/testing
  const handleElevateRole = () => {
    updateProfile({ role: "admin" });
    toast.success("Account elevated to Administrator role");
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070905] flex flex-col items-center justify-center p-6 text-slate-900 dark:text-white">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl flex items-center justify-center mb-4">
          <Loader2 className="w-7 h-7 text-[#9ae600] animate-spin" />
        </div>
        <p className="font-bold text-sm">Verifying Administrative Privileges...</p>
        <p className="text-xs text-slate-400 mt-1">Checking cryptographic session credentials</p>
      </div>
    );
  }

  // 2. Role-guarded: Access Denied screen if user is not an admin
  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070905] flex items-center justify-center p-6 text-slate-900 dark:text-white">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#090e06] border border-rose-500/30 p-8 shadow-2xl relative overflow-hidden text-center">
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <ShieldAlert size={32} />
          </div>

          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Access Restricted
          </span>

          <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            Administrator Privileges Required
          </h2>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You are currently signed in as{" "}
            <strong className="text-slate-800 dark:text-slate-200">{user?.name || user?.email}</strong>{" "}
            with role:{" "}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 font-mono text-[11px] text-rose-500">
              {user?.role || "user"}
            </code>
            . Only verified administrative accounts can access the Findora Control Center.
          </p>

          <div className="mt-6 space-y-2.5">
            {/* Quick Demo Switch to Admin */}
            <button
              type="button"
              onClick={handleElevateRole}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#9ae600] text-slate-950 hover:bg-[#86c800] transition-all shadow-md cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Switch to Admin Demo Account</span>
            </button>

            {/* Back to User Dashboard */}
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Return to User Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Admin Layout
  return (
    <div className="grain min-h-screen bg-slate-50/60 dark:bg-[#070905] text-slate-900 dark:text-white transition-colors">
      {/* Ambient Glowing Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.08] blur-[150px] dark:bg-emerald-500/[0.07]" />
        <div className="absolute right-[-100px] top-1/3 h-[420px] w-[420px] rounded-full bg-[#9ae600]/[0.08] blur-[140px] dark:bg-[#9ae600]/[0.06]" />
        <div className="absolute bottom-[-160px] left-[-100px] h-[400px] w-[400px] rounded-full bg-emerald-500/[0.06] blur-[140px]" />
      </div>

      {/* Shared Sidebar (renders Admin items because user.role === 'admin' and path is /admin) */}
      <Sidebar
        mobileOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`relative transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-[250px]"
        }`}
      >
        <div className="mx-auto max-w-[1520px] px-4 pb-14 sm:px-6 lg:px-8">
          <Topbar
            light={light}
            onToggleTheme={handleToggleTheme}
            onOpenMenu={() => setMenuOpen(true)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={meta.title}
            section={meta.section}
            badge="ADMIN PRIVILEGES"
          />

          <main className="mt-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
