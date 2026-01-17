// levels.js
// Only level configs live here.

window.LEVELS = {
    1: {
      name: "Level 1",
      hint: "Level 1: one long sentence. Wrong key → next key repeats 3–7 times.",
      texts: [
        "the quick brown fox jumps over the lazy dog but the keyboard is plotting revenge",
        "typing should be relaxing until you make one tiny mistake and everything falls apart",
        "this is a normal typing test except it absolutely is not normal at all"
      ],
      punishments: {
        stickyRepeat: true,
        popups: false,
        wordJumble: false
      }
    },
  
    2: {
      name: "Level 2",
      hint: "Level 2: 3 lines. Sticky repeat + random popups.",
      texts: [
        "line one: i will type carefully\nline two: surely nothing bad happens\nline three: famous last words",
        "line one: focus\nline two: breathe\nline three: why is there a popup",
        "line one: okay\nline two: okay\nline three: not okay"
      ],
      punishments: {
        stickyRepeat: true,
        popups: true,
        wordJumble: false
      }
    },
  
    3: {
      name: "Level 3",
      hint: "Level 3: 5 lines. Sticky repeat + popups + words jumble up (on mistake).",
      texts: [
        "line one: this is fine\nline two: still fine\nline three: i can handle this\nline four: why are words moving\nline five: i regret everything",
        "line one: calm\nline two: chaos\nline three: more chaos\nline four: maximum chaos\nline five: keyboard apocalypse",
        "line one: i love typing\nline two: i love typing\nline three: i do not love typing\nline four: why is it shuffling\nline five: make it stop"
      ],
      punishments: {
        stickyRepeat: true,
        popups: true,
        wordJumble: true
      }
    }
  };
  