// Furniture in the house and things in the city that the characters can use, and what each action gives.
var Objects = (function () {
  // Each action raises one need by this many points over this many seconds.
  // "favorite" is how the action is written in a character's favorite activity.
  var ACTIONS = {
    eat: { text: "Comiendo 🍳", need: "hunger", amount: 35, duration: 4, favorite: "comer" },
    sleep: { text: "Durmiendo 💤", need: "energy", amount: 50, duration: 6, favorite: "dormir" },
    watchTv: { text: "Viendo tele 📺", need: "fun", amount: 35, duration: 4, favorite: "ver tele" },
    sleepTent: { text: "Durmiendo en la carpa 💤", need: "energy", amount: 50, duration: 6, favorite: "dormir" },
    campfire: { text: "Junto a la fogata 🔥", need: "fun", amount: 30, duration: 4, favorite: "sentarse junto a la fogata" }
  };

  // Usable furniture: its action and the spot where the character stands to use it.
  // "look" is where it looks while using it (on the Sofá, at the Televisión); otherwise it looks at the piece.
  // "owner" is the only one who may use it; anyone else gets the "notYours" bubble.
  // The Estufa has no action of its own: tapping it opens the recipe menu (js/cooking.js), like the Fogata.
  var USABLE = {
    stove: {},
    fridge: { action: "eat", spot: { x: 115, y: 200 } },
    bed: { action: "sleep", spot: { x: 815, y: 190 } },
    tv: { action: "watchTv", spot: { x: 450, y: 500 } },
    sofa: { action: "watchTv", spot: { x: 520, y: 615 }, look: { x: 520, y: 387 } },
    tent: { action: "sleepTent", spot: { x: 850, y: 395 }, owner: "realfixer", notYours: "Es la carpa de real.fixer" },
    campfire: { action: "campfire", spot: { x: 870, y: 490 } }
  };

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

  // Send a character to a piece of furniture; the action starts when it gets there.
  // If it belongs to someone else, it only shows a short bubble.
  function start(sim, furniture) {
    var use = USABLE[furniture.id];
    if (use.owner && use.owner !== sim.data.id) {
      current[sim.data.id] = { sim: sim, furniture: null, phase: "notYours", elapsed: 0, text: use.notYours };
      return;
    }
    var action = ACTIONS[use.action];
    var favorite = sim.data.favoriteActivity === action.favorite;
    current[sim.data.id] = {
      sim: sim,
      furniture: furniture,
      action: action,
      phase: "walking",
      elapsed: 0,
      multiplier: gainMultiplier(sim.data, use.action) * (favorite ? CONFIG.favoriteBonus : 1),
      favorite: favorite
    };
    Sims.walkTo(sim, use.spot.x, use.spot.y);
  }

  // Stop what a character is doing; true if it was doing something.
  function cancel(id) {
    var had = !!current[id];
    delete current[id];
    return had;
  }

  // Someone else is using it, or cooking at it.
  function isTaken(furniture, id) {
    return Object.keys(current).some(function (other) {
      var a = current[other];
      return other !== id && a.furniture === furniture && a.phase === "doing";
    }) || Cooking.isCookingAt(furniture, id);
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

  // Turn the character toward what it uses.
  function lookAt(a) {
    var f = a.furniture;
    var look = USABLE[f.id].look;
    var b = placeOf(f) === "city" ? f : House.bounds(f);
    if (look) Sims.face(a.sim, look.x, look.y);
    else Sims.face(a.sim, b.x + b.w / 2, b.y + b.h / 2);
  }

  // True if someone is watching tele right now, on the Sofá or at the Televisión.
  function isWatchingTv() {
    return Object.keys(current).some(function (id) {
      var a = current[id];
      return a.phase === "doing" && a.action === ACTIONS.watchTv;
    });
  }

  function update(dt) {
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

      // Doing: the need goes up a little every frame, never above 100.
      if (Needs.isPaused()) return;
      var step = Math.min(dt, a.action.duration - a.elapsed);
      a.elapsed += step;
      var values = Needs.get(id);
      var gain = a.action.amount / a.action.duration * a.multiplier * step;
      values[a.action.need] = Math.min(100, values[a.action.need] + gain);
      if (a.elapsed >= a.action.duration) delete current[id];
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
    update: update,
    bubbleFor: bubbleFor,
    freeFor: freeFor,
    isActive: isActive,
    isWatchingTv: isWatchingTv
  };
})();
