// Starts the game: title screen, canvas sizing and the game loop.
(function () {
  var titleScreen = document.getElementById("title-screen");
  var playButton = document.getElementById("play-button");
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");

  var view = { width: 0, height: 0, dpr: 1, scale: 1, offsetX: 0, offsetY: 0 };
  var hovered = null;
  var hoveredHouse = false;

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
    Sims.draw(ctx, time);
    Social.draw(ctx, time);
  }

  var lastTime = null;

  function loop(now) {
    var time = now / 1000;
    // Cap the step so a hidden tab does not make characters jump.
    var dt = lastTime === null ? 0 : Math.min(0.1, time - lastTime);
    lastTime = time;
    Sims.update(dt);
    Needs.update(dt);
    Objects.update(dt);
    Social.update(dt);
    Sims.think(dt);
    Save.update(dt);
    UI.update();
    render(time);
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
  }

  // Light up the usable furniture, or in the city the house, tent or campfire, under the mouse (characters in front win).
  // The front door gets a pointer too.
  function handleHover(event) {
    var p = toWorld(event);
    var free = !Sims.simAt(p.x, p.y);
    var inCity = Sims.viewPlace() === "city";
    hovered = free ? Objects.at(p.x, p.y, inCity ? "city" : "house") : null;
    hoveredHouse = free && inCity && City.houseAt(p.x, p.y);
    var door = free && !inCity && House.doorAt(p.x, p.y);
    canvas.style.cursor = hovered || hoveredHouse || door ? "pointer" : "";
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

  playButton.addEventListener("click", startGame);
  canvas.addEventListener("pointerdown", handleTap);
  canvas.addEventListener("pointermove", handleHover);
  canvas.addEventListener("pointerleave", function () {
    hovered = null;
    hoveredHouse = false;
  });
  window.addEventListener("resize", resize);
  window.addEventListener("pagehide", Save.onLeave);
  window.addEventListener("beforeunload", Save.onLeave);
})();
