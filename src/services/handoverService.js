import { resolveReport } from "./reportService";

const STORAGE_KEY = "findora_handovers_store";

const INITIAL_DEMO_HANDOVERS = [];

/**
 * Read handovers store with fallback to mock data
 */
function getStore() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not read handovers store:", err);
    return [];
  }
}

/**
 * Save handovers to local storage
 */
function saveStore(handovers) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(handovers));
  } catch (err) {
    console.warn("Could not save to handovers store:", err);
  }
}

/**
 * Fetch all handovers categorized by status and filtered by user
 */
export async function getHandovers(filter = "all", currentUser = null, isAdmin = false) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const searchParams = new URLSearchParams();
      if (filter && filter !== "all") searchParams.set("filter", filter);
      if (isAdmin) searchParams.set("isAdmin", "true");
      if (currentUser) {
        const uid = currentUser.id || currentUser._id;
        if (uid) searchParams.set("userId", String(uid));
        if (currentUser.email) searchParams.set("email", String(currentUser.email));
      }
      const res = await fetch(`${apiBase}/handovers?${searchParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (e) {
      console.warn("Backend handovers API unreachable, fallback to local:", e.message);
    }
  }

  const all = getStore();

  let targetList = all;

  // Unless admin, strictly filter handovers for the authenticated user
  if (!isAdmin) {
    if (!currentUser) {
      return {
        all: [],
        upcoming: [],
        past: [],
        suspicious: [],
        counts: {
          all: 0,
          upcoming: 0,
          past: 0,
          proposed: 0,
          confirmed: 0,
          completed: 0,
          suspicious: 0,
        },
      };
    }

    const currentUserId = String(currentUser.id || currentUser._id || "").toLowerCase();
    const currentUserEmail = String(currentUser.email || "").toLowerCase();

    targetList = all.filter((h) => {
      const ownerId = String(h.owner?.id || h.owner?._id || "").toLowerCase();
      const ownerEmail = String(h.owner?.email || "").toLowerCase();
      const finderId = String(h.finder?.id || h.finder?._id || "").toLowerCase();
      const finderEmail = String(h.finder?.email || "").toLowerCase();

      const isOwner =
        (currentUserId && ownerId === currentUserId) ||
        (currentUserEmail && ownerEmail === currentUserEmail);
      const isFinder =
        (currentUserId && finderId === currentUserId) ||
        (currentUserEmail && finderEmail === currentUserEmail);

      return isOwner || isFinder;
    });
  }

  const upcoming = targetList.filter(
    (h) => h.status === "proposed" || h.status === "confirmed"
  );
  const past = targetList.filter(
    (h) => h.status === "completed" || h.status === "reunited"
  );
  const suspicious = targetList.filter(
    (h) => (h.suspiciousFlags && h.suspiciousFlags.length > 0) || h.hasWarning
  );

  let filtered = targetList;
  if (filter === "upcoming") {
    filtered = upcoming;
  } else if (filter === "past" || filter === "completed") {
    filtered = past;
  } else if (filter === "suspicious") {
    filtered = suspicious;
  }

  return {
    all: filtered,
    upcoming,
    past,
    suspicious,
    counts: {
      all: targetList.length,
      upcoming: upcoming.length,
      past: past.length,
      proposed: targetList.filter((h) => h.status === "proposed").length,
      confirmed: targetList.filter((h) => h.status === "confirmed").length,
      completed: past.length,
      suspicious: suspicious.length,
    },
  };
}

/**
 * Retrieve a single handover by ID
 */
export async function getHandoverById(id) {
  const all = getStore();
  return all.find((h) => h._id === id || h.id === id) || null;
}

/**
 * Create a new handover proposal
 */
export async function createHandoverProposal({
  claimId,
  reportId,
  itemTitle,
  itemCategory,
  itemThumbnail,
  meetingDate,
  timeSlot,
  location,
  safetyNote,
  proposedBy = "owner",
  owner,
  finder,
}) {
  const all = getStore();

  // Basic auto safety heuristic to assist admin monitoring
  const suspiciousFlags = [];
  const locLower = (location || "").toLowerCase();
  const timeLower = (timeSlot || "").toLowerCase();
  if (locLower.includes("alley") || locLower.includes("depot") || locLower.includes("home") || locLower.includes("apartment")) {
    suspiciousFlags.push("Non-public or isolated venue detected");
  }
  if (timeLower.includes("11:") || timeLower.includes("12:") || timeLower.includes("01:") || timeLower.includes("night") || timeLower.includes("midnight")) {
    suspiciousFlags.push("Late night exchange scheduled");
  }

  const newHandover = {
    _id: `hnd_${Date.now()}`,
    claimId: claimId || `clm_${Date.now()}`,
    reportId: reportId || `rep_${Date.now()}`,
    itemTitle: itemTitle || "Reported Item",
    itemCategory: itemCategory || "Valuables",
    itemThumbnail:
      itemThumbnail ||
      "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80",
    owner: owner || {
      name: "Findora Member",
      email: "member@findora.app",
      role: "owner",
    },
    finder: finder || {
      name: "Item Finder",
      email: "finder@findora.app",
      role: "finder",
    },
    proposedBy,
    meetingDate,
    timeSlot,
    location,
    safetyNote: safetyNote || "Always meet in a well-lit, public place.",
    status: "proposed",
    confirmations: {
      ownerConfirmed: proposedBy === "owner",
      finderConfirmed: proposedBy === "finder",
    },
    history: [
      {
        at: new Date().toISOString(),
        by: proposedBy === "finder" ? "Finder" : "Owner",
        action: `Proposed safe handover meeting at ${location}`,
      },
    ],
    suspiciousFlags,
    adminWarnings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newHandover, ...all];
  saveStore(updated);
  return newHandover;
}

/**
 * AUTO-APPROVAL: Accept a proposed handover meeting.
 * No admin approval needed. When either party clicks accept, it auto-confirms!
 */
export async function acceptHandoverProposal(id, recipientRole = "owner") {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/handovers/${id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: recipientRole }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn("Backend accept handover error, fallback to local:", e.message);
    }
  }

  const all = getStore();
  const index = all.findIndex((h) => h._id === id || h.id === id);
  if (index === -1) {
    throw new Error("Handover record not found.");
  }

  const existing = all[index];
  const updated = {
    ...existing,
    status: "confirmed",
    history: [
      ...(existing.history || []),
      {
        at: new Date().toISOString(),
        by: recipientRole === "finder" ? "Finder" : "Owner / Recipient",
        action: "Auto-approved & confirmed handover meeting schedule",
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  saveStore(all);
  return updated;
}

/**
 * Suggest alternative time or location
 */
export async function suggestAlternativeProposal(
  id,
  { meetingDate, timeSlot, location, safetyNote, suggestedBy = "recipient" }
) {
  const all = getStore();
  const index = all.findIndex((h) => h._id === id || h.id === id);
  if (index === -1) {
    throw new Error("Handover record not found.");
  }

  const existing = all[index];
  const updated = {
    ...existing,
    meetingDate: meetingDate || existing.meetingDate,
    timeSlot: timeSlot || existing.timeSlot,
    location: location || existing.location,
    safetyNote: safetyNote || existing.safetyNote,
    status: "proposed", // resets to proposed so other party can review
    confirmations: {
      ownerConfirmed: suggestedBy === "owner",
      finderConfirmed: suggestedBy === "finder",
    },
    history: [
      ...(existing.history || []),
      {
        at: new Date().toISOString(),
        by: suggestedBy,
        action: `Counter-proposed new meeting spot/time: ${location || existing.location} (${meetingDate || existing.meetingDate})`,
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  saveStore(all);
  return updated;
}

/**
 * TWO-PARTY CONFIRMATION:
 * Completes automatically when finder AND receiver both click confirm!
 * No admin approval required. Automatically resolves report and unlocks verified ratings.
 */
export async function completeHandover(id, partyRole = "owner", currentUser = null) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/handovers/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: partyRole,
          userId: currentUser?.id || currentUser?._id,
          email: currentUser?.email,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return {
          handover: json.data,
          isFullyCompleted: Boolean(json.isFullyCompleted),
        };
      }
    } catch (e) {
      console.warn("Backend confirm handover error, fallback to local:", e.message);
    }
  }

  const all = getStore();
  const index = all.findIndex((h) => h._id === id || h.id === id);
  if (index === -1) {
    throw new Error("Handover record not found.");
  }

  const existing = all[index];
  const prevConfirmations = existing.confirmations || {
    ownerConfirmed: false,
    finderConfirmed: false,
  };

  const newConfirmations = {
    ...prevConfirmations,
    ...(partyRole === "owner" ? { ownerConfirmed: true, ownerConfirmedAt: new Date().toISOString() } : {}),
    ...(partyRole === "finder" ? { finderConfirmed: true, finderConfirmedAt: new Date().toISOString() } : {}),
  };

  // Both finder and receiver must confirm
  const isFullyCompleted =
    Boolean(newConfirmations.ownerConfirmed) && Boolean(newConfirmations.finderConfirmed);

  const newStatus = isFullyCompleted ? "completed" : "confirmed";

  const updated = {
    ...existing,
    status: newStatus,
    confirmations: newConfirmations,
    ratingsUnlocked: isFullyCompleted,
    completedAt: isFullyCompleted ? new Date().toISOString() : existing.completedAt,
    history: [
      ...(existing.history || []),
      {
        at: new Date().toISOString(),
        by: partyRole === "finder" ? "Finder" : "Receiver / Owner",
        action: isFullyCompleted
          ? "Both parties signed off! Handover mutually verified & completed."
          : `Signed delivery confirmation (${partyRole === "finder" ? "Finder" : "Receiver"}). Awaiting counterparty confirmation.`,
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  saveStore(all);

  // Automatically transition report status to "resolved" in reportService
  if (isFullyCompleted && existing.reportId) {
    try {
      await resolveReport(existing.reportId);
    } catch (e) {
      console.warn("Could not auto-resolve report in reportService:", e);
    }
  }

  return {
    handover: updated,
    isFullyCompleted,
  };
}

/**
 * Check if the current user has any unreviewed completed handover with a finder
 */
export async function checkReviewEligibility(targetUserId, currentUser) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase && targetUserId && currentUser) {
    try {
      const uid = currentUser.id || currentUser._id;
      const res = await fetch(
        `${apiBase}/handovers/eligible/${targetUserId}?reviewerId=${uid}&email=${currentUser.email || ""}`
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend check review eligibility error:", e.message);
    }
  }

  // Fallback check against local store
  const all = getStore();
  const cId = String(currentUser?.id || currentUser?._id || "").toLowerCase();
  const cEmail = String(currentUser?.email || "").toLowerCase();

  const eligible = all.find((h) => {
    const finderId = String(h.finder?.id || h.finder?._id || "").toLowerCase();
    const ownerId = String(h.owner?.id || h.owner?._id || "").toLowerCase();
    const ownerEmail = String(h.owner?.email || "").toLowerCase();

    return (
      finderId === String(targetUserId).toLowerCase() &&
      (ownerId === cId || (cEmail && ownerEmail === cEmail)) &&
      (h.status === "completed" || h.status === "reunited") &&
      h.confirmations?.ownerConfirmed &&
      h.confirmations?.finderConfirmed &&
      !h.isReviewed
    );
  });

  return { eligible: Boolean(eligible), handover: eligible || null };
}

/**
 * ADMIN SUPERVISION:
 * If admin sees anything suspicious, he can warn finder and receiver SEPARATELY.
 *
 * @param {string} id - Handover ID
 * @param {Object} options
 * @param {'finder' | 'receiver' | 'both'} options.target - Whom to warn
 * @param {string} options.title - Short alert headline
 * @param {string} options.message - Detailed warning instruction
 * @param {string} [options.severity='high'] - 'warning' | 'high' | 'critical'
 */
export async function sendAdminWarning(id, { target = "finder", title, message, severity = "high" }) {
  const all = getStore();
  const index = all.findIndex((h) => h._id === id || h.id === id);
  if (index === -1) {
    throw new Error("Handover record not found.");
  }

  const existing = all[index];
  const newWarning = {
    id: `wrn_${Date.now()}`,
    target, // 'finder' | 'receiver' | 'both'
    title: title || "Security Warning from Findora Trust Team",
    message:
      message ||
      "Suspicious location or schedule detected. Do not meet in secluded areas or send money in advance.",
    severity,
    sentAt: new Date().toISOString(),
  };

  const updated = {
    ...existing,
    hasWarning: true,
    adminWarnings: [newWarning, ...(existing.adminWarnings || [])],
    history: [
      ...(existing.history || []),
      {
        at: new Date().toISOString(),
        by: "Findora Trust Admin",
        action: `Issued safety warning to ${target.toUpperCase()}: "${newWarning.title}"`,
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  saveStore(all);
  return { handover: updated, warning: newWarning };
}
