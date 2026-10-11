import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Sparkles, Bot, Loader2 } from 'lucide-react';
import { saveExperimentResult } from '../../auth/experimentStorage';
import { explainQuizMistake } from '../../services/physicsAI';

export default function ExperimentQuizModal({
  experiment,
  isOpen,
  onClose,
  onQuizCompleted
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // AI mistake explanation state
  const [aiExplaining, setAiExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);

  if (!isOpen || !experiment) return null;

  const questions = experiment.quiz || [];
  const currentQ = questions[currentIdx];

  const handleSelectOption = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);
    setAiExplanation(null);

    const isCorrect = idx === currentQ.correctIndex;
    const newAnswers = [...answers, { qId: currentQ.id, selected: idx, isCorrect }];
    setAnswers(newAnswers);
  };

  const handleAskDrNovaWhy = async () => {
    if (aiExplaining || selectedOption === null) return;
    setAiExplaining(true);
    try {
      const res = await explainQuizMistake({
        question: currentQ.question,
        selectedOption: currentQ.options[selectedOption],
        correctOption: currentQ.options[currentQ.correctIndex],
        explanation: currentQ.explanation,
        experimentName: experiment.title
      });
      setAiExplanation(res.tutoringExplanation);
    } catch {
      setAiExplanation("Dr. Nova tip: Re-read the physical formula and units. Keep experimenting in the lab to test the relationship!");
    } finally {
      setAiExplaining(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setAiExplanation(null);
    } else {
      // Calculate score
      const correctCount = answers.filter((a) => a.isCorrect).length;
      const scorePercentage = Math.round((correctCount / questions.length) * 100);
      setFinalScore(scorePercentage);
      setQuizFinished(true);

      // Save to storage
      const result = saveExperimentResult({
        experimentId: experiment.id,
        experimentName: experiment.title,
        topic: experiment.topic,
        score: scorePercentage,
        status: 'completed'
      });

      if (onQuizCompleted) {
        onQuizCompleted(result);
      }
    }
  };

  const handleRetake = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setAnswers([]);
    setQuizFinished(false);
    setFinalScore(0);
    setAiExplanation(null);
  };

  return (
    <div className="quiz-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="quiz-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="quiz-modal-header">
          <div className="quiz-header-badge">
            <span className="quiz-icon">{experiment.emoji}</span>
            <div>
              <h3>{experiment.title} Quiz</h3>
              <p>{experiment.topic}</p>
            </div>
          </div>
          <button type="button" className="quiz-close-btn" onClick={onClose} aria-label="Close Quiz">
            ✕
          </button>
        </div>

        {!quizFinished ? (
          <div className="quiz-body">
            {/* Progress Bar */}
            <div className="quiz-progress-track">
              <div
                className="quiz-progress-fill"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
            <div className="quiz-step-meta">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% Complete</span>
            </div>

            {/* Question Text */}
            <h4 className="quiz-question-title">{currentQ.question}</h4>

            {/* Options */}
            <div className="quiz-options-list">
              {currentQ.options.map((opt, oIdx) => {
                let statusClass = '';
                if (isAnswerSubmitted) {
                  if (oIdx === currentQ.correctIndex) {
                    statusClass = 'is-correct';
                  } else if (oIdx === selectedOption) {
                    statusClass = 'is-wrong';
                  } else {
                    statusClass = 'is-dimmed';
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    className={`quiz-option-btn ${statusClass}`}
                    onClick={() => handleSelectOption(oIdx)}
                    disabled={isAnswerSubmitted}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + oIdx)}</span>
                    <span className="option-text">{opt}</span>
                    {isAnswerSubmitted && oIdx === currentQ.correctIndex && (
                      <CheckCircle2 className="option-status-icon ok" />
                    )}
                    {isAnswerSubmitted && oIdx === selectedOption && oIdx !== currentQ.correctIndex && (
                      <XCircle className="option-status-icon err" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Post-answer feedback */}
            {isAnswerSubmitted && (
              <div className={`quiz-feedback-box ${selectedOption === currentQ.correctIndex ? 'correct' : 'incorrect'}`}>
                <div className="feedback-head">
                  {selectedOption === currentQ.correctIndex ? (
                    <>
                      <Sparkles className="feedback-icon" />
                      <strong>Excellent! Correct Answer</strong>
                    </>
                  ) : (
                    <>
                      <XCircle className="feedback-icon" />
                      <strong>Not quite. Review the physics below:</strong>
                    </>
                  )}
                </div>
                <p className="feedback-explanation">{currentQ.explanation}</p>

                {/* AI Tutor breakdown if wrong */}
                {selectedOption !== currentQ.correctIndex && (
                  <div className="ai-mistake-wrap">
                    {!aiExplanation && (
                      <button
                        type="button"
                        className="btn-ask-nova"
                        onClick={handleAskDrNovaWhy}
                        disabled={aiExplaining}
                      >
                        {aiExplaining ? (
                          <>
                            <Loader2 className="btn-spinner" />
                            Dr. Nova is analyzing your answer...
                          </>
                        ) : (
                          <>
                            <Bot className="btn-icon-sm" />
                            Ask Dr. Nova why this happened
                          </>
                        )}
                      </button>
                    )}

                    {aiExplanation && (
                      <div className="nova-explanation-bubble">
                        <div className="nova-bubble-head">
                          <span className="nova-avatar-mini">🤖</span>
                          <strong>Dr. Nova's Concept Coaching:</strong>
                        </div>
                        <p>{aiExplanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer with Next button */}
            <div className="quiz-modal-footer">
              <button
                type="button"
                className="btn-quiz-next"
                onClick={handleNext}
                disabled={!isAnswerSubmitted}
              >
                {currentIdx < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="btn-icon-sm" />
                  </>
                ) : (
                  <>
                    Complete & View Score
                    <Award className="btn-icon-sm" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Finished Score Screen */
          <div className="quiz-finish-screen">
            <div className="score-ring-wrap">
              <svg viewBox="0 0 120 120" className="score-svg">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(56, 217, 255, 0.15)" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={finalScore >= 70 ? "#31f2a1" : "#ffbb33"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - finalScore / 100)}
                />
              </svg>
              <div className="score-center-text">
                <strong>{finalScore}%</strong>
                <span>Score</span>
              </div>
            </div>

            <h3 className="finish-title">
              {finalScore === 100 ? "Mastery Achieved! 🏆" : finalScore >= 70 ? "Well Done! ⚡" : "Good Effort! 🔬"}
            </h3>
            <p className="finish-sub">
              You correctly answered {answers.filter((a) => a.isCorrect).length} of {questions.length} questions for{" "}
              <strong>{experiment.title}</strong>. Your result has been saved to your lab progress profile.
            </p>

            <div className="finish-actions">
              <button type="button" className="btn-quiz-finish-retake" onClick={handleRetake}>
                <RotateCcw className="btn-icon-sm" />
                Retake Quiz
              </button>
              <button type="button" className="btn-quiz-finish-done" onClick={onClose}>
                <CheckCircle2 className="btn-icon-sm" />
                Continue Lab
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
