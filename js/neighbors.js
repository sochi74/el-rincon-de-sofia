// The neighbors: Lumi, the fairy, Vladi, the vampire who is afraid of the dark, and Professor Hoot, the fox librarian.
// They live in the city (their homes are drawn in js/city.js), walk around on their own going around obstacles (js/path.js)
// and are never selected.
// Lumi flies around the city day and night, flapping her wings, and at night leaves a little trail of golden sparkles.
// Vladi stays in his castle by day ("Zzz" come out of its window); from 19:00 to 07:00 he walks slowly near his castle,
// the plaza and the campfire, and now and then he stops, shakes and hugs his teddy bear.
// Professor Hoot never walks: from 08:00 to 18:00 he stands by the door of his hollow tree reading his book, and now and then
// turns a page or fixes his glasses; the rest of the time he sleeps inside ("Zzz" come out of its window).
// He teaches the word of the day (js/lessons.js).
// At night Lumi sometimes flies over to where Vladi is (more often when they may chat again), so they meet.
// At night, when they come close to each other, Lumi and Vladi sometimes stop, look at each other and chat on their own
// (greeting and chat phrases), which gives both a little Amistad. Tapping one of them ends that chat.
// Sofía or real.fixer can talk with them and give them gifts (js/social.js and js/gifts.js). Pausa freezes their walks and chats.
var Neighbors = (function () {
  var K = CONFIG.neighbors;
  var P = Sims.parts;
  var list = [];
  // Lumi's trail of sparkles at night, as { x, y, age, size }.
  var trail = [];
  // Lumi and Vladi chatting on their own, or null: { a, b, lines: [{ n, phrase }], index, elapsed };
  // and seconds of play until they may chat again.
  var chat = null;
  var chatWait = between(K.chat.wait.min, K.chat.wait.max);

  function between(min, max) {
    return min + Math.random() * (max - min);
  }

  function init() {
    list = neighborCharacters().map(function (data, i) {
      var cfg = K[data.id];
      return {
        data: data,
        look: CONFIG.characterLooks[data.id],
        cfg: cfg,
        place: "city",
        x: cfg.home.x,
        y: cfg.home.y,
        path: [],
        // Making way for the others (js/sims.js).
        wait: 0,
        waited: 0,
        pass: 0,
        retry: 0,
        waitingFor: null,
        facing: "front",
        blink: 0,
        blinkWait: 2 + i * 1.7 + Math.random() * 2,
        breath: Math.random() * Math.PI * 2,
        flap: Math.random() * Math.PI,
        stepPhase: 0,
        // Seconds left to stay at the spot it is at, and the spot it came from (so it never picks it twice in a row).
        stay: between(cfg.stay.min, cfg.stay.max),
        lastSpot: 0,
        walking: false,
        // Vladi: inside his castle, on his way in, and seconds left shaking with his bubble.
        // Professor Hoot: inside his hollow tree, and his reading (seconds until he turns a page or fixes his glasses,
        // which one, and seconds left doing it).
        inside: sleepsNow(data.id),
        readWait: cfg.read ? between(cfg.read.min, cfg.read.max) : 0,
        readMove: null,
        readTime: 0,
        goingIn: false,
        scared: 0,
        fear: null,
        trailWait: 0
      };
    });
  }

  // True when this neighbor is asleep at home right now: Vladi by day, Professor Hoot out of his hours.
  function sleepsNow(id) {
    if (id === "vladi") return Time.isDay();
    if (id === "hoot") return !hootAwake();
    return false;
  }

  function hootAwake() {
    var a = K.hoot.awake, minute = Time.get().minute;
    return minute >= a.from && minute < a.to;
  }

  // ---------- Walking ----------

  // Like Sofía and real.fixer, they go around the others and wait when there is no room (js/sims.js), and never end
  // a walk standing on someone.
  function walk(n, x, y) {
    Sims.wayTo(n, x, y);
    n.walking = true;
  }

  function move(n, dt) {
    var fromX = n.x, fromY = n.y;
    Sims.stepAlong(n, n.cfg.speed, dt);
    n.stepPhase = Sims.isWalking(n) ? n.stepPhase + dt * 9 : 0;
    Sims.turn(n, n.x - fromX, n.y - fromY);
  }

  // Blinking, breathing and Lumi's wings. They go on even with Pausa.
  function live(n, dt) {
    var a = CONFIG.alive;
    n.breath += dt * a.breathe.speed;
    n.flap += dt * 13;
    if (n.blink > 0) n.blink -= dt;
    n.blinkWait -= dt;
    if (n.blinkWait <= 0) {
      n.blink = a.blink.length;
      n.blinkWait = between(a.blink.min, a.blink.max);
    }
  }

  // Off to another of its spots, never the one it just left.
  // At night Lumi sometimes goes to where Vladi is instead (by his castle, the plaza or the campfire), stopping a little
  // before him.
  function next(n) {
    var vladi = byId("vladi");
    if (n.data.id === "lumi" && vladi && !vladi.inside && !vladi.goingIn && !Time.isDay() &&
      Math.random() < (chatWait > 0 ? K.lumi.seek.chance : K.lumi.seek.ready)) {
      var side = n.x < vladi.x ? -1 : 1;
      var spot = Path.free("city", vladi.x + side * K.lumi.seek.gap, vladi.y);
      walk(n, spot.x, spot.y);
      return;
    }
    var spots = n.cfg.spots;
    var i = Math.floor(Math.random() * (spots.length - 1));
    if (i >= n.lastSpot) i++;
    n.lastSpot = i;
    walk(n, spots[i].x, spots[i].y);
  }

  // When it gets to a spot it stays a while there; at night Vladi sometimes gets scared.
  function arrive(n) {
    n.walking = false;
    n.stay = between(n.cfg.stay.min, n.cfg.stay.max);
    if (n.data.id === "vladi" && Math.random() < n.cfg.scared.chance) {
      n.scared = n.cfg.scared.time;
      n.fear = Math.random() < 0.5 ? { text: "😨", heart: false } :
        { text: "Is it dark in here?", subtitle: "¿Está oscuro aquí?", heart: false, speech: true };
    }
  }

  // Vladi by day: he walks back to his castle and goes in; at night he comes out by its door.
  // True while he is inside or on his way in.
  function schedule(n) {
    var day = Time.isDay();
    if (n.inside) {
      if (day) return true;
      n.inside = false;
      n.x = n.cfg.home.x;
      n.y = n.cfg.home.y;
      n.facing = "front";
      n.lastSpot = 0;
      n.stay = between(n.cfg.stay.min, n.cfg.stay.max);
      return false;
    }
    if (!day) {
      n.goingIn = false;
      return false;
    }
    n.scared = 0;
    n.fear = null;
    if (!n.goingIn) {
      n.goingIn = true;
      walk(n, n.cfg.home.x, n.cfg.home.y);
    } else if (n.path.length === 0) {
      n.goingIn = false;
      n.walking = false;
      n.inside = true;
    }
    return true;
  }

  // Professor Hoot: in his hours he comes out by his door and reads, else he goes in to sleep (he is right by his door).
  // True while he is inside.
  function hootDay(n, dt) {
    var awake = hootAwake();
    if (n.inside && awake) {
      n.inside = false;
      n.x = n.cfg.home.x;
      n.y = n.cfg.home.y;
      n.facing = "front";
    } else if (!n.inside && !awake) {
      n.inside = true;
      n.readMove = null;
    }
    if (n.inside) return true;
    n.facing = "front";
    if (n.readMove) {
      n.readTime -= dt;
      if (n.readTime <= 0) n.readMove = null;
      return false;
    }
    n.readWait -= dt;
    if (n.readWait <= 0) {
      n.readMove = Math.random() < 0.6 ? "page" : "glasses";
      n.readTime = n.cfg.read.time;
      n.readWait = between(n.cfg.read.min, n.cfg.read.max);
    }
    return false;
  }

  // ---------- Chatting with each other ----------

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  // True if a neighbor is with Sofía or real.fixer: talking, getting a gift, teaching the word of the day,
  // or with the social menu open over it.
  function withPlayer(n) {
    var id = n.data.id;
    return Social.isInvolved(id) || Gifts.isInvolved(id) || Lessons.isInvolved(id) || Sims.menuTarget() === n;
  }

  // At night, both outside, close to each other and free: they may start a chat.
  function canChat(a, b) {
    if (Time.isDay() || a.inside || b.inside || a.goingIn || b.goingIn || withPlayer(a) || withPlayer(b)) return false;
    var dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy <= K.chat.near * K.chat.near;
  }

  // 2 or 3 lines, taking turns: a greeting first, then chat phrases.
  function startChat(a, b) {
    var lines = [{ n: a, phrase: randomItem(a.data.phrases.greeting) }, { n: b, phrase: randomItem(b.data.phrases.chat) }];
    if (Math.random() < 0.5) lines.push({ n: a, phrase: randomItem(a.data.phrases.chat) });
    [a, b].forEach(function (n) {
      n.path = [];
      n.walking = false;
      n.scared = 0;
      n.fear = null;
    });
    chat = { a: a, b: b, lines: lines, index: 0, elapsed: 0 };
  }

  // The chat ends: on its last line it gives Amistad to both (js/social.js celebrates a new level).
  function endChat(finished) {
    if (finished) {
      Social.addFriendship(chat.a.data.id, chat.b.data.id, K.chat.friendship);
      Social.addFriendship(chat.b.data.id, chat.a.data.id, K.chat.friendship);
    }
    chat = null;
    chatWait = between(K.chat.wait.min, K.chat.wait.max);
  }

  function chatStep(dt) {
    if (chat) {
      // Tapped by the player, a gift, or the sun coming up: the chat ends right away.
      if (withPlayer(chat.a) || withPlayer(chat.b) || Time.isDay()) {
        endChat(false);
        return;
      }
      chat.a.facing = chat.b.x >= chat.a.x ? "right" : "left";
      chat.b.facing = chat.a.x >= chat.b.x ? "right" : "left";
      chat.elapsed += dt;
      var line = chat.lines[chat.index];
      var s = CONFIG.social;
      if (chat.elapsed < Math.min(s.lineMax, s.lineMin + line.phrase.text.length * s.lineExtraPerLetter)) return;
      chat.index++;
      chat.elapsed = 0;
      if (chat.index >= chat.lines.length) endChat(true);
      return;
    }
    chatWait = Math.max(0, chatWait - dt);
    var lumi = byId("lumi"), vladi = byId("vladi");
    if (chatWait > 0 || !lumi || !vladi || !canChat(lumi, vladi)) return;
    if (Math.random() < 0.5) startChat(lumi, vladi); else startChat(vladi, lumi);
  }

  // The line a neighbor is saying in its chat with the other one, or null.
  function chatBubble(n) {
    if (!chat) return null;
    var line = chat.lines[chat.index];
    return line.n === n ? { text: line.phrase.text, subtitle: line.phrase.subtitle, heart: false, speech: true } : null;
  }

  function isChatting(n) {
    return !!chat && (chat.a === n || chat.b === n);
  }

  function update(dt) {
    if (!Needs.isPaused()) chatStep(dt);
    list.forEach(function (n) {
      live(n, dt);
      if (Needs.isPaused()) return;
      var id = n.data.id;
      var busy = withPlayer(n) || isChatting(n);
      if (busy) {
        // Talking, getting a gift or chatting with the other neighbor: it stands still and looks at the other one,
        // and then stays a little more.
        if (Sims.menuTarget() === n) n.path = [];
        n.walking = false;
        n.scared = 0;
        n.fear = null;
        n.stay = Math.max(n.stay, 1.5);
        n.readMove = null;
        move(n, dt);
        return;
      }
      if (id === "hoot") {
        hootDay(n, dt);
        return;
      }
      move(n, dt);
      if (id === "lumi") sparkle(n, dt);
      if (id === "vladi" && schedule(n)) return;
      if (n.path.length > 0) return;
      if (n.walking) arrive(n);
      if (n.scared > 0) {
        n.scared -= dt;
        if (n.scared <= 0) n.fear = null;
        return;
      }
      n.stay -= dt;
      if (n.stay <= 0) next(n);
    });
    if (Needs.isPaused()) return;
    trail.forEach(function (t) { t.age += dt; });
    trail = trail.filter(function (t) { return t.age < K.lumi.trail.life; });
  }

  // At night, while Lumi moves, little golden sparkles stay behind her.
  function sparkle(n, dt) {
    if (Time.darkness() < 0.3 || n.path.length === 0) return;
    n.trailWait -= dt;
    if (n.trailWait > 0) return;
    n.trailWait = K.lumi.trail.every;
    var k = CONFIG.characterScale * n.cfg.scale;
    trail.push({ x: n.x + between(-8, 8), y: n.y - n.cfg.float - 38 * k + between(-10, 10), age: 0, size: between(1.6, 3) });
  }

  // ---------- Drawing ----------

  // Lumi's golden wings, opening and closing. Seen from the side, only the far pair shows, behind her back.
  function drawWings(ctx, look, flap, view) {
    var open = 0.45 + 0.55 * Math.abs(Math.sin(flap));
    var sides = view === "side" ? [-1] : [-1, 1];
    ctx.save();
    ctx.strokeStyle = look.wingEdge;
    ctx.lineWidth = 1.2;
    sides.forEach(function (side) {
      ctx.save();
      ctx.translate(side * 3, -36);
      ctx.scale(side * open * (view === "side" ? 0.85 : 1), 1);
      ctx.fillStyle = look.wing;
      ctx.beginPath();
      ctx.ellipse(19, -12, 19, 11, -0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(15, 7, 13, 7.5, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }

  // Her peach skirt, flaring out from the waist. "half" is half its width at the waist.
  function drawSkirt(ctx, look, half) {
    ctx.fillStyle = look.dress;
    ctx.beginPath();
    ctx.moveTo(-half, -27);
    ctx.lineTo(half, -27);
    ctx.lineTo(half + 5, -12);
    ctx.quadraticCurveTo(0, -9, -half - 5, -12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = look.dressHem;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(half + 4.5, -12.5);
    ctx.quadraticCurveTo(0, -9.5, -half - 4.5, -12.5);
    ctx.stroke();
  }

  // A braid: little round knots of hair getting smaller, from (x, y) down to (x + dx, y + 18), with a peach tie.
  function drawBraid(ctx, look, x, y, dx) {
    [[0, 0, 4.6], [0.35, 6, 4.2], [0.7, 12, 3.7], [1, 17, 3]].forEach(function (b) {
      P.circle(ctx, x + dx * b[0], y + b[1], b[2], look.hair);
    });
    P.circle(ctx, x + dx, y + 20.5, 2, look.dressHem);
    P.circle(ctx, x + dx, y + 24, 2.4, look.hair);
  }

  function drawFreckles(ctx, look, points) {
    points.forEach(function (p) { P.circle(ctx, p[0], p[1], 0.75, look.freckles); });
  }

  function drawLumiFront(ctx, look, step, closed, n) {
    drawWings(ctx, look, n.flap, "front");
    P.drawLegs(ctx, look, step, "front");
    P.drawArms(ctx, look, step);
    P.drawTorso(ctx, look, "front");
    drawSkirt(ctx, look, 12);
    P.drawHead(ctx, look);

    // Red hair with bangs, and two braids over the shoulders
    ctx.fillStyle = look.hair;
    ctx.beginPath();
    ctx.arc(0, -55, 17, Math.PI, 0);
    ctx.lineTo(17, -50);
    ctx.quadraticCurveTo(9, -60, 0, -57);
    ctx.quadraticCurveTo(-9, -60, -17, -50);
    ctx.closePath();
    ctx.fill();
    drawBraid(ctx, look, -15, -47, -2);
    drawBraid(ctx, look, 15, -47, 2);

    P.drawEyes(ctx, look, -48, closed);
    P.circle(ctx, -9.5, -43.5, 3, look.cheeks);
    P.circle(ctx, 9.5, -43.5, 3, look.cheeks);
    drawFreckles(ctx, look, [[-10, -45.5], [-8, -44], [-11.5, -43.5], [10, -45.5], [8, -44], [11.5, -43.5]]);
    // Smile
    ctx.strokeStyle = "#B0566A";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, -44, 3.5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }

  // From behind: her hair and braids down her back, and the wings in front of it all.
  function drawLumiBack(ctx, look, step, closed, n) {
    P.drawLegs(ctx, look, step, "back");
    P.drawArms(ctx, look, step);
    P.drawTorso(ctx, look, "back");
    drawSkirt(ctx, look, 12);
    P.drawHead(ctx, look);
    P.circle(ctx, 0, -55, 17, look.hair);
    P.strokeLine(ctx, look.hairDark, 1.2, [[0, -71], [0, -44]]);
    drawBraid(ctx, look, -6, -44, -1);
    drawBraid(ctx, look, 6, -44, 1);
    drawWings(ctx, look, n.flap, "back");
  }

  // From the side, looking right: one pair of wings behind her, a braid down her back and her freckled profile.
  function drawLumiSide(ctx, look, step, closed, n) {
    drawWings(ctx, look, n.flap, "side");
    P.drawSideArm(ctx, look, step + Math.PI);
    P.drawLegs(ctx, look, step, "side");
    P.drawTorso(ctx, look, "side");
    drawSkirt(ctx, look, 8);
    P.drawSideArm(ctx, look, step);
    P.drawHead(ctx, look);
    // Nose
    P.circle(ctx, 15.8, -49, 2, look.skin);
    // Hair over the top and back of the head, with bangs, and a braid behind
    ctx.fillStyle = look.hair;
    ctx.beginPath();
    ctx.arc(0, -55, 17, -0.25 * Math.PI, 0.6 * Math.PI, true);
    ctx.quadraticCurveTo(-3, -45, -2, -51);
    ctx.quadraticCurveTo(4, -62, 16, -57);
    ctx.closePath();
    ctx.fill();
    drawBraid(ctx, look, -11, -46, -3);

    P.drawEye(ctx, look, 8.5, -48, closed);
    P.circle(ctx, 8, -43.5, 3, look.cheeks);
    drawFreckles(ctx, look, [[7, -45.5], [9.5, -44.5], [6, -43.5]]);
    ctx.strokeStyle = "#B0566A";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(11.5, -43);
    ctx.quadraticCurveTo(13.5, -41, 15.5, -43.5);
    ctx.stroke();
  }

  // ---------- Vladi ----------

  // His teddy bear, held against his chest: "x" is the middle of the bear.
  function drawBear(ctx, look, x) {
    P.ellipse(ctx, x, -24, 7.5, 8.5, look.bear);
    P.circle(ctx, x - 5.5, -40, 2.6, look.bear);
    P.circle(ctx, x + 5.5, -40, 2.6, look.bear);
    P.circle(ctx, x, -35, 6.5, look.bear);
    P.circle(ctx, x - 5.5, -40, 1.2, look.bearLight);
    P.circle(ctx, x + 5.5, -40, 1.2, look.bearLight);
    P.ellipse(ctx, x, -33.3, 3, 2.2, look.bearLight);
    P.ellipse(ctx, x, -22, 4.5, 5, look.bearLight);
    P.circle(ctx, x - 2.3, -36.2, 0.95, look.bearDark);
    P.circle(ctx, x + 2.3, -36.2, 0.95, look.bearDark);
    P.circle(ctx, x, -34, 1, look.bearDark);
  }

  // Slicked-back black hair, with a little point over the forehead.
  function drawSlickHair(ctx, look) {
    ctx.fillStyle = look.hair;
    ctx.beginPath();
    ctx.arc(0, -55, 17, Math.PI, 0);
    ctx.lineTo(17, -52);
    ctx.quadraticCurveTo(9, -61, 0, -56);
    ctx.quadraticCurveTo(-9, -61, -17, -52);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -55, 12, 1.15 * Math.PI, 1.6 * Math.PI);
    ctx.stroke();
  }

  // Two little white fangs under the mouth.
  function drawFang(ctx, look, x, y) {
    ctx.fillStyle = look.fang;
    ctx.beginPath();
    ctx.moveTo(x - 1.2, y);
    ctx.lineTo(x + 1.2, y);
    ctx.lineTo(x, y + 2.8);
    ctx.closePath();
    ctx.fill();
  }

  function drawVladiFront(ctx, look, step, closed) {
    // The cape behind him, black outside, with the red inside showing at its edges
    ctx.fillStyle = look.cape;
    ctx.beginPath();
    ctx.moveTo(-14, -42);
    ctx.lineTo(-22, -3);
    ctx.quadraticCurveTo(0, 1, 22, -3);
    ctx.lineTo(14, -42);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = look.capeInside;
    [-1, 1].forEach(function (side) {
      ctx.beginPath();
      ctx.moveTo(side * 12, -41);
      ctx.lineTo(side * 19, -5);
      ctx.lineTo(side * 15, -4);
      ctx.lineTo(side * 9, -38);
      ctx.closePath();
      ctx.fill();
      // High collar standing up behind the head
      ctx.fillStyle = look.cape;
      ctx.beginPath();
      ctx.moveTo(side * 8, -41);
      ctx.lineTo(side * 24, -70);
      ctx.lineTo(side * 17, -42);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = look.capeInside;
      ctx.beginPath();
      ctx.moveTo(side * 10, -42);
      ctx.lineTo(side * 21, -64);
      ctx.lineTo(side * 16, -43);
      ctx.closePath();
      ctx.fill();
    });

    P.drawLegs(ctx, look, step, "front");
    P.drawTorso(ctx, look, "front");
    // White shirt in the opening of the suit
    ctx.fillStyle = look.whiteShirt;
    ctx.beginPath();
    ctx.moveTo(-5, -40);
    ctx.lineTo(5, -40);
    ctx.lineTo(0, -29);
    ctx.closePath();
    ctx.fill();

    P.drawHead(ctx, look);
    drawSlickHair(ctx, look);
    P.drawEyes(ctx, look, -49, closed);
    ctx.strokeStyle = "#B88A86";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, -45, 3, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    drawFang(ctx, look, -2, -42.4);
    drawFang(ctx, look, 2, -42.4);

    // Arms around his teddy bear
    P.fillRound(ctx, -18, -38, 6, 13, 3, look.suit);
    P.fillRound(ctx, 12, -38, 6, 13, 3, look.suit);
    drawBear(ctx, look, 0);
    P.fillRound(ctx, -17, -29, 10, 6, 3, look.suit);
    P.fillRound(ctx, 7, -29, 10, 6, 3, look.suit);
    P.circle(ctx, -7, -26, 3, look.skin);
    P.circle(ctx, 7, -26, 3, look.skin);
  }

  // From behind: the black cape covers his back, with the high collar up to his ears.
  function drawVladiBack(ctx, look, step) {
    P.drawLegs(ctx, look, step, "back");
    P.drawHead(ctx, look);
    P.circle(ctx, 0, -55, 16.5, look.hair);
    ctx.fillStyle = look.cape;
    ctx.beginPath();
    ctx.moveTo(-15, -44);
    ctx.lineTo(-22, -3);
    ctx.quadraticCurveTo(0, 1, 22, -3);
    ctx.lineTo(15, -44);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-17, -40);
    ctx.lineTo(-21, -60);
    ctx.quadraticCurveTo(0, -52, 21, -60);
    ctx.lineTo(17, -40);
    ctx.closePath();
    ctx.fill();
    P.strokeLine(ctx, "rgba(255, 255, 255, 0.12)", 1.2, [[-6, -38], [-8, -6]]);
    P.strokeLine(ctx, "rgba(255, 255, 255, 0.12)", 1.2, [[6, -38], [8, -6]]);
  }

  // From the side, looking right: the cape behind his back, and the teddy bear in front of his chest.
  function drawVladiSide(ctx, look, step, closed) {
    ctx.fillStyle = look.cape;
    ctx.beginPath();
    ctx.moveTo(-3, -44);
    ctx.lineTo(-18, -3);
    ctx.lineTo(2, -3);
    ctx.lineTo(3, -40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = look.capeInside;
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(1, -4);
    ctx.lineTo(3, -4);
    ctx.lineTo(3, -40);
    ctx.closePath();
    ctx.fill();

    P.drawLegs(ctx, look, step, "side");
    P.drawTorso(ctx, look, "side");
    P.fillRound(ctx, 4, -40, 4, 11, 2, look.whiteShirt);

    P.drawHead(ctx, look);
    P.circle(ctx, 16, -49, 2.2, look.skin);
    ctx.fillStyle = look.hair;
    ctx.beginPath();
    ctx.arc(0, -55, 17, 1.05 * Math.PI, 1.85 * Math.PI);
    ctx.quadraticCurveTo(8, -58, -3, -52);
    ctx.closePath();
    ctx.fill();
    P.fillRound(ctx, -17, -62, 10, 16, 4, look.hair);
    // High collar standing up at the back of the neck, red inside
    ctx.fillStyle = look.cape;
    ctx.beginPath();
    ctx.moveTo(-6, -40);
    ctx.lineTo(-21, -66);
    ctx.lineTo(-14, -41);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = look.capeInside;
    ctx.beginPath();
    ctx.moveTo(-7.5, -41);
    ctx.lineTo(-18.5, -60);
    ctx.lineTo(-13, -42);
    ctx.closePath();
    ctx.fill();
    P.circle(ctx, -3, -50, 3.2, look.skin);
    P.drawEye(ctx, look, 8.5, -49, closed);
    ctx.strokeStyle = "#B88A86";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(11.5, -44);
    ctx.quadraticCurveTo(13.5, -43, 15.5, -44.5);
    ctx.stroke();
    drawFang(ctx, look, 13.5, -43.6);

    // The teddy bear in front of his chest, with his arm around it
    drawBear(ctx, look, 10);
    P.fillRound(ctx, -3, -38, 6, 12, 3, look.suit);
    P.fillRound(ctx, -2, -30, 13, 6, 3, look.suit);
    P.circle(ctx, 11.5, -27, 3, look.skin);
  }

  // ---------- Professor Hoot ----------

  // His big fluffy tail with its white tip, behind him: "dir" is which side it goes to (1 right, -1 left),
  // "up" how much it curls up.
  function drawTail(ctx, look, dir, up, sway) {
    ctx.save();
    ctx.translate(dir * 6, -14);
    ctx.rotate(dir * (0.9 + sway) - up);
    ctx.fillStyle = look.fur;
    ctx.beginPath();
    ctx.ellipse(0, -15, 9, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = look.white;
    ctx.beginPath();
    ctx.ellipse(0, -28, 6.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // A pointed ear: orange outside and dark inside. "dx" is where it stands, "lean" which way it tips.
  function drawEar(ctx, look, dx, lean) {
    ctx.fillStyle = look.fur;
    ctx.beginPath();
    ctx.moveTo(dx - 7, -63);
    ctx.lineTo(dx + lean * 4, -80);
    ctx.lineTo(dx + 7, -63);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = look.furDark;
    ctx.beginPath();
    ctx.moveTo(dx - 3.5, -64);
    ctx.lineTo(dx + lean * 3, -75);
    ctx.lineTo(dx + 3.5, -64);
    ctx.closePath();
    ctx.fill();
  }

  // The brown jacket with the white chest of fur in its opening and the red bow tie at the neck.
  function drawJacket(ctx, look, view) {
    P.drawTorso(ctx, look, view);
    if (view === "back") {
      P.strokeLine(ctx, look.jacketDark, 1.2, [[0, -38], [0, -14]]);
      return;
    }
    var x = view === "side" ? 5 : 0;
    ctx.fillStyle = look.white;
    ctx.beginPath();
    ctx.moveTo(x - 5, -40);
    ctx.lineTo(x + 5, -40);
    ctx.lineTo(x, -26);
    ctx.closePath();
    ctx.fill();
    P.circle(ctx, x, -22, 1.2, look.jacketDark);
    P.circle(ctx, x, -17, 1.2, look.jacketDark);
    // Bow tie
    ctx.fillStyle = look.bowTie;
    ctx.beginPath();
    ctx.moveTo(x, -39);
    ctx.lineTo(x - 5.5, -42);
    ctx.lineTo(x - 5.5, -36);
    ctx.closePath();
    ctx.moveTo(x, -39);
    ctx.lineTo(x + 5.5, -42);
    ctx.lineTo(x + 5.5, -36);
    ctx.closePath();
    ctx.fill();
    P.circle(ctx, x, -39, 1.6, look.bowTie);
  }

  // Round glasses over the eyes, at "y", with "xs" the middle of each lens.
  function drawGlasses(ctx, look, xs, y) {
    ctx.save();
    ctx.strokeStyle = look.glasses;
    ctx.lineWidth = 1.3;
    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    xs.forEach(function (x) {
      ctx.beginPath();
      ctx.arc(x, y, 4.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    if (xs.length === 2) {
      ctx.beginPath();
      ctx.moveTo(xs[0] + 4.3, y);
      ctx.quadraticCurveTo((xs[0] + xs[1]) / 2, y - 1.5, xs[1] - 4.3, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // A closed book, its cover and the edge of its pages, with its middle at (x, y).
  function drawClosedBook(ctx, look, x, y, w, h) {
    P.fillRound(ctx, x - w / 2, y - h / 2, w, h, 1.5, look.book);
    P.fillRound(ctx, x - w / 2 + 1.5, y + h / 2 - 3, w - 3, 2, 1, look.page);
    P.fillRound(ctx, x - w / 2, y - h / 2, 2.5, h, 1, look.bookDark);
  }

  // The book open in front of his chest, held with both paws. Turning a page, one page flips over.
  function drawOpenBook(ctx, look, n) {
    var y = -26;
    P.fillRound(ctx, -14, y - 9, 28, 16, 2, look.book);
    P.fillRound(ctx, -12.5, y - 8, 12, 13, 1.5, look.page);
    P.fillRound(ctx, 0.5, y - 8, 12, 13, 1.5, look.page);
    P.strokeLine(ctx, "rgba(74, 52, 40, 0.3)", 0.8, [[-10, y - 4], [-3, y - 4]]);
    P.strokeLine(ctx, "rgba(74, 52, 40, 0.3)", 0.8, [[-10, y - 1], [-3, y - 1]]);
    P.strokeLine(ctx, "rgba(74, 52, 40, 0.3)", 0.8, [[3, y - 4], [10, y - 4]]);
    P.strokeLine(ctx, "rgba(74, 52, 40, 0.3)", 0.8, [[3, y - 1], [10, y - 1]]);
    if (n && n.readMove === "page") {
      // The page goes from the right to the left, over the middle.
      var t = 1 - n.readTime / n.cfg.read.time;
      var w = 12 * Math.cos(t * Math.PI);
      ctx.fillStyle = look.page;
      ctx.strokeStyle = "rgba(74, 52, 40, 0.35)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, y - 8);
      ctx.quadraticCurveTo(w / 2, y - 11 - Math.sin(t * Math.PI) * 4, w, y - 8);
      ctx.lineTo(w, y + 5);
      ctx.lineTo(0, y + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // Head from the front: orange with pointed ears, white cheeks and muzzle, a little black nose, eyes behind round glasses.
  function drawFoxFace(ctx, look, closed) {
    drawEar(ctx, look, -10, -1);
    drawEar(ctx, look, 10, 1);
    P.circle(ctx, 0, -54, 16, look.fur);
    ctx.fillStyle = look.white;
    ctx.beginPath();
    ctx.moveTo(-15, -50);
    ctx.quadraticCurveTo(-8, -52, 0, -46);
    ctx.quadraticCurveTo(8, -52, 15, -50);
    ctx.quadraticCurveTo(10, -38, 0, -38);
    ctx.quadraticCurveTo(-10, -38, -15, -50);
    ctx.closePath();
    ctx.fill();
    P.ellipse(ctx, 0, -46.5, 2.6, 2, look.nose);
    ctx.strokeStyle = look.nose;
    ctx.lineWidth = 1.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-3, -42.5);
    ctx.quadraticCurveTo(0, -40.5, 3, -42.5);
    ctx.stroke();
    P.drawEyes(ctx, look, -54, closed);
  }

  // Reading by his door: the book open in his paws. Fixing his glasses, one paw goes up to them.
  // With someone (or walking), the book is closed under his arm.
  function drawHootFront(ctx, look, step, closed, n) {
    var reading = n && !n.inside && n.path.length === 0 && !withPlayer(n);
    drawTail(ctx, look, 1, 0, Math.sin(n ? n.breath * 0.7 : 0) * 0.08);
    P.drawLegs(ctx, look, step, "front");
    drawJacket(ctx, look, "front");
    var fixing = reading && n.readMove === "glasses";
    var lift = fixing ? Math.sin(Math.PI * (1 - n.readTime / n.cfg.read.time)) : 0;
    if (reading) {
      // Sleeves bent toward the middle, holding the book; the right paw goes up to the glasses when fixing them.
      P.fillRound(ctx, -18, -38, 6, 12, 3, look.jacket);
      P.fillRound(ctx, -16, -30, 8, 6, 3, look.jacket);
      drawOpenBook(ctx, look, n);
      P.circle(ctx, -11, -26, 3, look.fur);
      if (fixing) {
        P.fillRound(ctx, 12, -38 - lift * 6, 6, 12, 3, look.jacket);
      } else {
        P.fillRound(ctx, 12, -38, 6, 12, 3, look.jacket);
        P.fillRound(ctx, 8, -30, 8, 6, 3, look.jacket);
        P.circle(ctx, 11, -26, 3, look.fur);
      }
    } else {
      // The left arm down, the right one holding the closed book against his side.
      P.fillRound(ctx, -18, -38, 6, 16, 3, look.jacket);
      P.circle(ctx, -15, -21, 3, look.fur);
      drawClosedBook(ctx, look, 16, -27, 8, 15);
      P.fillRound(ctx, 12, -38, 6, 14, 3, look.jacket);
      P.circle(ctx, 15, -24, 3, look.fur);
    }
    drawFoxFace(ctx, look, closed);
    drawGlasses(ctx, look, [-5.5, 5.5], fixing ? -54 - lift * 1.5 : -54);
    if (fixing) P.circle(ctx, 9, -50 - lift * 3, 3, look.fur);
  }

  // From behind: the ears, the back of his orange head, his jacket and the big tail in front of it all.
  function drawHootBack(ctx, look, step) {
    P.drawLegs(ctx, look, step, "back");
    drawJacket(ctx, look, "back");
    P.fillRound(ctx, -18, -38, 6, 16, 3, look.jacket);
    P.fillRound(ctx, 12, -38, 6, 16, 3, look.jacket);
    drawEar(ctx, look, -10, -1);
    drawEar(ctx, look, 10, 1);
    P.circle(ctx, 0, -54, 16, look.fur);
    P.ellipse(ctx, 0, -44, 9, 4, look.furDark);
    drawTail(ctx, look, 1, 0.9, 0);
  }

  // From the side, looking right: a long snout with the nose at its tip, one ear, the tail behind and the book under his arm.
  function drawHootSide(ctx, look, step, closed) {
    drawTail(ctx, look, -1, -0.2, 0);
    P.drawLegs(ctx, look, step, "side");
    drawJacket(ctx, look, "side");
    ctx.fillStyle = look.fur;
    ctx.beginPath();
    ctx.moveTo(-3, -80);
    ctx.lineTo(-10, -63);
    ctx.lineTo(4, -64);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = look.furDark;
    ctx.beginPath();
    ctx.moveTo(-3.5, -75);
    ctx.lineTo(-7, -65);
    ctx.lineTo(1, -65);
    ctx.closePath();
    ctx.fill();
    P.circle(ctx, 0, -54, 16, look.fur);
    // Snout, white underneath, with the nose at the tip
    ctx.fillStyle = look.fur;
    ctx.beginPath();
    ctx.moveTo(10, -58);
    ctx.lineTo(24, -48);
    ctx.lineTo(9, -44);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = look.white;
    ctx.beginPath();
    ctx.moveTo(2, -46);
    ctx.lineTo(23, -47);
    ctx.quadraticCurveTo(12, -38, 2, -40);
    ctx.closePath();
    ctx.fill();
    P.circle(ctx, 23.5, -48.5, 2.3, look.nose);
    P.drawEye(ctx, look, 8, -55, closed);
    drawGlasses(ctx, look, [8.5], -55);
    P.strokeLine(ctx, look.glasses, 1.1, [[4.2, -55.5], [-6, -57]]);
    // The book under his arm, and the arm over it
    drawClosedBook(ctx, look, 1, -28, 12, 15);
    P.fillRound(ctx, -3, -38, 6, 16, 3, look.jacket);
    P.circle(ctx, 0, -21, 3, look.fur);
  }

  var BODIES = {
    lumi: { front: drawLumiFront, back: drawLumiBack, side: drawLumiSide },
    vladi: { front: drawVladiFront, back: drawVladiBack, side: drawVladiSide },
    hoot: { front: drawHootFront, back: drawHootBack, side: drawHootSide }
  };

  // How high over the grass it is drawn: Lumi floats and bobs softly; Vladi stands on the grass.
  function liftOf(n) {
    return n.cfg.float ? n.cfg.float + Math.sin(n.breath * 1.3) * 3 : 0;
  }

  // One neighbor: the shadow on the grass, the body, the name below and a bubble when it talks, gets a gift or is scared.
  function drawOne(ctx, n, time) {
    var k = CONFIG.characterScale * n.cfg.scale;
    var lift = liftOf(n);
    var walking = n.path.length > 0;
    P.ellipse(ctx, n.x, n.y, 16 * k * (lift ? 0.8 : 1), 6 * k * (lift ? 0.8 : 1),
      lift ? "rgba(74, 52, 40, 0.16)" : "rgba(74, 52, 40, 0.25)");
    var bounce = walking && !lift ? -Math.abs(Math.sin(n.stepPhase)) * 4 : 0;
    var breath = walking ? 1 : 1 + Math.sin(n.breath) * CONFIG.alive.breathe.amount;
    var shake = n.scared > 0 && !Needs.isPaused() ? Math.sin(time * 55) * 1.3 : 0;
    var lean = Social.facing(n.data.id) || (isChatting(n) ? (n.facing === "right" ? 1 : -1) : 0);
    var view = n.facing === "left" || n.facing === "right" ? "side" : n.facing;
    ctx.save();
    ctx.translate(n.x + shake, n.y - lift + bounce);
    ctx.rotate(lean * 0.06);
    ctx.scale(n.facing === "left" ? -k : k, k * breath);
    BODIES[n.data.id][view](ctx, n.look, walking ? n.stepPhase : 0, n.blink > 0, n);
    ctx.restore();
    var bubble = Social.bubbleFor(n.data.id) || Gifts.bubbleFor(n.data.id) || Lessons.bubbleFor(n.data.id) || chatBubble(n) || n.fear;
    Sims.drawTags(ctx, n, { x: n.x, y: n.y }, time, bubble);
  }

  // Drawn over the night tint: Lumi's sparkles, and the "Zzz" from the castle window while Vladi sleeps inside
  // (and from the window of the hollow tree while Professor Hoot does).
  function drawTop(ctx, time) {
    if (Sims.viewPlace() !== "city") return;
    ctx.save();
    trail.forEach(function (t) {
      var life = 1 - t.age / K.lumi.trail.life;
      ctx.globalAlpha = life;
      ctx.globalCompositeOperation = "lighter";
      P.circle(ctx, t.x, t.y, t.size * 2.4, "rgba(255, 214, 107, 0.35)");
      ctx.globalCompositeOperation = "source-over";
      P.circle(ctx, t.x, t.y, t.size * (0.6 + life * 0.4), "#FFF1B8");
    });
    ctx.restore();
    var vladi = byId("vladi");
    if (vladi && vladi.inside) Sims.drawZzz(ctx, City.castleWindow.x + 4, City.castleWindow.y - 8, time);
    var hoot = byId("hoot");
    if (hoot && hoot.inside) Sims.drawZzz(ctx, City.hollowWindow.x + 4, City.hollowWindow.y - 8, time);
  }

  // ---------- Tapping and words ----------

  function byId(id) {
    return list.filter(function (n) { return n.data.id === id; })[0] || null;
  }

  // The neighbors outside, in the city (Vladi inside his castle and Professor Hoot inside his hollow tree are not seen).
  function visible() {
    return list.filter(function (n) { return !n.inside; });
  }

  // The neighbor at a spot of the city, or null (the one in front wins).
  function at(x, y) {
    var hit = null;
    visible().forEach(function (n) {
      var k = CONFIG.characterScale * n.cfg.scale;
      var lift = liftOf(n);
      var dx = x - n.x, dy = y - n.y;
      if (dx >= -22 * k && dx <= 22 * k && dy >= -76 * k - lift && dy <= 34) {
        if (!hit || n.y > hit.y) hit = n;
      }
    });
    return hit;
  }

  // ---------- Modo decorar ----------

  // Homes moved in the city: Professor Hoot stands by his door where it is now, whoever was left on something steps
  // to the closest free spot, Vladi on his way in goes to his door where it is now, and whoever was walking near a home
  // that moved walks to the same spot by it.
  function settle() {
    list.forEach(function (n) {
      if (n.data.id === "hoot") {
        n.x = n.cfg.home.x;
        n.y = n.cfg.home.y;
        n.path = [];
        return;
      }
      if (n.inside) return;
      if (City.isSolid(n.x, n.y)) {
        var spot = Path.free("city", n.x, n.y);
        n.x = spot.x;
        n.y = spot.y;
      }
      if (n.goingIn) {
        walk(n, n.cfg.home.x, n.cfg.home.y);
      } else if (n.path.length > 0) {
        var end = n.path[n.path.length - 1], to = City.carry(end.x, end.y);
        walk(n, to.x, to.y);
      }
    });
  }

  // ---------- Saving ----------

  // Where each one is, the way it looks, and whether Vladi (or Professor Hoot) is inside his home.
  function get() {
    var out = {};
    list.forEach(function (n) {
      out[n.data.id] = { x: n.x, y: n.y, facing: n.facing, inside: n.inside };
    });
    return out;
  }

  var FACINGS = ["front", "back", "left", "right"];

  // Used when loading a saved game. A neighbor missing from it (an old saved game) starts by its home,
  // with Vladi inside his castle by day and outside by its door at night. Professor Hoot is always by his door
  // (or inside, out of his hours), whatever was saved.
  function set(saved) {
    list.forEach(function (n) {
      var s = saved && typeof saved === "object" ? saved[n.data.id] : null;
      n.path = [];
      n.walking = false;
      n.goingIn = false;
      n.scared = 0;
      n.fear = null;
      n.readMove = null;
      if (n.data.id === "hoot") {
        n.x = n.cfg.home.x;
        n.y = n.cfg.home.y;
        n.facing = "front";
        n.inside = sleepsNow("hoot");
      } else if (s && typeof s === "object" && typeof s.x === "number" && typeof s.y === "number" && City.isWalkable(s.x, s.y)) {
        var spot = Path.free("city", s.x, s.y);
        n.x = spot.x;
        n.y = spot.y;
        if (FACINGS.indexOf(s.facing) >= 0) n.facing = s.facing;
        n.inside = n.data.id === "vladi" && !!s.inside;
      } else {
        n.x = n.cfg.home.x;
        n.y = n.cfg.home.y;
        n.facing = "front";
        n.inside = sleepsNow(n.data.id);
      }
    });
  }

  return {
    init: init,
    update: update,
    drawOne: drawOne,
    drawTop: drawTop,
    visible: visible,
    list: function () { return list; },
    at: at,
    settle: settle,
    get: get,
    set: set
  };
})();
