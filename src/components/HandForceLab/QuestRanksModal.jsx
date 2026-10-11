import {
  Trophy,
  Award,
  CheckCircle2,
  Lock,
  X,
  Sparkles
} from "lucide-react";

export default function QuestRanksModal({
  isOpen,
  onClose,
  questProfile
}) {
  if (!isOpen) return null;

  const currentLevel = questProfile?.level || 1;
  const currentXP = questProfile?.currentXP || 0;
  const streak = questProfile?.streak || 1;
  const totalMissions = questProfile?.totalMissionsCompleted || 0;
  const achievements = questProfile?.achievementsList || [];

  const ranks = [
    { level: 1, title: "Apprentice Observer", minXP: 0, desc: "Foundational observation of particles & forces" },
    { level: 2, title: "Kinematics Explorer", minXP: 151, desc: "Trajectory, velocity vectors and constant acceleration" },
    { level: 3, title: "Dynamics Specialist", minXP: 401, desc: "Newtonian forces, inertia, and mass resistance" },
    { level: 4, title: "Momentum Pioneer", minXP: 751, desc: "Impulse integrals, collision conservation, and restitution" },
    { level: 5, title: "Harmonic Oscillations Master", minXP: 1201, desc: "Hooke's springs, restoring force, and pendulum periods" },
    { level: 6, title: "Field & Flux Tactician", minXP: 1751, desc: "Coulomb's Law, superposition, and electric field lines" },
    { level: 7, title: "Wave Superposition Virtuoso", minXP: 2401, desc: "Constructive and destructive phase interference" },
    { level: 8, title: "Optical Physicist", minXP: 3151, desc: "Snell's Law, boundary refraction, and critical TIR" },
    { level: 9, title: "Classical Mechanics Scholar", minXP: 4001, desc: "Mastery across all Newtonian and field phenomena" },
    { level: 10, title: "Quantum Lab Grandmaster", minXP: 5001, desc: "The ultimate scientific verification rank" }
  ];

  return (
    <div className="quest-modal-backdrop" onClick={onClose}>
      <div
        className="quest-modal-card ranks-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Physics Quest Career Ranks & Achievements"
      >
        <button
          type="button"
          className="quest-modal-close-btn"
          onClick={onClose}
          title="Close dialog"
        >
          <X className="btn-icon-sm" />
        </button>

        <div className="ranks-header">
          <div className="ranks-header-left">
            <Trophy className="ranks-trophy-icon" />
            <div>
              <span className="ranks-eyebrow">PHYSICS QUEST CAREER</span>
              <h2 className="ranks-title">Lab Ranks & Achievements</h2>
            </div>
          </div>
          <div className="ranks-meta-chips">
            <span className="meta-chip">🔥 {streak}-day streak</span>
            <span className="meta-chip">🏆 {totalMissions}/30 Missions</span>
            <span className="meta-chip">⭐ {currentXP} XP</span>
          </div>
        </div>

        {/* Section 1: All 10 Ranks */}
        <div className="ranks-section-block">
          <h4 className="ranks-section-title">
            <Award className="sec-icon" /> 10 SCIENTIFIC CAREER RANKS
          </h4>
          <div className="ranks-tier-list">
            {ranks.map((r) => {
              const isCurrent = r.level === currentLevel;
              const isUnlocked = r.level <= currentLevel;

              return (
                <div
                  key={r.level}
                  className={`rank-item-row ${isCurrent ? "current" : isUnlocked ? "unlocked" : "locked"}`}
                >
                  <div className="rank-num-badge">
                    {isUnlocked ? <span>{r.level}</span> : <Lock className="lock-icon" />}
                  </div>
                  <div className="rank-info-col">
                    <div className="rank-title-row">
                      <strong className="rank-title-name">{r.title}</strong>
                      <span className="rank-xp-req">{r.minXP} XP req</span>
                    </div>
                    <p className="rank-desc-str">{r.desc}</p>
                  </div>
                  {isCurrent && <span className="current-rank-tag">CURRENT</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Achievements */}
        <div className="ranks-section-block">
          <h4 className="ranks-section-title">
            <Sparkles className="sec-icon" /> SCIENTIFIC ACHIEVEMENTS ({questProfile?.unlockedAchievementsCount || 0}/{achievements.length})
          </h4>
          <div className="achievements-card-grid">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`achievement-tile ${a.isUnlocked ? "unlocked" : "locked"}`}
              >
                <div className="achieve-tile-emoji">{a.icon}</div>
                <div className="achieve-tile-meta">
                  <div className="achieve-tile-top">
                    <strong className="achieve-tile-title">{a.title}</strong>
                    {a.isUnlocked ? (
                      <CheckCircle2 className="achieve-ok-icon" />
                    ) : (
                      <Lock className="achieve-lock-icon" />
                    )}
                  </div>
                  <p className="achieve-tile-desc">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
