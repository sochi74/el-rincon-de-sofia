// Starts the game: title screen, canvas sizing and the game loop.
// Also the fingers: a quick tap does as always, keeping a finger still shows the word of what is under it,
// and two fingers zoom in and out and slide the view (the mouse wheel zooms too). The 🔍 button goes back to the whole place.
(function () {
  var titleScreen = document.getElementById("title-screen");
  var playButton = document.getElementById("play-button");
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");

  var view = { width: 0, height: 0, dpr: 1, scale: 1, offsetX: 0, offsetY: 0 };
  // The zoom: "z" from 1 (the whole place) up to CONFIG.mobile.maxZoom, and the spot of the place in the middle of the view.
  // It goes back to 1 when the view changes between the house and the city, and it is not saved.
  var zoom = { z: 1, cx: null, cy: null, place: null };
  var zoomButton = document.getElementById("zoom-reset");
  var hovered = null;
  var hoveredHouse = false;
  // "treehouse", "castle", "hollowTree" or "chalkboard" when the mouse is over a neighbor's home, else null.
  var hoveredHome = null;
  // Last spot of the mouse on the screen, for the word tag (null when it is away or with a finger).
  var mouse = null;

  // Match the canvas to the window (all of it, with no scroll bars) and keep it sharp on high-resolution screens.
  function resize() {
    UI.checkSmall();
    view.dpr = window.devicePixelRatio || 1;
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    canvas.width = Math.round(view.width * view.dpr);
    canvas.height = Math.round(view.height * view.dpr);
    canvas.style.width = view.width + "px";
    canvas.style.height = view.height + "px";
    fit();
  }

  // Scale the place on screen to fit the window: the house is wider than the city (it has the Baño).
  // On wide screens the open panel keeps a column on the left, and on small screens the open drawer keeps the bottom,
  // so the place fits in the room left. With zoom it grows from there, but never shows past the edge of the place.
  function fit() {
    var place = Sims.viewPlace();
    if (zoom.place !== place) {
      zoom.place = place;
      zoom.z = 1;
      zoom.cx = zoom.cy = null;
    }
    var m = UI.isSmall() ? CONFIG.mobile.margin : CONFIG.margin;
    var size = place === "city" ? CONFIG.world : CONFIG.houseWorld;
    var W = size.width, H = size.height;
    var left = UI.reservedLeft(), room = view.width - left;
    var high = Math.max(1, view.height - UI.reservedBottom());
    view.scale = Math.max(0.05, Math.min((room - m * 2) / W, (high - m * 2) / H)) * zoom.z;
    if (zoom.cx === null) {
      zoom.cx = W / 2;
      zoom.cy = H / 2;
    }
    view.offsetX = along(left, room, W, zoom.cx);
    view.offsetY = along(0, high, H, zoom.cy);
    zoom.cx = (left + room / 2 - view.offsetX) / view.scale;
    zoom.cy = (high / 2 - view.offsetY) / view.scale;
  }

  // Where the place starts on screen along one side, with "mid" of the place in the middle of the room ("from", "room" long).
  // When it is smaller than the room it stays in the middle; when it is bigger, its edges never come inside the room.
  function along(from, room, size, mid) {
    var big = size * view.scale;
    if (big <= room) return from + (room - big) / 2;
    return Math.max(from + room - big, Math.min(from, from + room / 2 - mid * view.scale));
  }

  // Zoom to "z" keeping the spot of the place "p" under the spot on the screen "at" (between the fingers, or the mouse).
  function zoomTo(z, p, at) {
    zoom.z = Math.max(1, Math.min(CONFIG.mobile.maxZoom, z));
    fit();
    var rect = canvas.getBoundingClientRect();
    var left = UI.reservedLeft(), room = view.width - left, high = Math.max(1, view.height - UI.reservedBottom());
    zoom.cx = p.x + (left + room / 2 - (at.clientX - rect.left)) / view.scale;
    zoom.cy = p.y + (high / 2 - (at.clientY - rect.top)) / view.scale;
    fit();
  }

  function resetZoom() {
    zoom.z = 1;
    zoom.cx = zoom.cy = null;
    fit();
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
    House.update(dt);
    render(time);
    var zoomed = zoom.z > 1.001;
    if (zoomButton.hidden === zoomed) zoomButton.hidden = !zoomed;
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

  // ---------- Fingers ----------

  // The fingers on the canvas now, by pointer id, each with where it is on the screen.
  var fingers = {};
  // The finger that may be a tap or a hold: where it went down, its timer, and "held" once its word shows.
  var press = null;
  // Two fingers: how far apart they started, the zoom then and the spot of the place between them.
  // "pinched" stays until every finger is up, so the last one does not tap when it goes up.
  var pinch = null, pinched = false;

  function fingerCount() {
    return Object.keys(fingers).length;
  }

  function between() {
    var ids = Object.keys(fingers), a = fingers[ids[0]], b = fingers[ids[1]];
    return {
      clientX: (a.clientX + b.clientX) / 2,
      clientY: (a.clientY + b.clientY) / 2,
      apart: Math.max(1, Math.sqrt((a.clientX - b.clientX) * (a.clientX - b.clientX) + (a.clientY - b.clientY) * (a.clientY - b.clientY)))
    };
  }

  function forgetPress() {
    if (press) window.clearTimeout(press.timer);
    press = null;
  }

  // A mouse taps right away. A finger waits: going up quickly is a tap, keeping still shows the word (js/ui.js),
  // and a second finger starts the zoom. In Modo decorar one finger drags right away, as always.
  function handleDown(event) {
    if (event.pointerType !== "touch") {
      handleTap(event);
      return;
    }
    // The first finger of a new touch starts clean, even if an "up" was missed.
    if (event.isPrimary) {
      fingers = {};
      pinch = null;
      pinched = false;
      forgetPress();
    }
    fingers[event.pointerId] = { clientX: event.clientX, clientY: event.clientY };
    if (fingerCount() >= 2) {
      forgetPress();
      Decorate.up();
      UI.hideWord();
      pinched = true;
      var mid = between();
      pinch = { apart: mid.apart, z: zoom.z, p: toWorld(mid) };
      return;
    }
    if (pinched) return;
    if (Decorate.isOn()) {
      handleTap(event);
      return;
    }
    var spot = { clientX: event.clientX, clientY: event.clientY, pointerId: event.pointerId, pointerType: "touch" };
    press = { spot: spot, held: false, timer: window.setTimeout(function () {
      if (!press) return;
      press.held = true;
      UI.showWord(wordAt(press.spot), press.spot.clientX, press.spot.clientY, 0);
    }, CONFIG.mobile.holdSeconds * 1000) };
  }

  function handleMove(event) {
    if (event.pointerType === "touch" && fingers[event.pointerId]) {
      fingers[event.pointerId] = { clientX: event.clientX, clientY: event.clientY };
      if (pinch && fingerCount() >= 2) {
        var mid = between();
        zoomTo(pinch.z * mid.apart / pinch.apart, pinch.p, mid);
        return;
      }
      if (pinched) return;
      // Moving away before the word shows is not holding still; going up then still taps where it went down.
      if (press && !press.held) {
        var dx = event.clientX - press.spot.clientX, dy = event.clientY - press.spot.clientY;
        if (dx * dx + dy * dy > CONFIG.mobile.holdMove * CONFIG.mobile.holdMove) window.clearTimeout(press.timer);
      }
    }
    handleHover(event);
  }

  // Up: a quick finger taps; after a hold, the word stays a little while and nothing else happens.
  function handleUp(event) {
    if (event.pointerType === "touch") {
      delete fingers[event.pointerId];
      if (fingerCount() < 2) pinch = null;
      if (press && press.spot.pointerId === event.pointerId) {
        var p = press;
        forgetPress();
        if (p.held) {
          UI.showWord(wordAt(p.spot), p.spot.clientX, p.spot.clientY, CONFIG.wordTag.touchSeconds);
        } else if (event.type === "pointerup") {
          handleTap(p.spot);
        }
      }
      if (fingerCount() === 0) pinched = false;
    }
    Decorate.up();
    canvas.style.cursor = Decorate.cursor();
  }

  // The mouse wheel zooms around the mouse.
  function handleWheel(event) {
    event.preventDefault();
    zoomTo(zoom.z * Math.exp(-event.deltaY * CONFIG.mobile.wheelStep), toWorld(event), event);
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
    // A finger held still shows the word of what is under it, above the finger.
    if (press && press.held) {
      UI.showWord(wordAt(press.spot), press.spot.clientX, press.spot.clientY, 0);
      return;
    }
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
  canvas.addEventListener("pointerdown", handleDown);
  canvas.addEventListener("pointermove", handleMove);
  canvas.addEventListener("wheel", handleWheel, { passive: false });
  // Holding a finger does not open the browser's menu, and pinching anywhere does not zoom the page.
  canvas.addEventListener("contextmenu", function (event) { event.preventDefault(); });
  document.addEventListener("gesturestart", function (event) { event.preventDefault(); });
  zoomButton.addEventListener("click", resetZoom);
  canvas.addEventListener("pointerleave", function () {
    hovered = null;
    hoveredHouse = false;
    hoveredHome = null;
    Garden.setHover(-1);
    Gather.setHover(null);
    Decorate.leave();
    mouse = null;
  });
  canvas.addEventListener("pointerup", handleUp);
  canvas.addEventListener("pointercancel", handleUp);
  window.addEventListener("resize", resize);
  window.addEventListener("pagehide", Save.onLeave);
  window.addEventListener("beforeunload", Save.onLeave);
})();
