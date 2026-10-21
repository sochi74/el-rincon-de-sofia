// Social interactions between the two characters, and their friendship.
var Social = (function () {
  // What each interaction gives to both characters.
  // "category" is the group of phrases used; "favorite" is how it is written in a favorite activity.
  var TYPES = {
    chat: { category: "chat", social: 15, friendship: 5, favorite: "charlar" },
    joke: { category: "joke", social: 10, friendship: 8, favorite: "contar un chiste" },
    highFive: { category: "highFive", social: 8, friendship: 4, favorite: "chocar los cinco", emoji: "🙌" }
  };

  // Friendship of each character toward the other, from -100 to 100.
  var friendship = {};

  // The conversation going on right now, or null:
  // { a, b, type, phase: "approach" | "talking" | "cheer", lines, index, elapsed }
  var convo = null;
  var cooldown = 0;
  // Seconds left for the "Un momento…" bubble, by character id.
  var waiting = {};

  function init(characters) {
    characters.forEach(function (character) {
      friendship[character.id] = {};
      Object.keys(character.relationships).forEach(function (otherId) {
        friendship[character.id][otherId] = character.relationships[otherId];
      });
    });
  }

  function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // 2 to 4 lines, taking turns. The one who starts always says a line of the interaction.
  // 2 lines: both say one. 3: a greeting first. 4: both greet first.
  function buildLines(a, b, type) {
    var count = 2 + Math.floor(Math.random() * 3);
    var lines = [];
    if (count >= 3) lines.push({ sim: a, phrase: randomItem(a.data.phrases.greeting) });
    if (count === 4) lines.push({ sim: b, phrase: randomItem(b.data.phrases.greeting) });
    lines.push({ sim: a, phrase: randomItem(a.data.phrases[type.category]) });
    lines.push({ sim: b, phrase: randomItem(b.data.phrases[type.category]) });
    if (count === 3) lines.splice(1, 0, lines.pop());
    return lines;
  }

  // Longer phrases stay a little longer on screen.
  function lineTime(line) {
    var s = CONFIG.social;
    return Math.min(s.lineMax, s.lineMin + line.phrase.text.length * s.lineExtraPerLetter);
  }

  // Where the two meet: halfway if they are in the same room, otherwise next to the one being visited.
  function meetingSpots(a, b) {
    var ra = Sims.roomAt(a.x, a.y), rb = Sims.roomAt(b.x, b.y);
    var room = rb || ra;
    var same = ra === rb;
    var cx = same ? (a.x + b.x) / 2 : b.x;
    var cy = same ? (a.y + b.y) / 2 : b.y;
    var gap = CONFIG.social.gap;
    if (room) {
      var m = CONFIG.walkMargin;
      cx = Math.max(room.x + m.side + gap, Math.min(room.x + room.w - m.side - gap, cx));
      cy = Math.max(room.y + m.top, Math.min(room.y + room.h - m.bottom, cy));
    }
    var aLeft = a.x <= b.x;
    return {
      a: { x: cx + (aLeft ? -gap : gap), y: cy },
      b: { x: cx + (aLeft ? gap : -gap), y: cy }
    };
  }

  function isBusy() {
    return !!convo || cooldown > 0;
  }

  // Show "Un momento…" over a character for a little while.
  function wait(id) {
    waiting[id] = CONFIG.social.waitBubbleTime;
  }

  // "a" goes to talk with "b". If they are using furniture, they leave it.
  // They only socialize when both are in the same place.
  function start(a, b, typeId) {
    if (a.place !== b.place) return;
    if (isBusy()) {
      wait(a.data.id);
      return;
    }
    var type = TYPES[typeId];
    Objects.cancel(a.data.id);
    Objects.cancel(b.data.id);
    var spots = meetingSpots(a, b);
    Sims.walkTo(a, spots.a.x, spots.a.y);
    Sims.walkTo(b, spots.b.x, spots.b.y);
    convo = { a: a, b: b, typeId: typeId, type: type, phase: "approach", lines: buildLines(a, b, type), index: 0, elapsed: 0 };
  }

  function finish() {
    convo = null;
    cooldown = CONFIG.social.cooldown;
  }

  // Stop the conversation if this character is in it; true if it was.
  function cancel(id) {
    if (!convo || (convo.a.data.id !== id && convo.b.data.id !== id)) return false;
    convo.a.path = [];
    convo.b.path = [];
    finish();
    return true;
  }

  // Trait effects on what an interaction gives one character, all multiplied together.
  function multipliers(sim, teller) {
    var social = 1, friend = 1;
    var typeId = convo.typeId;
    sim.data.traits.forEach(function (trait) {
      var effect = CONFIG.traitSocial[trait.id];
      if (!effect) return;
      if (effect.all) social *= effect.all;
      if (effect[typeId]) social *= effect[typeId];
    });
    teller.data.traits.forEach(function (trait) {
      var effect = CONFIG.traitFriendship[trait.id];
      if (effect && effect[typeId]) friend *= effect[typeId];
    });
    if (isFavorite(sim)) {
      social *= CONFIG.favoriteBonus;
      friend *= CONFIG.favoriteBonus;
    }
    return { social: social, friend: friend };
  }

  function isFavorite(sim) {
    return !!convo && sim.data.favoriteActivity === convo.type.favorite;
  }

  // Social never goes above 100; friendship stays between -100 and 100.
  function applyEffects() {
    [[convo.a, convo.b], [convo.b, convo.a]].forEach(function (pair) {
      var sim = pair[0], other = pair[1];
      var m = multipliers(sim, convo.a);
      var values = Needs.get(sim.data.id);
      values.social = Math.min(100, values.social + convo.type.social * m.social);
      var f = friendship[sim.data.id][other.data.id] + convo.type.friendship * m.friend;
      friendship[sim.data.id][other.data.id] = Math.max(-100, Math.min(100, f));
    });
  }

  function update(dt) {
    Object.keys(waiting).forEach(function (id) {
      waiting[id] -= dt;
      if (waiting[id] <= 0) delete waiting[id];
    });
    // The pause button freezes conversations too.
    if (Needs.isPaused()) return;
    cooldown = Math.max(0, cooldown - dt);
    if (!convo) return;

    if (convo.phase === "approach") {
      if (convo.a.path.length > 0 || convo.b.path.length > 0) return;
      convo.phase = "talking";
      convo.elapsed = 0;
      return;
    }

    convo.elapsed += dt;
    if (convo.phase === "talking") {
      if (convo.elapsed < lineTime(convo.lines[convo.index])) return;
      convo.index++;
      convo.elapsed = 0;
      if (convo.index < convo.lines.length) return;
      applyEffects();
      if (convo.type.emoji) {
        convo.phase = "cheer";
      } else {
        finish();
      }
      return;
    }

    if (convo.phase === "cheer" && convo.elapsed >= CONFIG.social.cheerTime) finish();
  }

  // Which way a character looks: toward the other one while they are together (-1 left, 1 right), else 0.
  function facing(id) {
    if (!convo) return 0;
    var me = convo.a.data.id === id ? convo.a : convo.b.data.id === id ? convo.b : null;
    if (!me) return 0;
    var other = me === convo.a ? convo.b : convo.a;
    return other.x >= me.x ? 1 : -1;
  }

  // What to say over a character's head, or null.
  // { text, subtitle, heart, speech: true } for a dialog line, { text } for "Un momento…".
  function bubbleFor(id) {
    if (convo && convo.phase === "talking") {
      var line = convo.lines[convo.index];
      if (line.sim.data.id === id) {
        return { text: line.phrase.text, subtitle: line.phrase.subtitle, heart: isFavorite(line.sim), speech: true };
      }
    }
    if (waiting[id]) return { text: "Un momento…", heart: false };
    return null;
  }

  // The 🙌 between them after a high five.
  function draw(ctx, time) {
    if (!convo || convo.phase !== "cheer" || convo.a.place !== Sims.viewPlace()) return;
    var t = convo.elapsed / CONFIG.social.cheerTime;
    var pop = Math.min(1, t * 4);
    var x = (convo.a.x + convo.b.x) / 2;
    var y = Math.min(convo.a.y, convo.b.y) - 60 * CONFIG.characterScale - t * 20;
    ctx.save();
    ctx.globalAlpha = t > 0.75 ? (1 - t) * 4 : 1;
    ctx.font = Math.round(40 * pop * (1 + Math.sin(time * 8) * 0.05)) + "px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(convo.type.emoji, x, y);
    ctx.restore();
  }

  function friendshipWith(id, otherId) {
    return (friendship[id] && friendship[id][otherId]) || 0;
  }

  // Used when loading a saved game.
  function setFriendship(id, otherId, value) {
    if (!friendship[id]) return;
    friendship[id][otherId] = Math.max(-100, Math.min(100, value));
  }

  // True if this character is in the conversation going on right now.
  function isInvolved(id) {
    return !!convo && (convo.a.data.id === id || convo.b.data.id === id);
  }

  return {
    init: init,
    start: start,
    cancel: cancel,
    update: update,
    facing: facing,
    bubbleFor: bubbleFor,
    draw: draw,
    friendshipWith: friendshipWith,
    setFriendship: setFriendship,
    isInvolved: isInvolved,
    isBusy: isBusy
  };
})();
