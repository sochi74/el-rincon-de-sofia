// Colors, sizes and constants shared by the whole game.
var CONFIG = {
  colors: {
    cream: "#F5EBDD",
    wood: "#B07A4F",
    terracotta: "#C8664A",
    sage: "#8FA88A",
    darkBrown: "#4A3428",
    white: "#FFFDF8",
    woodLight: "#C99A6E",
    tileLight: "#FBF4EA",
    tileDark: "#EAD9C4",
    carpet: "#A9BFA4",
    grass: "#CFDDBF",
    // City colors: grass greens, water blue and stone gray.
    cityGrass: "#A8C686",
    cityGrassLight: "#C6DCA4",
    cityGrassDark: "#6F9460",
    water: "#7DB9D6",
    waterLight: "#B5DCEC",
    stone: "#B8B2A7",
    stoneLight: "#DAD4C8"
  },

  // Size of the house drawing in world units; it is scaled to fit the window.
  world: { width: 1000, height: 720 },

  // Empty space kept around the house, in screen pixels.
  margin: 24,

  wallThickness: 16,
  doorWidth: 90,

  fontFamily: '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif',

  rooms: [
    { id: "kitchen", name: "Cocina", x: 40, y: 40, w: 380, h: 300, floor: "tiles" },
    { id: "bedroom", name: "Dormitorio", x: 420, y: 40, w: 540, h: 300, floor: "carpet" },
    { id: "living", name: "Sala", x: 40, y: 340, w: 920, h: 340, floor: "wood" }
  ],

  furniture: [
    { id: "fridge", name: "Refrigerador", x: 70, y: 80, w: 90, h: 80 },
    { id: "bed", name: "Cama", x: 720, y: 80, w: 190, h: 220 },
    { id: "tv", name: "Televisión", x: 420, y: 370, w: 200, h: 34 },
    { id: "sofa", name: "Sofá", x: 390, y: 560, w: 260, h: 90 }
  ],

  // Things to use in the city, by real.fixer's tent on the other side of the bridge.
  cityObjects: [
    { id: "tent", name: "Carpa", x: 775, y: 225, w: 150, h: 130 },
    { id: "campfire", name: "Fogata", x: 762, y: 440, w: 76, h: 64 }
  ],

  // Doorways between rooms; characters walk through their centers.
  doorways: [
    { rooms: ["kitchen", "bedroom"], x: 420, y: 195 },
    { rooms: ["kitchen", "living"], x: 275, y: 340 },
    { rooms: ["bedroom", "living"], x: 515, y: 340 }
  ],

  // The front door of the house: where to tap it (the welcome mat and the doorway above it),
  // and the spot in the Sala next to it where a character goes out and comes back in.
  frontDoor: { tap: { x: 100, y: 668, w: 90, h: 48 }, inside: { x: 145, y: 640 } },

  // How close a character's feet may get to the walls of a room.
  walkMargin: { side: 30, top: 100, bottom: 20 },

  // How big the characters are drawn.
  characterScale: 1.35,

  // Walking speed in world units per second.
  walkSpeed: 170,

  glow: "#FFD66B",

  // The four needs. Each one drains this many points per second before traits.
  needs: [
    { id: "hunger", name: "Hambre", emoji: "🍔", drain: 0.22 },
    { id: "energy", name: "Energía", emoji: "😴", drain: 0.2 },
    { id: "fun", name: "Diversión", emoji: "🎮", drain: 0.24 },
    { id: "social", name: "Social", emoji: "💬", drain: 0.18 }
  ],

  // Needs start near this value, plus or minus a little.
  needStart: 80,
  needStartVariation: 5,

  // Bar colors: green above 60, yellow from 30 to 60, red below 30.
  needLevels: { good: 60, low: 30 },
  needColors: { good: "#8FA88A", ok: "#E2B44B", low: "#C8664A" },

  // How traits change the drain speed (from CHARACTERS.md). "all" means every need.
  traitDrain: {
    foodie: { hunger: 1.5 },
    sleepy: { energy: 1.5 },
    creative: { fun: 1.5 },
    calm: { all: 0.85 }
  },

  // How traits change what an activity gives (from CHARACTERS.md).
  traitGain: {
    gamer: { watchTv: 1.5 }
  },

  // How traits change the Social that socializing gives (from CHARACTERS.md). "all" means every interaction.
  traitSocial: {
    party: { all: 1.5 },
    shy: { all: 0.7 },
    chatty: { chat: 1.5 }
  },

  // How the traits of the one who starts change the Amistad it gives (from CHARACTERS.md).
  traitFriendship: {
    jokester: { joke: 1.5 }
  },

  // Extra for doing your favorite activity.
  favoriteBonus: 1.25,

  // Conversations: times in seconds, and how far apart the two stand.
  social: {
    gap: 38,
    lineMin: 2.2,
    lineMax: 4,
    lineExtraPerLetter: 0.04,
    cheerTime: 1.4,
    cooldown: 3,
    waitBubbleTime: 1.2
  },

  // Free will: the one not selected looks after a need below "threshold" when it is idle.
  // It waits "pause" seconds after finishing something, and "retry" seconds if it could not go.
  // "goesTo" says where a character goes for some needs; for the rest it does as always.
  freeWill: {
    threshold: 50,
    pause: 1,
    retry: 3,
    goesTo: { realfixer: { energy: "tent", fun: "campfire", hunger: "fridge" } }
  },

  // Visits: when "who" is idle and all its needs are fine, every "wait" seconds or so it walks to
  // Sofía's house, stands at "spot" in the Sala, stays "stay" seconds and goes back home.
  visit: { who: "realfixer", wait: { min: 60, max: 120 }, stay: 30, spot: { x: 790, y: 540 } },

  // Mood star over the head: its size, how fat its points are, and the room it takes so
  // bubbles go above it. Its colors are brighter than the bars so it stands out on any floor.
  moodStar: {
    radius: 14,
    inner: 0.55,
    room: 34,
    colors: { good: "#5FB35A", ok: "#F2C230", low: "#E0533D" }
  },

  // Game clock: a whole day lasts "dayLength" real seconds. A new game starts on day "startDay" at "startMinute".
  // Times are minutes after midnight. Day goes from "dayStart" to "nightStart"; the world darkens from
  // "duskStart" to "duskEnd" and brightens again from "dawnStart" to "dawnEnd". At night Energía drains
  // "nightEnergy" times faster. "speed" makes the clock run faster (1 is normal).
  clock: {
    dayLength: 480,
    startDay: 1,
    startMinute: 8 * 60,
    dayStart: 7 * 60,
    nightStart: 19 * 60,
    duskStart: 19 * 60,
    duskEnd: 20 * 60,
    dawnStart: 6 * 60,
    dawnEnd: 7 * 60,
    nightEnergy: 1.3,
    speed: 1
  },

  // Night look: the blue-violet tint the world is multiplied by when it is fully dark, and the warm light colors.
  night: {
    tint: "#6E6AAE",
    warmLight: "255, 196, 110",
    windowLight: "#FFD66B"
  },

  // Living world: characters blink every "min" to "max" seconds, keeping the eyes closed "length" seconds,
  // and breathe "speed" radians per second, growing "amount" taller. Trees sway up to "amount" world units,
  // each one at its own speed between "slow" and "fast".
  alive: {
    blink: { min: 3, max: 6, length: 0.15 },
    breathe: { speed: 2.4, amount: 0.02 },
    sway: { amount: 3, slow: 0.7, fast: 1.4 }
  },

  // Autosave: how often, in seconds, and the name of the save in the browser.
  save: { every: 10, key: "el-rincon-de-sofia-save" },

  // Drawing colors and starting place and spot for each character: real.fixer next to his tent, Sofía in the Sala.
  characterLooks: {
    realfixer: {
      icon: "🧢",
      start: { place: "city", x: 930, y: 400 },
      skin: "#F1CDB3",
      hair: "#2E2420",
      beard: "#2E2420",
      beardGray: "#B9B2AA",
      eyes: "#3E8C8A",
      cap: "#1F2A44",
      capBrim: "#16203A",
      shirt: "#1E1E1E",
      collar: "#3A3A3A",
      pants: "#2E3D63",
      shoes: "#151515",
      pack: "#0B0B0B",
      gold: "#E2B44B"
    },
    sofia: {
      icon: "💗",
      start: { place: "house", x: 270, y: 480 },
      skin: "#F6D3BC",
      hair: "#7A4B2E",
      eyes: "#4A3428",
      cheeks: "rgba(232, 120, 140, 0.45)",
      shirt: "#E795AE",
      pants: "#F6C8D4",
      shoes: "#C8664A",
      gold: "#E2B44B",
      // Her Princess crown
      crown: "#E8BE4F",
      crownEdge: "#B8862E",
      gem: "#E8607E"
    }
  }
};
