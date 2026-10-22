import { demoClaims } from "@/demo-data";

const LOCAL_STORAGE_KEY = "findora_user_claims_store";

/**
 * Helper to retrieve stored claims or initialize from demo claims
 */
function getStoredClaims() {
  if (typeof window === "undefined") {
    return [...demoClaims];
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoClaims));
      return [...demoClaims];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...demoClaims];
  } catch (err) {
    console.warn("Could not read local claims store:", err);
    return [...demoClaims];
  }
}

/**
 * Helper to persist claims to localStorage
 */
function saveStoredClaims(claims) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(claims));
  } catch (err) {
    console.warn("Could not save to local claims store:", err);
  }
}

/**
 * Fetch all claims submitted by the current authenticated user/claimant.
 *
 * Tries the backend (NEXT_PUBLIC_API_URL/claims/mine) and falls back to
 * demo data, the same way reportService.js does.
 *
 * @param {Object} [params]
 * @param {string} [params.status='all'] - 'all' | 'approved' | 'in_handover' | 'pending' | 'needs_info' | 'reunited' | 'rejected'
 * @param {string} [params.q=''] - Search query by item title, claimNumber, location, finder name
 * @param {string} [params.category] - Category filter
 * @param {'newest' | 'oldest'} [params.sort='newest']
 * @returns {Promise<{ claims: Array, counts: Object }>}
 */
export async function getMyClaims(params = {}) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });
      const response = await fetch(`${apiBase}/claims/mine?${searchParams.toString()}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn("Backend claims API unreachable, falling back to local demo claims:", e.message);
    }
  }

  // Fallback to local demo dataset
  const { status = "all", q = "", category = "", sort = "newest" } = params;
  let allClaims = getStoredClaims();

  // Pre-calculate status counts for tabs
  const counts = {
    all: allClaims.length,
    in_handover: allClaims.filter(
      (c) => c.status === "in_handover" || c.status === "approved"
    ).length,
    pending: allClaims.filter((c) => c.status === "pending").length,
    needs_info: allClaims.filter((c) => c.status === "needs_info").length,
    reunited: allClaims.filter((c) => c.status === "reunited").length,
    rejected: allClaims.filter((c) => c.status === "rejected").length,
  };

  // 1. Status Filter
  if (status && status !== "all") {
    if (status === "actionable") {
      allClaims = allClaims.filter(
        (c) => c.status === "approved" || c.status === "in_handover" || c.status === "needs_info"
      );
    } else {
      allClaims = allClaims.filter(
        (c) => c.status?.toLowerCase() === status.toLowerCase()
      );
    }
  }

  // 2. Category Filter
  if (category && category !== "All Categories") {
    allClaims = allClaims.filter(
      (c) => c.category?.toLowerCase() === category.toLowerCase()
    );
  }

  // 3. Search query filter
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    allClaims = allClaims.filter(
      (c) =>
        c.itemTitle?.toLowerCase().includes(term) ||
        c.claimNumber?.toLowerCase().includes(term) ||
        c.location?.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term) ||
        c.finder?.name?.toLowerCase().includes(term)
    );
  }

  // 4. Sorting
  allClaims.sort((a, b) => {
    const dateA = new Date(a.claimedAt).getTime();
    const dateB = new Date(b.claimedAt).getTime();
    return sort === "oldest" ? dateA - dateB : dateB - dateA;
  });

  return {
    claims: allClaims,
    counts,
  };
}

/**
 * Fetch a single claim by claim ID or claim number
 */
export async function getClaimById(id) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const response = await fetch(`${apiBase}/claims/${id}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend API unreachable, using local claim:", e.message);
    }
  }

  const allClaims = getStoredClaims();
  return allClaims.find((c) => c.id === id || c.claimNumber === id) || null;
}

/**
 * Mark a claim as successfully reunited / completed
 */
export async function markClaimReunited(id) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/claims/${id}/reunited`, { method: "POST" });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API unreachable, updating local claim store:", e.message);
    }
  }

  const all = getStoredClaims();
  const index = all.findIndex((c) => c.id === id);
  if (index !== -1) {
    const updated = {
      ...all[index],
      status: "reunited",
      statusLabel: "Reunited & Completed",
      statusDescription: "Ownership was fully verified and the item was successfully handed over in person.",
      handover: {
        ...all[index].handover,
        status: "completed",
        completedAt: new Date().toISOString(),
      },
      timeline: [
        ...all[index].timeline.map((t) => ({ ...t, current: false })),
        {
          step: all[index].timeline.length + 1,
          title: "Reunited & Confirmed",
          time: "Just now",
          description: "Both parties verified exchange via security code.",
          completed: true,
          current: true,
        },
      ],
    };
    all[index] = updated;
    saveStoredClaims(all);
    return updated;
  }
  return null;
}

/**
 * Submit additional verification proof requested by finder
 */
export async function submitAdditionalProof(id, proofText) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/claims/${id}/provide-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofText }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API unreachable, updating local claim store:", e.message);
    }
  }

  const all = getStoredClaims();
  const index = all.findIndex((c) => c.id === id);
  if (index !== -1) {
    const updated = {
      ...all[index],
      status: "pending",
      statusLabel: "Under Review",
      statusDescription: "Additional details submitted! Finder is re-evaluating your ownership claim.",
      claimantProof: {
        ...all[index].claimantProof,
        additionalProof: proofText,
        submittedAt: new Date().toISOString(),
      },
      timeline: [
        ...all[index].timeline,
        {
          step: all[index].timeline.length + 1,
          title: "Additional Details Provided",
          time: "Just now",
          description: proofText,
          completed: true,
          current: true,
        },
      ],
    };
    all[index] = updated;
    saveStoredClaims(all);
    return updated;
  }
  return null;
}

/**
 * Cancel a pending claim
 */
export async function cancelClaim(id, reason = "Withdrawn by claimant") {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/claims/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API unreachable, updating local claim store:", e.message);
    }
  }

  const all = getStoredClaims();
  const index = all.findIndex((c) => c.id === id);
  if (index !== -1) {
    const updated = {
      ...all[index],
      status: "rejected",
      statusLabel: "Claim Cancelled",
      statusDescription: `Claim withdrawn: ${reason}`,
    };
    all[index] = updated;
    saveStoredClaims(all);
    return updated;
  }
  return null;
}

/**
 * Finder approves ownership claim with an optional note
 */
export async function approveClaim(id, note = "") {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/claims/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API unreachable, updating local claim store:", e.message);
    }
  }

  const all = getStoredClaims();
  const index = all.findIndex((c) => c.id === id);
  if (index !== -1) {
    const claim = all[index];
    const generatedOtp = `FP-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = {
      ...claim,
      status: "approved",
      statusLabel: "Approved - Ready for Handover",
      statusDescription:
        "Finder verified your ownership claim! You can now coordinate the safe handover.",
      reviewNotes: note || "Finder confirmed proof and authorized handover.",
      handover: {
        ...(claim.handover || {}),
        isEligible: true,
        status: "ready",
        handoverCode: claim.handover?.handoverCode || generatedOtp,
        locationName:
          claim.handover?.locationName || claim.location || "Designated Safe Exchange Spot",
        timeSlot: claim.handover?.timeSlot || "Coordinate with finder to finalize time",
      },
      timeline: [
        ...(claim.timeline || []).map((t) => ({ ...t, current: false })),
        {
          step: (claim.timeline?.length || 0) + 1,
          title: "Claim Approved by Finder",
          time: "Just now",
          description: note || "Finder confirmed identifying proof.",
          completed: true,
          current: true,
        },
      ],
    };
    all[index] = updated;
    saveStoredClaims(all);
    return updated;
  }
  return null;
}

/**
 * Finder rejects ownership claim with an optional note
 */
export async function rejectClaim(id, note = "") {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/claims/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API unreachable, updating local claim store:", e.message);
    }
  }

  const all = getStoredClaims();
  const index = all.findIndex((c) => c.id === id);
  if (index !== -1) {
    const claim = all[index];
    const updated = {
      ...claim,
      status: "rejected",
      statusLabel: "Verification Failed",
      statusDescription:
        note || "The finder reviewed the submitted proof and concluded it does not match the item.",
      reviewNotes: note || "Verification details did not match the physical item.",
      timeline: [
        ...(claim.timeline || []).map((t) => ({ ...t, current: false })),
        {
          step: (claim.timeline?.length || 0) + 1,
          title: "Claim Declined",
          time: "Just now",
          description: note || "Proof details did not match.",
          completed: true,
          current: true,
        },
      ],
    };
    all[index] = updated;
    saveStoredClaims(all);
    return updated;
  }
  return null;
}

