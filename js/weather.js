// The weather of each day of the game: at 06:00 the day picks ☀️ Soleado, 🌧️ Lluvia, 🌫️ Niebla mágica or ❄️ Nieve,
// and it lasts until 06:00 the next day. A rainy day rains until 16:00, has a 🌈 rainbow until 18:00 and is sunny after.
// What it changes in the game: the rain waters the garden (js/garden.js), the rain helps fishing and the fog
// grows more crystals in the forest (js/gather.js).
// What it looks like, all drawn with code: in the city rain drops, a grayer sky, rings on the river and puddles
// (in the Pradera de flores of js/meadow.js the rain, the rainbow, the fog, the snowflakes and the white grass too);
// the rainbow; lilac fog with sparkles and floating lights; snowflakes, white roofs and grass, and a snowman in the plaza.
// In the house, what is seen through the windows. Its sounds are in js/audio.js.
// Pausa and Modo decorar freeze it all. Every change shows little by little, in a few seconds.
var Weather = (function () {
  var K = CONFIG.weather;
  var W = CONFIG.world.width, H = CONFIG.world.height;

  // The weather of the day ("sunny", "rain", "fog" or "snow") and the game day it belongs to
  // (the day whose 06:00 picked it: before 06:00 it is still the day before).
  var kind = "sunny";
  var day = weatherDay();
  // How far things went, from 0 to 1: puddles, snow on the roofs and the grass, and the snowman (built, or melting).
  var puddles = 0, snow = 0, snowman = 0;
  // How much of each look shows right now, from 0 to 1, so changes come little by little.
  var look = { rain: 0, rainbow: 0, fog: 0, snowfall: 0 };
  // Seconds of weather so far; it stops with Pausa and Modo decorar, so drops, flakes and lights stand still.
  var clock = 0;
  // Whether the snowman is there and so solid (characters walk around it).
  var standing = false;

  function minute() {
    return Time.get().minute;
  }

  function weatherDay() {
    var t = Time.get();
    return t.minute >= K.dayStart ? t.day : t.day - 1;
  }

  // A new weather for the day, by its chance out of 100.
  function pick() {
    var roll = Math.random() * 100;
    for (var i = 0; i < K.chances.length; i++) {
      roll -= K.chances[i].chance;
      if (roll < 0) return K.chances[i].id;
    }
    return "sunny";
  }

  // ---------- What the weather is now ----------

  function isRaining() {
    var m = minute();
    return kind === "rain" && m >= K.dayStart && m < K.rainEnd;
  }

  function isRainbow() {
    var m = minute();
    return kind === "rain" && m >= K.rainEnd && m < K.rainbowEnd;
  }

  function isFoggy() {
    return kind === "fog";
  }

  function isSnowing() {
    return kind === "snow";
  }

  // The word of the weather right now: after the rain, the rainbow, and then sunny.
  function wordId() {
    if (kind === "rain") return isRaining() ? "rain" : isRainbow() ? "rainbowSky" : "sunny";
    return kind;
  }

  var EMOJI = { sunny: "☀️", rain: "🌧️", rainbowSky: "🌈", fog: "🌫️", snow: "❄️" };

  function emoji() {
    return EMOJI[wordId()];
  }

  // ---------- Every frame ----------

  // Move a value toward a target, all the way in "seconds".
  function toward(value, target, dt, seconds) {
    var step = dt / seconds;
    return value < target ? Math.min(target, value + step) : Math.max(target, value - step);
  }

  function update(dt) {
    if (Needs.isPaused()) return;
    clock += dt;
    var today = weatherDay();
    if (today !== day) {
      day = today;
      kind = pick();
    }
    var raining = isRaining();
    look.rain = toward(look.rain, raining ? 1 : 0, dt, K.fade);
    look.rainbow = toward(look.rainbow, isRainbow() ? 1 : 0, dt, K.rainbowFade);
    look.fog = toward(look.fog, isFoggy() ? 1 : 0, dt, K.fade);
    look.snowfall = toward(look.snowfall, isSnowing() ? 1 : 0, dt, K.fade);
    puddles = toward(puddles, raining ? 1 : 0, dt, raining ? K.puddles.grow : K.puddles.dry);
    if (isSnowing()) {
      snow = toward(snow, 1, dt, K.snow.cover);
      if (snow >= K.snow.snowmanAt) snowman = toward(snowman, 1, dt, K.snow.build);
    } else {
      snow = toward(snow, 0, dt, K.snow.melt);
      snowman = toward(snowman, 0, dt, K.snow.thaw);
    }
    refreshSnowman();
  }

  // When the snowman comes or goes, the ways around it are worked out again, and whoever stands on it steps aside.
  function refreshSnowman() {
    var now = snowman > 0;
    if (now === standing) return;
    standing = now;
    Path.reset();
    if (now) {
      Sims.settle("city");
      Pet.settle("city");
    }
  }

  // ---------- The snowman ----------

  var MAN = K.snowman;

  // True if a spot is on the snowman's bottom ball, plus "clear" around it (for City.isSolid).
  function snowmanBlocks(x, y, clear) {
    if (!standing) return false;
    var r = 14 * MAN.size + clear;
    var dx = x - MAN.x, dy = y - (MAN.y - 8 * MAN.size);
    return dx * dx + dy * dy <= r * r;
  }

  // True if a spot is on the snowman, for its word.
  function snowmanAt(x, y) {
    if (snowman < 0.5) return false;
    var s = MAN.size;
    return x >= MAN.x - 16 * s && x <= MAN.x + 16 * s && y >= MAN.y - 58 * s && y <= MAN.y + 4;
  }

  function circle(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  // Three snow balls with coal eyes, a carrot nose, three buttons and a terracotta scarf.
  // It grows while it is built, and sinks and squashes while it melts.
  function drawSnowman(ctx) {
    if (snowman <= 0) return;
    var C = CONFIG.colors, S = K.colors;
    var melting = !isSnowing();
    ctx.save();
    ctx.translate(MAN.x, MAN.y);
    ctx.scale(MAN.size, MAN.size);
    ctx.globalAlpha = Math.min(1, snowman * 2);
    // Shadow, then the body grows from the ground.
    ctx.fillStyle = "rgba(74, 52, 40, 0.18)";
    ctx.beginPath();
    ctx.ellipse(3, 0, 18 * snowman, 6 * snowman, 0, 0, Math.PI * 2);
    ctx.fill();
    if (melting) {
      ctx.scale(1 + (1 - snowman) * 0.3, snowman);
    } else {
      ctx.scale(snowman, snowman);
    }
    circle(ctx, 0, -13, 14, S.snowShade);
    circle(ctx, -1, -14, 13, S.snow);
    circle(ctx, 0, -33, 10, S.snowShade);
    circle(ctx, -1, -34, 9.2, S.snow);
    circle(ctx, 0, -49, 8, S.snowShade);
    circle(ctx, -0.8, -49.6, 7.3, S.snow);
    // Buttons
    [-38, -31, -24].forEach(function (by) { circle(ctx, 0, by, 1.4, C.darkBrown); });
    // Scarf around the neck, with its end hanging on one side
    ctx.fillStyle = C.terracotta;
    ctx.beginPath();
    ctx.ellipse(0, -42, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(3, -42, 4, 11);
    ctx.fillStyle = "#A9533C";
    ctx.fillRect(3, -33, 4, 2);
    // Eyes and the carrot nose
    circle(ctx, -3, -52, 1.3, C.darkBrown);
    circle(ctx, 3, -52, 1.3, C.darkBrown);
    ctx.fillStyle = S.carrot;
    ctx.beginPath();
    ctx.moveTo(0, -50.5);
    ctx.lineTo(9, -48.5);
    ctx.lineTo(0, -47);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ---------- Small helpers ----------

  // A number from 0 to 1 that always comes out the same for the same "i" and "k".
  function hash(i, k) {
    var s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return s - Math.floor(s);
  }

  // Keep drawing inside the rounded city map.
  function clipCity(ctx) {
    var r = 40;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(W, 0, W, H, r);
    ctx.arcTo(W, H, 0, H, r);
    ctx.arcTo(0, H, 0, 0, r);
    ctx.arcTo(0, 0, W, 0, r);
    ctx.closePath();
    ctx.clip();
  }

  // ---------- The city ground (drawn by js/city.js, under everything that stands) ----------

  // Snow on the grass, before the paths, the river and the plaza are drawn on top.
  function drawSnowyGrass(ctx) {
    if (snow <= 0) return;
    var S = K.colors;
    ctx.save();
    ctx.globalAlpha = snow * 0.7;
    ctx.fillStyle = S.snow;
    ctx.fillRect(0, 0, W, H);
    // Little soft drifts
    ctx.globalAlpha = snow * 0.5;
    ctx.fillStyle = S.snowShade;
    for (var i = 0; i < 70; i++) {
      ctx.beginPath();
      ctx.ellipse(hash(i, 1) * W, hash(i, 2) * H, 9 + hash(i, 3) * 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Rings that grow and fade where the drops fall on the river.
  function drawRiverRings(ctx) {
    if (look.rain <= 0) return;
    ctx.save();
    ctx.strokeStyle = CONFIG.colors.waterLight;
    ctx.lineWidth = 1.6;
    for (var i = 0; i < 18; i++) {
      var t = clock * 0.9 + hash(i, 4);
      var n = Math.floor(t), age = t - n;
      var y = hash(i, n) * H;
      var x = City.riverX(y) + (hash(n, i) - 0.5) * 60;
      ctx.globalAlpha = (1 - age) * 0.9 * look.rain;
      ctx.beginPath();
      ctx.ellipse(x, y, 2 + age * 9, (2 + age * 9) * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Puddles on the grass and on the stones: they grow while it rains and dry up after.
  // Where Modo decorar put a home, a tree or the fountain, there is no puddle.
  function drawPuddles(ctx) {
    if (puddles <= 0) return;
    var C = CONFIG.colors;
    ctx.save();
    K.puddles.spots.forEach(function (p, i) {
      if (City.isWalkable(p.x, p.y) && City.isSolid(p.x, p.y)) return;
      var g = puddles;
      ctx.globalAlpha = Math.min(1, g * 1.5) * 0.85;
      ctx.fillStyle = "#6E9FB8";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r * (0.35 + 0.65 * g) + 1.5, p.r * 0.5 * (0.35 + 0.65 * g) + 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.water;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r * (0.35 + 0.65 * g), p.r * 0.5 * (0.35 + 0.65 * g), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.waterLight;
      ctx.beginPath();
      ctx.ellipse(p.x - p.r * 0.3 * g, p.y - p.r * 0.12 * g, p.r * 0.3 * g, p.r * 0.1 * g, 0, 0, Math.PI * 2);
      ctx.fill();
      // A ring now and then while it rains
      if (look.rain > 0) {
        var t = clock * 1.3 + hash(i, 7), age = t - Math.floor(t);
        ctx.globalAlpha = (1 - age) * look.rain * Math.min(1, g * 2);
        ctx.strokeStyle = C.waterLight;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(p.x + (hash(i, Math.floor(t)) - 0.5) * p.r * 0.6 * g, p.y, 1 + age * 6, (1 + age * 6) * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  // True if a spot of the city is on a puddle that can be seen (for its word, "Charco · puddle").
  function puddleAt(x, y) {
    if (puddles < 0.15) return false;
    return K.puddles.spots.some(function (p) {
      if (City.isWalkable(p.x, p.y) && City.isSolid(p.x, p.y)) return false;
      var rx = p.r * (0.35 + 0.65 * puddles) + 1.5, ry = p.r * 0.5 * (0.35 + 0.65 * puddles) + 1.2;
      var dx = (x - p.x) / rx, dy = (y - p.y) / ry;
      return dx * dx + dy * dy <= 1;
    });
  }

  // White snow on a roof: "shape" draws the roof's outline as a path.
  function roofSnow(ctx, shape) {
    if (snow <= 0) return;
    var S = K.colors;
    ctx.save();
    ctx.globalAlpha = snow * 0.82;
    shape();
    ctx.fillStyle = S.snow;
    ctx.fill();
    ctx.strokeStyle = S.snowShade;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // ---------- Over the city ----------

  // A grayer sky while it rains, and the rainbow. Drawn before the night tint and the signs, so the signs always read well.
  function drawSky(ctx) {
    ctx.save();
    clipCity(ctx);
    if (look.rain > 0) {
      ctx.fillStyle = "rgba(" + K.colors.grayRain + ", " + 0.22 * look.rain + ")";
      ctx.fillRect(0, 0, W, H);
    }
    if (look.rainbow > 0) drawRainbow(ctx);
    ctx.restore();
  }

  // A big see-through arc with the rainbow colors, its ends fading toward the ground.
  function drawRainbow(ctx) {
    var R = K.rainbow;
    var band = R.band;
    ctx.save();
    ctx.globalAlpha = R.alpha * look.rainbow;
    ctx.lineWidth = band + 1;
    R.colors.forEach(function (color, i) {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(R.x, R.y, R.radius - i * band, Math.PI, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  // The magic fog: soft lilac-white clouds drifting slowly, sparkles that twinkle and round lights that float up.
  // Drawn over the night tint, so at night the lights shine more. "dark" goes from 0 (day) to 1 (night).
  function drawFog(ctx, dark) {
    if (look.fog <= 0) return;
    var S = K.colors;
    ctx.save();
    clipCity(ctx);
    // Clouds of fog
    var cloud = 0.34 * look.fog * (1 - 0.45 * dark);
    for (var i = 0; i < 9; i++) {
      var r = 150 + hash(i, 11) * 110;
      var x = (hash(i, 12) * (W + 2 * r) + clock * (6 + hash(i, 13) * 8)) % (W + 2 * r) - r;
      var y = hash(i, 14) * H;
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(" + S.fog + ", " + cloud + ")");
      g.addColorStop(1, "rgba(" + S.fog + ", 0)");
      ctx.fillStyle = g;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1.8, 0.7);
      ctx.translate(-x, -y);
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.restore();
    }
    // Sparkles: little four-point stars that come and go
    ctx.fillStyle = "#FFFFFF";
    for (var s = 0; s < 34; s++) {
      var twinkle = Math.sin(clock * (1.5 + hash(s, 15) * 2) + s * 2.3);
      if (twinkle <= 0) continue;
      var sx = hash(s, 16) * W, sy = hash(s, 17) * H, size = 2 + twinkle * 2.5;
      ctx.globalAlpha = twinkle * look.fog * (0.7 + 0.3 * dark);
      ctx.beginPath();
      ctx.moveTo(sx, sy - size);
      ctx.lineTo(sx + size * 0.3, sy - size * 0.3);
      ctx.lineTo(sx + size, sy);
      ctx.lineTo(sx + size * 0.3, sy + size * 0.3);
      ctx.lineTo(sx, sy + size);
      ctx.lineTo(sx - size * 0.3, sy + size * 0.3);
      ctx.lineTo(sx - size, sy);
      ctx.lineTo(sx - size * 0.3, sy - size * 0.3);
      ctx.closePath();
      ctx.fill();
    }
    // A few round lights floating up, with a glow that is brighter at night
    ctx.globalCompositeOperation = "lighter";
    for (var l = 0; l < 8; l++) {
      var travel = H + 80;
      var ly = H + 40 - (hash(l, 18) * travel + clock * (10 + hash(l, 19) * 8)) % travel;
      var lx = hash(l, 20) * (W - 80) + 40 + Math.sin(clock * 0.6 + l * 1.7) * 18;
      var bright = look.fog * (0.45 + 0.55 * dark) * (0.85 + 0.15 * Math.sin(clock * 2 + l));
      var glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 26);
      glow.addColorStop(0, "rgba(" + S.fogLight + ", " + 0.55 * bright + ")");
      glow.addColorStop(1, "rgba(" + S.fogLight + ", 0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = glow;
      ctx.fillRect(lx - 26, ly - 26, 52, 52);
      ctx.globalAlpha = Math.min(1, bright * 1.2);
      circle(ctx, lx, ly, 4.5, "rgba(" + S.fogLight + ", 1)");
    }
    ctx.restore();
  }

  // Rain drops and snowflakes, over everything in the city (characters too).
  function drawFalling(ctx) {
    if (look.rain <= 0 && look.snowfall <= 0) return;
    var dark = Time.darkness();
    ctx.save();
    clipCity(ctx);
    if (look.rain > 0) {
      ctx.strokeStyle = "rgba(" + K.colors.drop + ", " + (0.55 - 0.15 * dark) * look.rain + ")";
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      var drops = Math.round(160 * look.rain);
      for (var i = 0; i < drops; i++) {
        var speed = 420 + hash(i, 21) * 160;
        var y = (hash(i, 22) * (H + 60) + clock * speed) % (H + 60) - 30;
        var x = ((hash(i, 23) * (W + 120) + y * 0.28) % (W + 120)) - 60;
        ctx.moveTo(x, y);
        ctx.lineTo(x - 4, y - 14);
      }
      ctx.stroke();
    }
    if (look.snowfall > 0) {
      ctx.fillStyle = "#FFFFFF";
      ctx.globalAlpha = look.snowfall * (0.9 - 0.2 * dark);
      var flakes = Math.round(130 * look.snowfall);
      for (var f = 0; f < flakes; f++) {
        var fall = 22 + hash(f, 24) * 26;
        var fy = (hash(f, 25) * (H + 20) + clock * fall) % (H + 20) - 10;
        var fx = hash(f, 26) * W + Math.sin(clock * (0.8 + hash(f, 27)) + f) * 10;
        ctx.beginPath();
        ctx.arc(fx, fy, 1.4 + hash(f, 28) * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // ---------- In the house ----------

  // The glass of the windows of js/house.js (on the outside walls), and the bit of the yard seen outside each one.
  var WINDOWS = [
    { x: 200, y: 32, w: 130, h: 16, out: { x: 200, y: 0, w: 130, h: 34 } },
    { x: 520, y: 32, w: 140, h: 16, out: { x: 520, y: 0, w: 140, h: 34 } },
    { x: 1212, y: 590, w: 16, h: 60, out: { x: 1226, y: 590, w: 34, h: 60 } }
  ];

  // What is seen through the windows: drops running down them, white fog on the glass, or flakes going by.
  function drawWindows(ctx) {
    var rain = look.rain, fog = look.fog, flakes = look.snowfall;
    if (rain <= 0 && fog <= 0 && flakes <= 0) return;
    var S = K.colors;
    WINDOWS.forEach(function (w, n) {
      // The view outside the window
      var o = w.out;
      ctx.save();
      ctx.beginPath();
      ctx.rect(o.x, o.y, o.w, o.h);
      ctx.rect(w.x + 4, w.y + 4, w.w - 8, w.h - 8);
      ctx.clip();
      if (fog > 0) {
        ctx.fillStyle = "rgba(" + S.fog + ", " + 0.75 * fog + ")";
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.fillRect(w.x, w.y, w.w, w.h);
      }
      if (rain > 0) {
        ctx.fillStyle = "rgba(" + S.grayRain + ", " + 0.25 * rain + ")";
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.strokeStyle = "rgba(" + S.windowDrop + ", " + 0.8 * rain + ")";
        ctx.lineWidth = 1.3;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (var i = 0; i < 12; i++) {
          var span = o.h + 20;
          var y = o.y + (hash(i, 30 + n) * span + clock * 160) % span - 10;
          var x = o.x + hash(i, 33 + n) * o.w + (y - o.y) * 0.25;
          ctx.moveTo(x, y);
          ctx.lineTo(x - 2, y - 8);
        }
        ctx.stroke();
      }
      if (flakes > 0) {
        ctx.fillStyle = "rgba(255, 255, 255, " + 0.95 * flakes + ")";
        for (var f = 0; f < 9; f++) {
          var fspan = o.h + 10;
          var fy = o.y + (hash(f, 36 + n) * fspan + clock * 14) % fspan - 5;
          var fx = o.x + hash(f, 39 + n) * o.w + Math.sin(clock + f) * 4;
          ctx.beginPath();
          ctx.arc(fx, fy, 1.6 + hash(f, 42) * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      // Drops running slowly down the glass
      if (rain > 0) {
        ctx.save();
        ctx.fillStyle = "rgba(" + S.windowDrop + ", " + 0.95 * rain + ")";
        for (var d = 0; d < 5; d++) {
          var along = hash(d, 45 + n);
          var run = (hash(d, 48 + n) + clock * (0.25 + hash(d, 51) * 0.3)) % 1;
          var dx, dy;
          if (w.w > w.h) {
            dx = w.x + 6 + along * (w.w - 12);
            dy = w.y + 4 + run * (w.h - 8);
          } else {
            dx = w.x + 4 + along * (w.w - 8);
            dy = w.y + 4 + run * (w.h - 8);
          }
          ctx.beginPath();
          ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    });
  }

  // ---------- Saving ----------

  function get() {
    return { day: day, kind: kind, puddles: puddles, snow: snow, snowman: snowman };
  }

  function unit(v) {
    return typeof v === "number" && isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
  }

  // Used when loading, after the clock. An old saved game (or anything strange) has a sunny day today.
  function set(saved) {
    var today = weatherDay();
    var known = saved && typeof saved === "object" && K.chances.some(function (c) { return c.id === saved.kind; });
    if (known && saved.day === today) {
      kind = saved.kind;
      puddles = unit(saved.puddles);
      snow = unit(saved.snow);
      snowman = unit(saved.snowman);
    } else {
      kind = "sunny";
    }
    day = today;
    // The look is as it was, with nothing coming in slowly.
    look.rain = isRaining() ? 1 : 0;
    look.rainbow = isRainbow() ? 1 : 0;
    look.fog = isFoggy() ? 1 : 0;
    look.snowfall = isSnowing() ? 1 : 0;
    standing = snowman > 0;
  }

  return {
    update: update,
    isRaining: isRaining,
    isFoggy: isFoggy,
    isSnowing: isSnowing,
    emoji: emoji,
    wordId: wordId,
    snowmanBlocks: snowmanBlocks,
    snowmanAt: snowmanAt,
    puddleAt: puddleAt,
    drawSnowman: drawSnowman,
    drawSnowyGrass: drawSnowyGrass,
    drawRiverRings: drawRiverRings,
    drawPuddles: drawPuddles,
    roofSnow: roofSnow,
    drawSky: drawSky,
    drawFog: drawFog,
    drawFalling: drawFalling,
    drawWindows: drawWindows,
    rainLevel: function () { return look.rain; },
    snowLevel: function () { return look.snowfall; },
    get: get,
    set: set
  };
})();
