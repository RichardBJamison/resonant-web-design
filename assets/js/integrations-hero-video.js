(function () {
  var video = document.getElementById('integrations-hero-video');
  if (!video) return;

  var CRUISE = 0.088;
  var EASE_MAX = 0.0304;
  var EASE = 4;
  var MINRATE = 0.0048;
  var HOLD_MS = 2000;
  var TURN_EPS = 0.08;
  var boom = 0;
  var half = 0;
  var active = false;
  var holding = false;
  var lastT = -1;
  var hasStarted = false;

  function play() {
    if (holding) return;
    var promise = video.play();
    if (promise && promise.catch) promise.catch(function () {});
  }

  function rateForDistance(distance) {
    if (distance < EASE) {
      var u = distance / EASE;
      return MINRATE + (EASE_MAX - MINRATE) * u * u;
    }
    return CRUISE;
  }

  function applyRate() {
    if (!active || half <= 0 || holding) return;
    var t = video.currentTime;
    var distance = Math.min(t, Math.abs(t - half), boom - t);
    var rate = rateForDistance(distance);
    if (Math.abs(video.playbackRate - rate) > 0.0005) {
      video.playbackRate = rate;
    }
  }

  function beginHold(turn) {
    if (holding) return;
    holding = true;
    video.pause();

    window.setTimeout(function () {
      holding = false;
      if (turn === 'mid') {
        video.currentTime = Math.min(half + 0.12, boom - 0.02);
      } else {
        video.currentTime = 0.12;
      }
      video.playbackRate = EASE_MAX;
      applyRate();
      play();
    }, HOLD_MS);
  }

  function checkTurnaroundHold() {
    if (!active || half <= 0 || holding) return;

    var t = video.currentTime;

    if (!hasStarted) {
      if (t > 0.2) {
        hasStarted = true;
      } else {
        lastT = t;
        return;
      }
    }

    if (lastT < 0) {
      lastT = t;
      return;
    }

    if (lastT < half - TURN_EPS && t >= half - TURN_EPS) {
      video.currentTime = half;
      beginHold('mid');
      lastT = t;
      return;
    }

    if (lastT > boom - 0.3 && t < TURN_EPS + 0.1) {
      beginHold('start');
      lastT = t;
      return;
    }

    lastT = t;
  }

  function setup() {
    if (active) return true;
    boom = video.duration;
    if (!boom || !isFinite(boom)) return false;
    half = boom / 2;
    active = true;
    lastT = -1;
    hasStarted = false;
    video.playbackRate = EASE_MAX;
    applyRate();
    play();
    return true;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.playbackRate = 1;
    play();
    return;
  }

  ['loadedmetadata', 'loadeddata', 'canplay'].forEach(function (eventName) {
    video.addEventListener(eventName, setup);
  });

  if (video.readyState >= 1) setup();

  requestAnimationFrame(function loop() {
    checkTurnaroundHold();
    applyRate();
    requestAnimationFrame(loop);
  });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && !holding) play();
  });
  window.addEventListener('pageshow', function () {
    if (!holding) play();
  });
})();