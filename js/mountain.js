// The Montaña: a map below the city, as big as it, seen from above. Mountain grass with patches of gray rock, dirt trails
// that go up and down between the rocks, a little snow at the bottom where the snowy peaks are, its trail at the top that
// goes back to the city (js/valleymap.js has the other end) and its sign.
// 🌲 Pines of different sizes and shapes (tall and thin, short and wide, pointier or rounder, light and dark green) that
// sway in the wind. They are solid. One big pine has a nest 🪺 with three light blue eggs among its branches.
// 🪨 Big rocks (solid); two of them look like they have a little face. 🏔️ A lookout: a tall flat stone on the left edge.
// 🪑 A wooden bench by a trail, 🗿 little towers of round stones, a mud puddle with goat and bird footprints 🐾 (not solid)
// and fallen feathers 🪶 on the grass: only decoration.
// 🐦 Three little songbirds hop from branch to branch and now and then fly to another pine; by day they sing short happy
// tunes, and at night they sleep on their branch.
// 🍃 Now and then a gust of wind lifts a few leaves that spin in the air and fall again.
// 🐐 Goats: two big ones (white and light brown) and a baby that hops after its mother. They hop between the rocks, stand on
// top of one now and then, and bleat ("beee"). At night they sleep together lying on the grass. The characters walk around
// them. A tap on one walks the selected one beside it (the goat waits) to pet it (Diversión); one person per goat.
// 🕳️ The entrance of the cave in a rock wall, with its little sign "Cueva": the wall is solid, and a tap on the mouth (or
// its sign) walks the selected one into its mouth and into the Cueva (js/cave.js); coming out, it appears in front of it.
// Day and night and the weather of the day show here too (js/weather.js), without puddles or snowman: with snow the pines
// and rocks turn white. Modo decorar moves nothing here. The neighbors never come, and the shiny coins never appear here.
// Pausa freezes it all. Nothing here is saved: the goats and the birds start at their spots.
var Mountain = (function () {
  var C = CONFIG.colors;
  var K = CONFIG.mountain;
  var W = CONFIG.world.width, H = CONFIG.world.height;
  // How close a character's feet may get to the edges of the map (the snowy peaks fill the bottom) and to solid things.
  var MARGIN = { side: 30, top: 130, bottom: 92 };
  var CLEAR = 12;

  // The trail at the top: its middle "x", how far down it comes and half its width.
  var TRAIL = { x: K.edge.x, bottom: 178, half: 15 };
  // The sign of the place.
  var SIGN = { text: "Montaña", x: 590, y: 92, size: 24 };

  // The dirt trails that go up and down between the rocks (only drawn; everyone walks on them as on the grass).
  var TRAILS = [
    [[330, 170], [334, 250], [400, 340], [520, 420], [640, 500], [760, 560], [858, 612]],
    [[372, 304], [290, 360], [200, 410], [138, 440]],
    [[520, 420], [640, 410], [760, 380], [846, 352]]
  ];
  // Patches of gray rock on the grass (only drawn).
  var PATCHES = [{ x: 640, y: 214, rx: 92, ry: 34 }, { x: 196, y: 548, rx: 96, ry: 34 }, { x: 470, y: 520, rx: 64, ry: 24 }];

  // The pines inside the map: where the trunk meets the grass, how tall and half as wide as the crown is, how round the tips
  // are (0 pointy, 1 round) and if it is dark green. The first one is the big pine with the nest.
  var PINES = [
    { x: 906, y: 330, h: 178, w: 60, round: 0.2, dark: true },
    { x: 150, y: 248, h: 132, w: 32, round: 0, dark: false },
    { x: 486, y: 262, h: 92, w: 50, round: 1, dark: false },
    { x: 616, y: 352, h: 118, w: 38, round: 0.4, dark: true },
    { x: 252, y: 480, h: 84, w: 46, round: 0.8, dark: true },
    { x: 708, y: 196, h: 100, w: 30, round: 0, dark: false },
    { x: 92, y: 610, h: 110, w: 40, round: 0.3, dark: false },
    { x: 560, y: 628, h: 80, w: 44, round: 1, dark: false }
  ];
  // The nest in the big pine: where it sits on the crown, from the foot of the pine.
  var NEST = { pine: 0, x: -26, y: -64 };
  // The big rocks: where they meet the grass, half their width and their height; two of them have a little face.
  var ROCKS = [
    { x: 236, y: 300, rx: 36, h: 36, face: false },
    { x: 806, y: 240, rx: 40, h: 40, face: true },
    { x: 744, y: 452, rx: 44, h: 44, face: false },
    { x: 368, y: 592, rx: 46, h: 42, face: true },
    { x: 444, y: 182, rx: 30, h: 28, face: false }
  ];
  // The lookout: a tall flat stone on the left edge, from where the valley is seen.
  var LOOKOUT = { x: 74, y: 452, w: 92, h: 84 };
  // The bench by the main trail.
  var BENCH = { x: 466, y: 344, w: 66 };
  // The little stone towers: where they stand and how big their stones are (bottom first).
  var CAIRNS = [
    { x: 584, y: 176, stones: [15, 12, 9, 6] },
    { x: 152, y: 352, stones: [13, 10, 7] },
    { x: 668, y: 612, stones: [14, 11, 8, 6, 4] }
  ];
  // The mud puddle, and the footprints on it and going out of it: goat hooves ("goat") and little bird feet ("bird").
  var MUD = { x: 300, y: 418, rx: 42, ry: 17 };
  var PRINTS = [
    ["goat", 278, 414, 0.2], ["goat", 300, 424, 0.1], ["goat", 322, 416, 0.25], ["goat", 346, 428, 0.2],
    ["goat", 372, 422, 0.3], ["bird", 286, 426, -0.5], ["bird", 296, 410, -0.4], ["bird", 310, 420, -0.5]
  ];
  // The feathers on the grass: where, how they lie and their color.
  var FEATHERS = [{ x: 376, y: 520, a: 0.5, c: 0 }, { x: 676, y: 286, a: -0.7, c: 1 }, { x: 208, y: 196, a: 2.2, c: 2 },
    { x: 846, y: 420, a: 1.1, c: 2 }];
  // The cave: its rock wall (as points), its dark round mouth and the little sign nailed on the wall.
  // Only the top of the wall is solid ("box"), so the characters can walk along its foot to the mouth.
  var CAVE = { mouth: { x: 880, y: 644, w: 74, h: 72 }, box: { x: 772, y: 482, w: 228, h: 112 },
    wall: { x: 772, y: 482, w: 228, h: 164 },
    sign: { text: "Cueva", x: 880, y: 524, size: 13 } };
  var WALL = [[772, 646], [778, 560], [800, 514], [846, 488], [900, 480], [952, 490], [1004, 512], [1004, 646]];

  // Where the goats lie down to sleep at night (the first goat, the second one and the baby).
  var BED = [{ x: 440, y: 474 }, { x: 504, y: 482 }, { x: 472, y: 498 }];
  // How big the goats and the birds are drawn.
  var GOAT_SIZE = 1.35, BIRD_SIZE = 1.5;

  // Floating texts, as { x, y, text, age, word, small }, the music notes of the birds and the leaves in the wind.
  var pops = [];
  var notes = [];
  var leaves = [];
  // What is under the mouse: a goat, or "trail".
  var hover = null;
  // Seconds of play here so far: the wind, the goats and the birds stop with Pausa.
  var clock = 0;
  // What each character is doing here, by id: { sim, kind: "pet", goat, spot, phase: "walking" | "doing" | "busy", elapsed }
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

  function grow(b, by) {
    return { x: b.x - by, y: b.y - by, w: b.w + by * 2, h: b.h + by * 2 };
  }

  function dist(ax, ay, bx, by) {
    return Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
  }

  // ---------- Where characters can walk ----------

  // True if the spot is inside the map, above the snowy peaks. Used when loading a saved game.
  function isWalkable(x, y) {
    return x >= MARGIN.side && x <= W - MARGIN.side && y >= MARGIN.top && y <= H - MARGIN.bottom;
  }

  // The box a pine takes, from its foot up to most of its crown (so nobody stands behind it and shows over it).
  function pineBox(p) {
    return { x: p.x - p.w * 0.62, y: p.y - p.h * 0.8, w: p.w * 1.24, h: p.h * 0.8 + 6 };
  }

  function rockBox(r) {
    return { x: r.x - r.rx, y: r.y - r.h - 2, w: r.rx * 2, h: r.h + 8 };
  }

  function lookoutBox() {
    return { x: LOOKOUT.x - LOOKOUT.w / 2, y: LOOKOUT.y - LOOKOUT.h - 14, w: LOOKOUT.w, h: LOOKOUT.h + 20 };
  }

  function benchBox() {
    return { x: BENCH.x - BENCH.w / 2, y: BENCH.y - 30, w: BENCH.w, h: 36 };
  }

  function cairnBox(c) {
    var high = c.stones.reduce(function (a, s) { return a + s * 1.25; }, 0);
    return { x: c.x - c.stones[0], y: c.y - high, w: c.stones[0] * 2, h: high + 6 };
  }

  // True if a character cannot stand here: off the map, on the snowy peaks, or on a pine, a rock, the lookout, the bench, a
  // stone tower, the hidden chest (js/treasure.js) or the top of the cave wall (its foot is free, to walk to the mouth).
  // Used by js/path.js.
  function isSolid(x, y) {
    if (!isWalkable(x, y)) return true;
    if (PINES.some(function (p) { return inBox(x, y, grow(pineBox(p), CLEAR / 2)); })) return true;
    if (ROCKS.some(function (r) { return inBox(x, y, grow(rockBox(r), CLEAR / 2)); })) return true;
    if (CAIRNS.some(function (c) { return inBox(x, y, grow(cairnBox(c), CLEAR / 2)); })) return true;
    if (inBox(x, y, grow(lookoutBox(), CLEAR / 2)) || inBox(x, y, grow(benchBox(), CLEAR / 2))) return true;
    if (inBox(x, y, grow(CONFIG.treasure.chests.mountain.box, CLEAR / 2))) return true;
    return inBox(x, y, grow(CAVE.box, CLEAR / 2));
  }

  // ---------- What can be tapped ----------

  function trailBox() {
    return { x: TRAIL.x - TRAIL.half - 10, y: 0, w: TRAIL.half * 2 + 20, h: TRAIL.bottom + 8 };
  }

  // The mouth of the cave, where a tap goes in.
  function mouthBox() {
    var m = CAVE.mouth;
    return { x: m.x - m.w / 2, y: m.y - m.h, w: m.w, h: m.h };
  }

  // "trail" if the spot is on the trail back to the city, "cave" if it is on the mouth of the cave or its sign, else null
  // (the goats are apart: goatAt).
  function usableAt(x, y) {
    if (inBox(x, y, trailBox())) return "trail";
    if (inBox(x, y, mouthBox()) || inBox(x, y, grow(signBox(CAVE.sign), 4))) return "cave";
    return null;
  }

  function setHover(what) {
    hover = what || null;
  }

  // ---------- Pines ----------

  // How much a pine leans with the wind right now: its tip goes this times its height to the side.
  function sway(i) {
    return Math.sin(clock * 1.3 + i * 1.9) * 0.03 + Math.sin(clock * 0.47 + i) * 0.015;
  }

  // A spot on a pine (from its foot) as a spot on the map, leaning with the pine.
  function onPine(i, dx, dy) {
    var p = PINES[i];
    return { x: p.x + dx - sway(i) * dy, y: p.y + dy };
  }

  // The tiers of a pine, from the bottom: where each one ends below, how high its tip is and its half width.
  function tiers(p) {
    var n = p.h > 120 ? 4 : 3, out = [];
    for (var k = 0; k < n; k++) {
      var bottom = -p.h * 0.18 - k * (p.h * 0.82) / (n + 0.4);
      var top = bottom - p.h * 0.82 / (n - 0.4);
      out.push({ bottom: bottom, top: Math.max(-p.h, top), w: p.w * (1 - k / (n + 0.6)) });
    }
    return out;
  }

  // The branches where a bird can sit on a pine: the tips of each tier, on both sides, from its foot.
  function perches(i) {
    var out = [];
    tiers(PINES[i]).forEach(function (t, k) {
      if (k === 0) return;
      out.push({ x: -t.w * 0.72, y: t.bottom + 2 }, { x: t.w * 0.72, y: t.bottom + 2 });
    });
    return out;
  }

  // ---------- Goats ----------

  // The goats: the white one (the mother), the light brown one and the baby. Each one hops along its way, rests a while,
  // and sometimes goes up a rock and stands on top of it.
  var GOATS = [
    { color: K.goatWhite, baby: false, start: { x: 560, y: 470 } },
    { color: K.goatBrown, baby: false, start: { x: 680, y: 300 } },
    { color: K.goatWhite, baby: true, mother: 0, start: { x: 592, y: 486 } }
  ];
  var goats = GOATS.map(function (g, i) {
    return { i: i, look: g, x: g.start.x, y: g.start.y, lift: 0, rock: -1, dir: i === 1 ? -1 : 1, way: [], up: -1,
      hop: null, wait: between(0.5, 2), mode: "rest", held: null, cheer: 0, goingToBed: false };
  });
  var bleatIn = between(K.bleat.min, K.bleat.max);

  function isNight() {
    return Time.darkness() > 0.55;
  }

  // True while a goat lies asleep.
  function isAsleep(g) {
    return g.mode === "sleep";
  }

  // How high a goat is drawn over its spot: on top of its rock, and in the air while it hops.
  function goatLift(g) {
    var lift = g.lift;
    if (g.hop) {
      var t = Math.min(1, g.hop.t / g.hop.time);
      lift = g.hop.from.lift + (g.hop.to.lift - g.hop.from.lift) * t + Math.sin(t * Math.PI) * g.hop.high;
    }
    if (g.cheer > 0) lift += Math.sin((1 - g.cheer / 0.5) * Math.PI) * 14;
    return lift;
  }

  // Where a goat is right now on the grass (while it hops, between its two spots).
  function goatSpot(g) {
    if (!g.hop) return { x: g.x, y: g.y };
    var t = Math.min(1, g.hop.t / g.hop.time);
    return { x: g.hop.from.x + (g.hop.to.x - g.hop.from.x) * t, y: g.hop.from.y + (g.hop.to.y - g.hop.from.y) * t };
  }

  // The goat at a spot (where it is drawn), or null.
  function goatAt(x, y) {
    for (var i = goats.length - 1; i >= 0; i--) {
      var g = goats[i], at = goatSpot(g), k = (g.look.baby ? 0.7 : 1) * GOAT_SIZE;
      var cy = at.y - goatLift(g) - (isAsleep(g) ? 10 : 22) * k;
      if (Math.abs(x - at.x) <= 30 * k && Math.abs(y - cy) <= 24 * k) return g;
    }
    return null;
  }

  // The goats on the grass, for js/sims.js: the characters walk around them (one on top of a rock is already out of the way).
  function walkers() {
    return goats.filter(function (g) { return g.rock < 0; }).map(function (g) {
      var at = goatSpot(g);
      return { x: at.x, y: at.y, r: g.look.baby ? 22 : 30 };
    });
  }

  // A free spot on the grass by a rock, on one side, where a goat jumps up from or lands.
  function besideRock(r, side) {
    return Path.free("mountain", r.x + side * (r.rx + 16), r.y + 10);
  }

  // A goat picks somewhere new: often a rock nobody stands on (it hops to its side and up), or else a spot of grass nearby.
  function pickWay(g) {
    var mine = goatSpot(g);
    if (g.rock >= 0) {
      // First it jumps down beside its rock.
      var r = ROCKS[g.rock], down = besideRock(r, Math.random() < 0.5 ? -1 : 1);
      g.rock = -1;
      startHop(g, { x: down.x, y: down.y, lift: 0 }, true);
      return;
    }
    var taken = goats.map(function (o) { return o !== g && o.up >= 0 ? o.up : o !== g ? o.rock : -1; });
    var free = ROCKS.map(function (r, i) { return i; }).filter(function (i) {
      return taken.indexOf(i) < 0 && dist(ROCKS[i].x, ROCKS[i].y, mine.x, mine.y) < 420;
    });
    var to;
    if (free.length && Math.random() < K.onRock) {
      g.up = free[Math.floor(Math.random() * free.length)];
      var rock = ROCKS[g.up];
      to = besideRock(rock, mine.x < rock.x ? -1 : 1);
    } else {
      g.up = -1;
      var a = between(0, Math.PI * 2), d = between(70, 200);
      to = Path.free("mountain", Math.max(60, Math.min(W - 60, mine.x + Math.cos(a) * d)),
        Math.max(MARGIN.top + 20, Math.min(H - MARGIN.bottom - 6, mine.y + Math.sin(a) * d * 0.7)));
    }
    g.way = Path.find("mountain", mine.x, mine.y, to.x, to.y);
  }

  // A goat goes to a spot along a way around everything solid (to bed, or after its mother).
  function goWay(g, x, y) {
    g.up = -1;
    if (g.rock >= 0) {
      pickWay(g);
      return;
    }
    g.way = Path.find("mountain", g.x, g.y, x, y);
  }

  // One hop, from where the goat is to "to" ({ x, y, lift }); "big" for the hops up and down a rock.
  function startHop(g, to, big) {
    var H2 = g.look.baby ? K.baby : K.hop;
    var from = { x: g.x, y: g.y, lift: g.lift };
    if (Math.abs(to.x - from.x) > 2) g.dir = to.x > from.x ? 1 : -1;
    g.hop = { from: from, to: to, t: 0, time: H2.time * (big ? 1.3 : 1), high: big ? H2.high + 16 : H2.high };
    g.mode = "hop";
  }

  // The next hop along the way: at most "far" world units, following its points.
  function nextHop(g) {
    var H2 = g.look.baby ? K.baby : K.hop;
    var left = H2.far, at = { x: g.x, y: g.y };
    while (g.way.length && left > 0) {
      var p = g.way[0], d = dist(at.x, at.y, p.x, p.y);
      if (d <= left) {
        at = { x: p.x, y: p.y };
        left -= d;
        g.way.shift();
      } else {
        at = { x: at.x + (p.x - at.x) / d * left, y: at.y + (p.y - at.y) / d * left };
        left = 0;
      }
    }
    startHop(g, { x: at.x, y: at.y, lift: 0 }, false);
  }

  // A hop ends: on top of a rock it stands a while; at the end of its way it rests, or goes up its rock.
  function landed(g) {
    var to = g.hop.to;
    g.x = to.x;
    g.y = to.y;
    g.lift = to.lift;
    g.hop = null;
    g.mode = "rest";
    var H2 = g.look.baby ? K.baby : K.hop;
    if (g.way.length) {
      g.wait = H2.gap;
      return;
    }
    if (g.up >= 0 && g.rock < 0 && to.lift === 0) {
      var r = ROCKS[g.up];
      if (dist(g.x, g.y, r.x, r.y + 10) < r.rx + 40) {
        g.rock = g.up;
        g.up = -1;
        startHop(g, { x: r.x + (g.x < r.x ? -6 : 6), y: r.y + 2, lift: r.h * 0.86 }, true);
        return;
      }
      g.up = -1;
    }
    g.wait = g.rock >= 0 ? between(K.perch.min, K.perch.max) : between(K.rest.min, K.rest.max);
  }

  // Where the baby wants to be: a little behind its mother (by the rock when she is on top of one).
  function babySpot(g) {
    var mom = goats[g.look.mother];
    if (mom.rock >= 0) {
      var r = ROCKS[mom.rock];
      return { x: r.x + (g.x < r.x ? -1 : 1) * (r.rx + 18), y: r.y + 12 };
    }
    var at = goatSpot(mom);
    return { x: at.x - mom.dir * 26, y: at.y + 10 };
  }

  function updateGoat(g, dt) {
    if (g.cheer > 0) g.cheer = Math.max(0, g.cheer - dt);
    if (g.hop) {
      g.hop.t += dt;
      if (g.hop.t >= g.hop.time) landed(g);
      return;
    }
    // Petted (or someone is coming to pet it): it stands still and waits.
    if (g.held) return;
    // At night it hops to its bed (down from its rock first) and lies down there.
    var night = isNight(), bed = BED[g.i];
    if (night) {
      if (isAsleep(g)) return;
      if (g.goingToBed && !g.way.length && g.rock < 0) {
        g.mode = "sleep";
        g.dir = g.i === 1 ? -1 : 1;
        return;
      }
      if (!g.goingToBed) {
        goWay(g, bed.x, bed.y);
        g.goingToBed = g.rock < 0 && !g.hop;
        if (!g.goingToBed) return;
      }
    } else {
      if (isAsleep(g)) {
        g.mode = "rest";
        g.wait = between(0.5, 2.5);
      }
      g.goingToBed = false;
    }
    g.wait -= dt;
    if (g.wait > 0) return;
    if (g.way.length) {
      nextHop(g);
      return;
    }
    if (night) return;
    if (g.look.baby) {
      var want = babySpot(g);
      if (dist(g.x, g.y, want.x, want.y) > K.follow) {
        var spot = Path.free("mountain", want.x, want.y);
        g.way = Path.find("mountain", g.x, g.y, spot.x, spot.y);
        if (g.way.length) nextHop(g);
      } else {
        g.wait = between(0.3, 0.8);
      }
      return;
    }
    pickWay(g);
    if (g.mode !== "hop") {
      if (g.way.length) nextHop(g);
      else g.wait = between(K.rest.min, K.rest.max);
    }
  }

  // A goat bleats: its "beee" (higher for the baby) and a little "Beee!" over it.
  function bleat(g) {
    var at = goatSpot(g), k = (g.look.baby ? 0.7 : 1) * GOAT_SIZE;
    pops.push({ x: at.x + g.dir * 18 * k, y: at.y - goatLift(g) - 52 * k, text: "Beee!", age: 0,
      word: g.look.baby ? "babyGoat" : "goat", small: true });
    Sound.playAt("mountain", g.look.baby ? "bleatBaby" : "bleat");
  }

  function updateGoats(dt) {
    goats.forEach(function (g) { updateGoat(g, dt); });
    // Now and then an awake goat bleats.
    bleatIn -= dt;
    if (bleatIn <= 0) {
      bleatIn = between(K.bleat.min, K.bleat.max);
      var awake = goats.filter(function (g) { return !isAsleep(g); });
      if (awake.length) bleat(awake[Math.floor(Math.random() * awake.length)]);
    }
  }

  // Loading a game at night, or coming back at night: the goats are already asleep at their bed.
  function putToBed() {
    goats.forEach(function (g, i) {
      g.x = BED[i].x;
      g.y = BED[i].y;
      g.lift = 0;
      g.rock = g.up = -1;
      g.way = [];
      g.hop = null;
      g.mode = "sleep";
      g.dir = i === 1 ? -1 : 1;
    });
  }

  // ---------- Petting ----------

  // A tap on a goat: if it sleeps, "Shhh"; else the goat waits and the character walks beside it to pet it.
  function tapGoat(sim, g) {
    var at = goatSpot(g);
    if (isAsleep(g)) {
      popAt(at.x, at.y - 50, "Shhh, está durmiendo 😴", g.look.baby ? "babyGoat" : "goat");
      sim.path = [];
      return;
    }
    var ground = g.rock >= 0 ? { x: ROCKS[g.rock].x, y: ROCKS[g.rock].y + 10 } : at;
    var side = sim.x < ground.x ? -1 : 1;
    var reach = g.rock >= 0 ? ROCKS[g.rock].rx + 18 : g.look.baby ? 46 : 60;
    var spot = Path.free("mountain", ground.x + side * reach, ground.y + 2);
    current[sim.data.id] = { sim: sim, kind: "pet", goat: g, phase: "walking", elapsed: 0 };
    if (!g.held) g.held = sim.data.id;
    Sims.walkTo(sim, spot.x, spot.y);
  }

  function popAt(x, y, text, word) {
    pops.push({ x: x, y: y, text: text, age: 0, word: word });
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

  // True if someone else is petting this goat.
  function isTaken(a, id) {
    return Object.keys(current).some(function (other) {
      var b = current[other];
      return other !== id && b.phase === "doing" && b.goat === a.goat;
    });
  }

  function updatePetting(dt, paused) {
    Object.keys(current).forEach(function (id) {
      var a = current[id];
      // Going back to the city or starting to socialize ends it.
      if (a.sim.place !== "mountain" || Social.isInvolved(id)) {
        delete current[id];
        return;
      }
      if (a.phase === "walking") {
        if (a.sim.path.length > 0) return;
        if (isAsleep(a.goat)) {
          delete current[id];
          var at = goatSpot(a.goat);
          popAt(at.x, at.y - 50, "Shhh, está durmiendo 😴", a.goat.look.baby ? "babyGoat" : "goat");
          return;
        }
        a.elapsed = 0;
        a.phase = isTaken(a, id) ? "busy" : "doing";
        if (a.phase === "doing") {
          a.goat.held = id;
          var g = goatSpot(a.goat);
          a.sim.facing = g.x < a.sim.x ? "left" : "right";
          a.goat.dir = a.sim.x < g.x ? -1 : 1;
        }
        return;
      }
      if (a.phase === "busy") {
        a.elapsed += dt;
        if (a.elapsed >= K.busyTime) delete current[id];
        return;
      }
      if (paused) return;
      var step = Math.min(dt, K.petTime - a.elapsed);
      a.elapsed += step;
      var values = Needs.get(id);
      values.fun = Math.min(100, values.fun + K.petFun / K.petTime * step);
      if (a.elapsed < K.petTime) return;
      delete current[id];
      // A happy little hop and a "beee".
      a.goat.cheer = 0.5;
      bleat(a.goat);
    });
    // A goat nobody is petting or coming to pet goes on.
    goats.forEach(function (g) {
      if (!g.held) return;
      var a = current[g.held];
      if (!a || a.goat !== g) {
        var other = Object.keys(current).filter(function (id) { return current[id].goat === g; })[0];
        g.held = other || null;
        if (!g.held) g.wait = Math.max(g.wait, 1);
      }
    });
  }

  // What to show over a character's head, or null.
  function bubbleFor(id) {
    var a = current[id];
    if (!a || a.phase === "walking") return null;
    if (a.phase === "busy") return { text: "Ocupado", heart: false };
    return { text: "Acariciando 🐐", heart: false };
  }

  // ---------- Songbirds ----------

  // The pines the birds visit (the bigger ones), and the three birds: red, blue and yellow.
  var BIRD_PINES = [0, 1, 3, 5, 6];
  var birds = K.birdColors.map(function (color, i) {
    var pine = BIRD_PINES[i % BIRD_PINES.length], spots = perches(pine), perch = Math.floor(hash(i, 3) * spots.length);
    return { i: i, color: color, pine: pine, perch: perch, move: null, wait: between(1, 3), sing: between(2, K.birds.sing.max),
      dir: spots[perch].x < 0 ? -1 : 1 };
  });

  // Where a bird is right now, on its branch or in the air between two.
  function birdSpot(b) {
    var spots = perches(b.pine), p = spots[b.perch], at = onPine(b.pine, p.x, p.y);
    if (!b.move) return at;
    var from = onPine(b.move.pine, b.move.from.x, b.move.from.y), t = Math.min(1, b.move.t / b.move.time);
    var arc = Math.sin(t * Math.PI) * (b.move.fly ? 46 : 10);
    return { x: from.x + (at.x - from.x) * t, y: from.y + (at.y - from.y) * t - arc };
  }

  function updateBirds(dt) {
    var night = isNight();
    birds.forEach(function (b) {
      if (b.move) {
        b.move.t += dt;
        b.move.flap += dt;
        if (b.move.t >= b.move.time) b.move = null;
        return;
      }
      if (night) return;
      // By day (and not in the rain) it sings now and then: little notes go up and a short happy tune plays.
      b.sing -= dt;
      if (b.sing <= 0) {
        b.sing = between(K.birds.sing.min, K.birds.sing.max);
        if (Weather.rainLevel() === 0) {
          var at = birdSpot(b);
          for (var n = 0; n < 3; n++) notes.push({ x: at.x + b.dir * 4, y: at.y - 8, age: -n * 0.25, side: n % 2 ? 1 : -1,
            text: n % 2 ? "♫" : "♪", color: b.color });
          Sound.playAt("mountain", "songbird");
        }
      }
      b.wait -= dt;
      if (b.wait > 0) return;
      b.wait = between(K.birds.hop.min, K.birds.hop.max);
      var from = perches(b.pine)[b.perch], fromPine = b.pine;
      if (Math.random() < K.birds.fly) {
        var others = BIRD_PINES.filter(function (p) { return p !== b.pine; });
        b.pine = others[Math.floor(Math.random() * others.length)];
        b.perch = Math.floor(Math.random() * perches(b.pine).length);
      } else {
        var count = perches(b.pine).length;
        b.perch = (b.perch + 1 + Math.floor(Math.random() * (count - 1))) % count;
      }
      var a = onPine(fromPine, from.x, from.y), to = birdSpot(b);
      var fly = fromPine !== b.pine;
      b.dir = to.x >= a.x ? 1 : -1;
      b.move = { pine: fromPine, from: from, t: 0, flap: 0, fly: fly, time: fly ? 1.5 : 0.32 };
    });
    notes.forEach(function (n) { n.age += dt; });
    notes = notes.filter(function (n) { return n.age < 1.6; });
  }

  // ---------- Leaves in the wind ----------

  var gustIn = between(2, K.gust.max);

  function updateLeaves(dt) {
    leaves.forEach(function (l) { l.age += dt; });
    leaves = leaves.filter(function (l) { return l.age < l.life; });
    gustIn -= dt;
    if (gustIn > 0) return;
    gustIn = between(K.gust.min, K.gust.max);
    var x = between(120, W - 160), y = between(MARGIN.top + 40, H - MARGIN.bottom - 20), dir = Math.random() < 0.5 ? -1 : 1;
    for (var i = 0; i < K.gust.leaves; i++) {
      leaves.push({ x: x + between(-30, 30), y: y + between(-14, 14), dx: dir * between(60, 120), high: between(40, 80),
        spin: between(3, 7) * (Math.random() < 0.5 ? -1 : 1), seed: between(0, 6), life: between(3, 4.4), age: -i * 0.12,
        color: [K.pineLight, "#8FB46A", "#D9A441", C.sage][i % 4] });
    }
  }

  // Where a leaf is in the air: it goes up spinning with the gust and comes down again, fading at the end.
  function leafSpot(l) {
    var t = Math.max(0, l.age) / l.life;
    return { x: l.x + l.dx * t + Math.sin(t * 7 + l.seed) * 14, y: l.y - Math.sin(t * Math.PI) * l.high, t: t };
  }

  // ---------- Update ----------

  var wasNight = null;

  function update(dt) {
    var paused = Needs.isPaused();
    if (!paused) clock += dt;
    pops.forEach(function (p) { p.age += dt; });
    pops = pops.filter(function (p) { return p.age < K.popTime; });
    // Not on screen when the night comes: the goats are already asleep when someone gets here.
    var night = isNight();
    if (wasNight === null ? night : night && !wasNight && Sims.viewPlace() !== "mountain") putToBed();
    wasNight = night;
    updatePetting(dt, paused);
    if (paused) return;
    updateGoats(dt);
    updateBirds(dt);
    updateLeaves(dt);
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

  // A soft blob with a wobbly edge, always the same for the same "seed".
  function blobPath(ctx, x, y, rx, ry, seed) {
    ctx.beginPath();
    for (var k = 0; k <= 16; k++) {
      var a = k / 16 * Math.PI * 2, r = 0.86 + hash(seed, k % 16) * 0.22;
      var px = x + Math.cos(a) * rx * r, py = y + Math.sin(a) * ry * r;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  // The pines all around the map: along the top (leaving room for the trail) and down the sides, above the cave.
  var BORDER = (function () {
    var out = [];
    for (var i = 0; i < 15; i++) {
      var x = 10 + i * 70 + hash(i, 1) * 18;
      if (Math.abs(x - TRAIL.x) < 60) continue;
      out.push({ x: x, y: 70 + (i % 2) * 34 + hash(i, 9) * 8, h: 96 + hash(i, 2) * 40, w: 30 + hash(i, 3) * 14,
        round: hash(i, 4) > 0.6 ? 0.8 : 0.1, dark: i % 3 !== 0 });
    }
    for (var j = 0; j < 5; j++) {
      out.push({ x: 4 + hash(j, 5) * 10, y: 210 + j * 70, h: 92 + hash(j, 6) * 30, w: 30 + hash(j, 7) * 8, round: 0.2,
        dark: j % 2 === 0 });
      if (j < 4) out.push({ x: W - 6 - hash(j, 8) * 10, y: 190 + j * 66, h: 92 + hash(j, 10) * 30, w: 30 + hash(j, 11) * 8,
        round: 0.5, dark: j % 2 === 1 });
    }
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
    // Patches of gray rock, with little pebbles on them.
    PATCHES.forEach(function (p, i) {
      blobPath(ctx, p.x, p.y, p.rx, p.ry, 40 + i);
      ctx.fillStyle = K.rockLight;
      ctx.fill();
      ctx.strokeStyle = "rgba(127, 122, 114, 0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();
      for (var k = 0; k < 7; k++) {
        ellipse(ctx, p.x + (hash(i, k + 50) - 0.5) * p.rx * 1.3, p.y + (hash(i, k + 60) - 0.5) * p.ry * 1.1,
          3 + hash(i, k + 70) * 4, 2 + hash(i, k + 70) * 2, K.rock);
      }
    });
    // A little snow toward the bottom, where the peaks are.
    var snow = ctx.createLinearGradient(0, H - 170, 0, H - 60);
    snow.addColorStop(0, "rgba(251, 252, 255, 0)");
    snow.addColorStop(1, "rgba(251, 252, 255, 0.85)");
    ctx.fillStyle = snow;
    ctx.fillRect(0, H - 170, W, 170);
    for (var s = 0; s < 18; s++) {
      ellipse(ctx, 30 + hash(s, 80) * (W - 60), H - 120 + hash(s, 81) * 50, 16 + hash(s, 82) * 22, 5 + hash(s, 83) * 4,
        "rgba(251, 252, 255, 0.75)");
    }
  }

  // A dirt trail along its points, wide with a lighter middle.
  function trailPath(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length - 1; i++) {
      var mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
  }

  function drawTrails(ctx) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    TRAILS.forEach(function (pts) {
      trailPath(ctx, pts);
      ctx.strokeStyle = K.dirt;
      ctx.lineWidth = 28;
      ctx.stroke();
    });
    TRAILS.forEach(function (pts) {
      trailPath(ctx, pts);
      ctx.strokeStyle = K.dirtLight;
      ctx.lineWidth = 12;
      ctx.stroke();
    });
    // Little pebbles on the trails.
    TRAILS.forEach(function (pts, t) {
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], k = hash(t, i);
        ellipse(ctx, a[0] + (b[0] - a[0]) * k + 6, a[1] + (b[1] - a[1]) * k - 4, 3, 2, "#A08060");
      }
    });
    ctx.restore();
  }

  // The trail at the top, from the top edge down into the grass, with a few pebbles.
  function drawTrail(ctx) {
    ctx.save();
    ctx.fillStyle = K.dirt;
    ctx.beginPath();
    ctx.moveTo(TRAIL.x - TRAIL.half - 4, -4);
    for (var y = 0; y <= TRAIL.bottom - 14; y += 20) ctx.lineTo(TRAIL.x - TRAIL.half + Math.sin(y * 0.07) * 3, y);
    ctx.quadraticCurveTo(TRAIL.x, TRAIL.bottom + 10, TRAIL.x + TRAIL.half, TRAIL.bottom - 14);
    for (var y2 = TRAIL.bottom - 14; y2 >= 0; y2 -= 20) ctx.lineTo(TRAIL.x + TRAIL.half + Math.sin(y2 * 0.05 + 1) * 3, y2);
    ctx.lineTo(TRAIL.x + TRAIL.half + 4, -4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = K.dirtLight;
    ctx.beginPath();
    ctx.ellipse(TRAIL.x - 3, TRAIL.bottom / 2 - 6, TRAIL.half * 0.45, TRAIL.bottom / 2 - 16, 0, 0, Math.PI * 2);
    ctx.fill();
    [[-8, 22], [7, 58], [-4, 96], [9, 130]].forEach(function (p) {
      ellipse(ctx, TRAIL.x + p[0], p[1], 3, 2, "#A08060");
    });
    ctx.restore();
  }

  // The snowy peaks along the bottom of the map: gray rock with white tops.
  var PEAKS = (function () {
    var out = [];
    for (var i = 0; i < 11; i++) out.push({ x: -30 + i * 104 + hash(i, 90) * 30, w: 70 + hash(i, 91) * 30, h: 70 + hash(i, 92) * 40 });
    return out;
  })();

  function drawPeaks(ctx) {
    PEAKS.forEach(function (p, i) {
      var base = H + 6, top = base - p.h;
      ctx.beginPath();
      ctx.moveTo(p.x - p.w, base);
      ctx.lineTo(p.x - p.w * 0.12, top + 6);
      ctx.quadraticCurveTo(p.x, top - 4, p.x + p.w * 0.12, top + 6);
      ctx.lineTo(p.x + p.w, base);
      ctx.closePath();
      ctx.fillStyle = i % 2 ? K.rock : "#B3AEA5";
      ctx.fill();
      // The shady side.
      ctx.beginPath();
      ctx.moveTo(p.x, top);
      ctx.lineTo(p.x + p.w * 0.12, top + 6);
      ctx.lineTo(p.x + p.w, base);
      ctx.lineTo(p.x + p.w * 0.25, base);
      ctx.closePath();
      ctx.fillStyle = "rgba(90, 84, 76, 0.18)";
      ctx.fill();
      // The snow on top, with a wavy edge.
      var s = p.h * 0.42;
      ctx.beginPath();
      ctx.moveTo(p.x - p.w * 0.12, top + 6);
      ctx.quadraticCurveTo(p.x, top - 4, p.x + p.w * 0.12, top + 6);
      ctx.lineTo(p.x + p.w * 0.42, top + s);
      ctx.quadraticCurveTo(p.x + p.w * 0.26, top + s - 10, p.x + p.w * 0.14, top + s + 4);
      ctx.quadraticCurveTo(p.x, top + s - 8, p.x - p.w * 0.14, top + s + 2);
      ctx.quadraticCurveTo(p.x - p.w * 0.28, top + s - 10, p.x - p.w * 0.42, top + s);
      ctx.closePath();
      ctx.fillStyle = "#FBFCFF";
      ctx.fill();
    });
  }

  // A pine: a trunk and tiers of branches, pointy or round, swaying with the wind. Snow covers each tier on snowy days.
  function drawPine(ctx, p, i) {
    var lean = sway(i);
    var green = p.dark ? K.pineDark : K.pine, light = p.dark ? K.pine : K.pineLight;
    ctx.save();
    ctx.translate(p.x, p.y);
    ellipse(ctx, 0, 2, p.w * 0.75, p.w * 0.2, "rgba(60, 70, 50, 0.22)");
    fillRound(ctx, -p.w * 0.12, -p.h * 0.26, p.w * 0.24, p.h * 0.26 + 2, 3, K.trunk);
    ctx.transform(1, 0, -lean, 1, 0, 0);
    tiers(p).forEach(function (t) {
      var shape = function () {
        ctx.beginPath();
        ctx.moveTo(-t.w, t.bottom);
        ctx.quadraticCurveTo(-t.w * (0.4 + p.round * 0.25), t.bottom - (t.bottom - t.top) * (0.3 + p.round * 0.3),
          -t.w * p.round * 0.18, t.top + p.round * 4);
        ctx.quadraticCurveTo(0, t.top - 2 - p.round * 2, t.w * p.round * 0.18, t.top + p.round * 4);
        ctx.quadraticCurveTo(t.w * (0.4 + p.round * 0.25), t.bottom - (t.bottom - t.top) * (0.3 + p.round * 0.3),
          t.w, t.bottom);
        ctx.quadraticCurveTo(0, t.bottom + 7, -t.w, t.bottom);
        ctx.closePath();
      };
      shape();
      ctx.fillStyle = green;
      ctx.fill();
      // The light side.
      ctx.save();
      shape();
      ctx.clip();
      ellipse(ctx, -t.w * 0.45, (t.top + t.bottom) / 2, t.w * 0.5, (t.bottom - t.top) * 0.7, light);
      ctx.restore();
      Weather.roofSnow(ctx, function () {
        ctx.beginPath();
        ctx.moveTo(-t.w * 0.7, t.bottom - (t.bottom - t.top) * 0.32);
        ctx.quadraticCurveTo(-t.w * 0.3, t.top + (t.bottom - t.top) * 0.25, 0, t.top + 1);
        ctx.quadraticCurveTo(t.w * 0.3, t.top + (t.bottom - t.top) * 0.25, t.w * 0.7, t.bottom - (t.bottom - t.top) * 0.32);
        ctx.quadraticCurveTo(0, t.bottom - (t.bottom - t.top) * 0.45, -t.w * 0.7, t.bottom - (t.bottom - t.top) * 0.32);
        ctx.closePath();
      });
    });
    ctx.restore();
  }

  // The nest in the big pine, seen a little from above, with three light blue eggs.
  function drawNest(ctx) {
    var at = onPine(NEST.pine, NEST.x, NEST.y);
    ctx.save();
    ctx.translate(at.x, at.y);
    ellipse(ctx, 0, 2, 17, 8, "#6E4C30");
    ellipse(ctx, 0, 0, 15, 6.5, "#8A6440");
    ellipse(ctx, 0, -1, 10, 4, "#4E3424");
    [[-5, -2], [1, -3], [6, -1.5]].forEach(function (e) {
      ellipse(ctx, e[0], e[1], 3.6, 2.8, K.egg);
      ellipse(ctx, e[0] - 1, e[1] - 1, 1.2, 0.8, "#F2FAFD");
    });
    ctx.strokeStyle = "#5E4028";
    ctx.lineWidth = 1;
    for (var k = 0; k < 6; k++) {
      ctx.beginPath();
      ctx.moveTo(-14 + k * 5, 4);
      ctx.lineTo(-10 + k * 5, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  // A big rock: a round lumpy stone with a lighter top. The curious ones have two little hollow eyes and a stone smile.
  function drawRock(ctx, r, i) {
    var cy = r.y - r.h * 0.45;
    ctx.save();
    ellipse(ctx, r.x, r.y + 2, r.rx * 1.05, r.rx * 0.28, "rgba(60, 60, 50, 0.22)");
    var shape = function () { blobPath(ctx, r.x, cy, r.rx, r.h * 0.6, 10 + i); };
    shape();
    ctx.fillStyle = K.rock;
    ctx.fill();
    ctx.save();
    shape();
    ctx.clip();
    ellipse(ctx, r.x - r.rx * 0.2, cy - r.h * 0.3, r.rx * 0.8, r.h * 0.35, K.rockLight);
    ellipse(ctx, r.x + r.rx * 0.3, cy + r.h * 0.45, r.rx * 0.9, r.h * 0.3, K.rockDark);
    ctx.restore();
    shape();
    ctx.strokeStyle = "rgba(90, 84, 76, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (r.face) {
      ellipse(ctx, r.x - r.rx * 0.28, cy - 1, 3.2, 4, "rgba(90, 84, 76, 0.75)");
      ellipse(ctx, r.x + r.rx * 0.28, cy - 1, 3.2, 4, "rgba(90, 84, 76, 0.75)");
      ctx.strokeStyle = "rgba(90, 84, 76, 0.7)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(r.x, cy + 4, r.rx * 0.26, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }
    Weather.roofSnow(ctx, function () {
      ctx.beginPath();
      ctx.ellipse(r.x - r.rx * 0.08, cy - r.h * 0.38, r.rx * 0.78, r.h * 0.22, 0, Math.PI, Math.PI * 2);
      ctx.quadraticCurveTo(r.x, cy - r.h * 0.28, r.x - r.rx * 0.86, cy - r.h * 0.38);
      ctx.closePath();
    });
    ctx.restore();
  }

  // The lookout: a tall stone with a flat top and rough sides, a little grass and a pebble on it.
  function drawLookout(ctx) {
    var L = LOOKOUT, top = L.y - L.h, left = L.x - L.w / 2, right = L.x + L.w / 2;
    ctx.save();
    ellipse(ctx, L.x, L.y + 2, L.w * 0.62, 10, "rgba(60, 60, 50, 0.22)");
    var side = function () {
      ctx.beginPath();
      ctx.moveTo(left - 4, L.y);
      ctx.lineTo(left + 2, L.y - L.h * 0.45);
      ctx.lineTo(left - 2, L.y - L.h * 0.7);
      ctx.lineTo(left + 6, top + 8);
      ctx.lineTo(right - 8, top + 8);
      ctx.lineTo(right + 2, L.y - L.h * 0.62);
      ctx.lineTo(right - 2, L.y - L.h * 0.3);
      ctx.lineTo(right + 4, L.y);
      ctx.quadraticCurveTo(L.x, L.y + 8, left - 4, L.y);
      ctx.closePath();
    };
    side();
    ctx.fillStyle = K.rock;
    ctx.fill();
    // The shady side and the cracks.
    ctx.save();
    side();
    ctx.clip();
    ctx.fillStyle = "rgba(90, 84, 76, 0.22)";
    ctx.fillRect(L.x + 8, top, L.w, L.h + 10);
    ctx.restore();
    side();
    ctx.strokeStyle = "rgba(90, 84, 76, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = "rgba(90, 84, 76, 0.4)";
    [[left + 8, top + 34, left + 26, top + 40], [L.x + 14, top + 52, L.x + 30, top + 46], [left + 18, top + 66, L.x - 4, top + 70]]
      .forEach(function (c) {
        ctx.beginPath();
        ctx.moveTo(c[0], c[1]);
        ctx.lineTo(c[2], c[3]);
        ctx.stroke();
      });
    // The flat top, lighter, with a tuft of grass and a pebble.
    var flat = function () {
      ctx.beginPath();
      ctx.moveTo(left + 6, top + 8);
      ctx.quadraticCurveTo(L.x - 10, top - 6, right - 8, top + 8);
      ctx.quadraticCurveTo(L.x, top + 20, left + 6, top + 8);
      ctx.closePath();
    };
    flat();
    ctx.fillStyle = K.rockLight;
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, L.x - 16, top + 6, 7, 2.6, K.grassDark);
    ellipse(ctx, L.x + 16, top + 8, 4, 2.6, K.rock);
    Weather.roofSnow(ctx, flat);
    ctx.restore();
  }

  // The wooden bench: a seat of two boards on short legs, with a backrest.
  function drawBench(ctx) {
    var B = BENCH, x = B.x - B.w / 2;
    ctx.save();
    ellipse(ctx, B.x, B.y + 2, B.w * 0.55, 6, "rgba(60, 60, 50, 0.2)");
    [[x + 6], [x + B.w - 12]].forEach(function (l) {
      fillRound(ctx, l[0], B.y - 14, 6, 15, 2, C.darkBrown);
      fillRound(ctx, l[0], B.y - 32, 6, 14, 2, C.darkBrown);
    });
    fillRound(ctx, x, B.y - 18, B.w, 9, 3, C.wood);
    fillRound(ctx, x, B.y - 34, B.w, 7, 3, C.wood);
    fillRound(ctx, x, B.y - 25, B.w, 5, 2, "#C48E60");
    ctx.strokeStyle = "rgba(74, 52, 40, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, B.y - 18, B.w, 9);
    Weather.roofSnow(ctx, function () { roundRect(ctx, x, B.y - 20, B.w, 5, 2); });
    ctx.restore();
  }

  // A little tower of round stones, one on top of another, each a little different.
  function drawCairn(ctx, c, i) {
    var y = c.y;
    ctx.save();
    ellipse(ctx, c.x, c.y + 2, c.stones[0] * 1.2, 4, "rgba(60, 60, 50, 0.22)");
    c.stones.forEach(function (s, k) {
      var cy = y - s * 0.6, dx = (hash(i, k) - 0.5) * 4;
      ellipse(ctx, c.x + dx, cy, s, s * 0.62, k % 2 ? "#B9B3A8" : "#A29D94");
      ellipse(ctx, c.x + dx - s * 0.25, cy - s * 0.2, s * 0.5, s * 0.25, "rgba(255, 255, 255, 0.25)");
      y -= s * 1.2;
    });
    Weather.roofSnow(ctx, function () {
      var top = c.stones[c.stones.length - 1];
      ctx.beginPath();
      ctx.ellipse(c.x, y + top * 0.5, top * 0.9, top * 0.4, 0, Math.PI, Math.PI * 2);
      ctx.closePath();
    });
    ctx.restore();
  }

  // The mud puddle with the footprints of goats (two little hooves) and birds (three thin toes).
  function drawMud(ctx) {
    ctx.save();
    blobPath(ctx, MUD.x, MUD.y, MUD.rx, MUD.ry, 77);
    ctx.fillStyle = K.mud;
    ctx.fill();
    ellipse(ctx, MUD.x - 8, MUD.y - 4, MUD.rx * 0.5, MUD.ry * 0.35, K.mudLight);
    PRINTS.forEach(function (p) {
      var onMud = near(p[1], p[2], MUD.x, MUD.y, MUD.rx * 0.9);
      ctx.save();
      ctx.translate(p[1], p[2]);
      ctx.rotate(p[3]);
      ctx.fillStyle = onMud ? "#5E4430" : "rgba(110, 84, 60, 0.55)";
      ctx.strokeStyle = ctx.fillStyle;
      if (p[0] === "goat") {
        ellipse(ctx, -2.2, 0, 1.8, 3.2, ctx.fillStyle);
        ellipse(ctx, 2.2, 0, 1.8, 3.2, ctx.fillStyle);
      } else {
        ctx.lineWidth = 1.1;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 3);
        ctx.lineTo(0, -3);
        ctx.moveTo(0, -0.5);
        ctx.lineTo(-2.5, -3.2);
        ctx.moveTo(0, -0.5);
        ctx.lineTo(2.5, -3.2);
        ctx.stroke();
      }
      ctx.restore();
    });
    ctx.restore();
  }

  // A feather lying on the grass: a thin quill and a soft vane of its color.
  function drawFeather(ctx, f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.a);
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.quadraticCurveTo(-2, -6, 10, -1);
    ctx.quadraticCurveTo(0, 5, -11, 0);
    ctx.closePath();
    ctx.fillStyle = K.featherColors[f.c];
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 253, 248, 0.85)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-14, 1);
    ctx.lineTo(10, -1);
    ctx.stroke();
    ctx.restore();
  }

  // The rock wall with the dark round mouth of the cave.
  function drawCave(ctx) {
    var m = CAVE.mouth;
    ctx.save();
    ctx.beginPath();
    WALL.forEach(function (p, i) {
      if (i === 0) ctx.moveTo(p[0], p[1]);
      else ctx.quadraticCurveTo((WALL[i - 1][0] + p[0]) / 2 - 4, (WALL[i - 1][1] + p[1]) / 2 - 6, p[0], p[1]);
    });
    ctx.closePath();
    ctx.fillStyle = "#9F9A91";
    ctx.fill();
    ctx.strokeStyle = "rgba(90, 84, 76, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Layers of rock on the wall.
    ctx.strokeStyle = "rgba(90, 84, 76, 0.3)";
    ctx.lineWidth = 1.5;
    [[800, 540, 870], [900, 510, 990], [790, 600, 830], [940, 580, 996]].forEach(function (l) {
      ctx.beginPath();
      ctx.moveTo(l[0], l[1]);
      ctx.quadraticCurveTo((l[0] + l[2]) / 2, l[1] - 6, l[2], l[1] + 2);
      ctx.stroke();
    });
    ellipse(ctx, 870, 496, 50, 10, "rgba(255, 255, 255, 0.18)");
    // The mouth: dark and round, a little darker inside.
    ctx.beginPath();
    ctx.moveTo(m.x - m.w / 2, m.y);
    ctx.lineTo(m.x - m.w / 2, m.y - m.h * 0.45);
    ctx.quadraticCurveTo(m.x - m.w / 2, m.y - m.h, m.x, m.y - m.h);
    ctx.quadraticCurveTo(m.x + m.w / 2, m.y - m.h, m.x + m.w / 2, m.y - m.h * 0.45);
    ctx.lineTo(m.x + m.w / 2, m.y);
    ctx.closePath();
    ctx.fillStyle = "#2E2620";
    ctx.fill();
    ctx.strokeStyle = "#6F6A62";
    ctx.lineWidth = 4;
    ctx.stroke();
    ellipse(ctx, m.x, m.y - m.h * 0.35, m.w * 0.3, m.h * 0.3, "#1C1612");
    // Pebbles at its foot.
    [[-30, 4, 5], [26, 3, 4], [34, 6, 3], [-20, 7, 3]].forEach(function (p) { ellipse(ctx, m.x + p[0], m.y + p[1], p[2], p[2] * 0.6, K.rock); });
    Weather.roofSnow(ctx, function () {
      ctx.beginPath();
      ctx.moveTo(800, 520);
      ctx.quadraticCurveTo(846, 486, 900, 482);
      ctx.quadraticCurveTo(952, 484, 1004, 512);
      ctx.lineTo(1004, 526);
      ctx.quadraticCurveTo(950, 500, 900, 500);
      ctx.quadraticCurveTo(846, 504, 800, 520);
      ctx.closePath();
    });
    ctx.restore();
  }

  // A goat, seen from the side and a little from above: a round body, four thin legs, a head with little horns (the big
  // ones), ears, a beard and a short tail. Asleep it lies on the grass with its legs tucked in and its eyes closed.
  function drawGoat(ctx, g) {
    var at = goatSpot(g), k = (g.look.baby ? 0.66 : 1) * GOAT_SIZE, lift = goatLift(g), dir = g.dir, asleep = isAsleep(g);
    var body = g.look.color, shade = g.look.color === K.goatWhite ? "#E2DACB" : "#BF9A70";
    ctx.save();
    ctx.translate(at.x, at.y);
    // Its shadow stays on the ground (or on top of its rock).
    var ground = g.rock >= 0 && !g.hop ? g.lift : g.hop ? g.hop.from.lift + (g.hop.to.lift - g.hop.from.lift) * Math.min(1, g.hop.t / g.hop.time) : 0;
    ellipse(ctx, 0, 2 - ground, 22 * k, 6 * k, "rgba(60, 60, 50, 0.22)");
    ctx.translate(0, -lift);
    ctx.scale(dir * k, k);
    var hopping = !!g.hop || g.cheer > 0;
    if (!asleep) {
      // Legs: tucked a little while it hops.
      [[-12, 0], [-6, 1], [8, 0], [14, 1]].forEach(function (l, i) {
        var len = hopping ? 9 : 14;
        var swing = hopping ? (i < 2 ? -3 : 3) : 0;
        ctx.strokeStyle = i % 2 ? shade : body;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(l[0], -14);
        ctx.lineTo(l[0] + swing, -14 + len);
        ctx.stroke();
        ellipse(ctx, l[0] + swing, -14 + len + 1, 2.4, 1.6, K.hoof);
      });
    }
    var by = asleep ? -10 : -22;
    // The tail.
    ellipse(ctx, -20, by - 6, 4, 3, shade);
    // The body.
    ellipse(ctx, 0, by, 21, 12, body);
    ellipse(ctx, -2, by + 5, 17, 6, shade);
    if (asleep) {
      ellipse(ctx, -9, by + 9, 7, 3, shade);
      ellipse(ctx, 9, by + 9, 7, 3, shade);
    }
    if (g.look.color === K.goatBrown) ellipse(ctx, -4, by - 4, 9, 6, "#C9A177");
    // The head, a little lower while asleep.
    var hx = 20, hy = asleep ? by - 4 : by - 12;
    ellipse(ctx, hx - 4, hy + 5, 6, 8, body);
    ellipse(ctx, hx + 2, hy, 9, 7.5, body);
    ellipse(ctx, hx + 8, hy + 3, 5, 4, shade);
    // Ears.
    ctx.save();
    ctx.translate(hx - 4, hy - 2);
    ctx.rotate(asleep ? 0.9 : 0.5);
    ellipse(ctx, -4, 0, 6, 2.6, shade);
    ctx.restore();
    // Little horns (the big goats).
    if (!g.look.baby) {
      ctx.strokeStyle = K.horn;
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(hx, hy - 6);
      ctx.quadraticCurveTo(hx - 4, hy - 14, hx - 9, hy - 12);
      ctx.stroke();
    }
    // The beard.
    if (!g.look.baby) {
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.moveTo(hx + 4, hy + 6);
      ctx.lineTo(hx + 9, hy + 6);
      ctx.lineTo(hx + 6, hy + 13);
      ctx.closePath();
      ctx.fill();
    }
    // The eye: open, or closed while asleep. The nose.
    if (asleep) {
      ctx.strokeStyle = C.darkBrown;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(hx + 3, hy - 1, 2.2, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    } else {
      circle(ctx, hx + 3, hy - 1.5, 2, C.darkBrown);
      circle(ctx, hx + 3.6, hy - 2.2, 0.7, C.white);
    }
    circle(ctx, hx + 10, hy + 2, 1.1, "#8A6A5A");
    ctx.restore();
  }

  // A soft glow around a goat under the mouse.
  function drawGoatGlow(ctx, g) {
    var at = goatSpot(g), k = (g.look.baby ? 0.7 : 1) * GOAT_SIZE;
    ctx.save();
    ctx.shadowColor = C.cream;
    ctx.shadowBlur = 18;
    ellipse(ctx, at.x, at.y - goatLift(g) - 20 * k, 34 * k, 26 * k, "rgba(245, 235, 221, 0.3)");
    ctx.strokeStyle = C.sage;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  // A songbird: a round little body of its color, a lighter belly, a tiny beak and tail. Asleep it puffs up and closes its eyes;
  // flying, its wings flap.
  function drawBird(ctx, b) {
    var at = birdSpot(b), asleep = isNight() && !b.move;
    ctx.save();
    ctx.translate(at.x, at.y);
    ctx.scale(b.dir * BIRD_SIZE, BIRD_SIZE);
    var bob = b.move ? 0 : Math.sin(clock * 5 + b.i) * 0.6;
    ctx.translate(0, bob);
    // Tail.
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(-5, -4);
    ctx.lineTo(-11, -7);
    ctx.lineTo(-10, -2);
    ctx.closePath();
    ctx.fill();
    var puff = asleep ? 1.15 : 1;
    ellipse(ctx, 0, -5, 6 * puff, 5 * puff, b.color);
    ellipse(ctx, 1.5, -3.5, 3.8 * puff, 3 * puff, "#FFF4DE");
    // Wings: flapping while it flies.
    if (b.move && b.move.fly) {
      var flap = Math.sin(b.move.flap * 28) * 0.9;
      ctx.save();
      ctx.translate(-1, -7);
      ctx.rotate(-0.6 + flap);
      ellipse(ctx, -4, 0, 6, 2.4, b.color);
      ctx.restore();
    } else {
      ellipse(ctx, -1.5, -5.5, 3.6 * puff, 2.4 * puff, "rgba(0, 0, 0, 0.12)");
    }
    // Head, beak and eye.
    if (!asleep) {
      circle(ctx, 4, -9, 3.6, b.color);
      ctx.fillStyle = "#F0A23C";
      ctx.beginPath();
      ctx.moveTo(7, -9.5);
      ctx.lineTo(10, -8.6);
      ctx.lineTo(7, -7.6);
      ctx.closePath();
      ctx.fill();
      circle(ctx, 5, -9.6, 0.9, C.darkBrown);
    } else {
      circle(ctx, 3, -8, 3.6, b.color);
      ctx.strokeStyle = C.darkBrown;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(4, -8.4, 1.2, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLeaf(ctx, l) {
    if (l.age < 0) return;
    var at = leafSpot(l);
    ctx.save();
    ctx.globalAlpha = at.t > 0.8 ? (1 - at.t) / 0.2 : Math.min(1, at.t * 8);
    ctx.translate(at.x, at.y);
    ctx.rotate(l.age * l.spin);
    ctx.scale(1, 0.5 + 0.5 * Math.abs(Math.sin(l.age * l.spin * 0.7)));
    ellipse(ctx, 0, 0, 5, 2.4, l.color);
    ctx.strokeStyle = "rgba(60, 80, 40, 0.45)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
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
    drawGround(ctx);
    Weather.drawSnowyGrass(ctx);
    drawTrails(ctx);
    drawTrail(ctx);
    if (hover === "trail") drawGlow(ctx, { x: trailBox().x, y: -20, w: trailBox().w, h: trailBox().h + 10 });
    drawMud(ctx);
    FEATHERS.forEach(function (f) { drawFeather(ctx, f); });
    drawPeaks(ctx);
    // Everything that stands: whoever is lower is drawn last. The goats on a rock go just over it, and the birds just over
    // their pine (flying, over everything).
    var things = [];
    PINES.forEach(function (p, i) {
      things.push({ y: p.y, draw: function () {
        drawPine(ctx, p, i);
        if (i === NEST.pine) drawNest(ctx);
      } });
    });
    BORDER.forEach(function (p, i) { things.push({ y: p.y, draw: function () { drawPine(ctx, p, i + 40); } }); });
    ROCKS.forEach(function (r, i) { things.push({ y: r.y, draw: function () { drawRock(ctx, r, i); } }); });
    CAIRNS.forEach(function (c, i) { things.push({ y: c.y, draw: function () { drawCairn(ctx, c, i); } }); });
    things.push({ y: LOOKOUT.y, draw: function () { drawLookout(ctx); } });
    things.push({ y: BENCH.y, draw: function () { drawBench(ctx); } });
    things.push({ y: CAVE.mouth.y, draw: function () { drawCave(ctx); } });
    // The mouth of the cave glows under the mouse, over the wall.
    if (hover === "cave") things.push({ y: CAVE.mouth.y + 0.1, draw: function () { drawGlow(ctx, mouthBox()); } });
    goats.forEach(function (g) {
      var at = goatSpot(g);
      things.push({ y: at.y + 0.5, draw: function () {
        if (hover === g) drawGoatGlow(ctx, g);
        drawGoat(ctx, g);
      } });
    });
    birds.forEach(function (b) {
      things.push({ y: b.move && b.move.fly ? H + 50 : PINES[b.pine].y + 0.5, draw: function () { drawBird(ctx, b); } });
    });
    things.sort(function (a, b) { return a.y - b.y; }).forEach(function (one) { one.draw(); });
    leaves.forEach(function (l) { drawLeaf(ctx, l); });
    ctx.restore();
  }

  // The signs of the place and of the cave, drawn over the night tint like the signs of the city.
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

  // The little wooden sign nailed on the cave wall, with two little nails.
  function drawCaveSign(ctx) {
    var s = CAVE.sign;
    ctx.save();
    ctx.font = "700 " + s.size + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var w = ctx.measureText(s.text).width + s.size * 1.4, h = s.size * 1.9;
    s.measured = { x: s.x - w / 2, y: s.y - h / 2, w: w, h: h };
    ctx.shadowColor = "rgba(74, 52, 40, 0.3)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    fillRound(ctx, s.x - w / 2, s.y - h / 2, w, h, 4, C.wood);
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    circle(ctx, s.x - w / 2 + 5, s.y, 1.6, "#5E4028");
    circle(ctx, s.x + w / 2 - 5, s.y, 1.6, "#5E4028");
    ctx.fillStyle = C.cream;
    ctx.fillText(s.text, s.x, s.y + 1);
    ctx.restore();
  }

  function drawLabels(ctx) {
    drawSign(ctx, SIGN);
    drawCaveSign(ctx);
  }

  // A small "z" floating up and fading, over something asleep.
  function drawZ(ctx, x, y, phase, size) {
    var t = (clock * 0.45 + phase) % 1;
    ctx.save();
    ctx.globalAlpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
    ctx.font = "700 " + Math.round(size + t * 5) + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 3;
    ctx.strokeText("z", x + t * 10, y - t * 24);
    ctx.fillStyle = C.darkBrown;
    ctx.fillText("z", x + t * 10, y - t * 24);
    ctx.restore();
  }

  // After the night tint, before the characters: the "z" of the sleeping goats and birds and the notes of the songs,
  // so they are seen in the dark.
  function drawTop(ctx) {
    if (goats.some(isAsleep)) drawZ(ctx, BED[2].x + 4, BED[2].y - 40, 0, 14);
    if (isNight()) {
      birds.forEach(function (b, i) {
        if (b.move) return;
        var at = birdSpot(b);
        drawZ(ctx, at.x + 6, at.y - 12, i * 0.33, 9);
      });
    }
    notes.forEach(function (n) {
      if (n.age < 0) return;
      var t = n.age / 1.6;
      ctx.save();
      ctx.globalAlpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
      ctx.font = "700 13px " + CONFIG.fontFamily;
      ctx.textAlign = "center";
      ctx.lineWidth = 3;
      ctx.strokeStyle = C.cream;
      var x = n.x + n.side * t * 10 + Math.sin(t * 9) * 3, y = n.y - t * 30;
      ctx.strokeText(n.text, x, y);
      ctx.fillStyle = n.color;
      ctx.fillText(n.text, x, y);
      ctx.restore();
    });
  }

  // The floating texts ("Beee!" and "Shhh"), over everything (characters too).
  function drawPops(ctx) {
    pops.forEach(function (p) {
      var t = p.age / K.popTime;
      ctx.save();
      ctx.globalAlpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      ctx.font = "bold " + (p.small ? 15 : 22) + "px " + CONFIG.fontFamily;
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

  function onTrail(x, y) {
    return TRAILS.some(function (pts) {
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1];
        var t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)));
        if (dist(x, y, a[0] + dx * t, a[1] + dy * t) < 16) return true;
      }
      return false;
    });
  }

  // True if the spot is on a pine ("i" is how it sways), leaning with the wind.
  function pineAt(p, i, x, y) {
    return y <= p.y && y >= p.y - p.h && Math.abs(x - (p.x + sway(i) * (p.y - y))) <= p.w * 0.9;
  }

  // The id of the word for what is at a spot of the Montaña, or null. Small things win over big ones.
  function wordAt(x, y) {
    if (x < 0 || x > W || y < 0 || y > H) return null;
    for (var i = pops.length - 1; i >= 0; i--) {
      var p = pops[i];
      if (p.word && Math.abs(x - p.x) < 80 && Math.abs(y - (p.y - p.age / K.popTime * (p.small ? 24 : 40))) < 16) return p.word;
    }
    for (var l = 0; l < leaves.length; l++) {
      var at = leafSpot(leaves[l]);
      if (leaves[l].age > 0 && near(x, y, at.x, at.y, 10)) return "leaf";
    }
    var g = goatAt(x, y);
    if (g) return g.look.baby ? "babyGoat" : "goat";
    var nest = onPine(NEST.pine, NEST.x, NEST.y);
    if (Math.abs(x - nest.x) <= 18 && Math.abs(y - nest.y) <= 10) return "nest";
    if (FEATHERS.some(function (f) { return near(x, y, f.x, f.y, 13); })) return "feather";
    if (PRINTS.some(function (q) { return near(x, y, q[1], q[2], 5); })) return "footprint";
    if (near(x, y, MUD.x, MUD.y, MUD.rx) && Math.abs(y - MUD.y) <= MUD.ry + 2) return "mud";
    if (CAIRNS.some(function (c) { return inBox(x, y, cairnBox(c)); })) return "stoneTower";
    if (inBox(x, y, grow(benchBox(), 4))) return "bench";
    if (inBox(x, y, signBox(CAVE.sign)) || inBox(x, y, { x: CAVE.mouth.x - CAVE.mouth.w / 2, y: CAVE.mouth.y - CAVE.mouth.h,
      w: CAVE.mouth.w, h: CAVE.mouth.h })) return "cave";
    if (inBox(x, y, lookoutBox())) return "lookout";
    if (ROCKS.some(function (r) { return inBox(x, y, rockBox(r)); })) return "rock";
    if (inBox(x, y, CAVE.wall) || PEAKS.some(function (p) { return y > H - p.h * 0.6 && Math.abs(x - p.x) < p.w * 0.5; })) return "rock";
    for (var k = PINES.length - 1; k >= 0; k--) if (pineAt(PINES[k], k, x, y)) return "pine";
    for (var b = BORDER.length - 1; b >= 0; b--) if (pineAt(BORDER[b], b + 40, x, y)) return "pine";
    if (inBox(x, y, trailBox()) || inBox(x, y, signBox(SIGN))) return "mountain";
    if (onTrail(x, y)) return "trail";
    return null;
  }

  return {
    edge: K.edge,
    foot: K.foot,
    caveDoor: K.caveDoor,
    caveFoot: K.caveFoot,
    isWalkable: isWalkable,
    isSolid: isSolid,
    goatAt: goatAt,
    usableAt: usableAt,
    setHover: setHover,
    tapGoat: tapGoat,
    cancel: cancel,
    isActive: isActive,
    update: update,
    bubbleFor: bubbleFor,
    walkers: walkers,
    draw: draw,
    drawLabels: drawLabels,
    drawTop: drawTop,
    drawPops: drawPops,
    wordAt: wordAt,
    // Modo decorar moves nothing in the Montaña (js/decorate.js).
    movableAt: function () { return null; },
    canTurn: function () { return false; }
  };
})();
