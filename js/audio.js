// Sounds and music made with code, with the browser's own audio (Web Audio): no sound files.
// Short effects (buttons, coins, garden, fishing, cooking, gifts, friendship and Krohna's meow),
// soft place sounds (in the city the river, birds by day, crickets by night and the campfire; in the Pradera birds and
// a soft buzz of bees by day and crickets by night; in the Lago soft little waves, birds by day and crickets by night;
// in the house the tele while someone watches it) and calm music that turns softer at night.
// A soft chime when a zone of the Mapa del valle is found. In the Lago the ducks' soft "cuac" and Pacífica's short song.
// The weather (js/weather.js): soft rain outside, softer and lower in the house like rain on the roof, and no birds
// while it rains; with snow, the place sounds are a little softer.
// Nothing sounds until "Jugar" is tapped. The 🔊 button goes 🔊 everything → 🎵 no music (effects only) → 🔇 silence,
// and the mode is remembered (localStorage inside try/catch). Pausa hushes the place sounds and the music.
// The campfire crackles louder the closer the selected one is to it. When the tab is hidden or the window is minimized,
// everything goes quiet; coming back, it all goes on as the 🔊 button says.
// If the browser has no Web Audio, the game just stays quiet.
var Sound = (function () {
  var K = CONFIG.sound;
  var MODES = ["all", "effects", "mute"];
  var ICONS = { all: "🔊", effects: "🎵", mute: "🔇" };
  var NAMES = { all: "Todo", effects: "Solo música apagada", mute: "Silencio" };

  var ac = null;
  var master, effectsBus, ambienceBus, musicBus, noise;
  var river, waves, tv, tvVoice, tvFilter, rain, rainFilter;
  var mode = loadMode();
  // The last volume asked of each group, so each one is only changed when it needs to.
  var levels = {};
  var timers = { bird: 2, cricket: 1, fire: 0.3, trickle: 1.5, buzz: 1, tv: 0, meow: between(K.meow.min, K.meow.max) };

  function between(min, max) {
    return min + Math.random() * (max - min);
  }

  function loadMode() {
    try {
      var saved = window.localStorage.getItem(CONFIG.save.soundKey);
      if (MODES.indexOf(saved) >= 0) return saved;
    } catch (e) {
      // Nothing remembered; everything sounds.
    }
    return "all";
  }

  function saveMode() {
    try {
      window.localStorage.setItem(CONFIG.save.soundKey, mode);
    } catch (e) {
      // Not remembered this time; the game goes on.
    }
  }

  // ---------- Building blocks ----------

  // One note: a soft start and a fading end, gliding to "endFreq" if there is one.
  function note(out, freq, start, length, type, volume, endFreq) {
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + length);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain);
    gain.connect(out);
    osc.start(start);
    osc.stop(start + length + 0.05);
  }

  // A little burst of noise through a filter: splashes, crackles and sizzles.
  function hiss(out, start, length, filterType, freq, volume, endFreq, q) {
    var src = ac.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    var filter = ac.createBiquadFilter();
    filter.type = filterType;
    filter.Q.value = q || 1;
    filter.frequency.setValueAtTime(freq, start);
    if (endFreq) filter.frequency.exponentialRampToValueAtTime(endFreq, start + length);
    var gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.02, length / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    src.start(start, Math.random() * 1.5);
    src.stop(start + length + 0.05);
  }

  // A bell: a clear tone with a higher, quicker ring on top.
  function bell(out, freq, start, volume) {
    note(out, freq, start, 1.1, "sine", volume);
    note(out, freq * 2.76, start, 0.35, "sine", volume * 0.25);
  }

  function freqOf(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // ---------- Effects ----------

  var SPARKLE_NOTES = [84, 86, 88, 91, 93, 96];

  var EFFECTS = {
    pling: function (t) {
      note(effectsBus, 1318.5, t, 0.18, "sine", 0.4);
      note(effectsBus, 2637, t, 0.08, "sine", 0.08);
    },
    cling: function (t) {
      note(effectsBus, 1568, t, 0.2, "triangle", 0.35);
      note(effectsBus, 2093, t + 0.07, 0.35, "triangle", 0.35);
      note(effectsBus, 4186, t + 0.07, 0.2, "sine", 0.06);
    },
    splash: function (t) {
      hiss(effectsBus, t, 0.45, "bandpass", 2400, 0.5, 500, 0.8);
      for (var i = 0; i < 4; i++) {
        var f = between(900, 1800);
        note(effectsBus, f, t + 0.08 + i * 0.07, 0.08, "sine", 0.18, f * 1.6);
      }
    },
    blup: function (t) {
      note(effectsBus, 260, t, 0.14, "sine", 0.5, 720);
      note(effectsBus, 380, t + 0.13, 0.12, "sine", 0.4, 980);
    },
    bell: function (t) {
      bell(effectsBus, 1318.5, t, 0.3);
      bell(effectsBus, 1760, t + 0.12, 0.3);
      bell(effectsBus, 2637, t + 0.24, 0.2);
    },
    sizzle: function (t) {
      hiss(effectsBus, t, 1.1, "highpass", 3500, 0.18);
      for (var i = 0; i < 10; i++) {
        hiss(effectsBus, t + Math.random() * 1.0, 0.03, "bandpass", between(2000, 5000), 0.4, null, 2);
      }
    },
    sparkle: function (t) {
      for (var i = 0; i < 7; i++) {
        var m = SPARKLE_NOTES[Math.floor(Math.random() * SPARKLE_NOTES.length)];
        note(effectsBus, freqOf(m), t + i * 0.065, 0.3, "sine", 0.22);
      }
    },
    // A soft chime going up, for "🗺️ ¡Zona descubierta!".
    discover: function (t) {
      [67, 72, 76, 79].forEach(function (m, i) {
        note(effectsBus, freqOf(m), t + i * 0.16, 0.7, "sine", 0.18);
        note(effectsBus, freqOf(m + 12), t + i * 0.16, 0.3, "sine", 0.04);
      });
    },
    fanfare: function (t) {
      [72, 76, 79].forEach(function (m, i) {
        note(effectsBus, freqOf(m), t + i * 0.13, 0.22, "triangle", 0.35);
      });
      note(effectsBus, freqOf(84), t + 0.39, 0.8, "triangle", 0.4);
      note(effectsBus, freqOf(88), t + 0.39, 0.8, "sine", 0.15);
    },
    // A soft "cuac": a short nasal tone that drops a little, through a filter, twice.
    quack: function (t) {
      [0, 0.22].forEach(function (d) {
        var osc = ac.createOscillator(), filter = ac.createBiquadFilter(), gain = ac.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(420, t + d);
        osc.frequency.linearRampToValueAtTime(330, t + d + 0.14);
        filter.type = "bandpass";
        filter.Q.value = 4;
        filter.frequency.value = 1100;
        gain.gain.setValueAtTime(0.0001, t + d);
        gain.gain.exponentialRampToValueAtTime(0.12, t + d + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.16);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(effectsBus);
        osc.start(t + d);
        osc.stop(t + d + 0.2);
      });
    },
    // Pacífica's song: a short, soft melody that floats up and down, with a little shimmer.
    song: function (t) {
      [[76, 0], [79, 0.32], [83, 0.64], [81, 0.96], [79, 1.28], [76, 1.6], [74, 1.92], [76, 2.3]].forEach(function (n) {
        var f = freqOf(n[0]);
        note(effectsBus, f, t + n[1], n[1] >= 2.3 ? 1.1 : 0.55, "sine", 0.12);
        note(effectsBus, f * 2, t + n[1], 0.25, "sine", 0.025);
      });
    },
    // A small, soft "miau": the pitch goes up and down through a filter that opens and closes like a mouth.
    meow: function (t) {
      var osc = ac.createOscillator(), filter = ac.createBiquadFilter(), gain = ac.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.linearRampToValueAtTime(800, t + 0.18);
      osc.frequency.linearRampToValueAtTime(560, t + 0.55);
      filter.type = "bandpass";
      filter.Q.value = 3;
      filter.frequency.setValueAtTime(900, t);
      filter.frequency.linearRampToValueAtTime(1800, t + 0.2);
      filter.frequency.linearRampToValueAtTime(1000, t + 0.55);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.06);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(effectsBus);
      osc.start(t);
      osc.stop(t + 0.65);
    }
  };

  // Play an effect right now (nothing in silence or before "Jugar").
  function play(name) {
    if (!ac || mode === "mute") return;
    EFFECTS[name](ac.currentTime + 0.01);
  }

  // Play an effect only if it happens where the screen is.
  function playAt(place, name) {
    if (place === Sims.viewPlace()) play(name);
  }

  // ---------- Start ----------

  // Called when "Jugar" is tapped: browsers only let sound start after a tap.
  function start() {
    if (ac) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      ac = new Ctx();
      if (ac.resume) ac.resume();
      master = ac.createGain();
      master.gain.value = K.master;
      master.connect(ac.destination);
      effectsBus = bus();
      ambienceBus = bus();
      musicBus = bus();

      // Two seconds of noise, used by the river, the tele, splashes and crackles.
      noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      var data = noise.getChannelData(0);
      for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      river = loopRiver();
      waves = loopWaves();
      loopTv();
      loopRain();
      apply();
      document.addEventListener("visibilitychange", hush);
      hush();
    } catch (e) {
      ac = null;
    }
  }

  // Another tab or a minimized window: no sound at all (the loops of the river and the tele stop too).
  // Back on the game, the sound goes on.
  function hush() {
    var hidden = document.hidden;
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.setValueAtTime(hidden ? 0 : K.master, ac.currentTime);
    if (hidden && ac.suspend) ac.suspend();
    if (!hidden && ac.resume) ac.resume();
  }

  function bus() {
    var gain = ac.createGain();
    gain.gain.value = 0;
    gain.connect(master);
    return gain;
  }

  // The river: soft low noise that swells and calms slowly, like a murmur.
  function loopRiver() {
    var src = ac.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    var filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 650;
    var wave = ac.createOscillator();
    wave.frequency.value = 0.13;
    var depth = ac.createGain();
    depth.gain.value = 220;
    wave.connect(depth);
    depth.connect(filter.frequency);
    var gain = ac.createGain();
    gain.gain.value = 0;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ambienceBus);
    src.start();
    wave.start();
    return gain;
  }

  // The little waves of the Lago: soft low noise that swells and calms slowly, like water coming to the shore.
  function loopWaves() {
    var src = ac.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    var filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    var gain = ac.createGain();
    gain.gain.value = 0;
    var swell = ac.createGain();
    swell.gain.value = 0.5;
    var wave = ac.createOscillator();
    wave.frequency.value = 0.12;
    var depth = ac.createGain();
    depth.gain.value = 0.45;
    wave.connect(depth);
    depth.connect(swell.gain);
    src.connect(filter);
    filter.connect(swell);
    swell.connect(gain);
    gain.connect(ambienceBus);
    src.start();
    wave.start();
    return gain;
  }

  // The rain: noise without its lowest part, through a filter that is open in the city and lower in the house.
  function loopRain() {
    var src = ac.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    var low = ac.createBiquadFilter();
    low.type = "highpass";
    low.frequency.value = 400;
    rainFilter = ac.createBiquadFilter();
    rainFilter.type = "lowpass";
    rainFilter.frequency.value = 5000;
    rain = ac.createGain();
    rain.gain.value = 0;
    src.connect(low);
    low.connect(rainFilter);
    rainFilter.connect(rain);
    rain.connect(ambienceBus);
    src.start();
  }

  // The tele: muffled voices, made from noise whose loudness and tone change like syllables.
  function loopTv() {
    var src = ac.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    tvFilter = ac.createBiquadFilter();
    tvFilter.type = "bandpass";
    tvFilter.frequency.value = 1000;
    tvFilter.Q.value = 2;
    tvVoice = ac.createGain();
    tvVoice.gain.value = 0;
    tv = ac.createGain();
    tv.gain.value = 0;
    src.connect(tvFilter);
    tvFilter.connect(tvVoice);
    tvVoice.connect(tv);
    tv.connect(ambienceBus);
    src.start();
  }

  // ---------- Volumes ----------

  // Glide a volume to a new level, only when it changes.
  function glide(key, param, value) {
    if (levels[key] === value) return;
    levels[key] = value;
    param.setTargetAtTime(value, ac.currentTime, K.fade / 3);
  }

  // The volume of each group, from the mode, the pause and the time of day. With snow the place sounds are softer.
  function apply() {
    if (!ac) return;
    var paused = Needs.isPaused();
    var night = Time.darkness() >= 0.5;
    var hush = 1 - K.snowHush * Weather.snowLevel();
    glide("effects", effectsBus.gain, mode === "mute" ? 0 : K.effects);
    glide("ambience", ambienceBus.gain, mode === "mute" || paused ? 0 : Math.round(K.ambience * hush * 1000) / 1000);
    glide("music", musicBus.gain, mode !== "all" || paused ? 0 : (night ? K.music.night : K.music.day));
  }

  // The 🔊 button: next mode, remembered for next time.
  function nextMode() {
    mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
    saveMode();
    apply();
    return mode;
  }

  // ---------- Place sounds ----------

  function chirp(t) {
    var base = between(2600, 3800);
    var count = 2 + Math.floor(Math.random() * 3);
    for (var i = 0; i < count; i++) {
      var f = base * between(0.9, 1.15);
      note(ambienceBus, f, t + i * 0.09, 0.08, "sine", 0.22, f * 1.25);
    }
  }

  // A bee going by: a soft low buzz that comes and goes, through a filter.
  function buzz(t) {
    var length = between(0.8, 1.6);
    var osc = ac.createOscillator(), filter = ac.createBiquadFilter(), gain = ac.createGain();
    osc.type = "sawtooth";
    var f = between(190, 240);
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.linearRampToValueAtTime(f * between(0.9, 1.12), t + length);
    filter.type = "lowpass";
    filter.frequency.value = 700;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.05, t + length * 0.4);
    gain.gain.linearRampToValueAtTime(0.0001, t + length);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ambienceBus);
    osc.start(t);
    osc.stop(t + length + 0.05);
  }

  function cricket(t) {
    var f = between(4200, 4700);
    for (var i = 0; i < 3; i++) note(ambienceBus, f, t + i * 0.055, 0.035, "sine", 0.1);
  }

  // How loud the campfire is, from 1 right by it to 0 far away: measured from the selected one when it is in the city,
  // else from the middle of the city.
  function fireLevel() {
    var sim = Sims.selectedSim();
    var from = sim && sim.place === "city" ? sim : { x: CONFIG.world.width / 2, y: CONFIG.world.height / 2 };
    var fire = CONFIG.cityObjects.filter(function (o) { return o.id === "campfire"; })[0];
    var dx = from.x - (fire.x + fire.w / 2), dy = from.y - (fire.y + fire.h / 2);
    var d = Math.sqrt(dx * dx + dy * dy);
    var t = Math.max(0, Math.min(1, (d - K.fire.near) / (K.fire.far - K.fire.near)));
    return (1 - t) * (1 - t);
  }

  // Random sounds of the place, each with its own little timer.
  function ambience(dt, place, night) {
    var city = place === "city", meadow = place === "meadow", lake = place === "lake", outside = city || meadow || lake;
    glide("river", river.gain, city ? 0.55 : 0);
    glide("waves", waves.gain, lake ? 0.6 : 0);
    var wet = Weather.rainLevel();
    glide("rain", rain.gain, Math.round(wet * (outside ? K.rain.city : K.rain.house) * 100) / 100);
    glide("rainTone", rainFilter.frequency, outside ? 5000 : 900);
    var watching = place === "house" && Objects.isWatchingTv();
    glide("tv", tv.gain, watching ? 0.5 : 0);
    var t = ac.currentTime + 0.02;
    for (var key in timers) {
      if (key !== "meow") timers[key] -= dt;
    }
    if (watching && timers.tv <= 0) {
      timers.tv = between(0.08, 0.2);
      tvVoice.gain.setTargetAtTime(Math.random() < 0.2 ? 0.05 : between(0.4, 1), t, 0.03);
      tvFilter.frequency.setTargetAtTime(between(600, 1600), t, 0.04);
    }
    if (meadow || lake) {
      if (!night && wet === 0 && timers.bird <= 0) {
        timers.bird = between(1.5, 5);
        chirp(t);
      }
      if (meadow && !night && timers.buzz <= 0) {
        timers.buzz = between(2, 5);
        buzz(t);
      }
      if (night && timers.cricket <= 0) {
        timers.cricket = between(0.6, 1.4);
        cricket(t);
      }
      return;
    }
    if (!city) return;
    if (timers.trickle <= 0) {
      timers.trickle = between(1, 3);
      var f = between(500, 900);
      note(ambienceBus, f, t, 0.1, "sine", 0.06, f * 1.8);
    }
    var fire = fireLevel();
    if (timers.fire <= 0) {
      timers.fire = between(0.08, 0.6);
      if (fire > 0.01) hiss(ambienceBus, t, between(0.015, 0.04), "bandpass", between(1500, 4000), between(0.05, 0.15) * fire, null, 1.5);
    }
    if (!night && wet === 0 && timers.bird <= 0) {
      timers.bird = between(1.5, 5);
      chirp(t);
    }
    if (night && timers.cricket <= 0) {
      timers.cricket = between(0.6, 1.4);
      cricket(t);
    }
  }

  // Krohna meows softly now and then while it is where the selected one is.
  function meows(dt) {
    var sim = Sims.selectedSim();
    if (!sim || Pet.place() !== sim.place) return;
    timers.meow -= dt;
    if (timers.meow > 0) return;
    timers.meow = between(K.meow.min, K.meow.max);
    play("meow");
  }

  // ---------- Music ----------

  // Two bars per chord, eight steps per bar. Each chord: its notes (low to high), as MIDI numbers.
  var CHORDS = [[48, 55, 64, 71], [45, 52, 60, 67], [41, 48, 57, 64], [43, 50, 59, 64]];
  // Two melodies over the four chords (null is a rest), and the order they come in; "pad" is only the soft chords.
  var MELODIES = {
    a: [
      [76, null, 79, null, 81, null, 79, null, 76, null, null, null, 74, null, 72, null],
      [72, null, 76, null, 79, null, 81, null, 84, null, null, null, 81, null, null, null],
      [81, null, 79, null, 77, null, 76, null, 72, null, 74, null, 76, null, null, null],
      [74, null, 79, null, 83, null, 81, null, 79, null, null, null, null, null, null, null]
    ],
    b: [
      [84, null, null, null, 83, null, 79, null, 76, null, 79, null, null, null, null, null],
      [81, null, null, null, 79, null, 76, null, 72, null, 76, null, 79, null, null, null],
      [77, null, 81, null, 84, null, null, null, 81, null, 79, null, 77, null, 76, null],
      [74, null, null, null, 71, null, 74, null, 79, null, null, null, null, null, null, null]
    ]
  };
  var SONG = ["a", "b", "a", "pad"];
  var music = { next: 0, step: 0, part: 0, night: false };

  // A music box note: a clear tone with a soft shine an octave up.
  function musicBox(freq, t, volume) {
    note(musicBus, freq, t, 1.4, "sine", volume);
    note(musicBus, freq * 2, t, 0.45, "sine", volume * 0.2);
  }

  // Soft held chord: two slightly different tones per note, through a filter, fading in and out.
  function pad(chord, t, length, night) {
    var filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = night ? 600 : 1000;
    var gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.09, t + length * 0.25);
    gain.gain.linearRampToValueAtTime(0.07, t + length * 0.75);
    gain.gain.linearRampToValueAtTime(0.0001, t + length + 0.4);
    filter.connect(gain);
    gain.connect(musicBus);
    chord.forEach(function (m) {
      [-4, 4].forEach(function (cents) {
        var osc = ac.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = freqOf(m);
        osc.detune.value = cents;
        osc.connect(filter);
        osc.start(t);
        osc.stop(t + length + 0.5);
      });
    });
  }

  // Plan the next notes a little ahead of time, so they sound right on the beat.
  // At night it goes slower, without the arpeggio, with fewer melody notes an octave lower and darker chords.
  function scheduleMusic(night) {
    var now = ac.currentTime;
    if (music.next < now) music.next = now + 0.1;
    while (music.next < now + 0.5) {
      var t = music.next;
      var chordIndex = Math.floor(music.step / 16);
      var inChord = music.step % 16;
      if (inChord === 0) music.night = night;
      var tempo = music.night ? K.tempo.night : K.tempo.day;
      var chord = CHORDS[chordIndex];
      var part = SONG[music.part];
      if (inChord === 0) {
        pad(chord, t, tempo * 16, music.night);
        note(musicBus, freqOf(chord[0] - 12), t, tempo * 8, "sine", 0.25);
      }
      if (!music.night && part !== "pad" && inChord % 4 === 2) {
        musicBox(freqOf(chord[1 + (inChord / 4 | 0) % 3] + 12), t, 0.06);
      }
      var m = part === "pad" ? null : MELODIES[part][chordIndex][inChord];
      if (m !== null && (!music.night || inChord % 4 === 0)) {
        musicBox(freqOf(music.night ? m - 12 : m), t, music.night ? 0.22 : 0.28);
      }
      music.next += tempo;
      music.step += 1;
      if (music.step >= 64) {
        music.step = 0;
        music.part = (music.part + 1) % SONG.length;
      }
    }
  }

  // ---------- Every frame ----------

  function update(dt) {
    if (!ac) return;
    apply();
    // Pausa: no place sounds and no music; when it goes on, the music starts fresh on a new chord.
    if (Needs.isPaused()) {
      music.next = 0;
      music.step -= music.step % 16;
      return;
    }
    var night = Time.darkness() >= 0.5;
    ambience(dt, Sims.viewPlace(), night);
    meows(dt);
    if (mode === "all") {
      scheduleMusic(night);
    } else {
      music.next = 0;
    }
  }

  return {
    start: start,
    update: update,
    play: play,
    playAt: playAt,
    nextMode: nextMode,
    mode: function () { return mode; },
    icon: function () { return ICONS[mode]; },
    name: function () { return NAMES[mode]; }
  };
})();
