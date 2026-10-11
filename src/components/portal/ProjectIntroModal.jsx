import { Hand, Bot, Compass, X, ArrowRight } from 'lucide-react';

export default function ProjectIntroModal({ isOpen = true, onClose, onLaunchLab }) {
  if (!isOpen) return null;

  return (
    <div className="quiz-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="quiz-modal-card project-intro-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px' }}
      >
        <div className="quiz-modal-header">
          <div className="quiz-header-badge">
            <span className="quiz-icon">⚛</span>
            <div>
              <h3>Touchless Physics Lab</h3>
              <p>Hackathon AI Physics Learning Platform Overview</p>
            </div>
          </div>
          <button type="button" className="quiz-close-btn" onClick={onClose} aria-label="Close Overview">
            <X className="btn-icon-xs" />
          </button>
        </div>

        <div className="project-intro-body">
          {/* 1. Problem Solved */}
          <div className="intro-block">
            <h4>🎯 The Problem We Solve</h4>
            <p>
              Physics concepts like Newton's Laws, impulse, spring restoration, momentum conservation,
              and 2D kinematics are often taught using static formulas on paper. Without physical laboratory equipment,
              students struggle to connect abstract algebraic equations ($F = ma$, $J = \Delta p$, $F = -kx$) with real-world physical intuition.
            </p>
          </div>

          {/* 2. Three Pillar Architecture */}
          <div className="intro-pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon-wrap" style={{ background: 'rgba(56, 217, 255, 0.15)', color: '#38d9ff' }}>
                <Hand className="btn-icon-sm" />
              </div>
              <h5>1. Touchless Vision Tracking</h5>
              <p>
                Uses MediaPipe machine learning in the browser to track 21 hand joints at 60 FPS.
                Your palm proximity, hand velocity, fists, and pinches directly apply real physical forces
                in a 3D Three.js environment without any physical equipment.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-wrap" style={{ background: 'rgba(49, 242, 161, 0.15)', color: '#31f2a1' }}>
                <Compass className="btn-icon-sm" />
              </div>
              <h5>2. Real-Time Mechanics & Graphs</h5>
              <p>
                Calculates numerical integration of classical equations of motion on every frame.
                Live vector arrows and telemetry plots render force, acceleration, momentum, and trajectories
                in real time with exact physical SI units.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-wrap" style={{ background: 'rgba(255, 187, 51, 0.15)', color: '#ffbb33' }}>
                <Bot className="btn-icon-sm" />
              </div>
              <h5>3. Dr. Nova AI Physics Tutor</h5>
              <p>
                Connects to OpenAI GPT-4o-mini with an intelligent local physics knowledge engine fallback.
                Dr. Nova observes your real telemetry, gives Socratic hints, explains observations,
                and clarifies quiz misconceptions without spoiling answers.
              </p>
            </div>
          </div>

          {/* 3. Demo Workflow */}
          <div className="intro-block">
            <h4>🚀 Recommended Demo Workflow</h4>
            <ol className="demo-steps-list">
              <li>
                <strong>1. Launch an Experiment:</strong> Choose any of the 5 labs (Newton, Impulse, Hooke, Collisions, Projectile).
              </li>
              <li>
                <strong>2. Start Guided Mode:</strong> Follow step-by-step instructions with real-time goal checks and expected observations.
              </li>
              <li>
                <strong>3. Interact:</strong> Use hand gestures in front of the webcam, or use mouse sliders and buttons.
              </li>
              <li>
                <strong>4. Read Live Graphs:</strong> Watch real simulation data plot in real time with theoretical reference curves.
              </li>
              <li>
                <strong>5. Ask Dr. Nova:</strong> Click the AI Assistant or use voice controls to ask questions about your observations.
              </li>
              <li>
                <strong>6. Complete Quiz & Generate Report:</strong> Test your mastery and generate a formal, printable lab report!
              </li>
            </ol>
          </div>

          {/* Footer CTA */}
          <div className="intro-modal-footer">
            <button
              type="button"
              className="btn-quiz-next"
              onClick={() => {
                onClose();
                onLaunchLab?.('newton');
              }}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Start Interactive Physics Lab
              <ArrowRight className="btn-icon-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
