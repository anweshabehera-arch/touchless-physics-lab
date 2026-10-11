import { useState } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  FlaskConical,
  Award,
  X
} from "lucide-react";

export default function QuestPredictionPanel({
  prediction,
  experiment,
  onRecordPrediction,
  completedPrediction = null,
  onRunExperiment,
  onClose
}) {
  const [selectedOptionId, setSelectedOptionId] = useState(
    completedPrediction?.selectedOption || null
  );
  const [hasSubmitted, setHasSubmitted] = useState(Boolean(completedPrediction));

  if (!prediction) return null;

  const isAlreadyDone = Boolean(completedPrediction);
  const userChoice = completedPrediction?.selectedOption || selectedOptionId;
  const correctOption = prediction.options?.find((o) => o.isCorrect);
  const isUserCorrect = completedPrediction
    ? completedPrediction.isCorrect
    : correctOption?.id === selectedOptionId;

  const handleSubmit = () => {
    if (!selectedOptionId || hasSubmitted) return;
    const isCorrect = correctOption?.id === selectedOptionId;
    setHasSubmitted(true);
    onRecordPrediction?.(prediction.id, selectedOptionId, isCorrect);
  };

  return (
    <section
      className="quest-prediction-panel"
      aria-label="Physics Quest Scientific Hypothesis Challenge"
    >
      {/* Header */}
      <div className="prediction-header">
        <div className="prediction-title-left">
          <div className="prediction-icon-wrap">
            <HelpCircle className="prediction-icon" />
          </div>
          <div>
            <div className="prediction-badge">
              SCIENTIFIC PREDICTION · HYPOTHESIS LAB
            </div>
            <h3 className="prediction-exp-title">{experiment?.title}</h3>
          </div>
        </div>

        <div className="prediction-header-actions">
          {onClose && (
            <button
              type="button"
              className="prediction-close-btn"
              onClick={onClose}
              title="Close prediction panel"
            >
              <X className="btn-icon-xs" />
            </button>
          )}
        </div>
      </div>

      <div className="prediction-body">
        {/* The Scientific Question */}
        <div className="prediction-question-box">
          <span className="question-prefix">HYPOTHESIS QUESTION:</span>
          <p className="question-text">{prediction.question}</p>
        </div>

        {/* Options Selection */}
        <div className="prediction-options-list">
          {prediction.options?.map((opt) => {
            const isSelected = userChoice === opt.id;
            let optClass = "prediction-opt-btn";

            if (hasSubmitted || isAlreadyDone) {
              if (opt.isCorrect) {
                optClass += " correct";
              } else if (isSelected && !opt.isCorrect) {
                optClass += " incorrect";
              } else {
                optClass += " muted";
              }
            } else if (isSelected) {
              optClass += " selected";
            }

            return (
              <button
                key={opt.id}
                type="button"
                className={optClass}
                disabled={hasSubmitted || isAlreadyDone}
                onClick={() => setSelectedOptionId(opt.id)}
              >
                <span className="opt-letter">{opt.id}</span>
                <span className="opt-label">{opt.text}</span>
                {(hasSubmitted || isAlreadyDone) && opt.isCorrect && (
                  <CheckCircle2 className="opt-status-icon ok" />
                )}
                {(hasSubmitted || isAlreadyDone) && isSelected && !opt.isCorrect && (
                  <XCircle className="opt-status-icon bad" />
                )}
              </button>
            );
          })}
        </div>

        {/* Submit or Result Reveal */}
        {!hasSubmitted && !isAlreadyDone ? (
          <div className="prediction-actions-row">
            <button
              type="button"
              className="btn-submit-prediction"
              disabled={!selectedOptionId}
              onClick={handleSubmit}
            >
              <Sparkles className="btn-icon-sm" />
              Lock In Hypothesis & Test (+75 XP)
              <ArrowRight className="btn-icon-sm" />
            </button>
          </div>
        ) : (
          <div className="prediction-result-reveal">
            {/* Verdict Chip */}
            <div className={`verdict-banner ${isUserCorrect ? "correct" : "incorrect"}`}>
              {isUserCorrect ? (
                <>
                  <CheckCircle2 className="verdict-icon ok" />
                  <div>
                    <strong>HYPOTHESIS CONFIRMED! (+75 XP AWARDED)</strong>
                    <p>Your physical intuition aligns with empirical physics.</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="verdict-icon bad" />
                  <div>
                    <strong>EMPIRICAL REFUTATION (+25 XP EXPLORATION)</strong>
                    <p>Science progresses through refuting initial hypotheses!</p>
                  </div>
                </>
              )}
            </div>

            {/* Scientific Explanation */}
            <div className="prediction-explanation-card">
              <span className="expl-card-title">⚛️ EMPIRICAL SCIENTIFIC EXPLANATION</span>
              <p className="expl-card-body">{prediction.scientificExplanation}</p>
            </div>

            {/* Run in Sandbox */}
            <div className="prediction-run-row">
              <button
                type="button"
                className="btn-run-simulation"
                onClick={onRunExperiment}
              >
                <FlaskConical className="btn-icon-sm" />
                Verify in Simulation Free Play
              </button>
              {isAlreadyDone && (
                <span className="prediction-archived-tag">
                  <Award className="btn-icon-xs" />
                  Hypothesis Verified & Recorded
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
