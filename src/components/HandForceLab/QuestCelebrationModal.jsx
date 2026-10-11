import {
  Trophy,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  X
} from "lucide-react";

export default function QuestCelebrationModal({
  isOpen,
  onClose,
  celebrationData
}) {
  if (!isOpen || !celebrationData) return null;

  const {
    title = "Mission Completed!",
    subtitle = "Scientific milestone achieved",
    xpAwarded = 100,
    newLevel = null,
    levelTitle = "",
    unlockedAchievement = null
  } = celebrationData;

  return (
    <div className="quest-modal-backdrop" onClick={onClose}>
      <div
        className="quest-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Physics Quest Milestone Celebration"
      >
        <button
          type="button"
          className="quest-modal-close-btn"
          onClick={onClose}
          title="Close celebration"
        >
          <X className="btn-icon-sm" />
        </button>

        {/* Halo & Icon */}
        <div className="quest-modal-hero">
          <div className="hero-glow-ring" />
          <div className="hero-icon-bubble">
            {newLevel ? (
              <TrendingUp className="hero-main-icon levelup" />
            ) : (
              <Trophy className="hero-main-icon trophy" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="quest-modal-content">
          <span className="quest-modal-tag">
            {newLevel ? "LEVEL UP ACHIEVED!" : "MILESTONE VERIFIED"}
          </span>
          <h2 className="quest-modal-title">{title}</h2>
          <p className="quest-modal-subtitle">{subtitle}</p>

          {/* XP Pill */}
          {xpAwarded > 0 && (
            <div className="quest-modal-xp-badge">
              <Sparkles className="modal-sparkle-icon" />
              <span>+{xpAwarded} PHYSICS XP</span>
            </div>
          )}

          {/* Level Up Banner if applicable */}
          {newLevel && (
            <div className="quest-modal-levelup-card">
              <Award className="levelup-card-icon" />
              <div>
                <span className="levelup-card-label">PROMOTED TO RANK:</span>
                <h4 className="levelup-card-title">
                  Level {newLevel}: {levelTitle}
                </h4>
              </div>
            </div>
          )}

          {/* Unlocked Achievement Banner if applicable */}
          {unlockedAchievement && (
            <div className="quest-modal-achieve-card">
              <span className="achieve-card-emoji">{unlockedAchievement.icon}</span>
              <div>
                <span className="achieve-card-tag">ACHIEVEMENT UNLOCKED</span>
                <strong className="achieve-card-name">
                  {unlockedAchievement.title}
                </strong>
                <p className="achieve-card-desc">
                  {unlockedAchievement.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="quest-modal-actions">
          <button
            type="button"
            className="btn-quest-modal-continue"
            onClick={onClose}
          >
            <CheckCircle2 className="btn-icon-sm" />
            Continue Physics Quest
            <ArrowRight className="btn-icon-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
