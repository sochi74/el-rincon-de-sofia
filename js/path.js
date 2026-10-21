// Paths that go around everything solid, in the house and in the city.
// Each place is cut into small squares; a square is free when its middle is not solid (House.isSolid, City.isSolid).
// The way found over the squares is then straightened and its corners are rounded, so the walk looks smooth.
var Path = (function () {
  // Size of a square, in world units.
  var CELL = 6;
  var COLS = Math.ceil(CONFIG.world.width / CELL), ROWS = Math.ceil(CONFIG.world.height / CELL);
  // How round the corners are: at most this many world units cut from each side of a corner.
  var ROUND = 26;
  var DIAGONAL = Math.SQRT2;
  // Steps to the 8 neighbor squares, as [column, row, cost].
  var STEPS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
    [1, 1, DIAGONAL], [1, -1, DIAGONAL], [-1, 1, DIAGONAL], [-1, -1, DIAGONAL]];

  // Free (1) or solid (0) squares of each place, worked out the first time they are needed. Nothing solid moves.
  var grids = {};

  function isSolid(place, x, y) {
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

  // Points to walk through from one spot to another in a place, going around everything solid.
  // If the spot cannot be reached (inside furniture, in the water, off the map), the way ends at the
  // closest spot that can. If the character starts on something solid, it first steps off it.
  function find(place, fromX, fromY, toX, toY) {
    var g = grid(place);
    var startFree = !!g[cellOf(fromX, fromY)];
    var start = startFree ? cellOf(fromX, fromY) : closest(fromX, fromY, function (i) { return g[i]; });
    if (start < 0) return [];
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
    return way.slice(1).map(function (p) { return { x: p.x, y: p.y }; });
  }

  // The closest spot of a place where a character may stand (the same spot if it is free).
  function free(place, x, y) {
    var g = grid(place);
    if (g[cellOf(x, y)] && !isSolid(place, x, y)) return { x: x, y: y };
    var i = closest(x, y, function (k) { return g[k]; });
    return i < 0 ? { x: x, y: y } : center(i);
  }

  return { find: find, free: free };
})();
