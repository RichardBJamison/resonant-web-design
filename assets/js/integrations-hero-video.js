(function () {
  var v = document.getElementById("integrations-hero-video");
  if (!v) return;

  var CRUISE = 0.65, EASE = 4, MINRATE = 0.04;
  var HOLD_MS = 3000;
  var HOLD_EPS = 0.06;
  var NUDGE = 0.08;
  var BOOM = 0, D = 0;
  var holding = false;
  var midHeld = false;
  var endLatched = false;
  var ready = false;
  var lastT = -1;

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

  function holdAt(time, resumeFrom, afterHold) {
    if (holding) return;
    holding = true;
    v.pause();
    v.currentTime = time;

    window.setTimeout(function () {
      holding = false;
      if (typeof resumeFrom === "number") v.currentTime = resumeFrom;
      setRate(MINRATE);
      play();
      if (afterHold) afterHold();
    }, HOLD_MS);
  }

  function holdAtStart(afterHold) {
    holdAt(0, NUDGE, afterHold);
  }

  function holdAtMid() {
    if (midHeld || holding) return;
    midHeld = true;
    holdAt(D, Math.min(D + NUDGE, BOOM - HOLD_EPS));
  }

  function holdAtEnd(force) {
    if (holding || endLatched || !BOOM) return;
    if (!force && v.currentTime < BOOM - HOLD_EPS) return;
    endLatched = true;
    holdAtStart(function () {
      midHeld = false;
      endLatched = false;
    });
  }

  function checkTurns() {
    if (!ready || holding || D <= 0) return;

    var t = v.currentTime;

    if (t >= BOOM - HOLD_EPS) {
      holdAtEnd();
      return;
    }

    if (!midHeld && t >= D - HOLD_EPS && t <= D + HOLD_EPS) {
      holdAtMid();
    }

    lastT = t;
  }

  function applyRate() {
    if (v.dataset.allowFastTest === '1') return;
    if (!ready || holding || D <= 0) return;
    var t = v.currentTime;
    var d = Math.min(t, Math.abs(t - D), BOOM - t);
    var rate = MINRATE + (CRUISE - MINRATE) * smoothstep(d / EASE);
    if (Math.abs(v.playbackRate - rate) > 0.001) setRate(rate);
  }

  function frame() {
    checkTurns();
    applyRate();
    requestAnimationFrame(frame);
  }

  function setup() {
    if (ready) return;
    BOOM = v.duration || 0;
    if (!BOOM) return;

    D = BOOM / 2;
    ready = true;
    midHeld = false;
    endLatched = false;
    lastT = -1;
    v.loop = false;
    v.pause();
    v.currentTime = 0;
    holdAtStart();
  }

  if (v.readyState >= 1) setup();
  else v.addEventListener("loadedmetadata", setup);

  v.addEventListener("canplay", function () {
    v.classList.add("ready");
    if (!holding) play();
  });

  v.addEventListener("ended", function () {
    holdAtEnd(true);
  });

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && !holding) play();
  });

  window.addEventListener("pageshow", function () {
    if (!holding) play();
  });

  requestAnimationFrame(frame);
})();