import { useState } from 'react';
import { Activity, TrendingUp, RotateCcw, Play, Pause, FileText, Zap } from 'lucide-react';
import PhysicsLiveGraph from './PhysicsLiveGraph';

export default function LivePhysicsHUD({
  activeExperimentId = 'newton',
  activeExperiment = null,
  physicsData = {},
  // Parameter controls & callbacks
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
  onOpenReport
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
    isAirborne = false
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

                {/* Manual Applied Force Slider (Alternative to Hand Gesture) */}
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

              {/* Collision Type Toggle */}
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
