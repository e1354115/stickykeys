// levels.js
// Level configurations and sentence generators

// ---------- SENTENCE GENERATORS ----------
const subjects = ["the quick fox", "a lazy cat", "your keyboard", "the cursor", "sticky fingers", "sweet honey", "elastic gum", "thick glue"];
const verbs = ["jumps over", "runs past", "defeats", "helps", "chases", "escapes from", "saves", "finds"];
const objects = ["the lazy dog", "a green pipe", "the castle", "sticky keys", "sweet treats", "elastic bands", "glue bottles", "hidden blocks"];

function generateSentence(wordCount) {
  const sentences = [];
  let currentWords = 0;
  
  while (currentWords < wordCount) {
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const object = objects[Math.floor(Math.random() * objects.length)];
    
    let sentence = `${subject} ${verb} ${object}`;
    currentWords += sentence.split(' ').length;
    sentences.push(sentence);
  }
  
  return sentences.join(' ');
}

function generateMultiline(lines, wordsPerLine) {
  const result = [];
  for (let i = 0; i < lines; i++) {
    result.push(generateSentence(wordsPerLine));
  }
  return result.join('\n');
}

// ---------- AUDIO MANAGER ----------
window.AudioManager = {
  sounds: {
    honey: null,
    gum: null,
    glue: null
  },
  
  init() {
    // Simple silent audio for now - you can replace with actual sound URLs
    this.sounds.honey = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
    this.sounds.gum = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
    this.sounds.glue = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
  },
  
  play(level) {
    const soundMap = { 1: 'honey', 2: 'gum', 3: 'glue' };
    const sound = this.sounds[soundMap[level]];
    if (sound) {
      sound.loop = true;
      sound.volume = 0.3;
      sound.play().catch(() => {});
    }
  },
  
  stop() {
    Object.values(this.sounds).forEach(s => {
      if (s) {
        s.pause();
        s.currentTime = 0;
      }
    });
  }
};

// ---------- LEVELS ----------
window.LEVELS = {
  1: {
    name: "Honey Level",
    generator: () => generateSentence(12),
    theme: "honey",
    features: {
      inputLatency: true,
      drippingHoney: true,
      repeatOnWrong: true,
      slowTyping: true  // New feature for honey slowness
    }
  },
  2: {
    name: "Chewing Gum Level",
    generator: () => generateMultiline(2, 10), // Reduced from 4 lines to 2
    theme: "gum",
    features: {
      rubberBanding: true,
      stretchEffect: true,
      stickyClusters: true,
      repeatOnWrong: true,
      popups: true,
      exaggerateStretch: true  // New feature for exaggerated stretching
    }
  },
  3: {
    name: "Glue Level",
    generator: () => generateMultiline(6, 10),
    theme: "glue",
    features: {
      hardStuckKeys: true,
      repeatOnWrong: true,
      popups: true,
      wordJumble: true,
      dryingBar: true  // New feature for drying progress
    }
  }
};