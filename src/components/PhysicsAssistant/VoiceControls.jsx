import { useState, useEffect, useRef } from 'react';

/**
 * VoiceControls Component
 * Provides speech-to-text recognition and text-to-speech reading
 * using the native browser Web Speech API.
 */
export default function VoiceControls({
  onTranscript,
  lastAnswer,
  compact = false
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(() => {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const [ttsSupported] = useState(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  });
  const [voiceStatus, setVoiceStatus] = useState(() => {
    if (typeof window !== 'undefined' && !(window.SpeechRecognition || window.webkitSpeechRecognition)) {
      return 'Speech recognition is not supported in this browser.';
    }
    return '';
  });

  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);

  // Always keep the latest callback without recreating SpeechRecognition
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // Initialize Speech Recognition only once
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('Listening... speak your physics question.');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          const transcript =
            event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        const activeText = final || interim;

        if (activeText && onTranscriptRef.current) {
          onTranscriptRef.current(
            activeText,
            Boolean(final)
          );
        }
      };

      recognition.onerror = (event) => {
        console.warn(
          'Speech recognition error:',
          event.error
        );

        // Chrome can report "aborted" when recognition is
        // interrupted during cleanup/re-render. Don't show
        // this as a microphone failure.
        if (event.error === 'aborted') {
          return;
        }

        setIsListening(false);

        if (event.error === 'not-allowed') {
          setVoiceStatus(
            'Microphone access was denied. Please allow microphone permissions.'
          );
        } else if (event.error === 'no-speech') {
          setVoiceStatus(
            'No speech detected. Please try again.'
          );
        } else if (event.error === 'audio-capture') {
          setVoiceStatus(
            'No microphone was detected. Check your microphone.'
          );
        } else if (event.error === 'network') {
          setVoiceStatus(
            'Speech recognition network error. Check your internet connection.'
          );
        } else {
          setVoiceStatus(
            `Voice input error: ${event.error}`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error(
        'Speech recognition setup failed:',
        err
      );

      setTimeout(() => {
        setSpeechSupported(false);
        setVoiceStatus('Could not initialize speech recognition.');
      }, 0);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch {
          // ignore abort cleanup error
        }
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      setVoiceStatus(
        'Speech recognition requires Chrome or Edge.'
      );
      return;
    }

    const recognition = recognitionRef.current;

    if (!recognition) {
      setVoiceStatus(
        'Microphone is not ready. Please refresh the page.'
      );
      return;
    }

    if (isListening) {
      try {
        recognition.stop();
      } catch {
        // ignore stop error
      }

      setIsListening(false);
      setVoiceStatus('Listening stopped.');
      return;
    }

    // Stop text-to-speech before starting microphone
    if (isSpeaking) {
      stopSpeaking();
    }

    setVoiceStatus('Starting microphone...');

    try {
      recognition.start();
    } catch (err) {
      console.warn(
        'Recognition start error:',
        err
      );

      // If recognition was already running internally,
      // reset it and try once more.
      try {
        recognition.abort();
      } catch {
        // ignore abort retry
      }

      setTimeout(() => {
        try {
          recognition.start();
        } catch (retryError) {
          console.warn(
            'Recognition retry failed:',
            retryError
          );

          setIsListening(false);
          setVoiceStatus(
            'Microphone could not start. Please try again.'
          );
        }
      }, 150);
    }
  };

  const speakText = (textToSpeak) => {
    if (!ttsSupported) {
      setVoiceStatus(
        'Text-to-speech is not supported in this browser.'
      );
      return;
    }

    if (!textToSpeak) {
      setVoiceStatus(
        'No response text available to read aloud.'
      );
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown and symbols for cleaner pronunciation
    const cleaned = textToSpeak
      .replace(/[#*_`~[\]]/g, '')
      .replace(/\\Delta/g, 'delta')
      .replace(/\\cdot/g, 'times')
      .replace(
        /\\frac\{([^}]+)\}\{([^}]+)\}/g,
        '$1 over $2'
      )
      .replace(
        /m\/s\^2/g,
        'meters per second squared'
      )
      .replace(
        /m\/s/g,
        'meters per second'
      );

    const utterance =
      new SpeechSynthesisUtterance(cleaned);

    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices =
      window.speechSynthesis.getVoices();

    const naturalVoice = voices.find(
      (voice) =>
        voice.lang.startsWith('en') &&
        (
          voice.name.includes('Natural') ||
          voice.name.includes('Google') ||
          voice.name.includes('Samantha')
        )
    ) || voices.find(
      (voice) => voice.lang.startsWith('en')
    );

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (compact) {
    return (
      <div className="voice-controls-compact">
        <button
          type="button"
          className={`voice-btn mic-btn ${
            isListening ? 'active-listening' : ''
          }`}
          onClick={toggleListening}
          title={
            isListening
              ? 'Stop listening'
              : 'Speak your question (Voice Input)'
          }
          aria-label={
            isListening
              ? 'Stop listening'
              : 'Activate voice input'
          }
        >
          {isListening ? (
            <span className="mic-pulse">🔴</span>
          ) : (
            <span>🎙️</span>
          )}
        </button>

        {lastAnswer && ttsSupported && (
          <button
            type="button"
            className={`voice-btn speaker-btn ${
              isSpeaking ? 'active-speaking' : ''
            }`}
            onClick={
              isSpeaking
                ? stopSpeaking
                : () => speakText(lastAnswer)
            }
            title={
              isSpeaking
                ? 'Stop speaking'
                : 'Read answer aloud (Text-to-Speech)'
            }
            aria-label={
              isSpeaking
                ? 'Stop speaking'
                : 'Read answer aloud'
            }
          >
            {isSpeaking ? '⏹️' : '🔊'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="voice-panel-full">
      <div className="voice-hero">
        <div
          className={`mic-orb ${
            isListening ? 'orb-listening' : ''
          } ${
            isSpeaking ? 'orb-speaking' : ''
          }`}
          onClick={toggleListening}
          role="button"
          tabIndex={0}
          aria-label="Toggle voice input"
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' ||
              event.key === ' '
            ) {
              event.preventDefault();
              toggleListening();
            }
          }}
        >
          <div className="mic-orb-inner">
            <span className="mic-icon">
              {isListening
                ? '🎙️'
                : isSpeaking
                ? '🔊'
                : '🎙️'}
            </span>
          </div>

          {isListening && (
            <>
              <div className="pulse-ring ring-1" />
              <div className="pulse-ring ring-2" />
            </>
          )}
        </div>

        <div className="voice-state-text">
          {isListening && (
            <span className="listening-glow">
              ● LISTENING NOW... Speak your question
            </span>
          )}

          {isSpeaking && (
            <span className="speaking-glow">
              ● DR. NOVA IS SPEAKING...
            </span>
          )}

          {!isListening && !isSpeaking && (
            <span>
              Tap microphone to ask a physics question
            </span>
          )}
        </div>
      </div>

      <div className="voice-actions-row">
        <button
          type="button"
          className={`action-btn-pill ${
            isListening
              ? 'pill-danger'
              : 'pill-cyan'
          }`}
          onClick={toggleListening}
        >
          {isListening
            ? '⏹ Stop Listening'
            : '🎙 Start Speaking'}
        </button>

        {lastAnswer && ttsSupported && (
          <button
            type="button"
            className={`action-btn-pill ${
              isSpeaking
                ? 'pill-danger'
                : 'pill-emerald'
            }`}
            onClick={
              isSpeaking
                ? stopSpeaking
                : () => speakText(lastAnswer)
            }
          >
            {isSpeaking
              ? '🔇 Stop Voice'
              : '🔊 Read Answer Aloud'}
          </button>
        )}
      </div>

      {/* Suggested Voice Commands */}
      <div className="voice-commands-section">
        <span className="voice-commands-label">⚡ QUICK VOICE COMMANDS (SPEAK OR TAP):</span>
        <div className="voice-chips-grid">
          {[
            "Explain this experiment",
            "What is impulse?",
            "Give me a hint",
            "How do I perform this?",
            "Why is my answer wrong?"
          ].map((cmd) => (
            <button
              key={cmd}
              type="button"
              className="voice-command-chip"
              onClick={() => {
                if (onTranscriptRef.current) {
                  onTranscriptRef.current(cmd, true);
                }
              }}
            >
              💬 "{cmd}"
            </button>
          ))}
        </div>
      </div>

      {voiceStatus && (
        <div className="voice-status-bar">
          <small>{voiceStatus}</small>
        </div>
      )}

      {!speechSupported && (
        <div className="browser-warning-notice">
          ⚠️ Speech recognition is not supported in
          this browser. Please use Google Chrome or
          Microsoft Edge for native microphone input.
          You can still use the text input!
        </div>
      )}
    </div>
  );
}