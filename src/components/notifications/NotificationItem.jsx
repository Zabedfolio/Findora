"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Bell, BadgeCheck, CalendarClock, Inbox, Sparkles } from "lucide-react";

const TYPE_CONFIG = {
    new_claim: { Icon: Inbox, style: "bg-sky-100 text-sky-600" },
    claim_update: { Icon: BadgeCheck, style: "bg-emerald-100 text-emerald-600" },
    match_found: { Icon: Sparkles, style: "bg-amber-100 text-amber-600" },
    handover_scheduled: { Icon: CalendarClock, style: "bg-violet-100 text-violet-600" },
    system: { Icon: Bell, style: "bg-zinc-100 text-zinc-600" },
};

function timeAgo(date) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return "Just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Backend can send a ready-made link. Otherwise fall back to the report page.
function getHref(n) {
    if (n.link || n.url) return n.link || n.url;
    const reportId = n.report?._id || n.report || n.reportId;
    return reportId ? `/reports/${reportId}` : null;
}

/**
 * Props:
 * - notification: { _id, type, title?, message, isRead, createdAt, link?, reportId? }
 * - onRead: (id) => void   (pass markAsRead from useNotifications)
 * - onNavigate: optional, e.g. to close the bell dropdown
 * - index: optional, used for the staggered entrance animation
 */
export default function NotificationItem({
    notification,
    onRead,
    onNavigate,
    index = 0,
}) {
    const router = useRouter();
    const reduce = useReducedMotion();

    const id = notification._id || notification.id;
    const isRead = Boolean(notification.isRead ?? notification.read);
    const { Icon, style } = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
    const href = getHref(notification);

    function handleClick() {
        if (!isRead) onRead?.(id);
        if (href) router.push(href);
        onNavigate?.();
    }

    return (
        <motion.li
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
            className="list-none"
        >
            <button
                type="button"
                onClick={handleClick}
                className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 ${isRead ? "bg-white" : "bg-lime-50/60"
                    }`}
            >
                <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style}`}
                >
                    <Icon className="h-5 w-5" />
                </span>

                <span className="min-w-0 flex-1">
                    {notification.title && (
                        <span
                            className={`block truncate text-sm ${isRead ? "font-medium text-zinc-700" : "font-bold text-zinc-900"
                                }`}
                        >
                            {notification.title}
                        </span>
                    )}
                    <span
                        className={`block text-sm leading-snug ${isRead
                            ? "text-zinc-500"
                            : notification.title
                                ? "font-medium text-zinc-700"
                                : "font-bold text-zinc-900"
                            }`}
                    >
                        {notification.message}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-400">
                        {timeAgo(notification.createdAt)}
                    </span>
                </span>

                {/* Unread indicator: lime dot */}
                {!isRead && (
                    <span
                        className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-lime-400 ring-4 ring-lime-100"
                        aria-label="Unread"
                    />
                )}
            </button>
        </motion.li>
    );
}