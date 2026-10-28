"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    ShieldAlert,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Search,
    Filter,
    ArrowUpRight,
    ExternalLink,
    Copy,
    Check,
    MapPin,
    Calendar,
    User,
    Handshake,
    Key,
    RefreshCw,
    FileText,
    ChevronRight,
    ChevronDown,
    Info,
    Lock,
    PackageCheck,
    MessageSquare,
    HelpCircle,
    X,
    Phone,
    AlertCircle,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import ReportAbuseModal from "@/components/claims/ReportAbuseModal";
import toast from "@/lib/toast";
import useAuth from "@/hooks/useAuth";
import {
    getMyClaims as serviceGetMyClaims,
    markClaimReunited,
    submitAdditionalProof,
    cancelClaim,
    approveClaim,
    rejectClaim,
} from "@/services/claimService";

// Data layer                                                      
async function fetchMyClaims(params = {}, user = null) {
    return await serviceGetMyClaims(params, user);
}

// Status definitions and design tokens
const STATUS_CONFIG = {
    approved: {
        label: "Ready for Handover",
        badgeClass:
            "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300 ring-1 ring-emerald-500/25",
        dotClass: "bg-emerald-500",
        icon: CheckCircle2,
        lightBorder: "border-emerald-200 dark:border-emerald-800/60",
        glow: "shadow-[0_0_20px_-6px_rgba(16,185,129,0.3)]",
    },
    in_handover: {
        label: "Handover in Progress",
        badgeClass:
            "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300 ring-1 ring-indigo-500/25",
        dotClass: "bg-indigo-500",
        icon: Handshake,
        lightBorder: "border-indigo-200 dark:border-indigo-800/60",
        glow: "shadow-[0_0_20px_-6px_rgba(99,102,241,0.3)]",
    },
    pending: {
        label: "Under Review",
        badgeClass:
            "bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300 ring-1 ring-amber-500/25",
        dotClass: "bg-amber-500",
        icon: Clock,
        lightBorder: "border-amber-200 dark:border-amber-800/60",
        glow: "shadow-[0_0_20px_-6px_rgba(245,158,11,0.25)]",
    },
    needs_info: {
        label: "Action Needed: More Info",
        badgeClass:
            "bg-purple-500/10 text-purple-700 dark:bg-purple-400/10 dark:text-purple-300 ring-1 ring-purple-500/25",
        dotClass: "bg-purple-500 animate-pulse",
        icon: AlertTriangle,
        lightBorder: "border-purple-200 dark:border-purple-800/60",
        glow: "shadow-[0_0_20px_-6px_rgba(168,85,247,0.3)]",
    },
    reunited: {
        label: "Reunited & Returned",
        badgeClass:
            "bg-teal-500/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300 ring-1 ring-teal-500/25",
        dotClass: "bg-teal-500",
        icon: PackageCheck,
        lightBorder: "border-teal-200 dark:border-teal-800/60",
        glow: "shadow-[0_0_20px_-6px_rgba(20,184,166,0.25)]",
    },
    rejected: {
        label: "Verification Failed",
        badgeClass:
            "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300 ring-1 ring-rose-500/25",
        dotClass: "bg-rose-500",
        icon: XCircle,
        lightBorder: "border-rose-200 dark:border-rose-800/60",
        glow: "",
    },
};

const CATEGORIES = [
    "All Categories",
    "Electronics",
    "Documents & Wallets",
    "Keys & Access",
    "Jewelry & Watches",
    "Bags & Luggage",
];

function ClaimantClaimsContent() {
    const searchParams = useSearchParams();
    const initialClaimId = searchParams.get("id");
    const initialView = searchParams.get("view");
    const { user } = useAuth();

    const [light, setLight] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [claims, setClaims] = useState([]);
    const [counts, setCounts] = useState({
        all: 0,
        in_handover: 0,
        pending: 0,
        needs_info: 0,
        reunited: 0,
        rejected: 0,
    });
    const [loading, setLoading] = useState(true);

    // Filters & Search
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [sortOrder, setSortOrder] = useState("newest");

    // Expanded items state
    const [expandedClaimId, setExpandedClaimId] = useState(initialClaimId || null);

    // Modals state
    const [handoverModalClaim, setHandoverModalClaim] = useState(null);
    const [proofModalClaim, setProofModalClaim] = useState(null);
    const [additionalProofText, setAdditionalProofText] = useState("");
    const [isSubmittingProof, setIsSubmittingProof] = useState(false);
    const [abuseModalOpen, setAbuseModalOpen] = useState(false);
    const [abuseTarget, setAbuseTarget] = useState({ id: "", title: "" });
    const [copiedCode, setCopiedCode] = useState(null);

    // Finder approval & rejection modal states
    const [approveModalClaim, setApproveModalClaim] = useState(null);
    const [rejectModalClaim, setRejectModalClaim] = useState(null);
    const [decisionNote, setDecisionNote] = useState("");
    const [actionInProgress, setActionInProgress] = useState(null);
    const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'incoming' | 'outgoing'

    const currentUserId = user?.id || user?._id || user?.userId;
    const currentUserEmail = (user?.email || "").toLowerCase();

    const getClaimRole = useCallback((claim) => {
        const isFinder = Boolean(
            (currentUserId && (claim.finder?.userId === currentUserId || claim.finder?.id === currentUserId || claim.finder?._id === currentUserId)) ||
            (currentUserEmail && claim.finder?.email?.toLowerCase() === currentUserEmail)
        );
        const isClaimant = Boolean(
            (currentUserId && (claim.claimant?.userId === currentUserId || claim.claimant?.id === currentUserId || claim.claimant?._id === currentUserId)) ||
            (currentUserEmail && claim.claimant?.email?.toLowerCase() === currentUserEmail)
        );
        return { isFinder, isClaimant };
    }, [currentUserId, currentUserEmail]);

    // Theme synchronization
    useEffect(() => {
        document.documentElement.classList.toggle("light", light);
    }, [light]);

    // Load claims data
    const loadClaimsData = useCallback(async () => {
        if (!user) {
            setClaims([]);
            setCounts({
                all: 0,
                in_handover: 0,
                pending: 0,
                needs_info: 0,
                reunited: 0,
                rejected: 0,
            });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await fetchMyClaims({
                status: activeTab,
                q: searchQuery,
                category: selectedCategory,
                sort: sortOrder,
            }, user);
            if (res && res.claims) {
                setClaims(res.claims);
                if (res.counts) setCounts(res.counts);

                // If URL requested a specific handover view, open it
                if (initialClaimId && initialView === "handover") {
                    const match = res.claims.find((c) => c.id === initialClaimId || c.claimNumber === initialClaimId);
                    if (match && match.handover?.isEligible) {
                        setHandoverModalClaim(match);
                    }
                }
            }
        } catch (err) {
            console.error("Error loading claims:", err);
            toast.error("Could not load claims.");
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchQuery, selectedCategory, sortOrder, initialClaimId, initialView, user]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadClaimsData();
    }, [loadClaimsData]);

    // Copy code helper
    const handleCopy = (text, type = "claim") => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedCode(`${type}-${text}`);
            toast.success(`${text} copied to clipboard!`);
            setTimeout(() => setCopiedCode(null), 2200);
        }
    };

    // Mark reunited action
    const handleMarkReunited = async (claimId) => {
        try {
            const updated = await markClaimReunited(claimId);
            if (updated) {
                toast.success("Congratulations! Item marked as reunited and returned.");
                setHandoverModalClaim(null);
                await loadClaimsData();
            }
        } catch {
            toast.error("Failed to complete handover.");
        }
    };

    // Submit additional proof
    const handleSubmitProof = async (e) => {
        e.preventDefault();
        if (!additionalProofText.trim()) {
            toast.error("Please enter additional identifying details.");
            return;
        }
        try {
            setIsSubmittingProof(true);
            await submitAdditionalProof(proofModalClaim.id, additionalProofText);
            toast.success("Additional details submitted! Finder has been notified.");
            setProofModalClaim(null);
            setAdditionalProofText("");
            await loadClaimsData();
        } catch {
            toast.error("Failed to submit additional proof.");
        } finally {
            setIsSubmittingProof(false);
        }
    };

    // Cancel claim
    const handleCancelClaim = async (claimId) => {
        if (confirm("Are you sure you want to withdraw this claim?")) {
            try {
                await cancelClaim(claimId, "Withdrawn by claimant");
                toast("Claim withdrawn successfully.");
                await loadClaimsData();
            } catch {
                toast.error("Failed to withdraw claim.");
            }
        }
    };

    // Finder Approve Action
    const handleConfirmApprove = async () => {
        if (!approveModalClaim) return;
        try {
            setActionInProgress(approveModalClaim.id);
            await approveClaim(approveModalClaim.id, decisionNote.trim());
            toast.success("Claim approved! Safe Handover proposal initialized.");
            setApproveModalClaim(null);
            setDecisionNote("");
            await loadClaimsData();
        } catch (err) {
            toast.error(err?.message || "Failed to approve claim.");
        } finally {
            setActionInProgress(null);
        }
    };

    // Finder Reject Action
    const handleConfirmReject = async () => {
        if (!rejectModalClaim) return;
        try {
            setActionInProgress(rejectModalClaim.id);
            await rejectClaim(rejectModalClaim.id, decisionNote.trim() || "Proof details did not match.");
            toast.info("Claim declined.");
            setRejectModalClaim(null);
            setDecisionNote("");
            await loadClaimsData();
        } catch (err) {
            toast.error(err?.message || "Failed to decline claim.");
        } finally {
            setActionInProgress(null);
        }
    };

    const incomingCount = useMemo(() => {
        return claims.filter((c) => getClaimRole(c).isFinder).length;
    }, [claims, getClaimRole]);

    const outgoingCount = useMemo(() => {
        return claims.filter((c) => getClaimRole(c).isClaimant).length;
    }, [claims, getClaimRole]);

    const displayedClaims = useMemo(() => {
        if (roleFilter === "incoming") {
            return claims.filter((c) => getClaimRole(c).isFinder);
        }
        if (roleFilter === "outgoing") {
            return claims.filter((c) => getClaimRole(c).isClaimant);
        }
        return claims;
    }, [claims, roleFilter, getClaimRole]);

    // KPI Metrics Calculation
    const kpis = useMemo(() => {
        const total = counts.all || claims.length;
        const handovers = counts.in_handover || claims.filter((c) => c.status === "approved" || c.status === "in_handover").length;
        const pending = counts.pending || claims.filter((c) => c.status === "pending").length;
        const reunited = counts.reunited || claims.filter((c) => c.status === "reunited").length;
        return { total, handovers, pending, reunited };
    }, [counts, claims]);

    return (
        <div className="grain min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-ink-950 dark:text-white">
            {/* Background ambient lighting */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-indigo-500/[0.14] blur-[140px] dark:bg-indigo-500/[0.12]" />
                <div className="absolute right-[-100px] top-1/3 h-[420px] w-[420px] rounded-full bg-[#9ae600]/[0.12] blur-[130px] dark:bg-[#9ae600]/[0.08]" />
                <div className="absolute bottom-[-160px] left-[-100px] h-[420px] w-[420px] rounded-full bg-emerald-500/[0.12] blur-[130px] dark:bg-emerald-500/[0.08]" />
            </div>

            {/* Main Sidebar */}
            <Sidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />

            {/* Content Area */}
            <div className="relative lg:pl-[248px]">
                <div className="mx-auto max-w-[1480px] px-4 pb-16 sm:px-6 lg:px-8">
                    {/* Topbar with Claims context */}
                    <Topbar
                        light={light}
                        onToggleTheme={() => setLight((cur) => !cur)}
                        onOpenMenu={() => setMenuOpen(true)}
                        section="Claims & Verification"
                        title="Claims Management & Handover"
                        badge="VERIFICATION"
                    />

                    {/* Page Banner / Hero Headline */}
                    <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-ink-900/80 sm:p-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2">
                                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#9ae600]/15 text-[#639400] dark:bg-[#9ae600]/20 dark:text-[#9ae600]">
                                    <ShieldCheck size={18} strokeWidth={2.3} />
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider text-[#639400] dark:text-[#9ae600]">
                                    Claims &amp; Verification Hub
                                </span>
                            </div>
                            <h1 className="font-display mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                                Manage Ownership Claims &amp; Verification Status
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Review incoming claims on items you found, approve legitimate owners to initiate safe handovers, and track your submitted claims.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/reports"
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
                            >
                                <Search size={14} />
                                <span>Search Reports</span>
                            </Link>
                            <button
                                onClick={() => loadClaimsData()}
                                title="Refresh tracking data"
                                className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-ink-800 dark:text-slate-300 dark:hover:bg-ink-700"
                            >
                                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                            </button>
                        </div>
                    </div>

                    {/* Quick KPI Overview Cards */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-6">
                        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xs backdrop-blur-sm dark:border-white/10 dark:bg-ink-900/80">
                            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                <span className="text-[11.5px] font-semibold uppercase tracking-wider">Total Claims</span>
                                <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-300">
                                    <FileText size={14} />
                                </span>
                            </div>
                            <p className="tnum font-display mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {kpis.total}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">Incoming &amp; submitted</p>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 p-4 shadow-xs backdrop-blur-sm dark:border-emerald-500/20 dark:bg-emerald-950/20">
                            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                                <span className="text-[11.5px] font-bold uppercase tracking-wider">Ready / In Handover</span>
                                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
                                    <Handshake size={14} />
                                </span>
                            </div>
                            <p className="tnum font-display mt-2 text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-300">
                                {kpis.handovers}
                            </p>
                            <p className="mt-0.5 text-[11px] text-emerald-600/80 dark:text-emerald-400/70">Meetup codes active</p>
                        </div>

                        <div className="rounded-2xl border border-amber-500/20 bg-amber-50/40 p-4 shadow-xs backdrop-blur-sm dark:border-amber-500/20 dark:bg-amber-950/20">
                            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                                <span className="text-[11.5px] font-bold uppercase tracking-wider">Under Review</span>
                                <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300">
                                    <Clock size={14} />
                                </span>
                            </div>
                            <p className="tnum font-display mt-2 text-2xl font-bold tracking-tight text-amber-800 dark:text-amber-300">
                                {kpis.pending}
                            </p>
                            <p className="mt-0.5 text-[11px] text-amber-600/80 dark:text-amber-400/70">Awaiting finder check</p>
                        </div>

                        <div className="rounded-2xl border border-teal-500/20 bg-teal-50/40 p-4 shadow-xs backdrop-blur-sm dark:border-teal-500/20 dark:bg-teal-950/20">
                            <div className="flex items-center justify-between text-teal-700 dark:text-teal-400">
                                <span className="text-[11.5px] font-bold uppercase tracking-wider">Reunited Items</span>
                                <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-500/15 text-teal-600 dark:bg-teal-400/15 dark:text-teal-300">
                                    <PackageCheck size={14} />
                                </span>
                            </div>
                            <p className="tnum font-display mt-2 text-2xl font-bold tracking-tight text-teal-800 dark:text-teal-300">
                                {kpis.reunited}
                            </p>
                            <p className="mt-0.5 text-[11px] text-teal-600/80 dark:text-teal-400/70">Successfully returned</p>
                        </div>
                    </div>

                    {/* Filtering & Search Toolbar */}
                    <div className="mb-6 rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-xs backdrop-blur dark:border-white/10 dark:bg-ink-900/90 sm:p-5 space-y-4">
                        {/* Role Filter Selector */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-white/5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                                    Filter by role:
                                </span>
                                <button
                                    onClick={() => setRoleFilter("all")}
                                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                                        roleFilter === "all"
                                            ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-950"
                                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10"
                                    }`}
                                >
                                    <span>All Claims</span>
                                    <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${roleFilter === "all" ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-950" : "bg-slate-200/70 text-slate-700 dark:bg-white/10 dark:text-slate-300"}`}>
                                        {claims.length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setRoleFilter("incoming")}
                                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                                        roleFilter === "incoming"
                                            ? "bg-emerald-600 text-white shadow-xs"
                                            : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                                    }`}
                                >
                                    <ShieldCheck size={13} />
                                    <span>Incoming on My Items (As Finder)</span>
                                    <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${roleFilter === "incoming" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"}`}>
                                        {incomingCount}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setRoleFilter("outgoing")}
                                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                                        roleFilter === "outgoing"
                                            ? "bg-blue-600 text-white shadow-xs"
                                            : "text-slate-600 hover:bg-blue-50 hover:text-blue-800 dark:text-slate-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                                    }`}
                                >
                                    <User size={13} />
                                    <span>My Submitted Claims</span>
                                    <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${roleFilter === "outgoing" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"}`}>
                                        {outgoingCount}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            {/* Status Segmented Tabs */}
                            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                                {[
                                    { key: "all", label: "All Status", count: counts.all },
                                    { key: "actionable", label: "Action Required / Ready", count: counts.in_handover + counts.needs_info },
                                    { key: "pending", label: "Under Review", count: counts.pending },
                                    { key: "reunited", label: "Reunited", count: counts.reunited },
                                    { key: "rejected", label: "Declined", count: counts.rejected },
                                ].map((tab) => {
                                    const isActive = activeTab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${isActive
                                                    ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-950"
                                                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                                                }`}
                                        >
                                            <span>{tab.label}</span>
                                            {tab.count !== undefined && (
                                                <span
                                                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isActive
                                                            ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-950"
                                                            : "bg-slate-200/70 text-slate-700 dark:bg-white/10 dark:text-slate-300"
                                                        }`}
                                                >
                                                    {tab.count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search & Select Options */}
                            <div className="flex flex-wrap items-center gap-2.5">
                                {/* Search Bar */}
                                <div className="relative flex-1 sm:w-64 sm:flex-initial">
                                    <Search
                                        size={14}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search claims or finder..."
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-white/10 dark:bg-ink-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-400"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>

                                {/* Category Select */}
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-500 dark:border-white/10 dark:bg-ink-800 dark:text-slate-200"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>

                                {/* Sort Order */}
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-500 dark:border-white/10 dark:bg-ink-800 dark:text-slate-200"
                                >
                                    <option value="newest">Newest first</option>
                                    <option value="oldest">Oldest first</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Claims List View */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
                            <p className="mt-4 text-xs font-semibold text-slate-400">Loading your claims...</p>
                        </div>
                    ) : displayedClaims.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 px-6 py-16 text-center dark:border-white/10 dark:bg-ink-900/40">
                            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400">
                                <PackageCheck size={32} strokeWidth={1.7} />
                            </div>
                            <h3 className="font-display mt-4 text-base font-bold text-slate-900 dark:text-white">
                                No claims found
                            </h3>
                            <p className="mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
                                {searchQuery || activeTab !== "all" || roleFilter !== "all" || selectedCategory !== "All Categories"
                                    ? "No claims match your selected filters. Try resetting your filter parameters."
                                    : "No ownership claims found in this category."}
                            </p>
                            <div className="mt-5 flex items-center gap-3">
                                {(searchQuery || activeTab !== "all" || roleFilter !== "all" || selectedCategory !== "All Categories") && (
                                    <button
                                        onClick={() => {
                                            setActiveTab("all");
                                            setRoleFilter("all");
                                            setSearchQuery("");
                                            setSelectedCategory("All Categories");
                                        }}
                                        className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                                <Link
                                    href="/reports?type=found"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#9ae600] px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-[#88cc00]"
                                >
                                    <span>Browse Found Items</span>
                                    <ArrowUpRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayedClaims.map((claim) => {
                                const statusCfg = STATUS_CONFIG[claim.status] || STATUS_CONFIG.pending;
                                const StatusIcon = statusCfg.icon;
                                const isExpanded = expandedClaimId === claim.id;
                                const hasHandover = claim.handover?.isEligible;
                                const isHandoverReady = claim.status === "approved" || claim.status === "in_handover";
                                const { isFinder, isClaimant } = getClaimRole(claim);

                                return (
                                    <div
                                        key={claim.id}
                                        id={`claim-${claim.id}`}
                                        className={`group relative overflow-hidden rounded-3xl border bg-white/95 p-5 shadow-xs transition-all duration-200 dark:bg-ink-900/90 sm:p-6 ${isHandoverReady
                                                ? "border-emerald-500/30 ring-1 ring-emerald-500/15"
                                                : "border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                            }`}
                                    >
                                        {/* Top Row: Thumbnail, Title, Badge & Quick Links */}
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex items-start gap-4">
                                                {/* Item Photo / Thumbnail */}
                                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-ink-800 sm:h-24 sm:w-24">
                                                    <img
                                                        src={claim.imageUrl}
                                                        alt={claim.itemTitle}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                    <span className="absolute bottom-1.5 left-1.5 rounded-md bg-slate-950/70 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                                                        {claim.category}
                                                    </span>
                                                </div>

                                                {/* Title and Identification details */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {/* Tracking Reference Pill with Copy Action */}
                                                        <button
                                                            onClick={() => handleCopy(claim.claimNumber, "clm")}
                                                            title="Click to copy claim number"
                                                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
                                                        >
                                                            <span>{claim.claimNumber}</span>
                                                            {copiedCode === `clm-${claim.claimNumber}` ? (
                                                                <Check size={11} className="text-emerald-500" />
                                                            ) : (
                                                                <Copy size={11} className="text-slate-400" />
                                                            )}
                                                        </button>

                                                        {/* Role Badge */}
                                                        {isFinder ? (
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300">
                                                                <ShieldCheck size={11} className="text-emerald-600 dark:text-emerald-400" />
                                                                Incoming Claim (You Found Item)
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10.5px] font-bold text-blue-700 dark:text-blue-300">
                                                                <User size={11} className="text-blue-600 dark:text-blue-400" />
                                                                Your Submitted Claim
                                                            </span>
                                                        )}

                                                        {/* Claimed Date */}
                                                        <span className="flex items-center gap-1 text-[11.5px] text-slate-400 dark:text-slate-500">
                                                            <Calendar size={12} />
                                                            <span>{claim.claimedDateFormatted}</span>
                                                        </span>
                                                    </div>

                                                    <h3 className="font-display mt-1 text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                                                        {claim.itemTitle}
                                                    </h3>

                                                    {/* Location */}
                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                        <MapPin size={13} className="shrink-0 text-slate-400" />
                                                        <span className="truncate">{claim.location}</span>
                                                    </div>

                                                    {/* Claimant Info Badge (when viewing as Finder) */}
                                                    {isFinder && claim.claimant && (
                                                        <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-1.5 text-xs text-slate-700 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-slate-200">
                                                            <img
                                                                src={claim.claimant?.avatar || "/default-avatar.png"}
                                                                alt={claim.claimant?.name || "Claimant"}
                                                                className="h-5 w-5 rounded-full object-cover ring-1 ring-indigo-400"
                                                            />
                                                            <span>
                                                                Claimed by <span className="font-bold text-slate-900 dark:text-white">{claim.claimant?.name || "Claimant"}</span>
                                                                {claim.claimant?.email ? ` (${claim.claimant.email})` : ""}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right side: Status Badge & Primary Action CTAs */}
                                            <div className="flex flex-col items-start gap-2.5 sm:items-end">
                                                {/* Status Badge */}
                                                <div
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusCfg.badgeClass}`}
                                                >
                                                    <span className={`h-2 w-2 rounded-full ${statusCfg.dotClass}`} />
                                                    <StatusIcon size={13} strokeWidth={2.4} />
                                                    <span>{claim.statusLabel || statusCfg.label}</span>
                                                </div>

                                                {/* Direct Action Hub */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* Finder Actions: If Pending -> Approve or Decline */}
                                                    {isFinder && (claim.status === "pending" || claim.status === "needs_info") && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setApproveModalClaim(claim);
                                                                    setDecisionNote("");
                                                                }}
                                                                disabled={actionInProgress === claim.id}
                                                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
                                                            >
                                                                <CheckCircle2 size={13} />
                                                                <span>Approve Claim</span>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setRejectModalClaim(claim);
                                                                    setDecisionNote("");
                                                                }}
                                                                disabled={actionInProgress === claim.id}
                                                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 disabled:opacity-50"
                                                            >
                                                                <XCircle size={13} />
                                                                <span>Decline</span>
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* If Handover is ready -> Link directly to /dashboard/handovers */}
                                                    {isHandoverReady && (
                                                        <Link
                                                            href="/dashboard/handovers"
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#9ae600] px-3.5 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-[#88cc00] shadow-xs"
                                                        >
                                                            <Handshake size={14} />
                                                            <span>Coordinate Handover</span>
                                                        </Link>
                                                    )}

                                                    {/* Direct Link to Report */}
                                                    <Link
                                                        href={`/reports/${claim.reportId}`}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-ink-800 dark:text-slate-200 dark:hover:bg-ink-700"
                                                    >
                                                        <ExternalLink size={13} />
                                                        <span>View Report</span>
                                                    </Link>

                                                    {/* Direct Link to Handover modal for claimant */}
                                                    {!isFinder && hasHandover && !isHandoverReady && (
                                                        <button
                                                            onClick={() => setHandoverModalClaim(claim)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 transition shadow-xs"
                                                        >
                                                            <Handshake size={14} />
                                                            <span>Handover Hub</span>
                                                        </button>
                                                    )}

                                                    {/* Action for Needs Info for claimant */}
                                                    {!isFinder && claim.status === "needs_info" && (
                                                        <button
                                                            onClick={() => {
                                                                setProofModalClaim(claim);
                                                                setAdditionalProofText("");
                                                            }}
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-purple-700"
                                                        >
                                                            <MessageSquare size={13} />
                                                            <span>Provide Info</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Review Status Note / Announcement Box */}
                                        {claim.reviewNotes && (
                                            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs text-slate-700 dark:border-white/5 dark:bg-white/[0.03] dark:text-slate-300">
                                                <div className="flex items-start gap-2.5">
                                                    <Info size={15} className="mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
                                                    <div className="flex-1">
                                                        <span className="font-semibold text-slate-900 dark:text-white">
                                                            Verification Note:{" "}
                                                        </span>
                                                        <span>{claim.reviewNotes}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Handover Spotlight Banner (if active handover) */}
                                        {isHandoverReady && claim.handover && (
                                            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4 dark:border-emerald-500/25">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                                                            <Key size={17} strokeWidth={2.2} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                                                Safe Handover Ready: Code {claim.handover.handoverCode}
                                                            </p>
                                                            <p className="mt-0.5 text-[11.5px] text-emerald-700/80 dark:text-emerald-400/80">
                                                                Location: <span className="font-semibold">{claim.handover.locationName}</span> • {claim.handover.timeSlot}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleCopy(claim.handover.handoverCode, "otp")}
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-white/90 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-white dark:bg-ink-900 dark:text-emerald-300"
                                                        >
                                                            <span>{claim.handover.handoverCode}</span>
                                                            {copiedCode === `otp-${claim.handover.handoverCode}` ? (
                                                                <Check size={12} className="text-emerald-500" />
                                                            ) : (
                                                                <Copy size={12} />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => setHandoverModalClaim(claim)}
                                                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                                                        >
                                                            <span>Open Instructions</span>
                                                            <ChevronRight size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Expand / Collapse Details Drawer */}
                                        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-white/5">
                                            <div className="flex items-center justify-between text-xs">
                                                <button
                                                    onClick={() => setExpandedClaimId(isExpanded ? null : claim.id)}
                                                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                >
                                                    <span>{isExpanded ? "Hide tracking timeline & proof" : "View tracking timeline & proof"}</span>
                                                    <ChevronDown
                                                        size={14}
                                                        className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                                    />
                                                </button>

                                                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                                    {/* Report Abuse Button */}
                                                    <button
                                                        onClick={() => {
                                                            setAbuseTarget({ id: claim.id, title: claim.itemTitle });
                                                            setAbuseModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-500 transition"
                                                    >
                                                        <ShieldAlert size={12} />
                                                        <span>Report concern</span>
                                                    </button>

                                                    {/* Withdraw button for pending claims */}
                                                    {claim.status === "pending" && (
                                                        <button
                                                            onClick={() => handleCancelClaim(claim.id)}
                                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                        >
                                                            Withdraw claim
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expanded Section */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                                        className="overflow-hidden pt-4"
                                                    >
                                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                                                            {/* Left: Progress Stepper / Timeline */}
                                                            <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                                                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                                                                    <Clock size={13} />
                                                                    <span>Review &amp; Handover Timeline</span>
                                                                </h4>
                                                                <div className="space-y-4">
                                                                    {claim.timeline?.map((step, idx) => (
                                                                        <div key={idx} className="relative flex items-start gap-3 pl-1">
                                                                            {/* Vertical Line */}
                                                                            {idx < claim.timeline.length - 1 && (
                                                                                <div
                                                                                    className={`absolute left-[13px] top-6 w-[2px] h-[calc(100%-8px)] ${step.completed ? "bg-emerald-500/60" : "bg-slate-200 dark:bg-white/10"
                                                                                        }`}
                                                                                />
                                                                            )}
                                                                            {/* Step Dot */}
                                                                            <div
                                                                                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${step.completed
                                                                                        ? "bg-emerald-500 text-white"
                                                                                        : step.current
                                                                                            ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20"
                                                                                            : "border border-slate-300 bg-white text-slate-400 dark:border-white/20 dark:bg-ink-800"
                                                                                    }`}
                                                                            >
                                                                                {step.completed ? <Check size={12} strokeWidth={3} /> : idx + 1}
                                                                            </div>
                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="flex items-center justify-between gap-2">
                                                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                                                        {step.title}
                                                                                    </p>
                                                                                    <span className="text-[10.5px] text-slate-400">{step.time}</span>
                                                                                </div>
                                                                                <p className="mt-0.5 text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                                                                    {step.description}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Right: Claimant Proof & Finder Contact */}
                                                            <div className="lg:col-span-5 space-y-3">
                                                                {/* Proof Details Provided */}
                                                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                                                                        <Lock size={12} />
                                                                        <span>Private Identifying Proof</span>
                                                                    </h4>
                                                                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                                                        {claim.claimantProof?.description}
                                                                    </p>
                                                                    {claim.claimantProof?.hasProofPhoto && claim.claimantProof?.proofPhotoUrl && (
                                                                        <div className="mt-2.5">
                                                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                                                Attached Evidence
                                                                            </span>
                                                                            <img
                                                                                src={claim.claimantProof.proofPhotoUrl}
                                                                                alt="Proof"
                                                                                className="mt-1 h-20 w-32 rounded-xl object-cover border border-slate-200 dark:border-white/10"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Counterpart Profile: If user is Finder, show Claimant. If Claimant, show Finder */}
                                                                {isFinder ? (
                                                                    <div className="space-y-3">
                                                                        {/* Claimant Profile Card */}
                                                                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                                                                                    <User size={13} />
                                                                                    <span>Claimant (Who Claimed This Item)</span>
                                                                                </h4>
                                                                                <span className="rounded-full bg-indigo-600/10 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                                                                    Claimant
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                <img
                                                                                    src={claim.claimant?.avatar || "/default-avatar.png"}
                                                                                    alt={claim.claimant?.name || "Claimant"}
                                                                                    className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-400 dark:ring-indigo-600"
                                                                                />
                                                                                <div className="min-w-0 flex-1">
                                                                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                                                        {claim.claimant?.name || "Claimant"}
                                                                                    </p>
                                                                                    {claim.claimant?.email && (
                                                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                                                            {claim.claimant.email}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            {claim.claimant?.phone && (
                                                                                <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                                    <Phone size={13} className="text-slate-400" />
                                                                                    <span>{claim.claimant.phone}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Finder Verification Decision Card */}
                                                                        {(claim.status === "pending" || claim.status === "needs_info") && (
                                                                            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/20">
                                                                                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-1.5">
                                                                                    <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                                                                                    <span>Finder Verification Decision</span>
                                                                                </h4>
                                                                                <p className="text-[11.5px] text-emerald-800/80 dark:text-emerald-300/80 mb-3 leading-relaxed">
                                                                                    Review the claimant&apos;s private identifying details. If they match the item you found, approve this claim to initiate the Safe Handover protocol.
                                                                                </p>
                                                                                <div className="flex items-center gap-2">
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setApproveModalClaim(claim);
                                                                                            setDecisionNote("");
                                                                                        }}
                                                                                        disabled={actionInProgress === claim.id}
                                                                                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
                                                                                    >
                                                                                        <CheckCircle2 size={13} />
                                                                                        <span>Approve Claim</span>
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setRejectModalClaim(claim);
                                                                                            setDecisionNote("");
                                                                                        }}
                                                                                        disabled={actionInProgress === claim.id}
                                                                                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 disabled:opacity-50"
                                                                                    >
                                                                                        <XCircle size={13} />
                                                                                        <span>Decline</span>
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    claim.finder && (
                                                                        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                                                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                                                                                <User size={12} />
                                                                                <span>Finder / Item Custodian</span>
                                                                            </h4>
                                                                            <div className="flex items-center gap-3">
                                                                                <img
                                                                                    src={claim.finder.avatar || "/default-avatar.png"}
                                                                                    alt={claim.finder.name || "Finder"}
                                                                                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-ink-800"
                                                                                />
                                                                                <div className="min-w-0 flex-1">
                                                                                    <div className="flex items-center gap-1.5">
                                                                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                                                            {claim.finder.name}
                                                                                        </p>
                                                                                        {claim.finder.trustScore && (
                                                                                            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                                                {claim.finder.trustScore}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                                                        {claim.finder.role || "Verified Finder"} {claim.finder.badge ? `• ${claim.finder.badge}` : ""}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            {claim.finder.phone && isHandoverReady && (
                                                                                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                                    <Phone size={13} className="text-slate-400" />
                                                                                    <span>{claim.finder.phone}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <p className="mt-12 text-center text-[11.5px] text-slate-400 dark:text-slate-600">
                        Findora Safe Handover Protocol · Claims protected by end-to-end verification OTP
                    </p>
                </div>
            </div>

            {/* 1. Safe Handover Coordination Modal                                       */}
            {handoverModalClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
                        onClick={() => setHandoverModalClaim(null)}
                    />
                    <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-ink-900 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        {/* Modal Close Button */}
                        <button
                            onClick={() => setHandoverModalClaim(null)}
                            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                            <X size={16} />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#9ae600]/20 text-[#639400] dark:text-[#9ae600]">
                                <Handshake size={20} strokeWidth={2.4} />
                            </div>
                            <div>
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    Findora Verified Handover Hub
                                </span>
                                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                                    {handoverModalClaim.itemTitle}
                                </h3>
                            </div>
                        </div>

                        {/* Handover Security Code Box */}
                        <div className="my-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent p-5 text-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                Your 6-Character Exchange Code
                            </span>
                            <div className="my-2 flex items-center justify-center gap-3">
                                <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-slate-900 dark:text-white">
                                    {handoverModalClaim.handover?.handoverCode || "FP-READY"}
                                </span>
                                <button
                                    onClick={() =>
                                        handleCopy(handoverModalClaim.handover?.handoverCode || "FP-READY", "otp-modal")
                                    }
                                    className="rounded-xl border border-emerald-500/30 bg-white/90 p-2 text-emerald-700 hover:bg-white dark:bg-ink-800 dark:text-emerald-300"
                                >
                                    {copiedCode === `otp-modal-${handoverModalClaim.handover?.handoverCode}` ? (
                                        <Check size={16} className="text-emerald-500" />
                                    ) : (
                                        <Copy size={16} />
                                    )}
                                </button>
                            </div>
                            <p className="text-[11.5px] text-emerald-700/80 dark:text-emerald-300/80">
                                Show this code in person to the finder after you inspect your item. Do not send this code remotely.
                            </p>
                        </div>

                        {/* Designated Safe Meeting Location */}
                        <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="mt-0.5 shrink-0 text-rose-500" />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                        Designated Safe Meeting Spot
                                    </h4>
                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                        {handoverModalClaim.handover?.locationName}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {handoverModalClaim.handover?.address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60 dark:border-white/5">
                                <Calendar size={18} className="mt-0.5 shrink-0 text-indigo-500" />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                        Scheduled Time / Operating Hours
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                        {handoverModalClaim.handover?.timeSlot}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Handover Safety Checklist */}
                        <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 dark:border-white/5 dark:bg-ink-800/50">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                                Handover Safety Checklist
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                    <span>Meet only in well-lit public areas (e.g. cafe counter, metro security booth).</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                    <span>Physically inspect serial numbers, condition, and contents before confirming.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                    <span>Never send advance funds or wire transfers for recovery fees.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Modal Actions */}
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                            <Link
                                href={`/reports/${handoverModalClaim.reportId}`}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                                <ExternalLink size={13} />
                                <span>View Original Listing</span>
                            </Link>

                            <div className="flex items-center gap-2">
                                {handoverModalClaim.status !== "reunited" && (
                                    <button
                                        onClick={() => handleMarkReunited(handoverModalClaim.id)}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-sm"
                                    >
                                        <PackageCheck size={15} />
                                        <span>Item Received &amp; Reunited</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setHandoverModalClaim(null)}
                                    className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Additional Proof Submission Modal                                      */}
            {proofModalClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
                        onClick={() => setProofModalClaim(null)}
                    />
                    <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-ink-900 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setProofModalClaim(null)}
                            className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                                <HelpCircle size={20} strokeWidth={2.3} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                    Verification Response
                                </span>
                                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                                    Provide Additional Proof
                                </h3>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                            Finder for <span className="font-semibold text-slate-800 dark:text-slate-200">{proofModalClaim.itemTitle}</span> requested more distinguishing details to approve ownership.
                        </p>

                        {proofModalClaim.reviewNotes && (
                            <div className="mb-4 rounded-xl border border-purple-200/60 bg-purple-50/50 p-3 text-xs text-purple-900 dark:border-purple-800/40 dark:bg-purple-950/20 dark:text-purple-200">
                                <p className="font-bold">Finder Note:</p>
                                <p className="mt-0.5">{proofModalClaim.reviewNotes}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmitProof} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Your Answer / Distinguishing Details
                                </label>
                                <textarea
                                    rows={4}
                                    required
                                    value={additionalProofText}
                                    onChange={(e) => setAdditionalProofText(e.target.value)}
                                    placeholder="e.g. Alarm time is set to 07:15 AM, clasp has engraved number 84..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white dark:border-white/10 dark:bg-ink-800 dark:text-white dark:focus:border-purple-400 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setProofModalClaim(null)}
                                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingProof}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {isSubmittingProof && <RefreshCw size={13} className="animate-spin" />}
                                    <span>Submit Details</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. Report Abuse / Concern Modal Integration                               */}
            <ReportAbuseModal
                isOpen={abuseModalOpen}
                onClose={() => setAbuseModalOpen(false)}
                targetType="claim"
                targetId={abuseTarget.id}
                targetName={abuseTarget.title}
                onSuccess={() => {
                    setAbuseModalOpen(false);
                    toast.success("Concern logged. Our trust & safety team has been alerted.");
                }}
            />

            {/* 4. Finder Approve Claim Modal */}
            {approveModalClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
                        onClick={() => !actionInProgress && setApproveModalClaim(null)}
                    />
                    <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-ink-900 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => !actionInProgress && setApproveModalClaim(null)}
                            className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={22} strokeWidth={2.3} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    Finder Verification
                                </span>
                                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                                    Approve Ownership Claim
                                </h3>
                            </div>
                        </div>

                        <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Item</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                                {approveModalClaim.itemTitle}
                            </p>
                            <div className="mt-3 flex items-center gap-2.5 pt-3 border-t border-slate-200/60 dark:border-white/5">
                                <img
                                    src={approveModalClaim.claimant?.avatar || "/default-avatar.png"}
                                    alt={approveModalClaim.claimant?.name || "Claimant"}
                                    className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        Claimant: {approveModalClaim.claimant?.name || "Claimant"}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                        {approveModalClaim.claimant?.email || "Submitted private proof"}
                                    </p>
                                </div>
                            </div>
                            {approveModalClaim.claimantProof?.description && (
                                <div className="mt-3 rounded-xl bg-white p-3 text-xs text-slate-700 dark:bg-ink-800 dark:text-slate-300 border border-slate-100 dark:border-white/5">
                                    <span className="font-bold text-slate-900 dark:text-white">Submitted Proof: </span>
                                    <span>{approveModalClaim.claimantProof.description}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Verification Note / Handover Advice (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={decisionNote}
                                    onChange={(e) => setDecisionNote(e.target.value)}
                                    placeholder="e.g. Details matched engraved initials. Ready to meet at designated location."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-white/10 dark:bg-ink-800 dark:text-white dark:focus:border-emerald-400 resize-none"
                                />
                            </div>

                            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                Approving will transition the pipeline to the <strong>Safe Handover</strong> stage and generate a verified handover proposal with secure meeting spots.
                            </p>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    disabled={actionInProgress === approveModalClaim.id}
                                    onClick={() => setApproveModalClaim(null)}
                                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmApprove}
                                    disabled={actionInProgress === approveModalClaim.id}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {actionInProgress === approveModalClaim.id ? (
                                        <RefreshCw size={13} className="animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={14} />
                                    )}
                                    <span>Confirm Approval</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Finder Decline Claim Modal */}
            {rejectModalClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
                        onClick={() => !actionInProgress && setRejectModalClaim(null)}
                    />
                    <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-ink-900 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => !actionInProgress && setRejectModalClaim(null)}
                            className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                                <XCircle size={22} strokeWidth={2.3} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                    Finder Verification
                                </span>
                                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                                    Decline Ownership Claim
                                </h3>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                            Are you sure you want to decline the claim for <span className="font-semibold text-slate-800 dark:text-slate-200">{rejectModalClaim.itemTitle}</span>?
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Reason for Declining (Sent to Claimant)
                                </label>
                                <textarea
                                    rows={3}
                                    value={decisionNote}
                                    onChange={(e) => setDecisionNote(e.target.value)}
                                    placeholder="e.g. Identifying marks or engravings described did not match the physical item."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none transition focus:border-rose-500 focus:bg-white dark:border-white/10 dark:bg-ink-800 dark:text-white dark:focus:border-rose-400 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    disabled={actionInProgress === rejectModalClaim.id}
                                    onClick={() => setRejectModalClaim(null)}
                                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmReject}
                                    disabled={actionInProgress === rejectModalClaim.id}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                                >
                                    {actionInProgress === rejectModalClaim.id ? (
                                        <RefreshCw size={13} className="animate-spin" />
                                    ) : (
                                        <XCircle size={14} />
                                    )}
                                    <span>Decline Claim</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ClaimantClaimsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-ink-950">
                    <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
                </div>
            }
        >
            <ClaimantClaimsContent />
        </Suspense>
    );
}
