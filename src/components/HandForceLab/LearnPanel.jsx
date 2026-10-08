import React, { useState } from 'react';

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
  ]
};

export default function LearnPanel({ activeExperimentId = 'newton' }) {
  const [isExpanded, setIsExpanded] = useState(true);

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
