"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import NotificationItem from "@/components/notifications/NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";

const MAX_VISIBLE = 5;

export default function NotificationBell({ className = "" }) {
    const reduce = useReducedMotion();
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
        useNotifications();

    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    // Close on outside click or Escape
    useEffect(() => {
        if (!open) return;

        function onMouseDown(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        function onKeyDown(e) {
            if (e.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const recent = notifications.slice(0, MAX_VISIBLE);
    const badge = unreadCount > 9 ? "9+" : String(unreadCount);

    return (
        <div className={`relative ${className}`} ref={wrapRef}>
            {/* Bell button */}
            <motion.button
                type="button"
                onClick={() => setOpen((v) => !v)}
                whileTap={reduce ? undefined : { scale: 0.92 }}
                aria-label={
                    unreadCount > 0
                        ? `Notifications, ${unreadCount} unread`
                        : "Notifications"
                }
                aria-haspopup="true"
                aria-expanded={open}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
            >
                <Bell className="h-5 w-5" />

                {/* Badge: hidden at 0, shows 9+ above 9 */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            key="badge"
                            initial={reduce ? false : { scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 18 }}
                            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime-400 px-1 text-[11px] font-bold leading-none text-zinc-950 ring-2 ring-white"
                        >
                            {badge}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Dropdown flyout */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={reduce ? false : { opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        style={{ transformOrigin: "top right" }}
                        className="absolute right-0 z-50 mt-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-zinc-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-lime-100 px-2 py-0.5 text-xs font-semibold text-lime-800">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-lime-700 transition-colors hover:text-lime-900 disabled:cursor-not-allowed disabled:text-zinc-300"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Mark all as read
                            </button>
                        </div>

                        {/* List */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="space-y-4 p-4" aria-busy="true">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="flex animate-pulse gap-3">
                                            <div className="h-10 w-10 rounded-full bg-zinc-200" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-3/4 rounded bg-zinc-200" />
                                                <div className="h-3 w-1/2 rounded bg-zinc-100" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : recent.length === 0 ? (
                                <div className="flex flex-col items-center px-6 py-10 text-center">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                                        <BellOff className="h-6 w-6" />
                                    </span>
                                    <p className="mt-3 text-sm font-semibold text-zinc-800">
                                        You&apos;re all caught up
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        New updates about your reports and claims will appear here.
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-zinc-100">
                                    {recent.map((n, i) => (
                                        <NotificationItem
                                            key={n._id || n.id}
                                            notification={n}
                                            onRead={markAsRead}
                                            onNavigate={() => setOpen(false)}
                                            index={i}
                                        />
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        <Link
                            href="/dashboard/notifications"
                            onClick={() => setOpen(false)}
                            className="block border-t border-zinc-100 bg-zinc-50 px-4 py-3 text-center text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100"
                        >
                            View all notifications
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}