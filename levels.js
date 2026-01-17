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
        "The golden honey drips slowly from the wooden dipper, creating a mesmerizing spiral as it falls into the jar below. Its sweet aroma fills the kitchen, reminding us of lazy summer afternoons spent in the garden. Bees work tirelessly to create this liquid gold, visiting thousands of flowers to gather nectar. Each jar represents countless hours of nature's labor, a testament to the intricate balance of our ecosystem.",
        "Sticky situations require creative solutions, much like untangling yourself from a web of honey-covered fingers. The viscous liquid clings stubbornly to every surface it touches, making simple tasks feel like monumental challenges. Yet there's something oddly satisfying about its persistence, the way it refuses to let go easily. This stickiness, while frustrating, is what makes honey so unique and valuable in the culinary world.",
        "Ancient civilizations prized honey as both food and medicine, recognizing its remarkable preservative properties long before modern science could explain them. Egyptian tombs contained jars of honey that remained edible after thousands of years, a testament to its eternal nature. The antibacterial qualities that allow honey to last forever also make it an effective wound healer."
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
        "Chewing gum stretches and pulls between your fingers, creating long strings that seem to defy gravity. The elastic texture bounces back with each tug, never quite breaking but always threatening to. Pink bubbles expand and contract, creating pockets of air that pop with satisfying sounds. This stretchy substance has entertained generations, turning simple jaw movements into an art form that requires surprising skill and patience.",
        "The elasticity of bubble gum comes from synthetic rubber polymers that give it that characteristic stretch and snap. When you chew, these long molecular chains slide past each other, allowing the gum to deform without breaking. The longer you chew, the more the flavor compounds break down and the polymers become more pliable. Scientists have spent decades perfecting this balance between stretchiness and flavor retention.",
        "Sticky gum on the bottom of your shoe creates an annoying connection to the ground with each step. The adhesive properties that make it fun to chew become a nuisance when it ends up where it shouldn't be. Walking becomes a series of sticky pulls, each footfall accompanied by an unwanted tug. This is the dark side of gum's elastic nature, a reminder that every convenience has its drawbacks."
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
        "Industrial adhesive bonds materials together with incredible strength, creating connections that can withstand tremendous force. The chemical reaction that occurs as glue dries transforms liquid into solid, forging molecular bridges between surfaces. Engineers rely on these bonds to build everything from furniture to spacecraft, trusting in the power of properly applied adhesive. Modern glues can hold thousands of pounds, making them stronger than the materials they connect.",
        "White school glue dries slowly and deliberately, changing from opaque liquid to transparent solid over the course of hours. Children watch fascinated as the transformation occurs, sometimes deliberately coating their hands to peel off the dried glue like a second skin. The drying process releases water into the air, leaving behind only the polymer chains that create the bond. This simple chemistry demonstration teaches patience and observation while also being oddly satisfying.",
        "Super glue bonds instantly upon contact, creating permanent connections in mere seconds rather than hours. The cyanoacrylate formula reacts with moisture in the air and on surfaces, polymerizing rapidly into an incredibly strong adhesive. Fingers accidentally glued together serve as a painful reminder to handle this substance with extreme care and respect. Once bonded, only special solvents or careful mechanical separation can break the connection it creates."
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