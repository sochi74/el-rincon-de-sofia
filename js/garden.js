// Sofía's garden in the city: 6 plots of soil behind a little wooden fence, with a sign.
// Buy a seed with magic coins and plant it, water it, watch it grow (seed, sprout, flower)
// and harvest the flower to sell it for more coins. Pausa freezes the growing too.
// Butterflies flutter over the garden by day, just for decoration.
var Garden = (function () {
  var C = CONFIG.colors;
  var G = CONFIG.garden;

  // Flowers: seed price, coins when sold, the emoji for the menu, and how the bloom looks.
  var FLOWERS = [
    { id: "tulip", name: "Tulipán", emoji: "🌷", price: 5, sell: 12, petals: "#C8664A", center: "#E2B44B" },
    { id: "lily", name: "Lirio", emoji: "🌼", price: 8, sell: 18, petals: "#FFFDF8", center: "#E2B44B" },
    { id: "rainbow", name: "Flor arcoíris", emoji: "🌈", price: 12, sell: 28, petals: null, center: "#FFFDF8" },
    { id: "moon", name: "Flor de luna", emoji: "🌙", price: 15, sell: 35, petals: "#C9D6EE", center: "#F5EBDD" }
  ];

  // What each action shows over the head.
  var ACTIONS = {
    plant: "Plantando 🌱",
    water: "Regando 💧",
    harvest: "Cosechando 🌷"
  };

  // The fence around the garden and the 6 plots inside it, 2 rows of 3.
  var FENCE = G.fence;
  var PLOTS = [];
  (function () {
    var p = G.plot;
    var x0 = FENCE.x + (FENCE.w - (3 * p.w + 2 * p.gap)) / 2;
    var y0 = FENCE.y + (FENCE.h - (2 * p.h + p.gap)) / 2;
    for (var row = 0; row < 2; row++) {
      for (var col = 0; col < 3; col++) {
        PLOTS.push({ x: x0 + col * (p.w + p.gap), y: y0 + row * (p.h + p.gap), w: p.w, h: p.h });
      }
    }
  })();

  // What grows in each plot: { flower: id or null, watered, growth: seconds grown so far }.
  var plots = PLOTS.map(empty);

  function empty() {
    return { flower: null, watered: false, growth: 0 };
  }

  // What each character is doing in the garden, by character id:
  // { sim, plot, kind: "plant" | "water" | "harvest", flower, phase: "walking" | "doing" | "busy", elapsed }
  var current = {};

  // "+N 🪙" texts floating up after a harvest, as { x, y, value, age }.
  var pops = [];

  // Which plot the mouse is over, or -1.
  var hover = -1;

  // The butterflies' own clock: it stops with Pausa, so they stand still.
  var flutter = 0;

  function flower(id) {
    return FLOWERS.filter(function (f) { return f.id === id; })[0] || null;
  }

  function isReady(state) {
    return !!state.flower && state.watered && state.growth >= G.growTime;
  }

  // "seed", "sprout" or "flower".
  function stageOf(state) {
    if (!state.watered || state.growth < G.growTime / 2) return "seed";
    if (state.growth < G.growTime) return "sprout";
    return "flower";
  }

  // ---------- Where things are ----------

  // The number of the plot at a spot of the city, or -1.
  function plotAt(x, y) {
    for (var i = 0; i < PLOTS.length; i++) {
      var p = PLOTS[i];
      if (x >= p.x - 3 && x <= p.x + p.w + 3 && y >= p.y - 3 && y <= p.y + p.h + 3) return i;
    }
    return -1;
  }

  // True if the spot is inside the fence or on the sign (used so coins never fall in the garden).
  function isGardenAt(x, y) {
    return x >= FENCE.x - 10 && x <= FENCE.x + FENCE.w + 10 && y >= FENCE.y - 34 && y <= FENCE.y + FENCE.h + 10;
  }

  // The word for what is at a spot: a butterfly, the flower in a plot, or the garden itself.
  function wordAt(x, y) {
    if (butterflyAt(x, y)) return "butterfly";
    var i = plotAt(x, y);
    if (i >= 0 && plots[i].flower) return plots[i].flower;
    if (i >= 0 || isGardenAt(x, y)) return "garden";
    return null;
  }

  // Where a character stands to use a plot: above it, far enough that its name tag does not cover the plot.
  function spotFor(i) {
    var p = PLOTS[i];
    return { x: p.x + p.w / 2, y: p.y - G.standAbove };
  }

  // ---------- Actions ----------

  // A tap on a plot with a character selected. An empty plot opens the seed menu, a seed that needs
  // water gets watered, and a ready flower gets harvested. A growing plant: just walk there.
  function tap(sim, i, screenX, screenY) {
    var state = plots[i];
    if (!state.flower) {
      UI.openSeedMenu(screenX, screenY, function (flowerId) {
        start(sim, i, "plant", flowerId);
      });
      return;
    }
    if (!state.watered) {
      start(sim, i, "water");
    } else if (isReady(state)) {
      start(sim, i, "harvest");
    } else {
      var spot = spotFor(i);
      Sims.walkTo(sim, spot.x, spot.y);
    }
  }

  function start(sim, i, kind, flowerId) {
    current[sim.data.id] = { sim: sim, plot: i, kind: kind, flower: flowerId || null, phase: "walking", elapsed: 0 };
    var spot = spotFor(i);
    Sims.walkTo(sim, spot.x, spot.y);
  }

  // Stop what a character is doing in the garden; true if it was doing something.
  function cancel(id) {
    var had = !!current[id];
    delete current[id];
    return had;
  }

  function isActive(id) {
    return !!current[id];
  }

  function isTaken(i, id) {
    return Object.keys(current).some(function (other) {
      return other !== id && current[other].plot === i && current[other].phase === "doing";
    });
  }

  // True if the plot still needs this action (the other one may have done it meanwhile).
  function stillNeeded(a) {
    var state = plots[a.plot];
    if (a.kind === "plant") return !state.flower;
    if (a.kind === "water") return !!state.flower && !state.watered;
    return isReady(state);
  }

  // When the action ends: plant (and pay for the seed), water, or harvest (and sell the flower).
  function finish(a) {
    var state = plots[a.plot];
    if (a.kind === "plant") {
      var f = flower(a.flower);
      if (f && Coins.spend(f.price)) plots[a.plot] = { flower: f.id, watered: false, growth: 0 };
    } else if (a.kind === "water") {
      state.watered = true;
    } else {
      var sold = flower(state.flower);
      plots[a.plot] = empty();
      if (sold) {
        Coins.add(sold.sell);
        var p = PLOTS[a.plot];
        pops.push({ x: p.x + p.w / 2, y: p.y, value: sold.sell, age: 0 });
      }
    }
  }

  function update(dt) {
    if (!Needs.isPaused()) flutter += dt;
    pops.forEach(function (p) { p.age += dt; });
    pops = pops.filter(function (p) { return p.age < G.popTime; });

    Object.keys(current).forEach(function (id) {
      var a = current[id];
      // Going indoors or starting to socialize ends the garden action.
      if (a.sim.place !== "city" || Social.isInvolved(id)) {
        delete current[id];
        return;
      }
      if (a.phase === "walking") {
        if (a.sim.path.length > 0) return;
        if (!stillNeeded(a)) {
          delete current[id];
        } else {
          a.phase = isTaken(a.plot, id) ? "busy" : "doing";
          a.elapsed = 0;
        }
        return;
      }
      if (a.phase === "busy") {
        a.elapsed += dt;
        if (a.elapsed >= G.busyTime) delete current[id];
        return;
      }
      if (Needs.isPaused()) return;
      a.elapsed += dt;
      if (a.elapsed >= G.actionTime) {
        delete current[id];
        if (stillNeeded(a)) finish(a);
      }
    });

    // Watered plants grow while the game runs.
    if (Needs.isPaused()) return;
    plots.forEach(function (state) {
      if (state.flower && state.watered) state.growth = Math.min(G.growTime, state.growth + dt);
    });
  }

  // What to show over a character's head, or null.
  function bubbleFor(id) {
    var a = current[id];
    if (!a || a.phase === "walking") return null;
    if (a.phase === "busy") return { text: "Ocupado", heart: false };
    return { text: ACTIONS[a.kind], heart: false };
  }

  function setHover(i) {
    hover = i;
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

  // A little wooden fence around the garden, open at the bottom in the middle like a gate.
  function drawFence(ctx) {
    var x = FENCE.x, y = FENCE.y, w = FENCE.w, h = FENCE.h;
    var gate = 26, mid = x + w / 2;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = C.wood;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mid - gate / 2, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(mid + gate / 2, y + h);
    ctx.stroke();
    ctx.restore();
    // Posts along the fence, and one on each side of the gate.
    var posts = [[x, y + h / 2], [x + w, y + h / 2], [mid - gate / 2, y + h], [mid + gate / 2, y + h]];
    for (var k = 0; k <= 4; k++) {
      var px = x + w * k / 4;
      posts.push([px, y]);
      if (k !== 2) posts.push([px, y + h]);
    }
    posts.forEach(function (p) {
      fillRound(ctx, p[0] - 3.5, p[1] - 3.5, 7, 7, 2, C.darkBrown);
      circle(ctx, p[0], p[1] - 0.5, 1.8, C.wood);
    });
  }

  // A plot of soil: dry soil is wood colored, watered soil is darker. Little furrows across it.
  function drawSoil(ctx, p, state, highlight) {
    fillRound(ctx, p.x, p.y, p.w, p.h, 6, state.watered ? G.wetSoil : G.drySoil);
    ctx.save();
    ctx.strokeStyle = state.watered ? "rgba(46, 32, 24, 0.45)" : "rgba(74, 52, 40, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    for (var fy = p.y + 7; fy < p.y + p.h - 3; fy += 7) {
      ctx.beginPath();
      ctx.moveTo(p.x + 6, fy);
      ctx.lineTo(p.x + p.w - 6, fy);
      ctx.stroke();
    }
    if (highlight) {
      ctx.shadowColor = C.cream;
      ctx.shadowBlur = 10;
      roundRect(ctx, p.x - 3, p.y - 3, p.w + 6, p.h + 6, 8);
      ctx.strokeStyle = C.sage;
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  // The petal color of a flower; the rainbow flower changes color little by little.
  function petalColor(f, time, k) {
    if (f.petals) return f.petals;
    var hue = Math.round((time * 25 + k * 60) % 360);
    return "hsl(" + hue + ", 70%, 68%)";
  }

  function drawLeaves(ctx, cx, base, tall, size) {
    ctx.save();
    ctx.strokeStyle = C.cityGrassDark;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, base);
    ctx.lineTo(cx, base - tall);
    ctx.stroke();
    ctx.fillStyle = C.sage;
    [-1, 1].forEach(function (side) {
      ctx.beginPath();
      ctx.ellipse(cx + side * size * 0.6, base - tall * 0.45, size * 0.65, size * 0.3, side * -0.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // The bloom of a ready flower, centered at (cx, cy), a little bigger than its plant so it is easy to see.
  function drawBloom(ctx, f, cx, cy, time) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1.4, 1.4);
    drawPetals(ctx, f, time);
    ctx.restore();
  }

  // The petals around (0, 0).
  function drawPetals(ctx, f, time) {
    var cx = 0, cy = 0;
    if (f.id === "tulip") {
      // A cup of three rounded petals.
      ctx.fillStyle = f.petals;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy - 6);
      ctx.lineTo(cx - 3.5, cy - 1);
      ctx.lineTo(cx, cy - 7);
      ctx.lineTo(cx + 3.5, cy - 1);
      ctx.lineTo(cx + 7, cy - 6);
      ctx.quadraticCurveTo(cx + 8, cy + 6, cx, cy + 6);
      ctx.quadraticCurveTo(cx - 8, cy + 6, cx - 7, cy - 6);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 253, 248, 0.35)";
      ctx.beginPath();
      ctx.ellipse(cx - 3, cy + 1, 1.6, 3.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    // Lily, rainbow and moon flowers: a ring of pointed petals around a round middle.
    var n = f.id === "lily" ? 6 : 5;
    for (var k = 0; k < n; k++) {
      var a = -Math.PI / 2 + k * Math.PI * 2 / n;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a);
      ctx.fillStyle = petalColor(f, time, k);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(4.5, 4, 10, 0);
      ctx.quadraticCurveTo(4.5, -4, 0, 0);
      ctx.fill();
      ctx.strokeStyle = "rgba(74, 52, 40, 0.25)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }
    circle(ctx, cx, cy, 3, f.center);
  }

  // Ready flowers sway a little in the wind, but not with Pausa.
  function swayOf(p, time) {
    return Needs.isPaused() ? 0 : Math.sin(time * 1.8 + p.x * 0.05) * 1.5;
  }

  // What grows in a plot: a little seed, a sprout that gets taller, or a flower in bloom.
  function drawPlant(ctx, p, state, time) {
    var f = flower(state.flower);
    if (!f) return;
    var cx = p.x + p.w / 2, base = p.y + p.h - 6;
    var stage = stageOf(state);
    if (stage === "seed") {
      // A little mound with a seed peeking out.
      ctx.fillStyle = "rgba(74, 52, 40, 0.35)";
      ctx.beginPath();
      ctx.ellipse(cx, base - 4, 7, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#E8D2A8";
      ctx.beginPath();
      ctx.ellipse(cx, base - 5.5, 3, 2, -0.4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (stage === "sprout") {
      // Grows a little taller until it blooms.
      var t = (state.growth - G.growTime / 2) / (G.growTime / 2);
      drawLeaves(ctx, cx, base, 8 + t * 8, 6 + t * 3);
      return;
    }
    // A sway in the wind, a little glow, and sparkles: it is ready to harvest.
    var sway = swayOf(p, time);
    drawLeaves(ctx, cx, base, 18, 9);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var g = ctx.createRadialGradient(cx, base - 22, 0, cx, base - 22, 22);
    g.addColorStop(0, "rgba(255, 214, 107, 0.35)");
    g.addColorStop(1, "rgba(255, 214, 107, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, base - 22, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawBloom(ctx, f, cx + sway, base - 22, time);
  }

  // Sparkles twinkling around a ready flower. Drawn after the night tint so they always shine.
  function drawSparkles(ctx, p, time) {
    var cx = p.x + p.w / 2, cy = p.y + p.h - 28;
    ctx.save();
    for (var k = 0; k < 3; k++) {
      var tw = Math.max(0, Math.sin(time * 3 + k * 2.1 + p.x * 0.1));
      if (tw <= 0.2) continue;
      ctx.globalAlpha = (tw - 0.2) / 0.8;
      var a = k * 2.1 + time * 0.6;
      star(ctx, cx + Math.cos(a) * 15, cy + Math.sin(a) * 11, 3 + tw * 2.5, k === 1 ? CONFIG.coins.gold : C.white);
    }
    ctx.restore();
  }

  // The ground of the garden: fence, soil and plants. Drawn under the city labels and characters.
  function draw(ctx, time) {
    drawFence(ctx);
    PLOTS.forEach(function (p, i) {
      drawSoil(ctx, p, plots[i], i === hover);
      drawPlant(ctx, p, plots[i], time);
    });
  }

  // At night ("dark" from 0 to 1) the moon flowers shine with a blue-silver halo.
  function drawNightLights(ctx, time, dark) {
    PLOTS.forEach(function (p, i) {
      var state = plots[i];
      if (state.flower !== "moon" || stageOf(state) !== "flower") return;
      var cx = p.x + p.w / 2, cy = p.y + p.h - 28;
      var r = 30 + Math.sin(time * 2 + i) * 3;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(" + G.moonLight + ", " + 0.6 * dark + ")");
      g.addColorStop(1, "rgba(" + G.moonLight + ", 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = dark;
      drawBloom(ctx, flower("moon"), cx + swayOf(p, time), cy, time);
      ctx.restore();
    });
  }

  // "+N 🪙" floating up after a harvest.
  function drawPop(ctx, pop) {
    var t = pop.age / G.popTime;
    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.font = "bold 24px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var text = "+" + pop.value + " 🪙";
    var ty = pop.y - 20 - t * 50;
    ctx.lineWidth = 5;
    ctx.strokeStyle = C.darkBrown;
    ctx.strokeText(text, pop.x, ty);
    ctx.fillStyle = C.cream;
    ctx.fillText(text, pop.x, ty);
    ctx.restore();
  }

  // Drawn over the city after the night tint: sparkles of ready flowers, the butterflies and the "+N 🪙" texts.
  function drawTop(ctx, time) {
    PLOTS.forEach(function (p, i) {
      if (isReady(plots[i])) drawSparkles(ctx, p, time);
    });
    drawButterflies(ctx);
    pops.forEach(function (pop) { drawPop(ctx, pop); });
  }

  // ---------- Butterflies ----------

  // Where a butterfly is: it wanders in slow loops over the garden, bobbing up and down a little.
  function butterflySpot(b) {
    var B = G.butterflies, t = flutter;
    var cx = FENCE.x + FENCE.w / 2 + b.dx, cy = FENCE.y + FENCE.h / 2 + b.dy;
    return {
      x: cx + Math.sin(t * 0.45 + b.phase) * B.roam.x * 0.6 + Math.sin(t * 1.1 + b.phase * 2) * B.roam.x * 0.15,
      y: cy + Math.cos(t * 0.38 + b.phase * 1.4) * B.roam.y * 0.6 + Math.sin(t * 2.2 + b.phase) * 4,
      // Which way it flies, so it faces left or right.
      dir: Math.cos(t * 0.45 + b.phase) >= 0 ? 1 : -1
    };
  }

  // How much they show: all of them by day, fading at dusk, none at night.
  function butterflyAlpha() {
    return Math.max(0, 1 - Time.darkness() * 1.5);
  }

  function butterflyAt(x, y) {
    if (butterflyAlpha() < 0.5) return false;
    return G.butterflies.list.some(function (b) {
      var p = butterflySpot(b);
      return (x - p.x) * (x - p.x) + (y - p.y) * (y - p.y) <= 14 * 14;
    });
  }

  // A small butterfly seen from above: four round wings that open and close, and a dark body.
  function drawButterfly(ctx, b, alpha) {
    var p = butterflySpot(b), s = G.butterflies.size;
    var open = 0.35 + 0.65 * Math.abs(Math.sin(flutter * 9 + b.phase * 3));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.scale(p.dir, 1);
    ctx.fillStyle = "rgba(74, 52, 40, 0.18)";
    ctx.beginPath();
    ctx.ellipse(3, 14, s * open, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = b.color;
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = 1;
    [-1, 1].forEach(function (side) {
      ctx.save();
      ctx.scale(side * open, 1);
      ctx.beginPath();
      ctx.ellipse(s * 0.6, -s * 0.35, s * 0.65, s * 0.5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(s * 0.45, s * 0.4, s * 0.42, s * 0.36, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    ctx.fillStyle = C.darkBrown;
    ctx.beginPath();
    ctx.ellipse(0, 0, 1.4, s * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawButterflies(ctx) {
    var alpha = butterflyAlpha();
    if (alpha <= 0) return;
    G.butterflies.list.forEach(function (b) { drawButterfly(ctx, b, alpha); });
  }

  // ---------- Saving ----------

  function get() {
    return plots.map(function (s) { return { flower: s.flower, watered: s.watered, growth: s.growth }; });
  }

  // Used when loading a saved game. Anything strange leaves that plot empty.
  function set(saved) {
    if (!Array.isArray(saved)) return;
    plots = PLOTS.map(function (p, i) {
      var s = saved[i];
      if (!s || typeof s !== "object" || !flower(s.flower)) return empty();
      var growth = typeof s.growth === "number" && isFinite(s.growth) ? Math.max(0, Math.min(G.growTime, s.growth)) : 0;
      return { flower: s.flower, watered: s.watered === true, growth: s.watered === true ? growth : 0 };
    });
  }

  return {
    FLOWERS: FLOWERS,
    plotAt: plotAt,
    isGardenAt: isGardenAt,
    wordAt: wordAt,
    tap: tap,
    cancel: cancel,
    isActive: isActive,
    update: update,
    bubbleFor: bubbleFor,
    setHover: setHover,
    draw: draw,
    drawNightLights: drawNightLights,
    drawTop: drawTop,
    get: get,
    set: set
  };
})();
