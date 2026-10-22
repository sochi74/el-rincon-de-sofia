// Furniture in the house and things in the city that the characters can use, and what each action gives.
var Objects = (function () {
  // Each action raises one need by this many points over this many seconds.
  // "favorite" is how the action is written in a character's favorite activity.
  // The Baño ones raise more than one need ("gains"), are nobody's favorite and no trait changes them,
  // so free will never picks them (it looks for actions with one "need"). "sparkle" puts a little ✨ over the head at the end.
  var ACTIONS = {
    eat: { text: "Comiendo 🍳", need: "hunger", amount: 35, duration: 4, favorite: "comer" },
    sleep: { text: "Durmiendo 💤", need: "energy", amount: 50, duration: 6, favorite: "dormir" },
    watchTv: { text: "Viendo tele 📺", need: "fun", amount: 35, duration: 4, favorite: "ver tele" },
    sleepTent: { text: "Durmiendo en la carpa 💤", need: "energy", amount: 50, duration: 6, favorite: "dormir" },
    campfire: { text: "Junto a la fogata 🔥", need: "fun", amount: 30, duration: 4, favorite: "sentarse junto a la fogata" },
    bath: { text: "Bañándose 🫧", gains: { fun: 25, energy: 20 }, duration: 5 },
    brushTeeth: { text: "Lavándose los dientes 🪥", gains: { fun: 5 }, duration: 2, sparkle: true }
  };
  // How long the little ✨ stays over the head after brushing the teeth, in seconds.
  var SPARKLE_TIME = 1.2;

  // Usable furniture: its action and the free spot next to it where the character walks to use it,
  // and where it stands up again when it finishes.
  // "look" is where it looks while using it; otherwise it looks at the piece.
  // "owner" is the only one who may use it; anyone else gets the "notYours" bubble.
  // "pose" is how it is drawn while using it (js/sims.js): lying in the Cama with its head on the pillow, sitting on
  // the Sofá, on the floor in front of the Televisión, in the Bañera (only the head shows), inside the Carpa (only the "Zzz" are seen)
  // or sitting on the log by the Fogata. "x", "y" is where its feet go (on the floor, where it stands).
  // In the house the spot, the look and the pose come from js/house.js, because Modo decorar moves and turns the furniture:
  // in front of the piece as it is turned, lying along the Cama and sitting looking where the Sofá looks.
  // The Estufa has no action of its own: tapping it opens the recipe menu (js/cooking.js), like the Fogata.
  // Cooking at the Fogata uses another spot, on the other side of the fire (js/cooking.js).
  // In the city these are the first spots: Modo decorar may move the tent with its campfire and log, and then they go along
  // ("City.follow").
  var SEAT = City.campfireSeat;
  var USABLE = {
    stove: {},
    fridge: { action: "eat" },
    bed: { action: "sleep" },
    tv: { action: "watchTv" },
    sofa: { action: "watchTv" },
    bathtub: { action: "bath" },
    sink: { action: "brushTeeth" },
    tent: {
      action: "sleepTent", spot: { x: 850, y: 395 }, owner: "realfixer", notYours: "Es la carpa de real.fixer",
      pose: { kind: "tent", zzz: { x: 856, y: 318 } }
    },
    campfire: { action: "campfire", spot: { x: SEAT.x, y: SEAT.y + 34 }, pose: { kind: "log", x: SEAT.x, y: SEAT.y + 10 } }
  };

  // Where a character stands to use a piece of furniture or a thing of the city (at the Televisión, where it sits on the floor).
  function spotOf(furniture) {
    if (placeOf(furniture) === "city") return City.follow("tent", USABLE[furniture.id].spot);
    if (furniture.id === "tv") return House.floorSeat();
    var b = House.bounds(furniture);
    return House.useSpot(furniture.id) || { x: b.x + b.w / 2, y: b.y + b.h + 20 };
  }

  function poseOf(furniture) {
    if (placeOf(furniture) !== "city") return House.poseFor(furniture.id);
    var pose = USABLE[furniture.id].pose;
    if (!pose) return null;
    var out = { kind: pose.kind };
    if (pose.zzz) out.zzz = City.follow("tent", pose.zzz);
    if (pose.x !== undefined) {
      var at = City.follow("tent", pose);
      out.x = at.x;
      out.y = at.y;
    }
    return out;
  }

  function lookOf(furniture) {
    return placeOf(furniture) === "city" ? USABLE[furniture.id].look : House.lookFor(furniture.id);
  }

  // How long the "Ocupado" bubble stays, in seconds.
  var BUSY_TIME = 1.5;

  // What each character is doing, by character id:
  // { sim, furniture, action, phase: "walking" | "doing" | "busy" | "notYours", elapsed, multiplier, favorite }
  var current = {};

  // "house" or "city": where a piece of furniture or a thing is.
  function placeOf(furniture) {
    return CONFIG.cityObjects.indexOf(furniture) >= 0 ? "city" : "house";
  }

  function listFor(place) {
    return place === "city" ? CONFIG.cityObjects : CONFIG.furniture;
  }

  // The usable piece of furniture (in the house) or thing (in the city) at a spot of that place, or null.
  function at(x, y, place) {
    var list = listFor(place);
    for (var i = list.length - 1; i >= 0; i--) {
      var f = list[i];
      if (!USABLE[f.id]) continue;
      var b = place === "city" ? f : House.bounds(f);
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return f;
    }
    return null;
  }

  // Trait effects on what an activity gives, all multiplied together.
  function gainMultiplier(character, actionId) {
    var m = 1;
    character.traits.forEach(function (trait) {
      var effect = CONFIG.traitGain[trait.id];
      if (effect && effect[actionId]) m *= effect[actionId];
    });
    return m;
  }

  // A tap on a piece of furniture: the Estufa and the Fogata open the recipe menu, the rest are used right away.
  function tap(sim, furniture, screenX, screenY) {
    if (Cooking.isStation(furniture.id)) {
      Cooking.tap(sim, furniture, screenX, screenY);
    } else {
      start(sim, furniture);
    }
  }

  // The Sofá, when it looks at the Televisión and nobody else is on it or going to it; else null.
  function freeSofa(id) {
    var sofa = CONFIG.furniture.filter(function (f) { return f.id === "sofa"; })[0];
    if (!sofa || !House.sofaFacesTv()) return null;
    var taken = Object.keys(current).some(function (other) { return other !== id && current[other].furniture === sofa; });
    return taken ? null : sofa;
  }

  // Send a character to a piece of furniture; the action starts when it gets there.
  // If it belongs to someone else, it only shows a short bubble.
  // At the Televisión it sits on the Sofá in front of it when it is free, and else on the floor in front of the tele.
  function start(sim, furniture) {
    if (furniture.id === "tv") furniture = freeSofa(sim.data.id) || furniture;
    var use = USABLE[furniture.id];
    if (use.owner && use.owner !== sim.data.id) {
      current[sim.data.id] = { sim: sim, furniture: null, phase: "notYours", elapsed: 0, text: use.notYours };
      return;
    }
    var action = ACTIONS[use.action];
    var favorite = !!action.favorite && sim.data.favoriteActivity === action.favorite;
    current[sim.data.id] = {
      sim: sim,
      furniture: furniture,
      action: action,
      phase: "walking",
      elapsed: 0,
      multiplier: action.gains ? 1 : gainMultiplier(sim.data, use.action) * (favorite ? CONFIG.favoriteBonus : 1),
      favorite: favorite
    };
    var spot = spotOf(furniture);
    Sims.walkTo(sim, spot.x, spot.y);
  }

  // Modo decorar moved the furniture (or the tent): whoever was walking to use a piece walks to where it is now.
  function refresh() {
    Object.keys(current).forEach(function (id) {
      var a = current[id];
      if (a.phase !== "walking") return;
      var spot = spotOf(a.furniture);
      Sims.walkTo(a.sim, spot.x, spot.y);
    });
  }

  // Stop what a character is doing; true if it was doing something.
  function cancel(id) {
    var had = !!current[id];
    delete current[id];
    return had;
  }

  // Someone else is using it. Cooking at the Fogata does not count: it has its own spot.
  function isTaken(furniture, id) {
    return Object.keys(current).some(function (other) {
      var a = current[other];
      return other !== id && a.furniture === furniture && a.phase === "doing";
    });
  }

  // Usable furniture in a place whose action raises a need, that this character may use,
  // and that nobody else is using or walking to. With "onlyId", just that one, wherever it is.
  function freeFor(needId, id, place, onlyId) {
    var list = onlyId ? CONFIG.furniture.concat(CONFIG.cityObjects) : listFor(place);
    return list.filter(function (f) {
      var use = USABLE[f.id];
      if (onlyId && f.id !== onlyId) return false;
      if (!use || !use.action || ACTIONS[use.action].need !== needId) return false;
      if (use.owner && use.owner !== id) return false;
      return !Object.keys(current).some(function (other) {
        return other !== id && current[other].furniture === f;
      });
    });
  }

  function isActive(id) {
    return !!current[id];
  }

  // How long a character has been using something (the bubbles of the Bañera rise with it), in seconds.
  function elapsedFor(id) {
    return current[id] ? current[id].elapsed : 0;
  }

  // Seconds left of the little ✨ over each one's head, by id.
  var sparkles = {};

  // How much of the ✨ is left over a character's head (1 just after brushing, down to 0), or 0.
  function sparkleFor(id) {
    return (sparkles[id] || 0) / SPARKLE_TIME;
  }

  // Turn the character toward what it uses.
  function lookAt(a) {
    var f = a.furniture;
    var look = lookOf(f);
    var b = placeOf(f) === "city" ? f : House.bounds(f);
    if (look) Sims.face(a.sim, look.x, look.y);
    else Sims.face(a.sim, b.x + b.w / 2, b.y + b.h / 2);
  }

  // How a character is drawn while it uses something (see "pose" above), or null when it just stands.
  function poseFor(id) {
    var a = current[id];
    if (!a || a.phase !== "doing") return null;
    return poseOf(a.furniture);
  }

  // True if someone is watching tele right now, on the Sofá or at the Televisión.
  function isWatchingTv() {
    return Object.keys(current).some(function (id) {
      var a = current[id];
      return a.phase === "doing" && a.action === ACTIONS.watchTv;
    });
  }

  function update(dt) {
    if (!Needs.isPaused()) {
      Object.keys(sparkles).forEach(function (id) {
        sparkles[id] -= dt;
        if (sparkles[id] <= 0) delete sparkles[id];
      });
    }
    Object.keys(current).forEach(function (id) {
      var a = current[id];

      if (a.phase === "walking") {
        if (a.sim.path.length > 0) return;
        if (isTaken(a.furniture, id)) {
          a.phase = "busy";
          a.elapsed = 0;
        } else {
          a.phase = "doing";
          a.elapsed = 0;
          lookAt(a);
        }
        return;
      }

      if (a.phase === "busy" || a.phase === "notYours") {
        a.elapsed += dt;
        if (a.elapsed >= BUSY_TIME) delete current[id];
        return;
      }

      // Doing: the need (or each need of "gains") goes up a little every frame, never above 100.
      if (Needs.isPaused()) return;
      var step = Math.min(dt, a.action.duration - a.elapsed);
      a.elapsed += step;
      var values = Needs.get(id);
      var gains = a.action.gains || {};
      if (!a.action.gains) gains[a.action.need] = a.action.amount;
      Object.keys(gains).forEach(function (need) {
        values[need] = Math.min(100, values[need] + gains[need] / a.action.duration * a.multiplier * step);
      });
      if (a.elapsed >= a.action.duration) {
        delete current[id];
        if (a.action.sparkle) sparkles[id] = SPARKLE_TIME;
      }
    });
  }

  // What to show over a character's head, or null.
  function bubbleFor(id) {
    var a = current[id];
    if (!a || a.phase === "walking") return null;
    if (a.phase === "busy") return { text: "Ocupado", heart: false };
    if (a.phase === "notYours") return { text: a.text, heart: false };
    return { text: a.action.text, heart: a.favorite };
  }

  return {
    at: at,
    placeOf: placeOf,
    tap: tap,
    start: start,
    isTaken: isTaken,
    cancel: cancel,
    refresh: refresh,
    update: update,
    bubbleFor: bubbleFor,
    poseFor: poseFor,
    freeFor: freeFor,
    isActive: isActive,
    elapsedFor: elapsedFor,
    sparkleFor: sparkleFor,
    isWatchingTv: isWatchingTv
  };
})();
