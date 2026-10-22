// Cooking and eating. Tapping the Estufa in the Cocina or the Fogata by real.fixer's tent opens a menu with the recipes;
// the character walks there, cooks for a while and the dish goes into the shared backpack (js/inventory.js).
// Dishes are eaten from the backpack, right where the character stands. Pausa freezes it all.
// real.fixer also eats berries from the backpack on his own when he is hungry.
var Cooking = (function () {
  var K = CONFIG.cooking;

  // Recipes: the dish they make (an item of the backpack), what it takes, and what eating it gives.
  var RECIPES = [
    { id: "fishMushroom", ingredients: { fish: 1, mushroom: 1 }, effect: { hunger: 60 } },
    { id: "crabSoup", ingredients: { crab: 1, mushroom: 1 }, effect: { hunger: 70 } },
    { id: "berryPie", ingredients: { berry: 2 }, effect: { hunger: 40, fun: 15 } },
    { id: "magicDish", ingredients: { rainbowFish: 1, crystal: 1 }, effect: { hunger: 60, energy: 40 } }
  ];

  // A berry as a snack: only real.fixer eats them, on his own (free will), and they have no "Comer" button.
  // About half the times he says "Yum, berries!" when he finishes.
  var BERRY = { id: "berry", effect: { hunger: 25 }, time: 2 };
  var BERRY_EATER = "realfixer";
  var YUM = { text: "Yum, berries!", subtitle: "¡Mmm, bayas!" };
  var YUM_CHANCE = 0.5;
  var YUM_TIME = 2.5;

  // Where the character stands to cook at each place, by the id of the furniture or city thing.
  // At the Fogata it is on the other side of the fire from the log, so one can cook while the other sits.
  // At the Estufa it is in front of it, wherever Modo decorar put it (js/house.js says where).
  var STATIONS = {
    stove: { place: "house" },
    campfire: { place: "city", spot: { x: 870, y: 490 } }
  };

  function spotAt(station) {
    var s = STATIONS[station.id];
    if (s.spot) return s.spot;
    var b = House.bounds(station);
    return House.useSpot(station.id) || { x: b.x + b.w / 2, y: b.y + b.h + 20 };
  }

  // The middle of the Estufa or the Fogata, to look at it while cooking.
  function middleOf(station) {
    var b = STATIONS[station.id].place === "house" ? House.bounds(station) : station;
    return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  }

  // What each character is doing, by character id:
  // cooking { sim, kind: "cook", station, recipe, phase: "walking" | "doing" | "busy", elapsed }
  // eating { sim, kind: "eat", recipe, phase: "doing", elapsed } (the dish or berry is already out of the backpack)
  // saying "Yum, berries!" { sim, kind: "yum", phase: "doing", elapsed }
  var current = {};

  // Texts floating up when a dish is ready, as { x, y, place, text, age }.
  var pops = [];

  function recipe(id) {
    return RECIPES.filter(function (r) { return r.id === id; })[0] || null;
  }

  function isDish(id) {
    return !!recipe(id);
  }

  function canMake(r) {
    return Object.keys(r.ingredients).every(function (id) {
      return Inventory.count(id) >= r.ingredients[id];
    });
  }

  function isStation(id) {
    return !!STATIONS[id];
  }

  // ---------- Cooking ----------

  // Tap on the Estufa or the Fogata: the character walks there and the recipe menu opens next to the tap.
  // At the Fogata the menu also has "Junto a la fogata 🔥", to sit by the fire as before.
  // Closing the menu without picking stops the character where it is.
  function tap(sim, station, screenX, screenY) {
    var spot = spotAt(station);
    Sims.walkTo(sim, spot.x, spot.y);
    UI.openCookMenu(screenX, screenY, station.id === "campfire", function () {
      sim.path = [];
    }, function (pick) {
      if (pick === "campfire") {
        Objects.start(sim, station);
        return;
      }
      current[sim.data.id] = { sim: sim, kind: "cook", station: station, recipe: recipe(pick), phase: "walking", elapsed: 0 };
      Sims.walkTo(sim, spot.x, spot.y);
    });
  }

  // True if someone else is cooking at this place.
  function isCookingAt(station, id) {
    return Object.keys(current).some(function (other) {
      var a = current[other];
      return other !== id && a.kind === "cook" && a.station === station && a.phase === "doing";
    });
  }

  // Floating text over the head of a character, seen only where it is.
  function popOver(sim, text) {
    pops.push({ x: sim.x, y: sim.y - 78 * CONFIG.characterScale - CONFIG.moodStar.room - 30, place: sim.place, text: text, age: 0 });
  }

  // The dish is ready: the ingredients come out of the backpack and the dish goes in.
  // If the other one used them meanwhile, there is no dish.
  function finishCooking(a) {
    var r = a.recipe;
    if (!canMake(r)) {
      popOver(a.sim, "Faltan ingredientes");
      return;
    }
    Object.keys(r.ingredients).forEach(function (id) { Inventory.take(id, r.ingredients[id]); });
    Inventory.add(r.id, 1);
    var dish = Inventory.item(r.id);
    popOver(a.sim, "¡" + dish.name + "! " + dish.emoji);
  }

  // ---------- Eating ----------

  // Eat a dish from the backpack right where the character stands; false if there is none or it is busy.
  function eat(sim, dishId) {
    var r = recipe(dishId);
    if (!r || !Sims.isIdle(sim) || !Inventory.take(dishId, 1)) return false;
    current[sim.data.id] = { sim: sim, kind: "eat", recipe: r, phase: "doing", elapsed: 0 };
    return true;
  }

  // Free will: real.fixer eats a berry right where he stands; false if there is none or he is busy.
  function eatBerry(sim) {
    if (sim.data.id !== BERRY_EATER || !Sims.isIdle(sim) || !Inventory.take(BERRY.id, 1)) return false;
    current[sim.data.id] = { sim: sim, kind: "eat", recipe: BERRY, phase: "doing", elapsed: 0 };
    return true;
  }

  // Free will: true if this character would eat a berry now (only real.fixer, with berries in the backpack).
  function hasBerryFor(sim) {
    return sim.data.id === BERRY_EATER && Inventory.count(BERRY.id) > 0;
  }

  // Free will: the cheapest dish there is in the backpack, or null (so the Plato mágico is kept while there is something simpler).
  function anyDish() {
    var best = null;
    RECIPES.forEach(function (rec) {
      if (Inventory.count(rec.id) === 0) return;
      if (!best || Inventory.item(rec.id).price < Inventory.item(best.id).price) best = rec;
    });
    return best ? best.id : null;
  }

  function finishEating(a) {
    var values = Needs.get(a.sim.data.id);
    Object.keys(a.recipe.effect).forEach(function (need) {
      values[need] = Math.min(100, values[need] + a.recipe.effect[need]);
    });
    if (a.recipe === BERRY) {
      if (Math.random() < YUM_CHANCE) current[a.sim.data.id] = { sim: a.sim, kind: "yum", phase: "doing", elapsed: 0 };
      return;
    }
    Goals.notify("eat", a.sim.data.id, a.recipe.id);
  }

  // ---------- Every frame ----------

  // Stop what a character is doing; a dish half eaten goes back into the backpack. True if it was doing something.
  function cancel(id) {
    var a = current[id];
    if (!a) return false;
    if (a.kind === "eat") Inventory.add(a.recipe.id, 1);
    delete current[id];
    return true;
  }

  function isActive(id) {
    return !!current[id];
  }

  // Modo decorar moved the Estufa: whoever was walking there to cook walks to where it is now.
  function refresh() {
    Object.keys(current).forEach(function (id) {
      var a = current[id];
      if (a.kind !== "cook" || a.phase !== "walking" || STATIONS[a.station.id].place !== "house") return;
      var spot = spotAt(a.station);
      Sims.walkTo(a.sim, spot.x, spot.y);
    });
  }

  // How many seconds it takes.
  function timeFor(a) {
    if (a.kind === "cook") return K.cookTime;
    if (a.kind === "yum") return YUM_TIME;
    return a.recipe.time || K.eatTime;
  }

  function update(dt) {
    pops.forEach(function (p) { p.age += dt; });
    pops = pops.filter(function (p) { return p.age < K.popTime; });

    Object.keys(current).forEach(function (id) {
      var a = current[id];
      // Starting to socialize ends it, and so does leaving the place where it cooks.
      if (Social.isInvolved(id) || (a.kind === "cook" && a.sim.place !== STATIONS[a.station.id].place)) {
        cancel(id);
        return;
      }
      if (a.phase === "walking") {
        if (a.sim.path.length > 0) return;
        a.phase = isCookingAt(a.station, id) ? "busy" : "doing";
        a.elapsed = 0;
        var mid = middleOf(a.station);
        if (a.phase === "doing") Sims.face(a.sim, mid.x, mid.y);
        if (a.phase === "doing") Sound.playAt(a.sim.place, "sizzle");
        return;
      }
      if (a.phase === "busy") {
        a.elapsed += dt;
        if (a.elapsed >= K.busyTime) delete current[id];
        return;
      }
      if (Needs.isPaused()) return;
      a.elapsed += dt;
      if (a.elapsed < timeFor(a)) return;
      delete current[id];
      if (a.kind === "cook") {
        finishCooking(a);
      } else if (a.kind === "eat") {
        finishEating(a);
      }
    });
  }

  // What to show over a character's head, or null.
  function bubbleFor(id) {
    var a = current[id];
    if (!a || a.phase === "walking") return null;
    if (a.phase === "busy") return { text: "Ocupado", heart: false };
    if (a.kind === "yum") return { text: YUM.text, subtitle: YUM.subtitle, heart: false, speech: true };
    if (a.kind === "cook") return { text: "Cocinando 🍳", heart: false };
    return { text: a.recipe === BERRY ? "Comiendo 🍒" : "Comiendo 🍽️", heart: false };
  }

  // The floating texts when a dish is ready, over everything, only in the place on screen.
  function drawPops(ctx) {
    var view = Sims.viewPlace();
    pops.forEach(function (p) {
      if (p.place !== view) return;
      var t = p.age / K.popTime;
      ctx.save();
      ctx.globalAlpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      ctx.font = "bold 22px " + CONFIG.fontFamily;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var ty = p.y - t * 40;
      ctx.lineWidth = 5;
      ctx.strokeStyle = CONFIG.colors.darkBrown;
      ctx.strokeText(p.text, p.x, ty);
      ctx.fillStyle = CONFIG.colors.cream;
      ctx.fillText(p.text, p.x, ty);
      ctx.restore();
    });
  }

  // ---------- Saving ----------

  // The backpack to save: dishes and berries being eaten right now go back in, so reloading never loses one.
  function withPending(saved) {
    Object.keys(current).forEach(function (id) {
      var a = current[id];
      if (a.kind === "eat") saved[a.recipe.id] = (saved[a.recipe.id] || 0) + 1;
    });
    return saved;
  }

  return {
    RECIPES: RECIPES,
    recipe: recipe,
    isDish: isDish,
    canMake: canMake,
    isStation: isStation,
    tap: tap,
    eat: eat,
    eatBerry: eatBerry,
    hasBerryFor: hasBerryFor,
    anyDish: anyDish,
    cancel: cancel,
    refresh: refresh,
    isActive: isActive,
    isCookingAt: isCookingAt,
    update: update,
    bubbleFor: bubbleFor,
    drawPops: drawPops,
    withPending: withPending
  };
})();
