// Krohna, real.fixer's orange kitten. Only decoration: no needs, it cannot be selected and it changes nothing in the game.
// It follows real.fixer a little behind, in the same place (house or city), going around things with js/path.js.
// When he stands still it sits by his side and wags its tail; when he sleeps in the Carpa it sleeps curled up at the entrance.
// With Pausa it stays still.
var Pet = (function () {
  var K = CONFIG.pet;
  var C = { fur: "#E8913A", stripe: "#B9621F", belly: "#F6C48A", eyes: "#3A2A1E", nose: "#E7849A" };
  var SIZE = 1.4;

  // { place, x, y, path, facing: 1 right or -1 left, clock, step, timer, target }
  var pet = null;

  function owner() {
    return Sims.list().filter(function (s) { return s.data.id === "realfixer"; })[0];
  }

  // Where real.fixer is seen: on the furniture while he lies or sits, else where he stands.
  function ownerSpot(sim) {
    var pose = Objects.poseFor(sim.data.id);
    if (pose && pose.x !== undefined) return { x: pose.x, y: pose.y };
    return { x: sim.x, y: sim.y };
  }

  function isOwnerInTent() {
    var pose = Objects.poseFor("realfixer");
    return !!pose && pose.kind === "tent";
  }

  // Right next to real.fixer, on the side it already is, or at the tent entrance while he sleeps there.
  function targetFor(sim) {
    if (isOwnerInTent()) return Path.free("city", K.sleepSpot.x, K.sleepSpot.y);
    var at = ownerSpot(sim);
    var side = pet.x < at.x ? -1 : 1;
    return Path.free(sim.place, at.x + side * K.side, at.y + 4);
  }

  function dist(ax, ay, bx, by) {
    return Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
  }

  // Start next to real.fixer (called after loading the saved game).
  function init() {
    var sim = owner();
    var spot = Path.free(sim.place, sim.x - K.side, sim.y + 4);
    pet = { place: sim.place, x: spot.x, y: spot.y, path: [], facing: 1, clock: 0, step: 0, timer: 0, target: null };
  }

  function update(dt) {
    var sim = owner();
    if (!pet || !sim || Needs.isPaused()) return;
    pet.clock += dt;
    // He went through the door: the kitten comes out right behind him.
    if (pet.place !== sim.place) {
      var spot = Path.free(sim.place, sim.x - K.side, sim.y + 4);
      pet.place = sim.place;
      pet.x = spot.x;
      pet.y = spot.y;
      pet.path = [];
      pet.target = null;
    }

    pet.timer -= dt;
    var at = ownerSpot(sim);
    var far = dist(pet.x, pet.y, at.x, at.y) > K.farther;
    var ownerStill = sim.path.length === 0;
    if (pet.timer <= 0 && (far || isOwnerInTent() || (ownerStill && pet.path.length === 0))) {
      pet.timer = K.repath;
      var target = targetFor(sim);
      // Only a new way when the spot changed, so it does not keep looking for a spot it cannot reach.
      if (!pet.target || dist(target.x, target.y, pet.target.x, pet.target.y) > 10 || far) {
        if (dist(pet.x, pet.y, target.x, target.y) > 8) pet.path = Path.find(pet.place, pet.x, pet.y, target.x, target.y);
        pet.target = target;
      }
    }

    var step = K.speed * dt;
    while (pet.path.length > 0 && step > 0) {
      var p = pet.path[0];
      var dx = p.x - pet.x, dy = p.y - pet.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(dx) > 0.5) pet.facing = dx > 0 ? 1 : -1;
      if (d <= step) {
        pet.x = p.x;
        pet.y = p.y;
        step -= d;
        pet.path.shift();
      } else {
        pet.x += dx / d * step;
        pet.y += dy / d * step;
        step = 0;
      }
    }
    pet.step = pet.path.length > 0 ? pet.step + dt * 14 : 0;
    // Sitting, it looks at him.
    if (pet.path.length === 0 && Math.abs(at.x - pet.x) > 2) pet.facing = at.x > pet.x ? 1 : -1;
  }

  function isSleeping() {
    return isOwnerInTent() && pet.path.length === 0 && dist(pet.x, pet.y, pet.target ? pet.target.x : pet.x, pet.target ? pet.target.y : pet.y) < 10;
  }

  // ---------- Drawing (origin at the feet, up is negative y) ----------

  function ellipse(ctx, x, y, rx, ry, color) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function stroke(ctx, color, width, draw) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    draw();
    ctx.stroke();
  }

  function ear(ctx, x1, y1, x2, y2, x3, y3) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fillStyle = C.fur;
    ctx.fill();
  }

  // Walking, seen from the side looking right, with its tail up.
  function drawWalking(ctx) {
    var s = pet.step;
    stroke(ctx, C.fur, 3.5, function () {
      ctx.moveTo(-11, -11);
      ctx.quadraticCurveTo(-20, -14, -18 + Math.sin(s * 0.5) * 2, -25);
    });
    [[-9, 0], [-5, Math.PI], [5, Math.PI], [9, 0]].forEach(function (leg) {
      var lift = Math.max(0, Math.sin(s + leg[1])) * 2;
      ellipse(ctx, leg[0], -3 - lift, 2.2, 4, C.fur);
    });
    ellipse(ctx, 0, -10, 13, 7, C.fur);
    ellipse(ctx, 1, -7, 9, 3, C.belly);
    [-6, -1, 4].forEach(function (x) {
      stroke(ctx, C.stripe, 1.6, function () { ctx.moveTo(x, -16.5); ctx.lineTo(x - 1, -11.5); });
    });
    ear(ctx, 8, -21, 9, -29, 13, -23);
    ear(ctx, 13, -23, 17, -29, 18, -20);
    ellipse(ctx, 13, -17, 7, 6.5, C.fur);
    stroke(ctx, C.stripe, 1.3, function () { ctx.moveTo(12, -23); ctx.lineTo(12, -20); });
    ellipse(ctx, 16, -18, 1.2, 1.4, C.eyes);
    ellipse(ctx, 19.5, -15.5, 1.1, 0.9, C.nose);
  }

  // Sitting, seen from the front, wagging its tail on the side.
  function drawSitting(ctx) {
    var wag = Math.sin(pet.clock * 5);
    stroke(ctx, C.fur, 3.5, function () {
      ctx.moveTo(6, -3);
      ctx.quadraticCurveTo(16, -2, 17 + wag * 3, -12 + wag * 2);
    });
    ellipse(ctx, 0, -9, 9, 9.5, C.fur);
    ellipse(ctx, 0, -6, 5, 6, C.belly);
    [[-8, -12, -4, -11], [8, -12, 4, -11]].forEach(function (l) {
      stroke(ctx, C.stripe, 1.5, function () { ctx.moveTo(l[0], l[1]); ctx.lineTo(l[2], l[3]); });
    });
    ellipse(ctx, -4, -1, 3, 2.2, C.fur);
    ellipse(ctx, 4, -1, 3, 2.2, C.fur);
    ear(ctx, -7.5, -25, -6, -33, -1.5, -28);
    ear(ctx, 7.5, -25, 6, -33, 1.5, -28);
    ellipse(ctx, 0, -23, 8, 7, C.fur);
    [-3, 0, 3].forEach(function (x) {
      stroke(ctx, C.stripe, 1.3, function () { ctx.moveTo(x, -29.5); ctx.lineTo(x, -26.5); });
    });
    ellipse(ctx, -3, -23, 1.2, 1.5, C.eyes);
    ellipse(ctx, 3, -23, 1.2, 1.5, C.eyes);
    ellipse(ctx, 0, -20.5, 1.2, 0.9, C.nose);
  }

  // Curled up asleep, with its tail around it and its eyes closed.
  function drawSleeping(ctx) {
    var breath = 1 + Math.sin(pet.clock * 2) * 0.04;
    ctx.save();
    ctx.scale(1, breath);
    ellipse(ctx, 0, -6, 13, 7.5, C.fur);
    [-6, -1, 4].forEach(function (x) {
      stroke(ctx, C.stripe, 1.6, function () { ctx.moveTo(x, -12.5); ctx.lineTo(x + 1, -8.5); });
    });
    ctx.restore();
    stroke(ctx, C.fur, 3.5, function () {
      ctx.moveTo(-12, -5);
      ctx.quadraticCurveTo(-10, 2, 2, 1);
    });
    ear(ctx, 4, -11, 6, -17, 9, -12);
    ear(ctx, 9, -12, 13, -16, 13, -9);
    ellipse(ctx, 9, -7, 6, 5, C.fur);
    stroke(ctx, C.eyes, 1, function () { ctx.moveTo(9, -7.5); ctx.quadraticCurveTo(10.5, -6.5, 12, -7.5); });
  }

  // A little "z" floating up, smaller than the characters' ones.
  function drawZ(ctx, x, y) {
    var t = (pet.clock * 0.5) % 1;
    ctx.save();
    ctx.globalAlpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
    ctx.font = "700 " + Math.round(11 + t * 4) + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.strokeStyle = CONFIG.colors.cream;
    ctx.lineWidth = 3;
    var zx = x + t * 10, zy = y - t * 20;
    ctx.strokeText("z", zx, zy);
    ctx.fillStyle = CONFIG.colors.darkBrown;
    ctx.fillText("z", zx, zy);
    ctx.restore();
  }

  function draw(ctx) {
    if (!pet || pet.place !== Sims.viewPlace()) return;
    var sleeping = isSleeping();
    ellipse(ctx, pet.x, pet.y, 14 * SIZE, 4.5 * SIZE, "rgba(74, 52, 40, 0.22)");
    ctx.save();
    ctx.translate(pet.x, pet.y);
    ctx.scale(pet.facing * SIZE, SIZE);
    if (sleeping) {
      drawSleeping(ctx);
    } else if (pet.path.length > 0) {
      drawWalking(ctx);
    } else {
      drawSitting(ctx);
    }
    ctx.restore();
    if (sleeping) drawZ(ctx, pet.x + 12, pet.y - 26);
  }

  // True if the kitten is at a spot of the place on screen (for the word tag).
  function at(x, y) {
    if (!pet || pet.place !== Sims.viewPlace()) return false;
    return x >= pet.x - 22 && x <= pet.x + 22 && y >= pet.y - 42 && y <= pet.y + 6;
  }

  // Its word tag: "Krohna · kitten (KÍ-ten)".
  function word() {
    return { es: "Krohna", en: WORDS.kitten.en, say: WORDS.kitten.say };
  }

  // Where the kitten is ("house" or "city"), for its meow.
  function place() {
    return pet ? pet.place : null;
  }

  return { init: init, update: update, draw: draw, at: at, word: word, place: place };
})();
