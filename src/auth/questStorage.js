import { getCurrentUserKey } from "./authStorage.js";

/**
 * Touchless Physics Lab — Physics Quest Storage & Gamification Engine
 * Persistent, user-isolated XP, leveling, mission challenges, hypothesis predictions,
 * and scientific achievements.
 */

const QUEST_LEVELS = [
  { level: 1, title: "Apprentice Observer", minXP: 0, maxXP: 150 },
  { level: 2, title: "Kinematics Explorer", minXP: 151, maxXP: 400 },
  { level: 3, title: "Dynamics Specialist", minXP: 401, maxXP: 750 },
  { level: 4, title: "Momentum Pioneer", minXP: 751, maxXP: 1200 },
  { level: 5, title: "Harmonic Oscillations Master", minXP: 1201, maxXP: 1750 },
  { level: 6, title: "Field & Flux Tactician", minXP: 1751, maxXP: 2400 },
  { level: 7, title: "Wave Superposition Virtuoso", minXP: 2401, maxXP: 3150 },
  { level: 8, title: "Optical Physicist", minXP: 3151, maxXP: 4000 },
  { level: 9, title: "Classical Mechanics Scholar", minXP: 4001, maxXP: 5000 },
  { level: 10, title: "Quantum Lab Grandmaster", minXP: 5001, maxXP: 99999 }
];

export const QUEST_ACHIEVEMENTS = [
  {
    id: "first_mission",
    title: "Mission Commenced",
    description: "Successfully completed your first Physics Quest challenge",
    icon: "🎯",
    check: (p) => Object.keys(p.completedMissions || {}).length >= 1
  },
  {
    id: "first_prediction",
    title: "Scientific Hypothesis",
    description: "Made your first experiment prediction and verified the result",
    icon: "🔮",
    check: (p) => Object.keys(p.completedPredictions || {}).length >= 1
  },
  {
    id: "mechanics_master",
    title: "Mechanics Ace",
    description: "Completed 5 or more mechanics quest missions",
    icon: "⚙️",
    check: (p) => {
      const keys = Object.keys(p.completedMissions || {});
      const mechanicsCount = keys.filter(k => 
        k.startsWith('newton') || k.startsWith('impulse') || k.startsWith('hooke') || 
        k.startsWith('collision') || k.startsWith('projectile') || k.startsWith('pendulum') || k.startsWith('incline')
      ).length;
      return mechanicsCount >= 5;
    }
  },
  {
    id: "optics_virtuoso",
    title: "Photon Sculptor",
    description: "Completed reflection/refraction and wave interference missions",
    icon: "💎",
    check: (p) => {
      const keys = Object.keys(p.completedMissions || {});
      return keys.some(k => k.startsWith('optics')) && keys.some(k => k.startsWith('wave'));
    }
  },
  {
    id: "level_five",
    title: "Harmonic Prodigy",
    description: "Reached Physics Quest Level 5",
    icon: "⭐",
    check: (p) => p.level >= 5
  },
  {
    id: "mission_ten",
    title: "Decathlon of Discovery",
    description: "Completed 10 distinct quest missions across the curriculum",
    icon: "🏆",
    check: (p) => Object.keys(p.completedMissions || {}).length >= 10
  },
  {
    id: "streak_three",
    title: "Consistent Investigator",
    description: "Maintained a 3-day experimentation streak",
    icon: "🔥",
    check: (p) => (p.streak || 0) >= 3
  }
];

export function getUserQuestKey(userIdentifier = null) {
  const id = userIdentifier || getCurrentUserKey();
  const safeId = encodeURIComponent(String(id || "anonymous").trim().toLowerCase());
  return `touchless_physics_quest_${safeId}`;
}

export function calculateLevelFromXP(xp = 0) {
  const safeXP = Math.max(0, Number(xp) || 0);
  for (let i = QUEST_LEVELS.length - 1; i >= 0; i--) {
    const l = QUEST_LEVELS[i];
    if (safeXP >= l.minXP) {
      const range = l.maxXP - l.minXP;
      const progressInLevel = safeXP - l.minXP;
      const progressPercent = l.level === 10 ? 100 : Math.min(100, Math.round((progressInLevel / range) * 100));
      return {
        level: l.level,
        title: l.title,
        currentXP: safeXP,
        minXP: l.minXP,
        maxXP: l.maxXP,
        progressPercent,
        nextLevelXP: l.maxXP + 1
      };
    }
  }
  return {
    level: 1,
    title: QUEST_LEVELS[0].title,
    currentXP: safeXP,
    minXP: 0,
    maxXP: 150,
    progressPercent: 0,
    nextLevelXP: 151
  };
}

/**
 * Retrieve user quest profile with real calculated levels and unlocked achievements
 */
export function getQuestProfile(userIdentifier = null) {
  const key = getUserQuestKey(userIdentifier);
  let profile = {
    xp: 0,
    completedMissions: {},
    completedPredictions: {},
    exploredExperiments: {},
    achievements: [],
    streak: 1,
    lastActiveDate: new Date().toISOString()
  };

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        profile = {
          xp: Math.max(0, Number(parsed.xp) || 0),
          completedMissions: parsed.completedMissions || {},
          completedPredictions: parsed.completedPredictions || {},
          exploredExperiments: parsed.exploredExperiments || {},
          achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
          streak: Math.max(1, Number(parsed.streak) || 1),
          lastActiveDate: parsed.lastActiveDate || new Date().toISOString()
        };
      }
    }
  } catch {
    // Return default profile on parsing failure
  }

  const levelInfo = calculateLevelFromXP(profile.xp);
  const totalMissionsCompleted = Object.keys(profile.completedMissions).length;
  const totalPredictionsCompleted = Object.keys(profile.completedPredictions).length;

  // Evaluate unlocked achievements
  const evaluatedAchievements = QUEST_ACHIEVEMENTS.map((ach) => {
    const alreadyUnlocked = profile.achievements.includes(ach.id);
    const passesCheck = ach.check({
      ...profile,
      level: levelInfo.level
    });
    return {
      ...ach,
      isUnlocked: alreadyUnlocked || passesCheck
    };
  });

  return {
    ...profile,
    ...levelInfo,
    totalMissionsCompleted,
    totalPredictionsCompleted,
    achievementsList: evaluatedAchievements,
    unlockedAchievementsCount: evaluatedAchievements.filter(a => a.isUnlocked).length
  };
}

/**
 * Persist raw profile changes
 */
function saveRawQuestProfile(profile, userIdentifier = null) {
  const key = getUserQuestKey(userIdentifier);
  try {
    localStorage.setItem(key, JSON.stringify({
      xp: profile.xp,
      completedMissions: profile.completedMissions,
      completedPredictions: profile.completedPredictions,
      exploredExperiments: profile.exploredExperiments,
      achievements: profile.achievements,
      streak: profile.streak,
      lastActiveDate: profile.lastActiveDate
    }));
  } catch {
    // Handle storage errors safely
  }
}

/**
 * Complete a mission and award XP (Anti-exploit: awards XP only once per mission ID)
 */
export function completeQuestMission(expId, missionId, xpReward = 100, missionDetails = {}, userIdentifier = null) {
  const current = getQuestProfile(userIdentifier);

  if (current.completedMissions[missionId]) {
    return {
      alreadyCompleted: true,
      xpAwarded: 0,
      profile: current
    };
  }

  const updatedMissions = {
    ...current.completedMissions,
    [missionId]: {
      expId,
      missionId,
      completedAt: new Date().toISOString(),
      xpEarned: xpReward,
      title: missionDetails.title || missionId,
      tier: missionDetails.tier || "beginner"
    }
  };

  const newXP = current.xp + xpReward;

  // Check achievements to unlock
  const newAchievements = [...current.achievements];
  QUEST_ACHIEVEMENTS.forEach((ach) => {
    if (!newAchievements.includes(ach.id)) {
      const qualifies = ach.check({
        ...current,
        xp: newXP,
        completedMissions: updatedMissions,
        level: calculateLevelFromXP(newXP).level
      });
      if (qualifies) {
        newAchievements.push(ach.id);
      }
    }
  });

  const updatedProfile = {
    ...current,
    xp: newXP,
    completedMissions: updatedMissions,
    achievements: newAchievements,
    lastActiveDate: new Date().toISOString()
  };

  saveRawQuestProfile(updatedProfile, userIdentifier);

  return {
    alreadyCompleted: false,
    xpAwarded: xpReward,
    profile: getQuestProfile(userIdentifier)
  };
}

/**
 * Record a prediction hypothesis and award reward
 */
export function recordQuestPrediction(expId, predictionId, selectedOption, isCorrect, xpReward = 75, userIdentifier = null) {
  const current = getQuestProfile(userIdentifier);

  if (current.completedPredictions[predictionId]) {
    return {
      alreadyCompleted: true,
      xpAwarded: 0,
      profile: current
    };
  }

  const updatedPredictions = {
    ...current.completedPredictions,
    [predictionId]: {
      expId,
      predictionId,
      selectedOption,
      isCorrect,
      completedAt: new Date().toISOString(),
      xpEarned: xpReward
    }
  };

  const newXP = current.xp + xpReward;
  const newAchievements = [...current.achievements];

  QUEST_ACHIEVEMENTS.forEach((ach) => {
    if (!newAchievements.includes(ach.id)) {
      const qualifies = ach.check({
        ...current,
        xp: newXP,
        completedPredictions: updatedPredictions,
        level: calculateLevelFromXP(newXP).level
      });
      if (qualifies) {
        newAchievements.push(ach.id);
      }
    }
  });

  const updatedProfile = {
    ...current,
    xp: newXP,
    completedPredictions: updatedPredictions,
    achievements: newAchievements,
    lastActiveDate: new Date().toISOString()
  };

  saveRawQuestProfile(updatedProfile, userIdentifier);

  return {
    alreadyCompleted: false,
    xpAwarded: xpReward,
    profile: getQuestProfile(userIdentifier)
  };
}

/**
 * Check if a specific mission has been completed by the current user
 */
export function isMissionCompleted(missionId, userIdentifier = null) {
  const profile = getQuestProfile(userIdentifier);
  return Boolean(profile.completedMissions && profile.completedMissions[missionId]);
}

/**
 * Check if a prediction has been submitted
 */
export function isPredictionCompleted(predictionId, userIdentifier = null) {
  const profile = getQuestProfile(userIdentifier);
  return Boolean(profile.completedPredictions && profile.completedPredictions[predictionId]);
}
