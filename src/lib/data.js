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
  { key: "electronics", label: "Electronics" }, { key: "keys", label: "Keys & Access" },
  { key: "wallets", label: "Wallets & Cards" }, { key: "bags", label: "Bags & Luggage" },
  { key: "documents", label: "Documents" }, { key: "apparel", label: "Apparel" },
  { key: "jewelry", label: "Jewelry & Watches" }, { key: "other", label: "Other" }
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
function generateItems() {
  const r = mulberry32(20240817);
  const items = []; let seq = 1000;
  const catKeys = CATEGORIES.map((c) => c.key);
  const catWeights = [0.22, 0.16, 0.14, 0.12, 0.1, 0.09, 0.065, 0.105];
  const valueRange = { electronics: [80, 1200], keys: [5, 80], wallets: [20, 320], bags: [15, 260], documents: [0, 90], apparel: [10, 220], jewelry: [60, 1800], other: [5, 110] };
  const locWeights = [0.22, 0.18, 0.14, 0.12, 0.11, 0.1, 0.07, 0.06];
  const weighted = (weights) => { let x = r(); for (let i = 0; i < weights.length; i++) { if ((x -= weights[i]) <= 0) return i; } return weights.length - 1; };
  for (let day = 364; day >= 0; day--) {
    const t = 1 - day / 365; const dow = new Date(NOW - day * DAY).getDay();
    const weekend = dow === 0 || dow === 6 ? 1.32 : 1; const monday = dow === 1 ? 1.1 : 1;
    const base = 6.2 + t * 4.4; const count = Math.max(2, Math.round(base * weekend * monday + (r() - 0.5) * 4));
    for (let k = 0; k < count; k++) {
      const type = r() < 0.54 ? "lost" : "found"; const category = catKeys[weighted(catWeights)];
      const location = LOCATIONS[weighted(locWeights)]; const hour = 7 + Math.floor(r() * 14);
      const timestamp = NOW - day * DAY - (23 - hour) * 3_600_000 + Math.floor(r() * 3_000_000);
      const ageDays = (NOW - timestamp) / DAY; const pReturned = Math.min(0.66, 0.12 + ageDays / 340);
      const pMatched = 0.16 + Math.min(0.1, ageDays / 2400); const roll = r();
      let status; if (roll < pReturned) status = "returned"; else if (roll < pReturned + pMatched) status = "matched"; else status = type === "lost" ? "pending" : "unclaimed";
      const [lo, hi] = valueRange[category]; const value = Math.round((lo + r() * (hi - lo)) / 1);
      const hoursToResolve = status === "returned" || status === "matched" ? Math.round(4 + Math.pow(r(), 1.8) * 150) : 0;
      items.push({ id: `FD-${seq++}`, name: pick(r, NAMES[category]), type, category, location, timestamp, status, value, hoursToResolve, reporter: `${pick(r, FIRST)} ${pick(r, LAST)}` });
    }
  }
  return items.sort((a, b) => b.timestamp - a.timestamp);
}
export const ALL_ITEMS = generateItems();
export function bucketize(items, range) {
  const { days, bucket } = RANGES[range];
  const from = NOW - days * DAY; const buckets = [];
  if (bucket === "day") {
    for (let i = days - 1; i >= 0; i--) {
      const startOf = new Date(NOW - i * DAY); const d = new Date(startOf.getFullYear(), startOf.getMonth(), startOf.getDate());
      buckets.push({ label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), lost: 0, found: 0, total: 0, returned: 0, resolved: 0, avgHours: 0, start: d.getTime() });
    }
  } else if (bucket === "week") {
    const weeks = Math.ceil(days / 7);
    for (let i = weeks - 1; i >= 0; i--) {
      const start = NOW - (i + 1) * 7 * DAY; const d = new Date(start);
      buckets.push({ label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), lost: 0, found: 0, total: 0, returned: 0, resolved: 0, avgHours: 0, start });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(NOW - i * 30.44 * DAY); const m = new Date(d.getFullYear(), d.getMonth(), 1);
      buckets.push({ label: m.toLocaleDateString("en-US", { month: "short" }), lost: 0, found: 0, total: 0, returned: 0, resolved: 0, avgHours: 0, start: m.getTime() });
    }
  }
  const edges = buckets.map((b) => b.start);
  for (const it of items) {
    if (it.timestamp < from || it.timestamp > NOW + 1) continue;
    let bi = edges.length - 1;
    for (let i = 0; i < edges.length - 1; i++) { if (it.timestamp < edges[i + 1]) { bi = i; break; } }
    if (it.timestamp >= edges[edges.length - 1]) bi = edges.length - 1;
    const b = buckets[bi]; b.total++; if (it.type === "lost") b.lost++; else b.found++;
    if (it.status === "returned" || it.status === "resolved") b.returned++;
    if (it.status === "returned" || it.status === "matched" || it.status === "resolved") {
      b.resolved++;
      b.avgHours += Number(it.hoursToResolve) || 24;
    }
  }
  for (const b of buckets) { if (b.resolved > 0) b.avgHours = b.avgHours / b.resolved; }
  return buckets;
}
export function computeKpis(items = []) {
  let returned = 0, resolved = 0, hours = 0;
  for (const it of items) {
    const isReturned = it.status === "returned" || it.status === "resolved";
    const isMatched = it.status === "matched";
    if (isReturned) returned++;
    if (isReturned || isMatched) {
      resolved++;
      hours += Number(it.hoursToResolve) || 24;
    }
  }
  const total = items.length;
  return {
    totalReports: total,
    matchRate: total ? (resolved / total) * 100 : 0,
    returned,
    totalResolved: returned || resolved,
    resolved,
    avgRecovery: resolved ? hours / resolved : 0,
  };
}
export function aggregateByCategory(items) {
  const map = new Map();
  for (const c of CATEGORIES) map.set(c.key, { key: c.key, label: c.label, lost: 0, found: 0, total: 0 });
  for (const it of items) { const row = map.get(it.category); row[it.type]++; row.total++; }
  return [...map.values()].sort((a, b) => b.total - a.total);
}
export function aggregateByStatus(items) {
  const counts = { returned: 0, matched: 0, pending: 0, unclaimed: 0 };
  for (const it of items) counts[it.status]++;
  return Object.keys(counts).map((s) => ({ status: s, label: STATUS_META[s].label, color: STATUS_META[s].color, value: counts[s] })).sort((a, b) => STATUS_META[a.status].order - STATUS_META[b.status].order);
}
export function topLocations(items, n = 5) {
  const map = new Map();
  for (const it of items) {
    const row = map.get(it.location) ?? { lost: 0, found: 0, total: 0 };
    row[it.type]++; row.total++; map.set(it.location, row);
  }
  return [...map.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total).slice(0, n);
}
