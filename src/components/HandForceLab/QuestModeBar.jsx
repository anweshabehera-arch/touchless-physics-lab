import {
  Compass,
  Target,
  HelpCircle,
  PlayCircle,
  Flame,
  Award,
  Sparkles
} from "lucide-react";

export default function QuestModeBar({
  activeMode = "missions",
  onChangeMode,
  questProfile,
  completedMissionsForExp = 0,
  totalMissionsForExp = 3,
  isPredictionDone = false,
  onOpenAchievements
}) {
  const level = questProfile?.level || 1;
  const title = questProfile?.title || "Apprentice Observer";
  const xp = questProfile?.currentXP || 0;
  const nextXP = questProfile?.nextLevelXP || 150;
  const progressPercent = questProfile?.progressPercent || 0;
  const streak = questProfile?.streak || 1;
  const totalMissions = questProfile?.totalMissionsCompleted || 0;

  const modes = [
    {
      id: "learn",
      label: "Learn Mode",
      shortLabel: "Learn",
      icon: <Compass className="mode-tab-icon" />,
      badge: "Guided Walkthrough",
      badgeColor: "#38d9ff"
    },
    {
      id: "missions",
      label: "Missions",
      shortLabel: "Missions",
      icon: <Target className="mode-tab-icon" />,
      badge: `${completedMissionsForExp}/${totalMissionsForExp} Done`,
      badgeColor: completedMissionsForExp === totalMissionsForExp ? "#31f2a1" : "#f59e0b"
    },
    {
      id: "prediction",
      label: "Prediction",
      shortLabel: "Hypothesis",
      icon: <HelpCircle className="mode-tab-icon" />,
      badge: isPredictionDone ? "Verified ✓" : "Pre-Test",
      badgeColor: isPredictionDone ? "#31f2a1" : "#a855f7"
    },
    {
      id: "freeplay",
      label: "Free Play",
      shortLabel: "Sandbox",
      icon: <PlayCircle className="mode-tab-icon" />,
      badge: "Sandbox",
      badgeColor: "#94a3b8"
    }
  ];

  return (
    <div className="quest-mode-bar" role="navigation" aria-label="Physics Quest Modes">
      {/* 1. Mode Tabs */}
      <div className="quest-tabs-group">
        {modes.map((m) => {
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              className={`quest-mode-tab ${isActive ? "active" : ""}`}
              onClick={() => onChangeMode?.(m.id)}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="mode-icon-wrap">{m.icon}</span>
              <span className="mode-label-text">{m.label}</span>
              <span
                className="mode-chip-badge"
                style={{
                  borderColor: m.badgeColor,
                  color: m.badgeColor,
                  backgroundColor: `${m.badgeColor}15`
                }}
              >
                {m.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Quest Profile & Level Status Bar */}
      <div className="quest-career-pill">
        <button
          type="button"
          className="quest-level-btn"
          onClick={onOpenAchievements}
          title="Click to view Physics Quest achievements & rank details"
        >
          <div className="level-badge-circle">
            <span>{level}</span>
          </div>
          <div className="level-text-meta">
            <span className="level-title-str">{title}</span>
            <div className="xp-bar-track">
              <div
                className="xp-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="xp-num-str">
              {xp} / {nextXP} XP ({progressPercent}%)
            </span>
          </div>
        </button>

        <div className="quest-stats-mini">
          <div className="stat-pill-item" title="Consecutive Experimentation Streak">
            <Flame className="stat-pill-icon flame" />
            <span>{streak}d</span>
          </div>
          <div className="stat-pill-item" title="Total Physics Quest Missions Completed across all 10 Labs">
            <Award className="stat-pill-icon award" />
            <span>{totalMissions}/30</span>
          </div>
          <button
            type="button"
            className="quest-achieve-quick-btn"
            onClick={onOpenAchievements}
            title="View Achievements"
          >
            <Sparkles className="stat-pill-icon sparkles" />
            <span>Ranks</span>
          </button>
        </div>
      </div>
    </div>
  );
}
