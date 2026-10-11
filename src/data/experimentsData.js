/**
 * Touchless Physics Lab - Experiment Definitions, Guided Mode Curriculum & Quiz Catalog
 * Scientifically rigorous specifications, formulas, interactive instructions,
 * live HUD metrics, real-time graph configurations, and educational quizzes for all 10 experiments.
 */

export const EXPERIMENTS = {
  newton: {
    id: 'newton',
    backendId: 'newton_second_law',
    category: 'Mechanics',
    title: "Newton's 2nd Law",
    shortTitle: "Force Arena",
    subtitle: "Force Arena: The Acceleration Architect",
    emoji: "🖐️",
    topic: "Newton's 2nd Law · F_net = m·a",
    primaryFormula: "F_{net} = m · a",
    secondaryFormula: "a = \\frac{F_{net}}{m}",
    units: "Force: Newtons (N), Mass: Kilograms (kg), Acceleration: m/s²",
    objective: "Verify that an object's acceleration is directly proportional to the net applied force and inversely proportional to its mass (inertia).",
    prerequisites: "Understanding of inertia (an object's resistance to velocity changes) and vector quantities (magnitude and direction).",
    assumptions: "Simulation models 2D horizontal motion. Viscous fluid drag (F_drag = -b·v) gently stabilizes high speeds.",
    description: "Operate a futuristic rescue supply cart through obstacles and precision target zones. Discover how applied force, inertia, and emergency retro-braking govern motion in the Force Arena.",
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
    category: 'Mechanics',
    title: "Impulse & Momentum",
    shortTitle: "Impulse Rush",
    subtitle: "Impulse Rush: Master of Impact",
    emoji: "💨",
    topic: "Impulse · J = F·Δt = Δp",
    primaryFormula: "J = F_{avg} · \\Delta t",
    secondaryFormula: "J = \\Delta p = m(v_f - v_i)",
    units: "Impulse (J): N·s or kg·m/s, Momentum (p): kg·m/s, Contact Time (Δt): s",
    objective: "Demonstrate that impulse delivered to an object equals its change in linear momentum (J = Δp), and analyze how contact duration Δt affects average impact force.",
    prerequisites: "Definition of linear momentum (p = m·v) and Newton's Second Law in momentum form (F = dp/dt).",
    assumptions: "One-dimensional impact event where impact duration is measured during active piston or hand collision contact.",
    description: "Operate a futuristic impact testing laboratory. Control hydraulic strike forces and contact duration to master momentum transfer, soft landings, and shockwaves in Impulse Rush.",
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
        controlHint: "Mouse: Click 'Trigger High Impulse Strike' button in Live HUD",
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
        controlHint: "Notice the equality check: J ≈ Δp",
        expectedObservation: "Impulse accumulated J matches the resulting change in momentum Δp within experimental precision.",
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
    category: 'Mechanics',
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
    category: 'Mechanics',
    title: "Collisions & Momentum",
    shortTitle: "Collision Chaos",
    subtitle: "Collision Chaos: The Collision Strategist",
    emoji: "💥",
    topic: "Momentum Conservation · p_total = const",
    primaryFormula: "m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'",
    secondaryFormula: "p_{total} = \\text{constant}",
    units: "Mass: kg, Velocity: m/s, Momentum: kg·m/s, Kinetic Energy: J",
    objective: "Verify the Law of Conservation of Linear Momentum in two-body collisions, and compare elastic (KE conserved) versus inelastic (KE lost) collisions.",
    prerequisites: "Linear momentum vector addition (p_total = p_1 + p_2) and kinetic energy definition (KE = ½mv²).",
    assumptions: "Isolated two-body system where external forces (e.g. friction) are negligible during the brief impact duration.",
    description: "Act as a collision strategist controlling two craft in a futuristic arena. Plan post-collision trajectories, inspect elastic vs. inelastic dynamics, and run crash investigations in Collision Chaos.",
    concepts: ["Conservation of Momentum", "Elastic Collision", "Inelastic Collision", "Kinetic Energy", "Coefficient of Restitution", "Mass Ratio"],
    graphConfig: {
      type: 'time-series',
      xKey: 'time',
      yKey: 'pTotal',
      xLabel: 'Time (s)',
      yLabel: 'Total Momentum p_tot (kg·m/s)',
      xUnit: 's',
      yUnit: 'kg·m/s',
      title: 'Total System Momentum Over Time',
      relationship: 'Total momentum p_total remains constant across all collisions in an isolated system. In elastic collisions, kinetic energy is also conserved.'
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
    category: 'Mechanics',
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
  },

  pendulum: {
    id: 'pendulum',
    backendId: 'simple_pendulum',
    category: 'Mechanics',
    title: "Simple Pendulum",
    shortTitle: "Pendulum Lab",
    subtitle: "Harmonic Oscillation & Period Dynamics",
    emoji: "⏱️",
    topic: "Simple Pendulum · T = 2π√(L/g)",
    primaryFormula: "T_0 = 2\\pi \\sqrt{\\frac{L}{g}}",
    secondaryFormula: "\\frac{d^2\\theta}{dt^2} = -\\frac{g}{L}\\sin\\theta - \\gamma\\omega",
    units: "Length (L): m, Mass (m): kg, Angle (θ): degrees/rad, Period (T): s, Frequency: Hz",
    objective: "Verify that the period of a simple pendulum depends strictly on rod length L and gravitational field g (independent of bob mass), and investigate small-angle vs. large-angle nonlinear behavior.",
    prerequisites: "Simple harmonic motion, angular displacement, and gravitational acceleration concepts.",
    assumptions: "Inextensible rod of negligible mass, point-mass bob. Small-angle approximation sin(θ) ≈ θ holds within θ ≤ 15° (0.26 rad); higher amplitudes exhibit nonlinear period elongation.",
    description: "Displace a pendulum bob with your hand or angle controls. Measure instantaneous angular displacement, velocity, tension force, and oscillation period.",
    concepts: ["Period (T)", "Rod Length (L)", "Small-Angle Approximation", "Restoring Torque", "Gravitational Potential Energy", "Nonlinear Oscillation"],
    graphConfig: {
      type: 'time-series',
      xKey: 'time',
      yKey: 'angleDeg',
      xLabel: 'Time (s)',
      yLabel: 'Angular Displacement θ (°)',
      xUnit: 's',
      yUnit: '°',
      title: 'Angular Displacement vs. Time θ(t)',
      relationship: 'Sinusoidal harmonic oscillation about equilibrium θ = 0. Amplitude slowly damps due to fluid air resistance while period remains nearly constant (isochronism).'
    },
    guidedSteps: [
      {
        step: 1,
        title: "Observe Stable Vertical Equilibrium (θ = 0)",
        instruction: "Notice the resting pendulum bob hanging vertically downward. At θ = 0, restoring torque is zero.",
        gestureHint: "🖐️ Keep hand still below the pivot",
        controlHint: "Observe live HUD: θ = 0.0°, T_theoretical = 2π√(L/g)",
        expectedObservation: "Bob rests motionless directly below pivot; potential energy is zero and tension equals gravity force T = mg.",
        physicsExplanation: "At the vertical bottom position, gravitational force acts purely along the rod, producing zero net restoring torque.",
        formula: "\\tau = -mgL\\sin(0) = 0",
        checkType: 'rest'
      },
      {
        step: 2,
        title: "Displace Bob to Initial Angle (θ₀ ≈ 25°)",
        instruction: "Use your hand or mouse to pull the bob to the left or right to set an initial amplitude.",
        gestureHint: "🖐️ Grab bob and move horizontally",
        controlHint: "Mouse: Drag bob or adjust INITIAL ANGLE slider to 25°",
        expectedObservation: "The rod tilts, potential energy rises as the bob lifts vertically, and restoring torque arrow appears.",
        physicsExplanation: "Work done lifting the bob stores gravitational potential energy: U = mgL(1 - cos θ).",
        formula: "U = mgL(1 - \\cos\\theta)",
        checkType: 'displace'
      },
      {
        step: 3,
        title: "Release Bob to Observe Harmonic Oscillation",
        instruction: "Release the bob. Watch it accelerate toward center, reach maximum velocity at θ = 0, and swing upward on the opposite side.",
        gestureHint: "👋 Release hand from screen",
        controlHint: "Release mouse drag",
        expectedObservation: "Bob swings back and forth smoothly with harmonic isochronism.",
        physicsExplanation: "Energy continually exchanges between gravitational potential energy (at peaks) and kinetic energy (at bottom θ = 0).",
        formula: "E_{total} = U + KE = \\text{constant}",
        checkType: 'oscillate'
      },
      {
        step: 4,
        title: "Vary Rod Length L and Compare Period",
        instruction: "Adjust the ROD LENGTH slider from 0.8 m to 1.6 m. Notice how quadrupling length doubles the period T!",
        gestureHint: "🖐️ Release with longer rod",
        controlHint: "Set LENGTH slider to ≥ 1.4 m",
        expectedObservation: "A longer pendulum swings significantly slower, verifying T ∝ √L.",
        physicsExplanation: "Period scales with the square root of length: T = 2π√(L/g). Mass has no effect on period because inertial mass and gravitational mass cancel.",
        formula: "T_2 / T_1 = \\sqrt{L_2 / L_1}",
        checkType: 'length'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: "Examine Pivot & Bob",
        gesture: "⏱️ Resting Pendulum",
        detail: "The bob hangs from a low-friction pivot point. At vertical center, displacement angle θ = 0."
      },
      {
        step: 2,
        title: "Displace to Angle",
        gesture: "🖐️ Drag Left or Right",
        detail: "Pull the bob to either side to set an initial angular displacement θ."
      },
      {
        step: 3,
        title: "Release to Swing",
        gesture: "👋 Release Hand",
        detail: "Release the bob to begin natural oscillation. Observe velocity and tension vectors update live."
      },
      {
        step: 4,
        title: "Test Period Formula",
        gesture: "🎚️ Length Slider",
        detail: "Adjust length and notice period change. Change bob mass and confirm period stays unchanged!"
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: "What happens to the oscillation period of a simple pendulum if you quadruple its length (L → 4L)?",
        options: [
          "Period doubles (T → 2T)",
          "Period quadruples (T → 4T)",
          "Period is cut in half (T → T/2)",
          "Period remains unchanged"
        ],
        correctIndex: 0,
        explanation: "By T = 2π√(L/g), quadrupling length scales the period by √4 = 2. The period doubles."
      },
      {
        id: 'q2',
        question: "If you double the bob mass (m → 2m) of an ideal simple pendulum while keeping length constant, how does the period change?",
        options: [
          "Period doubles",
          "Period is multiplied by √2",
          "Period remains unchanged",
          "Period is cut in half"
        ],
        correctIndex: 2,
        explanation: "The period of an ideal simple pendulum T = 2π√(L/g) is completely independent of mass, because gravitational pull and inertial resistance scale identically."
      },
      {
        id: 'q3',
        question: "Why does the small-angle formula T = 2π√(L/g) underestimate the true period at large launch angles (e.g., θ = 60°)?",
        options: [
          "Because sin(θ) < θ for large angles, making the actual restoring torque weaker than assumed",
          "Because gravity becomes stronger at high altitudes",
          "Because the rod shrinks at large angles",
          "Because air friction disappears at 60°"
        ],
        correctIndex: 0,
        explanation: "The small-angle approximation assumes sin(θ) ≈ θ. In reality, sin(θ) < θ for θ > 0, so restoring torque is weaker, causing the bob to take longer to complete an oscillation."
      },
      {
        id: 'q4',
        question: "At which point in a pendulum's swing is the tension in the supporting rod at its maximum?",
        options: [
          "At the highest turning points (extremes of motion)",
          "At the lowest vertical point (θ = 0)",
          "At halfway between the peak and bottom",
          "Tension is constant everywhere"
        ],
        correctIndex: 1,
        explanation: "At the lowest point, tension must support full gravity plus provide centripetal acceleration: T = m(g + v²/L). Since speed v is maximum at the bottom, tension is highest."
      }
    ]
  },

  electric: {
    id: 'electric',
    backendId: 'electric_field',
    category: 'Electromagnetism',
    title: "Electric Field & Charges",
    shortTitle: "E-Field Lab",
    subtitle: "Coulomb Force & Vector Superposition",
    emoji: "⚡",
    topic: "Coulomb's Law · E = k_e q / r²",
    primaryFormula: "\\mathbf{E} = k_e \\sum_i \\frac{q_i}{r_i^2} \\hat{\\mathbf{r}}_i",
    secondaryFormula: "\\mathbf{F} = q_{test} \\mathbf{E}",
    units: "Charge (q): μC or C, Electric Field (E): N/C, Force (F): N, Distance (r): m",
    objective: "Map the electric field vector distribution created by point charges, verify Coulomb's inverse-square law, and demonstrate the principle of linear superposition.",
    prerequisites: "Concept of electric charge, electrostatic attraction/repulsion, and vector addition.",
    assumptions: "Electrostatic regime (charges at rest or moving quasi-statically). Point-charge idealization with Coulomb constant k_e = 8.99 N·m²/(μC)².",
    description: "Place positive and negative point charges into the laboratory space. Watch dynamic field vector needles align along the electric field and test forces with a mobile probe charge.",
    concepts: ["Electric Field (E)", "Coulomb's Law", "Vector Superposition", "Inverse-Square Law", "Electrostatic Force", "Electric Dipole"],
    graphConfig: {
      type: 'scatter',
      xKey: 'distance',
      yKey: 'fieldMag',
      xLabel: 'Distance r from Source (m)',
      yLabel: 'Electric Field Magnitude E (N/C)',
      xUnit: 'm',
      yUnit: 'N/C',
      title: 'Field Strength vs. Distance (E ∝ 1/r²)',
      relationship: 'Inverse-square attenuation: electric field strength falls off sharply with distance squared: E = k_e · |q| / r².'
    },
    guidedSteps: [
      {
        step: 1,
        title: "Observe Radial Field from a Single Positive Charge (+q)",
        instruction: "Inspect the central positive charge (+2 μC, cyan). Notice how the glowing vector needles point radially outward in all directions.",
        gestureHint: "🖐️ Keep hand still to observe vector directions",
        controlHint: "Observe live HUD: E-field vectors radiate outward",
        expectedObservation: "Field vectors point away from the positive charge with magnitude decreasing with distance.",
        physicsExplanation: "By convention, electric field direction is the direction of force on a positive test charge (+q). Like charges repel, pointing outward.",
        formula: "\\mathbf{E} = \\frac{k_e q}{r^2} \\hat{\\mathbf{r}}",
        checkType: 'rest'
      },
      {
        step: 2,
        title: "Place a Negative Charge (-q) to Create an Electric Dipole",
        instruction: "Click 'Add Negative Charge' or toggle Charge 2 polarity to negative. Observe the curved field lines connecting +q to -q.",
        gestureHint: "🖐️ Move second charge into frame",
        controlHint: "Click '+ Add -q Charge' in Live HUD",
        expectedObservation: "Field vectors curve gracefully from the positive charge and terminate on the negative charge, forming an electric dipole pattern.",
        physicsExplanation: "By linear superposition, the total field at any point is the exact vector sum of contributions from both charges: E_total = E₁ + E₂.",
        formula: "\\mathbf{E}_{total} = \\mathbf{E}_1 + \\mathbf{E}_2",
        checkType: 'addCharge'
      },
      {
        step: 3,
        title: "Move Probe Test Charge to Measure Electrostatic Force",
        instruction: "Drag the green test charge probe around the field. Observe the electrostatic force vector F = q_test · E.",
        gestureHint: "🖐️ Drag test charge across canvas",
        controlHint: "Mouse: Click and drag the green probe charge",
        expectedObservation: "The test charge experiences strong repulsive or attractive forces that align with the local field vector.",
        physicsExplanation: "A charge placed in an electric field experiences electrostatic force proportional to both charge magnitude and field strength: F = q · E.",
        formula: "\\mathbf{F} = q_{test} \\mathbf{E}",
        checkType: 'probeMove'
      },
      {
        step: 4,
        title: "Verify the Inverse-Square Law (Distance Doubling)",
        instruction: "Move the probe charge from distance r = 0.3 m to r = 0.6 m from the charge. Observe that field strength drops to 1/4 of its initial value!",
        gestureHint: "🖐️ Move probe outward to double distance",
        controlHint: "Observe HUD: E drops by factor of ~4",
        expectedObservation: "Field strength decreases by a factor of 4 when distance is doubled, confirming 1/r² geometry.",
        physicsExplanation: "Because field lines spread over the surface area of a sphere (A = 4πr²), flux density and field strength dilute as 1/r².",
        formula: "E(2r) = \\frac{1}{4} E(r)",
        checkType: 'inverseSquare'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: "Inspect Point Charges",
        gesture: "⚡ Charge Visuals",
        detail: "Positive charges glow Cyan (+); Negative charges glow Pink (-). Needle vectors display field orientation."
      },
      {
        step: 2,
        title: "Move Charges",
        gesture: "🖐️ Drag Charges",
        detail: "Grab and reposition any source charge to watch the field topography reorganize in real time."
      },
      {
        step: 3,
        title: "Probe Local Field",
        gesture: "🎯 Test Charge",
        detail: "Move the green probe particle. The Live HUD reports exact Field Magnitude E and Electrostatic Force F."
      },
      {
        step: 4,
        title: "Add / Remove Sources",
        gesture: "🎚️ Add / Polarity",
        detail: "Create dipoles, quadrupoles, or like-charge repulsion systems to inspect vector superposition."
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: "If you double the distance from a point charge (r → 2r), how does the electric field strength change?",
        options: [
          "It is cut in half (E → E/2)",
          "It drops to one-fourth (E → E/4)",
          "It doubles (E → 2E)",
          "It remains constant"
        ],
        correctIndex: 1,
        explanation: "By Coulomb's law E = k_e·|q| / r², the field follows an inverse-square relationship: doubling distance divides the field by 2² = 4."
      },
      {
        id: 'q2',
        question: "By convention, what is the direction of an electric field vector at any point in space?",
        options: [
          "The direction of electrostatic force on a positive test charge",
          "The direction of electrostatic force on an electron",
          "Perpendicular to all lines of force",
          "Always directed toward the north magnetic pole"
        ],
        correctIndex: 0,
        explanation: "The electric field vector E is defined as the force per unit positive charge (E = F / q_test), so it always points away from positive charges and toward negative charges."
      },
      {
        id: 'q3',
        question: "Two point charges of +2 μC and -2 μC are separated by a distance d. What is the net electric field at the exact midpoint between them?",
        options: [
          "Zero N/C",
          "Points toward the negative charge with magnitude equal to the sum of both individual fields",
          "Points toward the positive charge",
          "Points perpendicular to the line connecting them"
        ],
        correctIndex: 1,
        explanation: "At the midpoint, the field from +2 μC points away from it (toward -2 μC), and the field from -2 μC points toward itself. Both vectors point in the same direction, adding constructively."
      },
      {
        id: 'q4',
        question: "A negative test charge of -3 μC is placed in an electric field pointing due East with magnitude 4000 N/C. What is the force on the charge?",
        options: [
          "0.012 N due East",
          "0.012 N due West",
          "12,000 N due East",
          "0 N"
        ],
        correctIndex: 1,
        explanation: "F = q · E = (-3 × 10⁻⁶ C) × (4000 N/C East) = -0.012 N East = +0.012 N West. A negative charge experiences force in the direction opposite to the electric field."
      }
    ]
  },

  wave: {
    id: 'wave',
    backendId: 'wave_interference',
    category: 'Waves & Optics',
    title: "Wave Interference",
    shortTitle: "Wave Lab",
    subtitle: "Superposition & Coherent Wave Dynamics",
    emoji: "🌊",
    topic: "Wave Interference · y_res = y1 + y2",
    primaryFormula: "y_{res}(x, t) = y_1(x, t) + y_2(x, t)",
    secondaryFormula: "A_{res} = \\sqrt{A_1^2 + A_2^2 + 2A_1A_2\\cos(\\Delta\\phi)}",
    units: "Amplitude (A): m, Frequency (f): Hz, Phase Difference (Δφ): rad/deg, Wavelength (λ): m",
    objective: "Demonstrate the principle of wave superposition, investigate constructive and destructive interference as a function of phase difference Δφ, and verify resultant amplitude equations.",
    prerequisites: "Wave characteristics (amplitude, wavelength, frequency) and sinusoidal harmonic wave functions.",
    assumptions: "Coherent linear waves traveling through a dispersionless medium. Superposition holds without nonlinear medium distortion.",
    description: "Adjust wave amplitudes, frequency, and relative phase difference Δφ. Watch individual wave profiles and their real-time resultant superposition string.",
    concepts: ["Principle of Superposition", "Constructive Interference", "Destructive Interference", "Phase Difference (Δφ)", "Wave Node & Antinode", "Coherence"],
    graphConfig: {
      type: 'wave',
      xKey: 'x',
      yKey: 'y',
      xLabel: 'Position x along Medium (m)',
      yLabel: 'Wave Displacement y (m)',
      xUnit: 'm',
      yUnit: 'm',
      title: 'Wave Profiles & Superposition String y(x)',
      relationship: 'Resultant wave (Gold) is the pointwise algebraic sum of Wave 1 (Cyan) and Wave 2 (Magenta): y_res(x) = y1(x) + y2(x).'
    },
    guidedSteps: [
      {
        step: 1,
        title: "Observe In-Phase Constructive Interference (Δφ = 0°)",
        instruction: "Inspect the wave display with phase difference Δφ = 0°. Both Wave 1 and Wave 2 peaks align in synchrony.",
        gestureHint: "🖐️ Keep hand still to observe constructive peak",
        controlHint: "Observe live HUD: Resultant Amplitude A_res = A1 + A2",
        expectedObservation: "Crests align with crests, doubling the resultant amplitude to A_res = 2.0 m.",
        physicsExplanation: "When waves arrive exactly in phase (Δφ = 0, 2π, ...), cos(Δφ) = 1, producing maximum constructive reinforcement: A_res = A1 + A2.",
        formula: "\\Delta\\phi = 0 \\implies A_{res} = A_1 + A_2",
        checkType: 'rest'
      },
      {
        step: 2,
        title: "Shift Phase to Destructive Interference (Δφ = 180° / π rad)",
        instruction: "Use your hand or the PHASE SHIFT slider to adjust Δφ to 180°. Watch the resultant wave completely flatten!",
        gestureHint: "🖐️ Move hand horizontally to shift phase",
        controlHint: "Adjust PHASE SHIFT slider to 180°",
        expectedObservation: "Crests of Wave 1 coincide with troughs of Wave 2, completely cancelling out to zero resultant amplitude!",
        physicsExplanation: "At phase difference Δφ = π (180°), cos(π) = -1. When amplitudes are equal, the two waves cancel completely: A_res = |A1 - A2| = 0.",
        formula: "\\Delta\\phi = \\pi \\implies A_{res} = |A_1 - A_2| = 0",
        checkType: 'destructive'
      },
      {
        step: 3,
        title: "Vary Amplitudes (A₁ ≠ A₂)",
        instruction: "Increase Amplitude A₁ to 1.8 m while keeping A₂ at 1.0 m at Δφ = 180°. Notice partial cancellation.",
        gestureHint: "🖐️ Adjust amplitude slider",
        controlHint: "Set A1 slider to 1.8 m",
        expectedObservation: "Complete cancellation requires equal amplitudes; with A₁ ≠ A₂, a residual wave of amplitude |1.8 - 1.0| = 0.8 m remains.",
        physicsExplanation: "Destructive interference only produces total silence / flatness when interfering wave components have identical amplitudes.",
        formula: "A_{res} = |1.8 - 1.0| = 0.8 \\text{ m}",
        checkType: 'unequalAmp'
      },
      {
        step: 4,
        title: "Observe Intermediate Phase (Δφ = 90° / π/2 rad)",
        instruction: "Set Δφ to 90°. For equal amplitudes (A = 1.0 m), verify A_res = √(A² + A²) = √2 · A ≈ 1.41 m.",
        gestureHint: "🖐️ Set phase slider to 90°",
        controlHint: "Set PHASE SHIFT slider to 90°",
        expectedObservation: "Resultant wave has intermediate amplitude A_res ≈ 1.41 m, perfectly matching the Pythagorean vector addition.",
        physicsExplanation: "Because cos(90°) = 0, the cross-term vanishes: A_res = √(A₁² + A₂²), identical to perpendicular phasor addition.",
        formula: "A_{res} = \\sqrt{A_1^2 + A_2^2} = \\sqrt{2} A",
        checkType: 'intermediate'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: "View Three Wave Profiles",
        gesture: "🌊 Cyan, Magenta & Gold",
        detail: "Wave 1 (Cyan) and Wave 2 (Magenta) superimpose to form the primary Resultant string (Gold)."
      },
      {
        step: 2,
        title: "Adjust Phase Shift (Δφ)",
        gesture: "🖐️ Hand Position / Slider",
        detail: "Shift phase from 0° (in-phase) to 180° (out-of-phase) to observe constructive vs destructive behavior."
      },
      {
        step: 3,
        title: "Change Frequencies",
        gesture: "🎚️ Frequency Controls",
        detail: "Adjust oscillation frequency to observe spatial wavelength changes (λ = v / f)."
      },
      {
        step: 4,
        title: "Track Interference Nodes",
        gesture: "📊 Real-Time Graph",
        detail: "Inspect the dynamic wave graph to identify fixed spatial nodes and antinodes."
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: "Two identical waves of amplitude 3.0 m interfere with a phase difference of Δφ = 0 rad. What is the resultant amplitude?",
        options: ["0 m", "3.0 m", "6.0 m", "9.0 m"],
        correctIndex: 2,
        explanation: "When in-phase (Δφ = 0), constructive interference occurs, and amplitudes simply add: A_res = A₁ + A₂ = 3.0 + 3.0 = 6.0 m."
      },
      {
        id: 'q2',
        question: "What phase difference between two coherent waves of equal amplitude produces completely destructive interference (cancellation)?",
        options: ["0°", "90° (π/2 rad)", "180° (π rad)", "360° (2π rad)"],
        correctIndex: 2,
        explanation: "A phase difference of 180° (π radians) causes crests to align with troughs. For equal amplitudes, they cancel completely to zero displacement."
      },
      {
        id: 'q3',
        question: "Two waves with amplitudes A₁ = 4.0 m and A₂ = 3.0 m interfere with a phase difference of 90° (π/2 rad). What is the resultant amplitude?",
        options: ["7.0 m", "1.0 m", "5.0 m", "12.0 m"],
        correctIndex: 2,
        explanation: "By the interference formula, with cos(90°) = 0: A_res = √(A₁² + A₂²) = √(4² + 3²) = √(16 + 9) = √25 = 5.0 m."
      },
      {
        id: 'q4',
        question: "What is a 'node' in a wave interference pattern?",
        options: [
          "A point of maximum amplitude and constructive interference",
          "A point that undergoes zero net displacement at all times due to destructive interference",
          "The speed at which the wave crest propagates",
          "The highest frequency harmonic component"
        ],
        correctIndex: 1,
        explanation: "A node is a stationary location along an interfering wave pattern where destructive interference causes the net displacement to remain zero."
      }
    ]
  },

  optics: {
    id: 'optics',
    backendId: 'optics_refraction',
    category: 'Waves & Optics',
    title: "Reflection & Refraction",
    shortTitle: "Optics Lab",
    subtitle: "Snell's Law & Total Internal Reflection",
    emoji: "🔦",
    topic: "Snell's Law · n1 sin θ1 = n2 sin θ2",
    primaryFormula: "n_1 \\sin\\theta_i = n_2 \\sin\\theta_t",
    secondaryFormula: "\\theta_c = \\arcsin\\left(\\frac{n_2}{n_1}\\right) \\quad (n_1 > n_2)",
    units: "Angles: degrees (°), Refractive Index (n): dimensionless, Speed (v): c/n",
    objective: "Verify the Law of Reflection (θ_r = θ_i) and Snell's Law of Refraction across optical media boundaries, and determine the critical angle for Total Internal Reflection (TIR).",
    prerequisites: "Wave nature of light, wave speed in optical media, and basic trigonometry.",
    assumptions: "Monochromatic light ray approximation in isotropic, non-absorbing optical media.",
    description: "Aim a virtual laser beam across the interface between two optical media (Air, Water, Glass, Diamond). Measure incident, reflected, and refracted angles, and observe Total Internal Reflection.",
    concepts: ["Law of Reflection", "Snell's Law", "Index of Refraction (n)", "Critical Angle (θ_c)", "Total Internal Reflection (TIR)", "Optical Density"],
    graphConfig: {
      type: 'scatter',
      xKey: 'thetaIncidentDeg',
      yKey: 'thetaRefractDeg',
      xLabel: 'Incident Angle θ_i (°)',
      yLabel: 'Refracted Angle θ_t (°)',
      xUnit: '°',
      yUnit: '°',
      title: 'Refraction Angle vs. Incident Angle (Snell\'s Law)',
      relationship: 'Nonlinear curve governed by sin(θ_t) = (n1/n2)·sin(θ_i). Terminates at critical angle θ_c when n1 > n2 due to Total Internal Reflection.'
    },
    guidedSteps: [
      {
        step: 1,
        title: "Inspect Normal Line & Law of Reflection",
        instruction: "Notice the dashed vertical normal line at the interface. Observe that angle of reflection θ_r always equals angle of incidence θ_i.",
        gestureHint: "🖐️ Keep hand still at 30° incident beam",
        controlHint: "Observe live HUD: θ_r = θ_i",
        expectedObservation: "The reflected ray bounces off the surface at the exact angle θ_r = θ_i relative to the normal line.",
        physicsExplanation: "The Law of Reflection states that the incident ray, reflected ray, and normal all lie in the same plane, with θ_r = θ_i.",
        formula: "\\theta_r = \\theta_i",
        checkType: 'rest'
      },
      {
        step: 2,
        title: "Test Refraction into Denser Medium (Air n=1.0 → Glass n=1.5)",
        instruction: "Aim the incident beam at θ_i = 45°. Notice how the refracted ray bends TOWARD the normal line (θ_t ≈ 28.1°).",
        gestureHint: "🖐️ Tilt hand to set θ_i = 45°",
        controlHint: "Adjust INCIDENT ANGLE slider to 45°",
        expectedObservation: "Light slows down in glass (n=1.5), bending toward normal such that θ_t < θ_i.",
        physicsExplanation: "By Snell's law, when n₂ > n₁, sin(θ_t) = (n₁/n₂)·sin(θ_i) < sin(θ_i), forcing θ_t < θ_i.",
        formula: "n_1 \\sin\\theta_i = n_2 \\sin\\theta_t \\implies \\theta_t = \\arcsin\\left(\\frac{1.0}{1.5}\\sin 45^\\circ\\right) \\approx 28.1^\\circ",
        checkType: 'refract'
      },
      {
        step: 3,
        title: "Switch to Denser-to-Rarer (Glass n=1.5 → Air n=1.0)",
        instruction: "Swap media in the Live HUD so Medium 1 is Glass (n₁ = 1.5) and Medium 2 is Air (n₂ = 1.0).",
        gestureHint: "🖐️ Keep beam angle near 30°",
        controlHint: "Click 'Swap Media' or set Medium 1: Glass, Medium 2: Air",
        expectedObservation: "The ray bends AWAY from the normal line (θ_t > θ_i). Notice the calculated critical angle θ_c ≈ 41.8°.",
        physicsExplanation: "When light travels from higher to lower index (n₁ > n₂), rays bend away from normal until reaching 90° at the critical angle.",
        formula: "\\theta_c = \\arcsin\\left(\\frac{n_2}{n_1}\\right) = \\arcsin\\left(\\frac{1.0}{1.5}\\right) \\approx 41.8^\\circ",
        checkType: 'swapMedia'
      },
      {
        step: 4,
        title: "Trigger Total Internal Reflection (θ_i > θ_c)",
        instruction: "Increase incident angle above 41.8° (e.g. θ_i = 50°). Watch the refracted ray completely vanish!",
        gestureHint: "🖐️ Tilt beam past 42°",
        controlHint: "Set INCIDENT ANGLE slider to ≥ 50°",
        expectedObservation: "No light enters Medium 2; 100% of light energy reflects back into Medium 1 with total internal reflection!",
        physicsExplanation: "For θ_i > θ_c, sin(θ_t) would exceed 1, which is mathematically impossible for a real angle. Thus, all light reflects internally.",
        formula: "\\theta_i > \\theta_c \\implies \\text{Total Internal Reflection (TIR)}",
        checkType: 'tir'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: "Aim Laser Source",
        gesture: "🔦 Move / Tilt Hand",
        detail: "Tilt your hand to change the laser angle of incidence relative to the surface normal."
      },
      {
        step: 2,
        title: "Select Media Materials",
        gesture: "🎚️ Media Selectors",
        detail: "Choose between Air (1.00), Water (1.33), Glass (1.50), and Diamond (2.42) for Medium 1 and 2."
      },
      {
        step: 3,
        title: "Observe Refraction",
        gesture: "📐 Angle Protractor",
        detail: "The live on-screen protractor displays incident angle θ_i, reflected angle θ_r, and refracted angle θ_t."
      },
      {
        step: 4,
        title: "Test Critical Angle TIR",
        gesture: "⚡ Laser at High Angle",
        detail: "When going from high index to low index, exceed the critical angle to witness Total Internal Reflection."
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: "When a light ray enters an optically denser medium (e.g. from air n=1.0 into glass n=1.5), how does it bend relative to the normal?",
        options: [
          "It bends TOWARD the normal line",
          "It bends AWAY from the normal line",
          "It continues straight without bending",
          "It reflects backward along its original path"
        ],
        correctIndex: 0,
        explanation: "Because light travels slower in denser media (v = c/n), the wave fronts pivot toward the normal, resulting in θ_t < θ_i."
      },
      {
        id: 'q2',
        question: "Under what conditions can Total Internal Reflection (TIR) occur?",
        options: [
          "Only when light travels from a higher refractive index medium into a lower refractive index medium at an angle greater than the critical angle",
          "Only when light travels from air into glass at any angle",
          "Whenever the incident angle is exactly 0° (normal incidence)",
          "Whenever the two media have identical refractive indices"
        ],
        correctIndex: 0,
        explanation: "Total Internal Reflection requires two conditions: 1) Light must travel from higher index to lower index (n₁ > n₂), and 2) The angle of incidence must exceed the critical angle (θ_i > θ_c)."
      },
      {
        id: 'q3',
        question: "What is the critical angle for a glass-to-air interface (n_glass = 1.50, n_air = 1.00)?",
        options: ["30.0°", "41.8°", "48.6°", "60.0°"],
        correctIndex: 1,
        explanation: "θ_c = arcsin(n₂ / n₁) = arcsin(1.00 / 1.50) = arcsin(0.6667) ≈ 41.8°."
      },
      {
        id: 'q4',
        question: "A light ray strikes a flat mirror at an angle of incidence of 35° relative to the normal. What is the angle between the incident ray and the reflected ray?",
        options: ["35°", "55°", "70°", "90°"],
        correctIndex: 2,
        explanation: "By the Law of Reflection, θ_r = θ_i = 35°. The total angle between the incident ray and reflected ray is θ_i + θ_r = 35° + 35° = 70°."
      }
    ]
  },

  incline: {
    id: 'incline',
    backendId: 'inclined_plane',
    category: 'Mechanics',
    title: "Friction & Inclined Plane",
    shortTitle: "Incline Lab",
    subtitle: "Static & Kinetic Friction Dynamics",
    emoji: "📐",
    topic: "Inclined Plane · a = g(sin θ - μ_k cos θ)",
    primaryFormula: "a = g(\\sin\\theta - \\mu_k \\cos\\theta)",
    secondaryFormula: "f_s \\le \\mu_s N = \\mu_s mg\\cos\\theta, \\quad \\tan\\theta_c = \\mu_s",
    units: "Mass: kg, Angle (θ): degrees, Friction Coeff (μ): dimensionless, Acceleration: m/s², Force: N",
    objective: "Analyze force vectors acting on an object on an inclined plane, determine the critical slipping angle θ_c = arctan(μ_s), and calculate acceleration governed by kinetic friction.",
    prerequisites: "Vector resolution of gravity into parallel and perpendicular components, Newton's 2nd Law, and friction concepts.",
    assumptions: "Dry Coulomb friction model with constant static coefficient μ_s and kinetic coefficient μ_k (where μ_s ≥ μ_k). Constant gravitational acceleration g = 9.80 m/s².",
    description: "Tilt the ramp angle or adjust friction coefficients. Watch free-body diagram force vectors update live, distinguish static equilibrium from downhill slipping, and measure acceleration.",
    concepts: ["Normal Force (N)", "Static Friction (f_s)", "Kinetic Friction (f_k)", "Critical Angle of Repose (θ_c)", "Free-Body Diagram", "Net Acceleration"],
    graphConfig: {
      type: 'scatter',
      xKey: 'angleDeg',
      yKey: 'acceleration',
      xLabel: 'Ramp Angle θ (°)',
      yLabel: 'Acceleration a (m/s²)',
      xUnit: '°',
      yUnit: 'm/s²',
      title: 'Acceleration vs. Ramp Angle a(θ)',
      relationship: 'Zero acceleration while θ ≤ θ_c (static equilibrium). Once θ > θ_c, acceleration rises continuously following a = g(sin θ - μ_k cos θ).'
    },
    guidedSteps: [
      {
        step: 1,
        title: "Observe Static Equilibrium at Low Angle (θ = 15°)",
        instruction: "Inspect the block resting on the incline at θ = 15°. Because tan(15°) ≈ 0.27 < μ_s = 0.45, static friction holds the block at rest.",
        gestureHint: "🖐️ Keep ramp tilted below 20°",
        controlHint: "Observe live HUD: a = 0 m/s², Status: Static Equilibrium",
        expectedObservation: "The block remains stationary on the ramp; static friction f_s exactly equals parallel gravity pull mg sin θ.",
        physicsExplanation: "Static friction is an adjustable force that matches downhill pull up to its limit: f_s = mg sin θ ≤ μ_s mg cos θ.",
        formula: "\\sum F = mg\\sin\\theta - f_s = 0 \\implies a = 0",
        checkType: 'rest'
      },
      {
        step: 2,
        title: "Calculate Critical Slipping Angle (Angle of Repose)",
        instruction: "With μ_s = 0.45, compute θ_c = arctan(0.45) ≈ 24.2°. Slowly raise the ramp angle to approach this threshold.",
        gestureHint: "🖐️ Slowly tilt hand upward",
        controlHint: "Increase SLOPE ANGLE slider toward 24°",
        expectedObservation: "Parallel gravity force grows while normal force shrinks, bringing static friction closer to its maximum limit.",
        physicsExplanation: "At the threshold of slipping, mg sin θ = μ_s mg cos θ, which simplifies to tan(θ_c) = μ_s.",
        formula: "\\tan\\theta_c = \\mu_s \\implies \\theta_c = \\arctan(0.45) \\approx 24.2^\\circ",
        checkType: 'approachCrit'
      },
      {
        step: 3,
        title: "Exceed Critical Angle to Trigger Slipping (θ = 35°)",
        instruction: "Tilt the ramp past 24.2° (e.g. θ = 35°). Watch the block break free and slide downhill with accelerating speed!",
        gestureHint: "🖐️ Tilt hand above 30°",
        controlHint: "Set SLOPE ANGLE slider to 35°",
        expectedObservation: "The block slides downhill; static friction transitions to kinetic friction f_k = μ_k mg cos θ.",
        physicsExplanation: "Once slipping begins, kinetic friction acts. Because μ_k < μ_s, net downhill force produces acceleration: a = g(sin θ - μ_k cos θ).",
        formula: "a = g(\\sin 35^\\circ - 0.30 \\cos 35^\\circ) \\approx 3.21 \\text{ m/s}^2",
        checkType: 'slip'
      },
      {
        step: 4,
        title: "Vary Friction Coefficients (Ice vs. Rubber)",
        instruction: "Reduce μ_s and μ_k to simulate an icy slope (μ_s = 0.1, μ_k = 0.05). Notice how even a shallow angle causes fast acceleration!",
        gestureHint: "🖐️ Observe slide with low friction",
        controlHint: "Set FRICTION slider to Low (Ice)",
        expectedObservation: "The block slips at very shallow angles and accelerates rapidly with minimal frictional resistance.",
        physicsExplanation: "Lower friction coefficient decreases the angle of repose θ_c and reduces retarding force, increasing downhill acceleration.",
        formula: "a \\to g\\sin\\theta \\quad (\\text{as } \\mu_k \\to 0)",
        checkType: 'varyMu'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: "Inspect Free-Body Vectors",
        gesture: "📐 Ramp & Block",
        detail: "Green arrow: Gravity (mg); Cyan arrow: Normal force (N); Red arrow: Friction (f); Gold arrow: Net force."
      },
      {
        step: 2,
        title: "Tilt Ramp Angle",
        gesture: "🖐️ Tilt Hand",
        detail: "Tilt your hand up or down in front of the camera to change the incline slope angle between 0° and 60°."
      },
      {
        step: 3,
        title: "Adjust Friction Coefficients",
        gesture: "🎚️ μ Sliders",
        detail: "Change static friction μ_s and kinetic friction μ_k to test different surface textures (Wood, Rubber, Ice)."
      },
      {
        step: 4,
        title: "Release / Reset Block",
        gesture: "↺ Reset Button",
        detail: "Reset the block to the top of the ramp to measure travel time and exit velocity."
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: "What is the critical angle of repose θ_c at which an object on an inclined plane begins to slip, given a static friction coefficient μ_s?",
        options: [
          "θ_c = arcsin(μ_s)",
          "θ_c = arctan(μ_s)",
          "θ_c = arccos(μ_s)",
          "θ_c = μ_s × 90°"
        ],
        correctIndex: 1,
        explanation: "At the verge of slipping, mg sin θ = μ_s mg cos θ. Dividing both sides by mg cos θ yields sin θ / cos θ = tan θ = μ_s, so θ_c = arctan(μ_s)."
      },
      {
        id: 'q2',
        question: "An object rests on an incline of 20° where the maximum static friction force is 15 N. If parallel gravity pull down the slope is 8 N, what is the actual static friction force acting on it?",
        options: ["15 N", "8 N", "7 N", "0 N"],
        correctIndex: 1,
        explanation: "Static friction is self-adjusting: it only exerts as much force as necessary to maintain equilibrium. Since downhill pull is 8 N, static friction is exactly 8 N uphill."
      },
      {
        id: 'q3',
        question: "Why is the kinetic friction coefficient μ_k typically smaller than the static friction coefficient μ_s for the same pair of surfaces?",
        options: [
          "Microscopic surface asperities have less time to interlock once the surfaces are in relative motion",
          "Gravity weakens when an object moves",
          "The mass of the object decreases during sliding",
          "Air resistance cancels kinetic friction"
        ],
        correctIndex: 0,
        explanation: "When stationary, microscopic contact points (asperities) settle into interlocking contact and form cold welds. Once sliding begins, these bonds are sheared rapidly and have less time to form, reducing resistance."
      },
      {
        id: 'q4',
        question: "On a frictionless inclined plane (μ = 0) tilted at 30° with g = 9.8 m/s², what is the acceleration of any sliding object?",
        options: ["9.8 m/s²", "4.9 m/s²", "8.5 m/s²", "0 m/s²"],
        correctIndex: 1,
        explanation: "Without friction, a = g · sin(θ) = 9.8 m/s² × sin(30°) = 9.8 × 0.5 = 4.9 m/s²."
      }
    ]
  }
};

export const EXPERIMENT_LIST = Object.values(EXPERIMENTS);
