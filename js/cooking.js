// Cooking and eating. Tapping the Estufa in the Cocina or the Fogata by real.fixer's tent opens a menu with the recipes;
// the character walks there, cooks for a while and the dish goes into the shared backpack (js/inventory.js).
// Dishes are eaten from the backpack, right where the character stands. Pausa freezes it all.
var Cooking = (function () {
  var K = CONFIG.cooking;

  // Recipes: the dish they make (an item of the backpack), what it takes, and what eating it gives.
  var RECIPES = [
    { id: "fishMushroom", ingredients: { fish: 1, mushroom: 1 }, effect: { hunger: 60 } },
    { id: "crabSoup", ingredients: { crab: 1, mushroom: 1 }, effect: { hunger: 70 } },
    { id: "berryPie", ingredients: { berry: 2 }, effect: { hunger: 40, fun: 15 } },
    { id: "magicDish", ingredients: { rainbowFish: 1, crystal: 1 }, effect: { hunger: 60, energy: 40 } }
  ];

  // Where the character stands to cook at each place, by the id of the furniture or city thing.
  // At the Fogata it is on the other side of the fire from the log, so one can cook while the other sits.
  var STATIONS = {
    stove: { place: "house", spot: { x: 280, y: 200 } },
    campfire: { place: "city", spot: { x: 870, y: 490 } }
  };

  // What each character is doing, by character id:
  // cooking { sim, kind: "cook", station, recipe, phase: "walking" | "doing" | "busy", elapsed }
  // eating { sim, kind: "eat", recipe, phase: "doing", elapsed } (the dish is already out of the backpack)
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
    var s = STATIONS[station.id];
    Sims.walkTo(sim, s.spot.x, s.spot.y);
    UI.openCookMenu(screenX, screenY, station.id === "campfire", function () {
      sim.path = [];
    }, function (pick) {
      if (pick === "campfire") {
        Objects.start(sim, station);
        return;
      }
      current[sim.data.id] = { sim: sim, kind: "cook", station: station, recipe: recipe(pick), phase: "walking", elapsed: 0 };
      Sims.walkTo(sim, s.spot.x, s.spot.y);
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
        if (a.phase === "doing") Sims.face(a.sim, a.station.x + a.station.w / 2, a.station.y + a.station.h / 2);
        return;
      }
      if (a.phase === "busy") {
        a.elapsed += dt;
        if (a.elapsed >= K.busyTime) delete current[id];
        return;
      }
      if (Needs.isPaused()) return;
      a.elapsed += dt;
      if (a.elapsed < (a.kind === "cook" ? K.cookTime : K.eatTime)) return;
      delete current[id];
      if (a.kind === "cook") {
        finishCooking(a);
      } else {
        finishEating(a);
      }
    });
  }

  // What to show over a character's head, or null.
  function bubbleFor(id) {
    var a = current[id];
    if (!a || a.phase === "walking") return null;
    if (a.phase === "busy") return { text: "Ocupado", heart: false };
    return { text: a.kind === "cook" ? "Cocinando 🍳" : "Comiendo 🍽️", heart: false };
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

  // The backpack to save: dishes being eaten right now go back in, so reloading never loses one.
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
    anyDish: anyDish,
    cancel: cancel,
    isActive: isActive,
    isCookingAt: isCookingAt,
    update: update,
    bubbleFor: bubbleFor,
    drawPops: drawPops,
    withPending: withPending
  };
})();
