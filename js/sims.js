// The characters living in the house: drawing, selection and walking.
var Sims = (function () {
  var C = CONFIG.colors;
  var sims = [];
  var selected = null;
  var onSelect = function () {};

  function init(selectCallback) {
    onSelect = selectCallback || onSelect;
    sims = CHARACTERS.map(function (data) {
      var look = CONFIG.characterLooks[data.id];
      return {
        data: data,
        look: look,
        x: look.start.x,
        y: look.start.y,
        path: [],
        stepPhase: 0
      };
    });
  }

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

  function ellipse(ctx, x, y, rx, ry, color) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  // ---------- Body parts (origin at the feet, up is negative y) ----------

  function drawLegs(ctx, look, step) {
    var lift = Math.sin(step) * 2.5;
    fillRound(ctx, -9, -16, 7, 14 - lift, 3, look.pants);
    fillRound(ctx, 2, -16, 7, 14 + lift, 3, look.pants);
    ellipse(ctx, -5.5, -2 - lift, 5.5, 3.5, look.shoes);
    ellipse(ctx, 5.5, -2 + lift, 5.5, 3.5, look.shoes);
  }

  function drawArms(ctx, look, step) {
    var swing = Math.sin(step) * 2;
    [-1, 1].forEach(function (side) {
      var x = side < 0 ? -18 : 12;
      var dy = side * swing;
      fillRound(ctx, x, -37 + dy, 6, 16, 3, look.skin);
      fillRound(ctx, x, -37 + dy, 6, 7, 3, look.shirt);
      circle(ctx, x + 3, -20 + dy, 3.2, look.skin);
    });
    return swing;
  }

  function drawTorso(ctx, look) {
    fillRound(ctx, -12, -40, 24, 28, 8, look.shirt);
  }

  function drawHead(ctx, look) {
    circle(ctx, 0, -54, 16, look.skin);
  }

  function drawEyes(ctx, look, y) {
    circle(ctx, -5.5, y, 2.2, look.eyes);
    circle(ctx, 5.5, y, 2.2, look.eyes);
    circle(ctx, -4.8, y - 0.8, 0.8, C.white);
    circle(ctx, 6.2, y - 0.8, 0.8, C.white);
  }

  function drawRealFixer(ctx, look, step) {
    drawLegs(ctx, look, step);
    var swing = drawArms(ctx, look, step);
    drawTorso(ctx, look);

    // Collar
    ctx.fillStyle = look.collar;
    ctx.beginPath();
    ctx.moveTo(-7, -40); ctx.lineTo(0, -35); ctx.lineTo(-2, -32); ctx.lineTo(-9, -38);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7, -40); ctx.lineTo(0, -35); ctx.lineTo(2, -32); ctx.lineTo(9, -38);
    ctx.closePath(); ctx.fill();

    // Fanny pack in front, with its strap
    ctx.strokeStyle = "#4A4A4A";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-12, -19); ctx.lineTo(12, -19);
    ctx.stroke();
    fillRound(ctx, -8, -23, 16, 9, 4, look.pack);
    ctx.strokeStyle = "#6B6B6B";
    ctx.lineWidth = 1;
    roundRect(ctx, -8, -23, 16, 9, 4);
    ctx.stroke();
    circle(ctx, 5, -19, 1.2, look.gold);

    // Gold watch on the left wrist, gold ring on the right hand
    fillRound(ctx, -18.5, -25 - swing, 7, 3.2, 1.2, look.gold);
    circle(ctx, 15, -19 + swing, 1.3, look.gold);

    drawHead(ctx, look);

    // Short dark hair peeking out under the cap
    fillRound(ctx, -16.5, -58, 5, 10, 2, look.hair);
    fillRound(ctx, 11.5, -58, 5, 10, 2, look.hair);

    drawEyes(ctx, look, -49);

    // Full dark beard with gray hairs
    ctx.fillStyle = look.beard;
    ctx.beginPath();
    ctx.moveTo(-16, -53);
    ctx.quadraticCurveTo(-16, -34, 0, -32);
    ctx.quadraticCurveTo(16, -34, 16, -53);
    ctx.lineTo(12, -51);
    ctx.quadraticCurveTo(10, -43, 0, -43);
    ctx.quadraticCurveTo(-10, -43, -12, -51);
    ctx.closePath();
    ctx.fill();
    [[-10, -42], [-6, -37], [3, -35], [9, -40], [12, -46], [-13, -47], [-1, -38]].forEach(function (p) {
      circle(ctx, p[0], p[1], 1, look.beardGray);
    });
    // Mouth
    ctx.strokeStyle = "#C98A7A";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, -42, 3, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Navy cap with its brim toward the front
    ctx.fillStyle = look.cap;
    ctx.beginPath();
    ctx.arc(0, -56, 17, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ellipse(ctx, 0, -55, 15, 4.5, look.capBrim);
    circle(ctx, 0, -72, 2, look.capBrim);
  }

  function drawSofia(ctx, look, step) {
    // Long brown hair falling down her back
    fillRound(ctx, -20, -68, 40, 46, 16, look.hair);

    drawLegs(ctx, look, step);
    drawArms(ctx, look, step);
    drawTorso(ctx, look);

    // Gold necklace with a little bead
    ctx.strokeStyle = look.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -40, 6, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    circle(ctx, 0, -33.5, 2, look.gold);

    drawHead(ctx, look);

    // Locks of hair over the shoulders
    fillRound(ctx, -19, -58, 8, 32, 4, look.hair);
    fillRound(ctx, 11, -58, 8, 32, 4, look.hair);

    // Side-swept bangs
    ctx.fillStyle = look.hair;
    ctx.beginPath();
    ctx.arc(0, -55, 17, Math.PI, 0);
    ctx.lineTo(17, -51);
    ctx.quadraticCurveTo(7, -62, -1, -55);
    ctx.quadraticCurveTo(-9, -60, -17, -49);
    ctx.closePath();
    ctx.fill();

    drawEyes(ctx, look, -48);
    circle(ctx, -9.5, -44, 3, look.cheeks);
    circle(ctx, 9.5, -44, 3, look.cheeks);
    // Smile
    ctx.strokeStyle = "#B0566A";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, -44, 3.5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }

  var bodies = { realfixer: drawRealFixer, sofia: drawSofia };

  // ---------- Selection glow and name tag ----------

  function drawGlow(ctx, sim, time) {
    var pulse = (1 + Math.sin(time * 4) * 0.08) * CONFIG.characterScale;
    ctx.save();
    ctx.shadowColor = CONFIG.glow;
    ctx.shadowBlur = 16;
    ellipse(ctx, sim.x, sim.y, 26 * pulse, 10 * pulse, "rgba(255, 214, 107, 0.45)");
    ctx.strokeStyle = CONFIG.glow;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  function drawNameTag(ctx, sim) {
    var isSelected = sim === selected;
    var size = 15;
    ctx.save();
    ctx.font = "700 " + size + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var w = ctx.measureText(sim.data.name).width + size * 1.2;
    var h = size * 1.6;
    var cy = sim.y + 24;
    ctx.shadowColor = "rgba(74, 52, 40, 0.25)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    fillRound(ctx, sim.x - w / 2, cy - h / 2, w, h, h / 2, isSelected ? C.terracotta : C.cream);
    ctx.shadowColor = "transparent";
    ctx.fillStyle = isSelected ? C.cream : C.darkBrown;
    ctx.fillText(sim.data.name, sim.x, cy + 1);
    ctx.restore();
  }

  // ---------- Thought bubble for needs in red ----------

  function drawThoughtBubble(ctx, sim, time) {
    var low = Needs.lowNeeds(sim.data.id);
    if (low.length === 0) return;
    var text = low.map(function (need) { return need.emoji; }).join(" ");
    var bob = Math.sin(time * 2.5) * 2;
    var headTop = sim.y - 78 * CONFIG.characterScale;
    var cx = sim.x + 30, cy = headTop - 24 + bob;

    ctx.save();
    ctx.font = "22px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var w = ctx.measureText(text).width + 22;
    var h = 36;
    ctx.shadowColor = "rgba(74, 52, 40, 0.25)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = 2.5;
    // Two little puffs leading from the head to the bubble
    [[sim.x + 10, headTop + 8 + bob / 2, 4], [sim.x + 18, headTop - 2 + bob, 6]].forEach(function (p) {
      circle(ctx, p[0], p[1], p[2], C.white);
      ctx.stroke();
    });
    fillRound(ctx, cx - w / 2, cy - h / 2, w, h, h / 2, C.white);
    ctx.stroke();
    ctx.shadowColor = "transparent";
    ctx.fillStyle = C.darkBrown;
    ctx.fillText(text, cx, cy + 1);
    ctx.restore();
  }

  function drawSim(ctx, sim, time) {
    if (sim === selected) drawGlow(ctx, sim, time);
    ellipse(ctx, sim.x, sim.y, 16 * CONFIG.characterScale, 6 * CONFIG.characterScale, "rgba(74, 52, 40, 0.25)");

    var walking = sim.path.length > 0;
    var bounce = walking ? -Math.abs(Math.sin(sim.stepPhase)) * 5 : 0;
    ctx.save();
    ctx.translate(sim.x, sim.y + bounce);
    ctx.scale(CONFIG.characterScale, CONFIG.characterScale);
    bodies[sim.data.id](ctx, sim.look, walking ? sim.stepPhase : 0);
    ctx.restore();

    drawNameTag(ctx, sim);
    drawThoughtBubble(ctx, sim, time);
  }

  function draw(ctx, time) {
    // Whoever is lower on screen is drawn last, so they appear in front.
    sims.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (sim) {
      drawSim(ctx, sim, time);
    });
  }

  // ---------- Walking ----------

  function roomAt(x, y) {
    for (var i = 0; i < CONFIG.rooms.length; i++) {
      var r = CONFIG.rooms[i];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r;
    }
    return null;
  }

  function clampToRoom(room, x, y) {
    var m = CONFIG.walkMargin;
    return {
      x: Math.max(room.x + m.side, Math.min(room.x + room.w - m.side, x)),
      y: Math.max(room.y + m.top, Math.min(room.y + room.h - m.bottom, y))
    };
  }

  function doorwayBetween(a, b) {
    for (var i = 0; i < CONFIG.doorways.length; i++) {
      var d = CONFIG.doorways[i];
      if (d.rooms.indexOf(a.id) >= 0 && d.rooms.indexOf(b.id) >= 0) return d;
    }
    return null;
  }

  // Straight line to the target, passing through a doorway when it is in another room.
  function walkTo(sim, x, y) {
    var targetRoom = roomAt(x, y);
    if (!targetRoom) return;
    var target = clampToRoom(targetRoom, x, y);
    var fromRoom = roomAt(sim.x, sim.y);
    var path = [];
    if (fromRoom && fromRoom !== targetRoom) {
      var door = doorwayBetween(fromRoom, targetRoom);
      if (door) path.push({ x: door.x, y: door.y });
    }
    path.push(target);
    sim.path = path;
  }

  function update(dt) {
    sims.forEach(function (sim) {
      var step = CONFIG.walkSpeed * dt;
      while (sim.path.length > 0 && step > 0) {
        var p = sim.path[0];
        var dx = p.x - sim.x, dy = p.y - sim.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= step) {
          sim.x = p.x;
          sim.y = p.y;
          step -= dist;
          sim.path.shift();
        } else {
          sim.x += dx / dist * step;
          sim.y += dy / dist * step;
          step = 0;
        }
      }
      sim.stepPhase = sim.path.length > 0 ? sim.stepPhase + dt * 11 : 0;
    });
  }

  // ---------- Tapping ----------

  function simAt(x, y) {
    var hit = null;
    sims.forEach(function (sim) {
      var dx = x - sim.x, dy = y - sim.y;
      var k = CONFIG.characterScale;
      if (dx >= -22 * k && dx <= 22 * k && dy >= -76 * k && dy <= 34) {
        if (!hit || sim.y > hit.y) hit = sim;
      }
    });
    return hit;
  }

  // A tap on a character selects it; a tap on the floor walks the selected one there.
  function handleTap(x, y) {
    var sim = simAt(x, y);
    if (sim) {
      selected = sim;
      onSelect(sim.data);
    } else if (selected) {
      walkTo(selected, x, y);
    }
  }

  return { init: init, update: update, draw: draw, handleTap: handleTap };
})();
