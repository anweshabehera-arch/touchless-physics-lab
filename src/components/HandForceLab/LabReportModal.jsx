import { Printer, Award, X, FlaskConical } from 'lucide-react';
import { EXPERIMENT_LIST } from '../../data/experimentsData';

export default function LabReportModal({
  isOpen = true,
  onClose,
  experiment: expProp,
  reportData,
  physicsData = {},
  quizResult = null,
  studentName = 'Student Physicist'
}) {
  const activeExp = expProp || (reportData ? (EXPERIMENT_LIST.find((e) => e.id === reportData.experimentId) || EXPERIMENT_LIST[0]) : null);
  if (!isOpen || !activeExp) return null;

  const timestamp = new Date().toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  const experiment = activeExp;
  const investigator = reportData?.userName || studentName || 'Student Physicist';
  const score = quizResult?.score ?? reportData?.score ?? 100;
  const isMastered = score >= 70;

  return (
    <div className="lab-report-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lab-report-card" onClick={(e) => e.stopPropagation()}>
        {/* Actions bar at top */}
        <div className="report-action-bar no-print">
          <div className="report-status-tag">
            <FlaskConical className="btn-icon-xs" />
            <span>Official Experiment Lab Report</span>
          </div>

          <div className="report-btns-group">
            <button
              type="button"
              className="btn-report-action print"
              onClick={handlePrint}
              title="Print or Save as PDF"
            >
              <Printer className="btn-icon-xs" />
              Print / Save as PDF
            </button>
            <button
              type="button"
              className="btn-report-close"
              onClick={onClose}
              aria-label="Close report"
            >
              <X className="btn-icon-xs" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="lab-report-document" id="printable-report">
          {/* Header */}
          <header className="report-doc-header">
            <div className="doc-brand">
              <span className="doc-logo-symbol">⚛</span>
              <div>
                <h2>TOUCHLESS PHYSICS LAB</h2>
                <p>DEPARTMENT OF INTERACTIVE MECHANICS & AI TUTORING</p>
              </div>
            </div>
            <div className="doc-cert-badge">
              <Award className="cert-icon" />
              <div>
                <strong>{isMastered ? 'LAB VERIFIED' : 'ATTEMPT LOGGED'}</strong>
                <small>SCORE: {score}%</small>
              </div>
            </div>
          </header>

          <hr className="report-divider" />

          {/* Meta Information Grid */}
          <div className="report-meta-grid">
            <div className="meta-item">
              <span className="meta-label">INVESTIGATOR:</span>
              <strong className="meta-val">{investigator}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">EXPERIMENT:</span>
              <strong className="meta-val">{experiment.title}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">TIMESTAMP:</span>
              <strong className="meta-val">{timestamp}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">LAB MODULE:</span>
              <strong className="meta-val">{experiment.topic}</strong>
            </div>
          </div>

          {/* Section 1: Objective & Hypothesis */}
          <section className="report-section">
            <h4 className="section-title">1. SCIENTIFIC OBJECTIVE & HYPOTHESIS</h4>
            <p className="section-text">
              <strong>Objective:</strong> {experiment.objective}
            </p>
            <p className="section-text">
              <strong>Governing Principle:</strong> <code>{experiment.primaryFormula}</code> · <code>{experiment.secondaryFormula}</code>
            </p>
            <p className="section-text">
              <strong>Physical Assumptions:</strong> {experiment.assumptions}
            </p>
          </section>

          {/* Section 2: Apparatus & Simulation Settings */}
          <section className="report-section">
            <h4 className="section-title">2. EXPERIMENTAL APPARATUS & SIMULATION SETTINGS</h4>
            <div className="report-table-wrap">
              <table className="report-data-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Configured Value</th>
                    <th>Physical Dimension / SI Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {experiment.id === 'newton' && (
                    <>
                      <tr>
                        <td>Object Mass (m)</td>
                        <td>{Number(physicsData.mass || 1.0).toFixed(2)}</td>
                        <td>Kilograms (kg)</td>
                      </tr>
                      <tr>
                        <td>Fluid Viscous Drag (b)</td>
                        <td>0.75</td>
                        <td>N·s/m (Simulation Damping)</td>
                      </tr>
                      <tr>
                        <td>Interaction Perimeter (R)</td>
                        <td>0.55</td>
                        <td>Meters (Normalized Space)</td>
                      </tr>
                    </>
                  )}
                  {experiment.id === 'impulse' && (
                    <>
                      <tr>
                        <td>Target Mass (m)</td>
                        <td>{Number(physicsData.mass || 1.0).toFixed(2)}</td>
                        <td>Kilograms (kg)</td>
                      </tr>
                      <tr>
                        <td>Initial Velocity (v_i)</td>
                        <td>0.00</td>
                        <td>Meters / second (m/s)</td>
                      </tr>
                      <tr>
                        <td>Impact Radius</td>
                        <td>0.38</td>
                        <td>Meters (Normalized Space)</td>
                      </tr>
                    </>
                  )}
                  {experiment.id === 'hooke' && (
                    <>
                      <tr>
                        <td>Spring Stiffness (k)</td>
                        <td>{Number(physicsData.springK || 25.0).toFixed(1)}</td>
                        <td>Newtons / meter (N/m)</td>
                      </tr>
                      <tr>
                        <td>Equilibrium Position (x_0)</td>
                        <td>0.00</td>
                        <td>Meters (m)</td>
                      </tr>
                      <tr>
                        <td>Attached Mass (m)</td>
                        <td>{Number(physicsData.mass || 1.0).toFixed(2)}</td>
                        <td>Kilograms (kg)</td>
                      </tr>
                    </>
                  )}
                  {experiment.id === 'collision' && (
                    <>
                      <tr>
                        <td>Ball 1 Mass (m₁)</td>
                        <td>{Number(physicsData.mass || 1.0).toFixed(2)}</td>
                        <td>Kilograms (kg)</td>
                      </tr>
                      <tr>
                        <td>Ball 2 Mass (m₂)</td>
                        <td>{Number(physicsData.mass2 || 1.0).toFixed(2)}</td>
                        <td>Kilograms (kg)</td>
                      </tr>
                      <tr>
                        <td>Collision Restitution</td>
                        <td>e = 1.0 (Elastic)</td>
                        <td>Dimensionless Coefficient</td>
                      </tr>
                    </>
                  )}
                  {experiment.id === 'projectile' && (
                    <>
                      <tr>
                        <td>Launch Angle (θ)</td>
                        <td>{Number(physicsData.projAngle || 45).toFixed(0)}</td>
                        <td>Degrees (°)</td>
                      </tr>
                      <tr>
                        <td>Launch Speed (v₀)</td>
                        <td>{Number(physicsData.projV0 || 5.0).toFixed(1)}</td>
                        <td>Meters / second (m/s)</td>
                      </tr>
                      <tr>
                        <td>Gravitational Field (g)</td>
                        <td>9.80</td>
                        <td>Meters / second² (m/s²)</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Empirical Telemetry & Recorded Observations */}
          <section className="report-section">
            <h4 className="section-title">3. RECORDED TELEMETRY & EMPIRICAL MEASUREMENTS</h4>
            <div className="report-metrics-grid">
              {experiment.id === 'newton' && (
                <>
                  <div className="metric-box">
                    <span>Applied Net Force</span>
                    <strong>{Number(physicsData.force || 0).toFixed(2)} N</strong>
                  </div>
                  <div className="metric-box">
                    <span>Measured Acceleration</span>
                    <strong>{Number(physicsData.acceleration || 0).toFixed(2)} m/s²</strong>
                  </div>
                  <div className="metric-box">
                    <span>Instantaneous Speed</span>
                    <strong>{Number(physicsData.velocity || 0).toFixed(2)} m/s</strong>
                  </div>
                  <div className="metric-box">
                    <span>Linear Momentum (p)</span>
                    <strong>{Number(physicsData.momentum || 0).toFixed(2)} kg·m/s</strong>
                  </div>
                </>
              )}
              {experiment.id === 'impulse' && (
                <>
                  <div className="metric-box">
                    <span>Peak Contact Force (F_max)</span>
                    <strong>{Number(physicsData.peakForce || physicsData.force || 0).toFixed(2)} N</strong>
                  </div>
                  <div className="metric-box">
                    <span>Contact Duration (Δt)</span>
                    <strong>{((physicsData.contactTime || 0) * 1000).toFixed(0)} ms</strong>
                  </div>
                  <div className="metric-box">
                    <span>Total Impulse (J = ∫F dt)</span>
                    <strong>{Number(physicsData.impulseJ || 0).toFixed(3)} N·s</strong>
                  </div>
                  <div className="metric-box">
                    <span>Momentum Change (Δp)</span>
                    <strong>{Number(physicsData.deltaMomentum || 0).toFixed(3)} kg·m/s</strong>
                  </div>
                </>
              )}
              {experiment.id === 'hooke' && (
                <>
                  <div className="metric-box">
                    <span>Displacement (x)</span>
                    <strong>{Number(physicsData.displacement || 0).toFixed(2)} m</strong>
                  </div>
                  <div className="metric-box">
                    <span>Restoring Force (F = -kx)</span>
                    <strong>{Number(physicsData.springForce || 0).toFixed(2)} N</strong>
                  </div>
                  <div className="metric-box">
                    <span>Elastic Potential Energy</span>
                    <strong>{Number(physicsData.potentialEnergy || 0).toFixed(2)} J</strong>
                  </div>
                  <div className="metric-box">
                    <span>Kinetic Energy (KE)</span>
                    <strong>{Number(physicsData.kineticEnergy || 0).toFixed(2)} J</strong>
                  </div>
                </>
              )}
              {experiment.id === 'collision' && (
                <>
                  <div className="metric-box">
                    <span>Ball 1 Velocity (v₁)</span>
                    <strong>{Number(physicsData.v1 || 0).toFixed(2)} m/s</strong>
                  </div>
                  <div className="metric-box">
                    <span>Ball 2 Velocity (v₂)</span>
                    <strong>{Number(physicsData.v2 || 0).toFixed(2)} m/s</strong>
                  </div>
                  <div className="metric-box">
                    <span>Total Momentum (p_tot)</span>
                    <strong>{Number(physicsData.pTotal || 0).toFixed(2)} kg·m/s</strong>
                  </div>
                  <div className="metric-box">
                    <span>Total Kinetic Energy</span>
                    <strong>{Number(physicsData.keTotal || 0).toFixed(2)} J</strong>
                  </div>
                </>
              )}
              {experiment.id === 'projectile' && (
                <>
                  <div className="metric-box">
                    <span>Horizontal Range (R)</span>
                    <strong>{Number(physicsData.range || 0).toFixed(2)} m</strong>
                  </div>
                  <div className="metric-box">
                    <span>Maximum Height (H_max)</span>
                    <strong>{Number(physicsData.maxHeight || 0).toFixed(2)} m</strong>
                  </div>
                  <div className="metric-box">
                    <span>Flight Time (t)</span>
                    <strong>{Number(physicsData.flightTime || 0).toFixed(2)} s</strong>
                  </div>
                  <div className="metric-box">
                    <span>Apex Vertical Velocity (v_y)</span>
                    <strong>0.00 m/s</strong>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Section 4: Theoretical vs. Observed Analysis */}
          <section className="report-section">
            <h4 className="section-title">4. THEORETICAL ANALYSIS & VERIFICATION</h4>
            <div className="report-analysis-box">
              <p>
                <strong>Theoretical Law Verified:</strong>{' '}
                {experiment.id === 'newton' && `Direct verification of F = m·a. Measured acceleration tracks the applied net force vector with damping resistance.`}
                {experiment.id === 'impulse' && `Verified the Impulse-Momentum Theorem J = Δp. The area under the impact curve equals the linear momentum imparted to the object.`}
                {experiment.id === 'hooke' && `Verified Hooke's Law F = -k·x. Restoring force acts opposite to displacement, conserving mechanical energy through simple harmonic oscillation.`}
                {experiment.id === 'collision' && `Verified Conservation of Linear Momentum p_total = constant before and after impact. Total kinetic energy is conserved in elastic collision mode.`}
                {experiment.id === 'projectile' && `Verified 2D Kinematics. Horizontal motion (a_x = 0) and vertical acceleration (a_y = -9.8 m/s²) remain independent throughout the parabolic trajectory.`}
              </p>
            </div>
          </section>

          {/* Section 5: Mastery Assessment */}
          <section className="report-section">
            <h4 className="section-title">5. MASTERY ASSESSMENT & CONCEPT COMPETENCIES</h4>
            <div className="report-assessment-row">
              <div className="assessment-score-card">
                <span className="score-val">{score}%</span>
                <span className="score-label">{isMastered ? 'MASTERED' : 'NEEDS REVIEW'}</span>
              </div>
              <div className="assessment-details">
                <p>
                  <strong>Core Concepts Evaluated:</strong> {experiment.concepts.join(', ')}.
                </p>
                <p>
                  {isMastered
                    ? 'Student demonstrated thorough comprehension of underlying physical relationships, dimensional analysis, and vector mechanics.'
                    : 'Review the formulas and live HUD graphs in the lab to reinforce relationships between mass, acceleration, and conservation laws.'}
                </p>
              </div>
            </div>
          </section>

          {/* Footer Signature */}
          <footer className="report-doc-footer">
            <div className="footer-sig">
              <span className="sig-line" />
              <span>Dr. Nova, AI Physics Tutor Signature</span>
            </div>
            <div className="footer-sig">
              <span className="sig-line" />
              <span>Student Investigator Sign-off</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
