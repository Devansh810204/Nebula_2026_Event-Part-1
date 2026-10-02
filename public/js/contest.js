/**
 * contest.js
 * Master proctored contest logic for students:
 * - Strict Fullscreen & Tab Switch enforcement
 * - 10-Minute countdown timer with auto-advance
 * - 8 Mystery Letters unlock flow and celebration popups
 * - Code execution & test case evaluation
 * - Copy-paste restrictions on question statements
 */

let currentQuestion = null;
let currentQuestionIndex = 0;
let totalQuestions = 20;
let timeRemaining = 600;
let timerInterval = null;
let violationsCount = 0;
let contestStarted = false;
let unlockedLettersList = [];

// Lightweight Web Audio Chime Synthesizer
function playCelebrationSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C-E-G-C-E-G arpeggio
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + idx * 0.1);
      osc.stop(audioCtx.currentTime + idx * 0.1 + 0.4);
    });
  } catch (e) {
    // audio context suppressed or unsupported
  }
}

// Particle Confetti Effect
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#0b4ea2', '#0066f5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1
    });
  }

  let animFrame;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3; // gravity
      p.alpha -= 0.015;
      if (p.alpha > 0) {
        alive = true;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });
    if (alive) {
      animFrame = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animFrame);
      canvas.remove();
    }
  }
  update();
}

document.addEventListener('DOMContentLoaded', async () => {
  const teamId = localStorage.getItem('nebula_team_id');
  const teamName = localStorage.getItem('nebula_team_name');

  if (!teamId) {
    window.location.href = '/';
    return;
  }

  // Setup team watermark
  if (typeof setupWatermark === 'function') {
    setupWatermark(teamName || teamId);
  }

  // Initialize UI references
  const teamNameEl = document.getElementById('team-name-display');
  if (teamNameEl) teamNameEl.textContent = teamName || teamId;

  // Initialize Socket.IO connection for real-time presence
  if (typeof io !== 'undefined') {
    const socket = io();
    socket.emit('team_online', { teamId });
  }

  // Bind Start Contest Fullscreen Gate
  const startGateBtn = document.getElementById('btn-enter-fullscreen-start');
  if (startGateBtn) {
    startGateBtn.addEventListener('click', enterFullscreenAndStart);
  }

  // Setup Anti-Cheat Proctored Listeners
  setupAntiCheatListeners();

  // Setup Progress Drawer Toggle
  const toggleDrawerBtn = document.getElementById('btn-toggle-drawer');
  const closeDrawerBtn = document.getElementById('btn-close-drawer');
  const drawer = document.getElementById('progress-drawer');
  if (toggleDrawerBtn && drawer) {
    toggleDrawerBtn.addEventListener('click', () => drawer.classList.toggle('open'));
  }
  if (closeDrawerBtn && drawer) {
    closeDrawerBtn.addEventListener('click', () => drawer.classList.remove('open'));
  }

  // Setup Editor & Action Buttons
  setupEditorAndControls();

  // Setup Copy/Paste restrictions
  setupCopyProtection();
});

// Fullscreen API Helper
function enterFullscreenAndStart() {
  const elem = document.documentElement;
  const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;

  if (req) {
    req.call(elem).then(() => {
      document.getElementById('start-briefing-modal').style.display = 'none';
      contestStarted = true;
      loadCurrentQuestion();
    }).catch(err => {
      alert("Please allow Full-Screen mode to participate in the contest.");
    });
  } else {
    document.getElementById('start-briefing-modal').style.display = 'none';
    contestStarted = true;
    loadCurrentQuestion();
  }
}

// Anti-Cheat Listeners
function setupAntiCheatListeners() {
  // 1. Fullscreen change
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

  // 2. Tab switch / visibility
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && contestStarted) {
      triggerProctorViolation('tab_switch');
    }
  });

  // 3. Window blur
  window.addEventListener('blur', () => {
    if (contestStarted && !document.fullscreenElement) {
      triggerProctorViolation('window_blur');
    }
  });

  // Resume Fullscreen button in Warning Overlay
  const resumeBtn = document.getElementById('btn-resume-fullscreen');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      const elem = document.documentElement;
      const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;
      if (req) {
        req.call(elem).then(() => {
          document.getElementById('proctor-warning-modal').style.display = 'none';
        }).catch(() => {
          document.getElementById('proctor-warning-modal').style.display = 'none';
        });
      } else {
        document.getElementById('proctor-warning-modal').style.display = 'none';
      }
    });
  }
}

function handleFullscreenChange() {
  const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
  const badge = document.getElementById('fullscreen-status-badge');
  if (badge) {
    badge.innerHTML = isFull ? '🟢 Fullscreen Active' : '🔴 Fullscreen Lost';
  }

  if (!isFull && contestStarted) {
    triggerProctorViolation('fullscreen_exit');
  }
}

// Trigger Violation to Server
async function triggerProctorViolation(type) {
  try {
    const res = await fetch('/api/contest/violation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
    const data = await res.json();

    if (data.disqualified) {
      // Disqualified! Immediate lockout
      clearInterval(timerInterval);
      showDisqualifiedModal(data.message);
    } else {
      // Warning 1
      violationsCount = data.violations;
      showWarningModal();
    }
  } catch (err) {
    console.error('Error reporting violation:', err);
  }
}

function showWarningModal() {
  const modal = document.getElementById('proctor-warning-modal');
  if (modal) modal.style.display = 'flex';
}

function showDisqualifiedModal(reason) {
  const modal = document.getElementById('proctor-disqualified-modal');
  const msgEl = document.getElementById('disqualified-reason-text');
  if (msgEl) msgEl.textContent = reason || 'Proctoring violation limit reached.';
  if (modal) modal.style.display = 'flex';

  setTimeout(() => {
    localStorage.clear();
    window.location.href = '/';
  }, 5000);
}

// Copy Protection
function setupCopyProtection() {
  const questionPanel = document.getElementById('panel-question');
  if (questionPanel) {
    questionPanel.addEventListener('copy', (e) => {
      e.preventDefault();
      showToast('⚠️ Copying question text is disabled for fair competition.');
    });

    questionPanel.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    questionPanel.addEventListener('selectstart', (e) => {
      e.preventDefault();
    });
  }
}

function showToast(text) {
  let toast = document.getElementById('nebula-floating-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'nebula-floating-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#0f172a';
    toast.style.color = '#ffffff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '0.9rem';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    toast.style.zIndex = '9999999';
    toast.style.transition = 'opacity 0.3s ease';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.style.opacity = '1';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
  }, 2500);
}

// Load Current Question from Server
async function loadCurrentQuestion() {
  try {
    const res = await fetch('/api/contest/current');
    const data = await res.json();

    if (data.isDisqualified) {
      showDisqualifiedModal(data.reason);
      return;
    }

    if (data.isCompleted) {
      showGrandVictoryModal(data.unlockedLetters || []);
      return;
    }

    currentQuestion = data.question;
    currentQuestionIndex = data.questionIndex;
    totalQuestions = data.totalQuestions;
    timeRemaining = data.timeRemaining || 600;
    unlockedLettersList = data.team.unlockedLetters || [];

    // Render Question
    renderQuestionDetails(currentQuestion);

    // Render Letter Slots & Progress
    renderLetterSlots(unlockedLettersList);
    renderRoadmap(data.progressSequence);

    // Start 10-min countdown timer
    startTimer(timeRemaining);

    // Update code editor with template for selected language
    updateStarterCode();
  } catch (err) {
    console.error('Failed to load question:', err);
  }
}

function renderQuestionDetails(q) {
  document.getElementById('q-title').textContent = `${q.id}. ${q.title}`;
  document.getElementById('q-badge-category').textContent = q.category;
  document.getElementById('q-badge-difficulty').textContent = q.difficulty;
  document.getElementById('q-current-number').textContent = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;

  const descEl = document.getElementById('q-description');
  descEl.innerHTML = formatMarkdown(q.description);

  const inputEl = document.getElementById('q-input-format');
  inputEl.textContent = q.inputFormat || 'Standard Input';

  const outputEl = document.getElementById('q-output-format');
  outputEl.textContent = q.outputFormat || 'Standard Output';

  const constraintsEl = document.getElementById('q-constraints');
  constraintsEl.textContent = q.constraints || 'Standard Constraints';

  // Sample Test Cases
  const sampleContainer = document.getElementById('q-sample-cases');
  sampleContainer.innerHTML = '';
  if (q.sampleTestCases && q.sampleTestCases.length > 0) {
    q.sampleTestCases.forEach((tc, idx) => {
      const tcBox = document.createElement('div');
      tcBox.className = 'sample-case-box';
      tcBox.style.marginBottom = '14px';
      tcBox.innerHTML = `
        <div style="font-weight: 700; font-size: 0.85rem; color: #475569; margin-bottom: 4px;">Sample Test Case ${idx + 1}:</div>
        <div style="font-size: 0.82rem; color: #64748b; margin-bottom: 2px;">Input:</div>
        <pre class="code-box">${tc.input}</pre>
        <div style="font-size: 0.82rem; color: #64748b; margin-bottom: 2px;">Output:</div>
        <pre class="code-box">${tc.output}</pre>
        ${tc.explanation ? `<div style="font-size: 0.82rem; color: #0b4ea2; margin-top: 4px;"><strong>Explanation:</strong> ${tc.explanation}</div>` : ''}
      `;
      sampleContainer.appendChild(tcBox);
    });
  }

  // Aptitude options if question type is aptitude
  const aptContainer = document.getElementById('aptitude-options-container');
  const codeEditorContainer = document.getElementById('code-editor-wrapper');
  if (q.type === 'aptitude') {
    aptContainer.style.display = 'block';
    codeEditorContainer.style.display = 'none';
    aptContainer.innerHTML = '';
    (q.options || ['A', 'B', 'C', 'D']).forEach((opt, idx) => {
      const label = document.createElement('label');
      label.className = 'aptitude-option';
      label.innerHTML = `
        <input type="radio" name="aptitude_choice" value="${opt}">
        <span><strong>${String.fromCharCode(65 + idx)}.</strong> ${opt}</span>
      `;
      aptContainer.appendChild(label);
    });
  } else {
    aptContainer.style.display = 'none';
    codeEditorContainer.style.display = 'flex';
  }
}

function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:600; color:#0b4ea2;">$1</code>')
    .replace(/\n\n/g, '<p></p>')
    .replace(/\n/g, '<br>');
}

// 8 Mystery Letter Slots Renderer
function renderLetterSlots(letters) {
  const container = document.getElementById('letter-slots-container');
  if (!container) return;
  container.innerHTML = '';

  const headerCounter = document.getElementById('header-letters-count');
  if (headerCounter) {
    headerCounter.textContent = `${letters.length} / 8`;
  }

  for (let i = 0; i < 8; i++) {
    const slot = document.createElement('div');
    slot.className = 'letter-slot';
    if (i < letters.length) {
      slot.classList.add('unlocked');
      slot.textContent = letters[i];
    } else {
      slot.textContent = '?';
    }
    container.appendChild(slot);
  }
}

// Progress Roadmap Renderer in Drawer
function renderRoadmap(sequence) {
  const list = document.getElementById('sequence-list-container');
  if (!list || !sequence) return;
  list.innerHTML = '';

  sequence.forEach((item) => {
    const el = document.createElement('div');
    el.className = `sequence-item status-${item.status}`;
    
    let badgeText = 'Locked';
    if (item.status === 'correct') badgeText = `✓ Letter [${item.unlockedLetter || '★'}]`;
    else if (item.status === 'current') badgeText = 'Current ⏳';
    else if (item.status === 'wrong') badgeText = 'Failed ✗';
    else if (item.status === 'timeout') badgeText = 'Timed Out ⏰';
    else if (item.status === 'skipped') badgeText = 'Skipped ➔';

    el.innerHTML = `
      <span>Q${item.index + 1}: ${item.title}</span>
      <span class="sequence-status-badge">${badgeText}</span>
    `;
    list.appendChild(el);
  });
}

// 10-Minute Timer Functionality
function startTimer(seconds) {
  clearInterval(timerInterval);
  timeRemaining = seconds;

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      handleTimeoutAdvance();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerBadge = document.getElementById('timer-display');
  const timerContainer = document.getElementById('timer-box');
  if (!timerBadge) return;

  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  timerBadge.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (timeRemaining <= 60) {
    timerContainer.className = 'timer-container timer-danger';
  } else if (timeRemaining <= 180) {
    timerContainer.className = 'timer-container timer-warning';
  } else {
    timerContainer.className = 'timer-container';
  }
}

// Auto-advance to next question when timer runs out
async function handleTimeoutAdvance() {
  showToast('⏰ Time expired for this question! Advancing to next...');
  try {
    const res = await fetch('/api/contest/timeout-advance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'timeout' })
    });
    const data = await res.json();
    setTimeout(() => {
      loadCurrentQuestion();
    }, 1000);
  } catch (err) {
    console.error('Timeout advance error:', err);
    loadCurrentQuestion();
  }
}

// Setup Editor, Runner, and Submission
function setupEditorAndControls() {
  const langSelect = document.getElementById('select-language');
  const codeEditor = document.getElementById('code-editor-area');
  const resetBtn = document.getElementById('btn-reset-code');
  const runBtn = document.getElementById('btn-run-code');
  const submitBtn = document.getElementById('btn-submit-code');
  const skipBtn = document.getElementById('btn-skip-question');

  if (langSelect) {
    langSelect.addEventListener('change', () => {
      updateStarterCode();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset code editor to starter template?')) {
        updateStarterCode(true);
      }
    });
  }

  if (runBtn) {
    runBtn.addEventListener('click', runSampleCode);
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', submitFinalSolution);
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', async () => {
      if (confirm('Skip this question and move to the next? You will not unlock this question’s character.')) {
        await fetch('/api/contest/timeout-advance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'skip' })
        });
        loadCurrentQuestion();
      }
    });
  }
}

function updateStarterCode(force = false) {
  const langSelect = document.getElementById('select-language');
  const codeEditor = document.getElementById('code-editor-area');
  if (!currentQuestion || !langSelect || !codeEditor) return;

  const lang = langSelect.value;
  const template = currentQuestion.starterCode?.[lang] || '';

  if (force || !codeEditor.value || codeEditor.value.trim() === '') {
    codeEditor.value = template;
  }
}

// Run Sample Code
async function runSampleCode() {
  const langSelect = document.getElementById('select-language');
  const codeEditor = document.getElementById('code-editor-area');
  const consoleBody = document.getElementById('console-body');
  const runBtn = document.getElementById('btn-run-code');

  const lang = langSelect.value;
  const code = codeEditor.value;
  const sampleInput = currentQuestion?.sampleTestCases?.[0]?.input || '';

  runBtn.disabled = true;
  runBtn.textContent = 'Running...';
  consoleBody.textContent = 'Compiling and executing sample test case...';

  try {
    const res = await fetch('/api/contest/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang, code, customInput: sampleInput })
    });
    const data = await res.json();

    if (data.isCompilationError) {
      consoleBody.innerHTML = `<span style="color: #ef4444; font-weight: bold;">Compilation Error:</span>\n${data.stderr}`;
    } else if (data.stderr && !data.success) {
      consoleBody.innerHTML = `<span style="color: #ef4444; font-weight: bold;">Runtime Error:</span>\n${data.stderr}`;
    } else {
      consoleBody.innerHTML = `<span style="color: #10b981; font-weight: bold;">Execution Output (${data.executionTimeMs}ms):</span>\n${data.stdout || '(No output produced)'}`;
    }
  } catch (err) {
    consoleBody.textContent = 'Execution request failed: ' + err.message;
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = 'Run Sample Test';
  }
}

// Submit Solution & Check Letter Unlock
async function submitFinalSolution() {
  const langSelect = document.getElementById('select-language');
  const codeEditor = document.getElementById('code-editor-area');
  const consoleBody = document.getElementById('console-body');
  const submitBtn = document.getElementById('btn-submit-code');

  const lang = langSelect.value;
  const code = codeEditor.value;

  // Aptitude answer check
  let aptitudeAnswer = null;
  if (currentQuestion?.type === 'aptitude') {
    const selected = document.querySelector('input[name="aptitude_choice"]:checked');
    if (!selected) {
      alert('Please select an option before submitting.');
      return;
    }
    aptitudeAnswer = selected.value;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Evaluating...';
  consoleBody.textContent = 'Running comprehensive test cases...';

  try {
    const res = await fetch('/api/contest/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang, code, aptitudeAnswer })
    });
    const data = await res.json();

    if (data.isDisqualified) {
      showDisqualifiedModal(data.reason);
      return;
    }

    if (data.correct) {
      // Correct!
      consoleBody.innerHTML = `<span style="color: #10b981; font-weight: bold;">✓ All Test Cases Passed Successfully!</span>`;
      playCelebrationSound();
      launchConfetti();

      // Show Letter Unlocked Celebration Popup
      showLetterUnlockedPopup(data.unlockedLetter, data.totalUnlocked, data.isAllUnlocked);
    } else {
      // Some test cases failed
      let msg = `<span style="color: #ef4444; font-weight: bold;">✗ Submission Failed: Some test cases did not pass.</span>\n`;
      if (data.evalDetails?.compilationError) {
        msg += `\nCompilation Error:\n${data.evalDetails.compilationError}`;
      } else if (data.evalDetails?.results) {
        data.evalDetails.results.forEach((r, idx) => {
          const color = r.status === 'PASSED' ? '#10b981' : '#ef4444';
          msg += `\nTest Case ${idx + 1}: <span style="color: ${color}; font-weight: 700;">${r.status}</span>`;
          if (r.status !== 'PASSED' && idx === 0) {
            msg += ` (Expected: ${r.expected.trim()}, Got: ${r.actual.trim()})`;
          }
        });
      }
      consoleBody.innerHTML = msg;
    }
  } catch (err) {
    consoleBody.textContent = 'Submission error: ' + err.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Solution';
  }
}

// Letter Unlocked Popup
function showLetterUnlockedPopup(letter, totalUnlocked, isAllUnlocked) {
  const modal = document.getElementById('letter-unlocked-modal');
  const letterEl = document.getElementById('unlocked-letter-display');
  const countEl = document.getElementById('unlocked-count-text');
  const proceedBtn = document.getElementById('btn-proceed-next-q');

  if (letterEl) letterEl.textContent = letter;
  if (countEl) countEl.textContent = `You have collected ${totalUnlocked} out of 8 characters!`;
  if (modal) modal.style.display = 'flex';

  proceedBtn.onclick = () => {
    modal.style.display = 'none';
    if (isAllUnlocked) {
      showGrandVictoryModal(unlockedLettersList);
    } else {
      loadCurrentQuestion();
    }
  };
}

// Grand Victory Modal (All 8 Letters Collected)
function showGrandVictoryModal(letters) {
  const modal = document.getElementById('grand-victory-modal');
  const lettersBox = document.getElementById('victory-letters-row');
  const countdownEl = document.getElementById('victory-logout-countdown');

  if (lettersBox) {
    lettersBox.innerHTML = '';
    (letters.length > 0 ? letters : ['N', 'E', 'B', 'U', 'L', 'A', '2', '6']).forEach(char => {
      const tile = document.createElement('div');
      tile.className = 'letter-slot unlocked';
      tile.style.width = '48px';
      tile.style.height = '48px';
      tile.textContent = char;
      lettersBox.appendChild(tile);
    });
  }

  if (modal) modal.style.display = 'flex';

  playCelebrationSound();
  launchConfetti();

  // 5-second countdown to auto logout
  let countdown = 5;
  const countInterval = setInterval(() => {
    countdown--;
    if (countdownEl) countdownEl.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(countInterval);
      localStorage.clear();
      window.location.href = '/';
    }
  }, 1000);
}
