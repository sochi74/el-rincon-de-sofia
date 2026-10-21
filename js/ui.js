// Small panel that shows who is selected, their needs and the pause button.
var UI = (function () {
  var panel, nameEl, hintEl, needsEl, pauseButton;
  var current = null;
  var bars = {};

  function init() {
    panel = document.getElementById("selection-panel");
    nameEl = document.getElementById("selection-name");
    hintEl = document.getElementById("selection-hint");
    needsEl = document.getElementById("needs");
    pauseButton = document.getElementById("pause-button");

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

    showSelected(null);
  }

  function show() {
    panel.hidden = false;
  }

  function showSelected(character) {
    current = character;
    needsEl.hidden = !character;
    if (!character) {
      nameEl.textContent = "Nadie seleccionado";
      hintEl.textContent = "Toca a Sofía o a real.fixer";
      return;
    }
    nameEl.textContent = CONFIG.characterLooks[character.id].icon + " " + character.name;
    hintEl.textContent = "Toca el piso para caminar";
    update();
  }

  // Refresh the bars of the selected character.
  function update() {
    if (!current) return;
    var values = Needs.get(current.id);
    CONFIG.needs.forEach(function (need) {
      var value = values[need.id];
      bars[need.id].style.width = value + "%";
      bars[need.id].style.background = Needs.colorFor(value);
    });
  }

  return { init: init, show: show, showSelected: showSelected, update: update };
})();
