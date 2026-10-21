// The needs of each character and how they drain over time.
var Needs = (function () {
  var state = {};
  var rates = {};
  var paused = false;

  // Drain speed of one need for one character, with all trait effects multiplied.
  function drainRate(character, need) {
    var rate = need.drain;
    character.traits.forEach(function (trait) {
      var effect = CONFIG.traitDrain[trait.id];
      if (!effect) return;
      if (effect.all) rate *= effect.all;
      if (effect[need.id]) rate *= effect[need.id];
    });
    return rate;
  }

  function init(characters) {
    characters.forEach(function (character) {
      state[character.id] = {};
      rates[character.id] = {};
      CONFIG.needs.forEach(function (need) {
        var v = CONFIG.needStartVariation;
        state[character.id][need.id] = CONFIG.needStart + (Math.random() * 2 - 1) * v;
        rates[character.id][need.id] = drainRate(character, need);
      });
    });
  }

  function update(dt) {
    if (paused) return;
    Object.keys(state).forEach(function (id) {
      CONFIG.needs.forEach(function (need) {
        state[id][need.id] = Math.max(0, state[id][need.id] - rates[id][need.id] * dt);
      });
    });
  }

  function get(id) {
    return state[id];
  }

  function colorFor(value) {
    if (value > CONFIG.needLevels.good) return CONFIG.needColors.good;
    if (value >= CONFIG.needLevels.low) return CONFIG.needColors.ok;
    return CONFIG.needColors.low;
  }

  // The needs of a character that are in red right now.
  function lowNeeds(id) {
    var values = state[id];
    if (!values) return [];
    return CONFIG.needs.filter(function (need) {
      return values[need.id] < CONFIG.needLevels.low;
    });
  }

  // Average of the four needs, for the mood star.
  function average(id) {
    var values = state[id];
    var sum = 0;
    CONFIG.needs.forEach(function (need) { sum += values[need.id]; });
    return sum / CONFIG.needs.length;
  }

  function togglePause() {
    paused = !paused;
    return paused;
  }

  function isPaused() {
    return paused;
  }

  return {
    init: init,
    update: update,
    get: get,
    colorFor: colorFor,
    lowNeeds: lowNeeds,
    average: average,
    togglePause: togglePause,
    isPaused: isPaused
  };
})();
