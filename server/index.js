import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Initialize OpenAI client if key is provided
let openai = null;
if (OPENAI_API_KEY && OPENAI_API_KEY.trim() !== '' && !OPENAI_API_KEY.includes('your_openai_api_key')) {
  try {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY.trim() });
    console.log('🤖 OpenAI client successfully initialized.');
  } catch (err) {
    console.warn('⚠️ OpenAI client initialization warning:', err.message);
  }
} else {
  console.log('ℹ️ No OpenAI API Key found in server/.env. Running with built-in Intelligent Physics Engine fallback.');
}

// =========================================================================
// BUILT-IN INTELLIGENT PHYSICS KNOWLEDGE ENGINE (Fallback & Instant response)
// =========================================================================

const PRESET_EXPERIMENTS = {
  newton_second_law: {
    id: 'newton_second_law',
    name: "Newton's Second Law & Acceleration",
    steps: [
      {
        step: 1,
        title: "Set Mass & Equilibrium State",
        instruction: "Notice the resting circular ring of particles. Each particle has an effective mass m in the simulation.",
        physicsConcept: "Mass (m) represents inertia — the resistance of any physical object to any change in its velocity.",
        actionTip: "Observe the particles resting smoothly in the cyan ring before moving your hand.",
        formula: "m = constant (inertia)",
      },
      {
        step: 2,
        title: "Apply Hand Force (F)",
        instruction: "Bring your open hand towards the particle field. Your palm creates a repulsive force vector pointing outward.",
        physicsConcept: "Force is an interaction that causes an object with mass to change its velocity. F_repulsion = (1 - d/R) · F_max.",
        actionTip: "Slowly move your hand closer to see the force gradient increase as distance decreases.",
        formula: "F_net = \\sum F = m \\cdot a",
      },
      {
        step: 3,
        title: "Observe Particle Acceleration (a)",
        instruction: "Watch how quickly the particles accelerate away from your hand. Stronger proximity generates higher acceleration.",
        physicsConcept: "Acceleration is directly proportional to net force and inversely proportional to mass: a = F_net / m.",
        actionTip: "Compare a gentle push vs bringing your hand in rapidly.",
        formula: "a = \\frac{F}{m}",
      },
      {
        step: 4,
        title: "Record Velocity & Displacement",
        instruction: "Notice how displaced particles move outward, traveling a distance (Δx) over time (Δt) with velocity v.",
        physicsConcept: "Velocity is the rate of change of position: v = \\Delta x / \\Delta t. Work done W = \\int F dx increases kinetic energy.",
        actionTip: "Open the 'Analyze' tab to calculate acceleration from force and mass.",
        formula: "v = v_0 + a \\cdot t",
      },
      {
        step: 5,
        title: "Explain the Result & Equilibrium Return",
        instruction: "Once your hand pulls back, the restoring elastic force returns particles to their home positions.",
        physicsConcept: "When F_hand drops to zero, the restoring force (Hooke's Law) and viscous drag bring particles back to equilibrium.",
        actionTip: "Great work! You've verified that F = m · a governs both the outward acceleration and the restoring return.",
        formula: "F_{net} = m \\cdot a \\implies a = \\frac{F_{spring} - F_{drag}}{m}",
      }
    ]
  },
  hookes_law: {
    id: 'hookes_law',
    name: "Hooke's Law & Elastic Restoring Force",
    steps: [
      {
        step: 1,
        title: "Identify Equilibrium Radius",
        instruction: "The particles form an initial stable ring at radius R_0 ≈ 0.62. This is the zero-net-force equilibrium position.",
        physicsConcept: "At equilibrium, sum of all forces on each particle equals zero (\\sum F = 0).",
        actionTip: "Pinch with your thumb and index finger to observe how the equilibrium radius resizes smoothly.",
        formula: "x = 0 \\implies F_{restoring} = 0",
      },
      {
        step: 2,
        title: "Displace Particles from Home",
        instruction: "Use your hand to push a group of particles outward away from their home anchors by a displacement Δx.",
        physicsConcept: "Displacement Δx stretches the virtual spring connecting each particle to its home coordinate.",
        actionTip: "Push particles far to the side and hold briefly before releasing.",
        formula: "F_{restoring} = -k \\cdot \\Delta x",
      },
      {
        step: 3,
        title: "Observe Restoring Acceleration",
        instruction: "Pull your hand away. Notice that the further a particle was displaced, the faster it snaps back toward its home.",
        physicsConcept: "The restoring force is linearly proportional to displacement: greater stretch creates greater acceleration back to center.",
        actionTip: "Look at outer particles vs inner particles during the return phase.",
        formula: "a(t) = -\\frac{k}{m} \\cdot x(t)",
      },
      {
        step: 4,
        title: "Examine Damped Oscillation",
        instruction: "Notice that particles do not oscillate forever — they gently settle without infinite bouncing.",
        physicsConcept: "The simulation applies a damping factor (velocity multiplier 0.94), modeling viscous fluid friction.",
        actionTip: "This is known as underdamped/critically damped harmonic motion.",
        formula: "F_{total} = -k \\cdot x - b \\cdot v",
      },
      {
        step: 5,
        title: "Synthesize Harmonic Restoration",
        instruction: "Reflect on how Hooke's Law governs stable structures throughout nature: molecular bonds, crystal lattices, and springs.",
        physicsConcept: "Hooke's law: F = -k·x creates simple harmonic motion governed by angular frequency \\omega = \\sqrt{k/m}.",
        actionTip: "Try pinching again to change the field radius and observe how particles re-anchor.",
        formula: "T = 2\\pi \\sqrt{\\frac{m}{k}}",
      }
    ]
  },
  momentum_shockwave: {
    id: 'momentum_shockwave',
    name: "Impulse, Momentum & Shockwaves",
    steps: [
      {
        step: 1,
        title: "Allow Particles to Settle",
        instruction: "Wait 2 seconds until particles are nearly stationary. Initial momentum p_0 ≈ 0.",
        physicsConcept: "Linear momentum is defined as p = m · v. When v = 0, momentum is zero.",
        actionTip: "Keep your hand still or outside the camera frame for a moment.",
        formula: "p = m \\cdot v",
      },
      {
        step: 2,
        title: "Execute Fast Gesture (> Threshold Speed)",
        instruction: "Swipe your hand rapidly across the screen. Watch for the expanding cyan shockwave ring!",
        physicsConcept: "Rapid motion exceeds the speed threshold (0.018 in simulation coordinates), triggering an explosive shockwave impulse.",
        actionTip: "A quick swipe with your palm open generates a dramatic radial shockwave.",
        formula: "J = \\int F \\, dt = \\Delta p",
      },
      {
        step: 3,
        title: "Observe Momentum Transfer",
        instruction: "As the shockwave wave-front contacts particles, they suddenly gain high outward velocity.",
        physicsConcept: "The shockwave imparts an impulse J = F · Δt. The change in momentum equals the impulse received.",
        actionTip: "Observe how particles near the origin of the swipe fly outward faster than distant ones.",
        formula: "\\Delta p = m(v_f - v_i)",
      },
      {
        step: 4,
        title: "Kinetic Energy Dissipation",
        instruction: "Particles reach maximum kinetic energy KE = 0.5·m·v² then slow down as kinetic energy is dissipated by drag.",
        physicsConcept: "Work done by viscous drag dissipates kinetic energy into thermal energy: W_{drag} = \\Delta KE.",
        actionTip: "Make a fist ✊ to immediately freeze particles and inspect their velocity field.",
        formula: "KE = \\frac{1}{2}m v^2",
      },
      {
        step: 5,
        title: "Explain the Impulse-Momentum Theorem",
        instruction: "You have witnessed Newton's 2nd law in momentum form: Force is the time derivative of momentum, F = dp/dt.",
        physicsConcept: "Impulse J = F_avg · Δt = Δp. A very short impact with huge force produces the same impulse as a gentle force over long time.",
        actionTip: "Compare a slow push (small F, long t) vs shockwave (huge F, tiny t).",
        formula: "F_{avg} = \\frac{\\Delta p}{\\Delta t}",
      }
    ]
},
  projectile_motion: {
    id: 'projectile_motion',
    name: "Projectile Motion & Trajectory",
    steps: [
      {
        step: 1,
        title: "Set the Launch Position",
        instruction: "Position your hand near the lower-left side of the lab. This becomes the projectile's launch point.",
        physicsConcept: "Projectile motion combines horizontal motion with constant vertical acceleration due to gravity.",
        actionTip: "Keep your hand steady for a moment to establish the launch position.",
        formula: "x = x_0 + v_x t",
      },
      {
        step: 2,
        title: "Aim the Launch Angle",
        instruction: "Move your hand upward or downward to change the launch direction. A higher hand position creates a steeper launch angle.",
        physicsConcept: "The initial velocity can be resolved into horizontal and vertical components: v_x = v_0 cosθ and v_y = v_0 sinθ.",
        actionTip: "Try a shallow angle first, then raise your hand to create a steeper trajectory.",
        formula: "v_x = v_0\\cos\\theta,\\quad v_y = v_0\\sin\\theta",
      },
      {
        step: 3,
        title: "Control Launch Force",
        instruction: "Move your hand farther from the launch point to increase the launch force. Greater force produces greater initial velocity.",
        physicsConcept: "Newton's Second Law connects the applied force to acceleration: F = m·a. A stronger launch produces a greater initial velocity.",
        actionTip: "Try a gentle movement first, then increase your hand distance for a stronger launch.",
        formula: "F = m\\cdot a",
      },
      {
        step: 4,
        title: "Launch the Projectile",
        instruction: "Pinch your thumb and index finger to launch the projectile. Watch its curved trajectory through the particle field.",
        physicsConcept: "After launch, gravity accelerates the projectile downward while horizontal velocity remains approximately constant.",
        actionTip: "Use different launch angles and forces and compare the resulting trajectories.",
        formula: "y = y_0 + v_{0y}t - \\frac{1}{2}gt^2",
      },
      {
        step: 5,
        title: "Measure Range & Maximum Height",
        instruction: "Observe how far the projectile travels and how high it rises. Compare your results with different launch angles.",
        physicsConcept: "For an ideal projectile launched and landing at the same height, maximum range occurs near θ = 45°.",
        actionTip: "Try approximately 45° and compare the range with a very low or very high angle.",
        formula: "R = \\frac{v_0^2\\sin(2\\theta)}{g}",
      }
    ]
  },
  collision_momentum: {
    id: 'collision_momentum',
    name: "Collisions & Conservation of Momentum",
    steps: [
      {
        step: 1,
        title: "Inspect Two Bodies",
        instruction: "Notice Ball 1 (Cyan, m₁) on the left and Ball 2 (Magenta, m₂) on the right. Both start at equilibrium.",
        physicsConcept: "The total linear momentum of the system is the vector sum: p_total = m₁·v₁ + m₂·v₂.",
        actionTip: "Position your hand behind Ball 1 to prepare for launch.",
        formula: "p_{total} = m_1 v_1 + m_2 v_2",
      },
      {
        step: 2,
        title: "Propel Ball 1 toward Ball 2",
        instruction: "Push Ball 1 toward Ball 2 using hand proximity. Ball 1 accelerates and gains forward velocity v₁.",
        physicsConcept: "Work done by your hand increases the kinetic energy of Ball 1: W = ΔKE₁.",
        actionTip: "Observe the velocity vector (green arrow) lengthen as Ball 1 speeds up.",
        formula: "KE_1 = \\frac{1}{2} m_1 v_1^2",
      },
      {
        step: 3,
        title: "Witness Elastic Impact",
        instruction: "When the two balls contact, an internal normal force exchange occurs during a split-second collision.",
        physicsConcept: "By Newton's 3rd Law, F₁₂ = -F₂₁. Because contact time Δt is identical, impulse J₁₂ = -J₂₁, conserving total momentum.",
        actionTip: "Watch the velocity exchange when m₁ = m₂: Ball 1 stops and Ball 2 moves forward!",
        formula: "m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'",
      },
      {
        step: 4,
        title: "Verify Kinetic Energy & Momentum",
        instruction: "In an ideal elastic collision, total kinetic energy is conserved: KE_initial = KE_final.",
        physicsConcept: "Coefficient of restitution e = 1 for perfectly elastic collisions: (v₂' - v₁') = -(v₂ - v₁).",
        actionTip: "Check the Live HUD to see both momentum and kinetic energy totals.",
        formula: "\\Delta KE_{total} = 0 \\quad (\\text{elastic})",
      },
      {
        step: 5,
        title: "Vary Mass Ratio",
        instruction: "Make Ball 1 heavier or lighter than Ball 2. Notice that if m₁ > m₂, Ball 1 continues forward after impact!",
        physicsConcept: "Velocity after collision: v₁' = [(m₁ - m₂)/(m₁ + m₂)]·v₁ + [2m₂/(m₁ + m₂)]·v₂.",
        actionTip: "Try 2.0 kg vs 1.0 kg to observe partial forward continuation.",
        formula: "v_1' = \\frac{m_1 - m_2}{m_1 + m_2} v_1",
      }
    ]
  },
  simple_pendulum: {
    id: 'simple_pendulum',
    name: "Simple Pendulum & Harmonic Oscillation",
    steps: [
      {
        step: 1,
        title: "Establish Stable Equilibrium (θ = 0)",
        instruction: "Observe the pendulum bob suspended straight down along the vertical line. Gravity and string tension cancel in equilibrium.",
        physicsConcept: "At θ = 0, tension T = m·g balances downward weight. Net tangential restoring force is zero.",
        actionTip: "Ensure the bob is at rest before applying displacement.",
        formula: "\\sum F_{\\text{tangent}} = -m g \\sin(0) = 0",
      },
      {
        step: 2,
        title: "Displace Bob to Initial Angle (θ₀)",
        instruction: "Use hand or mouse to drag the bob away from the vertical line to an initial angle (e.g. 15°).",
        physicsConcept: "Displacement imparts gravitational potential energy: U_g = m·g·L·(1 - cos θ₀).",
        actionTip: "For accurate small-angle comparison, keep initial displacement under 20°.",
        formula: "U_g = m g L (1 - \\cos\\theta_0)",
      },
      {
        step: 3,
        title: "Release Bob into Oscillation",
        instruction: "Release your hold and watch the bob swing periodically back and forth across the equilibrium center.",
        physicsConcept: "The restoring tangential force is F_restoring = -m·g·sin(θ). For small angles sin(θ) ≈ θ, yielding simple harmonic motion.",
        actionTip: "Notice how speed peaks at bottom center (θ = 0) and drops to zero at the amplitude turns.",
        formula: "\\frac{d^2\\theta}{dt^2} + \\frac{g}{L} \\sin\\theta = 0",
      },
      {
        step: 4,
        title: "Measure & Verify Period (T)",
        instruction: "Compare the simulated round-trip oscillation period with the theoretical prediction T = 2π√(L/g).",
        physicsConcept: "The theoretical small-angle period depends solely on string length L and gravitational field g; bob mass m does not affect period.",
        actionTip: "Vary string length L and observe how longer strings increase period T.",
        formula: "T = 2\\pi \\sqrt{\\frac{L}{g}}",
      }
    ]
  },
  electric_field: {
    id: 'electric_field',
    name: "Electric Field & Point Charge Superposition",
    steps: [
      {
        step: 1,
        title: "Inspect Point Charge Distribution",
        instruction: "Observe positive charge q₁ (red) and negative charge q₂ (blue) placed on the 2D coordinate plane.",
        physicsConcept: "Point charges generate radial electric fields according to Coulomb's Law: E = k·q / r² directed away from (+) and toward (-).",
        actionTip: "Positive charges radiate outward arrows; negative charges draw inward arrows.",
        formula: "E = \\frac{1}{4\\pi \\varepsilon_0} \\frac{q}{r^2} \\hat{r}",
      },
      {
        step: 2,
        title: "Position Test Probe (q₀)",
        instruction: "Move your hand or mouse to guide the yellow test probe throughout the surrounding space.",
        physicsConcept: "A positive test charge experiences electric force F = q₀ · E, pointing along the net electric field vector.",
        actionTip: "Move probe between the two charges to see where electric field vectors add or cancel.",
        formula: "\\vec{F}_e = q_0 \\vec{E}_{net}",
      },
      {
        step: 3,
        title: "Apply Vector Superposition",
        instruction: "Observe the yellow net field vector arrow computed by summing field contributions E₁ and E₂.",
        physicsConcept: "By the Principle of Superposition, net electric field at any point is the exact vector sum: E_net = E₁ + E₂.",
        actionTip: "Observe how field intensity grows extremely strong when moving close to either source charge.",
        formula: "\\vec{E}_{net} = \\sum_{i} \\vec{E}_i = k \\sum_i \\frac{q_i}{r_i^2} \\hat{r}_i",
      },
      {
        step: 4,
        title: "Adjust Charge Magnitudes",
        instruction: "Use the HUD sliders to change q₁ and q₂ values, or make both charges positive.",
        physicsConcept: "Like charges create a central null point (E_net = 0) where opposing field vectors cancel completely.",
        actionTip: "Set q₁ = +3 μC and q₂ = +3 μC and locate the center where E drops to 0 N/C.",
        formula: "\\vec{E}_{net} = 0 \\quad (\\text{at null point})",
      }
    ]
  },
  wave_interference: {
    id: 'wave_interference',
    name: "Wave Interference & Superposition Principle",
    steps: [
      {
        step: 1,
        title: "Inspect Component Waves (Wave 1 & Wave 2)",
        instruction: "Notice the individual cyan (Wave 1) and magenta (Wave 2) sinusoidal waves propagating along the x-axis.",
        physicsConcept: "A traveling or standing sinusoidal wave is modeled by y(x,t) = A · sin(k·x - ω·t + φ).",
        actionTip: "Observe the frequency f and wavelength λ of each component wave.",
        formula: "y_1 = A_1 \\sin(kx - \\omega t), \\quad y_2 = A_2 \\sin(kx - \\omega t + \\phi)",
      },
      {
        step: 2,
        title: "Observe Resultant Superposition",
        instruction: "Look at the bold white/yellow composite wave, formed by the point-by-point algebraic sum y_res = y₁ + y₂.",
        physicsConcept: "When two waves pass through the same medium simultaneously, the net displacement is the algebraic sum of individual displacements.",
        actionTip: "Check that at any x-position, the height of the resultant wave equals the sum of the two component heights.",
        formula: "y_{resultant}(x,t) = y_1(x,t) + y_2(x,t)",
      },
      {
        step: 3,
        title: "Demonstrate Constructive Interference",
        instruction: "Set phase difference Δφ to 0 rad (in-phase). Observe the resultant amplitude double to A₁ + A₂.",
        physicsConcept: "When waves are in-phase (Δφ = 0, 2π, 4π...), wave crests align with crests, producing maximum constructive amplification.",
        actionTip: "Slide phase difference to 0 and watch the resultant peak grow to 3.0 m.",
        formula: "A_{max} = A_1 + A_2 \\quad (\\text{when } \\Delta\\phi = 2n\\pi)",
      },
      {
        step: 4,
        title: "Demonstrate Destructive Interference",
        instruction: "Slide phase difference Δφ to π rad (180° out-of-phase). Watch the waves cancel into a flat line.",
        physicsConcept: "When waves are out-of-phase (Δφ = π, 3π...), crests align with troughs, leading to complete destructive cancellation when A₁ = A₂.",
        actionTip: "Slide phase to exactly 3.14 rad and observe net displacement drop to near zero.",
        formula: "A_{min} = |A_1 - A_2| = 0 \\quad (\\text{when } \\Delta\\phi = (2n+1)\\pi)",
      }
    ]
  },
  optics_refraction: {
    id: 'optics_refraction',
    name: "Reflection, Snell's Law & Refraction",
    steps: [
      {
        step: 1,
        title: "Inspect Boundary Interface & Normal",
        instruction: "Observe the horizontal boundary separating Medium 1 (top, e.g. air n₁) from Medium 2 (bottom, e.g. glass n₂), and the dashed surface normal.",
        physicsConcept: "All angles in geometric optics are strictly measured relative to the surface normal perpendicular to the boundary.",
        actionTip: "Keep note of the surface normal line at 90° to the horizontal boundary.",
        formula: "\\text{Normal Line } \\perp \\text{ Boundary Interface}",
      },
      {
        step: 2,
        title: "Verify the Law of Reflection",
        instruction: "Direct the laser beam at incident angle θ₁ and observe the upward reflected ray angle θ_r.",
        physicsConcept: "By the Law of Reflection, the angle of reflection strictly equals the angle of incidence: θ_r = θ₁.",
        actionTip: "Change incident angle to 40° and verify reflected angle is exactly 40°.",
        formula: "\\theta_{\\text{reflection}} = \\theta_{\\text{incident}}",
      },
      {
        step: 3,
        title: "Verify Snell's Law of Refraction",
        instruction: "Observe the downward transmitted ray bending into Medium 2 at angle θ₂.",
        physicsConcept: "Snell's Law states n₁·sin(θ₁) = n₂·sin(θ₂). When light enters a denser medium (n₂ > n₁), it slows down and bends toward the normal.",
        actionTip: "Compare incident angle θ₁ vs refracted angle θ₂: notice θ₂ < θ₁ when entering glass (n=1.5).",
        formula: "n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2 \\implies \\theta_2 = \\arcsin\\left(\\frac{n_1}{n_2} \\sin\\theta_1\\right)",
      },
      {
        step: 4,
        title: "Trigger Total Internal Reflection (TIR)",
        instruction: "Set Medium 1 to dense glass (n₁ = 1.5) and Medium 2 to air (n₂ = 1.0). Increase θ₁ past the critical angle θ_c ≈ 41.8°.",
        physicsConcept: "When traveling from a denser to a rarer medium at θ₁ > θ_c = arcsin(n₂/n₁), no light refracts; 100% is totally internally reflected.",
        actionTip: "Watch the refracted ray vanish and the beam turn 100% into a brilliant reflected ray.",
        formula: "\\theta_c = \\arcsin\\left(\\frac{n_2}{n_1}\\right)",
      }
    ]
  },
  inclined_plane: {
    id: 'inclined_plane',
    name: "Friction & Inclined Plane Dynamics",
    steps: [
      {
        step: 1,
        title: "Resolve Gravity into Slope Components",
        instruction: "Observe the mass block resting on a ramp tilted at angle θ. Note the gravity force vectors.",
        physicsConcept: "Gravity decomposes into a normal component F_N = m·g·cos(θ) into the ramp, and a downslope component F_parallel = m·g·sin(θ).",
        actionTip: "Notice how increasing tilt θ increases downslope pull while decreasing the normal contact force.",
        formula: "F_{\\parallel} = mg\\sin\\theta, \\quad F_N = mg\\cos\\theta",
      },
      {
        step: 2,
        title: "Observe Static Friction at Rest",
        instruction: "Keep tilt angle shallow (e.g. 15°). The block remains stationary held by static friction f_s.",
        physicsConcept: "Static friction matches the downhill pull up to its maximum threshold f_s,max = μ_s · F_N. As long as tan(θ) ≤ μ_s, the block cannot slide.",
        actionTip: "Look at the uphill orange friction arrow counterbalancing the downhill pull.",
        formula: "f_s \\le \\mu_s F_N = \\mu_s mg\\cos\\theta",
      },
      {
        step: 3,
        title: "Exceed the Critical Slip Angle",
        instruction: "Tilt the ramp steeper until θ exceeds the critical angle θ_c = arctan(μ_s).",
        physicsConcept: "When downslope gravity exceeds maximum static friction (mg sin θ > μ_s mg cos θ), static friction breaks down and sliding begins.",
        actionTip: "Notice the transition moment: static friction drops to kinetic friction f_k = μ_k · F_N.",
        formula: "\\theta_c = \\arctan(\\mu_s)",
      },
      {
        step: 4,
        title: "Calculate Sliding Acceleration (a)",
        instruction: "Observe the block accelerating down the ramp with measured net acceleration a_net.",
        physicsConcept: "Net force is F_net = mg sin θ - μ_k mg cos θ. Dividing by mass m gives acceleration a = g(sin θ - μ_k cos θ).",
        actionTip: "Compare measured acceleration with theoretical formula a = g·(sin θ - μ_k·cos θ).",
        formula: "a = g (\\sin\\theta - \\mu_k \\cos\\theta)",
      }
    ]
  }
};

// Aliases for short IDs so both frontend conventions match seamlessly
PRESET_EXPERIMENTS.newton = PRESET_EXPERIMENTS.newton_second_law;
PRESET_EXPERIMENTS.hooke = PRESET_EXPERIMENTS.hookes_law;
PRESET_EXPERIMENTS.impulse = PRESET_EXPERIMENTS.momentum_shockwave;
PRESET_EXPERIMENTS.projectile = PRESET_EXPERIMENTS.projectile_motion;
PRESET_EXPERIMENTS.collision = PRESET_EXPERIMENTS.collision_momentum;
PRESET_EXPERIMENTS.pendulum = PRESET_EXPERIMENTS.simple_pendulum;
PRESET_EXPERIMENTS.electric = PRESET_EXPERIMENTS.electric_field;
PRESET_EXPERIMENTS.wave = PRESET_EXPERIMENTS.wave_interference;
PRESET_EXPERIMENTS.optics = PRESET_EXPERIMENTS.optics_refraction;
PRESET_EXPERIMENTS.incline = PRESET_EXPERIMENTS.inclined_plane;


// Fallback Q&A knowledge base
function generateFallbackPhysicsAnswer(question) {
  const q = question.toLowerCase().trim();

  // Voice command: "why is my answer wrong?"
  if (q.includes("why is my answer wrong") || q.includes("wrong answer") || q.includes("explain mistake")) {
    return {
      answer: "Physics concepts can be tricky! When an answer is wrong, it is usually because: 1) Confusing inverse relationships (like acceleration being inversely proportional to mass, a = F/m); 2) Forgetting that momentum is conserved in all isolated collisions, but kinetic energy is only conserved in elastic collisions; or 3) Missing negative direction signs (like Hooke's Law F = -kx pointing opposite to stretch). Check the formula and units carefully!",
      formula: "Concept Check & Dimensional Analysis",
      variables: [],
      example: "In Newton's 2nd law, doubling mass HALVES acceleration; it doesn't double it!",
      steps: [
        "1. Re-read the given values and their physical units.",
        "2. Identify the governing physical equation.",
        "3. Check whether the relationship is direct (numerator) or inverse (denominator)."
      ]
    };
  }

  // Voice command: "how do i perform this"
  if (q.includes("how do i perform") || q.includes("how to perform") || q.includes("instructions")) {
    return {
      answer: "To perform experiments in this lab: 1) Keep your hand clearly visible in front of the camera (open palm 🖐️); 2) Bring your hand close to objects to apply repulsive force or drag springs; 3) Use quick swipes 💨 for shockwaves and impulse impacts; 4) Make a fist ✊ to freeze physics anytime; 5) Check the Live HUD on the right for real-time measurements!",
      formula: "Gestures: 🖐️ Push, 💨 Swipe, ✊ Freeze, 🤏 Pinch",
      variables: [],
      example: "Open palm pushes the ball; fast motion generates high impulse shockwaves.",
      steps: [
        "Step 1: Check hand tracking dot (green = active).",
        "Step 2: Move hand toward target object.",
        "Step 3: Watch real-time vectors and live HUD data."
      ]
    };
  }

  // Voice command: "give me a hint"
  if (q.includes("hint") || q.includes("give me a hint")) {
    return {
      answer: "Here is a hint for your active experiment: Start by checking what physical quantities are known (e.g. mass, force, displacement, velocity). Look at the governing equation on your screen. If you change one variable, what must happen to the other to keep the equality true?",
      formula: "F = m · a, \\quad J = F \\cdot \\Delta t = \\Delta p, \\quad F = -k \\cdot x",
      variables: [],
      example: "If force stays constant and mass increases, acceleration must decrease.",
      steps: ["Identify knowns", "Choose formula", "Solve for unknown"]
    };
  }

  // Impulse questions
  if (q.includes("impulse") || (q.includes("force") && q.includes("time") && q.includes("impact"))) {
    return {
      answer: "Impulse (J) is the effect of a force acting over a period of time. By the Impulse-Momentum Theorem, the impulse delivered to an object equals its exact change in momentum: J = F_avg · Δt = Δp = m(v_final - v_initial). A large force applied for a tiny fraction of a second (like hitting a golf ball or a fast hand swipe) produces the same impulse as a smaller force applied over a longer duration.",
      formula: "J = \\int F \\, dt = F_{avg} \\cdot \\Delta t = \\Delta p",
      variables: [
        { symbol: "J", name: "Impulse", unit: "Newton-seconds (N·s, or kg·m/s)" },
        { symbol: "F_avg", name: "Average Force", unit: "Newtons (N)" },
        { symbol: "Δt", name: "Contact Duration", unit: "Seconds (s)" },
        { symbol: "Δp", name: "Momentum Change", unit: "kg·m/s" }
      ],
      example: "In our lab, a quick hand swipe delivers high peak force in a very short contact time Δt, causing a sudden impulse J that launches the target ball forward.",
      steps: [
        "1. Calculate impulse using J = F_avg · Δt.",
        "2. Equate impulse to momentum change: J = m · Δv.",
        "3. Example: 20 N applied for 0.05 s gives J = 1.0 N·s."
      ]
    };
  }

  // Collision questions
  if (q.includes("collision") || q.includes("elastic") || (q.includes("conserve") && q.includes("momentum"))) {
    return {
      answer: "In any isolated collision where no external forces act, total linear momentum is conserved: m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'. In an elastic collision, kinetic energy is also conserved (KE_initial = KE_final). If two objects have equal mass (m₁ = m₂) and Ball 2 is initially at rest, an elastic collision causes Ball 1 to stop completely while Ball 2 moves forward with Ball 1's original velocity!",
      formula: "m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'",
      variables: [
        { symbol: "m₁, m₂", name: "Masses of colliding bodies", unit: "Kilograms (kg)" },
        { symbol: "v₁, v₂", name: "Initial velocities", unit: "Meters per second (m/s)" },
        { symbol: "v₁', v₂'", name: "Final velocities after collision", unit: "Meters per second (m/s)" },
        { symbol: "p_total", name: "Total linear momentum", unit: "kg·m/s" }
      ],
      example: "In the Collision Lab, pushing Ball 1 into resting Ball 2 transfers velocity. Notice total momentum before and after impact stays identical!",
      steps: [
        "1. Compute initial momentum: p_i = m₁v₁ + m₂v₂.",
        "2. In elastic collisions: solve system with conservation of KE and momentum.",
        "3. For equal masses: v₁' = v₂ and v₂' = v₁ (complete velocity exchange)."
      ]
    };
  }

  // Hooke's Law & Springs
  if (q.includes("hooke") || q.includes("spring") || q.includes("elastic restoring")) {
    return {
      answer: "Hooke's Law states that the restoring force exerted by a spring is directly proportional to its displacement from equilibrium and directed toward the equilibrium position: F = -k·x. The negative sign represents the restoring nature of the force: if you stretch it right (+x), the spring pulls left (-F). The elastic potential energy stored in the spring is U = ½ k x².",
      formula: "F = -k \\cdot x, \\quad U = \\frac{1}{2} k x^2",
      variables: [
        { symbol: "F", name: "Restoring Force", unit: "Newtons (N)" },
        { symbol: "k", name: "Spring Stiffness Constant", unit: "Newtons per meter (N/m)" },
        { symbol: "x", name: "Displacement from Equilibrium", unit: "Meters (m)" },
        { symbol: "U", name: "Elastic Potential Energy", unit: "Joules (J)" }
      ],
      example: "In the Spring Lab, dragging the mass bob away from center stretches the virtual coils. When released, the restoring force causes simple harmonic oscillation.",
      steps: [
        "1. Measure displacement x from the center equilibrium point (x = 0).",
        "2. Compute restoring force F = -k · x.",
        "3. Compute stored elastic energy U = 0.5 · k · x²."
      ]
    };
  }

  // Projectile Motion
  if (q.includes("projectile") || q.includes("trajectory") || q.includes("parabola") || q.includes("launch angle")) {
    return {
      answer: "Projectile motion is two-dimensional motion under constant gravitational acceleration: horizontal velocity v_x remains constant (v_x = v₀ cos θ, neglecting air resistance), while vertical velocity accelerates downward at g = 9.8 m/s² (v_y = v₀ sin θ - gt). The resulting trajectory is a smooth parabola. On level ground, the maximum horizontal range occurs at an angle of 45°.",
      formula: "x(t) = v_0 \\cos\\theta \\cdot t, \\quad y(t) = v_0 \\sin\\theta \\cdot t - \\frac{1}{2}gt^2, \\quad R = \\frac{v_0^2 \\sin 2\\theta}{g}",
      variables: [
        { symbol: "v₀", name: "Initial Launch Speed", unit: "Meters per second (m/s)" },
        { symbol: "θ", name: "Launch Angle", unit: "Degrees (°)" },
        { symbol: "g", name: "Acceleration due to Gravity", unit: "9.8 m/s²" },
        { symbol: "R", name: "Horizontal Range", unit: "Meters (m)" },
        { symbol: "H", name: "Maximum Apex Height", unit: "Meters (m)" }
      ],
      example: "In the Projectile Lab, aiming your hand at 45° launches the ball to the maximum distance on the target pad.",
      steps: [
        "1. Resolve initial velocity: v_0x = v₀ cos θ, v_0y = v₀ sin θ.",
        "2. Time of flight: T = 2 v_0y / g.",
        "3. Total horizontal range: R = v_0x · T = (v₀² sin 2θ) / g."
      ]
    };
  }

  // Newton's 2nd Law
  if (q.includes("newton") && (q.includes("2") || q.includes("second") || q.includes("law"))) {
    return {
      answer: "Newton's Second Law of Motion states that the acceleration of an object depends directly upon the net force acting upon it, and inversely upon the object's mass. In simpler terms: when you push an object harder, it speeds up faster; but if the object is heavier, it resists speeding up.",
      formula: "F = m · a",
      variables: [
        { symbol: "F", name: "Net Force", unit: "Newtons (N, or kg·m/s²)" },
        { symbol: "m", name: "Mass", unit: "Kilograms (kg)" },
        { symbol: "a", name: "Acceleration", unit: "Meters per second squared (m/s²)" }
      ],
      example: "In our Touchless Lab, when you move your hand closer to a particle, you exert a stronger repulsive force (F). Because the particle's mass (m) is constant, that increased force causes it to accelerate (a) away much faster!",
      steps: [
        "1. Identify the given mass m and applied force F.",
        "2. Rearrange the formula to solve for acceleration: a = F / m.",
        "3. Example: If F = 10 N and m = 2 kg, then a = 10 N / 2 kg = 5 m/s².",
        "4. This means the velocity increases by 5 m/s every second."
      ]
    };
  }

  if (q.includes("particle") && (q.includes("move") || q.includes("moving") || q.includes("why"))) {
    return {
      answer: "The objects and particles in this lab move due to real physical equations simulated in real-time:\n\n1. **Applied Hand Force**: Your tracked hand acts as an interactive force field.\n2. **Inertia (Mass)**: Acceleration is calculated strictly from a = F_net / m.\n3. **Restoring Elastic Force**: Springs pull displaced masses back to equilibrium (F = -k·x).\n4. **Viscous Drag**: Realistic fluid resistance dissipates kinetic energy so motions settle naturally.",
      formula: "F_{net} = \\sum F = m \\cdot a",
      variables: [
        { symbol: "F_hand", name: "Hand Interaction Force", unit: "Newtons (N)" },
        { symbol: "F_drag", name: "Viscous Resistance (-b·v)", unit: "Newtons (N)" }
      ],
      example: "Moving your hand in applies external force; withdrawing your hand lets friction or spring restoring forces take over.",
      steps: []
    };
  }

  if (q.includes("momentum")) {
    return {
      answer: "Momentum is a measure of how difficult it is to stop a moving object — commonly called 'mass in motion'. An object with more mass or higher velocity possesses greater momentum: p = m · v.",
      formula: "p = m · v",
      variables: [
        { symbol: "p", name: "Linear Momentum", unit: "Kilogram-meter per second (kg·m/s)" },
        { symbol: "m", name: "Mass", unit: "Kilograms (kg)" },
        { symbol: "v", name: "Velocity", unit: "Meters per second (m/s)" }
      ],
      example: "A bowling ball and a tennis ball moving at the same speed have very different momentum because the bowling ball has much larger mass.",
      steps: [
        "1. Identify mass m and velocity v.",
        "2. Compute momentum using p = m · v.",
        "3. Momentum is a vector pointing in the direction of velocity."
      ]
    };
  }

  if (q.includes("acceleration") || q.includes("velocity") || q.includes("speed")) {
    return {
      answer: "Velocity is the rate of change of position with respect to time (speed with direction), while acceleration is the rate of change of velocity with respect to time.",
      formula: "v = \\frac{\\Delta x}{\\Delta t}, \\quad a = \\frac{\\Delta v}{\\Delta t}",
      variables: [
        { symbol: "v", name: "Velocity", unit: "Meters per second (m/s)" },
        { symbol: "a", name: "Acceleration", unit: "Meters per second squared (m/s²)" },
        { symbol: "Δx", name: "Displacement", unit: "Meters (m)" },
        { symbol: "Δt", name: "Time interval", unit: "Seconds (s)" }
      ],
      example: "If a particle at rest accelerates to 6 m/s over 2 seconds, its acceleration is a = (6 - 0) / 2 = 3 m/s².",
      steps: [
        "1. Find initial velocity v_0 and final velocity v_f.",
        "2. Find the elapsed time interval Δt.",
        "3. Compute acceleration: a = (v_f - v_0) / Δt."
      ]
    };
  }

  if (q.includes("pendulum") || (q.includes("period") && q.includes("length")) || q.includes("bob")) {
    return {
      answer: "A simple pendulum consists of a point bob of mass m suspended by a massless string of length L. For small displacements (θ < 20°), the restoring force is approximately linear (sin θ ≈ θ), creating Simple Harmonic Motion with period T = 2π√(L/g). Notice that period depends ONLY on length L and gravity g — the bob's mass has no effect on oscillation period!",
      formula: "T = 2\\pi \\sqrt{\\frac{L}{g}}, \\quad \\omega = \\sqrt{\\frac{g}{L}}",
      variables: [
        { symbol: "T", name: "Oscillation Period", unit: "Seconds (s)" },
        { symbol: "L", name: "String Length", unit: "Meters (m)" },
        { symbol: "g", name: "Gravitational Acceleration", unit: "9.80665 m/s²" },
        { symbol: "θ", name: "Angular Displacement", unit: "Radians (rad) or Degrees (°)" }
      ],
      example: "A 1.0 meter pendulum has a theoretical period of T = 2π√(1.0 / 9.8) ≈ 2.007 seconds. Doubling length multiplies period by √2.",
      steps: [
        "1. Identify string length L and local gravity g.",
        "2. Substitute into T = 2π√(L/g).",
        "3. Note that mass m does not alter the oscillation timing."
      ]
    };
  }

  if (q.includes("electric") || q.includes("coulomb") || q.includes("charge") || (q.includes("field") && !q.includes("particle field"))) {
    return {
      answer: "An electric field E is a vector field surrounding electric charges that exerts electrostatic force on other charges. By Coulomb's Law, the field from a point charge is E = k·q / r² pointing radially outward from (+) charges and inward toward (-) charges. In multi-charge configurations, the net electric field at any point is the exact vector sum of all individual contributions (Principle of Superposition).",
      formula: "\\vec{E}_{net} = k \\sum_i \\frac{q_i}{r_i^2} \\hat{r}_i, \\quad k = 8.988 \\times 10^9 \\text{ N}\\cdot\\text{m}^2/\\text{C}^2",
      variables: [
        { symbol: "E", name: "Electric Field Strength", unit: "Newtons per Coulomb (N/C)" },
        { symbol: "q", name: "Source Charge", unit: "Coulombs (C, often μC)" },
        { symbol: "r", name: "Distance from charge", unit: "Meters (m)" },
        { symbol: "k", name: "Coulomb Constant", unit: "8.99 × 10⁹ N·m²/C²" }
      ],
      example: "Between two equal opposite charges (+q and -q), the electric field vectors add constructively in the middle, pointing from positive to negative.",
      steps: [
        "1. Calculate field magnitude from each charge: E = k·|q| / r².",
        "2. Determine direction vector: outward for (+), inward for (-).",
        "3. Sum components vectorially: E_net = (Σ E_x, Σ E_y)."
      ]
    };
  }

  if (q.includes("wave") || q.includes("interference") || q.includes("superposition") || q.includes("constructive") || q.includes("destructive")) {
    return {
      answer: "Wave interference occurs when two or more waves overlap in the same medium. By the Principle of Superposition, the net displacement at any point is the algebraic sum of the individual wave displacements: y_res = y₁ + y₂. If waves are in-phase (Δφ = 0, 2π...), their crests align for Constructive Interference (A_max = A₁ + A₂). If out-of-phase (Δφ = π, 180°), they cancel in Destructive Interference (A_min = |A₁ - A₂|).",
      formula: "y_{resultant}(x,t) = y_1(x,t) + y_2(x,t) = 2A \\cos(\\Delta\\phi / 2) \\sin(kx - \\omega t + \\Delta\\phi / 2)",
      variables: [
        { symbol: "y", name: "Wave Displacement", unit: "Meters (m)" },
        { symbol: "A", name: "Wave Amplitude", unit: "Meters (m)" },
        { symbol: "Δφ", name: "Phase Difference", unit: "Radians (rad)" },
        { symbol: "f", name: "Frequency", unit: "Hertz (Hz)" }
      ],
      example: "Noise-cancelling headphones use destructive interference: they emit an inverted wave (Δφ = π) that cancels incoming environmental noise.",
      steps: [
        "1. Sum component amplitudes algebraically at each point.",
        "2. Check phase difference: Δφ = 0 gives constructive doubling.",
        "3. Δφ = π (180°) produces complete destructive cancellation."
      ]
    };
  }

  if (q.includes("optics") || q.includes("refraction") || q.includes("snell") || q.includes("reflection") || q.includes("critical angle")) {
    return {
      answer: "Geometric optics explains light rays at interfaces. The Law of Reflection states that the reflection angle equals the incident angle: θ_r = θ₁. Snell's Law governs refraction: n₁·sin(θ₁) = n₂·sin(θ₂). When light travels from a dense to a less dense medium (n₁ > n₂), increasing the incident angle past the critical angle θ_c = arcsin(n₂/n₁) causes Total Internal Reflection (TIR), where 100% of light reflects back with zero transmission.",
      formula: "n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2, \\quad \\theta_c = \\arcsin(n_2 / n_1)",
      variables: [
        { symbol: "n₁, n₂", name: "Refractive Indices of Media", unit: "Dimensionless" },
        { symbol: "θ₁", name: "Angle of Incidence", unit: "Degrees (°) or Radians" },
        { symbol: "θ₂", name: "Angle of Refraction", unit: "Degrees (°) or Radians" },
        { symbol: "θ_c", name: "Critical Angle", unit: "Degrees (°)" }
      ],
      example: "Fiber optic cables use total internal reflection to transmit internet data through flexible glass cores without light escaping.",
      steps: [
        "1. Measure angles from the surface normal perpendicular to interface.",
        "2. Use Snell's law: sin(θ₂) = (n₁ / n₂) · sin(θ₁).",
        "3. Check for TIR if n₁ > n₂ and sin(θ₁) > n₂ / n₁."
      ]
    };
  }

  if (q.includes("incline") || q.includes("friction") || q.includes("ramp") || q.includes("slope") || q.includes("normal force")) {
    return {
      answer: "On an inclined plane tilted at angle θ, gravity breaks into two perpendicular components: F_parallel = m·g·sin(θ) down the slope, and F_normal = m·g·cos(θ) into the surface. Static friction holds the object stationary up to f_s,max = μ_s · F_N. Once tan(θ) > μ_s, the object slips and kinetic friction f_k = μ_k · F_N opposes motion, giving net downhill acceleration a = g·(sin θ - μ_k·cos θ).",
      formula: "a = g (\\sin\\theta - \\mu_k \\cos\\theta), \\quad \\theta_c = \\arctan(\\mu_s)",
      variables: [
        { symbol: "θ", name: "Incline Angle", unit: "Degrees (°) or Radians" },
        { symbol: "μ_s", name: "Static Friction Coefficient", unit: "Dimensionless" },
        { symbol: "μ_k", name: "Kinetic Friction Coefficient", unit: "Dimensionless" },
        { symbol: "a", name: "Downslope Acceleration", unit: "m/s²" }
      ],
      example: "If a ramp has μ_s = 0.50, the critical slip angle is θ_c = arctan(0.50) ≈ 26.6°. Below this angle, the block cannot slide no matter its mass.",
      steps: [
        "1. Calculate normal force: F_N = m·g·cos(θ).",
        "2. Compare downhill gravity (mg sin θ) to max static friction (μ_s mg cos θ).",
        "3. If slipping, compute acceleration: a = g·(sin θ - μ_k cos θ)."
      ]
    };
  }

  // General beginner-friendly response
  return {
    answer: `Great physics question! In our Touchless Physics Lab, we study how classical mechanics governs the motion of matter. For "${question}", think about the interaction between applied forces, inertia (mass), and the resulting change in motion (acceleration). Every physical interaction obeys conservation of energy and momentum.`,
    formula: "F_{net} = m \\cdot a",
    variables: [
      { symbol: "F", name: "Net Force", unit: "Newtons (N)" },
      { symbol: "m", name: "Mass", unit: "Kilograms (kg)" },
      { symbol: "a", name: "Acceleration", unit: "Meters per second squared (m/s²)" }
    ],
    example: "Try moving your hand toward the particle field and observe how particles respond instantly to the force field you create!",
    steps: [
      "1. Identify the fundamental forces acting on the system.",
      "2. Write down known variables with their standard SI units.",
      "3. Apply the appropriate governing law (Newton's laws, Hooke's law, or conservation principles)."
    ]
  };
}

// =========================================================================
// API ENDPOINTS
// =========================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Touchless Physics Lab AI Server',
    openaiConfigured: Boolean(openai),
    model: OPENAI_MODEL,
    timestamp: new Date().toISOString()
  });
});

// 1. AI PHYSICS ASSISTANT: POST /api/physics
app.post('/api/physics', async (req, res) => {
  try {
    const { question, history = [], context = {} } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a physics question.'
      });
    }

    const cleanQuestion = question.trim();

    // If OpenAI is available, call it
    if (openai) {
      try {
        const systemPrompt = `You are Dr. Nova, the AI Physics Lab Assistant for the "Touchless Physics Lab" - a virtual interactive laboratory where students explore mechanics, particle dynamics, and forces using real-time hand gestures.
Your teaching persona:
- Beginner-friendly, encouraging, and clear.
- Scientifically accurate and careful.
- State formulas clearly when helpful (use clean standard notation, e.g. F = m·a, p = m·v, KE = 0.5·m·v², F = -k·x).
- Always explain what each variable represents and include standard SI units (kg, N, m/s, m/s², s).
- Provide an intuitive real-world or lab-related example.
- If solving a numerical problem, show clear numbered step-by-step calculations with units at every step.
- When the student asks about this specific lab: the lab simulates 2000 particles governed by Hooke's law elastic return (home ring equilibrium), hand proximity repulsion (Coulomb-like inverse force), shockwave impulse (fast hand swipe > threshold speed), and viscous damping (vx *= 0.94).
- Respond in JSON format with this exact schema:
{
  "answer": "Clear beginner explanation in markdown formatting",
  "formula": "Governing formula or empty string if not applicable",
  "variables": [
    {"symbol": "F", "name": "Force", "unit": "Newtons (N)"}
  ],
  "example": "Intuitive real-world or lab example",
  "steps": ["Step 1: ...", "Step 2: ..."] (empty array if not a numerical/multi-step question)
}`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-4).map(h => ({
            role: h.role === 'assistant' ? 'assistant' : 'user',
            content: typeof h.content === 'string' ? h.content : JSON.stringify(h.content)
          })),
          { role: 'user', content: cleanQuestion }
        ];

        const response = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 800
        });

        const rawContent = response.choices[0].message.content;
        const parsed = JSON.parse(rawContent);

        return res.json({
          success: true,
          answer: parsed.answer || parsed.explanation || "No explanation generated.",
          formula: parsed.formula || "",
          variables: parsed.variables || [],
          example: parsed.example || "",
          steps: parsed.steps || [],
          source: 'openai'
        });
      } catch (aiErr) {
        console.warn('OpenAI API call failed, falling back to Intelligent Physics Engine:', aiErr.message);
        // Fall through to fallback
      }
    }

    // Intelligent Fallback
    const fallback = generateFallbackPhysicsAnswer(cleanQuestion);
    return res.json({
      success: true,
      ...fallback,
      source: 'local-physics-engine'
    });

  } catch (error) {
    console.error('Error in /api/physics:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while answering your physics question. Please try again.'
    });
  }
});

// 2. EXPERIMENT GUIDE: POST /api/physics/guide
app.post('/api/physics/guide', async (req, res) => {
  try {
    const { experimentId = 'newton_second_law', step = 1, userQuery, context } = req.body;

    const expTrack = PRESET_EXPERIMENTS[experimentId] || PRESET_EXPERIMENTS.newton_second_law;
    const stepIndex = Math.max(0, Math.min(expTrack.steps.length - 1, (parseInt(step) || 1) - 1));
    const stepData = expTrack.steps[stepIndex];

    let queryAnswer = null;

    // If the student asked a question during the experiment step
    if (userQuery && userQuery.trim() !== '') {
      if (openai) {
        try {
          const guidePrompt = `You are guiding a student in a physics lab experiment called "${expTrack.name}".
They are currently on Step ${stepData.step}: "${stepData.title}".
Step instruction: "${stepData.instruction}"
Physics concept: "${stepData.physicsConcept}".
The student asks: "${userQuery}".
Provide a concise, encouraging, beginner-friendly answer (2-4 sentences) that helps them understand this exact step and what to do.`;

          const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [{ role: 'system', content: guidePrompt }],
            max_tokens: 300,
            temperature: 0.3
          });
          queryAnswer = completion.choices[0].message.content;
        } catch (err) {
          console.warn('OpenAI guide query failed, using local advice:', err.message);
        }
      }

      if (!queryAnswer) {
        queryAnswer = `Good question! In Step ${stepData.step}, focus on ${stepData.physicsConcept.toLowerCase()} Observe how the particles respond directly to your gesture.`;
      }
    }

    return res.json({
      success: true,
      experimentId: expTrack.id,
      experimentName: expTrack.name,
      currentStep: stepData.step,
      totalSteps: expTrack.steps.length,
      title: stepData.title,
      instruction: stepData.instruction,
      physicsConcept: stepData.physicsConcept,
      actionTip: stepData.actionTip,
      formula: stepData.formula,
      queryAnswer,
      availableExperiments: Object.keys(PRESET_EXPERIMENTS).map(k => ({
        id: PRESET_EXPERIMENTS[k].id,
        name: PRESET_EXPERIMENTS[k].name,
        stepsCount: PRESET_EXPERIMENTS[k].steps.length
      }))
    });

  } catch (error) {
    console.error('Error in /api/physics/guide:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve experiment guide.'
    });
  }
});

// 3. AI OBSERVATION ANALYSIS: POST /api/physics/analyze
app.post('/api/physics/analyze', async (req, res) => {
  try {
    const { experimentName = 'Particle Dynamics Lab', data = {}, notes = '' } = req.body;

    // Check numerical values provided
    const mass = parseFloat(data.mass);
    const force = parseFloat(data.force);
    const acceleration = parseFloat(data.acceleration);
    const velocity = parseFloat(data.velocity);
    const displacement = parseFloat(data.displacement);
    const time = parseFloat(data.time);
    const particleCount = parseInt(data.particleCount) || 2000;

    const providedFields = [];
    if (!isNaN(mass) && mass > 0) providedFields.push(`Mass = ${mass} kg`);
    if (!isNaN(force) && force !== 0) providedFields.push(`Force = ${force} N`);
    if (!isNaN(acceleration) && acceleration !== 0) providedFields.push(`Acceleration = ${acceleration} m/s²`);
    if (!isNaN(velocity) && velocity !== 0) providedFields.push(`Velocity = ${velocity} m/s`);
    if (!isNaN(displacement) && displacement !== 0) providedFields.push(`Displacement = ${displacement} m`);
    if (!isNaN(time) && time > 0) providedFields.push(`Time = ${time} s`);

    // Rule: Do NOT invent measurements. Clearly state when insufficient data is available.
    if (providedFields.length < 2) {
      return res.json({
        success: true,
        dataSufficiency: 'insufficient',
        summary: 'Insufficient data provided for rigorous physical analysis.',
        missingDataNotes: 'To analyze this observation, please provide at least two interrelated physical quantities (e.g. Mass and Force for Newton’s 2nd Law, Mass and Velocity for Momentum, or Displacement and Time for Kinematics).',
        interpretation: 'Without sufficient recorded measurements, the AI will not invent or guess values.',
        theoreticalComparison: null,
        takeaway: 'Record at least 2 measurable variables in the lab to test physical laws.'
      });
    }

    // If OpenAI is available, ask it to analyze strictly the provided numbers
    if (openai) {
      try {
        const analyzePrompt = `You are Dr. Nova, a rigorous and encouraging Physics Lab Analyst.
Analyze the following recorded experiment observation in "${experimentName}":
Recorded Measurements:
${providedFields.join('\n')}
Particle count in simulation: ${particleCount}
Student notes: ${notes || 'None'}

CRITICAL RULES:
1. Do NOT invent or fabricate any measurements that were not provided.
2. Clearly explain what the provided measurements mean physically.
3. If enough related data exists (e.g. F and m provided to check a = F/m, or m and v to check p = m·v, or d and t to check kinematics), compare expected theoretical physics with observed values.
4. Note realistic lab effects (such as viscous drag damping of 0.94/frame or friction).
5. Output JSON matching this schema:
{
  "summary": "1-2 sentence overview of the observation",
  "interpretation": "Detailed explanation of what these measured values mean physically with units",
  "theoreticalComparison": {
    "formulaUsed": "e.g. a_expected = F / m",
    "expectedValue": "Calculated value with unit or 'N/A' if missing formula counterpart",
    "observedValue": "Observed value with unit or 'N/A'",
    "agreement": "High / Close / Deviates due to friction or damping / Insufficient pair to calculate",
    "explanation": "Why observed matches or deviates from ideal theory"
  },
  "dataSufficiency": "sufficient",
  "takeaway": "Key scientific learning takeaway for the student"
}`;

        const completion = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          messages: [{ role: 'system', content: analyzePrompt }],
          response_format: { type: 'json_object' },
          temperature: 0.2
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return res.json({
          success: true,
          ...result,
          recordedData: data,
          source: 'openai'
        });
      } catch (err) {
        console.warn('OpenAI analysis failed, using local analytical physics engine:', err.message);
      }
    }

    // Local Analytical Physics Engine (Accurate calculation fallback)
    let expectedAcc = null;
    let expectedMom = null;
    let expectedKE = null;
    let comparisonExplanation = "";
    let agreementStatus = "High";

    if (!isNaN(force) && !isNaN(mass)) {
      expectedAcc = (force / mass).toFixed(2);
      if (!isNaN(acceleration)) {
        const diff = Math.abs(parseFloat(expectedAcc) - acceleration);
        if (diff < 0.2) {
          agreementStatus = "Excellent agreement";
          comparisonExplanation = `Theoretical expected acceleration a = F/m is ${expectedAcc} m/s², which closely matches the observed ${acceleration} m/s².`;
        } else {
          agreementStatus = "Realistic deviation (drag/damping)";
          comparisonExplanation = `Theoretical ideal acceleration is ${expectedAcc} m/s². The observed acceleration of ${acceleration} m/s² reflects viscous air resistance (damping) active in the particle field.`;
        }
      } else {
        agreementStatus = "Theoretical baseline calculated";
        comparisonExplanation = `Given applied force F = ${force} N and mass m = ${mass} kg, the predicted acceleration is a = F / m = ${expectedAcc} m/s².`;
      }
    }

    if (!isNaN(mass) && !isNaN(velocity)) {
      expectedMom = (mass * velocity).toFixed(3);
      expectedKE = (0.5 * mass * velocity * velocity).toFixed(3);
    }

    return res.json({
      success: true,
      dataSufficiency: 'sufficient',
      summary: `Analyzed ${providedFields.length} recorded measurements for ${experimentName}.`,
      interpretation: `The recorded state reveals an active physical interaction: ${providedFields.join(', ')}. ` +
        (expectedMom ? `Linear momentum p = m·v is calculated at ${expectedMom} kg·m/s, carrying kinetic energy KE = ${expectedKE} Joules. ` : '') +
        `Across the ${particleCount} active simulation particles, these values represent the dynamic response to external force input.`,
      theoreticalComparison: {
        formulaUsed: expectedAcc ? "Newton's 2nd Law: a_{ideal} = F / m" : (expectedMom ? "Momentum: p = m · v" : "Kinematic relations"),
        expectedValue: expectedAcc ? `${expectedAcc} m/s²` : (expectedMom ? `${expectedMom} kg·m/s` : "N/A"),
        observedValue: !isNaN(acceleration) ? `${acceleration} m/s²` : (!isNaN(velocity) ? `${velocity} m/s` : "N/A"),
        agreement: agreementStatus,
        explanation: comparisonExplanation || "Observed values follow classical mechanics principles."
      },
      takeaway: "In real-world and simulated physics, net acceleration reflects the competition between applied input forces and counteractive resistive forces like friction and drag.",
      recordedData: data,
      source: 'local-physics-engine'
    });

  } catch (error) {
    console.error('Error in /api/physics/analyze:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze observation.'
    });
  }
});

// 4. AI HINTS: POST /api/physics/hint
app.post('/api/physics/hint', async (req, res) => {
  try {
    const { problem = '', hintLevel = 1, requestSolution = false } = req.body;

    if (!problem || problem.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a physics problem to get a hint.'
      });
    }

    const level = parseInt(hintLevel) || 1;

    // If OpenAI is available, generate progressive hints or complete solution
    if (openai) {
      try {
        const hintPrompt = `You are Dr. Nova, a supportive Physics Tutor using the Socratic method.
A student is working on this physics problem:
"${problem}"

Requested Mode: ${requestSolution ? "COMPLETE STEP-BY-STEP SOLUTION" : `HINT LEVEL ${level} (Out of 3 maximum levels)`}

GUIDELINES FOR HINTS:
- Level 1: A subtle nudge. Identify which physical concepts and principles apply without giving away equations or answers.
- Level 2: Mention the relevant formula(s) and how variables relate to the given numbers.
- Level 3: Guide the intermediate algebraic step or setup without performing the final calculation.
- Complete Solution (ONLY when requestSolution is true): Show full numbered steps, all intermediate calculations with units, and state the final answer clearly with bold text.

Respond in JSON format:
{
  "hintLevel": ${level},
  "maxHints": 3,
  "isFullSolution": ${Boolean(requestSolution)},
  "hint": "The hint message or solution text in markdown",
  "formulaHint": "Formula related to this hint or empty string",
  "nextStepGuidance": "What the student should try next",
  "solution": ${requestSolution ? '"Full step-by-step solution"' : 'null'}
}`;

        const completion = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          messages: [{ role: 'system', content: hintPrompt }],
          response_format: { type: 'json_object' },
          temperature: 0.2
        });

        const parsed = JSON.parse(completion.choices[0].message.content);
        return res.json({
          success: true,
          ...parsed,
          source: 'openai'
        });
      } catch (err) {
        console.warn('OpenAI hint failed, using progressive tutoring engine:', err.message);
      }
    }

    // Local progressive tutoring engine
    if (requestSolution) {
      return res.json({
        success: true,
        hintLevel: level,
        maxHints: 3,
        isFullSolution: true,
        hint: `### Full Physics Solution\n\n**Problem:** ${problem}\n\n1. **Identify Givens & Unknowns:** Parse the known physical quantities (e.g. mass, force, distance, velocity) and identify target variable.\n2. **Select Governing Laws:** Apply conservation laws (Work-Energy Theorem: $W = \\Delta KE$) or Newton's Laws ($F = m \\cdot a$) with kinematic formulas ($v^2 = v_0^2 + 2ad$).\n3. **Substitute Values & Calculate:** Insert numerical values with appropriate standard SI units.\n4. **Dimensional Verification:** Verify that the units of the result match the expected quantity (e.g. m/s for velocity, N for force).\n\n*Review each step above to ensure full conceptual understanding!*`,
        formulaHint: "F = m · a,  W = F · d,  KE = 0.5 · m · v²",
        nextStepGuidance: "Verify your own answer against the steps above.",
        solution: "Complete solution displayed.",
        source: 'local-physics-engine'
      });
    }

    // Progressive hints (Levels 1 to 3)
    let hintText = "";
    let formulaText = "";
    let nextGuidance = "";

    if (level === 1) {
      hintText = "💡 **Conceptual Hint (Level 1):** Start by identifying what type of physics problem this is. Is it about forces causing acceleration (Newtonian Dynamics), energy transformation (Kinetic/Potential), or momentum transfer? List all the numerical values given in the problem along with their units.";
      formulaText = "Identify: Given quantities vs Target unknown";
      nextGuidance = "Write down your given numbers and decide which physics law connects them.";
    } else if (level === 2) {
      hintText = "📐 **Formula Hint (Level 2):** Connect your knowns to your target variable using foundational physics equations. If force and mass are given, remember Newton's Second Law: $F = m \\cdot a$. If motion over a distance is involved, consider the Work-Energy Theorem: $W = F \\cdot d = \\Delta KE = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2$.";
      formulaText = "F_{net} = m \\cdot a  \\quad \\text{or} \\quad W = F \\cdot d = \\Delta KE";
      nextGuidance = "Rearrange the formula to isolate the target variable on the left side.";
    } else {
      hintText = "🔍 **Algebraic Setup Hint (Level 3):** Plug in the known values into the rearranged formula. Make sure all units are converted to standard SI (grams to kg, cm to meters). Solve for the intermediate value (such as acceleration $a$) first before computing the final target quantity!";
      formulaText = "a = \\frac{F}{m}, \\quad v_f = \\sqrt{v_0^2 + 2ad}";
      nextGuidance = "Complete the arithmetic step-by-step. If you get stuck, click 'Reveal Complete Solution'!";
    }

    return res.json({
      success: true,
      hintLevel: level,
      maxHints: 3,
      isFullSolution: false,
      hint: hintText,
      formulaHint: formulaText,
      nextStepGuidance: nextGuidance,
      solution: null,
      source: 'local-physics-engine'
    });

  } catch (error) {
    console.error('Error in /api/physics/hint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate hint.'
    });
  }
});

// 6. QUIZ MISTAKE EXPLANATION: POST /api/physics/quiz-explain
app.post('/api/physics/quiz-explain', async (req, res) => {
  try {
    const {
      question,
      selectedOption,
      correctOption,
      explanation: standardExplanation = '',
      experimentName = 'Physics Experiment'
    } = req.body;

    if (!question || !selectedOption) {
      return res.status(400).json({
        success: false,
        error: 'Missing question or selectedOption.'
      });
    }

    if (openai) {
      try {
        const prompt = `You are Dr. Nova, a supportive and encouraging AI Physics Tutor.
A student in "${experimentName}" answered a quiz question incorrectly:
Question: "${question}"
Student's Selected Answer (Incorrect): "${selectedOption}"
Correct Answer: "${correctOption}"
Concept Explanation: "${standardExplanation}"

Provide a concise, encouraging 2-3 sentence tutoring breakdown:
1. Explain WHY the selected option is a common misconception or physically incorrect.
2. Clearly explain the correct physical mechanism without making the student feel bad.
3. Provide a memorable takeaway tip.`;

        const completion = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          messages: [{ role: 'system', content: prompt }],
          max_tokens: 350,
          temperature: 0.3
        });

        return res.json({
          success: true,
          tutoringExplanation: completion.choices[0].message.content,
          source: 'openai'
        });
      } catch (err) {
        console.warn('OpenAI quiz explain error:', err.message);
      }
    }

    // Built-in intelligent fallback explanation
    const fallbackExpl = `While choosing "${selectedOption}" is a common slip, remember the underlying physical principle: ${standardExplanation || 'The physical law requires balancing forces, conservation, and dimensional units.'} The correct answer is "${correctOption}". Keep observing the live values in the lab to see this in action!`;

    return res.json({
      success: true,
      tutoringExplanation: fallbackExpl,
      source: 'local-physics-engine'
    });
  } catch (error) {
    console.error('Error in /api/physics/quiz-explain:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to explain quiz answer.'
    });
  }
});

// Health check endpoint (both /api/health and /health)
const handleHealthCheck = (req, res) => {
  res.json({
    status: 'online',
    service: 'Touchless Physics Lab AI Server',
    platform: 'Touchless Physics Lab',
    openaiConfigured: Boolean(openai),
    aiConnected: Boolean(openai),
    model: OPENAI_MODEL,
    timestamp: new Date().toISOString()
  });
};

app.get('/api/health', handleHealthCheck);
app.get('/health', handleHealthCheck);

// Serve compiled frontend assets for unified full-stack deployment
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`⚡ Touchless Physics Lab AI Server running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🤖 Mode: ${openai ? 'OpenAI gpt-4o-mini Connected' : 'Intelligent Physics Engine (Fallback Active)'}`);
  console.log(`===============================================`);
});
