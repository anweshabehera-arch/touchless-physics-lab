import React from 'react';
import { BookOpen, Hand, Check, Sparkles, ArrowRight } from 'lucide-react';

export default function HowToPerformModal({ experiment, isOpen, onClose }) {
  if (!isOpen || !experiment) return null;

  return (
    <div className="how-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="how-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="how-modal-header">
          <div className="how-header-badge">
            <span className="how-icon">{experiment.emoji}</span>
            <div>
              <h3>How to Perform: {experiment.title}</h3>
              <p>{experiment.subtitle}</p>
            </div>
          </div>
          <button type="button" className="quiz-close-btn" onClick={onClose} aria-label="Close Guide">
            ✕
          </button>
        </div>

        <div className="how-body">
          {/* Concept Banner */}
          <div className="how-concept-banner">
            <div className="concept-tag-row">
              <span className="formula-pill">Formula: {experiment.primaryFormula}</span>
              {experiment.secondaryFormula && (
                <span className="formula-pill secondary">{experiment.secondaryFormula}</span>
              )}
            </div>
            <p className="concept-desc">{experiment.description}</p>
          </div>

          {/* Steps List */}
          <h4 className="how-steps-heading">
            <Hand className="btn-icon-sm" /> Gesture Execution Sequence
          </h4>

          <div className="how-steps-grid">
            {experiment.howToSteps.map((step) => (
              <div key={step.step} className="how-step-item">
                <div className="step-num-col">
                  <span className="step-num-badge">{step.step}</span>
                </div>
                <div className="step-content-col">
                  <div className="step-top-row">
                    <strong>{step.title}</strong>
                    <span className="gesture-tag">{step.gesture}</span>
                  </div>
                  <p className="step-detail-text">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Gesture Cheat Sheet */}
          <div className="gesture-cheat-sheet">
            <div className="cheat-header">
              <Sparkles className="btn-icon-sm" /> Universal Lab Hand Gestures:
            </div>
            <div className="cheat-grid">
              <div className="cheat-pill">
                <strong>🖐️ Open Palm:</strong> Push / Move Force Field
              </div>
              <div className="cheat-pill">
                <strong>💨 Fast Swipe:</strong> High-Energy Impulse Strike
              </div>
              <div className="cheat-pill">
                <strong>✊ Fist:</strong> Freeze / Pause Time
              </div>
              <div className="cheat-pill">
                <strong>🤏 Pinch:</strong> Adjust Interaction Radius / Aim
              </div>
            </div>
          </div>
        </div>

        <div className="how-modal-footer">
          <button type="button" className="btn-how-start" onClick={onClose}>
            <Check className="btn-icon-sm" />
            I'm Ready — Enter Simulation
          </button>
        </div>
      </div>
    </div>
  );
}
