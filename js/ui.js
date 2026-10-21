// Small panel that shows the game clock, the magic coins, who is selected, their needs, friendship, a button to pick each character,
// and the Pausa and Reiniciar buttons. A round button in the corner opens and closes the panel (☰ / ✕).
// Also the little social menu that opens next to a character, the seed menu that opens next to an empty garden plot,
// the backpack window with everything in it and its sell buttons, and the word tag that shows
// the name of a thing in Spanish and English next to the mouse.
var UI = (function () {
  var coinsEl;
  var wordTag, wordEs, wordEn, wordSay, wordTimer = null;
  var menuToggle, panelOpen = true;
  var panel, clockEl, nameEl, hintEl, needsEl, friendshipEl, pauseButton, menu, characterButtons;
  var onMenuPick = null;
  var seedMenu, seedButtons = [], onSeedPick = null;
  var backpack, backpackList, backpackShown = null;
  var current = null;
  var bars = {};

  function init() {
    panel = document.getElementById("selection-panel");
    menuToggle = document.getElementById("menu-toggle");
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

    backpack = document.getElementById("backpack");
    backpackList = document.getElementById("backpack-list");
    document.getElementById("backpack-button").addEventListener("click", function () {
      setBackpackOpen(backpack.hidden);
    });
    document.getElementById("backpack-close").addEventListener("click", function () {
      setBackpackOpen(false);
    });

    document.getElementById("reset-button").addEventListener("click", function () {
      Save.reset();
    });

    menuToggle.addEventListener("click", function () {
      setPanelOpen(!panelOpen);
      Save.saveMenuOpen(panelOpen);
    });

    showSelected(null);
  }

  // When the game starts: the panel opens or stays closed as it was last time.
  function show() {
    setPanelOpen(Save.loadMenuOpen());
    panel.hidden = false;
    menuToggle.hidden = false;
  }

  // Open or close the panel; the round button shows ✕ when it is open and ☰ when it is closed.
  function setPanelOpen(open) {
    panelOpen = open;
    panel.classList.toggle("closed", !open);
    menuToggle.textContent = open ? "✕" : "☰";
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Cerrar el menú" : "Abrir el menú");
  }

  function showSelected(character) {
    current = character;
    needsEl.hidden = !character;
    friendshipEl.hidden = !character;
    Array.prototype.forEach.call(characterButtons, function (button) {
      button.classList.toggle("selected", !!character && button.getAttribute("data-id") === character.id);
    });
    // The hint only shows while nobody is selected.
    hintEl.hidden = !!character;
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

  // Refresh the clock, the magic coins, and the bars and friendship of the selected character.
  function update() {
    var clock = Time.text();
    if (clockEl.textContent !== clock) clockEl.textContent = clock;
    var coins = Coins.text();
    if (coinsEl.textContent !== coins) coinsEl.textContent = coins;
    if (!seedMenu.hidden) updateSeeds();
    if (!backpack.hidden) updateBackpack();
    if (!current) return;
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

  // ---------- Backpack ----------

  function setBackpackOpen(open) {
    backpack.hidden = !open;
    backpackShown = null;
    if (open) updateBackpack();
  }

  // Rebuild the list only when what is in the backpack changes (it can change while it is open, when fishing).
  function updateBackpack() {
    var things = Inventory.list();
    var shown = things.map(function (t) { return t.item.id + ":" + t.count; }).join(",");
    if (shown === backpackShown) return;
    backpackShown = shown;
    backpackList.textContent = "";
    if (things.length === 0) {
      var none = document.createElement("p");
      none.className = "backpack-empty";
      none.textContent = "Tu mochila está vacía";
      backpackList.appendChild(none);
      return;
    }
    things.forEach(function (t) {
      var row = document.createElement("div");
      row.className = "backpack-row";
      var name = document.createElement("span");
      name.className = "backpack-name";
      name.textContent = t.item.emoji + " " + t.item.name + " ×" + t.count;
      var price = document.createElement("span");
      price.className = "backpack-price";
      price.textContent = t.item.price + " 🪙";
      row.appendChild(name);
      row.appendChild(price);
      row.appendChild(sellButton("Vender 1", t.item.id, false));
      row.appendChild(sellButton("Vender todo", t.item.id, true));
      backpackList.appendChild(row);
    });
  }

  function sellButton(text, id, all) {
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", function () {
      var rect = button.getBoundingClientRect();
      var coins = Inventory.sell(id, all);
      if (coins > 0) coinPop(coins, rect.left + rect.width / 2, rect.top);
      updateBackpack();
    });
    return button;
  }

  // "+N 🪙" floating up from a spot on the screen, then gone.
  function coinPop(n, x, y) {
    var pop = document.createElement("div");
    pop.className = "coin-pop";
    pop.textContent = "+" + n + " 🪙";
    pop.style.left = x + "px";
    pop.style.top = y + "px";
    document.body.appendChild(pop);
    window.setTimeout(function () {
      if (pop.parentNode) pop.parentNode.removeChild(pop);
    }, 1200);
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
