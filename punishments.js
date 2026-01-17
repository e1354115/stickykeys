// punishments.js
// All annoying features live here.

window.Punishments = (function () {
  let popupTimerId = null;

  const popupMessages = [
    { icon: "👾", text: "BOWSER SAYS:\nType faster!" },
    { icon: "🍄", text: "POWER-UP NEEDED:\nYour typing skills!" },
    { icon: "⭐", text: "MARIO TIP:\nPractice makes perfect!" },
    { icon: "🔥", text: "FIRE FLOWER:\nYour keyboard is on fire!" },
    { icon: "❓", text: "MYSTERY BLOCK:\nWhat will happen next?" },
    { icon: "👻", text: "BOO APPEARS:\nDon't look away now!" },
    { icon: "⚡", text: "LIGHTNING STRIKE:\nStay focused!" },
    { icon: "🌟", text: "STAR POWER:\nInvincibility not included!" }
  ];

  function startPopups() {
    stopPopups();
    popupTimerId = setInterval(() => {
      if (Math.random() < 0.30) {
        const popup = popupMessages[Math.floor(Math.random() * popupMessages.length)];
        showModal(popup.icon, popup.text);
      }
    }, 1000);
  }

  function stopPopups() {
    if (popupTimerId) clearInterval(popupTimerId);
    popupTimerId = null;
  }

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

  return { startPopups, stopPopups, jumbleLastFewWords };
})();