import { useState, useEffect } from 'react';
import { getExperimentGuide } from '../../services/physicsAI';

export default function ExperimentGuide({ onSendToAnalyze }) {
  const [experiments, setExperiments] = useState([
    { id: 'newton_second_law', name: "Newton's 2nd Law & Acceleration" },
    { id: 'momentum_shockwave', name: "Impulse, Momentum & Shockwaves" },
    { id: 'hookes_law', name: "Hooke's Law & Elastic Springs" },
    { id: 'collision_momentum', name: "Collisions & Momentum Conservation" },
    { id: 'projectile_motion', name: "Projectile Motion & Trajectory" },
    { id: 'simple_pendulum', name: "Simple Harmonic Pendulum" },
    { id: 'electric_field', name: "Electric Field & Point Charges" },
    { id: 'wave_interference', name: "Wave Interference & Superposition" },
    { id: 'optics_refraction', name: "Reflection & Refraction (Snell's Law)" },
    { id: 'inclined_plane', name: "Friction & Inclined Plane Dynamics" }
  ]);
  const [selectedExpId, setSelectedExpId] = useState('newton_second_law');
  const [currentStep, setCurrentStep] = useState(1);
  const [guideData, setGuideData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // In-step student question
  const [stepQuery, setStepQuery] = useState('');
  const [stepAnswer, setStepAnswer] = useState(null);
  const [askingQuery, setAskingQuery] = useState(false);

  // Fetch guide whenever experiment or step changes
  useEffect(() => {
    let isMounted = true;
    const loadStep = async () => {
      setLoading(true);
      setError(null);
      setStepAnswer(null);
      try {
        const res = await getExperimentGuide(selectedExpId, currentStep);
        if (isMounted) {
          setGuideData(res);
          if (res.availableExperiments) {
            setExperiments(res.availableExperiments);
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStep();
    return () => {
      isMounted = false;
    };
  }, [selectedExpId, currentStep]);

  const handleNextStep = () => {
    if (guideData && currentStep < guideData.totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleResetExperiment = () => {
    setCurrentStep(1);
    setStepQuery('');
    setStepAnswer(null);
  };

  const handleAskStepQuestion = async (e) => {
    e?.preventDefault();
    if (!stepQuery.trim()) return;

    setAskingQuery(true);
    try {
      const res = await getExperimentGuide(selectedExpId, currentStep, stepQuery);
      setStepAnswer(res.queryAnswer || 'No specific answer received.');
    } catch (err) {
      setStepAnswer(`Error: ${err.message}`);
    } finally {
      setAskingQuery(false);
    }
  };

  return (
    <div className="experiment-guide-container">
      {/* Experiment Selector */}
      <div className="guide-header-bar">
        <label htmlFor="exp-select" className="guide-select-label">
          🧪 SELECT EXPERIMENT:
        </label>
        <select
          id="exp-select"
          className="guide-exp-select"
          value={selectedExpId}
          onChange={(e) => {
            setSelectedExpId(e.target.value);
            setCurrentStep(1);
          }}
        >
          {experiments.map((exp) => (
            <option key={exp.id} value={exp.id}>
              {exp.name}
            </option>
          ))}
        </select>
      </div>

      {loading && !guideData ? (
        <div className="guide-loading-skeleton">
          <div className="spinner-cyan" />
          <span>Loading Experiment Guide...</span>
        </div>
      ) : error ? (
        <div className="guide-error-box">
          <p>⚠️ {error}</p>
          <button type="button" className="btn-retry" onClick={() => setCurrentStep(currentStep)}>
            Retry Step
          </button>
        </div>
      ) : guideData ? (
        <div className="guide-content-card">
          {/* Progress Dots */}
          <div className="step-stepper">
            <div className="stepper-dots">
              {Array.from({ length: guideData.totalSteps }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`stepper-dot ${i + 1 === currentStep ? 'current' : i + 1 < currentStep ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(i + 1)}
                  title={`Jump to Step ${i + 1}`}
                >
                  {i + 1 < currentStep ? '✓' : i + 1}
                </button>
              ))}
            </div>
            <span className="step-counter-badge">
              STEP {currentStep} OF {guideData.totalSteps}
            </span>
          </div>

          {/* Current Step Title & Instruction */}
          <div className="step-main-card">
            <h3 className="step-title">
              <span className="step-num">#{currentStep}</span> {guideData.title}
            </h3>

            <div className="instruction-box">
              <div className="instruction-icon">📋</div>
              <p className="instruction-text">{guideData.instruction}</p>
            </div>

            {/* Physics Concept & Formula */}
            <div className="concept-callout">
              <div className="concept-header">
                <strong>⚛ Physics Principle</strong>
                {guideData.formula && <code className="formula-chip">{guideData.formula}</code>}
              </div>
              <p className="concept-desc">{guideData.physicsConcept}</p>
            </div>

            {/* Action Tip */}
            {guideData.actionTip && (
              <div className="action-tip-box">
                <span className="tip-badge">💡 LAB TIP</span>
                <span>{guideData.actionTip}</span>
              </div>
            )}
          </div>

          {/* Step Navigation Controls */}
          <div className="guide-nav-buttons">
            <button
              type="button"
              className="nav-btn prev-btn"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
            >
              ← Previous
            </button>

            <button
              type="button"
              className="nav-btn reset-btn"
              onClick={handleResetExperiment}
              title="Restart from Step 1"
            >
              ↺ Restart
            </button>

            {currentStep < guideData.totalSteps ? (
              <button
                type="button"
                className="nav-btn next-btn"
                onClick={handleNextStep}
              >
                Next Step →
              </button>
            ) : (
              <button
                type="button"
                className="nav-btn finish-btn"
                onClick={() => onSendToAnalyze && onSendToAnalyze({ experimentName: guideData.experimentName })}
              >
                📊 Analyze Observation →
              </button>
            )}
          </div>

          {/* Ask Question during Experiment */}
          <div className="step-qa-section">
            <div className="qa-header">
              <span>❓ Have a question about this step?</span>
            </div>

            <form onSubmit={handleAskStepQuestion} className="step-qa-form">
              <input
                type="text"
                className="step-qa-input"
                placeholder="e.g. Why did acceleration increase? What does mass do?"
                value={stepQuery}
                onChange={(e) => setStepQuery(e.target.value)}
              />
              <button
                type="submit"
                className="step-qa-submit"
                disabled={askingQuery || !stepQuery.trim()}
              >
                {askingQuery ? '...' : 'Ask AI'}
              </button>
            </form>

            {stepAnswer && (
              <div className="step-qa-answer">
                <div className="assistant-tag">⚛ Dr. Nova:</div>
                <p>{stepAnswer}</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
