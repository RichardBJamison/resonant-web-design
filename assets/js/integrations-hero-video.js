(function () {
  var v = document.getElementById("integrations-hero-video");
  if (!v) return;

  var CRUISE = 0.65;
  var HOLD_MS = 3000;
  var BOOM = 0;
  var D = 0;
  var leg = "idle";
  var holding = false;
  var holdTimer = null;
  var lastT = -1;

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

  function beginHold(resume) {
    if (holding) return;
    holding = true;
    leg = "hold";
    clearHoldTimer();
    v.pause();
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
    if (v.currentTime > 0.2) v.currentTime = 0;
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
    v.currentTime = 0;
    beginHold(startForwardLeg);
  }

  function finishCycle() {
    beginHold(function () {
      v.currentTime = 0;
      startCycle();
    });
  }

  function onTick() {
    if (!BOOM || holding || D <= 0) return;

    var t = v.currentTime;

    if (leg === "forward" && lastT < D && t >= D) {
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

  v.addEventListener("canplay", function () {
    v.classList.add("ready");
    if (!BOOM) setup();
    else if (!holding && leg === "idle") startCycle();
    play();
  });

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && !holding) play();
  });

  window.addEventListener("pageshow", function () {
    if (!holding) play();
  });
})();