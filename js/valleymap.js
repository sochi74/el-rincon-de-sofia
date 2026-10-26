// The edge of the valley and the 🗺️ Mapa del valle.
// At the top of the city a little dirt trail goes up to the edge, with a wooden sign "Pradera de flores ⬆️": walking up it
// takes a character to the Pradera de flores (js/meadow.js), like the magic door (js/sims.js does the going).
// On the right edge, between Krohna's bed and Vladi's castle, a little sand trail with the sign "Lago ➡️" goes to the Lago
// (js/lake.js) the same way.
// On the left edge, between the forest and Sofía's house, a little dirt trail with fallen leaves and the sign
// "⬅️ Bosque encantado" goes to the Bosque encantado (js/enchanted.js) the same way.
// On the bottom edge a small wooden sign says "Próximamente": a small obstacle that never moves.
// The trails and their signs never move either, and Modo decorar never covers them (js/city.js asks here).
// The "🗺️ Mapa" button of the panel opens the Mapa del valle, an old parchment that fills up with the zones found:
// the Ciudad in the middle, the Pradera at the top, the Lago at the right, the Bosque encantado at the left, and
// "❓ Por descubrir" at the bottom,
// with 💗 and 🧢 where Sofía and real.fixer are. The first time one of them goes into a zone, it shows on the map with
// "🗺️ ¡Zona descubierta! …". The zones found are saved with the game.
var ValleyMap = (function () {
  var C = CONFIG.colors;
  var V = CONFIG.valley;
  var M = CONFIG.meadow;

  // The zones around the city that can be found (the city is always known).
  var ZONES = [{ id: "meadow", name: "Pradera de flores", emoji: "🌸" }, { id: "lake", name: "Lago", emoji: "🏖️" },
    { id: "enchanted", name: "Bosque encantado", emoji: "🍄" }];
  var found = {};

  // The trail under the mouse: "meadow", "lake", "enchanted" or null.
  var hover = null;

  function inBox(x, y, b) {
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  }

  function grow(b, by) {
    return { x: b.x - by, y: b.y - by, w: b.w + by * 2, h: b.h + by * 2 };
  }

  // ---------- In the city ----------

  var SIGN_TEXT = "Pradera de flores ⬆️", SIGN_SIZE = 15;
  var LAKE_TEXT = "Lago ➡️";
  var FOREST_TEXT = "⬅️ Bosque encantado", FOREST_SIZE = 13;
  var SOON_TEXT = "Próximamente", SOON_SIZE = 10;
  var SOON = { w: 72, h: 24, post: 16 };

  function trailBox() {
    return { x: V.trail.x - V.trail.half - 10, y: 0, w: V.trail.half * 2 + 20, h: V.trail.bottom + 8 };
  }

  // The wooden sign of the trail, as its board (it is measured the first time it is drawn).
  var signBoard = null;

  function signBox() {
    return signBoard || { x: V.sign.x - 100, y: V.sign.y - 14, w: 200, h: 28 };
  }

  // The sand trail to the Lago, from where it starts to the right edge, and its sign (measured like the other one).
  function lakeTrailBox() {
    var t = V.lakeTrail;
    return { x: t.left - 8, y: t.y - t.half - 10, w: CONFIG.world.width - t.left + 8, h: t.half * 2 + 20 };
  }

  var lakeBoard = null;

  function lakeSignBox() {
    return lakeBoard || { x: V.lakeSign.x - 48, y: V.lakeSign.y - 14, w: 96, h: 28 };
  }

  // The leafy dirt trail to the Bosque encantado, from the left edge to where it ends, and its sign (measured like the others).
  function forestTrailBox() {
    var t = V.forestTrail;
    return { x: 0, y: t.y - t.half - 10, w: t.right + 8, h: t.half * 2 + 20 };
  }

  var forestBoard = null;

  function forestSignBox() {
    return forestBoard || { x: V.forestSign.x - 78, y: V.forestSign.y - 12, w: 156, h: 24 };
  }

  // The board of each "Próximamente" sign, and its board with its post.
  function soonBox(s) {
    return { x: s.x - SOON.w / 2, y: s.y - SOON.h / 2, w: SOON.w, h: SOON.h };
  }

  function soonWhole(s) {
    return { x: s.x - SOON.w / 2, y: s.y - SOON.h / 2, w: SOON.w, h: SOON.h + SOON.post };
  }

  // "meadow" if the spot is on the trail to the Pradera or its sign, "lake" if it is on the trail to the Lago or its sign,
  // "enchanted" if it is on the trail to the Bosque encantado or its sign, else null (a tap there walks to that zone).
  function trailAt(x, y) {
    if (inBox(x, y, trailBox()) || inBox(x, y, grow(signBox(), 4))) return "meadow";
    if (inBox(x, y, lakeTrailBox()) || inBox(x, y, grow(lakeSignBox(), 4))) return "lake";
    if (inBox(x, y, forestTrailBox()) || inBox(x, y, grow(forestSignBox(), 4))) return "enchanted";
    return null;
  }

  function setHover(which) {
    hover = which || null;
  }

  // The "Próximamente" sign is solid (js/city.js).
  function isSolid(x, y) {
    return V.soon.some(function (s) { return inBox(x, y, grow(soonWhole(s), 4)); });
  }

  // True if the spot is "by" or closer to a trail, its sign or the "Próximamente" sign
  // (the shiny coins, the forest things and the decorations stay off them).
  function isNear(x, y, by) {
    if (inBox(x, y, grow(trailBox(), by)) || inBox(x, y, grow(signBox(), by))) return true;
    if (inBox(x, y, grow(lakeTrailBox(), by)) || inBox(x, y, grow(lakeSignBox(), by))) return true;
    if (inBox(x, y, grow(forestTrailBox(), by)) || inBox(x, y, grow(forestSignBox(), by))) return true;
    return V.soon.some(function (s) { return inBox(x, y, grow(soonWhole(s), by)); });
  }

  // What Modo decorar may not put things on (js/city.js): the trails, their signs and the "Próximamente" sign.
  function boxes() {
    return [{ box: trailBox(), sign: false }, { box: signBox(), sign: true },
      { box: lakeTrailBox(), sign: false }, { box: lakeSignBox(), sign: true },
      { box: forestTrailBox(), sign: false }, { box: forestSignBox(), sign: true }].concat(V.soon.map(function (s) {
      return { box: soonWhole(s), sign: false };
    }));
  }

  // The word at a spot of the city: "Pradera · meadow", "Lago · lake" or "Bosque encantado · enchanted forest" on a trail
  // and its sign, "Próximamente · coming soon" on the other one.
  function wordAt(x, y) {
    var trail = trailAt(x, y);
    if (trail) return trail;
    if (V.soon.some(function (s) { return inBox(x, y, soonWhole(s)); })) return "comingSoon";
    return null;
  }

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

  // The dirt trail, from the top edge down into the grass, with a few pebbles; it glows under the mouse.
  // Drawn on the ground of the city (js/city.js), under everything that stands.
  function drawTrail(ctx) {
    var t = V.trail;
    drawLakeTrail(ctx);
    drawForestTrail(ctx);
    ctx.save();
    if (hover === "meadow") {
      ctx.save();
      ctx.shadowColor = C.cream;
      ctx.shadowBlur = 18;
      var b = trailBox();
      roundRect(ctx, b.x, b.y - 20, b.w, b.h + 20, 20);
      ctx.fillStyle = "rgba(245, 235, 221, 0.25)";
      ctx.fill();
      ctx.strokeStyle = C.sage;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = M.dirt;
    ctx.beginPath();
    ctx.moveTo(t.x - t.half - 4, -4);
    for (var y = 0; y <= t.bottom - 14; y += 20) ctx.lineTo(t.x - t.half + Math.sin(y * 0.07) * 3, y);
    ctx.quadraticCurveTo(t.x, t.bottom + 10, t.x + t.half, t.bottom - 14);
    for (var y2 = t.bottom - 14; y2 >= 0; y2 -= 20) ctx.lineTo(t.x + t.half + Math.sin(y2 * 0.05 + 1) * 3, y2);
    ctx.lineTo(t.x + t.half + 4, -4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = M.dirtLight;
    ctx.beginPath();
    ctx.ellipse(t.x - 3, t.bottom / 2 - 6, t.half * 0.45, t.bottom / 2 - 16, 0, 0, Math.PI * 2);
    ctx.fill();
    [[-8, 22], [7, 58], [-4, 96], [9, 130], [-9, 152]].forEach(function (p) {
      ctx.fillStyle = "#A98760";
      ctx.beginPath();
      ctx.ellipse(t.x + p[0], p[1], 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // The sand trail to the Lago, from inside the grass to the right edge, with a few little shells; it glows under the mouse.
  function drawLakeTrail(ctx) {
    var t = V.lakeTrail, W = CONFIG.world.width, L = CONFIG.lake;
    ctx.save();
    if (hover === "lake") {
      ctx.save();
      ctx.shadowColor = C.cream;
      ctx.shadowBlur = 18;
      var b = lakeTrailBox();
      roundRect(ctx, b.x, b.y, b.w + 20, b.h, 20);
      ctx.fillStyle = "rgba(245, 235, 221, 0.25)";
      ctx.fill();
      ctx.strokeStyle = C.sage;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = L.sand;
    ctx.beginPath();
    ctx.moveTo(W + 4, t.y - t.half - 4);
    for (var x = W; x >= t.left + 14; x -= 20) ctx.lineTo(x, t.y - t.half + Math.sin(x * 0.07) * 3);
    ctx.quadraticCurveTo(t.left - 10, t.y, t.left + 14, t.y + t.half);
    for (var x2 = t.left + 14; x2 <= W; x2 += 20) ctx.lineTo(x2, t.y + t.half + Math.sin(x2 * 0.05 + 1) * 3);
    ctx.lineTo(W + 4, t.y + t.half + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = L.sandLight;
    ctx.beginPath();
    ctx.ellipse((t.left + W) / 2 + 6, t.y - 2, (W - t.left) / 2 - 16, t.half * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    [[934, -6, "#F2C9C0"], [958, 7, "#FFFDF8"], [982, -4, "#F2C9C0"]].forEach(function (p) {
      ctx.fillStyle = p[2];
      ctx.beginPath();
      ctx.ellipse(p[0], t.y + p[1], 3, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // The dirt trail to the Bosque encantado, from the left edge into the grass, with a few fallen leaves; it glows under
  // the mouse.
  function drawForestTrail(ctx) {
    var t = V.forestTrail;
    ctx.save();
    if (hover === "enchanted") {
      ctx.save();
      ctx.shadowColor = C.cream;
      ctx.shadowBlur = 18;
      var b = forestTrailBox();
      roundRect(ctx, b.x - 20, b.y, b.w + 20, b.h, 20);
      ctx.fillStyle = "rgba(245, 235, 221, 0.25)";
      ctx.fill();
      ctx.strokeStyle = C.sage;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = M.dirt;
    ctx.beginPath();
    ctx.moveTo(-4, t.y - t.half - 4);
    for (var x = 0; x <= t.right - 14; x += 20) ctx.lineTo(x, t.y - t.half + Math.sin(x * 0.07) * 3);
    ctx.quadraticCurveTo(t.right + 10, t.y, t.right - 14, t.y + t.half);
    for (var x2 = t.right - 14; x2 >= 0; x2 -= 20) ctx.lineTo(x2, t.y + t.half + Math.sin(x2 * 0.05 + 1) * 3);
    ctx.lineTo(-4, t.y + t.half + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = M.dirtLight;
    ctx.beginPath();
    ctx.ellipse(t.right / 2 - 4, t.y - 2, t.right / 2 - 14, t.half * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fallen leaves, green and golden.
    [[14, -7, 0.6, "#7FA35C"], [36, 6, -0.8, "#D9A441"], [58, -4, 1.9, "#8FA88A"], [24, 9, 2.6, "#C8664A"]].forEach(function (l) {
      ctx.save();
      ctx.translate(l[0], t.y + l[1]);
      ctx.rotate(l[2]);
      ctx.fillStyle = l[3];
      ctx.beginPath();
      ctx.ellipse(0, 0, 4.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  // A wooden sign: a board on a post, with its text in cream.
  function woodSign(ctx, text, cx, cy, size, post) {
    ctx.save();
    ctx.font = "700 " + size + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var w = Math.max(ctx.measureText(text).width + size * 1.4, 0), h = size * 1.75;
    ctx.fillStyle = "#7A4E32";
    ctx.fillRect(cx - 3, cy, 6, h / 2 + post);
    ctx.shadowColor = "rgba(74, 52, 40, 0.3)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    roundRect(ctx, cx - w / 2, cy - h / 2, w, h, 5);
    ctx.fillStyle = C.wood;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "rgba(74, 52, 40, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2 + 4, cy - h / 6);
    ctx.lineTo(cx + w / 2 - 4, cy - h / 6);
    ctx.stroke();
    ctx.fillStyle = C.cream;
    ctx.fillText(text, cx, cy + 1);
    ctx.restore();
    return { x: cx - w / 2, y: cy - h / 2, w: w, h: h };
  }

  // The signs, drawn over the night tint with the other signs of the city, so they always read well.
  function drawLabels(ctx) {
    signBoard = woodSign(ctx, SIGN_TEXT, V.sign.x, V.sign.y, SIGN_SIZE, 16);
    lakeBoard = woodSign(ctx, LAKE_TEXT, V.lakeSign.x, V.lakeSign.y, SIGN_SIZE, 14);
    forestBoard = woodSign(ctx, FOREST_TEXT, V.forestSign.x, V.forestSign.y, FOREST_SIZE, 2);
    V.soon.forEach(function (s) {
      woodSign(ctx, SOON_TEXT, s.x, s.y, SOON_SIZE, SOON.post);
    });
  }

  // ---------- Zones found ----------

  var discoverSign = null, discoverLeft = 0;

  function isFound(id) {
    return !!found[id];
  }

  // Someone just went into a zone: the first time, it shows on the map with "🗺️ ¡Zona descubierta! …" and a soft sound.
  function visit(id) {
    var zone = ZONES.filter(function (z) { return z.id === id; })[0];
    if (!zone || found[id]) return;
    found[id] = true;
    shownKey = null;
    discoverSign.textContent = "🗺️ ¡Zona descubierta! " + zone.name;
    discoverSign.hidden = false;
    discoverLeft = V.discoverTime;
    UI.placeSign(discoverSign);
    Sound.play("discover");
  }

  // ---------- The Mapa del valle ----------

  var button, panel, canvas, shownKey = null;
  // The size of the map drawing, in its own units (the canvas is twice as big, so it looks sharp).
  var MW = 320, MH = 250;

  function init() {
    // The "🗺️ Mapa" button, after "📖 Diario" in the panel, with "Mapa · map" next to the mouse.
    button = document.createElement("button");
    button.type = "button";
    button.id = "map-button";
    button.textContent = "🗺️ Mapa";
    var diaryButton = document.getElementById("diary-button");
    diaryButton.parentNode.insertBefore(button, diaryButton.nextSibling);
    button.addEventListener("click", function () { setOpen(panel.hidden); });
    UI.bindWord(button, "map");
    // The backpack, the goals window and the Diario take turns with the map.
    ["backpack-button", "goals-button", "diary-button"].forEach(function (id) {
      document.getElementById(id).addEventListener("click", function () { setOpen(false); });
    });

    panel = document.createElement("div");
    panel.id = "valley-map";
    panel.hidden = true;
    var top = document.createElement("div");
    top.className = "backpack-top";
    var title = document.createElement("b");
    title.textContent = "🗺️ Mapa del valle";
    var close = document.createElement("button");
    close.type = "button";
    close.id = "map-close";
    close.setAttribute("aria-label", "Cerrar el mapa");
    close.textContent = "✕";
    close.addEventListener("click", function () { setOpen(false); });
    top.appendChild(title);
    top.appendChild(close);
    canvas = document.createElement("canvas");
    canvas.id = "map-canvas";
    canvas.width = MW * 2;
    canvas.height = MH * 2;
    panel.appendChild(top);
    panel.appendChild(canvas);
    document.body.appendChild(panel);

    discoverSign = document.createElement("div");
    discoverSign.id = "zone-sign";
    discoverSign.hidden = true;
    document.body.appendChild(discoverSign);
  }

  // Open or close the map; the backpack, the goals window and the Diario close when it opens.
  function setOpen(open) {
    panel.hidden = !open;
    shownKey = null;
    if (open) {
      UI.closeBackpack();
      Goals.close();
      Lessons.closeDiary();
      render();
      UI.placeWindow(panel);
    }
  }

  // The zone where each one is: in the house it is the Ciudad.
  function zoneOf(sim) {
    return sim.place === "meadow" || sim.place === "lake" || sim.place === "enchanted" ? sim.place : "city";
  }

  function update(dt) {
    if (discoverLeft > 0) {
      discoverLeft -= dt;
      UI.placeSign(discoverSign);
      if (discoverLeft <= 0) discoverSign.hidden = true;
    }
    if (!panel.hidden) render();
  }

  // Redraw only when something on it changes.
  function render() {
    var key = Object.keys(found).join(",") + "|" + Sims.list().map(zoneOf).join(",");
    if (key === shownKey) return;
    shownKey = key;
    drawMap(canvas.getContext("2d"));
  }

  // A number from 0 to 1 that always comes out the same for the same "i" and "k".
  function hash(i, k) {
    var s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return s - Math.floor(s);
  }

  // A hand-drawn box: its sides wobble a little, always the same way. Dashed for the zones still to find.
  function handBox(ctx, b, seed, dashed) {
    var pts = [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h], [b.x, b.y]];
    ctx.save();
    ctx.strokeStyle = "#7A5636";
    ctx.lineWidth = dashed ? 1.4 : 1.8;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (dashed) ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], p = pts[i];
      var mx = (a[0] + p[0]) / 2 + (hash(seed, i) - 0.5) * 4, my = (a[1] + p[1]) / 2 + (hash(seed, i + 9) - 0.5) * 4;
      ctx.quadraticCurveTo(mx, my, p[0] + (hash(seed, i + 20) - 0.5) * 1.5, p[1] + (hash(seed, i + 30) - 0.5) * 1.5);
    }
    ctx.stroke();
    ctx.restore();
  }

  // A dotted path from one spot to another, like footsteps on an old map.
  function dots(ctx, ax, ay, bx, by) {
    var n = Math.max(2, Math.round(Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay)) / 6));
    ctx.fillStyle = "#7A5636";
    for (var i = 1; i < n; i++) {
      ctx.beginPath();
      ctx.arc(ax + (bx - ax) * i / n, ay + (by - ay) * i / n, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function text(ctx, t, x, y, size, bold) {
    ctx.font = (bold ? "700 " : "") + size + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#5A3E28";
    ctx.fillText(t, x, y);
  }

  // A rolled edge of the parchment, at the top or the bottom.
  function roll(ctx, y) {
    var g = ctx.createLinearGradient(0, y, 0, y + 20);
    g.addColorStop(0, "#B8925A");
    g.addColorStop(0.45, "#F0DEB4");
    g.addColorStop(1, "#A9824C");
    roundRect(ctx, 8, y, MW - 16, 20, 10);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "#7A5636";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    [14, MW - 14].forEach(function (x) {
      ctx.beginPath();
      ctx.ellipse(x, y + 10, 5, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#C9A66B";
      ctx.fill();
      ctx.stroke();
    });
  }

  // Where each zone goes on the map.
  var BOXES = {
    city: { x: 115, y: 100, w: 90, h: 58 },
    meadow: { x: 115, y: 46, w: 90, h: 44 },
    enchanted: { x: 30, y: 104, w: 74, h: 50 },
    lake: { x: 216, y: 104, w: 74, h: 50 },
    bottom: { x: 115, y: 168, w: 90, h: 40 }
  };

  function drawMap(ctx) {
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, MW, MH);
    // The paper, darker toward its sides like old paper.
    var paper = ctx.createRadialGradient(MW / 2, MH / 2, 30, MW / 2, MH / 2, MW * 0.62);
    paper.addColorStop(0, "#F4E6C4");
    paper.addColorStop(1, "#DCC08C");
    ctx.fillStyle = paper;
    ctx.fillRect(16, 22, MW - 32, MH - 44);
    ctx.strokeStyle = "#A9824C";
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 22, MW - 32, MH - 44);
    roll(ctx, 12);
    roll(ctx, MH - 32);
    handBox(ctx, { x: 24, y: 38, w: MW - 48, h: MH - 76 }, 1, false);

    // The paths between the Ciudad and the zones around it.
    var c = BOXES.city;
    dots(ctx, c.x + c.w / 2, c.y, c.x + c.w / 2, BOXES.meadow.y + BOXES.meadow.h);
    dots(ctx, c.x, c.y + c.h / 2, BOXES.enchanted.x + BOXES.enchanted.w, c.y + c.h / 2);
    dots(ctx, c.x + c.w, c.y + c.h / 2, BOXES.lake.x, c.y + c.h / 2);
    dots(ctx, c.x + c.w / 2, c.y + c.h, c.x + c.w / 2, BOXES.bottom.y);

    // The Ciudad: the river, Sofía's little house and its name.
    handBox(ctx, c, 2, false);
    ctx.strokeStyle = "#5E9CC0";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(c.x + 58, c.y + 3);
    ctx.bezierCurveTo(c.x + 50, c.y + 18, c.x + 68, c.y + 30, c.x + 62, c.y + c.h - 3);
    ctx.stroke();
    var hx = c.x + 22, hy = c.y + 28;
    ctx.fillStyle = "#E9C9A0";
    ctx.fillRect(hx - 9, hy - 6, 18, 13);
    ctx.strokeStyle = "#7A5636";
    ctx.lineWidth = 1.4;
    ctx.strokeRect(hx - 9, hy - 6, 18, 13);
    ctx.beginPath();
    ctx.moveTo(hx - 12, hy - 5);
    ctx.lineTo(hx, hy - 15);
    ctx.lineTo(hx + 12, hy - 5);
    ctx.closePath();
    ctx.fillStyle = C.terracotta;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#7A5636";
    ctx.fillRect(hx - 2, hy + 1, 4, 6);
    text(ctx, "Ciudad", c.x + c.w / 2, c.y + c.h - 9, 10, true);

    // The Pradera, once someone has been there; the rest are still to find.
    var m = BOXES.meadow;
    if (found.meadow) {
      handBox(ctx, m, 3, false);
      ctx.strokeStyle = "#7FA36A";
      ctx.lineWidth = 1.4;
      [[m.x + 18, 26], [m.x + 66, 22]].forEach(function (h) {
        ctx.beginPath();
        ctx.arc(h[0], m.y + m.h - 6, h[1] / 2, Math.PI, 0);
        ctx.stroke();
      });
      text(ctx, "🌸", m.x + 14, m.y + 13, 14, false);
      text(ctx, "Pradera de flores", m.x + m.w / 2, m.y + 33, 9, true);
    } else {
      unknown(ctx, m, 3);
    }
    // The Lago, once someone has been there: blue water with a little sand on its left and a duck.
    var l = BOXES.lake;
    if (found.lake) {
      handBox(ctx, l, 5, false);
      ctx.fillStyle = "#EBD3A6";
      ctx.beginPath();
      ctx.ellipse(l.x + 22, l.y + 26, 14, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8EC3DD";
      ctx.strokeStyle = "#5E9CC0";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(l.x + 46, l.y + 25, 22, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      text(ctx, "🏖️", l.x + 12, l.y + 12, 12, false);
      text(ctx, "Lago", l.x + l.w / 2, l.y + l.h - 8, 9, true);
    } else {
      unknown(ctx, l, 5);
    }
    // The Bosque encantado, once someone has been there: dark green woods with round trees and a little mushroom.
    var f = BOXES.enchanted;
    if (found.enchanted) {
      handBox(ctx, f, 4, false);
      ctx.fillStyle = "#6E9A5E";
      ctx.fillRect(f.x + 3, f.y + 3, f.w - 6, f.h - 6);
      [[f.x + 14, f.y + 26, 8], [f.x + 29, f.y + 21, 9], [f.x + 46, f.y + 27, 8], [f.x + 61, f.y + 22, 7]].forEach(function (t) {
        ctx.beginPath();
        ctx.arc(t[0], t[1], t[2], 0, Math.PI * 2);
        ctx.fillStyle = "#3F6B3A";
        ctx.fill();
      });
      handBox(ctx, f, 4, false);
      text(ctx, "🍄", f.x + 12, f.y + 12, 12, false);
      ctx.fillStyle = "rgba(244, 230, 196, 0.85)";
      ctx.fillRect(f.x + 4, f.y + f.h - 15, f.w - 8, 12);
      text(ctx, "Bosque encantado", f.x + f.w / 2, f.y + f.h - 8, 8, true);
    } else {
      unknown(ctx, f, 4);
    }
    unknown(ctx, BOXES.bottom, 6);

    // Where Sofía and real.fixer are: at the top right of their zone.
    var slots = { city: 0, meadow: 0, lake: 0, enchanted: 0 };
    Sims.list().forEach(function (sim) {
      var zone = zoneOf(sim), b = BOXES[zone];
      var x = b.x + b.w - 9 - slots[zone] * 16;
      slots[zone] += 1;
      text(ctx, CONFIG.characterLooks[sim.data.id].icon, x, b.y + 10, 12, false);
    });
  }

  function unknown(ctx, b, seed) {
    handBox(ctx, b, seed, true);
    text(ctx, "❓", b.x + b.w / 2, b.y + b.h / 2 - 7, 13, false);
    text(ctx, "Por descubrir", b.x + b.w / 2, b.y + b.h / 2 + 11, 9, true);
  }

  // True if a spot on the screen is over the map (so the word tag does not show what is under it).
  function covers(x, y) {
    if (!panel || panel.hidden) return false;
    var r = panel.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  // ---------- Saving ----------

  function get() {
    return { found: Object.keys(found) };
  }

  // Used when loading a saved game. An old saved game only knows the Ciudad.
  function set(saved) {
    found = {};
    if (!saved || typeof saved !== "object" || !Array.isArray(saved.found)) return;
    saved.found.forEach(function (id) {
      if (ZONES.some(function (z) { return z.id === id; })) found[id] = true;
    });
  }

  return {
    edge: V.edge,
    foot: V.foot,
    lakeEdge: V.lakeEdge,
    lakeFoot: V.lakeFoot,
    forestEdge: V.forestEdge,
    forestFoot: V.forestFoot,
    trailAt: trailAt,
    setHover: setHover,
    isSolid: isSolid,
    isNear: isNear,
    boxes: boxes,
    wordAt: wordAt,
    drawTrail: drawTrail,
    drawLabels: drawLabels,
    init: init,
    update: update,
    visit: visit,
    isFound: isFound,
    covers: covers,
    get: get,
    set: set
  };
})();
