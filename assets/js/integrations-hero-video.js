(function () {
  var v = document.getElementById("integrations-hero-video");
  if (!v) return;

  var CRUISE = 0.65;
  var HOLD_MS = 1000;
  var BOOM = 0;
  var D = 0;
  var leg = "idle";
  var holding = false;
  var holdTimer = null;
  var lastT = -1;
  var started = false;

  // iOS/Safari: muted + playsinline required for autoplay
  v.muted = true;
  v.defaultMuted = true;
  v.setAttribute("muted", "");
  v.setAttribute("playsinline", "");
  v.setAttribute("webkit-playsinline", "");
  v.playsInline = true;
  v.controls = false;
  v.removeAttribute("controls");

  function setRate(rate) {
    try {
      v.playbackRate = rate;
    } catch (error) {
      v.playbackRate = Math.max(0.0625, rate);
    }
  }

  function play() {
    if (holding) return;
    try {
      v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  function clearHoldTimer() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  function beginHold(resume) {
    if (holding) return;
    holding = true;
    leg = "hold";
    clearHoldTimer();
    try {
      v.pause();
    } catch (e) {}
    lastT = v.currentTime;

    holdTimer = window.setTimeout(function () {
      holdTimer = null;
      holding = false;
      resume();
    }, HOLD_MS);
  }

  function startForwardLeg() {
    leg = "forward";
    lastT = -1;
    try {
      if (v.currentTime > 0.2) v.currentTime = 0;
    } catch (e) {}
    setRate(CRUISE);
    play();
  }

  function startReverseLeg() {
    leg = "reverse";
    lastT = v.currentTime;
    setRate(CRUISE);
    play();
  }

  function startCycle() {
    try {
      v.currentTime = 0;
    } catch (e) {}
    // On mobile, avoid starting paused (shows Safari play button). Play first, then cycle.
    if (!started) {
      started = true;
      leg = "forward";
      setRate(CRUISE);
      play();
      return;
    }
    beginHold(startForwardLeg);
  }

  function finishCycle() {
    beginHold(function () {
      try {
        v.currentTime = 0;
      } catch (e) {}
      startForwardLeg();
    });
  }

  function onTick() {
    if (!BOOM || holding || D <= 0) return;

    var t = v.currentTime;

    // First pass: when we hit midpoint after initial free play, enter hold/reverse cycle
    if (leg === "forward" && lastT < D && t >= D) {
      if (!started) started = true;
      beginHold(startReverseLeg);
      return;
    }

    if (leg === "reverse" && lastT < BOOM - 0.05 && t >= BOOM - 0.05) {
      finishCycle();
      return;
    }

    lastT = t;
  }

  function onEnded() {
    if (holding) return;
    if (leg === "forward") beginHold(startReverseLeg);
    else finishCycle();
  }

  function setup() {
    if (BOOM) return;
    BOOM = v.duration || 0;
    if (!BOOM) return;
    D = BOOM / 2;
    v.loop = false;
    startCycle();
  }

  v.addEventListener("timeupdate", onTick);
  v.addEventListener("ended", onEnded);

  function frame() {
    onTick();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  if (v.readyState >= 1) setup();
  else v.addEventListener("loadedmetadata", setup);

  v.addEventListener("loadeddata", play);
  v.addEventListener("canplay", function () {
    v.classList.add("ready");
    if (!BOOM) setup();
    else if (!holding && leg === "idle") startCycle();
    play();
  });
  v.addEventListener("canplaythrough", play, { once: true });

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && !holding) play();
  });

  window.addEventListener("pageshow", function () {
    if (!holding) play();
  });

  // First gesture unlocks autoplay on stubborn mobile browsers
  var unlock = function () {
    play();
    if (!BOOM && v.readyState >= 1) setup();
    document.removeEventListener("touchstart", unlock, true);
    document.removeEventListener("scroll", unlock, true);
    document.removeEventListener("click", unlock, true);
  };
  document.addEventListener("touchstart", unlock, { capture: true, passive: true });
  document.addEventListener("scroll", unlock, { capture: true, passive: true });
  document.addEventListener("click", unlock, { capture: true, passive: true });

  setTimeout(play, 400);
  setTimeout(function () {
    play();
    if (!BOOM && v.readyState >= 1) setup();
  }, 1200);
})();
