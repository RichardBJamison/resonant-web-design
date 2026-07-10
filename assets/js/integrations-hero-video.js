(function () {
  var video = document.getElementById('integrations-hero-video');
  if (!video) return;

  var RATE_MIN = 0.0625;
  var RATE_MAX = 4;
  var CRUISE = 0.0704;
  var EASE_MAX = 0.0625;
  var EASE = 4;
  var HOLD_MS = 3000;
  var END_EPS = 0.08;
  var MID_EPS = 0.08;
  var NUDGE = 0.12;
  var TICK_MS = 40;

  var boom = 0;
  var half = 0;
  var ready = false;
  var holding = false;
  var midHeld = false;
  var endLatched = false;
  var holdTimer = null;

  function clampRate(rate) {
    return Math.max(RATE_MIN, Math.min(RATE_MAX, rate));
  }

  function setRate(rate) {
    var next = clampRate(rate);
    if (Math.abs(video.playbackRate - next) <= 0.0005) return;
    try {
      video.playbackRate = next;
    } catch (error) {
      video.playbackRate = RATE_MIN;
    }
  }

  function play() {
    if (holding) return;

    function attempt() {
      var promise = video.play();
      var afterPlay = function () {
        applyRate();
      };

      if (promise && promise.then) {
        promise.then(afterPlay).catch(function () {
          window.setTimeout(attempt, 120);
        });
      } else {
        afterPlay();
      }
    }

    attempt();
  }

  function rateForDistance(distance) {
    if (distance < EASE) {
      var u = distance / EASE;
      return clampRate(EASE_MAX + (CRUISE - EASE_MAX) * u * u);
    }
    return CRUISE;
  }

  function applyRate() {
    if (video.dataset.forceFast === '1') return;
    if (!ready || half <= 0 || holding) return;
    var t = video.currentTime;
    var distance = Math.min(t, Math.abs(t - half), Math.max(0, boom - t));
    setRate(rateForDistance(distance));
  }

  function clearHoldTimer() {
    if (holdTimer) {
      window.clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  function holdAt(time, resumeFrom, afterHold) {
    if (holding) return;

    clearHoldTimer();
    holding = true;
    video.pause();
    video.currentTime = time;

    holdTimer = window.setTimeout(function () {
      holdTimer = null;
      holding = false;

      try {
        if (typeof resumeFrom === 'number') {
          video.currentTime = resumeFrom;
        }
        setRate(EASE_MAX);
        play();
      } finally {
        if (afterHold) afterHold();
      }
    }, HOLD_MS);
  }

  function holdAtStart(afterHold) {
    holdAt(0, NUDGE, afterHold);
  }

  function holdAtMid() {
    if (midHeld || holding) return;
    midHeld = true;
    holdAt(half, Math.min(half + NUDGE, boom - END_EPS));
  }

  function holdAtEnd() {
    if (holding || endLatched || !boom) return;
    if (video.currentTime < boom - END_EPS) return;

    endLatched = true;

    holdAtStart(function () {
      midHeld = false;
      endLatched = false;
    });
  }

  function checkPosition() {
    if (!ready || holding || !boom) return;

    var t = video.currentTime;

    if (t >= boom - END_EPS) {
      holdAtEnd();
      return;
    }

    if (!midHeld && t >= half - MID_EPS && t < half + MID_EPS) {
      holdAtMid();
    }
  }

  function tick() {
    checkPosition();
    applyRate();
  }

  function setup() {
    if (ready) return true;
    boom = video.duration;
    if (!boom || !isFinite(boom)) return false;

    half = boom / 2;
    ready = true;
    midHeld = false;
    endLatched = false;
    video.loop = false;
    video.autoplay = false;
    video.pause();
    video.currentTime = 0;
    setRate(EASE_MAX);
    holdAtStart();
    return true;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.loop = true;
    video.playbackRate = 1;
    play();
    return;
  }

  video.loop = false;
  video.autoplay = false;
  video.addEventListener('ended', function () {
    if (video.currentTime < boom - END_EPS) return;
    holdAtEnd();
  });

  ['loadedmetadata', 'loadeddata', 'canplay'].forEach(function (eventName) {
    video.addEventListener(eventName, setup);
  });

  if (video.readyState >= 1) setup();

  window.setInterval(tick, TICK_MS);
  requestAnimationFrame(function loop() {
    tick();
    requestAnimationFrame(loop);
  });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && !holding) play();
  });

  window.addEventListener('pageshow', function () {
    if (!holding) play();
  });
})();