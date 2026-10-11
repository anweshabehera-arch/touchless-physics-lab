import { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Award,
  Play,
  Pause,
  X
} from 'lucide-react';

export default function GuidedExperimentPanel({
  experiment,
  physicsData,
  onLaunchQuiz,
  onResetSim,
  isPaused,
  onTogglePause,
  onClose
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Adjust state during render when experiment changes
  const [prevExpId, setPrevExpId] = useState(experiment?.id);
  if (prevExpId !== experiment?.id) {
    setPrevExpId(experiment?.id);
    setCurrentStepIdx(0);
    setCompletedSteps(new Set());
  }

  const steps = experiment?.guidedSteps || [];
  const currentStep = steps[currentStepIdx] || steps[0];
  const totalSteps = steps.length;
  const isFinalStep = currentStepIdx === totalSteps - 1;
  const stepCompleted = completedSteps.has(currentStepIdx);

  // Real-time verification of student action
  useEffect(() => {
    if (!currentStep || !physicsData) return;

    let conditionMet = false;
    const { checkType } = currentStep;

    if (checkType === 'rest') {
      conditionMet = true; // Resting observation
    } else if (checkType === 'appliedForce') {
      conditionMet = (physicsData.force || 0) > 0.4 || (physicsData.acceleration || 0) > 0.4;
    } else if (checkType === 'massChanged') {
      conditionMet = (physicsData.mass || 0) >= 2.0 || (physicsData.force || 0) > 0.3;
    } else if (checkType === 'freeze') {
      conditionMet = Boolean(isPaused);
    } else if (checkType === 'strike') {
      conditionMet = (physicsData.impulseJ || 0) > 0.1 || (physicsData.peakForce || 0) > 1.0;
    } else if (checkType === 'verify') {
      conditionMet = (physicsData.impulseJ || 0) > 0.05;
    } else if (checkType === 'compare') {
      conditionMet = true;
    } else if (checkType === 'displace') {
      conditionMet = Math.abs(physicsData.displacement || 0) > 0.08;
    } else if (checkType === 'oscillate') {
      conditionMet = (physicsData.velocity || 0) > 0.1;
    } else if (checkType === 'stiffness') {
      conditionMet = (physicsData.springK || 0) >= 40;
    } else if (checkType === 'propel') {
      conditionMet = (physicsData.v1 || 0) > 0.1;
    } else if (checkType === 'impact') {
      conditionMet = (physicsData.v2 || 0) > 0.1 || (physicsData.pTotal || 0) > 0.1;
    } else if (checkType === 'inelastic') {
      conditionMet = true;
    } else if (checkType === 'aim') {
      conditionMet = (physicsData.projAngle || 45) !== 45;
    } else if (checkType === 'speed') {
      conditionMet = (physicsData.projV0 || 5.0) !== 5.0;
    } else if (checkType === 'fire') {
      conditionMet = Boolean(physicsData.isAirborne) || (physicsData.range || 0) > 0;
    } else if (checkType === 'complementary') {
      conditionMet = true;
    } else if (checkType === 'length') {
      conditionMet = (physicsData.pendulumLength || 1.0) >= 1.3 || (physicsData.pendulumPeriod || 0) > 2.2;
    } else if (checkType === 'addCharge') {
      conditionMet = Boolean((physicsData.chargesCount || 1) >= 2) || (physicsData.charge2Q || 0) < 0;
    } else if (checkType === 'probeMove') {
      conditionMet = Boolean(physicsData.probeMoved) || (physicsData.testChargeForce || 0) > 0.05;
    } else if (checkType === 'inverseSquare') {
      conditionMet = (physicsData.probeDist || 0) >= 0.5 || (physicsData.eFieldMag || 0) > 0;
    } else if (checkType === 'destructive') {
      conditionMet = Math.abs((physicsData.wavePhaseDeg || 0) - 180) < 25 || physicsData.waveRegime === 'destructive';
    } else if (checkType === 'unequalAmp') {
      conditionMet = Math.abs((physicsData.waveA1 || 1.0) - (physicsData.waveA2 || 1.0)) > 0.3;
    } else if (checkType === 'intermediate') {
      conditionMet = Math.abs((physicsData.wavePhaseDeg || 0) - 90) < 25;
    } else if (checkType === 'refract') {
      conditionMet = Boolean(physicsData.thetaRefractDeg && physicsData.thetaRefractDeg > 0);
    } else if (checkType === 'swapMedia') {
      conditionMet = Boolean((physicsData.n1 || 1.0) > (physicsData.n2 || 1.0));
    } else if (checkType === 'tir') {
      conditionMet = Boolean(physicsData.isTIR);
    } else if (checkType === 'approachCrit') {
      conditionMet = (physicsData.inclineAngle || 0) >= 20;
    } else if (checkType === 'slip') {
      conditionMet = Boolean(physicsData.inclineSlipping) || (physicsData.inclineAccel || 0) > 0.1;
    } else if (checkType === 'varyMu') {
      conditionMet = (physicsData.muStatic || 0.45) < 0.3;
    }

    if (conditionMet) {
      const timer = setTimeout(() => {
        setCompletedSteps((prev) => {
          if (prev.has(currentStepIdx)) return prev;
          const next = new Set(prev);
          next.add(currentStepIdx);
          return next;
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentStep, physicsData, isPaused, currentStepIdx]);

  const handleNext = () => {
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      // Done! Open Quiz
      onLaunchQuiz?.();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStepIdx(0);
    setCompletedSteps(new Set());
    onResetSim?.();
  };

  if (!experiment) return null;

  return (
    <section className="guided-mode-panel" aria-label="Guided Physics Lab Curriculum">
      {/* Panel Header */}
      <div className="guided-header">
        <div className="guided-title-left">
          <Compass className="guided-icon" />
          <div>
            <div className="guided-badge">GUIDED LAB MODE · STEP {currentStepIdx + 1} OF {totalSteps}</div>
            <h3 className="guided-exp-name">{experiment.title}</h3>
          </div>
        </div>

        <div className="guided-header-actions">
          <button
            type="button"
            className="guided-icon-btn"
            onClick={onTogglePause}
            title={isPaused ? "Resume simulation" : "Pause simulation"}
          >
            {isPaused ? <Play className="btn-icon-xs" /> : <Pause className="btn-icon-xs" />}
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            className="guided-icon-btn"
            onClick={handleRestart}
            title="Restart guided experiment from Step 1"
          >
            <RotateCcw className="btn-icon-xs" />
            Restart
          </button>
          {onClose && (
            <button
              type="button"
              className="guided-close-btn"
              onClick={onClose}
              title="Close guided mode"
            >
              <X className="btn-icon-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="guided-progress-wrap">
        <div
          className="guided-progress-bar"
          style={{ width: `${((currentStepIdx + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Overview Context Card (on Step 1 or expandable) */}
      {currentStepIdx === 0 && (
        <div className="guided-overview-card">
          <div className="overview-row">
            <strong>🎯 Learning Objective:</strong>
            <p>{experiment.objective}</p>
          </div>
          <div className="overview-row">
            <strong>📚 Prerequisites:</strong>
            <p>{experiment.prerequisites}</p>
          </div>
          <div className="overview-row">
            <strong>⚖️ Physics Assumptions:</strong>
            <p>{experiment.assumptions}</p>
          </div>
        </div>
      )}

      {/* Active Step Content */}
      <div className="guided-step-body">
        <div className="step-number-tag">
          <span>STEP {currentStep.step}</span>
          <h4>{currentStep.title}</h4>
        </div>

        {/* Actionable Instructions */}
        <div className="step-instruction-box">
          <p className="instruction-text">
            <strong>Instruction:</strong> {currentStep.instruction}
          </p>

          <div className="interaction-guidance-grid">
            <div className="guidance-tile gesture-tile">
              <span className="guidance-label">GESTURE:</span>
              <span className="guidance-val">{currentStep.gestureHint}</span>
            </div>
            <div className="guidance-tile control-tile">
              <span className="guidance-label">ALTERNATIVE:</span>
              <span className="guidance-val">{currentStep.controlHint}</span>
            </div>
          </div>
        </div>

        {/* Expected Observation & Explanation */}
        <div className="step-physics-breakdown">
          <div className="breakdown-card observation">
            <span className="breakdown-title">👀 Expected Observation:</span>
            <p>{currentStep.expectedObservation}</p>
          </div>

          <div className="breakdown-card explanation">
            <span className="breakdown-title">⚛️ The Physics Behind It:</span>
            <p>{currentStep.physicsExplanation}</p>
          </div>
        </div>

        {/* Formula & Units Badge */}
        <div className="step-formula-pill">
          <span>GOVERNING PRINCIPLE:</span>
          <code>{currentStep.formula}</code>
          <span className="units-label">({experiment.units})</span>
        </div>

        {/* Live Goal Validation Status */}
        <div className={`step-status-chip ${stepCompleted ? 'verified' : 'waiting'}`}>
          {stepCompleted ? (
            <>
              <CheckCircle2 className="chip-icon ok" />
              <span>Action verified! Ready to advance.</span>
            </>
          ) : (
            <>
              <Sparkles className="chip-icon wait" />
              <span>Waiting for gesture / interaction input...</span>
            </>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="guided-footer-nav">
        <button
          type="button"
          className="guided-nav-btn prev"
          onClick={handlePrev}
          disabled={currentStepIdx === 0}
        >
          <ArrowLeft className="btn-icon-xs" />
          Previous Step
        </button>

        <div className="step-dots-row">
          {steps.map((_, sIdx) => (
            <span
              key={sIdx}
              className={`step-dot ${sIdx === currentStepIdx ? 'active' : ''} ${
                completedSteps.has(sIdx) ? 'completed' : ''
              }`}
              onClick={() => setCurrentStepIdx(sIdx)}
              title={`Jump to Step ${sIdx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          className={`guided-nav-btn next ${isFinalStep ? 'finish' : ''}`}
          onClick={handleNext}
        >
          {isFinalStep ? (
            <>
              Mastery Quiz & Report
              <Award className="btn-icon-xs" />
            </>
          ) : (
            <>
              Next Step
              <ArrowRight className="btn-icon-xs" />
            </>
          )}
        </button>
      </div>
    </section>
  );
}
