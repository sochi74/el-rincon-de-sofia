// Fishing in the river and gathering in the forest. Tapping the water sends the selected one to the nearest bank
// to fish; tapping a berry bush, a mushroom or a crystal in the forest sends it there to gather it.
// Everything goes into the shared backpack (js/inventory.js). Pausa freezes it all.
var Gather = (function () {
  var C = CONFIG.colors;
  var K = CONFIG.gather;
  var REGROW = K.regrow;

  // What comes out of the river: the chance of each catch, out of 100. At night the last 10 are a moon fish;
  // by day they are a silver fish.
  var CATCHES = [
    { id: "fish", chance: 40, text: "¡Pez plateado!" },
    { id: "crab", chance: 20, text: "¡Cangrejo!" },
    { id: "rainbowFish", chance: 15, text: "¡Pez arcoíris!" },
    { id: "boot", chance: 15, text: "¡Bota vieja!" },
    { id: "moonFish", chance: 10, text: "¡Pez luna!", night: true }
  ];

  // Things that grow in the forest and how often each one appears, out of 100.
  var KINDS = [
    { id: "berry", chance: 40 },
    { id: "mushroom", chance: 35 },
    { id: "crystal", chance: 25 }
  ];

  var ACTIONS = { fish: "Pescando 🎣", gather: "Recolectando 🧺" };

  // Things in the forest right now, as { kind, x, y, phase } (phase makes each one twinkle at its own moment).
  var forest = [];
  // Seconds until each new forest thing appears.
  var regrow = [];

  // What each character is doing, by character id:
  // { sim, kind: "fish" | "gather", thing, phase: "walking" | "doing" | "busy", elapsed }
  var current = {};

  // Texts floating up after a catch, as { x, y, text, age }.
  var pops = [];

  // The forest thing under the mouse, or null.
  var hover = null;

  function between(min, max) {
    return min + Math.random() * (max - min);
  }

  // ---------- The forest ----------

  function pickKind() {
    var roll = Math.random() * 100;
    for (var i = 0; i < KINDS.length; i++) {
      roll -= KINDS[i].chance;
      if (roll < 0) return KINDS[i].id;
    }
    return KINDS[0].id;
  }

  // A random free spot of the forest floor, away from the other things, or null.
  function randomSpot() {
    for (var i = 0; i < 60; i++) {
      var x = Math.random() * CONFIG.world.width * 0.55;
      var y = Math.random() * CONFIG.world.height * 0.55;
      if (!City.isForestFloor(x, y) || Coins.isNear(x, y, 45)) continue;
      var tooClose = forest.some(function (t) {
        return Math.abs(t.x - x) < 50 && Math.abs(t.y - y) < 50;
      });
      if (!tooClose) return { x: x, y: y };
    }
    return null;
  }

  function spawn(kind) {
    var spot = randomSpot();
    if (!spot) return false;
    forest.push({ kind: kind || pickKind(), x: spot.x, y: spot.y, phase: Math.random() * Math.PI * 2 });
    return true;
  }

  // A new game starts with 3 to 5 things in the forest.
  (function () {
    var n = Math.floor(between(K.forestMin, K.forestMax + 1));
    for (var i = 0; i < n; i++) {
      if (!spawn()) regrow.push(between(REGROW.min, REGROW.max));
    }
  })();

  // The forest thing at a spot of the city, or null.
  function thingAt(x, y) {
    for (var i = forest.length - 1; i >= 0; i--) {
      var t = forest[i];
      var dx = x - t.x, dy = y - (t.y - 8);
      if (dx * dx + dy * dy <= 20 * 20) return t;
    }
    return null;
  }

  // True if a forest thing is within "r" of a spot (so shiny coins never fall on one).
  function isNear(x, y, r) {
    return forest.some(function (t) {
      return Math.abs(t.x - x) < r && Math.abs(t.y - y) < r;
    });
  }

  function wordAt(x, y) {
    var t = thingAt(x, y);
    return t ? t.kind : null;
  }

  // ---------- Actions ----------

  // A tap on the river: walk to the bank on this side of the river and fish there.
  function tapRiver(sim, x, y) {
    var side = sim.x < City.riverX(sim.y) ? -1 : 1;
    current[sim.data.id] = { sim: sim, kind: "fish", thing: null, phase: "walking", elapsed: 0 };
    // A spot just past the middle of the river on this side: it moves to the bank.
    var bank = City.walkableSpot(City.riverX(y) + side, y);
    Sims.walkTo(sim, bank.x, bank.y);
  }

  // A tap on a forest thing: walk next to it, on the side the character comes from, and gather it.
  function tapThing(sim, t) {
    var side = sim.x < t.x ? -1 : 1;
    current[sim.data.id] = { sim: sim, kind: "gather", thing: t, phase: "walking", elapsed: 0 };
    Sims.walkTo(sim, t.x + side * 30, t.y + 4);
  }

  // Stop what a character is doing here; true if it was doing something.
  function cancel(id) {
    var had = !!current[id];
    delete current[id];
    return had;
  }

  function isActive(id) {
    return !!current[id];
  }

  // True if the other one is already fishing at this spot or gathering this thing.
  function isTaken(a, id) {
    return Object.keys(current).some(function (other) {
      var b = current[other];
      if (other === id || b.phase !== "doing" || b.kind !== a.kind) return false;
      if (a.kind === "gather") return b.thing === a.thing;
      var dx = b.sim.x - a.sim.x, dy = b.sim.y - a.sim.y;
      return dx * dx + dy * dy < K.fishGap * K.fishGap;
    });
  }

  function stillNeeded(a) {
    return a.kind === "fish" || forest.indexOf(a.thing) >= 0;
  }

  // Look at the river while fishing, or at the thing while gathering.
  function face(a) {
    var x = a.kind === "fish" ? City.riverX(a.sim.y) : a.thing.x;
    a.sim.facing = x < a.sim.x ? "left" : "right";
  }

  function catchOne() {
    var night = !Time.isDay();
    var roll = Math.random() * 100;
    for (var i = 0; i < CATCHES.length; i++) {
      roll -= CATCHES[i].chance;
      if (roll < 0) return CATCHES[i].night && !night ? CATCHES[0] : CATCHES[i];
    }
    return CATCHES[0];
  }

  // Floating text over the head of a character.
  function popOver(sim, text) {
    pops.push({ x: sim.x, y: sim.y - 78 * CONFIG.characterScale - CONFIG.moodStar.room - 30, text: text, age: 0 });
  }

  // When the action ends: the catch or the forest thing goes into the backpack.
  function finish(a) {
    var id = a.sim.data.id;
    if (a.kind === "fish") {
      var c = catchOne();
      var it = Inventory.item(c.id);
      Inventory.add(c.id, 1);
      popOver(a.sim, c.text + " " + it.emoji);
      Sound.playAt("city", "blup");
      var values = Needs.get(id);
      values.fun = Math.min(100, values.fun + K.fishFun);
      return;
    }
    forest.splice(forest.indexOf(a.thing), 1);
    if (hover === a.thing) hover = null;
    Inventory.add(a.thing.kind, 1);
    popOver(a.sim, "+1 " + Inventory.item(a.thing.kind).emoji);
    regrow.push(between(REGROW.min, REGROW.max));
  }

  function update(dt) {
    pops.forEach(function (p) { p.age += dt; });
    pops = pops.filter(function (p) { return p.age < K.popTime; });

    Object.keys(current).forEach(function (id) {
      var a = current[id];
      // Going indoors or starting to socialize ends it.
      if (a.sim.place !== "city" || Social.isInvolved(id)) {
        delete current[id];
        return;
      }
      if (a.phase === "walking") {
        if (a.sim.path.length > 0) return;
        if (!stillNeeded(a)) {
          delete current[id];
          return;
        }
        a.phase = isTaken(a, id) ? "busy" : "doing";
        a.elapsed = 0;
        if (a.phase === "doing") face(a);
        return;
      }
      if (a.phase === "busy") {
        a.elapsed += dt;
        if (a.elapsed >= K.busyTime) delete current[id];
        return;
      }
      if (Needs.isPaused()) return;
      a.elapsed += dt;
      if (a.elapsed >= (a.kind === "fish" ? K.fishTime : K.gatherTime)) {
        delete current[id];
        if (stillNeeded(a)) finish(a);
      }
    });

    // New forest things only appear while the game runs.
    if (Needs.isPaused()) return;
    regrow = regrow.filter(function (left) { return left > 0; });
    for (var i = 0; i < regrow.length; i++) {
      regrow[i] -= dt;
      // If there is no room right now, it tries again a little later.
      if (regrow[i] <= 0 && !spawn()) regrow[i] = 5;
    }
  }

  // What to show over a character's head, or null.
  function bubbleFor(id) {
    var a = current[id];
    if (!a || a.phase === "walking") return null;
    if (a.phase === "busy") return { text: "Ocupado", heart: false };
    return { text: ACTIONS[a.kind], heart: false };
  }

  function setHover(t) {
    hover = t;
  }

  // ---------- Drawing ----------

  function circle(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  // A small four-pointed sparkle.
  function star(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.25, y - size * 0.25);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size * 0.25, y + size * 0.25);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.25, y + size * 0.25);
    ctx.lineTo(x - size, y);
    ctx.lineTo(x - size * 0.25, y - size * 0.25);
    ctx.closePath();
    ctx.fill();
  }

  function shadow(ctx, x, y, w) {
    ctx.fillStyle = "rgba(74, 52, 40, 0.22)";
    ctx.beginPath();
    ctx.ellipse(x, y + 2, w, w * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // A round green bush with red berries.
  function drawBerry(ctx, t) {
    var x = t.x, y = t.y - 10;
    shadow(ctx, x, t.y, 17);
    circle(ctx, x, y, 15, C.cityGrassDark);
    circle(ctx, x - 6, y - 4, 9, C.sage);
    circle(ctx, x + 6, y - 2, 8, C.sage);
    [[-7, 2], [2, -7], [8, 4], [-1, 5], [5, -1]].forEach(function (b) {
      circle(ctx, x + b[0], y + b[1], 3.3, C.terracotta);
      circle(ctx, x + b[0] - 1, y + b[1] - 1, 1, C.cream);
    });
  }

  // Two mushrooms: cream stems and terracotta caps with cream dots.
  function drawMushroom(ctx, t) {
    shadow(ctx, t.x, t.y, 15);
    [[-6, 0, 1], [7, 3, 0.75]].forEach(function (m) {
      var x = t.x + m[0], base = t.y + m[1] - 2, s = m[2];
      ctx.fillStyle = C.cream;
      ctx.beginPath();
      ctx.ellipse(x, base - 6 * s, 3.5 * s, 7 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.terracotta;
      ctx.beginPath();
      ctx.ellipse(x, base - 12 * s, 11 * s, 8 * s, 0, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = C.darkBrown;
      ctx.lineWidth = 1;
      ctx.stroke();
      circle(ctx, x - 4 * s, base - 16 * s, 1.8 * s, C.cream);
      circle(ctx, x + 3 * s, base - 17 * s, 1.5 * s, C.cream);
      circle(ctx, x + 6 * s, base - 13 * s, 1.2 * s, C.cream);
    });
  }

  // A crystal point: a tall diamond shape with a lighter facet.
  function crystalPoint(ctx, x, base, w, h, tilt) {
    ctx.save();
    ctx.translate(x, base);
    ctx.rotate(tilt);
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.lineTo(w, -h * 0.35);
    ctx.lineTo(w * 0.6, 0);
    ctx.lineTo(-w * 0.6, 0);
    ctx.lineTo(-w, -h * 0.35);
    ctx.closePath();
    ctx.fillStyle = K.crystal;
    ctx.fill();
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.lineTo(-w, -h * 0.35);
    ctx.lineTo(-w * 0.6, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 253, 248, 0.6)";
    ctx.fill();
    ctx.restore();
  }

  // Three crystal points with a soft glow, brighter at night ("dark" from 0 to 1).
  function drawCrystal(ctx, t, time, dark) {
    var x = t.x, y = t.y;
    var pulse = 0.5 + 0.5 * Math.sin(time * 2.5 + t.phase);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var r = 22 + dark * 12;
    var g = ctx.createRadialGradient(x, y - 10, 0, x, y - 10, r);
    g.addColorStop(0, "rgba(" + K.crystalLight + ", " + (0.35 + pulse * 0.15 + dark * 0.35) + ")");
    g.addColorStop(1, "rgba(" + K.crystalLight + ", 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y - 10, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    shadow(ctx, x, y, 13);
    crystalPoint(ctx, x - 7, y, 4.5, 15, -0.35);
    crystalPoint(ctx, x + 7, y, 4.5, 14, 0.35);
    crystalPoint(ctx, x, y, 6, 22, 0);
  }

  function drawHighlight(ctx, t) {
    ctx.save();
    ctx.shadowColor = C.cream;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = C.sage;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(t.x, t.y - 8, 22, 18, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // The forest things, drawn with the city (under the night tint).
  function draw(ctx, time) {
    forest.forEach(function (t) {
      if (t === hover) drawHighlight(ctx, t);
      if (t.kind === "berry") drawBerry(ctx, t);
      else if (t.kind === "mushroom") drawMushroom(ctx, t);
      else drawCrystal(ctx, t, time, 0);
    });
  }

  // At night ("dark" from 0 to 1) the crystals shine again over the tint, with a bigger glow.
  function drawNightLights(ctx, time, dark) {
    forest.forEach(function (t) {
      if (t.kind !== "crystal") return;
      ctx.save();
      ctx.globalAlpha = dark;
      drawCrystal(ctx, t, time, dark);
      ctx.restore();
    });
  }

  // A fishing rod in the hand and a bobber floating on the water.
  function drawRod(ctx, sim, time) {
    var dir = sim.facing === "left" ? -1 : 1;
    var k = CONFIG.characterScale;
    var hand = { x: sim.x + dir * 14 * k, y: sim.y - 34 * k };
    var tip = { x: sim.x + dir * 44 * k, y: sim.y - 82 * k };
    var bob = { x: sim.x + dir * 40, y: sim.y - 6 + Math.sin(time * 3) * 1.5 };
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
    ctx.quadraticCurveTo(tip.x + dir * 6, bob.y - 20, bob.x, bob.y);
    ctx.stroke();
    // A ripple that grows and fades around the bobber.
    var grow = (time * 12) % 16;
    ctx.globalAlpha = 1 - grow / 16;
    ctx.strokeStyle = C.waterLight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(bob.x, bob.y + 3, 6 + grow, (6 + grow) * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    circle(ctx, bob.x, bob.y, 4.5, C.terracotta);
    ctx.beginPath();
    ctx.arc(bob.x, bob.y, 4.5, Math.PI, 0);
    ctx.fillStyle = C.white;
    ctx.fill();
    ctx.restore();
  }

  function drawPop(ctx, p) {
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
  }

  // Twinkles on the crystals, and the rods of whoever is fishing. Drawn after the night tint, before the characters.
  function drawTop(ctx, time) {
    forest.forEach(function (t) {
      if (t.kind !== "crystal") return;
      var tw = Math.max(0, Math.sin(time * 2.3 + t.phase * 3));
      if (tw <= 0.5) return;
      ctx.save();
      ctx.globalAlpha = (tw - 0.5) / 0.5;
      star(ctx, t.x + 8, t.y - 22, 5, C.white);
      ctx.restore();
    });
    Object.keys(current).forEach(function (id) {
      var a = current[id];
      if (a.kind === "fish" && a.phase === "doing" && a.sim.place === "city") drawRod(ctx, a.sim, time);
    });
  }

  // The floating texts after a catch, over everything (characters too).
  function drawPops(ctx) {
    pops.forEach(function (p) { drawPop(ctx, p); });
  }

  // ---------- Saving ----------

  function get() {
    return {
      things: forest.map(function (t) { return { kind: t.kind, x: t.x, y: t.y }; }),
      regrow: regrow.slice()
    };
  }

  // Used when loading a saved game. Anything strange is left out, and the forest always has 3 to 5 things
  // (counting the ones about to appear).
  function set(saved) {
    if (!saved || typeof saved !== "object" || !Array.isArray(saved.things)) return;
    forest = saved.things.filter(function (t) {
      return t && KINDS.some(function (k) { return k.id === t.kind; }) &&
        typeof t.x === "number" && typeof t.y === "number" && City.isForestFloor(t.x, t.y);
    }).slice(0, K.forestMax).map(function (t) {
      return { kind: t.kind, x: t.x, y: t.y, phase: Math.random() * Math.PI * 2 };
    });
    regrow = (Array.isArray(saved.regrow) ? saved.regrow : []).filter(function (s) {
      return typeof s === "number" && isFinite(s);
    }).map(function (s) {
      return Math.max(0.1, Math.min(REGROW.max, s));
    }).slice(0, K.forestMax - forest.length);
    while (forest.length + regrow.length < K.forestMin) regrow.push(between(REGROW.min, REGROW.max));
  }

  return {
    thingAt: thingAt,
    isNear: isNear,
    wordAt: wordAt,
    tapRiver: tapRiver,
    tapThing: tapThing,
    cancel: cancel,
    isActive: isActive,
    update: update,
    bubbleFor: bubbleFor,
    setHover: setHover,
    draw: draw,
    drawNightLights: drawNightLights,
    drawTop: drawTop,
    drawPops: drawPops,
    get: get,
    set: set
  };
})();
