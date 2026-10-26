// Modo decorar: Sofía arranges her house her way (the Baño too), and in the city Krohna's bed, the guitar and the pot
// of the goals, and also the homes (her house, her garden, real.fixer's tent with its campfire, and the neighbors' homes),
// the fountain and each tree. Homes, trees and the fountain are never turned: "🔄 Girar" says "No se puede girar".
// The "🛠️ Decorar" button in the panel turns it on: everything freezes like with Pausa, and a sign at the top says what to do,
// with buttons to turn the thing picked ("🔄 Girar"), to put everything back as it was at first ("↩️ Como al principio",
// after asking) and to finish ("✅ Listo"). Taps only pick and drag: what can be moved glows under the mouse, the last one
// touched keeps a soft border, and while dragging it glows green where it fits and red where it does not
// (dropped in red, it goes back). It works in the place on screen: the house (js/house.js says what fits there)
// or the city (js/city.js). In the Pradera de flores (js/meadow.js), the Lago (js/lake.js) and the Bosque encantado
// (js/enchanted.js) nothing moves. With "Listo" everything goes on: whoever was left on something steps to the closest free spot.
var Decorate = (function () {
  var GREEN = "#5FB35A", RED = "#E0533D";
  // How long "No cabe aquí" (or "No se puede girar") stays over the thing, in seconds.
  var NO_ROOM_TIME = 1.6;

  var on = false;
  // True if the game was already paused with Pausa, so it stays paused after "Listo".
  var wasPaused = false;
  // The thing under the mouse and the last one touched, as { id, place }.
  var hover = null, picked = null;
  // The thing being dragged: { id, place, from (where it was), dx, dy (from the finger to its middle), ok, dirty }.
  var drag = null;
  // Seconds left of "No cabe aquí", and what it says.
  var noRoom = 0, noRoomText = "";
  // The places where something moved, so "Listo" lets everyone there step off it.
  var changed = {};
  var button, bar, turnButton, ask, pauseButton;

  // The place on screen and what knows its things.
  function where() {
    return Sims.viewPlace();
  }

  function things(place) {
    if (place === "meadow") return Meadow;
    if (place === "lake") return Lake;
    if (place === "enchanted") return Enchanted;
    return place === "city" ? City : House;
  }

  function makeButton(text, word, onClick) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    b.addEventListener("click", onClick);
    if (word) UI.bindWord(b, word);
    return b;
  }

  function init() {
    pauseButton = document.getElementById("pause-button");
    button = makeButton("🛠️ Decorar", "decorate", function () {
      if (on) finish(); else start();
    });
    button.id = "decorate-button";
    pauseButton.parentNode.insertBefore(button, pauseButton);

    // The sign at the top, with its buttons.
    bar = document.createElement("div");
    bar.id = "decorate-bar";
    bar.hidden = true;
    var text = document.createElement("b");
    text.textContent = "🛠️ Modo decorar: arrastra para mover";
    turnButton = makeButton("🔄 Girar", "turn", turnPicked);
    var buttons = document.createElement("div");
    buttons.className = "decorate-buttons";
    buttons.appendChild(turnButton);
    buttons.appendChild(makeButton("↩️ Como al principio", null, function () { ask.hidden = false; }));
    buttons.appendChild(makeButton("✅ Listo", "done", finish));
    bar.appendChild(text);
    bar.appendChild(buttons);
    document.body.appendChild(bar);

    // The question before putting everything back.
    ask = document.createElement("div");
    ask.id = "decorate-ask";
    ask.hidden = true;
    var question = document.createElement("p");
    question.textContent = "¿Volver todo a como estaba al principio?";
    var answers = document.createElement("div");
    answers.className = "decorate-buttons";
    answers.appendChild(makeButton("Sí", null, function () {
      ask.hidden = true;
      resetAll();
    }));
    answers.appendChild(makeButton("No", null, function () { ask.hidden = true; }));
    ask.appendChild(question);
    ask.appendChild(answers);
    document.body.appendChild(ask);
  }

  function start() {
    if (on) return;
    on = true;
    Sims.closeMenu();
    wasPaused = Needs.isPaused();
    if (!wasPaused) Needs.togglePause();
    pauseButton.disabled = true;
    button.classList.add("on");
    bar.hidden = false;
    document.body.classList.add("decorating");
    hover = picked = drag = null;
    changed = {};
    City.beginMoves();
    UI.forgetButtonWord();
  }

  // "Listo": everything goes on from where it is, and Pausa is as it was before.
  function finish() {
    if (!on) return;
    cancelDrag();
    on = false;
    ask.hidden = true;
    bar.hidden = true;
    button.classList.remove("on");
    document.body.classList.remove("decorating");
    pauseButton.disabled = false;
    if (!wasPaused && Needs.isPaused()) Needs.togglePause();
    hover = picked = null;
    noRoom = 0;
    UI.forgetButtonWord();
    Path.reset();
    Object.keys(changed).forEach(function (place) { Sims.settle(place); });
    Objects.refresh();
    Cooking.refresh();
    // In the city the neighbors, the garden, the shiny coins and the forest things find their places too.
    if (changed.city) {
      Neighbors.settle();
      Garden.refresh();
      Coins.settle();
      Gather.settle();
    }
    // Krohna stays where it is, unless it was left on something: then it steps to the closest free spot.
    Object.keys(changed).forEach(function (place) { Pet.settle(place); });
    changed = {};
  }

  // A drag that has not ended goes back to where it started (also when the page closes in the middle of one).
  function cancelDrag() {
    if (!drag) return;
    things(drag.place).setPos(drag.id, drag.from);
    drag = null;
    Path.reset();
  }

  // ---------- Picking and dragging ----------

  function down(x, y) {
    if (!on) return;
    ask.hidden = true;
    var place = where(), M = things(place);
    var id = M.movableAt(x, y);
    if (!id) return;
    picked = { id: id, place: place };
    var b = M.boxOf(id);
    drag = { id: id, place: place, from: M.getPos(id), dx: x - (b.x + b.w / 2), dy: y - (b.y + b.h / 2), ok: true, dirty: false };
  }

  function move(x, y) {
    if (!on) return;
    if (!drag) {
      var id = things(where()).movableAt(x, y);
      hover = id ? { id: id, place: where() } : null;
      return;
    }
    things(drag.place).dragTo(drag.id, x - drag.dx, y - drag.dy);
    drag.dirty = true;
  }

  // Green or red: checked at most once a frame, because it looks at every room and piece of furniture.
  function check() {
    if (!drag || !drag.dirty) return;
    drag.dirty = false;
    drag.ok = things(drag.place).fits(drag.id);
  }

  // Dropped: it stays if it fits, else it goes back.
  function up() {
    if (!drag) return;
    check();
    var M = things(drag.place), now = M.getPos(drag.id);
    if (!drag.ok) {
      M.setPos(drag.id, drag.from);
    } else if (JSON.stringify(now) !== JSON.stringify(drag.from)) {
      changed[drag.place] = true;
    }
    drag = null;
    Path.reset();
  }

  function leave() {
    hover = null;
  }

  // "🔄 Girar": a quarter turn for the last thing touched; if it does not fit turned, it stays and says "No cabe aquí".
  function turnPicked() {
    if (!picked || picked.place !== where() || drag) return;
    var M = things(picked.place);
    if (!M.canTurn(picked.id)) return;
    if (M.noTurn && M.noTurn(picked.id)) {
      noRoomText = "No se puede girar";
      noRoom = NO_ROOM_TIME;
      return;
    }
    var from = M.getPos(picked.id);
    M.turn(picked.id);
    if (M.fits(picked.id)) {
      changed[picked.place] = true;
    } else {
      M.setPos(picked.id, from);
      noRoomText = "No cabe aquí";
      noRoom = NO_ROOM_TIME;
    }
    Path.reset();
  }

  // "Sí" to "¿Volver todo a como estaba al principio?": the house and the city, every thing in its first spot and turn.
  function resetAll() {
    cancelDrag();
    House.resetLayout();
    City.resetLayout();
    changed.house = changed.city = true;
    picked = null;
    Path.reset();
  }

  // ---------- Every frame ----------

  function update(dt) {
    // The vase or the bunting may have just arrived: whoever stands where it went steps aside.
    if (House.settle()) Sims.settle("house");
    if (!on) return;
    check();
    if (noRoom > 0) noRoom -= dt;
    var canTurn = !!picked && picked.place === where() && things(picked.place).canTurn(picked.id);
    if (turnButton.disabled === canTurn) turnButton.disabled = !canTurn;
  }

  // The glows, drawn over everything: under the mouse, around the last one touched (a soft dashed border),
  // and green or red while dragging. Then "No cabe aquí" over the one that did not fit.
  function draw(ctx, time) {
    if (!on) return;
    var place = where(), M = things(place);
    if (drag && drag.place === place) {
      House.drawGlow(ctx, M.boxOf(drag.id), drag.ok ? GREEN : RED, drag.ok ? "rgba(95, 179, 90, 0.25)" : "rgba(224, 83, 61, 0.25)");
      return;
    }
    if (hover && hover.place === place && !(picked && picked.id === hover.id && picked.place === place)) {
      House.drawGlow(ctx, M.boxOf(hover.id), CONFIG.colors.sage);
    }
    if (!picked || picked.place !== place) return;
    var b = M.boxOf(picked.id);
    ctx.save();
    ctx.strokeStyle = CONFIG.colors.cream;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 7]);
    ctx.lineDashOffset = -time * 20;
    ctx.shadowColor = "rgba(74, 52, 40, 0.5)";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.rect(b.x - 8, b.y - 8, b.w + 16, b.h + 16);
    ctx.stroke();
    ctx.restore();
    if (noRoom > 0) drawNoRoom(ctx, b);
  }

  function drawNoRoom(ctx, b) {
    var text = noRoomText;
    var cx = b.x + b.w / 2, cy = Math.max(30, b.y - 28);
    ctx.save();
    ctx.globalAlpha = Math.min(1, noRoom / 0.3);
    ctx.font = "700 18px " + CONFIG.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var w = ctx.measureText(text).width + 28, h = 34;
    ctx.fillStyle = CONFIG.colors.cream;
    ctx.strokeStyle = CONFIG.colors.darkBrown;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2 + 14, cy - h / 2);
    ctx.arcTo(cx + w / 2, cy - h / 2, cx + w / 2, cy + h / 2, 14);
    ctx.arcTo(cx + w / 2, cy + h / 2, cx - w / 2, cy + h / 2, 14);
    ctx.lineTo(cx + 8, cy + h / 2);
    ctx.lineTo(cx, cy + h / 2 + 10);
    ctx.lineTo(cx - 8, cy + h / 2);
    ctx.arcTo(cx - w / 2, cy + h / 2, cx - w / 2, cy - h / 2, 14);
    ctx.arcTo(cx - w / 2, cy - h / 2, cx + w / 2, cy - h / 2, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = CONFIG.colors.darkBrown;
    ctx.fillText(text, cx, cy + 1);
    ctx.restore();
  }

  // The mouse pointer: a hand over what can be moved, a closed hand while dragging.
  function cursor() {
    if (drag) return "grabbing";
    return hover && hover.place === where() ? "grab" : "";
  }

  return {
    init: init,
    isOn: function () { return on; },
    isDragging: function () { return !!drag; },
    down: down,
    move: move,
    up: up,
    leave: leave,
    cancelDrag: cancelDrag,
    update: update,
    draw: draw,
    cursor: cursor
  };
})();
