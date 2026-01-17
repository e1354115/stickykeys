// levels.js
// Level configurations with dynamic sentence generation

// ---------- SENTENCE GENERATORS ----------
const subjects = ["the quick fox", "a lazy cat", "your keyboard", "the cursor", "mario", "luigi", "bowser", "princess peach", "yoshi", "toad"];
const verbs = ["jumps over", "runs past", "defeats", "helps", "chases", "escapes from", "saves", "finds", "rescues", "avoids"];
const objects = ["the lazy dog", "a green pipe", "the castle", "mushroom kingdom", "a fire flower", "flying koopas", "the finish line", "hidden blocks", "secret coins", "the flagpole"];
const connectors = ["but", "and", "while", "because", "although", "however", "meanwhile", "suddenly", "unexpectedly", "fortunately"];
const actions = ["the game gets harder", "everything falls apart", "chaos begins", "mistakes multiply", "keys stick together", "words start dancing", "the screen shakes", "reality breaks down", "panic sets in", "victory seems impossible"];

function generateSentence(wordCount) {
  const sentences = [];
  let currentWords = 0;
  
  while (currentWords < wordCount) {
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const object = objects[Math.floor(Math.random() * objects.length)];
    
    let sentence = `${subject} ${verb} ${object}`;
    currentWords += sentence.split(' ').length;
    
    // Add connectors and actions for variety
    if (currentWords < wordCount - 5 && Math.random() > 0.5) {
      const connector = connectors[Math.floor(Math.random() * connectors.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      sentence += ` ${connector} ${action}`;
      currentWords += (connector.split(' ').length + action.split(' ').length);
    }
    
    sentences.push(sentence);
  }
  
  return sentences.join(' ');
}

function generateMultiline(lines, wordsPerLine) {
  const result = [];
  for (let i = 0; i < lines; i++) {
    result.push(`line ${i + 1}: ${generateSentence(wordsPerLine)}`);
  }
  return result.join('\n');
}

// ---------- LEVELS ----------
window.LEVELS = {
  1: {
    name: "World 1",
    generator: () => generateSentence(15), // ~15 words
    punishments: {
      stickyRepeat: true,
      popups: false,
      wordJumble: false
    }
  },
  2: {
    name: "World 2",
    generator: () => generateMultiline(3, 12), // 3 lines, ~12 words each
    punishments: {
      stickyRepeat: true,
      popups: true,
      wordJumble: false
    }
  },
  3: {
    name: "World 3",
    generator: () => generateMultiline(5, 15), // 5 lines, ~15 words each
    punishments: {
      stickyRepeat: true,
      popups: true,
      wordJumble: true
    }
  }
};