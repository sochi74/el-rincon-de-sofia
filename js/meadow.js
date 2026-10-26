// The Pradera de flores: a map above the city, as big as it, seen from above. Light grass with soft hills, little flowers
// drawn all over, its trail at the bottom that goes back to the city (js/valleymap.js has the other end) and its sign.
// 🌼 Wild flowers to gather, like in the forest: Margaritas, Amapolas and Lavanda go into the backpack (js/inventory.js).
// 🌳 A big tree with a wooden swing (Diversión), 🧺 a picnic blanket with a basket to sit on and eat a dish of the backpack,
// and 🐝 a beehive hanging from a smaller tree, with bees flying among the flowers by day (only decoration: at dusk they go
// back to the hive, and at night they are not seen).
// 🌻 A field of tall sunflowers at the bottom left (the gift of 45 ⭐): only decoration. They sway with the wind, look up by
// day and bow their heads a little at night; with snow their leaves turn white.
// The trees, the beehive, the swing, the basket and the sunflower field are solid (js/path.js); the flowers are not.
// Day and night and the weather of the day show here too (js/weather.js), without puddles or snowman.
// Modo decorar moves nothing here. The neighbors never come, and the shiny coins never appear here. Pausa freezes it all.
var Meadow = (function () {
  var C = CONFIG.colors;
  var K = CONFIG.meadow;
  var W = CONFIG.world.width, H = CONFIG.world.height;
  // How close a character's feet may get to the edges of the map (as in the city) and to solid things.
  var MARGIN = { side: 30, top: 130, bottom: 20 };
  var CLEAR = 14;

  // The trail at the bottom: its middle, from where it starts down to the bottom edge.
  var TRAIL = { x: K.edge.x, top: 548, half: 18 };
  // The big tree with the swing: its round crown and its trunk. The swing hangs from a branch to its right:
  // the ropes from "top", the seat at "seat" (its middle), "half" wide on each side. "spot" is where a character stands
  // to use it and "sit" where its feet go while it swings.
  var BIG_TREE = { x: 250, y: 250, r: 76, trunk: { x: 236, y: 286, w: 28, h: 60 } };
  var SWING = { x: 335, top: 289, seat: 380, half: 22, spot: { x: 335, y: 432 }, sit: { x: 335, y: 404 } };
  var SWING_BOX = { x: 306, y: 368, w: 58, h: 26 };
  // The smaller tree with the beehive hanging from a branch.
  var SMALL_TREE = { x: 845, y: 245, r: 48, trunk: { x: 834, y: 270, w: 22, h: 44 } };
  var HIVE = { x: 884, y: 284, w: 30, h: 38 };
  var HIVE_DOOR = { x: 899, y: 312 };
  // The picnic blanket (characters sit on it), its basket, and the spot where one sits.
  var BLANKET = { x: 520, y: 430, w: 140, h: 92 };
  var BASKET = { x: 626, y: 434, w: 40, h: 30 };
  var SEAT = { x: 575, y: 494 };
  // The sunflower field: where each stem meets the grass and how tall it is, and the box the whole field takes.
  var SUNFLOWERS = [
    { x: 112, y: 596, h: 78 }, { x: 152, y: 586, h: 92 }, { x: 192, y: 600, h: 84 }, { x: 232, y: 588, h: 94 },
    { x: 270, y: 598, h: 80 }, { x: 132, y: 636, h: 86 }, { x: 174, y: 632, h: 96 }, { x: 216, y: 640, h: 82 },
    { x: 256, y: 634, h: 90 }
  ];
  var FIELD = { x: 92, y: 500, w: 196, h: 150 };
  // The sign of the place.
  var SIGN = { text: "Pradera de flores", x: 500, y: 92, size: 24 };
  // Soft hills: middle, size, and whether they are lighter or darker than the grass.
  var HILLS = [
    { x: 150, y: 600, rx: 220, ry: 90, light: true },
    { x: 480, y: 215, rx: 230, ry: 62, light: false },
    { x: 890, y: 590, rx: 190, ry: 105, light: true },
    { x: 110, y: 170, rx: 140, ry: 55, light: false },
    { x: 760, y: 380, rx: 150, ry: 56, light: true },
    { x: 380, y: 660, rx: 160, ry: 50, light: false }
  ];
  // Patches of little flowers where the bees fly.
  var PATCHES = [
    { x: 420, y: 560 }, { x: 760, y: 470 }, { x: 170, y: 450 }, { x: 905, y: 420 },
    { x: 470, y: 330 }, { x: 260, y: 620 }, { x: 640, y: 230 }
  ];
  var DECOR_COLORS = ["#FFFDF8", "#F2A9B8", "#F5D76E", "#C9B3E6", "#F7C9A8"];

  // The wild flowers to gather, how often each one appears (out of 100), and what each one says when gathered.
  var KINDS = [
    { id: "daisy", chance: 45 },
    { id: "poppy", chance: 35 },
    { id: "lavender", chance: 20 }
  ];

  var ACTIONS = { gather: "Recolectando 🧺", swing: "Columpiándose 🌳", sit: "De picnic 🧺", eat: "Comiendo 🍽️" };

  // Wild flowers right now, as { kind, x, y, phase }, and the seconds until each new one appears.
  var flowers = [];
  var regrow = [];
  // What each character is doing here, by id:
  // { sim, kind: "gather" | "swing" | "sit" | "eat", flower, dish, phase: "walking" | "doing" | "busy", elapsed }
  var current = {};
  // Texts floating up after gathering, as { x, y, text, age }.
  var pops = [];
  // What is under the mouse: a wild flower, or "swing", "picnic" or "trail".
  var hover = null;
  // Seconds of play here so far: the swing, the wind and the bees stop with Pausa.
  var clock = 0;

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

  // True if the spot is inside the map (used when loading a saved game).
  function isWalkable(x, y) {
    return x >= MARGIN.side && x <= W - MARGIN.side && y >= MARGIN.top && y <= H - MARGIN.bottom;
  }

  // True if a character cannot stand here: off the map, or on a tree, the beehive, the swing, the basket or the sunflower
  // field. Used by js/path.js.
  function isSolid(x, y) {
    if (!isWalkable(x, y)) return true;
    if (inBox(x, y, grow(FIELD, 8))) return true;
    if (near(x, y, BIG_TREE.x, BIG_TREE.y, BIG_TREE.r * 0.6 + CLEAR) || inBox(x, y, grow(BIG_TREE.trunk, CLEAR))) return true;
    if (near(x, y, SMALL_TREE.x, SMALL_TREE.y, SMALL_TREE.r * 0.6 + CLEAR) || inBox(x, y, grow(SMALL_TREE.trunk, CLEAR))) return true;
    if (inBox(x, y, grow(HIVE, 8)) || inBox(x, y, grow(SWING_BOX, 8))) return true;
    return inBox(x, y, grow(BASKET, 8));
  }

  function onTrail(x, y, by) {
    return Math.abs(x - TRAIL.x) <= TRAIL.half + by && y >= TRAIL.top - by;
  }

  // True if nothing is drawn on this spot of the grass (for the little flowers and the wild ones), "by" away from it all.
  function isFreeGrass(x, y, by) {
    if (onTrail(x, y, by) || inBox(x, y, grow(BLANKET, by)) || inBox(x, y, grow(BASKET, by))) return false;
    if (inBox(x, y, grow(FIELD, by))) return false;
    if (near(x, y, BIG_TREE.x, BIG_TREE.y, BIG_TREE.r + by) || inBox(x, y, grow(BIG_TREE.trunk, by))) return false;
    if (near(x, y, SMALL_TREE.x, SMALL_TREE.y, SMALL_TREE.r + by) || inBox(x, y, grow(HIVE, by))) return false;
    if (inBox(x, y, grow({ x: SWING.x - SWING.half - 6, y: SWING.top, w: SWING.half * 2 + 12, h: SWING.spot.y - SWING.top }, by))) return false;
    return !inBox(x, y, grow(signBox(), by));
  }

  // ---------- Wild flowers ----------

  function pickKind() {
    var roll = Math.random() * 100;
    for (var i = 0; i < KINDS.length; i++) {
      roll -= KINDS[i].chance;
      if (roll < 0) return KINDS[i].id;
    }
    return KINDS[0].id;
  }

  // True if a wild flower may grow here: on open grass a character can stand by, off the trail, the blanket and the signs.
  function isFlowerSpot(x, y) {
    return x >= 60 && x <= W - 60 && y >= 180 && y <= H - 40 && !isSolid(x, y) && isFreeGrass(x, y, 22);
  }

  // A random free spot, away from the other wild flowers, or null.
  function randomSpot() {
    for (var i = 0; i < 60; i++) {
      var x = between(60, W - 60), y = between(180, H - 40);
      if (!isFlowerSpot(x, y)) continue;
      var tooClose = flowers.some(function (f) { return Math.abs(f.x - x) < 50 && Math.abs(f.y - y) < 50; });
      if (!tooClose) return { x: x, y: y };
    }
    return null;
  }

  function spawn() {
    var spot = randomSpot();
    if (!spot) return false;
    flowers.push({ kind: pickKind(), x: spot.x, y: spot.y, phase: Math.random() * Math.PI * 2 });
    return true;
  }

  // The wild flower at a spot of the Pradera, or null.
  function flowerAt(x, y) {
    for (var i = flowers.length - 1; i >= 0; i--) {
      var f = flowers[i];
      if (near(x, y, f.x, f.y - 10, 20)) return f;
    }
    return null;
  }

  // ---------- What can be tapped ----------

  function trailBox() {
    return { x: TRAIL.x - TRAIL.half - 10, y: TRAIL.top - 8, w: TRAIL.half * 2 + 20, h: H - TRAIL.top + 8 };
  }

  // The swing: the seat with its ropes, and the crown of its tree.
  function swingAt(x, y) {
    if (inBox(x, y, { x: SWING.x - SWING.half - 8, y: SWING.top - 8, w: SWING.half * 2 + 16, h: SWING.seat - SWING.top + 30 })) return true;
    return near(x, y, BIG_TREE.x, BIG_TREE.y, BIG_TREE.r) || inBox(x, y, BIG_TREE.trunk);
  }

  function picnicAt(x, y) {
    return inBox(x, y, BLANKET) || inBox(x, y, grow(BASKET, 4));
  }

  // "swing", "picnic" or "trail" for what can be used at a spot, or null (the wild flowers are apart: flowerAt).
  function usableAt(x, y) {
    if (inBox(x, y, trailBox())) return "trail";
    if (picnicAt(x, y)) return "picnic";
    if (swingAt(x, y)) return "swing";
    return null;
  }

  function setHover(what) {
    hover = what;
  }

  // ---------- Actions ----------

  // A tap on a wild flower: walk next to it, on the side the character comes from, and gather it.
  function tapFlower(sim, f) {
    var side = sim.x < f.x ? -1 : 1;
    current[sim.data.id] = { sim: sim, kind: "gather", flower: f, phase: "walking", elapsed: 0 };
    Sims.walkTo(sim, f.x + side * 30, f.y + 4);
  }

  // A tap on the swing: walk in front of it and swing.
  function tapSwing(sim) {
    current[sim.data.id] = { sim: sim, kind: "swing", phase: "walking", elapsed: 0 };
    Sims.walkTo(sim, SWING.spot.x, SWING.spot.y);
  }

  // A tap on the picnic blanket: a little menu with "Sentarse 🧺" and one line for each dish in the backpack.
  // The dish comes out of the backpack when it is picked (it goes back if the meal is stopped).
  function tapPicnic(sim, screenX, screenY) {
    var options = [{ id: "sit", text: "Sentarse 🧺" }];
    Cooking.RECIPES.forEach(function (r) {
      if (Inventory.count(r.id) === 0) return;
      var dish = Inventory.item(r.id);
      options.push({ id: r.id, text: "Comer " + dish.emoji + " " + dish.name });
    });
    UI.openPicnicMenu(screenX, screenY, options, function (pick) {
      if (Social.isInvolved(sim.data.id) || sim.place !== "meadow") return;
      cancel(sim.data.id);
      if (pick === "sit") {
        current[sim.data.id] = { sim: sim, kind: "sit", phase: "walking", elapsed: 0 };
      } else {
        if (!Inventory.take(pick, 1)) return;
        current[sim.data.id] = { sim: sim, kind: "eat", dish: pick, phase: "walking", elapsed: 0 };
      }
      Sims.walkTo(sim, SEAT.x, SEAT.y);
    });
  }

  // Stop what a character is doing here; a dish not eaten yet goes back into the backpack. True if it was doing something.
  function cancel(id) {
    var a = current[id];
    if (!a) return false;
    if (a.kind === "eat" && a.phase !== "busy") Inventory.add(a.dish, 1);
    delete current[id];
    return true;
  }

  function isActive(id) {
    return !!current[id];
  }

  // True if someone else is on the swing, or on the blanket, or gathering this same flower.
  function isTaken(a, id) {
    return Object.keys(current).some(function (other) {
      var b = current[other];
      if (other === id || b.phase !== "doing") return false;
      if (a.kind === "gather") return b.kind === "gather" && b.flower === a.flower;
      if (a.kind === "swing") return b.kind === "swing";
      return b.kind === "sit" || b.kind === "eat";
    });
  }

  function timeFor(a) {
    if (a.kind === "gather") return K.gatherTime;
    if (a.kind === "swing") return K.swingTime;
    if (a.kind === "sit") return K.sitTime;
    return K.eatTime;
  }

  // Floating text over the head of a character.
  function popOver(sim, text) {
    pops.push({ x: sim.x, y: sim.y - 78 * CONFIG.characterScale - CONFIG.moodStar.room - 30, text: text, age: 0 });
  }

  // The wild flower goes into the backpack, and a new one will grow later.
  function finishGather(a) {
    flowers.splice(flowers.indexOf(a.flower), 1);
    if (hover === a.flower) hover = null;
    Inventory.add(a.flower.kind, 1);
    popOver(a.sim, "+1 " + Inventory.item(a.flower.kind).emoji);
    regrow.push(between(K.regrow.min, K.regrow.max));
  }

  // The dish does what it always does, and the picnic gives some Diversión too.
  function finishEating(a) {
    var values = Needs.get(a.sim.data.id);
    var effect = Cooking.recipe(a.dish).effect;
    Object.keys(effect).forEach(function (need) {
      values[need] = Math.min(100, values[need] + effect[need]);
    });
    values.fun = Math.min(100, values.fun + K.eatFun);
    Goals.notify("eat", a.sim.data.id, a.dish);
  }

  // Swinging and sitting on the blanket raise Diversión little by little.
  var GAINS = { swing: K.swingFun, sit: K.sitFun };

  function update(dt) {
    var paused = Needs.isPaused();
    if (!paused) clock += dt;
    pops.forEach(function (p) { p.age += dt; });
    pops = pops.filter(function (p) { return p.age < K.popTime; });

    Object.keys(current).forEach(function (id) {
      var a = current[id];
      // Going back to the city or starting to socialize ends it.
      if (a.sim.place !== "meadow" || Social.isInvolved(id)) {
        cancel(id);
        return;
      }
      if (a.phase === "walking") {
        if (a.sim.path.length > 0) return;
        if (a.kind === "gather" && flowers.indexOf(a.flower) < 0) {
          delete current[id];
          return;
        }
        a.elapsed = 0;
        if (isTaken(a, id)) {
          if (a.kind === "eat") Inventory.add(a.dish, 1);
          a.phase = "busy";
          return;
        }
        a.phase = "doing";
        if (a.kind === "gather") a.sim.facing = a.flower.x < a.sim.x ? "left" : "right";
        else a.sim.facing = "front";
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
      if (GAINS[a.kind]) {
        var values = Needs.get(id);
        values.fun = Math.min(100, values.fun + GAINS[a.kind] / timeFor(a) * step);
      }
      if (a.elapsed < timeFor(a)) return;
      delete current[id];
      if (a.kind === "gather" && flowers.indexOf(a.flower) >= 0) finishGather(a);
      if (a.kind === "eat") finishEating(a);
    });

    // New wild flowers only appear while the game runs.
    if (paused) return;
    regrow = regrow.filter(function (left) { return left > 0; });
    for (var i = 0; i < regrow.length; i++) {
      regrow[i] -= dt;
      if (regrow[i] > 0) continue;
      if (flowers.length >= K.max) {
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

  // How far the swing is from where it rests, going back and forth while someone swings.
  function swingOffset() {
    return Math.sin(clock * 3.2) * 9;
  }

  function isSwinging() {
    return Object.keys(current).some(function (id) {
      return current[id].kind === "swing" && current[id].phase === "doing";
    });
  }

  // How a character is drawn while it does something here (js/sims.js): sitting on the swing as it goes back and forth,
  // or sitting on the blanket looking to the front. Null while it gathers or walks.
  function poseFor(id) {
    var a = current[id];
    if (!a || a.phase !== "doing") return null;
    if (a.kind === "swing") return { kind: "swing", x: SWING.sit.x, y: SWING.sit.y + swingOffset() };
    if (a.kind === "sit" || a.kind === "eat") return { kind: "floor", x: SEAT.x, y: SEAT.y, look: { x: SEAT.x, y: SEAT.y + 60 } };
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

  function drawGrass(ctx) {
    ctx.fillStyle = C.cityGrassLight;
    ctx.fillRect(0, 0, W, H);
    // Soft hills: a rounded shape lighter or darker than the grass, with a little light on top.
    HILLS.forEach(function (h) {
      ctx.save();
      ctx.globalAlpha = 0.75;
      ellipse(ctx, h.x + 8, h.y + 10, h.rx, h.ry, "rgba(111, 148, 96, 0.25)");
      ellipse(ctx, h.x, h.y, h.rx, h.ry, h.light ? "#D5E7B5" : C.cityGrass);
      ctx.globalAlpha = 0.6;
      ellipse(ctx, h.x - h.rx * 0.2, h.y - h.ry * 0.3, h.rx * 0.6, h.ry * 0.45, h.light ? "#E3F0C9" : "#B7D196");
      ctx.restore();
    });
    // Little tufts, like in the city.
    for (var gy = 20; gy < H; gy += 46) {
      for (var gx = 20; gx < W; gx += 52) {
        var x = gx + Math.sin(gx * 12.9898 + gy * 78.233) * 18;
        var y = gy + Math.cos(gx * 4.1414 + gy * 9.731) * 14;
        ctx.fillStyle = (gx + gy) % 3 === 0 ? C.cityGrassDark : C.cityGrass;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(x, y, 7, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // The little flowers drawn all over the grass, and thicker in the patches where the bees fly. Worked out once.
  var DECOR = (function () {
    var out = [];
    for (var i = 0; i < 170; i++) {
      var x = 20 + hash(i, 1) * (W - 40), y = 20 + hash(i, 2) * (H - 40);
      out.push({ x: x, y: y, color: DECOR_COLORS[Math.floor(hash(i, 3) * DECOR_COLORS.length)], r: 2 + hash(i, 4) * 1.2 });
    }
    PATCHES.forEach(function (p, n) {
      for (var j = 0; j < 9; j++) {
        var a = hash(n * 10 + j, 5) * Math.PI * 2, d = 6 + hash(n * 10 + j, 6) * 26;
        out.push({ x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d * 0.6,
          color: DECOR_COLORS[Math.floor(hash(n * 10 + j, 7) * DECOR_COLORS.length)], r: 2.6 + hash(n * 10 + j, 8) * 1.2 });
      }
    });
    return out;
  })();
  var decorKept = null;

  function drawDecorFlowers(ctx) {
    // The sign is measured the first time it is drawn, so the little flowers stay off it from then on.
    if (!decorKept) decorKept = DECOR.filter(function (f) { return isFreeGrass(f.x, f.y, 6); });
    decorKept.forEach(function (f) {
      for (var p = 0; p < 5; p++) {
        var a = p * Math.PI * 2 / 5;
        circle(ctx, f.x + Math.cos(a) * f.r, f.y + Math.sin(a) * f.r * 0.8, f.r * 0.75, f.color);
      }
      circle(ctx, f.x, f.y, f.r * 0.55, "#E8B33C");
    });
  }

  // The dirt trail, from the bottom edge up into the grass, with a few pebbles.
  function drawTrail(ctx) {
    ctx.save();
    ctx.fillStyle = K.dirt;
    ctx.beginPath();
    ctx.moveTo(TRAIL.x - TRAIL.half - 4, H + 4);
    for (var y = H; y >= TRAIL.top + 14; y -= 20) ctx.lineTo(TRAIL.x - TRAIL.half + Math.sin(y * 0.07) * 3, y);
    ctx.quadraticCurveTo(TRAIL.x, TRAIL.top - 10, TRAIL.x + TRAIL.half, TRAIL.top + 14);
    for (var y2 = TRAIL.top + 14; y2 <= H; y2 += 20) ctx.lineTo(TRAIL.x + TRAIL.half + Math.sin(y2 * 0.05 + 1) * 3, y2);
    ctx.lineTo(TRAIL.x + TRAIL.half + 4, H + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = K.dirtLight;
    ctx.beginPath();
    ctx.ellipse(TRAIL.x - 3, (TRAIL.top + H) / 2 + 10, TRAIL.half * 0.45, (H - TRAIL.top) / 2 - 16, 0, 0, Math.PI * 2);
    ctx.fill();
    [[-8, 580], [7, 610], [-4, 650], [9, 690], [-10, 705]].forEach(function (p) {
      ellipse(ctx, TRAIL.x + p[0], p[1], 3, 2, "#A98760");
    });
    ctx.restore();
  }

  function withShadow(ctx, fn) {
    ctx.save();
    ctx.shadowColor = "rgba(74, 52, 40, 0.25)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    fn();
    ctx.restore();
  }

  // The picnic blanket in terracotta and cream squares, with its basket.
  function drawPicnic(ctx) {
    var b = BLANKET, n = 7, m = 5, cw = b.w / n, ch = b.h / m;
    withShadow(ctx, function () { fillRound(ctx, b.x, b.y, b.w, b.h, 6, C.cream); });
    ctx.save();
    roundRect(ctx, b.x, b.y, b.w, b.h, 6);
    ctx.clip();
    ctx.fillStyle = "rgba(200, 102, 74, 0.55)";
    for (var i = 0; i < n; i += 2) ctx.fillRect(b.x + i * cw, b.y, cw, b.h);
    for (var j = 0; j < m; j += 2) ctx.fillRect(b.x, b.y + j * ch, b.w, ch);
    ctx.restore();
    ctx.strokeStyle = C.terracotta;
    ctx.lineWidth = 2;
    roundRect(ctx, b.x, b.y, b.w, b.h, 6);
    ctx.stroke();
    // The basket: woven wood with a handle and a little cloth peeking out.
    var k = BASKET;
    withShadow(ctx, function () { fillRound(ctx, k.x, k.y + 8, k.w, k.h - 8, 6, C.wood); });
    ctx.strokeStyle = "#8A5A3A";
    ctx.lineWidth = 1.2;
    for (var r = 0; r < 3; r++) {
      ctx.beginPath();
      ctx.moveTo(k.x + 3, k.y + 13 + r * 6);
      ctx.lineTo(k.x + k.w - 3, k.y + 13 + r * 6);
      ctx.stroke();
    }
    fillRound(ctx, k.x + 4, k.y + 4, k.w - 8, 8, 4, C.cream);
    fillRound(ctx, k.x + 8, k.y + 5, 10, 5, 2.5, C.terracotta);
    ctx.strokeStyle = "#8A5A3A";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(k.x + k.w / 2, k.y + 10, k.w / 2 - 6, Math.PI, 0);
    ctx.stroke();
  }

  // A round tree like the ones of the city, with its trunk peeking out below; the crown sways with the wind.
  function drawTree(ctx, t, i) {
    var s = CONFIG.alive.sway;
    var sway = Math.sin(clock * (s.slow + (s.fast - s.slow) * i * 0.5) + i * 1.9) * s.amount * t.r / 34;
    ctx.fillStyle = "rgba(74, 52, 40, 0.22)";
    ctx.beginPath();
    ctx.ellipse(t.x + 6, t.trunk.y + t.trunk.h - 4, t.r * 0.9, t.r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    fillRound(ctx, t.trunk.x, t.trunk.y, t.trunk.w, t.trunk.h, 6, "#8A5A3A");
    fillRound(ctx, t.trunk.x + 4, t.trunk.y + 6, 5, t.trunk.h - 14, 2.5, "#A06B45");
    circle(ctx, t.x + sway * 0.6, t.y, t.r, C.cityGrassDark);
    circle(ctx, t.x - t.r * 0.25 + sway, t.y - t.r * 0.25, t.r * 0.62, C.sage);
    circle(ctx, t.x - t.r * 0.38 + sway * 1.3, t.y - t.r * 0.4, t.r * 0.22, C.cityGrassLight);
  }

  // The branch of the big tree, the two ropes and the wooden seat (when nobody sits on it; else js/sims.js draws it
  // under whoever swings).
  function drawSwing(ctx) {
    var seatY = SWING.seat + (isSwinging() ? swingOffset() : 0);
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "#7A4E32";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(BIG_TREE.x + 8, SWING.top + 10);
    ctx.quadraticCurveTo(SWING.x - 20, SWING.top - 4, SWING.x + SWING.half + 16, SWING.top - 6);
    ctx.stroke();
    ctx.strokeStyle = "#E3D2B0";
    ctx.lineWidth = 2.5;
    [-1, 1].forEach(function (side) {
      ctx.beginPath();
      ctx.moveTo(SWING.x + side * SWING.half, SWING.top - 2);
      ctx.lineTo(SWING.x + side * SWING.half, seatY);
      ctx.stroke();
    });
    ctx.restore();
    ellipse(ctx, SWING.x, SWING.sit.y + 4, 24, 6, "rgba(74, 52, 40, 0.2)");
    if (!isSwinging()) drawSeat(ctx, SWING.x, seatY, 1);
  }

  // A tall sunflower: a green stem with two leaves and a yellow face with a brown middle, swaying from where it meets the
  // grass. By day it looks up; at night it bows its head a little. With snow its leaves turn white.
  function drawSunflower(ctx, f, i, dark) {
    var sway = Math.sin(clock * 1.3 + i * 0.9) * 0.06;
    ctx.save();
    ctx.translate(f.x, f.y);
    ellipse(ctx, 4, 2, 12, 4, "rgba(74, 52, 40, 0.18)");
    ctx.rotate(sway);
    ctx.strokeStyle = "#5E8C3A";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(3, -f.h * 0.5, 0, -f.h);
    ctx.stroke();
    [[-1, 0.35], [1, 0.55]].forEach(function (l) {
      var leaf = function () {
        ctx.beginPath();
        ctx.ellipse(l[0] * 10, -f.h * l[1], 10, 4.5, l[0] * -0.5, 0, Math.PI * 2);
      };
      leaf();
      ctx.fillStyle = "#6FA34A";
      ctx.fill();
      Weather.roofSnow(ctx, leaf);
    });
    // The face, a little lower and flatter when it bows at night.
    ctx.translate(0, -f.h + dark * 5);
    ctx.rotate(dark * 0.25);
    ctx.scale(1, 1 - dark * 0.3);
    for (var p = 0; p < 12; p++) {
      var a = p * Math.PI * 2 / 12;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 11, Math.sin(a) * 11, 6.5, 3.2, a, 0, Math.PI * 2);
      ctx.fillStyle = p % 2 ? "#F5C93A" : "#F2B630";
      ctx.fill();
    }
    circle(ctx, 0, 0, 8.5, "#7A4E2A");
    for (var d = 0; d < 6; d++) circle(ctx, Math.cos(d) * 4.5, Math.sin(d * 1.7) * 4.5, 1.1, "#5A3A1E");
    ctx.restore();
  }

  function drawSunflowers(ctx) {
    var dark = Time.darkness();
    SUNFLOWERS.map(function (f, i) { return { f: f, i: i }; }).sort(function (a, b) { return a.f.y - b.f.y; })
      .forEach(function (one) { drawSunflower(ctx, one.f, one.i, dark); });
  }

  // The wooden seat of the swing, its middle at x, y ("k": how big, 1 in the Pradera).
  function drawSeat(ctx, x, y, k) {
    fillRound(ctx, x - 26 * k, y - 4 * k, 52 * k, 8 * k, 3 * k, C.wood);
    fillRound(ctx, x - 26 * k, y - 4 * k, 52 * k, 3 * k, 1.5 * k, C.woodLight);
  }

  // The beehive hanging from its branch: rounded rings of honey color with a dark little door.
  function drawHive(ctx) {
    var h = HIVE, cx = h.x + h.w / 2;
    ctx.strokeStyle = "#7A4E32";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, h.y - 16);
    ctx.lineTo(cx, h.y + 2);
    ctx.stroke();
    withShadow(ctx, function () { ellipse(ctx, cx, h.y + h.h / 2 + 2, h.w / 2, h.h / 2, K.honey); });
    [0.2, 0.42, 0.64, 0.84].forEach(function (t, i) {
      var w = h.w / 2 * (i === 0 || i === 3 ? 0.78 : 1);
      ellipse(ctx, cx, h.y + 2 + h.h * t, w, 4, i % 2 ? K.honey : "#EDC66A");
      ctx.strokeStyle = K.honeyDark;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, h.y + 2 + h.h * t, w, 4, 0, 0, Math.PI);
      ctx.stroke();
    });
    ellipse(ctx, HIVE_DOOR.x, HIVE_DOOR.y, 4.5, 3.5, C.darkBrown);
  }

  // ---------- Bees ----------

  function smooth(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  // Where each bee is: by day it hovers over a patch of flowers and every few seconds flies to another one;
  // at dusk it flies back into the hive, and at night it stays inside ("shown" is 0).
  function beeAt(i) {
    var t = clock / 7 + i * 0.37, k = Math.floor(t), u = t - k, n = PATCHES.length;
    var a = PATCHES[(i * 2 + k) % n], b = PATCHES[(i * 2 + k + 1) % n];
    var m = u < 0.7 ? 0 : smooth((u - 0.7) / 0.3);
    var wob = clock * 2.1 + i * 1.7;
    var x = a.x + (b.x - a.x) * m + Math.sin(wob) * 16;
    var y = a.y - 16 + (b.y - a.y) * m + Math.sin(clock * 3.3 + i) * 8;
    var out = 1 - smooth(Time.darkness() * 1.25);
    return {
      x: HIVE_DOOR.x + (x - HIVE_DOOR.x) * out,
      y: HIVE_DOOR.y + (y - HIVE_DOOR.y) * out,
      shown: Math.min(1, out * 4),
      dir: m > 0 && m < 1 ? (b.x > a.x ? 1 : -1) : (Math.cos(wob) >= 0 ? 1 : -1)
    };
  }

  function drawBee(ctx, bee) {
    ctx.save();
    ctx.globalAlpha = bee.shown;
    ctx.translate(bee.x, bee.y);
    ctx.scale(bee.dir, 1);
    // Wings that flap fast
    var flap = 0.6 + Math.abs(Math.sin(clock * 40)) * 0.4;
    ctx.fillStyle = "rgba(255, 253, 248, 0.85)";
    ctx.beginPath();
    ctx.ellipse(-1, -5, 3.6, 5 * flap, -0.4, 0, Math.PI * 2);
    ctx.ellipse(2, -5, 3.2, 4.4 * flap, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ellipse(ctx, 0, 0, 6, 4.2, "#F2C230");
    ctx.fillStyle = C.darkBrown;
    ctx.fillRect(-2.6, -3.8, 1.8, 7.6);
    ctx.fillRect(0.8, -3.9, 1.8, 7.8);
    circle(ctx, 5.4, -0.4, 2.4, C.darkBrown);
    ctx.restore();
  }

  function bees() {
    var out = [];
    for (var i = 0; i < K.bees; i++) out.push(beeAt(i));
    return out;
  }

  // ---------- Wild flowers ----------

  function shadow(ctx, x, y, w) {
    ellipse(ctx, x, y + 2, w, w * 0.35, "rgba(74, 52, 40, 0.2)");
  }

  // A daisy: white petals around a yellow middle, on a little green stem with a leaf.
  function drawDaisy(ctx, f) {
    var x = f.x, y = f.y - 12;
    shadow(ctx, f.x, f.y, 12);
    stem(ctx, f);
    for (var p = 0; p < 10; p++) {
      var a = p * Math.PI / 5;
      ctx.save();
      ctx.translate(x + Math.cos(a) * 6, y + Math.sin(a) * 6);
      ctx.rotate(a);
      ellipse(ctx, 0, 0, 5, 2.4, C.white);
      ctx.restore();
    }
    circle(ctx, x, y, 4, "#F2C230");
  }

  // A poppy: big red petals with a dark middle.
  function drawPoppy(ctx, f) {
    var x = f.x, y = f.y - 12;
    shadow(ctx, f.x, f.y, 12);
    stem(ctx, f);
    for (var p = 0; p < 4; p++) {
      var a = p * Math.PI / 2 + 0.4;
      circle(ctx, x + Math.cos(a) * 5, y + Math.sin(a) * 4.5, 6.5, K.poppy);
    }
    circle(ctx, x - 1.5, y - 2, 3, "#E8705F");
    circle(ctx, x, y, 2.8, C.darkBrown);
  }

  // Lavender: three thin stems with little purple buds up to their tips.
  function drawLavender(ctx, f) {
    shadow(ctx, f.x, f.y, 12);
    [[-6, -0.25], [0, 0], [6, 0.25]].forEach(function (s) {
      ctx.save();
      ctx.translate(f.x + s[0] * 0.4, f.y);
      ctx.rotate(s[1]);
      ctx.strokeStyle = C.sage;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -26);
      ctx.stroke();
      for (var b = 0; b < 6; b++) {
        ellipse(ctx, (b % 2 ? 1.6 : -1.6), -12 - b * 3, 2.4, 2, b % 2 ? K.lavender : "#B79BDB");
      }
      ctx.restore();
    });
  }

  function stem(ctx, f) {
    ctx.strokeStyle = C.cityGrassDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(f.x, f.y);
    ctx.lineTo(f.x, f.y - 10);
    ctx.stroke();
    ellipse(ctx, f.x + 4, f.y - 4, 4, 2, C.cityGrassDark);
  }

  function drawFlowerHighlight(ctx, f) {
    ctx.save();
    ctx.shadowColor = C.cream;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = C.sage;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(f.x, f.y - 10, 22, 19, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

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
    drawGrass(ctx);
    Weather.drawSnowyGrass(ctx);
    drawDecorFlowers(ctx);
    drawTrail(ctx);
    if (hover === "trail") drawGlow(ctx, trailBox());
    if (hover === "picnic") drawGlow(ctx, { x: BLANKET.x, y: BLANKET.y, w: BLANKET.w, h: BLANKET.h });
    drawPicnic(ctx);
    if (hover === "swing") {
      drawGlow(ctx, { x: BIG_TREE.x - BIG_TREE.r, y: BIG_TREE.y - BIG_TREE.r, w: SWING.x + SWING.half - BIG_TREE.x + BIG_TREE.r,
        h: SWING.sit.y - BIG_TREE.y + BIG_TREE.r });
    }
    drawTree(ctx, BIG_TREE, 0);
    drawSwing(ctx);
    drawTree(ctx, SMALL_TREE, 1);
    drawHive(ctx);
    drawSunflowers(ctx);
    flowers.forEach(function (f) {
      if (f === hover) drawFlowerHighlight(ctx, f);
      if (f.kind === "daisy") drawDaisy(ctx, f);
      else if (f.kind === "poppy") drawPoppy(ctx, f);
      else drawLavender(ctx, f);
    });
    bees().forEach(function (bee) { if (bee.shown > 0) drawBee(ctx, bee); });
    ctx.restore();
  }

  // The sign, drawn over the night tint like the signs of the city.
  var signMeasured = null;

  function signBox() {
    return signMeasured || { x: SIGN.x - 120, y: SIGN.y - 20, w: 240, h: 40 };
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

  // The floating texts after gathering, over everything (characters too).
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

  // The id of the word for what is at a spot of the Pradera, or null. Small things win over big ones.
  function wordAt(x, y) {
    if (x < 0 || x > W || y < 0 || y > H) return null;
    var f = flowerAt(x, y);
    if (f) return f.kind;
    if (bees().some(function (b) { return b.shown > 0.5 && near(x, y, b.x, b.y, 12); })) return "bee";
    if (inBox(x, y, grow(HIVE, 4))) return "beehive";
    if (picnicAt(x, y)) return "picnic";
    if (inBox(x, y, { x: SWING.x - SWING.half - 8, y: SWING.top - 8, w: SWING.half * 2 + 16, h: SWING.seat - SWING.top + 30 })) return "swing";
    if (near(x, y, BIG_TREE.x, BIG_TREE.y, BIG_TREE.r) || inBox(x, y, BIG_TREE.trunk)) return "swing";
    if (near(x, y, SMALL_TREE.x, SMALL_TREE.y, SMALL_TREE.r) || inBox(x, y, SMALL_TREE.trunk)) return "tree";
    if (inBox(x, y, trailBox()) || inBox(x, y, signBox())) return "meadow";
    if (inBox(x, y, FIELD)) return "sunflower";
    for (var i = 0; i < HILLS.length; i++) {
      var h = HILLS[i], dx = (x - h.x) / h.rx, dy = (y - h.y) / h.ry;
      if (dx * dx + dy * dy <= 1) return "hill";
    }
    return null;
  }

  // ---------- Saving ----------

  function get() {
    return {
      flowers: flowers.map(function (f) { return { kind: f.kind, x: f.x, y: f.y }; }),
      regrow: regrow.slice()
    };
  }

  // Used when loading a saved game. Anything strange is left out, and there are always 3 to 5 wild flowers
  // (counting the ones about to appear). An old saved game keeps the ones of a new game.
  function set(saved) {
    if (!saved || typeof saved !== "object" || !Array.isArray(saved.flowers)) return;
    flowers = saved.flowers.filter(function (f) {
      return f && KINDS.some(function (k) { return k.id === f.kind; }) &&
        typeof f.x === "number" && typeof f.y === "number" && isFlowerSpot(f.x, f.y);
    }).slice(0, K.max).map(function (f) {
      return { kind: f.kind, x: f.x, y: f.y, phase: Math.random() * Math.PI * 2 };
    });
    regrow = (Array.isArray(saved.regrow) ? saved.regrow : []).filter(function (s) {
      return typeof s === "number" && isFinite(s);
    }).map(function (s) {
      return Math.max(0.1, Math.min(K.regrow.max, s));
    }).slice(0, K.max - flowers.length);
    while (flowers.length + regrow.length < K.min) regrow.push(between(K.regrow.min, K.regrow.max));
  }

  // The dishes being eaten on the blanket (or on the way there) go back in when saving, so reloading never loses one.
  function withPending(saved) {
    Object.keys(current).forEach(function (id) {
      var a = current[id];
      if (a.kind === "eat" && a.phase !== "busy") saved[a.dish] = (saved[a.dish] || 0) + 1;
    });
    return saved;
  }

  // A new game starts with 3 to 5 wild flowers.
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
    flowerAt: flowerAt,
    usableAt: usableAt,
    setHover: setHover,
    tapFlower: tapFlower,
    tapSwing: tapSwing,
    tapPicnic: tapPicnic,
    cancel: cancel,
    isActive: isActive,
    update: update,
    bubbleFor: bubbleFor,
    poseFor: poseFor,
    drawSeat: drawSeat,
    draw: draw,
    drawLabels: drawLabels,
    drawPops: drawPops,
    wordAt: wordAt,
    get: get,
    set: set,
    withPending: withPending,
    // Modo decorar moves nothing in the Pradera (js/decorate.js).
    movableAt: function () { return null; },
    canTurn: function () { return false; }
  };
})();
