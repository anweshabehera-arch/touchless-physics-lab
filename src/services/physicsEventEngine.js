/**
 * Physics Event Engine
 * Evaluates real simulation state to detect actual physical occurrences.
 * Feeds the live event log, timeline, and voice narrator.
 * Strictly adheres to rule: NEVER invent measurements or fake events.
 */

let lastEventTime = 0;
let lastSpeechTime = 0;
let lastState = {
  isApplyingForce: false,
  isMoving: false,
  isFrozen: false,
  hadBounce: false,
  hadFastImpulse: false
};

/**
 * Clean voice speaker with cooldown
 */
export function speakPhysicsEvent(sentence) {
  if (!('speechSynthesis' in window) || !sentence) return;

  const now = performance.now();
  if (now - lastSpeechTime < 2800) {
    // Cooldown active to avoid speaking every frame
    return;
  }
  lastSpeechTime = now;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

/**
 * Evaluates current frame simulation telemetry and generates event if threshold is met
 */
export function evaluatePhysicsEvents(telemetry, options = {}) {
  const { voiceEnabled = false } = options;
  const now = performance.now();
  const events = [];

  const {
    force = 0,
    acceleration = 0,
    velocity = 0,
    vx = 0,
    vy = 0,
    posX = 0,
    posY = 0,
    mass = 1.0,
    isFrozen = false,
    handSpeed = 0,
    isWallHit = false,
    simTime = 0
  } = telemetry;

  const formattedTime = (simTime || now * 0.001).toFixed(1);

  // 1. Fist Gesture Freeze / Resume
  if (isFrozen && !lastState.isFrozen) {
    const ev = {
      id: `ev_${now}_freeze`,
      type: 'FREEZE_TRIGGER',
      typeLabel: '✊ Fist: Physics Frozen',
      timestamp: now,
      formattedTime,
      position: { x: posX, y: posY },
      estimatedForce: '0.00',
      acceleration: '0.00',
      velocityAfter: '0.00',
      explanation: 'Fist gesture detected: paused simulation calculations and locked object state.'
    };
    events.push(ev);
    if (voiceEnabled) speakPhysicsEvent('Simulation paused by fist gesture.');
  } else if (!isFrozen && lastState.isFrozen) {
    const ev = {
      id: `ev_${now}_resume`,
      type: 'RESUME_TRIGGER',
      typeLabel: '🖐️ Resume: Physics Active',
      timestamp: now,
      formattedTime,
      position: { x: posX, y: posY },
      estimatedForce: Number(force).toFixed(2),
      acceleration: Number(acceleration).toFixed(2),
      velocityAfter: Number(velocity).toFixed(2),
      explanation: 'Fist released: resumed simulation and restored interactive forces.'
    };
    events.push(ev);
    if (voiceEnabled) speakPhysicsEvent('Simulation resumed.');
  }

  // 2. High Impulse / Fast Motion Shockwave
  if (handSpeed > 0.018 && !lastState.hadFastImpulse) {
    const ev = {
      id: `ev_${now}_impulse`,
      type: 'STRONG_IMPULSE',
      typeLabel: '💨 Strong Impulse Shockwave',
      timestamp: now,
      formattedTime,
      position: { x: posX, y: posY },
      estimatedForce: Number(force).toFixed(2),
      acceleration: Number(acceleration).toFixed(2),
      velocityAfter: Number(velocity).toFixed(2),
      explanation: `Fast hand swipe delivered a rapid impulse J = Δp, causing a surge in net force (${Number(force).toFixed(1)} N).`
    };
    events.push(ev);
    if (voiceEnabled) speakPhysicsEvent(`Fast movement! Impulse of ${Number(force).toFixed(1)} Newtons delivered.`);
    lastState.hadFastImpulse = true;
  } else if (handSpeed <= 0.015) {
    lastState.hadFastImpulse = false;
  }

  // 3. External Force Applied
  const isApplying = force > 0.25;
  if (isApplying && !lastState.isApplyingForce) {
    const ev = {
      id: `ev_${now}_force`,
      type: 'EXTERNAL_FORCE',
      typeLabel: '⚡ External Force Applied',
      timestamp: now,
      formattedTime,
      position: { x: posX, y: posY },
      estimatedForce: Number(force).toFixed(2),
      acceleration: Number(acceleration).toFixed(2),
      velocityAfter: Number(velocity).toFixed(2),
      explanation: `Hand entered interaction perimeter, applying an outward repulsive force of ${Number(force).toFixed(2)} N.`
    };
    events.push(ev);
    if (voiceEnabled) speakPhysicsEvent(`Force detected. ${Number(force).toFixed(1)} Newtons applied.`);
  }

  // 4. Boundary Wall Collision
  if (isWallHit && !lastState.hadBounce) {
    const ev = {
      id: `ev_${now}_wall`,
      type: 'BOUNDARY_BOUNCE',
      typeLabel: '💥 Boundary Wall Rebound',
      timestamp: now,
      formattedTime,
      position: { x: posX, y: posY },
      estimatedForce: 'Rebound',
      acceleration: Number(acceleration).toFixed(2),
      velocityAfter: Number(velocity).toFixed(2),
      explanation: `Ball collided with boundary edge. Normal force reversed motion with coefficient of restitution 0.82.`
    };
    events.push(ev);
    if (voiceEnabled) speakPhysicsEvent('Boundary bounce. Momentum reversed.');
    lastState.hadBounce = true;
  } else if (!isWallHit) {
    lastState.hadBounce = false;
  }

  // 5. Deceleration to Rest (Equilibrium)
  const isMoving = velocity > 0.12;
  if (!isMoving && lastState.isMoving && !isApplying) {
    const ev = {
      id: `ev_${now}_rest`,
      type: 'REST_EQUILIBRIUM',
      typeLabel: '🛑 Settled at Rest',
      timestamp: now,
      formattedTime,
      position: { x: posX, y: posY },
      estimatedForce: '0.00',
      acceleration: '0.00',
      velocityAfter: '0.00',
      explanation: `Friction drag dissipated remaining kinetic energy. Net velocity returned to zero.`
    };
    events.push(ev);
    if (voiceEnabled) speakPhysicsEvent('Friction slowed the ball to a complete stop.');
  }

  // Update tracking state
  lastState.isApplyingForce = isApplying;
  lastState.isMoving = isMoving;
  lastState.isFrozen = isFrozen;

  return events;
}
