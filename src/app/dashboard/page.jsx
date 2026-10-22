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
  PlusCircle,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Eye,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import useAuth from "@/hooks/useAuth";

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
import DataTable from "@/components/dashboard/DataTable";
import LocationList from "@/components/dashboard/LocationList";
import CategoryBars from "@/components/dashboard/BarChart";
import MyListingsView from "@/components/dashboard/MyListingsView";
import ProfileView from "@/components/dashboard/ProfileView";
import ClaimsView from "@/components/dashboard/ClaimsView";
import { getAllUnifiedReports } from "@/services/reportService";
import { cn } from "@/utils/cn";

const delta = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : 0);

const USER_QUICK_TOOLS = [
  {
    icon: FileText,
    title: "My Listings Hub",
    description: "Manage, track, and update your submitted lost and found reports as a table or cards.",
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
    action: "Manage Profile",
  },
];

// Demo recent user activity timeline
const USER_ACTIVITY_LOG = [
  {
    id: "act-1",
    title: "Ownership claim approved",
    subtitle: "Tanvir Rahman approved your claim on iPhone 15 Pro",
    time: "2 hours ago",
    status: "approved",
    actionLabel: "View Handover Details",
  },
  {
    id: "act-2",
    title: "New claim submitted on your found item",
    subtitle: "Kamrul Islam submitted proof for Toyota Smart Key",
    time: "4 hours ago",
    status: "pending",
    actionLabel: "Review Proof Answer",
  },
  {
    id: "act-3",
    title: "Report published",
    subtitle: "Your report for North Face Backpack is live on Findora",
    time: "Yesterday",
    status: "info",
    actionLabel: "View Report",
  },
];

function DashboardContent() {
  const { user } = useAuth();
  const userName = user?.name || "Zabed Mahmud";

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

  const catAgg = useMemo(() => aggregateByCategory(items), [items]);
  const locs = useMemo(() => topLocations(items), [items]);

  const isDefault = range === "12m" && segment === "all" && location === "all";
  const reset = () => {
    setRange("12m");
    setSegment("all");
    setLocation("all");
  };

  // User-specific report items
  const userItems = useMemo(() => {
    const all = getAllUnifiedReports();
    return all.filter(
      (item) =>
        item.isUserCreated ||
        item.owner?._id === "user_current" ||
        item.id === "lost-1" ||
        item.id === "lost-3" ||
        item.id === "found-1" ||
        item.id === "found-2"
    );
  }, []);

  const userStats = useMemo(() => {
    const lostCount = userItems.filter((i) => i.type === "lost" && i.status !== "resolved").length;
    const foundCount = userItems.filter((i) => i.type === "found" && i.status !== "resolved").length;
    const reunitedCount = userItems.filter((i) => i.status === "resolved").length;
    return {
      lostCount,
      foundCount,
      activeClaims: 2,
      reunitedCount,
    };
  }, [userItems]);

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
                <span>Overview &amp; Activity</span>
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
                <span className="rounded-full bg-[#9ae600]/20 text-[#629400] dark:text-[#9ae600] px-1.5 py-0.2 text-[10px] font-mono font-bold">
                  {userItems.length}
                </span>
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
                <span>Browse Directory</span>
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
                User Status:
              </span>
              <span className="rounded-full bg-[#9ae600]/15 px-2.5 py-0.5 text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30">
                Active Member
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

          {/* TAB 4: USER OVERVIEW VIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* User Welcome Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 p-6 sm:p-8 shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#9ae600]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9ae600]/15 border border-[#9ae600]/30 text-[#9ae600] text-xs font-mono font-bold mb-3">
                      <Sparkles size={13} />
                      <span>PERSONAL WORKSPACE</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
                      Welcome back, <span className="text-[#9ae600]">{userName}</span>
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                      Track the progress of your reported lost valuables, manage found items in your care, and review ownership claims in one secure place.
                    </p>
                  </div>

                  {/* Quick User Report Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Link
                      href="/reports/new"
                      className="btn-primary-glow inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 shadow-md"
                    >
                      <PlusCircle size={15} />
                      <span>Report New Item</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleSelectTab("my-listings")}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
                    >
                      View My Listings
                    </button>
                  </div>
                </div>
              </div>

              {/* User KPI Metrics Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>MY LOST ITEMS</span>
                    <PackageSearch size={15} className="text-rose-500" />
                  </div>
                  <p className="mt-2 text-3xl font-black text-rose-500 font-heading">
                    {userStats.lostCount}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Currently searching</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>ITEMS I FOUND</span>
                    <Search size={15} className="text-[#72a800] dark:text-[#9ae600]" />
                  </div>
                  <p className="mt-2 text-3xl font-black text-[#72a800] dark:text-[#9ae600] font-heading">
                    {userStats.foundCount}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">In safe keeping</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>ACTIVE CLAIMS</span>
                    <Handshake size={15} className="text-amber-500" />
                  </div>
                  <p className="mt-2 text-3xl font-black text-amber-500 font-heading">
                    {userStats.activeClaims}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Proof under review</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>REUNITED ITEMS</span>
                    <PackageCheck size={15} className="text-emerald-500" />
                  </div>
                  <p className="mt-2 text-3xl font-black text-emerald-500 font-heading">
                    {userStats.reunitedCount}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    100% verified returns
                  </p>
                </div>
              </div>

              {/* User Quick Workspaces Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {USER_QUICK_TOOLS.map(({ icon: Icon, title, description, tabKey, action }) => (
                  <Card
                    key={title}
                    className="flex flex-col justify-between p-5 hover:border-[#9ae600]/40 transition-colors"
                  >
                    <div>
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] mb-3">
                        <Icon size={19} strokeWidth={2.2} />
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                        {title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectTab(tabKey)}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#72a800] hover:text-[#5e8700] dark:text-[#9ae600] dark:hover:text-[#b4f52e] transition-colors cursor-pointer"
                    >
                      <span>{action}</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </Card>
                ))}
              </div>

              {/* User Active Items & Activity Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: My Active Items Preview */}
                <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                        My Active Listings
                      </h3>
                      <p className="text-xs text-slate-500">Items currently open for claims or community matching</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectTab("my-listings")}
                      className="text-xs font-bold text-[#72a800] dark:text-[#9ae600] hover:underline"
                    >
                      View All ({userItems.length})
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                    {userItems.slice(0, 3).map((it) => {
                      const id = it.id || it._id;
                      const isLost = it.type === "lost";
                      const isResolved = it.status === "resolved";

                      return (
                        <div key={id} className="py-3.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0">
                              {it.imageUrl ? (
                                <img
                                  src={it.imageUrl}
                                  alt={it.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full grid place-items-center text-slate-400">
                                  <PackageSearch size={16} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {it.title}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <MapPin size={11} />
                                  <span className="truncate">{it.location || "Dhaka"}</span>
                                </span>
                                <span>·</span>
                                <span>{it.date || "Recent"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase",
                                isLost
                                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                                  : "bg-[#9ae600]/15 text-[#72a800] dark:text-[#9ae600] border border-[#9ae600]/30"
                              )}
                            >
                              {it.type}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSelectTab("my-listings")}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                              title="Inspect in My Listings"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Recent User Activity Log */}
                <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                        Recent Activity Log
                      </h3>
                      <p className="text-xs text-slate-500">Live notifications and updates on your items</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {USER_ACTIVITY_LOG.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {act.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {act.time}
                          </span>
                        </div>
                        <p className="mt-1 text-[11.5px] text-slate-600 dark:text-slate-300">
                          {act.subtitle}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSelectTab("claims")}
                          className="mt-2 text-[11px] font-bold text-[#72a800] dark:text-[#9ae600] hover:underline inline-flex items-center gap-1"
                        >
                          <span>{act.actionLabel}</span>
                          <ArrowUpRight size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
            Findora Member Portal · Personal Lost &amp; Found Hub
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
