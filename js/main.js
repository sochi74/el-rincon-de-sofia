// Starts the game: title screen, canvas sizing and the game loop.
(function () {
  var titleScreen = document.getElementById("title-screen");
  var playButton = document.getElementById("play-button");
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");

  var view = { width: 0, height: 0, dpr: 1, scale: 1, offsetX: 0, offsetY: 0 };

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
    House.draw(ctx);
    Sims.draw(ctx, time);
  }

  var lastTime = null;

  function loop(now) {
    var time = now / 1000;
    // Cap the step so a hidden tab does not make characters jump.
    var dt = lastTime === null ? 0 : Math.min(0.1, time - lastTime);
    lastTime = time;
    Sims.update(dt);
    Needs.update(dt);
    UI.update();
    render(time);
    window.requestAnimationFrame(loop);
  }

  // Turn a tap on the screen into a spot in the house.
  function handleTap(event) {
    var rect = canvas.getBoundingClientRect();
    var x = (event.clientX - rect.left - view.offsetX) / view.scale;
    var y = (event.clientY - rect.top - view.offsetY) / view.scale;
    Sims.handleTap(x, y);
  }

  function startGame() {
    titleScreen.hidden = true;
    canvas.hidden = false;
    UI.show();
    resize();
    window.requestAnimationFrame(loop);
  }

  Needs.init(CHARACTERS);
  UI.init();
  Sims.init(UI.showSelected);

  playButton.addEventListener("click", startGame);
  canvas.addEventListener("pointerdown", handleTap);
  window.addEventListener("resize", resize);
})();
