/**
 * Review & Rating Service: Connects to live MongoDB backend API
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Fetch reviews targeting a specific user (with aggregate stats)
 * @param {string} targetUserId
 * @param {Object} [options]
 * @returns {Promise<{ reviews: Array, averageRating: number, totalCount: number, counts: Object }>}
 */
export async function fetchReviewsByTargetUser(targetUserId, options = {}) {
  if (!targetUserId) {
    return { reviews: [], averageRating: 5.0, totalCount: 0, counts: { all: 0 } };
  }

  const { page = 1, limit = 20, status = "published" } = options;

  try {
    const params = new URLSearchParams({
      targetUserId,
      page: String(page),
      limit: String(limit),
      status,
    });

    const res = await fetch(`${API_BASE}/reviews?${params.toString()}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      const rawReviews = Array.isArray(json?.data) ? json.data : [];
      return {
        reviews: rawReviews,
        averageRating: typeof json.averageRating === "number" ? json.averageRating : 5.0,
        totalCount: json.totalCount ?? rawReviews.length,
        counts: json.counts || { all: rawReviews.length },
      };
    }
  } catch (err) {
    console.warn("Could not fetch user reviews from backend:", err.message);
  }

  return { reviews: [], averageRating: 5.0, totalCount: 0, counts: { all: 0 } };
}

/**
 * Fetch user rating stats (average, total count, distribution)
 * @param {string} targetUserId
 * @returns {Promise<{ averageRating: number, totalReviews: number, distribution: Record<number, number> }>}
 */
export async function fetchUserRatingStats(targetUserId) {
  if (!targetUserId) {
    return { averageRating: 5.0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  try {
    const { reviews, averageRating, totalCount } = await fetchReviewsByTargetUser(targetUserId, { limit: 100 });
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      distribution[rounded] = (distribution[rounded] || 0) + 1;
    });

    return {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: totalCount,
      distribution,
    };
  } catch (err) {
    console.warn("Could not compute rating stats:", err.message);
    return { averageRating: 5.0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }
}

/**
 * Submit a new review and rating to the backend database
 * @param {Object} reviewData
 * @param {Object} reviewData.reviewer - { userId, name, email, avatar, role }
 * @param {Object} [reviewData.targetUser] - { userId, name, email }
 * @param {Object} [reviewData.targetItem] - { itemId, title }
 * @param {string} [reviewData.handoverId]
 * @param {number} reviewData.rating - 1 to 5
 * @param {string} reviewData.comment
 * @returns {Promise<{ success: boolean, data?: Object, message?: string }>}
 */
export async function submitReview(reviewData) {
  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to submit review");
    }

    return { success: true, data: json.data, message: json.message };
  } catch (err) {
    console.error("Submit review error:", err);
    throw err;
  }
}

/**
 * Report a review for moderation
 * @param {string} reviewId
 * @param {string} reason
 */
export async function reportReview(reviewId, reason) {
  try {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    return await res.json();
  } catch (err) {
    console.error("Report review error:", err);
    throw err;
  }
}
