import { useState, useMemo } from "react";
import {
  Target,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  ShieldCheck,
  X
} from "lucide-react";

export default function QuestMissionPanel({
  experiment,
  missions = [],
  telemetry = {},
  physicsState = {},
  simState = {},
  onClaimReward,
  completedMissionsMap = {},
  onResetSim,
  onClose
}) {
  const [activeTierIdx, setActiveTierIdx] = useState(0);

  const currentMission = missions[activeTierIdx] || missions[0];

  // Evaluate live validation against current physics telemetry
  const validationResult = useMemo(() => {
    if (!currentMission || typeof currentMission.validate !== "function") {
      return { success: false, progress: 0, message: "No validation available." };
    }
    try {
      return currentMission.validate(telemetry, physicsState, simState);
    } catch {
      return { success: false, progress: 0, message: "Awaiting physical interaction..." };
    }
  }, [currentMission, telemetry, physicsState, simState]);

  if (!currentMission) return null;

  const isClaimed = Boolean(completedMissionsMap[currentMission.id]);
  const isGoalMet = validationResult.success;
  const progressPercent = Math.min(100, Math.max(0, validationResult.progress || 0));

  const tierColors = {
    beginner: { border: "#31f2a1", bg: "rgba(49, 242, 161, 0.1)", text: "#31f2a1" },
    intermediate: { border: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b" },
    expert: { border: "#a855f7", bg: "rgba(168, 85, 247, 0.1)", text: "#a855f7" }
  };

  const currentTierStyle = tierColors[currentMission.tier] || tierColors.beginner;

  return (
    <section
      className="quest-mission-panel"
      aria-label="Physics Quest Mission Challenges"
    >
      {/* Header */}
      <div className="quest-mission-header">
        <div className="mission-header-left">
          <div className="mission-icon-halo">
            <Target className="mission-header-icon" />
          </div>
          <div>
            <div className="mission-eyebrow">
              PHYSICS QUEST · MISSION CHALLENGES
            </div>
            <h3 className="mission-exp-title">{experiment?.title}</h3>
          </div>
        </div>

        <div className="mission-header-actions">
          <button
            type="button"
            className="mission-header-btn"
            onClick={onResetSim}
            title="Reset simulation parameters to test clean mission attempt"
          >
            <RotateCcw className="btn-icon-xs" />
            Reset Sim
          </button>
          {onClose && (
            <button
              type="button"
              className="mission-header-btn close"
              onClick={onClose}
              title="Close Mission Panel"
            >
              <X className="btn-icon-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Tier Selector Pills */}
      <div className="mission-tier-tabs">
        {missions.map((m, idx) => {
          const mClaimed = Boolean(completedMissionsMap[m.id]);
          const isActive = idx === activeTierIdx;
          const tierInfo = tierColors[m.tier] || tierColors.beginner;

          return (
            <button
              key={m.id}
              type="button"
              className={`mission-tier-tab ${isActive ? "active" : ""} ${mClaimed ? "claimed" : ""}`}
              onClick={() => setActiveTierIdx(idx)}
              style={
                isActive
                  ? { borderColor: tierInfo.border, boxShadow: `0 0 12px ${tierInfo.bg}` }
                  : {}
              }
            >
              <span className="tier-tab-badge">{m.badge}</span>
              <div className="tier-tab-meta">
                <span className="tier-tab-name">
                  {m.tier.toUpperCase()} · {m.xpReward} XP
                </span>
                <span className="tier-tab-title">{m.title}</span>
              </div>
              {mClaimed && (
                <ShieldCheck
                  className="tier-tab-claimed-icon"
                  title="Mission Completed & XP Awarded"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Mission Card Body */}
      <div className="mission-card-body">
        <div className="mission-summary-row">
          <div className="mission-title-group">
            <span
              className="mission-tier-pill"
              style={{
                borderColor: currentTierStyle.border,
                color: currentTierStyle.text,
                backgroundColor: currentTierStyle.bg
              }}
            >
              {currentMission.tier.toUpperCase()} TIER · +{currentMission.xpReward} XP
            </span>
            <h4 className="mission-card-title">
              {currentMission.badge} {currentMission.title}
            </h4>
          </div>

          {isClaimed && (
            <div className="mission-claimed-stamp">
              <Trophy className="claimed-trophy-icon" />
              <span>CLAIMED</span>
            </div>
          )}
        </div>

        {/* Narrative / Context */}
        <p className="mission-description-text">{currentMission.description}</p>

        {/* Target Condition Box */}
        <div className="mission-target-box">
          <span className="target-box-label">🎯 SCIENTIFIC TARGET CRITERIA:</span>
          <code className="target-box-code">{currentMission.targetCondition}</code>
        </div>

        {/* Scientific Hint */}
        {currentMission.hint && (
          <div className="mission-hint-box">
            <HelpCircle className="hint-icon" />
            <p>
              <strong>Physics Principle:</strong> {currentMission.hint}
            </p>
          </div>
        )}

        {/* Live Empirical Progress */}
        <div className="mission-live-telemetry-zone">
          <div className="telemetry-zone-header">
            <span>LIVE VERIFICATION STATUS</span>
            <strong style={{ color: isGoalMet ? "#31f2a1" : "#38d9ff" }}>
              {isGoalMet ? "100% (CRITERIA MET!)" : `${progressPercent}%`}
            </strong>
          </div>

          <div className="mission-progress-bar-wrap">
            <div
              className={`mission-progress-bar-fill ${isGoalMet ? "met" : ""}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div
            className={`mission-feedback-chip ${
              isGoalMet ? "success" : progressPercent > 0 ? "partial" : "waiting"
            }`}
          >
            {isGoalMet ? (
              <CheckCircle2 className="feedback-chip-icon success" />
            ) : progressPercent > 0 ? (
              <AlertCircle className="feedback-chip-icon partial" />
            ) : (
              <Sparkles className="feedback-chip-icon waiting" />
            )}
            <span>{validationResult.message}</span>
          </div>
        </div>

        {/* Mission Action Buttons */}
        <div className="mission-actions-row">
          {isClaimed ? (
            <button
              type="button"
              className="btn-mission-claimed"
              disabled
            >
              <CheckCircle2 className="btn-icon-sm" />
              Mission Completed (+{currentMission.xpReward} XP Claimed)
            </button>
          ) : isGoalMet ? (
            <button
              type="button"
              className="btn-mission-claim-active"
              onClick={() => onClaimReward?.(currentMission)}
            >
              <Sparkles className="btn-icon-sm" />
              Claim Mission Reward (+{currentMission.xpReward} XP)
              <ArrowRight className="btn-icon-sm" />
            </button>
          ) : (
            <button
              type="button"
              className="btn-mission-in-progress"
              disabled
              title="Interact with the simulation to satisfy the target criteria"
            >
              In Progress · Satisfy Criteria to Claim ({progressPercent}%)
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
