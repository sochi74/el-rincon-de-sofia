// Magic coins: one counter for the whole house, shown in the panel, and shiny gold coins that appear
// on the grass of the city now and then. A character walking over one picks it up: a sparkle,
// "+5 🪙" floating up, and the counter goes up.
var Coins = (function () {
  var K = CONFIG.coins;
  var count = K.start;
  // Coins lying on the city grass, as { x, y, spin } (spin makes each one turn at its own moment).
  var ground = [];
  // Sparkles and "+5 🪙" texts after a pickup, as { x, y, age }.
  var pops = [];
  var timer = nextWait();

  function nextWait() {
    return K.every.min + Math.random() * (K.every.max - K.every.min);
  }

  // True if a coin can lie here: the whole coin (it floats a little above its spot) is on open grass,
  // and it is away from the berries, mushrooms and crystals of the forest.
  function isFreeSpot(x, y) {
    var r = K.radius + 4;
    var points = [[x, y], [x, y - 12 - r], [x - r, y - 12], [x + r, y - 12]];
    if (!points.every(function (p) { return City.isOpenGrass(p[0], p[1]); })) return false;
    return !Gather.isNear(x, y, 45);
  }

  // A random spot of open grass in the city, or null if none was found after a few tries.
  function randomSpot() {
    for (var i = 0; i < 40; i++) {
      var x = Math.random() * CONFIG.world.width;
      var y = Math.random() * CONFIG.world.height;
      if (!isFreeSpot(x, y)) continue;
      var tooClose = ground.some(function (c) {
        return Math.abs(c.x - x) < 60 && Math.abs(c.y - y) < 60;
      });
      if (!tooClose) return { x: x, y: y };
    }
    return null;
  }

  function spawn() {
    if (ground.length >= K.maxOnGround) return;
    var spot = randomSpot();
    if (spot) ground.push({ x: spot.x, y: spot.y, spin: Math.random() * Math.PI * 2 });
  }

  function update(dt) {
    pops.forEach(function (p) { p.age += dt; });
    pops = pops.filter(function (p) { return p.age < K.popTime; });

    // Anyone in the city whose feet touch a coin picks it up.
    Sims.list().forEach(function (sim) {
      if (sim.place !== "city") return;
      ground = ground.filter(function (c) {
        var dx = sim.x - c.x, dy = sim.y - c.y;
        if (dx * dx + dy * dy > K.reach * K.reach) return true;
        count += K.value;
        pops.push({ x: c.x, y: c.y, age: 0 });
        return false;
      });
    });

    // New coins only appear while the game runs.
    if (Needs.isPaused()) return;
    timer -= dt;
    if (timer <= 0) {
      timer = nextWait();
      spawn();
    }
  }

  // ---------- Drawing ----------

  // A soft round light that fades out at the edge.
  function halo(ctx, x, y, r, alpha) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255, 214, 107, " + alpha + ")");
    g.addColorStop(1, "rgba(255, 214, 107, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // A gold coin seen from above, turning softly: it gets thin and wide again, like a spinning coin.
  function drawCoin(ctx, c, time, dark) {
    var r = K.radius;
    var bob = Math.sin(time * 2 + c.spin) * 2;
    var turn = Math.cos(time * 1.6 + c.spin);
    var w = r * (0.25 + 0.75 * Math.abs(turn));
    var cy = c.y - 12 + bob;

    ctx.save();
    // Shadow on the grass.
    ctx.fillStyle = "rgba(74, 52, 40, 0.22)";
    ctx.beginPath();
    ctx.ellipse(c.x, c.y + 2, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glow, a little brighter at night.
    var pulse = 0.5 + 0.5 * Math.sin(time * 3 + c.spin);
    ctx.globalCompositeOperation = "lighter";
    halo(ctx, c.x, cy, r * (2.2 + dark * 0.8), 0.3 + pulse * 0.15 + dark * 0.3);
    ctx.globalCompositeOperation = "source-over";

    // The coin: dark gold edge, gold face and a lighter shine.
    ctx.fillStyle = K.edge;
    ctx.beginPath();
    ctx.ellipse(c.x, cy, w, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = K.gold;
    ctx.beginPath();
    ctx.ellipse(c.x, cy, Math.max(1, w - 2.5), r - 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    if (w > r * 0.5) {
      ctx.strokeStyle = K.edge;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(c.x, cy, w * 0.55, r * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = CONFIG.colors.cream;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(c.x - w * 0.35, cy - r * 0.4, Math.max(0.5, w * 0.18), r * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // A tiny twinkle star now and then.
    var twinkle = Math.max(0, Math.sin(time * 2.3 + c.spin * 3));
    if (twinkle > 0.6) {
      ctx.globalAlpha = (twinkle - 0.6) / 0.4;
      star(ctx, c.x + r * 0.7, cy - r * 0.8, 5, CONFIG.colors.white);
    }
    ctx.restore();
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

  // The sparkle burst and the "+5 🪙" text floating up after a pickup.
  function drawPop(ctx, p) {
    var t = p.age / K.popTime;
    var cy = p.y - 12;
    ctx.save();
    ctx.globalAlpha = 1 - t;
    var spread = 8 + t * 34;
    for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3 + t;
      star(ctx, p.x + Math.cos(a) * spread, cy + Math.sin(a) * spread, 7 * (1 - t * 0.6), i % 2 ? K.gold : CONFIG.colors.white);
    }
    ctx.font = "bold 24px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var ty = cy - 30 - t * 50;
    ctx.lineWidth = 5;
    ctx.strokeStyle = CONFIG.colors.darkBrown;
    ctx.strokeText("+" + K.value + " 🪙", p.x, ty);
    ctx.fillStyle = CONFIG.colors.cream;
    ctx.fillText("+" + K.value + " 🪙", p.x, ty);
    ctx.restore();
  }

  // Drawn over the city, after the night tint so the coins always shine. "dark" goes from 0 (day) to 1 (night).
  function draw(ctx, time, dark) {
    ground.forEach(function (c) { drawCoin(ctx, c, time, dark); });
    pops.forEach(function (p) { drawPop(ctx, p); });
  }

  // "coin" if a coin on the ground is at a spot of the city.
  function wordAt(x, y) {
    for (var i = 0; i < ground.length; i++) {
      var c = ground[i];
      var dx = x - c.x, dy = y - (c.y - 12);
      if (dx * dx + dy * dy <= (K.radius + 8) * (K.radius + 8)) return "coin";
    }
    return null;
  }

  // ---------- Saving ----------

  function text() {
    return "🪙 " + count;
  }

  function amount() {
    return count;
  }

  // Pay for something; false (and nothing paid) if there are not enough coins.
  function spend(n) {
    if (n > count) return false;
    count -= n;
    return true;
  }

  function add(n) {
    count += n;
  }

  // True if a coin lies within "r" of a spot (so forest things do not grow under one).
  function isNear(x, y, r) {
    return ground.some(function (c) {
      return Math.abs(c.x - x) < r && Math.abs(c.y - y) < r;
    });
  }

  function get() {
    return { count: count, ground: ground.map(function (c) { return { x: c.x, y: c.y }; }) };
  }

  // Used when loading a saved game. Anything strange is left out.
  function set(saved) {
    if (!saved || typeof saved !== "object") return;
    if (typeof saved.count === "number" && isFinite(saved.count) && saved.count >= 0) count = Math.floor(saved.count);
    if (Array.isArray(saved.ground)) {
      ground = saved.ground.filter(function (c) {
        return c && typeof c.x === "number" && typeof c.y === "number" && isFreeSpot(c.x, c.y);
      }).slice(0, K.maxOnGround).map(function (c) {
        return { x: c.x, y: c.y, spin: Math.random() * Math.PI * 2 };
      });
    }
  }

  return { update: update, draw: draw, wordAt: wordAt, text: text, amount: amount, spend: spend, add: add, isNear: isNear, get: get, set: set };
})();
