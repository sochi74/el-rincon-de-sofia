// Starts the game: title screen, canvas sizing and the game loop.
(function () {
  var titleScreen = document.getElementById("title-screen");
  var playButton = document.getElementById("play-button");
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");

  var view = { width: 0, height: 0, dpr: 1, scale: 1, offsetX: 0, offsetY: 0 };
  var hovered = null;
  var hoveredHouse = false;
  // "treehouse", "castle", "hollowTree" or "chalkboard" when the mouse is over a neighbor's home, else null.
  var hoveredHome = null;
  // Last spot of the mouse on the screen, for the word tag (null when it is away or with a finger).
  var mouse = null;

  // Match the canvas to the window and keep it sharp on high-resolution screens.
  function resize() {
    view.dpr = window.devicePixelRatio || 1;
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    canvas.width = Math.round(view.width * view.dpr);
    canvas.height = Math.round(view.height * view.dpr);
    fit();
  }

  // Scale the place on screen to fit the window: the house is wider than the city (it has the Baño).
  // On wide screens the open panel keeps a column on the left, so the place fits in the room beside it.
  function fit() {
    var m = CONFIG.margin;
    var size = Sims.viewPlace() === "city" ? CONFIG.world : CONFIG.houseWorld;
    var W = size.width, H = size.height;
    var left = UI.reservedLeft(), room = view.width - left;
    view.scale = Math.max(0.05, Math.min((room - m * 2) / W, (view.height - m * 2) / H));
    view.offsetX = left + (room - W * view.scale) / 2;
    view.offsetY = (view.height - H * view.scale) / 2;
  }

  // A spot of the place on screen as a spot on the screen (for the windows of js/ui.js).
  function toScreen(x, y) {
    fit();
    var rect = canvas.getBoundingClientRect();
    return { x: rect.left + view.offsetX + x * view.scale, y: rect.top + view.offsetY + y * view.scale };
  }

  function render(time) {
    fit();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = CONFIG.colors.cream;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var s = view.scale * view.dpr;
    ctx.setTransform(s, 0, 0, s, view.offsetX * view.dpr, view.offsetY * view.dpr);
    if (Sims.viewPlace() === "city") {
      City.draw(ctx, time, hoveredHouse, (hovered && hovered.id) || hoveredHome);
    } else {
      House.draw(ctx, hovered && hovered.id);
    }
    // The grayer sky of the rain and the rainbow, under the night tint and the signs (js/weather.js).
    if (Sims.viewPlace() === "city") Weather.drawSky(ctx);
    drawNight(time);
    // Signs go over the night tint, so they read the same by night as by day. The magic fog goes under them.
    if (Sims.viewPlace() === "city") {
      Weather.drawFog(ctx, Time.darkness());
      City.drawLabels(ctx);
    } else {
      House.drawLabels(ctx);
    }
    if (Sims.viewPlace() === "city") {
      Garden.drawTop(ctx, time);
      Gather.drawTop(ctx, time);
      Coins.draw(ctx, time, Time.darkness());
    }
    Neighbors.drawTop(ctx, time);
    // Krohna is drawn among the characters (js/sims.js).
    Sims.draw(ctx, time);
    // Rain drops and snowflakes fall over everyone.
    if (Sims.viewPlace() === "city") Weather.drawFalling(ctx);
    if (Sims.viewPlace() === "city") Gather.drawPops(ctx);
    Cooking.drawPops(ctx);
    Gifts.draw(ctx, time);
    Social.draw(ctx, time);
    Goals.draw(ctx, time);
    Lessons.draw(ctx);
    Decorate.draw(ctx, time);
  }

  // Mix two "#RRGGBB" colors: t = 0 gives a, t = 1 gives b.
  function mix(a, b, t) {
    var out = "#";
    for (var i = 1; i < 7; i += 2) {
      var x = parseInt(a.substr(i, 2), 16), y = parseInt(b.substr(i, 2), 16);
      var v = Math.round(x + (y - x) * t).toString(16);
      out += v.length < 2 ? "0" + v : v;
    }
    return out;
  }

  // Dusk, night and dawn: tint the whole world blue-violet, then light up what glows at night.
  // Characters are drawn afterwards, so they are always easy to see.
  function drawNight(time) {
    var dark = Time.darkness();
    if (dark <= 0) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = mix("#FFFFFF", CONFIG.night.tint, dark);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    if (Sims.viewPlace() === "city") {
      City.drawNightLights(ctx, time, dark);
    } else {
      House.drawNightLights(ctx, time, dark);
    }
  }

  var lastTime = null;

  function loop(now) {
    var time = now / 1000;
    // Cap the step so a hidden tab does not make characters jump.
    var dt = lastTime === null ? 0 : Math.min(0.1, time - lastTime);
    lastTime = time;
    Time.update(dt);
    Weather.update(dt);
    City.update(dt);
    Coins.update(dt);
    Garden.update(dt);
    Gather.update(dt);
    Cooking.update(dt);
    Gifts.update(dt);
    Sims.update(dt);
    Neighbors.update(dt);
    Pet.update(dt);
    Needs.update(dt);
    Objects.update(dt);
    Social.update(dt);
    Goals.update(dt);
    Lessons.update(dt);
    Sims.think(dt);
    Decorate.update(dt);
    Save.update(dt);
    Sound.update(dt);
    UI.update();
    render(time);
    updateWord();
    window.requestAnimationFrame(loop);
  }

  // Turn a spot on the screen into a spot in the house or the city.
  function toWorld(event) {
    fit();
    var rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left - view.offsetX) / view.scale,
      y: (event.clientY - rect.top - view.offsetY) / view.scale
    };
  }

  // In Modo decorar a tap only picks a thing to drag (js/decorate.js); the finger keeps dragging it even off the canvas.
  function handleTap(event) {
    var p = toWorld(event);
    if (Decorate.isOn()) {
      Decorate.down(p.x, p.y);
      if (Decorate.isDragging() && canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = Decorate.cursor();
    } else {
      Sims.handleTap(p.x, p.y, event.clientX, event.clientY);
    }
    if (event.pointerType === "touch") {
      UI.showWord(wordAt(event), event.clientX, event.clientY, CONFIG.wordTag.touchSeconds);
    }
  }

  // The word for the furniture, room or place at a spot on the screen (characters in front hide it).
  function wordAt(spot) {
    var p = toWorld(spot);
    var inCity = Sims.viewPlace() === "city";
    // Garden plots and forest things win over characters, like for taps.
    if (inCity && Garden.plotAt(p.x, p.y) >= 0) return Garden.wordAt(p.x, p.y);
    if (inCity && Gather.thingAt(p.x, p.y)) return Gather.wordAt(p.x, p.y);
    if (Sims.simAt(p.x, p.y)) return null;
    var neighbor = inCity ? Neighbors.at(p.x, p.y) : null;
    if (neighbor) return neighbor.data.id;
    if (Pet.at(p.x, p.y)) return Pet.word();
    if (inCity) return Coins.wordAt(p.x, p.y) || City.wordAt(p.x, p.y);
    return House.wordAt(p.x, p.y);
  }

  // Every frame, so the tag follows things that move (like the fireflies) and changes when the view does.
  // Over the panel, the ☰ button, the backpack or a menu there is no tag.
  function updateWord() {
    // The 🔊 button and the Modo decorar buttons show their own word.
    if (UI.isButtonWordShown()) return;
    if (mouse && UI.coversSpot(mouse.clientX, mouse.clientY)) {
      UI.hideWord();
    } else if (mouse) {
      UI.showWord(wordAt(mouse), mouse.clientX, mouse.clientY);
    } else if (!UI.isWordTimed()) {
      UI.hideWord();
    }
  }

  // Light up the usable furniture, or in the city the house, tent, campfire, a neighbor's home, a garden plot or a forest thing,
  // under the mouse (characters and neighbors in front win). The front door, the river and the neighbors get a pointer too.
  // In Modo decorar only what can be moved lights up (js/decorate.js), and it follows the finger while it is dragged.
  function handleHover(event) {
    mouse = event.pointerType === "touch" ? null : { clientX: event.clientX, clientY: event.clientY };
    var p = toWorld(event);
    if (Decorate.isOn()) {
      hovered = null;
      hoveredHouse = false;
      hoveredHome = null;
      Garden.setHover(-1);
      Gather.setHover(null);
      Decorate.move(p.x, p.y);
      canvas.style.cursor = Decorate.cursor();
      return;
    }
    var inCity = Sims.viewPlace() === "city";
    var neighbor = inCity && !Sims.simAt(p.x, p.y) && !!Neighbors.at(p.x, p.y);
    var free = !Sims.simAt(p.x, p.y) && !neighbor;
    hovered = free ? Objects.at(p.x, p.y, inCity ? "city" : "house") : null;
    hoveredHouse = free && inCity && City.houseAt(p.x, p.y);
    hoveredHome = free && inCity ? City.neighborHomeAt(p.x, p.y) : null;
    var plot = inCity ? Garden.plotAt(p.x, p.y) : -1;
    Garden.setHover(plot);
    var wild = inCity ? Gather.thingAt(p.x, p.y) : null;
    Gather.setHover(wild);
    var door = free && !inCity && House.doorAt(p.x, p.y);
    var river = free && inCity && City.riverAt(p.x, p.y);
    var talk = neighbor && !!Sims.selectedSim();
    canvas.style.cursor = hovered || hoveredHouse || door || river || plot >= 0 || wild || talk ? "pointer" : "";
  }

  function startGame() {
    Sound.start();
    titleScreen.hidden = true;
    canvas.hidden = false;
    UI.show();
    Save.start();
    resize();
    window.requestAnimationFrame(loop);
  }

  // Only Sofía and real.fixer have needs; everyone has friendship.
  Needs.init(playableCharacters());
  Social.init(CHARACTERS);
  UI.init();
  UI.setToScreen(toScreen);
  Goals.init();
  Lessons.init();
  Decorate.init();
  Sims.init(UI.showSelected);
  Neighbors.init();
  Save.load();
  Pet.init();

  playButton.addEventListener("click", startGame);
  canvas.addEventListener("pointerdown", handleTap);
  canvas.addEventListener("pointermove", handleHover);
  canvas.addEventListener("pointerleave", function () {
    hovered = null;
    hoveredHouse = false;
    hoveredHome = null;
    Garden.setHover(-1);
    Gather.setHover(null);
    Decorate.leave();
    mouse = null;
  });
  canvas.addEventListener("pointerup", function () {
    Decorate.up();
    canvas.style.cursor = Decorate.cursor();
  });
  canvas.addEventListener("pointercancel", function () {
    Decorate.up();
  });
  window.addEventListener("resize", resize);
  window.addEventListener("pagehide", Save.onLeave);
  window.addEventListener("beforeunload", Save.onLeave);
})();
