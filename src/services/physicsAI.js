/**
 * Touchless Physics Lab - AI Service Layer
 * Connects React UI to the local Express + OpenAI backend
 */

const API_BASE = '/api';
const DIRECT_BACKEND = 'https://touchless-physics-lab.onrender.com/api';

/**
 * Universal fetch with fallback between Vite proxy and direct backend port
 */
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const isHealth = Boolean(options.isHealthCheck || endpoint === '/health');

  // Try relative proxy path first
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    if (res.ok) {
      return await res.json();
    }
    // If 404, 502, or 503 on proxy, throw to consider fallback
    if (res.status === 404 || res.status === 502 || res.status === 503) {
      throw new Error(`Proxy status ${res.status}`);
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  } catch (primaryErr) {
    if (options.signal?.aborted || primaryErr?.name === 'AbortError') {
      throw primaryErr;
    }

    // If proxy failed, attempt direct backend connection
    try {
      const fallbackRes = await fetch(`${DIRECT_BACKEND}${endpoint}`, {
        ...options,
        headers
      });
      if (fallbackRes.ok) {
        return await fallbackRes.json();
      }
      const errorData = await fallbackRes.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status ${fallbackRes.status}`);
    } catch (fallbackErr) {
      if (options.signal?.aborted || fallbackErr?.name === 'AbortError') {
        throw fallbackErr;
      }
      // For user-initiated actions, log detailed error to console
      if (!isHealth) {
        console.error('API Request failed:', primaryErr, fallbackErr);
      }
      throw new Error(
        'AI Server unavailable. Please ensure the backend server is running on port 5000 (run `node server/index.js`).'
      );
    }
  }
}

/**
 * Check backend health & status
 */
export async function checkServerHealth(signal = null) {
  try {
    return await apiRequest('/health', {
      method: 'GET',
      signal,
      isHealthCheck: true
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      return null;
    }
    return {
      status: 'offline',
      openaiConfigured: false,
      error: err.message
    };
  }
}

/**
 * Feature 1: Ask physics assistant questions
 */
export async function askPhysicsAssistant(question, history = [], context = {}) {
  if (!question || !question.trim()) {
    throw new Error('Please enter a physics question.');
  }

  return await apiRequest('/physics', {
    method: 'POST',
    body: JSON.stringify({
      question: question.trim(),
      history,
      context
    })
  });
}

/**
 * Feature 3: Step-by-step experiment guide
 */
export async function getExperimentGuide(experimentId = 'newton_second_law', step = 1, userQuery = '', context = {}) {
  return await apiRequest('/physics/guide', {
    method: 'POST',
    body: JSON.stringify({
      experimentId,
      step,
      userQuery: userQuery.trim(),
      context
    })
  });
}

/**
 * Feature 4: Observation analysis
 */
export async function analyzeObservation(experimentName, data = {}, notes = '') {
  return await apiRequest('/physics/analyze', {
    method: 'POST',
    body: JSON.stringify({
      experimentName: experimentName || 'Particle Field Dynamics',
      data,
      notes: notes.trim()
    })
  });
}

/**
 * Feature 5: Progressive hints & solutions
 */
export async function getPhysicsHint(problem, hintLevel = 1, requestSolution = false) {
  if (!problem || !problem.trim()) {
    throw new Error('Please provide a physics problem to get a hint.');
  }

  return await apiRequest('/physics/hint', {
    method: 'POST',
    body: JSON.stringify({
      problem: problem.trim(),
      hintLevel,
      requestSolution
    })
  });
}

/**
 * Feature 6: Dr. Nova Explain Quiz Mistake
 */
export async function explainQuizMistake(data) {
  return await apiRequest('/physics/quiz-explain', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}


