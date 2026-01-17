// app.js

// ---------- ELEMENTS ----------
const elTarget = document.getElementById("target");
const elTyped = document.getElementById("typed");
const elTime = document.getElementById("time");
const elWpm = document.getElementById("wpm");
const elAcc = document.getElementById("acc");
const elMistakes = document.getElementById("mistakes");
const elLevelLabel = document.getElementById("levelLabel");

const typingArea = document.getElementById("typingArea");
const restartBtn = document.getElementById("restartBtn");
const levelBtns = Array.from(document.querySelectorAll(".level-btn"));

const modalOverlay = document.getElementById("modalOverlay");
const modalIcon = document.getElementById("modalIcon");
const modalText = document.getElementById("modalText");
const modalBtn = document.getElementById("modalBtn");

// ---------- MODAL SYSTEM ----------
function showModal(icon, message) {
  modalIcon.textContent = icon;
  modalText.textContent = message;
  modalOverlay.classList.add("show");
}

function hideModal() {
  modalOverlay.classList.remove("show");
}

modalBtn.addEventListener("click", hideModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) hideModal();
});

// Make showModal globally available for punishments.js
window.showModal = showModal;

// ---------- STATE ----------
let level = 1;
let levelConfig = window.LEVELS[level];
let targetText = "";
let typedChars = [];
let startTime = null;
let timerId = null;
let mistakes = 0;
let correctCount = 0;
let totalKeystrokes = 0;
let cursePending = false;

// ---------- SKY DARKENING & SHAKE ----------
function updateCurseVisuals() {
  document.body.classList.remove('curse-level-1', 'curse-level-2', 'curse-level-3', 'curse-level-4', 'curse-level-5');
  
  if (mistakes >= 20) {
    document.body.classList.add('curse-level-5');
  } else if (mistakes >= 15) {
    document.body.classList.add('curse-level-4');
  } else if (mistakes >= 10) {
    document.body.classList.add('curse-level-3');
  } else if (mistakes >= 5) {
    document.body.classList.add('curse-level-2');
  } else if (mistakes >= 2) {
    document.body.classList.add('curse-level-1');
  }
}

function triggerShake() {
  document.body.classList.add('shake');
  setTimeout(() => {
    document.body.classList.remove('shake');
  }, 500);
}

// ---------- HELPERS ----------
function pickText() {
  return levelConfig.generator();
}

function startTimerIfNeeded() {
  if (startTime !== null) return;
  startTime = performance.now();
  timerId = setInterval(updateStats, 100);
  if (levelConfig.punishments.popups) {
    window.Punishments.startPopups();
  }
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
  window.Punishments.stopPopups();
}

function elapsedSeconds() {
  if (startTime === null) return 0;
  return (performance.now() - startTime) / 1000;
}

function computeWPM() {
  const minutes = elapsedSeconds() / 60;
  if (minutes <= 0) return 0;
  return Math.max(0, Math.round((typedChars.length / 5) / minutes));
}

function computeAccuracy() {
  if (totalKeystrokes === 0) return 100;
  return Math.max(0, Math.round((correctCount / totalKeystrokes) * 100));
}

function updateStats() {
  elTime.textContent = elapsedSeconds().toFixed(1);
  elWpm.textContent = computeWPM();
  elAcc.textContent = computeAccuracy();
  elMistakes.textContent = mistakes;
  elLevelLabel.textContent = String(level);
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTyped() {
  const out = [];
  for (let i = 0; i < typedChars.length; i++) {
    const ch = typedChars[i];
    const expected = targetText[i] ?? "";
    const cls = (ch === expected) ? "char-good" : "char-bad";
    out.push(`<span class="${cls}">${escapeHtml(ch)}</span>`);
  }
  elTyped.innerHTML = out.join("");
}

function recomputeCorrectCount() {
  let c = 0;
  for (let i = 0; i < typedChars.length; i++) {
    if (typedChars[i] === targetText[i]) c++;
  }
  correctCount = c;
}

function isTypeableKey(e) {
  return e.key.length === 1;
}

function applyLevel(newLevel) {
  level = newLevel;
  levelConfig = window.LEVELS[level];
  levelBtns.forEach(btn => {
    btn.classList.toggle("active", Number(btn.dataset.level) === level);
  });
  restart();
}

function restart() {
  stopTimer();
  targetText = pickText();
  typedChars = [];
  startTime = null;
  mistakes = 0;
  correctCount = 0;
  totalKeystrokes = 0;
  cursePending = false;
  
  document.body.classList.remove('curse-level-1', 'curse-level-2', 'curse-level-3', 'curse-level-4', 'curse-level-5', 'shake');
  
  elTarget.textContent = targetText;
  renderTyped();
  updateStats();
  typingArea.focus();
}

// ---------- KEY HANDLER ----------
typingArea.addEventListener("keydown", (e) => {
  if (e.key === " ") e.preventDefault();
  if (e.key !== "Shift" && e.key !== "Alt" && e.key !== "Meta" && e.key !== "Control") {
    startTimerIfNeeded();
  }

  if (e.key === "Backspace") {
    e.preventDefault();
    if (typedChars.length > 0) {
      typedChars.pop();
      totalKeystrokes++;
      recomputeCorrectCount();
      renderTyped();
      updateStats();
    }
    return;
  }

  if (!isTypeableKey(e)) return;
  e.preventDefault();

  let char = e.key;
  totalKeystrokes++;

  let repeatTimes = 1;
  if (levelConfig.punishments.stickyRepeat && cursePending) {
    repeatTimes = Math.floor(Math.random() * 5) + 3;
    cursePending = false;
  }

  for (let r = 0; r < repeatTimes; r++) typedChars.push(char);

  const idx = typedChars.length - repeatTimes;
  const expected = targetText[idx];

  if (char !== expected) {
    mistakes++;
    
    triggerShake();
    updateCurseVisuals();
    
    if (levelConfig.punishments.stickyRepeat) cursePending = true;
    if (levelConfig.punishments.wordJumble) {
      typedChars = window.Punishments.jumbleLastFewWords(typedChars, 40);
    }
  }

  recomputeCorrectCount();
  renderTyped();
  updateStats();

  if (typedChars.length >= targetText.length) {
    stopTimer();
  }
});

// ---------- EVENTS ----------
restartBtn.addEventListener("click", () => restart());
typingArea.addEventListener("click", () => typingArea.focus());
levelBtns.forEach(btn => {
  btn.addEventListener("click", () => applyLevel(Number(btn.dataset.level)));
});

// ---------- START ----------
applyLevel(1);