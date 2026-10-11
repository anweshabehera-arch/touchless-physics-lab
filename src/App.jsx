import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./App.css";
import "./components/HandForceLab/HandForceLab.css";
import * as THREE from "three";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import {
  ArrowLeft,
  BookOpen,
  Award,
  Compass,
  FileText,
  Info,
  Camera,
  CameraOff
} from "lucide-react";
import PhysicsAssistant from "./components/PhysicsAssistant/PhysicsAssistant";
import LivePhysicsHUD from "./components/HandForceLab/LivePhysicsHUD";
import PhysicsActionChain from "./components/HandForceLab/PhysicsActionChain";
import RealTimeExplanation from "./components/HandForceLab/RealTimeExplanation";
import LearnPanel from "./components/HandForceLab/LearnPanel";
import PhysicsEventTimeline from "./components/HandForceLab/PhysicsEventTimeline";
import HowToPerformModal from "./components/HandForceLab/HowToPerformModal";
import ExperimentQuizModal from "./components/HandForceLab/ExperimentQuizModal";
import GuidedExperimentPanel from "./components/HandForceLab/GuidedExperimentPanel";
import LabReportModal from "./components/HandForceLab/LabReportModal";
import ProjectIntroModal from "./components/portal/ProjectIntroModal";
import { EXPERIMENTS, EXPERIMENT_LIST } from "./data/experimentsData";
import { getExperimentRecord } from "./auth/experimentStorage";
import { getDisplayName, getSession } from "./auth/authStorage";
import { evaluatePhysicsEvents } from "./services/physicsEventEngine";

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Active Experiment Mode (default to 'newton', or from query param ?exp=...)
  const initialExp = searchParams.get("exp") || "newton";
  const [activeExpId, setActiveExpId] = useState(
    EXPERIMENTS[initialExp] ? initialExp : "newton"
  );
  const activeExperiment = EXPERIMENTS[activeExpId] || EXPERIMENTS.newton;
  const activeExpIdRef = useRef(activeExpId);
  useEffect(() => {
    activeExpIdRef.current = activeExpId;
  }, [activeExpId]);

  // Student Session
  const session = getSession();
  const studentName = getDisplayName(session);

  // Modals state
  const [isHowToOpen, setIsHowToOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isGuidedModeOpen, setIsGuidedModeOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [quizScoreBadge, setQuizScoreBadge] = useState(() => {
    const rec = getExperimentRecord(activeExpId);
    return rec ? rec.score : null;
  });
  const [lastQuizResult, setLastQuizResult] = useState(null);

  // Camera & Tracking State
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [cameraStatus, setCameraStatus] = useState("active"); // 'active' | 'lost' | 'disabled' | 'denied'

  // User Physics Settings across all labs
  const [mass, setMass] = useState(1.0); // kg (Ball 1)
  const [mass2, setMass2] = useState(1.0); // kg (Ball 2 for Collision)
  const [springK, setSpringK] = useState(25.0); // N/m (Hooke)
  const [launchAngle, setLaunchAngle] = useState(45); // degrees (Projectile)
  const [launchSpeed, setLaunchSpeed] = useState(5.0); // m/s (Projectile)
  const [appliedForceManual, setAppliedForceManual] = useState(0); // N (Manual Force for Newton)
  const [collisionType, setCollisionType] = useState("elastic"); // 'elastic' | 'inelastic'
  const [isPaused, setIsPaused] = useState(false);
  const [showVectors, setShowVectors] = useState(true);
  const [showInvisible, setShowInvisible] = useState(true);
  const [explainVoice, setExplainVoice] = useState(false);

  // Live HUD & Action Chain State
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
    interactionRadius: 0.55,
    // Impulse-specific
    peakForce: 0,
    contactTime: 0,
    impulseJ: 0,
    deltaMomentum: 0,
    // Hooke-specific
    displacement: 0,
    springForce: 0,
    potentialEnergy: 0,
    // Collision-specific
    v1: 0,
    v2: 0,
    p1: 0,
    p2: 0,
    pTotal: 0,
    keTotal: 0,
    keInitial: 0,
    // Projectile-specific
    projAngle: 45,
    projV0: 5.0,
    range: 0,
    maxHeight: 0,
    flightTime: 0,
    isAirborne: false
  });

  const [activeGesture, setActiveGesture] = useState("NONE");
  const [actionChain, setActionChain] = useState({
    isHandMoving: false,
    isForceApplied: false,
    isAccelerating: false,
    isVelocityChanging: false,
    isBallMoving: false
  });
  const [explanation, setExplanation] = useState(activeExperiment.description);
  const [formulaTag, setFormulaTag] = useState(activeExperiment.primaryFormula);
  const [eventsList, setEventsList] = useState([]);

  // Telemetry Ref for AI Assistant & Event Engine
  const telemetryRef = useRef({
    experimentName: activeExperiment.title,
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
    resetSim: null,
    fireProjectile: null,
    triggerImpact: null,
    launchBall1: null,
    setMassRef: null,
    setMass2Ref: null,
    setSpringKRef: null,
    setLaunchAngleRef: null,
    setLaunchSpeedRef: null,
    setAppliedForceManualRef: null,
    setCollisionTypeRef: null,
    setCameraEnabledRef: null,
    setIsPausedRef: null,
    setShowVectorsRef: null,
    setShowInvisibleRef: null,
    setVoiceRef: null
  });

  // Safe snapshot getter for Dr. Nova AI
  const getLabSnapshot = useCallback(() => {
    return {
      experimentName: activeExperiment.title,
      topic: activeExperiment.topic,
      formula: activeExperiment.primaryFormula,
      mass: telemetryRef.current.mass,
      estimatedForce: telemetryRef.current.force,
      estimatedAcceleration: telemetryRef.current.acceleration,
      averageVelocity: telemetryRef.current.velocity,
      displacement: telemetryRef.current.displacement,
      particleCount: 1,
      time: telemetryRef.current.time,
      handSpeed: telemetryRef.current.handSpeed,
      isFrozen: telemetryRef.current.isFrozen,
      recentEventsCount: eventsList.length
    };
  }, [activeExperiment, eventsList.length]);

  // Handle Experiment Switch
  const handleSelectExperiment = (expId) => {
    if (!EXPERIMENTS[expId]) return;
    setActiveExpId(expId);
    setSearchParams({ exp: expId });
    const rec = getExperimentRecord(expId);
    setQuizScoreBadge(rec ? rec.score : null);
    if (simControlsRef.current.resetSim) {
      simControlsRef.current.resetSim(expId);
    }
  };

  // Sync settings into simulation
  useEffect(() => {
    simControlsRef.current.setMassRef?.(mass);
  }, [mass]);

  useEffect(() => {
    simControlsRef.current.setMass2Ref?.(mass2);
  }, [mass2]);

  useEffect(() => {
    simControlsRef.current.setSpringKRef?.(springK);
  }, [springK]);

  useEffect(() => {
    simControlsRef.current.setLaunchAngleRef?.(launchAngle);
  }, [launchAngle]);

  useEffect(() => {
    simControlsRef.current.setLaunchSpeedRef?.(launchSpeed);
  }, [launchSpeed]);

  useEffect(() => {
    simControlsRef.current.setAppliedForceManualRef?.(appliedForceManual);
  }, [appliedForceManual]);

  useEffect(() => {
    simControlsRef.current.setCollisionTypeRef?.(collisionType);
  }, [collisionType]);

  useEffect(() => {
    simControlsRef.current.setCameraEnabledRef?.(cameraEnabled);
  }, [cameraEnabled]);

  useEffect(() => {
    simControlsRef.current.setShowVectorsRef?.(showVectors);
  }, [showVectors]);

  useEffect(() => {
    simControlsRef.current.setShowInvisibleRef?.(showInvisible);
  }, [showInvisible]);

  useEffect(() => {
    simControlsRef.current.setVoiceRef?.(explainVoice);
  }, [explainVoice]);

  // Keyboard Shortcuts (Space: Pause/Fire, R: Reset, G: Guided, V: Vectors)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT"
      ) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        if (activeExpId === "projectile" && !physicsState.isAirborne) {
          simControlsRef.current.fireProjectile?.();
        } else {
          setIsPaused((p) => {
            const next = !p;
            simControlsRef.current.setIsPausedRef?.(next);
            return next;
          });
        }
      } else if (e.key === "r" || e.key === "R") {
        simControlsRef.current.resetSim?.(activeExpId);
      } else if (e.key === "g" || e.key === "G") {
        setIsGuidedModeOpen((g) => !g);
      } else if (e.key === "v" || e.key === "V") {
        setShowVectors((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeExpId, physicsState.isAirborne]);

  // Update quiz badge when quiz finishes
  const handleQuizCompleted = (result) => {
    setQuizScoreBadge(result.score);
    setLastQuizResult(result);
  };

  // Main Three.js + MediaPipe Simulation Lifecycle
  useEffect(() => {
    let stream = null;
    let animationId;
    let handLandmarker;
    let destroyed = false;

    // Simulation Physics State
    const simState = {
      // 1. Newton's 2nd Law Object
      newton: {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        mass: 1.0,
        radius: 0.08,
        interactionRadius: 0.55
      },
      // 2. Impulse & Momentum Target
      impulse: {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        mass: 1.0,
        radius: 0.08,
        contactTime: 0,
        peakForce: 0,
        impulseJ: 0,
        deltaP: 0,
        isContact: false
      },
      // 3. Hooke's Law Spring Bob
      hooke: {
        x: 0.25, // initial displacement
        vx: 0,
        ax: 0,
        mass: 1.0,
        k: 25.0,
        radius: 0.08,
        isHandGrab: false
      },
      // 4. Collision Two Bodies
      collision: {
        b1: { x: -0.45, y: 0, vx: 0, vy: 0, mass: 1.0, radius: 0.075 },
        b2: { x: 0.35, y: 0, vx: 0, vy: 0, mass: 1.0, radius: 0.075 },
        pTotal: 0,
        keTotal: 0,
        keInitial: 0
      },
      // 5. Projectile Motion Cannon & Ball
      projectile: {
        startX: -0.9,
        startY: -0.6,
        x: -0.9,
        y: -0.6,
        vx: 0,
        vy: 0,
        angle: 45,
        v0: 5.0,
        flightTime: 0,
        isAirborne: false,
        range: 0,
        maxHeight: 0,
        gravity: 9.8
      }
    };

    let simPaused = false;
    let currentShowVectors = showVectors;
    let currentShowInvisible = showInvisible;
    let currentVoiceEnabled = explainVoice;
    let currentAppliedForce = appliedForceManual;
    let currentCollisionType = collisionType;
    let isWebcamEnabled = cameraEnabled;
    let totalSimTime = 0;

    // Expose control handlers
    simControlsRef.current.setMassRef = (m) => {
      simState.newton.mass = m;
      simState.impulse.mass = m;
      simState.hooke.mass = m;
      simState.collision.b1.mass = m;
    };
    simControlsRef.current.setMass2Ref = (m2) => {
      simState.collision.b2.mass = m2;
    };
    simControlsRef.current.setSpringKRef = (k) => {
      simState.hooke.k = k;
    };
    simControlsRef.current.setLaunchAngleRef = (ang) => {
      simState.projectile.angle = ang;
    };
    simControlsRef.current.setLaunchSpeedRef = (spd) => {
      simState.projectile.v0 = spd;
    };
    simControlsRef.current.setAppliedForceManualRef = (af) => {
      currentAppliedForce = af;
    };
    simControlsRef.current.setCollisionTypeRef = (ct) => {
      currentCollisionType = ct;
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

    const resetSimulation = (expId = activeExpIdRef.current) => {
      if (expId === "newton") {
        simState.newton.x = 0;
        simState.newton.y = 0;
        simState.newton.vx = 0;
        simState.newton.vy = 0;
        simState.newton.ax = 0;
        simState.newton.ay = 0;
      } else if (expId === "impulse") {
        simState.impulse.x = 0;
        simState.impulse.y = 0;
        simState.impulse.vx = 0;
        simState.impulse.vy = 0;
        simState.impulse.contactTime = 0;
        simState.impulse.peakForce = 0;
        simState.impulse.impulseJ = 0;
        simState.impulse.deltaP = 0;
        simState.impulse.isContact = false;
      } else if (expId === "hooke") {
        simState.hooke.x = 0.25;
        simState.hooke.vx = 0;
        simState.hooke.ax = 0;
      } else if (expId === "collision") {
        simState.collision.b1.x = -0.45;
        simState.collision.b1.y = 0;
        simState.collision.b1.vx = 0;
        simState.collision.b1.vy = 0;
        simState.collision.b2.x = 0.35;
        simState.collision.b2.y = 0;
        simState.collision.b2.vx = 0;
        simState.collision.b2.vy = 0;
      } else if (expId === "projectile") {
        simState.projectile.isAirborne = false;
        simState.projectile.x = simState.projectile.startX;
        simState.projectile.y = simState.projectile.startY;
        simState.projectile.vx = 0;
        simState.projectile.vy = 0;
        simState.projectile.flightTime = 0;
      }
    };

    simControlsRef.current.resetSim = resetSimulation;

    simControlsRef.current.fireProjectile = () => {
      const p = simState.projectile;
      const rad = (p.angle * Math.PI) / 180;
      p.x = p.startX;
      p.y = p.startY;
      p.vx = p.v0 * Math.cos(rad);
      p.vy = p.v0 * Math.sin(rad);
      p.flightTime = 0;
      p.maxHeight =
        p.startY + Math.pow(p.v0 * Math.sin(rad), 2) / (2 * p.gravity);
      p.range = (Math.pow(p.v0, 2) * Math.sin(2 * rad)) / p.gravity;
      p.isAirborne = true;
    };

    simControlsRef.current.triggerImpact = () => {
      const b = simState.impulse;
      b.vx = 4.8 / b.mass;
      b.peakForce = 24.5;
      b.contactTime = 0.08;
      b.impulseJ = 4.8;
      b.deltaP = 4.8;
    };

    simControlsRef.current.launchBall1 = () => {
      const { b1 } = simState.collision;
      b1.vx = 3.6;
      b1.vy = 0;
    };

    const start = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      // =====================================================
      // 1. CAMERA STREAM INITIALIZATION
      // =====================================================
      const initCamera = async () => {
        if (!isWebcamEnabled) {
          setCameraStatus("disabled");
          return;
        }
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
          setCameraStatus("active");
        } catch (err) {
          console.warn("Webcam access unavailable or denied:", err);
          setCameraStatus("denied");
        }
      };

      await initCamera();

      simControlsRef.current.setCameraEnabledRef = async (enabled) => {
        isWebcamEnabled = enabled;
        if (!enabled) {
          if (stream) {
            stream.getTracks().forEach((t) => t.stop());
            stream = null;
          }
          if (videoRef.current) videoRef.current.srcObject = null;
          setCameraStatus("disabled");
        } else {
          await initCamera();
        }
      };

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
      // 3. OBJECT GROUPS FOR EACH EXPERIMENT
      // =====================================================
      const createGlowSphere = (radius, hexColor) => {
        const group = new THREE.Group();
        const core = new THREE.Mesh(
          new THREE.SphereGeometry(radius * 0.65, 32, 32),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        group.add(core);

        const body = new THREE.Mesh(
          new THREE.SphereGeometry(radius, 32, 32),
          new THREE.MeshBasicMaterial({
            color: hexColor,
            transparent: true,
            opacity: 0.88
          })
        );
        group.add(body);

        const aura = new THREE.Mesh(
          new THREE.SphereGeometry(radius * 1.6, 24, 24),
          new THREE.MeshBasicMaterial({
            color: hexColor,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        group.add(aura);
        return { group, core, body, aura };
      };

      // --- Group 1: Newton's Ball ---
      const newtonMesh = createGlowSphere(0.08, 0x38d9ff);
      scene.add(newtonMesh.group);

      // --- Group 2: Impulse Target Ball ---
      const impulseMesh = createGlowSphere(0.08, 0xffa038);
      scene.add(impulseMesh.group);

      // --- Group 3: Hooke's Law Spring & Bob ---
      const hookeGroup = new THREE.Group();

      const anchorMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.2, 16),
        new THREE.MeshBasicMaterial({ color: 0x38d9ff })
      );
      anchorMesh.rotation.z = Math.PI / 2;
      hookeGroup.add(anchorMesh);

      const SPRING_POINTS = 18;
      const springLinePositions = new Float32Array(SPRING_POINTS * 3);
      const springGeometry = new THREE.BufferGeometry();
      springGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(springLinePositions, 3)
      );
      const springLine = new THREE.Line(
        springGeometry,
        new THREE.LineBasicMaterial({ color: 0x38d9ff, linewidth: 2 })
      );
      hookeGroup.add(springLine);

      const hookeBob = createGlowSphere(0.08, 0x31f2a1);
      hookeGroup.add(hookeBob.group);
      scene.add(hookeGroup);

      // --- Group 4: Collision Two Balls ---
      const collisionGroup = new THREE.Group();
      const collBall1 = createGlowSphere(0.075, 0x38d9ff); // Cyan Ball 1
      const collBall2 = createGlowSphere(0.075, 0xe040fb); // Magenta Ball 2
      collisionGroup.add(collBall1.group);
      collisionGroup.add(collBall2.group);
      scene.add(collisionGroup);

      // --- Group 5: Projectile Cannon, Ground, Target & Projectile ---
      const projectileGroup = new THREE.Group();

      const groundLineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-aspect, -0.62, 0),
        new THREE.Vector3(aspect, -0.62, 0)
      ]);
      const groundLine = new THREE.Line(
        groundLineGeom,
        new THREE.LineBasicMaterial({
          color: 0x167cff,
          transparent: true,
          opacity: 0.6
        })
      );
      projectileGroup.add(groundLine);

      const cannonBarrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.03, 0.18, 16),
        new THREE.MeshBasicMaterial({ color: 0x38d9ff })
      );
      cannonBarrel.position.set(-0.9, -0.6, 0);
      projectileGroup.add(cannonBarrel);

      const targetPad = new THREE.Mesh(
        new THREE.RingGeometry(0.02, 0.08, 32),
        new THREE.MeshBasicMaterial({ color: 0x31f2a1, side: THREE.DoubleSide })
      );
      targetPad.position.set(0.65, -0.61, 0);
      projectileGroup.add(targetPad);

      const TRAJ_POINTS = 40;
      const trajPositions = new Float32Array(TRAJ_POINTS * 3);
      const trajGeometry = new THREE.BufferGeometry();
      trajGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(trajPositions, 3)
      );
      const trajLine = new THREE.Line(
        trajGeometry,
        new THREE.LineBasicMaterial({
          color: 0x38d9ff,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending
        })
      );
      projectileGroup.add(trajLine);

      const projectileBall = createGlowSphere(0.05, 0xffbb33);
      projectileGroup.add(projectileBall.group);
      scene.add(projectileGroup);

      // =====================================================
      // 4. SHARED VECTOR ARROWS & SHOCKWAVE MESH
      // =====================================================
      const forceArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0, 0),
        0.001,
        0xff5555,
        0.06,
        0.04
      );
      scene.add(forceArrow);

      const velocityArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0, 0),
        0.001,
        0x31f2a1,
        0.06,
        0.04
      );
      scene.add(velocityArrow);

      const accelArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0, 0),
        0.001,
        0xffbb33,
        0.05,
        0.035
      );
      scene.add(accelArrow);

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

      const shockwaveMesh = new THREE.Mesh(
        new THREE.RingGeometry(0.02, 0.06, 48),
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

      // Ambient background particles for depth
      const AMBIENT_COUNT = 250;
      const ambientPositions = new Float32Array(AMBIENT_COUNT * 3);
      for (let i = 0; i < AMBIENT_COUNT; i++) {
        ambientPositions[i * 3] = (Math.random() - 0.5) * aspect * 2;
        ambientPositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
        ambientPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      }
      const ambientGeometry = new THREE.BufferGeometry();
      ambientGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(ambientPositions, 3)
      );
      const ambientParticles = new THREE.Points(
        ambientGeometry,
        new THREE.PointsMaterial({
          color: 0x38d9ff,
          size: 3.5,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending
        })
      );
      scene.add(ambientParticles);

      // =====================================================
      // 5. MEDIAPIPE HAND TRACKER & SMOOTHING
      // =====================================================
      let detectedHands = [];
      let previousHands = [];
      let fistActive = false;
      let lastHandCheck = 0;
      let lastSwipeImpulseTime = 0;

      const detectHands = () => {
        if (!isWebcamEnabled || !handLandmarker || video.readyState < 2) return;
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

            const fistDist = Math.sqrt(
              Math.pow(wrist.x - middle.x, 2) + Math.pow(wrist.y - middle.y, 2)
            );
            const isFist = fistDist < 0.22;

            const pinchDist = Math.sqrt(
              Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2)
            );

            const rawX = (0.5 - (wrist.x + palm.x) / 2) * aspect * 2;
            const rawY = (0.5 - (wrist.y + palm.y) / 2) * 2;

            currentList.push({
              x: rawX,
              y: rawY,
              isFist,
              pinchDistance: pinchDist
            });
          }

          detectedHands = currentList;
          fistActive = detectedHands.some((h) => h.isFist);
        } catch (err) {
          console.error("Hand detection error:", err);
        }
      };

      // =====================================================
      // 6. INTERACTIVE MOUSE / TOUCH CONTROLS (FALLBACK & HYBRID)
      // =====================================================
      let pointerActive = false;
      let pointerX = 0;
      let pointerY = 0;
      let prevPointerX = 0;
      let prevPointerY = 0;
      let pointerSpeed = 0;

      const onPointerDown = (e) => {
        pointerActive = true;
        const rect = canvas.getBoundingClientRect();
        pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * aspect * 2;
        pointerY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
        prevPointerX = pointerX;
        prevPointerY = pointerY;

        // Click on impulse target triggers strike
        if (activeExpIdRef.current === "impulse") {
          const d = Math.sqrt(
            Math.pow(pointerX - simState.impulse.x, 2) +
              Math.pow(pointerY - simState.impulse.y, 2)
          );
          if (d < 0.35) {
            simControlsRef.current.triggerImpact?.();
          }
        }
      };

      const onPointerMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width - 0.5) * aspect * 2;
        const py = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
        pointerSpeed = Math.sqrt(
          Math.pow(px - prevPointerX, 2) + Math.pow(py - prevPointerY, 2)
        );
        prevPointerX = pointerX;
        prevPointerY = pointerY;
        pointerX = px;
        pointerY = py;
      };

      const onPointerUp = () => {
        pointerActive = false;
        pointerSpeed = 0;
        if (simState.hooke.isHandGrab) {
          simState.hooke.isHandGrab = false;
        }
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);

      // =====================================================
      // 7. MAIN SIMULATION & ANIMATION LOOP
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

        // Check hand tracking at 25-30 FPS
        if (isWebcamEnabled && handLandmarker && now - lastHandCheck > 35) {
          lastHandCheck = now;
          detectHands();
        }

        const currentExp = activeExpIdRef.current;

        // Update Visibility of 3D groups according to active experiment
        newtonMesh.group.visible = currentExp === "newton";
        impulseMesh.group.visible = currentExp === "impulse";
        hookeGroup.visible = currentExp === "hooke";
        collisionGroup.visible = currentExp === "collision";
        projectileGroup.visible = currentExp === "projectile";

        // Hand gesture parsing or mouse fallback
        let primaryHand = detectedHands[0] || null;
        let maxHandSpeed = 0;
        let currentGesture = "NONE";
        let isFastImpulse = false;

        if (primaryHand) {
          const prevHand = previousHands[0];
          if (prevHand) {
            const hvx = primaryHand.x - prevHand.x;
            const hvy = primaryHand.y - prevHand.y;
            maxHandSpeed = Math.sqrt(hvx * hvx + hvy * hvy);
          }

          if (fistActive) {
            currentGesture = "FIST";
          } else if (primaryHand.pinchDistance < 0.08) {
            currentGesture = "PINCH";
          } else if (maxHandSpeed > 0.018 && now - lastSwipeImpulseTime > 350) {
            currentGesture = "FAST_MOTION";
            isFastImpulse = true;
            lastSwipeImpulseTime = now;
            shockwaveMesh.position.set(primaryHand.x, primaryHand.y, 0);
            shockwaveMesh.visible = true;
            shockwaveScale = 0.04;
            shockwaveOpacity = Math.min(1.0, maxHandSpeed * 25);
          } else {
            currentGesture = "MOVE_HAND";
          }

          if (currentShowInvisible) {
            handRadiusRing.position.set(primaryHand.x, primaryHand.y, 0);
            handRadiusRing.visible = true;
          } else {
            handRadiusRing.visible = false;
          }

          previousHands = detectedHands.map((h) => ({ x: h.x, y: h.y }));
        } else if (pointerActive) {
          // Virtual hand from mouse pointer
          primaryHand = {
            x: pointerX,
            y: pointerY,
            isFist: false,
            pinchDistance: 0.15
          };
          maxHandSpeed = pointerSpeed;
          currentGesture = pointerSpeed > 0.025 ? "FAST_MOTION" : "MOVE_HAND";
          isFastImpulse = pointerSpeed > 0.025 && now - lastSwipeImpulseTime > 350;
          if (isFastImpulse) lastSwipeImpulseTime = now;

          if (currentShowInvisible) {
            handRadiusRing.position.set(pointerX, pointerY, 0);
            handRadiusRing.visible = true;
          } else {
            handRadiusRing.visible = false;
          }
        } else {
          handRadiusRing.visible = false;
        }

        const effectiveFrozen = fistActive || simPaused;

        // Shockwave ripple animation
        if (shockwaveOpacity > 0.01) {
          shockwaveScale += 0.03;
          shockwaveMesh.scale.set(shockwaveScale, shockwaveScale, 1);
          shockwaveMesh.material.opacity = shockwaveOpacity;
          shockwaveOpacity *= 0.9;
        } else {
          shockwaveMesh.visible = false;
        }

        // =====================================================
        // 8. MULTI-EXPERIMENT PHYSICS INTEGRATION
        // =====================================================
        let currentForceMag = 0;
        let currentAccelMag = 0;
        let currentSpeedMag = 0;
        let isWallHit = false;

        // -----------------------------------------------------
        // EXPERIMENT 1: NEWTON'S 2ND LAW (F_net = m · a)
        // -----------------------------------------------------
        if (currentExp === "newton") {
          const ball = simState.newton;
          let appliedFx = 0;
          let appliedFy = 0;

          // Manual force slider contribution
          if (currentAppliedForce > 0 && !effectiveFrozen) {
            appliedFx += currentAppliedForce;
          }

          // Proximity repulsive force
          if (primaryHand && !effectiveFrozen) {
            const dx = ball.x - primaryHand.x;
            const dy = ball.y - primaryHand.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < ball.interactionRadius && dist > 0.005) {
              const dirX = dx / dist;
              const dirY = dy / dist;
              const proximity = 1 - dist / ball.interactionRadius;
              const basePush = proximity * 3.8;
              const speedPush = maxHandSpeed * 50.0;
              const impulseBoost = isFastImpulse ? maxHandSpeed * 75.0 : 0;
              const totalF = basePush + speedPush + impulseBoost;

              appliedFx += dirX * totalF;
              appliedFy += dirY * totalF;
            }
          }

          if (!effectiveFrozen) {
            const dragCoeff = 0.75;
            const netFx = appliedFx - dragCoeff * ball.vx;
            const netFy = appliedFy - dragCoeff * ball.vy;

            ball.ax = netFx / ball.mass;
            ball.ay = netFy / ball.mass;

            ball.vx += ball.ax * dt;
            ball.vy += ball.ay * dt;

            ball.x += ball.vx * dt;
            ball.y += ball.vy * dt;

            const limitX = aspect - ball.radius;
            const limitY = 1.0 - ball.radius;

            if (ball.x > limitX) {
              ball.x = limitX;
              ball.vx *= -0.82;
              isWallHit = true;
            } else if (ball.x < -limitX) {
              ball.x = -limitX;
              ball.vx *= -0.82;
              isWallHit = true;
            }
            if (ball.y > limitY) {
              ball.y = limitY;
              ball.vy *= -0.82;
              isWallHit = true;
            } else if (ball.y < -limitY) {
              ball.y = -limitY;
              ball.vy *= -0.82;
              isWallHit = true;
            }
          }

          currentForceMag = Math.sqrt(appliedFx * appliedFx + appliedFy * appliedFy);
          currentAccelMag = Math.sqrt(ball.ax * ball.ax + ball.ay * ball.ay);
          currentSpeedMag = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

          newtonMesh.group.position.set(ball.x, ball.y, 0);

          if (currentShowVectors) {
            const pos = new THREE.Vector3(ball.x, ball.y, 0);
            if (currentForceMag > 0.15) {
              forceArrow.position.copy(pos);
              forceArrow.setDirection(
                new THREE.Vector3(appliedFx, appliedFy, 0).normalize()
              );
              forceArrow.setLength(
                Math.min(0.6, currentForceMag * 0.14),
                0.06,
                0.04
              );
              forceArrow.visible = true;
            } else forceArrow.visible = false;

            if (currentSpeedMag > 0.08) {
              velocityArrow.position.copy(pos);
              velocityArrow.setDirection(
                new THREE.Vector3(ball.vx, ball.vy, 0).normalize()
              );
              velocityArrow.setLength(
                Math.min(0.55, currentSpeedMag * 0.22),
                0.06,
                0.04
              );
              velocityArrow.visible = true;
            } else velocityArrow.visible = false;

            if (currentAccelMag > 0.2) {
              accelArrow.position.copy(pos);
              accelArrow.setDirection(
                new THREE.Vector3(ball.ax, ball.ay, 0).normalize()
              );
              accelArrow.setLength(
                Math.min(0.5, currentAccelMag * 0.12),
                0.05,
                0.035
              );
              accelArrow.visible = true;
            } else accelArrow.visible = false;
          } else {
            forceArrow.visible = false;
            velocityArrow.visible = false;
            accelArrow.visible = false;
          }
        }

        // -----------------------------------------------------
        // EXPERIMENT 2: IMPULSE & MOMENTUM (J = F · Δt = Δp)
        // -----------------------------------------------------
        else if (currentExp === "impulse") {
          const ball = simState.impulse;
          let contactFx = 0;
          let contactFy = 0;

          if (primaryHand && !effectiveFrozen) {
            const dx = ball.x - primaryHand.x;
            const dy = ball.y - primaryHand.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.38 && dist > 0.005) {
              ball.isContact = true;
              ball.contactTime += dt;

              const dirX = dx / dist;
              const dirY = dy / dist;
              const proximity = 1 - dist / 0.38;
              const instForce = proximity * 18.0 + maxHandSpeed * 100.0;

              contactFx = dirX * instForce;
              contactFy = dirY * instForce;

              ball.peakForce = Math.max(ball.peakForce, instForce);
              ball.impulseJ += instForce * dt;

              ball.vx += (contactFx / ball.mass) * dt;
              ball.vy += (contactFy / ball.mass) * dt;

              shockwaveMesh.position.set(ball.x, ball.y, 0);
              shockwaveMesh.visible = true;
              shockwaveOpacity = 0.8;
            } else {
              ball.isContact = false;
            }
          }

          if (!effectiveFrozen) {
            ball.vx *= 0.96;
            ball.vy *= 0.96;
            ball.x += ball.vx * dt;
            ball.y += ball.vy * dt;

            const limitX = aspect - ball.radius;
            const limitY = 1.0 - ball.radius;
            if (ball.x > limitX) {
              ball.x = limitX;
              ball.vx *= -0.7;
            } else if (ball.x < -limitX) {
              ball.x = -limitX;
              ball.vx *= -0.7;
            }
            if (ball.y > limitY) {
              ball.y = limitY;
              ball.vy *= -0.7;
            } else if (ball.y < -limitY) {
              ball.y = -limitY;
              ball.vy *= -0.7;
            }
          }

          currentForceMag = Math.sqrt(
            contactFx * contactFx + contactFy * contactFy
          );
          currentSpeedMag = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          ball.deltaP = ball.mass * currentSpeedMag;

          impulseMesh.group.position.set(ball.x, ball.y, 0);
          forceArrow.visible = false;
          accelArrow.visible = false;
          velocityArrow.visible = false;
        }

        // -----------------------------------------------------
        // EXPERIMENT 3: HOOKE'S LAW (F = -k · x)
        // -----------------------------------------------------
        else if (currentExp === "hooke") {
          const spring = simState.hooke;

          if (primaryHand && !effectiveFrozen) {
            const dX = Math.abs(primaryHand.x - spring.x);
            const dY = Math.abs(primaryHand.y);
            if (dX < 0.28 && dY < 0.3) {
              spring.isHandGrab = true;
              spring.x = Math.max(-0.75, Math.min(0.75, primaryHand.x));
              spring.vx = 0;
            } else {
              spring.isHandGrab = false;
            }
          } else {
            spring.isHandGrab = false;
          }

          if (!spring.isHandGrab && !effectiveFrozen) {
            const damping = 0.55;
            spring.ax =
              (-spring.k * spring.x - damping * spring.vx) / spring.mass;
            spring.vx += spring.ax * dt;
            spring.x += spring.vx * dt;
          }

          const restForce = -spring.k * spring.x;
          currentForceMag = Math.abs(restForce);
          currentSpeedMag = Math.abs(spring.vx);
          currentAccelMag = Math.abs(spring.ax);

          const pArray = springLine.geometry.attributes.position.array;
          const totalPts = SPRING_POINTS;
          for (let i = 0; i < totalPts; i++) {
            const frac = i / (totalPts - 1);
            pArray[i * 3] = spring.x * frac;
            pArray[i * 3 + 1] =
              i === 0 || i === totalPts - 1 ? 0 : i % 2 === 0 ? 0.04 : -0.04;
            pArray[i * 3 + 2] = 0;
          }
          springLine.geometry.attributes.position.needsUpdate = true;

          hookeBob.group.position.set(spring.x, 0, 0);

          if (currentShowVectors && Math.abs(restForce) > 0.1) {
            forceArrow.position.set(spring.x, 0, 0);
            forceArrow.setDirection(
              new THREE.Vector3(restForce > 0 ? 1 : -1, 0, 0)
            );
            forceArrow.setLength(
              Math.min(0.5, Math.abs(restForce) * 0.035),
              0.05,
              0.035
            );
            forceArrow.visible = true;
          } else {
            forceArrow.visible = false;
          }
          velocityArrow.visible = false;
          accelArrow.visible = false;
        }

        // -----------------------------------------------------
        // EXPERIMENT 4: COLLISIONS & MOMENTUM CONSERVATION (ELASTIC / INELASTIC)
        // -----------------------------------------------------
        else if (currentExp === "collision") {
          const { b1, b2 } = simState.collision;

          // Hand/Mouse pushes Ball 1
          if (primaryHand && !effectiveFrozen) {
            const dx = b1.x - primaryHand.x;
            const dy = b1.y - primaryHand.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.45 && dist > 0.005) {
              const pushF = (1 - dist / 0.45) * 4.5 + maxHandSpeed * 50.0;
              b1.vx += (dx / dist) * (pushF / b1.mass) * dt;
              b1.vy += (dy / dist) * (pushF / b1.mass) * dt;
            }
          }

          if (!effectiveFrozen) {
            b1.vx *= 0.992;
            b1.vy *= 0.992;
            b2.vx *= 0.992;
            b2.vy *= 0.992;

            b1.x += b1.vx * dt;
            b1.y += b1.vy * dt;
            b2.x += b2.vx * dt;
            b2.y += b2.vy * dt;

            // Collision Check between b1 and b2
            const cdx = b2.x - b1.x;
            const cdy = b2.y - b1.y;
            const cDist = Math.sqrt(cdx * cdx + cdy * cdy);
            const minDist = b1.radius + b2.radius;

            if (cDist < minDist && cDist > 0.0001) {
              const nx = cdx / cDist;
              const ny = cdy / cDist;

              const kx = b1.vx - b2.vx;
              const ky = b1.vy - b2.vy;

              if (nx * kx + ny * ky > 0) {
                // Moving toward each other
                if (currentCollisionType === "inelastic") {
                  // Perfectly Inelastic Collision: Stick together
                  const totalM = b1.mass + b2.mass;
                  const vCommonX = (b1.mass * b1.vx + b2.mass * b2.vx) / totalM;
                  const vCommonY = (b1.mass * b1.vy + b2.mass * b2.vy) / totalM;
                  b1.vx = vCommonX;
                  b1.vy = vCommonY;
                  b2.vx = vCommonX;
                  b2.vy = vCommonY;
                } else {
                  // Elastic Collision: Momentum & Kinetic Energy Conserved
                  const p = (2 * (nx * kx + ny * ky)) / (b1.mass + b2.mass);
                  b1.vx -= p * b2.mass * nx;
                  b1.vy -= p * b2.mass * ny;
                  b2.vx += p * b1.mass * nx;
                  b2.vy += p * b1.mass * ny;
                }

                // Push apart slightly to prevent clipping
                const overlap = (minDist - cDist) * 0.55;
                b1.x -= nx * overlap;
                b1.y -= ny * overlap;
                b2.x += nx * overlap;
                b2.y += ny * overlap;

                // Collision burst
                shockwaveMesh.position.set((b1.x + b2.x) / 2, (b1.y + b2.y) / 2, 0);
                shockwaveMesh.visible = true;
                shockwaveOpacity = 0.9;
              }
            }

            // Boundary rebounds
            const limitX = aspect - 0.08;
            const limitY = 0.92;
            [b1, b2].forEach((b) => {
              if (b.x > limitX) {
                b.x = limitX;
                b.vx *= -0.85;
              } else if (b.x < -limitX) {
                b.x = -limitX;
                b.vx *= -0.85;
              }
              if (b.y > limitY) {
                b.y = limitY;
                b.vy *= -0.85;
              } else if (b.y < -limitY) {
                b.y = -limitY;
                b.vy *= -0.85;
              }
            });
          }

          collBall1.group.position.set(b1.x, b1.y, 0);
          collBall2.group.position.set(b2.x, b2.y, 0);

          currentSpeedMag = Math.sqrt(b1.vx * b1.vx + b1.vy * b1.vy);
          forceArrow.visible = false;
          accelArrow.visible = false;
          velocityArrow.visible = false;
        }

        // -----------------------------------------------------
        // EXPERIMENT 5: PROJECTILE MOTION
        // -----------------------------------------------------
        else if (currentExp === "projectile") {
          const proj = simState.projectile;

          // Hand/Mouse aims angle
          if (primaryHand && !proj.isAirborne && !effectiveFrozen) {
            const normY = Math.max(0, Math.min(1, (primaryHand.y + 0.4) / 0.8));
            proj.angle = Math.round(15 + normY * 60);

            // Fast motion flick fires cannon
            if (isFastImpulse && maxHandSpeed > 0.02) {
              simControlsRef.current.fireProjectile();
            }
          }

          // Flight kinematics
          if (proj.isAirborne && !effectiveFrozen) {
            proj.flightTime += dt;
            proj.x += proj.vx * dt;
            proj.vy -= proj.gravity * dt;
            proj.y += proj.vy * dt;

            // Ground impact
            if (proj.y <= proj.startY) {
              proj.y = proj.startY;
              proj.isAirborne = false;
              proj.vx = 0;
              proj.vy = 0;

              shockwaveMesh.position.set(proj.x, proj.startY, 0);
              shockwaveMesh.visible = true;
              shockwaveOpacity = 0.9;
            }
          }

          const rad = (proj.angle * Math.PI) / 180;
          cannonBarrel.rotation.z = rad - Math.PI / 2;

          const pArray = trajLine.geometry.attributes.position.array;
          const previewV0 = proj.v0;
          for (let i = 0; i < TRAJ_POINTS; i++) {
            const t =
              (i / (TRAJ_POINTS - 1)) *
              ((2 * previewV0 * Math.sin(rad)) / proj.gravity);
            const px = proj.startX + previewV0 * Math.cos(rad) * t;
            const py =
              proj.startY +
              previewV0 * Math.sin(rad) * t -
              0.5 * proj.gravity * t * t;
            pArray[i * 3] = px;
            pArray[i * 3 + 1] = Math.max(proj.startY, py);
            pArray[i * 3 + 2] = 0;
          }
          trajLine.geometry.attributes.position.needsUpdate = true;

          projectileBall.group.position.set(proj.x, proj.y, 0);
          currentSpeedMag = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);

          forceArrow.visible = false;
          accelArrow.visible = false;
          velocityArrow.visible = false;
        }

        // Ambient particles drift
        ambientParticles.rotation.z = now * 0.0001;

        // Render Frame
        renderer.render(scene, camera);

        // =====================================================
        // 9. THROTTLED TELEMETRY UPDATES (every 50ms)
        // =====================================================
        if (now - lastThrottleUpdate > 50) {
          lastThrottleUpdate = now;

          if (currentExp === "newton") {
            const ball = simState.newton;
            const p = ball.mass * currentSpeedMag;
            const ke = 0.5 * ball.mass * currentSpeedMag * currentSpeedMag;

            telemetryRef.current = {
              experimentName: "Newton's 2nd Law",
              mass: ball.mass,
              force: Number(currentForceMag.toFixed(2)),
              acceleration: Number(currentAccelMag.toFixed(2)),
              velocity: Number(currentSpeedMag.toFixed(2)),
              vx: Number(ball.vx.toFixed(2)),
              vy: Number(ball.vy.toFixed(2)),
              posX: Number(ball.x.toFixed(2)),
              posY: Number(ball.y.toFixed(2)),
              displacement: 0,
              momentum: Number(p.toFixed(2)),
              kineticEnergy: Number(ke.toFixed(2)),
              handSpeed: Number(maxHandSpeed.toFixed(3)),
              time: Number(totalSimTime.toFixed(1)),
              isFrozen: effectiveFrozen
            };

            setPhysicsState({
              force: currentForceMag,
              acceleration: currentAccelMag,
              velocity: currentSpeedMag,
              vx: ball.vx,
              vy: ball.vy,
              posX: ball.x,
              posY: ball.y,
              momentum: p,
              kineticEnergy: ke,
              mass: ball.mass,
              interactionRadius: ball.interactionRadius
            });

            if (effectiveFrozen) {
              setExplanation("Fist detected ✊: Physics calculations frozen.");
              setFormulaTag("v = 0, a = 0 (Frozen)");
            } else if (currentForceMag > 0.15) {
              setExplanation(
                `Net force ${currentForceMag.toFixed(1)} N applied. Acceleration a = F/m = ${(currentForceMag / ball.mass).toFixed(1)} m/s².`
              );
              setFormulaTag("F = m · a");
            } else if (currentSpeedMag > 0.05) {
              setExplanation(
                `Object moving at ${currentSpeedMag.toFixed(1)} m/s. Drag gradually slows it down.`
              );
              setFormulaTag("F_drag = -b · v");
            } else {
              setExplanation(
                "Object is at rest in equilibrium. Move hand or adjust applied force to accelerate."
              );
              setFormulaTag("Newton's 1st Law (Inertia)");
            }
          } else if (currentExp === "impulse") {
            const ball = simState.impulse;
            telemetryRef.current = {
              experimentName: "Impulse & Momentum Lab",
              mass: ball.mass,
              force: Number(currentForceMag.toFixed(2)),
              acceleration: Number((currentForceMag / ball.mass).toFixed(2)),
              velocity: Number(currentSpeedMag.toFixed(2)),
              vx: Number(ball.vx.toFixed(2)),
              vy: Number(ball.vy.toFixed(2)),
              posX: Number(ball.x.toFixed(2)),
              posY: Number(ball.y.toFixed(2)),
              displacement: 0,
              momentum: Number((ball.mass * currentSpeedMag).toFixed(2)),
              kineticEnergy: Number(
                (0.5 * ball.mass * currentSpeedMag * currentSpeedMag).toFixed(2)
              ),
              handSpeed: Number(maxHandSpeed.toFixed(3)),
              time: Number(totalSimTime.toFixed(1)),
              isFrozen: effectiveFrozen
            };

            setPhysicsState({
              force: currentForceMag,
              velocity: currentSpeedMag,
              peakForce: ball.peakForce,
              contactTime: ball.contactTime,
              impulseJ: ball.impulseJ,
              deltaMomentum: ball.deltaP,
              mass: ball.mass
            });

            if (ball.isContact) {
              setExplanation(
                `💥 Impact strike! Contact force: ${currentForceMag.toFixed(1)} N, accumulating impulse J.`
              );
              setFormulaTag("J = ∫ F dt");
            } else if (ball.impulseJ > 0) {
              setExplanation(
                `Impulse delivered: J = ${ball.impulseJ.toFixed(2)} N·s produced momentum change Δp = ${ball.deltaP.toFixed(2)} kg·m/s.`
              );
              setFormulaTag("J = Δp = m·v_f");
            } else {
              setExplanation(
                "Target ball at rest. Perform a quick hand swipe 💨 to strike with high impulse!"
              );
              setFormulaTag("J = F_avg · Δt = Δp");
            }
          } else if (currentExp === "hooke") {
            const spring = simState.hooke;
            const u = 0.5 * spring.k * spring.x * spring.x;
            const ke = 0.5 * spring.mass * spring.vx * spring.vx;

            telemetryRef.current = {
              experimentName: "Hooke's Law & Springs",
              mass: spring.mass,
              force: Number(currentForceMag.toFixed(2)),
              acceleration: Number(currentAccelMag.toFixed(2)),
              velocity: Number(currentSpeedMag.toFixed(2)),
              displacement: Number(spring.x.toFixed(2)),
              time: Number(totalSimTime.toFixed(1)),
              isFrozen: effectiveFrozen
            };

            setPhysicsState({
              displacement: spring.x,
              springForce: -spring.k * spring.x,
              potentialEnergy: u,
              kineticEnergy: ke,
              velocity: currentSpeedMag,
              springK: spring.k,
              mass: spring.mass
            });

            if (spring.isHandGrab) {
              setExplanation(
                `Dragging spring: displacement x = ${spring.x.toFixed(2)} m. Restoring force opposes displacement.`
              );
              setFormulaTag("F_spring = -k · x");
            } else if (Math.abs(spring.x) > 0.03) {
              setExplanation(
                `Restoring force ${(-spring.k * spring.x).toFixed(1)} N pulls mass back to center. Harmonic oscillation in progress.`
              );
              setFormulaTag("a = -k/m · x");
            } else {
              setExplanation(
                "Spring at center equilibrium (x = 0, F = 0). Drag or push bob to stretch coils!"
              );
              setFormulaTag("F = -k · x, U = ½kx²");
            }
          } else if (currentExp === "collision") {
            const { b1, b2 } = simState.collision;
            const v1 = Math.sqrt(b1.vx * b1.vx + b1.vy * b1.vy);
            const v2 = Math.sqrt(b2.vx * b2.vx + b2.vy * b2.vy);
            const p1 = b1.mass * v1;
            const p2 = b2.mass * v2;
            const pTot = Math.abs(b1.mass * b1.vx + b2.mass * b2.vx);
            const keTot = 0.5 * b1.mass * v1 * v1 + 0.5 * b2.mass * v2 * v2;

            telemetryRef.current = {
              experimentName: "Collisions & Momentum",
              mass: b1.mass,
              velocity: Number(v1.toFixed(2)),
              momentum: Number(pTot.toFixed(2)),
              kineticEnergy: Number(keTot.toFixed(2)),
              time: Number(totalSimTime.toFixed(1)),
              isFrozen: effectiveFrozen
            };

            setPhysicsState({
              v1,
              v2,
              p1,
              p2,
              pTotal: pTot,
              keTotal: keTot,
              mass: b1.mass,
              mass2: b2.mass
            });

            if (v1 > 0.1 && v2 < 0.05) {
              setExplanation(
                `Ball 1 moving forward with momentum p₁ = ${p1.toFixed(2)} kg·m/s approaching target Ball 2.`
              );
              setFormulaTag("p_tot = m₁v₁ + m₂v₂");
            } else if (v2 > 0.1) {
              setExplanation(
                `Collision result: Momentum conserved (p_tot = ${pTot.toFixed(2)} kg·m/s). Mode: ${currentCollisionType}.`
              );
              setFormulaTag("m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'");
            } else {
              setExplanation(
                "Both bodies at rest. Push Ball 1 toward Ball 2 to trigger an isolated collision!"
              );
              setFormulaTag("Conservation of Momentum");
            }
          } else if (currentExp === "projectile") {
            const proj = simState.projectile;
            telemetryRef.current = {
              experimentName: "Projectile Motion",
              velocity: Number(currentSpeedMag.toFixed(2)),
              acceleration: 9.8,
              time: Number(totalSimTime.toFixed(1)),
              isFrozen: effectiveFrozen
            };

            setPhysicsState({
              projAngle: proj.angle,
              projV0: proj.v0,
              range: proj.range,
              maxHeight: proj.maxHeight,
              flightTime: proj.flightTime,
              isAirborne: proj.isAirborne
            });

            if (proj.isAirborne) {
              setExplanation(
                `Parabolic trajectory: horizontal speed ${(proj.vx).toFixed(1)} m/s is constant; gravity pulls downward.`
              );
              setFormulaTag("y(t) = v₀y·t - ½gt²");
            } else {
              setExplanation(
                `Aim angle ${proj.angle}°. Theoretical range R = ${proj.range.toFixed(2)} m. Flick hand or tap Fire!`
              );
              setFormulaTag("R = (v₀² sin 2θ) / g");
            }
          }

          setActiveGesture(currentGesture);

          const isMoving = currentSpeedMag > 0.05;
          const isForce = currentForceMag > 0.15;
          const isAccel = currentAccelMag > 0.15;
          setActionChain({
            isHandMoving: maxHandSpeed > 0.005,
            isForceApplied: isForce,
            isAccelerating: isAccel,
            isVelocityChanging: isAccel || isForce,
            isBallMoving: isMoving
          });

          const newEvents = evaluatePhysicsEvents(
            {
              force: currentForceMag,
              acceleration: currentAccelMag,
              velocity: currentSpeedMag,
              mass: mass,
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
      // 10. MEDIAPIPE INITIALIZATION
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
        console.log("✓ MediaPipe Hand Tracking active for all 5 labs");
      } catch (err) {
        console.error("MediaPipe initialization error:", err);
      }

      // Resize
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

      return () => {
        destroyed = true;
        window.removeEventListener("resize", resize);
        canvas.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        cancelAnimationFrame(animationId);
        stream?.getTracks().forEach((t) => t.stop());
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
      {/* 1. CAMERA FEED */}
      <video
        ref={videoRef}
        className="camera-feed"
        autoPlay
        playsInline
        muted
        aria-hidden="true"
        style={{ display: cameraEnabled ? "block" : "none" }}
      />

      {/* 2. GRID & VIGNETTE */}
      <div className="lab-grid" />
      <div className="lab-vignette" />

      {/* 3. THREE.JS CANVAS */}
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* 4. LAB HEADER WITH EXPERIMENT SELECTOR & NAV */}
      <header className="lab-header">
        <div className="brand">
          <Link
            to="/dashboard"
            className="lab-top-action-btn"
            title="Back to Dashboard"
          >
            <ArrowLeft className="btn-icon-sm" />
            Dashboard
          </Link>

          <div className="brand-icon">⚛</div>
          <div>
            <div className="brand-title">TOUCHLESS PHYSICS LAB</div>
            <div className="brand-subtitle">
              {activeExperiment.title.toUpperCase()} <span>•</span> REAL-TIME MECHANICS
            </div>
          </div>
        </div>

        {/* Experiment Switcher Dropdown & Action Buttons */}
        <div className="lab-exp-selector-wrap">
          <label
            htmlFor="exp-select-header"
            style={{ fontSize: "10px", color: "#7bb0c8", fontWeight: 700 }}
          >
            LAB MODULE:
          </label>
          <select
            id="exp-select-header"
            className="lab-exp-select"
            value={activeExpId}
            onChange={(e) => handleSelectExperiment(e.target.value)}
          >
            {EXPERIMENT_LIST.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.emoji} {exp.title}
              </option>
            ))}
          </select>

          {/* Guided Mode Toggle */}
          <button
            type="button"
            className={`lab-top-action-btn ${isGuidedModeOpen ? "active-quiz" : ""}`}
            onClick={() => setIsGuidedModeOpen((g) => !g)}
            title="Toggle step-by-step guided experiment mode"
          >
            <Compass className="btn-icon-sm" />
            {isGuidedModeOpen ? "Guided Mode (Active)" : "Guided Mode"}
          </button>

          {/* How to Perform Modal */}
          <button
            type="button"
            className="lab-top-action-btn"
            onClick={() => setIsHowToOpen(true)}
            title="Read how to perform gestures for this lab"
          >
            <BookOpen className="btn-icon-sm" />
            How to Perform
          </button>

          {/* Quiz Button */}
          <button
            type="button"
            className={`lab-top-action-btn ${quizScoreBadge !== null ? "active-quiz" : ""}`}
            onClick={() => setIsQuizOpen(true)}
            title="Take experiment mastery quiz"
          >
            <Award className="btn-icon-sm" />
            {quizScoreBadge !== null ? `Quiz (${quizScoreBadge}%)` : "Take Quiz"}
          </button>

          {/* Lab Report Button */}
          <button
            type="button"
            className="lab-top-action-btn"
            onClick={() => setIsReportOpen(true)}
            title="View & Print Official Physics Lab Report"
          >
            <FileText className="btn-icon-sm" />
            Lab Report
          </button>

          {/* Hackathon Tour / Info */}
          <button
            type="button"
            className="lab-top-action-btn"
            onClick={() => setIsIntroOpen(true)}
            title="Platform Overview & Demo Walkthrough"
          >
            <Info className="btn-icon-sm" />
            About
          </button>
        </div>

        {/* Camera Toggle & Status Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            className="lab-top-action-btn"
            onClick={() => setCameraEnabled((c) => !c)}
            title={cameraEnabled ? "Disable webcam (use mouse mode)" : "Enable webcam"}
          >
            {cameraEnabled ? (
              <Camera className="btn-icon-sm" />
            ) : (
              <CameraOff className="btn-icon-sm" />
            )}
            {cameraEnabled ? "Cam: ON" : "Cam: OFF"}
          </button>

          <div className={`tracking-status ${cameraStatus}`}>
            <span className="status-dot" />
            <span>
              {cameraStatus === "active" && "HAND TRACKING ACTIVE"}
              {cameraStatus === "lost" && "HAND OUTSIDE FRAME"}
              {cameraStatus === "disabled" && "MOUSE MODE ACTIVE"}
              {cameraStatus === "denied" && "CAM BLOCKED (MOUSE ACTIVE)"}
            </span>
          </div>
        </div>
      </header>

      {/* 5. GESTURES HUD (LEFT) */}
      <div className="gesture-hud-panel" aria-label="Gestures Detected">
        <div className="panel-label">DETECTED GESTURE</div>

        <div
          className={`gesture-item-row ${activeGesture === "PINCH" ? "detected" : ""}`}
        >
          <div className="gesture-symbol">🤏</div>
          <div className="gesture-text">
            <strong>Pinch</strong>
            <small>Adjust parameters / aim</small>
          </div>
          {activeGesture === "PINCH" && (
            <span className="gesture-active-badge">ACTIVE</span>
          )}
        </div>

        <div
          className={`gesture-item-row ${activeGesture === "MOVE_HAND" ? "detected" : ""}`}
        >
          <div className="gesture-symbol">🖐️</div>
          <div className="gesture-text">
            <strong>Move Hand / Mouse</strong>
            <small>Apply push / drag force</small>
          </div>
          {activeGesture === "MOVE_HAND" && (
            <span className="gesture-active-badge">ACTIVE</span>
          )}
        </div>

        <div
          className={`gesture-item-row ${activeGesture === "FAST_MOTION" ? "detected" : ""}`}
        >
          <div className="gesture-symbol">💨</div>
          <div className="gesture-text">
            <strong>Fast Motion / Flick</strong>
            <small>High impulse shockwave</small>
          </div>
          {activeGesture === "FAST_MOTION" && (
            <span className="gesture-active-badge">IMPULSE</span>
          )}
        </div>

        <div
          className={`gesture-item-row ${
            activeGesture === "FIST" ? "detected fist-detected" : ""
          }`}
        >
          <div className="gesture-symbol">✊</div>
          <div className="gesture-text">
            <strong>Fist / Spacebar</strong>
            <small>Freeze / pause physics</small>
          </div>
          {activeGesture === "FIST" && (
            <span
              className="gesture-active-badge"
              style={{ color: "#ff6b6b" }}
            >
              PAUSED
            </span>
          )}
        </div>
      </div>

      {/* 6. GUIDED EXPERIMENT PANEL (OPTIONAL OVERLAY) */}
      {isGuidedModeOpen && (
        <GuidedExperimentPanel
          experiment={activeExperiment}
          physicsData={physicsState}
          onLaunchQuiz={() => setIsQuizOpen(true)}
          onResetSim={() => simControlsRef.current.resetSim?.(activeExpId)}
          isPaused={isPaused}
          onTogglePause={() => {
            setIsPaused((p) => {
              const next = !p;
              simControlsRef.current.setIsPausedRef?.(next);
              return next;
            });
          }}
          onClose={() => setIsGuidedModeOpen(false)}
        />
      )}

      {/* 7. PHYSICS ACTION CHAIN (TOP CENTER) */}
      <PhysicsActionChain
        chainState={actionChain}
        activeExperimentId={activeExpId}
      />

      {/* 8. REAL-TIME EXPLANATION BANNER (TOP CENTER) */}
      <RealTimeExplanation
        explanation={explanation}
        formulaTag={formulaTag}
      />

      {/* 9. LIVE PHYSICS HUD WITH TELEMETRY & GRAPH TABS (RIGHT) */}
      <LivePhysicsHUD
        activeExperimentId={activeExpId}
        activeExperiment={activeExperiment}
        physicsData={physicsState}
        mass={mass}
        onMassChange={setMass}
        mass2={mass2}
        onMass2Change={setMass2}
        springK={springK}
        onSpringKChange={setSpringK}
        launchAngle={launchAngle}
        onLaunchAngleChange={setLaunchAngle}
        launchSpeed={launchSpeed}
        onLaunchSpeedChange={setLaunchSpeed}
        appliedForceManual={appliedForceManual}
        onAppliedForceManualChange={setAppliedForceManual}
        collisionType={collisionType}
        onToggleCollisionType={setCollisionType}
        onFireProjectile={() => simControlsRef.current.fireProjectile?.()}
        onTriggerImpact={() => simControlsRef.current.triggerImpact?.()}
        onLaunchBall1={() => simControlsRef.current.launchBall1?.()}
        onResetBall={() => simControlsRef.current.resetSim?.(activeExpId)}
        isPaused={isPaused}
        onTogglePause={() => {
          setIsPaused((p) => {
            const next = !p;
            simControlsRef.current.setIsPausedRef?.(next);
            return next;
          });
        }}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* 10. LEARN PANEL (BOTTOM LEFT) */}
      <LearnPanel activeExperimentId={activeExpId} />

      {/* 11. PHYSICS EVENT TIMELINE (BOTTOM RIGHT) */}
      <PhysicsEventTimeline
        events={eventsList}
        onReset={() => simControlsRef.current.resetSim?.(activeExpId)}
        isPaused={isPaused}
        onTogglePause={() => {
          setIsPaused((p) => {
            const next = !p;
            simControlsRef.current.setIsPausedRef?.(next);
            return next;
          });
        }}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* 12. BOTTOM CONTROLS BAR */}
      <div className="experiment-controls-bar">
        <button
          type="button"
          className={`toggle-chip ${showVectors ? "active" : ""}`}
          onClick={() => setShowVectors((prev) => !prev)}
          title="Toggle vector arrows (Key: V)"
        >
          <span>📐</span> Vectors: {showVectors ? "ON" : "OFF"}
        </button>

        <button
          type="button"
          className={`toggle-chip ${showInvisible ? "active" : ""}`}
          onClick={() => setShowInvisible((prev) => !prev)}
          title="Show hand interaction field ring"
        >
          <span>👁️</span> Force Field: {showInvisible ? "ON" : "OFF"}
        </button>

        <button
          type="button"
          className={`toggle-chip ${explainVoice ? "active voice-active" : ""}`}
          onClick={() => setExplainVoice((prev) => !prev)}
          title="Narrate physics events with browser voice"
        >
          <span>🔊</span> Voice Explain: {explainVoice ? "ON" : "OFF"}
        </button>

        <button
          type="button"
          className="toggle-chip"
          onClick={() => simControlsRef.current.resetSim?.(activeExpId)}
          title="Reset active simulation (Key: R)"
        >
          <span>↺</span> Reset Simulation
        </button>
      </div>

      {/* 13. DR. NOVA AI TUTOR (FLOATING PANEL) */}
      <PhysicsAssistant
        getLabSnapshot={getLabSnapshot}
        activeExperiment={activeExperiment}
      />

      {/* 14. HOW TO PERFORM MODAL */}
      <HowToPerformModal
        experiment={activeExperiment}
        isOpen={isHowToOpen}
        onClose={() => setIsHowToOpen(false)}
      />

      {/* 15. EXPERIMENT QUIZ MODAL */}
      <ExperimentQuizModal
        experiment={activeExperiment}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onQuizCompleted={handleQuizCompleted}
      />

      {/* 16. OFFICIAL LAB REPORT MODAL */}
      <LabReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        experiment={activeExperiment}
        physicsData={physicsState}
        quizResult={lastQuizResult || { score: quizScoreBadge || 100 }}
        studentName={studentName}
      />

      {/* 17. PLATFORM DEMO & WALKTHROUGH MODAL */}
      <ProjectIntroModal
        isOpen={isIntroOpen}
        onClose={() => setIsIntroOpen(false)}
        onLaunchLab={handleSelectExperiment}
      />
    </div>
  );
}