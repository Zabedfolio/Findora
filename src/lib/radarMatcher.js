/**
 * Findora Match Radar™ Intelligent Cross-Matching Engine
 * Computes semantic, category, location, and temporal proximity scores
 * between user search parameters and active community reports.
 */

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with",
  "my", "i", "lost", "found", "item", "please", "help", "color", "of"
]);

function tokenize(text) {
  if (!text || typeof text !== "string") return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Calculates match percentage and returns breakdown details.
 *
 * @param {Object} input - Search criteria
 * @param {string} input.query - Item keywords (e.g., "Black Sony Headphones")
 * @param {string} input.category - Category filter
 * @param {string} input.location - Location filter
 * @param {string} input.scanMode - 'lost' (search found items), 'found' (search lost items), or 'omni'
 * @param {Array} reports - All available reports
 * @returns {Array<{ report: Object, score: number, confidenceTier: string, reasons: Array<string> }>}
 */
export function calculateRadarMatches(input, reports = []) {
  const { query = "", category = "", location = "", scanMode = "lost" } = input;

  const queryTokens = tokenize(query);
  const targetCategory = category && category !== "All Categories" ? category.toLowerCase().trim() : null;
  const targetLocation = location && location !== "All Locations" ? location.toLowerCase().trim() : null;

  // Filter out reports based on scan mode
  let candidates = reports.filter((r) => r.status !== "resolved");

  if (scanMode === "lost") {
    // User lost something -> search items that others FOUND
    candidates = candidates.filter((r) => r.type?.toLowerCase() === "found");
  } else if (scanMode === "found") {
    // User found something -> search items that owners LOST
    candidates = candidates.filter((r) => r.type?.toLowerCase() === "lost");
  }

  const results = [];

  for (const report of candidates) {
    let score = 0;
    const reasons = [];

    const reportTitle = (report.title || "").toLowerCase();
    const reportDesc = (report.description || "").toLowerCase();
    const reportCategory = (report.category || "").toLowerCase();
    const reportLocation = (report.location || "").toLowerCase();

    // 1. CATEGORY MATCH (35 max points)
    if (targetCategory) {
      if (reportCategory === targetCategory) {
        score += 35;
        reasons.push(`Category match: ${report.category}`);
      } else if (reportCategory.includes(targetCategory) || targetCategory.includes(reportCategory)) {
        score += 25;
        reasons.push(`Related category: ${report.category}`);
      }
    } else {
      // If no category specified, give base neutral weight
      score += 15;
    }

    // 2. TEXT & KEYWORD SIMILARITY (40 max points)
    if (queryTokens.length > 0) {
      let hits = 0;
      const matchedWords = [];

      for (const token of queryTokens) {
        if (reportTitle.includes(token)) {
          hits += 1.5; // title hits have higher weight
          matchedWords.push(token);
        } else if (reportDesc.includes(token)) {
          hits += 1;
          matchedWords.push(token);
        }
      }

      if (hits > 0) {
        const textWeight = Math.min(40, Math.round((hits / Math.max(queryTokens.length, 1)) * 35) + 5);
        score += textWeight;
        const uniqueWords = [...new Set(matchedWords)];
        reasons.push(`Keyword match: "${uniqueWords.join('", "')}"`);
      }
    } else {
      // If user hasn't typed keywords yet, base neutral score
      score += 10;
    }

    // 3. LOCATION PROXIMITY (15 max points)
    if (targetLocation) {
      if (reportLocation.includes(targetLocation) || targetLocation.includes(reportLocation)) {
        score += 15;
        reasons.push(`Location proximity match: ${report.location}`);
      } else {
        // Partial city/area check
        const locParts = targetLocation.split(/[\s,]+/);
        const matchPart = locParts.find((p) => p.length > 3 && reportLocation.includes(p));
        if (matchPart) {
          score += 10;
          reasons.push(`Area proximity: ${report.location}`);
        }
      }
    } else {
      score += 8;
    }

    // 4. RECENCY & TEMPORAL PROXIMITY (10 max points)
    const reportDate = report.dateRaw ? new Date(report.dateRaw) : null;
    if (reportDate && !isNaN(reportDate.getTime())) {
      const daysDiff = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 3) {
        score += 10;
        reasons.push("Reported very recently (last 3 days)");
      } else if (daysDiff <= 14) {
        score += 7;
        reasons.push("Reported in last 2 weeks");
      } else if (daysDiff <= 30) {
        score += 4;
      }
    } else {
      score += 5;
    }

    // Cap at 99% (reserve 100% for verified handshakes)
    const finalScore = Math.min(99, Math.max(12, Math.round(score)));

    // Categorize confidence tier
    let confidenceTier = "low";
    if (finalScore >= 80) confidenceTier = "high";
    else if (finalScore >= 60) confidenceTier = "medium";

    // Only include if there's reasonable relevance or if query is empty
    if (queryTokens.length === 0 || score >= 35) {
      results.push({
        report,
        score: finalScore,
        confidenceTier,
        reasons: reasons.slice(0, 3),
      });
    }
  }

  // Sort by highest score first
  return results.sort((a, b) => b.score - a.score);
}
