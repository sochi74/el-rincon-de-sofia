// Saves and loads the game in the browser: needs, where each character is (house or city) and stands, friendship,
// the day and hour of the game clock, the magic coins (the counter and the shiny coins on the ground), the garden plots,
// the backpack and the things in the forest.
// It also remembers, apart from the game, whether the panel was open or closed.
// Every use of localStorage is inside try/catch, so the game keeps working if it fails.
var Save = (function () {
  var timer = 0;
  var running = false;
  // Turned off by "Reiniciar", so closing the page does not save again.
  var enabled = true;

  function snapshot() {
    var data = { characters: {}, clock: Time.get(), coins: Coins.get(), garden: Garden.get(),
      inventory: Inventory.get(), forest: Gather.get() };
    Sims.list().forEach(function (sim) {
      var id = sim.data.id;
      var friendship = {};
      Sims.list().forEach(function (other) {
        if (other !== sim) friendship[other.data.id] = Social.friendshipWith(id, other.data.id);
      });
      var needs = {};
      var values = Needs.get(id);
      CONFIG.needs.forEach(function (need) { needs[need.id] = values[need.id]; });
      data.characters[id] = { place: sim.place, x: sim.x, y: sim.y, needs: needs, friendship: friendship };
    });
    return data;
  }

  function save() {
    if (!enabled) return;
    try {
      window.localStorage.setItem(CONFIG.save.key, JSON.stringify(snapshot()));
    } catch (e) {
      // No saving this time; the game goes on.
    }
  }

  // Load the saved game, if there is one. Anything missing or strange is left as it was.
  function load() {
    var data;
    try {
      var text = window.localStorage.getItem(CONFIG.save.key);
      if (!text) return;
      data = JSON.parse(text);
    } catch (e) {
      return;
    }
    if (!data || typeof data.characters !== "object") return;
    if (data.clock && typeof data.clock === "object") Time.set(data.clock.day, data.clock.minute);
    Coins.set(data.coins);
    Garden.set(data.garden);
    Inventory.set(data.inventory);
    Gather.set(data.forest);
    Sims.list().forEach(function (sim) {
      var id = sim.data.id;
      var saved = data.characters[id];
      if (!saved || typeof saved !== "object") return;
      Sims.place(sim, saved.x, saved.y, saved.place);
      var values = Needs.get(id);
      CONFIG.needs.forEach(function (need) {
        var v = saved.needs && saved.needs[need.id];
        if (typeof v === "number" && isFinite(v)) values[need.id] = Math.max(0, Math.min(100, v));
      });
      Object.keys(saved.friendship || {}).forEach(function (otherId) {
        var f = saved.friendship[otherId];
        if (typeof f === "number" && isFinite(f)) Social.setFriendship(id, otherId, f);
      });
    });
  }

  // Saving starts when the player taps "Jugar".
  function start() {
    running = true;
    timer = 0;
  }

  function update(dt) {
    if (!running) return;
    timer += dt;
    if (timer >= CONFIG.save.every) {
      timer = 0;
      save();
    }
  }

  // Close the page or reload it.
  function onLeave() {
    if (running) save();
  }

  // Forget the saved game and start over.
  function reset() {
    enabled = false;
    try {
      window.localStorage.removeItem(CONFIG.save.key);
    } catch (e) {
      // Nothing saved to forget.
    }
    window.location.reload();
  }

  // Whether the panel was open last time. If nothing was saved or it fails, it starts open.
  function loadMenuOpen() {
    try {
      return window.localStorage.getItem(CONFIG.save.menuKey) !== "closed";
    } catch (e) {
      return true;
    }
  }

  function saveMenuOpen(open) {
    try {
      window.localStorage.setItem(CONFIG.save.menuKey, open ? "open" : "closed");
    } catch (e) {
      // Not remembered this time; the game goes on.
    }
  }

  return { loadMenuOpen: loadMenuOpen, saveMenuOpen: saveMenuOpen, load: load, start: start, update: update, onLeave: onLeave, reset: reset };
})();
