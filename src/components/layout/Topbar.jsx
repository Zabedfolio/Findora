"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Sun, Moon, PanelLeftClose, PanelLeftOpen, User } from "lucide-react";
import { cn } from "../../utils/cn";
import useAuth from "@/hooks/useAuth";

function IconButton({ children, onClick, label, dot }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-full transition-all duration-200 cursor-pointer",
        "bg-white text-slate-500 ring-1 ring-slate-900/10 hover:text-slate-900 hover:ring-slate-900/20",
        "dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/10 dark:hover:bg-white/10 dark:hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ae600]"
      )}
    >
      {children}
      {dot && (
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#9ae600] ring-2 ring-white dark:ring-slate-950" />
      )}
    </button>
  );
}

export default function Topbar({
  light,
  onToggleTheme,
  onOpenMenu,
  collapsed = false,
  onToggleCollapse,
  onOpenProfile,
}) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  });

  const avatarSrc = user?.image?.trim() ? user.image : "/default-avatar.png";

  return (
    <header className="sticky top-0 z-20 -mx-4 px-4 pb-3 pt-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f4f5f8] via-[#f4f5f8]/85 to-transparent dark:from-[#060804] dark:via-[#060804]/85 dark:to-transparent" />
      <div className="relative flex items-center gap-3">
        {/* Mobile Open Drawer Button */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open mobile menu"
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 ring-1 ring-slate-900/10 lg:hidden dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/10 cursor-pointer"
        >
          <Menu size={18} />
        </button>

        {/* Desktop Collapse / Expand Toggle Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 ring-1 ring-slate-900/10 hover:text-slate-900 hover:ring-slate-900/20 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/10 dark:hover:text-white transition-all cursor-pointer"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10.5px] font-mono font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            <span>Findora</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-[#72a800] dark:text-[#9ae600]">Workspace</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2.5">
            <h1 className="font-display truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
              User Dashboard
            </h1>
            <span className="hidden items-center rounded-full bg-[#9ae600]/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30 sm:flex">
              ACTIVE
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <span className="mr-1 hidden text-[12px] font-mono font-medium text-slate-400 md:block dark:text-slate-500">
            {today}
          </span>

          <IconButton label="Notifications" dot>
            <Bell size={17} strokeWidth={2.1} />
          </IconButton>

          <IconButton label="Toggle theme" onClick={onToggleTheme}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={light ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="grid place-items-center"
              >
                {light ? <Moon size={17} strokeWidth={2.1} /> : <Sun size={17} strokeWidth={2.1} />}
              </motion.span>
            </AnimatePresence>
          </IconButton>

          {/* User Profile Avatar */}
          {onOpenProfile ? (
            <button
              type="button"
              onClick={onOpenProfile}
              title="View Profile & Settings"
              className="relative ml-0.5 hidden h-10 w-10 overflow-hidden rounded-full ring-2 ring-slate-200 dark:ring-slate-700 hover:ring-[#9ae600] transition-all hover:scale-105 sm:block cursor-pointer"
            >
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#9ae600] border border-white dark:border-slate-900" />
            </button>
          ) : (
            <Link
              href="/dashboard?tab=profile"
              title="View Profile & Settings"
              className="relative ml-0.5 hidden h-10 w-10 overflow-hidden rounded-full ring-2 ring-slate-200 dark:ring-slate-700 hover:ring-[#9ae600] transition-all hover:scale-105 sm:block"
            >
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#9ae600] border border-white dark:border-slate-900" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
