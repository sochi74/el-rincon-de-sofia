// The neighbors: Lumi, the fairy, and Vladi, the vampire who is afraid of the dark. They live in the city
// (their homes are drawn in js/city.js), walk around on their own going around obstacles (js/path.js) and are never selected.
// Lumi flies around the city day and night, flapping her wings, and at night leaves a little trail of golden sparkles.
// Vladi stays in his castle by day ("Zzz" come out of its window); from 19:00 to 07:00 he walks slowly near his castle,
// the plaza and the campfire, and now and then he stops, shakes and hugs his teddy bear.
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
        // Only Vladi: inside his castle, on his way in, and seconds left shaking with his bubble.
        inside: data.id === "vladi" && Time.isDay(),
        goingIn: false,
        scared: 0,
        fear: null,
        trailWait: 0
      };
    });
  }

  // ---------- Walking ----------

  function walk(n, x, y) {
    n.path = Path.find("city", n.x, n.y, x, y);
    n.walking = true;
  }

  function move(n, dt) {
    var fromX = n.x, fromY = n.y;
    var step = n.cfg.speed * dt;
    while (n.path.length > 0 && step > 0) {
      var p = n.path[0];
      var dx = p.x - n.x, dy = p.y - n.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= step) {
        n.x = p.x;
        n.y = p.y;
        step -= dist;
        n.path.shift();
      } else {
        n.x += dx / dist * step;
        n.y += dy / dist * step;
        step = 0;
      }
    }
    n.stepPhase = n.path.length > 0 ? n.stepPhase + dt * 9 : 0;
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
  function next(n) {
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

  // ---------- Chatting with each other ----------

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  // True if a neighbor is with Sofía or real.fixer: talking, getting a gift, or with the social menu open over it.
  function withPlayer(n) {
    var id = n.data.id;
    return Social.isInvolved(id) || Gifts.isInvolved(id) || Sims.menuTarget() === n;
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
        move(n, dt);
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

  var BODIES = {
    lumi: { front: drawLumiFront, back: drawLumiBack, side: drawLumiSide },
    vladi: { front: drawVladiFront, back: drawVladiBack, side: drawVladiSide }
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
    var bubble = Social.bubbleFor(n.data.id) || Gifts.bubbleFor(n.data.id) || chatBubble(n) || n.fear;
    Sims.drawTags(ctx, n, { x: n.x, y: n.y }, time, bubble);
  }

  // Drawn over the night tint: Lumi's sparkles, and the "Zzz" from the castle window while Vladi sleeps inside.
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
  }

  // ---------- Tapping and words ----------

  function byId(id) {
    return list.filter(function (n) { return n.data.id === id; })[0] || null;
  }

  // The neighbors outside, in the city (Vladi inside his castle is not seen).
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

  // ---------- Saving ----------

  // Where each one is, the way it looks, and whether Vladi is inside his castle.
  function get() {
    var out = {};
    list.forEach(function (n) {
      out[n.data.id] = { x: n.x, y: n.y, facing: n.facing, inside: n.inside };
    });
    return out;
  }

  var FACINGS = ["front", "back", "left", "right"];

  // Used when loading a saved game. A neighbor missing from it (an old saved game) starts by its home,
  // with Vladi inside his castle by day and outside by its door at night.
  function set(saved) {
    list.forEach(function (n) {
      var s = saved && typeof saved === "object" ? saved[n.data.id] : null;
      n.path = [];
      n.walking = false;
      n.goingIn = false;
      n.scared = 0;
      n.fear = null;
      if (s && typeof s === "object" && typeof s.x === "number" && typeof s.y === "number" && City.isWalkable(s.x, s.y)) {
        var spot = Path.free("city", s.x, s.y);
        n.x = spot.x;
        n.y = spot.y;
        if (FACINGS.indexOf(s.facing) >= 0) n.facing = s.facing;
        n.inside = n.data.id === "vladi" && !!s.inside;
      } else {
        n.x = n.cfg.home.x;
        n.y = n.cfg.home.y;
        n.facing = "front";
        n.inside = n.data.id === "vladi" && Time.isDay();
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
    get: get,
    set: set
  };
})();
