"use client";

import { useId, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PackageSearch,
  FileText,
  ShieldCheck,
  Info,
  User,
  Globe,
  PlusCircle,
  X,
  LogOut,
  Handshake,
  ShieldAlert,
  Users,
  MessageSquareWarning,
  Flame,
  Activity,
} from "lucide-react";
import { cn } from "../../utils/cn";
import useAuth from "@/hooks/useAuth";

// User Workspace Navigation Items
const NAV_USER_MAIN = [
  { id: "overview", tabKey: "overview", icon: LayoutDashboard, label: "Overview & Analytics", href: "/dashboard" },
  { id: "reports", tabKey: "reports", icon: FileText, label: "My Reports", href: "/dashboard?tab=reports" },
  { id: "claims", tabKey: "claims", icon: Handshake, label: "Claims & Verification", href: "/dashboard?tab=claims" },
];

const NAV_USER_COMMUNITY = [
  { icon: ShieldCheck, label: "Trust & Safety", href: "/trust" },
  { icon: Info, label: "About Findora", href: "/about" },
];

const NAV_USER_SECONDARY = [
  { id: "profile", tabKey: "profile", icon: User, label: "Profile & Settings", href: "/dashboard?tab=profile" },
  { icon: Globe, label: "Public Website", href: "/" },
];

// Admin Workspace Navigation Items
const NAV_ADMIN_MAIN = [
  { id: "admin-overview", icon: LayoutDashboard, label: "Overview & Metrics", href: "/admin" },
  { id: "admin-reports", icon: FileText, label: "Manage Reports", href: "/admin/reports", badge: "Listings" },
  { id: "admin-reviews", icon: MessageSquareWarning, label: "Review Moderation", href: "/admin/reviews", badge: "Mod" },
  { id: "admin-fraud", icon: ShieldAlert, label: "Fraud & Abuse", href: "/admin/fraud", badge: "Alerts" },
  { id: "admin-users", icon: Users, label: "User Management", href: "/admin/users", badge: "Staff" },
];

const NAV_ADMIN_SECONDARY = [
  { id: "user-dashboard", icon: PackageSearch, label: "User Dashboard", href: "/dashboard" },
  { id: "public-web", icon: Globe, label: "Public Website", href: "/" },
  { id: "profile", tabKey: "profile", icon: User, label: "Profile & Settings", href: "/dashboard?tab=profile" },
];

function NavLinkItem({ item, collapsed, onNavigate, activeTab, onSelectTab }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams ? searchParams.get("tab") : null;
  const currentTab = activeTab || tabFromUrl || "overview";

  let isActive = false;

  if (item.href === "/admin") {
    isActive = pathname === "/admin";
  } else if (item.href.startsWith("/admin/")) {
    isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
  } else if (pathname === "/dashboard") {
    if (item.tabKey) {
      if (item.tabKey === "reports") {
        isActive = currentTab === "reports" || currentTab === "my-reports" || currentTab === "my-listings";
      } else {
        isActive = currentTab === item.tabKey;
      }
    } else {
      isActive = item.href === "/dashboard" && currentTab === "overview";
    }
  } else {
    isActive =
      pathname === item.href ||
      (item.href !== "/" && item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
  }

  const handleClick = (e) => {
    if (pathname === "/dashboard" && item.tabKey && onSelectTab) {
      e.preventDefault();
      onSelectTab(item.tabKey);
      if (onNavigate) onNavigate();
      const url = new URL(window.location.href);
      if (item.tabKey === "overview") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", item.tabKey);
      }
      window.history.pushState({}, "", url.toString());
    } else {
      if (onNavigate) onNavigate();
    }
  };

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex items-center rounded-2xl text-[13px] font-semibold transition-all duration-200 cursor-pointer",
        collapsed
          ? "justify-center p-3"
          : "gap-3 px-3.5 py-2.5",
        isActive
          ? "bg-[#9ae600]/15 dark:bg-[#9ae600]/10 text-slate-950 dark:text-white border border-[#9ae600]/30 shadow-xs"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/[0.06] hover:text-slate-950 dark:hover:text-white"
      )}
    >
      <item.icon
        size={18}
        strokeWidth={2.2}
        className={cn(
          "shrink-0 transition-colors",
          isActive
            ? "text-[#72a800] dark:text-[#9ae600]"
            : "text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white"
        )}
      />

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span
              className={cn(
                "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border leading-none",
                item.badge === "Alerts"
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : item.badge === "Mod"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-[#9ae600]/20 text-[#629400] dark:text-[#9ae600] border-[#9ae600]/40"
              )}
            >
              {item.badge}
            </span>
          )}
        </>
      )}

      {/* Collapsed Tooltip */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-950 text-white text-xs font-mono font-medium shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
          {item.label}
        </div>
      )}
    </Link>
  );
}

function NavContent({ collapsed, onToggleCollapse, onNavigate, activeTab, onSelectTab }) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  // Role-based sidebar detection:
  // Show admin items if user role is admin, or if current page is in /admin route
  const isAdminView = user?.role === "admin" || (pathname && pathname.startsWith("/admin"));

  const handleSignOut = async () => {
    onNavigate?.();
    if (logout) {
      await logout();
    }
  };

  return (
    <div className="flex h-full flex-col justify-between select-none">
      {/* Top: Brand Header */}
      <div>
        <div
          className={cn(
            "flex items-center pt-5 pb-5 border-b border-slate-200/80 dark:border-white/[0.08]",
            collapsed ? "justify-center px-2" : "px-4"
          )}
        >
          {/* Logo */}
          <Link
            href={isAdminView ? "/admin" : "/dashboard"}
            onClick={onNavigate}
            className="flex items-center gap-2.5 shrink-0 group focus:outline-hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.3)] flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 shrink-0">
              <img
                src="/findora-logo-clean.png"
                alt="Findora"
                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(154,230,0,0.6)]"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-display text-[16px] font-bold tracking-tight text-slate-950 dark:text-white leading-none">
                    Findora
                  </p>
                  {isAdminView && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                <p className={cn(
                  "mt-1 text-[10px] font-mono font-bold uppercase tracking-[0.14em]",
                  isAdminView
                    ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                    : "text-[#72a800] dark:text-[#9ae600]"
                )}>
                  {isAdminView ? "Admin Control" : "User Workspace"}
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Action Button: New Report or Admin Center */}
        <div className={cn("pt-4 pb-2", collapsed ? "px-2" : "px-3")}>
          {isAdminView ? (
            <Link
              href="/reports/new"
              onClick={onNavigate}
              title={collapsed ? "Post Official Report" : undefined}
              className={cn(
                "btn-primary-glow flex items-center justify-center rounded-2xl text-slate-950 font-bold transition-all shadow-md group",
                collapsed ? "p-3" : "gap-2 px-4 py-2.5 text-xs sm:text-sm"
              )}
            >
              <PlusCircle size={17} className="shrink-0" />
              {!collapsed && <span>New Report</span>}
            </Link>
          ) : (
            <Link
              href="/reports/new"
              onClick={onNavigate}
              title={collapsed ? "Report New Item" : undefined}
              className={cn(
                "btn-primary-glow flex items-center justify-center rounded-2xl text-slate-950 font-bold transition-all shadow-md group",
                collapsed ? "p-3" : "gap-2 px-4 py-2.5 text-xs sm:text-sm"
              )}
            >
              <PlusCircle size={17} className="shrink-0" />
              {!collapsed && <span>Report Item</span>}
            </Link>
          )}
        </div>

        {/* ============================================================== */}
        {/* ROLE-BASED NAVIGATION ITEMS                                    */}
        {/* ============================================================== */}

        {isAdminView ? (
          /* =================== ADMIN SIDEBAR ITEMS =================== */
          <>
            {/* Section 1: Admin Control Modules */}
            <div className="mt-3 px-3">
              {!collapsed && (
                <p className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Administration
                </p>
              )}
              <nav aria-label="Admin navigation" className="space-y-1">
                {NAV_ADMIN_MAIN.map((item) => (
                  <NavLinkItem
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                    activeTab={activeTab}
                    onSelectTab={onSelectTab}
                  />
                ))}
              </nav>
            </div>

            {/* Section 2: Secondary / Switch to User Dashboard */}
            <div className="mt-4 px-3">
              {!collapsed && (
                <p className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Quick Access
                </p>
              )}
              <nav aria-label="Admin secondary navigation" className="space-y-1">
                {NAV_ADMIN_SECONDARY.map((item) => (
                  <NavLinkItem
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                    activeTab={activeTab}
                    onSelectTab={onSelectTab}
                  />
                ))}
              </nav>
            </div>
          </>
        ) : (
          /* =================== USER SIDEBAR ITEMS =================== */
          <>
            {/* Section 1: Main User Workspace */}
            <div className="mt-3 px-3">
              {!collapsed && (
                <p className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Workspace
                </p>
              )}
              <nav aria-label="Main navigation" className="space-y-1">
                {NAV_USER_MAIN.map((item) => (
                  <NavLinkItem
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                    activeTab={activeTab}
                    onSelectTab={onSelectTab}
                  />
                ))}
              </nav>
            </div>

            {/* Section 2: Safety & Community */}
            <div className="mt-4 px-3">
              {!collapsed && (
                <p className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Trust & Safety
                </p>
              )}
              <nav aria-label="Community navigation" className="space-y-1">
                {NAV_USER_COMMUNITY.map((item) => (
                  <NavLinkItem
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                    activeTab={activeTab}
                    onSelectTab={onSelectTab}
                  />
                ))}
              </nav>
            </div>

            {/* Section 3: Account & System */}
            <div className="mt-4 px-3">
              {!collapsed && (
                <p className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Account
                </p>
              )}
              <nav aria-label="System navigation" className="space-y-1">
                {NAV_USER_SECONDARY.map((item) => (
                  <NavLinkItem
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                    activeTab={activeTab}
                    onSelectTab={onSelectTab}
                  />
                ))}

                {/* If user is an admin viewing user dashboard, show one-click jump to Admin panel */}
                {isAdmin && (
                  <NavLinkItem
                    item={{
                      id: "admin-jump",
                      icon: ShieldCheck,
                      label: "Admin Control Center",
                      href: "/admin",
                      badge: "Admin",
                    }}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                    activeTab={activeTab}
                    onSelectTab={onSelectTab}
                  />
                )}
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Bottom Footer: User Profile & Sign Out */}
      <div
        className={cn(
          "border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02]",
          collapsed ? "p-2.5 pb-10" : "p-3 pb-10"
        )}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/dashboard/profile"
              onClick={onNavigate}
              title={`${user?.name || "Member"} (${user?.role || "user"})`}
              className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-200 dark:ring-white/10 hover:ring-[#9ae600] transition-all group shrink-0"
            >
              <img
                src={user?.image || "/default-avatar.png"}
                alt={user?.name || "User"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#9ae600] border-2 border-white dark:border-slate-900" />
            </Link>

            <button
              type="button"
              id="sidebar-signout-btn-collapsed"
              onClick={handleSignOut}
              title="Sign Out"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* User Capsule */}
            <Link
              href="/dashboard/profile"
              onClick={onNavigate}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition-colors group cursor-pointer"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-slate-200 dark:ring-white/10 group-hover:ring-[#9ae600] transition-all shrink-0">
                <img
                  src={user?.image || "/default-avatar.png"}
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#9ae600] border-2 border-white dark:border-slate-900" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate font-heading group-hover:text-[#598c00] dark:group-hover:text-[#9ae600] transition-colors">
                    {user?.name || "Findora Member"}
                  </p>
                  <span
                    className={cn(
                      "text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold shrink-0",
                      isAdmin
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {user?.role || "user"}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 dark:text-slate-500 truncate">
                  {user?.email || "Account settings"}
                </p>
              </div>
            </Link>

            {/* Dedicated Sign Out Button */}
            <button
              type="button"
              id="sidebar-signout-btn"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100/80 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/30 transition-colors cursor-pointer group"
            >
              <LogOut size={13} className="transition-transform group-hover:-translate-x-0.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({
  mobileOpen,
  onClose,
  collapsed = false,
  onToggleCollapse,
  activeTab = "overview",
  onSelectTab,
}) {
  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200/80 bg-white/90 backdrop-blur-xl lg:block dark:border-white/[0.08] dark:bg-[#060804]/90 transition-all duration-300",
          collapsed ? "w-[76px]" : "w-[250px]"
        )}
      >
        <Suspense fallback={null}>
          <NavContent
            collapsed={collapsed}
            onToggleCollapse={onToggleCollapse}
            activeTab={activeTab}
            onSelectTab={onSelectTab}
          />
        </Suspense>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 w-[270px] bg-white dark:bg-[#070a05] shadow-2xl lg:hidden border-r border-slate-200 dark:border-slate-800"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3.5 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
              <Suspense fallback={null}>
                <NavContent
                  onNavigate={onClose}
                  activeTab={activeTab}
                  onSelectTab={onSelectTab}
                />
              </Suspense>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
