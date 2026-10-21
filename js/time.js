// The game clock: counts the days and the hours, and says how dark the world is.
// It stops while the game is paused.
var Time = (function () {
  var K = CONFIG.clock;
  var day = K.startDay;
  var minute = K.startMinute;

  function update(dt) {
    if (Needs.isPaused()) return;
    minute += dt * K.speed * 1440 / K.dayLength;
    while (minute >= 1440) {
      minute -= 1440;
      day += 1;
    }
  }

  function isDay() {
    return minute >= K.dayStart && minute < K.nightStart;
  }

  // Smooth step from 0 to 1, so the light changes softly.
  function ease(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  // How dark the world is: 0 by day, 1 at night, in between at dusk and dawn.
  function darkness() {
    if (minute >= K.duskStart && minute < K.duskEnd) return ease((minute - K.duskStart) / (K.duskEnd - K.duskStart));
    if (minute >= K.dawnStart && minute < K.dawnEnd) return 1 - ease((minute - K.dawnStart) / (K.dawnEnd - K.dawnStart));
    return isDay() ? 0 : 1;
  }

  // How much faster Energía drains right now.
  function energyFactor() {
    return isDay() ? 1 : K.nightEnergy;
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  // "Día N · HH:MM" with a sun or a moon.
  function text() {
    var m = Math.floor(minute);
    return (isDay() ? "☀️" : "🌙") + " Día " + day + " · " + pad(Math.floor(m / 60)) + ":" + pad(m % 60);
  }

  function get() {
    return { day: day, minute: minute };
  }

  // Used when loading a saved game. Anything strange is left as it was.
  function set(savedDay, savedMinute) {
    if (typeof savedDay === "number" && isFinite(savedDay) && savedDay >= 1) day = Math.floor(savedDay);
    if (typeof savedMinute === "number" && isFinite(savedMinute) && savedMinute >= 0 && savedMinute < 1440) minute = savedMinute;
  }

  return { update: update, isDay: isDay, darkness: darkness, energyFactor: energyFactor, text: text, get: get, set: set };
})();
