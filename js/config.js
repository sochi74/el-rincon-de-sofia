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
    // Baño: little light blue and white tiles.
    bathTile: "#A8D8E3",
    bathTileWhite: "#F7FCFC",
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

  // Size of the city drawing in world units; it is scaled to fit the window.
  world: { width: 1000, height: 720 },

  // Size of the house drawing: wider than the city, for the Baño on the right of the Sala.
  houseWorld: { width: 1260, height: 720 },

  // Empty space kept around the house, in screen pixels.
  margin: 24,

  // On screens at least this wide, the open panel is a column on the left and the house and the city are drawn beside it
  // (style.css has the same width).
  panelColumn: 1000,

  wallThickness: 16,
  doorWidth: 90,

  fontFamily: '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif',

  rooms: [
    { id: "kitchen", name: "Cocina", x: 40, y: 40, w: 380, h: 300, floor: "tiles" },
    { id: "bedroom", name: "Dormitorio", x: 420, y: 40, w: 540, h: 300, floor: "carpet" },
    { id: "living", name: "Sala", x: 40, y: 340, w: 920, h: 340, floor: "wood" },
    { id: "bathroom", name: "Baño", x: 960, y: 340, w: 260, h: 340, floor: "bathTiles" }
  ],

  furniture: [
    { id: "fridge", name: "Refrigerador", x: 70, y: 80, w: 90, h: 80 },
    { id: "stove", name: "Estufa", x: 240, y: 72, w: 100, h: 70 },
    { id: "bed", name: "Cama", x: 720, y: 80, w: 190, h: 220 },
    { id: "tv", name: "Televisión", x: 620, y: 370, w: 200, h: 34 },
    { id: "sofa", name: "Sofá", x: 590, y: 560, w: 260, h: 90 },
    { id: "bathtub", name: "Bañera", x: 1055, y: 352, w: 150, h: 80 },
    { id: "sink", name: "Lavamanos", x: 972, y: 350, w: 76, h: 56 }
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
    { rooms: ["bedroom", "living"], x: 515, y: 340 },
    { rooms: ["living", "bathroom"], x: 960, y: 490 }
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

  // Professor Hoot's word of the day (js/lessons.js): magic coins for the right answer, and how long the floating
  // "+10 🪙" and "📖 ¡Palabra nueva!" last, in seconds.
  lessons: { reward: 10, popTime: 1.6 },

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

  // Krohna, real.fixer's kitten: how fast it walks and how close it stays to him. It sleeps in its bed by the Carpa (js/city.js).
  // When he goes through the door, it comes out on the other side "doorWait" seconds after him, or later if it was far.
  pet: {
    speed: 200,
    side: 42,
    farther: 70,
    repath: 0.4,
    doorWait: 0.8
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

  // Phones: a touch screen whose shorter side is at most "maxSide" pixels is a small screen (the panel is a drawer at the
  // bottom, buttons are bigger). Keeping a finger still "holdSeconds" shows the word; moving it more than "holdMove" pixels
  // is no longer holding still. Two fingers zoom from 1 up to "maxZoom", and the mouse wheel zooms "wheelStep" per notch.
  // In the house and the city "margin" is smaller on small screens.
  mobile: { maxSide: 500, holdSeconds: 0.5, holdMove: 12, maxZoom: 2.5, wheelStep: 0.0015, margin: 8 },

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

  // The weather of each day (js/weather.js): at "dayStart" (06:00) the day picks one by its chance out of 100, and it lasts
  // until 06:00 the next day. A rainy day rains until "rainEnd" (16:00), has a rainbow until "rainbowEnd" (18:00), and is sunny after.
  // Changes in the look take "fade" seconds (the rainbow "rainbowFade"). Puddles fill in "puddles.grow" seconds of play and dry
  // in "puddles.dry"; snow covers the roofs and the grass in "snow.cover" seconds and melts in "snow.melt". Once the snow is past
  // "snow.snowmanAt", the snowman is built in "snow.build" seconds; it melts in "snow.thaw". "snowman" is where it stands (its feet) and how big it is,
  // in the plaza, off the fountain, the paths and the sign. While it rains the fish come out as in "rainFish" (out of 100);
  // on foggy days the forest holds up to "fogForest.max" things, and "fogForest.crystal" of the new ones are crystals.
  weather: {
    chances: [
      { id: "sunny", chance: 50 },
      { id: "rain", chance: 20 },
      { id: "fog", chance: 20 },
      { id: "snow", chance: 10 }
    ],
    dayStart: 6 * 60,
    rainEnd: 16 * 60,
    rainbowEnd: 18 * 60,
    fade: 4,
    rainbowFade: 8,
    puddles: {
      grow: 30,
      dry: 45,
      // Where puddles form, on the grass and on the stones, as { x, y, r } (r: how wide when full).
      spots: [
        { x: 262, y: 618, r: 16 }, { x: 398, y: 632, r: 14 }, { x: 500, y: 420, r: 14 }, { x: 52, y: 655, r: 18 },
        { x: 330, y: 690, r: 16 }, { x: 530, y: 688, r: 14 }, { x: 700, y: 592, r: 18 }, { x: 905, y: 470, r: 16 },
        { x: 705, y: 168, r: 14 }, { x: 430, y: 322, r: 15 }
      ]
    },
    snow: { cover: 40, melt: 20, snowmanAt: 0.6, build: 5, thaw: 8 },
    snowman: { x: 484, y: 602, size: 1.3 },
    rainFish: { fish: 30, rainbowFish: 25 },
    // 🌠 Wishing stars: at night (from "from" to "to"), outside and with a clear sky, a shooting star crosses the top every
    // "every" seconds of play, taking "cross" seconds; "two" of the times another one follows "gap" seconds later.
    // "tail" is how long its tail of light is, in city units.
    shootingStars: { from: 20 * 60, to: 6 * 60, every: { min: 20, max: 60 }, cross: { min: 1, max: 2 }, two: 0.2,
      gap: { min: 0.3, max: 0.8 }, tail: 110 },
    fogForest: { max: 7, crystal: 0.5 },
    // The rainbow arc: its middle and size (in city units), the width of each band and how see-through it is.
    rainbow: {
      x: 500, y: 760, radius: 600, band: 9, alpha: 0.3,
      colors: ["#E8737A", "#F2A65A", "#F5D76E", "#9CCB86", "#7DB9D6", "#8C8FD1", "#B58BC9"]
    },
    colors: {
      snow: "#FBFCFF",
      snowShade: "#DCE6F0",
      carrot: "#E8873A",
      grayRain: "110, 118, 135",
      drop: "225, 235, 248",
      windowDrop: "120, 160, 190",
      fog: "238, 230, 248",
      fogLight: "246, 236, 255"
    }
  },

  // The edge of the valley (js/valleymap.js): the little dirt trail at the top of the city that goes to the Pradera de flores,
  // as its middle "x" and how far down it comes ("bottom"). A character walks to "edge" to go to the Pradera, and coming back
  // it appears at "foot". The little sand trail on the right edge goes to the Lago: its middle "y" and where it starts ("left"),
  // with its own "edge", "foot" and sign. The little leafy dirt trail on the left edge goes to the Bosque encantado: its
  // middle "y" and where it ends ("right"), with its own "edge", "foot" and sign. The little stone trail on the bottom edge
  // goes to the Montaña: its middle "x" and where it starts ("top"), with its own "edge", "foot" and sign.
  // "discoverTime" is how long "🗺️ ¡Zona descubierta!" stays, in seconds.
  valley: {
    trail: { x: 705, bottom: 178, half: 18 },
    edge: { x: 705, y: 132 },
    foot: { x: 705, y: 158 },
    sign: { x: 842, y: 100 },
    lakeTrail: { y: 496, left: 916, half: 15 },
    lakeEdge: { x: 968, y: 496 },
    lakeFoot: { x: 940, y: 496 },
    lakeSign: { x: 948, y: 462 },
    forestTrail: { y: 404, right: 78, half: 15 },
    forestEdge: { x: 32, y: 404 },
    forestFoot: { x: 60, y: 404 },
    forestSign: { x: 156, y: 371 },
    mountainTrail: { x: 470, top: 640, half: 15 },
    mountainEdge: { x: 470, y: 694 },
    mountainFoot: { x: 470, y: 664 },
    mountainSign: { x: 396, y: 678 },
    discoverTime: 3
  },

  // The Pradera de flores (js/meadow.js), a map as big as the city. Its trail comes in at the bottom: a character walks to
  // "edge" to go back to the city and arrives at "foot". Wild flowers to gather (like in the forest): "min" to "max" at once,
  // a new one "regrow.min" to "regrow.max" seconds of play after one is gathered, "gatherTime" seconds each.
  // The swing gives "swingFun" Diversión in "swingTime" seconds; sitting on the picnic blanket "sitFun" in "sitTime",
  // and eating a dish there takes "eatTime" seconds and gives "eatFun" Diversión more than the dish.
  // "Ocupado" stays "busyTime" seconds. "bees" is how many bees fly around.
  meadow: {
    edge: { x: 705, y: 698 },
    foot: { x: 705, y: 668 },
    min: 3,
    max: 5,
    regrow: { min: 45, max: 90 },
    gatherTime: 2,
    swingFun: 30,
    swingTime: 4,
    sitFun: 15,
    sitTime: 4,
    eatTime: 3,
    eatFun: 10,
    busyTime: 1.5,
    popTime: 1.8,
    bees: 5,
    dirt: "#C9A276",
    dirtLight: "#DDBD92",
    honey: "#E2B44B",
    honeyDark: "#B8862E",
    lavender: "#9B7BC4",
    poppy: "#D94A3A"
  },

  // The Lago (js/lake.js), a map as big as the city. Its trail comes in on the left: a character walks to "edge" to go back
  // to the city and arrives at "foot". Fishing from the pier or the shore takes "fishTime" seconds and gives "fishFun"
  // Diversión; two fishing closer than "fishGap" is "Ocupado". Shells and starfish on the sand, like the wild flowers of the
  // Pradera: "min" to "max" at once, a new one "regrow.min" to "regrow.max" seconds of play after one is gathered.
  // Building a sandcastle takes "castleTime" seconds and gives "castleFun" Diversión; lying in a beach chair takes
  // "sunTime" seconds and gives "sunEnergy" Energía and "sunFun" Diversión. "Ocupado" stays "busyTime" seconds.
  // Pacífica, the mermaid, is on her rock from "mermaid.from" to "mermaid.to" (minutes after midnight) and sings every
  // "sing.min" to "sing.max" seconds of play; she waves at whoever is closer than "wave" to her rock.
  // The ducks quack every "quack.min" to "quack.max" seconds.
  lake: {
    edge: { x: 32, y: 470 },
    foot: { x: 60, y: 470 },
    fishTime: 4,
    fishFun: 10,
    fishGap: 50,
    min: 3,
    max: 5,
    regrow: { min: 45, max: 90 },
    gatherTime: 2,
    castleTime: 5,
    castleFun: 30,
    sunTime: 5,
    sunEnergy: 20,
    sunFun: 15,
    busyTime: 1.5,
    popTime: 1.8,
    mermaid: { from: 480, to: 1080, sing: { min: 60, max: 120 }, singTime: 4, wave: 170, waveTime: 2.2 },
    quack: { min: 12, max: 30 },
    sand: "#EBD3A6",
    sandLight: "#F4E3C2",
    sandDark: "#D4B585",
    deep: "#5FA3C7",
    pier: "#A8774E",
    pierDark: "#7A4E32",
    tail: "#3FBFB0",
    tailLight: "#8FE3D6",
    hair: "#F08A6E",
    hairDark: "#D8684F",
    duck: "#FFFDF8",
    duckling: "#F5D76E",
    beak: "#F0A23C"
  },

  // The Bosque encantado (js/enchanted.js), a map as big as the city. Its trail comes in on the right: a character walks to
  // "edge" to go back to the city and arrives at "foot". Resting on the low mushroom takes "restTime" seconds and gives
  // "restEnergy" Energía. Making a wish in the fairy ring takes "wishTime" seconds and gives "wish.min" to "wish.max" coins,
  // once a day. Fishing in the stream takes "fishTime" seconds and gives "fishFun" Diversión; two fishing closer than
  // "fishGap" is "Ocupado". Playing with a forest spirit takes "playTime" seconds and gives "playFun" Diversión; there are
  // "spirits.day" spirits by day and "spirits.night" at night. "Ocupado" stays "busyTime" seconds.
  // The snakes of the hollow logs peek out every "peek.min" to "peek.max" seconds; whoever stands still closer than
  // "bite.near" to a log for "bite.still" seconds gets bitten (a band-aid for "bite.bandAid" seconds of play), and that
  // snake waits "bite.rest" seconds before it may bite again.
  // In the mushroom house live "acorns.count" little acorns: every "acorns.peek.min" to "acorns.peek.max" seconds (by night
  // "acorns.nightSlow" times less often) one peeks out of the window or the door for "acorns.peek.time" seconds, and
  // "acorns.two" of the times two peek at once. A visit at the door takes "acorns.visitTime" seconds; "acorns.giftChance"
  // of the times an acorn gives a Bellota to the backpack, at most "acorns.perDay" a day of the game.
  enchanted: {
    edge: { x: 968, y: 470 },
    foot: { x: 940, y: 470 },
    restTime: 5,
    restEnergy: 25,
    wishTime: 3,
    wish: { min: 10, max: 30 },
    fishTime: 4,
    fishFun: 10,
    fishGap: 50,
    playTime: 4,
    playFun: 20,
    spirits: { day: 3, night: 8 },
    busyTime: 1.5,
    popTime: 1.8,
    peek: { min: 6, max: 14, time: 2.4 },
    bite: { near: 95, still: 8, rest: 20, bandAid: 30, shout: 1.8, hop: 0.45 },
    acorns: { count: 5, peek: { min: 5, max: 15, time: 2.8 }, nightSlow: 2.5, two: 0.3, visitTime: 1.4, giftChance: 1 / 3,
      perDay: 3 },
    houseCap: "#D9544A",
    houseTrunk: "#F5EBDD",
    door: "#B07A4F",
    acornCap: ["#7A5230", "#8E6640", "#5E3E24", "#9C7448", "#6B4628"],
    acornBody: ["#D2A877", "#CFA270", "#D8B283", "#C99C68", "#D4AA7B"],
    // The little lanterns: how many, their paper colors (two of each), their lid, handle and legs, and how they move.
    // A hop takes "time" seconds and goes "far" world units, with "gap" seconds between hops ("flee" when they run to hide).
    // They stop for "rest" seconds, look to a side and the other, and hop on. Someone walking closer than "scare" makes one
    // run behind the closest giant mushroom; it comes out after nobody is closer than "back" for "calm" seconds. They keep
    // "logAway" from the hollow logs. A tap: a happy hop and two blinks in "cheer" seconds.
    lanterns: { count: 6, hop: { time: 0.36, far: 12, gap: 0.18 }, flee: { time: 0.2, far: 16, gap: 0.04 },
      rest: { min: 1.6, max: 4 }, scare: 80, back: 130, calm: 2.5, logAway: 70, cheer: 1 },
    lanternColor: ["#F2A291", "#F2A291", "#F3DC8C", "#F3DC8C", "#C6B0E2", "#C6B0E2"],
    lanternLid: "#5E4436",
    cheek: "#F2A7A0",
    grass: "#6E9A5E",
    grassDark: "#557D4A",
    grassLight: "#88B074",
    moss: "#5E8C4E",
    bark: "#6B4A32",
    barkLight: "#8A6446",
    dirt: "#9C7A56",
    leaf: "#7FA35C",
    blueFlower: "#7FA7E0",
    red: "#D9544A",
    lilac: "#B497D6",
    turquoise: "#4FBFB3",
    stem: "#F2E6D0",
    spirit: ["#A6F0A0", "#A8E3F7", "#D9B8F5"]
  },

  // The Montaña (js/mountain.js), a map as big as the city. Its trail comes in at the top: a character walks to "edge" to go
  // back to the city and arrives at "foot". Petting a goat takes "petTime" seconds and gives "petFun" Diversión; "Ocupado"
  // stays "busyTime" seconds. The goats bleat every "bleat.min" to "bleat.max" seconds of play.
  // A goat hop takes "hop.time" seconds and goes "hop.far" world units, "hop.high" up, with "hop.gap" seconds between hops
  // (the baby's are "baby"). They stop for "rest" seconds on the grass and "perch" seconds on top of a rock; "onRock" of the
  // times they go up a rock. The baby stays within "follow" of its mother.
  // The songbirds hop to another branch every "birds.hop.min" to "birds.hop.max" seconds; "birds.fly" of the times they fly to
  // another pine. By day each one sings every "birds.sing.min" to "birds.sing.max" seconds.
  // A gust of wind lifts "gust.leaves" leaves every "gust.min" to "gust.max" seconds.
  mountain: {
    edge: { x: 330, y: 132 },
    foot: { x: 330, y: 160 },
    petTime: 3,
    petFun: 15,
    busyTime: 1.5,
    popTime: 1.8,
    bleat: { min: 15, max: 35 },
    hop: { time: 0.42, far: 26, high: 12, gap: 0.22 },
    baby: { time: 0.3, far: 18, high: 9, gap: 0.12 },
    rest: { min: 2, max: 5 },
    perch: { min: 4, max: 9 },
    onRock: 0.45,
    follow: 34,
    birds: { hop: { min: 1.2, max: 3.5 }, fly: 0.25, sing: { min: 6, max: 16 } },
    gust: { min: 4, max: 9, leaves: 6 },
    grass: "#A3BF86",
    grassDark: "#86A56C",
    grassLight: "#BCD3A0",
    rock: "#A9A49B",
    rockLight: "#C9C4BA",
    rockDark: "#7F7A72",
    dirt: "#B89470",
    dirtLight: "#CDAE8A",
    pine: "#4F7D4A",
    pineDark: "#3A6238",
    pineLight: "#6E9A5A",
    trunk: "#7A5236",
    goatWhite: "#F7F3EA",
    goatBrown: "#D8B48A",
    horn: "#B8A68A",
    hoof: "#5E4B3C",
    mud: "#8A6A4C",
    mudLight: "#A3815F",
    egg: "#BFE3F2",
    birdColors: ["#E0533D", "#4F8FD9", "#F2C341"],
    featherColors: ["#E0533D", "#4F8FD9", "#F2C341"],
    // The mouth of the cave (js/cave.js): a character walks to "caveDoor" to go in, and coming out it appears at "caveFoot".
    caveDoor: { x: 880, y: 628 },
    caveFoot: { x: 880, y: 608 }
  },

  // The Cueva (js/cave.js), a map as big as the city, always dark: the crystals give the light. Its way out is at the bottom:
  // a character walks to "edge" to go back to the Montaña and arrives at "foot". There are "min" to "max" crystals on the
  // floor; a new one appears "regrow.min" to "regrow.max" seconds of play after one is gathered, "gatherTime" seconds each.
  // A drop falls from a stalactite every "drip.min" to "drip.max" seconds; a bat stretches every "stretch.min" to
  // "stretch.max" seconds. Chispa walks at "dragon.walk" (flying low at "dragon.fly"), rests "dragon.rest" seconds, and
  // spits sparks every "dragon.sparks.min" to "dragon.sparks.max" seconds of play, and breathes fire for "dragon.fire.time"
  // seconds every "dragon.fire.min" to "dragon.fire.max" seconds of play. She is awake from "dragon.wake" to
  // "dragon.sleep" (minutes of the game clock). The crystals tinkle softly every "tinkle.min" to "tinkle.max" seconds.
  // 🔥 Dragon light: her fire lights the cave with a warm round light "dragon.light.radius" big, that comes in
  // "dragon.light.rise" seconds and goes out slowly in "dragon.light.fade" seconds. Crystals closer than
  // "dragon.light.reach" shine a little more while it lasts. Its colors are "fireOrange" and "fireGold".
  cave: {
    edge: { x: 500, y: 680 },
    foot: { x: 500, y: 636 },
    gatherTime: 2,
    busyTime: 1.5,
    popTime: 1.8,
    min: 3,
    max: 5,
    regrow: { min: 45, max: 90 },
    drip: { min: 2.5, max: 7 },
    stretch: { min: 5, max: 12, time: 1.8 },
    tinkle: { min: 5, max: 11 },
    dragon: { walk: 30, fly: 46, flyChance: 0.35, rest: { min: 2, max: 5 }, sparks: { min: 60, max: 120 },
      fire: { min: 25, max: 50, time: 1.6 },
      light: { radius: 380, rise: 0.45, fade: 1.6, reach: 300 },
      wake: 6 * 60, sleep: 20 * 60 },
    floor: "#38363E",
    floorDark: "#2C2B32",
    floorLight: "#45434C",
    rock: "#2A282F",
    rockLight: "#45424C",
    rockDark: "#1A181E",
    blue: "#8FDCF7",
    amethyst: "#B98CEB",
    pink: "#F7A6CF",
    gold: "#FFD45C",
    bat: "#5B4E6B",
    batDark: "#3F354C",
    mint: "#9FE5C6",
    mintDark: "#6CC8A3",
    belly: "#FFF3DA",
    hornColor: "#FFE6AE",
    fireOrange: "#FF9440",
    fireGold: "#FFD27A",
    sparkColors: ["#FFD45C", "#FF8F8F", "#8FDCF7", "#B8F5C8", "#E3B8F5"]
  },

  // The hidden treasure chests (js/treasure.js), one in each zone of the valley. "x", "y" is the middle of the bottom of
  // the chest, "cover" what half hides it, and "box" the chest with its cover, where nobody walks (the zones and js/city.js
  // ask here). Opening one takes "openTime" seconds; "Ocupado" stays "busyTime" seconds; the lid opens and the decoration
  // floats up for "anim" seconds. A little golden sparkle twinkles by a closed chest every "sparkle.min" to
  // "sparkle.max" seconds, for "sparkle.time" seconds. The sign stays "signTime" seconds, and the one for the sixth "allTime".
  treasure: {
    openTime: 3,
    busyTime: 1.5,
    popTime: 1.8,
    anim: 2.8,
    sparkle: { min: 3, max: 6, time: 0.9 },
    signTime: 4.5,
    allTime: 4.5,
    wood: "#A8693F",
    woodDark: "#7A4A2C",
    woodLight: "#C98C5C",
    gold: "#F2C230",
    goldLight: "#FFE58A",
    goldDark: "#B8862E",
    chests: {
      city: { x: 80, y: 652, cover: "bush", box: { x: 52, y: 622, w: 56, h: 34 } },
      meadow: { x: 930, y: 640, cover: "flowers", box: { x: 902, y: 610, w: 56, h: 34 } },
      lake: { x: 928, y: 668, cover: "rock", box: { x: 900, y: 638, w: 56, h: 34 } },
      enchanted: { x: 165, y: 196, cover: "ferns", box: { x: 137, y: 166, w: 56, h: 34 } },
      mountain: { x: 905, y: 470, cover: "stone", box: { x: 877, y: 440, w: 56, h: 34 } },
      cave: { x: 120, y: 410, cover: "crystals", box: { x: 92, y: 380, w: 56, h: 34 } }
    }
  },

  // The little frogs and their lily pads (js/frogs.js), in the Lago and in the stream of the Bosque encantado.
  // "pads" are the lily pads: in the Lago their middle and size ("r"), and "flower" for the two with a pink flower; in the
  // stream only their height "y" (they float in the middle of the stream there, "dx" to a side) and size. "scale" is how
  // big the frogs of the place are. Without rain "day" frogs sit on the pads; with rain one on each pad.
  // Each game day, in each place, one frog is a colorful one with chance "colorful". A frog that is tapped comes back after
  // "back.min" to "back.max" seconds; when the rain starts or ends, one comes or goes every "change.min" to "change.max".
  // Without rain one croaks alone every "croak.min" to "croak.max" seconds by day. With rain they sing in chorus: the
  // "song" steps (seconds until the next croak, and how many semitones up), then a rest of "rest.min" to "rest.max" seconds.
  // A frog blinks every "blink.min" to "blink.max" seconds and turns a little every "turn.min" to "turn.max".
  // Each look has its "green" and the light "belly" color of the two ridges on its back; "spots" are its dark blotches.
  frogs: {
    lake: {
      scale: 1.1,
      day: 2,
      pads: [
        { x: 500, y: 300, r: 30, flower: true },
        { x: 785, y: 282, r: 28 },
        { x: 895, y: 345, r: 29, flower: true },
        { x: 455, y: 525, r: 28 },
        { x: 592, y: 535, r: 27 }
      ]
    },
    enchanted: {
      scale: 0.72,
      day: 1,
      pads: [{ y: 196, dx: -2, r: 18 }, { y: 452, dx: 2, r: 17 }, { y: 600, dx: -1, r: 18 }]
    },
    colorful: 0.25,
    back: { min: 5, max: 10 },
    change: { min: 1.5, max: 4 },
    croak: { min: 25, max: 55 },
    song: [[0.36, 0], [0.36, 4], [0.72, 7], [0.36, 4], [0.36, 0], [0.72, 2], [0.26, 4], [0.26, 5], [0.26, 7], [0.9, 0]],
    rest: { min: 2.5, max: 5 },
    blink: { min: 2.5, max: 6 },
    turn: { min: 4, max: 9 },
    jumpTime: 0.55,
    hopTime: 0.4,
    splashTime: 1.3,
    green: ["#9DBF4E", "#8DB443", "#AECB5E", "#86AA3E", "#98BB4A"],
    belly: ["#E2EBA8", "#D8E49A", "#ECF2B8", "#D2DE92", "#DEE8A2"],
    spots: "rgba(55, 70, 20, 0.6)",
    throat: "#E8EDCF",
    eye: "#D8A93A",
    colorBody: "#3FC9C0",
    colorBelly: "#B8F0E6",
    colorDots: "#F2C230",
    colorLegs: "#C9A8E8",
    pad: "#3E7A44",
    padDark: "#2C5A31",
    padLight: "#5C9A5E",
    flower: "#F2A9C0",
    flowerLight: "#FFD9E4",
    note: "#4FA84A"
  },

  // Autosave: how often, in seconds, and the name of the save in the browser.
  // "menuKey" remembers whether the panel was open or closed. "diaryKey" keeps the Diario de palabras apart from the game,
  // so "Reiniciar" never forgets it.
  save: { every: 10, key: "el-rincon-de-sofia-save", menuKey: "el-rincon-de-sofia-menu", soundKey: "el-rincon-de-sofia-sound",
    diaryKey: "el-rincon-de-sofia-diary" },

  // Sounds and music made with code (js/audio.js). Volumes go from 0 to 1: "master" is for everything,
  // then each group: effects, place sounds and music (softer at night). The tempo is seconds per music step.
  // Krohna meows every "meow.min" to "meow.max" seconds while it is where the selected one is.
  // The campfire crackles fully closer than "fire.near" world units and goes quiet toward "fire.far".
  // The rain sounds at "rain.city" in the city and "rain.house" in the house; with snow the place sounds go "snowHush" softer.
  sound: {
    master: 0.7,
    effects: 0.35,
    ambience: 0.22,
    music: { day: 0.16, night: 0.09 },
    tempo: { day: 0.42, night: 0.56 },
    fade: 0.6,
    meow: { min: 60, max: 180 },
    fire: { near: 90, far: 520 },
    rain: { city: 0.45, house: 0.22 },
    snowHush: 0.35
  },

  // The neighbors, Lumi, Vladi and Professor Hoot (js/neighbors.js). They live in the city, walk a little slower than Sofía and real.fixer
  // ("speed"), and stay "stay.min" to "stay.max" seconds at each spot they visit before going on.
  // Lumi is "scale" times as big as the others and floats "float" world units over the grass. At night her trail of sparkles
  // lasts "trail.life" seconds, with a new sparkle every "trail.every" seconds while she moves.
  // Vladi is in his castle by day; at night, at some of his stops ("scared.chance") he shakes and hugs his teddy bear
  // for "scared.time" seconds. "home" is the spot by each house door where they come out and stand.
  // "spots" are the places each one walks to. "houses" are where their homes are drawn on the city map: Lumi's treehouse
  // on top of a big forest tree, with its rope ladder down to the grass, and Vladi's castle on free grass by the bottom right.
  // At night, when both are outside closer than "chat.near" and nobody is talking with them, Lumi and Vladi stop and chat
  // on their own, at most once every "chat.wait.min" to "chat.wait.max" seconds of play; each chat gives both "chat.friendship" Amistad.
  // At night, each time Lumi picks where to go, she goes to Vladi ("seek.gap" world units from him) with chance "seek.chance",
  // or "seek.ready" once they may chat again.
  // Professor Hoot never walks: from "awake.from" to "awake.to" (minutes of the day) he stands by the door of his hollow tree
  // ("home") reading his book; every "read.min" to "read.max" seconds he turns a page or fixes his glasses for "read.time" seconds.
  // The rest of the time he sleeps inside. His hollow tree ("hollowTree", in the forest) has its round door, a little window
  // and, by its door, the chalkboard with the word of the day ("chalkboard").
  neighbors: {
    chat: { near: 170, wait: { min: 60, max: 120 }, friendship: 5 },
    lumi: {
      speed: 130,
      scale: 0.82,
      float: 12,
      stay: { min: 3, max: 6 },
      trail: { every: 0.06, life: 0.9 },
      seek: { chance: 0.25, ready: 0.6, gap: 70 },
      home: { x: 290, y: 216 },
      spots: [
        { x: 290, y: 216 },
        { x: 120, y: 205 },
        { x: 390, y: 300 },
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
    hoot: {
      speed: 100,
      scale: 0.95,
      stay: { min: 4, max: 8 },
      awake: { from: 480, to: 1080 },
      read: { min: 4, max: 9, time: 1.1 },
      home: { x: 414, y: 266 },
      spots: [{ x: 414, y: 266 }]
    },
    houses: {
      treehouse: { x: 256, y: 88, w: 68, h: 118, ladder: { x: 282, y: 150, w: 16, h: 54 } },
      castle: { x: 825, y: 565, w: 130, h: 100 },
      hollowTree: { x: 424, y: 128, w: 88, h: 122, trunk: { x: 440, y: 186, w: 56, h: 62 } },
      chalkboard: { x: 502, y: 218, w: 52, h: 34 }
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
    },
    // Professor Hoot, the fox: orange fur with a white chest and tail tip, round glasses, a brown jacket, a red bow tie
    // and his book.
    hoot: {
      icon: "🦊",
      skin: "#E07B39",
      fur: "#E07B39",
      furDark: "#B85A24",
      white: "#FFF8EE",
      eyes: "#3A2A20",
      nose: "#2E2018",
      shirt: "#8A5A3A",
      jacket: "#8A5A3A",
      jacketDark: "#6E4529",
      bowTie: "#C8433A",
      glasses: "#4A3428",
      pants: "#5A3A2A",
      shoes: "#3A2A20",
      book: "#5E7F6A",
      bookDark: "#46604F",
      page: "#FFFDF8"
    }
  }
};
