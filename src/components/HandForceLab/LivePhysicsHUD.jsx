import { useState } from 'react';
import { Activity, TrendingUp, RotateCcw, Play, Pause, FileText, Zap } from 'lucide-react';
import PhysicsLiveGraph from './PhysicsLiveGraph';

export default function LivePhysicsHUD({
  activeExperimentId = 'newton',
  activeExperiment = null,
  physicsData = {},
  // Parameter controls & callbacks for core labs
  mass = 1.0,
  onMassChange,
  mass2 = 1.0,
  onMass2Change,
  springK = 25.0,
  onSpringKChange,
  launchAngle = 45,
  onLaunchAngleChange,
  launchSpeed = 5.0,
  onLaunchSpeedChange,
  appliedForceManual = 0,
  onAppliedForceManualChange,
  collisionType = 'elastic', // 'elastic' | 'inelastic'
  onToggleCollisionType,
  onFireProjectile,
  onTriggerImpact,
  onLaunchBall1,
  onResetBall,
  isPaused = false,
  onTogglePause,
  onOpenReport,
  // Parameter controls for New Experiments (6-10)
  // 6. Pendulum
  pendulumLength = 1.0,
  onPendulumLengthChange,
  pendulumInitAngle = 25,
  onPendulumInitAngleChange,
  onReleasePendulum,
  // 7. Electric Field
  charge1Q = 2.0,
  onChangeCharge1Q,
  charge2Q = -2.0,
  onChangeCharge2Q,
  chargeTestQ = 1.0,
  onChangeChargeTestQ,
  onResetCharges,
  // 8. Wave Interference
  waveA1 = 1.0,
  onChangeWaveA1,
  waveA2 = 1.0,
  onChangeWaveA2,
  wavePhaseDeg = 0,
  onChangeWavePhaseDeg,
  waveFreq = 1.0,
  onChangeWaveFreq,
  // 9. Reflection & Refraction
  opticsIncidentAngle = 45,
  onChangeOpticsIncidentAngle,
  opticsN1 = 1.0,
  onChangeOpticsN1,
  opticsN2 = 1.5,
  onChangeOpticsN2,
  onSwapMedia,
  // 10. Friction & Incline
  inclineAngle = 25,
  onChangeInclineAngle,
  inclineMuStatic = 0.45,
  onChangeInclineMuStatic,
  inclineMuKinetic = 0.30,
  onChangeInclineMuKinetic
}) {
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'graph'

  const {
    force = 0,
    acceleration = 0,
    velocity = 0,
    posX = 0,
    posY = 0,
    momentum = 0,
    kineticEnergy = 0,
    // Impulse-specific
    peakForce = 0,
    contactTime = 0,
    impulseJ = 0,
    deltaMomentum = 0,
    // Hooke-specific
    displacement = 0,
    springForce = 0,
    potentialEnergy = 0,
    // Collision-specific
    v1 = 0,
    v2 = 0,
    p1 = 0,
    p2 = 0,
    pTotal = 0,
    keTotal = 0,
    // Projectile-specific
    projAngle = 45,
    projV0 = 5.0,
    range = 0,
    maxHeight = 0,
    flightTime = 0,
    isAirborne = false,
    // Pendulum-specific
    thetaDeg = 0,
    omega = 0,
    pendulumPeriod = 2.01,
    rodTension = 9.8,
    // Electric-specific
    eFieldMag = 0,
    testChargeForce = 0,
    probeDist = 0,
    // Wave-specific
    waveResultantAmp = 2.0,
    waveRegime = 'constructive',
    // Optics-specific
    thetaReflectDeg = 45,
    thetaRefractDeg = 28.1,
    criticalAngleDeg = 41.8,
    isTIR = false,
    // Incline-specific
    inclineNormal = 8.88,
    inclineFriction = 4.14,
    inclineAccel = 0,
    inclineSlipping = false
  } = physicsData || {};

  return (
    <div className="live-physics-panel" aria-label="Live Physics Panel">
      {/* Title & Tab Switcher */}
      <div className="panel-title-badge">
        <span className="hud-title">⚡ LIVE PHYSICS DASHBOARD</span>
        <span className="live-indicator-dot" title="Live Simulation Telemetry Active" />
      </div>

      <div className="hud-tab-bar">
        <button
          type="button"
          className={`hud-tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
        >
          <Activity className="btn-icon-xs" />
          Live Telemetry
        </button>
        <button
          type="button"
          className={`hud-tab-btn ${activeTab === 'graph' ? 'active' : ''}`}
          onClick={() => setActiveTab('graph')}
        >
          <TrendingUp className="btn-icon-xs" />
          Dynamic Graph
        </button>
      </div>

      {/* TAB 1: TELEMETRY & CONTROLS */}
      {activeTab === 'telemetry' && (
        <div className="hud-telemetry-content">
          {/* =========================================================
              MODE 1: NEWTON'S 2ND LAW
              ========================================================= */}
          {activeExperimentId === 'newton' && (
            <>
              <div className="live-data-grid">
                <div className="data-tile tile-mass">
                  <span>MASS (m)</span>
                  <strong>{Number(mass).toFixed(2)} kg</strong>
                </div>

                <div className="data-tile tile-force">
                  <span>NET FORCE (F)</span>
                  <strong>{Number(force).toFixed(2)} N</strong>
                </div>

                <div className="data-tile tile-accel">
                  <span>ACCEL (a = F/m)</span>
                  <strong>{Number(acceleration).toFixed(2)} m/s²</strong>
                </div>

                <div className="data-tile tile-vel">
                  <span>SPEED (|v|)</span>
                  <strong>{Number(velocity).toFixed(2)} m/s</strong>
                </div>

                <div className="data-tile">
                  <span>MOMENTUM (p)</span>
                  <strong>{Number(momentum).toFixed(2)} kg·m/s</strong>
                </div>

                <div className="data-tile">
                  <span>KINETIC ENERGY (KE)</span>
                  <strong>{Number(kineticEnergy).toFixed(2)} J</strong>
                </div>

                <div className="data-tile wide">
                  <span>BALL POSITION (X, Y)</span>
                  <strong>
                    X: {posX >= 0 ? `+${Number(posX).toFixed(2)}` : Number(posX).toFixed(2)} | Y: {posY >= 0 ? `+${Number(posY).toFixed(2)}` : Number(posY).toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* Parameter Controls */}
              <div className="mass-control-group">
                <div className="mass-label-row">
                  <span>ADJUST MASS (Inertia):</span>
                  <strong>{Number(mass).toFixed(1)} kg</strong>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  className="mass-slider"
                  value={mass}
                  onChange={(e) => onMassChange?.(parseFloat(e.target.value))}
                />
                <div className="quick-mass-pills">
                  {[0.5, 1.0, 2.0, 4.0].map((mVal) => (
                    <button
                      key={mVal}
                      type="button"
                      className={`mass-pill ${Math.abs(mass - mVal) < 0.05 ? 'active' : ''}`}
                      onClick={() => onMassChange?.(mVal)}
                    >
                      {mVal}kg
                    </button>
                  ))}
                </div>

                {onAppliedForceManualChange && (
                  <>
                    <div className="mass-label-row" style={{ marginTop: '10px' }}>
                      <span>DIRECT APPLIED FORCE:</span>
                      <strong>{Number(appliedForceManual).toFixed(1)} N</strong>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="12.0"
                      step="0.5"
                      className="mass-slider"
                      value={appliedForceManual}
                      onChange={(e) => onAppliedForceManualChange(parseFloat(e.target.value))}
                    />
                  </>
                )}
              </div>
            </>
          )}

          {/* =========================================================
              MODE 2: IMPULSE & MOMENTUM (J = F · Δt = Δp)
              ========================================================= */}
          {activeExperimentId === 'impulse' && (
            <>
              <div className="live-data-grid">
                <div className="data-tile tile-force">
                  <span>PEAK FORCE (F_max)</span>
                  <strong>{Number(peakForce || force).toFixed(2)} N</strong>
                </div>

                <div className="data-tile tile-accel">
                  <span>CONTACT TIME (Δt)</span>
                  <strong>{(Number(contactTime) * 1000).toFixed(0)} ms</strong>
                </div>

                <div className="data-tile tile-vel">
                  <span>IMPULSE (J = F·Δt)</span>
                  <strong>{Number(impulseJ).toFixed(3)} N·s</strong>
                </div>

                <div className="data-tile">
                  <span>MOMENTUM CHG (Δp)</span>
                  <strong>{Number(deltaMomentum).toFixed(3)} kg·m/s</strong>
                </div>

                <div className="data-tile tile-mass">
                  <span>TARGET MASS (m)</span>
                  <strong>{Number(mass).toFixed(2)} kg</strong>
                </div>

                <div className="data-tile">
                  <span>SPEED (|v|)</span>
                  <strong>{Number(velocity).toFixed(2)} m/s</strong>
                </div>

                <div className="data-tile wide">
                  <span>IMPULSE EQUALITY CHECK</span>
                  <strong style={{ color: Math.abs(impulseJ - deltaMomentum) < 0.05 && impulseJ > 0 ? '#31f2a1' : '#38d9ff' }}>
                    J ({Number(impulseJ).toFixed(2)} N·s) ≈ Δp ({Number(deltaMomentum).toFixed(2)} kg·m/s)
                  </strong>
                </div>
              </div>

              <div className="mass-control-group">
                <div className="mass-label-row">
                  <span>TARGET OBJECT MASS:</span>
                  <strong>{Number(mass).toFixed(1)} kg</strong>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  className="mass-slider"
                  value={mass}
                  onChange={(e) => onMassChange?.(parseFloat(e.target.value))}
                />
                <div className="quick-mass-pills">
                  {[0.5, 1.0, 2.0].map((mVal) => (
                    <button
                      key={mVal}
                      type="button"
                      className={`mass-pill ${Math.abs(mass - mVal) < 0.05 ? 'active' : ''}`}
                      onClick={() => onMassChange?.(mVal)}
                    >
                      {mVal}kg
                    </button>
                  ))}
                </div>

                {onTriggerImpact && (
                  <button
                    type="button"
                    className="btn-hud-action btn-fire"
                    onClick={onTriggerImpact}
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    <Zap className="btn-icon-xs" />
                    Trigger High Impulse Strike (Click Alternative)
                  </button>
                )}
              </div>
            </>
          )}

          {/* =========================================================
              MODE 3: HOOKE'S LAW & SPRINGS (F = -kx)
              ========================================================= */}
          {activeExperimentId === 'hooke' && (
            <>
              <div className="live-data-grid">
                <div className="data-tile tile-accel">
                  <span>DISPLACEMENT (x)</span>
                  <strong>{displacement >= 0 ? `+${Number(displacement).toFixed(2)}` : Number(displacement).toFixed(2)} m</strong>
                </div>

                <div className="data-tile tile-mass">
                  <span>SPRING CONSTANT (k)</span>
                  <strong>{Number(springK).toFixed(1)} N/m</strong>
                </div>

                <div className="data-tile tile-force">
                  <span>RESTORING FORCE (F)</span>
                  <strong>{Number(springForce).toFixed(2)} N</strong>
                </div>

                <div className="data-tile tile-vel">
                  <span>MASS SPEED (|v|)</span>
                  <strong>{Number(velocity).toFixed(2)} m/s</strong>
                </div>

                <div className="data-tile">
                  <span>ELASTIC ENERGY (U_e)</span>
                  <strong>{Number(potentialEnergy).toFixed(2)} J</strong>
                </div>

                <div className="data-tile">
                  <span>KINETIC ENERGY (KE)</span>
                  <strong>{Number(kineticEnergy).toFixed(2)} J</strong>
                </div>

                <div className="data-tile wide">
                  <span>TOTAL MECHANICAL ENERGY</span>
                  <strong>{(Number(potentialEnergy) + Number(kineticEnergy)).toFixed(2)} J</strong>
                </div>
              </div>

              <div className="mass-control-group">
                <div className="mass-label-row">
                  <span>SPRING STIFFNESS (k):</span>
                  <strong>{Number(springK).toFixed(0)} N/m</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  className="mass-slider"
                  value={springK}
                  onChange={(e) => onSpringKChange?.(parseFloat(e.target.value))}
                />
                <div className="quick-mass-pills">
                  {[15, 30, 50, 75].map((kVal) => (
                    <button
                      key={kVal}
                      type="button"
                      className={`mass-pill ${Math.abs(springK - kVal) < 2 ? 'active' : ''}`}
                      onClick={() => onSpringKChange?.(kVal)}
                    >
                      {kVal} N/m
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              MODE 4: COLLISIONS & MOMENTUM CONSERVATION
              ========================================================= */}
          {activeExperimentId === 'collision' && (
            <>
              <div className="live-data-grid">
                <div className="data-tile tile-vel">
                  <span>BALL 1 SPEED (v₁)</span>
                  <strong>{Number(v1).toFixed(2)} m/s</strong>
                </div>

                <div className="data-tile tile-vel">
                  <span>BALL 2 SPEED (v₂)</span>
                  <strong>{Number(v2).toFixed(2)} m/s</strong>
                </div>

                <div className="data-tile tile-mass">
                  <span>MOMENTUM p₁</span>
                  <strong>{Number(p1).toFixed(2)} kg·m/s</strong>
                </div>

                <div className="data-tile tile-mass">
                  <span>MOMENTUM p₂</span>
                  <strong>{Number(p2).toFixed(2)} kg·m/s</strong>
                </div>

                <div className="data-tile tile-accel">
                  <span>TOTAL MOMENTUM</span>
                  <strong style={{ color: '#31f2a1' }}>{Number(pTotal).toFixed(2)} kg·m/s</strong>
                </div>

                <div className="data-tile">
                  <span>TOTAL KINETIC ENERGY</span>
                  <strong>{Number(keTotal).toFixed(2)} J</strong>
                </div>

                <div className="data-tile wide">
                  <span>COLLISION MODE</span>
                  <strong style={{ color: collisionType === 'elastic' ? '#31f2a1' : '#ffbb33' }}>
                    {collisionType === 'elastic' ? '⚡ ELASTIC (KE Conserved)' : '🔒 INELASTIC (Objects Stick)'}
                  </strong>
                </div>
              </div>

              <div className="mass-control-group">
                <div className="mass-label-row">
                  <span>COLLISION RESTITUTION:</span>
                  <strong>{collisionType.toUpperCase()}</strong>
                </div>
                <div className="quick-mass-pills">
                  <button
                    type="button"
                    className={`mass-pill ${collisionType === 'elastic' ? 'active' : ''}`}
                    onClick={() => onToggleCollisionType?.('elastic')}
                  >
                    Elastic (e = 1.0)
                  </button>
                  <button
                    type="button"
                    className={`mass-pill ${collisionType === 'inelastic' ? 'active' : ''}`}
                    onClick={() => onToggleCollisionType?.('inelastic')}
                  >
                    Inelastic (e = 0.0)
                  </button>
                </div>

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>BALL 1 MASS (Cyan):</span>
                  <strong>{Number(mass).toFixed(1)} kg</strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.5"
                  className="mass-slider"
                  value={mass}
                  onChange={(e) => onMassChange?.(parseFloat(e.target.value))}
                />

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>BALL 2 MASS (Magenta):</span>
                  <strong>{Number(mass2).toFixed(1)} kg</strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.5"
                  className="mass-slider"
                  value={mass2}
                  onChange={(e) => onMass2Change?.(parseFloat(e.target.value))}
                />

                {onLaunchBall1 && (
                  <button
                    type="button"
                    className="btn-hud-action btn-fire"
                    onClick={onLaunchBall1}
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    Launch Ball 1 into Ball 2
                  </button>
                )}
              </div>
            </>
          )}

          {/* =========================================================
              MODE 5: PROJECTILE MOTION
              ========================================================= */}
          {activeExperimentId === 'projectile' && (
            <>
              <div className="live-data-grid">
                <div className="data-tile tile-accel">
                  <span>LAUNCH ANGLE (θ)</span>
                  <strong>{Number(projAngle || launchAngle).toFixed(0)}°</strong>
                </div>

                <div className="data-tile tile-vel">
                  <span>LAUNCH SPEED (v₀)</span>
                  <strong>{Number(projV0 || launchSpeed).toFixed(1)} m/s</strong>
                </div>

                <div className="data-tile tile-force">
                  <span>MAX HEIGHT (H_max)</span>
                  <strong>{Number(maxHeight).toFixed(2)} m</strong>
                </div>

                <div className="data-tile tile-mass">
                  <span>HORIZONTAL RANGE (R)</span>
                  <strong>{Number(range).toFixed(2)} m</strong>
                </div>

                <div className="data-tile">
                  <span>FLIGHT TIME (t)</span>
                  <strong>{Number(flightTime).toFixed(2)} s</strong>
                </div>

                <div className="data-tile">
                  <span>GRAVITY (g)</span>
                  <strong>9.80 m/s²</strong>
                </div>

                <div className="data-tile wide">
                  <span>STATUS</span>
                  <strong style={{ color: isAirborne ? '#31f2a1' : '#38d9ff' }}>
                    {isAirborne ? '🚀 IN FLIGHT' : 'READY TO LAUNCH'}
                  </strong>
                </div>
              </div>

              <div className="mass-control-group">
                <div className="mass-label-row">
                  <span>AIM ANGLE (θ):</span>
                  <strong>{Number(launchAngle).toFixed(0)}°</strong>
                </div>
                <input
                  type="range"
                  min="15"
                  max="75"
                  step="1"
                  className="mass-slider"
                  value={launchAngle}
                  onChange={(e) => onLaunchAngleChange?.(parseFloat(e.target.value))}
                />
                <div className="quick-mass-pills">
                  {[30, 45, 60].map((ang) => (
                    <button
                      key={ang}
                      type="button"
                      className={`mass-pill ${Math.abs(launchAngle - ang) < 2 ? 'active' : ''}`}
                      onClick={() => onLaunchAngleChange?.(ang)}
                    >
                      {ang}° {ang === 45 ? '(Max R)' : ''}
                    </button>
                  ))}
                </div>

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>LAUNCH VELOCITY (v₀):</span>
                  <strong>{Number(launchSpeed).toFixed(1)} m/s</strong>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="10.0"
                  step="0.5"
                  className="mass-slider"
                  value={launchSpeed}
                  onChange={(e) => onLaunchSpeedChange?.(parseFloat(e.target.value))}
                />
              </div>

              {onFireProjectile && (
                <button
                  type="button"
                  className="btn-hud-action btn-fire"
                  onClick={onFireProjectile}
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    background: 'linear-gradient(135deg, #167cff, #38d9ff)',
                    color: '#fff',
                    fontWeight: 800
                  }}
                >
                  🚀 Fire Cannon (or Quick Flick)
                </button>
              )}
            </>
          )}

          {/* =========================================================
              MODE 6: SIMPLE PENDULUM (NEW)
              ========================================================= */}
          {activeExperimentId === 'pendulum' && (
            <>
              <div className="live-data-grid">
                <div className="data-tile tile-mass">
                  <span>ROD LENGTH (L)</span>
                  <strong>{Number(pendulumLength).toFixed(2)} m</strong>
                </div>

                <div className="data-tile tile-mass">
                  <span>BOB MASS (m)</span>
                  <strong>{Number(mass).toFixed(2)} kg</strong>
                </div>

                <div className="data-tile tile-accel">
                  <span>ANGLE (θ)</span>
                  <strong>{Number(thetaDeg).toFixed(1)}°</strong>
                </div>

                <div className="data-tile tile-vel">
                  <span>ANGULAR SPEED (|ω|)</span>
                  <strong>{Math.abs(Number(omega)).toFixed(2)} rad/s</strong>
                </div>

                <div className="data-tile tile-vel">
                  <span>TANGENTIAL VEL</span>
                  <strong>{Number(velocity).toFixed(2)} m/s</strong>
                </div>

                <div className="data-tile tile-force">
                  <span>ROD TENSION (T)</span>
                  <strong>{Number(rodTension).toFixed(2)} N</strong>
                </div>

                <div className="data-tile wide">
                  <span>THEORETICAL PERIOD (T₀)</span>
                  <strong style={{ color: '#31f2a1' }}>
                    T₀ = 2π√(L/g) = {Number(pendulumPeriod).toFixed(2)} s
                  </strong>
                </div>
              </div>

              <div className="mass-control-group">
                <div className="mass-label-row">
                  <span>ROD LENGTH (L):</span>
                  <strong>{Number(pendulumLength).toFixed(2)} m</strong>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.8"
                  step="0.05"
                  className="mass-slider"
                  value={pendulumLength}
                  onChange={(e) => onPendulumLengthChange?.(parseFloat(e.target.value))}
                />

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>BOB MASS (m):</span>
                  <strong>{Number(mass).toFixed(1)} kg</strong>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.2"
                  className="mass-slider"
                  value={mass}
                  onChange={(e) => onMassChange?.(parseFloat(e.target.value))}
                />

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>INITIAL ANGLE (θ₀):</span>
                  <strong>{Number(pendulumInitAngle).toFixed(0)}°</strong>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  step="5"
                  className="mass-slider"
                  value={pendulumInitAngle}
                  onChange={(e) => onPendulumInitAngleChange?.(parseFloat(e.target.value))}
                />

                {onReleasePendulum && (
                  <button
                    type="button"
                    className="btn-hud-action btn-fire"
                    onClick={onReleasePendulum}
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    ⏱️ Release Pendulum from Initial θ₀
                  </button>
                )}
              </div>
            </>
          )}

          {/* =========================================================
              MODE 7: ELECTRIC FIELD AND CHARGES (NEW)
              ========================================================= */}
          {activeExperimentId === 'electric' && (
            <>
              <div className="live-data-grid">
                <div className="data-tile tile-force">
                  <span>PROBE FIELD (|E|)</span>
                  <strong>{Number(eFieldMag).toFixed(1)} N/C</strong>
                </div>

                <div className="data-tile tile-vel">
                  <span>PROBE FORCE (|F|)</span>
                  <strong>{Number(testChargeForce).toFixed(2)} N</strong>
                </div>

                <div className="data-tile tile-accel">
                  <span>PROBE DIST (r)</span>
                  <strong>{Number(probeDist).toFixed(2)} m</strong>
                </div>

                <div className="data-tile tile-mass">
                  <span>TEST CHARGE (q₀)</span>
                  <strong>{Number(chargeTestQ).toFixed(1)} μC</strong>
                </div>

                <div className="data-tile">
                  <span>SOURCE Q₁</span>
                  <strong style={{ color: charge1Q > 0 ? '#38d9ff' : '#e040fb' }}>
                    {charge1Q >= 0 ? `+${Number(charge1Q).toFixed(1)}` : Number(charge1Q).toFixed(1)} μC
                  </strong>
                </div>

                <div className="data-tile">
                  <span>SOURCE Q₂</span>
                  <strong style={{ color: charge2Q > 0 ? '#38d9ff' : '#e040fb' }}>
                    {charge2Q >= 0 ? `+${Number(charge2Q).toFixed(1)}` : Number(charge2Q).toFixed(1)} μC
                  </strong>
                </div>

                <div className="data-tile wide">
                  <span>GOVERNING LAW</span>
                  <strong style={{ color: '#31f2a1' }}>
                    Coulomb's Law: E = k_e·Σ(q_i/r_i²) (k_e = 8.99 N·m²/μC²)
                  </strong>
                </div>
              </div>

              <div className="mass-control-group">
                <div className="mass-label-row">
                  <span>SOURCE CHARGE 1 (q₁):</span>
                  <strong>{charge1Q >= 0 ? `+${Number(charge1Q).toFixed(1)}` : Number(charge1Q).toFixed(1)} μC</strong>
                </div>
                <input
                  type="range"
                  min="-5.0"
                  max="5.0"
                  step="0.5"
                  className="mass-slider"
                  value={charge1Q}
                  onChange={(e) => onChangeCharge1Q?.(parseFloat(e.target.value))}
                />

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>SOURCE CHARGE 2 (q₂):</span>
                  <strong>{charge2Q >= 0 ? `+${Number(charge2Q).toFixed(1)}` : Number(charge2Q).toFixed(1)} μC</strong>
                </div>
                <input
                  type="range"
                  min="-5.0"
                  max="5.0"
                  step="0.5"
                  className="mass-slider"
                  value={charge2Q}
                  onChange={(e) => onChangeCharge2Q?.(parseFloat(e.target.value))}
                />

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>PROBE TEST CHARGE (q₀):</span>
                  <strong>{chargeTestQ >= 0 ? `+${Number(chargeTestQ).toFixed(1)}` : Number(chargeTestQ).toFixed(1)} μC</strong>
                </div>
                <input
                  type="range"
                  min="-3.0"
                  max="3.0"
                  step="0.5"
                  className="mass-slider"
                  value={chargeTestQ}
                  onChange={(e) => onChangeChargeTestQ?.(parseFloat(e.target.value))}
                />

                {onResetCharges && (
                  <button
                    type="button"
                    className="btn-hud-action"
                    onClick={onResetCharges}
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    Reset Dipole Configuration
                  </button>
                )}
              </div>
            </>
          )}

          {/* =========================================================
              MODE 8: WAVE INTERFERENCE (NEW)
              ========================================================= */}
          {activeExperimentId === 'wave' && (
            <>
              <div className="live-data-grid">
                <div className="data-tile tile-vel">
                  <span>WAVE 1 AMP (A₁)</span>
                  <strong>{Number(waveA1).toFixed(2)} m</strong>
                </div>

                <div className="data-tile tile-vel">
                  <span>WAVE 2 AMP (A₂)</span>
                  <strong>{Number(waveA2).toFixed(2)} m</strong>
                </div>

                <div className="data-tile tile-accel">
                  <span>PHASE SHIFT (Δφ)</span>
                  <strong>{Number(wavePhaseDeg).toFixed(0)}° ({((wavePhaseDeg * Math.PI) / 180).toFixed(2)} rad)</strong>
                </div>

                <div className="data-tile tile-force">
                  <span>RESULTANT AMP</span>
                  <strong style={{ color: waveRegime === 'constructive' ? '#31f2a1' : waveRegime === 'destructive' ? '#ff6b6b' : '#38d9ff' }}>
                    {Number(waveResultantAmp).toFixed(2)} m
                  </strong>
                </div>

                <div className="data-tile">
                  <span>FREQUENCY (f)</span>
                  <strong>{Number(waveFreq).toFixed(1)} Hz</strong>
                </div>

                <div className="data-tile">
                  <span>REGIME</span>
                  <strong style={{ textTransform: 'uppercase', color: waveRegime === 'constructive' ? '#31f2a1' : '#ffbb33' }}>
                    {waveRegime}
                  </strong>
                </div>

                <div className="data-tile wide">
                  <span>SUPERPOSITION THEOREM</span>
                  <strong>
                    y_res = y₁ + y₂ | A_res = √(A₁² + A₂² + 2A₁A₂ cos Δφ)
                  </strong>
                </div>
              </div>

              <div className="mass-control-group">
                <div className="mass-label-row">
                  <span>PHASE DIFFERENCE (Δφ):</span>
                  <strong>{Number(wavePhaseDeg).toFixed(0)}°</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  className="mass-slider"
                  value={wavePhaseDeg}
                  onChange={(e) => onChangeWavePhaseDeg?.(parseFloat(e.target.value))}
                />
                <div className="quick-mass-pills">
                  {[0, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      className={`mass-pill ${Math.abs(wavePhaseDeg - deg) < 4 ? 'active' : ''}`}
                      onClick={() => onChangeWavePhaseDeg?.(deg)}
                    >
                      {deg}° {deg === 0 ? '(Construct)' : deg === 180 ? '(Cancel)' : ''}
                    </button>
                  ))}
                </div>

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>AMPLITUDE A₁:</span>
                  <strong>{Number(waveA1).toFixed(2)} m</strong>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  className="mass-slider"
                  value={waveA1}
                  onChange={(e) => onChangeWaveA1?.(parseFloat(e.target.value))}
                />

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>AMPLITUDE A₂:</span>
                  <strong>{Number(waveA2).toFixed(2)} m</strong>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  className="mass-slider"
                  value={waveA2}
                  onChange={(e) => onChangeWaveA2?.(parseFloat(e.target.value))}
                />

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>WAVE FREQUENCY (f):</span>
                  <strong>{Number(waveFreq).toFixed(1)} Hz</strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  className="mass-slider"
                  value={waveFreq}
                  onChange={(e) => onChangeWaveFreq?.(parseFloat(e.target.value))}
                />
              </div>
            </>
          )}

          {/* =========================================================
              MODE 9: REFLECTION & REFRACTION (NEW)
              ========================================================= */}
          {activeExperimentId === 'optics' && (
            <>
              <div className="live-data-grid">
                <div className="data-tile tile-accel">
                  <span>INCIDENT ANGLE (θ_i)</span>
                  <strong>{Number(opticsIncidentAngle).toFixed(1)}°</strong>
                </div>

                <div className="data-tile tile-vel">
                  <span>REFLECTED ANGLE (θ_r)</span>
                  <strong>{Number(thetaReflectDeg).toFixed(1)}°</strong>
                </div>

                <div className="data-tile tile-force">
                  <span>REFRACTED ANGLE (θ_t)</span>
                  <strong style={{ color: isTIR ? '#ff6b6b' : '#31f2a1' }}>
                    {isTIR ? 'TIR (No Ray)' : `${Number(thetaRefractDeg).toFixed(1)}°`}
                  </strong>
                </div>

                <div className="data-tile tile-mass">
                  <span>MEDIUM 1 (n₁)</span>
                  <strong>{Number(opticsN1).toFixed(2)}</strong>
                </div>

                <div className="data-tile tile-mass">
                  <span>MEDIUM 2 (n₂)</span>
                  <strong>{Number(opticsN2).toFixed(2)}</strong>
                </div>

                <div className="data-tile">
                  <span>CRITICAL ANGLE (θ_c)</span>
                  <strong>{criticalAngleDeg ? `${Number(criticalAngleDeg).toFixed(1)}°` : 'None (n₁ ≤ n₂)'}</strong>
                </div>

                <div className="data-tile wide">
                  <span>REGIME</span>
                  <strong style={{ color: isTIR ? '#ff6b6b' : '#31f2a1' }}>
                    {isTIR ? '🔒 TOTAL INTERNAL REFLECTION (100% Reflected)' : "✓ SNELL'S REFRACTION (n₁ sin θ_i = n₂ sin θ_t)"}
                  </strong>
                </div>
              </div>

              <div className="mass-control-group">
                <div className="mass-label-row">
                  <span>INCIDENT ANGLE (θ_i):</span>
                  <strong>{Number(opticsIncidentAngle).toFixed(0)}°</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="85"
                  step="1"
                  className="mass-slider"
                  value={opticsIncidentAngle}
                  onChange={(e) => onChangeOpticsIncidentAngle?.(parseFloat(e.target.value))}
                />

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>MEDIUM 1 (Top):</span>
                  <strong>{opticsN1 === 1.0 ? 'Air (1.00)' : opticsN1 === 1.33 ? 'Water (1.33)' : opticsN1 === 1.5 ? 'Glass (1.50)' : 'Diamond (2.42)'}</strong>
                </div>
                <div className="quick-mass-pills">
                  {[1.0, 1.33, 1.5, 2.42].map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`mass-pill ${Math.abs(opticsN1 - idx) < 0.05 ? 'active' : ''}`}
                      onClick={() => onChangeOpticsN1?.(idx)}
                    >
                      {idx === 1.0 ? 'Air' : idx === 1.33 ? 'Water' : idx === 1.5 ? 'Glass' : 'Dia'}
                    </button>
                  ))}
                </div>

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>MEDIUM 2 (Bottom):</span>
                  <strong>{opticsN2 === 1.0 ? 'Air (1.00)' : opticsN2 === 1.33 ? 'Water (1.33)' : opticsN2 === 1.5 ? 'Glass (1.50)' : 'Diamond (2.42)'}</strong>
                </div>
                <div className="quick-mass-pills">
                  {[1.0, 1.33, 1.5, 2.42].map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`mass-pill ${Math.abs(opticsN2 - idx) < 0.05 ? 'active' : ''}`}
                      onClick={() => onChangeOpticsN2?.(idx)}
                    >
                      {idx === 1.0 ? 'Air' : idx === 1.33 ? 'Water' : idx === 1.5 ? 'Glass' : 'Dia'}
                    </button>
                  ))}
                </div>

                {onSwapMedia && (
                  <button
                    type="button"
                    className="btn-hud-action"
                    onClick={onSwapMedia}
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    🔄 Swap Medium 1 & Medium 2
                  </button>
                )}
              </div>
            </>
          )}

          {/* =========================================================
              MODE 10: FRICTION & INCLINED PLANE (NEW)
              ========================================================= */}
          {activeExperimentId === 'incline' && (
            <>
              <div className="live-data-grid">
                <div className="data-tile tile-accel">
                  <span>RAMP ANGLE (θ)</span>
                  <strong>{Number(inclineAngle).toFixed(1)}°</strong>
                </div>

                <div className="data-tile tile-mass">
                  <span>OBJECT MASS (m)</span>
                  <strong>{Number(mass).toFixed(2)} kg</strong>
                </div>

                <div className="data-tile tile-force">
                  <span>NORMAL FORCE (N)</span>
                  <strong>{Number(inclineNormal).toFixed(2)} N</strong>
                </div>

                <div className="data-tile tile-force">
                  <span>FRICTION FORCE (f)</span>
                  <strong>{Number(inclineFriction).toFixed(2)} N</strong>
                </div>

                <div className="data-tile tile-vel">
                  <span>DOWNHILL ACCEL (a)</span>
                  <strong style={{ color: inclineSlipping ? '#ffbb33' : '#31f2a1' }}>
                    {Number(inclineAccel).toFixed(2)} m/s²
                  </strong>
                </div>

                <div className="data-tile">
                  <span>ANGLE OF REPOSE (θ_c)</span>
                  <strong>{(Math.atan(inclineMuStatic) * 180 / Math.PI).toFixed(1)}°</strong>
                </div>

                <div className="data-tile wide">
                  <span>EQUILIBRIUM STATE</span>
                  <strong style={{ color: inclineSlipping ? '#ffbb33' : '#31f2a1' }}>
                    {inclineSlipping ? '⚡ SLIPPING DOWNHILL (Kinetic Friction f_k)' : '🔒 STATIC EQUILIBRIUM (f_s balances gravity)'}
                  </strong>
                </div>
              </div>

              <div className="mass-control-group">
                <div className="mass-label-row">
                  <span>SLOPE ANGLE (θ):</span>
                  <strong>{Number(inclineAngle).toFixed(0)}°</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  className="mass-slider"
                  value={inclineAngle}
                  onChange={(e) => onChangeInclineAngle?.(parseFloat(e.target.value))}
                />

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>STATIC FRICTION (μ_s):</span>
                  <strong>{Number(inclineMuStatic).toFixed(2)}</strong>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  className="mass-slider"
                  value={inclineMuStatic}
                  onChange={(e) => onChangeInclineMuStatic?.(parseFloat(e.target.value))}
                />

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>KINETIC FRICTION (μ_k):</span>
                  <strong>{Number(inclineMuKinetic).toFixed(2)}</strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  className="mass-slider"
                  value={inclineMuKinetic}
                  onChange={(e) => onChangeInclineMuKinetic?.(parseFloat(e.target.value))}
                />

                <div className="mass-label-row" style={{ marginTop: '8px' }}>
                  <span>BLOCK MASS (m):</span>
                  <strong>{Number(mass).toFixed(1)} kg</strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.5"
                  className="mass-slider"
                  value={mass}
                  onChange={(e) => onMassChange?.(parseFloat(e.target.value))}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: DYNAMIC LIVE GRAPH */}
      {activeTab === 'graph' && (
        <div className="hud-graph-tab-content">
          <PhysicsLiveGraph
            activeExperiment={activeExperiment}
            physicsData={physicsData}
            mass={mass}
            springK={springK}
          />
        </div>
      )}

      {/* Persistent Quick Action Footer Bar */}
      <div className="hud-btn-row">
        <button
          type="button"
          className="btn-hud-action"
          onClick={onResetBall}
          title="Reset object to origin / equilibrium"
        >
          <RotateCcw className="btn-icon-xs" />
          Reset
        </button>

        <button
          type="button"
          className={`btn-hud-action ${isPaused ? 'active' : ''}`}
          onClick={onTogglePause}
          title={isPaused ? 'Resume simulation' : 'Pause simulation'}
        >
          {isPaused ? <Play className="btn-icon-xs" /> : <Pause className="btn-icon-xs" />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        {onOpenReport && (
          <button
            type="button"
            className="btn-hud-action report-btn"
            onClick={onOpenReport}
            title="Generate official experiment lab report"
          >
            <FileText className="btn-icon-xs" />
            Report
          </button>
        )}
      </div>
    </div>
  );
}
