// The characters: drawing, selection and walking, in the house or in the city.
var Sims = (function () {
  var C = CONFIG.colors;
  var sims = [];
  var selected = null;
  var onSelect = function () {};
  // The character whose social menu is open, if any.
  var menuFor = null;

  function init(selectCallback) {
    onSelect = selectCallback || onSelect;
    sims = CHARACTERS.map(function (data, i) {
      var look = CONFIG.characterLooks[data.id];
      return {
        // "front", "back", "left" or "right"
        facing: "front",
        // Seconds left with the eyes closed, and until the next blink (each one starts at a different time).
        blink: 0,
        blinkWait: 1 + i * 1.5 + Math.random() * 2,
        breath: Math.random() * Math.PI * 2,
        data: data,
        look: look,
        x: look.start.x,
        y: look.start.y,
        path: [],
        stepPhase: 0,
        // "house" or "city"
        place: look.start.place,
        // The place it goes to when it gets to the door it is walking to, or null.
        goal: null
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
  // "view" is "front", "back" or "side". Side views are drawn looking right; drawSim mirrors them for the left.

  // True while drawing someone lying or sitting: the legs are hidden or drawn by the pose instead.
  var noLegs = false;

  function drawLegs(ctx, look, step, view) {
    if (noLegs) return;
    if (view === "side") {
      var stride = Math.sin(step) * 4;
      fillRound(ctx, -4 - stride, -16, 7, 14, 3, look.pants);
      fillRound(ctx, -3 + stride, -16, 7, 14, 3, look.pants);
      ellipse(ctx, 1 - stride, -2, 5.5, 3.5, look.shoes);
      ellipse(ctx, 2 + stride, -2, 5.5, 3.5, look.shoes);
      return;
    }
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

  // One arm seen from the side, swinging forward and back from the shoulder.
  // "extra" draws something on it (like a watch), in the arm's own coordinates.
  function drawSideArm(ctx, look, step, extra) {
    ctx.save();
    ctx.translate(0, -35);
    ctx.rotate(-Math.sin(step) * 0.35);
    fillRound(ctx, -3, -2, 6, 16, 3, look.skin);
    fillRound(ctx, -3, -2, 6, 7, 3, look.shirt);
    circle(ctx, 0, 15, 3.2, look.skin);
    if (extra) extra();
    ctx.restore();
  }

  function drawTorso(ctx, look, view) {
    if (view === "side") {
      fillRound(ctx, -8, -40, 16, 28, 7, look.shirt);
    } else {
      fillRound(ctx, -12, -40, 24, 28, 8, look.shirt);
    }
  }

  function drawHead(ctx, look) {
    circle(ctx, 0, -54, 16, look.skin);
  }

  // An open eye, or a little curved line when it blinks.
  function drawEye(ctx, look, x, y, closed) {
    if (closed) {
      ctx.strokeStyle = look.eyes;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - 2.4, y);
      ctx.quadraticCurveTo(x, y + 1.4, x + 2.4, y);
      ctx.stroke();
      return;
    }
    circle(ctx, x, y, 2.2, look.eyes);
    circle(ctx, x + 0.7, y - 0.8, 0.8, C.white);
  }

  function drawEyes(ctx, look, y, closed) {
    drawEye(ctx, look, -5.5, y, closed);
    drawEye(ctx, look, 5.5, y, closed);
  }

  function strokeLine(ctx, color, width, points) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    points.forEach(function (p, i) {
      if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    });
    ctx.stroke();
  }

  // ---------- real.fixer ----------

  function drawRealFixerFront(ctx, look, step, closed) {
    drawLegs(ctx, look, step, "front");
    var swing = drawArms(ctx, look, step);
    drawTorso(ctx, look, "front");

    // Collar
    ctx.fillStyle = look.collar;
    ctx.beginPath();
    ctx.moveTo(-7, -40); ctx.lineTo(0, -35); ctx.lineTo(-2, -32); ctx.lineTo(-9, -38);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7, -40); ctx.lineTo(0, -35); ctx.lineTo(2, -32); ctx.lineTo(9, -38);
    ctx.closePath(); ctx.fill();

    // Fanny pack in front, with its strap
    strokeLine(ctx, "#4A4A4A", 1.5, [[-12, -19], [12, -19]]);
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

    drawEyes(ctx, look, -49, closed);

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

  // From behind: the back of the cap and the black shirt; no face and no beard.
  function drawRealFixerBack(ctx, look, step) {
    drawLegs(ctx, look, step, "back");
    var swing = drawArms(ctx, look, step);
    drawTorso(ctx, look, "back");

    // Back of the collar, and the fanny pack strap across the back
    fillRound(ctx, -9, -42, 18, 5, 2.5, look.collar);
    strokeLine(ctx, "#4A4A4A", 1.5, [[-12, -19], [12, -19]]);

    // The watch is on the other side when seen from behind
    fillRound(ctx, 11.5, -25 + swing, 7, 3.2, 1.2, look.gold);

    // Back of the head: short dark hair, with the ears peeking out
    drawHead(ctx, look);
    circle(ctx, 0, -55, 15, look.hair);
    circle(ctx, -15.5, -52, 3, look.skin);
    circle(ctx, 15.5, -52, 3, look.skin);

    // Back of the navy cap, with the opening and its little strap
    ctx.fillStyle = look.cap;
    ctx.beginPath();
    ctx.arc(0, -56, 17, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = look.hair;
    ctx.beginPath();
    ctx.ellipse(0, -56, 5, 4, 0, Math.PI, 0);
    ctx.fill();
    fillRound(ctx, -6, -59.5, 12, 2.5, 1.2, look.capBrim);
    circle(ctx, 0, -72, 2, look.capBrim);
  }

  // From the side, looking right: brim toward the front, beard in profile and the fanny pack sideways.
  function drawRealFixerSide(ctx, look, step, closed) {
    drawSideArm(ctx, look, step + Math.PI);
    drawLegs(ctx, look, step, "side");
    drawTorso(ctx, look, "side");

    // Collar from the side
    ctx.fillStyle = look.collar;
    ctx.beginPath();
    ctx.moveTo(-6, -40); ctx.lineTo(5, -40); ctx.lineTo(7, -34); ctx.lineTo(1, -37);
    ctx.closePath(); ctx.fill();

    // Fanny pack seen from the side, sticking out in front, with its strap
    strokeLine(ctx, "#4A4A4A", 1.5, [[-8, -19], [6, -19]]);
    fillRound(ctx, 4, -24, 9, 10, 4, look.pack);
    ctx.strokeStyle = "#6B6B6B";
    ctx.lineWidth = 1;
    roundRect(ctx, 4, -24, 9, 10, 4);
    ctx.stroke();
    circle(ctx, 10.5, -19, 1.1, look.gold);

    // Near arm, with the gold watch
    drawSideArm(ctx, look, step, function () {
      fillRound(ctx, -3.5, 9.5, 7, 3.2, 1.2, look.gold);
    });

    drawHead(ctx, look);
    // Nose
    circle(ctx, 16, -49, 2.2, look.skin);
    // Short dark hair at the back of the head, under the cap
    fillRound(ctx, -16.5, -60, 9, 14, 4, look.hair);

    drawEye(ctx, look, 8.5, -49, closed);

    // Full beard in profile, from the sideburn along the jaw to the chin
    ctx.fillStyle = look.beard;
    ctx.beginPath();
    ctx.moveTo(-1, -56);
    ctx.lineTo(3, -56);
    ctx.quadraticCurveTo(4, -46, 12, -45.5);
    ctx.quadraticCurveTo(17.5, -47, 17.5, -43);
    ctx.quadraticCurveTo(16, -33, 6, -33);
    ctx.quadraticCurveTo(-3, -35, -3, -45);
    ctx.quadraticCurveTo(-2, -52, -1, -56);
    ctx.closePath();
    ctx.fill();
    [[2, -38], [8, -36], [13, -39], [0, -44], [6, -42], [15, -45]].forEach(function (p) {
      circle(ctx, p[0], p[1], 1, look.beardGray);
    });
    // Mouth
    ctx.strokeStyle = "#C98A7A";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(12.5, -42.5);
    ctx.quadraticCurveTo(14.5, -41.5, 16.5, -42.8);
    ctx.stroke();
    // Ear
    circle(ctx, -3, -50, 3.2, look.skin);

    // Navy cap with its brim toward the front
    ctx.fillStyle = look.cap;
    ctx.beginPath();
    ctx.arc(0, -56, 17, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    fillRound(ctx, 10, -58, 15, 4.5, 2.2, look.capBrim);
    circle(ctx, 0, -72, 2, look.capBrim);
  }

  // ---------- Sofía ----------

  // Sofía's little gold Princess crown, on top of her head. "w" is half its width.
  function drawCrown(ctx, look, w) {
    var base = -67, top = -80;
    ctx.fillStyle = look.crown;
    ctx.beginPath();
    ctx.moveTo(-w, base);
    ctx.lineTo(-w, top + 4);
    ctx.lineTo(-w / 2, base - 6);
    ctx.lineTo(0, top);
    ctx.lineTo(w / 2, base - 6);
    ctx.lineTo(w, top + 4);
    ctx.lineTo(w, base);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = look.crownEdge;
    ctx.lineWidth = 1;
    ctx.lineJoin = "round";
    ctx.stroke();
    [[-w, top + 4], [0, top], [w, top + 4]].forEach(function (p) {
      circle(ctx, p[0], p[1], 1.4, look.crown);
    });
    circle(ctx, 0, base - 3, 1.9, look.gem);
  }

  function drawSofiaFront(ctx, look, step, closed) {
    // Long brown hair falling down her back
    fillRound(ctx, -20, -68, 40, 46, 16, look.hair);

    drawLegs(ctx, look, step, "front");
    drawArms(ctx, look, step);
    drawTorso(ctx, look, "front");

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

    drawEyes(ctx, look, -48, closed);
    circle(ctx, -9.5, -44, 3, look.cheeks);
    circle(ctx, 9.5, -44, 3, look.cheeks);
    // Smile
    ctx.strokeStyle = "#B0566A";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, -44, 3.5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    drawCrown(ctx, look, 9);
  }

  // From behind: her long brown hair covers her head and her back.
  function drawSofiaBack(ctx, look, step) {
    drawLegs(ctx, look, step, "back");
    drawArms(ctx, look, step);
    drawTorso(ctx, look, "back");
    drawHead(ctx, look);

    circle(ctx, 0, -55, 17, look.hair);
    fillRound(ctx, -14, -60, 28, 40, 12, look.hair);
    // A few strands
    [[[-6, -62], [-7, -23]], [[0, -66], [0, -21]], [[6, -62], [7, -23]]].forEach(function (line) {
      strokeLine(ctx, "rgba(74, 52, 40, 0.35)", 1, line);
    });

    drawCrown(ctx, look, 9);
  }

  // From the side, looking right: her profile, with her hair falling down her back.
  function drawSofiaSide(ctx, look, step, closed) {
    // Long hair falling down her back, behind the body
    fillRound(ctx, -18, -64, 22, 44, 10, look.hair);

    drawSideArm(ctx, look, step + Math.PI);
    drawLegs(ctx, look, step, "side");
    drawTorso(ctx, look, "side");
    // The necklace bead, in front
    strokeLine(ctx, look.gold, 1.3, [[1, -40], [6, -36]]);
    circle(ctx, 6.5, -35, 1.8, look.gold);
    drawSideArm(ctx, look, step);

    drawHead(ctx, look);
    // Nose
    circle(ctx, 15.8, -49, 2, look.skin);

    // Hair over the top and back of the head, with bangs over the forehead
    ctx.fillStyle = look.hair;
    ctx.beginPath();
    ctx.arc(0, -55, 17, -0.25 * Math.PI, 0.6 * Math.PI, true);
    ctx.quadraticCurveTo(-3, -45, -2, -51);
    ctx.quadraticCurveTo(4, -62, 16, -57);
    ctx.closePath();
    ctx.fill();
    // A lock falling over her shoulder
    fillRound(ctx, -13, -52, 9, 30, 4, look.hair);

    drawEye(ctx, look, 8.5, -48, closed);
    circle(ctx, 8, -43.5, 3, look.cheeks);
    // Smile
    ctx.strokeStyle = "#B0566A";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(11.5, -43);
    ctx.quadraticCurveTo(13.5, -41, 15.5, -43.5);
    ctx.stroke();

    drawCrown(ctx, look, 6.5);
  }

  var bodies = {
    realfixer: { front: drawRealFixerFront, back: drawRealFixerBack, side: drawRealFixerSide },
    sofia: { front: drawSofiaFront, back: drawSofiaBack, side: drawSofiaSide }
  };

  // ---------- Lying down and sitting ----------

  // Sitting on the log: the thighs forward at the height of the seat and the shins down to the grass (seen from the side).
  function drawSittingLegs(ctx, look) {
    [-2, 1].forEach(function (dx) {
      fillRound(ctx, -6 + dx, -9, 23, 8, 4, look.pants);
      fillRound(ctx, 11 + dx, -6, 7, 11, 3, look.pants);
      ellipse(ctx, 17 + dx, 4, 5.5, 3.5, look.shoes);
    });
  }

  // At night the furniture is tinted blue-violet, but characters are drawn after the tint:
  // a blanket gets the same tint here, so it looks like the rest of the Cama.
  function nightShade(ctx, shape) {
    var dark = Time.darkness();
    if (dark <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = dark;
    shape();
    ctx.fillStyle = CONFIG.night.tint;
    ctx.fill();
    ctx.restore();
  }

  // A blanket like the one of the Cama, from the shoulders down, with its folded edge and little dots.
  function drawBlanket(ctx) {
    fillRound(ctx, -25, -38, 50, 54, 10, C.terracotta);
    fillRound(ctx, -25, -38, 50, 10, 5, "#D98168");
    [[-12, -16], [10, -14], [-2, 0], [-14, 10], [12, 9]].forEach(function (p) {
      circle(ctx, p[0], p[1], 2.6, "rgba(245, 235, 221, 0.6)");
    });
    nightShade(ctx, function () { roundRect(ctx, -25, -38, 50, 54, 10); });
  }

  // How a character looks while it uses something (see "pose" in js/objects.js):
  // lying in the Cama seen from above, face up with closed eyes under a blanket; sitting on the Sofá seen from behind,
  // looking at the Televisión (the backrest goes on top afterwards); or sitting on the log by the Fogata, from the side.
  function drawPose(ctx, sim, pose) {
    var body = bodies[sim.data.id];
    noLegs = true;
    if (pose.kind === "lie") {
      body.front(ctx, sim.look, 0, true);
      drawBlanket(ctx);
    } else if (pose.kind === "sofa") {
      body.back(ctx, sim.look, 0);
    } else {
      drawSittingLegs(ctx, sim.look);
      // The body sits lower than when standing.
      ctx.translate(0, 10);
      body.side(ctx, sim.look, 0, sim.blink > 0);
    }
    noLegs = false;
  }

  // Little "Z" letters floating up and fading, for someone asleep.
  function drawZzz(ctx, x, y, time) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    for (var i = 0; i < 3; i++) {
      var t = (time * 0.45 + i / 3) % 1;
      var zx = x + t * 18 + Math.sin(t * 6 + i) * 3, zy = y - t * 40;
      ctx.globalAlpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      ctx.font = "700 " + Math.round(13 + t * 9) + "px " + CONFIG.fontFamily;
      ctx.strokeStyle = C.cream;
      ctx.lineWidth = 4;
      ctx.strokeText("Z", zx, zy);
      ctx.fillStyle = C.darkBrown;
      ctx.fillText("Z", zx, zy);
    }
    ctx.restore();
  }

  // Where a character is drawn: where it stands, or on the furniture while it lies or sits on it.
  function drawnAt(sim) {
    var pose = Objects.poseFor(sim.data.id);
    if (pose && pose.x !== undefined) return { x: pose.x, y: pose.y };
    return { x: sim.x, y: sim.y };
  }

  // ---------- Selection glow and name tag ----------
  // "at" is where the character is drawn (see drawnAt).

  function drawGlow(ctx, at, time) {
    var pulse = (1 + Math.sin(time * 4) * 0.08) * CONFIG.characterScale;
    ctx.save();
    ctx.shadowColor = CONFIG.glow;
    ctx.shadowBlur = 16;
    ellipse(ctx, at.x, at.y, 26 * pulse, 10 * pulse, "rgba(255, 214, 107, 0.45)");
    ctx.strokeStyle = CONFIG.glow;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  function drawNameTag(ctx, sim, at) {
    var isSelected = sim === selected;
    var size = 15;
    ctx.save();
    ctx.font = "700 " + size + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var w = ctx.measureText(sim.data.name).width + size * 1.2;
    var h = size * 1.6;
    var cy = at.y + 24;
    ctx.shadowColor = "rgba(74, 52, 40, 0.25)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    fillRound(ctx, at.x - w / 2, cy - h / 2, w, h, h / 2, isSelected ? C.terracotta : C.cream);
    ctx.shadowColor = "transparent";
    ctx.fillStyle = isSelected ? C.cream : C.darkBrown;
    ctx.fillText(sim.data.name, at.x, cy + 1);
    ctx.restore();
  }

  // ---------- Thought bubble for needs in red ----------

  // "lift" moves it higher when an action bubble is showing too.
  function drawThoughtBubble(ctx, sim, at, time, lift) {
    var low = Needs.lowNeeds(sim.data.id);
    if (low.length === 0) return;
    var text = low.map(function (need) { return need.emoji; }).join(" ");
    var bob = Math.sin(time * 2.5) * 2;
    var headTop = at.y - 78 * CONFIG.characterScale - CONFIG.moodStar.room - lift;
    var cx = at.x + 30, cy = headTop - 24 + bob;

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
    [[at.x + 16, headTop + 8 + bob / 2, 4], [at.x + 22, headTop - 2 + bob, 6]].forEach(function (p) {
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

  // ---------- Speech bubble for conversations, with a subtitle when there is one ----------

  function wrapText(ctx, text, maxWidth) {
    var lines = [];
    var line = "";
    text.split(" ").forEach(function (word) {
      var test = line ? line + " " + word : word;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  // Returns how much room it takes above the head, so the thought bubble can go higher.
  function drawSpeechBubble(ctx, at, time, bubble) {
    var maxWidth = 210;
    var textFont = "700 16px " + CONFIG.fontFamily;
    var subFont = "italic 13px " + CONFIG.fontFamily;
    ctx.save();
    ctx.font = textFont;
    var lines = wrapText(ctx, bubble.text, maxWidth);
    var w = 0;
    lines.forEach(function (l) { w = Math.max(w, ctx.measureText(l).width); });
    ctx.font = subFont;
    var subLines = bubble.subtitle ? wrapText(ctx, bubble.subtitle, maxWidth) : [];
    subLines.forEach(function (l) { w = Math.max(w, ctx.measureText(l).width); });
    w += 26;
    var h = 16 + lines.length * 20 + (subLines.length ? 4 + subLines.length * 16 : 0);

    var headTop = at.y - 78 * CONFIG.characterScale - CONFIG.moodStar.room;
    var cx = at.x, bottom = headTop - 8, top = bottom - h;
    ctx.shadowColor = "rgba(74, 52, 40, 0.25)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = 2.5;
    roundRect(ctx, cx - w / 2, top, w, h, 14);
    ctx.moveTo(cx - 7, bottom - 1);
    ctx.lineTo(cx, bottom + 9);
    ctx.lineTo(cx + 7, bottom - 1);
    ctx.fillStyle = C.white;
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = "transparent";
    ctx.fillRect(cx - 5.5, bottom - 3, 11, 4);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = C.darkBrown;
    ctx.font = textFont;
    var y = top + 9;
    lines.forEach(function (l) { ctx.fillText(l, cx, y); y += 20; });
    if (subLines.length) {
      y += 4;
      ctx.font = subFont;
      ctx.fillStyle = C.wood;
      subLines.forEach(function (l) { ctx.fillText(l, cx, y); y += 16; });
    }

    if (bubble.heart) {
      var beat = 1 + Math.sin(time * 6) * 0.12;
      ctx.textBaseline = "middle";
      ctx.font = Math.round(22 * beat) + "px " + CONFIG.fontFamily;
      ctx.fillText("❤️", cx - w / 2 - 16, top + 14);
    }
    ctx.restore();
    return h + 16;
  }

  // ---------- Action bubble ("Comiendo 🍳") with a heart for favorites ----------

  function drawActionBubble(ctx, at, time, bubble) {
    var headTop = at.y - 78 * CONFIG.characterScale - CONFIG.moodStar.room;
    var cx = at.x, cy = headTop - 22;

    ctx.save();
    ctx.font = "700 17px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var w = ctx.measureText(bubble.text).width + 24;
    var h = 32;
    ctx.shadowColor = "rgba(74, 52, 40, 0.25)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = 2.5;
    // Bubble with a little tail pointing at the head
    roundRect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
    ctx.moveTo(cx - 7, cy + h / 2 - 1);
    ctx.lineTo(cx, cy + h / 2 + 9);
    ctx.lineTo(cx + 7, cy + h / 2 - 1);
    ctx.fillStyle = C.cream;
    ctx.fill();
    ctx.stroke();
    // Hide the line between the bubble and its tail
    ctx.shadowColor = "transparent";
    ctx.fillRect(cx - 5.5, cy + h / 2 - 3, 11, 4);
    ctx.fillStyle = C.darkBrown;
    ctx.fillText(bubble.text, cx, cy + 1);

    if (bubble.heart) {
      var beat = 1 + Math.sin(time * 6) * 0.12;
      ctx.font = Math.round(22 * beat) + "px " + CONFIG.fontFamily;
      ctx.fillText("❤️", cx - w / 2 - 16, cy - 4);
    }
    ctx.restore();
  }

  // ---------- Mood star: green, yellow or red by the average of the four needs ----------

  function moodColor(id) {
    var mood = Needs.average(id);
    var colors = CONFIG.moodStar.colors;
    if (mood > CONFIG.needLevels.good) return colors.good;
    if (mood >= CONFIG.needLevels.low) return colors.ok;
    return colors.low;
  }

  function drawMoodStar(ctx, sim, at, time) {
    var r = CONFIG.moodStar.radius;
    var bob = Math.sin(time * 2 + at.x * 0.01) * 1.5;
    var cx = at.x, cy = at.y - 78 * CONFIG.characterScale - r - 4 + bob;
    ctx.save();
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var radius = i % 2 === 0 ? r : r * CONFIG.moodStar.inner;
      var angle = -Math.PI / 2 + i * Math.PI / 5;
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.lineJoin = "round";
    // A cream halo first, so the star stands out on any floor or furniture.
    ctx.shadowColor = "rgba(74, 52, 40, 0.3)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.shadowColor = "transparent";
    ctx.fillStyle = moodColor(sim.data.id);
    ctx.fill();
    ctx.strokeStyle = C.darkBrown;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  function drawSim(ctx, sim, time) {
    var pose = Objects.poseFor(sim.data.id);
    // Sleeping in the Carpa: it is inside, so only the "Zzz" coming out of the tent are seen.
    if (pose && pose.kind === "tent") {
      drawZzz(ctx, pose.zzz.x, pose.zzz.y, time);
      return;
    }
    var at = drawnAt(sim);
    var k = CONFIG.characterScale;
    if (sim === selected) drawGlow(ctx, at, time);
    if (!pose) ellipse(ctx, at.x, at.y, 16 * k, 6 * k, "rgba(74, 52, 40, 0.25)");

    var walking = sim.path.length > 0;
    var bounce = walking ? -Math.abs(Math.sin(sim.stepPhase)) * 5 : 0;
    // While standing still the body rises and falls a little with each breath.
    var breath = walking ? 1 : 1 + Math.sin(sim.breath) * CONFIG.alive.breathe.amount;
    // While talking they lean in a little toward each other.
    var lean = Social.facing(sim.data.id);
    var view = sim.facing === "left" || sim.facing === "right" ? "side" : sim.facing;
    // Lying and sitting on the Sofá always face the same way; on the log it looks at the fire.
    var flip = sim.facing === "left" && (!pose || pose.kind === "log");
    ctx.save();
    ctx.translate(at.x, at.y + bounce);
    ctx.rotate(lean * 0.06);
    ctx.scale(flip ? -k : k, k * breath);
    if (pose) {
      drawPose(ctx, sim, pose);
    } else {
      bodies[sim.data.id][view](ctx, sim.look, walking ? sim.stepPhase : 0, sim.blink > 0);
    }
    ctx.restore();
    if (pose && pose.kind === "sofa") House.drawSofaBackrest(ctx);
    if (pose && pose.kind === "lie") drawZzz(ctx, at.x + 22, at.y - 62 * k, time);

    drawNameTag(ctx, sim, at);
    drawMoodStar(ctx, sim, at, time);
    var lift = 0;
    var bubble = Social.bubbleFor(sim.data.id) || Objects.bubbleFor(sim.data.id) || Garden.bubbleFor(sim.data.id) ||
      Gather.bubbleFor(sim.data.id) || Cooking.bubbleFor(sim.data.id);
    if (bubble && bubble.speech) {
      lift = drawSpeechBubble(ctx, at, time, bubble);
    } else if (bubble) {
      drawActionBubble(ctx, at, time, bubble);
      lift = 44;
    }
    drawThoughtBubble(ctx, sim, at, time, lift);
  }

  // The place the screen shows: where the selected character is, or the house when nobody is.
  function viewPlace() {
    if (selected) return selected.place;
    return sims.some(function (s) { return s.place === "house"; }) ? "house" : "city";
  }

  function draw(ctx, time) {
    var view = viewPlace();
    // Whoever is lower on screen is drawn last, so they appear in front.
    sims.filter(function (s) { return s.place === view; })
      .sort(function (a, b) { return drawnAt(a).y - drawnAt(b).y; })
      .forEach(function (sim) { drawSim(ctx, sim, time); });
  }

  // ---------- Walking ----------

  function roomAt(x, y) {
    for (var i = 0; i < CONFIG.rooms.length; i++) {
      var r = CONFIG.rooms[i];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r;
    }
    return null;
  }

  // Walk to a spot going around everything solid (js/path.js): in the house through the doorways and around
  // the furniture; in the city over the bridge and around the house, the trees, the fountain, the tent, the
  // campfire and the garden fence. If the spot cannot be reached, it walks to the closest spot it can reach.
  function walkTo(sim, x, y) {
    sim.path = Path.find(sim.place, sim.x, sim.y, x, y);
    sim.goal = null;
  }

  // ---------- Going out and coming back ----------

  // Walk to the front door and go out to the city.
  function goOut(sim) {
    walkTo(sim, CONFIG.frontDoor.inside.x, CONFIG.frontDoor.inside.y);
    sim.goal = "city";
  }

  // Walk to the door of Sofía's house in the city and go in.
  function goHome(sim) {
    walkTo(sim, City.doorSpot.x, City.doorSpot.y);
    sim.goal = "house";
  }

  // At the door: come out on the other side, in the city by the house door or in the Sala by the front door.
  function goThrough(sim) {
    var spot = sim.goal === "city" ? City.doorSpot : CONFIG.frontDoor.inside;
    sim.place = sim.goal;
    sim.x = spot.x;
    sim.y = spot.y;
    sim.goal = null;
  }

  // With Pausa nobody walks: they stay where they are and go on when the game continues.
  function update(dt) {
    var paused = Needs.isPaused();
    sims.forEach(function (sim) {
      var fromX = sim.x, fromY = sim.y;
      var step = paused ? 0 : CONFIG.walkSpeed * dt;
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
      if (!paused) sim.stepPhase = sim.path.length > 0 ? sim.stepPhase + dt * 11 : 0;
      turn(sim, sim.x - fromX, sim.y - fromY);
      if (!paused && sim.path.length === 0 && sim.goal) goThrough(sim);
      live(sim, dt);
    });
  }

  // Look the way it walks: to the side when it goes more sideways than up or down, else front or back.
  // It keeps looking the way it looks until the other way clearly wins, so on a curve or a slanted line it does not flicker.
  // Standing still while talking, it looks at the other one. Otherwise it keeps the last way.
  function turn(sim, dx, dy) {
    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
      var sideways = sim.facing === "left" || sim.facing === "right";
      if (Math.abs(dx) > Math.abs(dy) * (sideways ? 0.8 : 1.25)) {
        sim.facing = dx > 0 ? "right" : "left";
      } else {
        sim.facing = dy > 0 ? "front" : "back";
      }
      return;
    }
    var side = Social.facing(sim.data.id);
    if (side) sim.facing = side > 0 ? "right" : "left";
  }

  // Turn toward a spot, like the thing it starts using: to the side when it is more sideways than up or down.
  // Right on top of it, it looks to the front.
  function face(sim, x, y) {
    var dx = x - sim.x, dy = y - sim.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      sim.facing = dx > 0 ? "right" : "left";
    } else {
      sim.facing = dy < -1 ? "back" : "front";
    }
  }

  // Blinking and breathing, each character with its own rhythm. They go on even with Pausa.
  function live(sim, dt) {
    var a = CONFIG.alive;
    sim.breath += dt * a.breathe.speed;
    if (sim.blink > 0) sim.blink -= dt;
    sim.blinkWait -= dt;
    if (sim.blinkWait <= 0) {
      sim.blink = a.blink.length;
      sim.blinkWait = between(a.blink.min, a.blink.max);
    }
  }

  function between(min, max) {
    return min + Math.random() * (max - min);
  }

  // ---------- Free will ----------

  // Seconds until each character may decide something on its own, by id.
  var thinkTimer = {};

  function isIdle(sim) {
    var id = sim.data.id;
    return sim.path.length === 0 && !Objects.isActive(id) && !Garden.isActive(id) && !Gather.isActive(id) && !Cooking.isActive(id) &&
      !Social.isInvolved(id);
  }

  // Try to fix the lowest need; true if it found something to do.
  // If the character has its own place for that need ("goesTo"), it walks there, going out or in first.
  // If not, in the city it goes back to the house first.
  function lookAfter(sim) {
    var values = Needs.get(sim.data.id);
    var lowest = null;
    CONFIG.needs.forEach(function (need) {
      if (!lowest || values[need.id] < values[lowest.id]) lowest = need;
    });
    if (values[lowest.id] >= CONFIG.freeWill.threshold) return false;

    // Hungry with a dish in the backpack: eat it right here instead of going to the Refrigerador.
    var dish = lowest.id === "hunger" ? Cooking.anyDish() : null;
    if (dish) return Cooking.eat(sim, dish);

    var own = (CONFIG.freeWill.goesTo[sim.data.id] || {})[lowest.id];
    if (own) {
      var mine = Objects.freeFor(lowest.id, sim.data.id, sim.place, own);
      if (mine.length === 0) return false;
      var where = Objects.placeOf(mine[0]);
      if (where === sim.place) {
        Objects.start(sim, mine[0]);
      } else if (where === "city") {
        goOut(sim);
      } else {
        goHome(sim);
      }
      return true;
    }
    if (sim.place === "city") {
      goHome(sim);
      return true;
    }
    if (lowest.id === "social") {
      var other = sims.filter(function (s) { return s !== sim; })[0];
      if (Social.isBusy() || other.place !== sim.place) return false;
      // If the other one is using something, wait until it finishes instead of interrupting.
      var otherId = other.data.id;
      if (Objects.isActive(otherId) || Garden.isActive(otherId) || Gather.isActive(otherId) || Cooking.isActive(otherId)) return false;
      Social.start(sim, other, "chat");
      return true;
    }
    var free = Objects.freeFor(lowest.id, sim.data.id, sim.place);
    if (free.length === 0) return false;
    Objects.start(sim, free[Math.floor(Math.random() * free.length)]);
    return true;
  }

  // ---------- Visits ----------

  // The visitor's visit: phase null (at home), "going", "staying" or "leaving".
  var visit = { phase: null, timer: randomWait(), stay: 0 };

  function randomWait() {
    var w = CONFIG.visit.wait;
    return w.min + Math.random() * (w.max - w.min);
  }

  function needsAreFine(id) {
    var values = Needs.get(id);
    return CONFIG.needs.every(function (need) { return values[need.id] >= CONFIG.freeWill.threshold; });
  }

  function stopVisit() {
    visit.phase = null;
    visit.timer = randomWait();
  }

  // Every now and then the visitor walks to Sofía's house, stays a while in the Sala and goes back home.
  // If it is already in the house with nothing to do, it stays a while and then goes home too.
  function visitStep(dt) {
    var sim = sims.filter(function (s) { return s.data.id === CONFIG.visit.who; })[0];
    if (!sim) return;
    if (sim === selected || sim === menuFor) {
      stopVisit();
      return;
    }
    if (visit.phase === "staying") visit.stay -= dt;
    if (!isIdle(sim)) return;

    if (!visit.phase) {
      if (!needsAreFine(sim.data.id)) return;
      if (sim.place === "house") {
        visit.phase = "staying";
        visit.stay = CONFIG.visit.stay;
        return;
      }
      visit.timer -= dt;
      if (visit.timer > 0) return;
      visit.phase = "going";
    }
    if (visit.phase === "going") {
      if (sim.place === "city") {
        goHome(sim);
        return;
      }
      walkTo(sim, CONFIG.visit.spot.x, CONFIG.visit.spot.y);
      visit.phase = "staying";
      visit.stay = CONFIG.visit.stay;
      return;
    }
    if (visit.phase === "staying") {
      if (visit.stay > 0) return;
      visit.phase = "leaving";
    }
    // Leaving: out the front door, then back to the starting spot by home.
    if (sim.place === "house") {
      goOut(sim);
      return;
    }
    walkTo(sim, sim.look.start.x, sim.look.start.y);
    stopVisit();
  }

  // The ones not selected look after themselves when they are idle, and the visitor visits.
  // With Pausa, nobody decides.
  function think(dt) {
    if (Needs.isPaused()) return;
    sims.forEach(function (sim) {
      var id = sim.data.id;
      if (sim === selected || sim === menuFor || !isIdle(sim)) {
        thinkTimer[id] = CONFIG.freeWill.pause;
        return;
      }
      thinkTimer[id] = (thinkTimer[id] || 0) - dt;
      if (thinkTimer[id] > 0) return;
      var busy = lookAfter(sim);
      thinkTimer[id] = busy ? CONFIG.freeWill.pause : CONFIG.freeWill.retry;
      // Looking after a need comes first and ends a visit.
      if (busy && id === CONFIG.visit.who) stopVisit();
    });
    visitStep(dt);
  }

  // ---------- Saving ----------

  function list() {
    return sims;
  }

  var FACINGS = ["front", "back", "left", "right"];

  // Put a character at a saved spot, if it is inside the house or on dry ground in the city,
  // looking the way it looked when it was saved. A spot on something solid moves to the closest free spot.
  function place(sim, x, y, where, facing) {
    if (FACINGS.indexOf(facing) >= 0) sim.facing = facing;
    where = where === "city" ? "city" : "house";
    if (typeof x !== "number" || typeof y !== "number") return;
    if (where === "city" ? !City.isWalkable(x, y) : !roomAt(x, y)) return;
    var spot = Path.free(where, x, y);
    sim.place = where;
    sim.x = spot.x;
    sim.y = spot.y;
    sim.path = [];
  }

  // ---------- Tapping ----------

  // The character at a spot of the place on screen, or null. Lying or sitting, it is where it is drawn;
  // inside the Carpa, at the entrance.
  function simAt(x, y) {
    var hit = null, hitY = 0;
    var view = viewPlace();
    sims.forEach(function (sim) {
      if (sim.place !== view) return;
      var at = drawnAt(sim);
      var dx = x - at.x, dy = y - at.y;
      var k = CONFIG.characterScale;
      if (dx >= -22 * k && dx <= 22 * k && dy >= -76 * k && dy <= 34) {
        if (!hit || at.y > hitY) {
          hit = sim;
          hitY = at.y;
        }
      }
    });
    return hit;
  }

  // A tap on the other character opens the social menu; tapping it again selects it.
  // A tap on a character selects it and stops what it was doing.
  // A tap on furniture sends the selected one to use it (the Estufa opens the recipe menu); a tap on the floor walks it there.
  // A tap on the front door takes it out to the city; in the city, a tap on the house takes it back in,
  // a tap on the tent sends it to use it, a tap on the campfire opens the recipe menu (with "Junto a la fogata" too),
  // a tap on a garden plot plants, waters or harvests,
  // a tap on the river sends it to fish, and a tap on a berry bush, a mushroom or a crystal sends it to gather it.
  // While the menu is open, a tap anywhere else only closes it.
  // In the city, garden plots and forest things win over characters, so a character working there never hides them from taps.
  function handleTap(x, y, screenX, screenY) {
    var inCity = !!selected && selected.place === "city";
    var onPlot = inCity && (Garden.plotAt(x, y) >= 0 || !!Gather.thingAt(x, y));
    var sim = onPlot ? null : simAt(x, y);
    var again = false;
    if (UI.isMenuOpen()) {
      UI.closeMenu();
      again = !!sim && sim === menuFor;
      menuFor = null;
      if (!again) return;
    }
    if (sim && selected && sim !== selected && !again) {
      var from = selected, to = sim;
      menuFor = sim;
      UI.openMenu(screenX, screenY, function (type) {
        menuFor = null;
        Social.start(from, to, type);
      });
      return;
    }
    if (sim) {
      var wasBusy = Objects.cancel(sim.data.id);
      if (Gather.cancel(sim.data.id)) wasBusy = true;
      if (Cooking.cancel(sim.data.id)) wasBusy = true;
      if (Garden.cancel(sim.data.id) || wasBusy) sim.path = [];
      Social.cancel(sim.data.id);
      selected = sim;
      onSelect(sim.data);
      return;
    }
    if (!selected) return;
    Social.cancel(selected.data.id);
    Objects.cancel(selected.data.id);
    Garden.cancel(selected.data.id);
    Gather.cancel(selected.data.id);
    Cooking.cancel(selected.data.id);
    if (selected.place === "city") {
      var thing = Objects.at(x, y, "city");
      var plot = Garden.plotAt(x, y);
      var wild = Gather.thingAt(x, y);
      if (plot >= 0) {
        Garden.tap(selected, plot, screenX, screenY);
      } else if (wild) {
        Gather.tapThing(selected, wild);
      } else if (City.houseAt(x, y)) {
        goHome(selected);
      } else if (thing) {
        Objects.tap(selected, thing, screenX, screenY);
      } else if (City.riverAt(x, y)) {
        Gather.tapRiver(selected, x, y);
      } else {
        walkTo(selected, x, y);
      }
      return;
    }
    if (House.doorAt(x, y)) {
      goOut(selected);
      return;
    }
    var furniture = Objects.at(x, y, "house");
    if (furniture) {
      Objects.tap(selected, furniture, screenX, screenY);
    } else {
      walkTo(selected, x, y);
    }
  }

  // Select a character from the panel buttons, wherever it is.
  function select(id) {
    var sim = sims.filter(function (s) { return s.data.id === id; })[0];
    if (!sim) return;
    if (UI.isMenuOpen()) {
      UI.closeMenu();
      menuFor = null;
    }
    selected = sim;
    onSelect(sim.data);
  }

  function placeOf(id) {
    var sim = sims.filter(function (s) { return s.data.id === id; })[0];
    return sim ? sim.place : "house";
  }

  return {
    init: init,
    update: update,
    think: think,
    draw: draw,
    handleTap: handleTap,
    walkTo: walkTo,
    face: face,
    simAt: simAt,
    roomAt: roomAt,
    list: list,
    place: place,
    select: select,
    placeOf: placeOf,
    isIdle: isIdle,
    selectedSim: function () { return selected; },
    viewPlace: viewPlace
  };
})();
