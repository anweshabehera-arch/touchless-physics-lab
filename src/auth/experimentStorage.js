const EXPERIMENT_HISTORY_KEY = "touchless_physics_experiment_history";

const SEED_HISTORY = [
  {
    id: 1711000001,
    experimentId: "newton",
    experimentName: "Newton's 2nd Law",
    topic: "Newton's 2nd Law · F = m·a",
    score: 92,
    status: "completed",
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 1711000002,
    experimentId: "collision",
    experimentName: "Collisions & Momentum",
    topic: "Momentum Conservation · p_total = const",
    score: 85,
    status: "completed",
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 1711000003,
    experimentId: "impulse",
    experimentName: "Impulse & Momentum",
    topic: "Impulse · J = F·Δt = Δp",
    score: 75,
    status: "in-progress",
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

export function getExperimentHistory() {
  const data = localStorage.getItem(EXPERIMENT_HISTORY_KEY);

  if (!data) {
    // Save seed history on first access so dashboard is populated
    try {
      localStorage.setItem(EXPERIMENT_HISTORY_KEY, JSON.stringify(SEED_HISTORY));
    } catch (_) {}
    return SEED_HISTORY;
  }

  try {
    const history = JSON.parse(data);
    return Array.isArray(history) && history.length > 0 ? history : SEED_HISTORY;
  } catch {
    return SEED_HISTORY;
  }
}

export function saveExperimentResult(result) {
  const history = getExperimentHistory();

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

  // Remove duplicate in-progress for the same experiment if newly completed
  const filtered = history.filter(
    (h) => !(h.experimentId === newResult.experimentId && newResult.status === 'completed' && h.status === 'in-progress')
  );

  filtered.unshift(newResult);

  localStorage.setItem(
    EXPERIMENT_HISTORY_KEY,
    JSON.stringify(filtered.slice(0, 30))
  );

  return newResult;
}

export function getExperimentRecord(expId) {
  const history = getExperimentHistory();
  const records = history.filter((h) => h.experimentId === expId);
  if (records.length === 0) return null;
  const best = records.reduce((max, r) => (r.score > max.score ? r : max), records[0]);
  return best;
}

export function getExperimentStats() {
  const history = getExperimentHistory();
  const completed = history.filter((h) => h.status === "completed");

  const completedCount = completed.length;
  const totalScores = completed.reduce((acc, c) => acc + (c.score || 0), 0);
  const averageScore = completedCount > 0 ? Math.round(totalScores / completedCount) : 0;
  const bestScore = history.reduce((max, h) => Math.max(max, h.score || 0), 0);

  // Unique completed experiments
  const uniqueCompleted = new Set(completed.map(c => c.experimentId)).size;
  const overallProgress = Math.min(100, Math.round((uniqueCompleted / 5) * 100));

  return {
    history,
    completedCount,
    uniqueCompleted,
    totalCount: 5,
    averageScore,
    bestScore,
    overallProgress,
    streak: 7,
    conceptsExplored: 15 + uniqueCompleted * 3
  };
}

export function clearExperimentHistory() {
  localStorage.removeItem(EXPERIMENT_HISTORY_KEY);
}