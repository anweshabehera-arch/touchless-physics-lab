import { getCurrentUserKey, getLegacyAccountEmail, getAllUsers } from "./authStorage.js";
import { EXPERIMENT_LIST } from "../data/experimentsData.js";

const LEGACY_HISTORY_KEY = "touchless_physics_experiment_history";
const MIGRATION_DONE_KEY = "touchless_physics_legacy_migrated";

/**
 * Generate a sanitized, user-specific localStorage key for experiment history.
 */
export function getUserStorageKey(userIdentifier = null) {
  const id = userIdentifier || getCurrentUserKey();
  const safeId = encodeURIComponent(String(id || "anonymous").trim().toLowerCase());
  return `touchless_physics_history_${safeId}`;
}

/**
 * Migrate legacy experiment history ONCE to the original account (Account A).
 * Removes LEGACY_HISTORY_KEY so it can NEVER be inherited by newly created accounts.
 */
export function migrateLegacyHistoryOnce() {
  try {
    const legacyRaw = localStorage.getItem(LEGACY_HISTORY_KEY);
    if (!legacyRaw) return;

    const legacyParsed = JSON.parse(legacyRaw);
    if (!Array.isArray(legacyParsed) || legacyParsed.length === 0) {
      localStorage.removeItem(LEGACY_HISTORY_KEY);
      return;
    }

    const legacyOwnerEmail = getLegacyAccountEmail();
    if (!legacyOwnerEmail) return;

    const ownerStorageKey = getUserStorageKey(legacyOwnerEmail);
    const existingOwnerData = localStorage.getItem(ownerStorageKey);

    // Save to the original account if not already populated
    if (!existingOwnerData) {
      localStorage.setItem(ownerStorageKey, JSON.stringify(legacyParsed));
    }

    // Mark migration completed and REMOVE legacy shared key forever
    localStorage.setItem(MIGRATION_DONE_KEY, legacyOwnerEmail);
    localStorage.removeItem(LEGACY_HISTORY_KEY);
  } catch {
    // Ignore migration parsing errors
  }
}

/**
 * Sanitize non-owner accounts: if a new account (Account B) was falsely contaminated
 * with a duplicate copy of Account A's legacy records, reset that account's history to [].
 */
export function sanitizeNonOwnerAccounts() {
  try {
    const legacyOwnerEmail = getLegacyAccountEmail();
    if (!legacyOwnerEmail) return;

    const ownerStorageKey = getUserStorageKey(legacyOwnerEmail);
    const ownerData = localStorage.getItem(ownerStorageKey);
    let ownerRecords = [];
    if (ownerData) {
      try {
        ownerRecords = JSON.parse(ownerData);
      } catch {
        // Fallback to empty array
      }
    }

    const users = getAllUsers();
    users.forEach((u) => {
      if (!u.email) return;
      const email = u.email.trim().toLowerCase();
      // Skip the legitimate owner account
      if (email === legacyOwnerEmail) return;

      const userStorageKey = getUserStorageKey(email);
      const userData = localStorage.getItem(userStorageKey);
      if (!userData) return;

      try {
        const parsed = JSON.parse(userData);
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(ownerRecords) && ownerRecords.length > 0) {
          // Check if every record in this account is an exact duplicate of Account A's records
          const isFalselyCopied = parsed.every((r) =>
            ownerRecords.some((or) => (or.id === r.id && or.date === r.date) || (or.experimentId === r.experimentId && or.score === r.score && or.date === r.date))
          );

          if (isFalselyCopied) {
            localStorage.setItem(userStorageKey, JSON.stringify([]));
          }
        }
      } catch {
        // Ignore user record parse error
      }
    });
  } catch {
    // Ignore overall sanitization errors
  }
}

// Run one-time migration and sanitization immediately upon module load
migrateLegacyHistoryOnce();
sanitizeNonOwnerAccounts();

/**
 * Initialize a brand-new user's progress with a clean empty history.
 */
export function initializeUserProgress(userIdentifier) {
  if (!userIdentifier) return;
  const storageKey = getUserStorageKey(userIdentifier);
  try {
    localStorage.setItem(storageKey, JSON.stringify([]));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Retrieve experiment history strictly for the designated user.
 * Brand-new accounts start with a clean empty history [].
 */
export function getExperimentHistory(userIdentifier = null) {
  const userKey = (userIdentifier || getCurrentUserKey()).trim().toLowerCase();
  const storageKey = getUserStorageKey(userKey);

  const raw = localStorage.getItem(storageKey);

  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // If this user is NOT the legacy owner, ensure they didn't inherit duplicate legacy records
        const legacyOwnerEmail = getLegacyAccountEmail();
        if (legacyOwnerEmail && userKey !== legacyOwnerEmail && parsed.length > 0) {
          const ownerStorageKey = getUserStorageKey(legacyOwnerEmail);
          const ownerData = localStorage.getItem(ownerStorageKey);
          if (ownerData) {
            try {
              const ownerParsed = JSON.parse(ownerData);
              if (Array.isArray(ownerParsed) && ownerParsed.length > 0) {
                const isFalselyCopied = parsed.every((r) =>
                  ownerParsed.some((or) => (or.id === r.id && or.date === r.date) || (or.experimentId === r.experimentId && or.score === r.score && or.date === r.date))
                );
                if (isFalselyCopied) {
                  localStorage.setItem(storageKey, JSON.stringify([]));
                  return [];
                }
              }
            } catch {
              // Ignore owner parse error
            }
          }
        }
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  }

  // If no record exists for this user, initialize to empty []
  try {
    localStorage.setItem(storageKey, JSON.stringify([]));
  } catch {
    // Ignore storage write error
  }
  return [];
}

/**
 * Save an experiment quiz or attempt result for the designated user.
 */
export function saveExperimentResult(result, userIdentifier = null) {
  const userKey = (userIdentifier || getCurrentUserKey()).trim().toLowerCase();
  const storageKey = getUserStorageKey(userKey);
  const history = getExperimentHistory(userKey);

  const newResult = {
    id: Date.now(),
    experimentId: result.experimentId || "newton",
    experimentName: result.experimentName || "Physics Experiment",
    topic: result.topic || "Physics",
    score: Number(result.score) || 0,
    status: result.status || "completed",
    date: new Date().toISOString(),
    details: result.details || null
  };

  // Remove duplicate in-progress entries for the same experiment if newly completed
  const filtered = history.filter(
    (h) => !(h.experimentId === newResult.experimentId && newResult.status === "completed" && h.status === "in-progress")
  );

  filtered.unshift(newResult);

  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify(filtered.slice(0, 50))
    );
  } catch {
    // Ignore storage quota error
  }

  return newResult;
}

/**
 * Retrieve the best completion record for a specific experiment for the current user.
 */
export function getExperimentRecord(expId, userIdentifier = null) {
  const history = getExperimentHistory(userIdentifier);
  const records = history.filter((h) => h.experimentId === expId);
  if (records.length === 0) return null;
  const best = records.reduce((max, r) => (r.score > max.score ? r : max), records[0]);
  return best;
}

/**
 * Calculate dynamic statistics strictly derived from the current user's real experiment data.
 */
export function getExperimentStats(userIdentifier = null) {
  const history = getExperimentHistory(userIdentifier);
  const completed = history.filter((h) => h.status === "completed");

  const totalExperiments = EXPERIMENT_LIST.length || 10;
  const completedCount = completed.length;
  const totalScores = completed.reduce((acc, c) => acc + (c.score || 0), 0);
  const averageScore = completedCount > 0 ? Math.round(totalScores / completedCount) : 0;
  const bestScore = completed.length > 0 ? completed.reduce((max, h) => Math.max(max, h.score || 0), 0) : 0;

  // Unique completed experiments
  const uniqueCompleted = new Set(completed.map((c) => c.experimentId)).size;
  const overallProgress = Math.min(100, Math.round((uniqueCompleted / totalExperiments) * 100));

  // Dynamic learning streak based on distinct active days
  let streak = 0;
  if (completed.length > 0) {
    const dates = Array.from(
      new Set(
        completed
          .map((h) => {
            try {
              return new Date(h.date).toISOString().split("T")[0];
            } catch {
              return null;
            }
          })
          .filter(Boolean)
      )
    ).sort().reverse();

    if (dates.length > 0) {
      streak = 1;
      for (let i = 0; i < dates.length - 1; i++) {
        const d1 = new Date(dates[i]);
        const d2 = new Date(dates[i + 1]);
        const diffDays = Math.round((d1 - d2) / 86400000);
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  // Dynamic concepts explored: 4 core concepts per unique completed laboratory
  const conceptsExplored = uniqueCompleted > 0 ? uniqueCompleted * 4 : 0;

  return {
    totalCount: totalExperiments,
    uniqueCompleted,
    completedCount,
    averageScore,
    bestScore,
    overallProgress,
    streak,
    conceptsExplored,
    history
  };
}

/**
 * Clear experiment history for a specific user.
 */
export function clearExperimentHistory(userIdentifier = null) {
  const userKey = (userIdentifier || getCurrentUserKey()).trim().toLowerCase();
  const storageKey = getUserStorageKey(userKey);
  try {
    localStorage.setItem(storageKey, JSON.stringify([]));
  } catch {
    // Ignore storage write error
  }
}

/**
 * Generate a sanitized, user-specific localStorage key for an experiment report snapshot.
 */
export function getReportStorageKey(expId, userIdentifier = null) {
  const userKey = (userIdentifier || getCurrentUserKey()).trim().toLowerCase();
  const safeId = encodeURIComponent(String(userKey || "anonymous").trim().toLowerCase());
  const safeExp = encodeURIComponent(String(expId || "newton").trim().toLowerCase());
  return `touchless_physics_report_${safeId}_${safeExp}`;
}

/**
 * Persist an immutable experiment report snapshot for the designated user.
 */
export function saveExperimentReportSnapshot(expId, snapshot, userIdentifier = null) {
  if (!expId || !snapshot) return null;
  const storageKey = getReportStorageKey(expId, userIdentifier);
  try {
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
    return snapshot;
  } catch {
    return null;
  }
}

/**
 * Retrieve the saved experiment report snapshot for the designated user and experiment.
 */
export function getExperimentReportSnapshot(expId, userIdentifier = null) {
  if (!expId) return null;
  const storageKey = getReportStorageKey(expId, userIdentifier);
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}