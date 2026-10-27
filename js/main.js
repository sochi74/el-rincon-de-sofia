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
  // In the Pradera: "swing", "picnic" or "trail" when the mouse is over it, else null.
  var hoveredMeadow = null;
  // In the Lago: a shell, or "trail", "chair0", "chair1", "castle", "mermaid" or "water" when the mouse is over it, else null.
  var hoveredLake = null;
  // In the Bosque encantado: a spirit, or "trail", "rest", "ring" or "water" when the mouse is over it, else null.
  var hoveredForest = null;
  // In the Montaña: a goat, or "trail" when the mouse is over it, else null.
  var hoveredMountain = null;
  // In the Cueva: a crystal, or "dragon" or "exit" when the mouse is over it, else null.
  var hoveredCave = null;
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
    var size = place === "house" ? CONFIG.houseWorld : CONFIG.world;
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

    // With the panel open on a wide screen, the place is drawn only in the room at its right (even with zoom).
    ctx.save();
    var left = UI.reservedLeft();
    if (left > 0) {
      ctx.beginPath();
      ctx.rect(left * view.dpr, 0, canvas.width - left * view.dpr, canvas.height);
      ctx.clip();
    }
    var s = view.scale * view.dpr;
    ctx.setTransform(s, 0, 0, s, view.offsetX * view.dpr, view.offsetY * view.dpr);
    var place = Sims.viewPlace();
    // Outside (the city, the Pradera, the Lago, the Bosque encantado and the Montaña) the weather of the day shows.
    // Never in the Cueva, which is always dark (js/cave.js).
    var outside = place !== "house" && place !== "cave";
    if (place === "city") {
      City.draw(ctx, time, hoveredHouse, (hovered && hovered.id) || hoveredHome);
    } else if (place === "meadow") {
      Meadow.draw(ctx);
    } else if (place === "lake") {
      Lake.draw(ctx);
    } else if (place === "enchanted") {
      Enchanted.draw(ctx);
    } else if (place === "mountain") {
      Mountain.draw(ctx);
    } else if (place === "cave") {
      Cave.draw(ctx);
    } else {
      House.draw(ctx, hovered && hovered.id);
    }
    // The hidden chest of the zone, half behind its bushes, rock or crystals (js/treasure.js).
    Treasure.draw(ctx, place);
    // The grayer sky of the rain and the rainbow, under the night tint and the signs (js/weather.js).
    if (outside) Weather.drawSky(ctx);
    drawNight(time);
    // Signs go over the night tint, so they read the same by night as by day. The magic fog goes under them.
    if (outside) Weather.drawFog(ctx, Time.darkness());
    if (place === "city") {
      City.drawLabels(ctx);
    } else if (place === "meadow") {
      Meadow.drawLabels(ctx);
    } else if (place === "lake") {
      Lake.drawLabels(ctx);
    } else if (place === "enchanted") {
      Enchanted.drawLabels(ctx);
    } else if (place === "mountain") {
      Mountain.drawLabels(ctx);
    } else if (place === "cave") {
      Cave.drawLabels(ctx);
    } else {
      House.drawLabels(ctx);
    }
    if (place === "city") {
      Garden.drawTop(ctx, time);
      Gather.drawTop(ctx, time);
      Coins.draw(ctx, time, Time.darkness());
    }
    if (place === "lake") Lake.drawTop(ctx);
    if (place === "enchanted") Enchanted.drawTop(ctx);
    if (place === "mountain") Mountain.drawTop(ctx);
    if (place === "cave") Cave.drawTop(ctx);
    // The sparkle of a hidden chest and the light of one opening shine by night and in the Cueva too.
    Treasure.drawTop(ctx, place);
    Neighbors.drawTop(ctx, time);
    // Krohna is drawn among the characters (js/sims.js).
    Sims.draw(ctx, time);
    // Rain drops and snowflakes fall over everyone.
    if (outside) Weather.drawFalling(ctx);
    if (place === "city") Gather.drawPops(ctx);
    if (place === "meadow") Meadow.drawPops(ctx);
    if (place === "lake") Lake.drawPops(ctx);
    if (place === "enchanted") Enchanted.drawPops(ctx);
    if (place === "mountain") Mountain.drawPops(ctx);
    if (place === "cave") Cave.drawPops(ctx);
    Treasure.drawPops(ctx, place);
    Cooking.drawPops(ctx);
    Gifts.draw(ctx, time);
    Social.draw(ctx, time);
    Goals.draw(ctx, time);
    Lessons.draw(ctx);
    Decorate.draw(ctx, time);
    ctx.restore();
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
  // The Cueva is always dark in its own way, by day and by night, so the night tint never comes in.
  function drawNight(time) {
    var dark = Time.darkness();
    if (dark <= 0 || Sims.viewPlace() === "cave") return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = mix("#FFFFFF", CONFIG.night.tint, dark);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    // The Pradera, the Lago and the Montaña have nothing that glows at night; in the Bosque encantado the giant mushrooms do.
    if (Sims.viewPlace() === "city") {
      City.drawNightLights(ctx, time, dark);
    } else if (Sims.viewPlace() === "house") {
      House.drawNightLights(ctx, time, dark);
    } else if (Sims.viewPlace() === "enchanted") {
      Enchanted.drawNightLights(ctx, dark);
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
    Meadow.update(dt);
    Lake.update(dt);
    Enchanted.update(dt);
    Mountain.update(dt);
    Cave.update(dt);
    Treasure.update(dt);
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
    ValleyMap.update(dt);
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
    // A band-aid on someone's arm, wherever they are.
    if (Enchanted.bandAidAt(p.x, p.y)) return "bandAid";
    // The hidden chest of a zone wins over characters, like for taps.
    var chest = Treasure.wordAt(Sims.viewPlace(), p.x, p.y);
    if (chest) return chest;
    // In the Pradera the wild flowers win over characters, like for taps.
    if (Sims.viewPlace() === "meadow") {
      var wild = Meadow.flowerAt(p.x, p.y);
      if (wild) return wild.kind;
      if (Sims.simAt(p.x, p.y)) return null;
      if (Pet.at(p.x, p.y)) return Pet.word();
      return Meadow.wordAt(p.x, p.y);
    }
    // In the Lago the shells win over characters, like for taps.
    if (Sims.viewPlace() === "lake") {
      var shell = Lake.shellAt(p.x, p.y);
      if (shell) return shell.kind;
      if (Sims.simAt(p.x, p.y)) return null;
      if (Pet.at(p.x, p.y)) return Pet.word();
      return Lake.wordAt(p.x, p.y);
    }
    // In the Bosque encantado the spirits win over characters, like for taps.
    if (Sims.viewPlace() === "enchanted") {
      if (Enchanted.spiritAt(p.x, p.y)) return "spirit";
      if (Sims.simAt(p.x, p.y)) return null;
      if (Pet.at(p.x, p.y)) return Pet.word();
      return Enchanted.wordAt(p.x, p.y);
    }
    // In the Montaña the goats win over characters, like for taps.
    if (Sims.viewPlace() === "mountain") {
      if (Mountain.goatAt(p.x, p.y)) return Mountain.wordAt(p.x, p.y);
      if (Sims.simAt(p.x, p.y)) return null;
      if (Pet.at(p.x, p.y)) return Pet.word();
      return Mountain.wordAt(p.x, p.y);
    }
    // In the Cueva the crystals on the floor win over characters, like for taps.
    if (Sims.viewPlace() === "cave") {
      var crystal = Cave.crystalAt(p.x, p.y);
      if (crystal) return crystal.kind;
      if (Sims.simAt(p.x, p.y)) return null;
      if (Pet.at(p.x, p.y)) return Pet.word();
      return Cave.wordAt(p.x, p.y);
    }
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

  // Light up the usable furniture, or in the city the house, tent, campfire, a neighbor's home, a garden plot, a forest thing
  // or a trail to the Pradera or the Lago, or in the Pradera a wild flower, the swing, the picnic blanket or the trail, or in
  // the Lago a shell, a beach chair, the sandcastle spot, Pacífica or the trail, or in the Bosque encantado a spirit, the low
  // mushroom, the fairy ring or the trail, or in the Montaña a goat, the mouth of the cave or the trail, or in the Cueva a
  // crystal on the floor, Chispa or the way out, under the mouse (characters and neighbors in front win). The hidden chest
  // of each zone lights up too, even with a character in front of it. The front door, the river, the lake, the stream and the neighbors get a pointer too.
  // In Modo decorar only what can be moved lights up (js/decorate.js), and it follows the finger while it is dragged.
  function handleHover(event) {
    mouse = event.pointerType === "touch" ? null : { clientX: event.clientX, clientY: event.clientY };
    var p = toWorld(event);
    if (Decorate.isOn()) {
      forgetHover();
      Decorate.move(p.x, p.y);
      canvas.style.cursor = Decorate.cursor();
      return;
    }
    // The hidden chest of the zone on screen glows under the mouse, even with a character next to it.
    if (Treasure.at(Sims.viewPlace(), p.x, p.y)) {
      forgetHover();
      Treasure.setHover(Sims.viewPlace());
      canvas.style.cursor = "pointer";
      return;
    }
    Treasure.setHover(null);
    var inCity = Sims.viewPlace() === "city";
    if (Sims.viewPlace() === "meadow") {
      var flower = Meadow.flowerAt(p.x, p.y);
      hovered = null;
      hoveredHouse = false;
      hoveredHome = null;
      hoveredMeadow = flower || Sims.simAt(p.x, p.y) ? null : Meadow.usableAt(p.x, p.y);
      Meadow.setHover(flower || hoveredMeadow);
      ValleyMap.setHover(false);
      canvas.style.cursor = flower || hoveredMeadow ? "pointer" : "";
      return;
    }
    Meadow.setHover(null);
    hoveredMeadow = null;
    if (Sims.viewPlace() === "lake") {
      var shell = Lake.shellAt(p.x, p.y);
      hovered = null;
      hoveredHouse = false;
      hoveredHome = null;
      hoveredLake = shell || (Sims.simAt(p.x, p.y) ? null : Lake.usableAt(p.x, p.y));
      // The water only gets a pointer; it does not light up.
      Lake.setHover(hoveredLake === "water" ? null : hoveredLake);
      ValleyMap.setHover(false);
      canvas.style.cursor = hoveredLake ? "pointer" : "";
      return;
    }
    Lake.setHover(null);
    hoveredLake = null;
    if (Sims.viewPlace() === "enchanted") {
      var spirit = Enchanted.spiritAt(p.x, p.y);
      hovered = null;
      hoveredHouse = false;
      hoveredHome = null;
      hoveredForest = spirit || (Sims.simAt(p.x, p.y) ? null : Enchanted.usableAt(p.x, p.y));
      // The water only gets a pointer; it does not light up.
      Enchanted.setHover(hoveredForest === "water" ? null : hoveredForest);
      ValleyMap.setHover(false);
      canvas.style.cursor = hoveredForest ? "pointer" : "";
      return;
    }
    Enchanted.setHover(null);
    hoveredForest = null;
    if (Sims.viewPlace() === "mountain") {
      var goat = Mountain.goatAt(p.x, p.y);
      hovered = null;
      hoveredHouse = false;
      hoveredHome = null;
      hoveredMountain = goat || (Sims.simAt(p.x, p.y) ? null : Mountain.usableAt(p.x, p.y));
      Mountain.setHover(hoveredMountain);
      ValleyMap.setHover(false);
      canvas.style.cursor = hoveredMountain ? "pointer" : "";
      return;
    }
    Mountain.setHover(null);
    hoveredMountain = null;
    if (Sims.viewPlace() === "cave") {
      var crystal = Cave.crystalAt(p.x, p.y);
      hovered = null;
      hoveredHouse = false;
      hoveredHome = null;
      var other = Sims.simAt(p.x, p.y);
      hoveredCave = crystal || (other ? null : Cave.dragonAt(p.x, p.y) ? "dragon" : Cave.usableAt(p.x, p.y));
      Cave.setHover(hoveredCave);
      ValleyMap.setHover(false);
      canvas.style.cursor = hoveredCave ? "pointer" : "";
      return;
    }
    Cave.setHover(null);
    hoveredCave = null;
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
    var trail = free && inCity && !hovered && !hoveredHouse && ValleyMap.trailAt(p.x, p.y);
    ValleyMap.setHover(trail);
    var talk = neighbor && !!Sims.selectedSim();
    canvas.style.cursor = hovered || hoveredHouse || door || river || plot >= 0 || wild || talk || trail ? "pointer" : "";
  }

  // Nothing lights up: in Modo decorar, when the mouse leaves, and over a hidden chest (then only the chest does).
  function forgetHover() {
    hovered = null;
    hoveredHouse = false;
    hoveredHome = null;
    Garden.setHover(-1);
    Gather.setHover(null);
    Meadow.setHover(null);
    Lake.setHover(null);
    Enchanted.setHover(null);
    Mountain.setHover(null);
    Cave.setHover(null);
    ValleyMap.setHover(false);
    Treasure.setHover(null);
    hoveredMeadow = null;
    hoveredLake = null;
    hoveredForest = null;
    hoveredMountain = null;
    hoveredCave = null;
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
  ValleyMap.init();
  Treasure.init();
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
    forgetHover();
    Decorate.leave();
    mouse = null;
  });
  canvas.addEventListener("pointerup", handleUp);
  canvas.addEventListener("pointercancel", handleUp);
  window.addEventListener("resize", resize);
  window.addEventListener("pagehide", Save.onLeave);
  window.addEventListener("beforeunload", Save.onLeave);
})();
