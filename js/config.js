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
  ]
};
