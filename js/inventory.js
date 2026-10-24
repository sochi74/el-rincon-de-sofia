// The backpack: one for the whole house, shared by Sofía and real.fixer. It keeps what they fish in the river
// and gather in the forest (and the wild flowers of the Pradera, js/meadow.js, and what comes from the Lago, js/lake.js) and the dishes they cook (js/cooking.js), and sells it for magic coins. Flowers from the garden are still sold when harvested.
var Inventory = (function () {
  // Everything that can go in the backpack, in the order the backpack shows it: name, emoji and price in coins.
  var ITEMS = [
    { id: "fish", name: "Pez plateado", emoji: "🐟", price: 6 },
    { id: "crab", name: "Cangrejo", emoji: "🦀", price: 10 },
    { id: "rainbowFish", name: "Pez arcoíris", emoji: "🐠", price: 20 },
    { id: "moonFish", name: "Pez luna", emoji: "🌙", price: 40 },
    { id: "boot", name: "Bota vieja", emoji: "👢", price: 1 },
    { id: "berry", name: "Bayas", emoji: "🍒", price: 3 },
    { id: "mushroom", name: "Hongo", emoji: "🍄", price: 5 },
    { id: "crystal", name: "Cristal", emoji: "💎", price: 15 },
    // Wild flowers of the Pradera (js/meadow.js)
    { id: "daisy", name: "Margarita", emoji: "🌼", price: 4 },
    { id: "poppy", name: "Amapola", emoji: "🌺", price: 6 },
    { id: "lavender", name: "Lavanda", emoji: "💜", price: 9 },
    // From the Lago (js/lake.js): what comes out of the lake (the old boots are the same as the river's) and the beach
    { id: "trout", name: "Trucha", emoji: "🐟", price: 8 },
    { id: "shrimp", name: "Camarón", emoji: "🦐", price: 12 },
    { id: "pearlFish", name: "Pez perla", emoji: "✨", price: 35 },
    { id: "shell", name: "Concha", emoji: "🐚", price: 5 },
    { id: "starfish", name: "Estrella de mar", emoji: "⭐", price: 8 },
    // Dishes
    { id: "fishMushroom", name: "Pescado con hongos", emoji: "🍛", price: 18 },
    { id: "crabSoup", name: "Sopa de cangrejo", emoji: "🦀", price: 25 },
    { id: "berryPie", name: "Tarta de bayas", emoji: "🥧", price: 12 },
    { id: "magicDish", name: "Plato mágico", emoji: "✨", price: 50 }
  ];

  // How many of each thing there are, by id.
  var counts = {};

  function item(id) {
    return ITEMS.filter(function (it) { return it.id === id; })[0] || null;
  }

  function add(id, n) {
    if (!item(id)) return;
    counts[id] = (counts[id] || 0) + (n || 1);
  }

  function count(id) {
    return counts[id] || 0;
  }

  // Take some of a thing out (to cook or eat it); false if there are not enough.
  function take(id, n) {
    var have = count(id);
    if (have < n) return false;
    counts[id] = have - n;
    if (counts[id] === 0) delete counts[id];
    return true;
  }

  // The things there are, in the backpack's order, as { item, count }.
  function list() {
    return ITEMS.filter(function (it) { return count(it.id) > 0; }).map(function (it) {
      return { item: it, count: count(it.id) };
    });
  }

  // Sell one or all of a thing; returns the coins it gave (0 if there was none).
  function sell(id, all) {
    var it = item(id);
    var have = count(id);
    if (!it || have === 0) return 0;
    var n = all ? have : 1;
    counts[id] = have - n;
    if (counts[id] === 0) delete counts[id];
    var coins = n * it.price;
    Coins.add(coins);
    return coins;
  }

  // ---------- Saving ----------

  function get() {
    var out = {};
    Object.keys(counts).forEach(function (id) { out[id] = counts[id]; });
    return out;
  }

  // Used when loading a saved game. Anything strange is left out.
  function set(saved) {
    if (!saved || typeof saved !== "object") return;
    counts = {};
    ITEMS.forEach(function (it) {
      var n = saved[it.id];
      if (typeof n === "number" && isFinite(n) && n >= 1) counts[it.id] = Math.floor(n);
    });
  }

  return { ITEMS: ITEMS, item: item, add: add, take: take, count: count, list: list, sell: sell, get: get, set: set };
})();
