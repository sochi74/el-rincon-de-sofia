// 🧰 Hidden treasures: one little chest in each zone of the valley (the Ciudad, the Pradera de flores, the Lago, the Bosque
// encantado, the Montaña and the Cueva). Each one is a small wooden chest with a golden rim and lock, half hidden behind
// something of its zone (bushes, flowers, a rock, ferns, a stone or a cluster of crystals), on a spot that can be reached
// walking. Where each one is comes from CONFIG.treasure; the zones and js/city.js keep feet off it, and Modo decorar never
// moves it (in the city nothing can be put over it or over the way to it).
// ✨ Every 3 to 6 seconds a little golden sparkle twinkles by a closed chest, so it can be found by looking well (in the
// Cueva it shows the same in the dark). Under the mouse (or a finger held still) the chest glows: "Cofre · chest".
// With Sofía or real.fixer selected, a tap on it walks there: "Abriendo 🧰" 3 seconds, then the lid opens with rays of
// golden light, the decoration floats up with little stars and a soft fanfare plays. The sign says what was found and the
// secret word in English, which goes to the 📖 Diario (js/lessons.js). Each chest is found only once: after that it stays
// open and empty ("Ya está vacío 🧰"). Its decoration shows in Sofía's house (js/house.js).
// A new tap cancels; Pausa freezes it; if both go to the same chest, the second one says "Ocupado".
// The 🗺️ Mapa del valle shows a 🧰 on each zone found with its chest still closed, a ✅ once it is open, and
// "🧰 Tesoros: N/6" below (js/valleymap.js). Opening the sixth one shows "🏆 ¡Encontraste todos los tesoros del valle!"
// with a rain of golden stars and the fanfare. Which chests are open is saved with the game.
var Treasure = (function () {
  var C = CONFIG.colors;
  var K = CONFIG.treasure;

  // Each chest: its zone, the decoration it brings (an id of js/house.js and its name for the sign, with the emoji that
  // floats up) and its secret word, with its sentence.
  var CHESTS = [
    { place: "city", deco: "wallClock", name: "Reloj de pared antiguo", emoji: "🕰️",
      word: { en: "secret", es: "secreto", say: "SÍ-kret",
        example: { text: "Can you keep a secret?", subtitle: "¿Puedes guardar un secreto?" } } },
    { place: "meadow", deco: "pressedFlowers", name: "Cuadro de flores prensadas", emoji: "🌼",
      word: { en: "lucky", es: "con suerte", say: "LÁ-ki",
        example: { text: "I feel lucky today!", subtitle: "¡Hoy me siento con suerte!" } } },
    { place: "lake", deco: "shellLamp", name: "Lámpara de conchitas", emoji: "🐚",
      word: { en: "pearl", es: "perla", say: "PERL",
        example: { text: "I found a pearl in a shell.", subtitle: "Encontré una perla en una concha." } } },
    { place: "enchanted", deco: "mushroomLamp", name: "Lámpara de hongo", emoji: "🍄",
      word: { en: "magic", es: "magia", say: "MÁ-yik",
        example: { text: "This forest is full of magic.", subtitle: "Este bosque está lleno de magia." } } },
    { place: "mountain", deco: "woolBlanket", name: "Mantita de lana de cabra", emoji: "🐐",
      word: { en: "brave", es: "valiente", say: "BRÉIV",
        example: { text: "You are so brave!", subtitle: "¡Eres muy valiente!" } } },
    { place: "cave", deco: "geode", name: "Geoda gigante", emoji: "💎",
      word: { en: "shine", es: "brillar", say: "SHÁIN",
        example: { text: "The crystals shine in the dark.", subtitle: "Los cristales brillan en la oscuridad." } } }
  ];

  // The chests already open, by zone.
  var opened = {};
  // What each character is doing with a chest, by id: { sim, place, phase: "walking" | "doing" | "busy", elapsed }
  var current = {};
  // Seconds since each chest opened, while its lid opens and its decoration floats up, by zone.
  var opening = {};
  // The little sparkle of each closed chest: seconds until the next one, how old the one showing is, and where.
  var sparkles = {};
  // Floating texts ("Ya está vacío 🧰"), as { place, x, y, text, age }.
  var pops = [];
  // The zone whose chest is under the mouse, or null.
  var hover = null;
  // Seconds of play: the rays and the stars stand still with Pausa.
  var clock = 0;
  // The signs waiting their turn and the one showing: { kind: "found" | "all", chest, left }.
  var signs = [];
  var sign = null;
  // The rain of golden stars after the sixth chest: each star as { x, y, speed, size, spin, sway }, and how long it lasts.
  var rain = [];
  var rainLeft = 0;
  var signEl, signTop, signBottom;

  function between(min, max) {
    return min + Math.random() * (max - min);
  }

  function chestOf(place) {
    return CHESTS.filter(function (c) { return c.place === place; })[0] || null;
  }

  function spotOf(place) {
    return K.chests[place] || null;
  }

  function inBox(x, y, b) {
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  }

  function init() {
    signEl = document.createElement("div");
    signEl.id = "treasure-sign";
    signEl.hidden = true;
    signTop = document.createElement("div");
    signBottom = document.createElement("div");
    signBottom.className = "treasure-word";
    signEl.appendChild(signTop);
    signEl.appendChild(signBottom);
    document.body.appendChild(signEl);
    CHESTS.forEach(function (c) { sparkles[c.place] = { wait: between(1, K.sparkle.max), age: -1, at: 0 }; });
  }

  // ---------- What can be tapped ----------

  // True if the spot is on the chest of this zone (with what hides it).
  function at(place, x, y) {
    var s = spotOf(place);
    if (!s) return false;
    return inBox(x, y, { x: s.box.x - 4, y: s.box.y - 10, w: s.box.w + 8, h: s.box.h + 14 });
  }

  function setHover(place) {
    hover = place || null;
  }

  function isOpen(place) {
    return !!opened[place];
  }

  function count() {
    return Object.keys(opened).length;
  }

  // ---------- Opening ----------

  function popAt(place, text) {
    var s = spotOf(place);
    pops.push({ place: place, x: s.x, y: s.y - 50, text: text, age: 0 });
  }

  // A tap on the chest: walk next to it, on the side the character comes from (or the other one if there is no room),
  // and open it. An open chest only says it is empty.
  function tap(sim, place) {
    var s = spotOf(place);
    if (!s) return;
    if (opened[place]) {
      sim.path = [];
      popAt(place, "Ya está vacío 🧰");
      return;
    }
    var side = sim.x < s.x ? -1 : 1;
    var spot = standSpot(place, side);
    var other = standSpot(place, -side);
    if (far(spot, s) && !far(other, s)) spot = other;
    current[sim.data.id] = { sim: sim, place: place, phase: "walking", elapsed: 0 };
    Sims.walkTo(sim, spot.x, spot.y);
  }

  function standSpot(place, side) {
    var s = spotOf(place);
    return Path.free(place, s.x + side * (s.box.w / 2 + 22), s.y - 6);
  }

  function far(p, s) {
    return Math.abs(p.x - s.x) > s.box.w / 2 + 60 || Math.abs(p.y - s.y) > 60;
  }

  // Stop what a character is doing with a chest. True if it was doing something.
  function cancel(id) {
    var had = !!current[id];
    delete current[id];
    return had;
  }

  function isActive(id) {
    return !!current[id];
  }

  // True if someone else is opening this same chest.
  function isTaken(a, id) {
    return Object.keys(current).some(function (other) {
      var b = current[other];
      return other !== id && b.phase === "doing" && b.place === a.place;
    });
  }

  function updateOpening(dt, paused) {
    Object.keys(current).forEach(function (id) {
      var a = current[id];
      // Going away or starting to socialize ends it.
      if (a.sim.place !== a.place || Social.isInvolved(id)) {
        delete current[id];
        return;
      }
      if (a.phase === "walking") {
        if (a.sim.path.length > 0) return;
        if (opened[a.place]) {
          delete current[id];
          popAt(a.place, "Ya está vacío 🧰");
          return;
        }
        a.elapsed = 0;
        a.phase = isTaken(a, id) ? "busy" : "doing";
        if (a.phase === "doing") a.sim.facing = spotOf(a.place).x < a.sim.x ? "left" : "right";
        return;
      }
      if (a.phase === "busy") {
        a.elapsed += dt;
        if (a.elapsed >= K.busyTime) delete current[id];
        return;
      }
      if (paused) return;
      a.elapsed += dt;
      if (a.elapsed < K.openTime) return;
      delete current[id];
      open(a.place);
    });
  }

  // The chest opens: its decoration goes to Sofía's house (js/house.js sees it), its secret word to the Diario,
  // and the sign shows. The sixth one also shows that all of them were found.
  function open(place) {
    var chest = chestOf(place);
    opened[place] = true;
    opening[place] = 0;
    Sound.playAt(place, "treasure");
    Lessons.addSecret(chest.word);
    signs.push({ kind: "found", chest: chest });
    if (count() === CHESTS.length) signs.push({ kind: "all" });
  }

  // What to show over a character's head, or null.
  function bubbleFor(id) {
    var a = current[id];
    if (!a || a.phase === "walking") return null;
    if (a.phase === "busy") return { text: "Ocupado", heart: false };
    return { text: "Abriendo 🧰", heart: false };
  }

  // ---------- Signs ----------

  function showSign(next) {
    sign = next;
    if (next.kind === "found") {
      signTop.textContent = "🧰 ¡Tesoro encontrado! " + next.chest.emoji + " " + next.chest.name;
      signBottom.textContent = "📖 Palabra secreta: " + next.chest.word.en + " · " + next.chest.word.es;
      signBottom.hidden = false;
      sign.left = K.signTime;
    } else {
      signTop.textContent = "🏆 ¡Encontraste todos los tesoros del valle!";
      signBottom.hidden = true;
      sign.left = K.allTime;
      startRain();
      Sound.play("treasure");
    }
    // Shown again, so its little pop-in plays each time.
    signEl.hidden = true;
    void signEl.offsetWidth;
    signEl.hidden = false;
    UI.placeSign(signEl);
  }

  function startRain() {
    rain = [];
    for (var i = 0; i < 70; i++) {
      rain.push({ x: Math.random(), y: -between(0, 1.2), speed: between(0.16, 0.3), size: between(5, 10),
        spin: Math.random() * Math.PI * 2, sway: Math.random() * Math.PI * 2 });
    }
    rainLeft = K.allTime;
  }

  // ---------- Every frame ----------

  function update(dt) {
    var paused = Needs.isPaused();
    pops.forEach(function (p) { p.age += dt; });
    pops = pops.filter(function (p) { return p.age < K.popTime; });
    updateOpening(dt, paused);
    if (!sign && signs.length > 0) showSign(signs.shift());
    if (sign) UI.placeSign(signEl);
    if (paused) return;
    clock += dt;
    if (sign) {
      sign.left -= dt;
      if (sign.left <= 0) {
        sign = null;
        signEl.hidden = true;
      }
    }
    Object.keys(opening).forEach(function (place) {
      opening[place] += dt;
      if (opening[place] >= K.anim) delete opening[place];
    });
    CHESTS.forEach(function (c) {
      var sp = sparkles[c.place];
      if (sp.age >= 0) {
        sp.age += dt;
        if (sp.age >= K.sparkle.time) sp.age = -1;
        return;
      }
      sp.wait -= dt;
      if (sp.wait > 0) return;
      sp.wait = between(K.sparkle.min, K.sparkle.max);
      sp.age = 0;
      sp.at = Math.floor(Math.random() * SPARKLE_SPOTS.length);
    });
    if (rainLeft > 0) {
      rainLeft -= dt;
      rain.forEach(function (s) { s.y += s.speed * dt; });
    }
  }

  // ---------- Drawing ----------

  // Where the sparkle may twinkle, from the middle of the bottom of the chest.
  var SPARKLE_SPOTS = [[-14, -36], [17, -30], [24, -14], [-26, -22], [4, -40]];

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
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function ellipse(ctx, x, y, rx, ry, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mix two "#RRGGBB" colors: t = 0 gives a, t = 1 gives b.
  function mix(a, b, t) {
    var out = "#";
    for (var i = 1; i < 7; i += 2) {
      var x = parseInt(a.substr(i, 2), 16), y = parseInt(b.substr(i, 2), 16);
      var v = Math.round(x + (y - x) * t).toString(16);
      out += v.length < 2 ? "0" + v : v;
    }
    return out;
  }

  // The colors of the chest: in the dark Cueva, darker, like everything there (the gold a little less).
  var LIGHT = { wood: K.wood, woodDark: K.woodDark, woodLight: K.woodLight, gold: K.gold, goldLight: K.goldLight,
    goldDark: K.goldDark, inside: "#3A2418" };
  var DARK = {};
  Object.keys(LIGHT).forEach(function (k) {
    DARK[k] = mix(LIGHT[k], "#2C2B32", /^gold/.test(k) ? 0.3 : 0.5);
  });

  function ease(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  // How open the lid is, from 0 (closed) to 1 (open).
  function lidOf(place) {
    if (!opened[place]) return 0;
    return opening[place] === undefined ? 1 : ease(opening[place] / (K.anim * 0.3));
  }

  // The chest, with the middle of its bottom at 0, 0: a wooden box with planks, golden bands and corners, and its lid
  // (closed: rounded, with the golden lock in front; open: leaning back, showing its inside and the empty box).
  function drawChest(ctx, P, lid) {
    ellipse(ctx, 0, 1, 23, 5, "rgba(40, 28, 20, 0.25)");
    if (lid > 0) {
      // The lid leaning back, seen from its inside.
      var top = -21 - 12 - 11 * lid;
      ctx.fillStyle = mix(P.woodLight, P.inside, lid * 0.6);
      ctx.beginPath();
      ctx.moveTo(-19, -21);
      ctx.lineTo(19, -21);
      ctx.lineTo(17, top);
      ctx.quadraticCurveTo(0, top - 5, -17, top);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = P.gold;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    fillRound(ctx, -18, -21, 36, 21, 3, P.wood);
    ctx.strokeStyle = P.woodDark;
    ctx.lineWidth = 1;
    [-14, -7].forEach(function (y) {
      ctx.beginPath();
      ctx.moveTo(-17, y);
      ctx.lineTo(17, y);
      ctx.stroke();
    });
    [-15, 11].forEach(function (x) { ctx.fillStyle = P.gold; ctx.fillRect(x, -21, 4, 21); });
    ctx.fillStyle = P.goldDark;
    ctx.fillRect(-18, -3, 36, 3);
    if (lid > 0) {
      // The open box: dark and empty inside, with a golden rim.
      fillRound(ctx, -17, -24, 34, 6, 2, P.inside);
      ctx.strokeStyle = P.gold;
      ctx.lineWidth = 2;
      roundRect(ctx, -18, -25, 36, 7, 3);
      ctx.stroke();
    } else {
      // The closed lid, rounded on top, with its golden rim, corners and lock.
      ctx.fillStyle = P.woodLight;
      ctx.beginPath();
      ctx.moveTo(-19, -20);
      ctx.lineTo(-19, -29);
      ctx.quadraticCurveTo(0, -38, 19, -29);
      ctx.lineTo(19, -20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = P.gold;
      ctx.fillRect(-19, -22, 38, 3);
      [-15, 11].forEach(function (x) {
        ctx.beginPath();
        ctx.moveTo(x, -20);
        ctx.lineTo(x, -31 + (x < 0 ? 0.5 : 0));
        ctx.lineTo(x + 4, -32);
        ctx.lineTo(x + 4, -20);
        ctx.closePath();
        ctx.fill();
      });
      fillRound(ctx, -5, -25, 10, 11, 2, P.gold);
      circle(ctx, -2, -23, 1.2, P.goldLight);
      circle(ctx, 0, -20.5, 1.6, P.inside);
      ctx.fillStyle = P.inside;
      ctx.fillRect(-0.7, -20.5, 1.4, 3.5);
    }
  }

  // What hides the chest, drawn in front of it (its lower part, more on one side).
  function drawCover(ctx, kind, dark) {
    if (kind === "bush" || kind === "flowers") {
      var g = kind === "bush" ? [C.cityGrassDark, C.sage, C.cityGrassLight] : ["#7FA36A", "#97BC7F", "#B9D59B"];
      [[-17, -7, 15], [-2, -2, 11], [17, -1, 9]].forEach(function (b) { circle(ctx, b[0], b[1], b[2], g[0]); });
      [[-20, -11, 9], [-4, -5, 7], [15, -4, 5]].forEach(function (b) { circle(ctx, b[0], b[1], b[2], g[1]); });
      [[-22, -15, 3.5], [-6, -8, 2.5], [13, -6, 2]].forEach(function (b) { circle(ctx, b[0], b[1], b[2], g[2]); });
      if (kind === "flowers") {
        [[-24, -14, "#F2A9B8"], [-12, -12, "#FFFDF8"], [-17, -3, "#F5D76E"], [3, -6, "#F2A9B8"], [-6, 2, "#C9B3E6"],
          [19, -6, "#FFFDF8"], [14, 2, "#F5D76E"]].forEach(function (f) {
          for (var i = 0; i < 5; i++) {
            var a = i * Math.PI * 2 / 5;
            circle(ctx, f[0] + Math.cos(a) * 2, f[1] + Math.sin(a) * 2, 1.6, f[2]);
          }
          circle(ctx, f[0], f[1], 1.1, "#E2B44B");
        });
      }
      return;
    }
    if (kind === "rock" || kind === "stone") {
      var r = kind === "rock" ? ["#CBBFA9", "#E3D9C6", "#A99C86"] : ["#A9A39A", "#C9C4BB", "#837D74"];
      ellipse(ctx, -12, -1, 19, 6, "rgba(40, 28, 20, 0.2)");
      ctx.fillStyle = r[0];
      ctx.beginPath();
      ctx.moveTo(-31, 0);
      ctx.quadraticCurveTo(-32, -14, -20, -19);
      ctx.quadraticCurveTo(-8, -22, 0, -13);
      ctx.quadraticCurveTo(6, -6, 4, 1);
      ctx.closePath();
      ctx.fill();
      ellipse(ctx, -18, -14, 7, 3.5, r[1]);
      ctx.strokeStyle = r[2];
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-12, -2);
      ctx.quadraticCurveTo(-10, -9, -4, -11);
      ctx.stroke();
      ctx.fillStyle = r[0];
      ctx.beginPath();
      ctx.moveTo(12, 1);
      ctx.quadraticCurveTo(11, -8, 19, -9);
      ctx.quadraticCurveTo(27, -9, 27, 1);
      ctx.closePath();
      ctx.fill();
      ellipse(ctx, 18, -6, 3.5, 1.8, r[1]);
      return;
    }
    if (kind === "ferns") {
      [[-16, 2, -2.3, 22], [-16, 2, -1.9, 26], [-16, 2, -1.4, 22], [-16, 2, -0.9, 16], [-16, 2, -2.8, 15],
        [14, 2, -1.2, 18], [14, 2, -1.8, 21], [14, 2, -0.6, 13]].forEach(function (f, i) {
        ctx.save();
        ctx.translate(f[0], f[1]);
        ctx.rotate(f[2] + Math.PI / 2);
        ellipse(ctx, 0, -f[3] / 2, 4.5, f[3] / 2, i % 2 ? "#3F7A45" : "#4E8E50");
        ctx.strokeStyle = "#2F5E35";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -f[3]);
        ctx.stroke();
        ctx.restore();
      });
      fillRound(ctx, 2, -7, 3, 8, 1.5, "#FFF3DA");
      ellipse(ctx, 3.5, -8, 6, 4, C.terracotta);
      circle(ctx, 2, -9, 1, C.white);
      circle(ctx, 5.5, -8.5, 0.9, C.white);
      return;
    }
    // A little cluster of crystals, glowing with its own light in the dark Cueva.
    var cave = CONFIG.cave;
    [[-20, 1, 26, 7, -0.25, cave.amethyst], [-12, 1, 34, 8, 0.05, cave.amethyst], [-4, 1, 22, 7, 0.35, cave.blue],
      [15, 1, 18, 6, 0.2, cave.blue], [21, 1, 12, 5, 0.5, cave.amethyst]].forEach(function (s) {
      ctx.save();
      ctx.translate(s[0], s[1]);
      ctx.rotate(s[4]);
      ctx.fillStyle = s[5];
      ctx.beginPath();
      ctx.moveTo(-s[3] / 2, 0);
      ctx.lineTo(-s[3] / 2, -s[2] * 0.75);
      ctx.lineTo(0, -s[2]);
      ctx.lineTo(s[3] / 2, -s[2] * 0.75);
      ctx.lineTo(s[3] / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.beginPath();
      ctx.moveTo(-s[3] / 2 + 1, -1);
      ctx.lineTo(-s[3] / 2 + 1, -s[2] * 0.72);
      ctx.lineTo(0, -s[2] + 2);
      ctx.lineTo(-0.5, -1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    if (dark) ellipse(ctx, 0, 2, 26, 4, "rgba(20, 18, 26, 0.5)");
  }

  // A soft glow around the chest under the mouse.
  function drawGlow(ctx) {
    ctx.save();
    ctx.shadowColor = C.cream;
    ctx.shadowBlur = 18;
    ellipse(ctx, 0, -14, 36, 26, "rgba(245, 235, 221, 0.25)");
    ctx.strokeStyle = C.sage;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  // The chest of the zone on screen, with what hides it in front. Drawn over the ground of the zone, before the night tint.
  function draw(ctx, place) {
    var s = spotOf(place);
    if (!s) return;
    var P = place === "cave" ? DARK : LIGHT;
    ctx.save();
    ctx.translate(s.x, s.y);
    if (hover === place) drawGlow(ctx);
    drawChest(ctx, P, lidOf(place));
    drawCover(ctx, s.cover, place === "cave");
    ctx.restore();
  }

  // The outline of the chest and of what hides it, as a few shapes around its bottom middle (each one adds its own path).
  function outline(kind, lid) {
    var shapes = [function (ctx) { ctx.beginPath(); ctx.rect(-20, lid > 0 ? -50 : -38, 40, lid > 0 ? 51 : 39); }];
    var circles = {
      bush: [[-17, -7, 15], [-2, -2, 11], [17, -1, 9], [-22, -14, 6]],
      flowers: [[-17, -7, 15], [-2, -2, 11], [17, -1, 9], [-24, -15, 5]],
      rock: [[-18, -9, 14], [-27, -4, 6], [19, -4, 8]],
      stone: [[-18, -9, 14], [-27, -4, 6], [19, -4, 8]],
      ferns: [[-24, -12, 15], [-36, -6, 7], [16, -10, 12], [26, -6, 7]],
      crystals: [[-20, -14, 10], [-12, -20, 10], [-4, -12, 9], [17, -10, 8], [22, -6, 6]]
    }[kind] || [];
    circles.forEach(function (c) {
      shapes.push(function (ctx) { ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, Math.PI * 2); });
    });
    return shapes;
  }

  // Draws "fn" (someone with its feet at x, y, drawn after the chest) so that the chest of the zone and what hides it
  // cover it when it stands behind them, as if they were drawn in order with the characters (js/sims.js).
  function drawBehind(ctx, place, x, y, fn) {
    var s = spotOf(place);
    if (!s || y >= s.y || Math.abs(x - s.x) > 90 || s.y - y > 140) {
      fn();
      return;
    }
    ctx.save();
    ctx.translate(s.x, s.y);
    outline(s.cover, lidOf(place)).forEach(function (shape) {
      shape(ctx);
      ctx.rect(-2000, -2000, 4000, 4000);
      ctx.clip("evenodd");
    });
    ctx.translate(-s.x, -s.y);
    fn();
    ctx.restore();
  }

  // A soft round light.
  function halo(ctx, x, y, r, color, strength) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace("ALPHA", strength));
    g.addColorStop(1, color.replace("ALPHA", 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // A four-pointed twinkle.
  function twinkle(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fill();
  }

  // Over the night tint (so they shine in the dark and in the Cueva), before the characters: the sparkle of a closed
  // chest, and the rays of golden light of one opening.
  function drawTop(ctx, place) {
    var s = spotOf(place);
    if (!s) return;
    var sp = sparkles[place];
    if (!opened[place] && sp && sp.age >= 0) {
      var t = sp.age / K.sparkle.time, size = Math.sin(t * Math.PI);
      var at = SPARKLE_SPOTS[sp.at];
      var x = s.x + at[0], y = s.y + at[1];
      ctx.save();
      halo(ctx, x, y, 16 * size + 1, "rgba(255, 220, 120, ALPHA)", 0.75);
      twinkle(ctx, x, y, 9 * size, K.goldLight);
      twinkle(ctx, x, y, 4 * size, C.white);
      ctx.restore();
    }
    if (opening[place] === undefined) return;
    var age = opening[place];
    var shine = Math.min(1, age / 0.5) * Math.min(1, (K.anim - age) / 0.8);
    ctx.save();
    ctx.translate(s.x, s.y - 24);
    ctx.globalCompositeOperation = "lighter";
    halo(ctx, 0, -6, 46, "rgba(255, 214, 107, ALPHA)", 0.55 * shine);
    for (var i = 0; i < 7; i++) {
      var a = -Math.PI / 2 + (i - 3) * 0.32 + Math.sin(clock * 2 + i) * 0.04;
      var len = 58 + Math.sin(clock * 5 + i * 1.7) * 8;
      ctx.fillStyle = "rgba(255, 226, 140, " + 0.38 * shine + ")";
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.08) * 6, Math.sin(a - 0.08) * 6);
      ctx.lineTo(Math.cos(a - 0.05) * len, Math.sin(a - 0.05) * len);
      ctx.lineTo(Math.cos(a + 0.05) * len, Math.sin(a + 0.05) * len);
      ctx.lineTo(Math.cos(a + 0.08) * 6, Math.sin(a + 0.08) * 6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // A little five-pointed star.
  function star(ctx, x, y, r, turn) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = turn + i * Math.PI / 5 - Math.PI / 2;
      var d = i % 2 === 0 ? r : r * 0.45;
      ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Over everything (characters too): the decoration floating up out of an opening chest with little stars around it,
  // the floating texts, and the rain of golden stars after the sixth chest.
  function drawPops(ctx, place) {
    var s = spotOf(place);
    if (s && opening[place] !== undefined) {
      var age = opening[place], t = age / K.anim;
      var rise = ease(Math.max(0, (age - 0.25) / (K.anim * 0.6)));
      var fade = Math.min(1, age / 0.4) * Math.min(1, (K.anim - age) / 0.6);
      var y = s.y - 30 - rise * 62;
      ctx.save();
      ctx.globalAlpha = fade;
      halo(ctx, s.x, y - 10, 34, "rgba(255, 236, 170, ALPHA)", 0.7);
      ctx.font = Math.round(30 + rise * 8) + "px " + CONFIG.fontFamily;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(chestOf(place).emoji, s.x, y - 10);
      ctx.fillStyle = K.goldLight;
      ctx.strokeStyle = K.goldDark;
      ctx.lineWidth = 1;
      for (var i = 0; i < 6; i++) {
        var a = clock * 1.6 + i * Math.PI / 3;
        var d = 26 + Math.sin(clock * 3 + i) * 4;
        star(ctx, s.x + Math.cos(a) * d, y - 10 + Math.sin(a) * d * 0.8, 3.5 + (i % 2) * 1.5, a + t * 4);
      }
      ctx.restore();
    }
    pops.forEach(function (p) {
      if (p.place !== place) return;
      var k = p.age / K.popTime;
      ctx.save();
      ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      ctx.font = "bold 20px " + CONFIG.fontFamily;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var ty = p.y - k * 30;
      ctx.lineWidth = 5;
      ctx.strokeStyle = C.darkBrown;
      ctx.strokeText(p.text, p.x, ty);
      ctx.fillStyle = C.cream;
      ctx.fillText(p.text, p.x, ty);
      ctx.restore();
    });
    if (rainLeft > 0) {
      var size = place === "house" ? CONFIG.houseWorld : CONFIG.world;
      ctx.save();
      ctx.globalAlpha = Math.min(1, rainLeft / 0.8);
      ctx.fillStyle = CONFIG.coins.gold;
      ctx.strokeStyle = CONFIG.coins.edge;
      ctx.lineWidth = 1;
      rain.forEach(function (r) {
        if (r.y < 0 || r.y > 1.05) return;
        star(ctx, r.x * size.width + Math.sin(clock * 2 + r.sway) * 10, r.y * size.height, r.size, r.spin + clock * 2);
      });
      ctx.restore();
    }
  }

  // ---------- Words and the Diario ----------

  // The id of the word at a spot of a zone: "Cofre · chest" on its chest.
  function wordAt(place, x, y) {
    return at(place, x, y) ? "chest" : null;
  }

  // The secret word with its sentence, for the Diario, by its English word (null if it is not one).
  function secretWord(en) {
    var key = String(en).toLowerCase();
    var chest = CHESTS.filter(function (c) { return c.word.en === key; })[0];
    return chest ? chest.word : null;
  }

  // The decoration of js/house.js a chest brings, by zone; and whether it is in the house (its chest is open).
  function hasDecoration(id) {
    return CHESTS.some(function (c) { return c.deco === id && !!opened[c.place]; });
  }

  // ---------- Saving ----------

  function get() {
    return { opened: Object.keys(opened) };
  }

  // Used when loading a saved game. An old saved game has every chest closed.
  function set(saved) {
    opened = {};
    if (!saved || typeof saved !== "object" || !Array.isArray(saved.opened)) return;
    saved.opened.forEach(function (place) {
      if (chestOf(place)) opened[place] = true;
    });
  }

  return {
    init: init,
    at: at,
    setHover: setHover,
    isOpen: isOpen,
    count: count,
    total: CHESTS.length,
    tap: tap,
    cancel: cancel,
    isActive: isActive,
    bubbleFor: bubbleFor,
    update: update,
    draw: draw,
    drawBehind: drawBehind,
    drawTop: drawTop,
    drawPops: drawPops,
    wordAt: wordAt,
    secretWord: secretWord,
    hasDecoration: hasDecoration,
    get: get,
    set: set
  };
})();
