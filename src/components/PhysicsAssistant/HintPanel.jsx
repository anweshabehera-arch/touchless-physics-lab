import { useState } from 'react';
import { getPhysicsHint } from '../../services/physicsAI';

const PRESET_PROBLEMS = [
  {
    id: 'p1',
    title: 'Hand Acceleration (Newton 2nd)',
    problem: 'In the Touchless Lab, a 0.05 kg particle cluster experiences a net repulsive force of 1.20 N from an approaching hand. Calculate the initial acceleration of the particles.'
  },
  {
    id: 'p2',
    title: 'Elastic Spring Return (Hooke)',
    problem: 'Particles are displaced 0.18 m away from their home equilibrium ring. If the virtual spring constant is k = 15 N/m, calculate the magnitude of the restoring force pulling them back.'
  },
  {
    id: 'p3',
    title: 'Shockwave Impulse (Momentum)',
    problem: 'A rapid hand swipe triggers a shockwave delivering an impulse of 0.35 N·s to a 0.07 kg cluster initially at rest. Calculate the velocity of the cluster right after the shockwave.'
  },
  {
    id: 'p4',
    title: 'Kinetic Energy & Work',
    problem: 'A 0.02 kg particle at rest accelerates to a velocity of 4.5 m/s across a distance of 0.25 m. Calculate its final kinetic energy and the average net force exerted on it.'
  }
];

export default function HintPanel({ onReadAloud }) {
  const [problemText, setProblemText] = useState(PRESET_PROBLEMS[0].problem);
  const [currentLevel, setCurrentLevel] = useState(0); // 0 = no hint yet, 1, 2, 3
  const [hintsHistory, setHintsHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fullSolutionRevealed, setFullSolutionRevealed] = useState(false);
  const [solutionData, setSolutionData] = useState(null);

  const handleSelectPreset = (p) => {
    setProblemText(p.problem);
    setCurrentLevel(0);
    setHintsHistory([]);
    setFullSolutionRevealed(false);
    setSolutionData(null);
    setError(null);
  };

  const handleGetHint = async () => {
    if (!problemText.trim()) {
      setError('Please enter or select a physics problem first.');
      return;
    }

    const nextLevel = Math.min(3, currentLevel + 1);
    setLoading(true);
    setError(null);

    try {
      const res = await getPhysicsHint(problemText, nextLevel, false);
      setCurrentLevel(nextLevel);
      setHintsHistory(prev => [
        ...prev.filter(h => h.level !== nextLevel),
        {
          level: nextLevel,
          text: res.hint,
          formula: res.formulaHint,
          guidance: res.nextStepGuidance
        }
      ]);
    } catch (err) {
      setError(err.message || 'Failed to fetch hint.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevealSolution = async () => {
    if (!problemText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getPhysicsHint(problemText, 3, true);
      setSolutionData(res);
      setFullSolutionRevealed(true);
    } catch (err) {
      setError(err.message || 'Failed to generate solution.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentLevel(0);
    setHintsHistory([]);
    setFullSolutionRevealed(false);
    setSolutionData(null);
    setError(null);
  };

  return (
    <div className="hint-panel-container">
      <div className="hint-intro">
        <div className="hint-header-title">
          <span>💡 SOCRATIC AI HINT TUTOR</span>
        </div>
        <p className="hint-sub">
          Learn by solving! Rather than spoiling the answer immediately, Dr. Nova gives progressive clues so you can solve it yourself. Complete solutions are only revealed when requested.
        </p>
      </div>

      {/* Preset Problem Buttons */}
      <div className="problem-presets-row">
        <span className="preset-label">Lab Practice Problems:</span>
        <div className="problem-chips">
          {PRESET_PROBLEMS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`problem-chip ${problemText === p.problem ? 'chip-active' : ''}`}
              onClick={() => handleSelectPreset(p)}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Input / Editor */}
      <div className="problem-input-group">
        <label htmlFor="problem-textarea">Physics Problem to Solve:</label>
        <textarea
          id="problem-textarea"
          className="problem-textarea"
          rows={3}
          value={problemText}
          onChange={(e) => {
            setProblemText(e.target.value);
            setCurrentLevel(0);
            setHintsHistory([]);
            setFullSolutionRevealed(false);
          }}
          placeholder="Paste or type a physics problem here..."
        />
      </div>

      {/* Hint Progression Meter */}
      <div className="hint-meter-card">
        <div className="meter-label">
          <span>HINT PROGRESSION:</span>
          <strong>
            {fullSolutionRevealed
              ? 'FULL SOLUTION REVEALED'
              : currentLevel === 0
              ? 'No Hints Requested Yet'
              : `Level ${currentLevel} of 3`}
          </strong>
        </div>

        <div className="meter-dots-row">
          <div className={`meter-dot ${currentLevel >= 1 ? 'dot-active' : ''}`}>
            <span>1</span>
            <small>Concept</small>
          </div>
          <div className="meter-connector" />
          <div className={`meter-dot ${currentLevel >= 2 ? 'dot-active' : ''}`}>
            <span>2</span>
            <small>Formula</small>
          </div>
          <div className="meter-connector" />
          <div className={`meter-dot ${currentLevel >= 3 ? 'dot-active' : ''}`}>
            <span>3</span>
            <small>Algebra</small>
          </div>
        </div>
      </div>

      {/* Hint Actions */}
      <div className="hint-actions-row">
        <button
          type="button"
          className="btn-give-hint"
          onClick={handleGetHint}
          disabled={loading || currentLevel >= 3 || fullSolutionRevealed}
        >
          {loading && !fullSolutionRevealed
            ? '🤔 Thinking...'
            : currentLevel === 0
            ? '💡 Give me a Hint'
            : currentLevel < 3
            ? `💡 Give me Next Hint (Level ${currentLevel + 1})`
            : '✓ All Hints Given'}
        </button>

        <button
          type="button"
          className="btn-reveal-solution"
          onClick={handleRevealSolution}
          disabled={loading || fullSolutionRevealed}
        >
          {loading && fullSolutionRevealed ? 'Revealing...' : '🔓 Reveal Complete Solution'}
        </button>

        {(currentLevel > 0 || fullSolutionRevealed) && (
          <button type="button" className="btn-hint-reset" onClick={handleReset}>
            ↺ Reset
          </button>
        )}
      </div>

      {error && <div className="hint-error-banner">⚠️ {error}</div>}

      {/* Active Hints History */}
      {hintsHistory.length > 0 && !fullSolutionRevealed && (
        <div className="hints-stack">
          {hintsHistory.map((h) => (
            <div key={h.level} className="hint-bubble-card">
              <div className="hint-bubble-header">
                <span className="hint-level-tag">
                  {h.level === 1 ? '🌱 LEVEL 1: CONCEPTUAL NUDGE' : h.level === 2 ? '📐 LEVEL 2: FORMULA GUIDANCE' : '🔍 LEVEL 3: ALGEBRAIC SETUP'}
                </span>
                {onReadAloud && (
                  <button
                    type="button"
                    className="btn-hint-speak"
                    onClick={() => onReadAloud(h.text)}
                    title="Read this hint aloud"
                  >
                    🔊 Listen
                  </button>
                )}
              </div>

              <div className="hint-bubble-text">
                <p>{h.text}</p>
              </div>

              {h.formula && (
                <div className="hint-formula-box">
                  <code>{h.formula}</code>
                </div>
              )}

              {h.guidance && (
                <div className="hint-next-step">
                  <strong>👉 Next Step:</strong> {h.guidance}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Complete Solution Card */}
      {fullSolutionRevealed && solutionData && (
        <div className="solution-revealed-card">
          <div className="solution-header">
            <strong>🔓 Complete Step-by-Step Physics Solution</strong>
            {onReadAloud && (
              <button
                type="button"
                className="btn-hint-speak"
                onClick={() => onReadAloud(solutionData.hint)}
                title="Read solution aloud"
              >
                🔊 Read Solution
              </button>
            )}
          </div>

          <div className="solution-content">
            <p className="solution-text">{solutionData.hint}</p>

            {solutionData.formulaHint && (
              <div className="solution-formula-callout">
                <span>Governing Equations:</span>
                <code>{solutionData.formulaHint}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
