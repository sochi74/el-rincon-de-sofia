// 🐸 Little frogs on lily pads, in the Lago and in the stream of the Bosque encantado. They are animals, like the ducklings:
// never selected, no chats, no gifts and no Amistad.
// 🍃 Lily pads: 5 round green ones on the water of the Lago (away from the pier, Pacífica's rock and the ducks' way), two
// with a little pink flower, and 3 smaller ones in the stream (away from the little bridge). Each one has its little cut,
// and they rock softly with the waves. Only decoration: a tap on the water by them fishes as always.
// 🐸 Green frogs seen from above, like real ones: long folded back legs with webbed feet, bulging golden eyes, ridges and
// dark blotches on the back, each a little different (bigger or smaller, lighter or darker green). Each game day, in each place, one of them may be a 🌈 colorful frog
// (turquoise with golden dots and lilac legs): it is rare.
// ☀️ Without rain, by day, 2 frogs sit in the Lago and 1 in the stream: they blink, turn a little now and then, and once
// in a long while croak alone. 🌧️ With rain more come, one on each pad, and they sing in chorus: the bubble under their
// chin puffs up and down, green notes ♪ float up and their "croac" sounds one after the other, like a little song, if the place is on
// screen. 🌙 At night the frogs that are there sleep on their pad with their eyes closed (with rain they sing softly).
// 🦘 A tap on one, whoever is selected (nobody walks to it), makes it jump into the water with a "splash" (drops and rings
// on the water) and it is gone; after 5 to 10 seconds it comes back to a free pad with a little hop.
// Pausa and Modo decorar freeze them. They are not saved: on loading they show as the weather and the hour say.
// js/lake.js and js/enchanted.js draw the pads and the frogs over their water; js/main.js sends the taps here first.
var Frogs = (function () {
  var C = CONFIG.colors;
  var K = CONFIG.frogs;
  var PLACES = ["lake", "enchanted"];
  var zones = {};
  // The splashes and little rings on the water, as { place, x, y, age, big }, and the notes of the croaks, as
  // { place, x, y, age, side, soft, glyph }.
  var splashes = [];
  var notes = [];
  // Seconds of play so far: the pads, the frogs and the songs stop with Pausa.
  var clock = 0;
  // The frogs first show on the first update, once the saved game (its weather and its hour) is in.
  var ready = false;

  function between(min, max) {
    return min + Math.random() * (max - min);
  }

  // A number from 0 to 1 that always comes out the same for the same "i" and "k".
  function hash(i, k) {
    var s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return s - Math.floor(s);
  }

  function near(x, y, cx, cy, r) {
    return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r;
  }

  function weatherDay() {
    var t = Time.get();
    return t.minute >= CONFIG.weather.dayStart ? t.day : t.day - 1;
  }

  // Each place: its pads, how big its frogs are, the looks of its frogs (one for each pad: a size and a green), the frogs
  // on the pads now, the ones that jumped in and come back, and the timers of the chorus and of the lonely croaks.
  // A frog: { look, pad, turn, turnTo, turnIn, blink, blinkIn, puff, jump, hop }.
  PLACES.forEach(function (place, n) {
    var Z = K[place];
    var pads = Z.pads.map(function (p, i) {
      var x = place === "lake" ? p.x : Enchanted.streamX(p.y) + p.dx;
      return { x: x, y: p.y, r: p.r, flower: !!p.flower, phase: hash(i, n + 3) * 6.28, cut: hash(i, n + 7) * 6.28 };
    });
    var looks = pads.map(function (p, i) {
      return { size: 0.86 + hash(i, n + 11) * 0.3, shade: Math.floor(hash(i, n + 13) * K.green.length) };
    });
    zones[place] = { place: place, pads: pads, scale: Z.scale, day: Z.day, looks: looks, frogs: [], away: [],
      changeIn: between(K.change.min, K.change.max), croakIn: between(K.croak.min, K.croak.max),
      step: 0, songIn: between(K.rest.min, K.rest.max), colorful: false, colorDay: 0 };
  });

  // How many frogs the place wants now: one on each pad with rain, a few without.
  function wanted(z) {
    return Weather.isRaining() ? z.pads.length : z.day;
  }

  function sleepy() {
    return Time.darkness() > 0.5;
  }

  function isColorful(z, f) {
    return z.colorful && f.look === 0;
  }

  // ---------- Where things are ----------

  // Where a pad is now, rocking softly with the waves.
  function padAt(pad) {
    return {
      x: pad.x + Math.sin(clock * 0.9 + pad.phase) * 1.3,
      y: pad.y + Math.cos(clock * 0.7 + pad.phase) * 1,
      turn: Math.sin(clock * 0.6 + pad.phase) * 0.08
    };
  }

  function freePads(z) {
    var out = [];
    z.pads.forEach(function (p, i) {
      if (!z.frogs.some(function (f) { return f.pad === i; })) out.push(i);
    });
    return out;
  }

  function lookUsed(z, look) {
    return z.frogs.some(function (f) { return f.look === look; }) || z.away.some(function (a) { return a.look === look; });
  }

  // A look nobody has now; the colorful one first, on its day.
  function freeLook(z) {
    if (z.colorful && !lookUsed(z, 0)) return 0;
    var free = [];
    for (var i = 0; i < z.looks.length; i++) if (!lookUsed(z, i)) free.push(i);
    return free.length ? free[Math.floor(Math.random() * free.length)] : -1;
  }

  // A spot of the water by a pad, where a frog lands when it jumps in (or comes from when it hops out).
  function waterBy(z, pad) {
    if (z.place === "enchanted") {
      var y = pad.y + (Math.random() < 0.5 ? -1 : 1) * pad.r * 2.3;
      return { x: Enchanted.streamX(y), y: y };
    }
    for (var i = 0; i < 16; i++) {
      var a = Math.random() * Math.PI * 2, d = pad.r + between(26, 38);
      var x = pad.x + Math.cos(a) * d, y = pad.y + Math.sin(a) * d * 0.8;
      var onPad = z.pads.some(function (p) { return near(x, y, p.x, p.y, p.r + 8); });
      if (Lake.waterAt(x, y) && !onPad) return { x: x, y: y };
    }
    return { x: pad.x, y: pad.y + pad.r + 26 };
  }

  // Where a frog's feet are now: on its pad, along its hop out of the water or its jump into it, and how high it is.
  function frogAt(z, f) {
    var at = padAt(z.pads[f.pad]);
    var feet = { x: at.x, y: at.y + 12 * z.scale, lift: 0, turn: at.turn + f.turn };
    var move = f.jump || f.hop;
    if (!move) return feet;
    var t = Math.min(1, move.t / move.time);
    var from = f.jump ? feet : move.water, to = f.jump ? move.water : feet;
    return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t,
      lift: Math.sin(t * Math.PI) * (f.jump ? 26 : 16) * z.scale, turn: feet.turn };
  }

  // The frog at a spot of a place (around its body), or null. One jumping into the water is not.
  function frogNear(place, x, y) {
    var z = zones[place];
    if (!z) return null;
    for (var i = z.frogs.length - 1; i >= 0; i--) {
      var f = z.frogs[i];
      if (f.jump) continue;
      var at = frogAt(z, f), s = z.scale * z.looks[f.look].size;
      if (near(x, y, at.x, at.y - at.lift - 12 * s, 15 * s + 5)) return f;
    }
    return null;
  }

  function padNear(place, x, y) {
    var z = zones[place];
    if (!z) return null;
    for (var i = 0; i < z.pads.length; i++) {
      var p = z.pads[i];
      if (near(x, y, p.x, p.y, p.r + 2)) return p;
    }
    return null;
  }

  // ---------- What they do ----------

  function newFrog(z, look, pad, hop) {
    var pos = z.pads[pad];
    var f = { look: look, pad: pad, turn: between(-0.3, 0.3), turnTo: 0, turnIn: between(K.turn.min, K.turn.max),
      blink: 0, blinkIn: between(K.blink.min, K.blink.max), puff: 0, jump: null, hop: null };
    f.turnTo = f.turn;
    if (hop) {
      f.hop = { t: 0, time: K.hopTime, water: waterBy(z, pos) };
      splashes.push({ place: z.place, x: f.hop.water.x, y: f.hop.water.y, age: 0, big: false });
    }
    z.frogs.push(f);
    return f;
  }

  // A frog comes to a free pad: with a little hop out of the water, or already sitting there.
  function arrive(z, look, hop) {
    var free = freePads(z);
    if (!free.length || look < 0) return false;
    newFrog(z, look, free[Math.floor(Math.random() * free.length)], hop);
    return true;
  }

  // It jumps into the water; "back" if it comes back after a while (after a tap).
  function jumpIn(z, f, back) {
    if (f.jump) return;
    f.hop = null;
    f.puff = 0;
    f.jump = { t: 0, time: K.jumpTime, water: waterBy(z, z.pads[f.pad]), back: back };
  }

  // A croak: its throat puffs up, a note floats up and the "croac" sounds if the place is on screen.
  // "up" is how many semitones up it goes in the song; bigger frogs croak lower.
  function croak(z, f, up, soft) {
    var at = frogAt(z, f), s = z.scale * z.looks[f.look].size;
    f.puff = 1;
    notes.push({ place: z.place, x: at.x, y: at.y - 32 * s, age: 0, side: between(-1, 1), soft: soft,
      glyph: Math.random() < 0.6 ? "♪" : "♫" });
    Sound.croak(z.place, up + (1 - s) * 14, soft);
  }

  // A new game day picks whether one frog of the place is colorful today. If the frogs are already there, one of them
  // becomes it (at 06:00, while they sleep).
  function checkDay(z) {
    var today = weatherDay();
    if (z.colorDay === today) return;
    z.colorDay = today;
    z.colorful = Math.random() < K.colorful;
    if (!z.colorful || lookUsed(z, 0) || !z.frogs.length) return;
    z.frogs[Math.floor(Math.random() * z.frogs.length)].look = 0;
  }

  function fill(z) {
    checkDay(z);
    while (z.frogs.length < wanted(z) && arrive(z, freeLook(z), false)) { /* one more */ }
  }

  function updateZone(z, dt) {
    checkDay(z);
    var raining = Weather.isRaining(), sleeping = sleepy();

    // The ones that jumped in after a tap come back to a free pad with a little hop.
    z.away.forEach(function (a) { a.left -= dt; });
    z.away = z.away.filter(function (a) {
      if (a.left > 0) return true;
      if (arrive(z, a.look, true)) return false;
      a.left = 1;
      return true;
    });

    // When the rain starts more frogs come, one by one, and when it ends they go back into the water.
    var count = z.frogs.length + z.away.length, want = wanted(z);
    if (count > want && z.away.length) {
      z.away.pop();
    } else if (count !== want && !(sleeping && !raining)) {
      z.changeIn -= dt;
      if (z.changeIn <= 0) {
        z.changeIn = between(K.change.min, K.change.max);
        if (count < want) {
          arrive(z, freeLook(z), true);
        } else {
          var sitting = z.frogs.filter(function (f) { return !f.jump && !f.hop; });
          if (sitting.length) jumpIn(z, sitting[Math.floor(Math.random() * sitting.length)], false);
        }
      }
    }

    z.frogs.forEach(function (f) {
      if (f.puff > 0) f.puff = Math.max(0, f.puff - dt / 0.38);
      if (f.blink > 0) f.blink -= dt;
      f.blinkIn -= dt;
      if (f.blinkIn <= 0) {
        f.blink = 0.16;
        f.blinkIn = between(K.blink.min, K.blink.max);
      }
      // Now and then it turns a little, by day.
      f.turnIn -= dt;
      if (f.turnIn <= 0) {
        f.turnIn = between(K.turn.min, K.turn.max);
        if (!sleeping) f.turnTo = between(-0.35, 0.35);
      }
      f.turn += (f.turnTo - f.turn) * Math.min(1, dt * 3);
      if (f.hop) {
        f.hop.t += dt;
        if (f.hop.t >= f.hop.time) f.hop = null;
      }
      if (f.jump) f.jump.t += dt;
    });
    // Landing in the water: a splash, and it is gone.
    z.frogs = z.frogs.filter(function (f) {
      if (!f.jump || f.jump.t < f.jump.time) return true;
      splashes.push({ place: z.place, x: f.jump.water.x, y: f.jump.water.y, age: 0, big: true });
      Sound.playAt(z.place, "splash");
      if (f.jump.back) z.away.push({ look: f.look, left: between(K.back.min, K.back.max) });
      return false;
    });

    var singers = z.frogs.filter(function (f) { return !f.jump && !f.hop; })
      .sort(function (a, b) { return a.pad - b.pad; });
    if (raining) {
      // The chorus: one croak after the other, along the little song, then a rest. At night, softly.
      z.songIn -= dt;
      if (z.songIn > 0) return;
      if (!singers.length) {
        z.songIn = 1;
        return;
      }
      var step = K.song[z.step];
      croak(z, singers[z.step % singers.length], step[1], sleeping);
      z.songIn = step[0];
      z.step += 1;
      if (z.step >= K.song.length) {
        z.step = 0;
        z.songIn += between(K.rest.min, K.rest.max);
      }
      return;
    }
    z.step = 0;
    // Without rain, by day, one croaks alone once in a long while.
    z.croakIn -= dt;
    if (z.croakIn <= 0) {
      z.croakIn = between(K.croak.min, K.croak.max);
      if (!sleeping && singers.length) croak(z, singers[Math.floor(Math.random() * singers.length)], 0, false);
    }
  }

  function update(dt) {
    if (!ready) {
      ready = true;
      PLACES.forEach(function (place) { fill(zones[place]); });
    }
    if (Needs.isPaused()) return;
    clock += dt;
    splashes.forEach(function (s) { s.age += dt; });
    splashes = splashes.filter(function (s) { return s.age < K.splashTime; });
    notes.forEach(function (n) { n.age += dt; });
    notes = notes.filter(function (n) { return n.age < 1.8; });
    PLACES.forEach(function (place) { updateZone(zones[place], dt); });
  }

  // ---------- Taps and words ----------

  // True if a frog is at a spot of the place (for the pointer and the taps of js/main.js).
  function at(place, x, y) {
    return !!frogNear(place, x, y);
  }

  // A tap on a frog makes it jump into the water; it comes back after a while.
  function tap(place, x, y) {
    var f = frogNear(place, x, y);
    if (f) jumpIn(zones[place], f, true);
    return !!f;
  }

  // The id of the word for a note, a splash, a frog or a lily pad at a spot of the place, or null.
  function wordAt(place, x, y) {
    for (var i = notes.length - 1; i >= 0; i--) {
      var n = notes[i];
      if (n.place === place && near(x, y, noteX(n), noteY(n), 13)) return "ribbit";
    }
    for (var j = splashes.length - 1; j >= 0; j--) {
      var s = splashes[j];
      if (s.place === place && s.big && near(x, y, s.x, s.y, 30)) return "splash";
    }
    var f = frogNear(place, x, y);
    if (f) return isColorful(zones[place], f) ? "colorfulFrog" : "frog";
    return padNear(place, x, y) ? "lilyPad" : null;
  }

  // ---------- Drawing ----------

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

  // A round lily pad with its little cut and veins, a soft shadow on the water, and maybe a little pink flower.
  function drawPad(ctx, pad) {
    var at = padAt(pad), r = pad.r;
    ctx.save();
    ctx.translate(at.x, at.y);
    ellipse(ctx, 2, 3, r + 1, r * 0.8 + 1, "rgba(30, 70, 90, 0.18)");
    ctx.scale(1, 0.8);
    ctx.rotate(pad.cut + at.turn);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, 0.3, Math.PI * 2 - 0.3);
    ctx.closePath();
    ctx.fillStyle = K.pad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = K.padDark;
    ctx.stroke();
    // The veins, from the middle out.
    ctx.strokeStyle = "rgba(60, 110, 50, 0.55)";
    ctx.lineWidth = 1;
    for (var i = 1; i < 7; i++) {
      var a = 0.3 + i * (Math.PI * 2 - 0.6) / 7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.15, Math.sin(a) * r * 0.15);
      ctx.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85);
      ctx.stroke();
    }
    // A little light on its top edge.
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, Math.PI * 0.9, Math.PI * 1.45);
    ctx.strokeStyle = K.padLight;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    if (pad.flower) drawFlower(ctx, at.x + r * 0.55, at.y + r * 0.32, r / 25);
  }

  // A little pink water flower: two rings of pointed petals and a yellow middle.
  function drawFlower(ctx, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    [[7, 8, K.flower, 0], [5, 6, K.flowerLight, Math.PI / 6]].forEach(function (ring) {
      for (var i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate(ring[3] + i * Math.PI / 3);
        ctx.beginPath();
        ctx.ellipse(0, -ring[0] * 0.6, ring[1] * 0.35, ring[0] * 0.75, 0, 0, Math.PI * 2);
        ctx.fillStyle = ring[2];
        ctx.fill();
        ctx.restore();
      }
    });
    circle(ctx, 0, 0, 2.6, "#F5D76E");
    ctx.restore();
  }

  // A webbed foot: a few long thin toes fanning out from "x", "y" toward "angle", with the web between them.
  function drawFoot(ctx, x, y, angle, toes, length, color, web) {
    var spread = 0.32;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (var i = 0; i < toes; i++) {
      var a = angle + (i - (toes - 1) / 2) * spread;
      ctx.lineTo(x + Math.cos(a) * length * 0.7, y + Math.sin(a) * length * 0.7);
    }
    ctx.closePath();
    ctx.fillStyle = web;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = 1.3;
    for (var j = 0; j < toes; j++) {
      var b = angle + (j - (toes - 1) / 2) * spread;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(b) * length, y + Math.sin(b) * length);
      ctx.stroke();
      circle(ctx, x + Math.cos(b) * length, y + Math.sin(b) * length, 0.9, color);
    }
  }

  // A frog seen from above, its snout toward the top: long back legs folded at its sides (stretched out while it jumps)
  // with webbed feet, thin front legs with long toes, a body narrow at the snout and wide at the back, two ridges and dark
  // blotches on its back, nostrils, and bulging golden eyes at the sides of the head with a dark pupil across. When it
  // croaks, a pale throat bubble swells under its chin. The colorful one is turquoise with golden dots and lilac legs.
  function drawFrog(ctx, z, f) {
    var at = frogAt(z, f), s = z.scale * z.looks[f.look].size;
    var colorful = isColorful(z, f), shade = z.looks[f.look].shade;
    var body = colorful ? K.colorBody : K.green[shade];
    var ridge = colorful ? K.colorBelly : K.belly[shade];
    var legs = colorful ? K.colorLegs : body;
    var dark = colorful ? "rgba(30, 90, 90, 0.5)" : K.spots;
    var line = "rgba(28, 38, 16, 0.85)";
    var leap = f.jump || f.hop ? 1 : 0;
    // Its shadow stays on the pad (or the water) while it jumps.
    ellipse(ctx, at.x + 1.5 * s, at.y - 10 * s, 13 * s * (1 - at.lift / 60), 10 * s, "rgba(15, 35, 20, 0.35)");
    ctx.save();
    ctx.translate(at.x, at.y - at.lift - 12 * s);
    ctx.scale(s, s);
    ctx.rotate(at.turn);
    ctx.translate(0, 12);
    ctx.lineJoin = "round";
    // The back legs: the thigh going back from the hip, the shin folded forward along the body, and the webbed foot.
    [-1, 1].forEach(function (side) {
      var hip = { x: side * 8, y: -5 }, knee = { x: side * (15 + leap * 3), y: 1 + leap * 9 };
      var ankle = { x: side * (9 + leap * 3), y: -8 + leap * 20 };
      // A dark edge first, so the legs show on the green pad.
      ctx.lineCap = "round";
      [[line, 1.8], [legs, 0]].forEach(function (pass) {
        ctx.strokeStyle = pass[0];
        ctx.lineWidth = 6 + pass[1];
        ctx.beginPath();
        ctx.moveTo(hip.x, hip.y);
        ctx.lineTo(knee.x, knee.y);
        ctx.stroke();
        ctx.lineWidth = 4 + pass[1];
        ctx.beginPath();
        ctx.moveTo(knee.x, knee.y);
        ctx.lineTo(ankle.x, ankle.y);
        ctx.stroke();
      });
      // Dark bands across the thigh.
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1.4;
      [0.35, 0.7].forEach(function (t) {
        var bx = hip.x + (knee.x - hip.x) * t, by = hip.y + (knee.y - hip.y) * t;
        ctx.beginPath();
        ctx.moveTo(bx - 2, by + side * 2);
        ctx.lineTo(bx + 2, by - side * 2);
        ctx.stroke();
      });
      var footAngle = leap ? Math.PI / 2 : (side < 0 ? Math.PI * 1.25 : -Math.PI * 0.25);
      drawFoot(ctx, ankle.x, ankle.y, footAngle, 4, 7, legs, colorful ? "rgba(201, 168, 232, 0.6)" : "rgba(60, 90, 40, 0.45)");
    });
    // The front legs: thin, from the shoulders out and forward, with long toes.
    [-1, 1].forEach(function (side) {
      var shoulder = { x: side * 6, y: -15 }, elbow = { x: side * 12, y: -12 + leap * 2 }, hand = { x: side * 12, y: -18 + leap * 3 };
      ctx.lineCap = "round";
      [[line, 4.6], [legs, 3]].forEach(function (pass) {
        ctx.strokeStyle = pass[0];
        ctx.lineWidth = pass[1];
        ctx.beginPath();
        ctx.moveTo(shoulder.x, shoulder.y);
        ctx.lineTo(elbow.x, elbow.y);
        ctx.lineTo(hand.x, hand.y);
        ctx.stroke();
      });
      drawFoot(ctx, hand.x, hand.y, -Math.PI / 2 + side * 0.9, 4, 4, legs, "rgba(0, 0, 0, 0)");
    });
    // The throat bubble under the chin, swelling and going down when it croaks.
    if (f.puff > 0) {
      var puff = Math.sin(f.puff * Math.PI);
      ctx.beginPath();
      ctx.ellipse(0, -25, 4 + puff * 5, 3 + puff * 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = colorful ? K.colorBelly : K.throat;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // The body: narrow at the snout, wide at the back.
    ctx.beginPath();
    ctx.moveTo(0, -29);
    ctx.bezierCurveTo(5, -29, 9, -24, 9.5, -17);
    ctx.bezierCurveTo(10.5, -10, 12, -4, 9, 0);
    ctx.bezierCurveTo(6, 3, -6, 3, -9, 0);
    ctx.bezierCurveTo(-12, -4, -10.5, -10, -9.5, -17);
    ctx.bezierCurveTo(-9, -24, -5, -29, 0, -29);
    ctx.closePath();
    ctx.fillStyle = body;
    ctx.fill();
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Blotches on its back (golden dots on the colorful one).
    if (colorful) {
      [[-4, -12], [4, -9], [-5, -4], [5, -3], [0, -16], [1, -6], [-2, -20], [3, -19]].forEach(function (d) {
        circle(ctx, d[0], d[1], 1.2, K.colorDots);
      });
    } else {
      [[-3.5, -11, 2.4], [4, -8, 2.2], [-4.5, -3.5, 2], [3.5, -2, 1.8], [0.5, -15, 1.6]].forEach(function (d) {
        ctx.beginPath();
        ctx.ellipse(d[0], d[1], d[2], d[2] * 0.75, 0.4, 0, Math.PI * 2);
        ctx.fillStyle = dark;
        ctx.fill();
      });
    }
    // The two ridges along its back, from behind the eyes.
    ctx.strokeStyle = ridge;
    ctx.lineWidth = 1.2;
    [-1, 1].forEach(function (side) {
      ctx.beginPath();
      ctx.moveTo(side * 5.5, -19);
      ctx.quadraticCurveTo(side * 7.5, -9, side * 6, -1);
      ctx.stroke();
    });
    // The nostrils.
    circle(ctx, -1.6, -26.5, 0.6, line);
    circle(ctx, 1.6, -26.5, 0.6, line);
    // The bulging eyes at the sides of the head: golden with a dark pupil across, or with the lid down while it blinks
    // or sleeps (singing at night, they open).
    var closed = f.blink > 0 || (sleepy() && f.puff <= 0);
    [-1, 1].forEach(function (side) {
      var ex = side * 6.8, ey = -21;
      circle(ctx, ex, ey, 3.6, body);
      ctx.beginPath();
      ctx.arc(ex, ey, 3.6, 0, Math.PI * 2);
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.stroke();
      if (closed) {
        ctx.beginPath();
        ctx.moveTo(ex - 2.6, ey);
        ctx.lineTo(ex + 2.6, ey);
        ctx.stroke();
      } else {
        circle(ctx, ex, ey, 2.7, K.eye);
        ctx.beginPath();
        ctx.ellipse(ex, ey, 1.9, 0.9, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#151510";
        ctx.fill();
        circle(ctx, ex - side * 0.9, ey - 1.1, 0.5, "rgba(255, 255, 255, 0.85)");
      }
    });
    ctx.restore();
  }

  // The pads of the place and the frogs on them (and hopping), whoever is lower last. Called by js/lake.js and
  // js/enchanted.js over their water.
  function draw(ctx, place) {
    var z = zones[place];
    if (!z) return;
    z.pads.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (p) { drawPad(ctx, p); });
    z.frogs.slice().sort(function (a, b) { return frogAt(z, a).y - frogAt(z, b).y; })
      .forEach(function (f) { drawFrog(ctx, z, f); });
  }

  function noteX(n) {
    var t = n.age / 1.8;
    return n.x + n.side * 16 * t + Math.sin(t * 8 + n.side * 3) * 4;
  }

  function noteY(n) {
    return n.y - n.age / 1.8 * 42;
  }

  // Over the night tint: the splashes (drops and rings on the water) and the green notes of the croaks.
  function drawTop(ctx, place) {
    splashes.forEach(function (s) {
      if (s.place !== place) return;
      var t = s.age / K.splashTime, size = s.big ? 1 : 0.55;
      ctx.save();
      ctx.strokeStyle = C.waterLight;
      [0, 0.25].forEach(function (d) {
        var u = (t - d) / (1 - d);
        if (u <= 0) return;
        ctx.globalAlpha = 0.85 * (1 - u);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, (6 + u * 24) * size, (3 + u * 11) * size, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
      // The drops fly up and out, only at the start of a big splash.
      if (s.big && t < 0.45) {
        var u2 = t / 0.45;
        ctx.globalAlpha = 1 - u2;
        for (var i = 0; i < 7; i++) {
          var a = Math.PI + i * Math.PI / 6;
          circle(ctx, s.x + Math.cos(a) * u2 * 18, s.y + Math.sin(a) * u2 * 12 - Math.sin(u2 * Math.PI) * 14, 2, C.white);
        }
      }
      ctx.restore();
    });
    notes.forEach(function (n) {
      if (n.place !== place) return;
      var t = n.age / 1.8;
      ctx.save();
      ctx.globalAlpha = (t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85) * (n.soft ? 0.6 : 1);
      ctx.font = "700 " + Math.round((n.soft ? 12 : 15) + t * 4) + "px " + CONFIG.fontFamily;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 3;
      ctx.strokeStyle = C.cream;
      ctx.strokeText(n.glyph, noteX(n), noteY(n));
      ctx.fillStyle = K.note;
      ctx.fillText(n.glyph, noteX(n), noteY(n));
      ctx.restore();
    });
  }

  return {
    update: update,
    at: at,
    tap: tap,
    wordAt: wordAt,
    draw: draw,
    drawTop: drawTop
  };
})();
