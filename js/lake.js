// The Lago: a map to the right of the city, as big as it, seen from above. A big blue lake with soft waves and sparkles,
// a little sandy beach on its left (by the way in) with grass around, its trail on the left that goes back to the city
// (js/valleymap.js has the other end) and its sign.
// 🎣 A wooden pier goes into the lake from the beach: a tap on the water walks the selected one to the tip of the pier or to
// the closest shore to fish, like in the river (trout, shrimp, old boots and pearl fish go into the backpack).
// 🐚 Shells and starfish on the sand, gathered like the wild flowers of the Pradera.
// 🏰 A spot of smooth sand with a bucket and a little shovel to build a sandcastle (it stays until it starts to rain or until
// 06:00 the next day). ☀️ Two striped beach chairs with an umbrella between them, to lie in the sun.
// 🦆 A mother duck and her 3 ducklings swim around the lake in a row and now and then walk along the shore; at night they
// sleep together on the shore. Only decoration: on the shore the characters walk around them (js/sims.js).
// 🧜‍♀️ Pacífica, the mermaid, a magical creature (not a neighbor: never selected, no chats, no gifts and no Amistad).
// From 08:00 to 18:00 she sits on her rock near the pier, moves her tail and now and then combs her hair; every 1 to 2 minutes
// of play she sings (colored notes float up and a soft song sounds if the Lago is on screen). She waves 👋 at whoever stands
// at the tip of the pier or near the shore of her rock, and a tap on her makes her wave and sing right away.
// From 18:00 to 08:00 she is under the water: only little bubbles come up by her rock.
// The pier, the rock, the chairs, the umbrella and the sandcastle spot are solid (js/path.js); the shells are not.
// The pier can be walked on, out to its tip. Day and night and the weather of the day show here too (js/weather.js),
// without puddles or snowman. Modo decorar moves nothing here. The neighbors never come, and the shiny coins never appear
// here. Pausa freezes it all.
var Lake = (function () {
  var C = CONFIG.colors;
  var K = CONFIG.lake;
  var W = CONFIG.world.width, H = CONFIG.world.height;
  // How close a character's feet may get to the edges of the map (as in the city), to the water and to solid things.
  var MARGIN = { side: 30, top: 130, bottom: 20 };
  var SHORE = 10;
  var CLEAR = 10;

  // The water, as an oval, and the sand of the beach on its left (another oval, under the water).
  var WATER = { x: 670, y: 430, rx: 290, ry: 230 };
  var SAND = { x: 210, y: 450, rx: 270, ry: 290 };
  // The trail on the left: its middle "y", from the left edge to "right".
  var TRAIL = { y: K.edge.y, right: 84, half: 15 };
  // The pier: its boards, the lane its feet walk on, and the tip where one fishes.
  var PIER = { x: 336, y: 412, w: 220, h: 36 };
  var PIER_TIP = { x: 536, y: 430 };
  // Pacífica's rock, in the water near the pier.
  var ROCK = { x: 650, y: 330, rx: 40, ry: 24 };
  // The two beach chairs (a character lies with its feet at "lie" and stands at "stand" to get in) and the umbrella between.
  var CHAIRS = [
    { x: 108, y: 226, w: 46, h: 110, lie: { x: 131, y: 326 }, stand: { x: 131, y: 362 } },
    { x: 214, y: 226, w: 46, h: 110, lie: { x: 237, y: 326 }, stand: { x: 237, y: 362 } }
  ];
  var UMBRELLA = { x: 184, y: 262, r: 34, pole: { x: 179, y: 300, w: 10, h: 26 } };
  // The smooth sand where a sandcastle is built, and where one stands to build it.
  var CASTLE = { x: 196, y: 604, r: 34, stand: { x: 252, y: 612 } };
  // The sign of the place.
  var SIGN = { text: "Lago", x: 500, y: 92, size: 24 };

  // The ducks: they swim two laps of "LOOP", then walk a little along the shore ("WALK", a loop of spots that starts and ends
  // where the swimming does, on the beach where there is room to go around them), and again. At night they sleep together
  // at "NEST", on the beach too.
  var LOOP = { x: 770, y: 470, rx: 130, ry: 100 };
  var SWIM_TIME = 60, WALK_TIME = 28;
  var WALK = [{ x: 770, y: 570 }, { x: 560, y: 600 }, { x: 470, y: 612 }, { x: 420, y: 630 }, { x: 450, y: 664 },
    { x: 520, y: 650 }, { x: 575, y: 610 }, { x: 770, y: 570 }];
  var NEST = { x: 470, y: 656 };
  var DUCKLINGS = 3, DUCK_GAP = 1.4;

  // What comes out of the lake: the chance of each catch, out of 100 (with rain, "rain" instead).
  var CATCHES = [
    { id: "trout", chance: 45, rain: 40, text: "¡Trucha!" },
    { id: "shrimp", chance: 25, rain: 25, text: "¡Camarón!" },
    { id: "boot", chance: 20, rain: 20, text: "¡Bota vieja!" },
    { id: "pearlFish", chance: 10, rain: 15, text: "¡Pez perla!" }
  ];
  // What appears on the sand, and how often, out of 100.
  var KINDS = [
    { id: "shell", chance: 60 },
    { id: "starfish", chance: 40 }
  ];

  var ACTIONS = { fish: "Pescando 🎣", gather: "Recolectando 🧺", castle: "Construyendo 🏰", sun: "Tomando sol ☀️" };

  // Shells and starfish right now, as { kind, x, y, turn }, and the seconds until each new one appears.
  var shells = [];
  var regrow = [];
  // The sandcastle, while it stands: the weather day it was built ({ day }), or null.
  var castle = null;
  var wasRaining = false;
  // What each character is doing here, by id:
  // { sim, kind: "fish" | "gather" | "castle" | "sun", shell, chair, bob, phase: "walking" | "doing" | "busy", elapsed }
  var current = {};
  // Texts floating up, as { x, y, text, age, word }.
  var pops = [];
  // What is under the mouse: a shell, or "trail", "chair0", "chair1", "castle", "mermaid" or "water".
  var hover = null;
  // Seconds of play here so far: the waves, the ducks and Pacífica stop with Pausa.
  var clock = 0;

  // Pacífica: seconds until she sings again, seconds left of singing and of waving, her notes going up,
  // whether each character was near her a moment ago, and her blinking.
  var mermaid = { singIn: between(K.mermaid.sing.min, K.mermaid.sing.max), singing: 0, waving: 0, noteIn: 0, notes: [],
    near: {}, blink: 0, blinkWait: 3 };
  var quackIn = between(K.quack.min, K.quack.max);

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

  function inOval(x, y, o, by) {
    var dx = (x - o.x) / (o.rx + by), dy = (y - o.y) / (o.ry + by);
    return dx * dx + dy * dy <= 1;
  }

  // ---------- Where characters can walk ----------

  // True if the feet are on the lane of the pier, out to its tip.
  function onPier(x, y) {
    return x >= PIER.x && x <= PIER.x + PIER.w - 12 && y >= PIER.y + 8 && y <= PIER.y + PIER.h - 8;
  }

  // True if the spot is inside the map and out of the water (or on the pier). Used when loading a saved game.
  function isWalkable(x, y) {
    if (x < MARGIN.side || x > W - MARGIN.side || y < MARGIN.top || y > H - MARGIN.bottom) return false;
    return !inOval(x, y, WATER, SHORE) || onPier(x, y);
  }

  // True if a character cannot stand here: off the map, in the water, or on a chair, the umbrella or the sandcastle spot.
  // Used by js/path.js.
  function isSolid(x, y) {
    if (!isWalkable(x, y)) return true;
    if (CHAIRS.some(function (c) { return inBox(x, y, grow(c, 8)); })) return true;
    if (inBox(x, y, grow(UMBRELLA.pole, CLEAR))) return true;
    return near(x, y, CASTLE.x, CASTLE.y, CASTLE.r + CLEAR);
  }

  // True if the spot is on the water of the lake (the rock and the pier are not).
  function waterAt(x, y) {
    if (!inOval(x, y, WATER, 0) || inBox(x, y, PIER)) return false;
    return !inOval(x, y, ROCK, 0);
  }

  // ---------- Shells ----------

  function pickKind() {
    var roll = Math.random() * 100;
    for (var i = 0; i < KINDS.length; i++) {
      roll -= KINDS[i].chance;
      if (roll < 0) return KINDS[i].id;
    }
    return KINDS[0].id;
  }

  // True if a shell may lie here: on the beach a character can stand by, off the trail, the pier, the chairs and the castle.
  function isShellSpot(x, y) {
    if (!inOval(x, y, SAND, -20) || inOval(x, y, WATER, SHORE + 20) || isSolid(x, y)) return false;
    if (Math.abs(y - TRAIL.y) < TRAIL.half + 24 && x < TRAIL.right + 30) return false;
    if (inBox(x, y, grow(PIER, 24)) || near(x, y, UMBRELLA.x, UMBRELLA.y, UMBRELLA.r + 10)) return false;
    if (CHAIRS.some(function (c) { return inBox(x, y, grow({ x: c.x, y: c.y, w: c.w, h: c.stand.y - c.y }, 20)); })) return false;
    return !near(x, y, CASTLE.x, CASTLE.y, CASTLE.r + 30) && !near(x, y, CASTLE.stand.x, CASTLE.stand.y, 30);
  }

  // A random free spot of the beach, away from the other shells, or null.
  function randomSpot() {
    for (var i = 0; i < 80; i++) {
      var x = between(40, 460), y = between(180, H - 30);
      if (!isShellSpot(x, y)) continue;
      var tooClose = shells.some(function (s) { return Math.abs(s.x - x) < 50 && Math.abs(s.y - y) < 50; });
      if (!tooClose) return { x: x, y: y };
    }
    return null;
  }

  function spawn() {
    var spot = randomSpot();
    if (!spot) return false;
    shells.push({ kind: pickKind(), x: spot.x, y: spot.y, turn: between(-0.6, 0.6) });
    return true;
  }

  // The shell or starfish at a spot of the Lago, or null.
  function shellAt(x, y) {
    for (var i = shells.length - 1; i >= 0; i--) {
      var s = shells[i];
      if (near(x, y, s.x, s.y - 4, 18)) return s;
    }
    return null;
  }

  // ---------- What can be tapped ----------

  function trailBox() {
    return { x: 0, y: TRAIL.y - TRAIL.half - 10, w: TRAIL.right + 8, h: TRAIL.half * 2 + 20 };
  }

  function chairAt(x, y) {
    for (var i = 0; i < CHAIRS.length; i++) {
      if (inBox(x, y, grow(CHAIRS[i], 4))) return i;
    }
    return -1;
  }

  function castleAt(x, y) {
    return near(x, y, CASTLE.x, CASTLE.y - 8, CASTLE.r + 8);
  }

  // Pacífica, sitting on her rock (only while she is there).
  function mermaidBox() {
    return { x: ROCK.x - 30, y: ROCK.y - 82, w: 76, h: 98 };
  }

  function mermaidAt(x, y) {
    return isMermaidUp() && inBox(x, y, mermaidBox());
  }

  // "trail", "chair0", "chair1", "castle", "mermaid" or "water" for what can be used at a spot, or null
  // (the shells are apart: shellAt).
  function usableAt(x, y) {
    if (inBox(x, y, trailBox())) return "trail";
    var chair = chairAt(x, y);
    if (chair >= 0) return "chair" + chair;
    if (castleAt(x, y)) return "castle";
    if (mermaidAt(x, y)) return "mermaid";
    if (waterAt(x, y)) return "water";
    return null;
  }

  function setHover(what) {
    hover = what;
  }

  // ---------- Actions ----------

  // A tap on a shell: walk next to it, on the side the character comes from, and gather it.
  function tapShell(sim, s) {
    var side = sim.x < s.x ? -1 : 1;
    current[sim.data.id] = { sim: sim, kind: "gather", shell: s, phase: "walking", elapsed: 0 };
    Sims.walkTo(sim, s.x + side * 30, s.y + 4);
  }

  // The closest shore to a spot of the water: on the edge of the oval, toward the spot, just out of the water.
  function shoreFor(x, y) {
    var a = Math.atan2((y - WATER.y) / WATER.ry, (x - WATER.x) / WATER.rx);
    var spot = { x: WATER.x + (WATER.rx + SHORE + 6) * Math.cos(a), y: WATER.y + (WATER.ry + SHORE + 6) * Math.sin(a) };
    return Path.free("lake", spot.x, spot.y);
  }

  // A tap on the water: walk to the tip of the pier or to the closest shore (whichever is closer to the tap) and fish.
  // The bobber goes into the water in front of it.
  function tapWater(sim, x, y) {
    var shore = shoreFor(x, y);
    var tip = (x - PIER_TIP.x) * (x - PIER_TIP.x) + (y - PIER_TIP.y) * (y - PIER_TIP.y);
    var bank = (x - shore.x) * (x - shore.x) + (y - shore.y) * (y - shore.y);
    var spot = tip <= bank ? PIER_TIP : shore;
    var bob;
    if (spot === PIER_TIP) {
      bob = { x: PIER_TIP.x + 52, y: PIER_TIP.y + 8 };
    } else {
      var dx = WATER.x - spot.x, dy = WATER.y - spot.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      bob = { x: spot.x + dx / d * 52, y: spot.y + dy / d * 52 };
    }
    current[sim.data.id] = { sim: sim, kind: "fish", spot: spot, bob: bob, phase: "walking", elapsed: 0 };
    Sims.walkTo(sim, spot.x, spot.y);
  }

  // A tap on a beach chair: walk below it and lie in the sun.
  function tapChair(sim, i) {
    current[sim.data.id] = { sim: sim, kind: "sun", chair: i, phase: "walking", elapsed: 0 };
    Sims.walkTo(sim, CHAIRS[i].stand.x, CHAIRS[i].stand.y);
  }

  // A tap on the sandcastle spot: walk next to it and build one; if there is one already, it says so over the spot.
  function tapCastle(sim) {
    if (castle) {
      pops.push({ x: CASTLE.x, y: CASTLE.y - 70, text: "Ya hay un castillo 🏰", age: 0 });
      return false;
    }
    current[sim.data.id] = { sim: sim, kind: "castle", phase: "walking", elapsed: 0 };
    Sims.walkTo(sim, CASTLE.stand.x, CASTLE.stand.y);
    return true;
  }

  // A tap on Pacífica: she waves and sings right away.
  function tapMermaid() {
    mermaid.waving = K.mermaid.waveTime;
    sing();
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

  // True if someone else is fishing right by here, on the same chair, building the castle or gathering this same shell.
  function isTaken(a, id) {
    return Object.keys(current).some(function (other) {
      var b = current[other];
      if (other === id || b.phase !== "doing" || b.kind !== a.kind) return false;
      if (a.kind === "gather") return b.shell === a.shell;
      if (a.kind === "sun") return b.chair === a.chair;
      if (a.kind === "castle") return true;
      var dx = b.sim.x - a.sim.x, dy = b.sim.y - a.sim.y;
      return dx * dx + dy * dy < K.fishGap * K.fishGap;
    });
  }

  function timeFor(a) {
    if (a.kind === "fish") return K.fishTime;
    if (a.kind === "gather") return K.gatherTime;
    if (a.kind === "castle") return K.castleTime;
    return K.sunTime;
  }

  // Floating text over the head of a character ("word" is the word of what it caught, for the word tag).
  function popOver(sim, text, word) {
    pops.push({ x: sim.x, y: sim.y - 78 * CONFIG.characterScale - CONFIG.moodStar.room - 30, text: text, age: 0, word: word });
  }

  // While it rains, more pearl fish and fewer trout come out (js/weather.js).
  function catchOne() {
    var rain = Weather.isRaining();
    var roll = Math.random() * 100;
    for (var i = 0; i < CATCHES.length; i++) {
      roll -= rain ? CATCHES[i].rain : CATCHES[i].chance;
      if (roll < 0) return CATCHES[i];
    }
    return CATCHES[0];
  }

  // When the action ends: the catch or the shell goes into the backpack, or the sandcastle is there.
  function finish(a) {
    var id = a.sim.data.id;
    if (a.kind === "fish") {
      var c = catchOne();
      Inventory.add(c.id, 1);
      Goals.notify("fish", id, c.id);
      popOver(a.sim, c.text + " " + Inventory.item(c.id).emoji, c.id);
      Sound.playAt("lake", "blup");
      var values = Needs.get(id);
      values.fun = Math.min(100, values.fun + K.fishFun);
    } else if (a.kind === "gather") {
      shells.splice(shells.indexOf(a.shell), 1);
      if (hover === a.shell) hover = null;
      Inventory.add(a.shell.kind, 1);
      popOver(a.sim, "+1 " + Inventory.item(a.shell.kind).emoji, a.shell.kind);
      regrow.push(between(K.regrow.min, K.regrow.max));
    } else if (a.kind === "castle") {
      castle = { day: weatherDay() };
    }
  }

  // The game day whose 06:00 started the weather now (before 06:00 it is still the day before), like js/weather.js.
  function weatherDay() {
    var t = Time.get();
    return t.minute >= CONFIG.weather.dayStart ? t.day : t.day - 1;
  }

  // Building raises Diversión, and lying in the sun Energía and Diversión, little by little.
  var GAINS = { castle: { fun: K.castleFun }, sun: { energy: K.sunEnergy, fun: K.sunFun } };

  function stillThere(a) {
    if (a.kind === "gather") return shells.indexOf(a.shell) >= 0;
    if (a.kind === "castle") return !castle;
    return true;
  }

  // Look at what it uses: the water while fishing, the shell, the castle; lying in the chair it looks up.
  function face(a) {
    if (a.kind === "fish") a.sim.facing = a.bob.x < a.sim.x ? "left" : "right";
    else if (a.kind === "gather") a.sim.facing = a.shell.x < a.sim.x ? "left" : "right";
    else if (a.kind === "castle") a.sim.facing = "left";
    else a.sim.facing = "front";
  }

  function update(dt) {
    var paused = Needs.isPaused();
    if (!paused) clock += dt;
    pops.forEach(function (p) { p.age += dt; });
    pops = pops.filter(function (p) { return p.age < K.popTime; });

    Object.keys(current).forEach(function (id) {
      var a = current[id];
      // Going back to the city or starting to socialize ends it.
      if (a.sim.place !== "lake" || Social.isInvolved(id)) {
        delete current[id];
        return;
      }
      if (a.phase === "walking") {
        if (a.sim.path.length > 0) return;
        if (!stillThere(a)) {
          delete current[id];
          if (a.kind === "castle") tapCastle(a.sim);
          return;
        }
        a.elapsed = 0;
        a.phase = isTaken(a, id) ? "busy" : "doing";
        if (a.phase === "doing") face(a);
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
      if (a.elapsed < timeFor(a)) return;
      delete current[id];
      if (stillThere(a)) finish(a);
    });

    // The sandcastle goes away when it starts to rain and at 06:00 the next day.
    var raining = Weather.isRaining();
    if (castle && ((raining && !wasRaining) || castle.day !== weatherDay())) castle = null;
    wasRaining = raining;

    updateMermaid(dt, paused);
    if (paused) return;

    // The ducks quack now and then by day.
    quackIn -= dt;
    if (quackIn <= 0) {
      quackIn = between(K.quack.min, K.quack.max);
      if (Time.isDay()) Sound.playAt("lake", "quack");
    }

    // New shells only appear while the game runs.
    regrow = regrow.filter(function (left) { return left > 0; });
    for (var i = 0; i < regrow.length; i++) {
      regrow[i] -= dt;
      if (regrow[i] > 0) continue;
      if (shells.length >= K.max) {
        regrow[i] = -1;
      } else if (!spawn()) {
        regrow[i] = 5;
      }
    }
  }

  // What to show over a character's head, or null.
  function bubbleFor(id) {
    var a = current[id];
    if (!a || a.phase === "walking") return null;
    if (a.phase === "busy") return { text: "Ocupado", heart: false };
    return { text: ACTIONS[a.kind], heart: false };
  }

  // How a character is drawn while it lies in a beach chair (js/sims.js). Null while it does anything else.
  function poseFor(id) {
    var a = current[id];
    if (!a || a.phase !== "doing" || a.kind !== "sun") return null;
    return { kind: "sun", x: CHAIRS[a.chair].lie.x, y: CHAIRS[a.chair].lie.y };
  }

  // ---------- Pacífica ----------

  function isMermaidUp() {
    var m = Time.get().minute;
    return m >= K.mermaid.from && m < K.mermaid.to;
  }

  // She sings: colored notes go up for a few seconds and her song sounds if the Lago is on screen.
  function sing() {
    if (!isMermaidUp()) return;
    mermaid.singing = K.mermaid.singTime;
    mermaid.noteIn = 0;
    mermaid.singIn = between(K.mermaid.sing.min, K.mermaid.sing.max);
    Sound.playAt("lake", "song");
  }

  // True if a character stands at the tip of the pier or near the shore of her rock.
  function isByRock(sim) {
    if (sim.place !== "lake" || sim.path.length > 0) return false;
    return near(sim.x, sim.y, PIER_TIP.x, PIER_TIP.y, 24) || near(sim.x, sim.y, ROCK.x, ROCK.y, K.mermaid.wave);
  }

  var NOTE_COLORS = ["#F08A6E", "#3FBFB0", "#F5D76E", "#C9B3E6", "#F2A9B8", "#7DB9D6"];

  function updateMermaid(dt, paused) {
    var up = isMermaidUp();
    // Who just came near her gets a wave.
    Sims.list().forEach(function (sim) {
      var by = up && isByRock(sim);
      if (by && !mermaid.near[sim.data.id]) mermaid.waving = K.mermaid.waveTime;
      mermaid.near[sim.data.id] = by;
    });
    if (paused) return;
    mermaid.notes.forEach(function (n) { n.age += dt; });
    mermaid.notes = mermaid.notes.filter(function (n) { return n.age < 2.6; });
    if (!up) {
      mermaid.singing = mermaid.waving = 0;
      return;
    }
    if (mermaid.waving > 0) mermaid.waving -= dt;
    mermaid.singIn -= dt;
    if (mermaid.singIn <= 0) sing();
    if (mermaid.singing > 0) {
      mermaid.singing -= dt;
      mermaid.noteIn -= dt;
      if (mermaid.noteIn <= 0) {
        mermaid.noteIn = 0.35;
        mermaid.notes.push({ x: ROCK.x - 2, y: ROCK.y - 60, age: 0, side: between(-1, 1),
          color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)], glyph: Math.random() < 0.5 ? "♪" : "♫" });
      }
    }
    if (mermaid.blink > 0) mermaid.blink -= dt;
    mermaid.blinkWait -= dt;
    if (mermaid.blinkWait <= 0) {
      mermaid.blink = CONFIG.alive.blink.length;
      mermaid.blinkWait = between(CONFIG.alive.blink.min, CONFIG.alive.blink.max);
    }
  }

  // ---------- Ducks ----------

  function smooth(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  var WALK_LENGTHS = (function () {
    var out = [0];
    for (var i = 1; i < WALK.length; i++) {
      var dx = WALK[i].x - WALK[i - 1].x, dy = WALK[i].y - WALK[i - 1].y;
      out.push(out[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    return out;
  })();

  // Where the ducks' way goes at "t" seconds: two laps of the lake, then a little walk along the shore.
  function duckWay(t) {
    var period = SWIM_TIME + WALK_TIME;
    t = ((t % period) + period) % period;
    if (t < SWIM_TIME) {
      var a = Math.PI / 2 + t / SWIM_TIME * Math.PI * 4;
      return { x: LOOP.x + LOOP.rx * Math.cos(a), y: LOOP.y + LOOP.ry * Math.sin(a) };
    }
    var d = (t - SWIM_TIME) / WALK_TIME * WALK_LENGTHS[WALK_LENGTHS.length - 1];
    for (var i = 1; i < WALK.length; i++) {
      if (d <= WALK_LENGTHS[i] || i === WALK.length - 1) {
        var u = (d - WALK_LENGTHS[i - 1]) / (WALK_LENGTHS[i] - WALK_LENGTHS[i - 1]);
        return { x: WALK[i - 1].x + (WALK[i].x - WALK[i - 1].x) * u, y: WALK[i - 1].y + (WALK[i].y - WALK[i - 1].y) * u };
      }
    }
    return WALK[0];
  }

  // Each duck: the mother first and the ducklings behind her on the same way. At night they sleep together at the nest.
  // { x, y, dir: 1 right or -1 left, swim: true on the water, sleep, little }
  function ducks() {
    var out = [];
    var night = Time.darkness() > 0.55;
    for (var i = 0; i <= DUCKLINGS; i++) {
      if (night) {
        var spots = [[0, 0], [-15, 9], [15, 9], [0, 14]];
        out.push({ x: NEST.x + spots[i][0], y: NEST.y + spots[i][1], dir: i % 2 ? -1 : 1, swim: false, sleep: true, little: i > 0 });
        continue;
      }
      var t = clock - i * DUCK_GAP;
      var p = duckWay(t), q = duckWay(t + 0.15);
      var swim = waterAt(p.x, p.y + 4);
      out.push({ x: p.x, y: p.y, dir: q.x >= p.x ? 1 : -1, swim: swim, sleep: false, little: i > 0 });
    }
    return out;
  }

  // The ducks on the shore, for js/sims.js: the characters walk around them there (on the water nobody can go).
  function walkers() {
    var family = ducks().filter(function (d) { return !d.swim; });
    return family.map(function (d) { return { x: d.x, y: d.y, r: d.little ? 20 : 24 }; });
  }

  function duckAt(x, y) {
    var all = ducks();
    for (var i = 0; i < all.length; i++) {
      if (near(x, y, all[i].x, all[i].y - 4, all[i].little ? 10 : 14)) return all[i];
    }
    return null;
  }

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

  function withShadow(ctx, fn) {
    ctx.save();
    ctx.shadowColor = "rgba(74, 52, 40, 0.25)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    fn();
    ctx.restore();
  }

  // An oval with its edge a little wavy, always the same way.
  function wavyOval(ctx, o, by, seed) {
    ctx.beginPath();
    for (var i = 0; i <= 48; i++) {
      var a = i / 48 * Math.PI * 2;
      var w = 1 + Math.sin(a * 5 + seed) * 0.012 + Math.sin(a * 9 + seed * 2) * 0.008;
      var x = o.x + (o.rx + by) * w * Math.cos(a), y = o.y + (o.ry + by) * w * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function drawGround(ctx) {
    ctx.fillStyle = C.cityGrass;
    ctx.fillRect(0, 0, W, H);
    // Little tufts, like in the city.
    for (var gy = 20; gy < H; gy += 46) {
      for (var gx = 20; gx < W; gx += 52) {
        var x = gx + Math.sin(gx * 12.9898 + gy * 78.233) * 18;
        var y = gy + Math.cos(gx * 4.1414 + gy * 9.731) * 14;
        ctx.fillStyle = (gx + gy) % 3 === 0 ? C.cityGrassDark : C.cityGrassLight;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.ellipse(x, y, 7, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // The beach, and a ring of sand all around the lake.
    wavyOval(ctx, SAND, 0, 1);
    ctx.fillStyle = K.sand;
    ctx.fill();
    wavyOval(ctx, WATER, 28, 2);
    ctx.fill();
    ctx.save();
    wavyOval(ctx, SAND, -26, 1);
    ctx.clip();
    ctx.fillStyle = K.sandLight;
    for (var i = 0; i < 26; i++) {
      ctx.beginPath();
      ctx.ellipse(40 + hash(i, 1) * 420, 180 + hash(i, 2) * 520, 18 + hash(i, 3) * 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Little dots of sand.
    ctx.fillStyle = K.sandDark;
    for (var j = 0; j < 90; j++) {
      var dx = 20 + hash(j, 4) * 460, dy = 170 + hash(j, 5) * 540;
      if (inOval(dx, dy, SAND, -6) && !inOval(dx, dy, WATER, 14)) {
        ctx.beginPath();
        ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // The trail of sand, from the left edge into the beach.
  function drawTrail(ctx) {
    ctx.save();
    ctx.fillStyle = K.sandDark;
    ctx.beginPath();
    ctx.moveTo(-4, TRAIL.y - TRAIL.half - 4);
    for (var x = 0; x <= TRAIL.right - 14; x += 20) ctx.lineTo(x, TRAIL.y - TRAIL.half + Math.sin(x * 0.07) * 3);
    ctx.quadraticCurveTo(TRAIL.right + 10, TRAIL.y, TRAIL.right - 14, TRAIL.y + TRAIL.half);
    for (var x2 = TRAIL.right - 14; x2 >= 0; x2 -= 20) ctx.lineTo(x2, TRAIL.y + TRAIL.half + Math.sin(x2 * 0.05 + 1) * 3);
    ctx.lineTo(-4, TRAIL.y + TRAIL.half + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = K.sand;
    ctx.beginPath();
    ctx.ellipse(TRAIL.right / 2 - 4, TRAIL.y - 2, TRAIL.right / 2 - 14, TRAIL.half * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // The lake: deeper blue in the middle, a lighter edge, soft waves that come and go and sparkles that twinkle.
  function drawWater(ctx) {
    wavyOval(ctx, WATER, 8, 3);
    ctx.fillStyle = C.waterLight;
    ctx.fill();
    var g = ctx.createRadialGradient(WATER.x + 40, WATER.y + 20, 40, WATER.x, WATER.y, WATER.rx);
    g.addColorStop(0, K.deep);
    g.addColorStop(1, C.water);
    wavyOval(ctx, WATER, 0, 3);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    wavyOval(ctx, WATER, -6, 3);
    ctx.clip();
    // Waves: little curved lines that drift slowly and fade in and out.
    ctx.strokeStyle = C.waterLight;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    for (var i = 0; i < 22; i++) {
      var x = WATER.x - WATER.rx + hash(i, 1) * WATER.rx * 2 + Math.sin(clock * 0.3 + i) * 10;
      var y = WATER.y - WATER.ry + hash(i, 2) * WATER.ry * 2;
      if (!inOval(x, y, WATER, -20)) continue;
      ctx.globalAlpha = 0.25 + 0.4 * (0.5 + 0.5 * Math.sin(clock * 0.8 + i * 1.7));
      ctx.beginPath();
      ctx.arc(x, y, 12, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
    // Sparkles: little four-pointed stars that twinkle on the water by day.
    ctx.fillStyle = C.white;
    for (var s = 0; s < 14; s++) {
      var sx = WATER.x - WATER.rx + hash(s, 6) * WATER.rx * 2, sy = WATER.y - WATER.ry + hash(s, 7) * WATER.ry * 2;
      if (!inOval(sx, sy, WATER, -20)) continue;
      var tw = Math.max(0, Math.sin(clock * 1.6 + s * 2.3));
      if (tw < 0.4) continue;
      ctx.globalAlpha = (tw - 0.4) / 0.6 * (1 - Time.darkness() * 0.7);
      var k = 2 + tw * 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy - k);
      ctx.lineTo(sx + k * 0.3, sy - k * 0.3);
      ctx.lineTo(sx + k, sy);
      ctx.lineTo(sx + k * 0.3, sy + k * 0.3);
      ctx.lineTo(sx, sy + k);
      ctx.lineTo(sx - k * 0.3, sy + k * 0.3);
      ctx.lineTo(sx - k, sy);
      ctx.lineTo(sx - k * 0.3, sy - k * 0.3);
      ctx.closePath();
      ctx.fill();
    }
    // Rings where the rain drops fall.
    var wet = Weather.rainLevel();
    if (wet > 0) {
      ctx.strokeStyle = C.waterLight;
      ctx.lineWidth = 1.5;
      for (var r = 0; r < 26; r++) {
        var t = (clock * 0.9 + hash(r, 8)) % 1;
        var n = Math.floor(clock * 0.9 + hash(r, 8));
        var rx = WATER.x - WATER.rx + hash(r, n + 9) * WATER.rx * 2, ry = WATER.y - WATER.ry + hash(r + 50, n) * WATER.ry * 2;
        if (!inOval(rx, ry, WATER, -14)) continue;
        ctx.globalAlpha = wet * (1 - t) * 0.8;
        ctx.beginPath();
        ctx.ellipse(rx, ry, 3 + t * 12, (3 + t * 12) * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // The wooden pier: boards across, two long beams and posts in the water.
  function drawPier(ctx) {
    var p = PIER;
    ctx.save();
    [[p.x + 60, p.y - 3], [p.x + 60, p.y + p.h + 3], [p.x + p.w - 8, p.y - 3], [p.x + p.w - 8, p.y + p.h + 3],
      [p.x + 135, p.y - 3], [p.x + 135, p.y + p.h + 3]].forEach(function (q) {
      ellipse(ctx, q[0], q[1] + 3, 7, 3.5, "rgba(74, 52, 40, 0.25)");
      circle(ctx, q[0], q[1], 5.5, K.pierDark);
      circle(ctx, q[0] - 1.5, q[1] - 1.5, 2, K.pier);
    });
    withShadow(ctx, function () { fillRound(ctx, p.x, p.y, p.w, p.h, 4, K.pier); });
    ctx.strokeStyle = K.pierDark;
    ctx.lineWidth = 1.4;
    for (var x = p.x + 14; x < p.x + p.w; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, p.y + 2);
      ctx.lineTo(x, p.y + p.h - 2);
      ctx.stroke();
    }
    fillRound(ctx, p.x, p.y, p.w, 5, 2.5, K.pierDark);
    fillRound(ctx, p.x, p.y + p.h - 5, p.w, 5, 2.5, K.pierDark);
    ctx.restore();
  }

  // Pacífica's rock: gray stone with lighter tops.
  function drawRock(ctx) {
    var r = ROCK;
    ellipse(ctx, r.x + 4, r.y + 8, r.rx + 6, r.ry * 0.6, "rgba(40, 80, 110, 0.25)");
    ellipse(ctx, r.x, r.y, r.rx, r.ry, "#9C978E");
    ellipse(ctx, r.x - 6, r.y - 5, r.rx * 0.75, r.ry * 0.6, C.stone);
    ellipse(ctx, r.x - 14, r.y - 9, r.rx * 0.3, r.ry * 0.25, C.stoneLight);
    ellipse(ctx, r.x + 26, r.y + 10, 12, 8, "#9C978E");
    ellipse(ctx, r.x + 24, r.y + 8, 8, 5, C.stone);
    // A little foam where the water touches it.
    ctx.strokeStyle = "rgba(255, 253, 248, 0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(r.x + 2, r.y + 6, r.rx + 4, r.ry * 0.7, 0, 0.1, Math.PI - 0.1);
    ctx.stroke();
  }

  // A beach chair with cream and terracotta stripes, seen from above, with a little pillow at the top.
  function drawChair(ctx, c) {
    withShadow(ctx, function () { fillRound(ctx, c.x - 3, c.y - 3, c.w + 6, c.h + 6, 8, C.wood); });
    ctx.save();
    roundRect(ctx, c.x, c.y, c.w, c.h, 6);
    ctx.clip();
    ctx.fillStyle = C.cream;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = C.terracotta;
    for (var y = c.y; y < c.y + c.h; y += 18) ctx.fillRect(c.x, y, c.w, 9);
    ctx.restore();
    fillRound(ctx, c.x + 6, c.y + 4, c.w - 12, 14, 7, C.white);
    // The fold where the back meets the seat.
    ctx.strokeStyle = "rgba(74, 52, 40, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y + c.h * 0.36);
    ctx.lineTo(c.x + c.w, c.y + c.h * 0.36);
    ctx.stroke();
  }

  // The umbrella seen from above: a round top in terracotta and cream slices, with its pole peeking out below.
  function drawUmbrella(ctx) {
    var u = UMBRELLA;
    fillRound(ctx, u.pole.x, u.pole.y, u.pole.w, u.pole.h, 3, C.wood);
    ellipse(ctx, u.x + 6, u.y + 10, u.r, u.r * 0.85, "rgba(74, 52, 40, 0.18)");
    for (var i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(u.x, u.y);
      ctx.arc(u.x, u.y, u.r, i * Math.PI / 4, (i + 1) * Math.PI / 4);
      ctx.closePath();
      ctx.fillStyle = i % 2 ? C.cream : C.terracotta;
      ctx.fill();
    }
    ctx.strokeStyle = "#A04E36";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(u.x, u.y, u.r, 0, Math.PI * 2);
    ctx.stroke();
    circle(ctx, u.x, u.y, 4, C.wood);
  }

  // The bucket and the little shovel, next to the smooth sand.
  function drawBucket(ctx, x, y) {
    ellipse(ctx, x, y + 9, 11, 4, "rgba(74, 52, 40, 0.2)");
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 8);
    ctx.lineTo(x + 10, y - 8);
    ctx.lineTo(x + 8, y + 9);
    ctx.lineTo(x - 8, y + 9);
    ctx.closePath();
    ctx.fillStyle = C.sage;
    ctx.fill();
    ellipse(ctx, x, y - 8, 10, 3.5, "#6F8A6A");
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y - 8, 10, Math.PI, 0);
    ctx.stroke();
    // The shovel, lying on the sand.
    ctx.save();
    ctx.translate(x + 20, y + 4);
    ctx.rotate(-0.5);
    fillRound(ctx, -2, -14, 4, 16, 2, C.wood);
    ctx.beginPath();
    ctx.moveTo(-6, 2);
    ctx.lineTo(6, 2);
    ctx.lineTo(4, 12);
    ctx.lineTo(-4, 12);
    ctx.closePath();
    ctx.fillStyle = C.terracotta;
    ctx.fill();
    ctx.restore();
  }

  // A sandcastle: a wall with two towers and a middle keep, little windows and a terracotta flag on top.
  function drawSandcastle(ctx) {
    var x = CASTLE.x, y = CASTLE.y + 14;
    var sand = "#E0BF88", shade = "#C9A26C";
    ellipse(ctx, x + 4, y + 2, 38, 10, "rgba(74, 52, 40, 0.2)");
    ctx.fillStyle = sand;
    ctx.fillRect(x - 30, y - 24, 60, 24);
    [-30, 18].forEach(function (tx) {
      ctx.fillStyle = sand;
      ctx.fillRect(x + tx, y - 40, 12, 40);
      for (var b = 0; b < 3; b++) ctx.fillRect(x + tx + b * 4.5, y - 44, 3, 5);
    });
    ctx.fillStyle = "#E8CB98";
    ctx.fillRect(x - 10, y - 52, 20, 52);
    for (var c = 0; c < 4; c++) ctx.fillRect(x - 10 + c * 5.6, y - 57, 3.4, 6);
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(x, y - 6, 5, Math.PI, 0);
    ctx.lineTo(x + 5, y);
    ctx.lineTo(x - 5, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x - 26, y - 30, 4, 5);
    ctx.fillRect(x + 22, y - 30, 4, 5);
    ctx.fillRect(x - 2, y - 40, 4, 6);
    // Little dots of wet sand, like it was shaped by hand.
    [[-20, -10], [14, -14], [-4, -24], [24, -6]].forEach(function (d) { circle(ctx, x + d[0], y + d[1], 1.3, shade); });
    // The flag.
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y - 57);
    ctx.lineTo(x, y - 76);
    ctx.stroke();
    var wave = Math.sin(clock * 4) * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y - 76);
    ctx.quadraticCurveTo(x + 7, y - 74 + wave, x + 13, y - 71);
    ctx.quadraticCurveTo(x + 7, y - 68 - wave, x, y - 66);
    ctx.closePath();
    ctx.fillStyle = C.terracotta;
    ctx.fill();
  }

  // The smooth sand, the bucket and the shovel, and the sandcastle if there is one.
  function drawCastleSpot(ctx) {
    ellipse(ctx, CASTLE.x, CASTLE.y, CASTLE.r, CASTLE.r * 0.6, K.sandLight);
    ctx.strokeStyle = K.sandDark;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(CASTLE.x, CASTLE.y, CASTLE.r, CASTLE.r * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    drawBucket(ctx, CASTLE.x - 44, CASTLE.y + 6);
    if (castle) drawSandcastle(ctx);
  }

  // ---------- Shells ----------

  // A shell: a pink fan with lines, and a little base.
  function drawShell(ctx, s) {
    ellipse(ctx, s.x, s.y + 3, 10, 3.5, "rgba(74, 52, 40, 0.18)");
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.turn);
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.arc(0, 2, 11, Math.PI * 1.1, Math.PI * 1.9);
    ctx.closePath();
    ctx.fillStyle = "#F4C6C0";
    ctx.fill();
    ctx.strokeStyle = "#D98A80";
    ctx.lineWidth = 1.1;
    for (var i = 0; i < 5; i++) {
      var a = Math.PI * (1.15 + i * 0.15);
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(Math.cos(a) * 10, 2 + Math.sin(a) * 10);
      ctx.stroke();
    }
    fillRound(ctx, -3, 0, 6, 4, 2, "#D98A80");
    ctx.restore();
  }

  // A starfish: five soft orange arms with little dots.
  function drawStarfish(ctx, s) {
    ellipse(ctx, s.x, s.y + 3, 11, 3.5, "rgba(74, 52, 40, 0.18)");
    ctx.save();
    ctx.translate(s.x, s.y - 4);
    ctx.rotate(s.turn);
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4.5 : 11;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = "#F09A5E";
    ctx.fill();
    ctx.strokeStyle = "#D2733E";
    ctx.lineWidth = 1;
    ctx.stroke();
    for (var d = 0; d < 5; d++) {
      var b = -Math.PI / 2 + d * Math.PI * 2 / 5;
      circle(ctx, Math.cos(b) * 5.5, Math.sin(b) * 5.5, 1.1, "#FBD3B0");
    }
    ctx.restore();
  }

  function drawShellHighlight(ctx, s) {
    ctx.save();
    ctx.shadowColor = C.cream;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = C.sage;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y - 3, 19, 15, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ---------- Duck drawing ----------

  // A duck seen from above and a little from the side: a round body, a head with an orange beak and a dark eye.
  // On the water little ripples follow it; on the sand its orange feet show. Asleep, its head rests on its back.
  function drawDuck(ctx, d) {
    var k = d.little ? 0.62 : 1;
    var bob = d.swim ? Math.sin(clock * 2.5 + d.x * 0.05) * 1 : 0;
    ctx.save();
    ctx.translate(d.x, d.y + bob);
    ctx.scale(d.dir * k, k);
    if (d.swim) {
      ctx.strokeStyle = "rgba(255, 253, 248, 0.6)";
      ctx.lineWidth = 1.5 / k;
      ctx.beginPath();
      ctx.moveTo(-14, 2);
      ctx.lineTo(-26, -2);
      ctx.moveTo(-14, 5);
      ctx.lineTo(-26, 9);
      ctx.stroke();
      ellipse(ctx, 0, 4, 17, 5, "rgba(40, 80, 110, 0.2)");
    } else {
      ellipse(ctx, 0, 6, 14, 4, "rgba(74, 52, 40, 0.2)");
      if (!d.sleep) {
        var step = Math.sin(clock * 10 + d.x) * 2;
        ellipse(ctx, -3 + step, 6, 3.5, 2, K.beak);
        ellipse(ctx, 4 - step, 6, 3.5, 2, K.beak);
      }
    }
    var body = d.little ? K.duckling : K.duck;
    ellipse(ctx, -2, -4, 15, 9, body);
    // The tail, a little point at the back, and the wing.
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.lineTo(-20, -11);
    ctx.lineTo(-13, -1);
    ctx.closePath();
    ctx.fillStyle = body;
    ctx.fill();
    ctx.strokeStyle = d.little ? "#D9B94E" : "#D9D2C4";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-3, -4, 8, 4.5, 0, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    if (d.sleep) {
      circle(ctx, 3, -9, 6.5, body);
      ctx.strokeStyle = C.darkBrown;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(5, -10, 1.8, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      circle(ctx, 10, -14, 6.5, body);
      ctx.beginPath();
      ctx.moveTo(15, -15);
      ctx.quadraticCurveTo(22, -14, 20, -11);
      ctx.lineTo(15, -11);
      ctx.closePath();
      ctx.fillStyle = K.beak;
      ctx.fill();
      circle(ctx, 12, -16, 1.4, C.darkBrown);
    }
    ctx.restore();
  }

  // A small "z" over the sleeping ducks, floating up and fading.
  function drawDuckZ(ctx) {
    var t = (clock * 0.4) % 1;
    ctx.save();
    ctx.globalAlpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
    ctx.font = "700 " + Math.round(10 + t * 4) + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 3;
    ctx.strokeStyle = C.cream;
    ctx.strokeText("z", NEST.x + 12 + t * 8, NEST.y - 22 - t * 18);
    ctx.fillStyle = C.darkBrown;
    ctx.fillText("z", NEST.x + 12 + t * 8, NEST.y - 22 - t * 18);
    ctx.restore();
  }

  // ---------- Pacífica's drawing ----------

  // Pacífica sitting on her rock: a turquoise tail with shining scales curled to her right with its fin moving,
  // long coral hair, a crown of little shells and fair skin. She breathes, blinks, waves and now and then combs her hair.
  function drawMermaid(ctx) {
    var x = ROCK.x - 4, y = ROCK.y - 12;
    var breath = 1 + Math.sin(clock * CONFIG.alive.breathe.speed) * CONFIG.alive.breathe.amount;
    var fin = Math.sin(clock * 2.2) * 0.35;
    var comb = (clock % 14) > 9 && (clock % 14) < 12.5 && mermaid.waving <= 0;
    var skin = "#F6D9C6";
    ctx.save();
    ctx.translate(x, y);
    // The tail: from the hips, curling down to the right into the water, with its fin.
    ctx.save();
    var tg = ctx.createLinearGradient(-6, 0, 44, 18);
    tg.addColorStop(0, K.tail);
    tg.addColorStop(1, "#2E9E9A");
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.quadraticCurveTo(-14, 10, 10, 12);
    ctx.quadraticCurveTo(30, 13, 38, 6);
    ctx.lineTo(40, 14);
    ctx.quadraticCurveTo(26, 24, 6, 20);
    ctx.quadraticCurveTo(-20, 16, -14, -8);
    ctx.closePath();
    ctx.fill();
    // Scales that shine one after another.
    for (var i = 0; i < 7; i++) {
      var sx = -6 + i * 6.5, sy = 13 + Math.sin(i) * 1.5;
      var shine = 0.35 + 0.65 * Math.max(0, Math.sin(clock * 3 - i * 0.8));
      ctx.globalAlpha = shine;
      ctx.strokeStyle = K.tailLight;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // The fin, waving.
    ctx.translate(39, 10);
    ctx.rotate(fin);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(12, -14, 18, -10);
    ctx.quadraticCurveTo(10, -2, 12, 0);
    ctx.quadraticCurveTo(10, 2, 18, 10);
    ctx.quadraticCurveTo(12, 14, 0, 0);
    ctx.fillStyle = K.tailLight;
    ctx.fill();
    ctx.strokeStyle = K.tail;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.scale(1, breath);
    // The hair behind her, long down to her hips.
    ctx.beginPath();
    ctx.moveTo(-14, -46);
    ctx.quadraticCurveTo(-22, -20, -16, -4 + Math.sin(clock * 1.5) * 2);
    ctx.lineTo(14, -4 + Math.sin(clock * 1.5 + 1) * 2);
    ctx.quadraticCurveTo(22, -20, 14, -46);
    ctx.closePath();
    ctx.fillStyle = K.hairDark;
    ctx.fill();
    // The body, with a top of two little shells.
    fillRound(ctx, -9, -30, 18, 24, 8, skin);
    ellipse(ctx, -4, -24, 4.5, 3.5, "#C9B3E6");
    ellipse(ctx, 4, -24, 4.5, 3.5, "#C9B3E6");
    // The arms resting on her lap (the raised ones are drawn over the hair, at the end).
    var wave = mermaid.waving > 0 ? Math.sin(clock * 12) * 0.35 : 0;
    ctx.strokeStyle = skin;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    if (mermaid.waving <= 0) {
      ctx.beginPath();
      ctx.moveTo(9, -26);
      ctx.quadraticCurveTo(14, -16, 10, -9);
      ctx.stroke();
    }
    if (!comb) {
      ctx.beginPath();
      ctx.moveTo(-9, -26);
      ctx.quadraticCurveTo(-14, -16, -10, -9);
      ctx.stroke();
    }
    // The head: hair on top and down the sides, the face, the crown of shells.
    circle(ctx, 0, -42, 11, skin);
    ctx.fillStyle = K.hair;
    ctx.beginPath();
    ctx.arc(0, -43, 12, Math.PI * 1.02, Math.PI * 1.98);
    ctx.quadraticCurveTo(6, -46, 0, -44);
    ctx.quadraticCurveTo(-6, -46, -12, -42);
    ctx.closePath();
    ctx.fill();
    fillRound(ctx, -14, -44, 5, 26, 2.5, K.hair);
    fillRound(ctx, 9, -44, 5, 26, 2.5, K.hair);
    // The eyes blink; the mouth opens a little while she sings.
    if (mermaid.blink > 0) {
      ctx.strokeStyle = C.darkBrown;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(-6, -41);
      ctx.lineTo(-2, -41);
      ctx.moveTo(2, -41);
      ctx.lineTo(6, -41);
      ctx.stroke();
    } else {
      circle(ctx, -4, -41, 1.8, C.darkBrown);
      circle(ctx, 4, -41, 1.8, C.darkBrown);
      circle(ctx, -3.4, -41.7, 0.6, C.white);
      circle(ctx, 4.6, -41.7, 0.6, C.white);
    }
    ellipse(ctx, -7, -37, 2.2, 1.3, "rgba(240, 138, 110, 0.45)");
    ellipse(ctx, 7, -37, 2.2, 1.3, "rgba(240, 138, 110, 0.45)");
    if (mermaid.singing > 0) {
      ellipse(ctx, 0, -35.5, 1.6, 2 + Math.abs(Math.sin(clock * 6)) * 0.8, "#A04E36");
    } else {
      ctx.strokeStyle = "#A04E36";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, -37, 2.4, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
    [[-7, -53, "#F4C6C0"], [0, -56, C.white], [7, -53, "#F4C6C0"]].forEach(function (s) {
      ctx.beginPath();
      ctx.moveTo(s[0], s[1] + 4);
      ctx.arc(s[0], s[1] + 4, 4, Math.PI * 1.15, Math.PI * 1.85);
      ctx.closePath();
      ctx.fillStyle = s[2];
      ctx.fill();
      ctx.strokeStyle = "#D98A80";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });
    // The right arm waves high while she waves; the left one goes up to comb her hair with a little comb of shell.
    ctx.strokeStyle = skin;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    if (mermaid.waving > 0) {
      ctx.save();
      ctx.translate(9, -26);
      ctx.rotate(-0.75 + wave);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(19, 0);
      ctx.stroke();
      circle(ctx, 21, 0, 3.8, skin);
      ctx.restore();
    }
    if (comb) {
      ctx.save();
      ctx.translate(-9, -26);
      ctx.rotate(0.75 + Math.sin(clock * 5) * 0.25);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-19, 0);
      ctx.stroke();
      fillRound(ctx, -27, -4, 7, 9, 2, "#F4C6C0");
      ctx.restore();
    }
    ctx.restore();
  }

  // At night, only little bubbles come up from the water by the rock.
  function drawBubbles(ctx) {
    for (var i = 0; i < 5; i++) {
      var t = (clock * 0.5 + i / 5) % 1;
      var bx = ROCK.x + 34 + Math.sin(t * 8 + i) * 4 + (i % 2) * 8, by = ROCK.y + 14 - t * 26;
      ctx.save();
      ctx.globalAlpha = (t < 0.15 ? t / 0.15 : 1 - t) * 0.8;
      ctx.strokeStyle = C.waterLight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bx, by, 2.5 + (i % 3) * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      circle(ctx, bx - 1, by - 1, 0.9, C.white);
      ctx.restore();
    }
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
    Weather.drawSnowyGrass(ctx);
    drawWater(ctx);
    drawTrail(ctx);
    if (hover === "trail") drawGlow(ctx, trailBox());
    drawRock(ctx);
    if (isMermaidUp()) {
      if (hover === "mermaid") drawGlow(ctx, mermaidBox());
      drawMermaid(ctx);
    }
    drawPier(ctx);
    if (hover === "castle") drawGlow(ctx, { x: CASTLE.x - CASTLE.r, y: CASTLE.y - CASTLE.r - (castle ? 40 : 0), w: CASTLE.r * 2, h: CASTLE.r * 1.6 + (castle ? 40 : 0) });
    drawCastleSpot(ctx);
    CHAIRS.forEach(function (c, i) {
      if (hover === "chair" + i) drawGlow(ctx, c);
      drawChair(ctx, c);
    });
    drawUmbrella(ctx);
    shells.forEach(function (s) {
      if (s === hover) drawShellHighlight(ctx, s);
      if (s.kind === "shell") drawShell(ctx, s);
      else drawStarfish(ctx, s);
    });
    // Whoever is lower is drawn last; on the way, the mother goes over the ducklings behind her.
    ducks().map(function (d, i) { return { d: d, k: d.sleep ? d.y : -i }; }).sort(function (a, b) { return a.k - b.k; })
      .forEach(function (one) { drawDuck(ctx, one.d); });
    ctx.restore();
  }

  // The sign, drawn over the night tint like the signs of the city.
  var signMeasured = null;

  function signBox() {
    return signMeasured || { x: SIGN.x - 60, y: SIGN.y - 20, w: 120, h: 40 };
  }

  function drawLabels(ctx) {
    ctx.save();
    ctx.font = "700 " + SIGN.size + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var w = ctx.measureText(SIGN.text).width + SIGN.size * 1.2, h = SIGN.size * 1.7;
    signMeasured = { x: SIGN.x - w / 2, y: SIGN.y - h / 2, w: w, h: h };
    withShadow(ctx, function () { fillRound(ctx, SIGN.x - w / 2, SIGN.y - h / 2, w, h, h / 2, C.darkBrown); });
    ctx.fillStyle = C.cream;
    ctx.fillText(SIGN.text, SIGN.x, SIGN.y + 1);
    ctx.restore();
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
    var ring = (clock * 12) % 16;
    ctx.globalAlpha = 1 - ring / 16;
    ctx.strokeStyle = C.waterLight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(bob.x, bob.y + 3, 6 + ring, (6 + ring) * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    circle(ctx, bob.x, bob.y, 4.5, C.terracotta);
    ctx.beginPath();
    ctx.arc(bob.x, bob.y, 4.5, Math.PI, 0);
    ctx.fillStyle = C.white;
    ctx.fill();
    ctx.restore();
  }

  // After the night tint, before the characters: the rods of whoever is fishing, Pacífica's notes and her 👋,
  // and at night her bubbles and the "z" of the sleeping ducks, so they are seen in the dark.
  function drawTop(ctx) {
    if (!isMermaidUp()) drawBubbles(ctx);
    if (Time.darkness() > 0.55) drawDuckZ(ctx);
    Object.keys(current).forEach(function (id) {
      var a = current[id];
      if (a.kind === "fish" && a.phase === "doing") drawRod(ctx, a);
    });
    mermaid.notes.forEach(function (n) {
      var t = n.age / 2.6;
      ctx.save();
      ctx.globalAlpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      ctx.font = "700 " + Math.round(18 + t * 6) + "px " + CONFIG.fontFamily;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var nx = n.x + n.side * 26 * t + Math.sin(t * 9 + n.side * 3) * 6, ny = n.y - t * 70;
      ctx.lineWidth = 3;
      ctx.strokeStyle = C.cream;
      ctx.strokeText(n.glyph, nx, ny);
      ctx.fillStyle = n.color;
      ctx.fillText(n.glyph, nx, ny);
      ctx.restore();
    });
    if (mermaid.waving > 0 && isMermaidUp()) {
      ctx.save();
      ctx.font = "22px " + CONFIG.fontFamily;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("👋", ROCK.x + 26, ROCK.y - 82 + Math.sin(clock * 6) * 2);
      ctx.restore();
    }
  }

  // The floating texts after a catch or a shell, over everything (characters too).
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

  // The id of the word for what is at a spot of the Lago, or null. Small things win over big ones.
  // While a catch floats up, its text says what it is ("Trucha · trout").
  function wordAt(x, y) {
    if (x < 0 || x > W || y < 0 || y > H) return null;
    for (var i = pops.length - 1; i >= 0; i--) {
      var p = pops[i];
      if (p.word && Math.abs(x - p.x) < 70 && Math.abs(y - (p.y - p.age / K.popTime * 40)) < 16) return p.word;
    }
    var s = shellAt(x, y);
    if (s) return s.kind;
    var duck = duckAt(x, y);
    if (duck) return duck.little ? "duckling" : "duck";
    if (mermaidAt(x, y)) return "pacifica";
    if (inOval(x, y, ROCK, 6)) return "rock";
    if (castleAt(x, y)) return castle ? "sandcastle" : "sand";
    if (chairAt(x, y) >= 0) return "beachChair";
    if (near(x, y, UMBRELLA.x, UMBRELLA.y, UMBRELLA.r) || inBox(x, y, UMBRELLA.pole)) return "umbrella";
    if (inBox(x, y, PIER)) return "pier";
    if (inBox(x, y, trailBox()) || inBox(x, y, signBox())) return "lake";
    if (inOval(x, y, WATER, 0)) return "lake";
    if (inOval(x, y, SAND, 0) || inOval(x, y, WATER, 28)) return "beach";
    return null;
  }

  // ---------- Saving ----------

  function get() {
    return {
      shells: shells.map(function (s) { return { kind: s.kind, x: s.x, y: s.y }; }),
      regrow: regrow.slice(),
      castle: castle ? { day: castle.day } : null
    };
  }

  // Used when loading a saved game. Anything strange is left out, and there are always 3 to 5 shells
  // (counting the ones about to appear). An old saved game keeps the ones of a new game, and no sandcastle.
  function set(saved) {
    wasRaining = Weather.isRaining();
    if (!saved || typeof saved !== "object" || !Array.isArray(saved.shells)) return;
    shells = saved.shells.filter(function (s) {
      return s && KINDS.some(function (k) { return k.id === s.kind; }) &&
        typeof s.x === "number" && typeof s.y === "number" && isShellSpot(s.x, s.y);
    }).slice(0, K.max).map(function (s) {
      return { kind: s.kind, x: s.x, y: s.y, turn: between(-0.6, 0.6) };
    });
    regrow = (Array.isArray(saved.regrow) ? saved.regrow : []).filter(function (r) {
      return typeof r === "number" && isFinite(r);
    }).map(function (r) {
      return Math.max(0.1, Math.min(K.regrow.max, r));
    }).slice(0, K.max - shells.length);
    while (shells.length + regrow.length < K.min) regrow.push(between(K.regrow.min, K.regrow.max));
    var c = saved.castle;
    castle = c && typeof c === "object" && c.day === weatherDay() ? { day: c.day } : null;
  }

  // A new game starts with 3 to 5 shells.
  (function () {
    var n = Math.floor(between(K.min, K.max + 1));
    for (var i = 0; i < n; i++) {
      if (!spawn()) regrow.push(between(K.regrow.min, K.regrow.max));
    }
  })();

  return {
    edge: K.edge,
    foot: K.foot,
    isWalkable: isWalkable,
    isSolid: isSolid,
    shellAt: shellAt,
    usableAt: usableAt,
    setHover: setHover,
    tapShell: tapShell,
    tapWater: tapWater,
    tapChair: tapChair,
    tapCastle: tapCastle,
    tapMermaid: tapMermaid,
    cancel: cancel,
    isActive: isActive,
    update: update,
    bubbleFor: bubbleFor,
    poseFor: poseFor,
    walkers: walkers,
    draw: draw,
    drawLabels: drawLabels,
    drawTop: drawTop,
    drawPops: drawPops,
    wordAt: wordAt,
    get: get,
    set: set,
    // Modo decorar moves nothing in the Lago (js/decorate.js).
    movableAt: function () { return null; },
    canTurn: function () { return false; }
  };
})();
