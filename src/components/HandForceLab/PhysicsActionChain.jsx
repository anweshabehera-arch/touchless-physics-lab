import React from 'react';

const CHAINS = {
  newton: [
    { key: 'isHandMoving', label: '🖐️ HAND MOVEMENT' },
    { key: 'isForceApplied', label: '⚡ FORCE (F)', extraClass: 'active-force' },
    { key: 'isAccelerating', label: '📈 ACCELERATION (a)', extraClass: 'active-accel' },
    { key: 'isVelocityChanging', label: 'Δv VELOCITY CHANGE' },
    { key: 'isBallMoving', label: '⚪ MOTION', extraClass: 'active-motion' }
  ],
  impulse: [
    { key: 'isHandMoving', label: '🖐️ HAND STRIKE' },
    { key: 'isForceApplied', label: '⚡ IMPACT FORCE', extraClass: 'active-force' },
    { key: 'isAccelerating', label: '⏱️ CONTACT DURATION', extraClass: 'active-accel' },
    { key: 'isVelocityChanging', label: '💨 IMPULSE J = F·Δt' },
    { key: 'isBallMoving', label: 'Δp MOMENTUM GAIN', extraClass: 'active-motion' }
  ],
  hooke: [
    { key: 'isHandMoving', label: '🖐️ DRAG MASS' },
    { key: 'isForceApplied', label: '📐 DISPLACEMENT (x)', extraClass: 'active-force' },
    { key: 'isAccelerating', label: '⚡ RESTORING F = -kx', extraClass: 'active-accel' },
    { key: 'isVelocityChanging', label: '📈 ACCELERATION (-k/m·x)' },
    { key: 'isBallMoving', label: '🌀 HARMONIC RETURN', extraClass: 'active-motion' }
  ],
  collision: [
    { key: 'isHandMoving', label: '🖐️ PUSH BALL 1' },
    { key: 'isForceApplied', label: '🔵 BALL 1 MOMENTUM', extraClass: 'active-force' },
    { key: 'isAccelerating', label: '💥 ELASTIC IMPACT', extraClass: 'active-accel' },
    { key: 'isVelocityChanging', label: '⚡ VELOCITY EXCHANGE' },
    { key: 'isBallMoving', label: '🟣 p_tot CONSERVED', extraClass: 'active-motion' }
  ],
  projectile: [
    { key: 'isHandMoving', label: '🖐️ AIM ANGLE (θ)' },
    { key: 'isForceApplied', label: '🎯 LAUNCH SPEED (v₀)', extraClass: 'active-force' },
    { key: 'isAccelerating', label: '🚀 FIRE LAUNCH', extraClass: 'active-accel' },
    { key: 'isVelocityChanging', label: '🌍 GRAVITY (-g)' },
    { key: 'isBallMoving', label: '📈 PARABOLIC FLIGHT', extraClass: 'active-motion' }
  ]
};

export default function PhysicsActionChain({ chainState = {}, activeExperimentId = 'newton' }) {
  const steps = CHAINS[activeExperimentId] || CHAINS.newton;

  return (
    <div className="physics-action-chain" aria-label="Physics Cause and Effect Chain">
      {steps.map((node, i) => {
        const isActive = Boolean(chainState[node.key]);
        return (
          <React.Fragment key={node.label}>
            <div className={`chain-node ${isActive ? `active ${node.extraClass || ''}` : ''}`}>
              <span>{node.label}</span>
            </div>
            {i < steps.length - 1 && <span className="chain-arrow">➔</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
