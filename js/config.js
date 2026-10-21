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
    grass: "#CFDDBF"
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

  // Doorways between rooms; characters walk through their centers.
  doorways: [
    { rooms: ["kitchen", "bedroom"], x: 420, y: 195 },
    { rooms: ["kitchen", "living"], x: 275, y: 340 },
    { rooms: ["bedroom", "living"], x: 515, y: 340 }
  ],

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

  // Drawing colors and starting spot (in the Sala) for each character.
  characterLooks: {
    realfixer: {
      icon: "🧢",
      start: { x: 790, y: 540 },
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
      start: { x: 270, y: 480 },
      skin: "#F6D3BC",
      hair: "#7A4B2E",
      eyes: "#4A3428",
      cheeks: "rgba(232, 120, 140, 0.45)",
      shirt: "#E795AE",
      pants: "#F6C8D4",
      shoes: "#C8664A",
      gold: "#E2B44B"
    }
  }
};
