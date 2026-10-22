export const fmtInt = (n) => Math.round(n).toLocaleString("en-US");
export const fmtPct = (n, dp = 1) => `${n.toFixed(dp)}%`;
export const fmtMoney = (n) => `$${Math.round(n).toLocaleString("en-US")}`;
export const fmtHours = (h) => {
  if (h <= 0) return "—";
  if (h < 48) return `${Math.round(h)}h`;
  return `${(h / 24).toFixed(1)}d`;
};
export const fmtDate = (ts) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const fmtDateShort = (ts) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
export const fmtTimeAgo = (ts) => {
  const diff = Date.now() - ts; const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(ts);
};
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
