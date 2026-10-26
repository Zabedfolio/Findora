import { resolveReport } from "./reportService";

const STORAGE_KEY = "findora_handovers_store";

// Initial realistic demo handovers
const INITIAL_DEMO_HANDOVERS = [
  {
    _id: "hnd_001",
    claimId: "clm_101",
    reportId: "rep_lost_01",
    itemTitle: "Apple MacBook Pro 16\" (M3 Max)",
    itemCategory: "Electronics",
    itemThumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    owner: {
      id: "usr_owner_01",
      name: "Zabed Mahmud",
      email: "zabed@findora.app",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      role: "owner",
    },
    finder: {
      id: "usr_finder_01",
      name: "Tariqul Islam",
      email: "tariqul@gmail.com",
      phone: "+880 1819-234567",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      role: "finder",
    },
    proposedBy: "finder",
    meetingDate: "2026-10-29",
    timeSlot: "04:30 PM - 05:30 PM",
    location: "Dhanmondi Police Station, Main Reception Lobby",
    safetyNote: "Meet inside the police station lobby near the visitor inquiry counter.",
    status: "proposed", // 'proposed' | 'confirmed' | 'completed'
    confirmations: {
      ownerConfirmed: false,
      finderConfirmed: true,
    },
    history: [
      {
        at: "2026-10-26T10:00:00Z",
        by: "Tariqul Islam",
        action: "Proposed handover at Dhanmondi Police Station",
      },
    ],
    createdAt: "2026-10-26T10:00:00Z",
    updatedAt: "2026-10-26T10:00:00Z",
  },
  {
    _id: "hnd_002",
    claimId: "clm_102",
    reportId: "rep_found_02",
    itemTitle: "Leather Bi-fold Wallet with Canadian PR Card",
    itemCategory: "Documents & Wallets",
    itemThumbnail: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80",
    owner: {
      id: "usr_owner_02",
      name: "Rahim Chowdhury",
      email: "rahim@findora.app",
      phone: "+880 1711-987654",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      role: "owner",
    },
    finder: {
      id: "usr_finder_02",
      name: "Sarah Jenkins",
      email: "sarah.j@gmail.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      role: "finder",
    },
    proposedBy: "owner",
    meetingDate: "2026-10-28",
    timeSlot: "02:00 PM - 03:00 PM",
    location: "Bashundhara City Mall, Customer Service Desk (Level 1)",
    safetyNote: "Public information desk area, verified ID badge will be presented.",
    status: "confirmed",
    confirmations: {
      ownerConfirmed: true,
      finderConfirmed: true,
    },
    history: [
      {
        at: "2026-10-25T14:30:00Z",
        by: "Rahim Chowdhury",
        action: "Proposed meeting at Bashundhara City Mall",
      },
      {
        at: "2026-10-25T15:10:00Z",
        by: "Sarah Jenkins",
        action: "Accepted meeting proposal",
      },
    ],
    createdAt: "2026-10-25T14:30:00Z",
    updatedAt: "2026-10-25T15:10:00Z",
  },
  {
    _id: "hnd_003",
    claimId: "clm_103",
    reportId: "rep_lost_03",
    itemTitle: "Sony WH-1000XM5 Wireless Headphones",
    itemCategory: "Electronics",
    itemThumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    owner: {
      id: "usr_owner_03",
      name: "Zabed Mahmud",
      email: "zabed@findora.app",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      role: "owner",
    },
    finder: {
      id: "usr_finder_03",
      name: "Nafis Fuad",
      email: "nafis@gmail.com",
      phone: "+880 1912-334455",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      role: "finder",
    },
    proposedBy: "finder",
    meetingDate: "2026-10-24",
    timeSlot: "11:00 AM - 12:00 PM",
    location: "Metro Rail Station Agargaon (Exit A Concourse)",
    safetyNote: "Inside ticket gate area under CCTV coverage.",
    status: "completed",
    confirmations: {
      ownerConfirmed: true,
      finderConfirmed: true,
    },
    history: [
      { at: "2026-10-23T11:00:00Z", by: "Nafis Fuad", action: "Proposed meeting" },
      { at: "2026-10-23T12:00:00Z", by: "Zabed Mahmud", action: "Accepted proposal" },
      { at: "2026-10-24T12:05:00Z", by: "Both Parties", action: "Confirmed exchange & reunited" },
    ],
    completedAt: "2026-10-24T12:05:00Z",
    ratingsUnlocked: true,
    createdAt: "2026-10-23T11:00:00Z",
    updatedAt: "2026-10-24T12:05:00Z",
  },
];

/**
 * Read handovers store with fallback to mock data
 */
function getStore() {
  if (typeof window === "undefined") return [...INITIAL_DEMO_HANDOVERS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_HANDOVERS));
      return [...INITIAL_DEMO_HANDOVERS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...INITIAL_DEMO_HANDOVERS];
  } catch (err) {
    console.warn("Could not read handovers store:", err);
    return [...INITIAL_DEMO_HANDOVERS];
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
 * Fetch all handovers categorized by status
 */
export async function getHandovers(filter = "all") {
  const all = getStore();

  const upcoming = all.filter(
    (h) => h.status === "proposed" || h.status === "confirmed"
  );
  const past = all.filter(
    (h) => h.status === "completed" || h.status === "reunited"
  );

  let filtered = all;
  if (filter === "upcoming") {
    filtered = upcoming;
  } else if (filter === "past" || filter === "completed") {
    filtered = past;
  }

  return {
    all: filtered,
    upcoming,
    past,
    counts: {
      all: all.length,
      upcoming: upcoming.length,
      past: past.length,
      proposed: all.filter((h) => h.status === "proposed").length,
      confirmed: all.filter((h) => h.status === "confirmed").length,
      completed: past.length,
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
 * Create a new handover proposal from an approved claim
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newHandover, ...all];
  saveStore(updated);
  return newHandover;
}

/**
 * Accept a proposed handover meeting
 */
export async function acceptHandoverProposal(id, recipientRole = "owner") {
  const all = getStore();
  const index = all.findIndex((h) => h._id === id || h.id === id);
  if (index === -1) {
    throw new Error("Handover record not found.");
  }

  const existing = all[index];
  const updated = {
    ...existing,
    status: "confirmed",
    confirmations: {
      ownerConfirmed: true,
      finderConfirmed: true,
    },
    history: [
      ...(existing.history || []),
      {
        at: new Date().toISOString(),
        by: recipientRole === "finder" ? "Finder" : "Owner",
        action: "Accepted proposed meeting location & time slot",
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
 * Mark as Reunited & Completed (with two-party confirmation).
 * Once fully completed, automatically transitions the report status to Resolved
 * and unlocks Phase 7 ratings.
 */
export async function completeHandover(id, partyRole = "owner") {
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
    ...(partyRole === "owner" ? { ownerConfirmed: true } : {}),
    ...(partyRole === "finder" ? { finderConfirmed: true } : {}),
    ...(partyRole === "both" ? { ownerConfirmed: true, finderConfirmed: true } : {}),
  };

  // If both parties confirmed, or forced by "both" confirmation
  const isFullyCompleted =
    newConfirmations.ownerConfirmed && newConfirmations.finderConfirmed;

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
        by: partyRole === "both" ? "Both Parties" : partyRole === "finder" ? "Finder" : "Owner",
        action: isFullyCompleted
          ? "Confirmed physical exchange! Item marked as Reunited & Completed."
          : `Signed handover confirmation (${partyRole}). Waiting for counterparty confirmation.`,
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
