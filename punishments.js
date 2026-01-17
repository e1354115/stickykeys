// punishments.js
// All annoying features and visual effects

window.Punishments = (function () {
  
  function addHoneyDrip() {
    const container = document.getElementById('honeyDrips');
    const drip = document.createElement('div');
    drip.className = 'honey-drip';
    drip.style.left = `${Math.random() * 100}%`;
    drip.style.animationDelay = `${Math.random() * 0.5}s`;
    
    container.appendChild(drip);
    
    setTimeout(() => {
      container.removeChild(drip);
    }, 3000);
  }

  function addBubble() {
    const container = document.getElementById('bubbles');
    const bubble = document.createElement('div');
    const size = Math.random() * 60 + 40;
    const duration = Math.random() * 3 + 2;
    
    bubble.className = 'bubble';
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.animationDuration = `${duration}s`;
    
    container.appendChild(bubble);
    
    setTimeout(() => {
      container.removeChild(bubble);
    }, duration * 1000);
  }

  function addGlueFlow() {
    const container = document.getElementById('glueFlows');
    const flow = document.createElement('div');
    const width = Math.random() * 40 + 30;
    
    flow.className = 'glue-flow';
    flow.style.left = `${Math.random() * 100}%`;
    flow.style.width = `${width}px`;
    
    container.appendChild(flow);
    
    setTimeout(() => {
      container.removeChild(flow);
    }, 4000);
  }

  // Improved word jumbling - scrambles last few words AGGRESSIVELY
  function jumbleLastFewWords(typedChars, chunkSize = 50) {
    const start = Math.max(0, typedChars.length - chunkSize);
    const beforeChunk = typedChars.slice(0, start).join("");
    const chunk = typedChars.slice(start).join("");
    
    // Split into words
    const words = chunk.trim().split(/\s+/);
    
    if (words.length <= 3) return typedChars;

    // Scramble MANY words - 6-10 words or all available
    const wordsToScramble = Math.min(words.length, Math.floor(Math.random() * 5) + 6);
    const startIdx = Math.max(0, words.length - wordsToScramble);
    const wordsToKeep = words.slice(0, startIdx);
    const wordsToMix = words.slice(startIdx);

    // Fisher-Yates shuffle - do it TWICE for more chaos
    for (let shuffle = 0; shuffle < 2; shuffle++) {
      for (let i = wordsToMix.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordsToMix[i], wordsToMix[j]] = [wordsToMix[j], wordsToMix[i]];
      }
    }

    const newChunk = [...wordsToKeep, ...wordsToMix].join(" ");
    const result = beforeChunk + newChunk;
    return result.split("");
  }

  // Aggressive function for gum level - scrambles MULTIPLE words completely
  function stretchAndJumbleWord(typedChars, targetText) {
    if (typedChars.length < 15) return typedChars;
    
    const typedStr = typedChars.join("");
    const words = typedStr.trim().split(/\s+/);
    
    if (words.length < 3) return typedChars;
    
    // Scramble last 2-4 words completely
    const numWordsToScramble = Math.min(words.length, Math.floor(Math.random() * 3) + 2);
    const startIdx = Math.max(0, words.length - numWordsToScramble);
    const wordsToKeep = words.slice(0, startIdx);
    const wordsToScramble = words.slice(startIdx);
    
    // Scramble BOTH word order AND letters within words
    const scrambledWords = wordsToScramble.map(word => {
      if (word.length <= 2) return word;
      
      // Completely scramble all letters
      const letters = word.split('');
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
      return letters.join('');
    });
    
    // ALSO shuffle the word order
    for (let i = scrambledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambledWords[i], scrambledWords[j]] = [scrambledWords[j], scrambledWords[i]];
    }
    
    const newStr = [...wordsToKeep, ...scrambledWords].join(' ');
    return newStr.split('');
  }

  return { 
    addHoneyDrip,
    addBubble,
    addGlueFlow,
    jumbleLastFewWords,
    stretchAndJumbleWord
  };
})();