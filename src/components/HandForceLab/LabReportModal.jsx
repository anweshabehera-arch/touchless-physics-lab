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

  // Strict scientific integrity: DO NOT default to 100% or award verified badge if quiz is pending
  const hasQuizScore = (quizResult && typeof quizResult.score === 'number') || (reportData && typeof reportData.score === 'number');
  const score = hasQuizScore ? (quizResult?.score ?? reportData?.score) : null;
  const isMastered = score !== null && score >= 70;

  // Check if empirical data points or interaction occurred
  const hasMeasurements = Boolean(
    physicsData.hasInteracted ||
    (physicsData.force && physicsData.force > 0) ||
    (physicsData.velocity && physicsData.velocity > 0) ||
    (physicsData.acceleration && physicsData.acceleration > 0) ||
    (physicsData.pTotal && physicsData.pTotal > 0) ||
    (physicsData.range && physicsData.range > 0) ||
    physicsData.thetaDeg !== undefined ||
    physicsData.electricFieldMag !== undefined ||
    physicsData.waveResultantAmp !== undefined ||
    physicsData.opticsIncidentAngle !== undefined ||
    physicsData.inclineAngle !== undefined ||
    (reportData?.samples && reportData.samples.length > 0)
  );

  let verificationBadgeTitle = 'UNPERFORMED SESSION';
  let verificationBadgeSub = 'AWAITING SIMULATION DATA';

  if (hasMeasurements && hasQuizScore) {
    verificationBadgeTitle = isMastered ? 'LAB VERIFIED & MASTERED' : 'EVALUATED (REVIEW RECOMMENDED)';
    verificationBadgeSub = `SCORE: ${score}%`;
  } else if (hasMeasurements && !hasQuizScore) {
    verificationBadgeTitle = 'DATA LOGGED • QUIZ PENDING';
    verificationBadgeSub = 'TAKE QUIZ TO VERIFY';
  } else if (!hasMeasurements && hasQuizScore) {
    verificationBadgeTitle = 'QUIZ RECORDED • SIM PENDING';
    verificationBadgeSub = `SCORE: ${score}% (MEASUREMENTS MISSING)`;
  }

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
                <strong>{verificationBadgeTitle}</strong>
                <small>{verificationBadgeSub}</small>
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
                  {experiment.id === 'pendulum' && (
                    <>
                      <tr>
                        <td>Pendulum Length (L)</td>
                        <td>{Number(physicsData.pendulumLength || 1.5).toFixed(2)}</td>
                        <td>Meters (m)</td>
                      </tr>
                      <tr>
                        <td>Bob Mass (m)</td>
                        <td>{Number(physicsData.pendulumMass || 0.8).toFixed(2)}</td>
                        <td>Kilograms (kg)</td>
                      </tr>
                      <tr>
                        <td>Small-Angle Theoretical Period</td>
                        <td>{Number(physicsData.pendulumPeriodTheo || 2.46).toFixed(2)}</td>
                        <td>Seconds (s)</td>
                      </tr>
                      <tr>
                        <td>Gravitational Field (g)</td>
                        <td>9.80</td>
                        <td>Meters / second² (m/s²)</td>
                      </tr>
                    </>
                  )}
                  {experiment.id === 'electric' && (
                    <>
                      <tr>
                        <td>Source Charge 1 (q₁)</td>
                        <td>{Number(physicsData.charge1Q ?? 2.0).toFixed(1)}</td>
                        <td>Microcoulombs (μC)</td>
                      </tr>
                      <tr>
                        <td>Source Charge 2 (q₂)</td>
                        <td>{Number(physicsData.charge2Q ?? -2.0).toFixed(1)}</td>
                        <td>Microcoulombs (μC)</td>
                      </tr>
                      <tr>
                        <td>Test Probe Charge (q₀)</td>
                        <td>{Number(physicsData.chargeTestQ ?? 1.0).toFixed(1)}</td>
                        <td>Microcoulombs (μC)</td>
                      </tr>
                      <tr>
                        <td>Coulomb Constant (k_e)</td>
                        <td>8.99 × 10⁹</td>
                        <td>N·m²/C²</td>
                      </tr>
                    </>
                  )}
                  {experiment.id === 'wave' && (
                    <>
                      <tr>
                        <td>Wave 1 Amplitude (A₁)</td>
                        <td>{Number(physicsData.waveA1 || 1.0).toFixed(2)}</td>
                        <td>Meters (m)</td>
                      </tr>
                      <tr>
                        <td>Wave 2 Amplitude (A₂)</td>
                        <td>{Number(physicsData.waveA2 || 1.0).toFixed(2)}</td>
                        <td>Meters (m)</td>
                      </tr>
                      <tr>
                        <td>Phase Shift (Δφ)</td>
                        <td>{Number(physicsData.wavePhaseDeg || 0).toFixed(0)}</td>
                        <td>Degrees (°)</td>
                      </tr>
                      <tr>
                        <td>Wave Frequency (f)</td>
                        <td>{Number(physicsData.waveFreq || 1.0).toFixed(1)}</td>
                        <td>Hertz (Hz)</td>
                      </tr>
                    </>
                  )}
                  {experiment.id === 'optics' && (
                    <>
                      <tr>
                        <td>Angle of Incidence (θ₁)</td>
                        <td>{Number(physicsData.opticsIncidentAngle || 45).toFixed(0)}</td>
                        <td>Degrees (°)</td>
                      </tr>
                      <tr>
                        <td>Medium 1 Refractive Index (n₁)</td>
                        <td>{Number(physicsData.opticsN1 || 1.0).toFixed(2)}</td>
                        <td>Dimensionless (Air)</td>
                      </tr>
                      <tr>
                        <td>Medium 2 Refractive Index (n₂)</td>
                        <td>{Number(physicsData.opticsN2 || 1.5).toFixed(2)}</td>
                        <td>Dimensionless (Crown Glass / Water)</td>
                      </tr>
                    </>
                  )}
                  {experiment.id === 'incline' && (
                    <>
                      <tr>
                        <td>Incline Slope Angle (θ)</td>
                        <td>{Number(physicsData.inclineAngle || 25).toFixed(0)}</td>
                        <td>Degrees (°)</td>
                      </tr>
                      <tr>
                        <td>Block Mass (m)</td>
                        <td>{Number(physicsData.inclineMass || 1.0).toFixed(2)}</td>
                        <td>Kilograms (kg)</td>
                      </tr>
                      <tr>
                        <td>Coefficient of Static Friction (μ_s)</td>
                        <td>{Number(physicsData.inclineMuStatic || 0.45).toFixed(2)}</td>
                        <td>Dimensionless</td>
                      </tr>
                      <tr>
                        <td>Coefficient of Kinetic Friction (μ_k)</td>
                        <td>{Number(physicsData.inclineMuKinetic || 0.30).toFixed(2)}</td>
                        <td>Dimensionless</td>
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
            {!hasMeasurements ? (
              <div className="report-empty-telemetry" style={{ padding: '16px', background: 'rgba(255, 100, 100, 0.08)', borderRadius: '8px', border: '1px dashed rgba(255,100,100,0.3)', color: '#ff8888', textAlign: 'center' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>⚠️ NO TELEMETRY RECORDED IN THIS SESSION</p>
                <small style={{ color: '#aaa' }}>Interact with the 3D virtual simulation in the laboratory to record real empirical physics data.</small>
              </div>
            ) : (
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
                      <span>Gravity In Flight</span>
                      <strong>9.80 m/s²</strong>
                    </div>
                  </>
                )}
                {experiment.id === 'pendulum' && (
                  <>
                    <div className="metric-box">
                      <span>Angular Position (θ)</span>
                      <strong>{Number(physicsData.thetaDeg || 0).toFixed(1)}°</strong>
                    </div>
                    <div className="metric-box">
                      <span>Angular Velocity (ω)</span>
                      <strong>{Number(physicsData.pendulumOmega || 0).toFixed(2)} rad/s</strong>
                    </div>
                    <div className="metric-box">
                      <span>Kinetic Energy (K)</span>
                      <strong>{Number(physicsData.kineticEnergy || 0).toFixed(2)} J</strong>
                    </div>
                    <div className="metric-box">
                      <span>Potential Energy (U)</span>
                      <strong>{Number(physicsData.potentialEnergy || 0).toFixed(2)} J</strong>
                    </div>
                  </>
                )}
                {experiment.id === 'electric' && (
                  <>
                    <div className="metric-box">
                      <span>Field Magnitude (|E|)</span>
                      <strong>{Number(physicsData.electricFieldMag || 0).toFixed(2)} N/C</strong>
                    </div>
                    <div className="metric-box">
                      <span>Electric Potential (V)</span>
                      <strong>{Number(physicsData.electricPotential || 0).toFixed(1)} V</strong>
                    </div>
                    <div className="metric-box">
                      <span>Force on Probe (|F|)</span>
                      <strong>{Number(physicsData.force || 0).toFixed(2)} N</strong>
                    </div>
                    <div className="metric-box">
                      <span>Probe Position</span>
                      <strong>({Number(physicsData.posX || 0).toFixed(2)}, {Number(physicsData.posY || 0).toFixed(2)})</strong>
                    </div>
                  </>
                )}
                {experiment.id === 'wave' && (
                  <>
                    <div className="metric-box">
                      <span>Resultant Amplitude</span>
                      <strong>{Number(physicsData.waveResultantAmp || 0).toFixed(2)} m</strong>
                    </div>
                    <div className="metric-box">
                      <span>Interference Regime</span>
                      <strong style={{ textTransform: 'uppercase' }}>{physicsData.waveRegime || 'Constructive'}</strong>
                    </div>
                    <div className="metric-box">
                      <span>Phase Difference (Δφ)</span>
                      <strong>{Number(physicsData.wavePhaseDeg || 0).toFixed(0)}°</strong>
                    </div>
                    <div className="metric-box">
                      <span>Wave Frequency (f)</span>
                      <strong>{Number(physicsData.waveFreq || 1.0).toFixed(1)} Hz</strong>
                    </div>
                  </>
                )}
                {experiment.id === 'optics' && (
                  <>
                    <div className="metric-box">
                      <span>Angle of Reflection (θ_r)</span>
                      <strong>{Number(physicsData.opticsIncidentAngle || 0).toFixed(1)}°</strong>
                    </div>
                    <div className="metric-box">
                      <span>Angle of Refraction (θ₂)</span>
                      <strong>{physicsData.isTIR ? 'TIR (No Ray)' : `${Number(physicsData.opticsRefractAngle || 0).toFixed(1)}°`}</strong>
                    </div>
                    <div className="metric-box">
                      <span>Optical Regime</span>
                      <strong>{physicsData.isTIR ? 'TOTAL INTERNAL REFLECTION' : 'STANDARD REFRACTION'}</strong>
                    </div>
                    <div className="metric-box">
                      <span>Index Ratio (n₂/n₁)</span>
                      <strong>{((physicsData.opticsN2 || 1.5) / (physicsData.opticsN1 || 1.0)).toFixed(2)}</strong>
                    </div>
                  </>
                )}
                {experiment.id === 'incline' && (
                  <>
                    <div className="metric-box">
                      <span>Normal Force (N)</span>
                      <strong>{Number(physicsData.inclineNormalForce || 0).toFixed(2)} N</strong>
                    </div>
                    <div className="metric-box">
                      <span>Friction Force (f)</span>
                      <strong>{Number(physicsData.inclineFrictionForce || 0).toFixed(2)} N</strong>
                    </div>
                    <div className="metric-box">
                      <span>Downhill Net Force</span>
                      <strong>{Number(physicsData.inclineNetForce || 0).toFixed(2)} N</strong>
                    </div>
                    <div className="metric-box">
                      <span>Downhill Acceleration</span>
                      <strong>{Number(physicsData.inclineAccel || 0).toFixed(2)} m/s²</strong>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>

          {/* Section 4: Theoretical vs. Observed Analysis */}
          <section className="report-section">
            <h4 className="section-title">4. THEORETICAL ANALYSIS & VERIFICATION</h4>
            <div className="report-analysis-box">
              <p>
                <strong>Theoretical Law Verified:</strong>{' '}
                {experiment.id === 'newton' && `Direct verification of Newton's 2nd Law F = m·a. Measured acceleration tracks the applied net force vector with damping resistance.`}
                {experiment.id === 'impulse' && `Verified the Impulse-Momentum Theorem J = Δp. The area under the contact force curve equals the linear momentum imparted to the object.`}
                {experiment.id === 'hooke' && `Verified Hooke's Law F = -k·x. Restoring force acts opposite to displacement, conserving mechanical energy through simple harmonic oscillation.`}
                {experiment.id === 'collision' && `Verified Conservation of Linear Momentum p_total = constant before and after impact. In isolated collision mode, total momentum vector is preserved.`}
                {experiment.id === 'projectile' && `Verified 2D Kinematics. Horizontal motion (a_x = 0) and vertical acceleration (a_y = -9.8 m/s²) remain independent throughout the parabolic trajectory.`}
                {experiment.id === 'pendulum' && `Verified Simple Harmonic Motion for pendulum oscillation. Small-angle approximation period T = 2π√(L/g) holds accurately for release angles θ < 20°, while finite-angle corrections apply at larger amplitudes.`}
                {experiment.id === 'electric' && `Verified Coulomb's Law and Vector Superposition. The net electric field E(r) is the vector sum of fields produced by individual charges q₁ and q₂.`}
                {experiment.id === 'wave' && `Verified Principle of Wave Superposition. When two harmonic waves overlap, resultant displacement y_res(x,t) = y₁(x,t) + y₂(x,t). Phase shift Δφ = 0° produces constructive peak reinforcement, while Δφ = 180° produces destructive cancellation.`}
                {experiment.id === 'optics' && `Verified Snell's Law n₁·sin(θ₁) = n₂·sin(θ₂) and the Law of Reflection θ_r = θ₁. When light travels from a denser to rarer medium (n₁ > n₂) beyond the critical angle θ_c = arcsin(n₂/n₁), Total Internal Reflection occurs with 100% reflectance.`}
                {experiment.id === 'incline' && `Verified Inclined Plane Mechanics and Friction. The normal force N = mg·cos(θ) dictates maximum static friction f_s,max = μ_s·N. Slipping occurs once tan(θ) > μ_s, after which kinetic friction f_k = μ_k·N determines the downhill acceleration a = g(sin θ - μ_k cos θ).`}
              </p>
            </div>
          </section>

          {/* Section 5: Mastery Assessment */}
          <section className="report-section">
            <h4 className="section-title">5. MASTERY ASSESSMENT & CONCEPT COMPETENCIES</h4>
            <div className="report-assessment-row">
              <div className="assessment-score-card">
                <span className="score-val">{score !== null ? `${score}%` : 'PENDING'}</span>
                <span className="score-label">
                  {score === null ? 'AWAITING QUIZ' : isMastered ? 'MASTERED' : 'NEEDS REVIEW'}
                </span>
              </div>
              <div className="assessment-details">
                <p>
                  <strong>Core Concepts Evaluated:</strong> {experiment.concepts.join(', ')}.
                </p>
                <p>
                  {score === null
                    ? 'Student has not completed the concept mastery quiz for this laboratory. Take the quiz from the lab workspace to record verified scores.'
                    : isMastered
                      ? 'Student demonstrated thorough comprehension of underlying physical relationships, dimensional analysis, and vector mechanics.'
                      : 'Review the formulas and live HUD graphs in the lab to reinforce relationships between parameters, vector forces, and conservation laws.'}
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
