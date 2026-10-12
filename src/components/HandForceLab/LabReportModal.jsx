import { Printer, Award, X, FlaskConical, CheckCircle2, AlertTriangle } from 'lucide-react';
import { EXPERIMENT_LIST } from '../../data/experimentsData';
import { createExperimentReportSnapshot } from '../../physics/reportGenerator';

export default function LabReportModal({
  isOpen = true,
  onClose,
  experiment: expProp = null,
  reportData = null,
  physicsData = {},
  quizResult = null,
  studentName = 'Student Physicist',
  reportSnapshot = null
}) {
  // If not open, render nothing
  if (!isOpen) return null;

  // Resolve or generate the immutable report snapshot
  let snapshot = reportSnapshot;

  if (!snapshot) {
    if (reportData && reportData.experimentId && reportData.apparatus && reportData.measurements) {
      // reportData is already a pre-built snapshot
      snapshot = reportData;
    } else {
      // Determine target experiment definition
      const targetExp =
        expProp ||
        (reportData?.experimentId
          ? EXPERIMENT_LIST.find((e) => e.id === reportData.experimentId)
          : null) ||
        EXPERIMENT_LIST[0];

      snapshot = createExperimentReportSnapshot({
        experimentId: targetExp.id,
        experiment: targetExp,
        physicsData,
        quizResult:
          quizResult ||
          (reportData?.score !== undefined && reportData.score !== null
            ? { score: reportData.score }
            : null),
        studentName: reportData?.userName || studentName || 'Student Physicist',
        hasMeasurements: reportData?.hasMeasurements
      });
    }
  }

  if (!snapshot) return null;

  const handlePrint = () => {
    window.print();
  };

  const isVerifiedBadge = snapshot.badge.type === 'verified';
  const isPendingBadge = snapshot.badge.type === 'unperformed' || snapshot.badge.type === 'awaiting_sim';

  return (
    <div className="lab-report-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lab-report-card" onClick={(e) => e.stopPropagation()}>
        {/* Actions bar at top (excluded from printed document) */}
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
            <div
              className="doc-cert-badge"
              style={{
                background: isVerifiedBadge
                  ? '#f0fdf4'
                  : isPendingBadge
                    ? '#fef2f2'
                    : '#f0f9ff',
                borderColor: isVerifiedBadge
                  ? '#bbf7d0'
                  : isPendingBadge
                    ? '#fecaca'
                    : '#bae6fd',
                color: isVerifiedBadge
                  ? '#15803d'
                  : isPendingBadge
                    ? '#b91c1c'
                    : '#0369a1'
              }}
            >
              {isVerifiedBadge ? (
                <Award className="cert-icon" style={{ color: '#16a34a' }} />
              ) : isPendingBadge ? (
                <AlertTriangle className="cert-icon" style={{ color: '#dc2626' }} />
              ) : (
                <CheckCircle2 className="cert-icon" style={{ color: '#0284c7' }} />
              )}
              <div>
                <strong>{snapshot.badge.title}</strong>
                <small
                  style={{
                    color: isVerifiedBadge
                      ? '#166534'
                      : isPendingBadge
                        ? '#991b1b'
                        : '#075985'
                  }}
                >
                  {snapshot.badge.subtitle}
                </small>
              </div>
            </div>
          </header>

          <hr className="report-divider" />

          {/* Meta Information Grid */}
          <div className="report-meta-grid">
            <div className="meta-item">
              <span className="meta-label">INVESTIGATOR:</span>
              <strong className="meta-val">{snapshot.investigator}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">EXPERIMENT:</span>
              <strong className="meta-val">{snapshot.experimentTitle}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">TIMESTAMP:</span>
              <strong className="meta-val">{snapshot.timestamp}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">LAB MODULE:</span>
              <strong className="meta-val">{snapshot.topic}</strong>
            </div>
          </div>

          {/* Section 1: Objective & Hypothesis */}
          <section className="report-section">
            <h4 className="section-title">1. SCIENTIFIC OBJECTIVE & HYPOTHESIS</h4>
            <p className="section-text">
              <strong>Objective:</strong> {snapshot.objective}
            </p>
            {snapshot.hypothesis && (
              <p className="section-text">
                <strong>Hypothesis:</strong> {snapshot.hypothesis}
              </p>
            )}
            <p className="section-text">
              <strong>Governing Principle:</strong> <code>{snapshot.primaryFormula}</code>
              {snapshot.secondaryFormula && (
                <>
                  {' '}· <code>{snapshot.secondaryFormula}</code>
                </>
              )}
            </p>
            <p className="section-text">
              <strong>Physical Assumptions:</strong> {snapshot.assumptions}
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
                  {snapshot.apparatus && snapshot.apparatus.length > 0 ? (
                    snapshot.apparatus.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.parameter}</td>
                        <td><strong>{item.value}</strong></td>
                        <td>
                          {item.unit}
                          {item.notes ? ` (${item.notes})` : ''}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: '#64748b' }}>
                        Standard laboratory configuration loaded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Empirical Telemetry & Recorded Observations */}
          <section className="report-section">
            <h4 className="section-title">3. RECORDED TELEMETRY & EMPIRICAL MEASUREMENTS</h4>
            {!snapshot.hasMeasurements ? (
              <div
                className="report-empty-telemetry"
                style={{
                  padding: '18px 20px',
                  background: '#fff1f2',
                  borderRadius: '10px',
                  border: '1px dashed #f43f5e',
                  textAlign: 'center'
                }}
              >
                <p
                  style={{
                    margin: '0 0 6px 0',
                    fontWeight: 800,
                    fontSize: '13px',
                    color: '#e11d48',
                    letterSpacing: '0.8px'
                  }}
                >
                  ⚠️ AWAITING EXPERIMENTAL MEASUREMENTS
                </p>
                <p style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '12px' }}>
                  {snapshot.missingDataReason ||
                    'No physical interaction or kinematic telemetry has been recorded for this module in this session.'}
                </p>
                {snapshot.howToMeasure && (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      display: 'inline-block',
                      maxWidth: '640px',
                      textAlign: 'left',
                      color: '#1e293b',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <strong style={{ color: '#0284c7' }}>How to Record Telemetry: </strong>
                    {snapshot.howToMeasure}
                  </div>
                )}
              </div>
            ) : (
              <div className="report-metrics-grid">
                {snapshot.measurements.map((m, idx) => (
                  <div key={idx} className="metric-box">
                    <span>{m.label}</span>
                    <strong>
                      {m.value} {m.unit}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 4: Theoretical vs. Observed Analysis */}
          <section className="report-section">
            <h4 className="section-title">4. THEORETICAL ANALYSIS & VERIFICATION</h4>
            <div
              className="report-analysis-box"
              style={{
                background: snapshot.analysis.isEmpiricallyVerified ? '#f0fdf4' : '#f8fafc',
                border: `1px solid ${snapshot.analysis.isEmpiricallyVerified ? '#bbf7d0' : '#e2e8f0'}`
              }}
            >
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', lineHeight: 1.5 }}>
                <strong
                  style={{
                    color: snapshot.analysis.isEmpiricallyVerified ? '#15803d' : '#475569'
                  }}
                >
                  Theoretical Law Evaluation:
                </strong>{' '}
                {snapshot.analysis.verificationSummary}
              </p>
              {snapshot.analysis.theoreticalComparison && (
                <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                  {snapshot.analysis.theoreticalComparison}
                </p>
              )}
            </div>

            {snapshot.analysis.quantitativeComparison &&
              snapshot.analysis.quantitativeComparison.length > 0 && (
                <div className="report-table-wrap" style={{ marginTop: '12px' }}>
                  <table className="report-data-table">
                    <thead>
                      <tr>
                        <th>Verification Quantity</th>
                        <th>Theoretical Prediction</th>
                        <th>Observed Telemetry</th>
                        <th>Numerical Deviation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.analysis.quantitativeComparison.map((row, idx) => (
                        <tr key={idx}>
                          <td><strong>{row.metric}</strong></td>
                          <td>{row.theoretical}</td>
                          <td>{row.observed}</td>
                          <td>
                            <span
                              style={{
                                color: row.deviation === '0.0%' ? '#15803d' : '#0284c7',
                                fontWeight: 700
                              }}
                            >
                              {row.deviation}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </section>

          {/* Section 5: Mastery Assessment */}
          <section className="report-section">
            <h4 className="section-title">5. MASTERY ASSESSMENT & CONCEPT COMPETENCIES</h4>
            <div className="report-assessment-row">
              <div className="assessment-score-card">
                <span className="score-val">
                  {snapshot.mastery.score !== null ? `${snapshot.mastery.score}%` : 'PENDING'}
                </span>
                <span className="score-label">{snapshot.mastery.statusText}</span>
              </div>
              <div className="assessment-details">
                <p>
                  <strong>Core Concepts Evaluated:</strong>{' '}
                  {snapshot.mastery.concepts && snapshot.mastery.concepts.length > 0
                    ? snapshot.mastery.concepts.join(', ')
                    : 'Fundamental Mechanics & Conservation Laws'}
                  .
                </p>
                <p>{snapshot.mastery.competencyNotes}</p>
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
