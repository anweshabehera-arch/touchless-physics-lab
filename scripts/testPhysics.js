import process from 'node:process';
import {
  computeNewtonAcceleration,
  integrateNewtonMotion,
  computeImpulse,
  computeMomentumChange,
  verifyImpulseMomentumTheorem,
  computeSpringRestoringForce,
  computeSpringPotentialEnergy,
  computeSpringPeriod,
  computeTotalMomentum,
  computeTotalKineticEnergy,
  compute1DCollisionVelocities,
  computeProjectileTheoretical,
  computePendulumSmallAnglePeriod,
  computePendulumLargeAnglePeriod,
  integratePendulumStep,
  computeElectricFieldAtPoint,
  computeElectrostaticForce,
  computeTravelingWave,
  computeInterferenceResultant,
  computeOpticsRays,
  computeInclinedPlanePhysics
} from '../src/physics/physicsFormulas.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('--- Testing Scientific Physics Engine for All 10 Experiments ---');

// 1. Newton's 2nd Law
console.log('\n[1. Newton\'s 2nd Law]');
const a1 = computeNewtonAcceleration(10, 2);
assert(Math.abs(a1 - 5.0) < 1e-4, 'a = F / m -> 10 N / 2 kg = 5 m/s²');
const simNewton = integrateNewtonMotion({ x: 0, y: 0, vx: 0, vy: 0, mass: 2.0 }, 10, 0, 0.02);
assert(simNewton.ax > 4.5 && simNewton.vx > 0, 'Newton numerical integration advances velocity');

// 2. Impulse & Momentum
console.log('\n[2. Impulse & Momentum]');
const J = computeImpulse(25, 0.08);
assert(Math.abs(J - 2.0) < 1e-4, 'J = F · Δt -> 25 N · 0.08 s = 2.0 N·s');
const dp = computeMomentumChange(0.5, 0, 4.0);
assert(Math.abs(dp - 2.0) < 1e-4, 'Δp = m · Δv -> 0.5 kg · 4.0 m/s = 2.0 kg·m/s');
const checkJ = verifyImpulseMomentumTheorem(J, dp);
assert(checkJ.verified, 'Impulse equals momentum change verified');

// 3. Hooke's Law & Springs
console.log('\n[3. Hooke\'s Law]');
const Fs = computeSpringRestoringForce(40, 0.15);
assert(Math.abs(Fs - -6.0) < 1e-4, 'F = -k · x -> -40 · 0.15 = -6.0 N');
const Ue = computeSpringPotentialEnergy(50, 0.2);
assert(Math.abs(Ue - 1.0) < 1e-4, 'U = 1/2 k x² -> 0.5 · 50 · 0.04 = 1.0 J');
const Thooke = computeSpringPeriod(1.0, 25.0);
assert(Math.abs(Thooke - (2 * Math.PI / 5)) < 1e-3, 'T = 2π√(m/k) = ~1.257 s');

// 4. Collisions
console.log('\n[4. Collisions & Momentum]');
const pTot = computeTotalMomentum(2.0, 3.0, 1.0, 0);
assert(Math.abs(pTot - 6.0) < 1e-4, 'Initial momentum = 6.0 kg·m/s');
const collElastic = compute1DCollisionVelocities(1.0, 4.0, 1.0, 0.0, 1.0);
assert(Math.abs(collElastic.v1Prime - 0.0) < 1e-4 && Math.abs(collElastic.v2Prime - 4.0) < 1e-4,
  'Elastic collision with equal masses transfers 100% velocity');
const collInelastic = compute1DCollisionVelocities(1.0, 6.0, 1.0, 0.0, 0.0);
assert(Math.abs(collInelastic.v1Prime - 3.0) < 1e-4 && Math.abs(collInelastic.v2Prime - 3.0) < 1e-4,
  'Inelastic collision creates common velocity = 3.0 m/s');
const keBefore = computeTotalKineticEnergy(1.0, 4.0, 1.0, 0.0);
const keAfter = computeTotalKineticEnergy(1.0, collElastic.v1Prime, 1.0, collElastic.v2Prime);
assert(Math.abs(keBefore - keAfter) < 1e-4 && Math.abs(keBefore - 8.0) < 1e-4,
  'Total kinetic energy is conserved in elastic collision (8.0 J)');

// 5. Projectile Motion
console.log('\n[5. Projectile Motion]');
const proj45 = computeProjectileTheoretical(10.0, 45.0, 9.8);
assert(Math.abs(proj45.range - (100 / 9.8)) < 1e-3, 'Max range at 45° = 10.20 m');
const proj30 = computeProjectileTheoretical(10.0, 30.0, 9.8);
const proj60 = computeProjectileTheoretical(10.0, 60.0, 9.8);
assert(Math.abs(proj30.range - proj60.range) < 1e-4, 'Complementary angles 30° & 60° produce identical range');

// 6. Simple Pendulum
console.log('\n[6. Simple Pendulum]');
const T0 = computePendulumSmallAnglePeriod(1.0, 9.8);
assert(Math.abs(T0 - 2.007) < 0.02, 'T_0 = 2π√(1.0 / 9.8) ≈ 2.007 s');
const Tlarge = computePendulumLargeAnglePeriod(1.0, Math.PI / 3, 9.8); // 60 deg
assert(Tlarge > T0, 'Large amplitude period is longer than small angle theoretical period');
const pendStep = integratePendulumStep({ theta: 0.2, omega: 0 }, 1.0, 1.0, 0.016);
assert(pendStep.alpha < 0 && pendStep.omega < 0, 'Restoring gravity pulls pendulum downward toward θ=0');

// 7. Electric Field & Charges
console.log('\n[7. Electric Field & Charges]');
const charges = [{ x: 0, y: 0, q: 2.0 }]; // 2 μC at origin
const eField = computeElectricFieldAtPoint({ x: 1.0, y: 0 }, charges);
assert(eField.Ex > 0 && Math.abs(eField.Ey) < 1e-4, 'Field points radially away from positive charge along +x');
const eForce = computeElectrostaticForce(1.0, eField);
assert(eForce.Fx > 0, 'Positive test charge feels repulsive force away from +q');

// 8. Wave Interference
console.log('\n[8. Wave Interference]');
const yTravel = computeTravelingWave(2.0, 4.0, 1.0, 1.0, 0, 0);
assert(Math.abs(yTravel - 2.0) < 1e-4, 'Traveling sinusoidal wave evaluates peak amplitude at quarter wavelength (2.0 m)');
const waveConstructive = computeInterferenceResultant(1.5, 1.5, 0);
assert(Math.abs(waveConstructive.resultantAmp - 3.0) < 1e-4 && waveConstructive.regime === 'constructive',
  'Δφ = 0 produces perfectly constructive interference (A = 3.0)');
const waveDestructive = computeInterferenceResultant(1.5, 1.5, Math.PI);
assert(Math.abs(waveDestructive.resultantAmp - 0.0) < 1e-4 && waveDestructive.regime === 'destructive',
  'Δφ = π produces perfectly destructive interference (A = 0.0)');

// 9. Reflection & Refraction
console.log('\n[9. Reflection & Refraction]');
const optics1 = computeOpticsRays(30.0, 1.0, 1.5); // Air to Glass
assert(Math.abs(optics1.thetaReflectDeg - 30.0) < 1e-4, 'Reflection law θ_r = θ_i = 30°');
assert(optics1.thetaRefractDeg < 30.0 && !optics1.isTIR, 'Light bends toward normal entering denser medium (θ_t ≈ 19.47°)');
const opticsTIR = computeOpticsRays(50.0, 1.5, 1.0); // Glass to Air at 50° (> 41.8° critical)
assert(opticsTIR.isTIR && opticsTIR.thetaRefractDeg === null, 'Total Internal Reflection occurs above critical angle');

// 10. Friction & Inclined Plane
console.log('\n[10. Friction & Inclined Plane]');
const inclineStatic = computeInclinedPlanePhysics(2.0, 15.0, 0.5, 0.3); // tan(15°) = 0.268 <= 0.5 -> static
assert(!inclineStatic.isSlipping && inclineStatic.acceleration === 0, 'Object rests in static equilibrium when tan(θ) <= μ_s');
const inclineSlip = computeInclinedPlanePhysics(2.0, 45.0, 0.5, 0.3); // tan(45°) = 1.0 > 0.5 -> slip
assert(inclineSlip.isSlipping && inclineSlip.acceleration > 0, 'Object slips down incline with net acceleration when θ > θ_crit');

console.log(`\n========================================`);
console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All 10 physics modules scientifically verified!');
}
