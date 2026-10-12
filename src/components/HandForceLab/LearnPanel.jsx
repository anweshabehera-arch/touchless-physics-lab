import { useState } from 'react';

const EXPERIMENT_DEFINITIONS = {
  newton: [
    { term: 'NET FORCE (F)', def: 'Total vector sum of all external pushes or pulls (F = m·a).' },
    { term: 'INERTIA', def: 'Resistance of any physical object to a change in its velocity.' },
    { term: 'MASS (m)', def: 'Quantitative measure of inertia in kilograms (kg).' },
    { term: 'ACCELERATION (a)', def: 'Rate of change of velocity: a = F_net / m.' },
    { term: 'VISCOUS DRAG', def: 'Fluid resistance force opposing motion: F_drag = -b·v.' }
  ],
  impulse: [
    { term: 'IMPULSE (J)', def: 'Integral of force over contact time: J = F_avg · Δt.' },
    { term: 'MOMENTUM (p)', def: 'Mass in motion: p = m · v.' },
    { term: 'IMPULSE-MOMENTUM', def: 'Total impulse equals change in linear momentum: J = Δp.' },
    { term: 'CONTACT TIME (Δt)', def: 'Duration of the collision or applied strike impact.' },
    { term: 'PEAK FORCE', def: 'Maximum instantaneous force reached during the collision.' }
  ],
  hooke: [
    { term: "HOOKE'S LAW", def: 'Restoring force is proportional to displacement: F = -k·x.' },
    { term: 'SPRING CONSTANT (k)', def: 'Stiffness of the elastic spring in Newtons/meter.' },
    { term: 'DISPLACEMENT (x)', def: 'Distance stretched or compressed from equilibrium position.' },
    { term: 'ELASTIC ENERGY (U)', def: 'Potential energy stored in deformed spring: U = ½ k x².' },
    { term: 'HARMONIC MOTION', def: 'Repetitive back-and-forth oscillation around equilibrium.' }
  ],
  collision: [
    { term: 'CONSERVATION OF p', def: 'Total linear momentum before collision equals total after: p_tot = const.' },
    { term: 'ELASTIC COLLISION', def: 'Collision where total mechanical kinetic energy is conserved.' },
    { term: 'RESTITUTION (e)', def: 'Ratio of relative separation speed to approach speed (e = 1 for elastic).' },
    { term: 'MOMENTUM EXCHANGE', def: 'Equal masses with target at rest exchange 100% of velocity.' },
    { term: 'INTERNAL FORCES', def: 'Action-reaction normal forces cancel within the two-body system.' }
  ],
  projectile: [
    { term: 'PROJECTILE MOTION', def: '2D motion with constant horizontal speed and vertical gravitational acceleration.' },
    { term: 'LAUNCH ANGLE (θ)', def: 'Angle of initial velocity vector above the horizontal ground.' },
    { term: 'HORIZONTAL RANGE', def: 'Maximum horizontal distance traveled: R = (v₀² sin 2θ) / g.' },
    { term: 'APEX HEIGHT (H)', def: 'Maximum vertical altitude reached where vertical velocity v_y = 0.' },
    { term: 'GRAVITY (g)', def: 'Constant downward acceleration toward Earth (9.80 m/s²).' }
  ],
  pendulum: [
    { term: 'PENDULUM PERIOD (T)', def: 'Time for one complete oscillation: T₀ = 2π√(L/g) for small angles.' },
    { term: 'LENGTH (L)', def: 'Distance from pivot to center of mass of the bob.' },
    { term: 'SMALL-ANGLE APPROX', def: 'sin(θ) ≈ θ holds within θ ≤ 15° (0.26 rad); larger angles elongate period.' },
    { term: 'RESTORING TORQUE', def: 'Gravitational restoring component τ = -mgL sin(θ) directed toward vertical.' },
    { term: 'ROD TENSION', def: 'Centripetal and gravitational tension: T = m(g cos θ + v²/L).' }
  ],
  electric: [
    { term: 'ELECTRIC FIELD (E)', def: 'Force exerted per unit positive test charge: E = F / q_test (in N/C).' },
    { term: "COULOMB'S LAW", def: 'Electrostatic force between point charges: F = k_e · |q₁q₂| / r².' },
    { term: 'SUPERPOSITION', def: 'Total electric field is the vector sum of fields from each individual charge.' },
    { term: 'INVERSE-SQUARE LAW', def: 'Field strength dilutes with distance squared (E ∝ 1/r²).' },
    { term: 'ELECTRIC DIPOLE', def: 'Pair of equal and opposite charges separated by distance d.' }
  ],
  wave: [
    { term: 'SUPERPOSITION', def: 'Resultant displacement equals pointwise algebraic sum: y_res = y₁ + y₂.' },
    { term: 'CONSTRUCTIVE', def: 'In-phase waves (Δφ = 0, 2π) reinforce, maximizing resultant amplitude.' },
    { term: 'DESTRUCTIVE', def: 'Out-of-phase waves (Δφ = π) oppose, canceling resultant amplitude.' },
    { term: 'PHASE DIFFERENCE (Δφ)', def: 'Angular shift between corresponding wave cycles in radians or degrees.' },
    { term: 'WAVE NODES', def: 'Spatial points experiencing persistent zero displacement.' }
  ],
  optics: [
    { term: "SNELL'S LAW", def: 'Governs beam refraction across media: n₁ sin(θ_i) = n₂ sin(θ_t).' },
    { term: 'LAW OF REFLECTION', def: 'Angle of reflection equals angle of incidence: θ_r = θ_i.' },
    { term: 'REFRACTIVE INDEX (n)', def: 'Ratio of vacuum light speed to medium speed: n = c / v.' },
    { term: 'CRITICAL ANGLE (θ_c)', def: 'Incident angle causing 90° refraction: θ_c = arcsin(n₂ / n₁) (n₁ > n₂).' },
    { term: 'TOTAL INTERNAL REFL', def: '100% reflection with zero transmission when θ_i > θ_c.' }
  ],
  incline: [
    { term: 'NORMAL FORCE (N)', def: 'Perpendicular contact force supporting object: N = mg cos(θ).' },
    { term: 'STATIC FRICTION (f_s)', def: 'Self-adjusting friction resisting slipping: f_s ≤ μ_s N.' },
    { term: 'KINETIC FRICTION (f_k)', def: 'Retarding force during sliding: f_k = μ_k N.' },
    { term: 'ANGLE OF REPOSE', def: 'Critical slope angle for slip onset: tan(θ_c) = μ_s.' },
    { term: 'NET ACCELERATION', def: 'Downhill acceleration: a = g(sin θ - μ_k cos θ) when θ > θ_c.' }
  ]
};

export default function LearnPanel({ activeExperimentId = 'newton' }) {
  const [isExpanded, setIsExpanded] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1200 : true;
  });

  const definitions = EXPERIMENT_DEFINITIONS[activeExperimentId] || EXPERIMENT_DEFINITIONS.newton;

  return (
    <div className="learn-panel-container">
      <div className="learn-header">
        <span className="learn-title">📖 CORE CONCEPTS</span>
        <button
          type="button"
          className="btn-learn-toggle"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? '▼ Hide' : '▲ Show'}
        </button>
      </div>

      {isExpanded && (
        <div className="learn-terms-list">
          {definitions.map((d) => (
            <div key={d.term} className="learn-term-card">
              <strong>{d.term}</strong>
              <p>{d.def}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
