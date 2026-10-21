// Furniture the characters can use, and what each action gives.
var Objects = (function () {
  // Each action raises one need by this many points over this many seconds.
  // "favorite" is how the action is written in a character's favorite activity.
  var ACTIONS = {
    eat: { text: "Comiendo 🍳", need: "hunger", amount: 35, duration: 4, favorite: "comer" },
    sleep: { text: "Durmiendo 💤", need: "energy", amount: 50, duration: 6, favorite: "dormir" },
    watchTv: { text: "Viendo tele 📺", need: "fun", amount: 35, duration: 4, favorite: "ver tele" }
  };

  // Usable furniture: its action and the spot where the character stands to use it.
  var USABLE = {
    fridge: { action: "eat", spot: { x: 115, y: 200 } },
    bed: { action: "sleep", spot: { x: 815, y: 190 } },
    tv: { action: "watchTv", spot: { x: 450, y: 500 } },
    sofa: { action: "watchTv", spot: { x: 520, y: 615 } }
  };

  // How long the "Ocupado" bubble stays, in seconds.
  var BUSY_TIME = 1.5;

  // What each character is doing, by character id:
  // { sim, furniture, action, phase: "walking" | "doing" | "busy", elapsed, multiplier, favorite }
  var current = {};

  // The usable piece of furniture at a spot in the house, or null.
  function at(x, y) {
    for (var i = CONFIG.furniture.length - 1; i >= 0; i--) {
      var f = CONFIG.furniture[i];
      if (!USABLE[f.id]) continue;
      var b = House.bounds(f);
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

  // Send a character to a piece of furniture; the action starts when it gets there.
  function start(sim, furniture) {
    var use = USABLE[furniture.id];
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

  function isTaken(furniture, id) {
    return Object.keys(current).some(function (other) {
      var a = current[other];
      return other !== id && a.furniture === furniture && a.phase === "doing";
    });
  }

  // Usable furniture whose action raises a need, and that nobody else is using or walking to.
  function freeFor(needId, id) {
    return CONFIG.furniture.filter(function (f) {
      var use = USABLE[f.id];
      if (!use || ACTIONS[use.action].need !== needId) return false;
      return !Object.keys(current).some(function (other) {
        return other !== id && current[other].furniture === f;
      });
    });
  }

  function isActive(id) {
    return !!current[id];
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
        }
        return;
      }

      if (a.phase === "busy") {
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
    return { text: a.action.text, heart: a.favorite };
  }

  return {
    at: at,
    start: start,
    cancel: cancel,
    update: update,
    bubbleFor: bubbleFor,
    freeFor: freeFor,
    isActive: isActive
  };
})();
