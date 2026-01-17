// punishments.js
// All annoying features and visual effects

window.Punishments = (function () {
    let popupTimerId = null;
  
    const popupMessages = [
      { icon: "🍯", text: "Keep typing!\nStay focused!" },
      { icon: "⚡", text: "Speed up!\nYou're too slow!" },
      { icon: "🎯", text: "Watch your accuracy!" },
      { icon: "🔥", text: "Your keyboard is sticky!" },
      { icon: "💫", text: "Don't give up now!" },
      { icon: "⭐", text: "Almost there!\nKeep going!" }
    ];
  
    function startPopups() {
      stopPopups();
      popupTimerId = setInterval(() => {
        if (Math.random() < 0.25) {
          const popup = popupMessages[Math.floor(Math.random() * popupMessages.length)];
          showModal(popup.icon, popup.text);
        }
      }, 3000);
    }
  
    function stopPopups() {
      if (popupTimerId) clearInterval(popupTimerId);
      popupTimerId = null;
    }
  
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
  
    function jumbleLastFewWords(typedChars, chunkSize = 30) {
      const start = Math.max(0, typedChars.length - chunkSize);
      const chunk = typedChars.slice(start).join("");
      const parts = chunk.split(" ");
      
      if (parts.length <= 2) return typedChars;
  
      for (let i = parts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [parts[i], parts[j]] = [parts[j], parts[i]];
      }
  
      const newChunk = parts.join(" ");
      const replaced = typedChars.slice(0, start).join("") + newChunk;
      return replaced.split("");
    }
  
    return { 
      startPopups, 
      stopPopups, 
      addHoneyDrip,
      addBubble,
      addGlueFlow,
      jumbleLastFewWords 
    };
  })();