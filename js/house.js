// Draws the house seen from above: floors, walls, room names and furniture.
// Also the decorations: Sofía's painting easel in the Sala (always there), and the ones her goals give (js/goals.js):
// a vase with garden flowers on the TV stand and colored bunting on the Cocina wall.
// At night the Televisión gives a soft glow while someone watches it.
// Also where characters may walk: inside the rooms, through the doorways, and never on the furniture.
var House = (function () {
  var C = CONFIG.colors;

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

  function withShadow(ctx, fn) {
    ctx.save();
    ctx.shadowColor = "rgba(74, 52, 40, 0.25)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    fn();
    ctx.restore();
  }

  function label(ctx, text, cx, cy, size, bg, fg) {
    ctx.save();
    ctx.font = "700 " + size + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var w = ctx.measureText(text).width + size * 1.2;
    var h = size * 1.7;
    withShadow(ctx, function () {
      fillRound(ctx, cx - w / 2, cy - h / 2, w, h, h / 2, bg);
    });
    ctx.fillStyle = fg;
    ctx.fillText(text, cx, cy + 1);
    ctx.restore();
  }

  // ---------- Floors ----------

  function drawFloor(ctx, room) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(room.x, room.y, room.w, room.h);
    ctx.clip();

    if (room.floor === "tiles") {
      var t = 40;
      for (var ty = room.y; ty < room.y + room.h; ty += t) {
        for (var tx = room.x; tx < room.x + room.w; tx += t) {
          var even = ((tx - room.x) / t + (ty - room.y) / t) % 2 === 0;
          ctx.fillStyle = even ? C.tileLight : C.tileDark;
          ctx.fillRect(tx, ty, t, t);
        }
      }
    } else if (room.floor === "carpet") {
      ctx.fillStyle = C.carpet;
      ctx.fillRect(room.x, room.y, room.w, room.h);
      ctx.fillStyle = "rgba(255, 253, 248, 0.18)";
      for (var dy = room.y + 12; dy < room.y + room.h; dy += 24) {
        for (var dx = room.x + 12; dx < room.x + room.w; dx += 24) {
          ctx.beginPath();
          ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      ctx.fillStyle = C.woodLight;
      ctx.fillRect(room.x, room.y, room.w, room.h);
      ctx.strokeStyle = "rgba(74, 52, 40, 0.18)";
      ctx.lineWidth = 2;
      var plank = 34;
      var row = 0;
      for (var py = room.y; py < room.y + room.h; py += plank, row++) {
        ctx.beginPath();
        ctx.moveTo(room.x, py);
        ctx.lineTo(room.x + room.w, py);
        ctx.stroke();
        for (var px = room.x + (row % 2) * 80; px < room.x + room.w; px += 160) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + plank);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  // ---------- Walls ----------

  // Wall pieces as [x1, y1, x2, y2]; gaps between pieces are doorways.
  function wallSegments() {
    var d = CONFIG.doorWidth;
    return [
      // Outside walls (front door on the bottom wall)
      [40, 40, 960, 40],
      [960, 40, 960, 680],
      [960, 680, 190, 680],
      [190 - d, 680, 40, 680],
      [40, 680, 40, 40],
      // Kitchen | Bedroom
      [420, 40, 420, 150],
      [420, 150 + d, 420, 340],
      // Top rooms | Living room
      [40, 340, 230, 340],
      [230 + d, 340, 470, 340],
      [470 + d, 340, 960, 340]
    ];
  }

  function drawWalls(ctx) {
    var segs = wallSegments();
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = CONFIG.wallThickness;
    segs.forEach(function (s) {
      ctx.beginPath();
      ctx.moveTo(s[0], s[1]);
      ctx.lineTo(s[2], s[3]);
      ctx.stroke();
    });
    // Soft highlight on top of each wall
    ctx.strokeStyle = C.wood;
    ctx.lineWidth = CONFIG.wallThickness * 0.35;
    segs.forEach(function (s) {
      ctx.beginPath();
      ctx.moveTo(s[0], s[1]);
      ctx.lineTo(s[2], s[3]);
      ctx.stroke();
    });
    ctx.restore();

    // Windows on the outside walls
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "#BFE0EA";
    ctx.lineWidth = CONFIG.wallThickness * 0.5;
    [[200, 40, 330, 40], [520, 40, 660, 40], [960, 430, 960, 580]].forEach(function (s) {
      ctx.beginPath();
      ctx.moveTo(s[0], s[1]);
      ctx.lineTo(s[2], s[3]);
      ctx.stroke();
    });
    ctx.restore();

    // Welcome mat at the front door
    fillRound(ctx, 108, 690, 74, 22, 8, C.terracotta);
  }

  // ---------- Poster on the Sala wall ----------

  // Between the two doorways of the Sala, in two lines.
  function drawPoster(ctx) {
    var x = 335, y = 352, w = 120, h = 60;
    withShadow(ctx, function () {
      fillRound(ctx, x, y, w, h, 6, C.wood);
    });
    fillRound(ctx, x + 5, y + 5, w - 10, h - 10, 4, C.cream);
    ctx.save();
    ctx.font = "700 15px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = C.terracotta;
    ctx.fillText("That's what", x + w / 2, y + h / 2 - 9);
    ctx.fillText("she said!", x + w / 2, y + h / 2 + 10);
    ctx.restore();
  }

  // ---------- Decorations ----------

  // The painting easel in the bottom right corner of the Sala, and the spot it takes on the floor (characters go around it).
  var EASEL = { x: 878, y: 568, w: 56, h: 92 };
  var EASEL_FEET = { x: 882, y: 622, w: 48, h: 38 };
  // The vase stands on the right end of the TV stand, like the plant on the left end; the bunting hangs on the Cocina wall.
  var VASE = { x: 821, y: 358, w: 28, h: 44 };
  var BUNTING = { x: 48, y: 38, w: 364, h: 32 };
  var KROHNA = { fur: "#E8913A", stripe: "#B9621F", belly: "#F6C48A" };

  function strokePath(ctx, color, width, points) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    points.forEach(function (p, i) {
      if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    });
    ctx.stroke();
  }

  // A wooden easel with a canvas where Sofía painted Krohna sleeping: an orange striped kitten curled up, with a little "z".
  function drawEasel(ctx) {
    var cx = EASEL.x + EASEL.w / 2, feet = EASEL.y + EASEL.h - 2;
    ctx.save();
    ctx.fillStyle = "rgba(74, 52, 40, 0.22)";
    ctx.beginPath();
    ctx.ellipse(cx, feet, 30, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Back leg, then the two front legs and the ledge the canvas sits on
    strokePath(ctx, "#8A5C38", 4, [[cx, EASEL.y + 6], [cx + 4, feet - 8]]);
    strokePath(ctx, C.wood, 5, [[cx - 3, EASEL.y + 2], [cx - 24, feet]]);
    strokePath(ctx, C.wood, 5, [[cx + 3, EASEL.y + 2], [cx + 24, feet]]);
    fillRound(ctx, EASEL.x + 1, EASEL.y + 48, EASEL.w - 2, 6, 3, "#8A5C38");

    // The canvas, with a cream frame
    var px = EASEL.x + 3, py = EASEL.y + 6, pw = EASEL.w - 6, ph = 42;
    withShadow(ctx, function () {
      fillRound(ctx, px, py, pw, ph, 3, C.white);
    });
    fillRound(ctx, px + 3, py + 3, pw - 6, ph - 6, 2, "#DCE7D6");
    // A sage cushion under the kitten
    ctx.fillStyle = C.sage;
    ctx.beginPath();
    ctx.ellipse(cx, py + ph - 10, 19, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Krohna curled up: the tail around the body, the round body with stripes, and the head with closed eyes
    var kx = cx + 2, ky = py + ph - 15;
    strokePath(ctx, KROHNA.fur, 3.5, [[kx + 12, ky + 3], [kx + 8, ky + 8], [kx - 4, ky + 8], [kx - 12, ky + 5]]);
    ctx.fillStyle = KROHNA.fur;
    ctx.beginPath();
    ctx.ellipse(kx, ky, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    [-5, 0, 5].forEach(function (dx) {
      strokePath(ctx, KROHNA.stripe, 1.6, [[kx + dx, ky - 7], [kx + dx + 1.5, ky - 2]]);
    });
    var hx = kx - 12, hy = ky + 1;
    ctx.fillStyle = KROHNA.fur;
    [-1, 1].forEach(function (side) {
      ctx.beginPath();
      ctx.moveTo(hx + side * 5.5, hy - 2);
      ctx.lineTo(hx + side * 4.5, hy - 9);
      ctx.lineTo(hx + side * 0.5, hy - 5);
      ctx.closePath();
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(hx, hy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = KROHNA.belly;
    ctx.beginPath();
    ctx.ellipse(hx, hy + 2.5, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    strokePath(ctx, C.darkBrown, 1, [[hx - 3.5, hy - 0.5], [hx - 1.5, hy + 0.5]]);
    strokePath(ctx, C.darkBrown, 1, [[hx + 1.5, hy + 0.5], [hx + 3.5, hy - 0.5]]);
    // The little "z"
    ctx.font = "700 10px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = C.darkBrown;
    ctx.fillText("z", hx + 6, py + 11);
    ctx.font = "700 7px " + CONFIG.fontFamily;
    ctx.fillText("z", hx + 12, py + 8);
    ctx.restore();
  }

  // A light blue vase with colorful flowers from the garden.
  function drawVase(ctx) {
    var cx = VASE.x + VASE.w / 2, base = VASE.y + VASE.h - 2;
    ctx.save();
    // Stems
    [[-8, 16], [-3, 10], [3, 12], [8, 17], [0, 20]].forEach(function (f) {
      strokePath(ctx, C.sage, 1.6, [[cx + f[0] * 0.3, base - 18], [cx + f[0], base - 18 - f[1]]]);
    });
    // Flowers: terracotta tulip, white lily, a rainbow one in pink and yellow, and a blue moon flower
    [[-8, 16, C.terracotta], [-3, 10, C.white], [3, 12, "#E795AE"], [8, 17, "#9FC3E8"], [0, 20, "#F2C230"]].forEach(function (f) {
      var fx = cx + f[0], fy = base - 18 - f[1];
      for (var i = 0; i < 5; i++) {
        var a = i * Math.PI * 2 / 5;
        ctx.fillStyle = f[2];
        ctx.beginPath();
        ctx.arc(fx + Math.cos(a) * 2.6, fy + Math.sin(a) * 2.6, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#E2B44B";
      ctx.beginPath();
      ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    // The vase: round belly, narrow neck, with a shine
    withShadow(ctx, function () {
      ctx.fillStyle = "#7DB9D6";
      ctx.beginPath();
      ctx.moveTo(cx - 4, base - 20);
      ctx.lineTo(cx + 4, base - 20);
      ctx.quadraticCurveTo(cx + 4, base - 15, cx + 9, base - 10);
      ctx.quadraticCurveTo(cx + 11, base, cx + 5, base);
      ctx.lineTo(cx - 5, base);
      ctx.quadraticCurveTo(cx - 11, base, cx - 9, base - 10);
      ctx.quadraticCurveTo(cx - 4, base - 15, cx - 4, base - 20);
      ctx.closePath();
      ctx.fill();
    });
    fillRound(ctx, cx - 5, base - 22, 10, 3, 1.5, "#5E9DBB");
    strokePath(ctx, "rgba(255, 253, 248, 0.7)", 1.6, [[cx - 6, base - 10], [cx - 5, base - 4]]);
    ctx.restore();
  }

  // Colored bunting along the top wall of the Cocina: two swags of little flags.
  function drawBunting(ctx) {
    var colors = [C.terracotta, "#F2C230", C.sage, "#E795AE", "#7DB9D6", C.cream];
    var swags = [[52, 230], [230, 408]];
    var top = BUNTING.y + 6, sag = 9;
    ctx.save();
    var n = 0;
    swags.forEach(function (sw) {
      var w = sw[1] - sw[0];
      var at = function (x) {
        var t = (x - sw[0]) / w;
        return top + sag * 4 * t * (1 - t);
      };
      ctx.strokeStyle = C.darkBrown;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var x = sw[0]; x <= sw[1]; x += 4) {
        if (x === sw[0]) ctx.moveTo(x, at(x)); else ctx.lineTo(x, at(x));
      }
      ctx.stroke();
      for (var fx = sw[0] + 12; fx < sw[1] - 8; fx += 22) {
        var y1 = at(fx - 6), y2 = at(fx + 6);
        ctx.fillStyle = colors[n++ % colors.length];
        ctx.beginPath();
        ctx.moveTo(fx - 6, y1);
        ctx.lineTo(fx + 6, y2);
        ctx.lineTo(fx, (y1 + y2) / 2 + 13);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = C.wood;
      ctx.beginPath();
      ctx.arc(sw[0], top, 3, 0, Math.PI * 2);
      ctx.arc(sw[1], top, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // ---------- Furniture ----------

  function drawFridge(ctx, f) {
    withShadow(ctx, function () {
      fillRound(ctx, f.x, f.y, f.w, f.h, 14, C.white);
    });
    fillRound(ctx, f.x + 6, f.y + 6, f.w - 12, 14, 7, "#E3EEF0");
    ctx.strokeStyle = "rgba(74, 52, 40, 0.3)";
    ctx.lineWidth = 2;
    roundRect(ctx, f.x, f.y, f.w, f.h, 14);
    ctx.stroke();
    // Handle
    fillRound(ctx, f.x + f.w - 18, f.y + 30, 7, 34, 4, "#9AA6A8");
    // Little heart magnet
    var hx = f.x + 30, hy = f.y + 46;
    ctx.fillStyle = C.terracotta;
    ctx.beginPath();
    ctx.moveTo(hx, hy + 8);
    ctx.bezierCurveTo(hx - 14, hy - 2, hx - 6, hy - 12, hx, hy - 4);
    ctx.bezierCurveTo(hx + 6, hy - 12, hx + 14, hy - 2, hx, hy + 8);
    ctx.fill();
  }

  // The Estufa seen from above: white top, four dark burners and knobs along the front.
  function drawStove(ctx, f) {
    withShadow(ctx, function () {
      fillRound(ctx, f.x, f.y, f.w, f.h, 10, C.white);
    });
    ctx.strokeStyle = "rgba(74, 52, 40, 0.3)";
    ctx.lineWidth = 2;
    roundRect(ctx, f.x, f.y, f.w, f.h, 10);
    ctx.stroke();
    [[0.28, 0.32], [0.72, 0.32], [0.28, 0.68], [0.72, 0.68]].forEach(function (p, i) {
      var cx = f.x + f.w * p[0], cy = f.y + (f.h - 12) * p[1];
      ctx.fillStyle = C.darkBrown;
      ctx.beginPath();
      ctx.arc(cx, cy, i < 2 ? 13 : 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = C.wood;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, i < 2 ? 8 : 6, 0, Math.PI * 2);
      ctx.stroke();
    });
    // Knobs
    fillRound(ctx, f.x + 6, f.y + f.h - 14, f.w - 12, 9, 4, "#E3EEF0");
    [0.2, 0.4, 0.6, 0.8].forEach(function (k) {
      ctx.fillStyle = C.terracotta;
      ctx.beginPath();
      ctx.arc(f.x + f.w * k, f.y + f.h - 9.5, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawBed(ctx, f) {
    withShadow(ctx, function () {
      fillRound(ctx, f.x, f.y, f.w, f.h, 18, C.wood);
    });
    // Mattress
    fillRound(ctx, f.x + 10, f.y + 22, f.w - 20, f.h - 32, 14, C.cream);
    // Pillows
    var pw = (f.w - 46) / 2;
    fillRound(ctx, f.x + 18, f.y + 32, pw, 38, 14, C.white);
    fillRound(ctx, f.x + 28 + pw, f.y + 32, pw, 38, 14, C.white);
    // Blanket
    fillRound(ctx, f.x + 10, f.y + 88, f.w - 20, f.h - 98, 14, C.terracotta);
    fillRound(ctx, f.x + 10, f.y + 88, f.w - 20, 18, 9, "#D98168");
    // Hearts pattern on the blanket
    ctx.fillStyle = "rgba(245, 235, 221, 0.6)";
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 2; j++) {
        ctx.beginPath();
        ctx.arc(f.x + 50 + i * 45, f.y + 140 + j * 40, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawTv(ctx, f) {
    // Wooden stand
    withShadow(ctx, function () {
      fillRound(ctx, f.x - 30, f.y - 6, f.w + 60, f.h + 22, 12, C.wood);
    });
    // Screen seen from above
    fillRound(ctx, f.x, f.y + 4, f.w, 16, 6, C.darkBrown);
    fillRound(ctx, f.x + 8, f.y + 18, f.w - 16, 4, 2, "#7FB7C9");
    // Plant pot on the stand
    ctx.fillStyle = C.terracotta;
    ctx.beginPath();
    ctx.arc(f.x - 14, f.y + 13, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.sage;
    ctx.beginPath();
    ctx.arc(f.x - 14, f.y + 13, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSofa(ctx, f) {
    withShadow(ctx, function () {
      fillRound(ctx, f.x, f.y, f.w, f.h, 22, C.terracotta);
    });
    // Backrest (sofa faces up, toward the TV)
    drawBackrest(ctx, f);
    // Armrests
    fillRound(ctx, f.x + 6, f.y + 6, 30, f.h - 12, 14, "#B85A41");
    fillRound(ctx, f.x + f.w - 36, f.y + 6, 30, f.h - 12, 14, "#B85A41");
    // Seat cushions
    var cw = (f.w - 84) / 3;
    for (var i = 0; i < 3; i++) {
      fillRound(ctx, f.x + 40 + i * (cw + 2), f.y + 10, cw, f.h - 44, 12, "#D98168");
    }
    // Cushion pillow
    fillRound(ctx, f.x + 48, f.y + 30, 34, 28, 10, C.sage);
  }

  function drawBackrest(ctx, f) {
    fillRound(ctx, f.x + 6, f.y + f.h - 30, f.w - 12, 24, 12, "#A9533C");
  }

  // The backrest again, over someone sitting on the Sofá, so they look sunk into it.
  // Characters are drawn after the night tint, so here the backrest gets the tint again by itself.
  function drawSofaBackrest(ctx) {
    var f = piece("sofa");
    drawBackrest(ctx, f);
    var dark = Time.darkness();
    if (dark <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = dark;
    roundRect(ctx, f.x + 6, f.y + f.h - 30, f.w - 12, 24, 12);
    ctx.fillStyle = CONFIG.night.tint;
    ctx.fill();
    ctx.restore();
  }

  function piece(id) {
    return CONFIG.furniture.filter(function (f) { return f.id === id; })[0];
  }

  var drawers = { fridge: drawFridge, stove: drawStove, bed: drawBed, tv: drawTv, sofa: drawSofa };

  // Area a piece of furniture covers on the floor, including the TV stand.
  function bounds(f) {
    if (f.id === "tv") return { x: f.x - 30, y: f.y - 6, w: f.w + 60, h: f.h + 22 };
    return { x: f.x, y: f.y, w: f.w, h: f.h };
  }

  // Soft glow around the piece under the mouse.
  function drawHighlight(ctx, f) {
    var b = bounds(f);
    ctx.save();
    ctx.shadowColor = C.cream;
    ctx.shadowBlur = 18;
    roundRect(ctx, b.x - 6, b.y - 6, b.w + 12, b.h + 12, 20);
    ctx.fillStyle = "rgba(245, 235, 221, 0.3)";
    ctx.fill();
    ctx.strokeStyle = C.sage;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  }

  // Where each furniture name tag goes, relative to the piece.
  function labelPosition(f) {
    if (f.id === "tv") return { x: f.x + f.w / 2, y: f.y + f.h + 42 };
    if (f.id === "bed") return { x: f.x + f.w / 2, y: f.y + f.h - 20 };
    if (f.id === "sofa") return { x: f.x + f.w / 2, y: f.y - 22 };
    return { x: f.x + f.w / 2, y: f.y + f.h + 24 };
  }

  // ---------- Main draw ----------

  function draw(ctx, highlightId) {
    var W = CONFIG.world.width, H = CONFIG.world.height;

    // Garden around the house
    fillRound(ctx, 0, 0, W, H, 40, C.grass);

    CONFIG.rooms.forEach(function (room) { drawFloor(ctx, room); });

    // Living room rug, between the Televisión and the Sofá
    fillRound(ctx, 560, 455, 320, 92, 46, C.sage);
    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 8]);
    roundRect(ctx, 570, 465, 300, 72, 36);
    ctx.stroke();
    ctx.setLineDash([]);

    drawWalls(ctx);
    drawPoster(ctx);
    if (Goals.isMet("sofia", 1)) drawBunting(ctx);

    CONFIG.furniture.forEach(function (f) {
      drawers[f.id](ctx, f);
      if (f.id === highlightId) drawHighlight(ctx, f);
    });
    if (Goals.isMet("sofia", 0)) drawVase(ctx);
    drawEasel(ctx);
  }

  // Room and furniture names, drawn over the night tint so they always read well.
  function drawLabels(ctx) {
    // Room names
    var roomLabels = {
      kitchen: { x: 250, y: 260 },
      bedroom: { x: 570, y: 250 },
      living: { x: 190, y: 600 }
    };
    CONFIG.rooms.forEach(function (room) {
      var p = roomLabels[room.id];
      label(ctx, room.name, p.x, p.y, 30, C.darkBrown, C.cream);
    });

    // Furniture names
    CONFIG.furniture.forEach(function (f) {
      var p = labelPosition(f);
      label(ctx, f.name, p.x, p.y, 18, C.cream, C.darkBrown);
    });
  }

  // Drawn over the darkened house: a soft light from the TV screen while someone is watching it.
  // "dark" goes from 0 (day) to 1 (night).
  function drawNightLights(ctx, time, dark) {
    if (!Objects.isWatchingTv()) return;
    var tv = piece("tv");
    var cx = tv.x + tv.w / 2, cy = tv.y + 20;
    // The light flickers a tiny bit, like a show is on.
    var flicker = 0.9 + Math.sin(time * 4.1) * 0.05 + Math.sin(time * 9.7) * 0.05;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(cx, cy);
    ctx.scale(1.6, 1);
    var g = ctx.createRadialGradient(0, 0, 0, 0, 0, 130);
    g.addColorStop(0, "rgba(181, 220, 236, " + 0.4 * dark * flicker + ")");
    g.addColorStop(1, "rgba(181, 220, 236, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 130, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = dark;
    fillRound(ctx, tv.x + 8, tv.y + 18, tv.w - 16, 4, 2, C.waterLight);
    ctx.restore();
  }

  // The front door: the welcome mat and the doorway above it. Tapping it takes a character outside.
  function doorAt(x, y) {
    var d = CONFIG.frontDoor.tap;
    return x >= d.x && x <= d.x + d.w && y >= d.y && y <= d.y + d.h;
  }

  // The id of the word for what is at a spot: a decoration, a piece of furniture, the front door or a room, or null.
  function wordAt(x, y) {
    if (inBox(x, y, EASEL)) return "easel";
    if (Goals.isMet("sofia", 0) && inBox(x, y, VASE)) return "vase";
    if (Goals.isMet("sofia", 1) && inBox(x, y, BUNTING)) return "bunting";
    for (var i = CONFIG.furniture.length - 1; i >= 0; i--) {
      var b = bounds(CONFIG.furniture[i]);
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return CONFIG.furniture[i].id;
    }
    if (doorAt(x, y)) return "door";
    for (var j = 0; j < CONFIG.rooms.length; j++) {
      var r = CONFIG.rooms[j];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r.id;
    }
    return null;
  }

  // ---------- Where characters can walk ----------

  // How close a character's feet may get to furniture: on the sides, above it and below it.
  var CLEAR = { side: 22, top: 12, bottom: 14 };

  function inBox(x, y, b) {
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  }

  // The way through a doorway, from one room to the other, a little narrower than the gap in the wall.
  function doorPassage(d) {
    var m = CONFIG.walkMargin;
    var half = CONFIG.doorWidth / 2 - 14;
    var rooms = CONFIG.rooms.filter(function (r) { return d.rooms.indexOf(r.id) >= 0; });
    // Rooms side by side: the doorway is on a wall going up and down.
    if (rooms[0].y === rooms[1].y) return { x: d.x - m.side - 2, y: d.y - half, w: (m.side + 2) * 2, h: half * 2 };
    return { x: d.x - half, y: d.y - m.bottom - 2, w: half * 2, h: m.bottom + m.top + 4 };
  }

  // True if a character cannot stand here: outside the rooms (walls are only crossed at the doorways),
  // on a piece of furniture or on the easel. Used by js/path.js.
  function isSolid(x, y) {
    var m = CONFIG.walkMargin;
    var inRoom = CONFIG.rooms.some(function (r) {
      return inBox(x, y, { x: r.x + m.side, y: r.y + m.top, w: r.w - m.side * 2, h: r.h - m.top - m.bottom });
    }) || CONFIG.doorways.some(function (d) { return inBox(x, y, doorPassage(d)); });
    if (!inRoom) return true;
    if (inBox(x, y, { x: EASEL_FEET.x - CLEAR.side, y: EASEL_FEET.y - CLEAR.top, w: EASEL_FEET.w + CLEAR.side * 2,
      h: EASEL_FEET.h + CLEAR.top + CLEAR.bottom })) return true;
    return CONFIG.furniture.some(function (f) {
      var b = bounds(f);
      return inBox(x, y, { x: b.x - CLEAR.side, y: b.y - CLEAR.top, w: b.w + CLEAR.side * 2, h: b.h + CLEAR.top + CLEAR.bottom });
    });
  }

  return {
    draw: draw,
    drawLabels: drawLabels,
    drawNightLights: drawNightLights,
    drawSofaBackrest: drawSofaBackrest,
    bounds: bounds,
    doorAt: doorAt,
    wordAt: wordAt,
    isSolid: isSolid
  };
})();
