"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BellOff, CheckCheck, Trash2 } from "lucide-react";
import NotificationItem from "@/components/notifications/NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";

const CLAIM_TYPES = ["new_claim", "claim_update"];
const MATCH_TYPES = ["match_found"];

const TABS = [
    { key: "all", label: "All", test: () => true },
    { key: "unread", label: "Unread", test: (n) => !Boolean(n.isRead ?? n.read) },
    { key: "claims", label: "Claims", test: (n) => CLAIM_TYPES.includes(n.type) },
    { key: "matches", label: "Matches", test: (n) => MATCH_TYPES.includes(n.type) },
];

const EMPTY_TEXT = {
    all: "No notifications yet. Updates about your reports and claims will appear here.",
    unread: "You're all caught up. There are no unread notifications.",
    claims: "No claim notifications yet.",
    matches: "No match notifications yet.",
};

export default function NotificationsPage() {
    const reduce = useReducedMotion();
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, clearAll } =
        useNotifications();

    const [tab, setTab] = useState("all");
    const [confirmClear, setConfirmClear] = useState(false);

    const counts = useMemo(() => {
        const result = {};
        TABS.forEach((t) => {
            result[t.key] = notifications.filter(t.test).length;
        });
        return result;
    }, [notifications]);

    const activeTab = TABS.find((t) => t.key === tab) || TABS[0];
    const visible = notifications.filter(activeTab.test);

    async function handleClear() {
        await clearAll();
        setConfirmClear(false);
        setTab("all");
    }

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
                        Notifications
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
                            : "You're all caught up."}
                    </p>
                </div>

                {/* Bulk actions */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition-all hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <CheckCheck className="h-4 w-4 text-lime-600" />
                        Mark all read
                    </button>

                    <button
                        type="button"
                        onClick={() => setConfirmClear(true)}
                        disabled={notifications.length === 0}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear all
                    </button>
                </div>
            </div>

            {/* Clear all confirmation */}
            <AnimatePresence>
                {confirmClear && (
                    <motion.div
                        initial={reduce ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-medium text-red-800">
                                Delete all notifications? This cannot be undone.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmClear(false)}
                                    className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
                                >
                                    Yes, clear all
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>

            {/* Filter tabs */}
            <div
                role="tablist"
                aria-label="Filter notifications"
                className="mt-6 flex gap-1 overflow-x-auto rounded-full bg-zinc-100 p-1"
            >
                {TABS.map((t) => {
                    const active = t.key === tab;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setTab(t.key)}
                            className="relative flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                        >
                            {active && (
                                <motion.span
                                    layoutId="notification-tab-pill"
                                    transition={
                                        reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }
                                    }
                                    className="absolute inset-0 rounded-full bg-white shadow-sm"
                                />
                            )}
                            <span
                                className={`relative z-10 inline-flex items-center gap-1.5 ${active ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
                                    }`}
                            >
                                {t.label}
                                <span
                                    className={`rounded-full px-1.5 text-xs ${active ? "bg-lime-400 text-zinc-900" : "bg-zinc-200 text-zinc-600"
                                        }`}
                                >
                                    {counts[t.key]}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* List */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                {loading ? (
                    <div className="space-y-5 p-5" aria-busy="true">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="flex animate-pulse gap-3">
                                <div className="h-10 w-10 rounded-full bg-zinc-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-1/2 rounded bg-zinc-200" />
                                    <div className="h-3 w-3/4 rounded bg-zinc-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center px-6 py-16 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                            <BellOff className="h-7 w-7" />
                        </span>
                        <p className="mt-4 max-w-xs text-sm text-zinc-500">
                            {EMPTY_TEXT[tab]}
                        </p>
                    </div>
                ) : (
                    <ul key={tab} className="divide-y divide-zinc-100">
                        {visible.map((n, i) => (
                            <NotificationItem
                                key={n._id || n.id}
                                notification={n}
                                onRead={markAsRead}
                                index={i}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}