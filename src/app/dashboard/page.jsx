'use client'
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ClipboardList, PackageCheck, PackageSearch, Search, ShieldAlert, Timer, UsersRound } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { ALL_ITEMS, DAY, NOW, RANGES, bucketize, computeKpis, aggregateByCategory, aggregateByStatus, topLocations } from "@/lib/data";
import { fmtInt, fmtHours } from "@/lib/format";
import FilterBar from "@/components/dashboard/FilterBar";
import KpiCard from "@/components/dashboard/KpiCard";
import { Card, CardHeader } from "@/components/dashboard/ui";
import AreaChart from "@/components/dashboard/AreaChart";
import DonutChart from "@/components/dashboard/DonutChart";
import DataTable from "@/components/dashboard/DataTable";
import LocationList from "@/components/dashboard/LocationList";
import CategoryBars from "@/components/dashboard/BarChart";


const delta = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : 0);

const ADMIN_TOOLS = [
  {
    icon: ClipboardList,
    title: "Reports & listings",
    description: "Browse and review published lost and found reports.",
    href: "/reports",
    action: "Open reports",
  },
  {
    icon: ShieldAlert,
    title: "Claims & safety review",
    description: "Review ownership claims and suspicious activity.",
    status: "Planned",
  },
  {
    icon: UsersRound,
    title: "User management",
    description: "Manage community accounts and administrator access.",
    status: "Planned",
  },
];

export default function Page() {
  const [light, setLight] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [range, setRange] = useState("12m");
  const [segment, setSegment] = useState("all");
  const [location, setLocation] = useState("all");

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  const days = RANGES[range].days;
  const windowStart = NOW - days * DAY;

  const items = useMemo(
    () => ALL_ITEMS.filter(
      (it) => it.timestamp >= windowStart && it.timestamp <= NOW &&
        (segment === "all" || it.type === segment) &&
        (location === "all" || it.location === location)
    ),
    [windowStart, segment, location]
  );
  const prevItems = useMemo(
    () => ALL_ITEMS.filter(
      (it) => it.timestamp >= windowStart - days * DAY && it.timestamp < windowStart &&
        (segment === "all" || it.type === segment) &&
        (location === "all" || it.location === location)
    ),
    [windowStart, days, segment, location]
  );

  const buckets = useMemo(() => bucketize(items, range), [items, range]);
  const kpis = useMemo(() => computeKpis(items), [items]);
  const prevKpis = useMemo(() => computeKpis(prevItems), [prevItems]);
  const lostReports = useMemo(() => items.filter((it) => it.type === "lost").length, [items]);
  const foundReports = useMemo(() => items.filter((it) => it.type === "found").length, [items]);
  const prevLostReports = useMemo(() => prevItems.filter((it) => it.type === "lost").length, [prevItems]);
  const prevFoundReports = useMemo(() => prevItems.filter((it) => it.type === "found").length, [prevItems]);
  const catAgg = useMemo(() => aggregateByCategory(items), [items]);
  const statusAgg = useMemo(() => aggregateByStatus(items), [items]);
  const locs = useMemo(() => topLocations(items), [items]);

  const isDefault = range === "12m" && segment === "all" && location === "all";
  const reset = () => { setRange("12m"); setSegment("all"); setLocation("all"); };

  const sparks = {
    lost: buckets.map((b) => b.lost),
    found: buckets.map((b) => b.found),
    returned: buckets.map((b) => b.returned),
    recovery: buckets.map((b) => b.avgHours),
  };

  return (
    <div className="grain min-h-screen">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-indigo-400/[0.16] blur-[130px] dark:bg-indigo-500/[0.14]" />
        <div className="absolute right-[-120px] top-1/3 h-[420px] w-[420px] rounded-full bg-rose-400/[0.13] blur-[130px] dark:bg-rose-500/[0.11]" />
        <div className="absolute bottom-[-160px] left-[-100px] h-[420px] w-[420px] rounded-full bg-emerald-400/[0.12] blur-[130px] dark:bg-emerald-500/[0.09]" />
      </div>

      <Sidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative lg:pl-[248px]">
        <div className="mx-auto max-w-[1480px] px-4 pb-14 sm:px-6 lg:px-8">
          <Topbar light={light} onToggleTheme={() => setLight((current) => !current)} onOpenMenu={() => setMenuOpen(true)} />

          <FilterBar range={range} onRange={setRange} segment={segment} onSegment={setSegment} location={location} onLocation={setLocation} windowStart={windowStart} onReset={reset} isDefault={isDefault} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            <KpiCard label="Lost items" value={lostReports} format={fmtInt} delta={delta(lostReports, prevLostReports)} icon={PackageSearch} iconClass="bg-rose-500/10 text-rose-500 dark:bg-rose-400/10 dark:text-rose-300" spark={sparks.lost} sparkColor="#FB7185" delay={0.02} />
            <KpiCard label="Found items" value={foundReports} format={fmtInt} delta={delta(foundReports, prevFoundReports)} icon={Search} iconClass="bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-300" spark={sparks.found} sparkColor="#818CF8" delay={0.08} />
            <KpiCard label="Successful returns" value={kpis.returned} format={fmtInt} delta={delta(kpis.returned, prevKpis.returned)} icon={PackageCheck} iconClass="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300" spark={sparks.returned} sparkColor="#34D399" delay={0.14} />
            <KpiCard label="Avg. recovery time" value={kpis.avgRecovery} format={fmtHours} delta={delta(kpis.avgRecovery, prevKpis.avgRecovery)} invert icon={Timer} iconClass="bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300" spark={sparks.recovery} sparkColor="#FBBF24" delay={0.2} />
          </div>

          <section className="mt-5" aria-labelledby="admin-tools-heading">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 id="admin-tools-heading" className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">Admin workspace</h2>
                <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">Manage reports and review platform activity.</p>
              </div>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300">
                Demo data
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {ADMIN_TOOLS.map(({ icon: Icon, title, description, href, action, status }) => (
                <Card key={title} className="flex items-start gap-3 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-300">
                    <Icon size={17} strokeWidth={2.1} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">{title}</h3>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
                    {href ? (
                      <Link href={href} className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200">
                        {action}<ArrowUpRight size={13} />
                      </Link>
                    ) : (
                      <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                        {status}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="xl:col-span-8"><AreaChart labels={buckets.map((b) => b.label)} lost={buckets.map((b) => b.lost)} found={buckets.map((b) => b.found)} segment={segment} delay={0.25} /></div>
            <div className="xl:col-span-4"><DonutChart data={statusAgg} delay={0.32} /></div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
            <Card delay={0.38} className="xl:col-span-7 overflow-hidden"><DataTable items={items} /></Card>
            <Card delay={0.44} className="xl:col-span-5 overflow-hidden">
              <CardHeader title="Categories" subtitle="Where reports concentrate" right={<div className="flex items-center gap-3 text-[11px] font-medium text-slate-400 dark:text-slate-500"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" />Lost</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Found</span></div>} />
              <CategoryBars data={catAgg} segment={segment} />
              <div className="mx-5 mt-4 border-t border-dashed border-slate-200 sm:mx-6 dark:border-white/10" />
              <div className="px-5 pb-1 pt-4 sm:px-6"><p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Top locations</p></div>
              <LocationList data={locs} />
            </Card>
          </div>

          <p className="mt-10 text-center text-[11.5px] text-slate-400 dark:text-slate-600">Findora Admin · Analytics shown with generated demo data</p>
        </div>
      </div>
    </div>
  );
}
