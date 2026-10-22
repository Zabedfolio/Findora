"use client";

import { useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, PackageSearch, LocateFixed, X, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "../../utils/cn";

const NAV = [
  { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
  { icon: ShieldCheck, label: "Claims & Handover", href: "/dashboard/claims" },
  { icon: PackageSearch, label: "Reports & listings", href: "/reports" },
];

function NavContent({ onNavigate }) {
  const pathname = usePathname();
  const uid = useId();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pt-6 pb-7">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-rose-400 shadow-[0_8px_20px_-6px_rgba(139,92,246,0.55)]">
            <LocateFixed size={20} className="text-white" strokeWidth={2.4} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-ink-950" />
          </div>
          <div>
            <p className="font-display text-[17px] font-bold leading-none tracking-tight text-slate-900 dark:text-white">
              Findora
            </p>
            <p className="mt-1 text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Admin console
            </p>
          </div>
        </Link>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors duration-200",
                isActive
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={`nav-active-${uid}`}
                  className="absolute inset-0 rounded-xl bg-slate-900/[0.05] ring-1 ring-slate-900/5 dark:bg-white/[0.08] dark:ring-white/10"
                  transition={{ type: "spring", stiffness: 550, damping: 42 }}
                />
              )}
              <item.icon
                size={17}
                strokeWidth={2.1}
                className={cn(
                  "relative z-10 transition-colors",
                  isActive ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )}
              />
              <span className="relative z-10 flex-1 text-left">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-[1px]">
        <div className="rounded-[15px] bg-white/95 p-4 backdrop-blur dark:bg-ink-900/90">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-900 dark:text-white">
            <Sparkles size={14} className="text-violet-500" />
            Weekly return goal
          </div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400">
            41 of 50 items returned this week
          </p>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "82%" }}
              transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
            />
          </div>
          <p className="tnum mt-1.5 text-right text-[11px] font-semibold text-violet-500">82%</p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-slate-200/70 bg-white/70 backdrop-blur-xl lg:block dark:border-white/[0.06] dark:bg-ink-950/70">
        <NavContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 w-[268px] bg-white shadow-2xl lg:hidden dark:bg-ink-900"
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
              <NavContent onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
