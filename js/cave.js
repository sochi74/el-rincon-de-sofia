// The Cueva: a cave inside the Montaña, as big as the city, seen from above. A floor of dark gray stone, rock walls all
// around with stalactites hanging from the top one, and its way out at the bottom, with the light of outside coming in
// (js/mountain.js has the other end, the mouth of the cave). Its sign "Cueva" at the top.
// 🔦 It is always dark, by day and by night: the crystals give the light. Clusters of crystals on the walls and the floor
// (ice blue, amethyst lilac and pink) glow softly with a halo of their color and twinkle slowly. The clusters are solid.
// 💎 Crystals to gather on the floor, 3 to 5 at a time, gathered like the shells of the Lago: blue, amethyst, pink and,
// now and then, a gold one that glows more than all of them. They go to the backpack (js/inventory.js).
// 🦇 Five little bats sleep hanging from the ceiling, wrapped in their wings; now and then one stretches a wing. Only decoration.
// 💧 Now and then a drop falls from a stalactite into its little puddle, with a soft "plic" and a ring. Only decoration.
// 🐉 Chispa, a young mint green dragon, bigger than the characters (a magic creature: never selected, no chats, no gifts,
// no Amistad). By day she walks slowly around the cave, sometimes flying low, now and then spits colored sparks that go
// up and fade, and sometimes breathes fire out of her mouth (only for show: it burns nothing). At night she
// sleeps curled up in her nest of crystals. A tap on her (whoever is selected, and nobody walks to her) makes her sneeze
// sparks, wag her tail or fly up and spin; at night "Shhh". She is not solid.
// 🔥 Dragon light: while she breathes fire, a big round warm light (orange and gold) comes out of her fire and lights
// the cave around her (not all of it), flickering like a campfire, and the crystals near it shine a little more. It
// follows her if she is flying, and when the fire ends it goes out slowly. Only for show; Pausa freezes it.
// No weather and no shooting stars here, and the night tint never comes in: the cave looks the same by day and by night
// (only the light at the way out changes). Modo decorar moves nothing here. The neighbors never come, and the shiny coins
// never appear here. Pausa freezes it all. The crystals on the floor are saved; Chispa, the bats and the drops are not.
var Cave = (function () {
  var C = CONFIG.colors;
  var K = CONFIG.cave;
  var W = CONFIG.world.width, H = CONFIG.world.height;
  // Where the characters' feet may go: the floor between the walls, and the way out at the bottom.
  var FLOOR = { left: 62, right: W - 62, top: 196, bottom: 650 };
  var EXIT = { x: K.edge.x, half: 32, bottom: 690 };
  var CLEAR = 12;
  // The sign of the place.
  var SIGN = { text: "Cueva", x: 500, y: 62, size: 24 };

  // The colors of the crystals, by name.
  var COLORS = { blue: K.blue, amethyst: K.amethyst, pink: K.pink, gold: K.gold };
  var WORD_OF = { blue: "crystalBlue", amethyst: "crystalAmethyst", pink: "crystalPink", gold: "crystalGold" };

  // The clusters of crystals: where they stand, how big they are, their color and how many shards they have.
  // The first ones are on the floor and the side walls (solid); the last three hang on the top wall.
  var CLUSTERS = [
    { x: 104, y: 266, r: 30, color: "blue", shards: 5 },
    { x: 900, y: 256, r: 34, color: "amethyst", shards: 6 },
    { x: 98, y: 540, r: 34, color: "pink", shards: 6 },
    { x: 904, y: 560, r: 30, color: "blue", shards: 5 },
    { x: 292, y: 352, r: 24, color: "amethyst", shards: 4 },
    { x: 690, y: 334, r: 26, color: "pink", shards: 5 },
    { x: 404, y: 540, r: 22, color: "blue", shards: 4 },
    { x: 236, y: 630, r: 22, color: "pink", shards: 4 },
    { x: 744, y: 632, r: 22, color: "amethyst", shards: 4 },
    { x: 214, y: 168, r: 18, color: "blue", shards: 4 },
    { x: 612, y: 162, r: 20, color: "amethyst", shards: 4 },
    { x: 832, y: 170, r: 18, color: "pink", shards: 4 }
  ];
  // The stalactites hanging from the top wall: where and how long. Drops fall from the ones in "DRIPS".
  var STALACTITES = [[86, 30], [178, 22], [252, 44], [396, 36], [506, 26], [652, 48], [722, 24], [872, 38], [926, 26]];
  var DRIPS = [2, 3, 5];
  // The bats, hanging from the top wall.
  var BATS = [150, 326, 452, 568, 778];
  // Chispa's nest of crystals.
  var NEST = { x: 790, y: 452, rx: 64, ry: 24 };

  // The crystals on the floor right now, as { kind, x, y, turn }, and the seconds until each new one appears.
  var crystals = [];
  var regrow = [];
  // Floating texts, as { x, y, text, age, word, small }, the drops falling and their rings, and Chispa's sparks and fire.
  var pops = [];
  var drops = [];
  var rings = [];
  var sparks = [];
  var flames = [];
  // What is under the mouse: a crystal, "dragon" or "exit".
  var hover = null;
  // Seconds of play here so far: the twinkling, the bats and Chispa stop with Pausa.
  var clock = 0;
  // What each character is doing here, by id: { sim, crystal, phase: "walking" | "doing" | "busy", elapsed }
  var current = {};

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

  function dist(ax, ay, bx, by) {
    return Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
  }

  // The bottom edge of the top wall, a little wavy.
  function ceilY(x) {
    return 150 + Math.sin(x * 0.021) * 9 + Math.sin(x * 0.053 + 1.3) * 5;
  }

  // The inner edges of the side walls.
  function leftX(y) {
    return 46 + Math.sin(y * 0.03) * 8;
  }

  function rightX(y) {
    return W - 46 - Math.sin(y * 0.027 + 2) * 8;
  }

  // The top edge of the bottom wall.
  function bottomY(x) {
    return 676 + Math.sin(x * 0.04) * 5;
  }

  // Where a drop of a stalactite lands: its little puddle on the floor.
  function puddleOf(i) {
    var s = STALACTITES[i];
    return { x: s[0], y: ceilY(s[0]) + s[1] + 76 };
  }

  // ---------- Where characters can walk ----------

  // True if the spot is on the floor between the walls, or in the way out. Used when loading a saved game.
  function isWalkable(x, y) {
    if (x >= FLOOR.left && x <= FLOOR.right && y >= FLOOR.top && y <= FLOOR.bottom) return true;
    return Math.abs(x - EXIT.x) <= EXIT.half && y > FLOOR.bottom && y <= EXIT.bottom;
  }

  // True if a character cannot stand here: off the floor or on a cluster of crystals. Used by js/path.js.
  // Chispa, her nest, the puddles and the crystals on the floor are not solid.
  function isSolid(x, y) {
    if (!isWalkable(x, y)) return true;
    return CLUSTERS.some(function (c) { return near(x, y, c.x, c.y - c.r * 0.3, c.r + CLEAR / 2); });
  }

  // ---------- What can be tapped ----------

  function exitBox() {
    return { x: EXIT.x - EXIT.half - 18, y: FLOOR.bottom - 6, w: EXIT.half * 2 + 36, h: H - FLOOR.bottom + 6 };
  }

  // "exit" if the spot is on the way out, else null (the crystals and Chispa are apart: crystalAt and dragonAt).
  function usableAt(x, y) {
    return inBox(x, y, exitBox()) ? "exit" : null;
  }

  function setHover(what) {
    hover = what || null;
  }

  // ---------- Crystals on the floor ----------

  var KINDS = [
    { id: "crystalBlue", color: "blue", chance: 40 },
    { id: "crystalAmethyst", color: "amethyst", chance: 30 },
    { id: "crystalPink", color: "pink", chance: 25 },
    { id: "crystalGold", color: "gold", chance: 5 }
  ];

  function kindOf(id) {
    return KINDS.filter(function (k) { return k.id === id; })[0];
  }

  function pickKind() {
    var roll = Math.random() * 100;
    for (var i = 0; i < KINDS.length; i++) {
      roll -= KINDS[i].chance;
      if (roll < 0) return KINDS[i].id;
    }
    return KINDS[0].id;
  }

  // True if a crystal may lie here: on the floor, off the clusters, the nest, the puddles and the way out.
  function isCrystalSpot(x, y) {
    if (x < 96 || x > W - 96 || y < 228 || y > 626 || isSolid(x, y)) return false;
    if (CLUSTERS.some(function (c) { return near(x, y, c.x, c.y, c.r + 34); })) return false;
    if (near(x, y, NEST.x, NEST.y, NEST.rx + 30)) return false;
    if (DRIPS.some(function (i) { var p = puddleOf(i); return near(x, y, p.x, p.y, 34); })) return false;
    return !(Math.abs(x - EXIT.x) < 70 && y > 580);
  }

  // A random free spot of the floor, away from the other crystals, or null.
  function randomSpot() {
    for (var i = 0; i < 80; i++) {
      var x = between(96, W - 96), y = between(228, 626);
      if (!isCrystalSpot(x, y)) continue;
      var tooClose = crystals.some(function (s) { return Math.abs(s.x - x) < 60 && Math.abs(s.y - y) < 60; });
      if (!tooClose) return { x: x, y: y };
    }
    return null;
  }

  function spawn() {
    var spot = randomSpot();
    if (!spot) return false;
    crystals.push({ kind: pickKind(), x: spot.x, y: spot.y, turn: between(-0.5, 0.5) });
    return true;
  }

  // The crystal on the floor at a spot, or null.
  function crystalAt(x, y) {
    for (var i = crystals.length - 1; i >= 0; i--) {
      var s = crystals[i];
      if (near(x, y, s.x, s.y - 6, 18)) return s;
    }
    return null;
  }

  // ---------- Gathering ----------

  // A tap on a crystal: walk next to it, on the side the character comes from, and gather it.
  function tapCrystal(sim, s) {
    var side = sim.x < s.x ? -1 : 1;
    var spot = Path.free("cave", s.x + side * 30, s.y + 4);
    current[sim.data.id] = { sim: sim, crystal: s, phase: "walking", elapsed: 0 };
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

  // True if someone else is gathering this same crystal.
  function isTaken(a, id) {
    return Object.keys(current).some(function (other) {
      var b = current[other];
      return other !== id && b.phase === "doing" && b.crystal === a.crystal;
    });
  }

  // Floating text over the head of a character ("word" is the word of what it gathered, for the word tag).
  function popOver(sim, text, word) {
    pops.push({ x: sim.x, y: sim.y - 78 * CONFIG.characterScale - CONFIG.moodStar.room - 30, text: text, age: 0, word: word });
  }

  function popAt(x, y, text, word, small) {
    pops.push({ x: x, y: y, text: text, age: 0, word: word, small: !!small });
  }

  function updateGathering(dt, paused) {
    Object.keys(current).forEach(function (id) {
      var a = current[id];
      // Going out or starting to socialize ends it.
      if (a.sim.place !== "cave" || Social.isInvolved(id)) {
        delete current[id];
        return;
      }
      if (a.phase === "walking") {
        if (a.sim.path.length > 0) return;
        if (crystals.indexOf(a.crystal) < 0) {
          delete current[id];
          return;
        }
        a.elapsed = 0;
        a.phase = isTaken(a, id) ? "busy" : "doing";
        if (a.phase === "doing") a.sim.facing = a.crystal.x < a.sim.x ? "left" : "right";
        return;
      }
      if (a.phase === "busy") {
        a.elapsed += dt;
        if (a.elapsed >= K.busyTime) delete current[id];
        return;
      }
      if (paused) return;
      a.elapsed += dt;
      if (a.elapsed < K.gatherTime) return;
      delete current[id];
      var at = crystals.indexOf(a.crystal);
      if (at < 0) return;
      crystals.splice(at, 1);
      if (hover === a.crystal) hover = null;
      Inventory.add(a.crystal.kind, 1);
      popOver(a.sim, "+1 " + Inventory.item(a.crystal.kind).emoji, a.crystal.kind);
      Sound.playAt("cave", "crystal");
      regrow.push(between(K.regrow.min, K.regrow.max));
    });
  }

  // What to show over a character's head, or null.
  function bubbleFor(id) {
    var a = current[id];
    if (!a || a.phase === "walking") return null;
    if (a.phase === "busy") return { text: "Ocupado", heart: false };
    return { text: "Recolectando 🧺", heart: false };
  }

  // ---------- Bats and drops ----------

  // Each bat: when it stretches ("stretch" counts down while its wing is open) and which wing.
  var bats = BATS.map(function (x, i) {
    return { x: x, i: i, stretch: 0, side: i % 2 ? 1 : -1 };
  });
  var stretchIn = between(2, K.stretch.max);
  var dripIn = between(1, K.drip.max);

  function updateBats(dt) {
    bats.forEach(function (b) { if (b.stretch > 0) b.stretch = Math.max(0, b.stretch - dt); });
    stretchIn -= dt;
    if (stretchIn > 0) return;
    stretchIn = between(K.stretch.min, K.stretch.max);
    var still = bats.filter(function (b) { return b.stretch === 0; });
    if (!still.length) return;
    var b = still[Math.floor(Math.random() * still.length)];
    b.stretch = K.stretch.time;
    b.side = Math.random() < 0.5 ? -1 : 1;
  }

  // A drop falls from a stalactite (quicker and quicker); when it lands, a ring opens on its puddle with a "plic".
  function updateDrops(dt) {
    drops.forEach(function (d) { d.t += dt; });
    drops = drops.filter(function (d) {
      if (d.t < d.time) return true;
      var p = puddleOf(d.i);
      rings.push({ x: p.x, y: p.y, age: 0 });
      Sound.playAt("cave", "drip");
      return false;
    });
    rings.forEach(function (r) { r.age += dt; });
    rings = rings.filter(function (r) { return r.age < 1.1; });
    dripIn -= dt;
    if (dripIn > 0) return;
    dripIn = between(K.drip.min, K.drip.max);
    drops.push({ i: DRIPS[Math.floor(Math.random() * DRIPS.length)], t: 0, time: 0.55 });
  }

  // Where a falling drop is right now.
  function dropSpot(d) {
    var s = STALACTITES[d.i], top = ceilY(s[0]) + s[1], p = puddleOf(d.i), t = Math.min(1, d.t / d.time);
    return { x: s[0], y: top + (p.y - top) * t * t };
  }

  // ---------- Chispa ----------

  var D = K.dragon;
  // How big Chispa is drawn.
  var SIZE = 1.9;
  // mode: "rest", "walk", "bed" (going to her nest) or "sleep". "act" is a reaction to a tap, or her fire:
  // { kind, t, time, done }.
  var dragon = { x: NEST.x - 110, y: NEST.y + 60, dir: -1, lift: 0, way: [], mode: "rest", wait: between(1, 3), flying: false,
    act: null, last: null, sparksIn: between(D.sparks.min, D.sparks.max), fireIn: between(D.fire.min, D.fire.max) };
  var ACTS = { sneeze: 1.4, wag: 1.8, spin: 2.2, fire: D.fire.time };

  // True from 20:00 to 06:00, when Chispa sleeps.
  function isSleepTime() {
    var m = Time.get().minute;
    return m >= D.sleep || m < D.wake;
  }

  function isAsleep() {
    return dragon.mode === "sleep";
  }

  // How high Chispa is over the floor right now: a low flight, and very high while she spins in the air.
  function dragonLift() {
    var lift = dragon.lift;
    if (dragon.act && dragon.act.kind === "spin") lift += Math.sin(Math.min(1, dragon.act.t / dragon.act.time) * Math.PI) * 90;
    if (dragon.act && dragon.act.kind === "wag") lift += Math.abs(Math.sin(dragon.act.t * 9)) * 4;
    return lift;
  }

  // The box where Chispa is drawn, for taps and the word.
  function dragonAt(x, y) {
    var k = SIZE, top = dragon.y - dragonLift();
    return Math.abs(x - (dragon.x - dragon.dir * 4 * k)) <= 46 * k && y <= top + 6 && y >= top - 58 * k;
  }

  // Where her mouth is, for the sparks and the fire.
  function mouth() {
    var k = SIZE;
    return { x: dragon.x + dragon.dir * 46 * k, y: dragon.y - dragonLift() - 43 * k };
  }

  // A few colored sparks out of a spot: they go up, spread and fade.
  function burst(at, n, up, spread) {
    for (var i = 0; i < n; i++) {
      sparks.push({ x: at.x, y: at.y, vx: dragon.dir * between(10, 40) + between(-spread, spread), vy: -between(up * 0.5, up),
        age: 0, life: between(1, 1.8), size: between(2.6, 4.4),
        color: K.sparkColors[Math.floor(Math.random() * K.sparkColors.length)] });
    }
  }

  function updateSparks(dt) {
    sparks.forEach(function (s) {
      s.age += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= Math.pow(0.4, dt);
      s.vy -= 10 * dt;
    });
    sparks = sparks.filter(function (s) { return s.age < s.life; });
  }

  // Her fire: flames come out of her mouth forward, grow, turn from yellow to red, go up a little and fade.
  function blow(dt) {
    var at = mouth(), n = Math.max(1, Math.round(dt * 70));
    for (var i = 0; i < n; i++) {
      flames.push({ x: at.x, y: at.y + between(-3, 3), vx: dragon.dir * between(150, 240), vy: between(-30, 18), age: 0,
        life: between(0.45, 0.8), size: between(4, 7) });
    }
  }

  // The light of her fire: "level" goes from 0 (out) to 1 (all lit), and "burn" is how much it flickers.
  var fireLight = { level: 0, burn: 0 };

  // It comes in while she breathes fire, and goes out slowly when the fire ends.
  function updateFireLight(dt) {
    var L = D.light, burning = !!(dragon.act && dragon.act.kind === "fire");
    if (burning) fireLight.level = Math.min(1, fireLight.level + dt / L.rise);
    else fireLight.level = Math.max(0, fireLight.level - dt / L.fade);
    fireLight.burn += ((burning ? 1 : 0) - fireLight.burn) * Math.min(1, dt * 3);
  }

  // Where the light is: just ahead of her mouth, where the flames are. It moves with her, flying too.
  function fireLightSpot() {
    var at = mouth();
    return { x: at.x + dragon.dir * 50, y: at.y + 14 };
  }

  // How bright the light of her fire is right now, from 0 to about 1: it comes and goes softly, and flickers.
  function fireLightPower() {
    var l = fireLight.level;
    if (l <= 0) return 0;
    var flicker = Math.sin(clock * 11) * 0.09 + Math.sin(clock * 17.3 + 1.2) * 0.06 + Math.sin(clock * 29 + 2.5) * 0.04;
    return l * l * (3 - 2 * l) * (1 + flicker * fireLight.burn);
  }

  // How much the light of her fire reaches a spot, from 0 to 1: for the crystals that shine more.
  function fireLightAt(x, y) {
    var power = fireLightPower();
    if (!power) return 0;
    var at = fireLightSpot();
    return power * Math.max(0, 1 - dist(x, y, at.x, at.y) / D.light.reach);
  }

  function updateFlames(dt) {
    flames.forEach(function (f) {
      f.age += dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.vx *= Math.pow(0.2, dt);
      f.vy -= 40 * dt;
    });
    flames = flames.filter(function (f) { return f.age < f.life; });
  }

  // A tap on Chispa: by day one of her three tricks (never the same twice in a row), at night "Shhh".
  function tapDragon() {
    if (isAsleep() || dragon.mode === "bed") {
      popAt(dragon.x, dragon.y - 70, "Shhh, Chispa está durmiendo 😴", "chispa");
      return;
    }
    if (dragon.act) return;
    var kinds = ["sneeze", "wag", "spin"].filter(function (k) { return k !== dragon.last; });
    var kind = kinds[Math.floor(Math.random() * kinds.length)];
    dragon.last = kind;
    dragon.act = { kind: kind, t: 0, time: ACTS[kind], done: false };
    if (kind === "wag") popAt(dragon.x, dragon.y - 70 * SIZE, "💚", "chispa", true);
  }

  // Chispa goes somewhere new on the floor: walking, or now and then flying low.
  function pickWalk() {
    var to = Path.free("cave", between(130, W - 130), between(250, 600));
    dragon.way = Path.find("cave", dragon.x, dragon.y, to.x, to.y);
    dragon.flying = Math.random() < D.flyChance;
    dragon.mode = "walk";
  }

  // Along her way, a little each frame.
  function stepDragon(dt, speed) {
    var step = speed * dt;
    while (dragon.way.length && step > 0) {
      var p = dragon.way[0], d = dist(dragon.x, dragon.y, p.x, p.y);
      if (Math.abs(p.x - dragon.x) > 1) dragon.dir = p.x > dragon.x ? 1 : -1;
      if (d <= step) {
        dragon.x = p.x;
        dragon.y = p.y;
        step -= d;
        dragon.way.shift();
      } else {
        dragon.x += (p.x - dragon.x) / d * step;
        dragon.y += (p.y - dragon.y) / d * step;
        step = 0;
      }
    }
  }

  // Not on screen when the night comes (or loading at night): she is already asleep in her nest.
  function putToBed() {
    dragon.x = NEST.x;
    dragon.y = NEST.y + 2;
    dragon.way = [];
    dragon.act = null;
    dragon.lift = 0;
    dragon.flying = false;
    dragon.mode = "sleep";
  }

  function updateDragon(dt) {
    var a = dragon.act;
    if (a) {
      a.t += dt;
      if (a.kind === "sneeze" && !a.done && a.t >= 0.55) {
        a.done = true;
        burst(mouth(), 16, 70, 34);
        var m = mouth();
        popAt(m.x + dragon.dir * 10, m.y - 22, "¡Achís!", "sneeze", true);
        Sound.playAt("cave", "sneeze");
      }
      if (a.kind === "fire" && a.t < a.time - 0.35) blow(dt);
      if (a.t >= a.time) dragon.act = null;
    }
    var target = dragon.flying && dragon.way.length ? 16 : 0;
    dragon.lift += (target - dragon.lift) * Math.min(1, dt * 4);
    if (isSleepTime()) {
      if (isAsleep() || dragon.act) return;
      if (dragon.mode !== "bed") {
        dragon.mode = "bed";
        dragon.flying = false;
        dragon.way = Path.find("cave", dragon.x, dragon.y, NEST.x, NEST.y + 2);
      }
      stepDragon(dt, D.walk);
      if (!dragon.way.length) {
        dragon.x = NEST.x;
        dragon.y = NEST.y + 2;
        dragon.mode = "sleep";
      }
      return;
    }
    if (isAsleep() || dragon.mode === "bed") {
      dragon.mode = "rest";
      dragon.way = [];
      dragon.wait = between(1, 3);
    }
    if (dragon.act) return;
    // Now and then she spits a few sparks on her own.
    dragon.sparksIn -= dt;
    if (dragon.sparksIn <= 0) {
      dragon.sparksIn = between(D.sparks.min, D.sparks.max);
      burst(mouth(), 10, 50, 18);
    }
    // And sometimes she stops and breathes fire.
    dragon.fireIn -= dt;
    if (dragon.fireIn <= 0) {
      dragon.fireIn = between(D.fire.min, D.fire.max);
      dragon.act = { kind: "fire", t: 0, time: ACTS.fire, done: true };
      Sound.playAt("cave", "fire");
      return;
    }
    if (dragon.mode === "walk") {
      stepDragon(dt, dragon.flying ? D.fly : D.walk);
      if (dragon.way.length) return;
      dragon.mode = "rest";
      dragon.flying = false;
      dragon.wait = between(D.rest.min, D.rest.max);
      return;
    }
    dragon.wait -= dt;
    if (dragon.wait <= 0) pickWalk();
  }

  // ---------- Update ----------

  var wasNight = null;
  var tinkleIn = between(2, K.tinkle.max);

  function update(dt) {
    var paused = Needs.isPaused();
    pops.forEach(function (p) { p.age += dt; });
    pops = pops.filter(function (p) { return p.age < K.popTime; });
    var night = isSleepTime();
    if (wasNight === null ? night : night && !wasNight && Sims.viewPlace() !== "cave") putToBed();
    wasNight = night;
    updateGathering(dt, paused);
    if (paused) return;
    clock += dt;
    updateBats(dt);
    updateDrops(dt);
    updateDragon(dt);
    updateSparks(dt);
    updateFlames(dt);
    updateFireLight(dt);
    // The crystals tinkle softly now and then.
    tinkleIn -= dt;
    if (tinkleIn <= 0) {
      tinkleIn = between(K.tinkle.min, K.tinkle.max);
      Sound.playAt("cave", "tinkle");
    }
    // New crystals only appear while the game runs.
    regrow = regrow.filter(function (left) { return left > 0; });
    for (var i = 0; i < regrow.length; i++) {
      regrow[i] -= dt;
      if (regrow[i] > 0) continue;
      if (crystals.length >= K.max) {
        regrow[i] = -1;
      } else if (!spawn()) {
        regrow[i] = 5;
      }
    }
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

  // "#RRGGBB" as "r, g, b", for see-through colors.
  function rgb(hex) {
    return parseInt(hex.substr(1, 2), 16) + ", " + parseInt(hex.substr(3, 2), 16) + ", " + parseInt(hex.substr(5, 2), 16);
  }

  // A soft round light of a color, added over the dark (like a glow on the floor and the walls).
  function halo(ctx, x, y, r, hex, strength) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(" + rgb(hex) + ", " + strength + ")");
    g.addColorStop(0.45, "rgba(" + rgb(hex) + ", " + strength * 0.4 + ")");
    g.addColorStop(1, "rgba(" + rgb(hex) + ", 0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // How bright a crystal is right now: they twinkle slowly, each one at its own pace.
  function twinkle(i) {
    return 0.8 + Math.sin(clock * (0.9 + hash(i, 7) * 0.8) + i * 2.1) * 0.2;
  }

  function drawFloor(ctx) {
    ctx.fillStyle = K.floor;
    ctx.fillRect(0, 0, W, H);
    // Flat stones and cracks on the floor.
    for (var gy = 30; gy < H; gy += 50) {
      for (var gx = 24; gx < W; gx += 58) {
        var x = gx + (hash(gx, gy) - 0.5) * 30, y = gy + (hash(gy, gx) - 0.5) * 20;
        ctx.globalAlpha = 0.45;
        ellipse(ctx, x, y, 14 + hash(gx, gy + 1) * 12, 6 + hash(gx + 1, gy) * 4, (gx + gy) % 3 === 0 ? K.floorDark : K.floorLight);
      }
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(30, 28, 34, 0.45)";
    ctx.lineWidth = 1.4;
    [[180, 300, 240, 330, 260, 380], [560, 420, 620, 440, 650, 500], [330, 600, 380, 580, 440, 610],
      [820, 330, 790, 360, 800, 400]].forEach(function (c) {
      ctx.beginPath();
      ctx.moveTo(c[0], c[1]);
      ctx.quadraticCurveTo(c[2], c[3], c[4], c[5]);
      ctx.stroke();
    });
  }

  // The little puddles under the stalactites that drip, and the rings when a drop lands.
  function drawPuddles(ctx) {
    DRIPS.forEach(function (i) {
      var p = puddleOf(i);
      ellipse(ctx, p.x, p.y, 20, 7, "rgba(40, 52, 70, 0.85)");
      ellipse(ctx, p.x - 4, p.y - 1.5, 9, 2.4, "rgba(170, 210, 235, 0.35)");
    });
    rings.forEach(function (r) {
      var t = r.age / 1.1;
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = "rgba(190, 225, 245, 0.9)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, 4 + t * 16, 1.5 + t * 5.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  // The light of the crystals, the nest and the way out, added over the dark floor and walls.
  function drawLights(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    CLUSTERS.forEach(function (c, i) {
      var more = 1 + fireLightAt(c.x, c.y - c.r * 0.4) * 0.7;
      halo(ctx, c.x, c.y - c.r * 0.4, c.r * 5, COLORS[c.color], 0.34 * twinkle(i) * more);
    });
    crystals.forEach(function (s, i) {
      var gold = s.kind === "crystalGold", more = 1 + fireLightAt(s.x, s.y - 6) * 0.7;
      halo(ctx, s.x, s.y - 6, gold ? 84 : 46, COLORS[kindOf(s.kind).color], (gold ? 0.5 : 0.28) * twinkle(i + 20) * more);
    });
    halo(ctx, NEST.x, NEST.y, 130, K.amethyst, 0.24 * twinkle(40));
    halo(ctx, NEST.x, NEST.y, 86, K.blue, 0.14 * twinkle(41));
    // The light of outside: warm by day, soft blue at night.
    var night = Time.darkness();
    var outside = night > 0.5 ? "#9AB0E6" : "#FFE2A8";
    halo(ctx, EXIT.x, H, 170, outside, 0.34 - night * 0.12);
    // The warm light of Chispa's fire: big and orange, with gold in the middle.
    var power = fireLightPower();
    if (power > 0) {
      var at = fireLightSpot();
      halo(ctx, at.x, at.y, D.light.radius, K.fireOrange, 0.4 * power);
      halo(ctx, at.x, at.y, D.light.radius * 0.5, K.fireGold, 0.3 * power);
    }
    ctx.restore();
  }

  // A soft touch of the warm light over what stands (Chispa, the clusters and the nest), so they look lit too.
  function drawFireLightOver(ctx) {
    var power = fireLightPower();
    if (power <= 0) return;
    var at = fireLightSpot();
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    halo(ctx, at.x, at.y, D.light.radius * 0.7, K.fireOrange, 0.12 * power);
    ctx.restore();
  }

  // The rock walls around the floor: the top one (the ceiling's edge), the sides and the bottom with the way out.
  function drawWalls(ctx) {
    ctx.save();
    // The way out: light from outside coming in through the gap of the bottom wall.
    var night = Time.darkness() > 0.5;
    var g = ctx.createLinearGradient(0, H, 0, FLOOR.bottom - 20);
    g.addColorStop(0, night ? "rgba(150, 170, 225, 0.9)" : "rgba(255, 236, 190, 0.95)");
    g.addColorStop(1, night ? "rgba(150, 170, 225, 0)" : "rgba(255, 236, 190, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(EXIT.x - EXIT.half - 26, H);
    ctx.lineTo(EXIT.x - EXIT.half - 4, FLOOR.bottom - 10);
    ctx.lineTo(EXIT.x + EXIT.half + 4, FLOOR.bottom - 10);
    ctx.lineTo(EXIT.x + EXIT.half + 26, H);
    ctx.closePath();
    ctx.fill();

    // The bottom wall, on both sides of the way out.
    [[0, EXIT.x - EXIT.half - 16], [EXIT.x + EXIT.half + 16, W]].forEach(function (side, k) {
      ctx.beginPath();
      ctx.moveTo(side[0], H + 4);
      for (var x = side[0]; x <= side[1]; x += 20) ctx.lineTo(x, bottomY(x));
      ctx.lineTo(side[1], bottomY(side[1]));
      if (k === 0) ctx.quadraticCurveTo(side[1] + 8, bottomY(side[1]) + 10, side[1] + 4, H + 4);
      else ctx.quadraticCurveTo(side[0] - 8, bottomY(side[0]) + 10, side[0] - 4, H + 4);
      ctx.closePath();
      ctx.fillStyle = K.rock;
      ctx.fill();
      ctx.strokeStyle = K.rockLight;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // The side walls.
    ctx.fillStyle = K.rock;
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    for (var y = 0; y <= H; y += 20) ctx.lineTo(leftX(y), y);
    ctx.lineTo(-4, H);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = K.rockLight;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W + 4, 0);
    for (var y2 = 0; y2 <= H; y2 += 20) ctx.lineTo(rightX(y2), y2);
    ctx.lineTo(W + 4, H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // The top wall, darker up high.
    var top = ctx.createLinearGradient(0, 0, 0, 160);
    top.addColorStop(0, K.rockDark);
    top.addColorStop(1, K.rock);
    ctx.fillStyle = top;
    ctx.beginPath();
    ctx.moveTo(-4, -4);
    ctx.lineTo(W + 4, -4);
    for (var x2 = W; x2 >= 0; x2 -= 16) ctx.lineTo(x2, ceilY(x2));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = K.rockLight;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (var x3 = 0; x3 <= W; x3 += 16) {
      if (x3 === 0) ctx.moveTo(x3, ceilY(x3)); else ctx.lineTo(x3, ceilY(x3));
    }
    ctx.stroke();
    // Lumps of rock on the walls.
    for (var i = 0; i < 18; i++) {
      ellipse(ctx, 30 + i * 56 + hash(i, 3) * 20, 40 + hash(i, 4) * 80, 20 + hash(i, 5) * 16, 8 + hash(i, 6) * 6,
        "rgba(255, 255, 255, 0.05)");
    }
    ctx.restore();
  }

  // A stalactite: a pointy stone hanging from the top wall, lighter on one side.
  function drawStalactite(ctx, s) {
    var x = s[0], top = ceilY(x) - 6, len = s[1], w = 7 + len * 0.12;
    ctx.beginPath();
    ctx.moveTo(x - w, top);
    ctx.quadraticCurveTo(x - w * 0.5, top + len * 0.6, x, top + len);
    ctx.quadraticCurveTo(x + w * 0.5, top + len * 0.6, x + w, top);
    ctx.closePath();
    ctx.fillStyle = K.rockLight;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.quadraticCurveTo(x + w * 0.5, top + len * 0.6, x, top + len);
    ctx.quadraticCurveTo(x + w * 0.25, top + len * 0.5, x + w, top);
    ctx.closePath();
    ctx.fillStyle = "rgba(20, 18, 24, 0.35)";
    ctx.fill();
  }

  // A cluster of crystals: shards like little pointy columns, each with a light and a shady face, and a soft shine.
  function drawCluster(ctx, c, i) {
    var color = COLORS[c.color], bright = twinkle(i) + fireLightAt(c.x, c.y - c.r * 0.4) * 0.3;
    ctx.save();
    ctx.translate(c.x, c.y);
    ellipse(ctx, 0, 2, c.r * 1.05, c.r * 0.34, "rgba(15, 12, 20, 0.45)");
    for (var k = 0; k < c.shards; k++) {
      var spread = (k / (c.shards - 1) - 0.5) * 1.4 + (hash(i, k) - 0.5) * 0.2;
      var h = c.r * (0.9 + hash(i, k + 10) * 0.9) * (1 - Math.abs(spread) * 0.35);
      var w = c.r * (0.2 + hash(i, k + 20) * 0.1);
      shard(ctx, Math.sin(spread) * c.r * 0.55, 0, h, w, spread * 0.6, color, bright);
    }
    ctx.restore();
  }

  // One shard, from its foot: a column with a pointy top, leaning by "lean".
  function shard(ctx, x, y, h, w, lean, color, bright) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lean);
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.moveTo(-w, 0);
    ctx.lineTo(-w, -h * 0.72);
    ctx.lineTo(0, -h);
    ctx.lineTo(w, -h * 0.72);
    ctx.lineTo(w, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    // The shady face and the shine.
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -h);
    ctx.lineTo(w, -h * 0.72);
    ctx.lineTo(w, 0);
    ctx.closePath();
    ctx.fillStyle = "rgba(40, 20, 70, 0.22)";
    ctx.fill();
    ctx.globalAlpha = Math.min(1, 0.35 + bright * 0.5);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(-w * 0.6, -h * 0.2);
    ctx.lineTo(-w * 0.6, -h * 0.68);
    ctx.lineTo(-w * 0.15, -h * 0.85);
    ctx.lineTo(-w * 0.15, -h * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // A crystal on the floor: three little shards of its color. The gold one has a twinkling star of light.
  function drawCrystal(ctx, s, i) {
    var color = COLORS[kindOf(s.kind).color], bright = twinkle(i + 20) + fireLightAt(s.x, s.y - 6) * 0.3;
    var gold = s.kind === "crystalGold";
    ctx.save();
    ctx.translate(s.x, s.y);
    if (hover === s) {
      ctx.save();
      ctx.shadowColor = C.cream;
      ctx.shadowBlur = 16;
      ellipse(ctx, 0, -8, 20, 18, "rgba(245, 235, 221, 0.3)");
      ctx.strokeStyle = C.sage;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
    ctx.rotate(s.turn * 0.4);
    ctx.scale(1.25, 1.25);
    ellipse(ctx, 0, 1, 11, 3.5, "rgba(15, 12, 20, 0.5)");
    shard(ctx, -5, 0, 13, 3.2, -0.45, color, bright);
    shard(ctx, 5, 0, 12, 3, 0.45, color, bright);
    shard(ctx, 0, 1, 18, 3.8, 0, color, bright);
    if (gold) {
      var t = 0.5 + Math.sin(clock * 3 + s.x) * 0.5, k = 3 + t * 3;
      ctx.globalAlpha = 0.5 + t * 0.5;
      ctx.fillStyle = "#FFFBEA";
      ctx.beginPath();
      ctx.moveTo(6, -22 - k);
      ctx.lineTo(7, -23);
      ctx.lineTo(6 + k, -22);
      ctx.lineTo(7, -21);
      ctx.lineTo(6, -22 + k);
      ctx.lineTo(5, -21);
      ctx.lineTo(6 - k, -22);
      ctx.lineTo(5, -23);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Chispa's nest: a round bed of little crystals of colors around a soft hollow.
  function drawNest(ctx) {
    ctx.save();
    ellipse(ctx, NEST.x, NEST.y + 2, NEST.rx + 4, NEST.ry + 4, "rgba(15, 12, 20, 0.45)");
    ellipse(ctx, NEST.x, NEST.y, NEST.rx, NEST.ry, "#5A4E6A");
    ellipse(ctx, NEST.x, NEST.y + 1, NEST.rx - 10, NEST.ry - 6, "#3E3549");
    var colors = [K.blue, K.amethyst, K.pink];
    for (var k = 0; k < 16; k++) {
      var a = k / 16 * Math.PI * 2;
      var x = NEST.x + Math.cos(a) * (NEST.rx - 4), y = NEST.y + Math.sin(a) * (NEST.ry - 2);
      // The ones at the back first, so the front ones cover them.
      if (Math.sin(a) > 0) continue;
      shard(ctx, x, y, 12 + hash(k, 2) * 7, 3.4, Math.cos(a) * 0.5, colors[k % 3], twinkle(k + 50));
    }
    for (var j = 0; j < 16; j++) {
      var b = j / 16 * Math.PI * 2;
      if (Math.sin(b) <= 0) continue;
      shard(ctx, NEST.x + Math.cos(b) * (NEST.rx - 4), NEST.y + Math.sin(b) * (NEST.ry - 2), 11 + hash(j, 3) * 6, 3.4,
        Math.cos(b) * 0.5, colors[j % 3], twinkle(j + 50));
    }
    ctx.restore();
  }

  // A bat sleeping upside down from the top wall: its feet on the rock, its body wrapped in its wings, its head down with
  // two little ears and closed eyes. Stretching, one wing opens to the side and closes again.
  var BAT_SIZE = 1.6;

  function drawBat(ctx, b) {
    var x = b.x, top = ceilY(x) - 2, sway = Math.sin(clock * 1.2 + b.i * 1.7) * 0.06;
    ctx.save();
    ctx.translate(x, top);
    ctx.rotate(sway);
    ctx.scale(BAT_SIZE, BAT_SIZE);
    ctx.strokeStyle = K.batDark;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(-2, 6);
    ctx.moveTo(2, 0);
    ctx.lineTo(2, 6);
    ctx.stroke();
    // The open wing, while it stretches.
    var open = b.stretch > 0 ? Math.sin((1 - b.stretch / K.stretch.time) * Math.PI) : 0;
    if (open > 0) {
      ctx.save();
      ctx.translate(b.side * 6, 10);
      ctx.scale(b.side, 1);
      ctx.rotate(-0.4 + open * 0.2);
      var reach = 6 + open * 18;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(reach, -4);
      ctx.quadraticCurveTo(reach - 3, 4, reach - 6, 8);
      ctx.quadraticCurveTo(reach - 9, 4, reach - 12, 11);
      ctx.quadraticCurveTo(reach - 14, 8, 0, 16);
      ctx.closePath();
      ctx.fillStyle = K.bat;
      ctx.fill();
      ctx.strokeStyle = K.batDark;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
    // The body wrapped in its wings.
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(9, 5, 10, 18, 6, 24);
    ctx.quadraticCurveTo(0, 28, -6, 24);
    ctx.bezierCurveTo(-10, 18, -9, 5, 0, 5);
    ctx.closePath();
    ctx.fillStyle = K.bat;
    ctx.fill();
    ctx.strokeStyle = K.batDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.lineTo(0, 22);
    ctx.stroke();
    // The head, down, with its ears and closed eyes.
    circle(ctx, 0, 27, 5.2, K.bat);
    ctx.fillStyle = K.bat;
    ctx.beginPath();
    ctx.moveTo(-4.5, 29);
    ctx.lineTo(-5.5, 36);
    ctx.lineTo(-1.5, 31);
    ctx.moveTo(4.5, 29);
    ctx.lineTo(5.5, 36);
    ctx.lineTo(1.5, 31);
    ctx.fill();
    ctx.strokeStyle = "#E9DDF5";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(-2, 27.5, 1.2, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.moveTo(3.2, 27.5);
    ctx.arc(2, 27.5, 1.2, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  // Chispa: a young dragon, mint green, with a cream belly with scales, four strong legs with little claws, big wings,
  // spikes along her back and neck, a long tail with a pointy tip, a long head with two horns that curve back and golden
  // eyes. Flying, her wings flap; asleep she curls up with her tail around her and her eyes closed. "spin" turns her
  // around in the air, "sneeze" throws her head back and then forward, "wag" wags her tail fast, and with "fire" she
  // leans forward with her mouth open.
  function drawDragon(ctx) {
    var k = SIZE, lift = dragonLift(), a = dragon.act, asleep = isAsleep();
    ctx.save();
    ctx.translate(dragon.x, dragon.y);
    ellipse(ctx, -dragon.dir * 4 * k, 1, 34 * k * (1 - Math.min(0.5, lift / 160)), 7 * k, "rgba(10, 8, 14, 0.4)");
    ctx.translate(0, -lift);
    ctx.scale(dragon.dir * k, k);
    if (asleep) {
      drawSleeping(ctx);
      ctx.restore();
      return;
    }
    if (a && a.kind === "spin") {
      var t = Math.min(1, a.t / a.time), turn = Math.max(0, Math.min(1, (t - 0.25) / 0.5));
      ctx.translate(0, -22);
      ctx.rotate(turn * Math.PI * 2);
      ctx.translate(0, 22);
    }
    var flying = (dragon.flying && dragon.way.length) || (a && a.kind === "spin");
    var steps = dragon.mode === "walk" && !flying ? Math.sin(clock * 8) : 0;
    // The tail: swaying softly, fast while she is happy.
    var wag = a && a.kind === "wag" ? Math.sin(a.t * 18) * 0.4 : Math.sin(clock * 1.8) * 0.08;
    ctx.save();
    ctx.translate(-16, -14);
    ctx.rotate(wag);
    tail(ctx, 0, 0);
    ctx.restore();
    // The legs on the far side, the far wing, the body, the neck and the near legs and wing.
    leg(ctx, -12 - steps * 2, flying, K.mintDark);
    leg(ctx, 11 + steps * 2, flying, K.mintDark);
    wing(ctx, -3, -29, flying, 1);
    ellipse(ctx, 0, -18, 22, 14, K.mint);
    ellipse(ctx, 0, -9, 18, 5, "rgba(20, 60, 45, 0.12)");
    ellipse(ctx, 6, -14, 13, 9, K.belly);
    ctx.strokeStyle = "#E3CDA6";
    ctx.lineWidth = 1;
    [0, 4, 8].forEach(function (dx) {
      ctx.beginPath();
      ctx.arc(dx, -14, 8, 0.35 * Math.PI, 0.65 * Math.PI);
      ctx.stroke();
    });
    // The neck, leaning forward while she breathes fire.
    var lean = a && a.kind === "fire" ? 0.12 : 0;
    ctx.save();
    ctx.translate(12, -24);
    ctx.rotate(lean);
    ctx.translate(-12, 24);
    ctx.fillStyle = K.mint;
    ctx.beginPath();
    ctx.moveTo(6, -28);
    ctx.quadraticCurveTo(12, -42, 24, -48);
    ctx.lineTo(32, -38);
    ctx.quadraticCurveTo(22, -28, 20, -12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = K.belly;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(21, -14);
    ctx.quadraticCurveTo(23, -27, 30, -36);
    ctx.stroke();
    // The spikes along her back and neck.
    [[-17, -27, 4], [-9, -31, 5], [-1, -32, 5.5], [7, -31, 5], [13, -38, 4.5], [19, -45, 4]].forEach(function (p) {
      ctx.fillStyle = K.mintDark;
      ctx.beginPath();
      ctx.moveTo(p[0] - p[2] * 0.7, p[1] + 2);
      ctx.lineTo(p[0] - p[2] * 0.5, p[1] - p[2]);
      ctx.lineTo(p[0] + p[2] * 0.7, p[1] + 2);
      ctx.closePath();
      ctx.fill();
    });
    // The head: thrown back and then forward while she sneezes, the mouth open for the fire and the sneeze.
    var tilt = 0;
    if (a && a.kind === "sneeze") tilt = a.t < 0.5 ? -0.35 * (a.t / 0.5) : a.t < 0.75 ? 0.3 : 0.3 * (1 - (a.t - 0.75) / (a.time - 0.75));
    ctx.translate(26, -40);
    ctx.rotate(tilt);
    ctx.translate(-26, 40);
    var open = a && ((a.kind === "fire" && a.t < a.time - 0.2) || (a.kind === "sneeze" && a.t >= 0.5 && a.t < 0.9));
    head(ctx, 30, -44, false, open);
    ctx.restore();
    leg(ctx, -5 + steps * 2, flying, K.mint);
    leg(ctx, 17 - steps * 2, flying, K.mint);
    wing(ctx, 1, -28, flying, 0);
    ctx.restore();
  }

  // The long tail, from where it meets the body, with a pointy tip like an arrow.
  function tail(ctx, x, y) {
    ctx.strokeStyle = K.mint;
    ctx.lineCap = "round";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - 18, y + 12, x - 34, y + 4);
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x - 34, y + 4);
    ctx.quadraticCurveTo(x - 43, y, x - 47, y - 10);
    ctx.stroke();
    ctx.fillStyle = K.mintDark;
    ctx.beginPath();
    ctx.moveTo(x - 46, y - 8);
    ctx.lineTo(x - 53, y - 9);
    ctx.lineTo(x - 52, y - 22);
    ctx.lineTo(x - 42, y - 14);
    ctx.closePath();
    ctx.fill();
  }

  // A strong leg with three little claws; tucked up while she flies.
  function leg(ctx, x, flying, color) {
    var h = flying ? 8 : 13, top = flying ? -16 : -13;
    fillRound(ctx, x - 4.5, top, 9, h, 4, color);
    [-3, 0, 3].forEach(function (dx) { circle(ctx, x + dx + 1, top + h - 0.5, 1.4, K.hornColor); });
  }

  // A big wing like a bat's: a bone with three long fingers and the skin between them, flapping while she flies.
  // "back" is the wing on the far side (a little darker).
  function wing(ctx, x, y, flying, back) {
    var flap = flying ? Math.sin(clock * 14) * 0.7 : Math.sin(clock * 1.2) * 0.05;
    var tips = [[-6, -30], [-22, -26], [-31, -12], [-28, 1]];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.35 + flap - back * 0.3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(tips[0][0], tips[0][1]);
    ctx.quadraticCurveTo(-12, -21, tips[1][0], tips[1][1]);
    ctx.quadraticCurveTo(-23, -15, tips[2][0], tips[2][1]);
    ctx.quadraticCurveTo(-24, -6, tips[3][0], tips[3][1]);
    ctx.quadraticCurveTo(-14, -2, 0, 0);
    ctx.closePath();
    ctx.fillStyle = back ? "#4FA885" : "rgba(108, 200, 163, 0.96)";
    ctx.fill();
    ctx.strokeStyle = back ? "#3C8A6C" : "#4E9C7E";
    ctx.lineCap = "round";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(tips[0][0], tips[0][1]);
    ctx.stroke();
    ctx.lineWidth = 1.2;
    tips.slice(1).forEach(function (p) {
      ctx.beginPath();
      ctx.moveTo(tips[0][0] * 0.8, tips[0][1] * 0.8);
      ctx.lineTo(p[0], p[1]);
      ctx.stroke();
    });
    ctx.restore();
  }

  // Chispa's head at (x, y): two horns curving back, a long snout with a nostril and a little fang, a brow and a golden
  // eye with a thin pupil (or closed). "open" opens her mouth.
  function head(ctx, x, y, closed, open) {
    [["#E8CF97", 3, -9, -12, -19], [K.hornColor, -1, -7, -17, -13]].forEach(function (h) {
      ctx.fillStyle = h[0];
      ctx.beginPath();
      ctx.moveTo(x + h[1], y + h[2]);
      ctx.quadraticCurveTo(x + h[3] * 0.5, y + h[4] - 2, x + h[3], y + h[4]);
      ctx.quadraticCurveTo(x + h[3] * 0.4, y + h[4] * 0.4, x + h[1] - 5, y + h[2] + 5);
      ctx.closePath();
      ctx.fill();
    });
    ellipse(ctx, x, y, 10.5, 8.5, K.mint);
    fillRound(ctx, x + 1, y - 3, 18, 10, 5, K.mint);
    if (open) {
      ctx.fillStyle = "#6B2D2D";
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 3);
      ctx.lineTo(x + 19, y + 1);
      ctx.lineTo(x + 18, y + 8);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.strokeStyle = "#4E9C7E";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 4);
      ctx.lineTo(x + 17, y + 3.5);
      ctx.stroke();
      ctx.fillStyle = C.white;
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 3.6);
      ctx.lineTo(x + 14, y + 3.5);
      ctx.lineTo(x + 13, y + 6);
      ctx.closePath();
      ctx.fill();
    }
    ellipse(ctx, x + 16, y - 0.5, 1.3, 0.8, "#2F5E4C");
    ctx.strokeStyle = K.mintDark;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 2, y - 5.5);
    ctx.lineTo(x + 7, y - 4);
    ctx.stroke();
    if (closed) {
      ctx.strokeStyle = "#2A2333";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x + 2.5, y - 2.5, 2.6, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    } else {
      ellipse(ctx, x + 2.5, y - 1.5, 3.4, 2.6, "#F5B83D");
      ellipse(ctx, x + 3, y - 1.5, 0.9, 2.3, "#2A2333");
      circle(ctx, x + 1.6, y - 2.6, 0.7, C.white);
    }
  }

  // Asleep in her nest: curled up, her tail wrapped in front, her wings folded and her head resting on her tail.
  function drawSleeping(ctx) {
    var breathe = 1 + Math.sin(clock * 1.4) * 0.03;
    ctx.save();
    ctx.scale(1, breathe);
    ellipse(ctx, -2, -13, 26, 14, K.mint);
    ellipse(ctx, -6, -20, 15, 6, K.mintDark);
    [[-18, -24, 4], [-9, -27, 5], [0, -27, 5], [9, -25, 4.5]].forEach(function (p) {
      ctx.fillStyle = K.mintDark;
      ctx.beginPath();
      ctx.moveTo(p[0] - p[2] * 0.7, p[1] + 2);
      ctx.lineTo(p[0] - p[2] * 0.5, p[1] - p[2]);
      ctx.lineTo(p[0] + p[2] * 0.7, p[1] + 2);
      ctx.closePath();
      ctx.fill();
    });
    ctx.strokeStyle = K.mint;
    ctx.lineCap = "round";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-24, -6);
    ctx.quadraticCurveTo(-18, 6, 8, 3);
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(8, 3);
    ctx.quadraticCurveTo(18, 2, 24, -2);
    ctx.stroke();
    ctx.fillStyle = K.mintDark;
    ctx.beginPath();
    ctx.moveTo(23, -1);
    ctx.lineTo(32, -3);
    ctx.lineTo(25, -9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    head(ctx, 16, -12, true, false);
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

  function drawDragonGlow(ctx) {
    var k = SIZE;
    ctx.save();
    ctx.shadowColor = C.cream;
    ctx.shadowBlur = 18;
    ellipse(ctx, dragon.x - dragon.dir * 4 * k, dragon.y - dragonLift() - 26 * k, 50 * k, 32 * k, "rgba(245, 235, 221, 0.25)");
    ctx.strokeStyle = C.sage;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  function draw(ctx) {
    ctx.save();
    roundRect(ctx, 0, 0, W, H, 40);
    ctx.clip();
    drawFloor(ctx);
    drawPuddles(ctx);
    drawWalls(ctx);
    drawLights(ctx);
    if (hover === "exit") drawGlow(ctx, { x: exitBox().x, y: exitBox().y, w: exitBox().w, h: exitBox().h - 10 });
    STALACTITES.forEach(function (s) { drawStalactite(ctx, s); });
    bats.forEach(function (b) { drawBat(ctx, b); });
    crystals.forEach(function (s, i) { drawCrystal(ctx, s, i); });
    // Everything that stands: whoever is lower is drawn last.
    var things = [];
    CLUSTERS.forEach(function (c, i) { things.push({ y: c.y, draw: function () { drawCluster(ctx, c, i); } }); });
    things.push({ y: NEST.y, draw: function () { drawNest(ctx); } });
    things.push({ y: dragon.y + 0.5, draw: function () {
      if (hover === "dragon") drawDragonGlow(ctx);
      drawDragon(ctx);
    } });
    things.sort(function (a, b) { return a.y - b.y; }).forEach(function (one) { one.draw(); });
    drawFireLightOver(ctx);
    // The drops falling.
    drops.forEach(function (d) {
      var at = dropSpot(d);
      ctx.fillStyle = "rgba(190, 225, 245, 0.95)";
      ctx.beginPath();
      ctx.moveTo(at.x, at.y - 5);
      ctx.quadraticCurveTo(at.x + 3, at.y, at.x, at.y + 2);
      ctx.quadraticCurveTo(at.x - 3, at.y, at.x, at.y - 5);
      ctx.fill();
    });
    ctx.restore();
  }

  // The sign of the place, drawn like the signs of the other zones. It remembers the box it took, for its word.
  function signBox() {
    return SIGN.measured || { x: SIGN.x - SIGN.size * 3, y: SIGN.y - SIGN.size, w: SIGN.size * 6, h: SIGN.size * 2 };
  }

  function drawLabels(ctx) {
    ctx.save();
    ctx.font = "700 " + SIGN.size + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var w = ctx.measureText(SIGN.text).width + SIGN.size * 1.2, h = SIGN.size * 1.7;
    SIGN.measured = { x: SIGN.x - w / 2, y: SIGN.y - h / 2, w: w, h: h };
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    fillRound(ctx, SIGN.x - w / 2, SIGN.y - h / 2, w, h, h / 2, C.darkBrown);
    ctx.shadowColor = "transparent";
    ctx.fillStyle = C.cream;
    ctx.fillText(SIGN.text, SIGN.x, SIGN.y + 1);
    ctx.restore();
  }

  // A small "z" floating up and fading, over Chispa asleep.
  function drawZ(ctx, x, y) {
    var t = (clock * 0.45) % 1;
    ctx.save();
    ctx.globalAlpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
    ctx.font = "700 " + Math.round(15 + t * 5) + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = 3;
    ctx.strokeText("z", x + t * 10, y - t * 24);
    ctx.fillStyle = C.cream;
    ctx.fillText("z", x + t * 10, y - t * 24);
    ctx.restore();
  }

  // Before the characters: the sparks and the fire (glowing) and the "z" of Chispa asleep.
  function drawTop(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    sparks.forEach(function (s) {
      var t = s.age / s.life;
      ctx.globalAlpha = t < 0.2 ? 1 : 1 - (t - 0.2) / 0.8;
      halo(ctx, s.x, s.y, s.size * 5, s.color, 0.75);
      circle(ctx, s.x, s.y, s.size * (1 - t * 0.5), s.color);
    });
    flames.forEach(function (f) {
      var t = f.age / f.life;
      var color = t < 0.25 ? "#FFF1B0" : t < 0.5 ? "#FFC24A" : t < 0.75 ? "#FF8A3D" : "#E8502E";
      ctx.globalAlpha = 1 - t;
      halo(ctx, f.x, f.y, f.size * 3, color, 0.25);
      circle(ctx, f.x, f.y, f.size * (0.6 + t * 1.4), color);
    });
    ctx.restore();
    if (isAsleep()) drawZ(ctx, dragon.x + 30 * SIZE * dragon.dir, dragon.y - 34 * SIZE);
  }

  // The floating texts ("+1 🔷", "¡Achís!", "💚" and "Shhh"), over everything (characters too).
  function drawPops(ctx) {
    pops.forEach(function (p) {
      var t = p.age / K.popTime;
      ctx.save();
      ctx.globalAlpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      ctx.font = "bold " + (p.small ? 17 : 22) + "px " + CONFIG.fontFamily;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var ty = p.y - t * (p.small ? 24 : 40);
      ctx.lineWidth = p.small ? 4 : 5;
      ctx.strokeStyle = C.darkBrown;
      ctx.strokeText(p.text, p.x, ty);
      ctx.fillStyle = C.cream;
      ctx.fillText(p.text, p.x, ty);
      ctx.restore();
    });
  }

  // ---------- Words ----------

  // The id of the word for what is at a spot of the Cueva, or null. Small things win over big ones.
  function wordAt(x, y) {
    if (x < 0 || x > W || y < 0 || y > H) return null;
    for (var i = pops.length - 1; i >= 0; i--) {
      var p = pops[i];
      if (p.word && Math.abs(x - p.x) < 80 && Math.abs(y - (p.y - p.age / K.popTime * (p.small ? 24 : 40))) < 16) return p.word;
    }
    if (sparks.some(function (s) { return near(x, y, s.x, s.y, 10); })) return "sparks";
    var s = crystalAt(x, y);
    if (s) return s.kind;
    if (dragonAt(x, y)) return "chispa";
    if (near(x, y, NEST.x, NEST.y - 4, NEST.rx) && Math.abs(y - NEST.y + 4) <= NEST.ry + 10) return "crystalNest";
    for (var c = CLUSTERS.length - 1; c >= 0; c--) {
      var one = CLUSTERS[c];
      if (Math.abs(x - one.x) <= one.r * 1.1 && y <= one.y + 4 && y >= one.y - one.r * 1.8) return WORD_OF[one.color];
    }
    if (bats.some(function (b) { return Math.abs(x - b.x) <= 10 * BAT_SIZE && y >= ceilY(b.x) && y <= ceilY(b.x) + 36 * BAT_SIZE; })) {
      return "bat";
    }
    if (drops.some(function (d) { var at = dropSpot(d); return near(x, y, at.x, at.y, 8); })) return "drop";
    if (DRIPS.some(function (k) { var q = puddleOf(k); return Math.abs(x - q.x) <= 22 && Math.abs(y - q.y) <= 9; })) return "drop";
    for (var k = 0; k < STALACTITES.length; k++) {
      var st = STALACTITES[k], top = ceilY(st[0]) - 6;
      if (y >= top && y <= top + st[1] && Math.abs(x - st[0]) <= (7 + st[1] * 0.12) * (1 - (y - top) / st[1]) + 2) {
        return "stalactite";
      }
    }
    if (inBox(x, y, exitBox()) || inBox(x, y, signBox())) return "cave";
    if (y < ceilY(x) || x < leftX(y) || x > rightX(y) || y > bottomY(x)) return "rock";
    return null;
  }

  // ---------- Saving ----------

  function get() {
    return {
      crystals: crystals.map(function (s) { return { kind: s.kind, x: s.x, y: s.y }; }),
      regrow: regrow.slice()
    };
  }

  // Used when loading a saved game. Anything strange is left out, and there are always 3 to 5 crystals
  // (counting the ones about to appear). An old saved game keeps the ones of a new game.
  function set(saved) {
    if (!saved || typeof saved !== "object" || !Array.isArray(saved.crystals)) return;
    crystals = saved.crystals.filter(function (s) {
      return s && !!kindOf(s.kind) && typeof s.x === "number" && typeof s.y === "number" && isCrystalSpot(s.x, s.y);
    }).slice(0, K.max).map(function (s) {
      return { kind: s.kind, x: s.x, y: s.y, turn: between(-0.5, 0.5) };
    });
    regrow = (Array.isArray(saved.regrow) ? saved.regrow : []).filter(function (r) {
      return typeof r === "number" && isFinite(r);
    }).map(function (r) {
      return Math.max(0.1, Math.min(K.regrow.max, r));
    }).slice(0, K.max - crystals.length);
    while (crystals.length + regrow.length < K.min) regrow.push(between(K.regrow.min, K.regrow.max));
  }

  // A new game starts with 3 to 5 crystals.
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
    crystalAt: crystalAt,
    dragonAt: dragonAt,
    usableAt: usableAt,
    setHover: setHover,
    tapCrystal: tapCrystal,
    tapDragon: tapDragon,
    cancel: cancel,
    isActive: isActive,
    update: update,
    bubbleFor: bubbleFor,
    draw: draw,
    drawLabels: drawLabels,
    drawTop: drawTop,
    drawPops: drawPops,
    wordAt: wordAt,
    get: get,
    set: set,
    // Modo decorar moves nothing in the Cueva (js/decorate.js).
    movableAt: function () { return null; },
    canTurn: function () { return false; }
  };
})();
