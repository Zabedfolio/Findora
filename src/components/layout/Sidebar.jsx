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
  Sparkles,
  Handshake,
} from "lucide-react";
import { cn } from "../../utils/cn";

const NAV_MAIN = [
  { id: "overview", tabKey: "overview", icon: LayoutDashboard, label: "Overview & Analytics", href: "/dashboard" },
  { id: "my-listings", tabKey: "my-listings", icon: FileText, label: "My Listings", href: "/dashboard?tab=my-listings" },
  { id: "claims", tabKey: "claims", icon: Handshake, label: "Claims & Verification", href: "/dashboard?tab=claims" },
  { id: "reports", tabKey: "reports", icon: PackageSearch, label: "Reports Directory", href: "/dashboard?tab=reports" },
];

const NAV_COMMUNITY = [
  { icon: ShieldCheck, label: "Trust & Safety", href: "/trust" },
  { icon: Info, label: "About Findora", href: "/about" },
];

const NAV_SECONDARY = [
  { id: "profile", tabKey: "profile", icon: User, label: "Profile & Settings", href: "/dashboard?tab=profile" },
  { icon: Globe, label: "Public Website", href: "/" },
];

function NavLinkItem({ item, collapsed, onNavigate, activeTab, onSelectTab }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams ? searchParams.get("tab") : null;
  const currentTab = activeTab || tabFromUrl || "overview";

  let isActive = false;
  if (pathname === "/dashboard") {
    if (item.tabKey) {
      isActive = currentTab === item.tabKey;
    } else {
      isActive = item.href === "/dashboard" && currentTab === "overview";
    }
  } else {
    isActive =
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(`${item.href}/`));
  }

  const handleClick = (e) => {
    if (pathname === "/dashboard" && item.tabKey && onSelectTab) {
      e.preventDefault();
      onSelectTab(item.tabKey);
      if (onNavigate) onNavigate();
      // Update URL query string smoothly without reload
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
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#9ae600]/20 text-[#629400] dark:text-[#9ae600] border border-[#9ae600]/40 leading-none">
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
            href="/dashboard"
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
                <p className="font-display text-[16px] font-bold tracking-tight text-slate-950 dark:text-white leading-none">
                  Findora
                </p>
                <p className="mt-1 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#72a800] dark:text-[#9ae600]">
                  Admin Console
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Action Button: New Report */}
        <div className={cn("pt-4 pb-2", collapsed ? "px-2" : "px-3")}>
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
        </div>

        {/* Section 1: Main Workspace */}
        <div className="mt-3 px-3">
          {!collapsed && (
            <p className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Workspace
            </p>
          )}
          <nav aria-label="Main navigation" className="space-y-1">
            {NAV_MAIN.map((item) => (
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
            {NAV_COMMUNITY.map((item) => (
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
            {NAV_SECONDARY.map((item) => (
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
      </div>

      {/* Bottom: Weekly Goal Card (Hidden when collapsed) */}
      {!collapsed && (
        <div className="m-3 overflow-hidden rounded-2xl bg-gradient-to-br from-[#9ae600]/20 via-slate-900/40 to-slate-950 p-[1px] border border-[#9ae600]/30 shadow-md">
          <div className="rounded-[15px] bg-white/95 dark:bg-[#070b04]/95 p-3.5 backdrop-blur">
            <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#72a800] dark:text-[#9ae600]" />
                Weekly Target
              </span>
              <span className="text-[10px] font-mono font-bold text-[#72a800] dark:text-[#9ae600]">
                82% Reunited
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              41 of 50 lost items safely reunited.
            </p>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-[#9ae600] shadow-[0_0_8px_#9ae600]"
                style={{ width: "82%" }}
              />
            </div>
          </div>
        </div>
      )}
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
                className="absolute right-3.5 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
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
