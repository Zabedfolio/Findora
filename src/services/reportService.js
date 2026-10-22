import { lostReports, foundReports } from "@/demo-data";

/**
 * All predefined categories for filtering
 */
export const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Documents & Wallets",
  "Bags & Luggage",
  "Keys & Access",
  "Jewelry & Watches",
  "Pets & Animals",
  "Clothing & Accessories",
];

/**
 * Common locations for quick filtering
 */
export const POPULAR_LOCATIONS = [
  "All Locations",
  "Dhanmondi, Dhaka",
  "Gulshan, Dhaka",
  "Banani, Dhaka",
  "Uttara, Dhaka",
  "Bashundhara R/A",
  "Mohakhali, Dhaka",
  "Mirpur, Dhaka",
  "Motijheel, Dhaka",
  "Agargaon, Dhaka",
];

/**
 * Unified list of all reports
 */
export const getAllDemoReports = () => [...lostReports, ...foundReports];

/**
 * Fetch and filter reports based on URL / search parameters.
 *
 * @param {Object} params
 * @param {string} [params.q] - Search query
 * @param {'all' | 'lost' | 'found'} [params.type='all'] - Listing type filter
 * @param {string} [params.category] - Category filter
 * @param {string} [params.location] - Location query/filter
 * @param {string} [params.from] - Start date (YYYY-MM-DD or ISO)
 * @param {string} [params.to] - End date (YYYY-MM-DD or ISO)
 * @param {'newest' | 'oldest' | 'relevance'} [params.sort='newest'] - Sorting order
 * @param {number} [params.page=1] - 1-based page index
 * @param {number} [params.limit=9] - Items per page
 * @returns {Promise<{ reports: Array, totalReports: number, totalPages: number, currentPage: number, typeCounts: { all: number, lost: number, found: number } }>}
 */
export async function getReports(params = {}) {
  // Try querying backend if configured
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });
      const response = await fetch(`${apiBase}/reports?${searchParams.toString()}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      // Fallback seamlessly to local demo data
      console.warn("Backend API unreachable, falling back to local demo dataset:", e.message);
    }
  }

  // Local filtering & pagination implementation
  const {
    q = "",
    type = "all",
    category = "",
    location = "",
    from = "",
    to = "",
    sort = "newest",
    filter = "",
    page = 1,
    limit = 9,
  } = params;

  let allItems = getAllUnifiedReports();

  // Filter by user reports if requested
  if (filter === "my-reports") {
    const custom = getStoredCustomReports();
    const customIds = new Set(custom.map((c) => String(c.id || c._id)));
    allItems = allItems.filter((item) => {
      const id = String(item.id || item._id);
      return (
        customIds.has(id) ||
        item.isUserCreated ||
        item.owner?._id === "user_current" ||
        item.owner?.isCurrentUser ||
        id === "1" ||
        id === "5"
      );
    });
  }

  // Pre-calculate counts before type filter
  const typeCounts = {
    all: allItems.length,
    lost: allItems.filter((item) => item.type === "lost").length,
    found: allItems.filter((item) => item.type === "found").length,
  };

  // 1. Filter by Type ('all' | 'lost' | 'found')
  if (type && type.toLowerCase() !== "all") {
    allItems = allItems.filter(
      (item) => item.type?.toLowerCase() === type.toLowerCase()
    );
  }

  // 2. Filter by Category
  if (category && category !== "All Categories") {
    allItems = allItems.filter(
      (item) => item.category?.toLowerCase() === category.toLowerCase()
    );
  }

  // 3. Filter by Location
  if (location && location !== "All Locations") {
    const locLower = location.toLowerCase().trim();
    allItems = allItems.filter((item) =>
      item.location?.toLowerCase().includes(locLower)
    );
  }

  // 4. Filter by Date range
  if (from) {
    const fromTime = new Date(from).getTime();
    if (!isNaN(fromTime)) {
      allItems = allItems.filter((item) => {
        const itemTime = item.dateRaw ? new Date(item.dateRaw).getTime() : 0;
        return itemTime >= fromTime;
      });
    }
  }
  if (to) {
    const toTime = new Date(to).setHours(23, 59, 59, 999);
    if (!isNaN(toTime)) {
      allItems = allItems.filter((item) => {
        const itemTime = item.dateRaw ? new Date(item.dateRaw).getTime() : 0;
        return itemTime <= toTime;
      });
    }
  }

  // 5. Search query (q) - matches title, description, category, location
  if (q && q.trim()) {
    const qLower = q.toLowerCase().trim();
    allItems = allItems.filter((item) => {
      const matchTitle = item.title?.toLowerCase().includes(qLower);
      const matchDesc = item.description?.toLowerCase().includes(qLower);
      const matchCat = item.category?.toLowerCase().includes(qLower);
      const matchLoc = item.location?.toLowerCase().includes(qLower);
      return matchTitle || matchDesc || matchCat || matchLoc;
    });
  }

  // 6. Sorting
  allItems.sort((a, b) => {
    const timeA = a.dateRaw ? new Date(a.dateRaw).getTime() : 0;
    const timeB = b.dateRaw ? new Date(b.dateRaw).getTime() : 0;

    if (sort === "oldest") {
      return timeA - timeB;
    }

    if (sort === "relevance" && q.trim()) {
      const qLower = q.toLowerCase().trim();
      const scoreA =
        (a.title?.toLowerCase().includes(qLower) ? 3 : 0) +
        (a.description?.toLowerCase().includes(qLower) ? 2 : 0) +
        (a.category?.toLowerCase().includes(qLower) ? 1 : 0);
      const scoreB =
        (b.title?.toLowerCase().includes(qLower) ? 3 : 0) +
        (b.description?.toLowerCase().includes(qLower) ? 2 : 0) +
        (b.category?.toLowerCase().includes(qLower) ? 1 : 0);
      return scoreB - scoreA;
    }

    // Default: 'newest'
    return timeB - timeA;
  });

  const totalReports = allItems.length;
  const numLimit = Number(limit) || 9;
  const totalPages = Math.max(1, Math.ceil(totalReports / numLimit));
  const currentPage = Math.max(1, Math.min(Number(page) || 1, totalPages));

  // Slice paginated reports
  const startIndex = (currentPage - 1) * numLimit;
  const paginatedReports = allItems.slice(startIndex, startIndex + numLimit);

  return {
    reports: paginatedReports,
    totalReports,
    totalPages,
    currentPage,
    typeCounts,
  };
}

// In-memory & LocalStorage storage keys for client runtime persistence
const STORAGE_KEY_CUSTOM_REPORTS = "findora_custom_reports_v1";
const STORAGE_KEY_DELETED_IDS = "findora_deleted_reports_v1";
const STORAGE_KEY_STATUS_MAP = "findora_report_status_map_v1";

function getStoredCustomReports() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_REPORTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getStoredDeletedIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getStoredStatusMap() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATUS_MAP);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getAllUnifiedReports() {
  const baseDemo = getAllDemoReports();
  const custom = getStoredCustomReports();
  const deletedIds = new Set(getStoredDeletedIds());
  const statusMap = getStoredStatusMap();

  const combined = [...custom, ...baseDemo]
    .filter((r) => !deletedIds.has(r.id) && !deletedIds.has(r._id))
    .map((r) => {
      const id = r.id || r._id;
      if (statusMap[id]) {
        const mappedStatus = statusMap[id];
        return {
          ...r,
          status: mappedStatus,
          type: mappedStatus === "resolved" ? (r.type || "lost") : mappedStatus,
        };
      }
      return r;
    });

  return combined;
}

/**
 * Fetch a single report by ID (checks custom reports and demo reports)
 */
export async function getReportById(id) {
  // If backend is configured, attempt fetch
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/reports/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback seamlessly
    }
  }

  const all = getAllUnifiedReports();
  return all.find((r) => String(r.id) === String(id) || String(r._id) === String(id)) || null;
}

/**
 * Create a new lost or found report
 */
export async function createReport(reportData, user) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/reports`, {
        method: "POST",
        body: reportData instanceof FormData ? reportData : JSON.stringify(reportData),
        headers: reportData instanceof FormData ? {} : { "Content-Type": "application/json" },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend API unavailable, saving locally:", e.message);
    }
  }

  // Parse input fields if FormData was submitted
  let parsed = {};
  if (typeof FormData !== "undefined" && reportData instanceof FormData) {
    for (const [key, value] of reportData.entries()) {
      if (key !== "images") {
        parsed[key] = value;
      }
    }
  } else {
    parsed = { ...reportData };
  }

  const newId = `rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date();

  // Create new report object
  const newReport = {
    id: newId,
    _id: newId,
    title: parsed.title,
    description: parsed.description,
    type: parsed.type || "lost",
    category: parsed.category,
    location: parsed.location,
    date: "Just now",
    dateRaw: parsed.date ? new Date(parsed.date).toISOString() : now.toISOString(),
    status: parsed.type === "found" ? "found" : "lost",
    itemCurrentLocation: parsed.itemCurrentLocation || "",
    imageUrl:
      parsed.imageUrl ||
      (parsed.type === "found"
        ? "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80"
        : "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"),
    images: parsed.images || [],
    owner: {
      _id: user?.id || user?._id || "user_current",
      name: user?.name || "Findora Member",
      email: user?.email || "member@findora.app",
      image: user?.image || "/default-avatar.png",
      phone: user?.phone || "+880 1700-000000",
    },
    createdAt: now.toISOString(),
  };

  if (typeof window !== "undefined") {
    const custom = getStoredCustomReports();
    localStorage.setItem(STORAGE_KEY_CUSTOM_REPORTS, JSON.stringify([newReport, ...custom]));
  }

  return newReport;
}

/**
 * Mark a report as resolved
 */
export async function resolveReport(id) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/reports/${id}/resolve`, { method: "PATCH" });
      if (res.ok) return await res.json();
    } catch {}
  }

  if (typeof window !== "undefined") {
    const statusMap = getStoredStatusMap();
    statusMap[id] = "resolved";
    localStorage.setItem(STORAGE_KEY_STATUS_MAP, JSON.stringify(statusMap));
  }

  return { success: true, id, status: "resolved" };
}

/**
 * Delete a report
 */
export async function deleteReport(id) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/reports/${id}`, { method: "DELETE" });
      if (res.ok) return await res.json();
    } catch {}
  }

  if (typeof window !== "undefined") {
    const deleted = getStoredDeletedIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(STORAGE_KEY_DELETED_IDS, JSON.stringify(deleted));
    }
  }

  return { success: true, id };
}

/**
 * Update report status (e.g. 'lost', 'found', 'resolved')
 */
export async function updateReportStatus(id, newStatus) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/reports/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) return await res.json();
    } catch {}
  }

  if (typeof window !== "undefined") {
    const statusMap = getStoredStatusMap();
    statusMap[id] = newStatus;
    localStorage.setItem(STORAGE_KEY_STATUS_MAP, JSON.stringify(statusMap));

    // Also update custom reports if found there
    const custom = getStoredCustomReports();
    let modified = false;
    const updatedCustom = custom.map((r) => {
      const rId = String(r.id || r._id);
      if (rId === String(id)) {
        modified = true;
        return {
          ...r,
          status: newStatus,
          type: newStatus === "resolved" ? (r.type || "lost") : newStatus,
        };
      }
      return r;
    });
    if (modified) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_REPORTS, JSON.stringify(updatedCustom));
    }
  }

  return { success: true, id, status: newStatus };
}
