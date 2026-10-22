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
    { id: "stove", name: "Estufa", x: 240, y: 72, w: 100, h: 70 },
    { id: "bed", name: "Cama", x: 720, y: 80, w: 190, h: 220 },
    { id: "tv", name: "Televisión", x: 620, y: 370, w: 200, h: 34 },
    { id: "sofa", name: "Sofá", x: 590, y: 560, w: 260, h: 90 }
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

  // Going up a friendship level: how many hearts rain and how long it all lasts, in seconds.
  friendLevel: { hearts: 22, time: 3.5 },

  // Gifts from the backpack: the Amistad each kind of gift gives, how many gifts each one takes per day of the game,
  // how far from the other the giver stands, and how long "Regalando 🎁" and the answer stay, in seconds.
  gifts: {
    favorite: 15,
    boot: -3,
    other: 6,
    perDay: 3,
    gap: 70,
    giveTime: 2,
    answerTime: 2.6
  },

  // Krohna, real.fixer's kitten: how fast it walks, how close it stays to him and where it sleeps by the Carpa.
  pet: {
    speed: 200,
    side: 42,
    farther: 70,
    repath: 0.4,
    sleepSpot: { x: 812, y: 390 }
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
  visit: { who: "realfixer", wait: { min: 60, max: 120 }, stay: 30, spot: { x: 420, y: 540 } },

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

  // Word tag: on a phone or tablet, how many seconds it stays after touching a thing.
  wordTag: { touchSeconds: 2 },

  // Magic coins: a new game starts with "start". Every "every.min" to "every.max" seconds of play a shiny coin
  // appears on the city grass, never more than "maxOnGround" at once. Walking within "reach" of one picks it up
  // and adds "value". "popTime" is how long the sparkle and the "+5" text last.
  coins: {
    start: 20,
    value: 5,
    every: { min: 30, max: 60 },
    maxOnGround: 3,
    reach: 26,
    radius: 11,
    popTime: 1.2,
    gold: "#E2B44B",
    edge: "#B8862E"
  },

  // Sofía's garden in the city, to the right of her house: the fence around it and the 6 plots inside (2 rows of 3).
  // A watered seed takes "growTime" seconds of play to bloom. Planting, watering and harvesting take "actionTime"
  // seconds; "Ocupado" stays "busyTime" seconds; the "+N" text after selling lasts "popTime" seconds.
  // A character works a plot standing "standAbove" world units above it.
  // Soil is wood colored when dry and darker when watered. "moonLight" is the halo of the moon flowers at night.
  garden: {
    fence: { x: 314, y: 386, w: 130, h: 78 },
    plot: { w: 34, h: 28, gap: 6 },
    growTime: 90,
    actionTime: 2,
    busyTime: 1.5,
    popTime: 1.2,
    standAbove: 36,
    drySoil: "#B07A4F",
    wetSoil: "#6E4A32",
    moonLight: "190, 210, 245",
    // Butterflies (only decoration): they flutter over the garden by day, hide at night and stand still with Pausa.
    // Each one has its wing color and where it floats, as "dx", "dy" from the middle of the fence.
    butterflies: {
      size: 7,
      roam: { x: 62, y: 34 },
      list: [
        { color: "#C8664A", dx: -30, dy: -8, phase: 0 },
        { color: "#F5EBDD", dx: 26, dy: 4, phase: 2.1 },
        { color: "#B07A4F", dx: 4, dy: -20, phase: 4.2 },
        { color: "#8FA88A", dx: -12, dy: 16, phase: 1.3 }
      ]
    }
  },

  // Fishing in the river and gathering in the forest. Fishing takes "fishTime" seconds and gives "fishFun" Diversión;
  // gathering takes "gatherTime" seconds. The forest keeps "forestMin" to "forestMax" things at once, and after one is
  // gathered a new one appears "regrow.min" to "regrow.max" seconds of play later. "Ocupado" stays "busyTime" seconds,
  // and the floating text after a catch lasts "popTime" seconds. Two fishers closer than "fishGap" are at the same spot.
  // "crystal" is the light blue of the crystals and "crystalLight" their glow.
  gather: {
    fishTime: 4,
    fishFun: 10,
    gatherTime: 2,
    forestMin: 3,
    forestMax: 5,
    regrow: { min: 45, max: 90 },
    busyTime: 1.5,
    popTime: 1.8,
    fishGap: 50,
    crystal: "#B5DCEC",
    crystalLight: "181, 220, 236"
  },

  // Cooking at the Estufa or the Fogata takes "cookTime" seconds and eating a dish "eatTime" seconds.
  // "Ocupado" stays "busyTime" seconds, and the floating text when a dish is ready lasts "popTime" seconds.
  cooking: {
    cookTime: 4,
    eatTime: 3,
    busyTime: 1.5,
    popTime: 1.8
  },

  // Autosave: how often, in seconds, and the name of the save in the browser.
  // "menuKey" remembers whether the panel was open or closed.
  save: { every: 10, key: "el-rincon-de-sofia-save", menuKey: "el-rincon-de-sofia-menu", soundKey: "el-rincon-de-sofia-sound" },

  // Sounds and music made with code (js/audio.js). Volumes go from 0 to 1: "master" is for everything,
  // then each group: effects, place sounds and music (softer at night). The tempo is seconds per music step.
  // Krohna meows every "meow.min" to "meow.max" seconds while it is where the selected one is.
  sound: {
    master: 0.7,
    effects: 0.35,
    ambience: 0.22,
    music: { day: 0.16, night: 0.09 },
    tempo: { day: 0.42, night: 0.56 },
    fade: 0.6,
    meow: { min: 60, max: 180 }
  },

  // The neighbors, Lumi and Vladi (js/neighbors.js). They live in the city, walk a little slower than Sofía and real.fixer
  // ("speed"), and stay "stay.min" to "stay.max" seconds at each spot they visit before going on.
  // Lumi is "scale" times as big as the others and floats "float" world units over the grass. At night her trail of sparkles
  // lasts "trail.life" seconds, with a new sparkle every "trail.every" seconds while she moves.
  // Vladi is in his castle by day; at night, at some of his stops ("scared.chance") he shakes and hugs his teddy bear
  // for "scared.time" seconds. "home" is the spot by each house door where they come out and stand.
  // "spots" are the places each one walks to. "houses" are where their homes are drawn on the city map: Lumi's treehouse
  // on top of a big forest tree, with its rope ladder down to the grass, and Vladi's castle on free grass by the bottom right.
  // At night, when both are outside closer than "chat.near" and nobody is talking with them, Lumi and Vladi stop and chat
  // on their own, at most once every "chat.wait.min" to "chat.wait.max" seconds of play; each chat gives both "chat.friendship" Amistad.
  neighbors: {
    chat: { near: 170, wait: { min: 60, max: 120 }, friendship: 5 },
    lumi: {
      speed: 130,
      scale: 0.82,
      float: 12,
      stay: { min: 3, max: 6 },
      trail: { every: 0.06, life: 0.9 },
      home: { x: 290, y: 216 },
      spots: [
        { x: 290, y: 216 },
        { x: 120, y: 205 },
        { x: 425, y: 285 },
        { x: 500, y: 610 },
        { x: 626, y: 360 },
        { x: 379, y: 492 }
      ]
    },
    vladi: {
      speed: 105,
      scale: 1,
      stay: { min: 4, max: 8 },
      scared: { chance: 0.45, time: 2.6 },
      home: { x: 890, y: 692 },
      spots: [
        { x: 890, y: 692 },
        { x: 770, y: 640 },
        { x: 875, y: 485 },
        { x: 480, y: 635 }
      ]
    },
    houses: {
      treehouse: { x: 256, y: 88, w: 68, h: 118, ladder: { x: 282, y: 150, w: 16, h: 54 } },
      castle: { x: 825, y: 565, w: 130, h: 100 }
    }
  },

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
    },
    // Lumi, the fairy: red braids, a peach dress, golden shoes and golden wings.
    lumi: {
      icon: "🧚",
      skin: "#F7DCC8",
      hair: "#C8552E",
      hairDark: "#A3401F",
      eyes: "#4A3428",
      cheeks: "rgba(232, 120, 140, 0.4)",
      freckles: "#C98A6A",
      shirt: "#F4B494",
      dress: "#F4B494",
      dressHem: "#E39A78",
      pants: "#F7DCC8",
      shoes: "#E2B44B",
      wing: "rgba(240, 204, 102, 0.85)",
      wingEdge: "#C99A2E"
    },
    // Vladi, the vampire: slicked-back black hair, a black suit with a white shirt, a black and red cape, and his teddy bear.
    vladi: {
      icon: "🧛",
      skin: "#EDE6E2",
      hair: "#1C1A22",
      eyes: "#4A3428",
      shirt: "#24222B",
      suit: "#24222B",
      whiteShirt: "#FFFDF8",
      pants: "#1E1C24",
      shoes: "#121116",
      cape: "#17151C",
      capeInside: "#B23A3A",
      fang: "#FFFFFF",
      bear: "#9A6B45",
      bearLight: "#C99A6E",
      bearDark: "#4A3428"
    }
  }
};
