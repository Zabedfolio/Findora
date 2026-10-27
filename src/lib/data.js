export const DAY = 86_400_000;
export const C = {
  rose: "#FB7185",
  roseDeep: "#F43F5E",
  emerald: "#9ae600",
  emeraldDeep: "#72a800",
  violet: "#84cc16",
  amber: "#FBBF24",
  slate: "#8B99B0",
  indigo: "#9ae600",
  lime: "#9ae600",
  limeDeep: "#72a800"
};
export const CATEGORIES = [
  { key: "electronics", label: "Electronics" },
  { key: "keys", label: "Keys & Access" },
  { key: "wallets", label: "Documents & Wallets" },
  { key: "bags", label: "Bags & Luggage" },
  { key: "documents", label: "Documents" },
  { key: "apparel", label: "Clothing & Accessories" },
  { key: "jewelry", label: "Jewelry & Watches" },
  { key: "pets", label: "Pets & Animals" },
  { key: "other", label: "Other" }
];
export const LOCATIONS = ["Central Station", "Riverside Mall", "Airport · Terminal 2", "Maple Park", "City University", "Metro Line 4", "Harbor Promenade", "Grand Arena"];
export const STATUS_META = {
  returned: { label: "Returned to owner", color: "#9ae600", order: 0 },
  matched: { label: "Match in review", color: "#38bdf8", order: 1 },
  pending: { label: "Awaiting match", color: "#FBBF24", order: 2 },
  unclaimed: { label: "Unclaimed", color: "#94a3b8", order: 3 },
};
export const RANGES = {
  "7d": { label: "7D", days: 7, bucket: "day" },
  "30d": { label: "30D", days: 30, bucket: "day" },
  "90d": { label: "90D", days: 90, bucket: "week" },
  "12m": { label: "12M", days: 365, bucket: "month" },
};
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const NAMES = { electronics: ["iPhone 15 Pro", "AirPods Pro", "MacBook Air 13″", "Samsung Galaxy S24", "iPad Mini", "Sony WH-1000XM5", "Kindle Paperwhite", "USB-C Power Bank", "GoPro Hero 12", "Nintendo Switch"], keys: ["Car Key Fob", "House Key Set", "Keychain — Brass", "Office Access Card", "Bike Lock Key", "Smart Key Ring"], wallets: ["Leather Bifold Wallet", "Cardholder — Black", "Coin Purse", "Zip Wallet — Tan", "Metal Card Case", "Slim Wallet"], bags: ["Hiking Backpack", "Canvas Tote", "Leather Messenger Bag", "Rolling Suitcase", "Gym Duffel", "Laptop Sleeve", "Crossbody Bag"], documents: ["Passport", "Driver's License", "Student ID", "Birth Certificate", "Insurance Card", "Library Card", "Work Badge"], apparel: ["Wool Scarf", "Denim Jacket", "Ray-Ban Sunglasses", "Leather Gloves", "Baseball Cap", "Rain Coat", "Knit Beanie"], jewelry: ["Gold Chain Necklace", "Silver Ring", "Apple Watch Ultra", "Pearl Earrings", "Vintage Omega Watch", "Bracelet — Silver"], other: ["Umbrella", "Hydro Flask Bottle", "Stuffed Bunny Toy", "Prescription Glasses", "Camera Tripod", "Sheet Music Folder"] };
const FIRST = ["Amelia", "Marcus", "Priya", "Jonah", "Sofia", "Noah", "Elena", "Tomas", "Yuki", "Andre", "Clara", "Dev", "Maya", "Oliver", "Ines", "Felix", "Nora", "Sam", "Leah", "Oscar", "Ada", "Kai", "Ruth", "Hugo", "Zoe", "Milan", "Iris", "Theo", "Wren", "Paul"];
const LAST = ["Novak", "Reyes", "Okafor", "Lindqvist", "Tanaka", "Moreau", "Petrov", "Nguyen", "Costa", "Weber", "Ali", "Fontaine", "Kim", "Berg", "Silva", "Marsh", "Duarte", "Hale", "Vidal", "Krause", "Amari", "Lowe", "Falke", "Ivers", "Nolan"];
function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
export const NOW = Date.now();
export const ALL_ITEMS = [];

export function bucketize(items = [], range = "30d") {
  const rangeConfig = RANGES[range] || RANGES["30d"];
  const { days, bucket } = rangeConfig;
  const currentNow = Date.now();
  const from = currentNow - days * DAY;
  const buckets = [];
  if (bucket === "day") {
    for (let i = days - 1; i >= 0; i--) {
      const startOf = new Date(currentNow - i * DAY);
      const d = new Date(startOf.getFullYear(), startOf.getMonth(), startOf.getDate());
      buckets.push({ label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), lost: 0, found: 0, total: 0, returned: 0, resolved: 0, avgHours: 0, start: d.getTime() });
    }
  } else if (bucket === "week") {
    const weeks = Math.ceil(days / 7);
    for (let i = weeks - 1; i >= 0; i--) {
      const start = currentNow - (i + 1) * 7 * DAY;
      const d = new Date(start);
      buckets.push({ label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), lost: 0, found: 0, total: 0, returned: 0, resolved: 0, avgHours: 0, start });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentNow - i * 30.44 * DAY);
      const m = new Date(d.getFullYear(), d.getMonth(), 1);
      buckets.push({ label: m.toLocaleDateString("en-US", { month: "short" }), lost: 0, found: 0, total: 0, returned: 0, resolved: 0, avgHours: 0, start: m.getTime() });
    }
  }
  const edges = buckets.map((b) => b.start);
  for (const it of items || []) {
    const ts = Number(it?.timestamp) || (it?.dateRaw ? new Date(it.dateRaw).getTime() : 0);
    if (!ts || ts < from) continue;
    let bi = edges.length - 1;
    for (let i = 0; i < edges.length - 1; i++) {
      if (ts < edges[i + 1]) {
        bi = i;
        break;
      }
    }
    if (ts >= edges[edges.length - 1]) bi = edges.length - 1;
    const b = buckets[bi];
    if (b) {
      b.total++;
      if (it.type === "lost") b.lost++;
      else b.found++;
      if (it.status === "returned" || it.status === "resolved") b.returned++;
      if (it.status === "returned" || it.status === "matched" || it.status === "resolved") {
        b.resolved++;
        b.avgHours += Number(it.hoursToResolve) || 24;
      }
    }
  }
  for (const b of buckets) {
    if (b.resolved > 0) b.avgHours = b.avgHours / b.resolved;
  }
  return buckets;
}

export function computeKpis(items = []) {
  let returned = 0, resolved = 0, hours = 0;
  for (const it of items || []) {
    const isReturned = it?.status === "returned" || it?.status === "resolved";
    const isMatched = it?.status === "matched";
    if (isReturned) returned++;
    if (isReturned || isMatched) {
      resolved++;
      hours += Number(it?.hoursToResolve) || 24;
    }
  }
  const total = (items || []).length;
  return {
    totalReports: total,
    matchRate: total ? (resolved / total) * 100 : 0,
    returned,
    totalResolved: returned || resolved,
    resolved,
    avgRecovery: resolved ? hours / resolved : 0,
  };
}

export function aggregateByCategory(items = []) {
  const map = new Map();
  for (const c of CATEGORIES) {
    map.set(c.key, { key: c.key, label: c.label, lost: 0, found: 0, total: 0 });
  }

  const resolveCategoryKey = (catStr) => {
    if (!catStr) return "other";
    const clean = String(catStr).toLowerCase().trim();
    if (clean.includes("electr") || clean.includes("phone") || clean.includes("laptop") || clean.includes("gadget")) return "electronics";
    if (clean.includes("key")) return "keys";
    if (clean.includes("wallet") || clean.includes("card")) return "wallets";
    if (clean.includes("bag") || clean.includes("backpack") || clean.includes("luggage")) return "bags";
    if (clean.includes("doc") || clean.includes("passport") || clean.includes("license") || clean.includes("id")) return "documents";
    if (clean.includes("cloth") || clean.includes("wear") || clean.includes("apparel") || clean.includes("jacket") || clean.includes("shoe")) return "apparel";
    if (clean.includes("jewel") || clean.includes("watch") || clean.includes("ring")) return "jewelry";
    if (clean.includes("pet") || clean.includes("animal") || clean.includes("dog") || clean.includes("cat")) return "pets";
    if (map.has(clean)) return clean;
    return "other";
  };

  for (const it of items || []) {
    const key = resolveCategoryKey(it?.category);
    let row = map.get(key);
    if (!row) {
      row = { key, label: it?.category || "Other", lost: 0, found: 0, total: 0 };
      map.set(key, row);
    }
    const type = it?.type === "found" ? "found" : "lost";
    row[type] = (row[type] || 0) + 1;
    row.total = (row.total || 0) + 1;
  }

  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function aggregateByStatus(items = []) {
  const counts = { returned: 0, matched: 0, pending: 0, unclaimed: 0 };
  for (const it of items || []) {
    let s = it?.status || "pending";
    if (s === "resolved") s = "returned";
    else if (s === "found" || s === "in_review") s = "matched";
    else if (s === "active" || s === "open") s = "pending";
    else if (counts[s] === undefined) s = "pending";
    counts[s] = (counts[s] || 0) + 1;
  }
  return Object.keys(counts)
    .map((s) => ({
      status: s,
      label: STATUS_META[s]?.label || s,
      color: STATUS_META[s]?.color || "#94a3b8",
      value: counts[s] || 0,
    }))
    .sort((a, b) => (STATUS_META[a.status]?.order ?? 99) - (STATUS_META[b.status]?.order ?? 99));
}

export function topLocations(items = [], n = 5) {
  const map = new Map();
  for (const it of items || []) {
    const loc = it?.location || "Other";
    const row = map.get(loc) ?? { lost: 0, found: 0, total: 0 };
    const type = it?.type === "found" ? "found" : "lost";
    row[type] = (row[type] || 0) + 1;
    row.total = (row.total || 0) + 1;
    map.set(loc, row);
  }
  return [...map.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total).slice(0, n);
}
