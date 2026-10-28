'use client';

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ClipboardList,
  PackageCheck,
  PackageSearch,
  Search,
  Timer,
  FileText,
  Handshake,
} from "lucide-react";

import {
  DAY,
  NOW,
  RANGES,
  bucketize,
  computeKpis,
  aggregateByCategory,
  aggregateByStatus,
  topLocations,
} from "@/lib/data";
import { fmtInt, fmtHours } from "@/lib/format";
import FilterBar from "@/components/dashboard/FilterBar";
import KpiCard from "@/components/dashboard/KpiCard";
import { Card, CardHeader } from "@/components/dashboard/ui";
import AreaChart from "@/components/dashboard/AreaChart";
import DonutChart from "@/components/dashboard/DonutChart";
import MyReportsTable from "@/components/dashboard/MyReportsTable";
import LocationList from "@/components/dashboard/LocationList";
import CategoryBars from "@/components/dashboard/BarChart";
import ProfileView from "@/components/dashboard/ProfileView";
import ClaimsView from "@/components/dashboard/ClaimsView";
import useAuth from "@/hooks/useAuth";
import { getAllUnifiedReports, normalizeItem } from "@/services/reportService";

const delta = (cur = 0, prev = 0) => {
  const c = Number(cur) || 0;
  const p = Number(prev) || 0;
  return p > 0 ? ((c - p) / p) * 100 : 0;
};

const QUICK_WORKSPACES = [
  {
    icon: FileText,
    title: "My Reports Hub",
    description: "Manage, track, and update your submitted lost and found reports with quick status actions.",
    tabKey: "reports",
    action: "View My Reports",
  },
  {
    icon: Handshake,
    title: "Claims & Verification",
    description: "Review ownership claims, verify item proof answers, and track safe handovers.",
    tabKey: "claims",
    action: "View Claims Hub",
  },
  {
    icon: ClipboardList,
    title: "Public Directory",
    description: "Browse the community directory of all active lost and found items.",
    href: "/reports",
    action: "Browse Listings",
  },
];

function DashboardContent() {
  const { user, isAdmin } = useAuth();
  const [range, setRange] = useState("12m");
  const [segment, setSegment] = useState("all");
  const [location, setLocation] = useState("all");
  const [userReports, setUserReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Fetch live reports for current authenticated user
  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      try {
        setLoadingReports(true);
        const currentUserId = user?.id || user?._id;
        const currentUserEmail = user?.email;
        const apiBase = process.env.NEXT_PUBLIC_API_URL;

        if (apiBase && (currentUserId || currentUserEmail)) {
          const params = new URLSearchParams();
          if (currentUserId) params.set("userId", currentUserId);
          if (currentUserEmail) params.set("email", currentUserEmail);
          const res = await fetch(`${apiBase}/items?${params.toString()}`);
          if (res.ok) {
            const json = await res.json();
            if (isMounted && Array.isArray(json?.data)) {
              setUserReports(json.data.map(normalizeItem));
              return;
            }
          }
        }

        const all = getAllUnifiedReports();
        const userOnly = all.filter((item) => {
          const ownerId = item.owner?._id || item.owner?.id;
          const ownerEmail = item.owner?.email;
          return (
            item.isUserCreated ||
            (currentUserId && ownerId === currentUserId) ||
            (currentUserEmail && ownerEmail === currentUserEmail) ||
            item.owner?.isCurrentUser
          );
        });
        if (isMounted) setUserReports(userOnly);
      } catch (e) {
        console.warn("Could not load user dashboard items:", e);
      } finally {
        if (isMounted) setLoadingReports(false);
      }
    }

    loadReports();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email]);

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const resolveTab = (param) => {
    if (!param) return "overview";
    if (param === "my-listings" || param === "my-reports") return "reports";
    return param;
  };
  const [activeTab, setActiveTab] = useState(resolveTab(tabParam));

  useEffect(() => {
    const target = resolveTab(tabParam);
    if (target !== activeTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(target);
    }
  }, [tabParam, activeTab]);

  const handleSelectTab = (tabId) => {
    const resolved = resolveTab(tabId);
    setActiveTab(resolved);
    const url = new URL(window.location.href);
    if (resolved === "overview") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", resolved);
    }
    window.history.pushState({}, "", url.toString());
  };

  const days = RANGES[range]?.days || 30;
  const windowStart = NOW - days * DAY;

  // Transform user reports to dashboard item structure
  const dashboardItems = useMemo(() => {
    return userReports.map((r) => ({
      id: r.id || r._id,
      name: r.title,
      title: r.title,
      type: r.type || "lost",
      category: (r.category || "other").toLowerCase(),
      location: r.location || "Dhaka",
      timestamp: r.dateRaw ? new Date(r.dateRaw).getTime() : NOW,
      status: r.status === "resolved" ? "returned" : (r.status === "found" ? "matched" : "pending"),
      value: 50,
      hoursToResolve: r.status === "resolved" ? 12 : 0,
      reporter: r.owner?.name || "You",
    }));
  }, [userReports]);

  const items = useMemo(
    () =>
      dashboardItems.filter(
        (it) =>
          it.timestamp >= windowStart &&
          it.timestamp <= NOW + 86400000 &&
          (segment === "all" || it.type === segment) &&
          (location === "all" || it.location === location)
      ),
    [dashboardItems, windowStart, segment, location]
  );

  const prevItems = useMemo(
    () =>
      dashboardItems.filter(
        (it) =>
          it.timestamp >= windowStart - days * DAY &&
          it.timestamp < windowStart &&
          (segment === "all" || it.type === segment) &&
          (location === "all" || it.location === location)
      ),
    [dashboardItems, windowStart, days, segment, location]
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
  const reset = () => {
    setRange("12m");
    setSegment("all");
    setLocation("all");
  };

  const sparks = {
    lost: buckets.map((b) => b.lost),
    found: buckets.map((b) => b.found),
    returned: buckets.map((b) => b.returned),
    recovery: buckets.map((b) => b.avgHours),
  };

  return (
    <div className="space-y-6">
      {/* Administrator Preview Notification Banner */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
              🛡️
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-bold">
                  Viewing Community Workspace as Administrator
                </p>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Preview Mode
                </span>
              </div>
              <p className="text-[11.5px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                You are currently viewing the regular member dashboard. All administrative controls, reviews, and fraud moderation tools are located in the Admin Control Center.
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 whitespace-nowrap"
          >
            <span>Go to Admin Control Center</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      {/* TAB 1: PROFILE & SETTINGS (In-Dashboard View) */}
          {activeTab === "profile" && <ProfileView />}

          {/* TAB 2: CLAIMS & VERIFICATION (In-Dashboard View) */}
          {activeTab === "claims" && <ClaimsView />}

          {/* TAB 3: ORIGINAL OVERVIEW & ANALYTICS VIEW */}
          {activeTab === "overview" && (
            <>
              {/* Zero-State Welcome Card for Fresh Accounts */}
              {userReports.length === 0 && !loadingReports && (
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 text-center shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] flex items-center justify-center mx-auto mb-3">
                    <PackageSearch size={28} />
                  </div>
                  <h3 className="text-lg font-bold font-heading text-slate-950 dark:text-white">
                    Welcome to Your Recovery Workspace
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                    You haven&apos;t filed any lost or found reports yet. As soon as you submit an item or claim a found possession, your recovery timelines and live return handovers will automatically appear here.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                    <Link
                      href="/reports/new?type=lost"
                      className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-mono font-bold transition-all shadow-xs"
                    >
                      + Report Lost Item
                    </Link>
                    <Link
                      href="/reports/new?type=found"
                      className="px-4 py-2 rounded-xl bg-[#9ae600] hover:bg-[#86c800] text-black text-xs font-mono font-bold transition-all shadow-xs"
                    >
                      + Report Found Item
                    </Link>
                    <Link
                      href="/reports"
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold transition-all"
                    >
                      Browse Community Directory
                    </Link>
                  </div>
                </div>
              )}

              {/* Filter Bar with Time range, Segments, and Location */}
              <FilterBar
                range={range}
                onRange={setRange}
                segment={segment}
                onSegment={setSegment}
                location={location}
                onLocation={setLocation}
                windowStart={windowStart}
                onReset={reset}
                isDefault={isDefault}
              />

              {/* 4 Sparkline KPI Cards */}
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  label="Lost items reported"
                  value={lostReports}
                  format={fmtInt}
                  delta={delta(lostReports, prevLostReports)}
                  invert
                  icon={PackageSearch}
                  iconClass="bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300"
                  spark={sparks.lost}
                  sparkColor="#F43F5E"
                  delay={0.02}
                />

                <KpiCard
                  label="Found items submitted"
                  value={foundReports}
                  format={fmtInt}
                  delta={delta(foundReports, prevFoundReports)}
                  icon={Search}
                  iconClass="bg-[#9ae600]/10 text-[#72a800] dark:bg-[#9ae600]/10 dark:text-[#9ae600]"
                  spark={sparks.found}
                  sparkColor="#9ae600"
                  delay={0.08}
                />

                <KpiCard
                  label="Successful returns"
                  value={kpis.totalResolved ?? kpis.returned ?? 0}
                  format={fmtInt}
                  delta={delta(kpis.totalResolved ?? kpis.returned ?? 0, prevKpis.totalResolved ?? prevKpis.returned ?? 0)}
                  icon={PackageCheck}
                  iconClass="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300"
                  spark={sparks.returned}
                  sparkColor="#10B981"
                  delay={0.14}
                />

                <KpiCard
                  label="Avg. recovery time"
                  value={kpis.avgRecovery}
                  format={fmtHours}
                  delta={delta(kpis.avgRecovery, prevKpis.avgRecovery)}
                  invert
                  icon={Timer}
                  iconClass="bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300"
                  spark={sparks.recovery}
                  sparkColor="#FBBF24"
                  delay={0.2}
                />
              </div>

              {/* Quick Workspaces Section */}
              <section className="mt-5" aria-labelledby="workspace-tools-heading">
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <h2
                      id="workspace-tools-heading"
                      className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                      Workspace &amp; Quick Access
                    </h2>
                    <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                      Quick access to community reports, personal listings, and claim verification.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#9ae600]/15 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.1em] text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {QUICK_WORKSPACES.map(({ icon: Icon, title, description, href, tabKey, action }) => (
                    <Card
                      key={title}
                      className="flex items-start gap-3 p-4 hover:border-[#9ae600]/40 transition-colors"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600]">
                        <Icon size={17} strokeWidth={2.1} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">
                          {title}
                        </h3>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                          {description}
                        </p>
                        {tabKey ? (
                          <button
                            type="button"
                            onClick={() => handleSelectTab(tabKey)}
                            className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-bold text-[#72a800] hover:text-[#5e8700] dark:text-[#9ae600] dark:hover:text-[#b4f52e] transition-colors cursor-pointer"
                          >
                            <span>{action}</span>
                            <ArrowUpRight size={13} />
                          </button>
                        ) : (
                          <Link
                            href={href}
                            className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-bold text-[#72a800] hover:text-[#5e8700] dark:text-[#9ae600] dark:hover:text-[#b4f52e] transition-colors"
                          >
                            <span>{action}</span>
                            <ArrowUpRight size={13} />
                          </Link>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Area & Donut Charts */}
              <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-8">
                  <AreaChart
                    labels={buckets.map((b) => b.label)}
                    lost={buckets.map((b) => b.lost)}
                    found={buckets.map((b) => b.found)}
                    segment={segment}
                    delay={0.25}
                  />
                </div>
                <div className="xl:col-span-4">
                  <DonutChart data={statusAgg} delay={0.32} />
                </div>
              </div>

              {/* Data Table & Categories Section */}
              <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
                <Card delay={0.38} className="xl:col-span-7 overflow-hidden">
                  <MyReportsTable />
                </Card>

                <Card delay={0.44} className="xl:col-span-5 overflow-hidden">
                  <CardHeader
                    title="Categories"
                    subtitle="Where reports concentrate"
                    right={
                      <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          Lost
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#9ae600]" />
                          Found
                        </span>
                      </div>
                    }
                  />
                  <CategoryBars data={catAgg} segment={segment} />
                  <div className="mx-5 mt-4 border-t border-dashed border-slate-200 sm:mx-6 dark:border-white/10" />
                  <div className="px-5 pb-1 pt-4 sm:px-6">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                      Top locations
                    </p>
                  </div>
                  <LocationList data={locs} />
                </Card>
              </div>
            </>
          )}

          {/* TAB 4: MY REPORTS VIEW */}
          {(activeTab === "reports" || activeTab === "my-reports" || activeTab === "my-listings") && (
            <div className="mt-2 space-y-5">
              <FilterBar
                range={range}
                onRange={setRange}
                segment={segment}
                onSegment={setSegment}
                location={location}
                onLocation={setLocation}
                windowStart={windowStart}
                onReset={reset}
                isDefault={isDefault}
              />

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <Card className="xl:col-span-8 overflow-hidden">
                  <MyReportsTable />
                </Card>

                <Card className="xl:col-span-4 overflow-hidden">
                  <CardHeader
                    title="Category Breakdown"
                    subtitle="Filter distribution across categories"
                  />
                  <CategoryBars data={catAgg} segment={segment} />
                  <div className="mx-5 mt-4 border-t border-dashed border-slate-200 sm:mx-6 dark:border-white/10" />
                  <div className="px-5 pb-1 pt-4 sm:px-6">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                      Top Locations
                    </p>
                  </div>
                  <LocationList data={locs} />
                </Card>
              </div>
            </div>
          )}

      <p className="mt-10 text-center text-[11.5px] font-mono text-slate-400 dark:text-slate-600">
        Findora Workspace · Synchronized Telemetry System
      </p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
