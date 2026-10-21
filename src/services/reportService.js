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
    page = 1,
    limit = 9,
  } = params;

  let allItems = getAllDemoReports();

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

/**
 * Fetch a single report by ID
 */
export async function getReportById(id) {
  const all = getAllDemoReports();
  return all.find((r) => r.id === id) || null;
}
