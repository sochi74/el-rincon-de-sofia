// Starts the game: title screen, canvas sizing and the game loop.
(function () {
  var titleScreen = document.getElementById("title-screen");
  var playButton = document.getElementById("play-button");
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");

  var view = { width: 0, height: 0, dpr: 1, scale: 1, offsetX: 0, offsetY: 0 };
  var hovered = null;
  var hoveredHouse = false;
  // Last spot of the mouse on the screen, for the word tag (null when it is away or with a finger).
  var mouse = null;

  // Match the canvas to the window and keep it sharp on high-resolution screens.
  function resize() {
    view.dpr = window.devicePixelRatio || 1;
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    canvas.width = Math.round(view.width * view.dpr);
    canvas.height = Math.round(view.height * view.dpr);

    var m = CONFIG.margin;
    var W = CONFIG.world.width, H = CONFIG.world.height;
    view.scale = Math.max(0.05, Math.min((view.width - m * 2) / W, (view.height - m * 2) / H));
    view.offsetX = (view.width - W * view.scale) / 2;
    view.offsetY = (view.height - H * view.scale) / 2;
  }

  function render(time) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = CONFIG.colors.cream;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var s = view.scale * view.dpr;
    ctx.setTransform(s, 0, 0, s, view.offsetX * view.dpr, view.offsetY * view.dpr);
    if (Sims.viewPlace() === "city") {
      City.draw(ctx, time, hoveredHouse, hovered && hovered.id);
    } else {
      House.draw(ctx, hovered && hovered.id);
    }
    drawNight(time);
    // Signs go over the night tint, so they read the same by night as by day.
    if (Sims.viewPlace() === "city") {
      City.drawLabels(ctx);
    } else {
      House.drawLabels(ctx);
    }
    if (Sims.viewPlace() === "city") {
      Garden.drawTop(ctx, time);
      Gather.drawTop(ctx, time);
      Coins.draw(ctx, time, Time.darkness());
    }
    Pet.draw(ctx);
    Sims.draw(ctx, time);
    if (Sims.viewPlace() === "city") Gather.drawPops(ctx);
    Cooking.drawPops(ctx);
    Gifts.draw(ctx, time);
    Social.draw(ctx, time);
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
    City.update(dt);
    Coins.update(dt);
    Garden.update(dt);
    Gather.update(dt);
    Cooking.update(dt);
    Gifts.update(dt);
    Sims.update(dt);
    Pet.update(dt);
    Needs.update(dt);
    Objects.update(dt);
    Social.update(dt);
    Sims.think(dt);
    Save.update(dt);
    UI.update();
    render(time);
    updateWord();
    window.requestAnimationFrame(loop);
  }

  // Turn a spot on the screen into a spot in the house or the city.
  function toWorld(event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left - view.offsetX) / view.scale,
      y: (event.clientY - rect.top - view.offsetY) / view.scale
    };
  }

  function handleTap(event) {
    var p = toWorld(event);
    Sims.handleTap(p.x, p.y, event.clientX, event.clientY);
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
    if (Pet.at(p.x, p.y)) return Pet.word();
    if (inCity) return Coins.wordAt(p.x, p.y) || City.wordAt(p.x, p.y);
    return House.wordAt(p.x, p.y);
  }

  // Every frame, so the tag follows things that move (like the fireflies) and changes when the view does.
  // Over the panel, the ☰ button, the backpack or a menu there is no tag.
  function updateWord() {
    if (mouse && UI.coversSpot(mouse.clientX, mouse.clientY)) {
      UI.hideWord();
    } else if (mouse) {
      UI.showWord(wordAt(mouse), mouse.clientX, mouse.clientY);
    } else if (!UI.isWordTimed()) {
      UI.hideWord();
    }
  }

  // Light up the usable furniture, or in the city the house, tent, campfire, a garden plot or a forest thing, under the mouse
  // (characters in front win). The front door and the river get a pointer too.
  function handleHover(event) {
    mouse = event.pointerType === "touch" ? null : { clientX: event.clientX, clientY: event.clientY };
    var p = toWorld(event);
    var free = !Sims.simAt(p.x, p.y);
    var inCity = Sims.viewPlace() === "city";
    hovered = free ? Objects.at(p.x, p.y, inCity ? "city" : "house") : null;
    hoveredHouse = free && inCity && City.houseAt(p.x, p.y);
    var plot = inCity ? Garden.plotAt(p.x, p.y) : -1;
    Garden.setHover(plot);
    var wild = inCity ? Gather.thingAt(p.x, p.y) : null;
    Gather.setHover(wild);
    var door = free && !inCity && House.doorAt(p.x, p.y);
    var river = free && inCity && City.riverAt(p.x, p.y);
    canvas.style.cursor = hovered || hoveredHouse || door || river || plot >= 0 || wild ? "pointer" : "";
  }

  function startGame() {
    titleScreen.hidden = true;
    canvas.hidden = false;
    UI.show();
    Save.start();
    resize();
    window.requestAnimationFrame(loop);
  }

  Needs.init(CHARACTERS);
  Social.init(CHARACTERS);
  UI.init();
  Sims.init(UI.showSelected);
  Save.load();
  Pet.init();

  playButton.addEventListener("click", startGame);
  canvas.addEventListener("pointerdown", handleTap);
  canvas.addEventListener("pointermove", handleHover);
  canvas.addEventListener("pointerleave", function () {
    hovered = null;
    hoveredHouse = false;
    Garden.setHover(-1);
    Gather.setHover(null);
    mouse = null;
  });
  window.addEventListener("resize", resize);
  window.addEventListener("pagehide", Save.onLeave);
  window.addEventListener("beforeunload", Save.onLeave);
})();
