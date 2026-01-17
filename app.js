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
}

modalBtn.addEventListener("click", hideModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) hideModal();
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
  
  // Start bubble generation for level 2
  if (level === 2) {
    bubbleTimerId = setInterval(() => {
      window.Punishments.addBubble();
    }, 500);
  }
  
  // Start glue flow generation for level 3
  if (level === 3) {
    glueTimerId = setInterval(() => {
      window.Punishments.addGlueFlow();
    }, 800);
    
    // Start key disable mechanism
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
    }, 15000);
  }
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  if (bubbleTimerId) clearInterval(bubbleTimerId);
  if (glueTimerId) clearInterval(glueTimerId);
  if (keyDisableTimerId) clearInterval(keyDisableTimerId);
  if (dryingTimerId) clearInterval(dryingTimerId);
  if (honeySlowdownTimer) clearTimeout(honeySlowdownTimer);
  if (globalDryingTimerId) clearInterval(globalDryingTimerId);
  
  timerId = null;
  bubbleTimerId = null;
  glueTimerId = null;
  keyDisableTimerId = null;
  dryingTimerId = null;
  honeySlowdownTimer = null;
  globalDryingTimerId = null;
  
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
  const maxChars = Math.min(typedChars.length, 1000); // Prevent too many characters
  
  for (let i = 0; i < maxChars; i++) {
    const ch = typedChars[i];
    const expected = targetText[i] ?? "";
    const cls = (ch === expected) ? "char-good" : "char-bad";
    const isStretching = stretchingChar && i >= typedChars.length - stretchingChar.length;
    
    if (isStretching) {
      // Exaggerated stretch for level 2
      const scaleX = level === 2 ? 3 : 1.5;
      const scaleY = level === 2 ? 2 : 1.3;
      const marginRight = level === 2 ? '60px' : '20px';
      const fontSize = level === 2 ? '2.5em' : '1.5em';
      
      out.push(`<span class="${cls}" style="display: inline-block; transform: scaleX(${scaleX}) scaleY(${scaleY}); transition: transform 2.5s ease; margin-right: ${marginRight}; font-size: ${fontSize};">${escapeHtml(ch)}</span>`);
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

// Check if level is completed
function checkLevelCompletion() {
  if (typedChars.length >= targetText.length && !levelCompleted) {
    levelCompleted = true;
    stopTimer();
    
    // Level 3: Show global drying bar
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
      // Level 1 & 2: Show completion modal immediately
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
      applyLevel(level + 1);
    };
    
    const restartLevelBtn = document.createElement('button');
    restartLevelBtn.textContent = 'RESTART';
    restartLevelBtn.className = 'modal-btn';
    restartLevelBtn.style.background = '#EF4444';
    restartLevelBtn.onclick = () => {
      hideModal();
      restart();
    };
    
    modalIcon.textContent = '🎉';
    modalText.textContent = `LEVEL ${level} COMPLETE!\n\nGreat job! Ready for the next challenge?`;
    
    // Clear and add custom buttons
    const modalBox = modalBtn.parentElement;
    modalBtn.style.display = 'none';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.gap = '10px';
    buttonContainer.appendChild(nextLevelBtn);
    buttonContainer.appendChild(restartLevelBtn);
    
    modalBox.appendChild(buttonContainer);
    modalOverlay.classList.add('show');
    
    // Don't auto-hide for completion modal
    if (modalTimeout) {
      clearTimeout(modalTimeout);
      modalTimeout = null;
    }
  } else {
    showModal('👑', `ALL LEVELS COMPLETE!\n\nYou are a sticky typing master!`);
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
  body.className = ''; // Clear all classes
  
  if (level === 1) {
    body.classList.add('level-honey');
  } else if (level === 2) {
    body.classList.add('level-gum');
  } else {
    body.classList.add('level-glue');
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
  
  // Clear visual effects first
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
  // Prevent typing if level is completed
  if (levelCompleted) return;
  
  if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
    hideModal();
    return;
  }
  
  if (!['Shift', 'Alt', 'Meta', 'Control', 'CapsLock', 'Tab'].includes(e.key)) {
    startTimerIfNeeded();
  }
  
  // Level 1: Visual honey slowdown effect (doesn't block typing)
  if (level === 1 && e.key.length === 1) {
    typingArea.classList.add('honey-slow');
    
    if (honeySlowdownTimer) clearTimeout(honeySlowdownTimer);
    honeySlowdownTimer = setTimeout(() => {
      typingArea.classList.remove('honey-slow');
    }, 200); // Brief visual effect
  }

  // Handle spacebar for key disable feature
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
  
  // Block disabled key
  if (disabledKey && e.key.toLowerCase() === disabledKey.toLowerCase()) {
    e.preventDefault();
    showModal('🚫', `Key "${disabledKey}" is stuck in glue!\nPress SPACEBAR ${10 - spacebarPresses} more times!`);
    return;
  }
  
  if (e.key === "Backspace") {
    e.preventDefault();
    
    if (typedChars.length > 0) {
      // Level 2: rubber banding effect
      if (level === 2 && Math.random() < 0.2) {
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

  let char = e.key;
  totalKeystrokes++;

  const currentIdx = typedChars.length;
  const expected = targetText[currentIdx];
  const isCorrect = char === expected;

  if (!isCorrect) {
    mistakes++;
    
    // Repeat on wrong (all levels)
    if (Math.random() < 0.5) {
      const repeatCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < repeatCount; i++) {
        typedChars.push(char);
      }
      showModal('❗', 'Letter stuck and repeated!');
      
      if (level === 1) {
        window.Punishments.addHoneyDrip();
      }
      
      recomputeCorrectCount();
      renderTyped();
      updateStats();
      return;
    }
  } else {
    correctCount++;
  }

  // Level 1: Random honey drips
  if (level === 1 && Math.random() < 0.3) {
    window.Punishments.addHoneyDrip();
  }

  // Level 2: Sticky clusters (e and r stick together) - EXAGGERATED
  if (level === 2 && char.toLowerCase() === 'e') {
    typedChars.push('e', 'e', 'e', 'r', 'r'); // More letters stuck!
    showModal('🫧', 'EEERRR stuck together!');
    
    stretchingChar = 'eeerr';
    setTimeout(() => {
      stretchingChar = null;
      renderTyped();
    }, 2500); // Longer stretch time
    
    recomputeCorrectCount();
    renderTyped();
    updateStats();
    return;
  }

  // Level 2: Random stretch effect - EXAGGERATED
  if (level === 2 && Math.random() < 0.3) {
    stretchingChar = char;
    setTimeout(() => {
      stretchingChar = null;
      renderTyped();
    }, 2500); // Longer stretch
  }

  typedChars.push(char);
  
  // Level 3: Word jumble on mistakes
  if (level === 3 && mistakes > 0 && mistakes % 3 === 0 && typedChars.length > 10) {
    typedChars = window.Punishments.jumbleLastFewWords(typedChars, 30);
    showModal('🌀', 'The glue scrambled your words!');
  }

  recomputeCorrectCount();
  renderTyped();
  updateStats();
  
  // Check if level completed
  checkLevelCompletion();
});

// ---------- EVENTS ----------
restartBtn.addEventListener("click", (e) => {
  e.preventDefault();
  restart();
});

typingArea.addEventListener("click", () => typingArea.focus());

levelBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const newLevel = Number(btn.dataset.level);
    if (newLevel && newLevel !== level) {
      applyLevel(newLevel);
    }
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