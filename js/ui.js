// Small panel that shows who is selected, their needs, friendship and the Pausa and Reiniciar buttons.
// Also the little social menu that opens next to a character.
var UI = (function () {
  var panel, nameEl, hintEl, needsEl, friendshipEl, pauseButton, menu;
  var onMenuPick = null;
  var current = null;
  var bars = {};

  function init() {
    panel = document.getElementById("selection-panel");
    nameEl = document.getElementById("selection-name");
    hintEl = document.getElementById("selection-hint");
    needsEl = document.getElementById("needs");
    friendshipEl = document.getElementById("friendship");
    pauseButton = document.getElementById("pause-button");
    menu = document.getElementById("social-menu");

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
    if (!character) {
      nameEl.textContent = "Nadie seleccionado";
      hintEl.textContent = "Toca a Sofía o a real.fixer";
      return;
    }
    nameEl.textContent = CONFIG.characterLooks[character.id].icon + " " + character.name;
    var other = otherOf(character);
    hintEl.textContent = "Toca el piso para caminar, un mueble para usarlo o a " + other.name +
      " para socializar (dos veces para elegirlo)";
    update();
  }

  function otherOf(character) {
    return CHARACTERS.filter(function (c) { return c.id !== character.id; })[0];
  }

  // Refresh the bars and friendship of the selected character.
  function update() {
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
    var w = menu.offsetWidth, h = menu.offsetHeight;
    menu.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x + 14)) + "px";
    menu.style.top = Math.max(8, Math.min(window.innerHeight - h - 8, y - h / 2)) + "px";
  }

  function closeMenu() {
    onMenuPick = null;
    menu.hidden = true;
  }

  function isMenuOpen() {
    return !menu.hidden;
  }

  return {
    init: init,
    show: show,
    showSelected: showSelected,
    update: update,
    openMenu: openMenu,
    closeMenu: closeMenu,
    isMenuOpen: isMenuOpen
  };
})();
