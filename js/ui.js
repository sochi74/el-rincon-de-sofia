// Small panel that shows the game clock, the magic coins, who is selected, their needs, friendship, a button to pick each character,
// and the Pausa and Reiniciar buttons. A round button in the corner opens and closes the panel (☰ / ✕),
// and another one next to it changes the sound (🔊 / 🎵 / 🔇). Every button goes "pling", and selling goes "cling".
// Also the little social menu that opens next to a character, the seed menu that opens next to an empty garden plot,
// the recipe menu that opens next to the Estufa or the Fogata,
// the backpack window (it takes turns with the goals window of js/goals.js) with everything in it and its sell, eat and gift buttons (with a little menu to pick who gets
// the gift when more than one can), and the word tag that shows
// the name of a thing in Spanish and English next to the mouse.
var UI = (function () {
  var coinsEl;
  var wordTag, wordEs, wordEn, wordSay, wordTimer = null;
  var menuToggle, panelOpen = true;
  var soundToggle, soundWordShown = false;
  var panel, clockEl, nameEl, hintEl, needsEl, friendshipEl, pauseButton, menu, characterButtons;
  var onMenuPick = null;
  var seedMenu, seedButtons = [], onSeedPick = null;
  var cookMenu, cookButtons = [], campfireButton, onCookPick = null, onCookClose = null;
  var backpack, backpackList, backpackShown = null, eatButtons = [], giftButtons = [];
  var giftMenu, onGiftPick = null;
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

    // One button per recipe: emoji and name, its ingredients with how many there are, and what eating it gives.
    // At the Fogata there is also a button to sit by the fire.
    cookMenu = document.getElementById("cook-menu");
    Cooking.RECIPES.forEach(function (r) {
      var dish = Inventory.item(r.id);
      var button = document.createElement("button");
      button.type = "button";
      var name = document.createElement("span");
      name.className = "seed-name";
      name.textContent = dish.emoji + " " + dish.name;
      var needs = document.createElement("span");
      needs.className = "seed-price";
      var effect = document.createElement("span");
      effect.className = "seed-price";
      effect.textContent = Object.keys(r.effect).map(function (id) {
        var need = CONFIG.needs.filter(function (n) { return n.id === id; })[0];
        return need.name + " +" + r.effect[id];
      }).join(" · ") + " · Vale " + dish.price + " 🪙";
      button.appendChild(name);
      button.appendChild(needs);
      button.appendChild(effect);
      button.addEventListener("click", function () {
        var pick = onCookPick;
        onCookClose = null;
        closeMenu();
        if (pick) pick(r.id);
      });
      cookMenu.appendChild(button);
      cookButtons.push({ button: button, recipe: r, needs: needs });
    });
    campfireButton = document.createElement("button");
    campfireButton.type = "button";
    campfireButton.className = "seed-name";
    campfireButton.textContent = "Junto a la fogata 🔥";
    campfireButton.addEventListener("click", function () {
      var pick = onCookPick;
      onCookClose = null;
      closeMenu();
      if (pick) pick("campfire");
    });
    cookMenu.appendChild(campfireButton);

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

    // The little menu to pick who gets a gift; its buttons are made each time it opens.
    giftMenu = document.createElement("div");
    giftMenu.id = "gift-menu";
    giftMenu.hidden = true;
    document.body.appendChild(giftMenu);

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

    // The sound button: next mode on each tap, and "Sonido · sound" next to the mouse while it is over it.
    soundToggle = document.getElementById("sound-toggle");
    showSoundMode();
    soundToggle.addEventListener("click", function () {
      Sound.nextMode();
      showSoundMode();
    });
    soundToggle.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") return;
      soundWordShown = true;
      showWord("sound", event.clientX, event.clientY);
    });
    soundToggle.addEventListener("pointerleave", function () {
      soundWordShown = false;
      hideWord();
    });

    // "Pling" for every button (selling says "cling" instead).
    document.addEventListener("click", function (event) {
      var button = event.target.closest ? event.target.closest("button") : null;
      if (button && !button.hasAttribute("data-quiet")) Sound.play("pling");
    });

    showSelected(null);
  }

  // When the game starts: the panel opens or stays closed as it was last time.
  function show() {
    setPanelOpen(Save.loadMenuOpen());
    panel.hidden = false;
    menuToggle.hidden = false;
    soundToggle.hidden = false;
  }

  function showSoundMode() {
    soundToggle.textContent = Sound.icon();
    soundToggle.setAttribute("aria-label", "Sonido: " + Sound.name());
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

  // Refresh the clock, the magic coins, and the bars and friendship of the selected character.
  function update() {
    var clock = Time.text();
    if (clockEl.textContent !== clock) clockEl.textContent = clock;
    var coins = Coins.text();
    if (coinsEl.textContent !== coins) coinsEl.textContent = coins;
    if (!seedMenu.hidden) updateSeeds();
    if (!cookMenu.hidden) updateCook();
    if (!backpack.hidden) updateBackpack();
    if (!current) return;
    var values = Needs.get(current.id);
    CONFIG.needs.forEach(function (need) {
      var value = values[need.id];
      bars[need.id].style.width = value + "%";
      bars[need.id].style.background = Needs.colorFor(value);
    });
    // One line for each one: the other one first, then the neighbors.
    var text = CHARACTERS.filter(function (c) { return c.id !== current.id; }).map(function (other) {
      var value = Social.friendshipWith(current.id, other.id);
      var level = Social.levelOf(value);
      return "Amistad con " + other.name + ": " + Math.round(value) + " · " + level.emoji + " " + level.name;
    }).join("\n");
    if (friendshipEl.textContent !== text) friendshipEl.textContent = text;
  }

  // Open the social menu next to a spot on the screen, kept inside the window.
  function openMenu(x, y, onPick) {
    onMenuPick = onPick;
    menu.hidden = false;
    Sound.play("pling");
    place(menu, x, y);
  }

  // Open the seed menu next to a spot on the screen. Seeds that cost more coins than there are look faded.
  function openSeedMenu(x, y, onPick) {
    onSeedPick = onPick;
    updateSeeds();
    seedMenu.hidden = false;
    Sound.play("pling");
    place(seedMenu, x, y);
  }

  function updateSeeds() {
    var coins = Coins.amount();
    seedButtons.forEach(function (s) {
      var off = coins < s.price;
      if (s.button.disabled !== off) s.button.disabled = off;
    });
  }

  // Open the recipe menu next to a spot on the screen. Recipes without enough ingredients look faded.
  // "atCampfire" adds "Junto a la fogata 🔥". "onClose" runs if it closes without a pick.
  function openCookMenu(x, y, atCampfire, onClose, onPick) {
    onCookPick = onPick;
    onCookClose = onClose;
    campfireButton.hidden = !atCampfire;
    updateCook();
    cookMenu.hidden = false;
    Sound.play("pling");
    place(cookMenu, x, y);
  }

  // Each ingredient with how many there are, like "🍒 Bayas 2 (tienes 3)".
  function updateCook() {
    cookButtons.forEach(function (c) {
      var text = Object.keys(c.recipe.ingredients).map(function (id) {
        var it = Inventory.item(id);
        return it.emoji + " " + it.name + " " + c.recipe.ingredients[id] + " (tienes " + Inventory.count(id) + ")";
      }).join(" + ");
      if (c.needs.textContent !== text) c.needs.textContent = text;
      var off = !Cooking.canMake(c.recipe);
      if (c.button.disabled !== off) c.button.disabled = off;
    });
  }

  // Keep a menu next to a spot on the screen, inside the window.
  function place(el, x, y) {
    var w = el.offsetWidth, h = el.offsetHeight;
    el.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x + 14)) + "px";
    el.style.top = Math.max(8, Math.min(window.innerHeight - h - 8, y - h / 2)) + "px";
  }

  // Open the menu to pick who gets the gift, next to a spot on the screen: one button per name.
  // (The "Regalar" button that opens it already went "pling".)
  function openGiftMenu(x, y, names, onPick) {
    closeMenu();
    onGiftPick = onPick;
    giftMenu.textContent = "";
    names.forEach(function (who) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = who.name;
      button.addEventListener("click", function () {
        var pick = onGiftPick;
        closeMenu();
        if (pick) pick(who.id);
      });
      giftMenu.appendChild(button);
    });
    giftMenu.hidden = false;
    // To the left of the button, so it does not cover the backpack's list.
    place(giftMenu, x - giftMenu.offsetWidth - 28, y);
  }

  // Close the social menu, the seed menu, the recipe menu and the gift menu.
  function closeMenu() {
    var closed = onCookClose;
    onMenuPick = null;
    onSeedPick = null;
    onCookPick = null;
    onCookClose = null;
    onGiftPick = null;
    menu.hidden = true;
    seedMenu.hidden = true;
    cookMenu.hidden = true;
    giftMenu.hidden = true;
    if (closed) closed();
  }

  function isMenuOpen() {
    return !menu.hidden || !seedMenu.hidden || !cookMenu.hidden || !giftMenu.hidden;
  }

  // ---------- Backpack ----------

  // The goals window closes when the backpack opens (js/goals.js closes the backpack the other way round).
  function setBackpackOpen(open) {
    backpack.hidden = !open;
    backpackShown = null;
    if (open) {
      Goals.close();
      updateBackpack();
    }
  }

  // Rebuild the list only when what is in the backpack changes (it can change while it is open, when fishing).
  // The "Comer" buttons are faded while nobody is selected or the selected one is busy.
  // The "Regalar" buttons too, and also while nobody else is in the same place.
  function updateBackpack() {
    var sim = Sims.selectedSim();
    var canEat = !!sim && Sims.isIdle(sim);
    var canGive = Gifts.canGive(sim);
    eatButtons.forEach(function (button) {
      if (button.disabled === canEat) button.disabled = !canEat;
    });
    giftButtons.forEach(function (button) {
      if (button.disabled === canGive) button.disabled = !canGive;
    });
    var things = Inventory.list();
    var shown = things.map(function (t) { return t.item.id + ":" + t.count; }).join(",");
    if (shown === backpackShown) return;
    backpackShown = shown;
    backpackList.textContent = "";
    eatButtons = [];
    giftButtons = [];
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
      if (Cooking.isDish(t.item.id)) row.appendChild(eatButton(t.item.id, canEat));
      row.appendChild(giftButton(t.item.id, canGive));
      row.appendChild(sellButton("Vender 1", t.item.id, false));
      row.appendChild(sellButton("Vender todo", t.item.id, true));
      backpackList.appendChild(row);
    });
  }

  // The selected one eats the dish right where it stands.
  function eatButton(id, canEat) {
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = "Comer";
    button.className = "eat-button";
    button.disabled = !canEat;
    button.addEventListener("click", function () {
      var sim = Sims.selectedSim();
      if (sim) Cooking.eat(sim, id);
      updateBackpack();
    });
    eatButtons.push(button);
    return button;
  }

  // The selected one walks to someone in the same place and gives them one of this thing.
  // With more than one who can get it, a little menu asks who.
  function giftButton(id, canGive) {
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = "Regalar";
    button.className = "gift-button";
    button.disabled = !canGive;
    button.addEventListener("click", function () {
      var sim = Sims.selectedSim();
      var can = Gifts.recipients(sim);
      if (can.length > 1) {
        var rect = button.getBoundingClientRect();
        openGiftMenu(rect.left, rect.top + rect.height / 2, can.map(function (s) { return s.data; }), function (toId) {
          Gifts.give(sim, id, toId);
          updateBackpack();
        });
        return;
      }
      Gifts.give(sim, id);
      updateBackpack();
    });
    giftButtons.push(button);
    return button;
  }

  function sellButton(text, id, all) {
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.setAttribute("data-quiet", "");
    button.addEventListener("click", function () {
      var rect = button.getBoundingClientRect();
      var coins = Inventory.sell(id, all);
      if (coins > 0) {
        coinPop(coins, rect.left + rect.width / 2, rect.top);
        Sound.play("cling");
      }
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

  // True if a spot on the screen is over the panel, the ☰ button, the backpack, the goals window or an open menu,
  // so the word tag never shows what is under them.
  function coversSpot(x, y) {
    if (Goals.covers(x, y)) return true;
    return [panelOpen ? panel : null, menuToggle, soundToggle, backpack, menu, seedMenu, cookMenu, giftMenu].some(function (el) {
      if (!el || el.hidden) return false;
      var r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
  }

  // Show the word for a thing near a spot on the screen, kept inside the window.
  // "id" is a word of js/words.js, or a word itself as { es, en, say } (like Krohna's).
  // With the mouse it goes below and to the right so it never covers the cursor;
  // with a finger it goes above, and hides by itself after "seconds".
  function showWord(id, x, y, seconds) {
    var word = typeof id === "string" ? WORDS[id] : id;
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

  function isSoundWordShown() {
    return soundWordShown;
  }

  return {
    init: init,
    showWord: showWord,
    hideWord: hideWord,
    isWordTimed: isWordTimed,
    isSoundWordShown: isSoundWordShown,
    coversSpot: coversSpot,
    show: show,
    showSelected: showSelected,
    update: update,
    openMenu: openMenu,
    openSeedMenu: openSeedMenu,
    openCookMenu: openCookMenu,
    closeMenu: closeMenu,
    isMenuOpen: isMenuOpen,
    closeBackpack: function () { setBackpackOpen(false); }
  };
})();
