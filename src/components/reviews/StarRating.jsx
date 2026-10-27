"use client";

import React, { useState, useEffect, useId, useMemo } from "react";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { fetchUserRatingStats, submitReview } from "@/services/reviewService";

/**
 * Aesthetic presets for star sizes
 */
const SIZE_MAP = {
  xs: { star: 14, text: "text-xs", gap: "gap-0.5", badge: "px-2 py-0.5 text-xs" },
  sm: { star: 16, text: "text-xs", gap: "gap-1", badge: "px-2.5 py-0.5 text-xs" },
  md: { star: 20, text: "text-sm", gap: "gap-1", badge: "px-3 py-1 text-xs" },
  lg: { star: 26, text: "text-base", gap: "gap-1.5", badge: "px-3.5 py-1 text-sm" },
  xl: { star: 34, text: "text-lg", gap: "gap-2", badge: "px-4 py-1.5 text-base" },
};

/**
 * Descriptive label for each star rank (1–5)
 */
const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

/**
 * Reusable StarRating component supporting:
 * 1. Interactive Selection (1–5 stars with hover preview, micro-animations, keyboard accessibility)
 * 2. Read-Only Aggregate Rating Display (e.g. 4.9 ★ with fractional star fill and review count)
 * 3. Live Backend & MongoDB Database Integration (fetching live user ratings or submitting ratings)
 *
 * @param {Object} props
 * @param {number} [props.value=0] - Current rating value (supports decimals for read-only, e.g. 4.9)
 * @param {Function} [props.onChange] - Callback when rating changes (interactive mode)
 * @param {number} [props.max=5] - Maximum number of stars (default: 5)
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|number} [props.size='md'] - Star size preset or pixel number
 * @param {boolean} [props.readOnly=false] - When true, disables selection and enables fractional star rendering
 * @param {boolean} [props.showValue=false] - Display numeric rating next to stars (e.g. "4.9")
 * @param {number} [props.count] - Review count to display, e.g. "(24)"
 * @param {boolean} [props.showLabel=false] - Display descriptive text label on hover (e.g. "Very Good")
 * @param {'standard'|'badge'|'compact'} [props.variant='standard'] - Display style
 * @param {string} [props.targetUserId] - Backend user ID to fetch live database stats for or submit ratings to
 * @param {boolean} [props.fetchLiveAggregate=false] - When true, automatically fetches live rating from MongoDB
 * @param {boolean} [props.allowDirectSubmit=false] - When true, submitting an interactive rating posts directly to backend
 * @param {Object} [props.currentUser] - Authenticated user info when allowDirectSubmit is enabled
 * @param {string} [props.handoverId] - Optional handover ID linked to the rating
 * @param {string} [props.className=''] - Additional container classes
 */
export default function StarRating({
  value = 0,
  onChange,
  max = 5,
  size = "md",
  readOnly = false,
  showValue = false,
  count,
  showLabel = false,
  variant = "standard",
  targetUserId,
  fetchLiveAggregate = false,
  allowDirectSubmit = false,
  currentUser,
  handoverId,
  className = "",
}) {
  const clipId = useId();

  // Internal interactive hover and selection state
  const [hoverRating, setHoverRating] = useState(0);
  const [internalRating, setInternalRating] = useState(value);

  // Live database state (when fetchLiveAggregate or allowDirectSubmit is enabled)
  const [liveRating, setLiveRating] = useState(value);
  const [liveCount, setLiveCount] = useState(count ?? 0);
  const [loadingLive, setLoadingLive] = useState(fetchLiveAggregate && Boolean(targetUserId));
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Sync internal rating if value prop changes externally
  useEffect(() => {
    setInternalRating(value);
  }, [value]);

  // Sync count if count prop changes
  useEffect(() => {
    if (count !== undefined) {
      setLiveCount(count);
    }
  }, [count]);

  // Fetch live aggregate rating from MongoDB backend if requested
  useEffect(() => {
    if (!fetchLiveAggregate || !targetUserId) return;

    let isMounted = true;
    async function loadLiveStats() {
      try {
        setLoadingLive(true);
        const stats = await fetchUserRatingStats(targetUserId);
        if (isMounted && stats) {
          setLiveRating(stats.averageRating);
          setLiveCount(stats.totalReviews);
        }
      } catch (err) {
        console.warn("Could not fetch live rating stats from MongoDB:", err);
      } finally {
        if (isMounted) setLoadingLive(false);
      }
    }

    loadLiveStats();
    return () => {
      isMounted = false;
    };
  }, [fetchLiveAggregate, targetUserId]);

  // Determine interactive mode
  const isInteractive = !readOnly && (typeof onChange === "function" || allowDirectSubmit);

  // Effective display rating
  const effectiveRating = isInteractive
    ? (hoverRating > 0 ? hoverRating : internalRating)
    : (fetchLiveAggregate ? liveRating : (value || 0));

  const effectiveCount = fetchLiveAggregate ? liveCount : count;

  // Resolve star size in pixels
  const resolvedSize = typeof size === "number" ? size : (SIZE_MAP[size]?.star || 20);
  const sizeConfig = SIZE_MAP[typeof size === "string" ? size : "md"] || SIZE_MAP.md;

  // Star list 1..max
  const starArray = useMemo(() => Array.from({ length: max }, (_, i) => i + 1), [max]);

  // Handle star selection
  const handleSelect = async (selectedRank) => {
    if (!isInteractive || submittingRating) return;

    setInternalRating(selectedRank);
    if (onChange) {
      onChange(selectedRank);
    }

    // Direct database submission if configured
    if (allowDirectSubmit && targetUserId && currentUser) {
      try {
        setSubmittingRating(true);
        await submitReview({
          reviewer: {
            userId: currentUser.id || currentUser._id || "usr_anonymous",
            name: currentUser.name || "Community Member",
            email: currentUser.email || "",
            avatar: currentUser.image || "/default-avatar.png",
            role: currentUser.role || "Member",
          },
          targetUser: {
            userId: targetUserId,
          },
          handoverId: handoverId || null,
          rating: selectedRank,
          comment: `Rated ${selectedRank} out of 5 stars for verified return collaboration.`,
        });

        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);

        // Refresh stats
        if (fetchLiveAggregate) {
          const updated = await fetchUserRatingStats(targetUserId);
          setLiveRating(updated.averageRating);
          setLiveCount(updated.totalReviews);
        }
      } catch (err) {
        console.error("Direct rating submission failed:", err);
      } finally {
        setSubmittingRating(false);
      }
    }
  };

  // Keyboard navigation for interactive star picker
  const handleKeyDown = (e) => {
    if (!isInteractive) return;

    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(max, (internalRating || 0) + 1);
      handleSelect(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = Math.max(1, (internalRating || 1) - 1);
      handleSelect(prev);
    } else if (e.key === "Home") {
      e.preventDefault();
      handleSelect(1);
    } else if (e.key === "End") {
      e.preventDefault();
      handleSelect(max);
    }
  };

  // ---------------------------------------------------------------------------
  // Variant: BADGE (e.g. "4.9 ★" pill display)
  // ---------------------------------------------------------------------------
  if (variant === "badge") {
    const formattedRating = Number(effectiveRating).toFixed(1);
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full font-bold transition-all shadow-xs ${
          sizeConfig.badge
        } bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 ${className}`}
        role="status"
        aria-label={`Aggregate rating: ${formattedRating} out of 5 stars`}
      >
        <Star size={resolvedSize * 0.85} className="fill-amber-400 text-amber-400 shrink-0" />
        <span className="font-mono tracking-tight">{formattedRating}</span>
        {typeof effectiveCount === "number" && (
          <span className="text-amber-600/70 dark:text-amber-400/70 font-normal">
            ({effectiveCount})
          </span>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant: STANDARD / COMPACT
  // ---------------------------------------------------------------------------
  return (
    <div className={`inline-flex flex-col gap-1.5 ${className}`}>
      <div className={`inline-flex items-center ${sizeConfig.gap}`}>
        {/* Interactive Mode */}
        {isInteractive ? (
          <div
            role="radiogroup"
            aria-label="Rating selection"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseLeave={() => setHoverRating(0)}
            className="flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-lg p-0.5"
          >
            {starArray.map((rank) => {
              const isFilled = rank <= effectiveRating;
              const isHovered = rank <= hoverRating;

              return (
                <button
                  key={rank}
                  type="button"
                  role="radio"
                  aria-checked={internalRating === rank}
                  aria-label={`${rank} star${rank > 1 ? "s" : ""}: ${RATING_LABELS[rank]}`}
                  onClick={() => handleSelect(rank)}
                  onMouseEnter={() => setHoverRating(rank)}
                  className="group relative cursor-pointer p-0.5 transition-transform duration-150 active:scale-90 hover:scale-115 focus:outline-none"
                  disabled={submittingRating}
                >
                  <Star
                    size={resolvedSize}
                    className={`transition-all duration-200 ${
                      isFilled
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.45)]"
                        : "fill-transparent text-slate-300 dark:text-slate-700 hover:text-amber-300/80"
                    }`}
                  />
                  {/* Subtle active pulse halo on hover */}
                  {isHovered && (
                    <span className="absolute inset-0 rounded-full bg-amber-400/10 animate-ping pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          // Read-Only Display Mode (with precision fractional star filling)
          <div
            className="flex items-center gap-0.5"
            role="img"
            aria-label={`Rated ${Number(effectiveRating).toFixed(1)} out of ${max} stars`}
          >
            {starArray.map((rank) => {
              // Calculate fill fraction (0.0 to 1.0) for this star
              const fillFraction = Math.max(0, Math.min(1, effectiveRating - (rank - 1)));
              const fillPercentage = (fillFraction * 100).toFixed(1);
              const uniqueClip = `${clipId}-star-${rank}`;

              return (
                <span
                  key={rank}
                  className="relative inline-block shrink-0 select-none"
                  style={{ width: resolvedSize, height: resolvedSize }}
                >
                  {/* Empty star background */}
                  <Star
                    size={resolvedSize}
                    className="absolute inset-0 fill-slate-200 dark:fill-slate-800 text-slate-300 dark:text-slate-700"
                  />

                  {/* Partially/Fully filled star layer */}
                  {fillFraction > 0 && (
                    <span
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${fillPercentage}%` }}
                    >
                      <Star
                        size={resolvedSize}
                        className="fill-amber-400 text-amber-400 drop-shadow-[0_1px_4px_rgba(251,191,36,0.3)] shrink-0"
                      />
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Loading Spinner for Live Queries */}
        {loadingLive && (
          <Loader2 size={resolvedSize * 0.75} className="animate-spin text-amber-500/70 ml-1" />
        )}

        {/* Numeric Rating Display (e.g., 4.9 ★) */}
        {(showValue || variant === "compact") && (
          <div className="inline-flex items-center gap-1 ml-1.5 font-bold">
            <span className={`${sizeConfig.text} text-slate-900 dark:text-white font-mono`}>
              {Number(effectiveRating).toFixed(1)}
            </span>
            <span className="text-amber-500 dark:text-amber-400 text-xs">★</span>
            {typeof effectiveCount === "number" && (
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-0.5">
                ({effectiveCount})
              </span>
            )}
          </div>
        )}

        {/* Direct Submission Status Indicator */}
        {submittingRating && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 ml-2 animate-pulse">
            <Loader2 size={12} className="animate-spin" />
            <span>Saving...</span>
          </span>
        )}
        {submitSuccess && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 ml-2">
            <CheckCircle2 size={13} />
            <span>Rating saved!</span>
          </span>
        )}
      </div>

      {/* Interactive Helper Label ("Poor", "Fair", "Good", "Very Good", "Excellent") */}
      {isInteractive && showLabel && (
        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 h-4 transition-all">
          {effectiveRating > 0 ? RATING_LABELS[effectiveRating] : "Select your rating"}
        </p>
      )}
    </div>
  );
}
