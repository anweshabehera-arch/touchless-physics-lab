import {
  ArrowRight,
  Atom,
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
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, getDisplayName, getInitials, getSession } from "../../auth/authStorage";
import { getExperimentStats } from "../../auth/experimentStorage";
import { EXPERIMENT_LIST } from "../../data/experimentsData";
import LabBackground, { OrbitGlow } from "./LabBackground";
import Logo from "./Logo";

const ACHIEVEMENTS = [
  { emoji: "🏆", title: "First Experiment", description: "Completed your first lab" },
  { emoji: "🔬", title: "Physics Explorer", description: "Explored 25+ concepts" },
  { emoji: "⚡", title: "Force Master", description: "Scored 90%+ on force" },
  { emoji: "🚀", title: "Speed Learner", description: "3 labs in one day" },
  { emoji: "🔥", title: "7 Day Streak", description: "Learned 7 days in a row" },
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
  const firstName = getDisplayName(session);
  const initials = getInitials(session);
  const [open, setOpen] = useState(false);

  // Dynamic statistics from local experiment records
  const stats = useMemo(() => getExperimentStats(), []);

  const statCards = [
    { label: "Labs Completed", value: `${stats.uniqueCompleted}/${stats.totalCount}`, icon: FlaskConical, delta: `${stats.overallProgress}% overall curriculum` },
    { label: "Concepts Explored", value: `${stats.conceptsExplored}`, icon: Atom, delta: "+5 this week" },
    { label: "Average Score", value: `${stats.averageScore}`, unit: "%", icon: Target, delta: `Best: ${stats.bestScore}%` },
    { label: "Learning Streak", value: `${stats.streak}`, unit: "Days", icon: Flame, delta: "Personal best" },
  ];

  const currentExperiment = EXPERIMENT_LIST[0]; // Newton's 2nd Law

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
              <p className="tpl-hero-hint">
                <Hand aria-hidden="true" className="tpl-icon-sm" />
                Touchless mode · webcam required
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
            ALL 5 PHYSICS LABS CATALOG
            ========================================================= */}
        <section id="experiments" className="tpl-glass tpl-all-labs tpl-rise" style={{ animationDelay: "320ms" }}>
          <div className="tpl-section-head">
            <h2>Interactive Physics Laboratories</h2>
            <span>5 Interactive Modules</span>
          </div>
          <div className="tpl-labs-grid">
            {EXPERIMENT_LIST.map((exp) => {
              const record = stats.history.find(h => h.experimentId === exp.id && h.status === 'completed');
              const inProg = stats.history.find(h => h.experimentId === exp.id && h.status === 'in-progress');
              const isCompleted = Boolean(record);

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
                    <span className="tpl-lab-score-pill">
                      {record ? `Score: ${record.score}%` : `Topic: ${exp.shortTitle}`}
                    </span>
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
          <ul>
            {stats.history.slice(0, 4).map((exp) => {
              const done = exp.status === "completed";
              return (
                <li key={exp.id || exp.topic}>
                  <button type="button" className="tpl-recent-row" onClick={() => startLab(exp.experimentId || 'newton')}>
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
                </li>
              );
            })}
          </ul>
        </article>

        <article className="tpl-glass tpl-achievements tpl-rise" style={{ animationDelay: "560ms" }}>
          <div className="tpl-section-head">
            <h2>Achievements</h2>
            <span>
              {ACHIEVEMENTS.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <ul>
            {ACHIEVEMENTS.map((a) => (
              <li key={a.title}>
                <div className="tpl-badge-gem">
                  <span aria-hidden="true">{a.emoji}</span>
                </div>
                <p>{a.title}</p>
                <small>{a.description}</small>
              </li>
            ))}
          </ul>
        </article>

        <footer className="tpl-dash-foot">Learn Physics. Move It. See It.</footer>
      </main>
    </div>
  );
}
