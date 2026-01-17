// punishments.js
// All annoying features live here.

window.Punishments = (function () {
    let popupTimerId = null;
  
    function startPopups() {
      stopPopups();
      // tick every second; 30% chance to popup
      popupTimerId = setInterval(() => {
        if (Math.random() < 0.30) annoyingPopup();
      }, 1000);
    }
  
    function stopPopups() {
      if (popupTimerId) clearInterval(popupTimerId);
      popupTimerId = null;
    }
  
    function annoyingPopup() {
      alert(
        ["skill issue", "have you tried typing better", "keyboard says no", "oops"][Math.floor(Math.random() * 4)]
      );
    }
  
    // Takes typedChars array and returns a NEW typedChars array (so core stays clean)
    function jumbleLastFewWords(typedChars, chunkSize = 40) {
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
      jumbleLastFewWords
    };
  })();
  