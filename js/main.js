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

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = CONFIG.colors.cream;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var s = view.scale * view.dpr;
    ctx.setTransform(s, 0, 0, s, view.offsetX * view.dpr, view.offsetY * view.dpr);
    House.draw(ctx);
  }

  function loop() {
    render();
    window.requestAnimationFrame(loop);
  }

  function startGame() {
    titleScreen.hidden = true;
    canvas.hidden = false;
    resize();
    loop();
  }

  playButton.addEventListener("click", startGame);
  window.addEventListener("resize", resize);
})();
