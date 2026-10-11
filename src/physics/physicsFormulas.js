/**
 * Touchless Physics Lab — Scientific Physics Calculation Engine
 * Pure mathematical equations, unit-tested functions, SI units,
 * numerical integration routines, and theoretical references for all 10 experiments.
 *
 * Rules:
 * - Calculations are strictly separated from UI components.
 * - Handles edge cases (division by zero, angle limits, total internal reflection).
 * - Distinguishes theoretical values from measured/simulated quantities.
 * - Never returns hardcoded fabricated measurements.
 */

export const GRAVITY_EARTH = 9.80; // m/s²
export const COULOMB_CONSTANT = 8.98755e9; // N·m²/C² (or scaled normalized 8.99 N·m²/(μC)²)
export const COULOMB_SCALED = 8.99; // Normalized for microcoulomb interactive display

// ============================================================================
// 1. NEWTON'S SECOND LAW (F_net = m · a)
// ============================================================================

/**
 * Calculates instantaneous theoretical acceleration: a = F_net / m
 * @param {number} netForce - Net applied force in Newtons (N)
 * @param {number} mass - Inertial mass in kilograms (kg)
 * @returns {number} Acceleration in m/s²
 */
export function computeNewtonAcceleration(netForce, mass) {
  if (typeof netForce !== 'number' || typeof mass !== 'number') return 0;
  if (mass <= 0) return 0;
  return netForce / mass;
}

/**
 * Numerically integrates 2D motion with viscous fluid drag F_drag = -b · v
 * Uses semi-implicit Euler integration for numerical stability.
 */
export function integrateNewtonMotion(state, appliedFx, appliedFy, dt, dragCoeff = 0.75) {
  const { x = 0, y = 0, vx = 0, vy = 0, mass = 1.0 } = state;
  const m = Math.max(0.01, mass);
  const timeStep = Math.min(0.05, Math.max(0.001, dt));

  const dragFx = -dragCoeff * vx;
  const dragFy = -dragCoeff * vy;
  const netFx = appliedFx + dragFx;
  const netFy = appliedFy + dragFy;

  const ax = netFx / m;
  const ay = netFy / m;

  const nextVx = vx + ax * timeStep;
  const nextVy = vy + ay * timeStep;
  const nextX = x + nextVx * timeStep;
  const nextY = y + nextVy * timeStep;

  const speed = Math.sqrt(nextVx * nextVx + nextVy * nextVy);
  const momentum = m * speed;
  const kineticEnergy = 0.5 * m * speed * speed;

  return {
    x: nextX,
    y: nextY,
    vx: nextVx,
    vy: nextVy,
    ax,
    ay,
    speed,
    momentum,
    kineticEnergy,
    dragForceMag: Math.sqrt(dragFx * dragFx + dragFy * dragFy)
  };
}

// ============================================================================
// 2. IMPULSE & MOMENTUM (J = ∫ F dt = F_avg · Δt = Δp)
// ============================================================================

/**
 * Calculates impulse from average force and contact duration: J = F_avg · Δt
 * @param {number} forceAvg - Average force in Newtons (N)
 * @param {number} contactTime - Contact duration in seconds (s)
 * @returns {number} Impulse in N·s (or kg·m/s)
 */
export function computeImpulse(forceAvg, contactTime) {
  if (typeof forceAvg !== 'number' || typeof contactTime !== 'number') return 0;
  return Math.max(0, forceAvg) * Math.max(0, contactTime);
}

/**
 * Calculates linear momentum change: Δp = m(v_f - v_i)
 */
export function computeMomentumChange(mass, vi, vf) {
  const m = Math.max(0, Number(mass) || 0);
  return m * (Number(vf || 0) - Number(vi || 0));
}

/**
 * Verifies the Impulse-Momentum Theorem equality: J ≈ Δp
 */
export function verifyImpulseMomentumTheorem(impulseJ, deltaP, tolerance = 0.1) {
  const j = Math.abs(Number(impulseJ) || 0);
  const dp = Math.abs(Number(deltaP) || 0);
  if (j === 0 && dp === 0) {
    return { verified: false, percentError: 0, status: 'unperformed' };
  }
  const denom = Math.max(j, dp, 0.001);
  const absDiff = Math.abs(j - dp);
  const percentError = (absDiff / denom) * 100;
  return {
    verified: percentError <= tolerance * 100,
    percentError: Number(percentError.toFixed(2)),
    status: percentError <= tolerance * 100 ? 'verified' : 'deviated'
  };
}

// ============================================================================
// 3. HOOKE'S LAW & SPRINGS (F = -k · x)
// ============================================================================

/**
 * Calculates restoring force: F_spring = -k · x
 * @param {number} springK - Spring stiffness in N/m
 * @param {number} displacement - Displacement from equilibrium in meters (m)
 * @returns {number} Restoring force in Newtons (N)
 */
export function computeSpringRestoringForce(springK, displacement) {
  const k = Math.max(0, Number(springK) || 0);
  const x = Number(displacement) || 0;
  return -k * x;
}

/**
 * Calculates elastic potential energy: U_e = 1/2 · k · x²
 */
export function computeSpringPotentialEnergy(springK, displacement) {
  const k = Math.max(0, Number(springK) || 0);
  const x = Number(displacement) || 0;
  return 0.5 * k * x * x;
}

/**
 * Calculates theoretical undamped natural period: T = 2π · √(m / k)
 */
export function computeSpringPeriod(mass, springK) {
  const m = Math.max(0.001, Number(mass) || 1);
  const k = Math.max(0.001, Number(springK) || 1);
  return 2 * Math.PI * Math.sqrt(m / k);
}

/**
 * Numerically integrates simple harmonic motion with damping:
 * a = (-k · x - b · v) / m
 */
export function integrateSpringOscillator(state, springK, mass, dt, damping = 0.55) {
  const { x = 0, vx = 0 } = state;
  const m = Math.max(0.01, mass);
  const k = Math.max(0.1, springK);
  const timeStep = Math.min(0.05, Math.max(0.001, dt));

  const restoringForce = -k * x;
  const dampingForce = -damping * vx;
  const ax = (restoringForce + dampingForce) / m;

  const nextVx = vx + ax * timeStep;
  const nextX = x + nextVx * timeStep;

  const potentialEnergy = 0.5 * k * nextX * nextX;
  const kineticEnergy = 0.5 * m * nextVx * nextVx;

  return {
    x: nextX,
    vx: nextVx,
    ax,
    restoringForce,
    potentialEnergy,
    kineticEnergy,
    totalMechanicalEnergy: potentialEnergy + kineticEnergy
  };
}

// ============================================================================
// 4. COLLISIONS & CONSERVATION OF MOMENTUM
// ============================================================================

/**
 * Calculates total 1D system momentum: p_total = m1 · v1 + m2 · v2
 */
export function computeTotalMomentum(m1, v1, m2, v2) {
  return (Number(m1) || 0) * (Number(v1) || 0) + (Number(m2) || 0) * (Number(v2) || 0);
}

/**
 * Calculates total system kinetic energy: KE_total = 1/2 m1 v1² + 1/2 m2 v2²
 */
export function computeTotalKineticEnergy(m1, v1, m2, v2) {
  const mass1 = Number(m1) || 0;
  const vel1 = Number(v1) || 0;
  const mass2 = Number(m2) || 0;
  const vel2 = Number(v2) || 0;
  return 0.5 * mass1 * vel1 * vel1 + 0.5 * mass2 * vel2 * vel2;
}

/**
 * Calculates exact post-collision velocities in 1D for restitution coefficient e (0 <= e <= 1)
 * Elastic: e = 1.0, Perfectly Inelastic: e = 0.0
 */
export function compute1DCollisionVelocities(m1, v1, m2, v2, restitution = 1.0) {
  const mass1 = Math.max(0.01, Number(m1) || 1);
  const mass2 = Math.max(0.01, Number(m2) || 1);
  const vel1 = Number(v1) || 0;
  const vel2 = Number(v2) || 0;
  const e = Math.max(0, Math.min(1.0, Number(restitution ?? 1.0)));

  const totalMass = mass1 + mass2;
  const pInitial = mass1 * vel1 + mass2 * vel2;
  const keInitial = 0.5 * mass1 * vel1 * vel1 + 0.5 * mass2 * vel2 * vel2;

  let v1Prime;
  let v2Prime;

  if (e === 0) {
    // Perfectly inelastic: bodies stick together
    const vCommon = pInitial / totalMass;
    v1Prime = vCommon;
    v2Prime = vCommon;
  } else {
    v1Prime = ((mass1 - e * mass2) * vel1 + (1 + e) * mass2 * vel2) / totalMass;
    v2Prime = ((1 + e) * mass1 * vel1 + (mass2 - e * mass1) * vel2) / totalMass;
  }

  const pFinal = mass1 * v1Prime + mass2 * v2Prime;
  const keFinal = 0.5 * mass1 * v1Prime * v1Prime + 0.5 * mass2 * v2Prime * v2Prime;

  return {
    v1Prime,
    v2Prime,
    pInitial,
    pFinal,
    momentumConserved: Math.abs(pInitial - pFinal) < 1e-4,
    keInitial,
    keFinal,
    keDelta: keFinal - keInitial,
    restitution: e
  };
}

// ============================================================================
// 5. PROJECTILE MOTION (2D KINEMATICS)
// ============================================================================

/**
 * Calculates theoretical projectile trajectory characteristics on level ground
 * Assumptions: level ground (y0 = 0, y_land = 0), negligible drag, constant g
 */
export function computeProjectileTheoretical(v0, angleDeg, g = GRAVITY_EARTH) {
  const speed = Math.max(0, Number(v0) || 0);
  const angle = Math.max(1, Math.min(89, Number(angleDeg) || 45));
  const rad = (angle * Math.PI) / 180;
  const grav = Math.max(0.1, g);

  const v0x = speed * Math.cos(rad);
  const v0y = speed * Math.sin(rad);

  const flightTime = (2 * v0y) / grav;
  const range = (speed * speed * Math.sin(2 * rad)) / grav;
  const maxHeight = (v0y * v0y) / (2 * grav);

  return {
    v0: speed,
    angleDeg: angle,
    angleRad: rad,
    v0x,
    v0y,
    flightTime,
    range,
    maxHeight,
    gravity: grav
  };
}

/**
 * Calculates instantaneous projectile coordinates at time t
 */
export function computeProjectileStateAtTime(v0, angleDeg, t, g = GRAVITY_EARTH) {
  const rad = (Math.max(1, Math.min(89, angleDeg)) * Math.PI) / 180;
  const v0x = v0 * Math.cos(rad);
  const v0y = v0 * Math.sin(rad);

  const x = v0x * t;
  const y = Math.max(0, v0y * t - 0.5 * g * t * t);
  const vx = v0x;
  const vy = v0y - g * t;
  const speed = Math.sqrt(vx * vx + vy * vy);

  return { x, y, vx, vy, speed };
}

// ============================================================================
// 6. SIMPLE PENDULUM
// ============================================================================

/**
 * Calculates theoretical small-angle pendulum period: T_0 = 2π · √(L / g)
 * Assumptions: Small amplitude (θ ≤ 15° ≈ 0.26 rad) so sin(θ) ≈ θ;
 * massless inextensible string/rod; point mass bob.
 */
export function computePendulumSmallAnglePeriod(length, g = GRAVITY_EARTH) {
  const L = Math.max(0.05, Number(length) || 1.0);
  const grav = Math.max(0.1, g);
  return 2 * Math.PI * Math.sqrt(L / grav);
}

/**
 * Calculates large-angle corrected period using Borda series expansion:
 * T ≈ T_0 · (1 + 1/16 · θ₀² + 11/3072 · θ₀⁴)
 */
export function computePendulumLargeAnglePeriod(length, theta0Rad, g = GRAVITY_EARTH) {
  const T0 = computePendulumSmallAnglePeriod(length, g);
  const th0 = Math.abs(Number(theta0Rad) || 0);
  const correction = 1 + (1 / 16) * th0 * th0 + (11 / 3072) * Math.pow(th0, 4);
  return T0 * correction;
}

/**
 * Numerically integrates the exact nonlinear pendulum equation:
 * d²θ/dt² = - (g / L) · sin(θ) - γ · ω
 */
export function integratePendulumStep(state, length, mass, dt, damping = 0.05, g = GRAVITY_EARTH) {
  const { theta = 0.5, omega = 0 } = state;
  const L = Math.max(0.05, Number(length) || 1.0);
  const m = Math.max(0.01, Number(mass) || 1.0);
  const timeStep = Math.min(0.04, Math.max(0.001, dt));

  // Angular acceleration α = - (g / L) · sin(θ) - damping · ω
  const alpha = -(g / L) * Math.sin(theta) - damping * omega;

  // Semi-implicit Euler integration
  const nextOmega = omega + alpha * timeStep;
  const nextTheta = theta + nextOmega * timeStep;

  // Tangential velocity v = ω · L
  const tangentialVel = nextOmega * L;

  // Potential energy U = m · g · L · (1 - cos(θ))
  const potentialEnergy = m * g * L * (1 - Math.cos(nextTheta));

  // Kinetic energy KE = 1/2 · m · v²
  const kineticEnergy = 0.5 * m * tangentialVel * tangentialVel;

  // Tension in rod: T = m · (g · cos(θ) + v² / L)
  const rodTension = m * (g * Math.cos(nextTheta) + (tangentialVel * tangentialVel) / L);

  return {
    theta: nextTheta,
    thetaDeg: (nextTheta * 180) / Math.PI,
    omega: nextOmega,
    alpha,
    tangentialVel,
    potentialEnergy,
    kineticEnergy,
    totalEnergy: potentialEnergy + kineticEnergy,
    rodTension
  };
}

// ============================================================================
// 7. ELECTRIC FIELD AND CHARGES
// ============================================================================

/**
 * Calculates net electric field at position (px, py) from a set of point charges.
 * E = k_e · Σ [ q_i · (r - r_i) / |r - r_i|³ ]
 * @param {{x: number, y: number}} point - Target coordinate (m)
 * @param {Array<{x: number, y: number, q: number}>} charges - Point charges (q in μC)
 * @param {number} k_e - Coulomb constant (default scaled 8.99 N·m²/(μC)²)
 */
export function computeElectricFieldAtPoint(point, charges = [], k_e = COULOMB_SCALED) {
  let Ex = 0;
  let Ey = 0;
  const px = Number(point?.x) || 0;
  const py = Number(point?.y) || 0;

  if (!Array.isArray(charges) || charges.length === 0) {
    return { Ex: 0, Ey: 0, magnitude: 0, angleRad: 0, angleDeg: 0 };
  }

  const EPSILON = 0.04; // Singularity softening distance to prevent infinite fields

  for (const c of charges) {
    const q = Number(c.q) || 0;
    if (q === 0) continue;

    const dx = px - (Number(c.x) || 0);
    const dy = py - (Number(c.y) || 0);
    const distSq = dx * dx + dy * dy;

    const effDistSq = Math.max(EPSILON * EPSILON, distSq);
    const effDist = Math.sqrt(effDistSq);

    // E_mag = k_e · |q| / r²
    // Direction vector: (dx/r, dy/r) multiplied by sign of q
    const fieldMag = (k_e * q) / (effDist * effDist);
    Ex += fieldMag * (dx / effDist);
    Ey += fieldMag * (dy / effDist);
  }

  const magnitude = Math.sqrt(Ex * Ex + Ey * Ey);
  const angleRad = Math.atan2(Ey, Ex);
  const angleDeg = (angleRad * 180) / Math.PI;

  return {
    Ex,
    Ey,
    magnitude,
    angleRad,
    angleDeg
  };
}

/**
 * Calculates electrostatic force on a test charge: F = q_test · E
 */
export function computeElectrostaticForce(qTestMicroC, fieldE) {
  const q = Number(qTestMicroC) || 0;
  const Ex = Number(fieldE?.Ex) || 0;
  const Ey = Number(fieldE?.Ey) || 0;

  const Fx = q * Ex;
  const Fy = q * Ey;
  const magnitude = Math.sqrt(Fx * Fx + Fy * Fy);

  return { Fx, Fy, magnitude };
}

// ============================================================================
// 8. WAVE INTERFERENCE (SUPERPOSITION PRINCIPLE)
// ============================================================================

/**
 * Calculates displacement of a traveling wave: y = A · sin(k·x - ω·t + φ)
 */
export function computeTravelingWave(A, wavelength, freq, x, t, phaseShiftRad = 0) {
  const amp = Number(A) || 0;
  const lambda = Math.max(0.1, Number(wavelength) || 1.0);
  const f = Math.max(0.1, Number(freq) || 1.0);

  const k = (2 * Math.PI) / lambda;
  const omega = 2 * Math.PI * f;

  return amp * Math.sin(k * x - omega * t + phaseShiftRad);
}

/**
 * Calculates theoretical resultant amplitude of two interfering waves:
 * A_res = √( A₁² + A₂² + 2·A₁·A₂ · cos(Δφ) )
 * Constructive interference: Δφ = 0, 2π, ... -> A_res = A1 + A2
 * Destructive interference: Δφ = π, 3π, ... -> A_res = |A1 - A2|
 */
export function computeInterferenceResultant(A1, A2, deltaPhaseRad) {
  const a1 = Math.max(0, Number(A1) || 0);
  const a2 = Math.max(0, Number(A2) || 0);
  const dPhi = Number(deltaPhaseRad) || 0;

  const cosineTerm = Math.cos(dPhi);
  const resultantAmp = Math.sqrt(Math.max(0, a1 * a1 + a2 * a2 + 2 * a1 * a2 * cosineTerm));

  // Determine interference regime
  const normalizedPhi = Math.abs(dPhi % (2 * Math.PI));
  const isConstructive = normalizedPhi < 0.25 || normalizedPhi > 2 * Math.PI - 0.25;
  const isDestructive = Math.abs(normalizedPhi - Math.PI) < 0.25;

  let regime = 'intermediate';
  if (isConstructive) regime = 'constructive';
  else if (isDestructive) regime = 'destructive';

  return {
    A1: a1,
    A2: a2,
    deltaPhaseRad: dPhi,
    deltaPhaseDeg: ((dPhi * 180) / Math.PI) % 360,
    resultantAmp,
    maxPossibleAmp: a1 + a2,
    minPossibleAmp: Math.abs(a1 - a2),
    regime
  };
}

// ============================================================================
// 9. REFLECTION AND REFRACTION (SNELL'S LAW & TOTAL INTERNAL REFLECTION)
// ============================================================================

/**
 * Calculates optical reflection and refraction according to:
 * - Law of Reflection: θ_r = θ_i
 * - Snell's Law: n₁ · sin(θ_i) = n₂ · sin(θ_t)
 * - Critical Angle (when n₁ > n₂): θ_c = arcsin(n₂ / n₁)
 * - Total Internal Reflection (TIR): when n₁ > n₂ and θ_i > θ_c
 */
export function computeOpticsRays(thetaOrObj, n1Arg, n2Arg) {
  let thetaIVal;
  let n1Val;
  let n2Val;

  if (typeof thetaOrObj === 'object' && thetaOrObj !== null) {
    thetaIVal = thetaOrObj.incidentAngleDeg ?? thetaOrObj.thetaIncidentDeg ?? 0;
    n1Val = thetaOrObj.n1 ?? 1.0;
    n2Val = thetaOrObj.n2 ?? 1.5;
  } else {
    thetaIVal = thetaOrObj;
    n1Val = n1Arg ?? 1.0;
    n2Val = n2Arg ?? 1.5;
  }

  const thetaI = Math.max(0, Math.min(89.9, Number(thetaIVal) || 0));
  const med1 = Math.max(1.0, Number(n1Val) || 1.0);
  const med2 = Math.max(1.0, Number(n2Val) || 1.0);

  const thetaIRad = (thetaI * Math.PI) / 180;
  const thetaReflectDeg = thetaI;

  let criticalAngleDeg = null;
  let isTIR = false;
  let thetaRefractDeg = null;

  if (med1 > med2) {
    const criticalRad = Math.asin(med2 / med1);
    criticalAngleDeg = (criticalRad * 180) / Math.PI;

    if (thetaI >= criticalAngleDeg) {
      isTIR = true;
      thetaRefractDeg = null;
    }
  }

  if (!isTIR) {
    const sinThetaT = (med1 / med2) * Math.sin(thetaIRad);
    if (sinThetaT <= 1.0) {
      const thetaTRad = Math.asin(sinThetaT);
      thetaRefractDeg = (thetaTRad * 180) / Math.PI;
    } else {
      isTIR = true;
      thetaRefractDeg = null;
    }
  }

  return {
    thetaIncidentDeg: thetaI,
    incidentAngleDeg: thetaI,
    thetaReflectDeg,
    reflectionAngleDeg: thetaReflectDeg,
    thetaRefractDeg,
    refractionAngleDeg: thetaRefractDeg,
    n1: med1,
    n2: med2,
    criticalAngleDeg,
    isTIR,
    isTotalInternalReflection: isTIR,
    speedV1: 1.0 / med1, // Normalized speed of light in medium 1 (c = 1)
    speedV2: 1.0 / med2  // Normalized speed of light in medium 2 (c = 1)
  };
}

// ============================================================================
// 10. FRICTION AND INCLINED PLANE
// ============================================================================

/**
 * Calculates static and kinetic equilibrium/motion on an inclined plane:
 * - Gravity: F_g = m · g
 * - Normal Force: N = m · g · cos(θ)
 * - Parallel Gravity: F_g_parallel = m · g · sin(θ)
 * - Max Static Friction: f_s_max = μ_s · N
 * - Critical Slipping Angle: θ_crit = arctan(μ_s)
 * - Kinetic Friction (when slipping): f_k = μ_k · N
 * - Acceleration down slope: a = g · (sin(θ) - μ_k · cos(θ)) if θ > θ_crit, else 0
 */
export function computeInclinedPlanePhysics(mass, angleDeg, muStatic = 0.45, muKinetic = 0.30, g = GRAVITY_EARTH) {
  const m = Math.max(0.05, Number(mass) || 1.0);
  const thetaDeg = Math.max(0, Math.min(85, Number(angleDeg) || 0));
  const muS = Math.max(0.01, Number(muStatic) || 0.45);
  // Physical constraint: kinetic friction cannot exceed static friction (μ_k <= μ_s)
  const muK = Math.min(muS, Math.max(0.0, Number(muKinetic) || 0.30));

  const thetaRad = (thetaDeg * Math.PI) / 180;
  const F_gravity = m * g;
  const F_normal = F_gravity * Math.cos(thetaRad);
  const F_parallel = F_gravity * Math.sin(thetaRad);

  const maxStaticFriction = muS * F_normal;
  const criticalAngleDeg = (Math.atan(muS) * 180) / Math.PI;

  const isSlipping = thetaDeg > criticalAngleDeg;

  let frictionForce;
  let netForceDownhill;
  let acceleration;

  if (!isSlipping) {
    // Static equilibrium: friction exactly balances downhill gravity pull
    frictionForce = F_parallel;
    netForceDownhill = 0;
    acceleration = 0;
  } else {
    // Kinetic friction opposes downhill motion
    frictionForce = muK * F_normal;
    netForceDownhill = Math.max(0, F_parallel - frictionForce);
    acceleration = netForceDownhill / m;
  }

  return {
    mass: m,
    angleDeg: thetaDeg,
    angleRad: thetaRad,
    muStatic: muS,
    muKinetic: muK,
    criticalAngleDeg,
    F_gravity,
    F_normal,
    F_parallel,
    maxStaticFriction,
    frictionForce,
    netForceDownhill,
    acceleration,
    isSlipping
  };
}

/**
 * High-precision 4th-Order Runge-Kutta (RK4) integrator for the nonlinear simple pendulum:
 * dθ/dt = ω,  dω/dt = - (g/L) · sin(θ) - b · ω
 */
export function updatePendulumRK4(params) {
  const {
    theta = 0.5,
    omega = 0,
    length = 1.0,
    mass = 1.0,
    gravity = GRAVITY_EARTH,
    damping = 0.05,
    dt = 0.016
  } = params;

  const L = Math.max(0.05, Number(length) || 1.0);
  const m = Math.max(0.01, Number(mass) || 1.0);
  const g = Math.max(0.1, Number(gravity) || GRAVITY_EARTH);
  const b = Math.max(0, Number(damping) || 0);
  const h = Math.min(0.04, Math.max(0.001, dt));

  const fTheta = (w) => w;
  const fOmega = (th, w) => -(g / L) * Math.sin(th) - b * w;

  // k1
  const k1_th = fTheta(omega);
  const k1_w = fOmega(theta, omega);

  // k2
  const k2_th = fTheta(omega + 0.5 * h * k1_w);
  const k2_w = fOmega(theta + 0.5 * h * k1_th, omega + 0.5 * h * k1_w);

  // k3
  const k3_th = fTheta(omega + 0.5 * h * k2_w);
  const k3_w = fOmega(theta + 0.5 * h * k2_th, omega + 0.5 * h * k2_w);

  // k4
  const k4_th = fTheta(omega + h * k3_w);
  const k4_w = fOmega(theta + h * k3_th, omega + h * k3_w);

  const nextTheta = theta + (h / 6) * (k1_th + 2 * k2_th + 2 * k3_th + k4_th);
  const nextOmega = omega + (h / 6) * (k1_w + 2 * k2_w + 2 * k3_w + k4_w);
  const alpha = fOmega(nextTheta, nextOmega);
  const tangentialVel = nextOmega * L;

  return {
    theta: nextTheta,
    omega: nextOmega,
    alpha,
    tangentialVel,
    potentialEnergy: m * g * L * (1 - Math.cos(nextTheta)),
    kineticEnergy: 0.5 * m * tangentialVel * tangentialVel,
    totalEnergy: m * g * L * (1 - Math.cos(nextTheta)) + 0.5 * m * tangentialVel * tangentialVel
  };
}

/**
 * Calculates electric field vector at coordinate (px, py) from a list of point charges
 */
export function computeElectricFieldVector(charges, px, py, k_e = COULOMB_SCALED) {
  return computeElectricFieldAtPoint({ x: px, y: py }, charges, k_e);
}

/**
 * Calculates scalar electric potential V at coordinate (px, py): V = k_e · Σ (q_i / r_i)
 */
export function computeElectricPotential(charges, px, py, k_e = COULOMB_SCALED) {
  let V = 0;
  if (!Array.isArray(charges) || charges.length === 0) return 0;
  const EPSILON = 0.05;
  for (const c of charges) {
    const q = Number(c.q) || 0;
    if (q === 0) continue;
    const dx = px - (Number(c.x) || 0);
    const dy = py - (Number(c.y) || 0);
    const dist = Math.max(EPSILON, Math.sqrt(dx * dx + dy * dy));
    V += (k_e * q) / dist;
  }
  return V;
}

/**
 * Numerically updates object motion on an inclined plane
 */
export function updateInclinedPlaneMotion(params) {
  const {
    angleDeg = 30,
    mass = 1.0,
    muStatic = 0.45,
    muKinetic = 0.30,
    blockDist = 0,
    blockVelocity = 0,
    dt = 0.016,
    rampLen = 1.4
  } = params;

  const physics = computeInclinedPlanePhysics(mass, angleDeg, muStatic, muKinetic);
  let nextDist = blockDist;
  let nextVel = blockVelocity;

  if (physics.isSlipping) {
    nextVel += physics.acceleration * dt;
    nextDist += nextVel * dt;
  } else {
    if (Math.abs(nextVel) < 0.05) {
      nextVel = 0;
    } else {
      const decel = physics.muKinetic * GRAVITY_EARTH * Math.cos(physics.angleRad);
      nextVel = Math.max(0, nextVel - decel * dt);
      nextDist += nextVel * dt;
    }
  }

  if (nextDist > rampLen) {
    nextDist = rampLen;
    nextVel = 0;
  } else if (nextDist < 0) {
    nextDist = 0;
    nextVel = 0;
  }

  return {
    ...physics,
    blockDist: nextDist,
    blockVelocity: nextVel
  };
}

