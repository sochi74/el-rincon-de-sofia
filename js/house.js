// Draws the house seen from above: floors, walls, room names and furniture.
// Four rooms: Cocina, Dormitorio, Sala and, on the right of the Sala, the Baño with its bathtub full of bubbles,
// its sink with a mirror, and its toilet, plant, soap shelf and towels (only decoration).
// Also the decorations: Sofía's painting easel in the Sala (always there), the pizza oven in the Cocina (always there,
// with little flames, a peel with a pizza and smoke; at night it glows), and the ones her goals give (js/goals.js):
// a vase with garden flowers on the floor of the Sala and colored bunting on the Cocina wall.
// And the ones the hidden chests of the valley bring (js/treasure.js): an old wall clock with a golden pendulum (its hands
// show the time of the game) and a frame of pressed flowers on the walls, and on the floor a lamp of little shells and a
// mushroom lamp (both glow softly at night), a folded wool blanket (walked over, like the rug) and a giant geode with
// twinkling crystals. Each one shows up in a free spot of the Sala (or the closest free spot of another room).
// At night the Televisión gives a soft glow while someone watches it.
// Also where characters may walk: inside the rooms, through the doorways, and never on the furniture.
// Everything that Modo decorar moves (js/decorate.js) has its place and turn here: the furniture, the rug, the easel,
// the pizza oven and the vase, the toilet and the plant on the floor of any room, and the poster, the bunting, the soap shelf and the towels
// on any wall, and the decorations of the chests. Where each one is, where a character
// stands to use it and how it lies or sits on it all follow that place and turn.
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
    } else if (room.floor === "bathTiles") {
      // Little light blue and white squares with thin lines between them.
      var bt = 30;
      for (var by = room.y; by < room.y + room.h; by += bt) {
        for (var bx = room.x; bx < room.x + room.w; bx += bt) {
          ctx.fillStyle = ((bx - room.x) / bt + (by - room.y) / bt) % 2 === 0 ? C.bathTile : C.bathTileWhite;
          ctx.fillRect(bx, by, bt, bt);
        }
      }
      ctx.strokeStyle = "rgba(255, 253, 248, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var gx = room.x; gx <= room.x + room.w; gx += bt) {
        ctx.moveTo(gx, room.y);
        ctx.lineTo(gx, room.y + room.h);
      }
      for (var gy = room.y; gy <= room.y + room.h; gy += bt) {
        ctx.moveTo(room.x, gy);
        ctx.lineTo(room.x + room.w, gy);
      }
      ctx.stroke();
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
      // Outside walls (front door on the bottom wall), with the Baño sticking out on the right of the Sala
      [40, 40, 960, 40],
      [960, 40, 960, 340],
      [960, 340, 1220, 340],
      [1220, 340, 1220, 680],
      [1220, 680, 190, 680],
      [190 - d, 680, 40, 680],
      [40, 680, 40, 40],
      // Kitchen | Bedroom
      [420, 40, 420, 150],
      [420, 150 + d, 420, 340],
      // Top rooms | Living room
      [40, 340, 230, 340],
      [230 + d, 340, 470, 340],
      [470 + d, 340, 960, 340],
      // Living room | Bathroom
      [960, 340, 960, 490 - d / 2],
      [960, 490 + d / 2, 960, 680]
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
    [[200, 40, 330, 40], [520, 40, 660, 40], [1220, 590, 1220, 650]].forEach(function (s) {
      ctx.beginPath();
      ctx.moveTo(s[0], s[1]);
      ctx.lineTo(s[2], s[3]);
      ctx.stroke();
    });
    ctx.restore();

    // Welcome mat at the front door
    fillRound(ctx, 108, 690, 74, 22, 8, C.terracotta);
  }

  // ---------- Where each thing is ----------

  // Everything Modo decorar moves. Floor things: "w", "h" is the spot they take on the floor when they are not turned
  // (the Televisión with its stand) and "start" the middle of that spot at first. They turn a quarter at a time ("dir").
  // "use" (where a character stands to use it), "label" (where its name goes) and "feet" (the part characters go around,
  // when it is not all of it) are spots from the middle, as when it is not turned; they turn with it.
  // "upright" things (the easel and the vase) stand up: turning them shows another side instead of turning the drawing.
  // The rug is flat: characters walk over it and furniture can stand on it.
  // Wall things: "length" along the wall, "depth" out from it, "off" how far from the middle of the wall they start,
  // and "start" their wall at first ("side" says where the wall is from them, "line" where the wall is, "along" their middle).
  // "unlock" is the goal (js/goals.js) that puts it in the house; "treasure" says a hidden chest (js/treasure.js) puts it there.
  var DEFS = {
    fridge: { kind: "floor", w: 90, h: 80, start: { x: 115, y: 120 }, use: { x: 0, y: 80 }, label: { x: 0, y: 64 } },
    stove: { kind: "floor", w: 100, h: 70, start: { x: 290, y: 107 }, use: { x: -10, y: 93 }, label: { x: 0, y: 59 } },
    bed: { kind: "floor", w: 190, h: 220, start: { x: 815, y: 190 }, use: { x: -125, y: 10 }, label: { x: 0, y: 90 } },
    tv: { kind: "floor", w: 260, h: 56, start: { x: 720, y: 392 }, use: { x: -120, y: 103 }, label: { x: 0, y: 54 },
      seat: { x: 0, y: 118 } },
    sofa: { kind: "floor", w: 260, h: 90, start: { x: 720, y: 605 }, use: { x: 0, y: -73 }, label: { x: 0, y: -67 } },
    rug: { kind: "rug", w: 320, h: 92, start: { x: 720, y: 501 } },
    easel: { kind: "floor", w: 56, h: 92, start: { x: 906, y: 614 }, feet: { x: -24, y: 8, w: 48, h: 38 }, upright: true },
    // The pizza oven with its peel, in the bottom left corner of the Cocina; only decoration.
    oven: { kind: "floor", w: 100, h: 80, start: { x: 110, y: 262 } },
    vase: { kind: "floor", w: 48, h: 74, start: { x: 900, y: 390 }, feet: { x: -22, y: 12, w: 44, h: 24 }, upright: true,
      unlock: ["sofia", 0] },
    poster: { kind: "wall", length: 120, depth: 60, off: 12, start: { side: "top", line: 340, along: 395 } },
    bunting: { kind: "wall", length: 364, depth: 32, off: -2, start: { side: "top", line: 40, along: 230 }, unlock: ["sofia", 1] },
    // The Baño. "parts" are smaller spots with their own word (the bubbles, the mirror and the toothbrushes), from the middle.
    bathtub: { kind: "floor", w: 150, h: 80, start: { x: 1130, y: 392 }, use: { x: 0, y: 70 }, label: { x: 12, y: 54 },
      parts: { bubbles: { x: 22, y: -26, w: 46, h: 52 } } },
    sink: { kind: "floor", w: 76, h: 56, start: { x: 1010, y: 378 }, use: { x: 0, y: 72 }, label: { x: 18, y: 44 },
      parts: { mirror: { x: -26, y: -28, w: 52, h: 18 }, toothbrush: { x: 22, y: -16, w: 16, h: 22 } } },
    toilet: { kind: "floor", w: 50, h: 64, start: { x: 1180, y: 640 } },
    plant: { kind: "floor", w: 44, h: 62, start: { x: 994, y: 640 }, feet: { x: -18, y: 8, w: 36, h: 22 }, upright: true },
    shelf: { kind: "wall", length: 96, depth: 28, off: 2, start: { side: "bottom", line: 680, along: 1080 } },
    towels: { kind: "wall", length: 84, depth: 30, off: 2, start: { side: "right", line: 1220, along: 520 } },
    // The decorations of the hidden chests, all in the Sala at first.
    wallClock: { kind: "wall", length: 48, depth: 84, off: 8, start: { side: "top", line: 340, along: 182 }, treasure: true },
    pressedFlowers: { kind: "wall", length: 64, depth: 50, off: 10, start: { side: "top", line: 340, along: 92 }, treasure: true },
    shellLamp: { kind: "floor", w: 44, h: 76, start: { x: 262, y: 612 }, feet: { x: -16, y: 18, w: 32, h: 18 }, upright: true,
      treasure: true },
    mushroomLamp: { kind: "floor", w: 48, h: 64, start: { x: 440, y: 616 }, feet: { x: -18, y: 12, w: 36, h: 18 }, upright: true,
      treasure: true },
    woolBlanket: { kind: "rug", w: 92, h: 58, start: { x: 330, y: 500 }, treasure: true },
    geode: { kind: "floor", w: 64, h: 50, start: { x: 352, y: 628 }, treasure: true }
  };
  // The order they are drawn in; the last one is on top, so it is picked first.
  var ORDER = ["rug", "woolBlanket", "fridge", "stove", "bed", "tv", "sofa", "bathtub", "sink", "toilet", "plant", "vase", "easel",
    "oven", "geode", "shellLamp", "mushroomLamp", "poster", "bunting", "shelf", "towels", "pressedFlowers", "wallClock"];
  // The decorations of the hidden chests.
  var TREASURES = ORDER.filter(function (id) { return DEFS[id].treasure; });
  // The word of each thing when it is not the same as its id.
  var WORD_OF = { shelf: "soap", towels: "towel", oven: "pizzaOven", shellLamp: "lamp", mushroomLamp: "lamp" };
  // How far from its spot in front a character may stand to use a piece of furniture, when that spot is taken.
  var USE_REACH = 70;
  // In front of the front door, inside the Sala: nothing goes here, so the door can always be used.
  var FRONT_DOOR = { x: 100, y: 600, w: 90, h: 80 };

  // Where each thing is now, by id: { x, y, dir } on the floor, { side, line, along } on a wall.
  var layout = {};
  // Where each decoration of a chest showed up, by id: "Como al principio" puts it back there.
  var appeared = {};

  function firstSpot(id) {
    var s = DEFS[id].start;
    return DEFS[id].kind === "wall" ? { side: s.side, line: s.line, along: s.along } : { x: s.x, y: s.y, dir: 0 };
  }

  function resetLayout() {
    solid = null;
    ORDER.forEach(function (id) {
      layout[id] = appeared[id] ? copyPos(appeared[id]) : firstSpot(id);
    });
  }

  function copyPos(p) {
    var out = {};
    Object.keys(p).forEach(function (k) { out[k] = p[k]; });
    return out;
  }
  resetLayout();

  // True if the thing is in the house (the vase and the bunting only once their goal is met, the decorations of the
  // chests once their chest is open).
  function isOn(id) {
    if (DEFS[id].treasure) return Treasure.hasDecoration(id);
    var u = DEFS[id].unlock;
    return !u || Goals.isMet(u[0], u[1]);
  }

  function present() {
    return ORDER.filter(isOn);
  }

  // A spot from the middle of a thing, turned a quarter clockwise "dir" times.
  function turned(v, dir) {
    var x = v.x, y = v.y;
    for (var i = 0; i < dir; i++) {
      var t = x;
      x = -y;
      y = t;
    }
    return { x: x, y: y };
  }

  // From the middle of a floor thing to a spot in the house.
  function fromMiddle(id, v) {
    var p = layout[id], t = DEFS[id].upright ? v : turned(v, p.dir);
    return { x: p.x + t.x, y: p.y + t.y };
  }

  // The walls a wall thing can hang on: each side of each room, seen from inside the room.
  var TRACKS = [];
  CONFIG.rooms.forEach(function (r) {
    TRACKS.push({ side: "top", line: r.y, from: r.x, to: r.x + r.w, room: r.id });
    TRACKS.push({ side: "bottom", line: r.y + r.h, from: r.x, to: r.x + r.w, room: r.id });
    TRACKS.push({ side: "left", line: r.x, from: r.y, to: r.y + r.h, room: r.id });
    TRACKS.push({ side: "right", line: r.x + r.w, from: r.y, to: r.y + r.h, room: r.id });
  });

  // The gaps in the walls, where nothing hangs: the doorways between rooms and the front door.
  var GAPS = CONFIG.doorways.map(function (d) {
    var half = CONFIG.doorWidth / 2;
    var rooms = CONFIG.rooms.filter(function (r) { return d.rooms.indexOf(r.id) >= 0; });
    if (rooms[0].y === rooms[1].y) return { upright: true, line: d.x, from: d.y - half, to: d.y + half };
    return { upright: false, line: d.y, from: d.x - half, to: d.x + half };
  }).concat([{ upright: false, line: 680, from: CONFIG.frontDoor.tap.x, to: CONFIG.frontDoor.tap.x + CONFIG.frontDoor.tap.w }]);

  // How a wall thing is turned so its top is against its wall.
  var WALL_TURN = { top: 0, bottom: Math.PI, left: -Math.PI / 2, right: Math.PI / 2 };

  function isUpright(side) {
    return side === "left" || side === "right";
  }

  // The box a wall thing covers at a spot of a wall.
  function wallBox(p, d) {
    var L = d.length;
    if (p.side === "top") return { x: p.along - L / 2, y: p.line + d.off, w: L, h: d.depth };
    if (p.side === "bottom") return { x: p.along - L / 2, y: p.line - d.off - d.depth, w: L, h: d.depth };
    if (p.side === "left") return { x: p.line + d.off, y: p.along - L / 2, w: d.depth, h: L };
    return { x: p.line - d.off - d.depth, y: p.along - L / 2, w: d.depth, h: L };
  }

  // The box a thing covers: on the floor (the Televisión with its stand) or on its wall.
  function boxOf(id) {
    var d = DEFS[id], p = layout[id];
    if (d.kind === "wall") return wallBox(p, d);
    var side = !d.upright && p.dir % 2 === 1;
    var w = side ? d.h : d.w, h = side ? d.w : d.h;
    return { x: p.x - w / 2, y: p.y - h / 2, w: w, h: h };
  }

  // The part of a floor thing characters go around (before the room they keep from it); null for the rug and wall things.
  function feetOf(id) {
    var d = DEFS[id];
    if (d.kind !== "floor") return null;
    if (!d.feet) return boxOf(id);
    var p = layout[id];
    return { x: p.x + d.feet.x, y: p.y + d.feet.y, w: d.feet.w, h: d.feet.h };
  }

  // Which way the front of a floor thing looks, as a step: the Sofá looks up at first, the rest down.
  function front(id) {
    return turned({ x: 0, y: id === "sofa" ? -1 : 1 }, layout[id].dir);
  }

  // ---------- Using the furniture ----------

  // Where a character stands to use a piece of furniture (to cook, at the Estufa): in front of it, turned with it.
  // If a wall or other furniture is there, the same spot on the other side (by the other side of the Cama, or at the
  // other end of the Televisión), and else the closest free spot to one of them, when it is close enough; else null.
  function useSpot(id) {
    var use = DEFS[id].use;
    var tries = [fromMiddle(id, use), fromMiddle(id, { x: -use.x, y: use.y })];
    for (var i = 0; i < tries.length; i++) {
      if (!isSolid(tries[i].x, tries[i].y)) return tries[i];
    }
    for (var j = 0; j < tries.length; j++) {
      var s = tries[j], f = Path.free("house", s.x, s.y);
      if (Math.sqrt((f.x - s.x) * (f.x - s.x) + (f.y - s.y) * (f.y - s.y)) <= USE_REACH) return f;
    }
    return null;
  }

  // How far below the middle of the Bañera the water line goes, where the head of who bathes comes out of the bubbles,
  // and how far up from the feet that is on a character (js/sims.js hides the rest under the water).
  var BATH_NECK = 8, BATH_DEEP = 40;

  // How a character lies in the Cama, sits on the Sofá or bathes in the Bañera (js/sims.js draws it): where its feet go
  // and how it is turned. In the Bañera only its head shows, in the middle of the water, however the Bañera is turned.
  // In the Cama it lies along the bed with its head on the pillow. On the Sofá it sits looking where the Sofá looks:
  // seen from behind, from the front or from the side; only from behind the backrest goes over it.
  // At the Televisión it sits on the floor where it stands, looking at the middle of the screen ("look").
  function poseFor(id) {
    var p = layout[id];
    if (id === "tv") return { kind: "floor", look: { x: p.x, y: p.y } };
    if (id === "bed") {
      var at = fromMiddle("bed", { x: -41, y: 14 });
      return { kind: "lie", x: at.x, y: at.y, angle: p.dir * Math.PI / 2 };
    }
    if (id === "bathtub") return { kind: "bath", x: p.x, y: p.y + BATH_NECK + BATH_DEEP * CONFIG.characterScale };
    if (id === "sofa") {
      if (p.dir === 0) return { kind: "sofa", view: "back", x: p.x, y: p.y + 47, backrest: true };
      if (p.dir === 2) return { kind: "sofa", view: "front", x: p.x, y: p.y + 40 };
      return { kind: "sofa", view: "side", flip: p.dir === 3, x: p.x + (p.dir === 1 ? -10 : 10), y: p.y + 18 };
    }
    return null;
  }

  // Watching tele at the Televisión: where a character sits on the floor in front of it, looking at it.
  // If something is there, the closest free spot when it is close enough, and else where it stands to use it.
  function floorSeat() {
    var s = fromMiddle("tv", DEFS.tv.seat);
    if (!isSolid(s.x, s.y)) return s;
    var f = Path.free("house", s.x, s.y);
    if (Math.sqrt((f.x - s.x) * (f.x - s.x) + (f.y - s.y) * (f.y - s.y)) <= USE_REACH) return f;
    return useSpot("tv");
  }

  // True if the Sofá looks at the Televisión and the Televisión looks back at it, close enough to watch from there.
  function sofaFacesTv() {
    var f = front("sofa"), t = front("tv");
    var dx = layout.tv.x - layout.sofa.x, dy = layout.tv.y - layout.sofa.y;
    var ahead = dx * f.x + dy * f.y, aside = Math.abs(dx * f.y - dy * f.x);
    return ahead > 60 && ahead < 460 && aside < 140 && dx * t.x + dy * t.y < 0;
  }

  // Where a character looks while it uses a piece of furniture: on the Sofá, far ahead (at the Televisión, if it is there).
  // For the rest null: it looks at the piece.
  function lookFor(id) {
    if (id !== "sofa") return null;
    var f = front("sofa"), p = layout.sofa;
    return { x: p.x + f.x * 400, y: p.y + f.y * 400 };
  }

  // ---------- Poster and bunting on the walls ----------

  // Draw a wall thing turned so its top is against its wall.
  function drawOnWall(ctx, id, fn) {
    var p = layout[id], d = DEFS[id];
    ctx.save();
    if (isUpright(p.side)) ctx.translate(p.line, p.along); else ctx.translate(p.along, p.line);
    ctx.rotate(WALL_TURN[p.side]);
    fn({ x: -d.length / 2, y: d.off, w: d.length, h: d.depth });
    ctx.restore();
  }

  // "That's what she said!": two lines on a top or bottom wall, four lines on a side wall, always easy to read.
  function drawPoster(ctx) {
    drawOnWall(ctx, "poster", function (b) {
      withShadow(ctx, function () {
        fillRound(ctx, b.x, b.y, b.w, b.h, 6, C.wood);
      });
      fillRound(ctx, b.x + 5, b.y + 5, b.w - 10, b.h - 10, 4, C.cream);
    });
    var box = boxOf("poster"), wide = box.w > box.h;
    var lines = wide ? ["That's what", "she said!"] : ["That's", "what", "she", "said!"];
    var size = wide ? 15 : 13, gap = size + 4;
    ctx.save();
    ctx.font = "700 " + size + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = C.terracotta;
    lines.forEach(function (text, i) {
      ctx.fillText(text, box.x + box.w / 2, box.y + box.h / 2 + 1 + (i - (lines.length - 1) / 2) * gap);
    });
    ctx.restore();
  }

  // Colored bunting along a wall: two swags of little flags.
  function drawBunting(ctx) {
    drawOnWall(ctx, "bunting", function (b) {
      var colors = [C.terracotta, "#F2C230", C.sage, "#E795AE", "#7DB9D6", C.cream];
      var half = b.w / 2 - 4;
      var swags = [[-half, 0], [0, half]];
      var top = b.y + 6, sag = 9;
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
    });
  }

  // A wooden shelf on the wall of the Baño with little soap bottles in colors. The bottles always stand up, with their
  // caps on top: in a row on the shelf on a top or bottom wall, one over the other on a side wall.
  var SOAPS = [["#E795AE", 16], ["#8FA88A", 20], ["#7DB9D6", 17], ["#F2C230", 14]];

  function drawShelf(ctx) {
    var b = boxOf("shelf"), wide = b.w > b.h;
    if (wide) {
      withShadow(ctx, function () {
        fillRound(ctx, b.x, b.y + b.h - 8, b.w, 8, 3, C.wood);
      });
    } else {
      var wallLeft = layout.shelf.side === "left";
      withShadow(ctx, function () {
        fillRound(ctx, wallLeft ? b.x : b.x + b.w - 8, b.y, 8, b.h, 3, C.wood);
      });
    }
    SOAPS.forEach(function (soap, i) {
      var h = wide ? soap[1] : soap[1] * 0.75, w = wide ? 13 : 11;
      var bx = wide ? b.x + 10 + i * 21 : b.x + (b.w - w) / 2;
      var bottom = wide ? b.y + b.h - 6 : b.y + 8 + (i + 1) * (b.h - 12) / 4;
      fillRound(ctx, bx, bottom - h, w, h, 4, soap[0]);
      fillRound(ctx, bx + w / 2 - 3, bottom - h - 4, 6, 5, 2, C.white);
      fillRound(ctx, bx + 2.5, bottom - h + 3, 2.5, h - 7, 1.2, "rgba(255, 253, 248, 0.6)");
    });
  }

  // Two striped towels hanging from a little rail on the wall of the Baño.
  function drawTowels(ctx) {
    drawOnWall(ctx, "towels", function (b) {
      fillRound(ctx, b.x + 2, b.y + 1, b.w - 4, 5, 2.5, "#9AA6A8");
      [[b.x + 6, "#E795AE"], [b.x + b.w / 2 + 2, "#7DB9D6"]].forEach(function (t) {
        var tw = b.w / 2 - 8;
        withShadow(ctx, function () {
          fillRound(ctx, t[0], b.y + 2, tw, b.h - 2, 5, t[1]);
        });
        fillRound(ctx, t[0], b.y + b.h - 10, tw, 3, 1.5, C.white);
        fillRound(ctx, t[0], b.y + b.h - 5, tw, 2, 1, "rgba(255, 253, 248, 0.7)");
      });
    });
  }

  // ---------- Decorations on the floor ----------

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
  // Turned, it shows its back (plain wood) or its side (a thin board on legs open like an A).
  function drawEasel(ctx, E, dir) {
    var cx = E.x + E.w / 2, feet = E.y + E.h - 2;
    ctx.save();
    ctx.fillStyle = "rgba(74, 52, 40, 0.22)";
    ctx.beginPath();
    ctx.ellipse(cx, feet, 30, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (dir % 2 === 1) {
      drawEaselSide(ctx, E, dir === 3 ? 1 : -1);
      ctx.restore();
      return;
    }
    var px = E.x + 3, py = E.y + 6, pw = E.w - 6, ph = 42;
    if (dir === 2) {
      // From behind: the two front legs behind the canvas, the back of the canvas, and the back leg in front of it.
      strokePath(ctx, C.wood, 5, [[cx - 3, E.y + 2], [cx - 24, feet]]);
      strokePath(ctx, C.wood, 5, [[cx + 3, E.y + 2], [cx + 24, feet]]);
      withShadow(ctx, function () {
        fillRound(ctx, px, py, pw, ph, 3, "#D9B48A");
      });
      strokePath(ctx, "#B88A5E", 2, [[px + 4, py + 4], [px + pw - 4, py + ph - 4]]);
      strokePath(ctx, "#B88A5E", 2, [[px + pw - 4, py + 4], [px + 4, py + ph - 4]]);
      fillRound(ctx, E.x + 1, E.y + 48, E.w - 2, 6, 3, "#8A5C38");
      strokePath(ctx, "#8A5C38", 4, [[cx, E.y + 6], [cx + 4, feet - 8]]);
      ctx.restore();
      return;
    }
    // Back leg, then the two front legs and the ledge the canvas sits on
    strokePath(ctx, "#8A5C38", 4, [[cx, E.y + 6], [cx + 4, feet - 8]]);
    strokePath(ctx, C.wood, 5, [[cx - 3, E.y + 2], [cx - 24, feet]]);
    strokePath(ctx, C.wood, 5, [[cx + 3, E.y + 2], [cx + 24, feet]]);
    fillRound(ctx, E.x + 1, E.y + 48, E.w - 2, 6, 3, "#8A5C38");

    // The canvas, with a cream frame
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

  // The easel from the side, its canvas looking right ("s" = 1) or left (-1): the back leg, the front legs
  // together, and the canvas as a thin board leaning on them, with the painting's edge.
  function drawEaselSide(ctx, E, s) {
    var top = E.y + 4, feet = E.y + E.h - 2;
    ctx.translate(E.x + E.w / 2, 0);
    ctx.scale(s, 1);
    strokePath(ctx, "#8A5C38", 4, [[-2, top + 6], [-20, feet]]);
    strokePath(ctx, C.wood, 5, [[0, top], [16, feet]]);
    withShadow(ctx, function () {
      ctx.fillStyle = C.white;
      ctx.beginPath();
      ctx.moveTo(1, top + 2);
      ctx.lineTo(7, top);
      ctx.lineTo(14, top + 46);
      ctx.lineTo(8, top + 48);
      ctx.closePath();
      ctx.fill();
    });
    strokePath(ctx, "#DCE7D6", 2, [[6, top + 4], [12, top + 43]]);
    fillRound(ctx, 4, top + 46, 16, 5, 2.5, "#8A5C38");
  }

  // A big light blue vase standing on the floor, like a flowerpot, with colorful flowers from the garden.
  // Turned to a side, the flowers lean the other way.
  function drawVase(ctx, b, dir) {
    var cx = b.x + b.w / 2, base = b.y + b.h - 2;
    ctx.save();
    ctx.fillStyle = "rgba(74, 52, 40, 0.22)";
    ctx.beginPath();
    ctx.ellipse(cx, base, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(cx, base);
    ctx.scale(dir % 2 === 1 ? -1.7 : 1.7, 1.7);
    // Stems
    [[-8, 16], [-3, 10], [3, 12], [8, 17], [0, 20]].forEach(function (f) {
      strokePath(ctx, C.sage, 1.6, [[f[0] * 0.3, -18], [f[0], -18 - f[1]]]);
    });
    // Flowers: terracotta tulip, white lily, a rainbow one in pink and yellow, and a blue moon flower
    [[-8, 16, C.terracotta], [-3, 10, C.white], [3, 12, "#E795AE"], [8, 17, "#9FC3E8"], [0, 20, "#F2C230"]].forEach(function (f) {
      var fx = f[0], fy = -18 - f[1];
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
      ctx.moveTo(-4, -20);
      ctx.lineTo(4, -20);
      ctx.quadraticCurveTo(4, -15, 9, -10);
      ctx.quadraticCurveTo(11, 0, 5, 0);
      ctx.lineTo(-5, 0);
      ctx.quadraticCurveTo(-11, 0, -9, -10);
      ctx.quadraticCurveTo(-4, -15, -4, -20);
      ctx.closePath();
      ctx.fill();
    });
    fillRound(ctx, -5, -22, 10, 3, 1.5, "#5E9DBB");
    strokePath(ctx, "rgba(255, 253, 248, 0.7)", 1.6, [[-6, -10], [-5, -4]]);
    ctx.restore();
  }

  // ---------- Decorations of the hidden chests ----------

  function dot(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // The old wall clock, its top against the wall: a wooden case with a round face whose hands show the time of the game,
  // and below it a little window where the golden pendulum swings (it stands still with Pausa).
  function drawWallClock(ctx, b) {
    var cx = b.x + b.w / 2, top = b.y;
    withShadow(ctx, function () {
      fillRound(ctx, cx - 20, top + 4, 40, b.h - 6, 9, "#8A5534");
    });
    fillRound(ctx, cx - 17, top + 7, 34, b.h - 12, 7, C.wood);
    fillRound(ctx, cx - 22, top + 2, 44, 8, 4, "#8A5534");
    fillRound(ctx, cx - 22, top + b.h - 8, 44, 7, 3, "#8A5534");
    // The pendulum, behind its glass.
    var win = { x: cx - 11, y: top + 40, w: 22, h: b.h - 52 };
    fillRound(ctx, win.x, win.y, win.w, win.h, 5, "#5E3A24");
    var swing = Math.sin(ovenClock * 2.6) * 0.32, len = win.h - 12;
    var bx = cx + Math.sin(swing) * len, by = win.y + 3 + Math.cos(swing) * len;
    strokePath(ctx, "#E2B44B", 1.6, [[cx, win.y + 3], [bx, by]]);
    dot(ctx, bx, by, 5, "#F2C230");
    dot(ctx, bx - 1.5, by - 1.5, 1.6, "#FFE58A");
    ctx.fillStyle = "rgba(200, 230, 245, 0.18)";
    roundRect(ctx, win.x, win.y, win.w, win.h, 5);
    ctx.fill();
    // The face, with its golden ring, twelve little marks and the hands.
    var fy = top + 23;
    dot(ctx, cx, fy, 14, "#E2B44B");
    dot(ctx, cx, fy, 12, "#FBF4EA");
    ctx.strokeStyle = C.darkBrown;
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6;
      ctx.lineWidth = i % 3 === 0 ? 1.6 : 0.8;
      ctx.beginPath();
      ctx.moveTo(cx + Math.sin(a) * 9, fy - Math.cos(a) * 9);
      ctx.lineTo(cx + Math.sin(a) * 11, fy - Math.cos(a) * 11);
      ctx.stroke();
    }
    var minute = Time.get().minute;
    var hour = (minute / 60) % 12 / 12 * Math.PI * 2, min = (minute % 60) / 60 * Math.PI * 2;
    strokePath(ctx, C.darkBrown, 2, [[cx, fy], [cx + Math.sin(hour) * 6, fy - Math.cos(hour) * 6]]);
    strokePath(ctx, C.darkBrown, 1.3, [[cx, fy], [cx + Math.sin(min) * 9, fy - Math.cos(min) * 9]]);
    dot(ctx, cx, fy, 1.6, "#B8862E");
  }

  // A wooden frame with pressed flowers flattened on cream paper: daisies, poppies and sprigs of lavender.
  function drawPressedFlowers(ctx, b) {
    withShadow(ctx, function () {
      fillRound(ctx, b.x, b.y, b.w, b.h, 4, "#9A6A42");
    });
    fillRound(ctx, b.x + 5, b.y + 5, b.w - 10, b.h - 10, 2, "#F8F0DE");
    var x0 = b.x + 5, y0 = b.y + 5, h = b.h - 10;
    // Stems first.
    [[12, 0.15], [24, -0.1], [38, 0.08], [48, -0.2]].forEach(function (st) {
      strokePath(ctx, "#8FA88A", 1.2, [[x0 + st[0], y0 + h - 4], [x0 + st[0] + st[1] * 30, y0 + 12]]);
    });
    // Lavender sprigs: little purple dots up the stem.
    [[24, -0.1], [48, -0.2]].forEach(function (st) {
      for (var k = 0; k < 6; k++) {
        var t = k / 6;
        dot(ctx, x0 + st[0] + st[1] * 30 * (1 - t * 0.2) + (k % 2 ? 1.6 : -1.6), y0 + 12 + t * 12, 1.7, "#A88BD0");
      }
    });
    // A daisy and a poppy, flat, with their petals all around.
    [[x0 + 12 + 4.5, y0 + 12, "#FFFDF8", "#F2C230", 3.4], [x0 + 38 + 2.4, y0 + 13, C.terracotta, "#4A3428", 3.8]].forEach(function (f) {
      for (var i = 0; i < 6; i++) {
        var a = i * Math.PI / 3;
        dot(ctx, f[0] + Math.cos(a) * f[4], f[1] + Math.sin(a) * f[4], f[4] * 0.75, f[2]);
      }
      dot(ctx, f[0], f[1], 2, f[3]);
    });
    // Two little leaves.
    ctx.fillStyle = "#A9BFA4";
    ctx.beginPath();
    ctx.ellipse(x0 + 30, y0 + h - 10, 5, 2, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x0 + 18, y0 + h - 8, 4, 1.8, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // A standing lamp with a shade made of little shells (pink, cream and peach) on a thin wooden pole.
  function drawShellLamp(ctx, b) {
    var cx = b.x + b.w / 2, base = b.y + b.h - 4;
    ctx.fillStyle = "rgba(74, 52, 40, 0.22)";
    ctx.beginPath();
    ctx.ellipse(cx, base, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    fillRound(ctx, cx - 11, base - 6, 22, 6, 3, "#8A5534");
    strokePath(ctx, C.wood, 3, [[cx, base - 5], [cx, b.y + 30]]);
    withShadow(ctx, function () {
      ctx.fillStyle = "#F6E7D0";
      ctx.beginPath();
      ctx.moveTo(cx - 10, b.y + 6);
      ctx.lineTo(cx + 10, b.y + 6);
      ctx.lineTo(cx + 20, b.y + 32);
      ctx.lineTo(cx - 20, b.y + 32);
      ctx.closePath();
      ctx.fill();
    });
    var colors = ["#F4B6C2", "#FFF3DA", "#F7C9A8"];
    [[b.y + 30, 5, 6.5], [b.y + 21, 4, 5.5], [b.y + 12, 3, 4.5]].forEach(function (row, r) {
      for (var i = 0; i < row[1]; i++) {
        var x = cx + (i - (row[1] - 1) / 2) * row[2] * 1.45;
        shell(ctx, x, row[0], row[2], colors[(i + r) % 3]);
      }
    });
  }

  // A little fan-shaped shell with its ridges.
  function shell(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, Math.PI * 1.1, Math.PI * 1.9);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(160, 110, 90, 0.5)";
    ctx.lineWidth = 0.7;
    [-0.6, -0.2, 0.2, 0.6].forEach(function (a) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.sin(a) * r * 0.9, y - Math.cos(a) * r * 0.9);
      ctx.stroke();
    });
  }

  // A red mushroom lamp with cream dots on its cap and a fat cream stem.
  function drawMushroomLamp(ctx, b) {
    var cx = b.x + b.w / 2, base = b.y + b.h - 4;
    ctx.fillStyle = "rgba(74, 52, 40, 0.22)";
    ctx.beginPath();
    ctx.ellipse(cx, base, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    withShadow(ctx, function () {
      fillRound(ctx, cx - 8, b.y + 26, 16, base - b.y - 26, 6, "#FFF3DA");
    });
    ctx.fillStyle = "#EAD9C4";
    ctx.fillRect(cx + 2, b.y + 30, 3, base - b.y - 36);
    withShadow(ctx, function () {
      ctx.fillStyle = C.terracotta;
      ctx.beginPath();
      ctx.moveTo(cx - 24, b.y + 30);
      ctx.quadraticCurveTo(cx - 24, b.y + 2, cx, b.y + 2);
      ctx.quadraticCurveTo(cx + 24, b.y + 2, cx + 24, b.y + 30);
      ctx.closePath();
      ctx.fill();
    });
    [[-13, 20, 3.5], [-2, 10, 3], [10, 17, 4], [16, 27, 2.5], [-18, 28, 2.2], [1, 24, 2.6]].forEach(function (d) {
      dot(ctx, cx + d[0], b.y + d[1], d[2], "#FFF3DA");
    });
  }

  // A folded wool blanket, white with light brown stripes and little fringes at both ends.
  function drawWoolBlanket(ctx, b) {
    ctx.save();
    ctx.fillStyle = "rgba(74, 52, 40, 0.18)";
    roundRect(ctx, b.x + 2, b.y + 4, b.w, b.h, 8);
    ctx.fill();
    fillRound(ctx, b.x + 8, b.y, b.w - 16, b.h, 7, "#FBF6EC");
    ctx.save();
    roundRect(ctx, b.x + 8, b.y, b.w - 16, b.h, 7);
    ctx.clip();
    ["#D9BC98", "#C9A37A"].forEach(function (color, k) {
      [b.x + 22 + k * 4, b.x + b.w / 2 - 2 + k * 4, b.x + b.w - 30 + k * 4].forEach(function (x) {
        ctx.fillStyle = color;
        ctx.fillRect(x, b.y, 3, b.h);
      });
    });
    // The fold.
    ctx.fillStyle = "rgba(160, 130, 100, 0.25)";
    ctx.fillRect(b.x + 8, b.y + b.h * 0.55, b.w - 16, 2);
    ctx.restore();
    ctx.strokeStyle = "#D9BC98";
    ctx.lineWidth = 1.4;
    [b.x + 8, b.x + b.w - 8].forEach(function (x, side) {
      for (var y = b.y + 5; y < b.y + b.h - 3; y += 5) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (side ? 6 : -6), y + 1);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  // A giant geode broken in half: a rough stone outside and, inside, lilac and blue crystals that twinkle.
  function drawGeode(ctx, b) {
    var cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    withShadow(ctx, function () {
      ctx.fillStyle = "#8C8277";
      ctx.beginPath();
      for (var i = 0; i < 12; i++) {
        var a = i * Math.PI / 6, r = 1 + Math.sin(i * 2.7) * 0.06;
        ctx.lineTo(cx + Math.cos(a) * b.w / 2 * r, cy + Math.sin(a) * b.h / 2 * r);
      }
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = "#CFC6BA";
    ctx.beginPath();
    ctx.ellipse(cx, cy, b.w / 2 - 6, b.h / 2 - 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4E3F66";
    ctx.beginPath();
    ctx.ellipse(cx, cy, b.w / 2 - 10, b.h / 2 - 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Crystals all around the hollow, pointing to its middle.
    var colors = ["#B98CEB", "#8FDCF7", "#D7B8F5", "#A9E7FA"];
    for (var k = 0; k < 14; k++) {
      var a = k * Math.PI * 2 / 14;
      var ox = cx + Math.cos(a) * (b.w / 2 - 11), oy = cy + Math.sin(a) * (b.h / 2 - 10);
      var tx = cx + Math.cos(a) * 5, ty = cy + Math.sin(a) * 3;
      var nx = -Math.sin(a) * 3.2, ny = Math.cos(a) * 3.2;
      ctx.fillStyle = colors[k % 4];
      ctx.beginPath();
      ctx.moveTo(ox + nx, oy + ny);
      ctx.lineTo(ox + (tx - ox) * 0.75, oy + (ty - oy) * 0.75);
      ctx.lineTo(ox - nx, oy - ny);
      ctx.closePath();
      ctx.fill();
    }
    // A few twinkles come and go.
    for (var t = 0; t < 4; t++) {
      var glow = Math.max(0, Math.sin(ovenClock * 1.7 + t * 1.9));
      if (glow <= 0.05) continue;
      var tw = { x: cx + [-10, 9, -3, 13][t], y: cy + [-4, 5, 7, -6][t] };
      ctx.fillStyle = "rgba(255, 255, 255, " + glow + ")";
      ctx.beginPath();
      ctx.moveTo(tw.x, tw.y - 4 * glow);
      ctx.lineTo(tw.x + 1, tw.y);
      ctx.lineTo(tw.x, tw.y + 4 * glow);
      ctx.lineTo(tw.x - 1, tw.y);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tw.x - 4 * glow, tw.y);
      ctx.lineTo(tw.x, tw.y + 1);
      ctx.lineTo(tw.x + 4 * glow, tw.y);
      ctx.lineTo(tw.x, tw.y - 1);
      ctx.closePath();
      ctx.fill();
    }
  }

  // At night the shell lamp and the mushroom lamp give a soft warm light.
  function drawLampLights(ctx, dark) {
    [["shellLamp", -18, "255, 222, 170", 70], ["mushroomLamp", -16, "255, 170, 140", 64]].forEach(function (l) {
      if (!isOn(l[0])) return;
      var p = layout[l[0]];
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      var g = ctx.createRadialGradient(p.x, p.y + l[1], 0, p.x, p.y + l[1], l[3]);
      g.addColorStop(0, "rgba(" + l[2] + ", " + 0.55 * dark + ")");
      g.addColorStop(1, "rgba(" + l[2] + ", 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y + l[1], l[3], 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ---------- Pizza oven ----------

  // Seconds the flames and the smoke of the pizza oven have moved; they stand still with Pausa and in Modo decorar.
  var ovenClock = 0;

  function update(dt) {
    if (!Needs.isPaused()) ovenClock += dt;
  }

  // The parts of the pizza oven, from its middle, as when it is not turned (its mouth looks down): the brick dome,
  // the mouth in front, the chimney on top and the wooden peel with a pizza at its right.
  var OVEN = { dome: { x: -14, y: -6, r: 32 }, mouth: { x: -14, y: 30 }, chimney: { x: -14, y: -22 }, peel: { x: 30, y: 18, r: 19 } };
  var BRICK = { light: "#E39478", dark: "#A94F37", line: "rgba(110, 46, 28, 0.55)" };

  // The little flames inside the mouth: they sway and flicker toward the back of the oven.
  function drawFlames(ctx, x, y, t) {
    var tongues = [[-6, 9, 1.7, "#E8562F"], [6, 8, 2.3, "#E8562F"], [0, 12, 2, "#F79A3B"], [-3, 7, 3.1, "#FFD66B"], [3, 6, 2.7, "#FFE9A8"]];
    ctx.save();
    ctx.shadowColor = "#FFB347";
    ctx.shadowBlur = 10;
    tongues.forEach(function (f, i) {
      var sway = Math.sin(t * f[2] + i * 1.3) * 1.8;
      var tall = f[1] * (0.82 + 0.18 * Math.sin(t * (f[2] + 2.2) + i));
      ctx.fillStyle = f[3];
      ctx.beginPath();
      ctx.moveTo(x + f[0] - 4, y);
      ctx.quadraticCurveTo(x + f[0] - 4, y - tall * 0.6, x + f[0] + sway, y - tall);
      ctx.quadraticCurveTo(x + f[0] + 4, y - tall * 0.6, x + f[0] + 4, y);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  // The mouth: an arch of bricks in front of the dome, dark inside, with the flames.
  function drawOvenMouth(ctx, t) {
    var mx = OVEN.mouth.x;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(mx - 10, 37);
    ctx.lineTo(mx - 10, 24);
    ctx.arc(mx, 24, 10, Math.PI, 0);
    ctx.lineTo(mx + 10, 37);
    ctx.closePath();
    ctx.fillStyle = "#2E1C14";
    ctx.fill();
    ctx.clip();
    drawFlames(ctx, mx, 37, t);
    ctx.restore();
  }

  // A round dome of terracotta bricks seen from above, with its mouth, its chimney, and the peel with a pizza beside it.
  function drawOven(ctx, t) {
    var d = OVEN.dome;
    // The entrance under the mouth, a little block of bricks coming out of the dome.
    withShadow(ctx, function () {
      fillRound(ctx, d.x - 16, 8, 32, 31, 5, C.terracotta);
    });
    ctx.strokeStyle = BRICK.line;
    ctx.lineWidth = 1.3;
    [16, 24, 32].forEach(function (y) {
      ctx.beginPath();
      ctx.moveTo(d.x - 16, y);
      ctx.lineTo(d.x + 16, y);
      ctx.stroke();
    });
    // The dome, lit from the top left.
    withShadow(ctx, function () {
      var g = ctx.createRadialGradient(d.x - 10, d.y - 12, 4, d.x, d.y, d.r);
      g.addColorStop(0, BRICK.light);
      g.addColorStop(0.55, C.terracotta);
      g.addColorStop(1, BRICK.dark);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    // Brick lines: rings around the top, and short lines between them, in turns.
    ctx.save();
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = BRICK.line;
    ctx.lineWidth = 1.4;
    var rings = [9, 17, 25, 33];
    rings.forEach(function (r, i) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.stroke();
      if (i === 0) return;
      var n = 6 + i * 4, inner = rings[i - 1];
      for (var k = 0; k < n; k++) {
        var a = (k + (i % 2) * 0.5) * Math.PI * 2 / n;
        ctx.beginPath();
        ctx.moveTo(d.x + Math.cos(a) * inner, d.y + Math.sin(a) * inner);
        ctx.lineTo(d.x + Math.cos(a) * r, d.y + Math.sin(a) * r);
        ctx.stroke();
      }
    });
    ctx.restore();
    drawOvenMouth(ctx, t);
    // The arch of bricks around the mouth.
    ctx.strokeStyle = BRICK.dark;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(OVEN.mouth.x - 11, 38);
    ctx.lineTo(OVEN.mouth.x - 11, 24);
    ctx.arc(OVEN.mouth.x, 24, 11, Math.PI, 0);
    ctx.lineTo(OVEN.mouth.x + 11, 38);
    ctx.stroke();
    // The chimney: a little square of darker bricks with its dark hole.
    var ch = OVEN.chimney;
    fillRound(ctx, ch.x - 7, ch.y - 7, 14, 14, 3, "#8E4430");
    ctx.fillStyle = "#3A2418";
    ctx.beginPath();
    ctx.arc(ch.x, ch.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    drawPeel(ctx);
  }

  // The wooden peel with a round pizza: golden dough, red sauce, cheese, little slices on top and the cuts.
  function drawPeel(ctx) {
    var p = OVEN.peel;
    withShadow(ctx, function () {
      fillRound(ctx, p.x - 3, -38, 6, 40, 3, C.wood);
      ctx.fillStyle = C.woodLight;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = C.wood;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#E9B65A";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#C8402F";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#F7E3A1";
    [[-5, -4, 4], [4, -6, 3.5], [6, 3, 4], [-3, 6, 4], [-7, 2, 3]].forEach(function (c) {
      ctx.beginPath();
      ctx.arc(p.x + c[0], p.y + c[1], c[2], 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#A63A2A";
    [[-1, -8], [7, -1], [1, 8], [-8, -1], [0, 0]].forEach(function (c) {
      ctx.beginPath();
      ctx.arc(p.x + c[0], p.y + c[1], 2.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = "rgba(122, 70, 30, 0.6)";
    ctx.lineWidth = 1;
    for (var k = 0; k < 3; k++) {
      var a = k * Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(p.x - Math.cos(a) * 15, p.y - Math.sin(a) * 15);
      ctx.lineTo(p.x + Math.cos(a) * 15, p.y + Math.sin(a) * 15);
      ctx.stroke();
    }
  }

  // Soft smoke out of the chimney: little puffs that rise up the screen, grow and fade (also when the oven is turned).
  function drawOvenSmoke(ctx) {
    var c = fromMiddle("oven", OVEN.chimney), t = ovenClock;
    ctx.save();
    for (var i = 0; i < 4; i++) {
      var k = (t * 0.32 + i / 4) % 1;
      var a = 0.55 * (1 - k) * Math.min(1, k / 0.15);
      ctx.fillStyle = "rgba(214, 208, 202, " + a + ")";
      ctx.beginPath();
      ctx.arc(c.x + Math.sin(t * 1.1 + i * 2.1) * 6 * k + k * 10, c.y - 6 - k * 70, 5 + k * 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // At night a warm halo around the mouth, and the flames again over the dark so they shine more.
  // The halo stays inside the oven's room: on its floor, not over its walls (nor through the doorways).
  function drawOvenLight(ctx, dark) {
    var t = ovenClock, m = fromMiddle("oven", OVEN.mouth), p = layout.oven;
    var flicker = 0.88 + Math.sin(t * 5.3) * 0.06 + Math.sin(t * 11.7) * 0.06;
    var half = CONFIG.wallThickness / 2;
    ctx.save();
    CONFIG.rooms.forEach(function (r) {
      if (inBox(p.x, p.y, r)) {
        ctx.beginPath();
        ctx.rect(r.x + half, r.y + half, r.w - half * 2, r.h - half * 2);
        ctx.clip();
      }
    });
    ctx.globalCompositeOperation = "lighter";
    var g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 120);
    g.addColorStop(0, "rgba(" + CONFIG.night.warmLight + ", " + 0.5 * dark * flicker + ")");
    g.addColorStop(1, "rgba(" + CONFIG.night.warmLight + ", 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawTurned(ctx, "oven", function () {
      ctx.globalAlpha = dark;
      drawOvenMouth(ctx, t);
    });
  }

  // The rug of the Sala: sage green with a cream dashed line.
  function drawRug(ctx, b) {
    fillRound(ctx, b.x, b.y, b.w, b.h, b.h / 2, C.sage);
    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 8]);
    roundRect(ctx, b.x + 10, b.y + 10, b.w - 20, b.h - 20, (b.h - 20) / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ---------- Furniture ----------
  // Each drawing gets the spot of the piece around its middle, as when it is not turned.

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

  // "f" is the screen; the wooden stand goes around it.
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
    // Backrest (when it is not turned, the sofa faces up)
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

  // ---------- The Baño ----------

  // A white bathtub on little golden legs, full of light blue water with bubbles. Not turned, the tap is on the left.
  function drawBathtub(ctx, f) {
    // Little feet peeking out at the corners
    [[f.x + 16, f.y + 6], [f.x + f.w - 16, f.y + 6], [f.x + 16, f.y + f.h - 6], [f.x + f.w - 16, f.y + f.h - 6]].forEach(function (p) {
      ctx.fillStyle = "#C9A24E";
      ctx.beginPath();
      ctx.arc(p[0] + (p[0] < f.x + f.w / 2 ? -6 : 6), p[1] + (p[1] < f.y + f.h / 2 ? -4 : 4), 6, 0, Math.PI * 2);
      ctx.fill();
    });
    withShadow(ctx, function () {
      fillRound(ctx, f.x, f.y, f.w, f.h, 36, C.white);
    });
    ctx.strokeStyle = "rgba(74, 52, 40, 0.25)";
    ctx.lineWidth = 2;
    roundRect(ctx, f.x, f.y, f.w, f.h, 36);
    ctx.stroke();
    // The water, with a soft shine
    fillRound(ctx, f.x + 11, f.y + 10, f.w - 22, f.h - 20, 28, C.water);
    fillRound(ctx, f.x + 16, f.y + 14, f.w - 32, f.h - 30, 22, C.waterLight);
    // The tap
    fillRound(ctx, f.x + 4, f.y + f.h / 2 - 7, 16, 14, 5, "#9AA6A8");
    ctx.fillStyle = "#C8D2D4";
    ctx.beginPath();
    ctx.arc(f.x + 10, f.y + f.h / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // A big puff of foam at the far end and little ones along the sides
    var foam = [[f.x + f.w - 40, f.y + 24, 12], [f.x + f.w - 30, f.y + 40, 14], [f.x + f.w - 42, f.y + 54, 11],
      [f.x + f.w - 56, f.y + 38, 10], [f.x + f.w - 24, f.y + 58, 8], [f.x + f.w - 26, f.y + 22, 8],
      [f.x + 40, f.y + 16, 6], [f.x + 58, f.y + f.h - 16, 6], [f.x + 84, f.y + 15, 5]];
    ctx.fillStyle = C.white;
    foam.forEach(function (b) {
      ctx.beginPath();
      ctx.arc(b[0], b[1], b[2], 0, Math.PI * 2);
      ctx.fill();
    });
    // Little bubbles on the water
    [[f.x + 70, f.y + 34, 4], [f.x + 50, f.y + 48, 3], [f.x + 88, f.y + 52, 3.5], [f.x + 100, f.y + 28, 2.5]].forEach(function (b) {
      ctx.fillStyle = "rgba(255, 253, 248, 0.5)";
      ctx.strokeStyle = C.white;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(b[0], b[1], b[2], 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  // A sink on a little wooden cabinet, with a round mirror on the wall behind it and a cup with two toothbrushes.
  // Not turned, the wall is above it.
  function drawSink(ctx, f) {
    var cx = f.x + f.w / 2;
    // The mirror, framed in wood
    ctx.fillStyle = C.wood;
    ctx.beginPath();
    ctx.ellipse(cx, f.y + 8, 26, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#DCEFF5";
    ctx.beginPath();
    ctx.ellipse(cx, f.y + 8, 21, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    strokePath(ctx, C.white, 2, [[cx - 12, f.y + 7], [cx - 4, f.y + 4]]);
    // The cabinet top and the basin
    withShadow(ctx, function () {
      fillRound(ctx, f.x, f.y + 14, f.w, f.h - 14, 10, C.woodLight);
    });
    fillRound(ctx, f.x + 3, f.y + 17, f.w - 6, f.h - 20, 8, C.cream);
    ctx.fillStyle = C.white;
    ctx.beginPath();
    ctx.ellipse(cx - 6, f.y + 36, 22, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(74, 52, 40, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#DCEFF5";
    ctx.beginPath();
    ctx.ellipse(cx - 6, f.y + 37, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9AA6A8";
    ctx.beginPath();
    ctx.arc(cx - 6, f.y + 38, 2, 0, Math.PI * 2);
    ctx.fill();
    // The tap
    fillRound(ctx, cx - 9, f.y + 16, 6, 12, 3, "#9AA6A8");
    // The cup with a pink and a blue toothbrush
    strokePath(ctx, "#E795AE", 2.5, [[f.x + f.w - 15, f.y + 30], [f.x + f.w - 18, f.y + 13]]);
    strokePath(ctx, "#7DB9D6", 2.5, [[f.x + f.w - 12, f.y + 30], [f.x + f.w - 8, f.y + 14]]);
    ctx.fillStyle = C.terracotta;
    ctx.beginPath();
    ctx.arc(f.x + f.w - 13, f.y + 32, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#D98168";
    ctx.beginPath();
    ctx.arc(f.x + f.w - 13, f.y + 32, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // A white toilet seen from above: the seat around the water and the tank against the wall (below it, when not turned).
  function drawToilet(ctx, f) {
    var cx = f.x + f.w / 2;
    withShadow(ctx, function () {
      fillRound(ctx, f.x + 2, f.y + f.h - 20, f.w - 4, 20, 6, C.white);
      ctx.beginPath();
      ctx.ellipse(cx, f.y + 24, 21, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = "rgba(74, 52, 40, 0.25)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, f.x + 2, f.y + f.h - 20, f.w - 4, 20, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, f.y + 24, 21, 24, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#CFE8EF";
    ctx.beginPath();
    ctx.ellipse(cx, f.y + 22, 12, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    // The flush button
    ctx.fillStyle = "#9AA6A8";
    ctx.beginPath();
    ctx.arc(cx, f.y + f.h - 10, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // A little plant in a terracotta pot, with round leaves. Turned to a side, the leaves lean the other way.
  function drawPlant(ctx, b, dir) {
    var cx = b.x + b.w / 2, base = b.y + b.h - 2;
    ctx.save();
    ctx.fillStyle = "rgba(74, 52, 40, 0.22)";
    ctx.beginPath();
    ctx.ellipse(cx, base, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(cx, base);
    ctx.scale(dir % 2 === 1 ? -1 : 1, 1);
    // Leaves: dark ones behind, light ones in front
    [[-12, -40, 9, -0.6, C.cityGrassDark], [12, -42, 9, 0.6, C.cityGrassDark], [0, -52, 9, 0, C.cityGrassDark],
      [-7, -34, 8, -0.4, C.sage], [8, -36, 8, 0.5, C.sage], [-1, -44, 7, 0.1, "#A9BFA4"]].forEach(function (l) {
      ctx.save();
      ctx.translate(l[0], l[1]);
      ctx.rotate(l[3]);
      ctx.fillStyle = l[4];
      ctx.beginPath();
      ctx.ellipse(0, 0, l[2] * 0.7, l[2], 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    // The pot
    withShadow(ctx, function () {
      ctx.fillStyle = C.terracotta;
      ctx.beginPath();
      ctx.moveTo(-13, -24);
      ctx.lineTo(13, -24);
      ctx.lineTo(9, 0);
      ctx.lineTo(-9, 0);
      ctx.closePath();
      ctx.fill();
    });
    fillRound(ctx, -15, -28, 30, 7, 3, "#D98168");
    ctx.restore();
  }

  // The foam around the neck of who bathes ("x", "y" is the water line) and bubbles that rise and pop.
  // "t" is how long it has been bathing, so everything stands still with Pausa.
  // Characters are drawn after the night tint, so here the foam gets the tint again by itself.
  function drawBathFoam(ctx, x, y, t) {
    var puffs = [[-22, 2, 8], [-13, -1, 9], [-3, 3, 9], [8, 0, 9], [18, 3, 8], [27, 0, 6], [-29, -2, 5], [-8, 8, 6], [12, 8, 6]];
    ctx.save();
    ctx.beginPath();
    puffs.forEach(function (p) {
      ctx.moveTo(x + p[0] + p[2], y + p[1]);
      ctx.arc(x + p[0], y + p[1], p[2], 0, Math.PI * 2);
    });
    ctx.fillStyle = C.white;
    ctx.fill();
    var dark = Time.darkness();
    if (dark > 0) {
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = dark;
      ctx.fillStyle = CONFIG.night.tint;
      ctx.fill();
    }
    ctx.restore();
    // Bubbles: each one rises, grows a little and pops in a tiny star of lines.
    for (var i = 0; i < 6; i++) {
      var k = (t * 0.55 + i / 6) % 1;
      var bx = x - 26 + i * 10 + Math.sin(t * 2.4 + i * 1.7) * 5, by = y - 4 - k * 70;
      ctx.save();
      if (k < 0.85) {
        var r = 3 + k * 4;
        ctx.globalAlpha = Math.min(1, k / 0.1);
        ctx.fillStyle = "rgba(181, 220, 236, 0.45)";
        ctx.strokeStyle = C.white;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = C.white;
        ctx.beginPath();
        ctx.arc(bx - r * 0.35, by - r * 0.35, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else {
        var pop = (k - 0.85) / 0.15;
        ctx.globalAlpha = 1 - pop;
        ctx.strokeStyle = C.white;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (var a = 0; a < 6; a++) {
          var ang = a * Math.PI / 3;
          ctx.moveTo(bx + Math.cos(ang) * (4 + pop * 3), by + Math.sin(ang) * (4 + pop * 3));
          ctx.lineTo(bx + Math.cos(ang) * (7 + pop * 5), by + Math.sin(ang) * (7 + pop * 5));
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Draw a floor thing turned the way it is, with a drawing made around its middle.
  function drawTurned(ctx, id, fn) {
    var p = layout[id], d = DEFS[id];
    ctx.save();
    ctx.translate(p.x, p.y);
    if (!d.upright) ctx.rotate(p.dir * Math.PI / 2);
    fn({ x: -d.w / 2, y: -d.h / 2, w: d.w, h: d.h });
    ctx.restore();
  }

  // The backrest again, over someone sitting on the Sofá from behind, so they look sunk into it.
  // Characters are drawn after the night tint, so here the backrest gets the tint again by itself.
  function drawSofaBackrest(ctx) {
    drawTurned(ctx, "sofa", function (f) {
      drawBackrest(ctx, f);
      var dark = Time.darkness();
      if (dark <= 0) return;
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = dark;
      roundRect(ctx, f.x + 6, f.y + f.h - 30, f.w - 12, 24, 12);
      ctx.fillStyle = CONFIG.night.tint;
      ctx.fill();
    });
  }

  var DRAWERS = {
    fridge: drawFridge,
    stove: drawStove,
    bed: drawBed,
    sofa: drawSofa,
    bathtub: drawBathtub,
    sink: drawSink,
    tv: function (ctx, b) { drawTv(ctx, { x: b.x + 30, y: b.y + 6, w: b.w - 60, h: b.h - 22 }); }
  };

  // Area a piece of furniture covers on the floor, including the TV stand.
  function bounds(f) {
    return boxOf(f.id);
  }

  // Soft glow around a box: the piece under the mouse, or in Modo decorar (js/decorate.js) the thing under the mouse
  // (in "color"), the one picked and the one being dragged.
  function drawGlow(ctx, b, color, fill) {
    ctx.save();
    ctx.shadowColor = color === C.sage ? C.cream : color;
    ctx.shadowBlur = 18;
    roundRect(ctx, b.x - 6, b.y - 6, b.w + 12, b.h + 12, 20);
    ctx.fillStyle = fill || "rgba(245, 235, 221, 0.3)";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  }

  // Where each furniture name tag goes: as the piece is turned; below it when it is turned to a side.
  // The Cama keeps its name on the blanket.
  function labelPosition(id) {
    var p = layout[id];
    if (p.dir % 2 === 1 && id !== "bed") {
      var b = boxOf(id);
      return { x: p.x, y: b.y + b.h + 24 };
    }
    return fromMiddle(id, id === "bed" && p.dir % 2 === 1 ? { x: 0, y: 70 } : DEFS[id].label);
  }

  // ---------- Main draw ----------

  function draw(ctx, highlightId) {
    var W = CONFIG.houseWorld.width, H = CONFIG.houseWorld.height;

    // Garden around the house
    fillRound(ctx, 0, 0, W, H, 40, C.grass);

    CONFIG.rooms.forEach(function (room) { drawFloor(ctx, room); });

    drawTurned(ctx, "rug", function (b) { drawRug(ctx, b); });
    if (isOn("woolBlanket")) drawTurned(ctx, "woolBlanket", function (b) { drawWoolBlanket(ctx, b); });

    drawWalls(ctx);
    // Rain, fog or snow seen through the windows (js/weather.js).
    Weather.drawWindows(ctx);
    drawPoster(ctx);
    if (isOn("bunting")) drawBunting(ctx);
    drawShelf(ctx);
    drawTowels(ctx);
    if (isOn("pressedFlowers")) drawOnWall(ctx, "pressedFlowers", function (b) { drawPressedFlowers(ctx, b); });
    if (isOn("wallClock")) drawOnWall(ctx, "wallClock", function (b) { drawWallClock(ctx, b); });

    CONFIG.furniture.forEach(function (f) {
      drawTurned(ctx, f.id, function (b) { DRAWERS[f.id](ctx, b); });
      if (f.id === highlightId) drawGlow(ctx, boxOf(f.id), C.sage);
    });
    drawTurned(ctx, "toilet", function (b) { drawToilet(ctx, b); });
    drawTurned(ctx, "plant", function (b) { drawPlant(ctx, b, layout.plant.dir); });
    if (isOn("vase")) drawTurned(ctx, "vase", function (b) { drawVase(ctx, b, layout.vase.dir); });
    drawTurned(ctx, "easel", function (b) { drawEasel(ctx, b, layout.easel.dir); });
    drawTurned(ctx, "oven", function () { drawOven(ctx, ovenClock); });
    if (isOn("geode")) drawTurned(ctx, "geode", function (b) { drawGeode(ctx, b); });
    if (isOn("shellLamp")) drawTurned(ctx, "shellLamp", function (b) { drawShellLamp(ctx, b); });
    if (isOn("mushroomLamp")) drawTurned(ctx, "mushroomLamp", function (b) { drawMushroomLamp(ctx, b); });
    drawOvenSmoke(ctx);
  }

  // Room and furniture names, drawn over the night tint so they always read well.
  function drawLabels(ctx) {
    // Room names
    var roomLabels = {
      kitchen: { x: 250, y: 260 },
      bedroom: { x: 570, y: 250 },
      living: { x: 190, y: 600 },
      bathroom: { x: 1086, y: 560 }
    };
    CONFIG.rooms.forEach(function (room) {
      var p = roomLabels[room.id];
      label(ctx, room.name, p.x, p.y, 30, C.darkBrown, C.cream);
    });

    // Furniture names
    CONFIG.furniture.forEach(function (f) {
      var p = labelPosition(f.id);
      label(ctx, f.name, p.x, p.y, 18, C.cream, C.darkBrown);
    });
  }

  // Drawn over the darkened house: the warm glow of the pizza oven and of the shell and mushroom lamps, and a soft light
  // from the TV screen while someone is watching it. "dark" goes from 0 (day) to 1 (night).
  function drawNightLights(ctx, time, dark) {
    drawOvenLight(ctx, dark);
    drawLampLights(ctx, dark);
    if (!Objects.isWatchingTv()) return;
    // The light flickers a tiny bit, like a show is on.
    var flicker = 0.9 + Math.sin(time * 4.1) * 0.05 + Math.sin(time * 9.7) * 0.05;
    drawTurned(ctx, "tv", function () {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.translate(0, -2);
      ctx.scale(1.6, 1);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, 130);
      g.addColorStop(0, "rgba(181, 220, 236, " + 0.4 * dark * flicker + ")");
      g.addColorStop(1, "rgba(181, 220, 236, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = dark;
      fillRound(ctx, -92, -4, 184, 4, 2, C.waterLight);
    });
  }

  // The front door: the welcome mat and the doorway above it. Tapping it takes a character outside.
  function doorAt(x, y) {
    var d = CONFIG.frontDoor.tap;
    return x >= d.x && x <= d.x + d.w && y >= d.y && y <= d.y + d.h;
  }

  // A smaller spot of a floor thing ("parts" in DEFS), turned with it.
  function partBox(id, part) {
    var a = fromMiddle(id, { x: part.x, y: part.y }), b = fromMiddle(id, { x: part.x + part.w, y: part.y + part.h });
    return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y) };
  }

  // The id of the word for what is at a spot: a decoration, a piece of furniture (or a part of it, like the mirror),
  // the rug, the front door or a room, or null.
  function wordAt(x, y) {
    if (inBox(x, y, boxOf("easel"))) return "easel";
    if (isOn("vase") && inBox(x, y, boxOf("vase"))) return "vase";
    if (isOn("bunting") && inBox(x, y, boxOf("bunting"))) return "bunting";
    for (var t = TREASURES.length - 1; t >= 0; t--) {
      var mine = TREASURES[t];
      if (DEFS[mine].kind !== "rug" && isOn(mine) && inBox(x, y, boxOf(mine))) return WORD_OF[mine] || mine;
    }
    var deco = ["oven", "shelf", "towels", "plant", "toilet"];
    for (var d = 0; d < deco.length; d++) {
      if (inBox(x, y, boxOf(deco[d]))) return WORD_OF[deco[d]] || deco[d];
    }
    for (var i = CONFIG.furniture.length - 1; i >= 0; i--) {
      var id = CONFIG.furniture[i].id;
      if (!inBox(x, y, boxOf(id))) continue;
      var parts = DEFS[id].parts || {};
      for (var name in parts) {
        if (inBox(x, y, partBox(id, parts[name]))) return name;
      }
      return id;
    }
    if (isOn("woolBlanket") && inBox(x, y, boxOf("woolBlanket"))) return "woolBlanket";
    if (inBox(x, y, boxOf("rug"))) return "rug";
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

  // The room kept around a floor thing, where feet do not go.
  function keepClear(b) {
    return { x: b.x - CLEAR.side, y: b.y - CLEAR.top, w: b.w + CLEAR.side * 2, h: b.h + CLEAR.top + CLEAR.bottom };
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

  // Where feet may go in each room and through each doorway (these never move).
  var WALK = CONFIG.rooms.map(function (r) {
    var m = CONFIG.walkMargin;
    return { x: r.x + m.side, y: r.y + m.top, w: r.w - m.side * 2, h: r.h - m.top - m.bottom };
  }).concat(CONFIG.doorways.map(doorPassage));

  // The boxes feet do not go into, worked out again after something moves, or the vase or a decoration of a chest arrives.
  var solid = null;

  function solidBoxes() {
    var here = present();
    var key = here.join(",");
    if (!solid || solid.key !== key) {
      solid = { key: key, boxes: here.filter(function (id) { return DEFS[id].kind === "floor"; }).map(function (id) {
        return keepClear(feetOf(id));
      }) };
    }
    return solid.boxes;
  }

  // True if a character cannot stand here: outside the rooms (walls are only crossed at the doorways),
  // on a piece of furniture, the easel, the vase, the lamps or the geode. Used by js/path.js.
  function isSolid(x, y) {
    if (!WALK.some(function (b) { return inBox(x, y, b); })) return true;
    return solidBoxes().some(function (b) { return inBox(x, y, b); });
  }

  // ---------- Modo decorar ----------

  function overlap(a, b) {
    return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  }

  function grow(b, by) {
    return { x: b.x - by, y: b.y - by, w: b.w + by * 2, h: b.h + by * 2 };
  }

  // The thing that can be moved at a spot, the one on top first, or null.
  function movableAt(x, y) {
    var list = present();
    for (var i = list.length - 1; i >= 0; i--) {
      if (inBox(x, y, boxOf(list[i]))) return list[i];
    }
    return null;
  }

  // Move a thing to follow the finger: on the floor its middle goes there; on a wall it slides to the closest spot
  // of the closest wall (it never leaves the walls).
  function dragTo(id, x, y) {
    var d = DEFS[id];
    solid = null;
    if (d.kind !== "wall") {
      layout[id].x = Math.round(x);
      layout[id].y = Math.round(y);
      return;
    }
    var best = null, bestD = Infinity;
    TRACKS.forEach(function (t) {
      var lo = t.from + 10 + d.length / 2, hi = t.to - 10 - d.length / 2;
      if (lo > hi) return;
      var along = Math.round(Math.max(lo, Math.min(hi, isUpright(t.side) ? y : x)));
      var spot = { side: t.side, line: t.line, along: along };
      var b = wallBox(spot, d);
      var dx = b.x + b.w / 2 - x, dy = b.y + b.h / 2 - y;
      if (dx * dx + dy * dy < bestD) {
        bestD = dx * dx + dy * dy;
        best = spot;
      }
    });
    if (best) layout[id] = best;
  }

  function canTurn(id) {
    return DEFS[id].kind !== "wall";
  }

  // A quarter turn more (it does not check if it fits).
  function turn(id) {
    layout[id].dir = (layout[id].dir + 1) % 4;
    solid = null;
  }

  function getPos(id) {
    var p = layout[id], out = {};
    Object.keys(p).forEach(function (k) { out[k] = p[k]; });
    return out;
  }

  function setPos(id, pos) {
    layout[id] = pos;
    solid = null;
  }

  // True if a floor thing is all inside one room, off the other things (furniture can stand on the rug),
  // and leaves the doorways and the front door free.
  function fitsFloor(id) {
    var d = DEFS[id], b = boxOf(id);
    var inRoom = CONFIG.rooms.some(function (r) {
      return b.x >= r.x + 8 && b.y >= r.y + 8 && b.x + b.w <= r.x + r.w - 8 && b.y + b.h <= r.y + r.h - 8;
    });
    if (!inRoom) return false;
    var hits = present().some(function (other) {
      if (other === id) return false;
      var k = DEFS[other].kind;
      if (d.kind === "rug" ? k === "floor" : k === "rug") return false;
      return overlap(b, boxOf(other));
    });
    if (hits) return false;
    var keep = d.kind === "rug" ? b : keepClear(feetOf(id));
    return !overlap(keep, FRONT_DOOR) && !CONFIG.doorways.some(function (dw) { return overlap(keep, doorPassage(dw)); });
  }

  // True if a wall thing hangs on a wall, all of it, off the doorways and off the other things.
  function fitsWall(id) {
    var p = layout[id], d = DEFS[id];
    var a = p.along - d.length / 2, z = p.along + d.length / 2;
    var onWall = TRACKS.some(function (t) {
      return t.side === p.side && t.line === p.line && a >= t.from + 10 && z <= t.to - 10;
    });
    if (!onWall) return false;
    var up = isUpright(p.side);
    if (GAPS.some(function (g) { return g.upright === up && g.line === p.line && a < g.to + 6 && z > g.from - 6; })) return false;
    var b = boxOf(id);
    return !present().some(function (other) { return other !== id && overlap(b, boxOf(other)); });
  }

  // True if from the front door a character can walk to every room and to every piece of furniture
  // (to the spot where it uses it; to the easel and the vase, close to them).
  function allReachable() {
    var door = CONFIG.frontDoor.inside;
    var reach = Path.reach("house", door.x, door.y);
    if (!reach.at(door.x, door.y)) return false;
    if (!CONFIG.rooms.every(function (r) { return reach.any(r); })) return false;
    return present().every(function (id) {
      var d = DEFS[id];
      if (d.kind !== "floor") return true;
      if (d.use) {
        var s = useSpot(id);
        return !!s && reach.at(s.x, s.y);
      }
      return reach.any(grow(keepClear(feetOf(id)), 40));
    });
  }

  // True if a thing is in a good spot where it is now (green); false if not (red).
  function fits(id) {
    Path.reset();
    var d = DEFS[id];
    if (d.kind === "wall") return fitsWall(id);
    if (!fitsFloor(id)) return false;
    return d.kind === "rug" || allReachable();
  }

  // When the vase or the bunting arrives (its goal is met) and something was moved to its spot,
  // it goes to the closest good spot instead. A decoration of a chest arrives at its spot in the Sala, or else at a free
  // spot of the Sala, or else at the closest free spot of another room, and is remembered there for "Como al principio".
  // True if one arrived, so whoever stands there steps aside.
  var wasOn = {};

  function settle() {
    var arrived = false;
    ["vase", "bunting"].concat(TREASURES).forEach(function (id) {
      var on = isOn(id);
      if (on && wasOn[id] === false) {
        arrived = true;
        if (DEFS[id].treasure) {
          setPos(id, firstSpot(id));
          if (!fits(id)) findSpot(id, "living");
          appeared[id] = getPos(id);
        } else if (!fits(id)) {
          findSpot(id);
        }
        Path.reset();
      }
      wasOn[id] = on;
    });
    return arrived;
  }

  // The room a spot of a thing is in (for a wall thing, the room its wall faces), or null.
  function roomOfSpot(id, s) {
    if (DEFS[id].kind === "wall") {
      var track = TRACKS.filter(function (t) {
        return t.side === s.side && t.line === s.line && s.along >= t.from && s.along <= t.to;
      })[0];
      return track ? track.room : null;
    }
    var r = CONFIG.rooms.filter(function (room) {
      return s.x >= room.x && s.x <= room.x + room.w && s.y >= room.y && s.y <= room.y + room.h;
    })[0];
    return r ? r.id : null;
  }

  // Move a thing to the closest spot where it fits; with "prefer" (a room), any spot of that room comes first.
  function findSpot(id, prefer) {
    var d = DEFS[id], keep = getPos(id), spots = [];
    if (d.kind === "wall") {
      TRACKS.forEach(function (t) {
        for (var along = t.from; along <= t.to; along += 10) spots.push({ side: t.side, line: t.line, along: along });
      });
    } else {
      for (var y = 0; y <= CONFIG.houseWorld.height; y += 10) {
        for (var x = 0; x <= CONFIG.houseWorld.width; x += 10) spots.push({ x: x, y: y, dir: keep.dir });
      }
    }
    var from = boxOf(id), mx = from.x + from.w / 2, my = from.y + from.h / 2;
    function away(s) {
      setPos(id, s);
      var b = boxOf(id), dx = b.x + b.w / 2 - mx, dy = b.y + b.h / 2 - my;
      return dx * dx + dy * dy;
    }
    spots.forEach(function (s) {
      s.away = away(s) + (prefer && roomOfSpot(id, s) !== prefer ? 1e9 : 0);
    });
    spots.sort(function (a, b) { return a.away - b.away; });
    for (var i = 0; i < spots.length; i++) {
      var s = spots[i];
      delete s.away;
      setPos(id, s);
      if (d.kind === "wall" ? fitsWall(id) : fitsFloor(id) && allReachable()) {
        Path.reset();
        return;
      }
    }
    setPos(id, keep);
    Path.reset();
  }

  // ---------- Saving ----------

  function getLayout() {
    var out = {};
    ORDER.forEach(function (id) { out[id] = getPos(id); });
    out.appeared = {};
    Object.keys(appeared).forEach(function (id) { out.appeared[id] = copyPos(appeared[id]); });
    return out;
  }

  // Used when loading a saved game. Anything missing or strange stays in its first spot.
  function setLayout(saved) {
    if (!saved || typeof saved !== "object") return;
    solid = null;
    // Where the decorations of the chests showed up (an old saved game has none).
    var first = saved.appeared && typeof saved.appeared === "object" ? saved.appeared : {};
    TREASURES.forEach(function (id) {
      var s = first[id];
      if (!s || typeof s !== "object") return;
      if (DEFS[id].kind === "wall") {
        var known = TRACKS.some(function (t) { return t.side === s.side && t.line === s.line; });
        if (known && isNumber(s.along)) appeared[id] = { side: s.side, line: s.line, along: s.along };
      } else if (isNumber(s.x) && isNumber(s.y) && [0, 1, 2, 3].indexOf(s.dir) >= 0) {
        appeared[id] = { x: s.x, y: s.y, dir: s.dir };
      }
    });
    ORDER.forEach(function (id) {
      var s = saved[id], d = DEFS[id];
      if (!s || typeof s !== "object" || !isNumber(s.along !== undefined ? s.along : s.x)) return;
      if (d.kind === "wall") {
        var known = TRACKS.some(function (t) { return t.side === s.side && t.line === s.line; });
        if (known) layout[id] = { side: s.side, line: s.line, along: s.along };
        return;
      }
      if (!isNumber(s.y) || [0, 1, 2, 3].indexOf(s.dir) < 0) return;
      layout[id] = { x: s.x, y: s.y, dir: s.dir };
      var b = boxOf(id);
      var inRoom = CONFIG.rooms.some(function (r) {
        return b.x >= r.x && b.y >= r.y && b.x + b.w <= r.x + r.w && b.y + b.h <= r.y + r.h;
      });
      if (!inRoom) layout[id] = { x: d.start.x, y: d.start.y, dir: 0 };
    });
    // A game saved before the pizza oven has it in its first spot: if something was moved there, it goes to the closest
    // free spot instead (before the rest is checked, so what was moved there stays).
    Path.reset();
    if (!fitsFloor("oven") || !allReachable()) findSpot("oven");
    // A game saved before the Baño: anything left in front of its door (or on a wall where the door is now) goes back
    // to its first spot, and if a room or a piece of furniture still cannot be reached, everything does.
    ORDER.forEach(function (id) {
      if (DEFS[id].kind === "rug") return;
      if (DEFS[id].kind === "wall" ? !fitsWall(id) : !fitsFloor(id)) {
        var s = DEFS[id].start;
        setPos(id, DEFS[id].kind === "wall" ? { side: s.side, line: s.line, along: s.along } : { x: s.x, y: s.y, dir: 0 });
      }
    });
    if (!allReachable()) resetLayout();
    Path.reset();
  }

  function isNumber(v) {
    return typeof v === "number" && isFinite(v);
  }

  return {
    update: update,
    draw: draw,
    drawLabels: drawLabels,
    drawNightLights: drawNightLights,
    drawSofaBackrest: drawSofaBackrest,
    drawBathFoam: drawBathFoam,
    bathDeep: BATH_DEEP,
    drawGlow: drawGlow,
    bounds: bounds,
    doorAt: doorAt,
    wordAt: wordAt,
    isSolid: isSolid,
    useSpot: useSpot,
    floorSeat: floorSeat,
    sofaFacesTv: sofaFacesTv,
    poseFor: poseFor,
    lookFor: lookFor,
    // Modo decorar
    movableAt: movableAt,
    boxOf: boxOf,
    dragTo: dragTo,
    canTurn: canTurn,
    turn: turn,
    getPos: getPos,
    setPos: setPos,
    fits: fits,
    settle: settle,
    // "Como al principio": every thing to its first spot, and each decoration of a chest to where it showed up
    // (if something else is back there now, to the closest free spot, the Sala first).
    resetLayout: function () {
      resetLayout();
      Path.reset();
      TREASURES.forEach(function (id) {
        if (isOn(id) && !fits(id)) findSpot(id, "living");
      });
      Path.reset();
    },
    getLayout: getLayout,
    setLayout: setLayout
  };
})();
