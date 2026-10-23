import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Search, SearchX, Smartphone, KeyRound, Wallet, Backpack, FileText, Shirt, Gem, Package } from "lucide-react";
import { C, STATUS_META } from "@/lib/data";
import { cn } from "@/utils/cn";
import { fmtDate, fmtInt, fmtMoney } from "@/lib/format";

const CAT_ICONS = { electronics: Smartphone, keys: KeyRound, wallets: Wallet, bags: Backpack, documents: FileText, apparel: Shirt, jewelry: Gem, other: Package };
const PAGE_SIZE = 8;
const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "returned", label: "Returned" },
  { key: "matched", label: "In review" },
  { key: "pending", label: "Awaiting" },
  { key: "unclaimed", label: "Unclaimed" },
];

export default function DataTable({ items }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) => it.name.toLowerCase().includes(q) || it.id.toLowerCase().includes(q) || it.location.toLowerCase().includes(q) || it.reporter.toLowerCase().includes(q)
    );
  }, [items, query]);

  const statusCounts = useMemo(() => {
    const counts = { all: searched.length };
    for (const s of Object.keys(STATUS_META)) counts[s] = 0;
    for (const it of searched) counts[it.status]++;
    return counts;
  }, [searched]);

  const filtered = useMemo(() => {
    let rows = status === "all" ? searched : searched.filter((it) => it.status === status);
    const dir = sortDir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      switch (sortKey) {
        case "item": return a.name.localeCompare(b.name) * dir;
        case "type": return a.type.localeCompare(b.type) * dir;
        case "date": return (a.timestamp - b.timestamp) * dir;
        case "value": return (a.value - b.value) * dir;
        case "status": return (STATUS_META[a.status].order - STATUS_META[b.status].order) * dir;
        default: return 0;
      }
    });
    return rows;
  }, [searched, status, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => { setPage(0); }, [query, status, items]);

  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const exportCsv = () => {
    const header = "ID,Item,Type,Category,Location,Date,Status,Value,Reporter\n";
    const body = filtered.map((it) => [it.id, `"${it.name}"`, it.type, it.category, `"${it.location}"`, new Date(it.timestamp).toISOString().slice(0, 10), it.status, it.value, `"${it.reporter}"`].join(",")).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "findora-reports.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const Th = ({ label, k, className }) => (
    <th className={cn("px-4 py-3 text-left", className)}>
      {k ? (
        <button
          onClick={() => toggleSort(k)}
          className={cn("group inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] transition-colors", sortKey === k ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300")}
        >
          {label}
          {sortKey === k ? (sortDir === "desc" ? <ArrowDown size={11} strokeWidth={2.6} /> : <ArrowUp size={11} strokeWidth={2.6} />) : <ArrowUpDown size={11} className="opacity-0 transition-opacity group-hover:opacity-60" />}
        </button>
      ) : <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">{label}</span>}
    </th>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 px-5 pt-5 sm:px-6">
        <div>
          <h3 className="font-display text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">Report log</h3>
          <p className="mt-0.5 text-[12.5px] text-slate-500 dark:text-slate-400"><span className="tnum font-semibold text-slate-700 dark:text-slate-200">{fmtInt(filtered.length)}</span> records in view</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items, IDs, people…"
              className={cn("h-9 w-44 rounded-full bg-slate-100/80 pl-9 pr-3 text-[12.5px] text-slate-700 ring-1 ring-transparent transition-all placeholder:text-slate-400 focus:w-56 focus:bg-white focus:ring-[#9ae600]/60 sm:w-52 dark:bg-white/[0.06] dark:text-slate-200 dark:focus:bg-ink-800")}
            />
          </div>
          <button onClick={exportCsv} className="flex h-9 items-center gap-1.5 rounded-full bg-slate-900 px-3.5 text-[12px] font-semibold text-white transition-all hover:scale-[1.03] hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
            <Download size={13} strokeWidth={2.4} /><span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-5 pb-1 pt-3.5 sm:px-6">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.key;
          const meta = f.key !== "all" ? STATUS_META[f.key] : null;
          return (
            <button
              key={f.key} onClick={() => setStatus(f.key)}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-all duration-200 ring-1", active ? "bg-slate-900 text-white ring-slate-900 dark:bg-white dark:text-slate-900 dark:ring-white" : "bg-white text-slate-500 ring-slate-200 hover:text-slate-800 hover:ring-slate-300 dark:bg-white/[0.04] dark:text-slate-400 dark:ring-white/10 dark:hover:text-slate-200")}
            >
              {meta && <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />}
              {f.label}
              <span className={cn("tnum rounded-full px-1.5 text-[10px]", active ? "bg-white/20 dark:bg-slate-900/10" : "bg-slate-100 dark:bg-white/10")}>{fmtInt(statusCounts[f.key] ?? 0)}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex-1 overflow-x-auto px-3 pb-2">
        <table className="w-full min-w-[860px] border-separate border-spacing-0">
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-slate-100 dark:[&>th]:border-white/[0.06]">
              <Th label="Item" k="item" className="pl-3" />
              <Th label="ID" />
              <Th label="Type" k="type" />
              <Th label="Location" />
              <Th label="Reported" k="date" />
              <Th label="Value" k="value" />
              <Th label="Status" k="status" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {pageItems.map((it, i) => {
                const Icon = CAT_ICONS[it.category] ?? Package;
                const meta = STATUS_META[it.status];
                return (
                  <motion.tr
                    key={it.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, delay: i * 0.02 }}
                    className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03]"
                  >
                    <td className="border-b border-slate-50 px-4 py-3 pl-3 dark:border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-slate-200/70 dark:bg-white/[0.06] dark:text-slate-300 dark:group-hover:bg-white/10">
                          <Icon size={15} strokeWidth={2} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">{it.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">{it.reporter}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-slate-50 px-4 py-3 dark:border-white/[0.04]"><span className="font-mono text-[11.5px] font-medium text-slate-400 dark:text-slate-500">{it.id}</span></td>
                    <td className="border-b border-slate-50 px-4 py-3 dark:border-white/[0.04]">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", it.type === "lost" ? "bg-rose-500/[0.08] text-rose-600 ring-rose-500/20 dark:text-rose-400" : "bg-emerald-500/[0.08] text-emerald-600 ring-emerald-500/20 dark:text-emerald-400")}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: it.type === "lost" ? C.roseDeep : C.emeraldDeep }} />
                        {it.type === "lost" ? "Lost" : "Found"}
                      </span>
                    </td>
                    <td className="border-b border-slate-50 px-4 py-3 dark:border-white/[0.04]"><span className="text-[12.5px] text-slate-500 dark:text-slate-400">{it.location}</span></td>
                    <td className="border-b border-slate-50 px-4 py-3 dark:border-white/[0.04]"><span className="tnum whitespace-nowrap text-[12.5px] text-slate-500 dark:text-slate-400">{fmtDate(it.timestamp)}</span></td>
                    <td className="border-b border-slate-50 px-4 py-3 dark:border-white/[0.04]"><span className="tnum text-[12.5px] font-semibold text-slate-700 dark:text-slate-200">{fmtMoney(it.value)}</span></td>
                    <td className="border-b border-slate-50 px-4 py-3 dark:border-white/[0.04]">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                        {meta.label}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {pageItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.06]"><SearchX size={20} /></span>
            <p className="mt-3 text-[13.5px] font-semibold text-slate-700 dark:text-slate-200">No reports match your filters</p>
            <p className="mt-1 text-[12px] text-slate-400">Try a different search term or clear the status filter.</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 sm:px-6 dark:border-white/[0.06]">
        <p className="tnum text-[11.5px] text-slate-400 dark:text-slate-500">
          {filtered.length === 0 ? "0" : page * PAGE_SIZE + 1}–{Math.min(filtered.length, (page + 1) * PAGE_SIZE)} of {fmtInt(filtered.length)}
        </p>
        <div className="flex items-center gap-1">
          <PageBtn onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft size={14} /></PageBtn>
          {Array.from({ length: pageCount }, (_, i) => i).filter((i) => i === 0 || i === pageCount - 1 || Math.abs(i - page) <= 1).reduce((acc, i, idx, arr) => { if (idx > 0 && i - arr[idx - 1] > 1) acc.push("…"); acc.push(i); return acc; }, []).map((p, idx) => p === "…" ? <span key={`e${idx}`} className="px-1 text-[11px] text-slate-400">…</span> : (
            <button key={p} onClick={() => setPage(p)} className={cn("tnum grid h-8 w-8 place-items-center rounded-full text-[12px] font-semibold transition-all", p === page ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.07]")}>
              {p + 1}
            </button>
          ))}
          <PageBtn onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}><ChevronRight size={14} /></PageBtn>
        </div>
      </div>
    </div>
  );
}

function PageBtn({ children, onClick, disabled }) {
  return <button onClick={onClick} disabled={disabled} className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition-all hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-white/[0.07]">{children}</button>;
}
