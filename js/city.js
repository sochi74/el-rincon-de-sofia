// The fantasy city map seen from above: Sofía's house, the river and its bridge, the forest, the plaza,
// real.fixer's tent with its campfire and fireflies on the other side of the bridge, and Sofía's garden next to her house.
// The neighbors' homes too: Lumi's treehouse on a big forest tree and Vladi's little castle, seen only from outside.
// Berries, mushrooms and crystals from js/gather.js grow in the forest.
// At night the campfire, the house windows and the fireflies shine.
// The decorations that goals give (js/goals.js) are drawn here too: real.fixer's guitar and moon lantern by his tent,
// Lumi's crystal lantern and fairy lights on her tree, and Vladi's shiny pot and golden heart at his castle.
// The weather (js/weather.js) draws on the map too: snow on the grass and the roofs, puddles, rings on the river and the snowman.
// Krohna's round bed sits by the tent too (always there), where the kitten sleeps while real.fixer sleeps in the tent.
// They are only decoration: nothing walks around them. Modo decorar (js/decorate.js) can move and turn the guitar, the pot
// and Krohna's bed to open grass; the rest stays where it is.
// Also where characters may walk: never on the water (they cross on the bridge), never off the map,
// and around the house, the trees, the fountain, the tent, the campfire, the garden fence and the neighbors' homes.
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
  // The neighbors' homes: Lumi's treehouse (with its rope ladder) and Vladi's castle.
  var TREEHOUSE = CONFIG.neighbors.houses.treehouse, CASTLE = CONFIG.neighbors.houses.castle;

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

  // Where each sign of the map was drawn, by its text, so the guitar, the pot and Krohna's bed are never put on one.
  var signs = {};

  function label(ctx, text, cx, cy, size) {
    ctx.save();
    ctx.font = "700 " + size + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var w = ctx.measureText(text).width + size * 1.2;
    var h = size * 1.7;
    signs[text] = { x: cx - w / 2, y: cy - h / 2, w: w, h: h };
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
  // (the house, the fountain, the tent, the campfire, a tree, the garden fence, the rope ladder of the treehouse
  // or Vladi's castle, and the snowman on snowy days). Used by js/path.js.
  // Small things (coins, berries, mushrooms, crystals, the flowers in the plots and the log) are not solid.
  function isSolid(x, y) {
    if (!isWalkable(x, y)) return true;
    if (inBox(x, y, grow(HOUSE, CLEAR))) return true;
    if (near(x, y, PLAZA.x, PLAZA.y, FOUNTAIN + CLEAR)) return true;
    if (Weather.snowmanBlocks(x, y, CLEAR)) return true;
    if (inBox(x, y, grow(TENT, CLEAR)) || inBox(x, y, grow(FIRE, 10))) return true;
    if (inBox(x, y, grow(CASTLE, CLEAR)) || inBox(x, y, grow(TREEHOUSE.ladder, 4))) return true;
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
  // the house, the garden, the plaza, the stone paths, the tent, the campfire, the neighbors' homes, under a tree,
  // or on the guitar, the pot or Krohna's bed (used for the shiny coins and the forest things).
  function isOpenGrass(x, y) {
    if (MOVABLE.some(function (id) { return isOn(id) && inBox(x, y, grow(boxOf(id), 10)); })) return false;
    if (!isWalkable(x, y) || areaAt(x, y) === "bridge") return false;
    if (Garden.isGardenAt(x, y)) return false;
    if (Math.abs(x - riverX(y)) < RIVER.half + RIVER.bank + 20) return false;
    if (houseAt(x, y) || (x > HOUSE.x - 20 && x < HOUSE.x + HOUSE.w + 20 && y > HOUSE.y - 70)) return false;
    if (near(x, y, PLAZA.x, PLAZA.y, PLAZA.r + 20)) return false;
    if (inBox(x, y, { x: TENT.x - 25, y: TENT.y - 50, w: TENT.w + 50, h: TENT.h + 75 })) return false;
    if (inBox(x, y, { x: FIRE.x - 25, y: FIRE.y - 25, w: FIRE.w + 50, h: FIRE.h + 50 })) return false;
    if (inBox(x, y, { x: SEAT.x - 45, y: SEAT.y - 40, w: 90, h: 70 })) return false;
    if (inBox(x, y, grow(TREEHOUSE, 20)) || inBox(x, y, { x: CASTLE.x - 25, y: CASTLE.y - 60, w: CASTLE.w + 50, h: CASTLE.h + 85 })) return false;
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
    Weather.roofSnow(ctx, function () { roundRect(ctx, roofX + 3, roofTop + 3, roofW - 6, roofBottom - roofTop - 6, 12); });

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
    Weather.roofSnow(ctx, function () { roundRect(ctx, x + 3, y + 3, w - 6, h - 6, 10); });

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

    // The round window of the treehouse and the arched window of the castle, lit in yellow.
    [[TREE_WINDOW, 6, 30], [CASTLE_WINDOW, 7, 34]].forEach(function (wnd) {
      var p = wnd[0];
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1;
      halo(ctx, p.x, p.y, wnd[2], N.warmLight, 0.4 * dark);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = dark;
      circle(ctx, p.x, p.y, wnd[1], N.windowLight);
    });

    // The castle lanterns: a warm halo around each one, and the flame bright again on top.
    LANTERNS.forEach(function (lx) {
      var ly = CASTLE.y + CASTLE.h - 36;
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1;
      halo(ctx, lx, ly, 62 + Math.sin(time * 4 + lx) * 3, N.warmLight, 0.5 * dark);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = dark;
      drawLantern(ctx, lx, ly, time);
    });

    // The lanterns and fairy lights that goals give.
    drawDecorationLights(ctx, time, dark);

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

  // ---------- The neighbors' homes ----------

  // Lumi's treehouse, on top of a big forest tree: a wooden platform, a little wooden house with a terracotta roof,
  // a round window, a little door and a rope ladder down to the grass.
  function drawTreehouse(ctx, highlight) {
    var cx = TREEHOUSE.x + TREEHOUSE.w / 2, L = TREEHOUSE.ladder;
    var wallTop = 118, bottom = 152;

    // Rope ladder: two ropes with wooden rungs, down from the platform to the grass.
    ctx.save();
    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 2;
    [L.x + 2, L.x + L.w - 2].forEach(function (rx) {
      ctx.beginPath();
      ctx.moveTo(rx, L.y + 4);
      ctx.lineTo(rx, L.y + L.h);
      ctx.stroke();
    });
    ctx.restore();
    for (var ry = L.y + 12; ry < L.y + L.h; ry += 8) fillRound(ctx, L.x, ry, L.w, 3, 1.5, C.wood);

    // Platform
    withShadow(ctx, function () {
      ctx.fillStyle = C.wood;
      ctx.beginPath();
      ctx.ellipse(cx, bottom + 2, 34, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#C99A6E";
    ctx.beginPath();
    ctx.ellipse(cx, bottom, 32, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden walls with planks
    fillRound(ctx, cx - 24, wallTop, 48, bottom - wallTop, 4, C.wood);
    ctx.save();
    ctx.strokeStyle = "rgba(74, 52, 40, 0.3)";
    ctx.lineWidth = 1.5;
    for (var py = wallTop + 8; py < bottom; py += 8) {
      ctx.beginPath();
      ctx.moveTo(cx - 23, py);
      ctx.lineTo(cx + 23, py);
      ctx.stroke();
    }
    ctx.restore();

    // Round window with its cross, and the little arched door
    circle(ctx, cx - 11, wallTop + 15, 8, C.darkBrown);
    circle(ctx, cx - 11, wallTop + 15, 6, "#BFE0EA");
    ctx.fillStyle = C.darkBrown;
    ctx.fillRect(cx - 12, wallTop + 9, 2, 12);
    ctx.fillRect(cx - 17, wallTop + 14, 12, 2);
    ctx.fillStyle = C.darkBrown;
    ctx.beginPath();
    ctx.moveTo(cx + 5, bottom);
    ctx.lineTo(cx + 5, bottom - 12);
    ctx.arc(cx + 11, bottom - 12, 6, Math.PI, 0);
    ctx.lineTo(cx + 17, bottom);
    ctx.closePath();
    ctx.fill();
    circle(ctx, cx + 14.5, bottom - 7, 1.3, "#E2B44B");

    // Terracotta roof, with a darker ridge
    withShadow(ctx, function () {
      ctx.fillStyle = C.terracotta;
      ctx.beginPath();
      ctx.moveTo(cx - 32, wallTop + 4);
      ctx.lineTo(cx - 16, TREEHOUSE.y + 4);
      ctx.lineTo(cx + 16, TREEHOUSE.y + 4);
      ctx.lineTo(cx + 32, wallTop + 4);
      ctx.closePath();
      ctx.fill();
    });
    Weather.roofSnow(ctx, function () {
      ctx.beginPath();
      ctx.moveTo(cx - 29, wallTop + 2);
      ctx.lineTo(cx - 15, TREEHOUSE.y + 5);
      ctx.lineTo(cx + 15, TREEHOUSE.y + 5);
      ctx.lineTo(cx + 29, wallTop + 2);
      ctx.quadraticCurveTo(cx, wallTop - 4, cx - 29, wallTop + 2);
      ctx.closePath();
    });
    fillRound(ctx, cx - 17, TREEHOUSE.y + 1, 34, 6, 3, "#A9533C");

    if (highlight) drawThingHighlight(ctx, TREEHOUSE);
  }

  // Where the window of the treehouse is, for its light at night.
  var TREE_WINDOW = { x: TREEHOUSE.x + TREEHOUSE.w / 2 - 11, y: 133 };

  // Vladi's little stone castle: a wall with battlements between two little towers with pointed roofs,
  // an arched window, a wooden door and two lanterns that are always lit.
  function drawCastle(ctx, time, highlight) {
    var x = CASTLE.x, y = CASTLE.y, w = CASTLE.w, h = CASTLE.h;
    var bottom = y + h, cx = x + w / 2, tw = 32;
    var wallTop = y + 22;

    // The middle wall, with its battlements
    withShadow(ctx, function () {
      fillRound(ctx, x + tw - 4, wallTop, w - (tw - 4) * 2, bottom - wallTop, 4, C.stone);
    });
    for (var bx = x + tw; bx < x + w - tw - 4; bx += 14) fillRound(ctx, bx, wallTop - 9, 9, 12, 2, C.stone);
    for (var nx = x + tw; nx < x + w - tw - 4; nx += 14) {
      Weather.roofSnow(ctx, roundRect.bind(null, ctx, nx, wallTop - 10, 9, 5, 2));
    }
    // Stone blocks
    ctx.save();
    ctx.strokeStyle = "rgba(74, 52, 40, 0.22)";
    ctx.lineWidth = 1.5;
    for (var row = 0, sy = wallTop + 12; sy < bottom - 2; sy += 12, row++) {
      ctx.beginPath();
      ctx.moveTo(x + tw - 4, sy);
      ctx.lineTo(x + w - tw + 4, sy);
      for (var sx = x + tw + (row % 2) * 10; sx < x + w - tw; sx += 20) {
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy - 12);
      }
      ctx.stroke();
    }
    ctx.restore();

    // The two towers, with pointed dark roofs and a golden tip
    [x, x + w - tw].forEach(function (tx) {
      withShadow(ctx, function () {
        fillRound(ctx, tx, y + 8, tw, bottom - y - 8, 5, C.stoneLight);
      });
      ctx.fillStyle = C.darkBrown;
      ctx.beginPath();
      ctx.moveTo(tx - 4, y + 12);
      ctx.lineTo(tx + tw / 2, y - 22);
      ctx.lineTo(tx + tw + 4, y + 12);
      ctx.closePath();
      ctx.fill();
      Weather.roofSnow(ctx, function () {
        ctx.beginPath();
        ctx.moveTo(tx - 1, y + 9);
        ctx.lineTo(tx + tw / 2, y - 20);
        ctx.lineTo(tx + tw + 1, y + 9);
        ctx.quadraticCurveTo(tx + tw / 2, y + 3, tx - 1, y + 9);
        ctx.closePath();
      });
      circle(ctx, tx + tw / 2, y - 22, 3, "#E2B44B");
      // A narrow tower window
      fillRound(ctx, tx + tw / 2 - 3, y + 26, 6, 13, 3, C.darkBrown);
    });

    // Arched window over the door, where the "Zzz" come out by day
    ctx.fillStyle = C.darkBrown;
    ctx.beginPath();
    ctx.moveTo(cx - 10, wallTop + 30);
    ctx.lineTo(cx - 10, wallTop + 18);
    ctx.arc(cx, wallTop + 18, 10, Math.PI, 0);
    ctx.lineTo(cx + 10, wallTop + 30);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6E6AAE";
    ctx.beginPath();
    ctx.moveTo(cx - 7, wallTop + 28);
    ctx.lineTo(cx - 7, wallTop + 18);
    ctx.arc(cx, wallTop + 18, 7, Math.PI, 0);
    ctx.lineTo(cx + 7, wallTop + 28);
    ctx.closePath();
    ctx.fill();

    // Wooden door with a round top and a stone step
    fillRound(ctx, cx - 20, bottom - 4, 40, 8, 4, C.stone);
    ctx.fillStyle = C.wood;
    ctx.beginPath();
    ctx.moveTo(cx - 14, bottom - 2);
    ctx.lineTo(cx - 14, bottom - 22);
    ctx.arc(cx, bottom - 22, 14, Math.PI, 0);
    ctx.lineTo(cx + 14, bottom - 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, bottom - 36);
    ctx.lineTo(cx, bottom - 2);
    ctx.stroke();
    circle(ctx, cx + 6, bottom - 16, 2, "#E2B44B");

    // Two lanterns on posts beside the door, always lit
    LANTERNS.forEach(function (lx) {
      fillRound(ctx, lx - 2, bottom - 30, 4, 30, 2, C.darkBrown);
      drawLantern(ctx, lx, bottom - 36, time);
    });

    if (highlight) drawThingHighlight(ctx, { x: x, y: y - 22, w: w, h: h + 22 });
  }

  // Where the two lanterns stand, and the window of the castle.
  var LANTERNS = [CASTLE.x + CASTLE.w / 2 - 30, CASTLE.x + CASTLE.w / 2 + 30];
  var CASTLE_WINDOW = { x: CASTLE.x + CASTLE.w / 2, y: CASTLE.y + 22 + 22 };

  // A little lantern: a dark frame with a warm flame that flickers a little.
  function drawLantern(ctx, x, y, time) {
    fillRound(ctx, x - 6, y - 8, 12, 15, 3, C.darkBrown);
    var flicker = 0.85 + Math.sin(time * 9 + x) * 0.15;
    ctx.save();
    ctx.globalAlpha = flicker;
    fillRound(ctx, x - 4, y - 6, 8, 11, 2, "#FFD66B");
    ctx.restore();
    fillRound(ctx, x - 7, y - 10, 14, 3, 1.5, C.darkBrown);
  }

  // ---------- Decorations from the goals ----------

  // Where each one is, for drawing it and for its word. The guitar and the pot can be moved: see "Modo decorar" below.
  var GUITAR = { w: 34, h: 80, start: { x: 761, y: 308 } };
  var MOON_LANTERN = { x: 773, y: 340, w: 26, h: 40, cx: 786, cy: 368 };
  var CRYSTAL_LANTERN = { x: 252, y: 120, w: 20, h: 34, cx: 262, cy: 141 };
  var FAIRY_LIGHTS = { x: 250, y: 156, w: 80, h: 34 };
  var POT = { w: 28, h: 24, start: { x: 842, y: 672 } };
  // Krohna's bed, at first on the grass at the right of the tent entrance.
  var PET_BED = { w: 52, h: 38, start: { x: 904, y: 404 } };
  var HEART = { x: 929, y: 614, w: 20, h: 20, cx: 939, cy: 624 };
  // The little lights along the garland, with their colors.
  var BULBS = (function () {
    var colors = ["#E8607E", "#F2C230", "#B5DCEC", "#C6DCA4", "#F4B494"];
    var out = [];
    for (var i = 0; i <= 10; i++) {
      var t = i / 10;
      out.push({ x: 256 + t * 68, y: 160 + 24 * 4 * t * (1 - t), color: colors[i % colors.length], phase: i * 1.7 });
    }
    return out;
  })();

  // real.fixer's guitar, at first leaning against the side of his tent.
  function drawGuitar(ctx) {
    ctx.save();
    turnAt(ctx, "guitar");
    ctx.translate(-1, 28);
    ctx.rotate(0.22);
    withShadow(ctx, function () {
      circle(ctx, 0, 0, 11, C.wood);
      circle(ctx, 0, -14, 8.5, C.wood);
    });
    circle(ctx, 0, -7, 3.6, C.darkBrown);
    fillRound(ctx, -4.5, 4, 9, 2.5, 1.2, C.darkBrown);
    fillRound(ctx, -2, -60, 4, 46, 2, "#8A5C38");
    fillRound(ctx, -3.5, -70, 7, 11, 2, C.darkBrown);
    [-66, -62].forEach(function (py) {
      circle(ctx, -4.5, py, 1.3, "#E2B44B");
      circle(ctx, 4.5, py, 1.3, "#E2B44B");
    });
    ctx.strokeStyle = "rgba(255, 253, 248, 0.75)";
    ctx.lineWidth = 0.6;
    [-1, 1].forEach(function (dx) {
      ctx.beginPath();
      ctx.moveTo(dx, -60);
      ctx.lineTo(dx, 5);
      ctx.stroke();
    });
    ctx.restore();
  }

  // A crescent moon: a round light with a bite taken out of it.
  function crescent(ctx, x, y, r, color) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.moveTo(x + r * 1.3, y - r * 0.2);
    ctx.arc(x + r * 0.5, y - r * 0.2, r * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill("evenodd");
    ctx.restore();
  }

  // The moon lantern hanging from the front corner of real.fixer's tent.
  function drawMoonLantern(ctx, lit) {
    var L = MOON_LANTERN;
    if (!lit) {
      ctx.save();
      ctx.strokeStyle = C.darkBrown;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(L.cx, L.y + 2);
      ctx.lineTo(L.cx, L.cy - 10);
      ctx.stroke();
      ctx.restore();
      fillRound(ctx, L.cx - 3, L.cy - 12, 6, 3, 1.5, C.darkBrown);
    }
    crescent(ctx, L.cx, L.cy, 10, lit ? "#FFF1B8" : "#E8D9A0");
    circle(ctx, L.cx - 4, L.cy + 1, 1.3, lit ? "#FFFFFF" : "#C9B66E");
  }

  // Lumi's crystal lantern, hanging from the edge of her treehouse roof.
  function drawCrystalLantern(ctx, lit) {
    var L = CRYSTAL_LANTERN;
    if (!lit) {
      ctx.save();
      ctx.strokeStyle = C.darkBrown;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(L.cx, L.y + 2);
      ctx.lineTo(L.cx, L.cy - 9);
      ctx.stroke();
      ctx.restore();
      fillRound(ctx, L.cx - 4, L.cy - 10, 8, 3, 1.5, "#E2B44B");
    }
    ctx.fillStyle = lit ? "#E6F6FC" : C.waterLight;
    ctx.beginPath();
    ctx.moveTo(L.cx, L.cy - 8);
    ctx.lineTo(L.cx + 5.5, L.cy - 2);
    ctx.lineTo(L.cx + 4, L.cy + 6);
    ctx.lineTo(L.cx, L.cy + 10);
    ctx.lineTo(L.cx - 4, L.cy + 6);
    ctx.lineTo(L.cx - 5.5, L.cy - 2);
    ctx.closePath();
    ctx.fill();
    if (!lit) {
      ctx.strokeStyle = "#7FB7C9";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Lumi's fairy lights along her tree, under the treehouse. At night each one twinkles at its own pace.
  function drawFairyLights(ctx, time, lit) {
    if (!lit) {
      ctx.save();
      ctx.strokeStyle = C.darkBrown;
      ctx.lineWidth = 1;
      ctx.beginPath();
      BULBS.forEach(function (b, i) {
        if (i === 0) ctx.moveTo(b.x, b.y - 2); else ctx.lineTo(b.x, b.y - 2);
      });
      ctx.stroke();
      ctx.restore();
    }
    var base = ctx.globalAlpha;
    BULBS.forEach(function (b) {
      ctx.globalAlpha = lit ? base * (0.55 + 0.45 * Math.sin(time * 3 + b.phase)) : base;
      circle(ctx, b.x, b.y, 2.4, b.color);
    });
    ctx.globalAlpha = base;
  }

  // Vladi's shiny pot, at first by the door of his castle.
  function drawPot(ctx) {
    ctx.save();
    turnAt(ctx, "pot");
    var x = 0, y = 2;
    withShadow(ctx, function () {
      fillRound(ctx, x - 11, y - 7, 22, 15, 6, "#B8743E");
    });
    fillRound(ctx, x - 13, y - 4, 4, 4, 2, "#8A5C38");
    fillRound(ctx, x + 9, y - 4, 4, 4, 2, "#8A5C38");
    fillRound(ctx, x - 12, y - 10, 24, 5, 2.5, "#D18F55");
    circle(ctx, x, y - 11, 2.2, "#8A5C38");
    // Shine
    fillRound(ctx, x - 7, y - 4, 3, 8, 1.5, "rgba(255, 241, 184, 0.85)");
    ctx.save();
    ctx.fillStyle = "#FFF1B8";
    ctx.translate(x + 7, y - 15);
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4, d = i % 2 === 0 ? 4 : 1.2;
      ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  // Krohna's bed: round and padded, cream with an orange edge, and a little blanket folded over one side.
  function drawPetBed(ctx) {
    ctx.save();
    turnAt(ctx, "petBed");
    withShadow(ctx, function () {
      ctx.fillStyle = "#E8913A";
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 19, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#F6C48A";
    ctx.beginPath();
    ctx.ellipse(0, -1, 22, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.cream;
    ctx.beginPath();
    ctx.ellipse(0, 1, 17, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // The blanket, sage with cream dots
    ctx.fillStyle = C.sage;
    ctx.beginPath();
    ctx.moveTo(6, -13);
    ctx.quadraticCurveTo(20, -8, 21, 6);
    ctx.lineTo(10, 12);
    ctx.quadraticCurveTo(4, 0, 6, -13);
    ctx.closePath();
    ctx.fill();
    [[13, -5], [16, 3], [10, 5]].forEach(function (d) { circle(ctx, d[0], d[1], 1.4, C.cream); });
    ctx.restore();
  }

  // Where Krohna sleeps: curled up in the middle of its bed.
  function petBedSpot() {
    return { x: layout.petBed.x + 4, y: layout.petBed.y + 8 };
  }

  // A golden heart on the right tower of Vladi's castle.
  function drawHeart(ctx) {
    var x = HEART.cx, y = HEART.cy - 5;
    ctx.save();
    ctx.fillStyle = "#E2B44B";
    ctx.strokeStyle = "#B8862E";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 12);
    ctx.bezierCurveTo(x - 13, y + 3, x - 7, y - 7, x, y - 1);
    ctx.bezierCurveTo(x + 7, y - 7, x + 13, y + 3, x, y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    circle(ctx, x - 3.5, y + 1.5, 1.5, "#FFF1B8");
    ctx.restore();
  }

  // The night glow of the lanterns and the fairy lights, over the darkened map.
  function drawDecorationLights(ctx, time, dark) {
    var N = CONFIG.night;
    if (Goals.isMet("realfixer", 1)) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1;
      halo(ctx, MOON_LANTERN.cx, MOON_LANTERN.cy, 40 + Math.sin(time * 2) * 2, "255, 241, 184", 0.45 * dark);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = dark;
      drawMoonLantern(ctx, true);
    }
    if (Goals.isMet("lumi", 0)) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1;
      halo(ctx, CRYSTAL_LANTERN.cx, CRYSTAL_LANTERN.cy, 34 + Math.sin(time * 2.6) * 2, CONFIG.gather.crystalLight, 0.5 * dark);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = dark;
      drawCrystalLantern(ctx, true);
    }
    if (Goals.isMet("lumi", 1)) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1;
      BULBS.forEach(function (b) {
        halo(ctx, b.x, b.y, 9, N.warmLight, (0.25 + 0.25 * Math.sin(time * 3 + b.phase)) * dark);
      });
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = dark;
      drawFairyLights(ctx, time, true);
    }
    ctx.globalAlpha = 1;
  }

  // The word of a decoration at a spot, or null.
  function decorationAt(x, y) {
    if (Goals.isMet("realfixer", 1) && inBox(x, y, MOON_LANTERN)) return "lantern";
    if (isOn("guitar") && inBox(x, y, boxOf("guitar"))) return "guitar";
    if (Goals.isMet("lumi", 0) && inBox(x, y, CRYSTAL_LANTERN)) return "lantern";
    if (Goals.isMet("lumi", 1) && inBox(x, y, FAIRY_LIGHTS)) return "fairyLights";
    if (isOn("pot") && inBox(x, y, boxOf("pot"))) return "pot";
    if (inBox(x, y, boxOf("petBed"))) return "krohnaBed";
    if (Goals.isMet("vladi", 1) && inBox(x, y, HEART)) return "heart";
    return null;
  }

  // ---------- Modo decorar ----------

  // The guitar and the pot can be moved and turned (js/decorate.js), once their goal is met, and Krohna's bed always.
  // "w", "h" is the spot each one takes when it is not turned; "start" is the middle of its first spot.
  var MOVABLE = ["petBed", "guitar", "pot"];
  var DECOR = { guitar: GUITAR, pot: POT, petBed: PET_BED };
  var UNLOCK = { guitar: ["realfixer", 0], pot: ["vladi", 0] };
  // Where each one is now: { x, y, dir }, its middle and how many quarter turns clockwise.
  var layout = {};

  function resetLayout() {
    MOVABLE.forEach(function (id) {
      layout[id] = { x: DECOR[id].start.x, y: DECOR[id].start.y, dir: 0 };
    });
  }
  resetLayout();

  // True once its goal is met (Krohna's bed always is). The forest grows its first things before js/goals.js is loaded:
  // then only the bed is.
  function isOn(id) {
    if (!UNLOCK[id]) return true;
    return typeof Goals !== "undefined" && Goals.isMet(UNLOCK[id][0], UNLOCK[id][1]);
  }

  function boxOf(id) {
    var d = DECOR[id], p = layout[id];
    var side = p.dir % 2 === 1;
    var w = side ? d.h : d.w, h = side ? d.w : d.h;
    return { x: p.x - w / 2, y: p.y - h / 2, w: w, h: h };
  }

  // Draw around the middle of a decoration, turned the way it is.
  function turnAt(ctx, id) {
    var p = layout[id];
    ctx.translate(p.x, p.y);
    ctx.rotate(p.dir * Math.PI / 2);
  }

  function overlap(a, b) {
    return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  }

  // The decoration that can be moved at a spot, or null.
  function movableAt(x, y) {
    for (var i = MOVABLE.length - 1; i >= 0; i--) {
      var id = MOVABLE[i];
      if (isOn(id) && inBox(x, y, boxOf(id))) return id;
    }
    return null;
  }

  function dragTo(id, x, y) {
    layout[id].x = Math.round(x);
    layout[id].y = Math.round(y);
  }

  function turn(id) {
    layout[id].dir = (layout[id].dir + 1) % 4;
  }

  function getPos(id) {
    var p = layout[id];
    return { x: p.x, y: p.y, dir: p.dir };
  }

  function setPos(id, pos) {
    layout[id] = pos;
  }

  // True if a spot of the map is grass where a decoration can stand: not on the river, the bridge, the stone paths,
  // the plaza, the garden, a house (Sofía's, the tent with its campfire and log, the treehouse or the castle,
  // with what hangs on them) or under a tree, and not right at the edge of the map.
  function isDecorGrass(x, y) {
    if (x < 10 || x > W - 10 || y < 10 || y > H - 10) return false;
    if (Math.abs(x - riverX(y)) < RIVER.half + 6) return false;
    if (Math.abs(x - riverX(BRIDGE.y)) <= RIVER.half + BRIDGE.reach && Math.abs(y - BRIDGE.y) <= BRIDGE.half + 14) return false;
    if (near(x, y, PLAZA.x, PLAZA.y, PLAZA.r + 4) || Garden.isGardenAt(x, y) || houseAt(x, y)) return false;
    if (neighborHomeAt(x, y) || inBox(x, y, grow(TREEHOUSE.ladder, 4))) return false;
    if ([TENT, FIRE, MOON_LANTERN, HEART, { x: SEAT.x - 30, y: SEAT.y - 16, w: 60, h: 32 }].some(function (b) {
      return inBox(x, y, grow(b, 4));
    })) return false;
    for (var t = 0; t < TREES.length; t++) {
      if (near(x, y, TREES[t][0], TREES[t][1], TREES[t][2] + 4)) return false;
    }
    return !pathLines().some(function (line) {
      for (var i = 1; i < line.length; i++) {
        if (distanceToSegment(x, y, line[i - 1], line[i]) < 24) return true;
      }
      return false;
    });
  }

  // True if a decoration is all on grass where it can stand (see above), off the signs, the other decoration,
  // the forest things and the shiny coins.
  function fits(id) {
    var b = boxOf(id);
    var cols = Math.ceil(b.w / 10), rows = Math.ceil(b.h / 10);
    for (var i = 0; i <= cols; i++) {
      for (var j = 0; j <= rows; j++) {
        var x = b.x + b.w * i / cols, y = b.y + b.h * j / rows;
        if (!isDecorGrass(x, y) || Coins.wordAt(x, y)) return false;
      }
    }
    if (MOVABLE.some(function (other) { return other !== id && isOn(other) && overlap(grow(b, 6), boxOf(other)); })) return false;
    if (Object.keys(signs).some(function (k) { return overlap(b, signs[k]); })) return false;
    return !Gather.isNear(b.x + b.w / 2, b.y + b.h / 2, Math.max(b.w, b.h) / 2 + 16);
  }

  function getLayout() {
    var out = {};
    MOVABLE.forEach(function (id) { out[id] = getPos(id); });
    return out;
  }

  // Used when loading a saved game. Anything missing or strange stays in its first spot.
  function setLayout(saved) {
    if (!saved || typeof saved !== "object") return;
    MOVABLE.forEach(function (id) {
      var s = saved[id];
      if (!s || typeof s !== "object" || [0, 1, 2, 3].indexOf(s.dir) < 0) return;
      if (typeof s.x !== "number" || typeof s.y !== "number" || !isWalkable(s.x, s.y)) return;
      layout[id] = { x: s.x, y: s.y, dir: s.dir };
    });
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
    Weather.drawSnowyGrass(ctx);
    drawPaths(ctx);
    drawRiver(ctx, time);
    Weather.drawRiverRings(ctx);
    drawBridge(ctx);
    drawPlaza(ctx, time);
    Weather.drawPuddles(ctx);
    Weather.drawSnowman(ctx);
    drawHouse(ctx, highlightHouse);
    Garden.draw(ctx, time);
    drawTent(ctx);
    drawPetBed(ctx);
    if (isOn("guitar")) drawGuitar(ctx);
    if (Goals.isMet("realfixer", 1)) drawMoonLantern(ctx, false);
    drawCampfire(ctx, time);
    drawCastle(ctx, time, highlightId === "castle");
    if (isOn("pot")) drawPot(ctx);
    if (Goals.isMet("vladi", 1)) drawHeart(ctx);
    CONFIG.cityObjects.forEach(function (f) {
      if (f.id === highlightId) drawThingHighlight(ctx, f);
    });
    TREES.forEach(function (t, i) { drawTree(ctx, t[0], t[1], t[2], i); });
    drawTreehouse(ctx, highlightId === "treehouse");
    if (Goals.isMet("lumi", 1)) drawFairyLights(ctx, time, false);
    if (Goals.isMet("lumi", 0)) drawCrystalLantern(ctx, false);
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
    label(ctx, "Casa de Lumi", TREEHOUSE.x + TREEHOUSE.w / 2, TREEHOUSE.y - 14, 16);
    label(ctx, "Castillito de Vladi", CASTLE.x + CASTLE.w / 2, CASTLE.y - 38, 16);
  }

  // ---------- What is under the mouse ----------

  function near(x, y, cx, cy, r) {
    return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r;
  }

  function inBox(x, y, b) {
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  }

  // "treehouse" or "castle" if the spot is on one of the neighbors' homes (roofs and ladder included), or null.
  function neighborHomeAt(x, y) {
    if (inBox(x, y, TREEHOUSE)) return "treehouse";
    if (inBox(x, y, { x: CASTLE.x, y: CASTLE.y - 22, w: CASTLE.w, h: CASTLE.h + 22 })) return "castle";
    return null;
  }

  // The id of the word for what is at a spot of the map, or null. Small things win over big places.
  function wordAt(x, y) {
    if (x < 0 || x > W || y < 0 || y > H) return null;
    for (var i = 0; i < FIREFLIES.length; i++) {
      var p = fireflySpot(FIREFLIES[i], lastTime);
      if (near(x, y, p.x, p.y, 14)) return "firefly";
    }
    var decoration = decorationAt(x, y);
    if (decoration) return decoration;
    if (inBox(x, y, FIRE)) return "campfire";
    if (inBox(x, y, TENT)) return "tent";
    var home = neighborHomeAt(x, y);
    if (home) return home;
    var garden = Garden.wordAt(x, y);
    if (garden) return garden;
    if (Weather.snowmanAt(x, y)) return "snowman";
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
    neighborHomeAt: neighborHomeAt,
    castleWindow: CASTLE_WINDOW,
    isOpenGrass: isOpenGrass,
    isForestFloor: isForestFloor,
    riverAt: riverAt,
    riverX: riverX,
    doorSpot: doorSpot,
    petBedSpot: petBedSpot,
    // Modo decorar
    movableAt: movableAt,
    boxOf: boxOf,
    dragTo: dragTo,
    canTurn: function () { return true; },
    turn: turn,
    getPos: getPos,
    setPos: setPos,
    fits: fits,
    settle: function () {},
    resetLayout: resetLayout,
    getLayout: getLayout,
    setLayout: setLayout
  };
})();
