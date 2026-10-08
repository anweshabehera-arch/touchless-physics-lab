import React, { useEffect, useRef, useState, useCallback } from "react";
import "./App.css";
import "./components/HandForceLab/HandForceLab.css";
import * as THREE from "three";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import PhysicsAssistant from "./components/PhysicsAssistant/PhysicsAssistant";
import LivePhysicsHUD from "./components/HandForceLab/LivePhysicsHUD";
import PhysicsActionChain from "./components/HandForceLab/PhysicsActionChain";
import RealTimeExplanation from "./components/HandForceLab/RealTimeExplanation";
import LearnPanel from "./components/HandForceLab/LearnPanel";
import PhysicsEventTimeline from "./components/HandForceLab/PhysicsEventTimeline";
import { evaluatePhysicsEvents } from "./services/physicsEventEngine";

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // User Experiment Settings
  const [mass, setMass] = useState(1.0); // kg
  const [isPaused, setIsPaused] = useState(false);
  const [showVectors, setShowVectors] = useState(true);
  const [showInvisible, setShowInvisible] = useState(true);
  const [explainVoice, setExplainVoice] = useState(false);

  // Live HUD & Action Chain React State (updated at throttled intervals for high FPS)
  const [physicsState, setPhysicsState] = useState({
    force: 0,
    acceleration: 0,
    velocity: 0,
    vx: 0,
    vy: 0,
    posX: 0,
    posY: 0,
    momentum: 0,
    kineticEnergy: 0,
    interactionRadius: 0.55
  });

  const [activeGesture, setActiveGesture] = useState("NONE"); // 'PINCH', 'MOVE_HAND', 'FAST_MOTION', 'FIST', 'NONE'
  const [actionChain, setActionChain] = useState({
    isHandMoving: false,
    isForceApplied: false,
    isAccelerating: false,
    isVelocityChanging: false,
    isBallMoving: false
  });
  const [explanation, setExplanation] = useState("Move your hand toward the ball to apply an external push force.");
  const [formulaTag, setFormulaTag] = useState("F = m · a");
  const [eventsList, setEventsList] = useState([]);

  // Telemetry Ref for AI Assistant & Event Engine (zero re-render latency)
  const telemetryRef = useRef({
    experimentName: "Hand-Force Lab",
    mass: 1.0,
    force: 0,
    acceleration: 0,
    velocity: 0,
    vx: 0,
    vy: 0,
    posX: 0,
    posY: 0,
    displacement: 0,
    momentum: 0,
    kineticEnergy: 0,
    handSpeed: 0,
    time: 0,
    isFrozen: false
  });

  // Reference for callbacks into the running simulation
  const simControlsRef = useRef({
    resetBall: null,
    setMassRef: null,
    setIsPausedRef: null,
    setShowVectorsRef: null,
    setShowInvisibleRef: null,
    setVoiceRef: null
  });

  // Safe snapshot getter for Dr. Nova AI
  const getLabSnapshot = useCallback(() => {
    return {
      experimentName: "Hand-Force Lab",
      mass: telemetryRef.current.mass,
      estimatedForce: telemetryRef.current.force,
      estimatedAcceleration: telemetryRef.current.acceleration,
      averageVelocity: telemetryRef.current.velocity,
      displacement: telemetryRef.current.displacement,
      particleCount: 1, // Focus is the main educational ball
      time: telemetryRef.current.time,
      handSpeed: telemetryRef.current.handSpeed,
      isFrozen: telemetryRef.current.isFrozen,
      recentEventsCount: eventsList.length
    };
  }, [eventsList.length]);

  // Handle Mass Change
  const handleMassChange = (newMass) => {
    const clamped = Math.max(0.2, Math.min(5.0, Number(newMass)));
    setMass(clamped);
    if (simControlsRef.current.setMassRef) {
      simControlsRef.current.setMassRef(clamped);
    }
  };

  // Handle Reset Ball
  const handleResetBall = () => {
    if (simControlsRef.current.resetBall) {
      simControlsRef.current.resetBall();
    }
  };

  // Handle Toggle Pause
  const handleTogglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      if (simControlsRef.current.setIsPausedRef) {
        simControlsRef.current.setIsPausedRef(next);
      }
      return next;
    });
  };

  // Sync settings into simulation
  useEffect(() => {
    simControlsRef.current.setShowVectorsRef?.(showVectors);
  }, [showVectors]);

  useEffect(() => {
    simControlsRef.current.setShowInvisibleRef?.(showInvisible);
  }, [showInvisible]);

  useEffect(() => {
    simControlsRef.current.setVoiceRef?.(explainVoice);
  }, [explainVoice]);

  // Main Three.js + MediaPipe Simulation Lifecycle
  useEffect(() => {
    let stream;
    let animationId;
    let handLandmarker;
    let destroyed = false;

    // Simulation Physics State
    const ballState = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: 0,
      mass: 1.0,
      radius: 0.08,
      interactionRadius: 0.55
    };

    let simPaused = false;
    let currentShowVectors = showVectors;
    let currentShowInvisible = showInvisible;
    let currentVoiceEnabled = explainVoice;
    let totalSimTime = 0;
    let totalDisplacement = 0;

    // Expose control handlers
    simControlsRef.current.setMassRef = (m) => {
      ballState.mass = m;
    };
    simControlsRef.current.setIsPausedRef = (p) => {
      simPaused = p;
    };
    simControlsRef.current.setShowVectorsRef = (v) => {
      currentShowVectors = v;
    };
    simControlsRef.current.setShowInvisibleRef = (inv) => {
      currentShowInvisible = inv;
    };
    simControlsRef.current.setVoiceRef = (voc) => {
      currentVoiceEnabled = voc;
    };
    simControlsRef.current.resetBall = () => {
      ballState.x = 0;
      ballState.y = 0;
      ballState.vx = 0;
      ballState.vy = 0;
      ballState.ax = 0;
      ballState.ay = 0;
      totalDisplacement = 0;
    };

    const start = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      // =====================================================
      // 1. CAMERA STREAM
      // =====================================================
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720,
            facingMode: "user"
          },
          audio: false
        });

        if (destroyed) return;
        video.srcObject = stream;

        await new Promise((resolve) => {
          if (video.readyState >= 1) resolve();
          else video.onloadedmetadata = resolve;
        });

        await video.play();
      } catch (err) {
        console.error("Camera access error:", err);
      }

      if (destroyed) return;

      // =====================================================
      // 2. THREE.JS SCENE SETUP
      // =====================================================
      const scene = new THREE.Scene();
      const aspect = window.innerWidth / window.innerHeight;

      const camera = new THREE.OrthographicCamera(
        -aspect,
        aspect,
        1,
        -1,
        0.1,
        10
      );
      camera.position.z = 1;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

      // =====================================================
      // 3. THE EDUCATIONAL OBJECT: ONE MAIN GLOWING BALL
      // =====================================================
      const ballGroup = new THREE.Group();

      // Core bright sphere
      const ballCore = new THREE.Mesh(
        new THREE.SphereGeometry(ballState.radius * 0.65, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      ballGroup.add(ballCore);

      // Main cyan body sphere
      const ballBody = new THREE.Mesh(
        new THREE.SphereGeometry(ballState.radius, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0x38d9ff,
          transparent: true,
          opacity: 0.85
        })
      );
      ballGroup.add(ballBody);

      // Outer glowing energy aura
      const ballAura = new THREE.Mesh(
        new THREE.SphereGeometry(ballState.radius * 1.6, 24, 24),
        new THREE.MeshBasicMaterial({
          color: 0x167cff,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      ballGroup.add(ballAura);

      scene.add(ballGroup);

      // =====================================================
      // 4. VISUAL VECTORS ("SHOW THE INVISIBLE")
      // =====================================================
      // Force Arrow (Coral / Red)
      const forceArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0, 0),
        0.001,
        0xff5555,
        0.06,
        0.04
      );
      scene.add(forceArrow);

      // Velocity Arrow (Emerald / Green)
      const velocityArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0, 0),
        0.001,
        0x31f2a1,
        0.06,
        0.04
      );
      scene.add(velocityArrow);

      // Acceleration Arrow (Amber / Yellow)
      const accelArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0, 0),
        0.001,
        0xffbb33,
        0.06,
        0.04
      );
      scene.add(accelArrow);

      // Hand Interaction Radius Ring
      const handRadiusRing = new THREE.Mesh(
        new THREE.RingGeometry(0.53, 0.55, 64),
        new THREE.MeshBasicMaterial({
          color: 0x38d9ff,
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        })
      );
      handRadiusRing.visible = false;
      scene.add(handRadiusRing);

      // Shockwave ring for fast motion gesture
      const shockwaveMesh = new THREE.Mesh(
        new THREE.RingGeometry(0.02, 0.05, 48),
        new THREE.MeshBasicMaterial({
          color: 0x38d9ff,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        })
      );
      shockwaveMesh.visible = false;
      scene.add(shockwaveMesh);
      let shockwaveScale = 0.05;
      let shockwaveOpacity = 0;

      // Ball Motion Trail Line Ribbon
      const TRAIL_LENGTH = 35;
      const trailPositions = new Float32Array(TRAIL_LENGTH * 3);
      for (let i = 0; i < TRAIL_LENGTH * 3; i++) trailPositions[i] = 0;
      const trailGeometry = new THREE.BufferGeometry();
      trailGeometry.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
      const trailLine = new THREE.Line(
        trailGeometry,
        new THREE.LineBasicMaterial({
          color: 0x38d9ff,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending
        })
      );
      scene.add(trailLine);
      let trailIndex = 0;

      // Ambient background particles for laboratory depth
      const AMBIENT_COUNT = 300;
      const ambientPositions = new Float32Array(AMBIENT_COUNT * 3);
      for (let i = 0; i < AMBIENT_COUNT; i++) {
        ambientPositions[i * 3] = (Math.random() - 0.5) * aspect * 2;
        ambientPositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
        ambientPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      }
      const ambientGeometry = new THREE.BufferGeometry();
      ambientGeometry.setAttribute("position", new THREE.BufferAttribute(ambientPositions, 3));
      const ambientParticles = new THREE.Points(
        ambientGeometry,
        new THREE.PointsMaterial({
          color: 0x38d9ff,
          size: 4,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending
        })
      );
      scene.add(ambientParticles);

      // =====================================================
      // 5. HAND TRACKING STATE & DETECTOR
      // =====================================================
      let detectedHands = [];
      let previousHands = [];
      let fistActive = false;
      let lastHandCheck = 0;

      const detectHands = () => {
        if (!handLandmarker || video.readyState < 2) return;

        try {
          const result = handLandmarker.detectForVideo(video, performance.now());
          if (!result.landmarks || result.landmarks.length === 0) {
            detectedHands = [];
            previousHands = [];
            fistActive = false;
            return;
          }

          const currentList = [];

          for (let h = 0; h < result.landmarks.length; h++) {
            const lm = result.landmarks[h];
            const wrist = lm[0];
            const thumb = lm[4];
            const index = lm[8];
            const middle = lm[12];
            const palm = lm[9];

            // 1. Fist Detection (finger distance to wrist)
            const fistDist = Math.sqrt(
              Math.pow(wrist.x - middle.x, 2) + Math.pow(wrist.y - middle.y, 2)
            );
            const isFist = fistDist < 0.22;

            // 2. Pinch Detection (thumb to index distance)
            const pinchDist = Math.sqrt(
              Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2)
            );

            // 3. Normalized Three.js coordinate mapping
            const x = (0.5 - (wrist.x + palm.x) / 2) * aspect * 2;
            const y = (0.5 - (wrist.y + palm.y) / 2) * 2;

            currentList.push({
              x,
              y,
              isFist,
              pinchDistance: pinchDist
            });
          }

          detectedHands = currentList;
          fistActive = detectedHands.some((h) => h.isFist);
        } catch (err) {
          console.error("Hand tracking detection error:", err);
        }
      };

      // =====================================================
      // 6. MAIN SIMULATION & ANIMATION LOOP
      // =====================================================
      let lastTime = performance.now();
      let lastThrottleUpdate = 0;

      const animate = () => {
        if (destroyed) return;
        animationId = requestAnimationFrame(animate);

        const now = performance.now();
        const dt = Math.min(0.033, (now - lastTime) * 0.001);
        lastTime = now;
        totalSimTime += dt;

        // Run hand detection at 25-30 FPS for smooth performance
        if (handLandmarker && now - lastHandCheck > 35) {
          lastHandCheck = now;
          detectHands();
        }

        // Evaluate Hand Movements & Forces
        let appliedForceX = 0;
        let appliedForceY = 0;
        let maxHandSpeed = 0;
        let currentGesture = "NONE";
        let isFastImpulse = false;

        if (detectedHands.length > 0) {
          // Primary Hand
          const primaryHand = detectedHands[0];
          const prevHand = previousHands[0];

          if (prevHand) {
            const hvx = primaryHand.x - prevHand.x;
            const hvy = primaryHand.y - prevHand.y;
            maxHandSpeed = Math.sqrt(hvx * hvx + hvy * hvy);
          }

          // Gesture 1: FIST ✊
          if (fistActive) {
            currentGesture = "FIST";
          }
          // Gesture 2: PINCH 🤏
          else if (primaryHand.pinchDistance < 0.08) {
            currentGesture = "PINCH";
            // Modulate interaction radius smoothly
            const normPinch = Math.max(0, Math.min(1, (primaryHand.pinchDistance - 0.02) / 0.06));
            ballState.interactionRadius = THREE.MathUtils.lerp(0.35, 0.70, normPinch);
          }
          // Gesture 3: FAST MOTION 💨
          else if (maxHandSpeed > 0.018) {
            currentGesture = "FAST_MOTION";
            isFastImpulse = true;
            shockwaveMesh.position.set(primaryHand.x, primaryHand.y, 0);
            shockwaveMesh.visible = true;
            shockwaveScale = 0.04;
            shockwaveOpacity = Math.min(1.0, maxHandSpeed * 25);
          }
          // Gesture 4: MOVE HAND 🖐️
          else {
            currentGesture = "MOVE_HAND";
          }

          // Calculate Physical Force applied by Hand to Ball
          const dx = ballState.x - primaryHand.x;
          const dy = ballState.y - primaryHand.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < ballState.interactionRadius && dist > 0.005) {
            const dirX = dx / dist;
            const dirY = dy / dist;

            // Proximity force: increases as distance to ball decreases
            const proximityFactor = 1 - dist / ballState.interactionRadius;
            const basePush = proximityFactor * 3.8;

            // Motion-induced force: fast movement creates higher force
            const speedPush = maxHandSpeed * 50.0;

            // Impulse boost if fast motion triggered
            const impulseBoost = isFastImpulse ? maxHandSpeed * 75.0 : 0;

            const totalForceMag = basePush + speedPush + impulseBoost;

            appliedForceX = dirX * totalForceMag;
            appliedForceY = dirY * totalForceMag;
          }

          // Position Hand Radius Ring
          if (currentShowInvisible) {
            handRadiusRing.position.set(primaryHand.x, primaryHand.y, 0);
            const ringScale = ballState.interactionRadius / 0.55;
            handRadiusRing.scale.set(ringScale, ringScale, 1);
            handRadiusRing.visible = true;
          } else {
            handRadiusRing.visible = false;
          }

          previousHands = detectedHands.map((h) => ({ x: h.x, y: h.y }));
        } else {
          handRadiusRing.visible = false;
        }

        // =====================================================
        // 7. NEWTON'S SECOND LAW & KINEMATICS INTEGRATION
        // F = m · a  ==>  a = F / m
        // =====================================================
        let isWallHit = false;

        const effectiveFrozen = fistActive || simPaused;

        if (!effectiveFrozen) {
          // Viscous drag resistance (friction)
          const dragCoeff = 0.75;
          const dragForceX = -dragCoeff * ballState.vx;
          const dragForceY = -dragCoeff * ballState.vy;

          // Net Force = Applied Hand Force + Viscous Friction
          const netForceX = appliedForceX + dragForceX;
          const netForceY = appliedForceY + dragForceY;

          // Acceleration a = F_net / m
          ballState.ax = netForceX / ballState.mass;
          ballState.ay = netForceY / ballState.mass;

          // Velocity integration v(t + dt) = v(t) + a · dt
          ballState.vx += ballState.ax * dt;
          ballState.vy += ballState.ay * dt;

          // Position integration x(t + dt) = x(t) + v · dt
          ballState.x += ballState.vx * dt;
          ballState.y += ballState.vy * dt;

          totalDisplacement += Math.sqrt(
            Math.pow(ballState.vx * dt, 2) + Math.pow(ballState.vy * dt, 2)
          );

          // Boundary Reflection (Screen edges with elastic restitution)
          const limitX = aspect - ballState.radius;
          const limitY = 1.0 - ballState.radius;

          if (ballState.x > limitX) {
            ballState.x = limitX;
            ballState.vx *= -0.82;
            isWallHit = true;
          } else if (ballState.x < -limitX) {
            ballState.x = -limitX;
            ballState.vx *= -0.82;
            isWallHit = true;
          }

          if (ballState.y > limitY) {
            ballState.y = limitY;
            ballState.vy *= -0.82;
            isWallHit = true;
          } else if (ballState.y < -limitY) {
            ballState.y = -limitY;
            ballState.vy *= -0.82;
            isWallHit = true;
          }
        } else {
          // Frozen by fist or pause button
          ballState.ax = 0;
          ballState.ay = 0;
        }

        // =====================================================
        // 8. UPDATE THREE.JS VISUAL OBJECTS
        // =====================================================
        ballGroup.position.set(ballState.x, ballState.y, 0);

        // Animate aura pulsation
        const forceMag = Math.sqrt(appliedForceX * appliedForceX + appliedForceY * appliedForceY);
        const speedMag = Math.sqrt(ballState.vx * ballState.vx + ballState.vy * ballState.vy);
        const accelMag = Math.sqrt(ballState.ax * ballState.ax + ballState.ay * ballState.ay);

        ballAura.scale.setScalar(1.0 + Math.min(0.6, forceMag * 0.12));
        ballAura.material.opacity = 0.25 + Math.min(0.5, forceMag * 0.15);

        // Update Motion Trail
        if (!effectiveFrozen && speedMag > 0.05) {
          const tIdx = (trailIndex % TRAIL_LENGTH) * 3;
          trailPositions[tIdx] = ballState.x;
          trailPositions[tIdx + 1] = ballState.y;
          trailPositions[tIdx + 2] = 0;
          trailGeometry.attributes.position.needsUpdate = true;
          trailIndex++;
        }

        // Shockwave ripple animation
        if (shockwaveOpacity > 0.01) {
          shockwaveScale += 0.03;
          shockwaveMesh.scale.set(shockwaveScale, shockwaveScale, 1);
          shockwaveMesh.material.opacity = shockwaveOpacity;
          shockwaveOpacity *= 0.90;
        } else {
          shockwaveMesh.visible = false;
        }

        // =====================================================
        // 9. UPDATE VECTOR ARROWS ("SHOW THE INVISIBLE")
        // =====================================================
        if (currentShowVectors) {
          const ballPos = new THREE.Vector3(ballState.x, ballState.y, 0);

          // Force Vector (Red)
          if (forceMag > 0.15) {
            const fDir = new THREE.Vector3(appliedForceX, appliedForceY, 0).normalize();
            forceArrow.position.copy(ballPos);
            forceArrow.setDirection(fDir);
            forceArrow.setLength(Math.min(0.6, forceMag * 0.14), 0.06, 0.04);
            forceArrow.visible = true;
          } else {
            forceArrow.visible = false;
          }

          // Velocity Vector (Green)
          if (speedMag > 0.08) {
            const vDir = new THREE.Vector3(ballState.vx, ballState.vy, 0).normalize();
            velocityArrow.position.copy(ballPos);
            velocityArrow.setDirection(vDir);
            velocityArrow.setLength(Math.min(0.55, speedMag * 0.22), 0.06, 0.04);
            velocityArrow.visible = true;
          } else {
            velocityArrow.visible = false;
          }

          // Acceleration Vector (Yellow)
          if (accelMag > 0.2) {
            const aDir = new THREE.Vector3(ballState.ax, ballState.ay, 0).normalize();
            accelArrow.position.copy(ballPos);
            accelArrow.setDirection(aDir);
            accelArrow.setLength(Math.min(0.5, accelMag * 0.12), 0.05, 0.035);
            accelArrow.visible = true;
          } else {
            accelArrow.visible = false;
          }
        } else {
          forceArrow.visible = false;
          velocityArrow.visible = false;
          accelArrow.visible = false;
        }

        // Slowly drift ambient background particles
        ambientParticles.rotation.z = now * 0.0001;

        // Render Frame
        renderer.render(scene, camera);

        // =====================================================
        // 10. THROTTLED TELEMETRY, ACTION CHAIN & EVENT ENGINE
        // Update React HUD every 55ms for high efficiency
        // =====================================================
        if (now - lastThrottleUpdate > 55) {
          lastThrottleUpdate = now;

          const momentumVal = ballState.mass * speedMag;
          const keVal = 0.5 * ballState.mass * speedMag * speedMag;

          // Update Telemetry Ref
          telemetryRef.current = {
            experimentName: "Hand-Force Lab",
            mass: ballState.mass,
            force: Number(forceMag.toFixed(2)),
            acceleration: Number(accelMag.toFixed(2)),
            velocity: Number(speedMag.toFixed(2)),
            vx: Number(ballState.vx.toFixed(2)),
            vy: Number(ballState.vy.toFixed(2)),
            posX: Number(ballState.x.toFixed(2)),
            posY: Number(ballState.y.toFixed(2)),
            displacement: Number(totalDisplacement.toFixed(2)),
            momentum: Number(momentumVal.toFixed(2)),
            kineticEnergy: Number(keVal.toFixed(2)),
            handSpeed: Number(maxHandSpeed.toFixed(3)),
            time: Number(totalSimTime.toFixed(1)),
            isFrozen: effectiveFrozen
          };

          // Update React HUD
          setPhysicsState({
            force: forceMag,
            acceleration: accelMag,
            velocity: speedMag,
            vx: ballState.vx,
            vy: ballState.vy,
            posX: ballState.x,
            posY: ballState.y,
            momentum: momentumVal,
            kineticEnergy: keVal,
            interactionRadius: ballState.interactionRadius
          });

          setActiveGesture(currentGesture);

          // Update Physics Action Chain states
          const isHandMoving = maxHandSpeed > 0.005;
          const isForceApplied = forceMag > 0.15;
          const isAccelerating = accelMag > 0.2;
          const isVelocityChanging = accelMag > 0.25 || isForceApplied;
          const isBallMoving = speedMag > 0.06;

          setActionChain({
            isHandMoving,
            isForceApplied,
            isAccelerating,
            isVelocityChanging,
            isBallMoving
          });

          // Dynamic Cause-and-Effect Pedagogical Explanation
          if (effectiveFrozen) {
            setExplanation("Fist detected ✊: Simulation paused. Object state locked.");
            setFormulaTag("v = 0, a = 0 (Frozen)");
          } else if (isFastImpulse) {
            setExplanation(`💨 Fast motion! Sudden impulse J = Δp exerted ${forceMag.toFixed(1)} N of force.`);
            setFormulaTag("J = F · Δt = Δp");
          } else if (isForceApplied) {
            setExplanation(
              `You pushed the ball with ${forceMag.toFixed(1)} N. Acceleration a = F/m = ${(forceMag / ballState.mass).toFixed(1)} m/s².`
            );
            setFormulaTag("a = F / m");
          } else if (isBallMoving) {
            setExplanation(`Ball is moving at ${speedMag.toFixed(1)} m/s. Friction is gradually dissipating kinetic energy.`);
            setFormulaTag("F_drag = -b · v");
          } else {
            setExplanation("Ball is at rest. Bring your hand closer to apply an external push force.");
            setFormulaTag("Newton's 1st Law (Inertia)");
          }

          // Evaluate Physics Events (Strict evidence threshold)
          const newEvents = evaluatePhysicsEvents(
            {
              force: forceMag,
              acceleration: accelMag,
              velocity: speedMag,
              vx: ballState.vx,
              vy: ballState.vy,
              posX: ballState.x,
              posY: ballState.y,
              mass: ballState.mass,
              isFrozen: effectiveFrozen,
              handSpeed: maxHandSpeed,
              isWallHit,
              simTime: totalSimTime
            },
            { voiceEnabled: currentVoiceEnabled }
          );

          if (newEvents && newEvents.length > 0) {
            setEventsList((prev) => [...prev, ...newEvents].slice(-25));
          }
        }
      };

      animate();

      // =====================================================
      // 11. MEDIAPIPE VISION MODEL INITIALIZATION
      // =====================================================
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );

        if (destroyed) return;

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        console.log("✓ MediaPipe Hand Tracking ready for Hand-Force Lab");
      } catch (err) {
        console.error("MediaPipe initialization error:", err);
      }

      // =====================================================
      // 12. VIEWPORT RESIZE HANDLER
      // =====================================================
      const resize = () => {
        const newAspect = window.innerWidth / window.innerHeight;
        camera.left = -newAspect;
        camera.right = newAspect;
        camera.top = 1;
        camera.bottom = -1;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener("resize", resize);

      // =====================================================
      // 13. CLEANUP HANDLER
      // =====================================================
      return () => {
        destroyed = true;
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(animationId);
        stream?.getTracks().forEach((t) => t.stop());

        ballCore.geometry.dispose();
        ballCore.material.dispose();
        ballBody.geometry.dispose();
        ballBody.material.dispose();
        ballAura.geometry.dispose();
        ballAura.material.dispose();
        handRadiusRing.geometry.dispose();
        handRadiusRing.material.dispose();
        shockwaveMesh.geometry.dispose();
        shockwaveMesh.material.dispose();
        trailGeometry.dispose();
        trailLine.material.dispose();
        ambientGeometry.dispose();
        ambientParticles.material.dispose();
        renderer.dispose();
        handLandmarker?.close();
      };
    };

    let cleanupFn;
    start().then((fn) => {
      cleanupFn = fn;
    });

    return () => {
      destroyed = true;
      if (cleanupFn) cleanupFn();
    };
  }, []);

  return (
    <div className="physics-lab">
      {/* 1. CAMERA BACKGROUND (WEBCAM) */}
      <video
        ref={videoRef}
        className="camera-feed"
        autoPlay
        playsInline
        muted
        aria-hidden="true"
      />

      {/* 2. BACKGROUND GRID & VIGNETTE */}
      <div className="lab-grid" />
      <div className="lab-vignette" />

      {/* 3. THREE.JS PARTICLE & BALL CANVAS */}
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* 4. LAB HEADER */}
      <header className="lab-header">
        <div className="brand">
          <div className="brand-icon">⚛</div>
          <div>
            <div className="brand-title">TOUCHLESS PHYSICS LAB</div>
            <div className="brand-subtitle">
              HAND-FORCE LAB <span>•</span> REAL-TIME MECHANICS
            </div>
          </div>
        </div>

        <div className="tracking-status">
          <span className="status-dot" />
          <span>HAND TRACKING ACTIVE</span>
        </div>
      </header>

      {/* 5. GESTURES HUD (LEFT) */}
      <div className="gesture-hud-panel" aria-label="Gestures Detected">
        <div className="panel-label">DETECTED GESTURE</div>

        {/* PINCH */}
        <div className={`gesture-item-row ${activeGesture === "PINCH" ? "detected" : ""}`}>
          <div className="gesture-symbol">🤏</div>
          <div className="gesture-text">
            <strong>Pinch</strong>
            <small>Adjust force radius ({physicsState.interactionRadius ? physicsState.interactionRadius.toFixed(2) : "0.55"})</small>
          </div>
          {activeGesture === "PINCH" && <span className="gesture-active-badge">ACTIVE</span>}
        </div>

        {/* MOVE HAND */}
        <div className={`gesture-item-row ${activeGesture === "MOVE_HAND" ? "detected" : ""}`}>
          <div className="gesture-symbol">🖐️</div>
          <div className="gesture-text">
            <strong>Move Hand</strong>
            <small>Apply push force</small>
          </div>
          {activeGesture === "MOVE_HAND" && <span className="gesture-active-badge">PUSHING</span>}
        </div>

        {/* FAST MOTION */}
        <div className={`gesture-item-row ${activeGesture === "FAST_MOTION" ? "detected" : ""}`}>
          <div className="gesture-symbol">💨</div>
          <div className="gesture-text">
            <strong>Fast Motion</strong>
            <small>High impulse shockwave</small>
          </div>
          {activeGesture === "FAST_MOTION" && <span className="gesture-active-badge">IMPULSE</span>}
        </div>

        {/* FIST */}
        <div className={`gesture-item-row ${activeGesture === "FIST" ? "detected fist-detected" : ""}`}>
          <div className="gesture-symbol">✊</div>
          <div className="gesture-text">
            <strong>Fist</strong>
            <small>Freeze / pause physics</small>
          </div>
          {activeGesture === "FIST" && <span className="gesture-active-badge" style={{ color: "#ff6b6b" }}>PAUSED</span>}
        </div>
      </div>

      {/* 6. PHYSICS ACTION CHAIN (TOP CENTER) */}
      <PhysicsActionChain chainState={actionChain} />

      {/* 7. REAL-TIME EXPLANATION BANNER (TOP CENTER) */}
      <RealTimeExplanation explanation={explanation} formulaTag={formulaTag} />

      {/* 8. LIVE PHYSICS HUD (RIGHT) */}
      <LivePhysicsHUD
        physicsData={physicsState}
        mass={mass}
        onMassChange={handleMassChange}
        onResetBall={handleResetBall}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
      />

      {/* 9. LEARN PANEL (BOTTOM LEFT) */}
      <LearnPanel />

      {/* 10. PHYSICS EVENT TIMELINE (BOTTOM RIGHT) */}
      <PhysicsEventTimeline events={eventsList} />

      {/* 11. BOTTOM CONTROLS BAR */}
      <div className="experiment-controls-bar">
        <button
          type="button"
          className={`toggle-chip ${showVectors ? "active" : ""}`}
          onClick={() => setShowVectors((prev) => !prev)}
          title="Toggle Force, Velocity and Acceleration vector arrows"
        >
          <span>📐</span> Vectors: {showVectors ? "ON" : "OFF"}
        </button>

        <button
          type="button"
          className={`toggle-chip ${showInvisible ? "active" : ""}`}
          onClick={() => setShowInvisible((prev) => !prev)}
          title="Show hand interaction radius and invisible force fields"
        >
          <span>👁️</span> Invisible Fields: {showInvisible ? "ON" : "OFF"}
        </button>

        <button
          type="button"
          className={`toggle-chip ${explainVoice ? "active voice-active" : ""}`}
          onClick={() => setExplainVoice((prev) => !prev)}
          title="Browser voice narrates meaningful physics events"
        >
          <span>🔊</span> Voice Explain: {explainVoice ? "ON" : "OFF"}
        </button>

        <button
          type="button"
          className="toggle-chip"
          onClick={handleResetBall}
          title="Reset ball to origin"
        >
          <span>↺</span> Reset Ball
        </button>
      </div>

      {/* 12. DR. NOVA AI PHYSICS ASSISTANT (FLOATING BUTTON & PANEL) */}
      <PhysicsAssistant getLabSnapshot={getLabSnapshot} />
    </div>
  );
}