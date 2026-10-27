export const fmtInt = (n) => {
  const num = typeof n === "number" && !isNaN(n) ? n : 0;
  return Math.round(num).toLocaleString("en-US");
};
export const fmtPct = (n, dp = 1) => {
  const num = typeof n === "number" && !isNaN(n) ? n : 0;
  return `${num.toFixed(dp)}%`;
};
export const fmtMoney = (n) => {
  const num = typeof n === "number" && !isNaN(n) ? n : 0;
  return `$${Math.round(num).toLocaleString("en-US")}`;
};
export const fmtHours = (h) => {
  const num = typeof h === "number" && !isNaN(h) ? h : 0;
  if (num <= 0) return "—";
  if (num < 48) return `${Math.round(num)}h`;
  return `${(num / 24).toFixed(1)}d`;
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
