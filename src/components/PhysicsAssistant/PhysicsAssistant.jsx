import { useState, useEffect } from 'react';
import './PhysicsAssistant.css';
import VoiceControls from './VoiceControls';
import ExperimentGuide from './ExperimentGuide';
import ObservationAnalysis from './ObservationAnalysis';
import HintPanel from './HintPanel';
import { askPhysicsAssistant, checkServerHealth } from '../../services/physicsAI';

const QUICK_QUESTIONS = [
  "What is Newton's 2nd law?",
  "Why did the particles move?",
  "What is momentum?",
  "Explain Hooke's law in this lab",
  "How does viscous drag slow down particles?"
];

export default function PhysicsAssistant({ getLabSnapshot, activeExperiment }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('ask'); // 'ask' | 'voice' | 'guide' | 'analyze' | 'hint'
  const [selectedExperiment, setSelectedExperiment] = useState('');
  const [serverStatus, setServerStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  // Ask AI tab states
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check backend server health with backoff retry strategy and proper cleanup
  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();
    let timeoutId = null;
    let failureCount = 0;

    const scheduleNextCheck = (delayMs) => {
      if (!isMounted) return;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        runCheck();
      }, delayMs);
    };

    const runCheck = async () => {
      if (!isMounted) return;
      try {
        abortController = new AbortController();
        const res = await checkServerHealth(abortController.signal);
        if (!isMounted) return;

        if (res && res.status === 'online') {
          failureCount = 0;
          setServerStatus('online');
          // When online, check periodically every 60 seconds
          scheduleNextCheck(60000);
        } else {
          failureCount += 1;
          setServerStatus('offline');
          // Backoff after failure so we don't spam requests: 60s -> 120s -> 180s cap
          const backoff = Math.min(60000 * Math.pow(1.5, failureCount - 1), 180000);
          scheduleNextCheck(backoff);
        }
      } catch (err) {
        if (!isMounted || err?.name === 'AbortError') return;
        failureCount += 1;
        setServerStatus('offline');
        const backoff = Math.min(60000 * Math.pow(1.5, failureCount - 1), 180000);
        scheduleNextCheck(backoff);
      }
    };

    // Initial check on mount
    runCheck();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      abortController.abort();
    };
  }, []);

  // When user opens Dr. Nova assistant and server was offline, trigger an immediate re-check
  useEffect(() => {
    if (isOpen && serverStatus === 'offline') {
      const controller = new AbortController();
      checkServerHealth(controller.signal)
        .then((res) => {
          if (res && res.status === 'online') {
            setServerStatus('online');
          }
        })
        .catch(() => {});
      return () => controller.abort();
    }
  }, [isOpen, serverStatus]);

  const handleAsk = async (e, textOverride) => {
    e?.preventDefault();
    const q = textOverride || question;
    if (!q || !q.trim()) {
      setError('Please type or speak a question.');
      return;
    }

    setLoading(true);
    setError(null);
    const userMsg = { role: 'user', content: q };

    try {
      const context = {
        experimentName: activeExperiment?.title || 'Touchless Physics Lab',
        topic: activeExperiment?.topic || 'Classical Mechanics',
        formula: activeExperiment?.primaryFormula || 'F = m·a'
      };
      const res = await askPhysicsAssistant(q, history, context);
      setCurrentResponse(res);
      setHistory(prev => [...prev.slice(-6), userMsg, { role: 'assistant', content: res.answer }]);
      setQuestion('');
    } catch (err) {
      setError(err.message || 'Failed to get answer from Physics AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceTranscript = (transcriptText, isFinal) => {
    setQuestion(transcriptText);
    if (isFinal && transcriptText.trim().length > 3) {
      const lower = transcriptText.toLowerCase();
      // Voice command routing
      if (lower.includes("give me a hint") || lower.includes("need a hint")) {
        setActiveTab('hint');
        return;
      }
      if (lower.includes("how do i perform") || lower.includes("how to perform") || lower.includes("instructions")) {
        setActiveTab('guide');
        return;
      }
      if (lower.includes("explain this experiment")) {
        const expName = activeExperiment?.title || "this experiment";
        handleAsk(null, `Explain ${expName} and how it works in this touchless physics lab.`);
        setActiveTab('ask');
        return;
      }
      handleAsk(null, transcriptText);
      setActiveTab('ask');
    }
  };

  const handleReadAloud = (text) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      text.replace(/[#*_`]/g, '').replace(/m\/s\^2/g, 'meters per second squared')
    );
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Floating Main AI Launcher / Toggle Button (Fixed Bottom-Right) */}
      <button
        type="button"
        className={`ai-floating-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (isMinimized) setIsMinimized(false);
        }}
        title={isOpen ? "Close AI Physics Assistant" : "Open AI Physics Assistant"}
        aria-label={isOpen ? "Close AI Physics Assistant" : "Open AI Physics Assistant"}
        aria-expanded={isOpen}
      >
        <div className="trigger-glow" />
        <span className="trigger-icon">🤖</span>
        <span className="trigger-text">AI ASSISTANT</span>
        <span
          className={`server-status-dot ${serverStatus}`}
          title={`Server: ${serverStatus}`}
        />
        <span className="trigger-chevron" aria-hidden="true">
          {isOpen ? '✕' : '▲'}
        </span>
      </button>

      {/* Main AI Assistant Floating Panel */}
      {isOpen && (
        <aside
          className={`ai-assistant-panel ${isMinimized ? 'panel-minimized' : ''}`}
          aria-label="AI Physics Assistant Panel"
        >
          {/* Panel Header */}
          <div className="assistant-header">
            <div className="header-left">
              <span className="assistant-avatar">⚛</span>
              <div>
                <div className="assistant-title">
                  DR. NOVA <span className="title-sub">PHYSICS AI</span>
                </div>
                <div className="assistant-status">
                  <span className={`status-indicator ${serverStatus}`} />
                  {serverStatus === 'online' ? 'PHYSICS CORE ACTIVE' : 'CONNECTING TO CORE...'}
                </div>
              </div>
            </div>

            <div className="header-controls">
              <button
                type="button"
                className="btn-window-ctrl"
                onClick={() => setIsMinimized(prev => !prev)}
                title={isMinimized ? 'Expand Panel' : 'Minimize Panel'}
              >
                {isMinimized ? '🗖' : '🗕'}
              </button>

              <button
                type="button"
                className="btn-window-ctrl btn-close"
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Minimized Quick Status Bar */}
          {isMinimized ? (
            <div className="minimized-strip" onClick={() => setIsMinimized(false)}>
              <span>🤖 Dr. Nova is standing by. Click to expand tabs.</span>
              <span className="click-to-expand">Expand ↗</span>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <nav className="assistant-tabs" aria-label="AI Features">
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'ask' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ask')}
                >
                  <span className="tab-icon">💬</span> Ask AI
                </button>

                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'voice' ? 'active' : ''}`}
                  onClick={() => setActiveTab('voice')}
                >
                  <span className="tab-icon">🎙️</span> Voice
                </button>

                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
                  onClick={() => setActiveTab('guide')}
                >
                  <span className="tab-icon">🧪</span> Guide
                </button>

                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'analyze' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analyze')}
                >
                  <span className="tab-icon">📊</span> Analyze
                </button>

                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'hint' ? 'active' : ''}`}
                  onClick={() => setActiveTab('hint')}
                >
                  <span className="tab-icon">💡</span> Hint
                </button>
              </nav>

              {/* Tab 1: ASK AI */}
              {activeTab === 'ask' && (
                <div className="tab-content ask-tab">
                  {/* Quick Question Chips */}
                  <div className="quick-chips-wrapper">
                    <span className="chips-label">Quick Physics Questions:</span>
                    <div className="quick-chips">
                      {QUICK_QUESTIONS.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="chip-btn"
                          onClick={() => {
                            setQuestion(q);
                            handleAsk(null, q);
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Input Form with inline Voice button */}
                  <form onSubmit={handleAsk} className="ask-form">
                    <div className="input-row">
                      <input
                        type="text"
                        className="physics-input"
                        placeholder="Ask any physics question (e.g. What is Newton's 2nd law?)"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={loading}
                      />

                      <VoiceControls
                        compact
                        onTranscript={handleVoiceTranscript}
                        lastAnswer={currentResponse?.answer}
                      />

                      <button
                        type="submit"
                        className="btn-send-question"
                        disabled={loading || !question.trim()}
                      >
                        {loading ? '...' : 'Ask'}
                      </button>
                    </div>
                  </form>

                  {error && <div className="qa-error-card">⚠️ {error}</div>}

                  {/* AI Response Card */}
                  {currentResponse && (
                    <div className="response-card">
                      <div className="response-header">
                        <span className="response-author">⚛ Dr. Nova:</span>
                        <div className="response-tools">
                          <button
                            type="button"
                            className="btn-speak-response"
                            onClick={() => handleReadAloud(currentResponse.answer)}
                            title="Read answer aloud"
                          >
                            🔊 Listen
                          </button>
                        </div>
                      </div>

                      <div className="response-answer-text">
                        <p>{currentResponse.answer}</p>
                      </div>

                      {/* Formula Callout */}
                      {currentResponse.formula && (
                        <div className="formula-block">
                          <span className="formula-tag">GOVERNING FORMULA</span>
                          <div className="formula-math">{currentResponse.formula}</div>
                        </div>
                      )}

                      {/* Variable Breakdown */}
                      {currentResponse.variables && currentResponse.variables.length > 0 && (
                        <div className="variables-section">
                          <span className="section-label">VARIABLE BREAKDOWN:</span>
                          <div className="variables-list">
                            {currentResponse.variables.map((v, i) => (
                              <div key={i} className="variable-pill">
                                <strong className="var-symbol">{v.symbol}</strong>
                                <span className="var-name">{v.name}</span>
                                <span className="var-unit">({v.unit})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Intuitive Example */}
                      {currentResponse.example && (
                        <div className="example-block">
                          <strong>💡 Real-World / Lab Example:</strong>
                          <p>{currentResponse.example}</p>
                        </div>
                      )}

                      {/* Numerical Step-by-Step */}
                      {currentResponse.steps && currentResponse.steps.length > 0 && (
                        <div className="steps-block">
                          <strong>🔢 Step-by-Step Calculation:</strong>
                          <ol className="steps-list">
                            {currentResponse.steps.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: VOICE INTERACTION */}
              {activeTab === 'voice' && (
                <div className="tab-content voice-tab">
                  <VoiceControls
                    onTranscript={(text, isFinal) => {
                      if (isFinal) {
                        handleAsk(null, text);
                        setActiveTab('ask');
                      }
                    }}
                    lastAnswer={currentResponse?.answer}
                  />

                  {currentResponse && (
                    <div className="voice-latest-preview">
                      <span className="preview-label">Last AI Answer:</span>
                      <p className="preview-text">{currentResponse.answer}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: EXPERIMENT GUIDE */}
              {activeTab === 'guide' && (
                <div className="tab-content guide-tab">
                  <ExperimentGuide
  onSendToAnalyze={(params) => {
  setSelectedExperiment(params?.experimentName || '');
  setActiveTab('analyze');
}}
/>
                </div>
              )}

              {/* Tab 4: AI OBSERVATION ANALYSIS */}
              {activeTab === 'analyze' && (
                <div className="tab-content analyze-tab">
                  <ObservationAnalysis
  getLabSnapshot={getLabSnapshot}
  defaultExperiment={selectedExperiment || 'Particle Field Dynamics'}
/>
                </div>
              )}

              {/* Tab 5: AI HINTS */}
              {activeTab === 'hint' && (
                <div className="tab-content hint-tab">
                  <HintPanel onReadAloud={handleReadAloud} />
                </div>
              )}
            </>
          )}
        </aside>
      )}
    </>
  );
}
