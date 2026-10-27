// The Bosque encantado: a map to the left of the city, as big as it, seen from above. Dark green grass with moss and little
// blue flowers, tall trees all around, soft light coming down between the leaves by day, its trail on the right that goes
// back to the city (js/valleymap.js has the other end) and its sign.
// 🍄 Giant mushrooms (red with cream dots, lilac and turquoise) that glow softly at night. They are solid. The low wide one
// can be used: sitting on it rests (Energía), one at a time.
// 🌀 A fairy ring of little mushrooms on the grass: walking into it makes a wish, once a day of the game, and a surprise
// of magic coins comes out. Its little mushrooms are not solid.
// 🌊 A narrow stream crosses the forest from top to bottom, with a little log bridge (the only way across). A tap on the
// water walks the selected one to the closest bank on its side to fish (leaf fish, mushroom fish, old boots and, only at
// night, spirit fish go into the backpack).
// ✨ Forest spirits, magical creatures (not neighbors: never selected, no chats, no gifts and no Amistad): little balls of
// light with eyes and a tiny smile that float slowly up and down; 3 by day and 8 at night, shining more. A tap on one walks
// the selected one next to it, and the spirit dances around it (Diversión). They never follow anyone.
// 🐍 Three hollow logs (solid), each with a little magic snake inside (magical creatures too) that now and then peeks out
// and flicks its tongue. Whoever stands still by a log too long gets a little bite: a hop, a shout and a band-aid 🩹 on the
// arm for a while (no need changes). Krohna is never bitten.
// 🏠 A mushroom house (solid): a giant red mushroom with cream dots, a wide cream trunk with a round wooden door and a round
// window. Five little acorns live inside (magical creatures too) and never come out to walk: now and then one peeks out of
// the window or the half-open door, looks to one side and the other, blinks and goes back in; at night they peek less and
// sleep inside. A tap on the house walks the selected one to the door: an acorn peeks out with a hop, and sometimes gives
// a Bellota 🌰 to the backpack (a few a day at most); the other times it only says hello with a ✨.
// 🏮 Six little paper lanterns, magical creatures too (never selected, no chats, no gifts and no Amistad), with a warm
// light inside that shines strong at night with a halo of their color. They hop around the forest, stop a while, look to
// one side and the other and hop on; they never cross the stream but by the bridge, keep away from the hollow logs and are
// not solid. Shy: when someone walks close, one hops quickly behind the closest giant mushroom, peeks out a little and comes
// out when nobody is close. A tap on one, whoever is selected, makes it hop happily and blink twice; nobody walks to it.
// They are not saved: they start at random spots of the forest.
// Day and night and the weather of the day show here too (js/weather.js), without puddles or snowman. Modo decorar moves
// nothing here. The neighbors never come, and the shiny coins never appear here. Pausa freezes it all.
var Enchanted = (function () {
  var C = CONFIG.colors;
  var K = CONFIG.enchanted;
  var W = CONFIG.world.width, H = CONFIG.world.height;
  // How close a character's feet may get to the edges of the map (as in the city) and to solid things.
  var MARGIN = { side: 30, top: 130, bottom: 20 };
  var CLEAR = 14;

  // The stream: its middle at each height (see streamX), half its width, and how close a character's feet may get to it.
  var STREAM = { x: 560, wave: 24, half: 20, bank: 12 };
  // The log bridge crosses the stream at this height; it is walked within "half" of its middle and goes "reach" past the banks.
  var BRIDGE = { y: 300, half: 18, reach: 30 };
  // The trail on the right: its middle "y", from "left" to the right edge.
  var TRAIL = { y: K.edge.y, left: 916, half: 15 };
  // The giant mushrooms: where their stem meets the grass, how tall and wide the stem is, the size of the cap and its color.
  var MUSHROOMS = [
    { x: 392, y: 256, stem: 82, sw: 32, rx: 76, ry: 38, color: K.red, dots: true },
    { x: 96, y: 566, stem: 86, sw: 30, rx: 66, ry: 34, color: K.lilac, dots: false },
    { x: 806, y: 256, stem: 78, sw: 30, rx: 68, ry: 34, color: K.turquoise, dots: false },
    { x: 905, y: 646, stem: 62, sw: 26, rx: 54, ry: 28, color: K.red, dots: true }
  ];
  // The low wide mushroom to rest on: a character walks to "stand" and sits with its feet at "sit".
  var REST = { x: 162, y: 322, stem: 26, sw: 50, rx: 74, ry: 28, color: K.turquoise, dots: true,
    stand: { x: 162, y: 368 }, sit: { x: 162, y: 302 } };
  // The fairy ring: its middle (where a wish is made) and how big it is.
  var RING = { x: 292, y: 470, r: 56 };
  // The hollow logs: their middle, length and size; "open" is the side of the hole (-1 left, 1 right), and the snake's color.
  var LOGS = [
    { x: 196, y: 648, len: 104, r: 17, open: 1, color: "#6FC46A", stripe: "#D8FFB0" },
    { x: 762, y: 404, len: 104, r: 17, open: -1, color: "#A784D9", stripe: "#F2D9FF" },
    { x: 772, y: 648, len: 104, r: 17, open: -1, color: "#3BB5A8", stripe: "#B8FFF4" }
  ];
  // The sign of the place.
  var SIGN = { text: "Bosque encantado", x: 500, y: 92, size: 24 };
  // The mushroom house: where its trunk meets the grass, how tall and wide the trunk is and the size of its cap (like the
  // giant mushrooms), its round door (its middle, width and height) and round window, where a visitor stands (beside the
  // door, so it never hides the acorn that peeks out) and its sign over the cap.
  var HOUSE = { x: 420, y: 650, stem: 120, sw: 96, rx: 92, ry: 42,
    door: { x: 400, w: 32, h: 46 }, window: { x: 446, y: 586, r: 13 }, stand: { x: 350, y: 676 },
    sign: { text: "Casita de hongo", x: 420, y: 446, size: 16 } };
  // The five little acorns: each one a little rounder or longer ("w" and "h"), with its own cap and body color.
  var ACORNS = [{ w: 1, h: 1 }, { w: 1.16, h: 0.88 }, { w: 0.86, h: 1.16 }, { w: 1.06, h: 1.04 }, { w: 0.94, h: 1.08 }]
    .slice(0, K.acorns.count).map(function (a, i) {
      return { w: a.w, h: a.h, cap: K.acornCap[i], body: K.acornBody[i] };
    });

  // What comes out of the stream: the chance of each catch, out of 100 (by day the spirit fish are leaf fish).
  var CATCHES = [
    { id: "leafFish", chance: 45, text: "¡Pez hoja!" },
    { id: "mushroomFish", chance: 25, text: "¡Pez hongo!" },
    { id: "boot", chance: 20, text: "¡Bota vieja!" },
    { id: "spiritFish", chance: 10, text: "¡Pez espíritu!", night: true }
  ];

  var ACTIONS = { rest: "Descansando 🍄", wish: "Pidiendo un deseo 🌠", fish: "Pescando 🎣", play: "Jugando con un espíritu ✨" };

  // What each character is doing here, by id:
  // { sim, kind: "rest" | "wish" | "fish" | "play" | "visit", spot, bob, spirit, phase: "walking" | "doing" | "busy", elapsed }
  var current = {};
  // The game day of the last wish, or 0.
  var wishDay = 0;
  // Texts floating up, as { x, y, text, age, word }, and the little sparkles going up from the fairy ring.
  var pops = [];
  var sparkles = [];
  // What is under the mouse: a spirit, a little lantern, or "trail", "rest", "ring", "house" or "water".
  var hover = null;
  // Seconds of play here so far: the stream, the spirits and the snakes stop with Pausa.
  var clock = 0;

  // The spirits: where they float (their spot on the grass), where they float to, and the one each dances with.
  var spirits = [];
  // Each character's bite: how long it has stood still by a log, the shout and the hop, and the band-aid, by id.
  var still = {};
  var hurt = {};
  var bandAids = {};

  function between(min, max) {
    return min + Math.random() * (max - min);
  }

  // A number from 0 to 1 that always comes out the same for the same "i" and "k".
  function hash(i, k) {
    var s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return s - Math.floor(s);
  }

  function near(x, y, cx, cy, r) {
    return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r;
  }

  function inBox(x, y, b) {
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  }

  function grow(b, by) {
    return { x: b.x - by, y: b.y - by, w: b.w + by * 2, h: b.h + by * 2 };
  }

  // ---------- Where characters can walk ----------

  // The middle of the stream at a height: it winds a little from top to bottom.
  function streamX(y) {
    return STREAM.x + Math.sin(y * 0.011) * STREAM.wave;
  }

  function bridgeBox() {
    var sx = streamX(BRIDGE.y), reach = STREAM.half + STREAM.bank + BRIDGE.reach;
    return { x: sx - reach, y: BRIDGE.y - BRIDGE.half, w: reach * 2, h: BRIDGE.half * 2 };
  }

  // True if the feet are on the walking lane of the bridge.
  function onBridge(x, y) {
    return Math.abs(y - BRIDGE.y) <= BRIDGE.half - 4 && inBox(x, y, bridgeBox());
  }

  // True if the spot is inside the map and out of the stream (or on the bridge). Used when loading a saved game.
  function isWalkable(x, y) {
    if (x < MARGIN.side || x > W - MARGIN.side || y < MARGIN.top || y > H - MARGIN.bottom) return false;
    return Math.abs(x - streamX(y)) > STREAM.half + STREAM.bank || onBridge(x, y);
  }

  // The box a giant mushroom takes on the grass, from its stem up to near the top of its cap (so nobody stands behind
  // the cap and shows over it).
  function mushroomBox(m) {
    return { x: m.x - m.rx * 0.72, y: m.y - m.stem - m.ry * 1.3, w: m.rx * 1.44, h: m.stem + m.ry * 1.3 + 8 };
  }

  function logBox(l) {
    return { x: l.x - l.len / 2, y: l.y - l.r, w: l.len, h: l.r * 2 };
  }

  // True if a character cannot stand here: off the map, in the stream, or on a giant mushroom, the mushroom house, a
  // hollow log or the hidden chest (js/treasure.js). Used by js/path.js.
  function isSolid(x, y) {
    if (!isWalkable(x, y)) return true;
    if (MUSHROOMS.some(function (m) { return inBox(x, y, grow(mushroomBox(m), CLEAR / 2)); })) return true;
    if (inBox(x, y, grow(mushroomBox(REST), CLEAR / 2))) return true;
    if (inBox(x, y, grow(mushroomBox(HOUSE), CLEAR / 2))) return true;
    if (inBox(x, y, grow(CONFIG.treasure.chests.enchanted.box, CLEAR / 2))) return true;
    return LOGS.some(function (l) { return inBox(x, y, grow(logBox(l), 8)); });
  }

  // True if the spot is on the water of the stream (the bridge is not).
  function waterAt(x, y) {
    if (y < 0 || y > H || Math.abs(x - streamX(y)) > STREAM.half + 2) return false;
    return !inBox(x, y, grow(bridgeBox(), 4));
  }

  // ---------- What can be tapped ----------

  function trailBox() {
    return { x: TRAIL.left - 8, y: TRAIL.y - TRAIL.half - 10, w: W - TRAIL.left + 8, h: TRAIL.half * 2 + 20 };
  }

  function restAt(x, y) {
    var b = { x: REST.x - REST.rx, y: REST.y - REST.stem - REST.ry - 6, w: REST.rx * 2, h: REST.stem + REST.ry + 14 };
    return inBox(x, y, b);
  }

  function ringAt(x, y) {
    var dx = (x - RING.x) / (RING.r + 12), dy = (y - RING.y) / ((RING.r + 12) * 0.6);
    return dx * dx + dy * dy <= 1;
  }

  // The mushroom house, from the bottom of its trunk to the top of its cap.
  function houseBox() {
    return { x: HOUSE.x - HOUSE.rx, y: HOUSE.y - HOUSE.stem - HOUSE.ry * 1.5, w: HOUSE.rx * 2, h: HOUSE.stem + HOUSE.ry * 1.5 + 6 };
  }

  // True if the last spot given to usableAt was on the mushroom house.
  var onHouse = false;

  // The little lantern the last spot given to usableAt was on, or null.
  var onLantern = null;

  // "trail", "rest", "ring" or "water" for what can be used at a spot, or null (the spirits are apart: spiritAt).
  // js/sims.js and js/main.js only know those, so the mushroom house comes in through the ring's door: on it this says
  // "ring" and remembers it, and the glow (setHover) and the tap (tapRing) that always come right after go to the house.
  // On a little lantern it says "lantern", for its glow and the pointer (its taps never get to js/sims.js: see the end).
  function usableAt(x, y) {
    onHouse = false;
    onLantern = lanternAt(x, y);
    if (onLantern) return "lantern";
    if (inBox(x, y, trailBox())) return "trail";
    if (restAt(x, y)) return "rest";
    if (inBox(x, y, houseBox())) {
      onHouse = true;
      return "ring";
    }
    if (ringAt(x, y)) return "ring";
    if (waterAt(x, y)) return "water";
    return null;
  }

  function setHover(what) {
    hover = what === "ring" && onHouse ? "house" : what === "lantern" ? onLantern : what;
  }

  // ---------- Spirits ----------

  // A random spot of the forest for a spirit to float to.
  function floatSpot() {
    return { x: between(70, W - 70), y: between(190, H - 50) };
  }

  (function () {
    for (var i = 0; i < K.spirits.night; i++) {
      var s = floatSpot();
      var to = floatSpot();
      spirits.push({ i: i, x: s.x, y: s.y, to: to, color: K.spirit[i % K.spirit.length], with: null, dance: 0 });
    }
  })();

  // How much a spirit is seen, from 0 to 1: the first ones always, the others only at night.
  function shown(s) {
    if (s.i < K.spirits.day || s.with) return 1;
    var d = Time.darkness();
    return Math.max(0, Math.min(1, (d - 0.3) / 0.4));
  }

  // How high a spirit floats over its spot on the grass, going up and down.
  function lift(s) {
    if (s.dance > 0) return 36 + Math.sin(clock * 6 + s.i) * 8;
    return 42 + Math.sin(clock * 1.6 + s.i * 1.3) * 7;
  }

  // The spirit at a spot (where it is drawn, in the air), or null. The ones dancing are not.
  function spiritAt(x, y) {
    for (var i = spirits.length - 1; i >= 0; i--) {
      var s = spirits[i];
      if (s.with || shown(s) < 0.5) continue;
      if (near(x, y, s.x, s.y - lift(s), 20)) return s;
    }
    return null;
  }

  function updateSpirits(dt) {
    spirits.forEach(function (s) {
      if (s.dance > 0) {
        var a = current[s.with];
        if (!a) {
          s.dance = 0;
          s.with = null;
          return;
        }
        s.dance += dt;
        var t = s.dance * 3.2;
        s.x = a.sim.x + Math.cos(t) * 40;
        s.y = a.sim.y + 2 + Math.sin(t) * 16;
        return;
      }
      if (s.with) {
        if (!current[s.with]) s.with = null;
        return;
      }
      var dx = s.to.x - s.x, dy = s.to.y - s.y, d = Math.sqrt(dx * dx + dy * dy);
      var step = 16 * dt;
      if (d <= step) {
        s.to = floatSpot();
      } else {
        s.x += dx / d * step;
        s.y += dy / d * step;
      }
    });
  }

  // ---------- Actions ----------

  // A tap on the rest mushroom: walk in front of it and sit on it.
  function tapRest(sim) {
    current[sim.data.id] = { sim: sim, kind: "rest", phase: "walking", elapsed: 0 };
    Sims.walkTo(sim, REST.stand.x, REST.stand.y);
  }

  function today() {
    return Time.get().day;
  }

  // Floating text over a spot.
  function popAt(x, y, text, word) {
    pops.push({ x: x, y: y, text: text, age: 0, word: word });
  }

  // Floating text over the head of a character ("word" is the word of what it got, for the word tag).
  function popOver(sim, text, word) {
    popAt(sim.x, sim.y - 78 * CONFIG.characterScale - CONFIG.moodStar.room - 30, text, word);
  }

  // A tap on the mushroom house: walk to its door to visit the acorns.
  function tapHouse(sim) {
    current[sim.data.id] = { sim: sim, kind: "visit", phase: "walking", elapsed: 0 };
    Sims.walkTo(sim, HOUSE.stand.x, HOUSE.stand.y);
    return true;
  }

  // A tap on the fairy ring: walk into its middle and make a wish; if today's wish is made, it says so over the ring.
  // A tap on the mushroom house comes here too (see usableAt).
  function tapRing(sim) {
    if (onHouse) {
      onHouse = false;
      return tapHouse(sim);
    }
    if (wishDay === today()) {
      popAt(RING.x, RING.y - 50, "Vuelve mañana 🌙", "wish");
      return false;
    }
    current[sim.data.id] = { sim: sim, kind: "wish", phase: "walking", elapsed: 0 };
    Sims.walkTo(sim, RING.x, RING.y);
    return true;
  }

  // A tap on the water: walk to the closest bank on the character's own side of the stream (at the height of the tap)
  // and fish. The bobber goes into the water in front of it.
  function tapWater(sim, x, y) {
    y = Math.max(MARGIN.top + 10, Math.min(H - MARGIN.bottom - 6, y));
    // Not right on the bridge: a little above or below it.
    if (Math.abs(y - BRIDGE.y) < BRIDGE.half + 16) y = BRIDGE.y + (y < BRIDGE.y ? -1 : 1) * (BRIDGE.half + 16);
    var side = sim.x < streamX(sim.y) ? -1 : 1;
    var spot = Path.free("enchanted", streamX(y) + side * (STREAM.half + STREAM.bank + 8), y);
    var bob = { x: streamX(spot.y) + side * 6, y: spot.y + 4 };
    current[sim.data.id] = { sim: sim, kind: "fish", spot: spot, bob: bob, phase: "walking", elapsed: 0 };
    Sims.walkTo(sim, spot.x, spot.y);
  }

  // A tap on a spirit: it stops floating, and the character walks next to it to play.
  function tapSpirit(sim, s) {
    var side = sim.x < s.x ? -1 : 1;
    var spot = Path.free("enchanted", s.x + side * 34, s.y);
    current[sim.data.id] = { sim: sim, kind: "play", spirit: s, phase: "walking", elapsed: 0 };
    if (!s.with) s.with = sim.data.id;
    Sims.walkTo(sim, spot.x, spot.y);
  }

  // Stop what a character is doing here. True if it was doing something.
  function cancel(id) {
    var had = !!current[id];
    delete current[id];
    return had;
  }

  function isActive(id) {
    return !!current[id];
  }

  // True if someone else is resting on the mushroom, making a wish, visiting the acorns, fishing right by here or playing
  // with this spirit.
  function isTaken(a, id) {
    if (a.kind === "play" && a.spirit.with && a.spirit.with !== id) return true;
    return Object.keys(current).some(function (other) {
      var b = current[other];
      if (other === id || b.phase !== "doing" || b.kind !== a.kind) return false;
      if (a.kind === "rest" || a.kind === "wish" || a.kind === "visit") return true;
      if (a.kind === "play") return b.spirit === a.spirit;
      var dx = b.sim.x - a.sim.x, dy = b.sim.y - a.sim.y;
      return dx * dx + dy * dy < K.fishGap * K.fishGap;
    });
  }

  function timeFor(a) {
    if (a.kind === "rest") return K.restTime;
    if (a.kind === "wish") return K.wishTime;
    if (a.kind === "fish") return K.fishTime;
    if (a.kind === "visit") return K.acorns.visitTime;
    return K.playTime;
  }

  // At night spirit fish can come out; by day their chance goes to the leaf fish.
  function catchOne() {
    var night = !Time.isDay();
    var roll = Math.random() * 100;
    for (var i = 0; i < CATCHES.length; i++) {
      roll -= CATCHES[i].chance;
      if (roll < 0) return CATCHES[i].night && !night ? CATCHES[0] : CATCHES[i];
    }
    return CATCHES[0];
  }

  // When the action ends: the catch goes into the backpack, the wish brings its coins, or the acorn at the door gives a
  // Bellota (some of the times, a few a day at most) or says hello.
  function finish(a) {
    var id = a.sim.data.id;
    if (a.kind === "fish") {
      var c = catchOne();
      Inventory.add(c.id, 1);
      Goals.notify("fish", id, c.id);
      popOver(a.sim, c.text + " " + Inventory.item(c.id).emoji, c.id);
      Sound.playAt("enchanted", "blup");
      var values = Needs.get(id);
      values.fun = Math.min(100, values.fun + K.fishFun);
    } else if (a.kind === "wish") {
      var n = Math.floor(between(K.wish.min, K.wish.max + 1));
      Coins.add(n);
      popOver(a.sim, "+" + n + " 🪙", "wish");
      Sound.playAt("enchanted", "cling");
    } else if (a.kind === "visit") {
      if (acornDay !== today()) {
        acornDay = today();
        acornsGiven = 0;
      }
      var over = { x: HOUSE.door.x, y: HOUSE.y - HOUSE.door.h - 18 };
      if (acornsGiven < K.acorns.perDay && Math.random() < K.acorns.giftChance) {
        acornsGiven += 1;
        Inventory.add("acorn", 1);
        popAt(over.x, over.y, "+1 🌰", "acorn");
        Sound.playAt("enchanted", "sparkle");
      } else {
        popAt(over.x, over.y, "✨", "acorn");
        Sound.playAt("enchanted", "chime");
      }
    }
  }

  // Resting raises Energía, and playing with a spirit Diversión, little by little.
  var GAINS = { rest: { energy: K.restEnergy }, play: { fun: K.playFun } };

  // True if what it walked to is still there: a spirit can fade away when the day comes, and today's wish can be made
  // by the other one on the way.
  function stillThere(a) {
    if (a.kind === "play") return shown(a.spirit) > 0.5 || a.spirit.with === a.sim.data.id;
    if (a.kind === "wish") return wishDay !== today();
    return true;
  }

  // Look at what it uses: the water while fishing, the spirit, the door of the mushroom house (on its right); sitting on the mushroom and
  // in the ring it looks to the front.
  function face(a) {
    if (a.kind === "fish") a.sim.facing = a.bob.x < a.sim.x ? "left" : "right";
    else if (a.kind === "play") a.sim.facing = a.spirit.x < a.sim.x ? "left" : "right";
    else if (a.kind === "visit") a.sim.facing = "right";
    else a.sim.facing = "front";
  }

  // Start doing it: the spirit starts dancing around, the wish sparkles go up, an acorn peeks out of the door with a hop.
  function begin(a) {
    face(a);
    if (a.kind === "visit") {
      var at = peeks.door;
      peeks.door = { who: at ? at.who : freeAcorn(), age: at ? Math.min(at.age, K.acorns.peek.time * 0.18) : 0,
        time: K.acorns.peek.time, hello: true };
    } else if (a.kind === "play") {
      a.spirit.with = a.sim.data.id;
      a.spirit.dance = 0.001;
      Sound.playAt("enchanted", "chime");
    } else if (a.kind === "wish") {
      Sound.playAt("enchanted", "sparkle");
    }
  }

  function update(dt) {
    var paused = Needs.isPaused();
    if (!paused) clock += dt;
    pops.forEach(function (p) { p.age += dt; });
    pops = pops.filter(function (p) { return p.age < K.popTime; });

    Object.keys(current).forEach(function (id) {
      var a = current[id];
      // Going back to the city or starting to socialize ends it.
      if (a.sim.place !== "enchanted" || Social.isInvolved(id)) {
        delete current[id];
        return;
      }
      if (a.phase === "walking") {
        if (a.sim.path.length > 0) return;
        if (!stillThere(a)) {
          delete current[id];
          if (a.kind === "wish") popAt(RING.x, RING.y - 50, "Vuelve mañana 🌙", "wish");
          return;
        }
        a.elapsed = 0;
        a.phase = isTaken(a, id) ? "busy" : "doing";
        if (a.phase === "doing") begin(a);
        return;
      }
      if (a.phase === "busy") {
        a.elapsed += dt;
        if (a.elapsed >= K.busyTime) delete current[id];
        return;
      }
      if (paused) return;
      var step = Math.min(dt, timeFor(a) - a.elapsed);
      a.elapsed += step;
      var gains = GAINS[a.kind];
      if (gains) {
        var values = Needs.get(id);
        Object.keys(gains).forEach(function (need) {
          values[need] = Math.min(100, values[need] + gains[need] / timeFor(a) * step);
        });
      }
      if (a.kind === "play" && Math.floor(a.elapsed / 1.3) !== Math.floor((a.elapsed - step) / 1.3)) {
        Sound.playAt("enchanted", "chime");
      }
      if (a.kind === "wish") wishSparkles(dt);
      if (a.elapsed < timeFor(a)) return;
      delete current[id];
      if (a.kind === "wish") wishDay = today();
      finish(a);
    });

    // A spirit whose character stopped playing (or never got to it) floats on.
    spirits.forEach(function (s) {
      if (s.with && (!current[s.with] || current[s.with].spirit !== s)) {
        s.with = null;
        s.dance = 0;
      }
    });

    if (paused) return;
    updateSpirits(dt);
    sparkles.forEach(function (p) { p.age += dt; });
    sparkles = sparkles.filter(function (p) { return p.age < 1.6; });
    updateSnakes(dt);
    updateAcorns(dt);
    updateLanterns(dt);
  }

  // Little sparkles going up from the fairy ring while someone makes a wish.
  var sparkleIn = 0;

  function wishSparkles(dt) {
    sparkleIn -= dt;
    if (sparkleIn > 0) return;
    sparkleIn = 0.08;
    var a = between(0, Math.PI * 2);
    sparkles.push({ x: RING.x + Math.cos(a) * between(10, RING.r), y: RING.y + Math.sin(a) * between(6, RING.r * 0.6),
      age: 0, color: ["#FFF3B0", "#F5D76E", "#D9B8F5", "#A8E3F7"][Math.floor(Math.random() * 4)] });
  }

  // What to show over a character's head, or null. Visiting the acorns shows nothing: the acorn at the door says it all.
  function bubbleFor(id) {
    var a = current[id];
    if (!a || a.phase === "walking") return null;
    if (a.phase === "busy") return { text: "Ocupado", heart: false };
    if (a.kind === "visit") return null;
    return { text: ACTIONS[a.kind], heart: false };
  }

  // How a character is drawn while it sits on the rest mushroom (js/sims.js). Null while it does anything else.
  function poseFor(id) {
    var a = current[id];
    if (!a || a.phase !== "doing" || a.kind !== "rest") return null;
    return { kind: "mushroom", x: REST.sit.x, y: REST.sit.y };
  }

  // ---------- Snakes ----------

  // Each log's snake: seconds left peeking out, until it peeks again, of its bite and of its rest after biting,
  // and who it bites.
  var snakes = LOGS.map(function (l, i) {
    return { log: l, peek: 0, peekIn: between(2, K.peek.max) + i * 2, bite: 0, rest: 0, target: null };
  });

  // Where the hole of a log is.
  function holeOf(l) {
    return { x: l.x + l.open * (l.len / 2 - 2), y: l.y };
  }

  // How far the feet are from a log (from the closest spot along it).
  function fromLog(sim, l) {
    var x = Math.max(l.x - l.len / 2, Math.min(l.x + l.len / 2, sim.x));
    return Math.sqrt((sim.x - x) * (sim.x - x) + (sim.y - l.y) * (sim.y - l.y));
  }

  function updateSnakes(dt) {
    snakes.forEach(function (s) {
      if (s.rest > 0) s.rest -= dt;
      if (s.bite > 0) {
        s.bite -= dt;
        return;
      }
      if (s.peek > 0) {
        s.peek -= dt;
        return;
      }
      s.peekIn -= dt;
      if (s.peekIn <= 0) {
        s.peekIn = between(K.peek.min, K.peek.max);
        s.peek = K.peek.time;
        Sound.playAt("enchanted", "hiss");
      }
    });
    Sims.list().forEach(function (sim) {
      var id = sim.data.id;
      if (hurt[id]) {
        hurt[id].shout -= dt;
        hurt[id].hop -= dt;
        if (hurt[id].shout <= 0) delete hurt[id];
      }
      if (bandAids[id] > 0) {
        bandAids[id] -= dt;
        if (bandAids[id] <= 0) delete bandAids[id];
      }
      // Standing still (not walking) by a log whose snake can bite.
      var by = null;
      if (sim.place === "enchanted" && sim.path.length === 0) {
        snakes.forEach(function (s) {
          if (!by && s.rest <= 0 && s.bite <= 0 && fromLog(sim, s.log) < K.bite.near) by = s;
        });
      }
      if (!by) {
        delete still[id];
        return;
      }
      if (!still[id] || still[id].snake !== by) still[id] = { snake: by, t: 0 };
      still[id].t += dt;
      if (still[id].t >= K.bite.still) bite(by, sim);
    });
  }

  // The snake jumps out and bites: the character hops and shouts, and gets a band-aid. It keeps doing what it did.
  function bite(s, sim) {
    var id = sim.data.id;
    delete still[id];
    s.bite = 0.7;
    s.peek = 0;
    s.rest = K.bite.rest;
    var at = Sims.poseFor(id);
    s.target = at && at.x !== undefined ? { x: at.x, y: at.y } : { x: sim.x, y: sim.y };
    hurt[id] = { shout: K.bite.shout, hop: K.bite.hop };
    bandAids[id] = K.bite.bandAid;
    Sound.playAt("enchanted", "hiss");
  }

  // How high a character hops right after a bite, in world units (js/sims.js).
  function hopFor(id) {
    var h = hurt[id];
    if (!h || h.hop <= 0) return 0;
    return Math.sin((1 - h.hop / K.bite.hop) * Math.PI) * 18;
  }

  // The shout right after a bite, as a speech bubble: Sofía in Spanish, real.fixer in English with its subtitle.
  function shoutFor(id) {
    if (!hurt[id]) return null;
    if (id === "realfixer") return { text: "Ouch!", subtitle: "¡Ay!", speech: true, heart: false };
    return { text: "¡Ay!", speech: true, heart: false };
  }

  // True while a character has a band-aid on its arm.
  function hasBandAid(id) {
    return bandAids[id] > 0;
  }

  // True if a spot of the place on screen is on someone's band-aid (for its word, "Curita · band-aid").
  function bandAidAt(x, y) {
    var k = CONFIG.characterScale, view = Sims.viewPlace();
    return Sims.list().some(function (sim) {
      if (sim.place !== view || !hasBandAid(sim.data.id)) return false;
      var pose = Sims.poseFor(sim.data.id);
      var at = pose && pose.x !== undefined ? pose : sim;
      return near(x, y, at.x + 15 * k, at.y - 29 * k, 9) || near(x, y, at.x - 15 * k, at.y - 29 * k, 9) ||
        near(x, y, at.x, at.y - 29 * k, 9);
    });
  }

  // ---------- Little acorns ----------

  // Who peeks out of the window and out of the door right now, as { who, age, time, hello }, or null. "who" is the index
  // of the acorn, and "hello" is the hop of an acorn saying hello to a visitor.
  var peeks = { window: null, door: null };
  // Seconds until the next acorn peeks out.
  var peekIn = between(2, K.acorns.peek.min);
  // The game day of the last Bellota given, and how many were given that day.
  var acornDay = 0;
  var acornsGiven = 0;

  // An acorn that is not peeking now, at random.
  function freeAcorn() {
    var busy = [peeks.window, peeks.door].filter(Boolean).map(function (p) { return p.who; });
    var free = [];
    for (var i = 0; i < ACORNS.length; i++) if (busy.indexOf(i) < 0) free.push(i);
    return free[Math.floor(Math.random() * free.length)];
  }

  // Every little while one acorn peeks out of the window or the door, or two at once; at night less often.
  function updateAcorns(dt) {
    ["window", "door"].forEach(function (where) {
      var p = peeks[where];
      if (!p) return;
      p.age += dt;
      if (p.age >= p.time) peeks[where] = null;
    });
    peekIn -= dt;
    if (peekIn > 0) return;
    peekIn = between(K.acorns.peek.min, K.acorns.peek.max) * (Time.isDay() ? 1 : K.acorns.nightSlow);
    var free = ["window", "door"].filter(function (where) { return !peeks[where]; });
    if (free.length === 2 && Math.random() >= K.acorns.two) free = [free[Math.floor(Math.random() * 2)]];
    free.forEach(function (where) {
      peeks[where] = { who: freeAcorn(), age: 0, time: K.acorns.peek.time, hello: false };
    });
  }

  // How far a peeking acorn is out, from 0 to 1: it comes out, stays a moment and goes back in.
  function peekOut(p) {
    var t = p.age / p.time;
    return t < 0.18 ? t / 0.18 : t > 0.85 ? (1 - t) / 0.15 : 1;
  }

  // Where its eyes look, from -1 (left) to 1 (right): to one side and then to the other. Saying hello, to the front.
  function peekLook(p) {
    var t = p.age / p.time;
    if (p.hello || t < 0.25 || t > 0.8) return 0;
    return -Math.sin((t - 0.25) / 0.55 * Math.PI * 2);
  }

  // True while it blinks.
  function peekBlink(p) {
    var t = p.age / p.time;
    return (t > 0.5 && t < 0.55) || (t > 0.2 && t < 0.24 && p.hello);
  }

  // How high it hops when it says hello to a visitor.
  function peekHop(p) {
    if (!p.hello || p.age < 0.4 || p.age > 0.9) return 0;
    return Math.sin((p.age - 0.4) / 0.5 * Math.PI) * 8;
  }

  // Where the bottom of a peeking acorn is: rising in the window, or sliding into the half-open door.
  function windowAcorn(p) {
    var w = HOUSE.window, a = ACORNS[p.who], out = peekOut(p);
    var hidden = w.y + w.r + 20 * a.h, shown = w.y + 9 * a.h + 3;
    return { x: w.x, y: hidden + (shown - hidden) * out };
  }

  function doorAcorn(p) {
    var d = HOUSE.door, out = peekOut(p);
    var hidden = d.x + d.w / 2 + 10, shown = d.x + d.w * 0.16;
    return { x: hidden + (shown - hidden) * out, y: HOUSE.y - 1 - peekHop(p) };
  }

  // The acorn peeking at a spot, as its index, or -1.
  function acornAt(x, y) {
    var w = peeks.window, d = peeks.door;
    if (w && peekOut(w) > 0.3 && near(x, y, HOUSE.window.x, HOUSE.window.y, HOUSE.window.r + 3)) return w.who;
    if (d && peekOut(d) > 0.3) {
      var at = doorAcorn(d);
      if (near(x, y, at.x, at.y - 9, 12)) return d.who;
    }
    return -1;
  }

  // ---------- Little lanterns ----------

  var L = K.lanterns;
  // Each lantern a little different: taller or rounder ("w" and "h") and its handle tilted ("tilt").
  var LANTERNS = [{ w: 1, h: 1.08, tilt: 0.25 }, { w: 1.14, h: 0.92, tilt: -0.2 }, { w: 0.94, h: 1.12, tilt: 0.1 },
    { w: 1.08, h: 1, tilt: -0.35 }, { w: 1, h: 0.94, tilt: 0.35 }, { w: 0.9, h: 1.04, tilt: -0.1 }];

  // How far a spot is from a hollow log (from the closest spot along it).
  function fromLogAt(x, y, l) {
    var lx = Math.max(l.x - l.len / 2, Math.min(l.x + l.len / 2, x));
    return Math.sqrt((x - lx) * (x - lx) + (y - l.y) * (y - l.y));
  }

  // True if a little lantern may stand here: on the grass or the bridge, not on anything solid and far from the logs.
  function lanternOk(x, y) {
    return !isSolid(x, y) && LOGS.every(function (l) { return fromLogAt(x, y, l) >= L.logAway; });
  }

  // True if a way of points from a spot only goes over spots where a lantern may stand.
  function wayOk(x, y, way) {
    for (var i = 0; i < way.length; i++) {
      var dx = way[i].x - x, dy = way[i].y - y, d = Math.sqrt(dx * dx + dy * dy);
      for (var t = 0; t <= d; t += 6) {
        if (!lanternOk(x + dx * t / d, y + dy * t / d)) return false;
      }
      x = way[i].x;
      y = way[i].y;
    }
    return true;
  }

  // A random spot of the forest where a lantern may stand.
  function lanternSpot() {
    for (var i = 0; i < 200; i++) {
      var x = between(70, W - 70), y = between(180, H - 40);
      if (lanternOk(x, y)) return { x: x, y: y };
    }
    return { x: 300, y: 380 };
  }

  // Each lantern: where its feet are, the way it hops along, its hop now, what it does ("rest", "walk", "flee", "hide" or
  // "back"), the mushroom it hides behind, and its happy hop after a tap.
  var lanterns = LANTERNS.slice(0, L.count).map(function (one, i) {
    var at = lanternSpot();
    return { i: i, w: one.w, h: one.h, tilt: one.tilt, color: K.lanternColor[i], x: at.x, y: at.y, way: [], hop: null,
      gap: 0, mode: "rest", rest: between(0.5, L.rest.max), restT: 0, look: 0, hide: null, hideT: 0, calm: 0, cheer: 0 };
  });

  // Where a lantern is now: along its hop, or behind its mushroom peeking out a little.
  function lanternPos(l) {
    if (l.mode === "hide") return { x: l.x + l.hide.side * (l.hide.m.sw / 2 - 1) * peekOf(l), y: l.y };
    if (!l.hop) return { x: l.x, y: l.y };
    var t = l.hop.t / l.hop.time;
    return { x: l.hop.fx + (l.hop.tx - l.hop.fx) * t, y: l.hop.fy + (l.hop.ty - l.hop.fy) * t };
  }

  // How far a hiding lantern peeks out, from 0 to 1: every little while it peeks out a little and goes back.
  function peekOf(l) {
    var p = (l.hideT % 3.2) / 3.2;
    return p < 0.45 ? 0 : p < 0.55 ? (p - 0.45) / 0.1 : p < 0.75 ? 1 : p < 0.85 ? (0.85 - p) / 0.1 : 0;
  }

  // How high a lantern is off the grass: along its hop, or its happy hop after a tap.
  function lanternLift(l) {
    if (l.cheer > 0) {
      var c = L.cheer - l.cheer;
      return c < 0.5 ? Math.sin(c / 0.5 * Math.PI) * 9 : 0;
    }
    if (!l.hop) return 0;
    return Math.sin(l.hop.t / l.hop.time * Math.PI) * (l.mode === "flee" ? 4 : 5);
  }

  // How bright the light inside is: soft by day, strong at night, and it blinks twice after a tap.
  function lanternLight(l) {
    if (l.cheer > 0) {
      var c = L.cheer - l.cheer;
      if ((c > 0.2 && c < 0.38) || (c > 0.56 && c < 0.74)) return 0.05;
      if (c > 0.12 && c < 0.85) return 1;
    }
    return 0.45 + 0.55 * Time.darkness();
  }

  // The little lantern at a spot (around its body), or null. One fully behind its mushroom is not.
  function lanternAt(x, y) {
    for (var i = lanterns.length - 1; i >= 0; i--) {
      var l = lanterns[i];
      if (l.mode === "hide" && peekOf(l) < 0.5) continue;
      var at = lanternPos(l);
      if (near(x, y, at.x, at.y - 11 - lanternLift(l), 12)) return l;
    }
    return null;
  }

  // A tap on a lantern: a happy hop and two blinks.
  function cheer(l) {
    l.cheer = L.cheer;
  }

  // Hop to a spot not too far: straight if nothing is in the way, else around (and over the bridge to cross the stream).
  function wander(l) {
    for (var i = 0; i < 8; i++) {
      var a = between(0, Math.PI * 2), d = between(50, 180);
      var tx = l.x + Math.cos(a) * d, ty = l.y + Math.sin(a) * d * 0.7;
      if (!lanternOk(tx, ty)) continue;
      var way = [{ x: tx, y: ty }];
      if (!wayOk(l.x, l.y, way)) {
        way = Path.find("enchanted", l.x, l.y, tx, ty);
        var end = way[way.length - 1];
        if (!end || Math.abs(end.x - tx) > 10 || Math.abs(end.y - ty) > 10 || !wayOk(l.x, l.y, way)) continue;
      }
      l.way = way;
      l.mode = "walk";
      return;
    }
    l.rest = between(0.5, 1.5);
    l.restT = 0;
  }

  // Someone walking close: hop quickly to the front of the closest giant mushroom on its side of the stream (not the low
  // one to rest on, nor the mushroom house), and behind it, a little to one side of the stem.
  function flee(l) {
    var side = l.x < streamX(l.y) ? -1 : 1;
    var mine = MUSHROOMS.filter(function (m) { return (m.x < streamX(m.y) ? -1 : 1) === side; }).sort(function (a, b) {
      return (a.x - l.x) * (a.x - l.x) + (a.y - l.y) * (a.y - l.y) - (b.x - l.x) * (b.x - l.x) - (b.y - l.y) * (b.y - l.y);
    });
    var pick = null, pickWay = null;
    mine.some(function (m) {
      var way = Path.find("enchanted", l.x, l.y, m.x, m.y + 20);
      var end = way[way.length - 1] || { x: l.x, y: l.y };
      if (Math.abs(end.x - m.x) > 12 || Math.abs(end.y - m.y - 20) > 12) return false;
      if (!pick) {
        pick = m;
        pickWay = way;
      }
      if (!wayOk(l.x, l.y, way)) return false;
      pick = m;
      pickWay = way;
      return true;
    });
    if (!pick) return;
    var peek = Math.random() < 0.5 ? -1 : 1;
    l.hide = { m: pick, side: peek };
    l.way = pickWay.concat([{ x: pick.x + peek * 2, y: pick.y - 14 }]);
    l.mode = "flee";
  }

  // True if Sofía or real.fixer walks close to a lantern.
  function scared(l) {
    return Sims.list().some(function (sim) {
      return sim.place === "enchanted" && sim.path.length > 0 && near(sim.x, sim.y, l.x, l.y, L.scare);
    });
  }

  // True if someone is close to the mushroom a lantern hides behind.
  function anyoneClose(m) {
    return Sims.list().some(function (sim) { return sim.place === "enchanted" && near(sim.x, sim.y, m.x, m.y, L.back); });
  }

  function updateLanterns(dt) {
    lanterns.forEach(function (l) {
      if (l.cheer > 0) {
        l.cheer = Math.max(0, l.cheer - dt);
        return;
      }
      if (l.mode !== "flee" && l.mode !== "hide" && scared(l)) {
        if (l.hop) {
          l.x = l.hop.tx;
          l.y = l.hop.ty;
          l.hop = null;
        }
        flee(l);
      }
      if (l.mode === "hide") {
        l.hideT += dt;
        l.calm = anyoneClose(l.hide.m) ? 0 : l.calm + dt;
        if (l.calm < L.calm) return;
        // Out again, to the front of the mushroom.
        l.x = lanternPos(l).x;
        l.way = [{ x: l.hide.m.x, y: l.hide.m.y + 20 }];
        l.mode = "back";
        return;
      }
      var S = l.mode === "flee" ? L.flee : L.hop;
      if (l.hop) {
        l.hop.t += dt;
        if (l.hop.t < l.hop.time) return;
        l.x = l.hop.tx;
        l.y = l.hop.ty;
        l.hop = null;
        l.gap = S.gap;
        return;
      }
      if (l.gap > 0) {
        l.gap -= dt;
        return;
      }
      if (l.way.length > 0) {
        var to = l.way[0], dx = to.x - l.x, dy = to.y - l.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d <= S.far) l.way.shift();
        var k = d <= S.far ? 1 : S.far / d;
        l.hop = { fx: l.x, fy: l.y, tx: l.x + dx * k, ty: l.y + dy * k, t: 0, time: S.time };
        if (Math.abs(dx) > 1) l.look = dx < 0 ? -1 : 1;
        return;
      }
      if (l.mode === "flee") {
        l.mode = "hide";
        l.hideT = 0;
        l.calm = 0;
        return;
      }
      if (l.mode !== "rest") {
        l.mode = "rest";
        l.rest = between(L.rest.min, L.rest.max);
        l.restT = 0;
      }
      // Standing: it looks to one side and the other, then hops on.
      l.restT += dt;
      l.look = l.restT < 0.4 ? l.look * 0.9 : Math.sin((l.restT - 0.4) * 2.6);
      if (l.restT >= l.rest) wander(l);
    });
  }

  // js/sims.js sends taps in the Bosque here only when someone is selected in it, and it would walk them there. So the
  // little lanterns take their taps first: once every script is in, Sims.handleTap is wrapped, and a tap on a lantern
  // (not on a character or a spirit, and not while the menu is open) makes it hop and blink, and goes no further.
  window.addEventListener("DOMContentLoaded", function () {
    var handleTap = Sims.handleTap;
    Sims.handleTap = function (x, y, screenX, screenY) {
      var free = Sims.viewPlace() === "enchanted" && !UI.isMenuOpen() && !Sims.simAt(x, y) && !spiritAt(x, y);
      var l = free ? lanternAt(x, y) : null;
      if (l) {
        cheer(l);
        return;
      }
      handleTap(x, y, screenX, screenY);
    };
  });

  // ---------- Drawing ----------

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function fillRound(ctx, x, y, w, h, r, color) {
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function circle(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function ellipse(ctx, x, y, rx, ry, color) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  // The tall trees all around the forest: along the top, the sides (leaving room for the trail) and the bottom.
  var BORDER = (function () {
    var out = [];
    for (var i = 0; i < 13; i++) out.push({ x: 20 + i * 80 + hash(i, 1) * 20, y: 52 + (i % 2) * 34, r: 50 + hash(i, 2) * 10 });
    for (var j = 0; j < 7; j++) {
      out.push({ x: -2 + hash(j, 3) * 8, y: 200 + j * 82, r: 38 + hash(j, 4) * 8 });
      var ry = 190 + j * 82;
      if (Math.abs(ry - TRAIL.y) > 70) out.push({ x: W + 2 - hash(j, 5) * 8, y: ry, r: 38 + hash(j, 6) * 8 });
    }
    for (var k = 0; k < 12; k++) out.push({ x: 40 + k * 86 + hash(k, 7) * 20, y: H + 22, r: 36 + hash(k, 8) * 8 });
    return out;
  })();

  function drawGround(ctx) {
    ctx.fillStyle = K.grass;
    ctx.fillRect(0, 0, W, H);
    // Little tufts, like in the city.
    for (var gy = 20; gy < H; gy += 46) {
      for (var gx = 20; gx < W; gx += 52) {
        var x = gx + Math.sin(gx * 12.9898 + gy * 78.233) * 18;
        var y = gy + Math.cos(gx * 4.1414 + gy * 9.731) * 14;
        ctx.fillStyle = (gx + gy) % 3 === 0 ? K.grassDark : K.grassLight;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.ellipse(x, y, 7, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // Soft patches of moss.
    for (var m = 0; m < 22; m++) {
      var mx = 40 + hash(m, 11) * (W - 80), my = 150 + hash(m, 12) * (H - 170);
      if (Math.abs(mx - streamX(my)) < STREAM.half + 40) continue;
      ctx.fillStyle = K.moss;
      ctx.globalAlpha = 0.55;
      for (var b = 0; b < 4; b++) {
        ctx.beginPath();
        ctx.ellipse(mx + (hash(m, b + 20) - 0.5) * 34, my + (hash(m, b + 30) - 0.5) * 16, 14 + hash(m, b + 40) * 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Little blue flowers on the grass, always in the same places, away from the stream, the trail and the ring.
  function drawBlueFlowers(ctx) {
    for (var i = 0; i < 60; i++) {
      var x = 40 + hash(i, 51) * (W - 80), y = 150 + hash(i, 52) * (H - 170);
      if (Math.abs(x - streamX(y)) < STREAM.half + 24 || inBox(x, y, grow(trailBox(), 10)) || ringAt(x, y)) continue;
      var r = 2.6 + hash(i, 53) * 1.4;
      for (var p = 0; p < 5; p++) {
        var a = p * Math.PI * 2 / 5;
        circle(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, r * 0.75, K.blueFlower);
      }
      circle(ctx, x, y, r * 0.5, "#F5E6A8");
    }
  }

  // The dirt trail with fallen leaves, from the right edge into the grass.
  function drawTrail(ctx) {
    ctx.save();
    ctx.fillStyle = K.dirt;
    ctx.beginPath();
    ctx.moveTo(W + 4, TRAIL.y - TRAIL.half - 4);
    for (var x = W; x >= TRAIL.left + 14; x -= 20) ctx.lineTo(x, TRAIL.y - TRAIL.half + Math.sin(x * 0.07) * 3);
    ctx.quadraticCurveTo(TRAIL.left - 10, TRAIL.y, TRAIL.left + 14, TRAIL.y + TRAIL.half);
    for (var x2 = TRAIL.left + 14; x2 <= W; x2 += 20) ctx.lineTo(x2, TRAIL.y + TRAIL.half + Math.sin(x2 * 0.05 + 1) * 3);
    ctx.lineTo(W + 4, TRAIL.y + TRAIL.half + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#B4936C";
    ctx.beginPath();
    ctx.ellipse((TRAIL.left + W) / 2 + 6, TRAIL.y - 2, (W - TRAIL.left) / 2 - 16, TRAIL.half * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    [[934, -7, 0.6, K.leaf], [956, 6, -0.8, "#D9A441"], [980, -4, 1.9, C.sage], [946, 9, 2.6, C.terracotta]].forEach(function (l) {
      ctx.save();
      ctx.translate(l[0], TRAIL.y + l[1]);
      ctx.rotate(l[2]);
      ctx.fillStyle = l[3];
      ctx.beginPath();
      ctx.ellipse(0, 0, 4.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  // The stream, as a band of water following streamX, "by" wider on each side.
  function streamPath(ctx, by) {
    ctx.beginPath();
    for (var y = -10; y <= H + 10; y += 10) ctx.lineTo(streamX(y) - STREAM.half - by, y);
    for (var y2 = H + 10; y2 >= -10; y2 -= 10) ctx.lineTo(streamX(y2) + STREAM.half + by, y2);
    ctx.closePath();
  }

  // The stream: a mossy bank, light edges, blue water with ripples going down, and rings where the rain falls.
  function drawStream(ctx) {
    streamPath(ctx, 7);
    ctx.fillStyle = K.moss;
    ctx.fill();
    streamPath(ctx, 2);
    ctx.fillStyle = C.waterLight;
    ctx.fill();
    streamPath(ctx, -2);
    ctx.fillStyle = C.water;
    ctx.fill();
    ctx.save();
    streamPath(ctx, -4);
    ctx.clip();
    ctx.strokeStyle = C.waterLight;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (var i = 0; i < 22; i++) {
      var y = (hash(i, 61) * (H + 40) + clock * 26) % (H + 40) - 20;
      var x = streamX(y) + (hash(i, 62) - 0.5) * STREAM.half * 1.2;
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(clock * 1.3 + i);
      ctx.beginPath();
      ctx.arc(x, y, 7, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
    var wet = Weather.rainLevel();
    if (wet > 0) {
      ctx.lineWidth = 1.4;
      for (var r = 0; r < 14; r++) {
        var t = (clock * 0.9 + hash(r, 63)) % 1;
        var n = Math.floor(clock * 0.9 + hash(r, 63));
        var ry = hash(r, n + 64) * H, rx = streamX(ry) + (hash(r + 30, n) - 0.5) * STREAM.half;
        ctx.globalAlpha = wet * (1 - t) * 0.8;
        ctx.beginPath();
        ctx.ellipse(rx, ry, 2 + t * 9, (2 + t * 9) * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // The bridge: three logs side by side across the stream, with the rings of their cut ends.
  function drawBridge(ctx) {
    var b = bridgeBox();
    var x0 = b.x + 14, x1 = b.x + b.w - 14;
    ellipse(ctx, (x0 + x1) / 2 + 4, BRIDGE.y + BRIDGE.half + 4, (x1 - x0) / 2, 6, "rgba(40, 60, 40, 0.3)");
    for (var i = 0; i < 3; i++) {
      var y = BRIDGE.y - BRIDGE.half + 6 + i * 12;
      fillRound(ctx, x0, y - 6, x1 - x0, 12, 6, i % 2 ? K.barkLight : K.bark);
      ctx.strokeStyle = "rgba(40, 26, 16, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0 + 14, y - 1 + i);
      ctx.lineTo(x1 - 20, y - 1 + i);
      ctx.stroke();
      [x0 + 3, x1 - 3].forEach(function (ex) {
        ellipse(ctx, ex, y, 4, 6, "#C9A27A");
        ctx.strokeStyle = K.bark;
        ctx.beginPath();
        ctx.ellipse(ex, y, 2, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
    }
  }

  // A tall tree: a trunk and three layers of dark crown that sway a little with the wind.
  function drawTallTree(ctx, t, i) {
    var s = CONFIG.alive.sway;
    var sway = Math.sin(clock * s.slow + i * 1.9) * s.amount * t.r / 34;
    ellipse(ctx, t.x + 8, t.y + t.r * 0.75, t.r * 0.9, t.r * 0.3, "rgba(30, 50, 30, 0.25)");
    fillRound(ctx, t.x - 7, t.y + t.r * 0.2, 14, t.r * 0.6, 5, K.bark);
    circle(ctx, t.x + sway * 0.5, t.y, t.r, "#3F6B3A");
    circle(ctx, t.x - t.r * 0.2 + sway, t.y - t.r * 0.25, t.r * 0.68, "#4F7F45");
    circle(ctx, t.x - t.r * 0.32 + sway * 1.3, t.y - t.r * 0.42, t.r * 0.3, K.grassLight);
  }

  // A giant mushroom seen a little from the front: a cream stem with a skirt, and a round cap with dots or spots.
  function capPath(ctx, x, cy, m) {
    ctx.beginPath();
    ctx.ellipse(x, cy, m.rx, m.ry * 1.5, 0, Math.PI, 0);
    ctx.ellipse(x, cy, m.rx, m.ry * 0.38, 0, 0, Math.PI);
    ctx.closePath();
  }

  function drawMushroom(ctx, m) {
    var cy = m.y - m.stem;
    ellipse(ctx, m.x + 8, m.y + 2, m.rx * 0.8, m.ry * 0.45, "rgba(30, 50, 30, 0.28)");
    // The stem, a little wider at the bottom.
    ctx.beginPath();
    ctx.moveTo(m.x - m.sw / 2, cy);
    ctx.lineTo(m.x + m.sw / 2, cy);
    ctx.quadraticCurveTo(m.x + m.sw / 2 + 2, m.y - 8, m.x + m.sw / 2 + 6, m.y);
    ctx.lineTo(m.x - m.sw / 2 - 6, m.y);
    ctx.quadraticCurveTo(m.x - m.sw / 2 - 2, m.y - 8, m.x - m.sw / 2, cy);
    ctx.closePath();
    ctx.fillStyle = K.stem;
    ctx.fill();
    fillRound(ctx, m.x - m.sw / 2 + 3, cy + 6, 5, m.stem - 12, 2.5, "rgba(255, 255, 255, 0.5)");
    ellipse(ctx, m.x, cy + m.stem * 0.35, m.sw / 2 + 5, 4, "#E2D2B4");
    // The underside with its gills, then the cap.
    ellipse(ctx, m.x, cy, m.rx * 0.92, m.ry * 0.36, "#E8D9BC");
    capPath(ctx, m.x, cy - 2, m);
    ctx.fillStyle = m.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(60, 30, 30, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ellipse(ctx, m.x - m.rx * 0.35, cy - m.ry * 0.9, m.rx * 0.28, m.ry * 0.3, "rgba(255, 255, 255, 0.35)");
    var spots = m.dots ? 6 : 4;
    for (var i = 0; i < spots; i++) {
      var a = Math.PI * (1.12 + i * 0.76 / spots);
      var sx = m.x + Math.cos(a) * m.rx * 0.68, sy = cy - 2 + Math.sin(a) * m.ry * 1.05;
      ellipse(ctx, sx, sy, m.dots ? 5 : 7, m.dots ? 4 : 4.5, m.dots ? C.cream : "rgba(255, 255, 255, 0.28)");
    }
    if (m.dots) ellipse(ctx, m.x + 4, cy - m.ry * 1.25, 5, 3.5, C.cream);
    // With snow, the cap turns white.
    Weather.roofSnow(ctx, function () {
      ctx.beginPath();
      ctx.ellipse(m.x, cy - 2, m.rx - 2, m.ry * 1.5 - 2, 0, Math.PI, 0);
      ctx.closePath();
    });
  }

  // A little acorn standing with its bottom at x, y: a light brown body, a rough brown cap with a tiny stem, black eyes
  // that look to a side ("look" from -1 to 1) or are closed, pink cheeks and a tiny smile.
  function drawAcorn(ctx, i, x, y, look, closed) {
    var a = ACORNS[i], rx = 8 * a.w, ry = 9.5 * a.h, cy = y - ry;
    ellipse(ctx, x, cy, rx, ry, a.body);
    circle(ctx, x, y - 0.8, 1.6, a.cap);
    ellipse(ctx, x - rx * 0.5, cy + ry * 0.2, 1.5, ry * 0.32, "rgba(255, 255, 255, 0.35)");
    var capY = cy - ry * 0.3, capH = ry * 0.62;
    ctx.beginPath();
    ctx.ellipse(x, capY, rx + 1.8, capH, 0, Math.PI, 0);
    ctx.ellipse(x, capY, rx + 1.8, 2.4, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = a.cap;
    ctx.fill();
    // Its rough little scales.
    for (var r = 0; r < 2; r++) {
      for (var c = -2; c <= 2; c++) {
        var sx = x + (c + (r % 2) * 0.5) * rx * 0.36;
        if (Math.abs(sx - x) < rx) circle(ctx, sx, capY - 1.2 - r * capH * 0.4, 0.9, "rgba(40, 24, 12, 0.35)");
      }
    }
    fillRound(ctx, x - 1, capY - capH - 3, 2, 4, 1, a.cap);
    var ey = cy + ry * 0.12, ex = look * 1.8;
    if (closed) {
      ctx.strokeStyle = "#1E1E1E";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 4 + ex, ey);
      ctx.lineTo(x - 1.6 + ex, ey);
      ctx.moveTo(x + 1.6 + ex, ey);
      ctx.lineTo(x + 4 + ex, ey);
      ctx.stroke();
    } else {
      circle(ctx, x - 2.7 + ex, ey, 1.4, "#1E1E1E");
      circle(ctx, x + 2.7 + ex, ey, 1.4, "#1E1E1E");
      circle(ctx, x - 2.3 + ex, ey - 0.5, 0.5, C.white);
      circle(ctx, x + 3.1 + ex, ey - 0.5, 0.5, C.white);
    }
    ctx.save();
    ctx.globalAlpha = 0.8;
    circle(ctx, x - 4.6 + ex * 0.6, ey + 2.6, 1.6, K.cheek);
    circle(ctx, x + 4.6 + ex * 0.6, ey + 2.6, 1.6, K.cheek);
    ctx.restore();
    ctx.strokeStyle = "#5A3A24";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(x + ex * 0.6, ey + 2.4, 1.4, 0.3, Math.PI - 0.3);
    ctx.stroke();
  }

  // The round door: an arch, wooden with planks and a knob. While an acorn peeks out it opens a little (from its hinge
  // on the left) and the acorn shows in the dark gap.
  function doorPath(ctx, d) {
    var r = d.w / 2;
    ctx.beginPath();
    ctx.moveTo(d.x - r, HOUSE.y);
    ctx.lineTo(d.x - r, HOUSE.y - d.h + r);
    ctx.arc(d.x, HOUSE.y - d.h + r, r, Math.PI, 0);
    ctx.lineTo(d.x + r, HOUSE.y);
    ctx.closePath();
  }

  function drawDoor(ctx) {
    var d = HOUSE.door, p = peeks.door, open = p ? peekOut(p) : 0;
    doorPath(ctx, { x: d.x, w: d.w + 6, h: d.h + 3 });
    ctx.fillStyle = K.bark;
    ctx.fill();
    doorPath(ctx, d);
    ctx.fillStyle = "#2A1C12";
    ctx.fill();
    ctx.save();
    doorPath(ctx, d);
    ctx.clip();
    if (p) {
      var at = doorAcorn(p);
      drawAcorn(ctx, p.who, at.x, at.y, peekLook(p), peekBlink(p));
    }
    var hinge = d.x - d.w / 2;
    ctx.translate(hinge, 0);
    ctx.scale(1 - 0.55 * open, 1);
    ctx.translate(-hinge, 0);
    doorPath(ctx, d);
    ctx.fillStyle = K.door;
    ctx.fill();
    ctx.strokeStyle = "rgba(60, 36, 20, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(d.x - d.w / 6, HOUSE.y - d.h + 3);
    ctx.lineTo(d.x - d.w / 6, HOUSE.y);
    ctx.moveTo(d.x + d.w / 6, HOUSE.y - d.h + 3);
    ctx.lineTo(d.x + d.w / 6, HOUSE.y);
    ctx.stroke();
    circle(ctx, d.x + d.w / 2 - 5, HOUSE.y - d.h * 0.42, 1.8, "#F5D76E");
    ctx.restore();
  }

  // The round window with a wooden frame; a peeking acorn rises in it.
  function drawWindow(ctx) {
    var w = HOUSE.window, p = peeks.window;
    circle(ctx, w.x, w.y, w.r, "#2A1C12");
    if (p) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
      ctx.clip();
      var at = windowAcorn(p);
      drawAcorn(ctx, p.who, at.x, at.y, peekLook(p), peekBlink(p));
      ctx.restore();
    }
    ctx.strokeStyle = K.door;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r + 1, 0, Math.PI * 2);
    ctx.stroke();
  }

  // The mushroom house: a wide cream trunk with its door and window, under a big red cap with cream dots
  // (white with snow).
  function drawHouse(ctx) {
    var m = HOUSE, cy = m.y - m.stem;
    ellipse(ctx, m.x + 8, m.y + 3, m.rx * 0.85, m.ry * 0.5, "rgba(30, 50, 30, 0.28)");
    ctx.beginPath();
    ctx.moveTo(m.x - m.sw / 2, cy);
    ctx.lineTo(m.x + m.sw / 2, cy);
    ctx.quadraticCurveTo(m.x + m.sw / 2 + 2, m.y - 10, m.x + m.sw / 2 + 8, m.y);
    ctx.lineTo(m.x - m.sw / 2 - 8, m.y);
    ctx.quadraticCurveTo(m.x - m.sw / 2 - 2, m.y - 10, m.x - m.sw / 2, cy);
    ctx.closePath();
    ctx.fillStyle = K.houseTrunk;
    ctx.fill();
    ctx.strokeStyle = "rgba(120, 90, 60, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    fillRound(ctx, m.x - m.sw / 2 + 4, cy + 14, 6, m.stem - 22, 3, "rgba(255, 255, 255, 0.55)");
    drawDoor(ctx);
    drawWindow(ctx);
    ellipse(ctx, m.x, cy, m.rx * 0.92, m.ry * 0.36, "#E8D9BC");
    capPath(ctx, m.x, cy - 2, m);
    ctx.fillStyle = K.houseCap;
    ctx.fill();
    ctx.strokeStyle = "rgba(60, 30, 30, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ellipse(ctx, m.x - m.rx * 0.35, cy - m.ry * 0.9, m.rx * 0.28, m.ry * 0.3, "rgba(255, 255, 255, 0.35)");
    [[-0.62, -0.5, 6], [-0.3, -1.05, 5], [0.05, -0.62, 7], [0.4, -1.0, 5], [0.66, -0.45, 6], [-0.05, -1.32, 4.5],
      [0.28, -0.3, 4]].forEach(function (d) {
      ellipse(ctx, m.x + d[0] * m.rx, cy - 2 + d[1] * m.ry, d[2], d[2] * 0.75, C.cream);
    });
    Weather.roofSnow(ctx, function () {
      ctx.beginPath();
      ctx.ellipse(m.x, cy - 2, m.rx - 2, m.ry * 1.5 - 2, 0, Math.PI, 0);
      ctx.closePath();
    });
  }

  // At night the acorns sleep inside: little "z" float up from the window (while nobody peeks out of it).
  function drawSleep(ctx, dark) {
    if (dark < 0.5 || peeks.window) return;
    ctx.save();
    ctx.font = "bold 11px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.fillStyle = C.cream;
    for (var i = 0; i < 2; i++) {
      var t = (clock * 0.4 + i * 0.5) % 1;
      ctx.globalAlpha = (dark - 0.5) * 2 * (t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8);
      ctx.fillText("z", HOUSE.window.x + 6 + t * 10, HOUSE.window.y - 8 - t * 24);
    }
    ctx.restore();
  }

  // The slightly lighter grass of the fairy ring (under the snow).
  function drawRingGrass(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ellipse(ctx, RING.x, RING.y, RING.r + 8, (RING.r + 8) * 0.6, K.grassLight);
    ctx.restore();
  }

  // The fairy ring: little mushrooms in a circle.
  function drawRing(ctx) {
    var n = 13;
    var little = [];
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2;
      little.push({ x: RING.x + Math.cos(a) * RING.r, y: RING.y + Math.sin(a) * RING.r * 0.6, k: 0.8 + hash(i, 71) * 0.4, i: i });
    }
    little.sort(function (p, q) { return p.y - q.y; }).forEach(function (p) {
      var k = p.k;
      ellipse(ctx, p.x + 2, p.y + 1, 6 * k, 2.4 * k, "rgba(30, 50, 30, 0.3)");
      fillRound(ctx, p.x - 2 * k, p.y - 8 * k, 4 * k, 8 * k, 2 * k, K.stem);
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - 8 * k, 6.5 * k, 5 * k, 0, Math.PI, 0);
      ctx.closePath();
      ctx.fillStyle = p.i % 3 === 0 ? K.lilac : p.i % 3 === 1 ? K.red : "#E9A35B";
      ctx.fill();
      circle(ctx, p.x - 2 * k, p.y - 11 * k, 1.2 * k, C.cream);
    });
  }

  // A hollow log lying on the grass: bark with lines, a cut end with rings, and a dark hole at its open end.
  function drawLog(ctx, l) {
    var b = logBox(l);
    ellipse(ctx, l.x + 6, l.y + l.r - 1, l.len / 2 + 4, 6, "rgba(30, 50, 30, 0.28)");
    fillRound(ctx, b.x, b.y, b.w, b.h, l.r, K.bark);
    fillRound(ctx, b.x + 8, b.y + 4, b.w - 16, 6, 3, K.barkLight);
    ctx.strokeStyle = "rgba(40, 26, 16, 0.4)";
    ctx.lineWidth = 1.2;
    for (var i = 0; i < 4; i++) {
      var lx = b.x + 22 + i * 20;
      ctx.beginPath();
      ctx.moveTo(lx, b.y + 12 + (i % 2) * 4);
      ctx.lineTo(lx + 14, b.y + 12 + (i % 2) * 4);
      ctx.stroke();
    }
    // A little moss on top.
    ellipse(ctx, l.x - l.open * 18, b.y + 3, 14, 4, K.moss);
    var closed = l.x - l.open * (l.len / 2 - 3), hole = holeOf(l);
    ellipse(ctx, closed, l.y, 7, l.r - 1, "#C9A27A");
    ctx.strokeStyle = K.barkLight;
    ctx.beginPath();
    ctx.ellipse(closed, l.y, 3.5, l.r * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, hole.x, hole.y, 8, l.r - 1, K.barkLight);
    ellipse(ctx, hole.x, hole.y, 6, l.r - 4, "#2A1C12");
  }

  // Soft light coming down between the leaves by day: pale slanted beams that shimmer a little.
  function drawLight(ctx) {
    var day = 1 - Time.darkness();
    if (day <= 0) return;
    ctx.save();
    for (var i = 0; i < 5; i++) {
      var x = 120 + i * 190 + hash(i, 81) * 60;
      var a = (0.11 + 0.04 * Math.sin(clock * 0.5 + i * 1.7)) * day * (1 - Weather.rainLevel() * 0.7);
      ctx.globalAlpha = a;
      ctx.fillStyle = "#FFF6C8";
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 46, 0);
      ctx.lineTo(x + 180, H);
      ctx.lineTo(x + 92, H);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // ---------- Little lanterns drawing ----------

  // The paper body of a lantern, round and a little uneven, as if drawn by hand.
  function lanternBody(ctx, l, x, cy, rx, ry) {
    var n = 14, pts = [];
    for (var k = 0; k < n; k++) {
      var a = k / n * Math.PI * 2, r = 1 + (hash(l.i + 40, k) - 0.5) * 0.12;
      pts.push({ x: x + Math.cos(a) * rx * r, y: cy + Math.sin(a) * ry * r });
    }
    ctx.beginPath();
    ctx.moveTo((pts[n - 1].x + pts[0].x) / 2, (pts[n - 1].y + pts[0].y) / 2);
    for (var j = 0; j < n; j++) {
      var p = pts[j], q = pts[(j + 1) % n];
      ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
    }
    ctx.closePath();
  }

  // A little lantern standing with its feet at x, y: thin dark legs, a round paper body with soft stripes and a warm light
  // inside, a lid with a tilted handle on top and two tiny black eyes. "night" leaves out its shadow (drawn over the tint).
  function drawLantern(ctx, l, x, y, night) {
    var rx = 5.6 * l.w, ry = 6 * l.h, lift = lanternLift(l), cy = y - 3.2 - ry - lift, light = lanternLight(l);
    if (!night) ellipse(ctx, x, y + 0.5, rx * 0.9 * (1 - lift / 20), 1.8, "rgba(30, 50, 30, 0.3)");
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = K.lanternLid;
    ctx.lineWidth = 1;
    var leg = lift > 1 ? 1.8 : 3.4;
    ctx.beginPath();
    ctx.moveTo(x - 2, cy + ry - 0.5);
    ctx.lineTo(x - 2.5, cy + ry + leg);
    ctx.moveTo(x + 2, cy + ry - 0.5);
    ctx.lineTo(x + 2.5, cy + ry + leg);
    ctx.stroke();
    lanternBody(ctx, l, x, cy, rx, ry);
    ctx.fillStyle = l.color;
    ctx.fill();
    ctx.save();
    ctx.clip();
    var g = ctx.createRadialGradient(x, cy + 1, 0.5, x, cy + 1, ry * (1.1 + 0.5 * light));
    g.addColorStop(0, "rgba(255, 246, 205, " + light + ")");
    g.addColorStop(1, "rgba(255, 246, 205, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - rx - 2, cy - ry - 2, rx * 2 + 4, ry * 2 + 4);
    // Soft paper stripes.
    ctx.strokeStyle = "rgba(90, 55, 40, 0.2)";
    ctx.lineWidth = 0.8;
    [-0.5, 0, 0.5].forEach(function (t) {
      var half = rx * Math.sqrt(1 - t * t);
      ctx.beginPath();
      ctx.moveTo(x - half, cy + t * ry);
      ctx.quadraticCurveTo(x, cy + t * ry + 1.4, x + half, cy + t * ry);
      ctx.stroke();
    });
    ctx.restore();
    lanternBody(ctx, l, x, cy, rx, ry);
    ctx.strokeStyle = "rgba(70, 45, 35, 0.35)";
    ctx.lineWidth = 0.9;
    ctx.stroke();
    fillRound(ctx, x - rx * 0.45, cy + ry - 1.2, rx * 0.9, 1.8, 0.9, K.lanternLid);
    fillRound(ctx, x - rx * 0.55, cy - ry - 1.4, rx * 1.1, 2.4, 1.1, K.lanternLid);
    ctx.translate(x, cy - ry - 1.2);
    ctx.rotate(l.tilt);
    ctx.strokeStyle = K.lanternLid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 2.6, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    ctx.restore();
    var ex = l.cheer > 0 ? 0 : l.look * 1.4;
    circle(ctx, x - 1.9 + ex, cy + 0.4, 0.85, "#1E1E1E");
    circle(ctx, x + 1.9 + ex, cy + 0.4, 0.85, "#1E1E1E");
  }

  function drawLanternHighlight(ctx, l) {
    var at = lanternPos(l);
    ctx.save();
    ctx.shadowColor = C.cream;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = C.sage;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(at.x, at.y - 10 - lanternLift(l), 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ---------- Spirits and snakes drawing ----------

  // A forest spirit: a little ball of light with a soft glow, two eyes and a tiny smile.
  function drawSpirit(ctx, s, dark) {
    var alpha = shown(s);
    if (alpha <= 0.02) return;
    var x = s.x, y = s.y - lift(s);
    ctx.save();
    ctx.globalAlpha = alpha * 0.4;
    ellipse(ctx, s.x, s.y + 2, 8, 3, "rgba(30, 50, 30, 0.6)");
    ctx.globalAlpha = alpha;
    var glow = 20 + dark * 14;
    var g = ctx.createRadialGradient(x, y, 2, x, y, glow);
    g.addColorStop(0, "rgba(255, 255, 255, " + (0.75 + dark * 0.2) + ")");
    g.addColorStop(0.35, s.color);
    g.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.globalAlpha = alpha * (0.55 + dark * 0.4);
    circle(ctx, x, y, glow, g);
    ctx.globalAlpha = alpha;
    circle(ctx, x, y, 9, s.color);
    circle(ctx, x - 2.5, y - 3, 3.2, "rgba(255, 255, 255, 0.8)");
    circle(ctx, x - 3, y, 1.3, "#2E3B2A");
    circle(ctx, x + 3, y, 1.3, "#2E3B2A");
    ctx.strokeStyle = "#2E3B2A";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y + 2, 2, 0.3, Math.PI - 0.3);
    ctx.stroke();
    ctx.restore();
  }

  function drawSpiritHighlight(ctx, s) {
    ctx.save();
    ctx.shadowColor = C.cream;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = C.sage;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y - lift(s), 17, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // How far the snake's head is out of its hole: 0 inside, 1 all out (peeking), or all the way to whom it bites.
  function snakeOut(s) {
    if (s.bite > 0) return 1;
    if (s.peek <= 0) return 0;
    var t = 1 - s.peek / K.peek.time;
    return t < 0.25 ? t / 0.25 : t > 0.8 ? (1 - t) / 0.2 : 1;
  }

  // Where the snake's head is: just out of its hole while it peeks; while it bites, it jumps to the character and back.
  function snakeHead(s) {
    var hole = holeOf(s.log), out = snakeOut(s);
    if (s.bite > 0 && s.target) {
      var t = 1 - s.bite / 0.7, reach = Math.sin(Math.min(1, t) * Math.PI);
      var tx = s.target.x - s.log.open * 10, ty = s.target.y - 30;
      return { x: hole.x + (tx - hole.x) * reach, y: hole.y - 4 + (ty - hole.y + 4) * reach, out: 1 };
    }
    return { x: hole.x + s.log.open * 16 * out, y: hole.y - 6 * out, out: out };
  }

  // A little magic snake: a curvy body from its hole to its head, with stripes that shine, two eyes and a forked tongue.
  function drawSnake(ctx, s) {
    var head = snakeHead(s);
    if (head.out <= 0.02) return;
    var hole = holeOf(s.log), dir = s.log.open;
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = s.log.color;
    ctx.lineWidth = 8;
    var mx = (hole.x + head.x) / 2, my = (hole.y + head.y) / 2;
    var dx = head.x - hole.x, dy = head.y - hole.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var wig = Math.sin(clock * 9) * Math.min(10, d * 0.3);
    ctx.beginPath();
    ctx.moveTo(hole.x, hole.y + 1);
    ctx.quadraticCurveTo(mx - dy / d * wig, my + dx / d * wig, head.x, head.y);
    ctx.stroke();
    // Stripes that shine one after another.
    var shine = 0.5 + 0.5 * Math.sin(clock * 5);
    ctx.shadowColor = s.log.stripe;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = s.log.stripe;
    ctx.lineWidth = 2;
    for (var i = 1; i <= 3; i++) {
      var t = i / 4, px = hole.x + dx * t - dy / d * wig * 2 * t * (1 - t), py = hole.y + dy * t + dx / d * wig * 2 * t * (1 - t);
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(clock * 5 - i);
      ctx.beginPath();
      ctx.moveTo(px - dy / d * 4, py + dx / d * 4);
      ctx.lineTo(px + dy / d * 4, py - dx / d * 4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    // The head, with a glowing stripe, two eyes and the tongue when it is all out.
    var face = dx >= 0 ? 1 : -1;
    if (Math.abs(dx) < 2) face = dir;
    ellipse(ctx, head.x, head.y, 8, 6.5, s.log.color);
    ctx.globalAlpha = 0.6 + 0.4 * shine;
    ctx.fillStyle = s.log.stripe;
    ctx.beginPath();
    ctx.ellipse(head.x - face * 1.5, head.y - 3.5, 3.5, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    circle(ctx, head.x + face * 3, head.y - 1.5, 1.8, C.white);
    circle(ctx, head.x + face * 3.4, head.y - 1.5, 1, "#1E1E1E");
    circle(ctx, head.x - face * 1, head.y - 2, 1.5, C.white);
    circle(ctx, head.x - face * 0.7, head.y - 2, 0.8, "#1E1E1E");
    if (head.out > 0.9 && Math.sin(clock * 14) > -0.2) {
      var tx = head.x + face * 8;
      ctx.strokeStyle = "#E0533D";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(head.x + face * 6, head.y + 1);
      ctx.lineTo(tx + face * 3, head.y + 1);
      ctx.lineTo(tx + face * 6, head.y - 1.5);
      ctx.moveTo(tx + face * 3, head.y + 1);
      ctx.lineTo(tx + face * 6, head.y + 3.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---------- Glows ----------

  // A soft glow around what can be used under the mouse.
  function drawGlow(ctx, b) {
    ctx.save();
    ctx.shadowColor = C.cream;
    ctx.shadowBlur = 18;
    roundRect(ctx, b.x - 10, b.y - 10, b.w + 20, b.h + 20, 20);
    ctx.fillStyle = "rgba(245, 235, 221, 0.25)";
    ctx.fill();
    ctx.strokeStyle = C.sage;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  }

  function draw(ctx) {
    ctx.save();
    roundRect(ctx, 0, 0, W, H, 40);
    ctx.clip();
    drawGround(ctx);
    drawRingGrass(ctx);
    Weather.drawSnowyGrass(ctx);
    drawBlueFlowers(ctx);
    drawStream(ctx);
    drawBridge(ctx);
    drawTrail(ctx);
    if (hover === "trail") drawGlow(ctx, trailBox());
    if (hover === "ring") drawGlow(ctx, { x: RING.x - RING.r - 6, y: RING.y - RING.r * 0.6 - 14, w: RING.r * 2 + 12, h: RING.r * 1.2 + 20 });
    drawRing(ctx);
    LOGS.forEach(function (l) { drawLog(ctx, l); });
    // The mushrooms, the mushroom house, the trees and the little lanterns: whoever is lower is drawn last.
    var things = MUSHROOMS.map(function (m) { return { y: m.y, draw: function () { drawMushroom(ctx, m); } }; });
    things.push({ y: REST.y, draw: function () {
      if (hover === "rest") drawGlow(ctx, { x: REST.x - REST.rx, y: REST.y - REST.stem - REST.ry * 1.5, w: REST.rx * 2, h: REST.stem + REST.ry * 1.5 });
      drawMushroom(ctx, REST);
    } });
    things.push({ y: HOUSE.y, draw: function () {
      if (hover === "house") drawGlow(ctx, houseBox());
      drawHouse(ctx);
    } });
    BORDER.forEach(function (t, i) { things.push({ y: t.y, draw: function () { drawTallTree(ctx, t, i); } }); });
    // The little lanterns among them, so one hiding behind a mushroom is hidden by it.
    lanterns.forEach(function (l) {
      var at = lanternPos(l);
      things.push({ y: at.y, draw: function () {
        if (hover === l) drawLanternHighlight(ctx, l);
        drawLantern(ctx, l, at.x, at.y, false);
      } });
    });
    things.sort(function (a, b) { return a.y - b.y; }).forEach(function (one) { one.draw(); });
    drawLight(ctx);
    ctx.restore();
  }

  // At night the giant mushrooms and the little lanterns glow with a soft halo of their color (drawn over the night tint).
  function drawNightLights(ctx, dark) {
    if (dark <= 0) return;
    ctx.save();
    MUSHROOMS.concat([REST]).forEach(function (m, i) {
      var cy = m.y - m.stem - m.ry * 0.5;
      var pulse = 0.85 + 0.15 * Math.sin(clock * 1.4 + i * 1.3);
      var g = ctx.createRadialGradient(m.x, cy, 4, m.x, cy, m.rx * 1.7);
      g.addColorStop(0, m.color);
      g.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.globalAlpha = dark * 0.45 * pulse;
      circle(ctx, m.x, cy, m.rx * 1.7, g);
      ctx.globalAlpha = dark * 0.35 * pulse;
      capPath(ctx, m.x, m.y - m.stem - 2, m);
      ctx.fillStyle = m.color;
      ctx.fill();
    });
    // The little lanterns shine strong, with a halo of their color; one behind its mushroom shows only its halo.
    lanterns.forEach(function (l, i) {
      var at = lanternPos(l), cy = at.y - 10 - lanternLift(l), light = lanternLight(l);
      var pulse = 0.85 + 0.15 * Math.sin(clock * 2 + i * 1.7);
      var g = ctx.createRadialGradient(at.x, cy, 2, at.x, cy, 34);
      g.addColorStop(0, "rgba(255, 244, 205, 1)");
      g.addColorStop(0.3, l.color);
      g.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.globalAlpha = dark * 0.85 * pulse * light;
      circle(ctx, at.x, cy, 34, g);
      if (l.mode === "hide") return;
      ctx.globalAlpha = dark;
      drawLantern(ctx, l, at.x, at.y, true);
    });
    ctx.restore();
  }

  // The signs of the place and of the mushroom house, drawn over the night tint like the signs of the city.
  // Each one remembers the box it took, for its word.
  function signBox(sign) {
    return sign.measured || { x: sign.x - sign.size * 5, y: sign.y - sign.size, w: sign.size * 10, h: sign.size * 2 };
  }

  function drawSign(ctx, sign) {
    ctx.save();
    ctx.font = "700 " + sign.size + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var w = ctx.measureText(sign.text).width + sign.size * 1.2, h = sign.size * 1.7;
    sign.measured = { x: sign.x - w / 2, y: sign.y - h / 2, w: w, h: h };
    ctx.shadowColor = "rgba(74, 52, 40, 0.25)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    fillRound(ctx, sign.x - w / 2, sign.y - h / 2, w, h, h / 2, C.darkBrown);
    ctx.shadowColor = "transparent";
    ctx.fillStyle = C.cream;
    ctx.fillText(sign.text, sign.x, sign.y + 1);
    ctx.restore();
  }

  function drawLabels(ctx) {
    drawSign(ctx, SIGN);
    drawSign(ctx, HOUSE.sign);
  }

  // A fishing rod in the hand and a bobber floating on the water, where it was thrown.
  function drawRod(ctx, a) {
    var sim = a.sim;
    var dir = a.bob.x < sim.x ? -1 : 1;
    var k = CONFIG.characterScale;
    var hand = { x: sim.x + dir * 14 * k, y: sim.y - 34 * k };
    var tip = { x: sim.x + dir * 44 * k, y: sim.y - 82 * k };
    var bob = { x: a.bob.x, y: a.bob.y + Math.sin(clock * 3) * 1.5 };
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = C.wood;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hand.x, hand.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 253, 248, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.quadraticCurveTo((tip.x + bob.x) / 2, Math.min(tip.y, bob.y) - 10, bob.x, bob.y);
    ctx.stroke();
    var ring = (clock * 12) % 14;
    ctx.globalAlpha = 1 - ring / 14;
    ctx.strokeStyle = C.waterLight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(bob.x, bob.y + 3, 5 + ring, (5 + ring) * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    circle(ctx, bob.x, bob.y, 4.5, C.terracotta);
    ctx.beginPath();
    ctx.arc(bob.x, bob.y, 4.5, Math.PI, 0);
    ctx.fillStyle = C.white;
    ctx.fill();
    ctx.restore();
  }

  // After the night tint, before the characters: the rods of whoever is fishing, the snakes, the sleeping "z" of the acorns,
  // the sparkles of a wish and the spirits, so they shine in the dark.
  function drawTop(ctx) {
    var dark = Time.darkness();
    Object.keys(current).forEach(function (id) {
      var a = current[id];
      if (a.kind === "fish" && a.phase === "doing") drawRod(ctx, a);
    });
    snakes.forEach(function (s) { drawSnake(ctx, s); });
    drawSleep(ctx, dark);
    sparkles.forEach(function (p) {
      var t = p.age / 1.6;
      ctx.save();
      ctx.globalAlpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      var x = p.x + Math.sin(t * 8 + p.x) * 4, y = p.y - t * 90, k = 2 + (1 - t) * 3;
      ctx.beginPath();
      ctx.moveTo(x, y - k);
      ctx.lineTo(x + k * 0.3, y - k * 0.3);
      ctx.lineTo(x + k, y);
      ctx.lineTo(x + k * 0.3, y + k * 0.3);
      ctx.lineTo(x, y + k);
      ctx.lineTo(x - k * 0.3, y + k * 0.3);
      ctx.lineTo(x - k, y);
      ctx.lineTo(x - k * 0.3, y - k * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    spirits.forEach(function (s) {
      if (s === hover) drawSpiritHighlight(ctx, s);
      drawSpirit(ctx, s, dark);
    });
  }

  // The floating texts after a catch or a wish, over everything (characters too).
  function drawPops(ctx) {
    pops.forEach(function (p) {
      var t = p.age / K.popTime;
      ctx.save();
      ctx.globalAlpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      ctx.font = "bold 22px " + CONFIG.fontFamily;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var ty = p.y - t * 40;
      ctx.lineWidth = 5;
      ctx.strokeStyle = C.darkBrown;
      ctx.strokeText(p.text, p.x, ty);
      ctx.fillStyle = C.cream;
      ctx.fillText(p.text, p.x, ty);
      ctx.restore();
    });
  }

  // ---------- Words ----------

  // The id of the word for what is at a spot of the Bosque encantado, or null. Small things win over big ones.
  // While a catch, a wish or an acorn's gift floats up, its text says what it is ("Pez hoja · leaf fish", "Deseo · wish",
  // "Bellota · acorn").
  function wordAt(x, y) {
    if (x < 0 || x > W || y < 0 || y > H) return null;
    for (var i = pops.length - 1; i >= 0; i--) {
      var p = pops[i];
      if (p.word && Math.abs(x - p.x) < 80 && Math.abs(y - (p.y - p.age / K.popTime * 40)) < 16) return p.word;
    }
    if (spiritAt(x, y)) return "spirit";
    if (lanternAt(x, y)) return "littleLantern";
    for (var s = 0; s < snakes.length; s++) {
      var head = snakeHead(snakes[s]);
      if (head.out > 0.3 && near(x, y, head.x, head.y, 14)) return "snake";
    }
    if (acornAt(x, y) >= 0) return "acorn";
    if (LOGS.some(function (l) { return inBox(x, y, grow(logBox(l), 4)); })) return "hollowLog";
    if (inBox(x, y, houseBox()) || inBox(x, y, signBox(HOUSE.sign))) return "mushroomHouse";
    if (restAt(x, y)) return "giantMushroom";
    if (MUSHROOMS.some(function (m) {
      return inBox(x, y, { x: m.x - m.rx, y: m.y - m.stem - m.ry * 1.5, w: m.rx * 2, h: m.stem + m.ry * 1.5 });
    })) return "giantMushroom";
    if (ringAt(x, y)) return "fairyRing";
    if (inBox(x, y, bridgeBox())) return "bridge";
    if (Math.abs(x - streamX(y)) <= STREAM.half + 2) return "stream";
    if (inBox(x, y, trailBox()) || inBox(x, y, signBox(SIGN))) return "enchanted";
    if (BORDER.some(function (t) { return near(x, y, t.x, t.y, t.r); })) return "tree";
    return null;
  }

  // ---------- Saving ----------

  function get() {
    var aids = {};
    Object.keys(bandAids).forEach(function (id) { aids[id] = bandAids[id]; });
    return { wishDay: wishDay, bandAids: aids, acornDay: acornDay, acornsGiven: acornsGiven };
  }

  // Used when loading a saved game. Anything strange is left out. An old saved game has no wish made, no band-aids and no
  // Bellota given today.
  function set(saved) {
    if (!saved || typeof saved !== "object") return;
    if (typeof saved.wishDay === "number" && isFinite(saved.wishDay)) wishDay = saved.wishDay;
    if (typeof saved.acornDay === "number" && isFinite(saved.acornDay) && typeof saved.acornsGiven === "number" &&
      isFinite(saved.acornsGiven)) {
      acornDay = saved.acornDay;
      acornsGiven = Math.max(0, Math.min(K.acorns.perDay, Math.floor(saved.acornsGiven)));
    }
    var aids = saved.bandAids && typeof saved.bandAids === "object" ? saved.bandAids : {};
    Sims.list().forEach(function (sim) {
      var left = aids[sim.data.id];
      if (typeof left === "number" && isFinite(left) && left > 0) bandAids[sim.data.id] = Math.min(K.bite.bandAid, left);
    });
  }

  return {
    edge: K.edge,
    foot: K.foot,
    isWalkable: isWalkable,
    isSolid: isSolid,
    spiritAt: spiritAt,
    usableAt: usableAt,
    setHover: setHover,
    tapRest: tapRest,
    tapRing: tapRing,
    tapWater: tapWater,
    tapSpirit: tapSpirit,
    cancel: cancel,
    isActive: isActive,
    update: update,
    bubbleFor: bubbleFor,
    shoutFor: shoutFor,
    hopFor: hopFor,
    hasBandAid: hasBandAid,
    bandAidAt: bandAidAt,
    poseFor: poseFor,
    draw: draw,
    drawNightLights: drawNightLights,
    drawLabels: drawLabels,
    drawTop: drawTop,
    drawPops: drawPops,
    wordAt: wordAt,
    get: get,
    set: set,
    // Modo decorar moves nothing in the Bosque encantado (js/decorate.js).
    movableAt: function () { return null; },
    canTurn: function () { return false; }
  };
})();
