// Draws the house seen from above: floors, walls, room names and furniture.
// At night the Televisión gives a soft glow.
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

  function drawPoster(ctx) {
    var x = 710, y = 352, w = 210, h = 46;
    withShadow(ctx, function () {
      fillRound(ctx, x, y, w, h, 6, C.wood);
    });
    fillRound(ctx, x + 5, y + 5, w - 10, h - 10, 4, C.cream);
    ctx.save();
    ctx.font = "700 16px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = C.terracotta;
    ctx.fillText("That's what she said!", x + w / 2, y + h / 2 + 1);
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
    fillRound(ctx, f.x + 6, f.y + f.h - 30, f.w - 12, 24, 12, "#A9533C");
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

  var drawers = { fridge: drawFridge, bed: drawBed, tv: drawTv, sofa: drawSofa };

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

    // Living room rug
    fillRound(ctx, 360, 455, 320, 92, 46, C.sage);
    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 8]);
    roundRect(ctx, 370, 465, 300, 72, 36);
    ctx.stroke();
    ctx.setLineDash([]);

    drawWalls(ctx);
    drawPoster(ctx);

    CONFIG.furniture.forEach(function (f) {
      drawers[f.id](ctx, f);
      if (f.id === highlightId) drawHighlight(ctx, f);
    });

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

  // Drawn over the darkened house: a soft light from the TV screen. "dark" goes from 0 (day) to 1 (night).
  function drawNightLights(ctx, time, dark) {
    var tv = CONFIG.furniture.filter(function (f) { return f.id === "tv"; })[0];
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

  // The id of the word for what is at a spot: a piece of furniture, the front door or a room, or null.
  function wordAt(x, y) {
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

  return { draw: draw, drawNightLights: drawNightLights, bounds: bounds, doorAt: doorAt, wordAt: wordAt };
})();
