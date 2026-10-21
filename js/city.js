// The fantasy city map seen from above: Sofía's house, the river and its bridge, the forest and the plaza.
// Also where characters may walk: never on the water (they cross on the bridge) and never off the map.
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
  // How close a character's feet may get to the edges of the map.
  var MARGIN = { side: 30, top: 130, bottom: 20 };

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

  // Points to walk through to get to a spot. Each side of the river is open ground,
  // so a straight line works there; to reach the other side they go over the bridge.
  function path(fromX, fromY, x, y) {
    var target = walkableSpot(x, y);
    var from = areaAt(fromX, fromY), to = areaAt(target.x, target.y);
    var points = [];
    if (from !== to) {
      if (from === "west" || from === "east") points.push(bridgeEnd(from));
      if (to !== "bridge") points.push(bridgeEnd(to));
    }
    points.push(target);
    return points;
  }

  // True if a character may stand here (used when loading a saved game).
  function isWalkable(x, y) {
    if (x < MARGIN.side || x > W - MARGIN.side || y < MARGIN.top || y > H - MARGIN.bottom) return false;
    return areaAt(x, y) !== "water";
  }

  // True if the spot is on Sofía's house, roof included.
  function houseAt(x, y) {
    return x >= HOUSE.x - 8 && x <= HOUSE.x + HOUSE.w + 8 && y >= HOUSE.y - 8 && y <= HOUSE.y + HOUSE.h + 8;
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

  function drawPaths(ctx) {
    var lines = [
      [[doorSpot.x, HOUSE.y + HOUSE.h], [doorSpot.x + 30, doorSpot.y + 8], [PLAZA.x - PLAZA.r + 10, PLAZA.y + 20]],
      [[PLAZA.x + 40, PLAZA.y - PLAZA.r + 10], [bridgeEnd("west").x + 10, BRIDGE.y]]
    ];
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
      circle(ctx, x, y, 42, C.stone);
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

  function drawHouse(ctx, highlight) {
    var x = HOUSE.x, y = HOUSE.y, w = HOUSE.w, h = HOUSE.h;
    var wallTop = y + 92, bottom = y + h, cx = x + w / 2;

    // Front wall with a wooden trim at the bottom
    withShadow(ctx, function () {
      fillRound(ctx, x + 8, wallTop, w - 16, bottom - wallTop, 8, C.cream);
    });
    fillRound(ctx, x + 8, bottom - 8, w - 16, 8, 4, C.wood);

    // Windows on both sides of the door
    [x + 30, x + w - 56].forEach(function (wx) {
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

  // ---------- Forest ----------

  function drawTree(ctx, x, y, r) {
    ctx.save();
    ctx.fillStyle = "rgba(74, 52, 40, 0.22)";
    ctx.beginPath();
    ctx.ellipse(x + 6, y + r * 0.55, r, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    circle(ctx, x, y, r, C.cityGrassDark);
    circle(ctx, x - r * 0.25, y - r * 0.25, r * 0.62, C.sage);
    circle(ctx, x - r * 0.38, y - r * 0.4, r * 0.22, C.cityGrassLight);
  }

  // ---------- Main draw ----------

  function draw(ctx, time, highlightHouse) {
    ctx.save();
    roundRect(ctx, 0, 0, W, H, 40);
    ctx.clip();
    drawGrass(ctx);
    drawPaths(ctx);
    drawRiver(ctx, time);
    drawBridge(ctx);
    drawPlaza(ctx, time);
    drawHouse(ctx, highlightHouse);
    TREES.forEach(function (t) { drawTree(ctx, t[0], t[1], t[2]); });
    ctx.restore();

    label(ctx, "Casa de Sofía", HOUSE.x + HOUSE.w / 2, HOUSE.y - 34, 24);
    label(ctx, "Río", riverX(600), 600, 24);
    label(ctx, "Puente", riverX(BRIDGE.y), BRIDGE.y + 62, 22);
    label(ctx, "Bosque", 270, 330, 24);
    label(ctx, "Plaza", PLAZA.x, PLAZA.y - 60, 22);
  }

  return {
    draw: draw,
    path: path,
    isWalkable: isWalkable,
    houseAt: houseAt,
    doorSpot: doorSpot
  };
})();
