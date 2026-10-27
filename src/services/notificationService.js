const STORAGE_KEY = "findora_notifications_v1";

const ago = (ms) => new Date(Date.now() - ms).toISOString();

// Demo data, used only when the backend is not configured or unreachable
function getSeedNotifications() {
    return [
        {
            _id: "n1",
            type: "new_claim",
            title: "New claim request",
            message: "Rahim Uddin submitted a claim for your found wallet.",
            isRead: false,
            createdAt: ago(5 * 60e3),
            reportId: "rep-1",
        },
        {
            _id: "n2",
            type: "claim_update",
            title: "Claim approved",
            message: "Your claim for the black backpack was approved.",
            isRead: false,
            createdAt: ago(2 * 3600e3),
            reportId: "rep-2",
        },
        {
            _id: "n3",
            type: "match_found",
            title: "Possible match found",
            message: "A found item looks similar to your lost phone.",
            isRead: true,
            createdAt: ago(26 * 3600e3),
            reportId: "rep-3",
        },
        {
            _id: "n4",
            type: "handover_scheduled",
            message: "Handover scheduled for Friday, 4:00 PM at Dhanmondi.",
            isRead: true,
            createdAt: ago(3 * 86400e3),
        },
        {
            _id: "n5",
            type: "system",
            title: "Welcome to Findora",
            message: "Report lost or found items and help your community.",
            isRead: true,
            createdAt: ago(9 * 86400e3),
        },
    ];
}

function getStored() {
    if (typeof window === "undefined") return getSeedNotifications();
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { }
    const seed = getSeedNotifications();
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    } catch { }
    return seed;
}

function setStored(list) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch { }
}

/**
 * Fetch all notifications for the current user (newest first)
 */
export async function getNotifications() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase) {
        try {
            const res = await fetch(`${apiBase}/notifications`, {
                credentials: "include",
            });
            if (res.ok) {
                const body = await res.json();
                if (Array.isArray(body)) return body;
                return body?.notifications || body?.data || [];
            }
        } catch (e) {
            console.warn("Backend API unreachable, using local demo notifications:", e.message);
        }
    }

    return [...getStored()].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
}

/**
 * Mark one notification as read
 */
export async function markNotificationRead(id) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase) {
        try {
            const res = await fetch(`${apiBase}/notifications/${id}/read`, {
                method: "PATCH",
                credentials: "include",
            });
            if (res.ok) return await res.json();
        } catch { }
    }

    setStored(
        getStored().map((n) =>
            n._id === id || n.id === id ? { ...n, isRead: true } : n
        )
    );
    return { success: true, id };
}

/**
 * Mark every notification as read
 */
export async function markAllNotificationsRead() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase) {
        try {
            const res = await fetch(`${apiBase}/notifications/read-all`, {
                method: "PATCH",
                credentials: "include",
            });
            if (res.ok) return await res.json();
        } catch { }
    }

    setStored(getStored().map((n) => ({ ...n, isRead: true })));
    return { success: true };
}