"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "@/services/notificationService";

const getId = (n) => n._id || n.id;
const getRead = (n) => Boolean(n.isRead ?? n.read);

export function useNotifications({ pollMs = 30000 } = {}) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load + polling
    useEffect(() => {
        refetch();
        if (!pollMs) return;
        const timer = setInterval(refetch, pollMs);
        return () => clearInterval(timer);
    }, [refetch, pollMs]);

    // Optimistic update: UI changes first, refetch restores the truth if it fails
    const markAsRead = useCallback(
        async (id) => {
            setNotifications((list) =>
                list.map((n) => (getId(n) === id ? { ...n, isRead: true } : n))
            );
            try {
                await markNotificationRead(id);
            } catch (err) {
                setError(err);
                refetch();
            }
        },
        [refetch]
    );

    const markAllAsRead = useCallback(async () => {
        setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
        try {
            await markAllNotificationsRead();
        } catch (err) {
            setError(err);
            refetch();
        }
    }, [refetch]);

    const unreadCount = useMemo(
        () => notifications.filter((n) => !getRead(n)).length,
        [notifications]
    );

    return {
        notifications,
        unreadCount,
        loading,
        error,
        refetch,
        markAsRead,
        markAllAsRead,
    };
}

export default useNotifications;