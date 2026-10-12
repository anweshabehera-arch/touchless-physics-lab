import { EXPERIMENT_LIST, EXPERIMENTS } from '../src/data/experimentsData.js';
import { createExperimentReportSnapshot } from '../src/physics/reportGenerator.js';

console.log('--- Testing Lab Report Generation Engine across all 10 Experiments ---');

const generatedReports = [];

for (const exp of EXPERIMENT_LIST) {
  // Test 1: Unmeasured state
  const unmeasured = createExperimentReportSnapshot({
    experimentId: exp.id,
    experiment: exp,
    physicsData: {},
    sessionMetrics: null,
    quizResult: null,
    studentName: 'Test Physicist',
    hasMeasurements: false
  });

  if (!unmeasured.title || !unmeasured.objective || !unmeasured.hypothesis) {
    throw new Error(`Failed unmeasured report for ${exp.id}: missing basic metadata`);
  }
  if (unmeasured.hasMeasurements !== false) {
    throw new Error(`Expected hasMeasurements === false for unmeasured ${exp.id}`);
  }
  if (!unmeasured.analysis.verificationSummary.includes('Awaiting empirical')) {
    throw new Error(`Expected awaiting empirical data message for ${exp.id}`);
  }

  // Test 2: Measured state with realistic telemetry
  let dummyMetrics = { hasInteracted: true };
  if (exp.id === 'newton') {
    dummyMetrics = { hasInteracted: true, peakForce: 15.5, peakAcceleration: 15.5, peakVelocity: 3.2, peakMomentum: 3.2, peakKineticEnergy: 5.12, dockAchieved: true };
  } else if (exp.id === 'impulse') {
    dummyMetrics = { hasInteracted: true, peakForce: 25.0, contactTime: 0.08, impulseJ: 2.0, deltaMomentum: 2.0 };
  } else if (exp.id === 'hooke') {
    dummyMetrics = { hasInteracted: true, maxDisplacement: 0.35, peakForce: 8.75, peakPE: 1.53, peakKE: 1.53 };
  } else if (exp.id === 'collision') {
    dummyMetrics = { hasInteracted: true, collisionOccurred: true, forensicData: { m1: 1.0, m2: 1.0, v1i: 3.0, v2i: 0.0, v1f: 0.0, v2f: 3.0, pBefore: 3.0, pAfter: 3.0, deltaP: 0.0, pConserved: true } };
  } else if (exp.id === 'projectile') {
    dummyMetrics = { hasInteracted: true, angle: 45, v0: 5.0, range: 2.55, maxHeight: 0.64, flightTime: 0.72 };
  } else if (exp.id === 'pendulum') {
    dummyMetrics = { hasInteracted: true, length: 1.5, mass: 0.8, maxThetaDeg: 25.0, peakOmega: 1.2, peakPE: 0.85, peakKE: 0.85 };
  } else if (exp.id === 'electric') {
    dummyMetrics = { hasInteracted: true, probeX: 0.1, probeY: 0.35, fieldMag: 125.4, potential: 45.2, force: 1.25 };
  } else if (exp.id === 'wave') {
    dummyMetrics = { hasInteracted: true, a1: 1.0, a2: 1.0, freq: 1.2, phaseDeg: 0, resultantAmp: 2.0, regime: 'CONSTRUCTIVE' };
  } else if (exp.id === 'optics') {
    dummyMetrics = { hasInteracted: true, incidentAngleDeg: 45, n1: 1.0, n2: 1.5, refractAngle: 28.1, isTIR: false };
  } else if (exp.id === 'incline') {
    dummyMetrics = { hasInteracted: true, angleDeg: 35, mass: 1.0, muStatic: 0.45, muKinetic: 0.30 };
  }

  const measured = createExperimentReportSnapshot({
    experimentId: exp.id,
    experiment: exp,
    physicsData: {},
    sessionMetrics: dummyMetrics,
    quizResult: { score: 90 },
    studentName: 'Test Physicist',
    hasMeasurements: true
  });

  if (!measured.hasMeasurements) {
    throw new Error(`Expected hasMeasurements === true for measured ${exp.id}`);
  }
  if (!measured.measurements || measured.measurements.length === 0) {
    throw new Error(`No measurements generated for ${exp.id}`);
  }
  if (!measured.apparatus || measured.apparatus.length === 0) {
    throw new Error(`No apparatus generated for ${exp.id}`);
  }
  if (measured.analysis.verificationStatus !== 'VERIFIED') {
    throw new Error(`Expected VERIFIED for ${exp.id}, got ${measured.analysis.verificationStatus}`);
  }

  generatedReports.push({
    id: exp.id,
    title: measured.title,
    formula: measured.analysis.governingEquation,
    measurementsCount: measured.measurements.length,
    sampleMetric: `${measured.measurements[0].label}: ${measured.measurements[0].value} ${measured.measurements[0].unit}`
  });

  console.log(`[PASS] ${exp.id.padEnd(12)} -> Title: "${measured.title}"`);
  console.log(`       Formula: ${measured.analysis.governingEquation}`);
  console.log(`       Metric:  ${measured.measurements[0].label} = ${measured.measurements[0].value} ${measured.measurements[0].unit}`);
}

// Verify diversity across reports
const titles = new Set(generatedReports.map(r => r.title));
const formulas = new Set(generatedReports.map(r => r.formula));

if (titles.size !== EXPERIMENT_LIST.length) {
  throw new Error(`Duplicate report titles detected: only ${titles.size} unique titles out of ${EXPERIMENT_LIST.length}`);
}
if (formulas.size !== EXPERIMENT_LIST.length) {
  throw new Error(`Duplicate formulas detected: only ${formulas.size} unique formulas out of ${EXPERIMENT_LIST.length}`);
}

console.log(`\nALL 10 EXPERIMENTS PASSED! Verified ${titles.size} distinct titles and ${formulas.size} distinct governing equations.`);
