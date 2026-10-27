"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";

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

function Stars({ rating, className = "w-4 h-4" }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${
            n <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-300 dark:text-slate-600"
          }`}
        />
      ))}
    </div>
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

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id),
    enabled: Boolean(id),
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Reviews{reviews.length > 0 && ` (${reviews.length})`}
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <Stars rating={averageRating} />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {reviews.map((review) => {
                const created = safeDate(review.createdAt);
                return (
                  <li key={review.id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                    <Avatar
                      src={review.reviewer?.image}
                      name={review.reviewer?.name}
                      className="h-10 w-10 rounded-xl shrink-0 text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {review.reviewer?.name || "Findora Member"}
                        </p>
                        {created && (
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNowStrict(created, { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        <Stars rating={Number(review.rating) || 0} className="w-3.5 h-3.5" />
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
        </section>
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