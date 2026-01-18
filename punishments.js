window.Punishments = (function () {
  
  function addHoneyDrip() {
    const container = document.getElementById('honeyDrips');
    const drip = document.createElement('div');
    drip.className = 'honey-drip';
    drip.style.left = `${Math.random() * 100}%`;
    drip.style.animationDelay = `${Math.random() * 0.5}s`;
    
    container.appendChild(drip);
    
    setTimeout(() => {
      if (container.contains(drip)) {
        container.removeChild(drip);
      }
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
      if (container.contains(bubble)) {
        container.removeChild(bubble);
      }
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
      if (container.contains(flow)) {
        container.removeChild(flow);
      }
    }, 4000);
  }

  function jumbleLastFewWords(typedChars, chunkSize = 60) {
    const typedStr = typedChars.join("");
    const words = typedStr.trim().split(/\s+/);
    
    if (words.length <= 3) return typedChars;

    const wordsToScramble = Math.min(words.length, Math.floor(Math.random() * 5) + 6);
    const startIdx = Math.max(0, words.length - wordsToScramble);
    const wordsToKeep = words.slice(0, startIdx);
    const wordsToMix = words.slice(startIdx);

    for (let shuffle = 0; shuffle < 2; shuffle++) {
      for (let i = wordsToMix.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordsToMix[i], wordsToMix[j]] = [wordsToMix[j], wordsToMix[i]];
      }
    }

    const newStr = [...wordsToKeep, ...wordsToMix].join(" ");
    return newStr.split("");
  }

  function stretchAndJumbleWord(typedChars) {
    const typedStr = typedChars.join("");
    const words = typedStr.trim().split(/\s+/);
    
    if (words.length < 2) return typedChars;
    
=    const numWordsToScramble = Math.min(words.length, Math.floor(Math.random() * 2) + 1);
    const startIdx = Math.max(0, words.length - numWordsToScramble);
    const wordsToKeep = words.slice(0, startIdx);
    const wordsToScramble = words.slice(startIdx);
    
    const scrambledWords = wordsToScramble.map(word => {
      if (word.length <= 3) return word; 
      
      const letters = word.split('');
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
      return letters.join('');
    });
    
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