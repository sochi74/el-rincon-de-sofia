// Professor Hoot's word of the day and the 📖 Diario de palabras.
// With Sofía or real.fixer selected in the city, "📖 Palabra del día" in the social menu of Professor Hoot sends the one
// selected to him: they look at each other, he says the word and an example (in English, with Spanish subtitles), and a
// little window asks what it means, with 3 answers. The right one gives magic coins; either way the word goes to the Diario.
// Once per day of the game; the words go in order (LESSON_WORDS in js/words.js), one per day he teaches, and start again
// after the last one. The chalkboard by his hollow tree (js/city.js) shows the word of today.
// The Diario keeps the words he taught ("🎓 Del profe") and the ones found by passing the mouse (or a finger) over things
// ("🔍 Descubiertas"); the first time a word shows up, "📖 ¡Palabra nueva!" floats by the cursor.
// The Diario is saved apart from the game, so "Reiniciar" does not forget it. Every use of localStorage is inside try/catch.
// Pausa freezes the lesson (the question can still be answered).
var Lessons = (function () {
  var K = CONFIG.lessons;
  var N = LESSON_WORDS.length;

  // Where the list is: the next word to teach, the day of the game the last one was taught (0 = never),
  // and which word that was.
  var state = { next: 0, day: 0, word: 0 };

  // The lesson going on, or null:
  // { sim, hoot, index, phase: "approach" | "word" | "example" | "quiz" | "answer", elapsed, answer }
  var lesson = null;

  // The Diario: the English words Professor Hoot taught, and the words found, as { es, en, say }; the newest last.
  var diary = { teacher: [], found: [] };
  // The English words already in it, to know fast whether a word is new.
  var known = {};

  // "+10 🪙" floating over the one who answered right: { sim, age }.
  var coinPops = [];

  var quiz, quizText, quizButtons;
  var diaryButton, diaryPanel, diaryList, diaryCount, diaryShown = null;

  function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function init() {
    loadDiary();

    // The question window, with its 3 answers (made each time it opens).
    quiz = document.createElement("div");
    quiz.id = "lesson-quiz";
    quiz.hidden = true;
    quizText = document.createElement("p");
    quizButtons = document.createElement("div");
    quizButtons.className = "lesson-answers";
    quiz.appendChild(quizText);
    quiz.appendChild(quizButtons);
    document.body.appendChild(quiz);

    // The "📖 Diario" button, after "🌟 Metas" in the panel, with "Diario · diary" next to the mouse.
    diaryButton = document.createElement("button");
    diaryButton.type = "button";
    diaryButton.id = "diary-button";
    diaryButton.textContent = "📖 Diario";
    var goalsButton = document.getElementById("goals-button");
    goalsButton.parentNode.insertBefore(diaryButton, goalsButton.nextSibling);
    diaryButton.addEventListener("click", function () { setDiaryOpen(diaryPanel.hidden); });
    UI.bindWord(diaryButton, "diary");
    // The goals window and the backpack take turns with the Diario.
    goalsButton.addEventListener("click", function () { setDiaryOpen(false); });

    diaryPanel = document.createElement("div");
    diaryPanel.id = "diary";
    diaryPanel.hidden = true;
    var top = document.createElement("div");
    top.className = "backpack-top";
    var title = document.createElement("b");
    title.textContent = "📖 Diario de palabras";
    var close = document.createElement("button");
    close.type = "button";
    close.id = "diary-close";
    close.setAttribute("aria-label", "Cerrar el diario");
    close.textContent = "✕";
    close.addEventListener("click", function () { setDiaryOpen(false); });
    top.appendChild(title);
    top.appendChild(close);
    diaryCount = document.createElement("div");
    diaryCount.className = "diary-count";
    diaryList = document.createElement("div");
    diaryList.id = "diary-list";
    diaryPanel.appendChild(top);
    diaryPanel.appendChild(diaryCount);
    diaryPanel.appendChild(diaryList);
    document.body.appendChild(diaryPanel);
  }

  // ---------- The word of the day ----------

  function today() {
    return Time.get().day;
  }

  function doneToday() {
    return state.day === today();
  }

  // The word of today: the one taught today, or the next one to teach.
  function todayIndex() {
    return doneToday() ? state.word : state.next;
  }

  // What the chalkboard says.
  function boardWord() {
    return LESSON_WORDS[todayIndex()].en;
  }

  // For the social menu of Professor Hoot: whether today's word was already done.
  function menuOption() {
    return { done: doneToday() };
  }

  function isInvolved(id) {
    return !!lesson && (lesson.sim.data.id === id || lesson.hoot.data.id === id);
  }

  // The one selected walks to Professor Hoot (who waits) to learn the word of today. If they are using something, they leave it.
  function start(sim, hoot) {
    if (lesson || doneToday() || sim.place !== "city" || hoot.inside) return;
    var hootId = hoot.data.id;
    if (Social.isInvolved(hootId) || Gifts.isInvolved(hootId)) return;
    var id = sim.data.id;
    Social.cancel(id);
    Objects.cancel(id);
    Garden.cancel(id);
    Gather.cancel(id);
    Cooking.cancel(id);
    Gifts.cancel(id);
    var side = sim.x <= hoot.x ? -1 : 1;
    var spot = Path.free("city", hoot.x + side * CONFIG.social.gap * 2, hoot.y);
    Sims.walkTo(sim, spot.x, spot.y);
    lesson = { sim: sim, hoot: hoot, index: state.next, phase: "approach", elapsed: 0, answer: null };
  }

  // Stop the lesson if this character is in it. The word is not done yet unless it was already answered.
  function cancel(id) {
    if (!isInvolved(id)) return false;
    end();
    return true;
  }

  function end() {
    lesson = null;
    quiz.hidden = true;
  }

  // Longer lines stay a little longer, like in a chat.
  function lineTime(phrase) {
    var s = CONFIG.social;
    return Math.min(s.lineMax, s.lineMin + phrase.text.length * s.lineExtraPerLetter);
  }

  // What Professor Hoot says in each part of the lesson.
  function line() {
    var w = LESSON_WORDS[lesson.index];
    if (lesson.phase === "word") return { text: "Today's word is: " + w.en + "!", subtitle: "¡La palabra de hoy es: " + w.en + "!" };
    if (lesson.phase === "example") return w.example;
    if (lesson.phase === "answer") {
      return lesson.answer ? { text: "Great job!", subtitle: "¡Muy bien!" } :
        { text: "Almost! It means " + w.es + ".", subtitle: "¡Casi! Significa " + w.es + "." };
    }
    return null;
  }

  function update(dt) {
    if (!Needs.isPaused()) {
      coinPops.forEach(function (p) { p.age += dt; });
      coinPops = coinPops.filter(function (p) { return p.age < K.popTime; });
    }
    if (!diaryPanel.hidden) renderDiary();
    if (!lesson) return;
    // Going home, or Professor Hoot going in to sleep, ends it.
    if (lesson.sim.place !== "city" || lesson.hoot.inside) {
      end();
      return;
    }
    if (lesson.phase === "quiz" && !quiz.hidden) placeQuiz();
    if (Needs.isPaused()) return;
    if (lesson.phase === "approach") {
      if (lesson.sim.path.length > 0) return;
      Sims.face(lesson.sim, lesson.hoot.x, lesson.hoot.y);
      Sims.face(lesson.hoot, lesson.sim.x, lesson.sim.y);
      lesson.phase = "word";
      lesson.elapsed = 0;
      return;
    }
    if (lesson.phase === "quiz") return;
    lesson.elapsed += dt;
    if (lesson.elapsed < lineTime(line())) return;
    lesson.elapsed = 0;
    if (lesson.phase === "word") {
      lesson.phase = "example";
    } else if (lesson.phase === "example") {
      lesson.phase = "quiz";
      openQuiz();
    } else {
      end();
    }
  }

  // "¿Qué significa 'happy'?" with the right meaning and 2 meanings of other words, in any order.
  function openQuiz() {
    var w = LESSON_WORDS[lesson.index];
    var others = LESSON_WORDS.filter(function (o) { return o !== w; });
    var choices = [w];
    while (choices.length < 3) {
      var o = randomItem(others);
      if (choices.indexOf(o) < 0) choices.push(o);
    }
    choices.sort(function () { return Math.random() - 0.5; });
    quizText.textContent = "¿Qué significa '" + w.en + "'?";
    quizButtons.textContent = "";
    choices.forEach(function (c) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = c.es;
      button.setAttribute("data-quiet", "");
      button.addEventListener("click", function () { answer(c === w); });
      quizButtons.appendChild(button);
    });
    quiz.hidden = false;
    placeQuiz();
  }

  // Like the "¡Meta cumplida!" sign: in the middle of the room the panel leaves.
  function placeQuiz() {
    UI.placeSign(quiz);
  }

  // The word is done for today and goes to the Diario; the right answer gives magic coins.
  function answer(right) {
    if (!lesson || lesson.phase !== "quiz") return;
    quiz.hidden = true;
    var w = LESSON_WORDS[lesson.index];
    state.word = lesson.index;
    state.next = (lesson.index + 1) % N;
    state.day = today();
    learn(w);
    lesson.answer = right;
    lesson.phase = "answer";
    lesson.elapsed = 0;
    if (right) {
      Coins.add(K.reward);
      coinPops.push({ sim: lesson.sim, age: 0 });
      Sound.play("cling");
    } else {
      Sound.play("pling");
    }
  }

  // Professor Hoot's line over his head, or null.
  function bubbleFor(id) {
    if (!lesson || lesson.hoot.data.id !== id) return null;
    var phrase = line();
    return phrase ? { text: phrase.text, subtitle: phrase.subtitle, heart: false, speech: true } : null;
  }

  // "+10 🪙" floating up over the one who answered right, only where the screen is.
  function draw(ctx) {
    coinPops.forEach(function (p) {
      if (p.sim.place !== Sims.viewPlace()) return;
      var t = p.age / K.popTime;
      var y = p.sim.y - 78 * CONFIG.characterScale - 30 - p.age * 18;
      ctx.save();
      ctx.globalAlpha = t > 0.7 ? (1 - t) / 0.3 : 1;
      ctx.font = "700 " + Math.round(24 * Math.min(1, p.age * 5)) + "px " + CONFIG.fontFamily;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";
      ctx.strokeStyle = CONFIG.colors.darkBrown;
      var text = "+" + K.reward + " 🪙";
      ctx.strokeText(text, p.sim.x, y);
      ctx.fillStyle = CONFIG.colors.cream;
      ctx.fillText(text, p.sim.x, y);
      ctx.restore();
    });
  }

  // ---------- The Diario ----------

  function keyOf(en) {
    return String(en).toLowerCase();
  }

  // A word Professor Hoot taught goes to the top of "Del profe" (and out of "Descubiertas").
  function learn(w) {
    var key = keyOf(w.en);
    diary.teacher = diary.teacher.filter(function (en) { return keyOf(en) !== key; });
    diary.teacher.push(w.en);
    diary.found = diary.found.filter(function (f) { return keyOf(f.en) !== key; });
    known[key] = true;
    saveDiary();
    diaryShown = null;
  }

  // A word tag showed up (js/ui.js): the first time a word shows up, it goes to "Descubiertas"
  // and "📖 ¡Palabra nueva!" floats near the spot on the screen. A neighbor's tag ("Lumi · fairy") gives its word ("Hada · fairy").
  function discover(word, x, y) {
    if (word && word.diary && WORDS[word.diary]) word = WORDS[word.diary];
    if (!word || !word.en) return;
    var key = keyOf(word.en);
    if (known[key]) return;
    known[key] = true;
    diary.found.push({ es: word.es, en: word.en, say: word.say });
    saveDiary();
    diaryShown = null;
    var pop = document.createElement("div");
    pop.className = "word-pop";
    pop.textContent = "📖 ¡Palabra nueva!";
    pop.style.left = x + "px";
    pop.style.top = (y - 10) + "px";
    document.body.appendChild(pop);
    window.setTimeout(function () {
      if (pop.parentNode) pop.parentNode.removeChild(pop);
    }, K.popTime * 1000);
  }

  // Open or close the Diario; the backpack and the goals window close when it opens.
  function setDiaryOpen(open) {
    diaryPanel.hidden = !open;
    diaryShown = null;
    if (open) {
      UI.closeBackpack();
      Goals.close();
      renderDiary();
      UI.placeWindow(diaryPanel);
    }
  }

  // The words of a section, the newest at the top: "Español · english (SAY)", and for the teacher's words their example
  // (with "Profesor · teacher" next to the mouse over their title).
  function renderDiary() {
    var key = diary.teacher.length + "|" + diary.found.length;
    if (key === diaryShown) return;
    diaryShown = key;
    var taught = diary.teacher.map(function (en) {
      return LESSON_WORDS.filter(function (w) { return w.en === en; })[0];
    }).filter(Boolean).reverse();
    var found = diary.found.slice().reverse();
    diaryCount.textContent = "Palabras aprendidas: " + (taught.length + found.length);
    diaryList.textContent = "";
    section("🎓 Del profe", taught, "Todavía no. ¡Visita a Professor Hoot en el bosque!", function (w, row) {
      var ex = document.createElement("div");
      ex.className = "diary-example";
      ex.textContent = "“" + w.example.text + "” (" + w.example.subtitle + ")";
      row.appendChild(ex);
    });
    section("🔍 Descubiertas", found, "Todavía no. ¡Pasa el mouse por las cosas!", null);
  }

  function section(title, words, empty, extra) {
    var head = document.createElement("div");
    head.className = "diary-section";
    head.textContent = title;
    if (extra) UI.bindWord(head, "teacher");
    diaryList.appendChild(head);
    if (words.length === 0) {
      var none = document.createElement("p");
      none.className = "backpack-empty";
      none.textContent = empty;
      diaryList.appendChild(none);
      return;
    }
    words.forEach(function (w) {
      var row = document.createElement("div");
      row.className = "diary-row";
      var name = document.createElement("div");
      var es = document.createElement("b");
      es.textContent = capital(w.es);
      var en = document.createElement("i");
      en.textContent = w.en;
      var say = document.createElement("span");
      say.className = "word-say";
      say.textContent = "(" + w.say + ")";
      name.appendChild(es);
      name.appendChild(document.createTextNode(" · "));
      name.appendChild(en);
      name.appendChild(document.createTextNode(" "));
      name.appendChild(say);
      row.appendChild(name);
      if (extra) extra(w, row);
      diaryList.appendChild(row);
    });
  }

  function capital(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // True if a spot on the screen is over the Diario or the question (so the word tag does not show what is under them).
  function covers(x, y) {
    return [diaryPanel, quiz].some(function (el) {
      if (el.hidden) return false;
      var r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
  }

  // ---------- Saving ----------

  function saveDiary() {
    try {
      window.localStorage.setItem(CONFIG.save.diaryKey, JSON.stringify(diary));
    } catch (e) {
      // Not saved this time; the game goes on.
    }
  }

  // Anything strange is left out.
  function loadDiary() {
    var saved = null;
    try {
      saved = JSON.parse(window.localStorage.getItem(CONFIG.save.diaryKey) || "null");
    } catch (e) {
      saved = null;
    }
    if (saved && typeof saved === "object") {
      if (Array.isArray(saved.teacher)) {
        diary.teacher = saved.teacher.filter(function (en, i, all) {
          return typeof en === "string" && LESSON_WORDS.some(function (w) { return w.en === en; }) && all.indexOf(en) === i;
        });
      }
      if (Array.isArray(saved.found)) {
        diary.found = saved.found.filter(function (f) {
          return f && typeof f.es === "string" && typeof f.en === "string" && typeof f.say === "string";
        }).map(asWord);
      }
    }
    diary.teacher.forEach(function (en) { known[keyOf(en)] = true; });
    var count = diary.found.length;
    diary.found = diary.found.filter(function (f) {
      var key = keyOf(f.en);
      if (known[key]) return false;
      known[key] = true;
      return true;
    });
    if (renamed || diary.found.length !== count) saveDiary();
  }

  // A Diario saved before keeps the neighbors' words as their tag ("Lumi · fairy"): they become their word ("Hada · fairy").
  var renamed = false;

  function asWord(f) {
    for (var id in WORDS) {
      var w = WORDS[id];
      if (w.diary && WORDS[w.diary] && w.es === f.es && keyOf(w.en) === keyOf(f.en)) {
        renamed = true;
        var word = WORDS[w.diary];
        return { es: word.es, en: word.en, say: word.say };
      }
    }
    return f;
  }

  // The place in the list of words, saved with the game.
  function get() {
    return { next: state.next, day: state.day, word: state.word };
  }

  // Used when loading a saved game. An old saved game starts from the first word.
  function set(saved) {
    if (!saved || typeof saved !== "object") return;
    function index(v) {
      return typeof v === "number" && isFinite(v) ? ((Math.floor(v) % N) + N) % N : 0;
    }
    state = {
      next: index(saved.next),
      day: typeof saved.day === "number" && isFinite(saved.day) ? Math.max(0, Math.floor(saved.day)) : 0,
      word: index(saved.word)
    };
  }

  return {
    init: init,
    start: start,
    cancel: cancel,
    isInvolved: isInvolved,
    update: update,
    bubbleFor: bubbleFor,
    draw: draw,
    boardWord: boardWord,
    menuOption: menuOption,
    discover: discover,
    covers: covers,
    closeDiary: function () { setDiaryOpen(false); },
    get: get,
    set: set
  };
})();
