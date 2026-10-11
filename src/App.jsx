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
import QuestModeBar from "./components/HandForceLab/QuestModeBar";
import QuestMissionPanel from "./components/HandForceLab/QuestMissionPanel";
import QuestPredictionPanel from "./components/HandForceLab/QuestPredictionPanel";
import QuestCelebrationModal from "./components/HandForceLab/QuestCelebrationModal";
import QuestRanksModal from "./components/HandForceLab/QuestRanksModal";
import LabReportModal from "./components/HandForceLab/LabReportModal";
import ProjectIntroModal from "./components/portal/ProjectIntroModal";
import { EXPERIMENTS, EXPERIMENT_LIST } from "./data/experimentsData";
import { QUEST_MISSIONS, QUEST_PREDICTIONS } from "./data/questMissionsData";
import { getExperimentRecord } from "./auth/experimentStorage";
import { getDisplayName, getSession, getCurrentUser } from "./auth/authStorage";
import {
  getQuestProfile,
  completeQuestMission,
  recordQuestPrediction
} from "./auth/questStorage";
import { evaluatePhysicsEvents } from "./services/physicsEventEngine";
import {
  updatePendulumRK4,
  computePendulumSmallAnglePeriod,
  computeElectricFieldVector,
  computeElectricPotential,
  computeOpticsRays,
  updateInclinedPlaneMotion
} from "./physics/physicsFormulas";

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

  // Physics Quest State
  const [questMode, setQuestMode] = useState("missions"); // 'learn' | 'missions' | 'prediction' | 'freeplay'
  const [questProfile, setQuestProfile] = useState(() => getQuestProfile());
  const [isRanksOpen, setIsRanksOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
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

  // Experiment 6: Simple Pendulum
  const [pendulumLength, setPendulumLength] = useState(1.5); // m
  const [pendulumAngle, setPendulumAngle] = useState(30); // deg
  const [pendulumMass, setPendulumMass] = useState(0.8); // kg

  // Experiment 7: Electric Field & Charges
  const [charge1Q, setCharge1Q] = useState(2.0); // μC
  const [charge2Q, setCharge2Q] = useState(-2.0); // μC
  const [chargeTestQ, setChargeTestQ] = useState(1.0); // μC

  // Experiment 8: Wave Interference
  const [waveA1, setWaveA1] = useState(1.0); // m
  const [waveA2, setWaveA2] = useState(1.0); // m
  const [wavePhaseDeg, setWavePhaseDeg] = useState(0); // deg
  const [waveFreq, setWaveFreq] = useState(1.0); // Hz

  // Experiment 9: Reflection & Refraction
  const [opticsIncidentAngle, setOpticsIncidentAngle] = useState(45); // deg
  const [opticsN1, setOpticsN1] = useState(1.0);
  const [opticsN2, setOpticsN2] = useState(1.5);

  // Experiment 10: Friction & Inclined Plane
  const [inclineAngle, setInclineAngle] = useState(25); // deg
  const [inclineMass, setInclineMass] = useState(1.0); // kg
  const [inclineMuStatic, setInclineMuStatic] = useState(0.45);
  const [inclineMuKinetic, setInclineMuKinetic] = useState(0.30);

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
    hasInteracted: false,
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
    isAirborne: false,
    // 6. Pendulum-specific
    thetaDeg: 30,
    pendulumLength: 1.5,
    pendulumMass: 0.8,
    pendulumPeriodTheo: 2.46,
    pendulumOmega: 0,
    // 7. Electric-specific
    charge1Q: 2.0,
    charge2Q: -2.0,
    chargeTestQ: 1.0,
    electricFieldMag: 0,
    electricPotential: 0,
    // 8. Wave-specific
    waveA1: 1.0,
    waveA2: 1.0,
    wavePhaseDeg: 0,
    waveFreq: 1.0,
    waveResultantAmp: 2.0,
    waveRegime: 'constructive',
    // 9. Optics-specific
    opticsIncidentAngle: 45,
    opticsN1: 1.0,
    opticsN2: 1.5,
    opticsRefractAngle: 28.1,
    isTIR: false,
    // 10. Incline-specific
    inclineAngle: 25,
    inclineMass: 1.0,
    inclineMuStatic: 0.45,
    inclineMuKinetic: 0.30,
    inclineNormalForce: 8.88,
    inclineFrictionForce: 2.66,
    inclineNetForce: 1.48,
    inclineAccel: 1.48,
    inclineIsSlipping: true
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
  });

  // Settings Ref to provide current dynamic settings to the simulation loop without recreating the Three.js lifecycle
  const settingsRef = useRef({
    appliedForceManual,
    cameraEnabled,
    collisionType,
    explainVoice,
    mass,
    pendulumAngle,
    showInvisible,
    showVectors
  });

  useEffect(() => {
    settingsRef.current = {
      appliedForceManual,
      cameraEnabled,
      collisionType,
      explainVoice,
      mass,
      pendulumAngle,
      showInvisible,
      showVectors
    };
  }, [
    appliedForceManual,
    cameraEnabled,
    collisionType,
    explainVoice,
    mass,
    pendulumAngle,
    showInvisible,
    showVectors
  ]);

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

  // Sync Experiments 6-10 settings into simulation
  useEffect(() => {
    simControlsRef.current.setPendulumLengthRef?.(pendulumLength);
  }, [pendulumLength]);

  useEffect(() => {
    simControlsRef.current.setPendulumAngleRef?.(pendulumAngle);
  }, [pendulumAngle]);

  useEffect(() => {
    simControlsRef.current.setPendulumMassRef?.(pendulumMass);
  }, [pendulumMass]);

  useEffect(() => {
    simControlsRef.current.setCharge1QRef?.(charge1Q);
  }, [charge1Q]);

  useEffect(() => {
    simControlsRef.current.setCharge2QRef?.(charge2Q);
  }, [charge2Q]);

  useEffect(() => {
    simControlsRef.current.setChargeTestQRef?.(chargeTestQ);
  }, [chargeTestQ]);

  useEffect(() => {
    simControlsRef.current.setWaveA1Ref?.(waveA1);
  }, [waveA1]);

  useEffect(() => {
    simControlsRef.current.setWaveA2Ref?.(waveA2);
  }, [waveA2]);

  useEffect(() => {
    simControlsRef.current.setWavePhaseDegRef?.(wavePhaseDeg);
  }, [wavePhaseDeg]);

  useEffect(() => {
    simControlsRef.current.setWaveFreqRef?.(waveFreq);
  }, [waveFreq]);

  useEffect(() => {
    simControlsRef.current.setOpticsIncidentAngleRef?.(opticsIncidentAngle);
  }, [opticsIncidentAngle]);

  useEffect(() => {
    simControlsRef.current.setOpticsN1Ref?.(opticsN1);
  }, [opticsN1]);

  useEffect(() => {
    simControlsRef.current.setOpticsN2Ref?.(opticsN2);
  }, [opticsN2]);

  useEffect(() => {
    simControlsRef.current.setInclineAngleRef?.(inclineAngle);
  }, [inclineAngle]);

  useEffect(() => {
    simControlsRef.current.setInclineMassRef?.(inclineMass);
  }, [inclineMass]);

  useEffect(() => {
    simControlsRef.current.setInclineMuStaticRef?.(inclineMuStatic);
  }, [inclineMuStatic]);

  useEffect(() => {
    simControlsRef.current.setInclineMuKineticRef?.(inclineMuKinetic);
  }, [inclineMuKinetic]);

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

  // Handle Physics Quest Mission Completion & Claim
  const handleClaimMission = useCallback((mission) => {
    const user = getCurrentUser();
    const userKey = user?.email || user?.id || null;
    const prevLevel = questProfile.level;
    const res = completeQuestMission(
      activeExpId,
      mission.id,
      mission.xpReward,
      { title: mission.title, tier: mission.tier },
      userKey
    );
    if (!res.alreadyCompleted) {
      setQuestProfile(res.profile);
      const isLevelUp = res.profile.level > prevLevel;
      const unlAch = res.profile.achievementsList?.find(
        (a) => a.isUnlocked && !questProfile.achievements?.includes(a.id)
      );
      setCelebrationData({
        title: `${mission.badge} ${mission.title}`,
        subtitle: `Mission Completed in ${activeExperiment.title}!`,
        xpAwarded: res.xpAwarded,
        tier: mission.tier,
        newLevel: isLevelUp ? res.profile.level : null,
        levelTitle: isLevelUp ? res.profile.title : "",
        unlockedAchievement: unlAch || null
      });
      setIsCelebrationOpen(true);
    }
  }, [activeExpId, activeExperiment.title, questProfile.achievements, questProfile.level]);

  // Handle Scientific Hypothesis Prediction Submission
  const handleRecordPrediction = useCallback((predId, selectedOpt, isCorrect) => {
    const user = getCurrentUser();
    const userKey = user?.email || user?.id || null;
    const prevLevel = questProfile.level;
    const xp = isCorrect ? 75 : 25;
    const res = recordQuestPrediction(
      activeExpId,
      predId,
      selectedOpt,
      isCorrect,
      xp,
      userKey
    );
    setQuestProfile(res.profile);
    const isLevelUp = res.profile.level > prevLevel;
    const unlAch = res.profile.achievementsList?.find(
      (a) => a.isUnlocked && !questProfile.achievements?.includes(a.id)
    );
    setCelebrationData({
      title: isCorrect ? "Hypothesis Confirmed!" : "Hypothesis Tested!",
      subtitle: isCorrect
        ? "Your physical intuition aligns with empirical physics."
        : "Science progresses through empirical testing and refutation.",
      xpAwarded: res.xpAwarded,
      tier: "prediction",
      newLevel: isLevelUp ? res.profile.level : null,
      levelTitle: isLevelUp ? res.profile.title : "",
      unlockedAchievement: unlAch || null
    });
    setIsCelebrationOpen(true);
  }, [activeExpId, questProfile.achievements, questProfile.level]);

  // Update quiz badge and award Quiz Performance XP when quiz finishes
  const handleQuizCompleted = useCallback((result) => {
    setQuizScoreBadge(result.score);
    setLastQuizResult(result);
    if (result?.score >= 60) {
      const user = getCurrentUser();
      const userKey = user?.email || user?.id || null;
      const prevLevel = questProfile.level;
      const xpReward = result.score === 100 ? 120 : 60;
      const res = completeQuestMission(
        activeExpId,
        `${activeExpId}_quiz_${result.score >= 100 ? "perfect" : "pass"}`,
        xpReward,
        { title: `Quiz Mastery (${result.score}%)`, tier: result.score === 100 ? "expert" : "intermediate" },
        userKey
      );
      if (!res.alreadyCompleted) {
        setQuestProfile(res.profile);
        const isLevelUp = res.profile.level > prevLevel;
        setCelebrationData({
          title: `🎓 Quiz Mastery (${result.score}%)`,
          subtitle: `Earned quiz performance XP in ${activeExperiment.title}!`,
          xpAwarded: res.xpAwarded,
          tier: "quiz",
          newLevel: isLevelUp ? res.profile.level : null,
          levelTitle: isLevelUp ? res.profile.title : ""
        });
        setIsCelebrationOpen(true);
      }
    }
  }, [activeExpId, activeExperiment.title, questProfile.level]);

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
      },
      // 6. Simple Pendulum
      pendulum: {
        pivotX: 0,
        pivotY: 0.65,
        length: 1.5,
        mass: 0.8,
        theta: (30 * Math.PI) / 180,
        omega: 0,
        alpha: 0,
        gravity: 9.8,
        damping: 0.05,
        isGrabbed: false
      },
      // 7. Electric Field & Charges
      electric: {
        charges: [
          { id: 'q1', x: -0.45, y: 0, q: 2.0, radius: 0.06 },
          { id: 'q2', x: 0.45, y: 0, q: -2.0, radius: 0.06 }
        ],
        probe: { x: 0, y: 0.35, q: 1.0, vx: 0, vy: 0, radius: 0.045 },
        isProbeGrabbed: false
      },
      // 8. Wave Interference
      wave: {
        a1: 1.0,
        a2: 1.0,
        freq: 1.0,
        phaseDeg: 0,
        phaseRad: 0
      },
      // 9. Reflection & Refraction (Optics)
      optics: {
        incidentAngleDeg: 45,
        n1: 1.0,
        n2: 1.5
      },
      // 10. Friction & Inclined Plane
      incline: {
        angleDeg: 25,
        mass: 1.0,
        muStatic: 0.45,
        muKinetic: 0.30,
        blockDist: 0.9,
        blockVelocity: 0,
        isSlipping: false,
        gravity: 9.8
      }
    };

    let simPaused = false;
    let currentShowVectors = settingsRef.current.showVectors;
    let currentShowInvisible = settingsRef.current.showInvisible;
    let currentVoiceEnabled = settingsRef.current.explainVoice;
    let currentAppliedForce = settingsRef.current.appliedForceManual;
    let currentCollisionType = settingsRef.current.collisionType;
    let isWebcamEnabled = settingsRef.current.cameraEnabled;
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

    // Setters for Experiments 6-10
    simControlsRef.current.setPendulumLengthRef = (l) => {
      simState.pendulum.length = l;
    };
    simControlsRef.current.setPendulumAngleRef = (ang) => {
      simState.pendulum.theta = (ang * Math.PI) / 180;
      simState.pendulum.omega = 0;
    };
    simControlsRef.current.setPendulumMassRef = (m) => {
      simState.pendulum.mass = m;
    };
    simControlsRef.current.setCharge1QRef = (q) => {
      simState.electric.charges[0].q = q;
    };
    simControlsRef.current.setCharge2QRef = (q) => {
      simState.electric.charges[1].q = q;
    };
    simControlsRef.current.setChargeTestQRef = (q) => {
      simState.electric.probe.q = q;
    };
    simControlsRef.current.resetCharges = () => {
      simState.electric.charges[0].x = -0.45;
      simState.electric.charges[0].y = 0;
      simState.electric.charges[1].x = 0.45;
      simState.electric.charges[1].y = 0;
      simState.electric.probe.x = 0;
      simState.electric.probe.y = 0.35;
    };
    simControlsRef.current.setWaveA1Ref = (a) => {
      simState.wave.a1 = a;
    };
    simControlsRef.current.setWaveA2Ref = (a) => {
      simState.wave.a2 = a;
    };
    simControlsRef.current.setWavePhaseDegRef = (p) => {
      simState.wave.phaseDeg = p;
      simState.wave.phaseRad = (p * Math.PI) / 180;
    };
    simControlsRef.current.setWaveFreqRef = (f) => {
      simState.wave.freq = f;
    };
    simControlsRef.current.setOpticsIncidentAngleRef = (ang) => {
      simState.optics.incidentAngleDeg = ang;
    };
    simControlsRef.current.setOpticsN1Ref = (n) => {
      simState.optics.n1 = n;
    };
    simControlsRef.current.setOpticsN2Ref = (n) => {
      simState.optics.n2 = n;
    };
    simControlsRef.current.swapOpticsMedia = () => {
      const prevN1 = simState.optics.n1;
      simState.optics.n1 = simState.optics.n2;
      simState.optics.n2 = prevN1;
      setOpticsN1(simState.optics.n1);
      setOpticsN2(simState.optics.n2);
    };
    simControlsRef.current.setInclineAngleRef = (ang) => {
      simState.incline.angleDeg = ang;
    };
    simControlsRef.current.setInclineMassRef = (m) => {
      simState.incline.mass = m;
    };
    simControlsRef.current.setInclineMuStaticRef = (s) => {
      simState.incline.muStatic = s;
    };
    simControlsRef.current.setInclineMuKineticRef = (k) => {
      simState.incline.muKinetic = k;
    };
    simControlsRef.current.resetInclineBlock = () => {
      simState.incline.blockDist = 0.9;
      simState.incline.blockVelocity = 0;
    };
    simControlsRef.current.getSimState = () => simState;

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
      } else if (expId === "pendulum") {
        simState.pendulum.theta = (settingsRef.current.pendulumAngle * Math.PI) / 180;
        simState.pendulum.omega = 0;
        simState.pendulum.alpha = 0;
      } else if (expId === "electric") {
        simControlsRef.current.resetCharges?.();
      } else if (expId === "wave") {
        simState.wave.phaseDeg = 0;
        simState.wave.phaseRad = 0;
      } else if (expId === "optics") {
        simState.optics.incidentAngleDeg = 45;
      } else if (expId === "incline") {
        simState.incline.blockDist = 0.9;
        simState.incline.blockVelocity = 0;
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

      // --- Group 6: Simple Pendulum ---
      const pendulumGroup = new THREE.Group();
      const pivotMount = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.18, 16),
        new THREE.MeshBasicMaterial({ color: 0x38d9ff })
      );
      pivotMount.position.set(0, 0.65, 0);
      pivotMount.rotation.z = Math.PI / 2;
      pendulumGroup.add(pivotMount);

      // Equilibrium dashed line (theta = 0)
      const eqLineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.65, 0),
        new THREE.Vector3(0, -0.65, 0)
      ]);
      const eqLine = new THREE.Line(
        eqLineGeom,
        new THREE.LineDashedMaterial({
          color: 0x38d9ff,
          dashSize: 0.04,
          gapSize: 0.03,
          transparent: true,
          opacity: 0.35
        })
      );
      eqLine.computeLineDistances();
      pendulumGroup.add(eqLine);

      // Pendulum String / Rod
      const rodGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.65, 0),
        new THREE.Vector3(0, 0, 0)
      ]);
      const pendulumRod = new THREE.Line(
        rodGeom,
        new THREE.LineBasicMaterial({ color: 0x38d9ff, linewidth: 2 })
      );
      pendulumGroup.add(pendulumRod);

      // Bob sphere
      const pendulumBob = createGlowSphere(0.075, 0x00f0ff);
      pendulumGroup.add(pendulumBob.group);

      // Angle indicator arc
      const ARC_PTS = 24;
      const arcPositions = new Float32Array(ARC_PTS * 3);
      const arcGeometry = new THREE.BufferGeometry();
      arcGeometry.setAttribute("position", new THREE.BufferAttribute(arcPositions, 3));
      const pendulumArc = new THREE.Line(
        arcGeometry,
        new THREE.LineBasicMaterial({ color: 0xffbb33, transparent: true, opacity: 0.6 })
      );
      pendulumGroup.add(pendulumArc);
      scene.add(pendulumGroup);

      // --- Group 7: Electric Field & Charges ---
      const electricGroup = new THREE.Group();
      const charge1Mesh = createGlowSphere(0.07, 0xff3b69); // Q1 Positive (Pink/Red)
      const charge2Mesh = createGlowSphere(0.07, 0x38d9ff); // Q2 Negative (Cyan)
      const probeMesh = createGlowSphere(0.045, 0xffbb33);  // Test Probe (Amber)
      electricGroup.add(charge1Mesh.group);
      electricGroup.add(charge2Mesh.group);
      electricGroup.add(probeMesh.group);

      // Equipotential contour rings around charge 1 and 2
      const makeEquiRing = (rad, colorHex) => {
        return new THREE.Mesh(
          new THREE.RingGeometry(rad - 0.005, rad, 48),
          new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
        );
      };
      const eqRingsQ1 = [makeEquiRing(0.16, 0xff3b69), makeEquiRing(0.32, 0xff3b69)];
      const eqRingsQ2 = [makeEquiRing(0.16, 0x38d9ff), makeEquiRing(0.32, 0x38d9ff)];
      eqRingsQ1.forEach(r => charge1Mesh.group.add(r));
      eqRingsQ2.forEach(r => charge2Mesh.group.add(r));

      // Grid of electric field direction needles (7 cols x 5 rows = 35 vectors)
      const FIELD_COLS = 7;
      const FIELD_ROWS = 5;
      const fieldArrows = [];
      for (let r = 0; r < FIELD_ROWS; r++) {
        for (let c = 0; c < FIELD_COLS; c++) {
          const gx = ((c / (FIELD_COLS - 1)) - 0.5) * (aspect * 1.6);
          const gy = ((r / (FIELD_ROWS - 1)) - 0.5) * 1.4;
          const arrow = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(gx, gy, 0),
            0.05,
            0x29b6f6,
            0.035,
            0.02
          );
          arrow.userData = { origX: gx, origY: gy };
          fieldArrows.push(arrow);
          electricGroup.add(arrow);
        }
      }
      scene.add(electricGroup);

      // --- Group 8: Wave Interference (Superposition) ---
      const waveGroup = new THREE.Group();
      const WAVE_POINTS = 80;

      // Baseline reference (y = 0)
      const waveBaseGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-aspect, 0, 0),
        new THREE.Vector3(aspect, 0, 0)
      ]);
      const waveBaseLine = new THREE.Line(
        waveBaseGeom,
        new THREE.LineBasicMaterial({ color: 0x167cff, transparent: true, opacity: 0.3 })
      );
      waveGroup.add(waveBaseLine);

      // Wave 1 ribbon (Cyan)
      const wave1Positions = new Float32Array(WAVE_POINTS * 3);
      const wave1Geometry = new THREE.BufferGeometry();
      wave1Geometry.setAttribute("position", new THREE.BufferAttribute(wave1Positions, 3));
      const wave1Line = new THREE.Line(
        wave1Geometry,
        new THREE.LineBasicMaterial({ color: 0x38d9ff, transparent: true, opacity: 0.7 })
      );
      waveGroup.add(wave1Line);

      // Wave 2 ribbon (Magenta)
      const wave2Positions = new Float32Array(WAVE_POINTS * 3);
      const wave2Geometry = new THREE.BufferGeometry();
      wave2Geometry.setAttribute("position", new THREE.BufferAttribute(wave2Positions, 3));
      const wave2Line = new THREE.Line(
        wave2Geometry,
        new THREE.LineBasicMaterial({ color: 0xe040fb, transparent: true, opacity: 0.7 })
      );
      waveGroup.add(wave2Line);

      // Resultant Superposition wave (Golden Yellow glowing)
      const waveResPositions = new Float32Array(WAVE_POINTS * 3);
      const waveResGeometry = new THREE.BufferGeometry();
      waveResGeometry.setAttribute("position", new THREE.BufferAttribute(waveResPositions, 3));
      const waveResLine = new THREE.Line(
        waveResGeometry,
        new THREE.LineBasicMaterial({
          color: 0xffbb33,
          linewidth: 3,
          blending: THREE.AdditiveBlending
        })
      );
      waveGroup.add(waveResLine);
      scene.add(waveGroup);

      // --- Group 9: Reflection & Refraction (Optics) ---
      const opticsGroup = new THREE.Group();

      // Optical interface line at y = 0
      const interfaceGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-aspect, 0, 0),
        new THREE.Vector3(aspect, 0, 0)
      ]);
      const interfaceLine = new THREE.Line(
        interfaceGeom,
        new THREE.LineBasicMaterial({ color: 0x38d9ff, linewidth: 2 })
      );
      opticsGroup.add(interfaceLine);

      // Medium 2 lower backdrop
      const med2Plane = new THREE.Mesh(
        new THREE.PlaneGeometry(aspect * 2, 1.2),
        new THREE.MeshBasicMaterial({ color: 0x0d3b66, transparent: true, opacity: 0.35 })
      );
      med2Plane.position.set(0, -0.6, -0.05);
      opticsGroup.add(med2Plane);

      // Normal reference line (dashed vertical at x = 0)
      const normalGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.8, 0),
        new THREE.Vector3(0, -0.8, 0)
      ]);
      const normalLine = new THREE.Line(
        normalGeom,
        new THREE.LineDashedMaterial({
          color: 0xffffff,
          dashSize: 0.04,
          gapSize: 0.03,
          transparent: true,
          opacity: 0.5
        })
      );
      normalLine.computeLineDistances();
      opticsGroup.add(normalLine);

      // Laser emitter head
      const laserEmitter = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.06, 0.04),
        new THREE.MeshBasicMaterial({ color: 0x31f2a1 })
      );
      opticsGroup.add(laserEmitter);

      // Incident ray (Emitter -> (0,0))
      const incRayGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.6, 0.6, 0),
        new THREE.Vector3(0, 0, 0)
      ]);
      const incRayLine = new THREE.Line(
        incRayGeom,
        new THREE.LineBasicMaterial({ color: 0x31f2a1, linewidth: 2 })
      );
      opticsGroup.add(incRayLine);

      // Reflected ray ((0,0) -> surface upper right)
      const reflRayGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.6, 0.6, 0)
      ]);
      const reflRayLine = new THREE.Line(
        reflRayGeom,
        new THREE.LineBasicMaterial({ color: 0x31f2a1, transparent: true, opacity: 0.7 })
      );
      opticsGroup.add(reflRayLine);

      // Refracted ray ((0,0) -> medium 2 lower right)
      const refrRayGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.4, -0.7, 0)
      ]);
      const refrRayLine = new THREE.Line(
        refrRayGeom,
        new THREE.LineBasicMaterial({ color: 0x38d9ff, linewidth: 2 })
      );
      opticsGroup.add(refrRayLine);
      scene.add(opticsGroup);

      // --- Group 10: Friction & Inclined Plane ---
      const inclineGroup = new THREE.Group();

      // Ramp triangular wedge line
      const rampGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.85, -0.55, 0),
        new THREE.Vector3(0.55, -0.55, 0),
        new THREE.Vector3(0.55, 0.15, 0),
        new THREE.Vector3(-0.85, -0.55, 0)
      ]);
      const rampMesh = new THREE.Line(
        rampGeom,
        new THREE.LineBasicMaterial({ color: 0x38d9ff, linewidth: 2 })
      );
      inclineGroup.add(rampMesh);

      // Sliding block
      const blockMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.08, 0.06),
        new THREE.MeshBasicMaterial({ color: 0xffbb33 })
      );
      inclineGroup.add(blockMesh);

      // Ramp Force Vectors
      const inclineWeightArrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 0),
        0.25,
        0xffdd55,
        0.05,
        0.03
      );
      const inclineNormalArrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        0.22,
        0x38d9ff,
        0.05,
        0.03
      );
      const inclineFricArrow = new THREE.ArrowHelper(
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 0, 0),
        0.18,
        0xff5555,
        0.05,
        0.03
      );
      inclineGroup.add(inclineWeightArrow);
      inclineGroup.add(inclineNormalArrow);
      inclineGroup.add(inclineFricArrow);
      scene.add(inclineGroup);

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
        pendulumGroup.visible = currentExp === "pendulum";
        electricGroup.visible = currentExp === "electric";
        waveGroup.visible = currentExp === "wave";
        opticsGroup.visible = currentExp === "optics";
        inclineGroup.visible = currentExp === "incline";

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

        // -----------------------------------------------------
        // EXPERIMENT 6: SIMPLE HARMONIC PENDULUM
        // -----------------------------------------------------
        else if (currentExp === "pendulum") {
          const pend = simState.pendulum;
          const currentBobX = pend.pivotX + pend.length * Math.sin(pend.theta);
          const currentBobY = pend.pivotY - pend.length * Math.cos(pend.theta);

          // Interaction: Drag bob with hand or mouse pointer
          if (primaryHand && !effectiveFrozen) {
            const dx = primaryHand.x - pend.pivotX;
            const dy = primaryHand.y - pend.pivotY;
            const handAngle = Math.atan2(dx, -dy);
            const distToBob = Math.sqrt(
              Math.pow(primaryHand.x - currentBobX, 2) + Math.pow(primaryHand.y - currentBobY, 2)
            );

            if (distToBob < 0.35 || pend.isGrabbed) {
              pend.isGrabbed = true;
              pend.theta = Math.max(-1.1, Math.min(1.1, handAngle));
              pend.omega = 0;
            } else {
              pend.isGrabbed = false;
            }
          } else {
            pend.isGrabbed = false;
          }

          if (!pend.isGrabbed && !effectiveFrozen) {
            const nextState = updatePendulumRK4({
              theta: pend.theta,
              omega: pend.omega,
              length: pend.length,
              mass: pend.mass,
              gravity: pend.gravity,
              damping: pend.damping,
              dt
            });
            pend.theta = nextState.theta;
            pend.omega = nextState.omega;
            pend.alpha = nextState.alpha;
          }

          const updatedBobX = pend.pivotX + pend.length * Math.sin(pend.theta);
          const updatedBobY = pend.pivotY - pend.length * Math.cos(pend.theta);
          pendulumBob.group.position.set(updatedBobX, updatedBobY, 0);

          const rodPts = pendulumRod.geometry.attributes.position.array;
          rodPts[0] = pend.pivotX; rodPts[1] = pend.pivotY; rodPts[2] = 0;
          rodPts[3] = updatedBobX; rodPts[4] = updatedBobY; rodPts[5] = 0;
          pendulumRod.geometry.attributes.position.needsUpdate = true;

          const arcPts = pendulumArc.geometry.attributes.position.array;
          const arcR = 0.28;
          for (let i = 0; i < ARC_PTS; i++) {
            const a = (i / (ARC_PTS - 1)) * pend.theta;
            arcPts[i * 3] = pend.pivotX + arcR * Math.sin(a);
            arcPts[i * 3 + 1] = pend.pivotY - arcR * Math.cos(a);
            arcPts[i * 3 + 2] = 0;
          }
          pendulumArc.geometry.attributes.position.needsUpdate = true;

          const speed = Math.abs(pend.length * pend.omega);
          currentSpeedMag = speed;
          currentAccelMag = Math.abs(pend.length * pend.alpha);
          currentForceMag = pend.mass * pend.gravity * Math.abs(Math.sin(pend.theta));

          if (currentShowVectors && speed > 0.05) {
            velocityArrow.position.set(updatedBobX, updatedBobY, 0);
            const dirX = Math.cos(pend.theta) * (pend.omega >= 0 ? 1 : -1);
            const dirY = Math.sin(pend.theta) * (pend.omega >= 0 ? 1 : -1);
            velocityArrow.setDirection(new THREE.Vector3(dirX, dirY, 0).normalize());
            velocityArrow.setLength(Math.min(0.45, speed * 0.2), 0.05, 0.03);
            velocityArrow.visible = true;
          } else {
            velocityArrow.visible = false;
          }
          forceArrow.visible = false;
          accelArrow.visible = false;
        }

        // -----------------------------------------------------
        // EXPERIMENT 7: ELECTRIC FIELD & CHARGES
        // -----------------------------------------------------
        else if (currentExp === "electric") {
          const ele = simState.electric;
          const q1 = ele.charges[0];
          const q2 = ele.charges[1];
          const probe = ele.probe;

          if (primaryHand && !effectiveFrozen) {
            probe.x = Math.max(-aspect + 0.1, Math.min(aspect - 0.1, primaryHand.x));
            probe.y = Math.max(-0.85, Math.min(0.85, primaryHand.y));
          }

          const fieldAtProbe = computeElectricFieldVector(
            [ { x: q1.x, y: q1.y, q: q1.q }, { x: q2.x, y: q2.y, q: q2.q } ],
            probe.x,
            probe.y
          );

          charge1Mesh.group.position.set(q1.x, q1.y, 0);
          charge2Mesh.group.position.set(q2.x, q2.y, 0);
          probeMesh.group.position.set(probe.x, probe.y, 0);

          for (let i = 0; i < fieldArrows.length; i++) {
            const arr = fieldArrows[i];
            const gx = arr.userData.origX;
            const gy = arr.userData.origY;
            const fv = computeElectricFieldVector(
              [ { x: q1.x, y: q1.y, q: q1.q }, { x: q2.x, y: q2.y, q: q2.q } ],
              gx,
              gy
            );
            if (fv.magnitude > 0.001) {
              arr.setDirection(new THREE.Vector3(fv.Ex, fv.Ey, 0).normalize());
              const visualLen = Math.min(0.14, 0.04 + Math.log10(1 + fv.magnitude) * 0.05);
              arr.setLength(visualLen, visualLen * 0.35, visualLen * 0.25);
              arr.visible = true;
            } else {
              arr.visible = false;
            }
          }

          currentForceMag = fieldAtProbe.magnitude * Math.abs(probe.q);
          currentSpeedMag = 0;
          currentAccelMag = currentForceMag;

          if (currentShowVectors && fieldAtProbe.magnitude > 0.01) {
            forceArrow.position.set(probe.x, probe.y, 0);
            const fx = fieldAtProbe.Ex * probe.q;
            const fy = fieldAtProbe.Ey * probe.q;
            forceArrow.setDirection(new THREE.Vector3(fx, fy, 0).normalize());
            forceArrow.setLength(Math.min(0.5, currentForceMag * 0.08), 0.06, 0.04);
            forceArrow.visible = true;
          } else {
            forceArrow.visible = false;
          }
          velocityArrow.visible = false;
          accelArrow.visible = false;
        }

        // -----------------------------------------------------
        // EXPERIMENT 8: WAVE INTERFERENCE
        // -----------------------------------------------------
        else if (currentExp === "wave") {
          const w = simState.wave;

          if (primaryHand && !effectiveFrozen) {
            const normY = (primaryHand.y + 0.6) / 1.2;
            const targetPhase = Math.round(Math.max(0, Math.min(1, normY)) * 360);
            w.phaseDeg = targetPhase;
            w.phaseRad = (targetPhase * Math.PI) / 180;
          }

          const w1Arr = wave1Line.geometry.attributes.position.array;
          const w2Arr = wave2Line.geometry.attributes.position.array;
          const wResArr = waveResLine.geometry.attributes.position.array;

          const spanX = aspect * 1.8;
          const k = 4.0;
          const omega = 2 * Math.PI * w.freq;

          for (let i = 0; i < WAVE_POINTS; i++) {
            const x = -aspect * 0.9 + (i / (WAVE_POINTS - 1)) * spanX;
            const y1 = (w.a1 * 0.22) * Math.sin(k * x - omega * totalSimTime);
            const y2 = (w.a2 * 0.22) * Math.sin(k * x - omega * totalSimTime + w.phaseRad);
            const yRes = y1 + y2;

            w1Arr[i * 3] = x; w1Arr[i * 3 + 1] = y1 + 0.35; w1Arr[i * 3 + 2] = 0;
            w2Arr[i * 3] = x; w2Arr[i * 3 + 1] = y2 - 0.35; w2Arr[i * 3 + 2] = 0;
            wResArr[i * 3] = x; wResArr[i * 3 + 1] = yRes; wResArr[i * 3 + 2] = 0;
          }
          wave1Line.geometry.attributes.position.needsUpdate = true;
          wave2Line.geometry.attributes.position.needsUpdate = true;
          waveResLine.geometry.attributes.position.needsUpdate = true;

          const resAmp = Math.sqrt(w.a1 * w.a1 + w.a2 * w.a2 + 2 * w.a1 * w.a2 * Math.cos(w.phaseRad));
          currentForceMag = resAmp;
          currentSpeedMag = w.freq;
          currentAccelMag = w.phaseDeg;

          forceArrow.visible = false;
          velocityArrow.visible = false;
          accelArrow.visible = false;
        }

        // -----------------------------------------------------
        // EXPERIMENT 9: REFLECTION & REFRACTION
        // -----------------------------------------------------
        else if (currentExp === "optics") {
          const opt = simState.optics;
          // Hand control: only update angle if user is actively pinching (aim gesture)
          if (primaryHand && !effectiveFrozen && primaryHand.pinching) {
            const dx = primaryHand.x;
            const dy = primaryHand.y;
            if (dy > 0.05) {
              const angDeg = Math.round(Math.abs(Math.atan2(-dx, dy) * (180 / Math.PI)));
              opt.incidentAngleDeg = Math.max(0, Math.min(85, angDeg));
            }
          }

          const rays = computeOpticsRays({
            incidentAngleDeg: opt.incidentAngleDeg,
            n1: opt.n1,
            n2: opt.n2
          });

          const incRad = (opt.incidentAngleDeg * Math.PI) / 180;
          const srcX = -0.75 * Math.sin(incRad);
          const srcY = 0.75 * Math.cos(incRad);

          laserEmitter.position.set(srcX, srcY, 0);
          laserEmitter.rotation.z = -incRad + Math.PI / 2;

          const incPts = incRayLine.geometry.attributes.position.array;
          incPts[0] = srcX; incPts[1] = srcY; incPts[2] = 0;
          incPts[3] = 0; incPts[4] = 0; incPts[5] = 0;
          incRayLine.geometry.attributes.position.needsUpdate = true;

          const reflRad = (rays.reflectionAngleDeg * Math.PI) / 180;
          const reflX = 0.75 * Math.sin(reflRad);
          const reflY = 0.75 * Math.cos(reflRad);
          const reflPts = reflRayLine.geometry.attributes.position.array;
          reflPts[0] = 0; reflPts[1] = 0; reflPts[2] = 0;
          reflPts[3] = reflX; reflPts[4] = reflY; reflPts[5] = 0;
          reflRayLine.geometry.attributes.position.needsUpdate = true;
          reflRayLine.material.opacity = rays.isTotalInternalReflection ? 1.0 : 0.65;

          const refrPts = refrRayLine.geometry.attributes.position.array;
          if (rays.isTotalInternalReflection) {
            refrRayLine.visible = false;
          } else {
            refrRayLine.visible = true;
            const refrRad = (rays.refractionAngleDeg * Math.PI) / 180;
            const refrX = 0.75 * Math.sin(refrRad);
            const refrY = -0.75 * Math.cos(refrRad);
            refrPts[0] = 0; refrPts[1] = 0; refrPts[2] = 0;
            refrPts[3] = refrX; refrPts[4] = refrY; refrPts[5] = 0;
            refrRayLine.geometry.attributes.position.needsUpdate = true;
          }

          currentForceMag = rays.isTotalInternalReflection ? 100 : opt.incidentAngleDeg;
          currentSpeedMag = rays.refractionAngleDeg || 0;
          currentAccelMag = rays.criticalAngleDeg || 0;

          forceArrow.visible = false;
          velocityArrow.visible = false;
          accelArrow.visible = false;
        }

        // -----------------------------------------------------
        // EXPERIMENT 10: FRICTION & INCLINED PLANE
        // -----------------------------------------------------
        else if (currentExp === "incline") {
          const inc = simState.incline;

          if (primaryHand && !effectiveFrozen) {
            const normY = (primaryHand.y + 0.3) / 0.8;
            inc.angleDeg = Math.round(Math.max(5, Math.min(60, normY * 60)));
            if (isFastImpulse) {
              inc.blockVelocity = 1.2;
            }
          }

          const angRad = (inc.angleDeg * Math.PI) / 180;
          const rampOriginX = -0.85;
          const rampOriginY = -0.55;
          const rampLen = 1.4;

          if (!effectiveFrozen) {
            const next = updateInclinedPlaneMotion({
              angleDeg: inc.angleDeg,
              mass: inc.mass,
              muStatic: inc.muStatic,
              muKinetic: inc.muKinetic,
              blockDist: inc.blockDist,
              blockVelocity: inc.blockVelocity,
              dt
            });
            inc.blockDist = next.blockDist;
            inc.blockVelocity = next.blockVelocity;
            inc.isSlipping = next.isSlipping;
          }

          const rampEndX = rampOriginX + rampLen * Math.cos(angRad);
          const rampEndY = rampOriginY + rampLen * Math.sin(angRad);
          const rampPts = rampMesh.geometry.attributes.position.array;
          rampPts[0] = rampOriginX; rampPts[1] = rampOriginY; rampPts[2] = 0;
          rampPts[3] = rampEndX; rampPts[4] = rampOriginY; rampPts[5] = 0;
          rampPts[6] = rampEndX; rampPts[7] = rampEndY; rampPts[8] = 0;
          rampPts[9] = rampOriginX; rampPts[10] = rampOriginY; rampPts[11] = 0;
          rampMesh.geometry.attributes.position.needsUpdate = true;

          const blockX = rampOriginX + inc.blockDist * Math.cos(angRad);
          const blockY = rampOriginY + inc.blockDist * Math.sin(angRad) + 0.04;
          blockMesh.position.set(blockX, blockY, 0);
          blockMesh.rotation.z = angRad;

          const weight = inc.mass * inc.gravity;
          const normF = weight * Math.cos(angRad);
          const fricF = inc.isSlipping ? inc.muKinetic * normF : weight * Math.sin(angRad);

          inclineWeightArrow.position.set(blockX, blockY, 0);
          inclineNormalArrow.position.set(blockX, blockY, 0);
          inclineNormalArrow.setDirection(new THREE.Vector3(-Math.sin(angRad), Math.cos(angRad), 0).normalize());
          inclineNormalArrow.setLength(Math.min(0.35, normF * 0.03), 0.04, 0.025);

          inclineFricArrow.position.set(blockX, blockY, 0);
          inclineFricArrow.setDirection(new THREE.Vector3(Math.cos(angRad), Math.sin(angRad), 0).normalize());
          inclineFricArrow.setLength(Math.min(0.3, fricF * 0.035), 0.04, 0.025);

          currentForceMag = fricF;
          currentSpeedMag = Math.abs(inc.blockVelocity);
          currentAccelMag = inc.isSlipping ? Math.abs((weight * Math.sin(angRad) - fricF) / inc.mass) : 0;

          forceArrow.visible = false;
          velocityArrow.visible = false;
          accelArrow.visible = false;
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
          } else if (currentExp === "pendulum") {
            const pend = simState.pendulum;
            const thetaDeg = (pend.theta * 180) / Math.PI;
            const theoPeriod = computePendulumSmallAnglePeriod(pend.length, pend.gravity);
            const u = pend.mass * pend.gravity * pend.length * (1 - Math.cos(pend.theta));
            const ke = 0.5 * pend.mass * Math.pow(pend.length * pend.omega, 2);

            telemetryRef.current = {
              experimentName: "Simple Pendulum",
              mass: pend.mass,
              velocity: Number(currentSpeedMag.toFixed(2)),
              acceleration: Number(currentAccelMag.toFixed(2)),
              displacement: Number(thetaDeg.toFixed(1)),
              time: Number(totalSimTime.toFixed(1)),
              isFrozen: effectiveFrozen
            };

            setPhysicsState({
              thetaDeg,
              pendulumLength: pend.length,
              pendulumMass: pend.mass,
              pendulumPeriodTheo: theoPeriod,
              pendulumOmega: pend.omega,
              potentialEnergy: u,
              kineticEnergy: ke,
              velocity: currentSpeedMag,
              acceleration: currentAccelMag,
              force: currentForceMag,
              hasInteracted: true
            });

            if (pend.isGrabbed) {
              setExplanation(`Holding pendulum bob at initial release angle θ = ${thetaDeg.toFixed(1)}°. Release to oscillate.`);
              setFormulaTag("θ₀ = " + thetaDeg.toFixed(0) + "°");
            } else if (Math.abs(pend.omega) > 0.05) {
              setExplanation(`Oscillating: T_theo = ${theoPeriod.toFixed(2)} s. Restoring torque τ = -m·g·L·sin(θ).`);
              setFormulaTag("T = 2π√(L/g)");
            } else {
              setExplanation("Pendulum resting near equilibrium. Drag bob sideways to set an oscillation angle!");
              setFormulaTag("SHM: d²θ/dt² = -(g/L)sinθ");
            }
          } else if (currentExp === "electric") {
            const ele = simState.electric;
            const q1 = ele.charges[0];
            const q2 = ele.charges[1];
            const probe = ele.probe;
            const fieldAtProbe = computeElectricFieldVector(
              [ { x: q1.x, y: q1.y, q: q1.q }, { x: q2.x, y: q2.y, q: q2.q } ],
              probe.x,
              probe.y
            );
            const potAtProbe = computeElectricPotential(
              [ { x: q1.x, y: q1.y, q: q1.q }, { x: q2.x, y: q2.y, q: q2.q } ],
              probe.x,
              probe.y
            );

            telemetryRef.current = {
              experimentName: "Electric Field & Charges",
              mass: 0.01,
              force: Number(currentForceMag.toFixed(2)),
              velocity: 0,
              time: Number(totalSimTime.toFixed(1)),
              isFrozen: effectiveFrozen
            };

            setPhysicsState({
              charge1Q: q1.q,
              charge2Q: q2.q,
              chargeTestQ: probe.q,
              electricFieldMag: fieldAtProbe.magnitude,
              electricPotential: potAtProbe,
              force: currentForceMag,
              posX: probe.x,
              posY: probe.y,
              hasInteracted: true
            });

            setExplanation(
              `Test probe at (${probe.x.toFixed(2)}, ${probe.y.toFixed(2)}) detects field |E| = ${fieldAtProbe.magnitude.toFixed(2)} N/C, potential V = ${potAtProbe.toFixed(1)} V.`
            );
            setFormulaTag("E = k_e · Σ(q_i / r_i²)");
          } else if (currentExp === "wave") {
            const w = simState.wave;
            const resAmp = Math.sqrt(w.a1 * w.a1 + w.a2 * w.a2 + 2 * w.a1 * w.a2 * Math.cos(w.phaseRad));
            const regime = Math.abs(w.phaseDeg - 180) < 15
              ? 'destructive'
              : (w.phaseDeg < 15 || w.phaseDeg > 345)
                ? 'constructive'
                : 'partial';

            telemetryRef.current = {
              experimentName: "Wave Interference",
              velocity: Number(w.freq.toFixed(1)),
              time: Number(totalSimTime.toFixed(1)),
              isFrozen: effectiveFrozen
            };

            setPhysicsState({
              waveA1: w.a1,
              waveA2: w.a2,
              wavePhaseDeg: w.phaseDeg,
              waveFreq: w.freq,
              waveResultantAmp: resAmp,
              waveRegime: regime,
              hasInteracted: true
            });

            if (regime === 'constructive') {
              setExplanation(`Constructive interference! Phase shift Δφ = ${w.phaseDeg}°: crests align, reinforcing amplitude to ${resAmp.toFixed(2)} m.`);
              setFormulaTag("A_res = A₁ + A₂ (Constructive)");
            } else if (regime === 'destructive') {
              setExplanation(`Destructive cancellation! Phase shift Δφ = ${w.phaseDeg}°: crests meet troughs, canceling to ${resAmp.toFixed(2)} m.`);
              setFormulaTag("A_res = |A₁ - A₂| (Destructive)");
            } else {
              setExplanation(`Intermediate interference with Δφ = ${w.phaseDeg}°. Resultant amplitude = ${resAmp.toFixed(2)} m.`);
              setFormulaTag("A_res = √(A₁² + A₂² + 2A₁A₂ cosΔφ)");
            }
          } else if (currentExp === "optics") {
            const opt = simState.optics;
            const rays = computeOpticsRays({
              incidentAngleDeg: opt.incidentAngleDeg,
              n1: opt.n1,
              n2: opt.n2
            });

            telemetryRef.current = {
              experimentName: "Reflection & Refraction",
              time: Number(totalSimTime.toFixed(1)),
              isFrozen: effectiveFrozen
            };

            setPhysicsState({
              opticsIncidentAngle: opt.incidentAngleDeg,
              opticsN1: opt.n1,
              opticsN2: opt.n2,
              opticsRefractAngle: rays.refractionAngleDeg,
              isTIR: rays.isTotalInternalReflection,
              hasInteracted: true
            });

            if (rays.isTotalInternalReflection) {
              setExplanation(`TOTAL INTERNAL REFLECTION! θ₁ (${opt.incidentAngleDeg}°) exceeds critical angle θ_c (${rays.criticalAngleDeg?.toFixed(1)}°). No light enters medium 2.`);
              setFormulaTag("TIR: θ₁ > θ_c = arcsin(n₂/n₁)");
            } else {
              setExplanation(`Snell's Law: n₁·sin(θ₁) = n₂·sin(θ₂). Incident: ${opt.incidentAngleDeg}°, Reflected: ${rays.reflectionAngleDeg}°, Refracted: ${rays.refractionAngleDeg?.toFixed(1)}°.`);
              setFormulaTag("n₁ sin θ₁ = n₂ sin θ₂");
            }
          } else if (currentExp === "incline") {
            const inc = simState.incline;
            const angRad = (inc.angleDeg * Math.PI) / 180;
            const weight = inc.mass * inc.gravity;
            const normF = weight * Math.cos(angRad);
            const maxStaticF = inc.muStatic * normF;
            const parallelGrav = weight * Math.sin(angRad);
            const isSliding = inc.isSlipping;
            const fricF = isSliding ? inc.muKinetic * normF : parallelGrav;
            const netF = Math.max(0, parallelGrav - fricF);
            const accel = isSliding ? netF / inc.mass : 0;

            telemetryRef.current = {
              experimentName: "Friction & Inclined Plane",
              mass: inc.mass,
              force: Number(fricF.toFixed(2)),
              acceleration: Number(accel.toFixed(2)),
              velocity: Number(Math.abs(inc.blockVelocity).toFixed(2)),
              time: Number(totalSimTime.toFixed(1)),
              isFrozen: effectiveFrozen
            };

            setPhysicsState({
              inclineAngle: inc.angleDeg,
              inclineMass: inc.mass,
              inclineMuStatic: inc.muStatic,
              inclineMuKinetic: inc.muKinetic,
              inclineNormalForce: normF,
              inclineFrictionForce: fricF,
              inclineNetForce: netF,
              inclineAccel: accel,
              inclineIsSlipping: isSliding,
              velocity: Math.abs(inc.blockVelocity),
              hasInteracted: true
            });

            if (isSliding) {
              setExplanation(`Slipping down ramp! Gravity parallel (${parallelGrav.toFixed(1)} N) > max static friction (${maxStaticF.toFixed(1)} N). a = ${accel.toFixed(2)} m/s².`);
              setFormulaTag("a = g(sin θ - μ_k cos θ)");
            } else {
              setExplanation(`Static equilibrium: friction matches downhill gravity component (f_s = ${parallelGrav.toFixed(1)} N). Ramp angle below angle of repose.`);
              setFormulaTag("f_s ≤ μ_s · N (At Rest)");
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
              mass: settingsRef.current.mass,
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

      {/* QUEST MODE SWITCHER & CAREER STATUS BAR */}
      <QuestModeBar
        activeMode={questMode}
        onChangeMode={(mode) => {
          setQuestMode(mode);
          if (mode === "learn") {
            setIsGuidedModeOpen(true);
          } else {
            setIsGuidedModeOpen(false);
          }
        }}
        questProfile={questProfile}
        completedMissionsForExp={
          (QUEST_MISSIONS[activeExpId] || []).filter((m) =>
            Boolean(questProfile?.completedMissions?.[m.id])
          ).length
        }
        totalMissionsForExp={3}
        isPredictionDone={Boolean(
          questProfile?.completedPredictions?.[
            QUEST_PREDICTIONS[activeExpId]?.id
          ]
        )}
        onOpenAchievements={() => setIsRanksOpen(true)}
      />

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

      {/* 6. GUIDED / LEARN MODE PANEL */}
      {(questMode === "learn" || isGuidedModeOpen) && (
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
          onClose={() => {
            setIsGuidedModeOpen(false);
            setQuestMode("freeplay");
          }}
        />
      )}

      {/* 6B. MISSION MODE PANEL */}
      {questMode === "missions" && (
        <QuestMissionPanel
          experiment={activeExperiment}
          missions={QUEST_MISSIONS[activeExpId] || []}
          telemetry={physicsState}
          physicsState={physicsState}
          simState={physicsState}
          onClaimReward={handleClaimMission}
          completedMissionsMap={questProfile?.completedMissions || {}}
          onResetSim={() => simControlsRef.current.resetSim?.(activeExpId)}
          onClose={() => setQuestMode("freeplay")}
        />
      )}

      {/* 6C. PREDICTION / HYPOTHESIS PANEL */}
      {questMode === "prediction" && (
        <QuestPredictionPanel
          prediction={QUEST_PREDICTIONS[activeExpId]}
          experiment={activeExperiment}
          onRecordPrediction={handleRecordPrediction}
          completedPrediction={
            questProfile?.completedPredictions?.[
              QUEST_PREDICTIONS[activeExpId]?.id
            ]
          }
          onRunExperiment={() => setQuestMode("freeplay")}
          onClose={() => setQuestMode("freeplay")}
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
        // Experiment 6: Pendulum props
        pendulumLength={pendulumLength}
        onChangePendulumLength={setPendulumLength}
        pendulumAngle={pendulumAngle}
        onChangePendulumAngle={setPendulumAngle}
        pendulumMass={pendulumMass}
        onChangePendulumMass={setPendulumMass}
        // Experiment 7: Electric props
        charge1Q={charge1Q}
        onChangeCharge1Q={setCharge1Q}
        charge2Q={charge2Q}
        onChangeCharge2Q={setCharge2Q}
        chargeTestQ={chargeTestQ}
        onChangeChargeTestQ={setChargeTestQ}
        onResetCharges={() => simControlsRef.current.resetCharges?.()}
        // Experiment 8: Wave props
        waveA1={waveA1}
        onChangeWaveA1={setWaveA1}
        waveA2={waveA2}
        onChangeWaveA2={setWaveA2}
        wavePhaseDeg={wavePhaseDeg}
        onChangeWavePhaseDeg={setWavePhaseDeg}
        waveFreq={waveFreq}
        onChangeWaveFreq={setWaveFreq}
        // Experiment 9: Optics props
        opticsIncidentAngle={opticsIncidentAngle}
        onChangeOpticsIncidentAngle={setOpticsIncidentAngle}
        opticsN1={opticsN1}
        onChangeOpticsN1={setOpticsN1}
        opticsN2={opticsN2}
        onChangeOpticsN2={setOpticsN2}
        onSwapMedia={() => simControlsRef.current.swapOpticsMedia?.()}
        // Experiment 10: Incline props
        inclineAngle={inclineAngle}
        onChangeInclineAngle={setInclineAngle}
        inclineMass={inclineMass}
        onChangeInclineMass={setInclineMass}
        inclineMuStatic={inclineMuStatic}
        onChangeInclineMuStatic={setInclineMuStatic}
        inclineMuKinetic={inclineMuKinetic}
        onChangeInclineMuKinetic={setInclineMuKinetic}
        onResetInclineBlock={() => simControlsRef.current.resetInclineBlock?.()}
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
        quizResult={lastQuizResult || (quizScoreBadge !== null ? { score: quizScoreBadge } : null)}
        studentName={studentName}
      />

      {/* 17. PLATFORM DEMO & WALKTHROUGH MODAL */}
      <ProjectIntroModal
        isOpen={isIntroOpen}
        onClose={() => setIsIntroOpen(false)}
        onLaunchLab={handleSelectExperiment}
      />

      {/* 18. QUEST CELEBRATION MODAL */}
      <QuestCelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        celebrationData={celebrationData}
      />

      {/* 19. QUEST CAREER RANKS & ACHIEVEMENTS MODAL */}
      <QuestRanksModal
        isOpen={isRanksOpen}
        onClose={() => setIsRanksOpen(false)}
        questProfile={questProfile}
      />
    </div>
  );
}