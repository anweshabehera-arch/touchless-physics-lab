/**
 * Touchless Physics Lab — Physics Quest Missions & Hypothesis Predictions Catalog
 * 30 Missions (Beginner, Intermediate, Expert across all 10 experiments)
 * 10 Hypothesis Predictions with scientific explanations and deterministic validation.
 */

export const QUEST_MISSIONS = {
  newton: [
    {
      id: "newton_m1",
      expId: "newton",
      tier: "beginner",
      title: "First Acceleration",
      badge: "🎯",
      description: "Apply a gentle hand or manual force to accelerate the 1.0 kg mass between 2.0 and 4.5 m/s².",
      targetCondition: "2.0 m/s² ≤ Acceleration ≤ 4.5 m/s²",
      hint: "By Newton's 2nd Law, a = F/m. For m = 1.0 kg, an applied force between 2.0 N and 4.5 N achieves this.",
      xpReward: 50,
      validate: (telemetry) => {
        const a = Math.abs(Number(telemetry?.acceleration) || 0);
        if (a >= 2.0 && a <= 4.5) {
          return { success: true, progress: 100, message: `Target achieved! Measured acceleration: ${a.toFixed(2)} m/s².` };
        }
        const progress = Math.min(95, Math.round((a / 2.0) * 100));
        return { success: false, progress, message: `Current acceleration: ${a.toFixed(2)} m/s². Need 2.0 to 4.5 m/s².` };
      }
    },
    {
      id: "newton_m2",
      expId: "newton",
      tier: "intermediate",
      title: "Inertia Double-Down",
      badge: "⚖️",
      description: "Increase mass to 2.0 kg using the HUD slider and generate at least 5.0 N of applied force.",
      targetCondition: "Mass = 2.0 kg & Net Force ≥ 5.0 N",
      hint: "Greater inertia requires greater force to achieve the same acceleration.",
      xpReward: 100,
      validate: (telemetry, physicsState) => {
        const m = Number(physicsState?.mass ?? telemetry?.mass) || 1.0;
        const f = Math.abs(Number(telemetry?.force) || 0);
        const massOk = m >= 1.95;
        const forceOk = f >= 5.0;

        if (massOk && forceOk) {
          return { success: true, progress: 100, message: `Inertia challenge complete! Mass: ${m.toFixed(1)} kg, Force: ${f.toFixed(1)} N.` };
        }
        let prog = 0;
        if (massOk) prog += 50;
        if (forceOk) prog += 50;
        else prog += Math.min(45, Math.round((f / 5.0) * 50));
        return { success: false, progress: prog, message: `Mass: ${m.toFixed(1)} kg (target 2.0 kg), Force: ${f.toFixed(1)} N (target ≥ 5.0 N).` };
      }
    },
    {
      id: "newton_m3",
      expId: "newton",
      tier: "expert",
      title: "Kinetic Momentum Surge",
      badge: "🚀",
      description: "Achieve a system linear momentum p ≥ 4.0 kg·m/s through sustained net force.",
      targetCondition: "Momentum p = m·v ≥ 4.0 kg·m/s",
      hint: "Sustained net force increases velocity over time (F·Δt = Δp). Move your hand closer or increase applied force slider.",
      xpReward: 200,
      validate: (telemetry) => {
        const p = Math.abs(Number(telemetry?.momentum) || 0);
        if (p >= 4.0) {
          return { success: true, progress: 100, message: `Momentum surge achieved! Measured p: ${p.toFixed(2)} kg·m/s.` };
        }
        const prog = Math.min(95, Math.round((p / 4.0) * 100));
        return { success: false, progress: prog, message: `Current momentum: ${p.toFixed(2)} kg·m/s. Need ≥ 4.0 kg·m/s.` };
      }
    }
  ],

  impulse: [
    {
      id: "impulse_m1",
      expId: "impulse",
      tier: "beginner",
      title: "First Impact",
      badge: "💨",
      description: "Execute a rapid hand swipe or trigger manual impact to deliver an impulse J ≥ 1.5 N·s.",
      targetCondition: "Impulse J ≥ 1.5 N·s",
      hint: "Fast hand movement triggers the shockwave threshold. A quick swipe transfers instant momentum.",
      xpReward: 50,
      validate: (telemetry) => {
        const J = Math.abs(Number(telemetry?.impulseJ) || 0);
        if (J >= 1.5) {
          return { success: true, progress: 100, message: `Impulse delivered! J = ${J.toFixed(2)} N·s.` };
        }
        const prog = Math.min(95, Math.round((J / 1.5) * 100));
        return { success: false, progress: prog, message: `Current impulse: ${J.toFixed(2)} N·s. Target: ≥ 1.5 N·s.` };
      }
    },
    {
      id: "impulse_m2",
      expId: "impulse",
      tier: "intermediate",
      title: "Momentum Transfer",
      badge: "⚡",
      description: "Accelerate the ball to a velocity v ≥ 3.0 m/s using an impulse collision.",
      targetCondition: "Final Velocity v ≥ 3.0 m/s",
      hint: "By the Impulse-Momentum Theorem, J = Δp = m·v. Greater impulse creates higher exit speed.",
      xpReward: 100,
      validate: (telemetry) => {
        const v = Math.abs(Number(telemetry?.velocity) || 0);
        if (v >= 3.0) {
          return { success: true, progress: 100, message: `High velocity achieved! v = ${v.toFixed(2)} m/s.` };
        }
        const prog = Math.min(95, Math.round((v / 3.0) * 100));
        return { success: false, progress: prog, message: `Current speed: ${v.toFixed(2)} m/s. Target: ≥ 3.0 m/s.` };
      }
    },
    {
      id: "impulse_m3",
      expId: "impulse",
      tier: "expert",
      title: "Peak Force Shockwave",
      badge: "💥",
      description: "Deliver a high-intensity shockwave with peak force F_peak ≥ 20.0 N and impulse J ≥ 3.5 N·s.",
      targetCondition: "Peak Force ≥ 20.0 N & J ≥ 3.5 N·s",
      hint: "Click 'Simulate Rapid Impact' in the HUD or perform a lightning-fast hand swipe across the webcam.",
      xpReward: 200,
      validate: (telemetry) => {
        const f = Math.abs(Number(telemetry?.peakForce || telemetry?.force) || 0);
        const J = Math.abs(Number(telemetry?.impulseJ) || 0);
        if (f >= 20.0 && J >= 3.5) {
          return { success: true, progress: 100, message: `Shockwave mastered! F_peak: ${f.toFixed(1)} N, J: ${J.toFixed(2)} N·s.` };
        }
        const prog = Math.min(95, Math.round(((f / 20.0) * 0.5 + (J / 3.5) * 0.5) * 100));
        return { success: false, progress: prog, message: `Peak force: ${f.toFixed(1)} N (need 20 N), J: ${J.toFixed(2)} N·s (need 3.5 N·s).` };
      }
    }
  ],

  hooke: [
    {
      id: "hooke_m1",
      expId: "hooke",
      tier: "beginner",
      title: "Spring Stretch",
      badge: "➰",
      description: "Displace the spring mass by at least 0.15 m from its center equilibrium position.",
      targetCondition: "Displacement |Δx| ≥ 0.15 m",
      hint: "Use hand proximity or click and drag the mass outward to stretch the virtual spring.",
      xpReward: 50,
      validate: (telemetry) => {
        const x = Math.abs(Number(telemetry?.displacement) || 0);
        if (x >= 0.15) {
          return { success: true, progress: 100, message: `Spring stretched! |Δx| = ${x.toFixed(2)} m.` };
        }
        const prog = Math.min(95, Math.round((x / 0.15) * 100));
        return { success: false, progress: prog, message: `Displacement: ${x.toFixed(2)} m. Target: ≥ 0.15 m.` };
      }
    },
    {
      id: "hooke_m2",
      expId: "hooke",
      tier: "intermediate",
      title: "Target Restoring Force",
      badge: "🎯",
      description: "Tune spring constant k and displacement Δx so restoring force F_s is 5.0 ± 0.8 N.",
      targetCondition: "4.2 N ≤ Restoring Force ≤ 5.8 N",
      hint: "By Hooke's Law, F = -k·x. For k = 25 N/m, a displacement of 0.20 m gives F = 5.0 N.",
      xpReward: 100,
      validate: (telemetry) => {
        const f = Math.abs(Number(telemetry?.springForce || telemetry?.force) || 0);
        if (f >= 4.2 && f <= 5.8) {
          return { success: true, progress: 100, message: `Force calibrated! Restoring force: ${f.toFixed(2)} N.` };
        }
        const prog = Math.min(90, Math.round((f / 5.0) * 100));
        return { success: false, progress: prog, message: `Restoring force: ${f.toFixed(2)} N. Target: 5.0 ± 0.8 N.` };
      }
    },
    {
      id: "hooke_m3",
      expId: "hooke",
      tier: "expert",
      title: "Elastic Energy Vault",
      badge: "💎",
      description: "Store at least 0.35 J of elastic potential energy (U_s = 1/2 k x²) in the spring.",
      targetCondition: "Potential Energy U_s ≥ 0.35 J",
      hint: "Increase spring constant k to 30+ N/m and displace the mass to 0.16+ m.",
      xpReward: 200,
      validate: (telemetry) => {
        const u = Math.abs(Number(telemetry?.potentialEnergy) || 0);
        if (u >= 0.35) {
          return { success: true, progress: 100, message: `Energy stored! U_s = ${u.toFixed(3)} J.` };
        }
        const prog = Math.min(95, Math.round((u / 0.35) * 100));
        return { success: false, progress: prog, message: `Stored energy: ${u.toFixed(3)} J. Target: ≥ 0.35 J.` };
      }
    }
  ],

  collision: [
    {
      id: "collision_m1",
      expId: "collision",
      tier: "beginner",
      title: "Equal Mass Transfer",
      badge: "⚪",
      description: "Launch Cart 1 at resting Cart 2 with m1 = m2 = 1.0 kg in Elastic mode.",
      targetCondition: "Cart 2 Speed v2 ≥ 2.0 m/s after elastic impact",
      hint: "Click 'Launch Cart 1' in the HUD with both masses set to 1.0 kg.",
      xpReward: 50,
      validate: (telemetry) => {
        const v2 = Math.abs(Number(telemetry?.v2) || 0);
        if (v2 >= 2.0) {
          return { success: true, progress: 100, message: `Velocity transferred! Cart 2 speed = ${v2.toFixed(2)} m/s.` };
        }
        const prog = Math.min(95, Math.round((v2 / 2.0) * 100));
        return { success: false, progress: prog, message: `Cart 2 speed: ${v2.toFixed(2)} m/s. Target: ≥ 2.0 m/s.` };
      }
    },
    {
      id: "collision_m2",
      expId: "collision",
      tier: "intermediate",
      title: "Inelastic Coupling",
      badge: "🔗",
      description: "Switch to Inelastic mode and collide carts so they move together at v_common ≥ 1.2 m/s.",
      targetCondition: "Inelastic Mode & Shared Speed v ≥ 1.2 m/s",
      hint: "In an inelastic collision, carts stick together and share common velocity: v = (m1·v1)/(m1+m2).",
      xpReward: 100,
      validate: (telemetry, physicsState) => {
        const mode = physicsState?.collisionType || "elastic";
        const v1 = Math.abs(Number(telemetry?.v1) || 0);
        const v2 = Math.abs(Number(telemetry?.v2) || 0);
        const isCoupled = Math.abs(v1 - v2) < 0.25 && v1 >= 1.2;

        if (mode === "inelastic" && isCoupled) {
          return { success: true, progress: 100, message: `Inelastic coupling verified! Common speed: ${v1.toFixed(2)} m/s.` };
        }
        return { success: false, progress: mode === "inelastic" ? 60 : 20, message: `Mode: ${mode}. Set mode to 'Inelastic' and launch Cart 1.` };
      }
    },
    {
      id: "collision_m3",
      expId: "collision",
      tier: "expert",
      title: "Heavy Projector Momentum",
      badge: "🚂",
      description: "Set Cart 1 mass = 2.0 kg and Cart 2 = 1.0 kg in Elastic mode. Achieve total momentum p_total ≥ 3.5 kg·m/s.",
      targetCondition: "m1 = 2.0 kg, m2 = 1.0 kg & p_total ≥ 3.5 kg·m/s",
      hint: "When m1 > m2, Cart 1 continues moving forward after collision while Cart 2 shoots forward even faster!",
      xpReward: 200,
      validate: (telemetry, physicsState) => {
        const m1 = Number(physicsState?.mass) || 1.0;
        const m2 = Number(physicsState?.mass2) || 1.0;
        const p = Math.abs(Number(telemetry?.pTotal) || 0);
        const massesOk = m1 >= 1.9 && m2 <= 1.1;

        if (massesOk && p >= 3.5) {
          return { success: true, progress: 100, message: `Heavy projector verified! p_total = ${p.toFixed(2)} kg·m/s.` };
        }
        let prog = massesOk ? 50 : 25;
        if (p >= 3.5) prog += 50;
        return { success: false, progress: prog, message: `Mass ratio m1/m2: ${m1}/${m2} (need 2.0/1.0 kg), Momentum: ${p.toFixed(2)} kg·m/s.` };
      }
    }
  ],

  projectile: [
    {
      id: "projectile_m1",
      expId: "projectile",
      tier: "beginner",
      title: "First Flight",
      badge: "🏹",
      description: "Launch a projectile at 45° with speed v0 ≥ 5.0 m/s to achieve range R ≥ 2.5 m.",
      targetCondition: "Launch Angle ≈ 45° & Range R ≥ 2.5 m",
      hint: "At 45°, horizontal and vertical initial velocity components are equal, yielding maximum range.",
      xpReward: 50,
      validate: (telemetry) => {
        const r = Math.abs(Number(telemetry?.range) || 0);
        if (r >= 2.5) {
          return { success: true, progress: 100, message: `Target hit! Horizontal range: ${r.toFixed(2)} m.` };
        }
        const prog = Math.min(95, Math.round((r / 2.5) * 100));
        return { success: false, progress: prog, message: `Range: ${r.toFixed(2)} m. Target: ≥ 2.5 m.` };
      }
    },
    {
      id: "projectile_m2",
      expId: "projectile",
      tier: "intermediate",
      title: "High Altitude Lob",
      badge: "🏔️",
      description: "Configure launch angle to at least 65° and achieve apex height H_max ≥ 1.5 m.",
      targetCondition: "Launch Angle ≥ 65° & Apex Height ≥ 1.5 m",
      hint: "Steeper angles convert more kinetic energy into vertical potential energy at the apex: H = v_y² / (2g).",
      xpReward: 100,
      validate: (telemetry, physicsState) => {
        const ang = Number(physicsState?.launchAngle ?? telemetry?.launchAngle) || 45;
        const h = Math.abs(Number(telemetry?.maxHeight) || 0);
        if (ang >= 65 && h >= 1.5) {
          return { success: true, progress: 100, message: `High lob complete! Angle: ${ang}°, Max Height: ${h.toFixed(2)} m.` };
        }
        let prog = ang >= 65 ? 50 : 25;
        if (h >= 1.5) prog += 50;
        return { success: false, progress: prog, message: `Angle: ${ang}° (need ≥ 65°), Apex Height: ${h.toFixed(2)} m (need ≥ 1.5 m).` };
      }
    },
    {
      id: "projectile_m3",
      expId: "projectile",
      tier: "expert",
      title: "Long Range Artillery",
      badge: "🎯",
      description: "Maximize projectile range by launching at v0 ≥ 7.0 m/s to exceed R ≥ 4.5 m.",
      targetCondition: "Horizontal Range R ≥ 4.5 m",
      hint: "Range scales quadratically with launch speed (R ∝ v0²). Double velocity quadruples range!",
      xpReward: 200,
      validate: (telemetry) => {
        const r = Math.abs(Number(telemetry?.range) || 0);
        if (r >= 4.5) {
          return { success: true, progress: 100, message: `Artillery target verified! Range: ${r.toFixed(2)} m.` };
        }
        const prog = Math.min(95, Math.round((r / 4.5) * 100));
        return { success: false, progress: prog, message: `Current range: ${r.toFixed(2)} m. Target: ≥ 4.5 m.` };
      }
    }
  ],

  pendulum: [
    {
      id: "pendulum_m1",
      expId: "pendulum",
      tier: "beginner",
      title: "Harmonic Swing",
      badge: "🕰️",
      description: "Displace the pendulum bob to an initial angle between 15° and 35° and release.",
      targetCondition: "Initial Angle between 15° and 35°",
      hint: "Drag the bob with your hand or use the Angle slider in the HUD, then let go.",
      xpReward: 50,
      validate: (telemetry) => {
        const ang = Math.abs(Number(telemetry?.angleDeg ?? telemetry?.pendulumAngle) || 0);
        if (ang >= 15 && ang <= 35) {
          return { success: true, progress: 100, message: `Harmonic swing initiated! Angle: ${ang.toFixed(1)}°.` };
        }
        const prog = Math.min(95, Math.round((ang / 20) * 100));
        return { success: false, progress: prog, message: `Current angle: ${ang.toFixed(1)}°. Target: 15° to 35°.` };
      }
    },
    {
      id: "pendulum_m2",
      expId: "pendulum",
      tier: "intermediate",
      title: "Two-Second Clock",
      badge: "⏱️",
      description: "Tune suspension length L so theoretical period T = 2π√(L/g) is 2.0 ± 0.15 s.",
      targetCondition: "Period T = 2.0 ± 0.15 s",
      hint: "For g = 9.8 m/s², a string length of L ≈ 1.0 m produces a theoretical period of ~2.007 s.",
      xpReward: 100,
      validate: (telemetry) => {
        const T = Math.abs(Number(telemetry?.period) || 0);
        if (T >= 1.85 && T <= 2.15) {
          return { success: true, progress: 100, message: `Clock period calibrated! T = ${T.toFixed(3)} s.` };
        }
        const prog = Math.min(90, Math.round((T / 2.0) * 100));
        return { success: false, progress: prog, message: `Period: ${T.toFixed(3)} s. Target: 2.0 ± 0.15 s.` };
      }
    },
    {
      id: "pendulum_m3",
      expId: "pendulum",
      tier: "expert",
      title: "Energy Conservation Cross",
      badge: "⚛️",
      description: "Observe total mechanical energy E = PE + KE maintain at least 0.50 J during oscillation.",
      targetCondition: "Total Mechanical Energy E ≥ 0.50 J",
      hint: "Increase bob mass to 1.0 kg and string length to 1.5 m with angle 30° to store high initial potential energy.",
      xpReward: 200,
      validate: (telemetry) => {
        const e = Math.abs(Number(telemetry?.totalEnergy) || 0);
        if (e >= 0.50) {
          return { success: true, progress: 100, message: `Mechanical energy verified! E = ${e.toFixed(3)} J.` };
        }
        const prog = Math.min(95, Math.round((e / 0.50) * 100));
        return { success: false, progress: prog, message: `Total energy: ${e.toFixed(3)} J. Target: ≥ 0.50 J.` };
      }
    }
  ],

  electric: [
    {
      id: "electric_m1",
      expId: "electric",
      tier: "beginner",
      title: "Probe the Field",
      badge: "⚡",
      description: "Move the yellow test probe within 0.35 m of a source charge to measure field strength |E| ≥ 12.0 N/C.",
      targetCondition: "Measured Field Strength |E| ≥ 12.0 N/C",
      hint: "Electric field strength follows inverse-square law: E ∝ 1/r². Closer proximity produces stronger field.",
      xpReward: 50,
      validate: (telemetry) => {
        const e = Math.abs(Number(telemetry?.electricFieldMag) || 0);
        if (e >= 12.0) {
          return { success: true, progress: 100, message: `Field intensity detected! |E| = ${e.toFixed(1)} N/C.` };
        }
        const prog = Math.min(95, Math.round((e / 12.0) * 100));
        return { success: false, progress: prog, message: `Field magnitude: ${e.toFixed(1)} N/C. Target: ≥ 12.0 N/C.` };
      }
    },
    {
      id: "electric_m2",
      expId: "electric",
      tier: "intermediate",
      title: "Dipole Field Bridge",
      badge: "🔋",
      description: "Set q1 = +3.0 μC and q2 = -3.0 μC. Place the probe between them where field vectors add constructively.",
      targetCondition: "Charges +3.0 μC & -3.0 μC with Field |E| ≥ 25.0 N/C",
      hint: "Between opposite charges, the outward vector from (+) points in the exact same direction as the inward vector to (-).",
      xpReward: 100,
      validate: (telemetry, physicsState) => {
        const q1 = Number(physicsState?.charge1Q ?? telemetry?.charge1Q) || 0;
        const q2 = Number(physicsState?.charge2Q ?? telemetry?.charge2Q) || 0;
        const e = Math.abs(Number(telemetry?.electricFieldMag) || 0);
        const chargesOk = q1 > 2.0 && q2 < -2.0;

        if (chargesOk && e >= 25.0) {
          return { success: true, progress: 100, message: `Dipole bridge mapped! Constructive field: ${e.toFixed(1)} N/C.` };
        }
        let prog = chargesOk ? 50 : 25;
        if (e >= 25.0) prog += 50;
        return { success: false, progress: prog, message: `Charges: q1=${q1}μC, q2=${q2}μC (need +3/-3), Field: ${e.toFixed(1)} N/C (need 25 N/C).` };
      }
    },
    {
      id: "electric_m3",
      expId: "electric",
      tier: "expert",
      title: "Find the Null Point",
      badge: "🧲",
      description: "Set identical like charges q1 = q2 = +3.0 μC and locate the central null point where net field |E| ≤ 0.5 N/C.",
      targetCondition: "Like Charges q1 = q2 & Net Field |E| ≤ 0.5 N/C",
      hint: "At the exact midpoint between equal like charges, opposing electric field vectors cancel out completely to zero.",
      xpReward: 200,
      validate: (telemetry, physicsState) => {
        const q1 = Number(physicsState?.charge1Q ?? telemetry?.charge1Q) || 0;
        const q2 = Number(physicsState?.charge2Q ?? telemetry?.charge2Q) || 0;
        const e = Math.abs(Number(telemetry?.electricFieldMag) || 0);
        const likeCharges = q1 > 1.5 && q2 > 1.5 && Math.abs(q1 - q2) < 0.5;

        if (likeCharges && e <= 0.5) {
          return { success: true, progress: 100, message: `Null equilibrium discovered! Opposing vectors canceled: |E| = ${e.toFixed(2)} N/C.` };
        }
        return { success: false, progress: likeCharges ? (e < 3.0 ? 80 : 50) : 25, message: `Like charges: ${likeCharges ? 'Yes' : 'No'}, Field at probe: ${e.toFixed(2)} N/C (target ≤ 0.5 N/C).` };
      }
    }
  ],

  wave: [
    {
      id: "wave_m1",
      expId: "wave",
      tier: "beginner",
      title: "Constructive Crests",
      badge: "🌊",
      description: "Slide phase difference Δφ to 0° (in-phase) to achieve constructive doubling with A_res ≥ 2.8 m.",
      targetCondition: "Phase Shift Δφ ≈ 0° & Resultant Amplitude A_res ≥ 2.8 m",
      hint: "When waves are in-phase, crest aligns with crest and resultant amplitude doubles: A_res = A1 + A2.",
      xpReward: 50,
      validate: (telemetry) => {
        const a = Number(telemetry?.waveResultantAmp) || 0;
        const reg = telemetry?.waveRegime || "intermediate";
        if (reg === "constructive" && a >= 2.8) {
          return { success: true, progress: 100, message: `Constructive interference verified! A_res = ${a.toFixed(2)} m.` };
        }
        const prog = Math.min(95, Math.round((a / 2.8) * 100));
        return { success: false, progress: prog, message: `Resultant amplitude: ${a.toFixed(2)} m. Target: ≥ 2.8 m (in-phase).` };
      }
    },
    {
      id: "wave_m2",
      expId: "wave",
      tier: "intermediate",
      title: "Destructive Annihilation",
      badge: "🔇",
      description: "Slide phase difference Δφ to 180° (out-of-phase) to cancel both waves down to A_res ≤ 0.2 m.",
      targetCondition: "Phase Shift Δφ ≈ 180° & Resultant Amplitude A_res ≤ 0.2 m",
      hint: "At 180° phase difference, wave crests meet troughs. If A1 = A2, they cancel completely to a flat line.",
      xpReward: 100,
      validate: (telemetry) => {
        const a = Number(telemetry?.waveResultantAmp) || 0;
        const reg = telemetry?.waveRegime || "intermediate";
        if (reg === "destructive" && a <= 0.25) {
          return { success: true, progress: 100, message: `Destructive cancellation achieved! Waves canceled to ${a.toFixed(2)} m.` };
        }
        const prog = a > 1.0 ? 25 : Math.round((1 - a / 1.0) * 100);
        return { success: false, progress: prog, message: `Resultant amplitude: ${a.toFixed(2)} m (target ≤ 0.2 m). Slide phase to 180°.` };
      }
    },
    {
      id: "wave_m3",
      expId: "wave",
      tier: "expert",
      title: "Frequency & Amplitude Tuning",
      badge: "🎛️",
      description: "Set A1 = 1.5 m, A2 = 1.5 m, frequency = 1.5 Hz, and verify maximum constructive peak A_res = 3.0 m.",
      targetCondition: "A1 = A2 = 1.5 m & A_res ≥ 2.95 m",
      hint: "Adjust both wave amplitudes to maximum in the HUD and keep phase difference at 0°.",
      xpReward: 200,
      validate: (telemetry) => {
        const a = Number(telemetry?.waveResultantAmp) || 0;
        if (a >= 2.95) {
          return { success: true, progress: 100, message: `Maximum superposition power achieved! A_res = ${a.toFixed(2)} m.` };
        }
        const prog = Math.min(95, Math.round((a / 3.0) * 100));
        return { success: false, progress: prog, message: `Current amplitude: ${a.toFixed(2)} m. Target: 3.0 m.` };
      }
    }
  ],

  optics: [
    {
      id: "optics_m1",
      expId: "optics",
      tier: "beginner",
      title: "Law of Reflection",
      badge: "🪞",
      description: "Set incident angle θ1 to 35° and verify reflected ray angle θ_r equals 35°.",
      targetCondition: "Incident Angle = Reflected Angle = 35°",
      hint: "The Law of Reflection states the angle of reflection strictly equals the angle of incidence: θ_r = θ1.",
      xpReward: 50,
      validate: (telemetry, physicsState) => {
        const i = Number(physicsState?.opticsIncidentAngle ?? telemetry?.opticsIncidentAngle) || 0;
        if (Math.abs(i - 35) <= 2) {
          return { success: true, progress: 100, message: `Reflection verified! Incident: ${i.toFixed(1)}°, Reflected: ${i.toFixed(1)}°.` };
        }
        const prog = Math.max(20, Math.round(100 - Math.abs(i - 35) * 2));
        return { success: false, progress: prog, message: `Current incident angle: ${i.toFixed(0)}°. Target: 35°.` };
      }
    },
    {
      id: "optics_m2",
      expId: "optics",
      tier: "intermediate",
      title: "Snell's Law Bending",
      badge: "📐",
      description: "With Medium 1 = Air (1.00) and Medium 2 = Glass (1.50), set θ1 = 45° to observe refraction to θ2 ≈ 28.1°.",
      targetCondition: "Air into Glass at θ1 = 45° & Refracted Angle θ2 = 28.1 ± 1.5°",
      hint: "Snell's law: n1·sin(θ1) = n2·sin(θ2). Light slows down in denser medium and bends toward the normal line.",
      xpReward: 100,
      validate: (telemetry, physicsState) => {
        const i = Number(physicsState?.opticsIncidentAngle ?? telemetry?.opticsIncidentAngle) || 0;
        const refr = Number(physicsState?.opticsRefractAngle ?? telemetry?.opticsRefractAngle) || 0;
        const isTIR = Boolean(physicsState?.isTIR ?? telemetry?.isTIR);

        if (!isTIR && Math.abs(i - 45) <= 3 && Math.abs(refr - 28.1) <= 2) {
          return { success: true, progress: 100, message: `Snell's Law verified! θ1 = 45°, θ2 = ${refr.toFixed(1)}°.` };
        }
        return { success: false, progress: Math.abs(i - 45) <= 3 ? 60 : 30, message: `Current θ1: ${i.toFixed(0)}° (need 45°), θ2: ${refr.toFixed(1)}° (need ~28.1°).` };
      }
    },
    {
      id: "optics_m3",
      expId: "optics",
      tier: "expert",
      title: "Total Internal Reflection",
      badge: "💎",
      description: "Set Medium 1 to Glass (1.50) and Medium 2 to Air (1.00). Increase θ1 ≥ 45° to trigger Total Internal Reflection.",
      targetCondition: "n1 = 1.50, n2 = 1.00, θ1 > θ_c (41.8°) -> Total Internal Reflection",
      hint: "When entering a rarer medium above critical angle θ_c = arcsin(n2/n1), zero light refracts; 100% reflects!",
      xpReward: 200,
      validate: (telemetry, physicsState) => {
        const isTIR = Boolean(physicsState?.isTIR ?? telemetry?.isTIR);
        const n1 = Number(physicsState?.opticsN1 ?? telemetry?.opticsN1) || 1.0;
        const n2 = Number(physicsState?.opticsN2 ?? telemetry?.opticsN2) || 1.5;

        if (isTIR && n1 > n2) {
          return { success: true, progress: 100, message: `Total Internal Reflection achieved! Light is 100% trapped inside medium 1.` };
        }
        return { success: false, progress: n1 > n2 ? 50 : 20, message: `Medium 1: ${n1.toFixed(2)}, Medium 2: ${n2.toFixed(2)}. Make n1 > n2 and angle > 42°.` };
      }
    }
  ],

  incline: [
    {
      id: "incline_m1",
      expId: "incline",
      tier: "beginner",
      title: "Static Equilibrium Hold",
      badge: "🛑",
      description: "Set ramp angle θ ≤ 15° where static friction holds the block completely at rest.",
      targetCondition: "Ramp Angle θ ≤ 15° & Block at Rest",
      hint: "When tan(θ) ≤ μ_s, static friction counterbalances downslope gravity pull. Acceleration remains 0.",
      xpReward: 50,
      validate: (telemetry, physicsState) => {
        const ang = Number(physicsState?.inclineAngle ?? telemetry?.inclineAngle) || 0;
        const slipping = Boolean(physicsState?.inclineIsSlipping ?? telemetry?.inclineIsSlipping);
        if (ang <= 15 && !slipping) {
          return { success: true, progress: 100, message: `Static equilibrium holds! Block is stationary at ${ang.toFixed(0)}°.` };
        }
        return { success: false, progress: Math.max(10, 100 - ang * 3), message: `Ramp angle: ${ang.toFixed(0)}°. Keep angle ≤ 15°.` };
      }
    },
    {
      id: "incline_m2",
      expId: "incline",
      tier: "intermediate",
      title: "Slip Threshold Breakthrough",
      badge: "⚡",
      description: "Increase tilt angle beyond the critical slip angle θ_c = arctan(μ_s) ≈ 24.2° to trigger sliding.",
      targetCondition: "θ > Critical Angle (24.2°) & Incline Slipping Active",
      hint: "As slope angle increases, downslope gravity (mg sin θ) exceeds maximum static friction (μ_s mg cos θ).",
      xpReward: 100,
      validate: (telemetry, physicsState) => {
        const ang = Number(physicsState?.inclineAngle ?? telemetry?.inclineAngle) || 0;
        const slipping = Boolean(physicsState?.inclineIsSlipping ?? telemetry?.inclineIsSlipping);
        if (slipping && ang >= 25) {
          return { success: true, progress: 100, message: `Critical threshold broken! Block is accelerating down slope at ${ang.toFixed(0)}°.` };
        }
        return { success: false, progress: Math.min(85, Math.round((ang / 25) * 85)), message: `Current angle: ${ang.toFixed(0)}°. Increase angle above 25° to break static friction.` };
      }
    },
    {
      id: "incline_m3",
      expId: "incline",
      tier: "expert",
      title: "High-Acceleration Descent",
      badge: "⛷️",
      description: "Configure ramp angle θ ≥ 35° to achieve downhill acceleration a ≥ 2.5 m/s².",
      targetCondition: "Ramp Angle ≥ 35° & Downslope Acceleration a ≥ 2.5 m/s²",
      hint: "By Newton's 2nd Law on incline: a = g·(sin θ - μ_k·cos θ). Steeper angles increase net downward force.",
      xpReward: 200,
      validate: (telemetry, physicsState) => {
        const ang = Number(physicsState?.inclineAngle ?? telemetry?.inclineAngle) || 0;
        const a = Math.abs(Number(telemetry?.inclineAccel || telemetry?.acceleration) || 0);
        if (ang >= 35 && a >= 2.5) {
          return { success: true, progress: 100, message: `Descent acceleration verified! a = ${a.toFixed(2)} m/s² at ${ang.toFixed(0)}°.` };
        }
        const prog = Math.min(95, Math.round((a / 2.5) * 100));
        return { success: false, progress: prog, message: `Acceleration: ${a.toFixed(2)} m/s² (need ≥ 2.5), Angle: ${ang.toFixed(0)}° (need ≥ 35°).` };
      }
    }
  ]
};

export const QUEST_PREDICTIONS = {
  newton: {
    id: "newton_p1",
    expId: "newton",
    question: "If you double the mass of an object from 1.0 kg to 2.0 kg while keeping the applied net force constant at 4.0 N, what happens to its acceleration?",
    options: [
      { id: "A", text: "Acceleration doubles (becomes 8.0 m/s²)", isCorrect: false },
      { id: "B", text: "Acceleration is halved (becomes 2.0 m/s²)", isCorrect: true },
      { id: "C", text: "Acceleration remains unchanged (4.0 m/s²)", isCorrect: false },
      { id: "D", text: "Acceleration drops to exactly zero", isCorrect: false }
    ],
    scientificExplanation: "By Newton's Second Law (a = F_net / m), acceleration is inversely proportional to mass. Doubling the inertial mass cuts the resulting acceleration exactly in half."
  },

  impulse: {
    id: "impulse_p1",
    expId: "impulse",
    question: "Two different collisions deliver the same total impulse J = 2.0 N·s to a 0.5 kg ball: Collision A lasts 0.05 s, while Collision B lasts 0.50 s. How do their final changes in momentum (Δp) compare?",
    options: [
      { id: "A", text: "Collision A produces 10× greater momentum change", isCorrect: false },
      { id: "B", text: "Collision B produces 10× greater momentum change", isCorrect: false },
      { id: "C", text: "Both produce the exact same momentum change (Δp = 2.0 kg·m/s)", isCorrect: true },
      { id: "D", text: "Neither produces any momentum change", isCorrect: false }
    ],
    scientificExplanation: "By the Impulse-Momentum Theorem (J = ∫ F dt = Δp), impulse equals the change in momentum directly. Even though Collision A has 10× higher peak force, its contact time is 10× shorter, yielding identical total momentum change."
  },

  hooke: {
    id: "hooke_p1",
    expId: "hooke",
    question: "If you double the displacement of a spring from Δx = 0.10 m to Δx = 0.20 m, by what factor does the stored elastic potential energy (U_s) increase?",
    options: [
      { id: "A", text: "Doubles (2×)", isCorrect: false },
      { id: "B", text: "Quadruples (4×)", isCorrect: true },
      { id: "C", text: "Remains constant", isCorrect: false },
      { id: "D", text: "Increases by √2 (~1.41×)", isCorrect: false }
    ],
    scientificExplanation: "Elastic potential energy is given by U_s = 1/2 k (Δx)². Because displacement is squared, doubling Δx multiplies the stored energy by (2)² = 4 times!"
  },

  collision: {
    id: "collision_p1",
    expId: "collision",
    question: "In a 1D elastic collision, Cart 1 (m = 1.0 kg, v = 4.0 m/s) collides head-on with identical Cart 2 (m = 1.0 kg) at rest. What is Cart 1's velocity immediately after impact?",
    options: [
      { id: "A", text: "Cart 1 stops completely (v1' = 0 m/s)", isCorrect: true },
      { id: "B", text: "Cart 1 rebounds backwards at -4.0 m/s", isCorrect: false },
      { id: "C", text: "Cart 1 continues forward at 2.0 m/s", isCorrect: false },
      { id: "D", text: "Cart 1 and Cart 2 stick together at 2.0 m/s", isCorrect: false }
    ],
    scientificExplanation: "When two identical masses collide elastically with one at rest, conservation of both momentum and kinetic energy guarantees a 100% velocity exchange: Cart 1 comes to a dead stop while Cart 2 shoots forward at Cart 1's initial speed."
  },

  projectile: {
    id: "projectile_p1",
    expId: "projectile",
    question: "On flat ground with negligible air resistance, what launch angle θ maximizes the horizontal landing range R?",
    options: [
      { id: "A", text: "30°", isCorrect: false },
      { id: "B", text: "45°", isCorrect: true },
      { id: "C", text: "60°", isCorrect: false },
      { id: "D", text: "90° (straight up)", isCorrect: false }
    ],
    scientificExplanation: "Horizontal range is given by R = (v0² · sin(2θ)) / g. The term sin(2θ) reaches its mathematical maximum of 1.0 when 2θ = 90°, which means θ = 45°."
  },

  pendulum: {
    id: "pendulum_p1",
    expId: "pendulum",
    question: "If you double the bob mass of a simple pendulum from 0.5 kg to 1.0 kg while keeping string length constant, what happens to the period of small-angle oscillation T?",
    options: [
      { id: "A", text: "Period doubles (2×)", isCorrect: false },
      { id: "B", text: "Period remains completely unchanged", isCorrect: true },
      { id: "C", text: "Period is halved (1/2)", isCorrect: false },
      { id: "D", text: "Period increases by √2", isCorrect: false }
    ],
    scientificExplanation: "The small-angle pendulum period formula is T = 2π√(L/g). The bob mass m cancels out of the equations of motion (greater mass has more gravitational restoring force, but also proportionately more inertia), so mass has zero effect on period!"
  },

  electric: {
    id: "electric_p1",
    expId: "electric",
    question: "According to Coulomb's Law, if you double the distance r between a test probe and a point charge, what happens to the electric field strength E?",
    options: [
      { id: "A", text: "Field strength halves (1/2)", isCorrect: false },
      { id: "B", text: "Field strength decreases to one-fourth (1/4)", isCorrect: true },
      { id: "C", text: "Field strength doubles (2×)", isCorrect: false },
      { id: "D", text: "Field strength remains constant", isCorrect: false }
    ],
    scientificExplanation: "Coulomb's Law states E = k·q / r². Because distance is squared in the denominator, doubling distance divides the field intensity by (2)² = 4 times."
  },

  wave: {
    id: "wave_p1",
    expId: "wave",
    question: "When two identical sinusoidal waves with amplitude A travel in the same medium, what phase difference Δφ produces complete destructive interference (zero net amplitude)?",
    options: [
      { id: "A", text: "0° (0 rad)", isCorrect: false },
      { id: "B", text: "90° (π/2 rad)", isCorrect: false },
      { id: "C", text: "180° (π rad)", isCorrect: true },
      { id: "D", text: "360° (2π rad)", isCorrect: false }
    ],
    scientificExplanation: "At a phase difference of 180° (π radians), the crest of Wave 1 aligns precisely with the trough of Wave 2 at every single coordinate point. By the superposition principle, y_res = A + (-A) = 0."
  },

  optics: {
    id: "optics_p1",
    expId: "optics",
    question: "When a light ray travels from an optically denser medium (Glass n = 1.50) into a rarer medium (Air n = 1.00) at an incident angle greater than the critical angle θ_c ≈ 41.8°, what happens?",
    options: [
      { id: "A", text: "All light refracts into air at 90°", isCorrect: false },
      { id: "B", text: "100% of light undergoes Total Internal Reflection back into the glass", isCorrect: true },
      { id: "C", text: "The light ray is completely absorbed and vanishes", isCorrect: false },
      { id: "D", text: "The light splits into rainbow colors without reflection", isCorrect: false }
    ],
    scientificExplanation: "By Snell's Law, when light travels from higher to lower index and sin(θ1) > n2/n1, no real angle of refraction exists. Instead, Total Internal Reflection occurs with 100% of energy reflecting back into the dense medium."
  },

  incline: {
    id: "incline_p1",
    expId: "incline",
    question: "A block rests on an incline with static friction coefficient μ_s = 0.50. At what critical angle θ_c will the block begin to slide?",
    options: [
      { id: "A", text: "θ_c = arcsin(0.50) = 30.0°", isCorrect: false },
      { id: "B", text: "θ_c = arctan(0.50) ≈ 26.6°", isCorrect: true },
      { id: "C", text: "θ_c = arccos(0.50) = 60.0°", isCorrect: false },
      { id: "D", text: "θ_c = 0.50 × 90° = 45.0°", isCorrect: false }
    ],
    scientificExplanation: "At the slip threshold, downhill gravity equals maximum static friction: mg sin θ = μ_s mg cos θ. Dividing both sides by mg cos θ gives tan θ = μ_s, so the critical slipping angle is θ_c = arctan(μ_s) = arctan(0.50) ≈ 26.6°."
  }
};
