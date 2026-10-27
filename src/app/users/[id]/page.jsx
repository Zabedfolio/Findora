"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  format,
  isValid,
  formatDistanceToNowStrict,
} from "date-fns";
import {
  ArrowLeft,
  ShieldCheck,
  BadgeCheck,
  Trophy,
  Zap,
  HeartHandshake,
  Star,
  CalendarDays,
  PackageCheck,
  FileText,
  MessageSquareText,
  UserX,
  MapPin,
  X,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";
import StarRating from "@/components/reviews/StarRating";
import ReviewForm from "@/components/reviews/ReviewForm";
import useAuth from "@/hooks/useAuth";
import toast from "@/lib/toast";
import { checkReviewEligibility } from "@/services/handoverService";
import { submitReview } from "@/services/reviewService";

/* -------------------------------------------------------------------------- */
/*  Data layer: Fetch user profile directly from live backend database        */
/* -------------------------------------------------------------------------- */

async function getUserById(id) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${apiBase}/users/${id}`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (e) {
    console.error("Backend API fetch error for user profile:", e.message);
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const BADGE_META = {
  verified: {
    label: "Verified ID",
    description: "Identity confirmed by Findora",
    icon: BadgeCheck,
    tone: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800",
  },
  top_finder: {
    label: "Top Finder",
    description: "Returned 10 or more items",
    icon: Trophy,
    tone: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800",
  },
  fast_responder: {
    label: "Fast Responder",
    description: "Usually replies within hours",
    icon: Zap,
    tone: "text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/40 dark:border-sky-800",
  },
  community_hero: {
    label: "Community Hero",
    description: "Highly rated by the community",
    icon: HeartHandshake,
    tone: "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800",
  },
};

const safeDate = (value) => {
  const d = value ? new Date(value) : null;
  return d && isValid(d) ? d : null;
};

function Avatar({ src, name, className = "" }) {
  const [failed, setFailed] = useState(false);
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  if (!src?.trim() || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-200 font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200 ${className}`}
        aria-hidden="true"
      >
        {initial}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name || "User"}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

function RecoveryRing({ percent }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="9"
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-[#72ad00] dark:stroke-[#9ae600] transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{percent}%</span>
      </div>
    </div>
  );
}

const cardClass =
  "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm";

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function ProfileContent() {
  const params = useParams();
  const id = params?.id;
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showReviewModal, setShowReviewModal] = useState(false);

  const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId;

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id),
    enabled: Boolean(id),
  });

  const { data: eligibilityData, refetch: refetchEligibility } = useQuery({
    queryKey: ["review-eligibility", id, currentUserId],
    queryFn: () => checkReviewEligibility(id, currentUser),
    enabled: Boolean(id && currentUserId && id !== currentUserId),
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <Loader size="xl" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <EmptyState
            icon={UserX}
            title="User not found"
            description="This profile does not exist or may have been removed."
            actionLabel="Back to browse"
            actionHref="/reports"
          />
        </div>
      </div>
    );
  }

  const stats = user.stats || {};
  const reportsPosted = Number(stats.reportsPosted) || 0;
  const itemsReturned = Number(stats.itemsReturned) || 0;
  const recoveryRate =
    reportsPosted > 0 ? Math.min(100, Math.round((itemsReturned / reportsPosted) * 100)) : 0;

  const reviews = Array.isArray(user.reviews) ? user.reviews : [];
  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length
    : 0;

  const joined = safeDate(user.memberSince);
  const memberDuration = joined ? formatDistanceToNowStrict(joined) : "";
  const memberSinceLabel = joined ? format(joined, "MMMM yyyy") : "";

  const badges = (user.badges || []).map((key) => ({ key, ...BADGE_META[key] })).filter((b) => b.label);

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse Reports</span>
        </Link>

        {/* Header */}
        <section className={`${cardClass} p-6 sm:p-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <Avatar
              src={user.image}
              name={user.name}
              className="h-24 w-24 rounded-3xl text-3xl ring-2 ring-slate-200 dark:ring-slate-700 shrink-0"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white truncate font-heading">
                  {user.name || "Findora Member"}
                </h1>
                {user.badges?.includes("verified") && (
                  <ShieldCheck
                    className="w-5 h-5 text-[#72ad00] dark:text-[#9ae600] shrink-0"
                    aria-label="Verified member"
                  />
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                {joined && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    Member for {memberDuration} · since {memberSinceLabel}
                  </span>
                )}
                {user.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {user.location}
                  </span>
                )}
              </div>

              {user.bio && (
                <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${cardClass} p-6 flex items-center gap-5 md:col-span-1`}>
            <RecoveryRing percent={recoveryRate} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recovery rate
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {itemsReturned} of {reportsPosted} reports ended with the item returned.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: PackageCheck, label: "Items returned", value: itemsReturned },
              { icon: FileText, label: "Reports posted", value: reportsPosted },
              {
                icon: Star,
                label: "Average rating",
                value: reviews.length ? averageRating.toFixed(1) : "—",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className={`${cardClass} p-6 flex flex-col justify-center`}>
                <Icon className="w-5 h-5 text-[#72ad00] dark:text-[#9ae600] mb-3" />
                <p className="text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust badges */}
        <section className={`${cardClass} p-6 sm:p-8`}>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white mb-4">Trust badges</h2>
          {badges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map(({ key, label, description, icon: Icon, tone }) => (
                <div
                  key={key}
                  className={`flex items-center gap-3 rounded-2xl border p-4 ${tone}`}
                >
                  <Icon className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">{label}</p>
                    <p className="text-xs opacity-80">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No badges earned yet. Badges appear as this member helps return items.
            </p>
          )}
        </section>

        {/* Reviews */}
        <section className={`${cardClass} p-6 sm:p-8`}>
          {/* Eligibility Banner for Authenticated Receivers with Completed Unreviewed Handover */}
          {eligibilityData?.eligible && eligibilityData?.handover && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/40 p-4 sm:p-5 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 shrink-0">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-100">
                      You had an item returned by {user.name}!
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Your handover for &ldquo;{eligibilityData.handover.itemTitle || "Item"}&rdquo; was mutually confirmed. You are authorized to leave a verified review.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#72ad00] hover:bg-[#629400] text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-sm transition-colors shrink-0"
                >
                  <Star className="w-4 h-4 fill-white" />
                  Rate & Review Finder
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Reviews{reviews.length > 0 && ` (${reviews.length})`}
            </h2>
            {reviews.length > 0 && (
              <StarRating
                value={averageRating}
                readOnly
                variant="badge"
                count={reviews.length}
              />
            )}
          </div>

          {reviews.length > 0 ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {reviews.map((review) => {
                const created = safeDate(review.createdAt);
                const isVerified = review.isVerifiedReturn || review.handoverId;
                return (
                  <li key={review.id || review._id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                    <Avatar
                      src={review.reviewer?.avatar || review.reviewer?.image}
                      name={review.reviewer?.name}
                      className="h-10 w-10 rounded-xl shrink-0 text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {review.reviewer?.name || "Findora Member"}
                          </p>
                          {isVerified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30">
                              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              Verified Return
                            </span>
                          )}
                        </div>
                        {created && (
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNowStrict(created, { addSuffix: true })}
                          </span>
                        )}
                      </div>

                      {review.targetItem?.title && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Returned: <span className="font-medium text-slate-700 dark:text-slate-300">{review.targetItem.title}</span>
                        </p>
                      )}

                      <div className="mt-1.5">
                        <StarRating value={Number(review.rating) || 5} readOnly size="xs" />
                      </div>

                      {review.comment && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={MessageSquareText}
              title="No reviews yet"
              description="Reviews from people this member has helped will appear here."
              className="border-0 shadow-none"
            />
          )}

          {/* Verification Policy Tagline */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Findora Trust Pipeline: Only confirmed item receivers from dual-verified handovers can leave reviews.</span>
          </div>
        </section>

        {/* Review Form Modal */}
        {showReviewModal && eligibilityData?.handover && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <ReviewForm
                reviewee={{
                  _id: user.id || user._id,
                  name: user.name,
                  avatar: user.image,
                  role: "finder",
                }}
                reportId={eligibilityData.handover.reportId}
                handoverId={eligibilityData.handover._id || eligibilityData.handover.id}
                onSubmit={async ({ handoverId, rating, comment }) => {
                  try {
                    await submitReview({
                      handoverId,
                      reviewer: {
                        userId: currentUser?._id || currentUser?.id || currentUser?.userId,
                        name: currentUser?.name,
                        email: currentUser?.email,
                        avatar: currentUser?.image || currentUser?.avatar,
                        role: "owner",
                      },
                      targetUser: {
                        userId: user.id || user._id,
                        name: user.name,
                        email: user.email,
                      },
                      targetItem: {
                        itemId: eligibilityData.handover.reportId,
                        title: eligibilityData.handover.itemTitle,
                      },
                      rating,
                      comment,
                    });
                    toast.success("Thank you! Your verified review has been submitted.");
                    setShowReviewModal(false);
                    queryClient.invalidateQueries({ queryKey: ["user", id] });
                    refetchEligibility();
                  } catch (err) {
                    toast.error(err.message || "Could not submit review.");
                    throw err;
                  }
                }}
                onSuccess={() => {
                  setShowReviewModal(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center py-12">
          <Loader size="xl" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}