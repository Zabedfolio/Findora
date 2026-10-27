import { createHandoverProposal } from "./handoverService";

const LOCAL_STORAGE_KEY = "findora_user_claims_store";

/**
 * Helper to retrieve stored claims from localStorage
 */
function getStoredClaims() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not read local claims store:", err);
    return [];
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
 * Create and persist a new ownership claim
 */
export async function createClaim({
  reportId,
  itemTitle,
  itemThumbnail,
  category,
  location,
  claimant,
  finder,
  proofText,
  secretAnswers,
  description,
  lostLocationTime,
  proofImage,
}) {
  const normalizedClaimant = claimant
    ? {
        userId: claimant.userId || claimant.id || claimant._id || "usr_current",
        id: claimant.id || claimant.userId || claimant._id || "usr_current",
        name: claimant.name || "Claimant",
        email: claimant.email || "",
        avatar: claimant.avatar || claimant.image || "/default-avatar.png",
      }
    : null;

  const normalizedFinder = finder
    ? {
        userId: finder.userId || finder.id || finder._id || "usr_finder",
        id: finder.id || finder.userId || finder._id || "usr_finder",
        name: finder.name || "Item Finder",
        email: finder.email || "",
        phone: finder.phone || "",
        avatar: finder.avatar || finder.image || "/default-avatar.png",
      }
    : null;

  const effectiveProof = proofText || description || "Submitted proof of ownership.";

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const response = await fetch(`${apiBase}/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          itemId: reportId,
          itemTitle,
          itemThumbnail,
          category,
          location,
          claimant: normalizedClaimant,
          finder: normalizedFinder,
          proofText: effectiveProof,
          description: effectiveProof,
          secretAnswers,
          lostLocationTime,
          proofImage,
        }),
      });
      if (response.ok) {
        const json = await response.json();
        const saved = json.data || json.claim || json;
        const normalized = {
          ...saved,
          id: saved.id || saved._id,
          _id: saved._id || saved.id,
        };
        const all = getStoredClaims();
        saveStoredClaims([normalized, ...all.filter((c) => (c.id || c._id) !== normalized.id)]);
        return normalized;
      }
    } catch (e) {
      console.warn("Backend API unreachable, saving claim to local store:", e.message);
    }
  }

  const all = getStoredClaims();
  const claimNum = `CLM-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date();
  const newClaim = {
    id: `clm_${Date.now()}`,
    claimNumber: claimNum,
    reportId: reportId || `rep_${Date.now()}`,
    itemTitle: itemTitle || "Reported Item",
    category: category || "General",
    itemType: "found",
    claimedAt: now.toISOString(),
    claimedDateFormatted: now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    location: location || "Designated Safe Zone",
    imageUrl:
      itemThumbnail ||
      "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80",
    status: "pending",
    statusLabel: "Under Review",
    statusDescription: "Finder is reviewing your submitted proof of ownership.",
    claimant: normalizedClaimant || {
      id: "usr_current",
      userId: "usr_current",
      name: "Current User",
      email: "user@findora.app",
    },
    finder: normalizedFinder || {
      id: "usr_finder",
      userId: "usr_finder",
      name: "Item Finder",
      email: "finder@findora.app",
    },
    claimantProof: {
      description: effectiveProof,
      submittedAt: now.toISOString(),
      secretAnswers: secretAnswers || [],
      additionalProof: lostLocationTime || "",
      proofPhotoUrl: proofImage || "",
    },
    timeline: [
      {
        step: 1,
        title: "Claim Submitted",
        time: "Just now",
        description: "Ownership proof submitted to the finder.",
        completed: true,
        current: true,
      },
    ],
    handover: null,
  };

  const updated = [newClaim, ...all];
  saveStoredClaims(updated);
  return newClaim;
}

/**
 * Fetch all claims submitted by or sent to the current authenticated user.
 *
 * @param {Object} [params]
 * @param {string} [params.status='all']
 * @param {string} [params.type='all'] - 'all' | 'outgoing' | 'incoming'
 * @param {string} [params.q='']
 * @param {string} [params.category]
 * @param {'newest' | 'oldest'} [params.sort='newest']
 * @param {Object} [currentUser] - Authenticated user object
 * @returns {Promise<{ claims: Array, counts: Object }>}
 */
export async function getMyClaims(params = {}, currentUser = null) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });

      if (currentUser) {
        const uid = currentUser.id || currentUser._id;
        if (uid && !searchParams.has("userId")) {
          searchParams.append("userId", String(uid));
        }
        if (currentUser.email && !searchParams.has("email")) {
          searchParams.append("email", String(currentUser.email));
        }
      }

      const response = await fetch(`${apiBase}/claims/mine?${searchParams.toString()}`);
      if (response.ok) {
        const json = await response.json();
        const rawClaims = Array.isArray(json?.claims)
          ? json.claims
          : Array.isArray(json?.data)
          ? json.data
          : [];
        const normalizedClaims = rawClaims.map((c) => ({
          ...c,
          id: c.id || c._id,
          _id: c._id || c.id,
        }));

        return {
          claims: normalizedClaims,
          counts: json.counts || {
            all: normalizedClaims.length,
            in_handover: normalizedClaims.filter((c) => c.status === "in_handover" || c.status === "approved").length,
            pending: normalizedClaims.filter((c) => c.status === "pending").length,
            needs_info: normalizedClaims.filter((c) => c.status === "needs_info").length,
            reunited: normalizedClaims.filter((c) => c.status === "reunited").length,
            rejected: normalizedClaims.filter((c) => c.status === "rejected").length,
          },
        };
      }
    } catch (e) {
      console.warn("Backend claims API unreachable, falling back to local claims:", e.message);
    }
  }

  // Fallback to local claims store
  const { status = "all", q = "", category = "", sort = "newest", type = "all" } = params;
  let allClaims = getStoredClaims();

  // If currentUser is not provided, return empty
  if (!currentUser) {
    return {
      claims: [],
      counts: {
        all: 0,
        in_handover: 0,
        pending: 0,
        needs_info: 0,
        reunited: 0,
        rejected: 0,
      },
    };
  }

  const currentUserId = String(currentUser.id || currentUser._id || "").toLowerCase();
  const currentUserEmail = String(currentUser.email || "").toLowerCase();

  // Strictly filter by current user
  allClaims = allClaims.filter((c) => {
    const claimantId = String(c.claimant?.id || c.claimant?._id || "").toLowerCase();
    const claimantEmail = String(c.claimant?.email || "").toLowerCase();
    const finderId = String(c.finder?.id || c.finder?._id || "").toLowerCase();
    const finderEmail = String(c.finder?.email || "").toLowerCase();

    const isClaimant =
      (currentUserId && claimantId === currentUserId) ||
      (currentUserEmail && claimantEmail === currentUserEmail);
    const isFinder =
      (currentUserId && finderId === currentUserId) ||
      (currentUserEmail && finderEmail === currentUserEmail);

    if (type === "outgoing") {
      return isClaimant;
    }
    if (type === "incoming") {
      return isFinder;
    }
    return isClaimant || isFinder;
  });

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

    // Auto-create safe handover proposal for the claim so both parties see it in /dashboard/handovers
    try {
      await createHandoverProposal({
        claimId: claim.id,
        reportId: claim.reportId,
        itemTitle: claim.itemTitle,
        itemCategory: claim.category,
        itemThumbnail: claim.imageUrl,
        meetingDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
        timeSlot: "Afternoon (03:30 PM - 05:00 PM)",
        location: claim.location || "Local Police Station / Designated Safe Zone",
        safetyNote: note || "Meet inside public reception under security supervision.",
        proposedBy: "finder",
        owner: claim.claimant,
        finder: claim.finder,
      });
    } catch (e) {
      console.warn("Could not auto-create handover proposal from claim:", e);
    }

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

