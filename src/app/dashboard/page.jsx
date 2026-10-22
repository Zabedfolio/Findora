'use client'

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ClipboardList,
  PackageCheck,
  PackageSearch,
  Search,
  ShieldCheck,
  Timer,
  FileText,
  LayoutDashboard,
  Handshake,
  User,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import {
  ALL_ITEMS,
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
import DataTable from "@/components/dashboard/DataTable";
import LocationList from "@/components/dashboard/LocationList";
import CategoryBars from "@/components/dashboard/BarChart";
import MyListingsView from "@/components/dashboard/MyListingsView";
import ProfileView from "@/components/dashboard/ProfileView";
import ClaimsView from "@/components/dashboard/ClaimsView";
import { cn } from "@/utils/cn";

const delta = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : 0);

const ADMIN_TOOLS = [
  {
    icon: FileText,
    title: "My Listings Hub",
    description: "Manage, track, and update your submitted lost and found reports as cards or a table.",
    tabKey: "my-listings",
    action: "Open My Listings",
  },
  {
    icon: Handshake,
    title: "Claims & Verification",
    description: "Review ownership claims, verify item proof answers, and track safe handovers.",
    tabKey: "claims",
    action: "View Claims Hub",
  },
  {
    icon: User,
    title: "Profile & Settings",
    description: "Update personal contact details, credentials, notification alerts, and trust badges.",
    tabKey: "profile",
    action: "Open Profile",
  },
];

function DashboardContent() {
  const [light, setLight] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [range, setRange] = useState("12m");
  const [segment, setSegment] = useState("all");
  const [location, setLocation] = useState("all");

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "overview");

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    if (tabId === "overview") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tabId);
    }
    window.history.pushState({}, "", url.toString());
  };

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  const days = RANGES[range].days;
  const windowStart = NOW - days * DAY;

  const items = useMemo(
    () =>
      ALL_ITEMS.filter(
        (it) =>
          it.timestamp >= windowStart &&
          it.timestamp <= NOW &&
          (segment === "all" || it.type === segment) &&
          (location === "all" || it.location === location)
      ),
    [windowStart, segment, location]
  );

  const prevItems = useMemo(
    () =>
      ALL_ITEMS.filter(
        (it) =>
          it.timestamp >= windowStart - days * DAY &&
          it.timestamp < windowStart &&
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
    <div className="grain min-h-screen bg-slate-50/60 dark:bg-[#070905] text-slate-900 dark:text-white transition-colors">
      {/* Findora Theme Ambient Glowing Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-[#9ae600]/[0.10] blur-[140px] dark:bg-[#9ae600]/[0.08]" />
        <div className="absolute right-[-120px] top-1/3 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.08] blur-[140px] dark:bg-emerald-500/[0.06]" />
        <div className="absolute bottom-[-160px] left-[-100px] h-[420px] w-[420px] rounded-full bg-[#9ae600]/[0.07] blur-[140px]" />
      </div>

      {/* Sidebar with functional collapse / expand state and in-dashboard tab switching */}
      <Sidebar
        mobileOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Content Area */}
      <div
        className={`relative transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-[250px]"
        }`}
      >
        <div className="mx-auto max-w-[1480px] px-4 pb-14 sm:px-6 lg:px-8">
          <Topbar
            light={light}
            onToggleTheme={() => setLight((current) => !current)}
            onOpenMenu={() => setMenuOpen(true)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onOpenProfile={() => handleSelectTab("profile")}
          />

          {/* In-Dashboard View Switcher Bar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3 dark:border-white/[0.08]">
            <div className="inline-flex flex-wrap rounded-2xl bg-slate-100 dark:bg-white/[0.05] p-1 border border-slate-200/80 dark:border-white/10 gap-1">
              <button
                type="button"
                onClick={() => handleSelectTab("overview")}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === "overview"
                    ? "bg-white dark:bg-[#070b04] text-slate-950 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <LayoutDashboard
                  size={14}
                  className={activeTab === "overview" ? "text-[#72a800] dark:text-[#9ae600]" : ""}
                />
                <span>Overview &amp; Analytics</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab("my-listings")}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === "my-listings"
                    ? "bg-white dark:bg-[#070b04] text-slate-950 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <FileText
                  size={14}
                  className={activeTab === "my-listings" ? "text-[#72a800] dark:text-[#9ae600]" : ""}
                />
                <span>My Listings</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab("claims")}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === "claims"
                    ? "bg-white dark:bg-[#070b04] text-slate-950 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Handshake
                  size={14}
                  className={activeTab === "claims" ? "text-[#72a800] dark:text-[#9ae600]" : ""}
                />
                <span>Claims &amp; Verification</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab("reports")}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === "reports"
                    ? "bg-white dark:bg-[#070b04] text-slate-950 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <PackageSearch
                  size={14}
                  className={activeTab === "reports" ? "text-[#72a800] dark:text-[#9ae600]" : ""}
                />
                <span>Reports Directory</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab("profile")}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === "profile"
                    ? "bg-white dark:bg-[#070b04] text-slate-950 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <User
                  size={14}
                  className={activeTab === "profile" ? "text-[#72a800] dark:text-[#9ae600]" : ""}
                />
                <span>Profile &amp; Settings</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                Dashboard Mode:
              </span>
              <span className="rounded-full bg-[#9ae600]/15 px-2.5 py-0.5 text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30">
                {activeTab === "profile"
                  ? "Profile & Settings"
                  : activeTab === "claims"
                  ? "Claims & Verification"
                  : activeTab === "my-listings"
                  ? "My Listings"
                  : activeTab === "reports"
                  ? "Reports Directory"
                  : "Overview & Analytics"}
              </span>
            </div>
          </div>

          {/* TAB 1: PROFILE & SETTINGS (In-Dashboard View) */}
          {activeTab === "profile" && (
            <ProfileView />
          )}

          {/* TAB 2: CLAIMS & VERIFICATION (In-Dashboard View) */}
          {activeTab === "claims" && (
            <ClaimsView />
          )}

          {/* TAB 3: MY LISTINGS (Table & Card View inside Dashboard) */}
          {activeTab === "my-listings" && (
            <MyListingsView />
          )}

          {/* TAB 4: OVERVIEW VIEW */}
          {activeTab === "overview" && (
            <>
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

              {/* KPI Metrics Strip */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
                <KpiCard
                  label="Lost items"
                  value={lostReports}
                  format={fmtInt}
                  delta={delta(lostReports, prevLostReports)}
                  icon={PackageSearch}
                  iconClass="bg-rose-500/10 text-rose-500 dark:bg-rose-400/10 dark:text-rose-300"
                  spark={sparks.lost}
                  sparkColor="#FB7185"
                  delay={0.02}
                />

                <KpiCard
                  label="Found items"
                  value={foundReports}
                  format={fmtInt}
                  delta={delta(foundReports, prevFoundReports)}
                  icon={Search}
                  iconClass="bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600]"
                  spark={sparks.found}
                  sparkColor="#9ae600"
                  delay={0.08}
                />

                <KpiCard
                  label="Successful returns"
                  value={kpis.returned}
                  format={fmtInt}
                  delta={delta(kpis.returned, prevKpis.returned)}
                  icon={PackageCheck}
                  iconClass="bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600]"
                  spark={sparks.returned}
                  sparkColor="#9ae600"
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
              <section className="mt-5" aria-labelledby="admin-tools-heading">
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <h2
                      id="admin-tools-heading"
                      className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                      Admin Workspace &amp; Navigation
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
                  {ADMIN_TOOLS.map(({ icon: Icon, title, description, tabKey, action }) => (
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
                        <button
                          type="button"
                          onClick={() => handleSelectTab(tabKey)}
                          className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-bold text-[#72a800] hover:text-[#5e8700] dark:text-[#9ae600] dark:hover:text-[#b4f52e] transition-colors cursor-pointer"
                        >
                          <span>{action}</span>
                          <ArrowUpRight size={13} />
                        </button>
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
                  <DataTable items={items} />
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

          {/* TAB 5: REPORTS DIRECTORY VIEW */}
          {activeTab === "reports" && (
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
                  <DataTable items={items} />
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
            Findora Admin Console · Synchronized Telemetry System
          </p>
        </div>
      </div>
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
