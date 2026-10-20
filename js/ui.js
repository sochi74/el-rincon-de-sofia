// Small panel that shows who is selected.
var UI = (function () {
  var panel, nameEl, hintEl;

  function init() {
    panel = document.getElementById("selection-panel");
    nameEl = document.getElementById("selection-name");
    hintEl = document.getElementById("selection-hint");
    showSelected(null);
  }

  function show() {
    panel.hidden = false;
  }

  function showSelected(character) {
    if (!character) {
      nameEl.textContent = "Nadie seleccionado";
      hintEl.textContent = "Toca a Sofía o a real.fixer";
      return;
    }
    nameEl.textContent = CONFIG.characterLooks[character.id].icon + " " + character.name;
    hintEl.textContent = "Toca el piso para caminar";
  }

  return { init: init, show: show, showSelected: showSelected };
})();
