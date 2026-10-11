/**
 * Touchless Physics Lab - Experiment Definitions, Guided Mode Curriculum & Quiz Catalog
 * Scientifically rigorous specifications, formulas, interactive instructions,
 * live HUD metrics, real-time graph configurations, and educational quizzes for all 5 experiments.
 */

export const EXPERIMENTS = {
  newton: {
    id: 'newton',
    backendId: 'newton_second_law',
    title: "Newton's 2nd Law",
    shortTitle: "Force & Accel",
    subtitle: "Force, Mass & Acceleration Dynamics",
    emoji: "🖐️",
    topic: "Newton's 2nd Law · F_net = m·a",
    primaryFormula: "F_{net} = m · a",
    secondaryFormula: "a = \\frac{F_{net}}{m}",
    units: "Force: Newtons (N), Mass: Kilograms (kg), Acceleration: m/s²",
    objective: "Verify that an object's acceleration is directly proportional to the net applied force and inversely proportional to its mass (inertia).",
    prerequisites: "Understanding of inertia (an object's resistance to velocity changes) and vector quantities (magnitude and direction).",
    assumptions: "Simulation models 2D horizontal motion. Viscous fluid drag (F_drag = -b·v) gently stabilizes high speeds.",
    description: "Discover how applied hand force and object mass determine acceleration. Observe vector arrows in real time as your hand approaches the particle ball.",
    concepts: ["Net Force", "Inertia", "Acceleration", "Mass", "Viscous Drag", "Vector Proportionality"],
    graphConfig: {
      type: 'scatter',
      xKey: 'force',
      yKey: 'acceleration',
      xLabel: 'Net Force (F)',
      yLabel: 'Acceleration (a)',
      xUnit: 'N',
      yUnit: 'm/s²',
      title: 'Force vs. Acceleration (Slope = 1/m)',
      relationship: 'Direct linear relationship: as net force increases for a constant mass, acceleration increases proportionally with slope 1/m.'
    },
    guidedSteps: [
      {
        step: 1,
        title: "Observe Equilibrium at Rest",
        instruction: "Keep your hand still or away from the camera. The cyan particle ball rests in equilibrium with zero net force.",
        gestureHint: "🖐️ Keep hand still or out of frame",
        controlHint: "Mouse: Do not click the canvas yet",
        expectedObservation: "The particle ball remains stationary; force = 0 N, acceleration = 0 m/s², velocity = 0 m/s.",
        physicsExplanation: "By Newton's First Law (Law of Inertia), an object at rest remains at rest when no net external force acts on it.",
        formula: "\\sum F = 0 \\implies a = 0",
        checkType: 'rest'
      },
      {
        step: 2,
        title: "Apply a Moderate Hand Force",
        instruction: "Bring your open palm toward the particle ball from the left or right to exert a repulsive push force vector.",
        gestureHint: "🖐️ Open Palm moving toward the ball",
        controlHint: "Mouse: Click and drag near the ball or adjust the Applied Force slider",
        expectedObservation: "A red Force vector arrow appears, and the ball accelerates away in the exact direction of the push.",
        physicsExplanation: "The external repulsive force creates a net unbalanced force F_net, causing immediate acceleration proportional to F_net / m.",
        formula: "a = \\frac{F_{net}}{m}",
        checkType: 'appliedForce'
      },
      {
        step: 3,
        title: "Increase Object Mass (Inertia Test)",
        instruction: "Use the Mass slider in the Live HUD to increase the mass from 1.0 kg to 3.0 kg or higher, then push the ball again.",
        gestureHint: "🖐️ Push with similar speed",
        controlHint: "Adjust MASS slider to ≥ 2.5 kg",
        expectedObservation: "For the same applied hand force, the ball accelerates noticeably more sluggishly.",
        physicsExplanation: "Mass is the quantitative measure of inertia. Greater inertia means greater resistance to changes in velocity for a given force.",
        formula: "m_2 > m_1 \\implies a_2 < a_1",
        checkType: 'massChanged'
      },
      {
        step: 4,
        title: "Inspect Drag & Freezing (Fist Gesture)",
        instruction: "Form a closed fist in front of the camera, or click Pause in the Live HUD to freeze simulation time.",
        gestureHint: "✊ Closed Fist to freeze physics",
        controlHint: "Click Pause button or press Spacebar",
        expectedObservation: "All vectors and velocities instantly freeze in place for dimensional inspection.",
        physicsExplanation: "Freezing the simulation allows analyzing instantaneous vectors (Force, Acceleration, Velocity) at a precise moment in time dt.",
        formula: "v(t) = \\text{const}, \\quad a(t) = 0",
        checkType: 'freeze'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: "Position Your Hand",
        gesture: "🖐️ Open Palm",
        detail: "Hold your open hand in front of the camera. The blue interaction perimeter will track your hand position."
      },
      {
        step: 2,
        title: "Apply Push Force",
        gesture: "➡️ Move Toward Ball",
        detail: "Move closer to the cyan ball. Proximity and hand speed produce a repulsive push force vector (Red Arrow)."
      },
      {
        step: 3,
        title: "Vary Mass (Inertia)",
        gesture: "🎚️ Mass Slider",
        detail: "Adjust mass from 0.2 kg to 5.0 kg. Notice how heavier masses accelerate much less for the same applied force."
      },
      {
        step: 4,
        title: "Freeze / Pause",
        gesture: "✊ Fist Gesture",
        detail: "Close your hand into a fist to instantly pause physics and examine vectors in place."
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: "If you apply a constant net force of 10 N to an object of mass 2 kg, what is its acceleration?",
        options: ["20 m/s²", "5 m/s²", "0.2 m/s²", "8 m/s²"],
        correctIndex: 1,
        explanation: "By Newton's 2nd Law, a = F / m. Thus, a = 10 N / 2 kg = 5 m/s² in the direction of the net force."
      },
      {
        id: 'q2',
        question: "What happens to the acceleration if you double the object's mass while keeping the applied force constant?",
        options: [
          "Acceleration doubles",
          "Acceleration is cut in half",
          "Acceleration quadruples",
          "Acceleration remains unchanged"
        ],
        correctIndex: 1,
        explanation: "Acceleration is inversely proportional to mass (a ∝ 1/m). Doubling mass halves the acceleration for a fixed force."
      },
      {
        id: 'q3',
        question: "In the simulation, why does the ball eventually slow down after your hand moves away?",
        options: [
          "Newton's 1st law stops working",
          "Viscous drag force acts opposite to the velocity vector",
          "The ball runs out of momentum fuel",
          "Gravity pulls it backward"
        ],
        correctIndex: 1,
        explanation: "Once external push force stops, viscous drag (fluid resistance F_drag = -b·v) produces a decelerating force opposing motion."
      },
      {
        id: 'q4',
        question: "An object with mass 4 kg is moving at constant velocity of 3 m/s on a frictionless surface. What is the net force acting on it?",
        options: ["12 N", "0 N", "1.33 N", "7 N"],
        correctIndex: 1,
        explanation: "Constant velocity means acceleration a = 0. By F_net = m·a, if a = 0 then F_net must equal 0 N (Newton's 1st Law)."
      }
    ]
  },

  impulse: {
    id: 'impulse',
    backendId: 'momentum_shockwave',
    title: "Impulse & Momentum",
    shortTitle: "Impulse Lab",
    subtitle: "Contact Time & Momentum Transfer",
    emoji: "💨",
    topic: "Impulse · J = F·Δt = Δp",
    primaryFormula: "J = F_{avg} · \\Delta t",
    secondaryFormula: "J = \\Delta p = m(v_f - v_i)",
    units: "Impulse (J): N·s or kg·m/s, Momentum (p): kg·m/s, Contact Time (Δt): s",
    objective: "Demonstrate that impulse delivered to an object equals its change in linear momentum (J = Δp), and analyze how contact duration Δt affects average impact force.",
    prerequisites: "Definition of linear momentum (p = m·v) and Newton's Second Law in momentum form (F = dp/dt).",
    assumptions: "One-dimensional impact event where impact duration is measured during active hand collision contact.",
    description: "Deliver rapid hand strikes to an impact target. Measure peak force, contact duration, impulse, and resulting change in linear momentum.",
    concepts: ["Impulse (J)", "Contact Time (Δt)", "Momentum Change (Δp)", "Impact Force", "Energy Transfer", "Shockwave Dynamics"],
    graphConfig: {
      type: 'time-series',
      xKey: 'time',
      yKey: 'force',
      xLabel: 'Time (s)',
      yLabel: 'Impact Force (N)',
      xUnit: 's',
      yUnit: 'N',
      title: 'Force vs. Time Profile (Area = Impulse J)',
      relationship: 'The area under the Force-Time curve equals total Impulse J = ∫ F dt. A spike of high force over short time delivers equal impulse to a gentle force over long time.'
    },
    guidedSteps: [
      {
        step: 1,
        title: "Target at Rest (Zero Initial Momentum)",
        instruction: "Observe the orange target bob resting in the center. Its initial velocity is v_i = 0, so initial momentum p_i = 0.",
        gestureHint: "🖐️ Keep hand outside the target radius",
        controlHint: "Observe live HUD: momentum p = 0 kg·m/s",
        expectedObservation: "Target remains stationary at center ring with zero velocity and zero momentum.",
        physicsExplanation: "Linear momentum is defined as the product of mass and velocity: p = m·v. With v = 0, momentum is zero.",
        formula: "p_i = m \\cdot v_i = 0",
        checkType: 'rest'
      },
      {
        step: 2,
        title: "Execute a Rapid Hand Swipe / Strike",
        instruction: "Swipe your hand rapidly across the screen toward the target. When hand speed exceeds threshold, an explosive shockwave triggers an impact strike.",
        gestureHint: "💨 Fast swipe across camera frame (> 0.02 units/frame)",
        controlHint: "Mouse: Click 'Trigger Impact Strike' button in Live HUD",
        expectedObservation: "Cyan shockwave ring bursts outward, imparting a sharp impulse. Target ball suddenly gains forward velocity.",
        physicsExplanation: "A rapid swipe delivers a brief but intense contact force, transferring momentum via the Impulse-Momentum Theorem.",
        formula: "J = \\int F \\, dt = \\Delta p",
        checkType: 'strike'
      },
      {
        step: 3,
        title: "Verify the Impulse-Momentum Equality",
        instruction: "Check the Live HUD telemetry: compare Impulse J (in N·s) with Momentum Change Δp (in kg·m/s).",
        gestureHint: "👁️ Observe the live HUD readout",
        controlHint: "Notice the green equality check: J ≈ Δp",
        expectedObservation: "Impulse accumulated J matches the resulting change in momentum Δp within experimental error.",
        physicsExplanation: "Because F = m·(dv/dt) = dp/dt, integrating force over the collision time interval yields exactly Δp.",
        formula: "J = F_{avg} \\cdot \\Delta t = m(v_f - v_i)",
        checkType: 'verify'
      },
      {
        step: 4,
        title: "Compare Short Strike vs. Long Push",
        instruction: "Now perform a slow, gentle push toward the ball. Contrast the long contact time with the previous quick strike.",
        gestureHint: "🖐️ Slow, steady hand movement",
        controlHint: "Push slowly with mouse",
        expectedObservation: "The peak force is much lower, but because contact time Δt is longer, significant impulse can still be transferred.",
        physicsExplanation: "Extending impact time Δt reduces peak force while achieving the same change in momentum — the key principle behind airbags and crumple zones.",
        formula: "F_{avg} = \\frac{\\Delta p}{\\Delta t}",
        checkType: 'compare'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: "Target at Rest",
        gesture: "⚪ Ball at Center",
        detail: "Observe the impact bob resting in the center ring with initial momentum p_i = 0."
      },
      {
        step: 2,
        title: "Perform Fast Swipe / Strike",
        gesture: "💨 Rapid Motion",
        detail: "Swipe your hand quickly toward the target. When your hand speed crosses the threshold, a high-energy shockwave ring triggers an impact strike."
      },
      {
        step: 3,
        title: "Analyze Impact Telemetry",
        gesture: "📊 Live HUD",
        detail: "Check the Live HUD: Observe Contact Time (Δt), Peak Force (F_peak), Impulse (J), and Δp."
      },
      {
        step: 4,
        title: "Compare Quick vs Soft Impact",
        gesture: "🖐️ Vary Hand Speed",
        detail: "A rapid strike delivers high force over a tiny time interval; a gradual push spreads the impulse over longer time."
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: "What is the relationship between Impulse (J) and change in linear momentum (Δp)?",
        options: [
          "J = Δp (Impulse equals momentum change)",
          "J = Δp / Δt",
          "J = m · Δp",
          "J and Δp are completely unrelated"
        ],
        correctIndex: 0,
        explanation: "The Impulse-Momentum Theorem states that Impulse J = ∫ F dt = F_avg · Δt = Δp = p_final - p_initial."
      },
      {
        id: 'q2',
        question: "A hand applies an average force of 25 N to a 0.5 kg ball for a contact duration of 0.08 s. What impulse was delivered?",
        options: ["2.0 N·s", "200 N·s", "3.125 N·s", "1.25 N·s"],
        correctIndex: 0,
        explanation: "Impulse J = F_avg · Δt = 25 N × 0.08 s = 2.0 N·s (or 2.0 kg·m/s)."
      },
      {
        id: 'q3',
        question: "Why do car airbags reduce passenger injury during a sudden collision?",
        options: [
          "They decrease the total momentum change required to stop",
          "They increase collision contact time Δt, thereby reducing the average impact force F_avg",
          "They eliminate the impulse completely",
          "They reverse the direction of gravity"
        ],
        correctIndex: 1,
        explanation: "Stopping from high speed requires a fixed Δp. By extending contact time Δt, the average force F_avg = Δp / Δt is drastically reduced."
      },
      {
        id: 'q4',
        question: "A 2 kg ball moving at 4 m/s hits a wall and bounces backward at 4 m/s. What is the magnitude of the impulse exerted by the wall?",
        options: ["0 N·s", "8 N·s", "16 N·s", "32 N·s"],
        correctIndex: 2,
        explanation: "Taking forward as positive: v_i = +4 m/s, v_f = -4 m/s. Δp = m(v_f - v_i) = 2 kg × (-4 - (+4)) = -16 kg·m/s. Magnitude is 16 N·s."
      }
    ]
  },

  hooke: {
    id: 'hooke',
    backendId: 'hookes_law',
    title: "Hooke's Law & Springs",
    shortTitle: "Spring Lab",
    subtitle: "Elastic Restoring Force & Oscillations",
    emoji: "🌀",
    topic: "Hooke's Law · F = -kx",
    primaryFormula: "F = -k · x",
    secondaryFormula: "U_e = \\frac{1}{2} k x^2",
    units: "Spring Constant (k): N/m, Displacement (x): m, Restoring Force (F): N, Elastic Energy (U_e): J",
    objective: "Verify Hooke's Law by demonstrating that restoring force is linearly proportional and opposite to displacement from equilibrium (F = -kx).",
    prerequisites: "Concept of equilibrium position (x = 0), spring stiffness, and harmonic oscillation.",
    assumptions: "Deformations remain within the spring's linear elastic limit (no plastic deformation). Fluid damping is applied to model realistic settling.",
    description: "Interact with a virtual elastic spring. Pull or compress the attached mass with your hand and watch the restoring force restore equilibrium.",
    concepts: ["Restoring Force", "Displacement (x)", "Spring Constant (k)", "Elastic Potential Energy", "Simple Harmonic Motion", "Damping"],
    graphConfig: {
      type: 'scatter',
      xKey: 'displacement',
      yKey: 'springForce',
      xLabel: 'Displacement x (m)',
      yLabel: 'Restoring Force F (N)',
      xUnit: 'm',
      yUnit: 'N',
      title: 'Restoring Force vs. Displacement (Slope = -k)',
      relationship: 'Linear negative slope passing through origin: Restoring force F is directly proportional to displacement x with slope -k. At x = 0, F = 0.'
    },
    guidedSteps: [
      {
        step: 1,
        title: "Identify Equilibrium State (x = 0)",
        instruction: "Observe the spring attached to the center post. At equilibrium (x = 0 m), displacement is zero and restoring force is zero.",
        gestureHint: "🖐️ Keep hand away from the green bob",
        controlHint: "Observe live HUD: displacement x = 0.00 m, F = 0.00 N",
        expectedObservation: "The spring coils rest quietly at equilibrium; no restoring force acts on the mass bob.",
        physicsExplanation: "At the relaxed equilibrium length of an ideal spring, no net elastic deformation exists, so F_restoring = -k(0) = 0 N.",
        formula: "x = 0 \\implies F = -k(0) = 0",
        checkType: 'rest'
      },
      {
        step: 2,
        title: "Stretch the Spring (Displacement x > 0)",
        instruction: "Bring your hand close to the green bob and drag it horizontally to the right (x > 0) to stretch the spring coils.",
        gestureHint: "🖐️ Move hand rightward across the bob",
        controlHint: "Mouse: Click and drag the green bob to the right",
        expectedObservation: "The spring coils visibly stretch outward, and a cyan restoring arrow appears pointing left toward center.",
        physicsExplanation: "Pulling the mass outward extends the spring. By Hooke's Law, the spring exerts a restoring force directed back toward the center post.",
        formula: "F = -k \\cdot x",
        checkType: 'displace'
      },
      {
        step: 3,
        title: "Release and Observe Harmonic Oscillation",
        instruction: "Move your hand away from the bob. Watch the mass accelerate toward center, overshoot, compress, and oscillate back and forth.",
        gestureHint: "👋 Move hand away from camera or canvas",
        controlHint: "Release mouse drag",
        expectedObservation: "Mass oscillates back and forth about x = 0, gradually damping down to equilibrium.",
        physicsExplanation: "Elastic potential energy converts continuously into kinetic energy and back: U_e ↔ KE. Damping gradually dissipates energy.",
        formula: "E_{total} = \\frac{1}{2}kx^2 + \\frac{1}{2}mv^2",
        checkType: 'oscillate'
      },
      {
        step: 4,
        title: "Vary Spring Stiffness (k)",
        instruction: "Use the Spring Constant slider in the Live HUD to increase stiffness from 25 N/m to 60 N/m, then stretch again.",
        gestureHint: "🖐️ Drag and release with new stiffness",
        controlHint: "Adjust SPRING CONSTANT (k) slider to ≥ 50 N/m",
        expectedObservation: "The restoring force increases significantly for the same displacement, producing faster oscillations with higher frequency.",
        physicsExplanation: "Higher spring constant k creates a stiffer spring. Natural angular frequency increases as ω = √(k/m).",
        formula: "\\omega = \\sqrt{\\frac{k}{m}}, \\quad T = 2\\pi \\sqrt{\\frac{m}{k}}",
        checkType: 'stiffness'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: "Find Equilibrium (x = 0)",
        gesture: "🎯 Center Anchor",
        detail: "The resting spring is at its natural equilibrium length. The net restoring force is zero when displacement x = 0."
      },
      {
        step: 2,
        title: "Displace the Mass",
        gesture: "🖐️ Pull or Push",
        detail: "Move your hand close to the bob and drag it horizontally left or right to stretch or compress the spring."
      },
      {
        step: 3,
        title: "Inspect Restoring Vector",
        gesture: "📐 Spring Arrow",
        detail: "The cyan arrow always points back toward the center anchor with magnitude proportional to displacement |x|."
      },
      {
        step: 4,
        title: "Release & Observe Oscillation",
        gesture: "👋 Release Hand",
        detail: "Move your hand away. Watch the mass oscillate back and forth with simple harmonic motion damped by fluid drag."
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: "What does the negative sign in Hooke's Law F = -k·x signify?",
        options: [
          "The force is always negative in value",
          "The restoring force always opposes the direction of displacement",
          "The spring loses energy over time",
          "The spring constant k is a negative number"
        ],
        correctIndex: 1,
        explanation: "The negative sign indicates that the restoring force acts in the direction opposite to displacement, pulling the object back toward equilibrium."
      },
      {
        id: 'q2',
        question: "If a spring with stiffness k = 40 N/m is stretched by x = 0.15 m, what is the magnitude of the restoring force?",
        options: ["6.0 N", "266.7 N", "0.6 N", "60 N"],
        correctIndex: 0,
        explanation: "|F| = k · |x| = 40 N/m × 0.15 m = 6.0 N directed toward the equilibrium point."
      },
      {
        id: 'q3',
        question: "How much elastic potential energy is stored in the spring when stretched by 0.2 m with k = 50 N/m?",
        options: ["1.0 J", "2.0 J", "5.0 J", "10.0 J"],
        correctIndex: 0,
        explanation: "U_e = ½ k x² = 0.5 × 50 N/m × (0.2 m)² = 25 × 0.04 = 1.0 Joule."
      },
      {
        id: 'q4',
        question: "What happens to the oscillation frequency if you replace a 1 kg mass on a spring with a heavier 4 kg mass?",
        options: [
          "Frequency doubles",
          "Frequency is cut in half",
          "Frequency quadruples",
          "Frequency stays the same"
        ],
        correctIndex: 1,
        explanation: "Since frequency f = (1 / 2π) · √(k/m), quadrupling mass multiplies frequency by √(1/4) = 1/2. The system oscillates at half the frequency."
      }
    ]
  },

  collision: {
    id: 'collision',
    backendId: 'collision_momentum',
    title: "Collisions & Momentum",
    shortTitle: "Collision Lab",
    subtitle: "Conservation of Momentum & Kinetic Energy",
    emoji: "💥",
    topic: "Momentum Conservation · p_total = const",
    primaryFormula: "m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'",
    secondaryFormula: "p_{total} = \\text{constant}",
    units: "Mass: kg, Velocity: m/s, Momentum: kg·m/s, Kinetic Energy: J",
    objective: "Verify the Law of Conservation of Linear Momentum in two-body collisions, and compare elastic (KE conserved) versus inelastic (KE lost) collisions.",
    prerequisites: "Linear momentum vector addition (p_total = p_1 + p_2) and kinetic energy definition (KE = ½mv²).",
    assumptions: "Isolated two-body system where external forces (e.g. friction) are negligible during the brief impact duration.",
    description: "Explore 1D & 2D elastic collisions between two bodies. Push Ball 1 into Ball 2 and verify conservation of total momentum and kinetic energy.",
    concepts: ["Conservation of Momentum", "Elastic Collision", "Inelastic Collision", "Kinetic Energy", "Coefficient of Restitution", "Mass Ratio"],
    graphConfig: {
      type: 'bar',
      xKey: 'state',
      yKey: 'momentum',
      xLabel: 'Collision Phase',
      yLabel: 'Total Momentum p_tot (kg·m/s)',
      xUnit: '',
      yUnit: 'kg·m/s',
      title: 'Total System Momentum Before vs. After Impact',
      relationship: 'Total momentum p_total remains constant across all collisions. In elastic collisions, kinetic energy is also conserved; in inelastic collisions, KE decreases.'
    },
    guidedSteps: [
      {
        step: 1,
        title: "Inspect Two-Body System at Rest",
        instruction: "Notice Ball 1 (Cyan, m₁) on the left and Ball 2 (Magenta, m₂) on the right. Both start at equilibrium with initial total momentum p_total = 0.",
        gestureHint: "🖐️ Keep hand still behind Ball 1",
        controlHint: "Observe live HUD: p_total = 0.00 kg·m/s",
        expectedObservation: "Both bodies rest stationary; total momentum is zero and total kinetic energy is zero.",
        physicsExplanation: "System total linear momentum is the vector sum: p_total = m₁·v₁ + m₂·v₂. With v₁ = 0 and v₂ = 0, p_total = 0.",
        formula: "p_{total} = m_1 v_1 + m_2 v_2 = 0",
        checkType: 'rest'
      },
      {
        step: 2,
        title: "Propel Ball 1 toward Ball 2",
        instruction: "Use hand proximity or the mouse to push Ball 1 forward toward Ball 2. Watch Ball 1 accelerate and gain forward momentum.",
        gestureHint: "🖐️ Push Ball 1 toward right",
        controlHint: "Mouse: Click and drag Ball 1 to launch toward Ball 2",
        expectedObservation: "Ball 1 speeds up, carrying positive linear momentum p₁ = m₁·v₁ toward Ball 2.",
        physicsExplanation: "External work done by your push increases the momentum and kinetic energy of Ball 1 before the collision occurs.",
        formula: "p_1 = m_1 \\cdot v_1, \\quad p_{total} = p_1",
        checkType: 'propel'
      },
      {
        step: 3,
        title: "Witness Elastic Impact (Equal Masses)",
        instruction: "Observe the split-second impact when m₁ = m₂ (e.g. 1.0 kg each). Watch how velocity is transferred from Ball 1 to Ball 2.",
        gestureHint: "⚡ Observe impact flash",
        controlHint: "Keep masses at 1.0 kg each",
        expectedObservation: "Ball 1 stops almost completely, and Ball 2 shoots forward with the exact velocity Ball 1 originally had!",
        physicsExplanation: "By Newton's Third Law, internal contact forces F₁₂ = -F₂₁ are equal and opposite. For equal masses in a head-on elastic collision, 100% of velocity is transferred.",
        formula: "v_1' = 0, \\quad v_2' = v_1 \\quad (m_1 = m_2)",
        checkType: 'impact'
      },
      {
        step: 4,
        title: "Test Inelastic Collision Mode",
        instruction: "Toggle the collision mode from 'Elastic (e = 1.0)' to 'Inelastic (e = 0.0)' in the Live HUD, then launch Ball 1 again.",
        gestureHint: "🖐️ Launch Ball 1 in inelastic mode",
        controlHint: "Click 'Toggle Elastic / Inelastic' in Live HUD",
        expectedObservation: "Upon contact, the two balls stick together and continue moving with a single shared velocity v'. Total KE drops noticeably!",
        physicsExplanation: "In an inelastic collision, momentum is still 100% conserved, but kinetic energy is converted into deformation and thermal energy.",
        formula: "v' = \\frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}, \\quad KE_f < KE_i",
        checkType: 'inelastic'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: "Observe Two Bodies",
        gesture: "🔵 Ball 1 & 🟣 Ball 2",
        detail: "Ball 1 (Cyan, m₁) is controllable with your hand. Ball 2 (Magenta, m₂) rests initially on the right."
      },
      {
        step: 2,
        title: "Launch Ball 1 into Ball 2",
        gesture: "🖐️ Push Ball 1",
        detail: "Push Ball 1 toward Ball 2. Watch them collide with elastic bounce mechanics."
      },
      {
        step: 3,
        title: "Examine Velocity Transfer",
        gesture: "⚡ Impact Moment",
        detail: "When m₁ = m₂, Ball 1 stops and transfers almost all velocity to Ball 2! Check the live momentum readouts."
      },
      {
        step: 4,
        title: "Change Mass Ratio",
        gesture: "🎚️ Mass Controls",
        detail: "Make Ball 1 heavier or lighter than Ball 2 to observe rebound and forward continuation."
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: "In an isolated system with no external forces, which quantity is always conserved in both elastic and inelastic collisions?",
        options: [
          "Total Linear Momentum",
          "Total Kinetic Energy",
          "Total Speed",
          "Acceleration"
        ],
        correctIndex: 0,
        explanation: "Total linear momentum is always conserved in all collisions when external forces are absent. Kinetic energy is only conserved in perfectly elastic collisions."
      },
      {
        id: 'q2',
        question: "Ball A (1 kg) moving at 4 m/s collides elastically head-on with identical stationary Ball B (1 kg). What are their velocities after collision?",
        options: [
          "Ball A stops (v_A = 0 m/s), Ball B moves forward at 4 m/s",
          "Both move forward at 2 m/s",
          "Both bounce backward at 4 m/s",
          "Ball A continues at 4 m/s, Ball B remains at rest"
        ],
        correctIndex: 0,
        explanation: "For equal masses in a 1D elastic collision with one target at rest, the moving ball transfers 100% of its velocity and momentum to the target ball."
      },
      {
        id: 'q3',
        question: "If Ball 1 has mass 2 kg at 3 m/s and Ball 2 has mass 1 kg at rest, what is the total system momentum before collision?",
        options: ["6 kg·m/s", "5 kg·m/s", "9 kg·m/s", "3 kg·m/s"],
        correctIndex: 0,
        explanation: "p_total = m₁v₁ + m₂v₂ = (2 kg × 3 m/s) + (1 kg × 0 m/s) = 6 kg·m/s."
      },
      {
        id: 'q4',
        question: "In a perfectly inelastic collision between two identical 1 kg carts, Cart 1 (moving at 6 m/s) collides and sticks to Cart 2 (at rest). What is their common final speed?",
        options: ["6 m/s", "3 m/s", "1.5 m/s", "0 m/s"],
        correctIndex: 1,
        explanation: "By conservation of momentum: m₁v₁ + m₂v₂ = (m₁ + m₂)v'. So (1 kg × 6 m/s) + 0 = (2 kg)v', giving v' = 3 m/s."
      }
    ]
  },

  projectile: {
    id: 'projectile',
    backendId: 'projectile_motion',
    title: "Projectile Motion",
    shortTitle: "Projectile Lab",
    subtitle: "2D Kinematics & Parabolic Trajectories",
    emoji: "🚀",
    topic: "Projectile Motion · 2D Kinematics",
    primaryFormula: "y(t) = y_0 + v_{0y}t - \\frac{1}{2}gt^2",
    secondaryFormula: "R = \\frac{v_0^2 \\sin(2\\theta)}{g}",
    units: "Angle (θ): degrees, Speed (v₀): m/s, Range (R): m, Max Height (H): m, Flight Time: s",
    objective: "Analyze 2D projectile kinematics under constant gravitational acceleration g = 9.8 m/s², proving horizontal and vertical motions are independent.",
    prerequisites: "Vector decomposition into horizontal and vertical components (v_x = v₀ cos θ, v_y = v₀ sin θ) and free-fall kinematics.",
    assumptions: "Flat level ground (launch height = landing height y_0 = y_final = 0), constant gravitational field g = 9.80 m/s² downward, and negligible air resistance.",
    description: "Aim your hand to adjust the launch angle and launch velocity of a projectile. Watch it trace a glowing parabolic path under constant gravity.",
    concepts: ["Launch Angle (θ)", "Initial Velocity (v₀)", "Maximum Height (H)", "Horizontal Range (R)", "Gravity (g = 9.8 m/s²)", "Independence of Vectors"],
    graphConfig: {
      type: 'trajectory',
      xKey: 'x',
      yKey: 'y',
      xLabel: 'Horizontal Distance x (m)',
      yLabel: 'Vertical Height y (m)',
      xUnit: 'm',
      yUnit: 'm',
      title: 'Parabolic Trajectory (y vs. x)',
      relationship: 'Parabolic curve y(x) with apex at H_max and ground return at Range R. Maximum horizontal range occurs near θ = 45° on level ground.'
    },
    guidedSteps: [
      {
        step: 1,
        title: "Aim the Launch Angle (θ)",
        instruction: "Move your hand vertically up and down in front of the camera to aim the cannon barrel between 15° and 75°.",
        gestureHint: "🖐️ Move hand vertically to tilt barrel",
        controlHint: "Adjust AIM ANGLE (θ) slider in Live HUD",
        expectedObservation: "The cannon cylinder rotates smoothly in real time, and the glowing parabolic preview trajectory updates.",
        physicsExplanation: "Launch angle determines the breakdown of initial velocity: horizontal v_x = v₀ cos θ and vertical v_y = v₀ sin θ.",
        formula: "v_{0x} = v_0 \\cos\\theta, \\quad v_{0y} = v_0 \\sin\\theta",
        checkType: 'aim'
      },
      {
        step: 2,
        title: "Adjust Initial Launch Speed (v₀)",
        instruction: "Adjust the launch speed slider between 3.0 m/s and 10.0 m/s to charge initial kinetic energy.",
        gestureHint: "🤏 Pinch or use slider",
        controlHint: "Adjust LAUNCH VELOCITY (v₀) slider",
        expectedObservation: "The preview trajectory expands higher and further downfield as initial speed increases.",
        physicsExplanation: "Because Range scales with v₀² (R ∝ v₀²), doubling launch speed quadruples theoretical range!",
        formula: "R = \\frac{v_0^2 \\sin(2\\theta)}{g}",
        checkType: 'speed'
      },
      {
        step: 3,
        title: "Fire the Projectile!",
        instruction: "Perform a quick forward flick gesture, press the Spacebar, or click 'Fire Cannon' in the Live HUD.",
        gestureHint: "💨 Fast forward flick or click Fire",
        controlHint: "Click '🚀 Fire Cannon' button or press Spacebar",
        expectedObservation: "The golden projectile ball launches from the barrel, tracing a smooth parabolic flight arc before landing with an impact flash.",
        physicsExplanation: "Horizontal velocity v_x remains constant because a_x = 0. Gravity constantly decelerates vertical velocity at a_y = -9.8 m/s².",
        formula: "a_x = 0, \\quad a_y = -g = -9.8 \\text{ m/s}^2",
        checkType: 'fire'
      },
      {
        step: 4,
        title: "Compare 45° Range with Other Angles",
        instruction: "Set θ = 45°, fire, and note the range. Then try 30° and 60° and observe how complementary angles (30° and 60°) produce identical range!",
        gestureHint: "🖐️ Set angle to 45°, 30°, then 60°",
        controlHint: "Test angles using quick pills",
        expectedObservation: "45° yields the absolute maximum range. 30° and 60° land at the exact same landing spot!",
        physicsExplanation: "Because sin(2θ) = sin(2(90° - θ)), complementary angles produce identical horizontal range on level ground.",
        formula: "\\sin(2 \\times 30^\\circ) = \\sin(60^\\circ) = \\sin(2 \\times 60^\\circ) = \\sin(120^\\circ)",
        checkType: 'complementary'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: "Aim Launch Angle (θ)",
        gesture: "🖐️ Move Up / Down",
        detail: "Move your hand vertically to adjust the launch barrel angle between 10° and 80°."
      },
      {
        step: 2,
        title: "Adjust Launch Velocity (v₀)",
        gesture: "🤏 Pinch / Distance",
        detail: "Pull your hand back from the launcher or adjust the power slider to charge initial launch speed."
      },
      {
        step: 3,
        title: "Fire Projectile",
        gesture: "💨 Fast Push / Tap Fire",
        detail: "Click 'Fire Cannon' or perform a quick forward flick gesture to launch the projectile!"
      },
      {
        step: 4,
        title: "Measure Landing Range",
        gesture: "🎯 Target Pad",
        detail: "Track the projectile's trajectory arc, apex height H_max, and impact distance Range (R)."
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: "Neglecting air resistance on level ground, which launch angle produces the maximum horizontal range?",
        options: ["30°", "45°", "60°", "90°"],
        correctIndex: 1,
        explanation: "The range formula R = (v₀² sin 2θ) / g is maximized when sin(2θ) = 1, which occurs when 2θ = 90°, so θ = 45°."
      },
      {
        id: 'q2',
        question: "At the peak (highest point) of a projectile's flight, what is its vertical velocity component v_y?",
        options: ["0 m/s", "9.8 m/s", "Equal to initial launch speed v₀", "-9.8 m/s²"],
        correctIndex: 0,
        explanation: "At the apex, the projectile momentarily ceases rising before falling downward, so its vertical velocity component v_y = 0 m/s (though horizontal velocity v_x is still non-zero)."
      },
      {
        id: 'q3',
        question: "Why does the horizontal velocity v_x remain constant throughout the projectile's flight (assuming no air drag)?",
        options: [
          "Gravity only accelerates objects vertically downward (a_x = 0)",
          "Horizontal inertia increases over time",
          "The initial force pushes it horizontally forever",
          "Newton's 3rd law cancels horizontal friction"
        ],
        correctIndex: 0,
        explanation: "Gravity acts strictly along the vertical y-axis. With no horizontal forces (a_x = 0), horizontal velocity remains constant: v_x = v₀ cos θ."
      },
      {
        id: 'q4',
        question: "A projectile is launched with initial speed 20 m/s at 30° above horizontal on level ground (g = 9.8 m/s²). What is its total flight time?",
        options: ["1.02 s", "2.04 s", "3.53 s", "4.08 s"],
        correctIndex: 1,
        explanation: "Initial vertical velocity v_0y = 20 × sin(30°) = 10 m/s. Flight time t = 2·v_0y / g = (2 × 10) / 9.8 ≈ 2.04 seconds."
      }
    ]
  }
};

export const EXPERIMENT_LIST = Object.values(EXPERIMENTS);
