// Dreams and goals: each character (Sofía, real.fixer, Lumi and Vladi) has a dream of 2 goals, one after the other
// (their "goals" in js/characters.js). Only the goal that is on now counts what happens.
// Goals about Amistad look at the friendship right now, so they can be met the moment they start.
// Meeting a goal shows a big sign (where the panel does not cover it), rains golden stars over the character
// (when it is on screen), plays the fanfare (only when it is where the screen is),
// gives magic coins and a decoration for its home (drawn in js/house.js and js/city.js), and the next goal starts.
// Also the "🌟 Metas" button in the panel and its window with each one's goal and how far it got. Pausa freezes the celebration.
var Goals = (function () {
  // Coins for meeting goal 1 and goal 2.
  var REWARDS = [30, 50];
  // The order of the rows in the window.
  var ORDER = ["sofia", "realfixer", "lumi", "vladi"];
  // How long the sign and the stars last, in seconds, and how many stars rain.
  var SIGN_TIME = 3;
  var STARS = 26;

  // For each character, by id: the goal it is on (0, 1, or 2 when both are met), how far it got,
  // and who it already chatted with (for real.fixer's first goal).
  var state = {};

  // Celebrations waiting their turn, and the one going on: { id, step, elapsed, stars: [...] }.
  var queue = [];
  var party = null;

  var button, panel, list, sign, shown = null;

  function character(id) {
    return CHARACTERS.filter(function (c) { return c.id === id; })[0];
  }

  function fresh() {
    return { step: 0, progress: 0, chatted: [] };
  }

  function init() {
    CHARACTERS.forEach(function (c) { state[c.id] = fresh(); });

    // The "🌟 Metas" button, next to the backpack in the panel.
    button = document.createElement("button");
    button.type = "button";
    button.id = "goals-button";
    button.textContent = "🌟 Metas";
    var backpackButton = document.getElementById("backpack-button");
    backpackButton.parentNode.insertBefore(button, backpackButton.nextSibling);
    button.addEventListener("click", function () { setOpen(panel.hidden); });

    // The window, with its ✕ to close it.
    panel = document.createElement("div");
    panel.id = "goals";
    panel.hidden = true;
    var top = document.createElement("div");
    top.className = "backpack-top";
    var title = document.createElement("b");
    title.textContent = "🌟 Metas";
    var close = document.createElement("button");
    close.type = "button";
    close.id = "goals-close";
    close.setAttribute("aria-label", "Cerrar las metas");
    close.textContent = "✕";
    close.addEventListener("click", function () { setOpen(false); });
    top.appendChild(title);
    top.appendChild(close);
    list = document.createElement("div");
    list.id = "goals-list";
    panel.appendChild(top);
    panel.appendChild(list);
    document.body.appendChild(panel);

    // The big "¡Meta cumplida!" sign.
    sign = document.createElement("div");
    sign.id = "goal-sign";
    sign.hidden = true;
    document.body.appendChild(sign);
  }

  // ---------- Counting ----------

  // The goal a character is on now, or null when both are met.
  function current(id) {
    var c = character(id), s = state[id];
    return c && s && s.step < c.goals.length ? c.goals[s.step] : null;
  }

  // Amistad as the panel shows it, rounded.
  function friendship(id, otherId) {
    return Math.round(Social.friendshipWith(id, otherId));
  }

  // Goals about Amistad: how far they got, from the friendship right now.
  var LIVE = {
    friendsAll: function () {
      return ["sofia", "realfixer"].filter(function (other) { return friendship("lumi", other) >= 30; }).length;
    },
    friendVladi: function () {
      return friendship("lumi", "vladi") >= 30 ? 1 : 0;
    },
    bestFriend: function () {
      return CHARACTERS.some(function (c) { return c.id !== "vladi" && friendship("vladi", c.id) >= 70; }) ? 1 : 0;
    }
  };

  // Something happened (js/garden.js, js/gather.js, js/cooking.js, js/gifts.js and js/social.js tell it here):
  // "harvest" (who, flower), "eat" (who, dish), "fish" (who, catch), "gift" (who got it, thing) or "chat" (who, with whom).
  // It only counts for the goal that is on now.
  function notify(event, id, what) {
    var goal = current(id);
    if (!goal) return;
    var s = state[id];
    if (event === "harvest" && goal.id === "harvestFlowers") s.progress++;
    if (event === "eat" && goal.id === "eatBerryPie" && what === "berryPie") s.progress++;
    if (event === "fish" && goal.id === "moonFish" && what === "moonFish") s.progress++;
    if (event === "gift" && goal.id === "crabSoupGift" && what === "crabSoup") s.progress++;
    if (event === "chat" && goal.id === "chatNeighbors" && (what === "lumi" || what === "vladi") && s.chatted.indexOf(what) < 0) {
      s.chatted.push(what);
      s.progress = s.chatted.length;
    }
    check(id);
  }

  // Meet the goal if it got far enough. Several at once take turns for the sign.
  function check(id) {
    var goal = current(id);
    if (!goal) return;
    var s = state[id];
    if (LIVE[goal.id]) s.progress = LIVE[goal.id]();
    if (s.progress < goal.target) return;
    var step = s.step;
    s.step++;
    s.progress = 0;
    s.chatted = [];
    Coins.add(REWARDS[step]);
    queue.push({ id: id, step: step });
    // The next goal may be met already (the Amistad ones).
    check(id);
  }

  // ---------- Celebration ----------

  // Sofía, real.fixer or a neighbor who is outside, by id; null if it is not seen (Vladi inside his castle).
  function actor(id) {
    var who = Sims.list().concat(Neighbors.list()).filter(function (s) { return s.data.id === id; })[0];
    return who && !who.inside ? who : null;
  }

  function startParty(next) {
    var c = character(next.id), goal = c.goals[next.step];
    var stars = [];
    for (var i = 0; i < STARS; i++) {
      stars.push({ dx: (Math.random() * 2 - 1) * 80, delay: Math.random() * 1.4, speed: 55 + Math.random() * 45,
        size: 5 + Math.random() * 5, spin: Math.random() * Math.PI * 2 });
    }
    party = { id: next.id, step: next.step, elapsed: 0, stars: stars };
    sign.textContent = "🌟 ¡Meta cumplida! " + c.name + " " + goal.done + " " + goal.emoji;
    sign.hidden = false;
    UI.placeSign(sign);
    // The fanfare only sounds when it happens where the screen is, like the other effects.
    var who = actor(next.id);
    if (who) Sound.playAt(who.place, "fanfare");
  }

  function update(dt) {
    CHARACTERS.forEach(function (c) { check(c.id); });
    if (!party && queue.length > 0) startParty(queue.shift());
    if (party) UI.placeSign(sign);
    if (party && !Needs.isPaused()) {
      party.elapsed += dt;
      if (party.elapsed >= SIGN_TIME) {
        party = null;
        sign.hidden = true;
      }
    }
    if (!panel.hidden) render();
  }

  // A little five-pointed star.
  function drawStar(ctx, x, y, r, turn) {
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

  // Golden stars falling over the one who met the goal, and "+30 🪙" floating up, only when it is on screen.
  function draw(ctx, time) {
    if (!party) return;
    var who = actor(party.id);
    if (!who || who.place !== Sims.viewPlace()) return;
    var k = CONFIG.characterScale;
    var top = who.y - 78 * k - 50, bottom = who.y + 4;
    var t = party.elapsed / SIGN_TIME;
    ctx.save();
    ctx.fillStyle = CONFIG.coins.gold;
    ctx.strokeStyle = CONFIG.coins.edge;
    ctx.lineWidth = 1;
    party.stars.forEach(function (s) {
      var age = party.elapsed - s.delay;
      if (age < 0) return;
      var y = top + age * s.speed;
      if (y > bottom) return;
      ctx.globalAlpha = Math.min(1, (bottom - y) / 30);
      drawStar(ctx, who.x + s.dx + Math.sin(time * 3 + s.spin) * 6, y, s.size, s.spin + time * 2);
    });

    var text = "+" + REWARDS[party.step] + " 🪙";
    ctx.globalAlpha = t > 0.7 ? (1 - t) / 0.3 : 1;
    ctx.font = "700 " + Math.round(26 * Math.min(1, party.elapsed * 5)) + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.strokeStyle = CONFIG.colors.darkBrown;
    var y = top - 10 - party.elapsed * 14;
    ctx.strokeText(text, who.x, y);
    ctx.fillStyle = CONFIG.colors.cream;
    ctx.fillText(text, who.x, y);
    ctx.restore();
  }

  // ---------- The window ----------

  // Open or close the window; the backpack closes when it opens. It opens where it does not cover the Carpa,
  // the Fogata or the selected one (js/ui.js).
  function setOpen(open) {
    panel.hidden = !open;
    shown = null;
    if (open) {
      UI.closeBackpack();
      render();
      UI.placeWindow(panel);
    }
  }

  // A goal as a line, like "🌸 Cosechar 5 flores".
  function goalText(goal) {
    return goal.emoji + " " + goal.text;
  }

  // One row per character: its current goal with how far it got and a little bar, and the met ones below.
  // Rebuilt only when something changes.
  function render() {
    var rows = ORDER.map(character).map(function (c) {
      var s = state[c.id], goal = current(c.id);
      return { c: c, goal: goal, progress: goal ? Math.min(s.progress, goal.target) : 0, met: c.goals.slice(0, s.step) };
    });
    var key = JSON.stringify(rows.map(function (r) { return [r.c.id, r.goal && r.goal.id, r.progress, r.met.length]; }));
    if (key === shown) return;
    shown = key;
    list.textContent = "";
    rows.forEach(function (r) {
      var row = document.createElement("div");
      row.className = "goal-row";
      var name = document.createElement("div");
      name.className = "goal-name";
      name.textContent = CONFIG.characterLooks[r.c.id].icon + " " + r.c.name;
      row.appendChild(name);
      if (r.goal) {
        var now = document.createElement("div");
        now.className = "goal-now";
        now.textContent = goalText(r.goal) + " · " + r.progress + "/" + r.goal.target;
        var track = document.createElement("div");
        track.className = "goal-track";
        var fill = document.createElement("div");
        fill.className = "goal-fill";
        fill.style.width = (r.progress / r.goal.target * 100) + "%";
        track.appendChild(fill);
        row.appendChild(now);
        row.appendChild(track);
      } else {
        var all = document.createElement("div");
        all.className = "goal-now";
        all.textContent = "💫 ¡Todos sus sueños cumplidos!";
        row.appendChild(all);
      }
      r.met.forEach(function (goal) {
        var met = document.createElement("div");
        met.className = "goal-met";
        met.textContent = "✅ " + goalText(goal);
        row.appendChild(met);
      });
      list.appendChild(row);
    });
  }

  // True if a spot on the screen is over the window (so the word tag does not show what is under it).
  function covers(x, y) {
    if (panel.hidden) return false;
    var r = panel.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  // True if the goal number "index" (0 or 1) of a character is met, so its decoration is drawn.
  function isMet(id, index) {
    return !!state[id] && state[id].step > index;
  }

  // ---------- Saving ----------

  function get() {
    var out = {};
    Object.keys(state).forEach(function (id) {
      var s = state[id];
      out[id] = { step: s.step, progress: s.progress, chatted: s.chatted.slice() };
    });
    return out;
  }

  // Used when loading a saved game. An old saved game without goals starts everyone on goal 1 with nothing done.
  function set(saved) {
    if (!saved || typeof saved !== "object") return;
    CHARACTERS.forEach(function (c) {
      var s = saved[c.id];
      if (!s || typeof s !== "object") return;
      var step = typeof s.step === "number" && isFinite(s.step) ? Math.max(0, Math.min(c.goals.length, Math.floor(s.step))) : 0;
      var progress = typeof s.progress === "number" && isFinite(s.progress) ? Math.max(0, Math.floor(s.progress)) : 0;
      var chatted = Array.isArray(s.chatted) ? s.chatted.filter(function (n, i, all) {
        return (n === "lumi" || n === "vladi") && all.indexOf(n) === i;
      }) : [];
      state[c.id] = { step: step, progress: progress, chatted: chatted };
    });
  }

  return {
    init: init,
    notify: notify,
    update: update,
    draw: draw,
    covers: covers,
    isMet: isMet,
    close: function () { setOpen(false); },
    get: get,
    set: set
  };
})();
