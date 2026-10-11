import { useState } from 'react';
import { analyzeObservation } from '../../services/physicsAI';

export default function ObservationAnalysis({
  getLabSnapshot,
  defaultExperiment = 'Particle Field Dynamics'
}) {
  const [experimentName, setExperimentName] = useState(defaultExperiment);

  const [data, setData] = useState({
    mass: '0.05',
    force: '1.2',
    acceleration: '24.0',
    velocity: '3.8',
    displacement: '0.15',
    time: '0.25',
    particleCount: '2000'
  });

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [snapshotAlert, setSnapshotAlert] = useState(null);

  const handleInputChange = (field, val) => {
    setData((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  // Pull real-time snapshot safely from the Three.js / MediaPipe simulation
  const handleLoadSimulationSnapshot = () => {
    if (!getLabSnapshot) {
      setSnapshotAlert('Live simulation snapshot not connected.');
      return;
    }

    try {
      const snap = getLabSnapshot();

      if (!snap) {
        setSnapshotAlert('No live simulation data available.');
        return;
      }

      const liveMass = Number(snap.mass ?? 0);
      const liveForce = Number(snap.estimatedForce ?? 0);
      const liveAccel = Number(snap.estimatedAcceleration ?? 0);
      const liveVel = Number(snap.averageVelocity ?? 0);
      const liveDisp = Number(snap.displacement ?? 0);
      const liveTime = Number(snap.time ?? 0);
      const liveParticles = Number(snap.particleCount ?? 1);

      setData({
        mass: liveMass.toString(),
        force: liveForce.toString(),
        acceleration: liveAccel.toString(),
        velocity: liveVel.toString(),
        displacement: liveDisp.toString(),
        time: liveTime.toString(),
        particleCount: liveParticles.toString()
      });

      if (snap.experimentName) {
        setExperimentName(snap.experimentName);
      }

      setResult(null);

      setSnapshotAlert(
        `✓ Live snapshot captured — Mass: ${liveMass} kg, Force: ${liveForce} N, Acceleration: ${liveAccel} m/s²`
      );

      setTimeout(() => setSnapshotAlert(null), 4000);
    } catch (err) {
      setSnapshotAlert(
        'Could not read simulation telemetry: ' + err.message
      );
    }
  };

  const handleApplyPreset = (presetType) => {
    if (presetType === 'newton') {
      setExperimentName("Newton's Second Law Lab");
      setData({
        mass: '0.10',
        force: '2.50',
        acceleration: '25.0',
        velocity: '5.0',
        displacement: '0.50',
        time: '0.20',
        particleCount: '2000'
      });
      setNotes('Direct open-palm forward push');
    } else if (presetType === 'shockwave') {
      setExperimentName('Impulse & Shockwave Dynamics');
      setData({
        mass: '0.05',
        force: '6.00',
        acceleration: '120.0',
        velocity: '12.0',
        displacement: '0.80',
        time: '0.07',
        particleCount: '2000'
      });
      setNotes('High-velocity swipe exceeding trigger threshold');
    } else if (presetType === 'hooke') {
      setExperimentName("Hooke's Law Elastic Return");
      setData({
        mass: '0.05',
        force: '0.90',
        acceleration: '18.0',
        velocity: '2.4',
        displacement: '0.18',
        time: '0.35',
        particleCount: '2000'
      });
      setNotes('Displaced outer ring snapping back to equilibrium');
    } else if (presetType === 'insufficient') {
      setExperimentName('Incomplete Test');
      setData({
        mass: '0.5',
        force: '',
        acceleration: '',
        velocity: '',
        displacement: '',
        time: '',
        particleCount: '2000'
      });
      setNotes('Only mass recorded without forces or kinematic values');
    }
  };

  const handleClear = () => {
    setData({
      mass: '',
      force: '',
      acceleration: '',
      velocity: '',
      displacement: '',
      time: '',
      particleCount: '2000'
    });

    setResult(null);
    setError(null);
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await analyzeObservation(
        experimentName,
        data,
        notes
      );

      setResult(res);
    } catch (err) {
      setError(err.message || 'Observation analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="observation-analysis-container">
      <div className="analysis-intro">
        <div className="intro-title">
          <span>📊 OBSERVATION ANALYSIS ENGINE</span>
        </div>

        <p className="intro-sub">
          Feed recorded kinematics and dynamics values to the AI.
          Dr. Nova compares your observations against classical physics
          laws without fabricating data.
        </p>
      </div>

      {/* Snapshot and Presets Bar */}
      <div className="snapshot-presets-bar">
        <button
          type="button"
          className="btn-snapshot"
          onClick={handleLoadSimulationSnapshot}
          title="Capture current simulation numbers"
        >
          ⚡ Capture Simulation Snapshot
        </button>

        <div className="presets-group">
          <span className="preset-label">Presets:</span>

          <button
            type="button"
            className="btn-preset-pill"
            onClick={() => handleApplyPreset('newton')}
          >
            Newton Push
          </button>

          <button
            type="button"
            className="btn-preset-pill"
            onClick={() => handleApplyPreset('shockwave')}
          >
            Shockwave
          </button>

          <button
            type="button"
            className="btn-preset-pill"
            onClick={() => handleApplyPreset('hooke')}
          >
            Hooke's Ring
          </button>

          <button
            type="button"
            className="btn-preset-pill"
            onClick={() => handleApplyPreset('insufficient')}
          >
            Incomplete Data
          </button>
        </div>
      </div>

      {snapshotAlert && (
        <div className="snapshot-toast">
          {snapshotAlert}
        </div>
      )}

      {/* Data Input Form */}
      <form onSubmit={handleAnalyze} className="observation-form">
        <div className="form-group-full">
          <label htmlFor="exp-name-input">
            Experiment Name:
          </label>

          <input
            id="exp-name-input"
            type="text"
            className="obs-input"
            value={experimentName}
            onChange={(e) => setExperimentName(e.target.value)}
            placeholder="e.g. Hand Repulsion Dynamics"
          />
        </div>

        <div className="obs-grid">
          <div className="obs-field">
            <label htmlFor="mass-input">
              Mass (m) [kg]
            </label>

            <input
              id="mass-input"
              type="number"
              step="any"
              placeholder="e.g. 0.05"
              className="obs-input"
              value={data.mass}
              onChange={(e) =>
                handleInputChange('mass', e.target.value)
              }
            />
          </div>

          <div className="obs-field">
            <label htmlFor="force-input">
              Force (F) [N]
            </label>

            <input
              id="force-input"
              type="number"
              step="any"
              placeholder="e.g. 1.20"
              className="obs-input"
              value={data.force}
              onChange={(e) =>
                handleInputChange('force', e.target.value)
              }
            />
          </div>

          <div className="obs-field">
            <label htmlFor="accel-input">
              Acceleration (a) [m/s²]
            </label>

            <input
              id="accel-input"
              type="number"
              step="any"
              placeholder="e.g. 24.0"
              className="obs-input"
              value={data.acceleration}
              onChange={(e) =>
                handleInputChange('acceleration', e.target.value)
              }
            />
          </div>

          <div className="obs-field">
            <label htmlFor="vel-input">
              Velocity (v) [m/s]
            </label>

            <input
              id="vel-input"
              type="number"
              step="any"
              placeholder="e.g. 3.8"
              className="obs-input"
              value={data.velocity}
              onChange={(e) =>
                handleInputChange('velocity', e.target.value)
              }
            />
          </div>

          <div className="obs-field">
            <label htmlFor="disp-input">
              Displacement (Δx) [m]
            </label>

            <input
              id="disp-input"
              type="number"
              step="any"
              placeholder="e.g. 0.15"
              className="obs-input"
              value={data.displacement}
              onChange={(e) =>
                handleInputChange('displacement', e.target.value)
              }
            />
          </div>

          <div className="obs-field">
            <label htmlFor="time-input">
              Time (Δt) [s]
            </label>

            <input
              id="time-input"
              type="number"
              step="any"
              placeholder="e.g. 0.25"
              className="obs-input"
              value={data.time}
              onChange={(e) =>
                handleInputChange('time', e.target.value)
              }
            />
          </div>

          <div className="obs-field">
            <label htmlFor="count-input">
              Particles Count
            </label>

            <input
              id="count-input"
              type="number"
              className="obs-input"
              value={data.particleCount}
              onChange={(e) =>
                handleInputChange('particleCount', e.target.value)
              }
            />
          </div>

          <div className="obs-field">
            <label htmlFor="notes-input">
              Observation Notes
            </label>

            <input
              id="notes-input"
              type="text"
              placeholder="e.g. Smooth outward repulsion"
              className="obs-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="obs-actions">
          <button
            type="submit"
            className="btn-analyze-submit"
            disabled={loading}
          >
            {loading
              ? '🔬 Analyzing Physics Data...'
              : '📊 Run AI Observation Analysis'}
          </button>

          <button
            type="button"
            className="btn-obs-clear"
            onClick={handleClear}
          >
            Clear Fields
          </button>
        </div>
      </form>

      {error && (
        <div className="obs-error-card">
          ⚠️ <strong>Analysis Error:</strong> {error}
        </div>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="obs-results-card">
          <div className="results-header">
            <div className="results-badge">
              {result.dataSufficiency === 'sufficient' ? (
                <span className="badge-sufficient">
                  ✓ SUFFICIENT DATA RECORDED
                </span>
              ) : (
                <span className="badge-insufficient">
                  ⚠️ INSUFFICIENT DATA
                </span>
              )}
            </div>

            <span className="results-timestamp">
              Verified by Dr. Nova
            </span>
          </div>

          {/* Insufficient Data Warning Notice */}
          {result.dataSufficiency === 'insufficient' ? (
            <div className="insufficient-alert-box">
              <h4>⚠️ Honest Scientific Data Policy</h4>

              <p>
                {result.missingDataNotes ||
                  'At least two related physical variables are required to analyze motion or forces.'}
              </p>

              <p className="sub-note">
                <em>{result.interpretation}</em>
              </p>

              <div className="tip-box">
                💡 <strong>Try this:</strong> Click the
                "Newton Push" preset above or use
                "Capture Simulation Snapshot" to load recorded values.
              </div>
            </div>
          ) : (
            <div className="sufficient-analysis-body">
              {/* Summary */}
              <div className="analysis-summary-block">
                <h4>Observation Summary</h4>
                <p>{result.summary}</p>
              </div>

              {/* Physical Meaning of Values */}
              <div className="interpretation-block">
                <h4>Physical Meaning of Measurements</h4>
                <p>{result.interpretation}</p>
              </div>

              {/* Theoretical vs Observed Comparison */}
              {result.theoreticalComparison && (
                <div className="theory-comparison-card">
                  <div className="theory-header">
                    <strong>
                      ⚖️ Theoretical Model vs Lab Observation
                    </strong>

                    {result.theoreticalComparison.formulaUsed && (
                      <code className="theory-formula">
                        {result.theoreticalComparison.formulaUsed}
                      </code>
                    )}
                  </div>

                  <div className="theory-values-row">
                    <div className="theory-stat">
                      <span>THEORETICAL EXPECTED</span>

                      <strong>
                        {result.theoreticalComparison.expectedValue ||
                          'N/A'}
                      </strong>
                    </div>

                    <div className="theory-vs-divider">
                      VS
                    </div>

                    <div className="theory-stat">
                      <span>LAB OBSERVED</span>

                      <strong className="stat-observed">
                        {result.theoreticalComparison.observedValue ||
                          'N/A'}
                      </strong>
                    </div>

                    <div className="theory-stat">
                      <span>CORRELATION / STATUS</span>

                      <strong className="stat-agreement">
                        {result.theoreticalComparison.agreement ||
                          'Analyzed'}
                      </strong>
                    </div>
                  </div>

                  {result.theoreticalComparison.explanation && (
                    <p className="theory-explanation">
                      {result.theoreticalComparison.explanation}
                    </p>
                  )}
                </div>
              )}

              {/* Takeaway */}
              {result.takeaway && (
                <div className="takeaway-banner">
                  <span className="takeaway-icon">🎯</span>

                  <div>
                    <strong>
                      Scientific Key Takeaway:
                    </strong>

                    <p>{result.takeaway}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}