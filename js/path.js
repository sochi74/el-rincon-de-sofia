// Paths that go around everything solid, in the house, in the city, in the Pradera de flores, in the Lago, in the
// Bosque encantado, in the Montaña and in the Cueva. Each place is cut into small squares; a square is free when its middle
// is not solid (House.isSolid, City.isSolid, Meadow.isSolid, Lake.isSolid, Enchanted.isSolid, Mountain.isSolid, Cave.isSolid).
// The way found over the squares is then straightened and its corners are rounded, so the walk looks smooth.
// Modo decorar (js/decorate.js) moves things, so the squares are worked out again after every move.
// Characters also go around each other (js/sims.js): then the squares around the others count as solid for a moment.
var Path = (function () {
  // Size of a square, in world units. The grid is big enough for the city and for the house (which is wider).
  var CELL = 6;
  var COLS = Math.ceil(Math.max(CONFIG.world.width, CONFIG.houseWorld.width) / CELL);
  var ROWS = Math.ceil(Math.max(CONFIG.world.height, CONFIG.houseWorld.height) / CELL);
  // How round the corners are: at most this many world units cut from each side of a corner.
  var ROUND = 26;
  var DIAGONAL = Math.SQRT2;
  // Steps to the 8 neighbor squares, as [column, row, cost].
  var STEPS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
    [1, 1, DIAGONAL], [1, -1, DIAGONAL], [-1, 1, DIAGONAL], [-1, -1, DIAGONAL]];

  // Free (1) or solid (0) squares of each place, worked out the first time they are needed after a change.
  var grids = {};

  // Something solid moved: work the squares out again the next time.
  function reset() {
    grids = {};
  }

  function isSolid(place, x, y) {
    if (place === "meadow") return Meadow.isSolid(x, y);
    if (place === "lake") return Lake.isSolid(x, y);
    if (place === "enchanted") return Enchanted.isSolid(x, y);
    if (place === "mountain") return Mountain.isSolid(x, y);
    if (place === "cave") return Cave.isSolid(x, y);
    return place === "city" ? City.isSolid(x, y) : House.isSolid(x, y);
  }

  function grid(place) {
    if (!grids[place]) {
      var g = new Uint8Array(COLS * ROWS);
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          g[r * COLS + c] = isSolid(place, (c + 0.5) * CELL, (r + 0.5) * CELL) ? 0 : 1;
        }
      }
      grids[place] = g;
    }
    return grids[place];
  }

  // The square of a spot, kept inside the grid.
  function cellOf(x, y) {
    var c = Math.max(0, Math.min(COLS - 1, Math.floor(x / CELL)));
    var r = Math.max(0, Math.min(ROWS - 1, Math.floor(y / CELL)));
    return r * COLS + c;
  }

  function center(i) {
    return { x: (i % COLS + 0.5) * CELL, y: (Math.floor(i / COLS) + 0.5) * CELL };
  }

  // The square closest to a spot among the ones "ok" says yes to, or -1.
  function closest(x, y, ok) {
    var best = -1, bestD = Infinity;
    for (var i = 0; i < COLS * ROWS; i++) {
      if (!ok(i)) continue;
      var dx = (i % COLS + 0.5) * CELL - x, dy = (Math.floor(i / COLS) + 0.5) * CELL - y;
      var d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  // ---------- Searching ----------

  // A small heap that always gives back the square with the lowest score first.
  function Heap() {
    this.items = [];
    this.scores = [];
  }

  Heap.prototype.push = function (item, score) {
    var items = this.items, scores = this.scores;
    var i = items.length;
    items.push(item);
    scores.push(score);
    while (i > 0) {
      var up = (i - 1) >> 1;
      if (scores[up] <= score) break;
      items[i] = items[up];
      scores[i] = scores[up];
      i = up;
    }
    items[i] = item;
    scores[i] = score;
  };

  Heap.prototype.pop = function () {
    var items = this.items, scores = this.scores;
    var top = items[0];
    var lastItem = items.pop(), lastScore = scores.pop();
    var n = items.length;
    if (n === 0) return top;
    var i = 0;
    while (true) {
      var child = i * 2 + 1;
      if (child >= n) break;
      if (child + 1 < n && scores[child + 1] < scores[child]) child++;
      if (scores[child] >= lastScore) break;
      items[i] = items[child];
      scores[i] = scores[child];
      i = child;
    }
    items[i] = lastItem;
    scores[i] = lastScore;
    return top;
  };

  // Shortest ways over free squares from "start". It stops as soon as it gets to "goal";
  // with no goal (-1), or when the goal cannot be reached, it looks at every square it can reach.
  // Going diagonally is only allowed when both squares beside the step are free, so it never cuts a corner.
  function search(g, start, goal) {
    var n = COLS * ROWS;
    var dist = new Float32Array(n).fill(Infinity);
    var from = new Int32Array(n).fill(-1);
    var done = new Uint8Array(n);
    var gc = goal % COLS, gr = Math.floor(goal / COLS);
    function guess(i) {
      if (goal < 0) return 0;
      var dc = Math.abs(i % COLS - gc), dr = Math.abs(Math.floor(i / COLS) - gr);
      return Math.max(dc, dr) + (DIAGONAL - 1) * Math.min(dc, dr);
    }
    var heap = new Heap();
    dist[start] = 0;
    heap.push(start, guess(start));
    while (heap.items.length > 0) {
      var i = heap.pop();
      if (done[i]) continue;
      done[i] = 1;
      if (i === goal) break;
      var c = i % COLS, r = Math.floor(i / COLS);
      for (var s = 0; s < STEPS.length; s++) {
        var nc = c + STEPS[s][0], nr = r + STEPS[s][1];
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
        var j = nr * COLS + nc;
        if (!g[j] || done[j]) continue;
        if (STEPS[s][0] && STEPS[s][1] && (!g[r * COLS + nc] || !g[nr * COLS + c])) continue;
        var d = dist[i] + STEPS[s][2];
        if (d < dist[j]) {
          dist[j] = d;
          from[j] = i;
          heap.push(j, d + guess(j));
        }
      }
    }
    return { dist: dist, from: from };
  }

  // ---------- Smoothing ----------

  // True if the straight line between two spots only crosses free squares.
  function clearLine(g, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y;
    var steps = Math.ceil(Math.sqrt(dx * dx + dy * dy) / (CELL / 3));
    for (var s = 1; s < steps; s++) {
      if (!g[cellOf(a.x + dx * s / steps, a.y + dy * s / steps)]) return false;
    }
    return true;
  }

  // Keep only the corners: from each point, go straight to the farthest next point it can see.
  function straighten(g, points) {
    var out = [points[0]];
    var i = 0;
    while (i < points.length - 1) {
      var j = i + 1;
      while (j + 1 < points.length && clearLine(g, points[i], points[j + 1])) j++;
      out.push(points[j]);
      i = j;
    }
    return out;
  }

  // Round each corner with a little curve, when the curve stays on free squares.
  function roundCorners(g, points) {
    var out = [points[0]];
    for (var i = 1; i < points.length - 1; i++) {
      var a = points[i - 1], p = points[i], b = points[i + 1];
      var da = Math.hypot(a.x - p.x, a.y - p.y), db = Math.hypot(b.x - p.x, b.y - p.y);
      var r = Math.min(ROUND, da * 0.45, db * 0.45);
      var curve = [];
      if (r > 2) {
        var p1 = { x: p.x + (a.x - p.x) / da * r, y: p.y + (a.y - p.y) / da * r };
        var p2 = { x: p.x + (b.x - p.x) / db * r, y: p.y + (b.y - p.y) / db * r };
        for (var k = 0; k <= 6; k++) {
          var t = k / 6, u = 1 - t;
          var q = {
            x: u * u * p1.x + 2 * u * t * p.x + t * t * p2.x,
            y: u * u * p1.y + 2 * u * t * p.y + t * t * p2.y
          };
          if (!g[cellOf(q.x, q.y)]) {
            curve = null;
            break;
          }
          curve.push(q);
        }
      }
      if (curve && curve.length) {
        out = out.concat(curve);
      } else {
        out.push(p);
      }
    }
    out.push(points[points.length - 1]);
    return out;
  }

  // ---------- What the rest of the game uses ----------

  // The way over the squares "g" from one spot to another, and whether it gets right to the spot ("reached").
  function route(place, g, fromX, fromY, toX, toY) {
    var startFree = !!g[cellOf(fromX, fromY)];
    var start = startFree ? cellOf(fromX, fromY) : closest(fromX, fromY, function (i) { return g[i]; });
    if (start < 0) return { way: [], reached: false };
    var target = cellOf(toX, toY);
    var exact = !!g[target] && !isSolid(place, toX, toY);
    var found = search(g, start, exact ? target : -1);
    var goal = target;
    if (!exact || found.dist[goal] === Infinity) {
      exact = false;
      goal = closest(toX, toY, function (i) { return found.dist[i] !== Infinity; });
    }

    // The squares from the start to the goal, then the real start and end spots in place of their middles.
    var cells = [];
    for (var i = goal; i >= 0; i = found.from[i]) cells.unshift(i);
    var points = cells.map(center);
    points[0] = startFree ? { x: fromX, y: fromY } : center(start);
    if (!startFree) points.unshift({ x: fromX, y: fromY });
    if (exact) points[points.length - 1] = { x: toX, y: toY };
    if (points.length === 1) points.push(points[0]);

    var way = roundCorners(g, straighten(g, points));
    // The first point is where it already stands.
    return { way: way.slice(1).map(function (p) { return { x: p.x, y: p.y }; }), reached: exact };
  }

  // Points to walk through from one spot to another in a place, going around everything solid.
  // If the spot cannot be reached (inside furniture, in the water, off the map), the way ends at the
  // closest spot that can. If the character starts on something solid, it first steps off it.
  function find(place, fromX, fromY, toX, toY) {
    return route(place, grid(place), fromX, fromY, toX, toY).way;
  }

  // The closest spot of a place where a character may stand (the same spot if it is free).
  // With "within", only a spot inside that box (like a room).
  function free(place, x, y, within) {
    var g = grid(place);
    function inside(p) {
      return !within || (p.x >= within.x && p.x <= within.x + within.w && p.y >= within.y && p.y <= within.y + within.h);
    }
    if (g[cellOf(x, y)] && !isSolid(place, x, y) && inside({ x: x, y: y })) return { x: x, y: y };
    var i = closest(x, y, function (k) { return g[k] && inside(center(k)); });
    return i < 0 ? { x: x, y: y } : center(i);
  }

  // Where a character can walk now from a spot, going square by square (Modo decorar checks every room and piece
  // of furniture can still be reached). "at" says if a spot is reached; "any" if some spot inside a box is.
  function reach(place, x, y) {
    reset();
    var g = grid(place);
    var seen = new Uint8Array(COLS * ROWS);
    var start = cellOf(x, y);
    var todo = g[start] ? [start] : [];
    if (todo.length) seen[start] = 1;
    while (todo.length > 0) {
      var i = todo.pop();
      var c = i % COLS, r = Math.floor(i / COLS);
      for (var s = 0; s < 4; s++) {
        var nc = c + STEPS[s][0], nr = r + STEPS[s][1];
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
        var j = nr * COLS + nc;
        if (g[j] && !seen[j]) {
          seen[j] = 1;
          todo.push(j);
        }
      }
    }
    return {
      at: function (px, py) { return !!seen[cellOf(px, py)]; },
      any: function (b) {
        var c0 = cellOf(b.x, b.y), c1 = cellOf(b.x + b.w, b.y + b.h);
        for (var row = Math.floor(c0 / COLS); row <= Math.floor(c1 / COLS); row++) {
          for (var col = c0 % COLS; col <= c1 % COLS; col++) {
            if (seen[row * COLS + col]) return true;
          }
        }
        return false;
      }
    };
  }

  // ---------- Making way for each other ----------

  // The squares of a place, where the squares around each one of "people" ({ x, y, r }) are solid too.
  function withPeople(place, people) {
    var g = grid(place).slice();
    people.forEach(function (p) {
      var c0 = Math.max(0, Math.floor((p.x - p.r) / CELL)), c1 = Math.min(COLS - 1, Math.floor((p.x + p.r) / CELL));
      var r0 = Math.max(0, Math.floor((p.y - p.r) / CELL)), r1 = Math.min(ROWS - 1, Math.floor((p.y + p.r) / CELL));
      for (var r = r0; r <= r1; r++) {
        for (var c = c0; c <= c1; c++) {
          var dx = (c + 0.5) * CELL - p.x, dy = (r + 0.5) * CELL - p.y;
          if (dx * dx + dy * dy <= p.r * p.r) g[r * COLS + c] = 0;
        }
      }
    });
    return g;
  }

  // A way from one spot to another that also goes around the people, or null if there is no room for it
  // (like a person in a doorway or on the bridge).
  function around(place, fromX, fromY, toX, toY, people) {
    var r = route(place, withPeople(place, people), fromX, fromY, toX, toY);
    return r.reached ? r.way : null;
  }

  // The closest spot to x, y that a character can walk to from where it stands, away from the people.
  function clearOf(place, fromX, fromY, x, y, people) {
    var g = withPeople(place, people);
    var start = g[cellOf(fromX, fromY)] ? cellOf(fromX, fromY) : closest(fromX, fromY, function (i) { return g[i]; });
    if (start < 0) return { x: x, y: y };
    var found = search(g, start, -1);
    if (found.dist[cellOf(x, y)] !== Infinity && !isSolid(place, x, y)) return { x: x, y: y };
    var i = closest(x, y, function (k) { return found.dist[k] !== Infinity; });
    return i < 0 ? { x: x, y: y } : center(i);
  }

  return { find: find, free: free, reset: reset, reach: reach, around: around, clearOf: clearOf };
})();
