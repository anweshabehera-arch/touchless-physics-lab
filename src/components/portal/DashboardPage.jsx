import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Flame,
  FlaskConical,
  Hand,
  LayoutDashboard,
  Lightbulb,
  Loader,
  LogOut,
  Menu,
  MessageSquareText,
  Target,
  TrendingUp,
  UserRound,
  X,
  Sparkles,
  FileText,
  Award,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, getDisplayName, getInitials, getSession } from "../../auth/authStorage";
import { getExperimentStats, getExperimentReportSnapshot } from "../../auth/experimentStorage";
import { getQuestProfile, QUEST_ACHIEVEMENTS } from "../../auth/questStorage";
import { EXPERIMENT_LIST } from "../../data/experimentsData";
import { createExperimentReportSnapshot } from "../../physics/reportGenerator";
import LabBackground, { OrbitGlow } from "./LabBackground";
import Logo from "./Logo";
import ProjectIntroModal from "./ProjectIntroModal";
import LabReportModal from "../HandForceLab/LabReportModal";

const ACHIEVEMENTS_DEF = [
  {
    id: "first_lab",
    emoji: "🏆",
    title: "First Experiment",
    description: "Completed your first lab",
    isUnlocked: (s) => s.completedCount >= 1
  },
  {
    id: "physics_explorer",
    emoji: "🔬",
    title: "Physics Explorer",
    description: "Explored 8+ concepts",
    isUnlocked: (s) => s.conceptsExplored >= 8
  },
  {
    id: "force_master",
    emoji: "⚡",
    title: "Force Master",
    description: "Scored 90%+ on a physics quiz",
    isUnlocked: (s) => s.bestScore >= 90
  },
  {
    id: "speed_learner",
    emoji: "🚀",
    title: "Speed Learner",
    description: "Completed 3 or more labs",
    isUnlocked: (s) => s.uniqueCompleted >= 3
  },
  {
    id: "streak_scholar",
    emoji: "🔥",
    title: "7 Day Streak",
    description: "Learned 7 days in a row",
    isUnlocked: (s) => s.streak >= 7
  },
];

const NAV_ITEMS = [
  { label: "Dashboard", href: "#top", icon: LayoutDashboard, active: true },
  { label: "Experiments", href: "#experiments", icon: FlaskConical },
  { label: "Progress", href: "#progress", icon: TrendingUp },
  { label: "AI Tutor", href: "#ai-tutor", icon: Bot },
];

function ProgressRing({ value }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="tpl-ring">
      <svg viewBox="0 0 120 120" className="tpl-ring-svg" aria-hidden="true">
        <defs>
          <linearGradient id="tpl-ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(103, 232, 249, 0.12)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#tpl-ring-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <div className="tpl-ring-label">
        <strong>{value}%</strong>
        <span>Progress</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const session = getSession();
  const userKey = session?.email || session?.id || "guest";
  const firstName = getDisplayName(session);
  const initials = getInitials(session);
  const [open, setOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [activeReportData, setActiveReportData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Dynamic statistics derived strictly from current user's isolated records
  const stats = getExperimentStats(userKey);

  const openReportForExp = (expId, record = null) => {
    const targetExpId = expId || 'newton';
    const expConfig = EXPERIMENT_LIST.find((e) => e.id === targetExpId) || EXPERIMENT_LIST[0];
    const rec = record || stats.history.find((h) => (h.experimentId === targetExpId || h.id === targetExpId));
    const scoreVal = rec?.score !== undefined ? rec.score : null;

    // 1. Check if user has a real saved experiment report snapshot for this lab
    const savedSnapshot = getExperimentReportSnapshot(expConfig.id, userKey);
    if (savedSnapshot) {
      if (scoreVal !== null) {
        savedSnapshot.mastery.score = scoreVal;
        savedSnapshot.mastery.isMastered = scoreVal >= 70;
        savedSnapshot.mastery.statusText = scoreVal >= 70 ? 'MASTERED' : 'NEEDS REVIEW';
        if (savedSnapshot.hasMeasurements) {
          savedSnapshot.badge.title = scoreVal >= 70 ? 'LAB VERIFIED & MASTERED' : 'EVALUATED (REVIEW RECOMMENDED)';
          savedSnapshot.badge.subtitle = `SCORE: ${scoreVal}%`;
          savedSnapshot.badge.type = scoreVal >= 70 ? 'verified' : 'evaluated';
        }
      }
      setActiveReportData(savedSnapshot);
      return;
    }

    // 2. Otherwise generate a dedicated snapshot for this experiment (awaiting empirical telemetry)
    const snapshot = createExperimentReportSnapshot({
      experimentId: expConfig.id,
      experiment: expConfig,
      quizResult: scoreVal !== null ? { score: scoreVal } : null,
      studentName: firstName || "Student Investigator",
      hasMeasurements: false
    });

    setActiveReportData(snapshot);
  };

  const questProfile = getQuestProfile(userKey);

  const allAchievementsList = [
    ...ACHIEVEMENTS_DEF.map((ach) => ({
      ...ach,
      unlocked: ach.isUnlocked(stats) || Boolean(questProfile?.achievements?.includes(ach.id))
    })),
    ...QUEST_ACHIEVEMENTS.map((qAch) => ({
      id: qAch.id,
      emoji: qAch.icon,
      title: qAch.title,
      description: qAch.description,
      unlocked: Boolean(questProfile?.achievements?.includes(qAch.id)) || qAch.check(questProfile)
    }))
  ];

  const evaluatedAchievements = allAchievementsList.filter(
    (a, idx, arr) => arr.findIndex((x) => x.id === a.id) === idx
  );
  const unlockedCount = evaluatedAchievements.filter((a) => a.unlocked).length;

  const statCards = [
    {
      label: "Quest Career Rank",
      value: `Lv. ${questProfile.level}`,
      unit: questProfile.title,
      icon: Award,
      delta: `${questProfile.currentXP} XP · ${questProfile.totalMissionsCompleted}/30 Missions`
    },
    {
      label: "Labs Mastered",
      value: `${stats.uniqueCompleted}/${stats.totalCount}`,
      icon: FlaskConical,
      delta: stats.overallProgress > 0 ? `${stats.overallProgress}% overall curriculum` : "0% curriculum progress"
    },
    {
      label: "Average Quiz Score",
      value: stats.completedCount > 0 ? `${stats.averageScore}` : "--",
      unit: stats.completedCount > 0 ? "%" : "",
      icon: Target,
      delta: stats.bestScore > 0 ? `Best: ${stats.bestScore}%` : "Best: --"
    },
    {
      label: "Learning Streak",
      value: `${Math.max(stats.streak, questProfile.streak)}`,
      unit: "Days",
      icon: Flame,
      delta: `${questProfile.totalPredictionsCompleted}/10 Hypotheses verified`
    },
  ];

  const currentExperiment = EXPERIMENT_LIST[0]; // Newton's 2nd Law
  const CATEGORIES = ["All", "Mechanics", "Electromagnetism", "Waves & Optics"];
  const filteredLabs = selectedCategory === "All"
    ? EXPERIMENT_LIST
    : EXPERIMENT_LIST.filter((exp) => exp.category === selectedCategory);

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const startLab = (expId = 'newton') => navigate(`/lab?exp=${expId}`);

  return (
    <div className="portal-root tpl-dash">
      <LabBackground withOrbit={false} />

      <header className="tpl-nav">
        <div className="tpl-nav-inner">
          <Link to="/dashboard" aria-label="Touchless Physics Lab home">
            <Logo size="sm" />
          </Link>

          <nav aria-label="Primary" className="tpl-nav-links">
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className={item.active ? "is-active" : ""} aria-current={item.active ? "page" : undefined}>
                    <item.icon aria-hidden="true" className="tpl-icon-sm" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="tpl-nav-actions">
            <span className="tpl-nav-welcome">
              Welcome, <strong>{firstName}</strong>
            </span>
            <a href="#profile" aria-label="Profile" className="tpl-avatar">
              {initials}
            </a>
            <button type="button" className="tpl-logout" onClick={logout}>
              <LogOut aria-hidden="true" className="tpl-icon-sm" />
              Logout
            </button>
            <button
              type="button"
              className="tpl-menu-btn"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="tpl-icon-sm" /> : <Menu className="tpl-icon-sm" />}
            </button>
          </div>
        </div>

        {open && (
          <nav id="mobile-nav" aria-label="Mobile" className="tpl-mobile-nav">
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <a href={item.href} onClick={() => setOpen(false)} className={item.active ? "is-active" : ""}>
                    <item.icon aria-hidden="true" className="tpl-icon-sm" />
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="tpl-mobile-footer">
                <a href="#profile">
                  <UserRound aria-hidden="true" className="tpl-icon-sm" />
                  Profile
                </a>
                <button type="button" onClick={logout}>
                  <LogOut aria-hidden="true" className="tpl-icon-sm" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main className="tpl-dash-main" id="top">
        <section className="tpl-glass tpl-hero tpl-rise">
          <OrbitGlow className="tpl-hero-orbit" />
          <div className="tpl-hero-fade" />
          <div className="tpl-hero-copy">
            <span className="tpl-pill">
              <span className="tpl-pill-dot" />
              Lab systems online
            </span>
            <h1>
              Welcome back, <span className="tpl-glow-text">{firstName}</span>{" "}
              <span aria-hidden="true">👋</span>
            </h1>
            <p>Ready to explore physics?</p>
            <div className="tpl-hero-actions">
              <button type="button" className="tpl-btn tpl-btn-primary" onClick={startLab}>
                <span className="tpl-shimmer" aria-hidden="true" />
                Start Experiment
                <ArrowRight aria-hidden="true" className="tpl-icon-sm" />
              </button>
              <button type="button" className="tpl-btn tpl-btn-secondary" onClick={() => setShowIntro(true)}>
                <Sparkles aria-hidden="true" className="tpl-icon-sm" />
                Platform Tour & Overview
              </button>
              <p className="tpl-hero-hint">
                <Hand aria-hidden="true" className="tpl-icon-sm" />
                Touchless mode · webcam or mouse fallback
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Your statistics" id="progress" className="tpl-stats">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <article
                key={stat.label}
                className="tpl-glass tpl-stat tpl-rise"
                style={{ animationDelay: `${120 + i * 80}ms` }}
              >
                <div className="tpl-stat-top">
                  <p>{stat.label}</p>
                  <span>
                    <Icon aria-hidden="true" className="tpl-icon-sm" />
                  </span>
                </div>
                <p className="tpl-stat-value">
                  {stat.value}
                  {stat.unit && <small>{stat.unit}</small>}
                </p>
                <p className="tpl-stat-delta">{stat.delta}</p>
              </article>
            );
          })}
        </section>

        {/* =========================================================
            ALL 10 PHYSICS LABS CATALOG
            ========================================================= */}
        <section id="experiments" className="tpl-glass tpl-all-labs tpl-rise" style={{ animationDelay: "320ms" }}>
          <div className="tpl-section-head">
            <h2>Interactive Physics Laboratories</h2>
            <span>{filteredLabs.length} of {EXPERIMENT_LIST.length} Modules</span>
          </div>

          <div className="tpl-category-tabs" role="tablist" aria-label="Experiment Categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`tpl-category-tab ${selectedCategory === cat ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'All' ? '🌐 All Labs' : cat === 'Mechanics' ? '⚙️ Mechanics' : cat === 'Electromagnetism' ? '⚡ Electromagnetism' : '🌊 Waves & Optics'}
                <span style={{ opacity: 0.7, fontSize: '10px' }}>
                  ({cat === 'All' ? EXPERIMENT_LIST.length : EXPERIMENT_LIST.filter(e => e.category === cat).length})
                </span>
              </button>
            ))}
          </div>

          <div className="tpl-labs-grid">
            {filteredLabs.map((exp) => {
              const record = stats.history.find(h => h.experimentId === exp.id && h.status === 'completed');
              const inProg = stats.history.find(h => h.experimentId === exp.id && h.status === 'in-progress');
              const isCompleted = Boolean(record);
              const missionsDone = Object.values(questProfile.completedMissions || {}).filter((m) => m.expId === exp.id).length;

              return (
                <div key={exp.id} className="tpl-glass tpl-lab-card">
                  <div>
                    <div className="tpl-lab-card-top">
                      <div className="tpl-lab-emoji">
                        <span>{exp.emoji}</span>
                      </div>
                      <span className={isCompleted ? "tpl-badge tpl-badge-ok" : inProg ? "tpl-badge tpl-badge-warn" : "tpl-badge"}>
                        {isCompleted ? <CheckCircle2 className="tpl-icon-xs" /> : <Loader className="tpl-icon-xs" />}
                        {isCompleted ? "Mastered" : inProg ? "In Progress" : "Ready"}
                      </span>
                    </div>

                    <h3>{exp.title}</h3>
                    <p className="tpl-lab-card-sub">{exp.subtitle}</p>
                    <p className="tpl-lab-desc">{exp.description}</p>

                    <div className="tpl-lab-formula">
                      <code>{exp.primaryFormula}</code>
                    </div>
                  </div>

                  <div className="tpl-lab-card-foot">
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="tpl-lab-score-pill">
                        {record ? `Score: ${record.score}%` : `Topic: ${exp.shortTitle}`}
                      </span>
                      <span
                        className="tpl-lab-score-pill"
                        style={{
                          color: missionsDone === 3 ? '#31f2a1' : '#38d9ff',
                          borderColor: missionsDone === 3 ? 'rgba(49, 242, 161, 0.3)' : 'rgba(56, 217, 255, 0.3)'
                        }}
                      >
                        🎯 Quest: {missionsDone}/3
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {isCompleted && (
                        <button
                          type="button"
                          className="tpl-btn-xs"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(56, 189, 248, 0.12)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                          onClick={() => openReportForExp(exp.id, record)}
                          title="View & Print Official Lab Report"
                        >
                          <FileText className="tpl-icon-xs" />
                          Report
                        </button>
                      )}
                      <button
                        type="button"
                        className="tpl-lab-launch-btn"
                        onClick={() => startLab(exp.id)}
                      >
                        Launch Lab
                        <ArrowRight className="tpl-icon-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="tpl-split tpl-rise" style={{ animationDelay: "400ms" }}>
          <article className="tpl-glass tpl-experiment">
            <div className="tpl-section-head">
              <h2>Active Lab Focus</h2>
              <span className="tpl-badge tpl-badge-warn">Touchless Mode</span>
            </div>
            <div className="tpl-experiment-body">
              <div>
                <p className="tpl-experiment-title">
                  <span aria-hidden="true">{currentExperiment.emoji}</span>
                  {currentExperiment.title}
                </p>
                <p className="tpl-learn-label">Core Concepts</p>
                <ul className="tpl-chips">
                  {currentExperiment.concepts.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <div className="tpl-progress-meta">
                  <span>Curriculum Progress</span>
                  <span>{stats.overallProgress}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={stats.overallProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Physics curriculum progress"
                  className="tpl-bar"
                >
                  <div style={{ width: `${stats.overallProgress}%` }} />
                </div>
              </div>
              <ProgressRing value={stats.overallProgress} />
            </div>
            <button type="button" className="tpl-btn tpl-btn-primary" onClick={() => startLab('newton')}>
              <span className="tpl-shimmer" aria-hidden="true" />
              Start Interactive Lab
              <ArrowRight aria-hidden="true" className="tpl-icon-sm" />
            </button>
          </article>

          <article id="ai-tutor" className="tpl-glass tpl-nova">
            <div className="tpl-nova-head">
              <div className="tpl-nova-avatar">
                <span aria-hidden="true">🤖</span>
              </div>
              <div>
                <h2>Dr. Nova</h2>
                <p>AI Physics Tutor & Lab Assistant</p>
              </div>
            </div>
            <p className="tpl-nova-quote">
              “Ask physics questions, verify simulations, get progressive hints, and understand every gesture interaction in real-time.”
            </p>
            <div className="tpl-nova-actions">
              <button type="button" className="tpl-btn tpl-btn-primary tpl-btn-full" onClick={() => startLab('newton')}>
                <span className="tpl-shimmer" aria-hidden="true" />
                <MessageSquareText aria-hidden="true" className="tpl-icon-sm" />
                Ask Dr. Nova in Lab
              </button>
              <button type="button" className="tpl-btn tpl-btn-secondary tpl-btn-full" onClick={() => startLab('newton')}>
                <Lightbulb aria-hidden="true" className="tpl-icon-sm" />
                Get Real-Time Hints
              </button>
            </div>
          </article>
        </div>

        <article className="tpl-glass tpl-recent tpl-rise" style={{ animationDelay: "500ms" }}>
          <div className="tpl-section-head">
            <h2>Recent Activity & Quiz Results</h2>
            <a href="#experiments">View all labs</a>
          </div>
          {stats.history.length === 0 ? (
            <div className="tpl-empty-activity">
              <p>No recent experiment activity</p>
              <span>Launch any laboratory above and complete the quiz to start recording your progress!</span>
            </div>
          ) : (
            <ul>
              {stats.history.slice(0, 4).map((exp) => {
                const done = exp.status === "completed";
                return (
                  <li key={exp.id || exp.topic} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button type="button" className="tpl-recent-row" style={{ flex: 1 }} onClick={() => startLab(exp.experimentId || 'newton')}>
                      <div>
                        <div className="tpl-recent-title">
                          <p>{exp.experimentName || exp.title}</p>
                          <span className={done ? "tpl-badge tpl-badge-ok" : "tpl-badge tpl-badge-warn"}>
                            {done ? <CheckCircle2 className="tpl-icon-xs" /> : <Loader className="tpl-icon-xs" />}
                            {done ? "Completed" : "In Progress"}
                          </span>
                        </div>
                        <p className="tpl-recent-meta">
                          {exp.topic} · {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className={`tpl-mini-bar ${done ? "is-ok" : "is-warn"}`}>
                        <div style={{ width: `${exp.score}%` }} />
                      </div>
                      <div className="tpl-recent-score">
                        <strong>{exp.score}%</strong>
                        <span>Score</span>
                      </div>
                      <ChevronRight aria-hidden="true" className="tpl-icon-sm tpl-chevron" />
                    </button>
                    {done && (
                      <button
                        type="button"
                        style={{
                          background: 'rgba(56, 189, 248, 0.12)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap'
                        }}
                        onClick={() => openReportForExp(exp.experimentId || exp.id || 'newton', exp)}
                        title="View & Print Official Lab Report"
                      >
                        <FileText className="tpl-icon-xs" />
                        Report
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="tpl-glass tpl-achievements tpl-rise" style={{ animationDelay: "560ms" }}>
          <div className="tpl-section-head">
            <h2>Achievements</h2>
            <span>
              {unlockedCount}/{ACHIEVEMENTS_DEF.length}
            </span>
          </div>
          <ul>
            {evaluatedAchievements.map((a) => (
              <li key={a.id} className={a.unlocked ? "is-unlocked" : "is-locked"}>
                <div className={`tpl-badge-gem ${a.unlocked ? "is-active" : "is-inactive"}`}>
                  <span aria-hidden="true">{a.emoji}</span>
                </div>
                <p>{a.title}</p>
                <small>{a.description}</small>
                {!a.unlocked && <span className="tpl-lock-tag">Locked</span>}
              </li>
            ))}
          </ul>
        </article>

        <footer className="tpl-dash-foot">Learn Physics. Move It. See It.</footer>
      </main>

      {/* Hackathon Project Presentation Modal */}
      {showIntro && <ProjectIntroModal onClose={() => setShowIntro(false)} />}

      {/* Official Lab Report Modal */}
      {activeReportData && (
        <LabReportModal
          reportSnapshot={activeReportData}
          onClose={() => setActiveReportData(null)}
        />
      )}
    </div>
  );
}
