"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

/**
 * Inner layout shell with shared ambient lighting, single Sidebar, and single Topbar.
 */
function DashboardLayoutContent({ children }) {
  const pathname = usePathname();
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

  // Dynamically resolve section title & badge from current route
  const getPageMeta = () => {
    if (pathname?.includes("/admin/reports")) {
      return { title: "Manage Listings & Reports", section: "Reports Moderation", badge: "ADMIN PRIVILEGES" };
    }
    if (pathname?.includes("/admin/reviews")) {
      return { title: "Community Reviews Moderation", section: "Reviews Moderation", badge: "ADMIN PRIVILEGES" };
    }
    if (pathname?.includes("/admin/fraud")) {
      return { title: "Fraud & Abuse Investigations", section: "Trust & Safety", badge: "ADMIN PRIVILEGES" };
    }
    if (pathname?.includes("/admin/users")) {
      return { title: "User Directory & Access Control", section: "User Management", badge: "ADMIN PRIVILEGES" };
    }
    if (pathname?.includes("/admin/profile")) {
      return { title: "Admin Profile & Settings", section: "Admin Account", badge: "ADMIN PRIVILEGES" };
    }
    if (pathname?.startsWith("/admin")) {
      return { title: "Admin Overview & Telemetry", section: "Control Center", badge: "ADMIN PRIVILEGES" };
    }
    if (pathname?.includes("/dashboard/my-reports")) {
      return { title: "My Reports Hub", section: "Workspace", badge: "ACTIVE" };
    }
    if (pathname?.includes("/dashboard/profile")) {
      return { title: "Profile & Account Settings", section: "Account", badge: "SECURE" };
    }
    return { title: "User Dashboard", section: "Workspace", badge: "ACTIVE" };
  };

  const meta = getPageMeta();

  return (
    <div className="grain min-h-screen bg-slate-50/60 dark:bg-[#070905] text-slate-900 dark:text-white transition-colors">
      {/* Ambient Glowing Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.08] blur-[150px] dark:bg-emerald-500/[0.07]" />
        <div className="absolute right-[-100px] top-1/3 h-[420px] w-[420px] rounded-full bg-[#9ae600]/[0.08] blur-[140px] dark:bg-[#9ae600]/[0.06]" />
        <div className="absolute bottom-[-160px] left-[-100px] h-[400px] w-[400px] rounded-full bg-emerald-500/[0.06] blur-[140px]" />
      </div>

      {/* Single Shared Sidebar: Automatically adapts items for Admin vs User */}
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
            badge={meta.badge}
          />

          <main className="mt-4">{children}</main>
        </div>
      </div>
    </div>
  );
}

/**
 * Client-side layout wrapper that enforces ProtectedRoute
 */
export default function DashboardLayoutClient({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <ProtectedRoute roles={isAdminRoute ? ["admin"] : undefined}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProtectedRoute>
  );
}
