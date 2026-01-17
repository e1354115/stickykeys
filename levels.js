// levels.js
// Level configurations and sentence generators

// ---------- AUDIO MANAGER ----------
window.AudioManager = {
  sounds: {
    honey: null,
    gum: null,
    glue: null
  },
  
  init() {
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
    name: "Honey Level - Repeated Letters",
    generator: function() { 
      const texts = [
        "The golden honey drips slowly from the wooden dipper. Its sweet aroma fills the kitchen.",
        "Sticky fingers make simple tasks feel like challenges. Yet there's something oddly satisfying about honey's persistence.",
        "Ancient civilizations prized honey as both food and medicine. Egyptian tombs contained jars that remained edible for thousands of years."
      ];
      return texts[Math.floor(Math.random() * texts.length)];
    },
    theme: "honey",
    features: {
      repeatedLetters: true,
      drippingHoney: true
    }
  },
  2: {
    name: "Chewing Gum Level - Stretching & Jumbling",
    generator: function() { 
      const texts = [
        "Chewing gum stretches and pulls between your fingers. The elastic texture bounces back with each tug. Pink bubbles expand and contract with satisfying pops. This stretchy substance has entertained generations for decades.",
        "The elasticity of bubble gum comes from synthetic rubber polymers. When you chew these long molecular chains slide past each other. The longer you chew the more pliable it becomes. Scientists have perfected this balance over many years.",
        "Sticky gum on your shoe creates an annoying connection. The adhesive properties become a nuisance where they shouldn't be. Walking becomes a series of sticky pulls. This is the dark side of gum's elastic nature."
      ];
      return texts[Math.floor(Math.random() * texts.length)];
    },
    theme: "gum",
    features: {
      stretchEffect: true,
      wordJumble: true,
      bubbles: true
    }
  },
  3: {
    name: "Glue Level - Jumble & Dry",
    generator: function() { 
      const texts = [
        "Industrial adhesive bonds materials together with incredible strength. The chemical reaction transforms liquid into solid. Engineers rely on these bonds to build everything from furniture to spacecraft. Modern glues can hold thousands of pounds. They are stronger than the materials they connect. This power comes from molecular bridges between surfaces.",
        "White school glue dries slowly and deliberately over several hours. Children watch fascinated as the transformation occurs. Sometimes they coat their hands to peel off dried glue. The drying process releases water into the air. Only polymer chains remain to create the bond. This simple chemistry teaches patience and observation.",
        "Super glue bonds instantly upon contact with surfaces. The cyanoacrylate formula reacts with moisture in the air. It polymerizes rapidly into an incredibly strong adhesive. Fingers accidentally glued together serve as painful reminders. Handle this substance with extreme care and respect. Only special solvents can break the connection it creates."
      ];
      return texts[Math.floor(Math.random() * texts.length)];
    },
    theme: "glue",
    features: {
      wordJumble: true,
      dryingBar: true,
      glueFlows: true,
      keyDisable: true
    }
  }
};