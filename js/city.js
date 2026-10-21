// The fantasy city map seen from above: Sofía's house, the river and its bridge, the forest, the plaza,
// real.fixer's tent with its campfire and fireflies on the other side of the bridge, and Sofía's garden next to her house.
// Berries, mushrooms and crystals from js/gather.js grow in the forest.
// At night the campfire, the house windows and the fireflies shine.
// Also where characters may walk: never on the water (they cross on the bridge), never off the map,
// and around the house, the trees, the fountain, the tent, the campfire and the garden fence.
var City = (function () {
  var C = CONFIG.colors;
  var W = CONFIG.world.width, H = CONFIG.world.height;

  // The river runs from top to bottom, leaning a little to the right.
  // "half" is half its width; "bank" is how close a character's feet may get to the water.
  var RIVER = { x: 590, slope: 0.1, half: 46, bank: 16 };
  // The bridge crosses the river at this height. Characters walk on it within "half" of its middle,
  // and "reach" is how far past the water it goes on each side.
  var BRIDGE = { y: 360, half: 20, reach: 50 };
  // The house and the plaza sit low on the map, so the panel never covers them.
  var HOUSE = { x: 90, y: 440, w: 190, h: 160 };
  var PLAZA = { x: 420, y: 560, r: 90 };
  // Round trees of the forest, at the top left, as [x, y, radius].
  var TREES = [
    [50, 60, 32], [130, 40, 36], [230, 70, 34], [330, 45, 30], [420, 80, 32],
    [80, 150, 38], [185, 165, 34], [290, 150, 38], [395, 175, 30], [470, 210, 26],
    [45, 245, 30], [140, 260, 36], [245, 250, 30], [350, 270, 32], [60, 340, 26]
  ];
  // The ground of the forest, around the trees and its sign.
  var FOREST = { x: 0, y: 0, w: 505, h: 370 };
  // How close a character's feet may get to the edges of the map.
  var MARGIN = { side: 30, top: 130, bottom: 20 };
  // How close a character's feet may get to solid things, and the radius of the fountain's stone rim.
  var CLEAR = 14;
  var FOUNTAIN = 42;

  // Where a character stands outside, in front of the house door.
  var doorSpot = { x: HOUSE.x + HOUSE.w / 2, y: HOUSE.y + HOUSE.h + 35 };

  // ---------- Small drawing helpers ----------

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

  function withShadow(ctx, fn) {
    ctx.save();
    ctx.shadowColor = "rgba(74, 52, 40, 0.25)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    fn();
    ctx.restore();
  }

  function label(ctx, text, cx, cy, size) {
    ctx.save();
    ctx.font = "700 " + size + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var w = ctx.measureText(text).width + size * 1.2;
    var h = size * 1.7;
    withShadow(ctx, function () {
      fillRound(ctx, cx - w / 2, cy - h / 2, w, h, h / 2, C.darkBrown);
    });
    ctx.fillStyle = C.cream;
    ctx.fillText(text, cx, cy + 1);
    ctx.restore();
  }

  // ---------- Where characters can walk ----------

  // The middle of the river at a given height.
  function riverX(y) {
    return RIVER.x + RIVER.slope * y;
  }

  // "west", "east", "bridge" or "water" for a spot on the map.
  function areaAt(x, y) {
    var d = x - riverX(y);
    if (Math.abs(d) >= RIVER.half + RIVER.bank) return d < 0 ? "west" : "east";
    if (Math.abs(y - BRIDGE.y) <= BRIDGE.half) return "bridge";
    return "water";
  }

  // The closest spot inside the map and out of the water: a tap on the water goes to the nearest bank.
  function walkableSpot(x, y) {
    x = Math.max(MARGIN.side, Math.min(W - MARGIN.side, x));
    y = Math.max(MARGIN.top, Math.min(H - MARGIN.bottom, y));
    if (areaAt(x, y) === "water") {
      var mid = riverX(y);
      x = mid + (x < mid ? -1 : 1) * (RIVER.half + RIVER.bank + 1);
    }
    return { x: x, y: y };
  }

  // Where the bridge meets the ground on one side of the river.
  function bridgeEnd(side) {
    var reach = RIVER.half + BRIDGE.reach;
    return { x: riverX(BRIDGE.y) + (side === "west" ? -reach : reach), y: BRIDGE.y };
  }

  // True if the spot is inside the map and out of the water (used when loading a saved game).
  function isWalkable(x, y) {
    if (x < MARGIN.side || x > W - MARGIN.side || y < MARGIN.top || y > H - MARGIN.bottom) return false;
    return areaAt(x, y) !== "water";
  }

  function grow(b, by) {
    return { x: b.x - by, y: b.y - by, w: b.w + by * 2, h: b.h + by * 2 };
  }

  // True if a character cannot stand here: off the map, in the water, or on something solid
  // (the house, the fountain, the tent, the campfire, a tree or the garden fence). Used by js/path.js.
  // Small things (coins, berries, mushrooms, crystals, the flowers in the plots and the log) are not solid.
  function isSolid(x, y) {
    if (!isWalkable(x, y)) return true;
    if (inBox(x, y, grow(HOUSE, CLEAR))) return true;
    if (near(x, y, PLAZA.x, PLAZA.y, FOUNTAIN + CLEAR)) return true;
    if (inBox(x, y, grow(TENT, CLEAR)) || inBox(x, y, grow(FIRE, 10))) return true;
    for (var t = 0; t < TREES.length; t++) {
      if (near(x, y, TREES[t][0], TREES[t][1], TREES[t][2] * 0.6 + CLEAR)) return true;
    }
    return Garden.isFenceAt(x, y);
  }

  // True if the spot is on Sofía's house, roof included.
  function houseAt(x, y) {
    return x >= HOUSE.x - 8 && x <= HOUSE.x + HOUSE.w + 8 && y >= HOUSE.y - 8 && y <= HOUSE.y + HOUSE.h + 8;
  }

  // How far a spot is from the segment between points a and b.
  function distanceToSegment(x, y, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)));
    var px = a[0] + dx * t - x, py = a[1] + dy * t - y;
    return Math.sqrt(px * px + py * py);
  }

  // True if the spot is open grass where a character can walk: not on the river or the bridge,
  // the house, the garden, the plaza, the stone paths, the tent, the campfire or under a tree (used for the shiny coins).
  function isOpenGrass(x, y) {
    if (!isWalkable(x, y) || areaAt(x, y) === "bridge") return false;
    if (Garden.isGardenAt(x, y)) return false;
    if (Math.abs(x - riverX(y)) < RIVER.half + RIVER.bank + 20) return false;
    if (houseAt(x, y) || (x > HOUSE.x - 20 && x < HOUSE.x + HOUSE.w + 20 && y > HOUSE.y - 70)) return false;
    if (near(x, y, PLAZA.x, PLAZA.y, PLAZA.r + 20)) return false;
    if (inBox(x, y, { x: TENT.x - 25, y: TENT.y - 50, w: TENT.w + 50, h: TENT.h + 75 })) return false;
    if (inBox(x, y, { x: FIRE.x - 25, y: FIRE.y - 25, w: FIRE.w + 50, h: FIRE.h + 50 })) return false;
    if (inBox(x, y, { x: SEAT.x - 45, y: SEAT.y - 40, w: 90, h: 70 })) return false;
    for (var t = 0; t < TREES.length; t++) {
      if (near(x, y, TREES[t][0], TREES[t][1], TREES[t][2] + 20)) return false;
    }
    return !pathLines().some(function (line) {
      for (var i = 1; i < line.length; i++) {
        if (distanceToSegment(x, y, line[i - 1], line[i]) < 40) return true;
      }
      return false;
    });
  }

  // True if the spot is open forest floor between the trees, where berries, mushrooms and crystals
  // can grow (not under a tree and not on the "Bosque" sign).
  function isForestFloor(x, y) {
    if (!inBox(x, y, FOREST) || !isOpenGrass(x, y)) return false;
    return !inBox(x, y, { x: 190, y: 295, w: 160, h: 90 });
  }

  // True if the spot is on the water of the river, not on the bridge.
  function riverAt(x, y) {
    if (Math.abs(x - riverX(y)) > RIVER.half) return false;
    return !(Math.abs(x - riverX(BRIDGE.y)) <= RIVER.half + 34 && Math.abs(y - BRIDGE.y) <= 28);
  }

  // ---------- Grass and stone paths ----------

  function drawGrass(ctx) {
    ctx.fillStyle = C.cityGrass;
    ctx.fillRect(0, 0, W, H);
    // Little tufts in a gentle pattern that looks scattered.
    for (var gy = 20; gy < H; gy += 46) {
      for (var gx = 20; gx < W; gx += 52) {
        var jx = Math.sin(gx * 12.9898 + gy * 78.233) * 18;
        var jy = Math.cos(gx * 4.1414 + gy * 9.731) * 14;
        var x = gx + jx, y = gy + jy;
        ctx.fillStyle = (gx + gy) % 3 === 0 ? C.cityGrassDark : C.cityGrassLight;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.ellipse(x, y, 7, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // The stone paths, as lists of points: from the house door to the plaza, and from the plaza to the bridge.
  function pathLines() {
    return [
      [[doorSpot.x, HOUSE.y + HOUSE.h], [doorSpot.x + 30, doorSpot.y + 8], [PLAZA.x - PLAZA.r + 10, PLAZA.y + 20]],
      [[PLAZA.x + 40, PLAZA.y - PLAZA.r + 10], [bridgeEnd("west").x + 10, BRIDGE.y]]
    ];
  }

  function drawPaths(ctx) {
    var lines = pathLines();
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    [[40, C.stone], [32, C.stoneLight]].forEach(function (style) {
      ctx.strokeStyle = style[1];
      ctx.lineWidth = style[0];
      lines.forEach(function (line) {
        ctx.beginPath();
        line.forEach(function (p) { ctx.lineTo(p[0], p[1]); });
        ctx.stroke();
      });
    });
    ctx.restore();
  }

  // ---------- River and bridge ----------

  // How far the banks curve in, so the water looks soft and never reaches the walking limit.
  function wobble(y) {
    return 4 + Math.sin(y / 35) * 3;
  }

  function drawRiver(ctx, time) {
    var top = -20, bottom = H + 20, step = 20, y;
    ctx.beginPath();
    for (y = top; y <= bottom; y += step) ctx.lineTo(riverX(y) - RIVER.half + wobble(y), y);
    for (y = bottom; y >= top; y -= step) ctx.lineTo(riverX(y) + RIVER.half - wobble(y + 50), y);
    ctx.closePath();
    ctx.strokeStyle = C.cityGrassDark;
    ctx.lineWidth = 8;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.fillStyle = C.water;
    ctx.fill();

    // Little ripples floating down the river.
    ctx.save();
    ctx.strokeStyle = C.waterLight;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (var k = 0; k < 9; k++) {
      var ry = (k * 90 + time * 25) % (H + 80) - 40;
      var rx = riverX(ry) + (k % 2 === 0 ? -16 : 14);
      ctx.beginPath();
      ctx.moveTo(rx - 9, ry);
      ctx.quadraticCurveTo(rx, ry - 5, rx + 9, ry);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBridge(ctx) {
    var cx = riverX(BRIDGE.y), half = RIVER.half + 34, h = 56, top = BRIDGE.y - h / 2;
    withShadow(ctx, function () {
      fillRound(ctx, cx - half, top, half * 2, h, 10, C.wood);
    });
    // Planks
    ctx.save();
    ctx.strokeStyle = "rgba(74, 52, 40, 0.35)";
    ctx.lineWidth = 2;
    for (var x = cx - half + 14; x < cx + half - 6; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, top + 8);
      ctx.lineTo(x, top + h - 8);
      ctx.stroke();
    }
    ctx.restore();
    // Railings with round posts at the corners
    fillRound(ctx, cx - half, top - 2, half * 2, 8, 4, C.darkBrown);
    fillRound(ctx, cx - half, top + h - 6, half * 2, 8, 4, C.darkBrown);
    [[cx - half + 4, top + 2], [cx + half - 4, top + 2], [cx - half + 4, top + h - 2], [cx + half - 4, top + h - 2]]
      .forEach(function (p) { circle(ctx, p[0], p[1], 7, C.darkBrown); });
  }

  // ---------- Plaza with its fountain ----------

  function drawPlaza(ctx, time) {
    var x = PLAZA.x, y = PLAZA.y, r = PLAZA.r;
    circle(ctx, x, y, r, C.stoneLight);
    ctx.save();
    ctx.strokeStyle = C.stone;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    // Stone tiles: a ring and spokes
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r - 26, 0, Math.PI * 2);
    ctx.stroke();
    for (var i = 0; i < 16; i++) {
      var a = i * Math.PI / 8;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * (r - 26), y + Math.sin(a) * (r - 26));
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      ctx.stroke();
    }
    ctx.restore();

    // Fountain: stone rim, water, and a little column in the middle.
    withShadow(ctx, function () {
      circle(ctx, x, y, FOUNTAIN, C.stone);
    });
    circle(ctx, x, y, 34, C.water);
    // A ripple that grows and fades
    var grow = (time * 14) % 22;
    ctx.save();
    ctx.globalAlpha = 1 - grow / 22;
    ctx.strokeStyle = C.waterLight;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, 12 + grow, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    circle(ctx, x, y, 10, C.stoneLight);
    circle(ctx, x, y, 5, C.waterLight);
    // Drops jumping out of the top
    for (var d = 0; d < 4; d++) {
      var t = (time * 1.4 + d / 4) % 1;
      var angle = d * Math.PI / 2 + 0.6;
      var dist = 6 + t * 18;
      ctx.save();
      ctx.globalAlpha = 1 - t;
      circle(ctx, x + Math.cos(angle) * dist, y + Math.sin(angle) * dist - Math.sin(t * Math.PI) * 8, 2.5, C.waterLight);
      ctx.restore();
    }
  }

  // ---------- Sofía's house seen from outside ----------

  // Left edge of the two front windows of the house, and the height of their glass.
  var WINDOWS = [HOUSE.x + 30, HOUSE.x + HOUSE.w - 56];
  var WINDOW_Y = HOUSE.y + 92 + 25;

  function drawHouse(ctx, highlight) {
    var x = HOUSE.x, y = HOUSE.y, w = HOUSE.w, h = HOUSE.h;
    var wallTop = y + 92, bottom = y + h, cx = x + w / 2;

    // Front wall with a wooden trim at the bottom
    withShadow(ctx, function () {
      fillRound(ctx, x + 8, wallTop, w - 16, bottom - wallTop, 8, C.cream);
    });
    fillRound(ctx, x + 8, bottom - 8, w - 16, 8, 4, C.wood);

    // Windows on both sides of the door
    WINDOWS.forEach(function (wx) {
      fillRound(ctx, wx - 3, wallTop + 22, 32, 28, 5, C.wood);
      fillRound(ctx, wx, wallTop + 25, 26, 22, 3, "#BFE0EA");
      ctx.fillStyle = C.wood;
      ctx.fillRect(wx + 12, wallTop + 25, 2, 22);
      ctx.fillRect(wx, wallTop + 35, 26, 2);
    });

    // Door with a round top and a golden knob, and a stone step
    fillRound(ctx, cx - 26, bottom - 4, 52, 10, 5, C.stone);
    ctx.fillStyle = C.wood;
    ctx.beginPath();
    ctx.moveTo(cx - 18, bottom - 2);
    ctx.lineTo(cx - 18, bottom - 32);
    ctx.arc(cx, bottom - 32, 18, Math.PI, 0);
    ctx.lineTo(cx + 18, bottom - 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    circle(ctx, cx + 10, bottom - 22, 2.6, "#E2B44B");

    // Roof seen from above: two slopes with rows of round shingles
    var roofX = x - 6, roofW = w + 12, roofTop = y - 6, roofBottom = wallTop + 10;
    var ridge = (roofTop + roofBottom) / 2;
    withShadow(ctx, function () {
      fillRound(ctx, roofX, roofTop, roofW, roofBottom - roofTop, 14, C.terracotta);
    });
    fillRound(ctx, roofX, roofTop, roofW, ridge - roofTop, 14, "#D98168");
    ctx.save();
    roundRect(ctx, roofX, roofTop, roofW, roofBottom - roofTop, 14);
    ctx.clip();
    ctx.strokeStyle = "rgba(74, 52, 40, 0.25)";
    ctx.lineWidth = 2;
    for (var sy = roofTop + 16; sy < roofBottom; sy += 16) {
      ctx.beginPath();
      for (var sx = roofX; sx < roofX + roofW; sx += 18) {
        ctx.moveTo(sx, sy);
        ctx.arc(sx + 9, sy, 9, Math.PI, 0, true);
      }
      ctx.stroke();
    }
    ctx.restore();
    fillRound(ctx, roofX + 4, ridge - 4, roofW - 8, 8, 4, "#A9533C");

    // Chimney
    fillRound(ctx, x + w - 52, roofTop + 12, 26, 26, 5, C.darkBrown);
    fillRound(ctx, x + w - 48, roofTop + 16, 18, 18, 4, "#2E2420");

    // Soft glow around the house when the mouse is over it.
    if (highlight) {
      ctx.save();
      ctx.shadowColor = C.cream;
      ctx.shadowBlur = 18;
      roundRect(ctx, x - 12, y - 14, w + 24, h + 24, 22);
      ctx.fillStyle = "rgba(245, 235, 221, 0.25)";
      ctx.fill();
      ctx.strokeStyle = C.sage;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.restore();
    }
  }

  // ---------- real.fixer's tent, campfire and fireflies ----------

  var TENT = CONFIG.cityObjects[0], FIRE = CONFIG.cityObjects[1];
  // The log to sit on by the campfire, on the side away from the cooking spot. This is its middle.
  var SEAT = { x: 722, y: 494 };

  // A tent seen from above: two slopes with a ridge pole down the middle, ropes to stakes,
  // and the entrance at the front with its flaps tied open.
  function drawTent(ctx) {
    var x = TENT.x, y = TENT.y, w = TENT.w, h = TENT.h;
    var cx = x + w / 2, bottom = y + h;

    // Ropes from the corners to little wooden stakes
    ctx.save();
    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 2;
    [[x + 8, y + 14, x - 14, y - 2], [x + w - 8, y + 14, x + w + 14, y - 2],
      [x + 8, bottom - 12, x - 14, bottom + 4], [x + w - 8, bottom - 12, x + w + 14, bottom + 4]]
      .forEach(function (r) {
        ctx.beginPath();
        ctx.moveTo(r[0], r[1]);
        ctx.lineTo(r[2], r[3]);
        ctx.stroke();
        circle(ctx, r[2], r[3], 3.5, C.wood);
      });
    ctx.restore();

    // The two slopes: light on the left, in shade on the right
    withShadow(ctx, function () {
      fillRound(ctx, x, y, w, h, 12, C.terracotta);
    });
    ctx.save();
    roundRect(ctx, x, y, w, h, 12);
    ctx.clip();
    ctx.fillStyle = "#D98168";
    ctx.fillRect(x, y, w / 2, h);
    // Seams across the cloth
    ctx.strokeStyle = "rgba(74, 52, 40, 0.2)";
    ctx.lineWidth = 2;
    for (var sy = y + 26; sy < bottom - 10; sy += 26) {
      ctx.beginPath();
      ctx.moveTo(x, sy + 6);
      ctx.lineTo(cx, sy);
      ctx.lineTo(x + w, sy + 6);
      ctx.stroke();
    }
    ctx.restore();

    // Entrance: a dark opening at the front with cream flaps tied to each side
    ctx.fillStyle = C.darkBrown;
    ctx.beginPath();
    ctx.moveTo(cx - 28, bottom);
    ctx.lineTo(cx, bottom - 46);
    ctx.lineTo(cx + 28, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.cream;
    [-1, 1].forEach(function (side) {
      ctx.beginPath();
      ctx.moveTo(cx, bottom - 46);
      ctx.lineTo(cx + side * 28, bottom);
      ctx.lineTo(cx + side * 40, bottom);
      ctx.closePath();
      ctx.fill();
      circle(ctx, cx + side * 30, bottom - 10, 3, C.wood);
    });

    // Ridge pole with its ends sticking out
    fillRound(ctx, cx - 3, y - 6, 6, h + 10, 3, C.darkBrown);
    circle(ctx, cx, y - 6, 5, C.wood);
  }

  // A campfire: a ring of stones, crossed logs and flames that sway softly, with a warm glow.
  function drawCampfire(ctx, time) {
    var cx = FIRE.x + FIRE.w / 2, cy = FIRE.y + FIRE.h / 2;

    // Warm light on the grass, breathing slowly
    ctx.save();
    var glow = ctx.createRadialGradient(cx, cy, 6, cx, cy, 70 + Math.sin(time * 3) * 4);
    glow.addColorStop(0, "rgba(255, 214, 107, 0.45)");
    glow.addColorStop(1, "rgba(255, 214, 107, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawLog(ctx);

    // Stones
    for (var i = 0; i < 10; i++) {
      var a = i * Math.PI / 5;
      circle(ctx, cx + Math.cos(a) * 28, cy + Math.sin(a) * 24, 7, i % 2 === 0 ? C.stone : C.stoneLight);
    }
    // Two crossed logs
    [0.5, -0.5].forEach(function (angle) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      fillRound(ctx, -27, -6, 54, 12, 6, C.wood);
      circle(ctx, -24, 0, 4.5, "#C99A6E");
      circle(ctx, 24, 0, 4.5, "#C99A6E");
      ctx.restore();
    });

    drawFlames(ctx, time, cx, cy);

    // Little sparks rising and fading
    for (var k = 0; k < 3; k++) {
      var t = (time * 0.7 + k / 3) % 1;
      ctx.save();
      ctx.globalAlpha = 1 - t;
      circle(ctx, cx + Math.sin(time * 2 + k * 2) * 8, cy - 20 - t * 40, 2, "#FFD66B");
      ctx.restore();
    }
  }

  // A log lying on the grass beside the fire, pointing down the screen, with its cut end showing the rings.
  function drawLog(ctx) {
    var x = SEAT.x, y = SEAT.y;
    withShadow(ctx, function () {
      fillRound(ctx, x - 11, y - 24, 22, 48, 10, C.wood);
    });
    ctx.save();
    ctx.strokeStyle = "rgba(74, 52, 40, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    [[-4, -18, -4, -4], [3, -12, 3, 6], [-2, 2, -2, 12]].forEach(function (l) {
      ctx.beginPath();
      ctx.moveTo(x + l[0], y + l[1]);
      ctx.lineTo(x + l[2], y + l[3]);
      ctx.stroke();
    });
    ctx.restore();
    ctx.fillStyle = "#C99A6E";
    ctx.beginPath();
    ctx.ellipse(x, y + 19, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = C.wood;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(x, y + 19, 5, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Flames: three layers, each swaying and stretching a little
  function drawFlames(ctx, time, cx, cy) {
    [[12, C.terracotta, 0], [8, "#E2B44B", 1.3], [4, C.cream, 2.6]].forEach(function (layer) {
      var r = layer[0];
      var sway = Math.sin(time * 5 + layer[2]) * 3;
      var tall = r * (1.9 + Math.sin(time * 7 + layer[2]) * 0.2);
      ctx.fillStyle = layer[1];
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.quadraticCurveTo(cx - r, cy - tall * 0.5, cx + sway, cy - tall);
      ctx.quadraticCurveTo(cx + r, cy - tall * 0.5, cx + r, cy);
      ctx.arc(cx, cy, r, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
    });
  }

  // Fireflies: little yellow lights that float around the tent and the campfire and twinkle.
  var FIREFLIES = [
    [745, 300, 0], [940, 260, 1.7], [880, 450, 3.1], [730, 420, 4.4],
    [950, 520, 2.3], [700, 520, 5.2], [860, 210, 0.8]
  ];

  // Where a firefly is at a given time: it floats around its home spot.
  function fireflySpot(f, time) {
    return {
      x: f[0] + Math.sin(time * 0.6 + f[2]) * 22 + Math.sin(time * 1.7 + f[2] * 2) * 6,
      y: f[1] + Math.cos(time * 0.5 + f[2] * 1.3) * 16
    };
  }

  // "bright" goes from 0 (day) to 1 (night): at night they are bigger and glow more.
  function drawFireflies(ctx, time, bright) {
    bright = bright || 0;
    FIREFLIES.forEach(function (f) {
      var p = fireflySpot(f, time);
      var x = p.x, y = p.y;
      var shine = 0.5 + 0.5 * Math.sin(time * 3 + f[2] * 2.7);
      ctx.save();
      ctx.globalAlpha = 0.25 + shine * 0.75;
      ctx.shadowColor = "#FFE680";
      ctx.shadowBlur = 12 + bright * 14;
      circle(ctx, x, y, 7 + bright * 3, "rgba(255, 230, 128, 0.6)");
      ctx.shadowBlur = 0;
      circle(ctx, x, y, 3.2 + bright, "#FFF6C2");
      ctx.restore();
    });
  }

  // A soft round light that fades out at the edge, added on top of what is there.
  function halo(ctx, x, y, r, rgb, alpha) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(" + rgb + ", " + alpha + ")");
    g.addColorStop(1, "rgba(" + rgb + ", 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Drawn over the darkened map: "dark" goes from 0 (day) to 1 (night).
  function drawNightLights(ctx, time, dark) {
    var N = CONFIG.night;
    ctx.save();
    roundRect(ctx, 0, 0, W, H, 40);
    ctx.clip();

    // Warm halo around the campfire, flickering a little, and the flames bright again on top.
    var cx = FIRE.x + FIRE.w / 2, cy = FIRE.y + FIRE.h / 2;
    ctx.globalCompositeOperation = "lighter";
    halo(ctx, cx, cy, 150 + Math.sin(time * 3) * 6 + Math.sin(time * 7.3) * 3, N.warmLight, 0.45 * dark);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = dark;
    drawFlames(ctx, time, cx, cy);

    // Yellow light in the house windows, with a little glow around them.
    WINDOWS.forEach(function (wx) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1;
      halo(ctx, wx + 13, WINDOW_Y + 11, 40, N.warmLight, 0.35 * dark);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = dark;
      fillRound(ctx, wx, WINDOW_Y, 26, 22, 3, N.windowLight);
      ctx.fillStyle = C.wood;
      ctx.fillRect(wx + 12, WINDOW_Y, 2, 22);
      ctx.fillRect(wx, WINDOW_Y + 10, 26, 2);
    });

    // Moon flowers in the garden, with their blue-silver halo.
    ctx.globalAlpha = 1;
    Garden.drawNightLights(ctx, time, dark);

    // Crystals in the forest, shining more at night.
    Gather.drawNightLights(ctx, time, dark);

    // Fireflies, brighter than by day.
    ctx.globalAlpha = dark;
    drawFireflies(ctx, time, dark);
    ctx.restore();
  }

  // Soft glow around the tent or the campfire when the mouse is over it.
  function drawThingHighlight(ctx, f) {
    ctx.save();
    ctx.shadowColor = C.cream;
    ctx.shadowBlur = 18;
    roundRect(ctx, f.x - 12, f.y - 12, f.w + 24, f.h + 24, 20);
    ctx.fillStyle = "rgba(245, 235, 221, 0.25)";
    ctx.fill();
    ctx.strokeStyle = C.sage;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  }

  // ---------- Forest ----------

  // Seconds of wind so far; it stops while the game is paused, so the trees stand still.
  var wind = 0;

  function update(dt) {
    if (!Needs.isPaused()) wind += dt;
  }

  // Each tree sways with the wind at its own speed; the top moves a little more than the middle.
  // The shadow stays still, like the trunk.
  function drawTree(ctx, x, y, r, i) {
    var s = CONFIG.alive.sway;
    var speed = s.slow + (s.fast - s.slow) * ((i * 7) % 10) / 9;
    var sway = Math.sin(wind * speed + i * 1.9) * s.amount * r / 34;
    ctx.save();
    ctx.fillStyle = "rgba(74, 52, 40, 0.22)";
    ctx.beginPath();
    ctx.ellipse(x + 6, y + r * 0.55, r, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    circle(ctx, x + sway * 0.6, y, r, C.cityGrassDark);
    circle(ctx, x - r * 0.25 + sway, y - r * 0.25, r * 0.62, C.sage);
    circle(ctx, x - r * 0.38 + sway * 1.3, y - r * 0.4, r * 0.22, C.cityGrassLight);
  }

  // ---------- Main draw ----------

  // The time of the last drawing, so we know where the fireflies are.
  var lastTime = 0;

  function draw(ctx, time, highlightHouse, highlightId) {
    lastTime = time;
    ctx.save();
    roundRect(ctx, 0, 0, W, H, 40);
    ctx.clip();
    drawGrass(ctx);
    drawPaths(ctx);
    drawRiver(ctx, time);
    drawBridge(ctx);
    drawPlaza(ctx, time);
    drawHouse(ctx, highlightHouse);
    Garden.draw(ctx, time);
    drawTent(ctx);
    drawCampfire(ctx, time);
    CONFIG.cityObjects.forEach(function (f) {
      if (f.id === highlightId) drawThingHighlight(ctx, f);
    });
    TREES.forEach(function (t, i) { drawTree(ctx, t[0], t[1], t[2], i); });
    Gather.draw(ctx, time);
    drawFireflies(ctx, time);
    ctx.restore();
  }

  // The signs of the places, drawn over the night tint so they always read well.
  function drawLabels(ctx) {
    label(ctx, "Casa de Sofía", HOUSE.x + HOUSE.w / 2, HOUSE.y - 34, 24);
    label(ctx, "Río", riverX(600), 600, 24);
    label(ctx, "Puente", riverX(BRIDGE.y), BRIDGE.y + 62, 22);
    label(ctx, "Bosque", 270, 330, 24);
    label(ctx, "Plaza", PLAZA.x, PLAZA.y - 60, 22);
    label(ctx, "Carpa de real.fixer", TENT.x + TENT.w / 2, TENT.y - 30, 20);
    var fence = CONFIG.garden.fence;
    label(ctx, "Jardín de Sofía", fence.x + fence.w / 2, fence.y - 16, 16);
  }

  // ---------- What is under the mouse ----------

  function near(x, y, cx, cy, r) {
    return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r;
  }

  function inBox(x, y, b) {
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  }

  // The id of the word for what is at a spot of the map, or null. Small things win over big places.
  function wordAt(x, y) {
    if (x < 0 || x > W || y < 0 || y > H) return null;
    for (var i = 0; i < FIREFLIES.length; i++) {
      var p = fireflySpot(FIREFLIES[i], lastTime);
      if (near(x, y, p.x, p.y, 14)) return "firefly";
    }
    if (inBox(x, y, FIRE)) return "campfire";
    if (inBox(x, y, TENT)) return "tent";
    var garden = Garden.wordAt(x, y);
    if (garden) return garden;
    if (near(x, y, PLAZA.x, PLAZA.y, FOUNTAIN)) return "fountain";
    if (houseAt(x, y)) return "house";
    var half = RIVER.half + 34;
    if (Math.abs(x - riverX(BRIDGE.y)) <= half && Math.abs(y - BRIDGE.y) <= 28) return "bridge";
    for (var t = 0; t < TREES.length; t++) {
      if (near(x, y, TREES[t][0], TREES[t][1], TREES[t][2])) return "tree";
    }
    if (Math.abs(x - riverX(y)) <= RIVER.half) return "river";
    if (near(x, y, PLAZA.x, PLAZA.y, PLAZA.r)) return "square";
    if (inBox(x, y, FOREST)) return "forest";
    return null;
  }

  return {
    update: update,
    draw: draw,
    drawLabels: drawLabels,
    wordAt: wordAt,
    drawNightLights: drawNightLights,
    isWalkable: isWalkable,
    isSolid: isSolid,
    walkableSpot: walkableSpot,
    campfireSeat: SEAT,
    houseAt: houseAt,
    isOpenGrass: isOpenGrass,
    isForestFloor: isForestFloor,
    riverAt: riverAt,
    riverX: riverX,
    doorSpot: doorSpot
  };
})();
