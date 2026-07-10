(function () {
  var v = document.getElementById("integrations-hero-video");
  if (!v) return;

  var CRUISE = 0.65, EASE = 4, MINRATE = 0.04;
  var HOLD_MS = 3000;
  var HOLD_DIST = 0.08;
  var BOOM = 0, D = 0;
  var holding = false;
  var holdTimer = null;
  var holdLatch = { start: false, mid: false, end: false };

  function smoothstep(x) {
    if (x < 0) x = 0; else if (x > 1) x = 1;
    return x * x * (3 - 2 * x);
  }

  function setRate(rate) {
    try {
      v.playbackRate = rate;
    } catch (error) {
      v.playbackRate = Math.max(0.0625, rate);
    }
  }

  function play() {
    if (holding) return;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  function clearHoldTimer() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  function resetLatches() {
    holdLatch.start = false;
    holdLatch.mid = false;
    holdLatch.end = false;
  }

  function beginHold() {
    if (holding) return true;
    holding = true;
    clearHoldTimer();
    v.pause();
    holdTimer = window.setTimeout(function () {
      holdTimer = null;
      holding = false;
      setRate(MINRATE);
      play();
    }, HOLD_MS);
    return true;
  }

  function maybeHold(t) {
    if (holding || !BOOM) return false;

    var d = Math.min(t, Math.abs(t - D), BOOM - t);
    if (d > HOLD_DIST) return false;

    if (!holdLatch.start && t < 0.5) {
      holdLatch.start = true;
      return beginHold();
    }

    if (!holdLatch.mid && Math.abs(t - D) < 0.5) {
      holdLatch.mid = true;
      return beginHold();
    }

    if (!holdLatch.end && BOOM - t < 0.5) {
      holdLatch.end = true;
      return beginHold();
    }

    return false;
  }

  function setup() {
    if (BOOM) return;
    BOOM = v.duration || 0;
    if (!BOOM) return;
    D = BOOM / 2;
    resetLatches();
    setRate(MINRATE);
    play();
  }

  function frame() {
    if (D > 0) {
      var t = v.currentTime;

      if (holdLatch.end && t < 0.3) {
        resetLatches();
      }

      if (!maybeHold(t)) {
        if (!holding) {
          var d = Math.min(t, Math.abs(t - D), BOOM - t);
          var rate = MINRATE + (CRUISE - MINRATE) * smoothstep(d / EASE);
          if (Math.abs(v.playbackRate - rate) > 0.001) setRate(rate);
        }
      }
    }
    requestAnimationFrame(frame);
  }

  if (v.readyState >= 1) setup();
  else v.addEventListener("loadedmetadata", setup);

  v.addEventListener("canplay", function () {
    v.classList.add("ready");
    play();
  });

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) play();
  });

  window.addEventListener("pageshow", play);
  requestAnimationFrame(frame);
})();