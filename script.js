// ===== Pomodoro Timer - script.js =====

// ----- Configuration -----
const DEFAULT_SETTINGS = {
  pomodoro:   25,
  shortBreak: 5,
  longBreak:  15,
};

const MODE_META = {
  pomodoro:   { label: 'Focus Time',   bodyMode: 'pomodoro'   },
  shortBreak: { label: 'Short Break',  bodyMode: 'shortBreak' },
  longBreak:  { label: 'Long Break',   bodyMode: 'longBreak'  },
};

const CIRCUMFERENCE = 2 * Math.PI * 96; // 603.19

// ----- State -----
let settings       = { ...DEFAULT_SETTINGS };
let currentMode    = 'pomodoro';
let totalSeconds   = settings.pomodoro * 60;
let secondsLeft    = totalSeconds;
let isRunning      = false;
let intervalId     = null;
let completedCount = 0;
let toastTimer     = null;

// ----- DOM References -----
const timerMinutes   = document.getElementById('timerMinutes');
const timerSeconds   = document.getElementById('timerSeconds');
const startBtn       = document.getElementById('startBtn');
const resetBtn       = document.getElementById('resetBtn');
const skipBtn        = document.getElementById('skipBtn');
const startIcon      = document.getElementById('startIcon');
const pauseIcon      = document.getElementById('pauseIcon');
const sessionLabel   = document.getElementById('sessionLabel');
const progressCircle = document.getElementById('progressCircle');
const sessionDots    = document.getElementById('sessionDots').querySelectorAll('.dot');
const completedEl    = document.getElementById('completedCount');
const settingsToggle = document.getElementById('settingsToggle');
const settingsPanel  = document.getElementById('settingsPanel');
const pomodoroInput  = document.getElementById('pomodoroTime');
const shortBreakInput= document.getElementById('shortBreakTime');
const longBreakInput = document.getElementById('longBreakTime');
const applyBtn       = document.getElementById('applySettings');
const toastEl        = document.getElementById('toast');
const tabs           = document.querySelectorAll('.tab');

// ----- Helpers -----
function pad(n) {
  return String(n).padStart(2, '0');
}

function updateDisplay() {
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  timerMinutes.textContent = pad(m);
  timerSeconds.textContent = pad(s);

  // Update page title
  document.title = `${pad(m)}:${pad(s)} — Pomodoro Timer`;

  // Update progress ring
  const progress = secondsLeft / totalSeconds;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  progressCircle.style.strokeDashoffset = dashOffset;
}

function updateSessionDots() {
  sessionDots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < completedCount % 4);
  });
  completedEl.textContent = completedCount;
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (_) {
    // Audio not available — silent fallback
  }
}

// ----- Timer Logic -----
function startTimer() {
  if (isRunning) return;
  isRunning = true;
  startIcon.style.display = 'none';
  pauseIcon.style.display = '';

  intervalId = setInterval(() => {
    if (secondsLeft <= 0) {
      clearInterval(intervalId);
      isRunning = false;
      startIcon.style.display = '';
      pauseIcon.style.display = 'none';
      onTimerComplete();
      return;
    }
    secondsLeft--;
    updateDisplay();
  }, 1000);
}

function pauseTimer() {
  if (!isRunning) return;
  isRunning = false;
  clearInterval(intervalId);
  startIcon.style.display = '';
  pauseIcon.style.display = 'none';
}

function resetTimer() {
  pauseTimer();
  secondsLeft = totalSeconds;
  updateDisplay();
}

function skipSession() {
  pauseTimer();
  onTimerComplete(true);
}

function onTimerComplete(skipped = false) {
  playNotificationSound();

  if (currentMode === 'pomodoro') {
    completedCount++;
    updateSessionDots();

    if (completedCount % 4 === 0) {
      showToast('Great work! Time for a long break.');
      switchMode('longBreak');
    } else {
      showToast('Pomodoro done! Take a short break.');
      switchMode('shortBreak');
    }
  } else {
    if (!skipped) showToast('Break over. Let\'s focus!');
    switchMode('pomodoro');
  }
}

// ----- Mode Switching -----
function switchMode(mode) {
  currentMode = mode;
  totalSeconds = settings[mode === 'shortBreak' ? 'shortBreak' : mode === 'longBreak' ? 'longBreak' : 'pomodoro'] * 60;
  secondsLeft = totalSeconds;

  document.body.setAttribute('data-mode', MODE_META[mode].bodyMode);
  sessionLabel.textContent = MODE_META[mode].label;

  tabs.forEach(tab => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });

  updateDisplay();
  resetTimer();
}

// ----- Settings -----
function applySettings() {
  const p  = parseInt(pomodoroInput.value,   10);
  const sb = parseInt(shortBreakInput.value, 10);
  const lb = parseInt(longBreakInput.value,  10);

  if (isNaN(p) || p < 1 || p > 60)   return showToast('Pomodoro must be 1–60 min');
  if (isNaN(sb) || sb < 1 || sb > 30) return showToast('Short break must be 1–30 min');
  if (isNaN(lb) || lb < 1 || lb > 60) return showToast('Long break must be 1–60 min');

  settings.pomodoro   = p;
  settings.shortBreak = sb;
  settings.longBreak  = lb;

  switchMode(currentMode);
  settingsPanel.classList.remove('open');
  showToast('Settings applied!');
}

// ----- Event Listeners -----
startBtn.addEventListener('click', () => {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
});

resetBtn.addEventListener('click', resetTimer);
skipBtn.addEventListener('click', skipSession);

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    if (tab.dataset.mode !== currentMode) {
      switchMode(tab.dataset.mode);
    }
  });
});

settingsToggle.addEventListener('click', () => {
  settingsPanel.classList.toggle('open');
});

applyBtn.addEventListener('click', applySettings);

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space') {
    e.preventDefault();
    isRunning ? pauseTimer() : startTimer();
  } else if (e.code === 'KeyR') {
    resetTimer();
  } else if (e.code === 'KeyS') {
    skipSession();
  }
});

// ----- Init -----
function init() {
  document.body.setAttribute('data-mode', 'pomodoro');
  progressCircle.style.strokeDasharray = CIRCUMFERENCE;
  progressCircle.style.strokeDashoffset = 0;
  updateDisplay();
  updateSessionDots();
}

init();
