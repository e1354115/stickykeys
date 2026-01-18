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

const bgVideoHoney = document.getElementById("bgVideoHoney");
const bgVideoGum = document.getElementById("bgVideoGum");
const bgVideoGlue = document.getElementById("bgVideoGlue");

let modalTimeout = null;
let isModalWaitingForUser = false;

function showModal(icon, message, requireUserAction = true) {
  modalIcon.textContent = icon;
  modalText.textContent = message;
  modalBtn.style.display = 'block';
  modalBtn.textContent = 'OK';
  modalOverlay.classList.add("show");
  isModalWaitingForUser = requireUserAction;
  
  if (!requireUserAction) {
    if (modalTimeout) clearTimeout(modalTimeout);
    modalTimeout = setTimeout(() => {
      hideModal();
    }, 2500);
  }
}

function hideModal() {
  modalOverlay.classList.remove("show");
  isModalWaitingForUser = false;
  if (modalTimeout) {
    clearTimeout(modalTimeout);
    modalTimeout = null;
  }
  setTimeout(() => {
    typingArea.focus();
  }, 100);
}

function resetModalButtons() {
  const buttonContainer = document.getElementById('completionButtonContainer');
  if (buttonContainer) {
    buttonContainer.remove();
  }
  modalBtn.style.display = 'block';
  modalBtn.textContent = 'OK';
}

modalBtn.addEventListener("click", (e) => {
  e.preventDefault();
  hideModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && modalOverlay.classList.contains("show") && isModalWaitingForUser) {
    e.preventDefault();
    hideModal();
  }
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay && !isModalWaitingForUser) {
    hideModal();
    e.preventDefault();
  }
});

window.showModal = showModal;

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
let honeyDripTimerId = null;
let globalDryingProgress = 0;
let globalDryingTimerId = null;
let levelCompleted = false;
let isGloballyDrying = false; 

function pickText() {
  return levelConfig.generator();
}

function startTimerIfNeeded() {
  if (startTime !== null) return;
  startTime = performance.now();
  timerId = setInterval(updateStats, 100);
  window.AudioManager.play(level);
  
  if (level === 1 && levelConfig.features.drippingHoney) {
    honeyDripTimerId = setInterval(() => {
      window.Punishments.addHoneyDrip();
    }, 1500);
  }
  
  if (level === 2 && levelConfig.features.bubbles) {
    bubbleTimerId = setInterval(() => {
      window.Punishments.addBubble();
    }, 800);
  }
  
  if (level === 3) {
    if (levelConfig.features.glueFlows) {
      glueTimerId = setInterval(() => {
        window.Punishments.addGlueFlow();
      }, 900);
    }
    
    if (levelConfig.features.keyDisable) {
      keyDisableTimerId = setInterval(() => {
        if (!disabledKey && !isDrying) {
          const keys = ['e', 'a', 't', 'o', 'i', 'n', 's', 'r'];
          const randomKey = keys[Math.floor(Math.random() * keys.length)];
          
          disabledKey = randomKey;
          keyDisableProgress = 0;
          spacebarPresses = 0;
          isDrying = false;
          
          keyDisableIndicator.style.display = 'block';
          keyDisableText.textContent = `🚫 Key "${randomKey}" is stuck! Press SPACEBAR 10 times to break free!`;
          showModal('🔒', `Key "${randomKey}" is covered in glue!\nPress SPACEBAR 10 times to break free!`, true);
        }
      }, 22000);
    }
  }
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  if (bubbleTimerId) clearInterval(bubbleTimerId);
  if (glueTimerId) clearInterval(glueTimerId);
  if (honeyDripTimerId) clearInterval(honeyDripTimerId);
  if (keyDisableTimerId) clearInterval(keyDisableTimerId);
  if (dryingTimerId) clearInterval(dryingTimerId);
  if (globalDryingTimerId) clearInterval(globalDryingTimerId);
  
  timerId = null;
  bubbleTimerId = null;
  glueTimerId = null;
  honeyDripTimerId = null;
  keyDisableTimerId = null;
  dryingTimerId = null;
  globalDryingTimerId = null;
  
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
    
    const isStretching = level === 2 && stretchingChar && i >= typedChars.length - 5;
    
    if (isStretching) {
      out.push(`<span class="${cls} char-stretching">${escapeHtml(ch)}</span>`);
    } else {
      out.push(`<span class="${cls}">${escapeHtml(ch)}</span>`);
    }
  }
  
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
    
    if (level === 3 && levelConfig.features.dryingBar) {
      isGloballyDrying = true; 
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
          isGloballyDrying = false;
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
    modalIcon.textContent = '🎉';
    modalText.textContent = `Level ${level} Complete!\n\nTime: ${elapsedSeconds().toFixed(1)}s\nWPM: ${computeWPM()}\nAccuracy: ${computeAccuracy()}%\n\nReady for Level ${level + 1}?`;
    
    resetModalButtons();
    modalBtn.style.display = 'none';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'completionButtonContainer';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '12px';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.flexWrap = 'wrap';
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'modal-btn';
    nextBtn.textContent = `Proceed to Level ${level + 1}`;
    nextBtn.style.background = '#2E7D32';
    nextBtn.addEventListener('click', () => {
      hideModal();
      applyLevel(level + 1);
    });
    
    const restartCurrentBtn = document.createElement('button');
    restartCurrentBtn.className = 'modal-btn';
    restartCurrentBtn.textContent = 'Retry This Level';
    restartCurrentBtn.style.background = '#FF6F00';
    restartCurrentBtn.addEventListener('click', () => {
      hideModal();
      restart();
    });
    
    buttonContainer.appendChild(nextBtn);
    buttonContainer.appendChild(restartCurrentBtn);
    
    const modalBox = modalOverlay.querySelector('.modal-box');
    modalBox.appendChild(buttonContainer);
    
    modalOverlay.classList.add('show');
    isModalWaitingForUser = true;
  } else {
    modalIcon.textContent = '🏆';
    modalText.textContent = `🎊 ALL LEVELS COMPLETE! 🎊\n\nFinal Stats:\nTime: ${elapsedSeconds().toFixed(1)}s\nWPM: ${computeWPM()}\nAccuracy: ${computeAccuracy()}%\n\nYou mastered the sticky keys!`;
    
    resetModalButtons();
    modalBtn.textContent = 'Play Again';
    modalBtn.onclick = () => {
      hideModal();
      applyLevel(1);
    };
    
    modalOverlay.classList.add('show');
    isModalWaitingForUser = true;
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
  globalDryingProgress = 0;
  levelCompleted = false;
  isGloballyDrying = false;
  
  keyDisableIndicator.style.display = 'none';
  keyDisableBar.style.width = '0%';
  globalDryingBar.style.display = 'none';
  globalDryingFill.style.width = '0%';
  
  elTarget.textContent = targetText;
  elTyped.innerHTML = '';
  updateStats();
  renderTyped();
  
  setTimeout(() => {
    typingArea.focus();
  }, 100);
}

typingArea.addEventListener("keydown", (e) => {
  if (levelCompleted || isGloballyDrying) return;
  

  if (isModalWaitingForUser) {
    if (e.key === "Enter") {
      e.preventDefault();
      hideModal();
    }
    return;
  }
  
  if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
    hideModal();
    return;
  }
  
  if (!['Shift', 'Alt', 'Meta', 'Control', 'CapsLock', 'Tab'].includes(e.key)) {
    startTimerIfNeeded();
  }

  if (level === 3 && levelConfig.features.keyDisable && disabledKey && e.key === ' ') {
    e.preventDefault();
    
    if (isDrying) return;
    
    spacebarPresses++;
    
    if (spacebarPresses >= 10) {
      isDrying = true;
      keyDisableText.textContent = '⏳ Key is drying... 0%';
      showModal('🎉', 'Breaking free! Key is drying...', false);
      
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
      keyDisableBar.style.width = (spacebarPresses * 10) + '%';
      keyDisableText.textContent = `🚫 Key "${disabledKey}" is stuck! Press SPACEBAR ${10 - spacebarPresses} more times to break free!`;
    }
    return;
  }
  
  if (level === 3 && disabledKey) {
    if (isDrying && e.key !== ' ') {
      e.preventDefault();
      return;
    }
    
    if (e.key.toLowerCase() === disabledKey.toLowerCase()) {
      e.preventDefault();
      showModal('🚫', `Key "${disabledKey}" is stuck in glue!\nPress SPACEBAR ${10 - spacebarPresses} more times!`, true);
      return;
    }
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

  if (e.key.length !== 1) return;
  e.preventDefault();

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

  if (level === 1 && levelConfig.features.repeatedLetters) {
    const repeatChance = 0.18; // 18% chance
    if (Math.random() < repeatChance) {
      const repeatCount = Math.floor(Math.random() * 2) + 2; // 2-3 repeats
      for (let i = 0; i < repeatCount; i++) {
        typedChars.push(char);
      }
      showModal('🍯', 'Honey made the letter repeat!', true);
      
      recomputeCorrectCount();
      renderTyped();
      updateStats();
      return;
    }
  }

  if (level === 2) {
    typedChars.push(char);
    
    if (levelConfig.features.stretchEffect && Math.random() < 0.20) {
      stretchingChar = char;
      setTimeout(() => {
        stretchingChar = null;
        renderTyped();
      }, 1200);
      showModal('🫧', 'Gum stretched your letters!', true);
    }
    
    if (levelConfig.features.wordJumble && Math.random() < 0.015 && typedChars.length > 30) {
      typedChars = window.Punishments.stretchAndJumbleWord(typedChars);
      showModal('🫧', 'Gum scrambled your words!', true);
    }
    
    recomputeCorrectCount();
    renderTyped();
    updateStats();
    checkLevelCompletion();
    return;
  }

  typedChars.push(char);
  
  if (level === 3 && levelConfig.features.wordJumble && Math.random() < 0.1 && typedChars.length > 20) {
    typedChars = window.Punishments.jumbleLastFewWords(typedChars, 60);
    showModal('🌀', 'Glue scrambled many words!', true);
  }

  recomputeCorrectCount();
  renderTyped();
  updateStats();
  
  checkLevelCompletion();
}

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

document.addEventListener('DOMContentLoaded', () => {
  window.AudioManager.init();
  updateBackground();
  updateTitle();
  restart();
  typingArea.focus();
});