/**
 * Touchless Physics Lab - Experiment Definitions & Quiz Catalog
 * Comprehensive physics specifications, formulas, interactive instructions,
 * live HUD metrics, and educational quizzes for all 5 experiments.
 */

export const EXPERIMENTS = {
  newton: {
    id: 'newton',
    backendId: 'newton_second_law',
    title: "Newton's 2nd Law",
    shortTitle: "Hand-Force",
    subtitle: "Force, Mass & Acceleration",
    emoji: "🖐️",
    topic: "Newton's 2nd Law · F = m·a",
    primaryFormula: "F = m · a",
    secondaryFormula: "a = F / m",
    description: "Discover how applied hand force and object mass determine acceleration. Observe vector arrows in real time as your hand approaches the particle ball.",
    concepts: ["Net Force", "Inertia", "Acceleration", "Mass", "Drag"],
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
        explanation: "Acceleration is inversely proportional to mass (a ∝ 1/m). Doubling mass halves the acceleration."
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
        explanation: "Once the external push force stops, viscous drag (fluid resistance F_drag = -b·v) produces a decelerating force opposing motion."
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
    primaryFormula: "J = F_{avg} · Δt",
    secondaryFormula: "J = Δp = m(v_f - v_i)",
    description: "Deliver rapid hand strikes to an impact target. Measure peak force, contact duration, impulse, and resulting change in linear momentum.",
    concepts: ["Impulse (J)", "Contact Time (Δt)", "Momentum Change (Δp)", "Impact Force", "Energy Transfer"],
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
    secondaryFormula: "U_e = ½ k x²",
    description: "Interact with a virtual elastic spring. Pull or compress the attached mass with your hand and watch the restoring force restore equilibrium.",
    concepts: ["Restoring Force", "Displacement (x)", "Spring Constant (k)", "Elastic Potential Energy", "Simple Harmonic Motion"],
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
    primaryFormula: "m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'",
    secondaryFormula: "p_{total} = const",
    description: "Explore 1D & 2D elastic collisions between two bodies. Push Ball 1 into Ball 2 and verify conservation of total momentum and kinetic energy.",
    concepts: ["Conservation of Momentum", "Elastic Collision", "Kinetic Energy", "Coefficient of Restitution", "Mass Ratio"],
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
    primaryFormula: "y(t) = v_{0y}t - ½gt²",
    secondaryFormula: "R = (v₀² sin 2θ) / g",
    description: "Aim your hand to adjust the launch angle and launch velocity of a projectile. Watch it trace a glowing parabolic path under constant gravity.",
    concepts: ["Launch Angle (θ)", "Initial Velocity (v₀)", "Maximum Height (H)", "Range (R)", "Gravity (g = 9.8 m/s²)"],
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
      }
    ]
  }
};

export const EXPERIMENT_LIST = Object.values(EXPERIMENTS);
