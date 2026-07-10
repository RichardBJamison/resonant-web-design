(function () {
  var video = document.getElementById('integrations-hero-video');
  if (!video) return;

  var CRUISE = 0.0704;
  var EASE_MAX = 0.02432;
  var EASE = 4;
  var MINRATE = 0.00384;
  var HOLD_MS = 3000;
  var END_EPS = 0.06;
  var MID_EPS = 0.08;
  var NUDGE = 0.12;

  var boom = 0;
  var half = 0;
  var ready = false;
  var holding = false;
  var midHeld = false;
  var endLatched = false;

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
    if (!ready || half <= 0 || holding) return;
    var t = video.currentTime;
    var distance = Math.min(t, Math.abs(t - half), boom - t);
    var rate = rateForDistance(distance);
    if (Math.abs(video.playbackRate - rate) > 0.0005) {
      video.playbackRate = rate;
    }
  }

  function holdAt(time, resumeFrom, afterHold) {
    if (holding) return;
    holding = true;
    video.pause();
    video.currentTime = time;

    window.setTimeout(function () {
      holding = false;
      if (typeof resumeFrom === 'number') {
        video.currentTime = resumeFrom;
      }
      video.playbackRate = EASE_MAX;
      applyRate();
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
    holdAt(half, Math.min(half + NUDGE, boom - END_EPS));
  }

  function holdAtEnd() {
    if (holding || endLatched) return;
    endLatched = true;
    holdAtStart(function () {
      midHeld = false;
      endLatched = false;
    });
  }

  function onTimeUpdate() {
    if (!ready || holding) return;
    var t = video.currentTime;

    if (t >= boom - END_EPS) {
      holdAtEnd();
      return;
    }

    if (!midHeld && t >= half - MID_EPS) {
      holdAtMid();
    }
  }

  function setup() {
    if (ready) return true;
    boom = video.duration;
    if (!boom || !isFinite(boom)) return false;

    half = boom / 2;
    ready = true;
    midHeld = false;
    video.loop = false;
    video.pause();
    video.currentTime = 0;
    video.playbackRate = EASE_MAX;
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
  video.addEventListener('timeupdate', onTimeUpdate);
  video.addEventListener('ended', holdAtEnd);

  ['loadedmetadata', 'loadeddata', 'canplay'].forEach(function (eventName) {
    video.addEventListener(eventName, setup);
  });

  if (video.readyState >= 1) setup();

  requestAnimationFrame(function loop() {
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