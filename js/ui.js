// Small panel that shows the game clock, the magic coins, who is selected, their needs, friendship, a button to pick each character,
// and the Pausa and Reiniciar buttons.
// Also the little social menu that opens next to a character, the seed menu that opens next to an empty garden plot,
// and the word tag that shows
// the name of a thing in Spanish and English next to the mouse.
var UI = (function () {
  var coinsEl;
  var wordTag, wordEs, wordEn, wordSay, wordTimer = null;
  var panel, clockEl, nameEl, hintEl, needsEl, friendshipEl, pauseButton, menu, characterButtons;
  var onMenuPick = null;
  var seedMenu, seedButtons = [], onSeedPick = null;
  var current = null;
  var bars = {};

  function init() {
    panel = document.getElementById("selection-panel");
    clockEl = document.getElementById("clock");
    coinsEl = document.getElementById("coins");
    nameEl = document.getElementById("selection-name");
    hintEl = document.getElementById("selection-hint");
    needsEl = document.getElementById("needs");
    friendshipEl = document.getElementById("friendship");
    pauseButton = document.getElementById("pause-button");
    menu = document.getElementById("social-menu");
    characterButtons = document.querySelectorAll(".character-button");
    wordTag = document.getElementById("word-tag");
    wordEs = wordTag.querySelector(".word-es");
    wordEn = wordTag.querySelector(".word-en");
    wordSay = wordTag.querySelector(".word-say");

    Array.prototype.forEach.call(characterButtons, function (button) {
      button.addEventListener("click", function () {
        Sims.select(button.getAttribute("data-id"));
      });
    });

    // One button per seed: emoji and name, what the seed costs and what the flower sells for.
    seedMenu = document.getElementById("seed-menu");
    Garden.FLOWERS.forEach(function (f) {
      var button = document.createElement("button");
      button.type = "button";
      var name = document.createElement("span");
      name.className = "seed-name";
      name.textContent = f.emoji + " " + f.name;
      var price = document.createElement("span");
      price.className = "seed-price";
      price.textContent = "Semilla " + f.price + " 🪙 · Vende " + f.sell + " 🪙";
      button.appendChild(name);
      button.appendChild(price);
      button.addEventListener("click", function () {
        var pick = onSeedPick;
        closeMenu();
        if (pick) pick(f.id);
      });
      seedMenu.appendChild(button);
      seedButtons.push({ button: button, price: f.price });
    });

    Array.prototype.forEach.call(menu.querySelectorAll("button"), function (button) {
      button.addEventListener("click", function () {
        var pick = onMenuPick;
        closeMenu();
        if (pick) pick(button.getAttribute("data-type"));
      });
    });

    CONFIG.needs.forEach(function (need) {
      var row = document.createElement("div");
      row.className = "need-row";
      var label = document.createElement("span");
      label.className = "need-label";
      label.textContent = need.emoji + " " + need.name;
      var track = document.createElement("div");
      track.className = "need-track";
      var fill = document.createElement("div");
      fill.className = "need-fill";
      track.appendChild(fill);
      row.appendChild(label);
      row.appendChild(track);
      needsEl.appendChild(row);
      bars[need.id] = fill;
    });

    pauseButton.addEventListener("click", function () {
      var paused = Needs.togglePause();
      pauseButton.textContent = paused ? "▶️ Continuar" : "⏸️ Pausa";
    });

    document.getElementById("reset-button").addEventListener("click", function () {
      Save.reset();
    });

    showSelected(null);
  }

  function show() {
    panel.hidden = false;
  }

  function showSelected(character) {
    current = character;
    needsEl.hidden = !character;
    friendshipEl.hidden = !character;
    Array.prototype.forEach.call(characterButtons, function (button) {
      button.classList.toggle("selected", !!character && button.getAttribute("data-id") === character.id);
    });
    if (!character) {
      nameEl.textContent = "Nadie seleccionado";
      hintEl.textContent = "Toca a Sofía o a real.fixer";
      return;
    }
    nameEl.textContent = CONFIG.characterLooks[character.id].icon + " " + character.name;
    update();
  }

  function otherOf(character) {
    return CHARACTERS.filter(function (c) { return c.id !== character.id; })[0];
  }

  // What the selected character can do where it is.
  function hintFor(character) {
    var other = otherOf(character);
    var where = Sims.placeOf(character.id) === "city"
      ? "Toca el suelo para caminar, la Carpa o la Fogata para usarlas, una parcela del Jardín para plantar, regar o cosechar, la Casa de Sofía para entrar"
      : "Toca el piso para caminar, un mueble para usarlo, la puerta para salir";
    return where + " o a " + other.name + " para socializar (dos veces para elegirlo)";
  }

  // Refresh the clock, the magic coins, and the hint, bars and friendship of the selected character.
  function update() {
    var clock = Time.text();
    if (clockEl.textContent !== clock) clockEl.textContent = clock;
    var coins = Coins.text();
    if (coinsEl.textContent !== coins) coinsEl.textContent = coins;
    if (!seedMenu.hidden) updateSeeds();
    if (!current) return;
    var hint = hintFor(current);
    if (hintEl.textContent !== hint) hintEl.textContent = hint;
    var values = Needs.get(current.id);
    CONFIG.needs.forEach(function (need) {
      var value = values[need.id];
      bars[need.id].style.width = value + "%";
      bars[need.id].style.background = Needs.colorFor(value);
    });
    var other = otherOf(current);
    friendshipEl.textContent = "Amistad con " + other.name + ": " + Math.round(Social.friendshipWith(current.id, other.id));
  }

  // Open the social menu next to a spot on the screen, kept inside the window.
  function openMenu(x, y, onPick) {
    onMenuPick = onPick;
    menu.hidden = false;
    place(menu, x, y);
  }

  // Open the seed menu next to a spot on the screen. Seeds that cost more coins than there are look faded.
  function openSeedMenu(x, y, onPick) {
    onSeedPick = onPick;
    updateSeeds();
    seedMenu.hidden = false;
    place(seedMenu, x, y);
  }

  function updateSeeds() {
    var coins = Coins.amount();
    seedButtons.forEach(function (s) {
      var off = coins < s.price;
      if (s.button.disabled !== off) s.button.disabled = off;
    });
  }

  // Keep a menu next to a spot on the screen, inside the window.
  function place(el, x, y) {
    var w = el.offsetWidth, h = el.offsetHeight;
    el.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x + 14)) + "px";
    el.style.top = Math.max(8, Math.min(window.innerHeight - h - 8, y - h / 2)) + "px";
  }

  // Close the social menu and the seed menu.
  function closeMenu() {
    onMenuPick = null;
    onSeedPick = null;
    menu.hidden = true;
    seedMenu.hidden = true;
  }

  function isMenuOpen() {
    return !menu.hidden || !seedMenu.hidden;
  }

  // Show the word for a thing near a spot on the screen, kept inside the window.
  // With the mouse it goes below and to the right so it never covers the cursor;
  // with a finger it goes above, and hides by itself after "seconds".
  function showWord(id, x, y, seconds) {
    var word = WORDS[id];
    if (!word) {
      hideWord();
      return;
    }
    if (wordEs.textContent !== word.es) {
      wordEs.textContent = word.es;
      wordEn.textContent = word.en;
      wordSay.textContent = "(" + word.say + ")";
    }
    wordTag.hidden = false;
    var w = wordTag.offsetWidth, h = wordTag.offsetHeight;
    var left, top;
    if (seconds) {
      left = x - w / 2;
      top = y - h - 36;
      if (top < 8) top = y + 36;
    } else {
      left = x + 16;
      top = y + 22;
      if (left + w > window.innerWidth - 8) left = x - w - 12;
      if (top + h > window.innerHeight - 8) top = y - h - 12;
    }
    wordTag.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, left)) + "px";
    wordTag.style.top = Math.max(8, Math.min(window.innerHeight - h - 8, top)) + "px";
    window.clearTimeout(wordTimer);
    wordTimer = seconds ? window.setTimeout(hideWord, seconds * 1000) : null;
  }

  function hideWord() {
    window.clearTimeout(wordTimer);
    wordTimer = null;
    wordTag.hidden = true;
  }

  function isWordTimed() {
    return wordTimer !== null;
  }

  return {
    init: init,
    showWord: showWord,
    hideWord: hideWord,
    isWordTimed: isWordTimed,
    show: show,
    showSelected: showSelected,
    update: update,
    openMenu: openMenu,
    openSeedMenu: openSeedMenu,
    closeMenu: closeMenu,
    isMenuOpen: isMenuOpen
  };
})();
