// app.js

// ---------- ELEMENTS ----------
const elTarget = document.getElementById("target");
const elTyped = document.getElementById("typed");
const elTime = document.getElementById("time");
const elWpm = document.getElementById("wpm");
const elAcc = document.getElementById("acc");
const elMistakes = document.getElementById("mistakes");
const elLevel = document.getElementById("level");
const elTitle = document.getElementById("title");

const typingArea = document.getElementById("typingArea");
const restartBtn = document.getElementById("restartBtn");
const levelBtns = Array.from(document.querySelectorAll(".level-btn"));

const modalOverlay = document.getElementById("modalOverlay");
const modalIcon = document.getElementById("modalIcon");
const modalText = document.getElementById("modalText");
const modalBtn = document.getElementById("modalBtn");

const keyDisableIndicator = document.getElementById("keyDisableIndicator");
const keyDisableText = document.getElementById("keyDisableText");
const keyDisableBar = document.getElementById("keyDisableBar");

const globalDryingBar = document.getElementById("globalDryingBar");
const globalDryingText = document.getElementById("globalDryingText");
const globalDryingFill = document.getElementById("globalDryingFill");

// Video elements
const bgVideoHoney = document.getElementById("bgVideoHoney");
const bgVideoGum = document.getElementById("bgVideoGum");
const bgVideoGlue = document.getElementById("bgVideoGlue");

// ---------- MODAL SYSTEM ----------
let modalTimeout = null;

function showModal(icon, message) {
  modalIcon.textContent = icon;
  modalText.textContent = message;
  modalOverlay.classList.add("show");
  
  if (modalTimeout) clearTimeout(modalTimeout);
  modalTimeout = setTimeout(() => {
    hideModal();
  }, 2500);
}

function hideModal() {
  modalOverlay.classList.remove("show");
  if (modalTimeout) {
    clearTimeout(modalTimeout);
    modalTimeout = null;
  }
  // Refocus typing area after modal closes
  setTimeout(() => {
    typingArea.focus();
  }, 100);
}

function resetModalButtons() {
  const buttonContainer = document.getElementById('completionButtonContainer');
  if (buttonContainer) {
    buttonContainer.remove();
  }
  modalBtn.style.display = '';
}

modalBtn.addEventListener("click", (e) => {
  hideModal();
  e.preventDefault();
});

// Allow Enter key to close modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && modalOverlay.classList.contains("show")) {
    e.preventDefault();
    hideModal();
  }
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    hideModal();
    e.preventDefault();
  }
});

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
let stretchingChar = null;
let disabledKey = null;
let keyDisableProgress = 0;
let spacebarPresses = 0;
let isDrying = false;
let dryingTimerId = null;
let keyDisableTimerId = null;
let bubbleTimerId = null;
let glueTimerId = null;
let honeySlowdown = false;
let honeySlowdownTimer = null;
let globalDryingProgress = 0;
let globalDryingTimerId = null;
let levelCompleted = false;
let isHoneySlow = false;
let pendingKey = null;
let honeySlowTimer = null;

// ---------- HELPERS ----------
function pickText() {
  return levelConfig.generator();
}

function startTimerIfNeeded() {
  if (startTime !== null) return;
  startTime = performance.now();
  timerId = setInterval(updateStats, 100);
  window.AudioManager.play(level);
  
  if (levelConfig.features.popups) {
    window.Punishments.startPopups();
  }
  
  // LEVEL 1: Random honey slowdown
  if (level === 1) {
    setInterval(() => {
      if (!isHoneySlow && Math.random() < 0.15) {
        triggerHoneySlowdown();
      }
    }, 5000);
  }
  
  // LEVEL 2: Start bubble generation
  if (level === 2) {
    bubbleTimerId = setInterval(() => {
      window.Punishments.addBubble();
    }, 700);
  }
  
  // LEVEL 3: Start glue flow generation and key disable
  if (level === 3) {
    glueTimerId = setInterval(() => {
      window.Punishments.addGlueFlow();
    }, 800);
    
    keyDisableTimerId = setInterval(() => {
      if (!disabledKey && !isDrying) {
        const keys = ['e', 'a', 't', 'o', 'i', 'n'];
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        
        disabledKey = randomKey;
        keyDisableProgress = 0;
        spacebarPresses = 0;
        isDrying = false;
        
        keyDisableIndicator.style.display = 'block';
        keyDisableText.textContent = `🚫 Key "${randomKey}" is stuck! Press SPACEBAR 10 times to break free!`;
        showModal('🔒', `Key "${randomKey}" is covered in glue!\nPress SPACEBAR 10 times to break free!`);
      }
    }, 20000);
  }
}

function triggerHoneySlowdown() {
  isHoneySlow = true;
  typingArea.classList.add('honey-slow');
  
  setTimeout(() => {
    isHoneySlow = false;
    typingArea.classList.remove('honey-slow');
  }, 4000);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  if (bubbleTimerId) clearInterval(bubbleTimerId);
  if (glueTimerId) clearInterval(glueTimerId);
  if (keyDisableTimerId) clearInterval(keyDisableTimerId);
  if (dryingTimerId) clearInterval(dryingTimerId);
  if (honeySlowdownTimer) clearTimeout(honeySlowdownTimer);
  if (globalDryingTimerId) clearInterval(globalDryingTimerId);
  if (honeySlowTimer) clearTimeout(honeySlowTimer);
  
  timerId = null;
  bubbleTimerId = null;
  glueTimerId = null;
  keyDisableTimerId = null;
  dryingTimerId = null;
  honeySlowdownTimer = null;
  globalDryingTimerId = null;
  honeySlowTimer = null;
  
  window.Punishments.stopPopups();
  window.AudioManager.stop();
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
  elLevel.textContent = String(level);
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
  const maxChars = Math.min(typedChars.length, 1000);
  
  for (let i = 0; i < maxChars; i++) {
    const ch = typedChars[i];
    const expected = targetText[i] ?? "";
    const cls = (ch === expected) ? "char-good" : "char-bad";
    const isStretching = stretchingChar && i >= typedChars.length - stretchingChar.length;
    
    if (isStretching) {
      out.push(`<span class="${cls} char-stretching">${escapeHtml(ch)}</span>`);
    } else {
      out.push(`<span class="${cls}">${escapeHtml(ch)}</span>`);
    }
  }
  
  // Add cursor based on level
  if (level === 1) {
    out.push('<span class="cursor cursor-honey"></span>');
  } else if (level === 2) {
    out.push('<span class="cursor cursor-gum"></span>');
  } else {
    out.push('<span class="cursor cursor-glue"></span>');
  }
  
  elTyped.innerHTML = out.join("");
}

function checkLevelCompletion() {
  if (typedChars.length >= targetText.length && !levelCompleted) {
    levelCompleted = true;
    stopTimer();
    
    if (level === 3) {
      globalDryingBar.style.display = 'block';
      globalDryingProgress = 0;
      globalDryingFill.style.width = '0%';
      
      globalDryingTimerId = setInterval(() => {
        globalDryingProgress += 1;
        globalDryingFill.style.width = globalDryingProgress + '%';
        globalDryingText.textContent = `Glue is drying... ${globalDryingProgress}%`;
        
        if (globalDryingProgress >= 100) {
          clearInterval(globalDryingTimerId);
          globalDryingTimerId = null;
          globalDryingBar.style.display = 'none';
          showCompletionModal();
        }
      }, 50);
    } else {
      showCompletionModal();
    }
  }
}

function showCompletionModal() {
  const maxLevel = Math.max(...Object.keys(window.LEVELS).map(Number));
  
  if (level < maxLevel) {
    const nextLevelBtn = document.createElement('button');
    nextLevelBtn.textContent = 'NEXT LEVEL';
    nextLevelBtn.className = 'modal-btn';
    nextLevelBtn.style.marginRight = '10px';
    nextLevelBtn.onclick = () => {
      hideModal();
      resetModalButtons();
      applyLevel(level + 1);
      setTimeout(() => {
        typingArea.focus();
      }, 200);
    };
    
    const restartLevelBtn = document.createElement('button');
    restartLevelBtn.textContent = 'RESTART';
    restartLevelBtn.className = 'modal-btn';
    restartLevelBtn.style.background = '#EF4444';
    restartLevelBtn.onclick = () => {
      hideModal();
      resetModalButtons();
      restart();
      setTimeout(() => {
        typingArea.focus();
      }, 200);
    };
    
    modalIcon.textContent = '🎉';
    modalText.textContent = `LEVEL ${level} COMPLETE!\n\nGreat job! Ready for the next challenge?`;
    
    const modalBox = modalBtn.parentElement;
    modalBtn.style.display = 'none';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'completionButtonContainer';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.gap = '10px';
    buttonContainer.appendChild(nextLevelBtn);
    buttonContainer.appendChild(restartLevelBtn);
    
    modalBox.appendChild(buttonContainer);
    modalOverlay.classList.add('show');
    
    if (modalTimeout) {
      clearTimeout(modalTimeout);
      modalTimeout = null;
    }
  } else {
    showModal('🏆', `ALL LEVELS COMPLETE!\n\nYou are a sticky typing master!`);
  }
}

function recomputeCorrectCount() {
  let c = 0;
  for (let i = 0; i < typedChars.length; i++) {
    if (typedChars[i] === targetText[i]) c++;
  }
  correctCount = c;
}

function updateBackground() {
  const body = document.body;
  body.className = '';
  
  // Deactivate all videos
  bgVideoHoney.classList.remove('active');
  bgVideoGum.classList.remove('active');
  bgVideoGlue.classList.remove('active');
  
  if (level === 1) {
    body.classList.add('level-honey');
    bgVideoHoney.classList.add('active');
    bgVideoHoney.play().catch(() => {});
  } else if (level === 2) {
    body.classList.add('level-gum');
    bgVideoGum.classList.add('active');
    bgVideoGum.play().catch(() => {});
  } else {
    body.classList.add('level-glue');
    bgVideoGlue.classList.add('active');
    bgVideoGlue.play().catch(() => {});
  }
}

function updateTitle() {
  if (level === 1) {
    elTitle.textContent = '🍯 STICKY KEYS 🍯';
  } else if (level === 2) {
    elTitle.textContent = '🫧 STICKY KEYS 🫧';
  } else {
    elTitle.textContent = '🧴 STICKY KEYS 🧴';
  }
}

function applyLevel(newLevel) {
  level = newLevel;
  levelConfig = window.LEVELS[level];
  levelBtns.forEach(btn => {
    btn.classList.toggle("active", Number(btn.dataset.level) === level);
  });
  updateBackground();
  updateTitle();
  setTimeout(() => {
    restart();
  }, 100);
}

function restart() {
  stopTimer();
  
  document.getElementById('honeyDrips').innerHTML = '';
  document.getElementById('bubbles').innerHTML = '';
  document.getElementById('glueFlows').innerHTML = '';
  
  targetText = pickText();
  typedChars = [];
  startTime = null;
  mistakes = 0;
  correctCount = 0;
  totalKeystrokes = 0;
  stretchingChar = null;
  disabledKey = null;
  keyDisableProgress = 0;
  spacebarPresses = 0;
  isDrying = false;
  honeySlowdown = false;
  globalDryingProgress = 0;
  levelCompleted = false;
  isHoneySlow = false;
  pendingKey = null;
  
  keyDisableIndicator.style.display = 'none';
  keyDisableBar.style.width = '0%';
  globalDryingBar.style.display = 'none';
  globalDryingFill.style.width = '0%';
  typingArea.classList.remove('honey-slow');
  
  elTarget.textContent = targetText;
  elTyped.innerHTML = '';
  updateStats();
  renderTyped();
  
  setTimeout(() => {
    typingArea.focus();
  }, 100);
}

// ---------- KEY HANDLER ----------
typingArea.addEventListener("keydown", (e) => {
  if (levelCompleted) return;
  
  if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
    hideModal();
    return;
  }
  
  if (!['Shift', 'Alt', 'Meta', 'Control', 'CapsLock', 'Tab'].includes(e.key)) {
    startTimerIfNeeded();
  }

  // LEVEL 3: Handle spacebar for key disable
  if (level === 3 && disabledKey && !isDrying && e.key === ' ') {
    e.preventDefault();
    spacebarPresses++;
    
    if (spacebarPresses >= 10) {
      isDrying = true;
      keyDisableText.textContent = '⏳ Key is drying... 0%';
      showModal('🎉', 'Breaking free! Key is drying...');
      
      dryingTimerId = setInterval(() => {
        keyDisableProgress += 2;
        keyDisableBar.style.width = keyDisableProgress + '%';
        keyDisableText.textContent = `⏳ Key is drying... ${keyDisableProgress}%`;
        
        if (keyDisableProgress >= 100) {
          clearInterval(dryingTimerId);
          dryingTimerId = null;
          disabledKey = null;
          isDrying = false;
          spacebarPresses = 0;
          keyDisableProgress = 0;
          keyDisableIndicator.style.display = 'none';
        }
      }, 100);
    } else {
      keyDisableText.textContent = `🚫 Key "${disabledKey}" is stuck! Press SPACEBAR ${10 - spacebarPresses} more times to break free!`;
    }
    return;
  }
  
  // LEVEL 3: Block disabled key
  if (disabledKey && e.key.toLowerCase() === disabledKey.toLowerCase()) {
    e.preventDefault();
    showModal('🚫', `Key "${disabledKey}" is stuck in glue!\nPress SPACEBAR ${10 - spacebarPresses} more times!`);
    return;
  }
  
  if (e.key === "Backspace") {
    e.preventDefault();
    
    if (typedChars.length > 0) {
      // LEVEL 2: Rubber banding (15% chance)
      if (level === 2 && Math.random() < 0.15) {
        showModal('🔄', 'The gum snapped it back!');
        return;
      }
      
      typedChars.pop();
      totalKeystrokes++;
      recomputeCorrectCount();
      renderTyped();
      updateStats();
    }
    return;
  }

  if (e.key.length !== 1) return;
  e.preventDefault();

  // LEVEL 1: Honey slowdown effect
  if (level === 1 && isHoneySlow) {
    if (pendingKey) return; // Ignore if already processing a key
    
    pendingKey = e.key;
    
    if (honeySlowTimer) clearTimeout(honeySlowTimer);
    honeySlowTimer = setTimeout(() => {
      processKeyPress(pendingKey);
      pendingKey = null;
    }, 800);
    return;
  }

  processKeyPress(e.key);
});

function processKeyPress(char) {
  totalKeystrokes++;

  const currentIdx = typedChars.length;
  const expected = targetText[currentIdx];
  const isCorrect = char === expected;

  if (!isCorrect) {
    mistakes++;
  } else {
    correctCount++;
  }

  // Reduced letter repeat glitch
  const repeatChance = level === 1 ? 0.15 : (level === 2 ? 0.20 : 0.25);
  if (Math.random() < repeatChance) {
    const repeatCount = level === 1 ? 2 : (Math.floor(Math.random() * 2) + 2);
    for (let i = 0; i < repeatCount; i++) {
      typedChars.push(char);
    }
    showModal('⚠️', 'Letter stuck and repeated!');
    
    if (level === 1) {
      window.Punishments.addHoneyDrip();
    }
    
    recomputeCorrectCount();
    renderTyped();
    updateStats();
    return;
  }

  // LEVEL 1: Random honey drips
  if (level === 1 && Math.random() < 0.2) {
    window.Punishments.addHoneyDrip();
  }

  // LEVEL 2: Sticky clusters (reduced frequency)
  if (level === 2 && char.toLowerCase() === 'e' && Math.random() < 0.25) {
    typedChars.push('e', 'r', 'r');
    showModal('🫧', 'ERR stuck together!');
    
    stretchingChar = 'err';
    setTimeout(() => {
      stretchingChar = null;
      renderTyped();
    }, 1200);
    
    recomputeCorrectCount();
    renderTyped();
    updateStats();
    return;
  }

  // LEVEL 2: Random stretch effect
  if (level === 2 && Math.random() < 0.20) {
    stretchingChar = char;
    setTimeout(() => {
      stretchingChar = null;
      renderTyped();
    }, 1200);
  }

  typedChars.push(char);
  
  // LEVEL 3: Word jumble (reduced frequency)
  if (level === 3 && mistakes > 0 && mistakes % 5 === 0 && typedChars.length > 10) {
    typedChars = window.Punishments.jumbleLastFewWords(typedChars, 20);
    showModal('🌀', 'The glue scrambled your words!');
  }

  recomputeCorrectCount();
  renderTyped();
  updateStats();
  
  checkLevelCompletion();
}

// ---------- EVENTS ----------
restartBtn.addEventListener("click", (e) => {
  e.preventDefault();
  restart();
  setTimeout(() => {
    typingArea.focus();
  }, 150);
});

typingArea.addEventListener("click", () => typingArea.focus());

levelBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const newLevel = Number(btn.dataset.level);
    if (newLevel && newLevel !== level) {
      applyLevel(newLevel);
    }
    setTimeout(() => {
      typingArea.focus();
    }, 200);
  });
});

// ---------- INITIALIZE ON LOAD ----------
document.addEventListener('DOMContentLoaded', () => {
  window.AudioManager.init();
  updateBackground();
  updateTitle();
  restart();
  typingArea.focus();
});