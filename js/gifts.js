// Gifts: from the backpack, the selected character gives something to the other one, when both are in the same place.
// The giver walks to the other, says "Regalando 🎁" for a while, and the other answers: a favorite gift (see "favoriteGifts"
// in js/characters.js) gives a lot of Amistad, the Bota vieja takes a little, and anything else gives some.
// Each one takes a few gifts per day of the game; after that the gift goes back to the backpack. Pausa freezes it all.
var Gifts = (function () {
  var K = CONFIG.gifts;

  // What each one says to a boot or when it already got enough today. Sofía speaks Spanish; real.fixer English with subtitles.
  var LINES = {
    sofia: {
      boot: { text: "¿Una bota?…", subtitle: null },
      enough: { text: "Ya me diste mucho hoy 😊", subtitle: null }
    },
    realfixer: {
      boot: { text: "A boot?…", subtitle: "¿Una bota?…" },
      enough: { text: "That's enough for today 😊", subtitle: "Ya me diste mucho hoy 😊" }
    }
  };

  // The gift going on right now, or null:
  // { from, to, itemId, phase: "walking" | "giving" | "answer", elapsed, answer: { phrase, emoji } }
  var gift = null;

  // How many gifts each one got on "day", by character id.
  var received = { day: 0, counts: {} };

  function today() {
    var day = Time.get().day;
    if (received.day !== day) received = { day: day, counts: {} };
    return received.counts;
  }

  function otherOf(sim) {
    return Sims.list().filter(function (s) { return s !== sim; })[0];
  }

  function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // True if the selected one can give something now: idle, nobody else giving, and the other one in the same place.
  function canGive(sim) {
    if (!sim || gift || !Sims.isIdle(sim)) return false;
    var other = otherOf(sim);
    return !!other && other.place === sim.place && !Social.isInvolved(other.data.id);
  }

  // Start a gift: the thing comes out of the backpack, the other stops what it was doing and the giver walks to it.
  function give(sim, itemId) {
    if (!canGive(sim) || !Inventory.take(itemId, 1)) return false;
    var other = otherOf(sim);
    var id = other.data.id;
    Objects.cancel(id);
    Garden.cancel(id);
    Gather.cancel(id);
    Cooking.cancel(id);
    other.path = [];
    other.goal = null;
    var side = sim.x <= other.x ? -1 : 1;
    var spot = Path.free(other.place, other.x + side * K.gap, other.y);
    Sims.walkTo(sim, spot.x, spot.y);
    gift = { from: sim, to: other, itemId: itemId, phase: "walking", elapsed: 0, answer: null };
    return true;
  }

  // Stop the gift if this character is in it; the thing goes back to the backpack unless it was already answered.
  function cancel(id) {
    if (!isInvolved(id)) return false;
    if (gift.phase !== "answer") Inventory.add(gift.itemId, 1);
    gift = null;
    return true;
  }

  function isInvolved(id) {
    return !!gift && (gift.from.data.id === id || gift.to.data.id === id);
  }

  // How the other one takes the gift. The Amistad goes up (or down) for both, with any trait effect on gifts.
  function answer() {
    var from = gift.from, to = gift.to, toId = to.data.id;
    var counts = today();
    if ((counts[toId] || 0) >= K.perDay) {
      return { phrase: LINES[toId].enough, emoji: null, back: true };
    }
    counts[toId] = (counts[toId] || 0) + 1;
    var favorite = (to.data.favoriteGifts || []).some(function (g) { return g.id === gift.itemId; });
    var result;
    if (favorite) {
      result = { amount: K.favorite, phrase: randomItem(to.data.phrases.happy), emoji: "❤️" };
    } else if (gift.itemId === "boot") {
      result = { amount: K.boot, phrase: LINES[toId].boot, emoji: "😒" };
    } else {
      result = { amount: K.other, phrase: null, emoji: "😊" };
    }
    var m = 1;
    from.data.traits.forEach(function (trait) {
      var effect = CONFIG.traitFriendship[trait.id];
      if (effect && effect.gift) m *= effect.gift;
    });
    Social.addFriendship(from.data.id, toId, result.amount * m);
    Social.addFriendship(toId, from.data.id, result.amount * m);
    return result;
  }

  function update(dt) {
    if (!gift) return;
    // Socializing or ending up in different places stops it.
    if (Social.isInvolved(gift.from.data.id) || Social.isInvolved(gift.to.data.id) || gift.from.place !== gift.to.place) {
      cancel(gift.from.data.id);
      return;
    }
    if (Needs.isPaused()) return;
    if (gift.phase === "walking") {
      if (gift.from.path.length > 0) return;
      gift.phase = "giving";
      gift.elapsed = 0;
      Sims.face(gift.from, gift.to.x, gift.to.y);
      Sims.face(gift.to, gift.from.x, gift.from.y);
      Sound.playAt(gift.from.place, "sparkle");
      return;
    }
    gift.elapsed += dt;
    if (gift.phase === "giving") {
      if (gift.elapsed < K.giveTime) return;
      gift.phase = "answer";
      gift.elapsed = 0;
      gift.answer = answer();
      if (gift.answer.back) Inventory.add(gift.itemId, 1);
      return;
    }
    if (gift.elapsed >= K.answerTime) gift = null;
  }

  // What to show over a character's head, or null: "Regalando 🎁" over the giver, then the answer over the other.
  function bubbleFor(id) {
    if (!gift) return null;
    if (gift.phase === "giving" && gift.from.data.id === id) return { text: "Regalando 🎁", heart: false };
    if (gift.phase === "answer" && gift.to.data.id === id && gift.answer.phrase) {
      return { text: gift.answer.phrase.text, subtitle: gift.answer.phrase.subtitle, heart: false, speech: true };
    }
    return null;
  }

  // The ❤️, 😒 or 😊 popping up next to the head of the one who got the gift, only in the place on screen.
  function draw(ctx, time) {
    if (!gift || gift.phase !== "answer" || !gift.answer.emoji || gift.to.place !== Sims.viewPlace()) return;
    var t = gift.elapsed / K.answerTime;
    var pop = Math.min(1, t * 5);
    var x = gift.to.x + (gift.from.x <= gift.to.x ? 38 : -38);
    var y = gift.to.y - 78 * CONFIG.characterScale - t * 18;
    ctx.save();
    ctx.globalAlpha = t > 0.8 ? (1 - t) * 5 : 1;
    ctx.font = Math.round(36 * pop * (1 + Math.sin(time * 7) * 0.06)) + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(gift.answer.emoji, x, y);
    ctx.restore();
  }

  // ---------- Saving ----------

  // The backpack to save: a gift on its way goes back in, so reloading never loses it.
  function withPending(saved) {
    if (gift && gift.phase !== "answer") {
      saved[gift.itemId] = (saved[gift.itemId] || 0) + 1;
    }
    return saved;
  }

  function get() {
    today();
    return { day: received.day, counts: received.counts };
  }

  // Used when loading a saved game. Anything strange is left out.
  function set(saved) {
    if (!saved || typeof saved !== "object" || typeof saved.day !== "number") return;
    var counts = {};
    Object.keys(saved.counts || {}).forEach(function (id) {
      var n = saved.counts[id];
      if (LINES[id] && typeof n === "number" && isFinite(n) && n >= 0) counts[id] = Math.floor(n);
    });
    received = { day: saved.day, counts: counts };
  }

  return {
    canGive: canGive,
    give: give,
    cancel: cancel,
    isInvolved: isInvolved,
    update: update,
    bubbleFor: bubbleFor,
    draw: draw,
    withPending: withPending,
    get: get,
    set: set
  };
})();
