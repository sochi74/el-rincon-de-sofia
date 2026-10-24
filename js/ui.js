// Small panel that shows the game clock with the weather of the day (its word next to the mouse), the magic coins, who is selected, their needs, friendship, a button to pick each character,
// and the Pausa and Reiniciar buttons. A round button in the corner opens and closes the panel (☰ / ✕),
// and another one next to it changes the sound (🔊 / 🎵 / 🔇). Some buttons show their word in English next to the mouse. Every button goes "pling", and selling goes "cling".
// Also the little social menu that opens next to a character (with "📖 Palabra del día" on top for Professor Hoot), the seed menu that opens next to an empty garden plot,
// the recipe menu that opens next to the Estufa or the Fogata, the little menu of the picnic blanket of the Pradera,
// the backpack window (it takes turns with the goals window of js/goals.js, the Diario of js/lessons.js and the Mapa del valle of js/valleymap.js) with everything in it and its sell, eat and gift buttons (with a little menu to pick who gets
// the gift when more than one can), and the word tag that shows
// the name of a thing in Spanish and English next to the mouse.
// On wide screens the open panel keeps a column on the left and the house and the city are drawn beside it (js/main.js);
// the goals window and the big signs go where the panel does not cover them, and the goals window also away from the Carpa,
// the Fogata and the selected one (the backpack opens at the bottom right, as always).
// On small screens (a phone: a touch screen whose shorter side is small) the panel is a drawer that slides up from the bottom,
// the house and the city are drawn in the room above it, the buttons are bigger (style.css), and with the phone standing up
// a little sign asks to turn it.
var UI = (function () {
  var coinsEl;
  var wordTag, wordEs, wordEn, wordSay, wordSub, wordTimer = null;
  var menuToggle, panelOpen = true;
  var soundToggle, buttonWordShown = false;
  var clockText, weatherEl;
  var panel, clockEl, nameEl, hintEl, needsEl, friendshipEl, pauseButton, menu, characterButtons;
  var onMenuPick = null, lessonButton;
  var seedMenu, seedButtons = [], onSeedPick = null;
  var cookMenu, cookButtons = [], campfireButton, onCookPick = null, onCookClose = null;
  var backpack, backpackList, backpackShown = null, eatButtons = [], giftButtons = [];
  var giftMenu, onGiftPick = null;
  var picnicMenu, onPicnicPick = null;
  var current = null;
  var bars = {};
  // True on a small screen; "started" once the game is on screen; "hintClosed" once the sign to turn the phone was closed.
  var small = false, started = false, hintClosed = false;
  var rotateHint, decorateBar = null, drawerShown = -1;
  // Turns a spot of the place on screen into a spot on the screen (js/main.js gives it).
  var toScreen = null;

  function init() {
    panel = document.getElementById("selection-panel");
    rotateHint = document.getElementById("rotate-hint");
    document.getElementById("rotate-close").addEventListener("click", function () {
      hintClosed = true;
      rotateHint.hidden = true;
    });
    menuToggle = document.getElementById("menu-toggle");
    clockEl = document.getElementById("clock");
    // The clock, and the weather emoji after it with its word, like "Lluvia · rain", and "Clima · weather" smaller below.
    clockText = document.createElement("span");
    weatherEl = document.createElement("span");
    weatherEl.className = "clock-weather";
    clockEl.appendChild(clockText);
    clockEl.appendChild(weatherEl);
    bindWord(weatherEl, Weather.wordId, "weather");
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
    // A second, smaller word below, for the weather emoji.
    wordSub = document.createElement("div");
    wordSub.className = "word-sub";
    wordSub.hidden = true;
    wordTag.appendChild(wordSub);

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

    // "📖 Palabra del día", on top of the social menu; it only shows for Professor Hoot (see openMenu).
    lessonButton = document.createElement("button");
    lessonButton.type = "button";
    lessonButton.setAttribute("data-type", "lesson");
    lessonButton.hidden = true;
    menu.insertBefore(lessonButton, menu.firstChild);
    bindWord(lessonButton, "word");

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

    // The menu of the picnic blanket (js/meadow.js); its buttons are made each time it opens.
    picnicMenu = document.createElement("div");
    picnicMenu.id = "picnic-menu";
    picnicMenu.hidden = true;
    document.body.appendChild(picnicMenu);

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
    bindWord(soundToggle, "sound");

    // "Pling" for every button (selling says "cling" instead).
    document.addEventListener("click", function (event) {
      var button = event.target.closest ? event.target.closest("button") : null;
      if (button && !button.hasAttribute("data-quiet")) Sound.play("pling");
    });

    showSelected(null);
  }

  // When the game starts: the panel opens or stays closed as it was last time
  // (the first time it starts open, or closed on a small screen).
  function show() {
    started = true;
    checkSmall();
    setPanelOpen(Save.loadMenuOpen(!small));
    panel.hidden = false;
    menuToggle.hidden = false;
    soundToggle.hidden = false;
  }

  // A small screen is a touch screen whose shorter side is at most CONFIG.mobile.maxSide: style.css then makes the panel
  // a drawer and the buttons bigger. Checked again when the window changes (like turning the phone).
  function checkSmall() {
    var touch = (navigator.maxTouchPoints || 0) > 0 || (!!window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    small = touch && Math.min(window.innerWidth, window.innerHeight) <= CONFIG.mobile.maxSide;
    document.documentElement.classList.toggle("small", small);
    rotateHint.hidden = !(started && small && !hintClosed && window.innerHeight > window.innerWidth);
  }

  function isSmall() {
    return small;
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
    var clock = Time.text() + " · ";
    if (clockText.textContent !== clock) clockText.textContent = clock;
    var weather = Weather.emoji();
    if (weatherEl.textContent !== weather) weatherEl.textContent = weather;
    var coins = Coins.text();
    if (coinsEl.textContent !== coins) coinsEl.textContent = coins;
    if (!seedMenu.hidden) updateSeeds();
    if (!cookMenu.hidden) updateCook();
    if (!backpack.hidden) updateBackpack();
    // How much of the screen the drawer covers, so the Modo decorar sign and the question of the word go above it.
    var drawer = small ? drawerHeight() : 0;
    if (drawer !== drawerShown) {
      drawerShown = drawer;
      document.documentElement.style.setProperty("--drawer", drawer + "px");
    }
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
  // "lesson" is for Professor Hoot ({ done }): "📖 Palabra del día" shows on top, faded with "Vuelve mañana 🌙" once done today.
  function openMenu(x, y, onPick, lesson) {
    onMenuPick = onPick;
    lessonButton.hidden = !lesson;
    lessonButton.disabled = !!lesson && lesson.done;
    lessonButton.textContent = lesson && lesson.done ? "📖 Palabra del día · Vuelve mañana 🌙" : "📖 Palabra del día";
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

  // Open the menu of the picnic blanket next to a spot on the screen: one button per option ({ id, text }).
  function openPicnicMenu(x, y, options, onPick) {
    closeMenu();
    onPicnicPick = onPick;
    picnicMenu.textContent = "";
    options.forEach(function (option) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "seed-name";
      button.textContent = option.text;
      button.addEventListener("click", function () {
        var pick = onPicnicPick;
        closeMenu();
        if (pick) pick(option.id);
      });
      picnicMenu.appendChild(button);
    });
    picnicMenu.hidden = false;
    Sound.play("pling");
    place(picnicMenu, x, y);
  }

  // Close the social menu, the seed menu, the recipe menu, the gift menu and the picnic menu.
  function closeMenu() {
    if (!menu.hidden && !lessonButton.hidden) forgetButtonWord();
    var closed = onCookClose;
    onMenuPick = null;
    onSeedPick = null;
    onCookPick = null;
    onCookClose = null;
    onGiftPick = null;
    onPicnicPick = null;
    menu.hidden = true;
    seedMenu.hidden = true;
    cookMenu.hidden = true;
    giftMenu.hidden = true;
    picnicMenu.hidden = true;
    if (closed) closed();
  }

  function isMenuOpen() {
    return !menu.hidden || !seedMenu.hidden || !cookMenu.hidden || !giftMenu.hidden || !picnicMenu.hidden;
  }

  // ---------- Backpack ----------

  // The goals window and the Diario close when the backpack opens (js/goals.js and js/lessons.js close the backpack
  // the other way round).
  function setBackpackOpen(open) {
    backpack.hidden = !open;
    backpackShown = null;
    if (open) {
      Goals.close();
      Lessons.closeDiary();
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

  // ---------- Room for the place, the windows and the signs ----------

  // How much of the left of the screen the open panel keeps for itself, on screens at least "panelColumn" wide
  // (there style.css makes it a narrow column). 0 when it is closed or the screen is narrower.
  function reservedLeft() {
    if (small || !panelOpen || panel.hidden || window.innerWidth < CONFIG.panelColumn) return 0;
    return panel.offsetLeft + panel.offsetWidth;
  }

  // How much of the bottom of the screen the drawer covers now (while it slides too), on small screens.
  function drawerHeight() {
    if (panel.hidden) return 0;
    return Math.max(0, Math.round(window.innerHeight - panel.getBoundingClientRect().top));
  }

  // How much of the bottom of the screen the drawer and the Modo decorar sign over it keep, on small screens; else 0.
  function reservedBottom() {
    if (!small) return 0;
    var keep = drawerHeight();
    decorateBar = decorateBar || document.getElementById("decorate-bar");
    if (decorateBar && !decorateBar.hidden) {
      keep = Math.max(keep, window.innerHeight - decorateBar.getBoundingClientRect().top + 8);
    }
    return keep;
  }

  function setToScreen(fn) {
    toScreen = fn;
  }

  function rectOf(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }

  // How much two boxes cover each other, in square pixels.
  function overlap(a, b) {
    var w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    var h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return w > 0 && h > 0 ? w * h : 0;
  }

  // A box of the place on screen, as a box on the screen.
  function screenBox(b) {
    var a = toScreen(b.x, b.y), z = toScreen(b.x + b.w, b.y + b.h);
    return { x: a.x, y: a.y, w: z.x - a.x, h: z.y - a.y };
  }

  // What a window should not cover: the Carpa and the Fogata (in the city) and the selected one, where they are now.
  function keepSeen() {
    if (!toScreen) return [];
    var boxes = [];
    var view = Sims.viewPlace();
    if (view === "city") {
      CONFIG.cityObjects.forEach(function (o) { boxes.push(screenBox(o)); });
    }
    var sim = Sims.selectedSim();
    if (sim && sim.place === view) {
      var pose = Sims.poseFor(sim.data.id);
      var at = pose && pose.x !== undefined ? pose : sim;
      var k = CONFIG.characterScale;
      boxes.push(screenBox({ x: at.x - 34 * k, y: at.y - 110 * k, w: 68 * k, h: 140 * k }));
    }
    return boxes;
  }

  // True if a window covers the Carpa, the Fogata or the selected one where they are now.
  function coversSeen(el) {
    var box = rectOf(el);
    return keepSeen().some(function (b) { return overlap(box, b) > 0; });
  }

  // Open the goals window in a corner where it covers the least of the Carpa, the Fogata and
  // the selected one, and never the panel or the round buttons when it can help it: first the bottom right,
  // then the bottom left, the top right and the top left. It stays put while it is open.
  function placeWindow(el) {
    var W = window.innerWidth, H = window.innerHeight, m = 16;
    el.style.left = el.style.top = "";
    el.style.right = m + "px";
    el.style.bottom = m + "px";
    var w = el.offsetWidth, h = el.offsetHeight;
    var left = reservedLeft() + m;
    var buttons = [menuToggle, soundToggle].map(rectOf);
    var under = buttons.concat(panelOpen ? [rectOf(panel)] : []);
    // At the top, below the round buttons when it would cover them.
    function topAt(x) {
      var y = m;
      buttons.forEach(function (r) {
        if (overlap({ x: x, y: y, w: w, h: h }, r)) y = r.y + r.h + m;
      });
      return y;
    }
    var corners = [
      { right: true, bottom: true, x: W - w - m, y: H - h - m },
      { right: false, bottom: true, x: left, y: H - h - m },
      { right: true, bottom: false, x: W - w - m, y: topAt(W - w - m) },
      { right: false, bottom: false, x: left, y: topAt(left) }
    ];
    var seen = keepSeen();
    var best = null;
    corners.forEach(function (c) {
      var box = { x: c.x, y: c.y, w: w, h: h };
      var score = 0;
      seen.forEach(function (b) { score += overlap(box, b) * 10; });
      under.forEach(function (b) { score += overlap(box, b) * 4; });
      if (!best || score < best.score) best = { c: c, score: score };
    });
    var c = best.c;
    el.style.right = c.right ? m + "px" : "";
    el.style.left = c.right ? "" : c.x + "px";
    el.style.bottom = c.bottom ? m + "px" : "";
    el.style.top = c.bottom ? "" : c.y + "px";
  }

  // The "¡Meta cumplida!" sign: at the top in the middle of the room the panel leaves; on narrower screens with the panel
  // open (it covers the top), at the bottom in the middle.
  // On small screens it stays at the top, away from the drawer (style.css puts it below the round buttons).
  function placeSign(el) {
    var left = reservedLeft(), W = window.innerWidth;
    if (small) {
      el.style.left = el.style.maxWidth = el.style.top = el.style.bottom = "";
    } else if (left > 0) {
      el.style.left = (left + (W - left) / 2) + "px";
      el.style.maxWidth = (W - left - 32) + "px";
      el.style.top = el.style.bottom = "";
    } else if (panelOpen) {
      el.style.left = el.style.maxWidth = "";
      el.style.top = "auto";
      el.style.bottom = "18px";
    } else {
      el.style.left = el.style.maxWidth = el.style.top = el.style.bottom = "";
    }
  }

  // Move a sign drawn on the place ("x", "y" its middle on the screen, "w" by "h" pixels) so it is inside the window
  // and not under the panel or the round buttons: beside them when it fits there, else below them.
  function clearSpot(x, y, w, h) {
    var W = window.innerWidth, H = window.innerHeight, m = 8;
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    x = clamp(x, m + w / 2, W - m - w / 2);
    y = clamp(y, m + h / 2, H - m - h / 2);
    [panelOpen ? panel : null, menuToggle, soundToggle].forEach(function (el) {
      if (!el || el.hidden) return;
      var r = rectOf(el);
      if (!overlap({ x: x - w / 2, y: y - h / 2, w: w, h: h }, r)) return;
      if (r.x + r.w + m + w / 2 <= W - m) {
        x = r.x + r.w + m + w / 2;
      } else {
        y = Math.min(r.y + r.h + m + h / 2, H - m - h / 2);
      }
    });
    return { x: x, y: y };
  }

  // True if a spot on the screen is over the panel, the ☰ button, the backpack, the goals window, the Diario, the map,
  // the question of the word of the day or an open menu, so the word tag never shows what is under them.
  function coversSpot(x, y) {
    if (Goals.covers(x, y) || Lessons.covers(x, y) || ValleyMap.covers(x, y)) return true;
    return [panelOpen ? panel : null, menuToggle, soundToggle, backpack, menu, seedMenu, cookMenu, giftMenu, picnicMenu].some(function (el) {
      if (!el || el.hidden) return false;
      var r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
  }

  // Show the word for a thing near a spot on the screen, kept inside the window.
  // "id" is a word of js/words.js, or a word itself as { es, en, say } (like Krohna's).
  // With the mouse it goes below and to the right so it never covers the cursor;
  // with a finger it goes above ("seconds" is given), and hides by itself after "seconds" (0: while the finger is held).
  // The first time a word shows up, it goes to the Diario (js/lessons.js). "subId" is a second word, smaller below
  // (it goes to the Diario too).
  function showWord(id, x, y, seconds, subId) {
    var word = typeof id === "string" ? WORDS[id] : id;
    if (!word) {
      hideWord();
      return;
    }
    Lessons.discover(word, x, y);
    if (wordEs.textContent !== word.es) {
      wordEs.textContent = word.es;
      wordEn.textContent = word.en;
      wordSay.textContent = "(" + word.say + ")";
    }
    var sub = subId ? WORDS[subId] : null;
    if (sub) {
      Lessons.discover(sub, x, y);
      var subText = sub.es + " · " + sub.en + " (" + sub.say + ")";
      if (wordSub.textContent !== subText) wordSub.textContent = subText;
    }
    if (wordSub.hidden === !!sub) wordSub.hidden = !sub;
    wordTag.hidden = false;
    var w = wordTag.offsetWidth, h = wordTag.offsetHeight;
    var left, top;
    if (seconds !== undefined) {
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
    wordTimer = seconds > 0 ? window.setTimeout(hideWord, seconds * 1000) : null;
  }

  function hideWord() {
    window.clearTimeout(wordTimer);
    wordTimer = null;
    wordTag.hidden = true;
  }

  function isWordTimed() {
    return wordTimer !== null;
  }

  // A button that shows its word next to the mouse while it is over it, like "Sonido · sound" on the 🔊 button.
  // "id" can also be a function that says which word, for words that change (like the weather's); "subId" is a second
  // word, smaller below (like "Clima · weather").
  function bindWord(button, id, subId) {
    button.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") return;
      buttonWordShown = true;
      showWord(typeof id === "function" ? id() : id, event.clientX, event.clientY, undefined, subId);
    });
    button.addEventListener("pointerleave", forgetButtonWord);
  }

  // Hide a button's word (also when its button hides under the mouse, so no leave comes).
  function forgetButtonWord() {
    if (!buttonWordShown) return;
    buttonWordShown = false;
    hideWord();
  }

  function isButtonWordShown() {
    return buttonWordShown;
  }

  return {
    init: init,
    showWord: showWord,
    hideWord: hideWord,
    isWordTimed: isWordTimed,
    isButtonWordShown: isButtonWordShown,
    bindWord: bindWord,
    forgetButtonWord: forgetButtonWord,
    coversSpot: coversSpot,
    show: show,
    showSelected: showSelected,
    update: update,
    openMenu: openMenu,
    openSeedMenu: openSeedMenu,
    openCookMenu: openCookMenu,
    openPicnicMenu: openPicnicMenu,
    closeMenu: closeMenu,
    isMenuOpen: isMenuOpen,
    reservedLeft: reservedLeft,
    reservedBottom: reservedBottom,
    checkSmall: checkSmall,
    isSmall: isSmall,
    setToScreen: setToScreen,
    placeWindow: placeWindow,
    coversSeen: coversSeen,
    placeSign: placeSign,
    clearSpot: clearSpot,
    closeBackpack: function () { setBackpackOpen(false); }
  };
})();
