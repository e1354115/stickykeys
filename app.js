// app.js

// ---------- ELEMENTS ----------
const elTarget = document.getElementById("target");
const elTyped = document.getElementById("typed");
const elTime = document.getElementById("time");
const elWpm = document.getElementById("wpm");
const elAcc = document.getElementById("acc");
const elMistakes = document.getElementById("mistakes");
const elCurse = document.getElementById("curseState");
const elHint = document.getElementById("hintText");
const elLevelLabel = document.getElementById("levelLabel");

const typingArea = document.getElementById("typingArea");
const restartBtn = document.getElementById("restartBtn");
const levelBtns = Array.from(document.querySelectorAll(".levelBtn"));

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

// sticky repeat
let cursePending = false;

// ---------- HELPERS ----------
function pickText() {
  const arr = levelConfig.texts;
  return arr[Math.floor(Math.random() * arr.length)];
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
  elCurse.innerHTML = cursePending ? "<span class='curse'>ON (next key repeats)</span>" : "off";
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
    const cls = (ch === expected) ? "good" : "bad";
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

// ---------- LEVEL / RESTART ----------
function applyLevel(newLevel) {
  level = newLevel;
  levelConfig = window.LEVELS[level];

  levelBtns.forEach(btn => {
    btn.classList.toggle("active", Number(btn.dataset.level) === level);
  });

  elHint.textContent = levelConfig.hint;
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

  // Backspace
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

  // Sticky repeat
  let repeatTimes = 1;
  if (levelConfig.punishments.stickyRepeat && cursePending) {
    repeatTimes = Math.floor(Math.random() * 5) + 3; // 3..7
    cursePending = false;
  }

  for (let r = 0; r < repeatTimes; r++) typedChars.push(char);

  const idx = typedChars.length - repeatTimes;
  const expected = targetText[idx];

  if (char !== expected) {
    mistakes++;

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
