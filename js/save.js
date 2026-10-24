// Saves and loads the game in the browser: needs, where each character is (house, city or Pradera), stands and looks, friendship,
// the day and hour of the game clock, the weather of the day (with its puddles, snow and snowman), the magic coins (the counter and the shiny coins on the ground), the garden plots,
// the backpack (with its dishes) and the things in the forest, the wild flowers of the Pradera, the zones of the Mapa del valle
// already found, how many gifts each one got today,
// where each neighbor is (and whether Vladi or Professor Hoot is inside his home) with its friendship toward each one,
// and each one's goals: the goal it is on, how far it got, and so the decorations of the goals already met,
// and where Modo decorar put each thing and which way it is turned (in the house and in the city),
// and where Professor Hoot's list of words is (and whether today's word is done).
// The Diario de palabras is saved apart, by js/lessons.js, so "Reiniciar" does not forget it.
// It also remembers, apart from the game, whether the panel was open or closed.
// Every use of localStorage is inside try/catch, so the game keeps working if it fails.
var Save = (function () {
  var timer = 0;
  var running = false;
  // Turned off by "Reiniciar", so closing the page does not save again.
  var enabled = true;

  function snapshot() {
    var data = { characters: {}, clock: Time.get(), weather: Weather.get(), coins: Coins.get(), garden: Garden.get(),
      inventory: Meadow.withPending(Gifts.withPending(Cooking.withPending(Inventory.get()))), forest: Gather.get(),
      meadow: Meadow.get(), valley: ValleyMap.get(), gifts: Gifts.get(),
      neighbors: Neighbors.get(), goals: Goals.get(), lessons: Lessons.get(),
      layout: { house: House.getLayout(), city: City.getLayout() } };
    Sims.list().forEach(function (sim) {
      var id = sim.data.id;
      var friendship = friendshipOf(id);
      var needs = {};
      var values = Needs.get(id);
      CONFIG.needs.forEach(function (need) { needs[need.id] = values[need.id]; });
      data.characters[id] = { place: sim.place, x: sim.x, y: sim.y, facing: sim.facing, needs: needs, friendship: friendship };
    });
    Object.keys(data.neighbors).forEach(function (id) {
      data.neighbors[id].friendship = friendshipOf(id);
    });
    return data;
  }

  // The friendship of one character toward each other one, by id.
  function friendshipOf(id) {
    var friendship = {};
    CHARACTERS.forEach(function (other) {
      if (other.id !== id) friendship[other.id] = Social.friendshipWith(id, other.id);
    });
    return friendship;
  }

  // Used when loading: only numbers, and only toward characters that exist.
  function loadFriendship(id, saved) {
    if (!saved || typeof saved !== "object") return;
    Object.keys(saved).forEach(function (otherId) {
      var f = saved[otherId];
      var known = CHARACTERS.some(function (c) { return c.id === otherId && c.id !== id; });
      if (known && typeof f === "number" && isFinite(f)) Social.setFriendship(id, otherId, f);
    });
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
    // After the clock, and before the forest (on foggy days it holds more). An old saved game has a sunny day today.
    Weather.set(data.weather);
    // An old saved game has no goals: everyone starts on goal 1 (the Amistad ones are checked right away).
    Goals.set(data.goals);
    // An old saved game starts Professor Hoot's words from the first one.
    Lessons.set(data.lessons);
    // Where each thing is, before anything looks for free spots. An old saved game has everything in its first spot.
    var layout = data.layout && typeof data.layout === "object" ? data.layout : {};
    House.setLayout(layout.house);
    City.setLayout(layout.city);
    // The goals and the layout say where the guitar and the pot are solid: whoever was saved on one steps off it.
    Path.reset();
    // The forest first, so the coins can stay off its things.
    Gather.set(data.forest);
    Coins.set(data.coins);
    // An old saved game keeps the wild flowers of a new game, and only knows the Ciudad.
    Meadow.set(data.meadow);
    ValleyMap.set(data.valley);
    Garden.set(data.garden);
    Inventory.set(data.inventory);
    Gifts.set(data.gifts);
    // An old saved game has no neighbors: they start by their homes, and all their friendship at 0.
    Neighbors.set(data.neighbors);
    var neighbors = data.neighbors && typeof data.neighbors === "object" ? data.neighbors : {};
    Object.keys(neighbors).forEach(function (id) {
      if (neighbors[id] && typeof neighbors[id] === "object") loadFriendship(id, neighbors[id].friendship);
    });
    Sims.list().forEach(function (sim) {
      var id = sim.data.id;
      var saved = data.characters[id];
      if (!saved || typeof saved !== "object") return;
      Sims.place(sim, saved.x, saved.y, saved.place, saved.facing);
      var values = Needs.get(id);
      CONFIG.needs.forEach(function (need) {
        var v = saved.needs && saved.needs[need.id];
        if (typeof v === "number" && isFinite(v)) values[need.id] = Math.max(0, Math.min(100, v));
      });
      loadFriendship(id, saved.friendship);
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

  // Close the page or reload it. A thing being dragged in Modo decorar goes back to where it was first.
  function onLeave() {
    Decorate.cancelDrag();
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

  // Whether the panel was open last time. If nothing was saved or it fails, it starts as "first" says
  // (open, or closed on a small screen).
  function loadMenuOpen(first) {
    try {
      var saved = window.localStorage.getItem(CONFIG.save.menuKey);
      return saved ? saved !== "closed" : first;
    } catch (e) {
      return first;
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
