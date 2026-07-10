(function () {
  var v = document.getElementById("integrations-hero-video");
  if (!v) return;

  var CRUISE = 0.65;
  var HOLD_MS = 3000;
  var ZONE = 0.1;
  var NUDGE = 0.06;
  var BOOM = 0, D = 0;
  var holding = false;
  var holdTimer = null;
  var phase = "";

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

  function holdAt(time, nextPhase, resumeAt) {
    if (holding) return;
    holding = true;
    phase = nextPhase + "-holding";
    clearHoldTimer();
    v.pause();
    v.currentTime = time;

    holdTimer = window.setTimeout(function () {
      holdTimer = null;
      holding = false;
      phase = nextPhase;

      if (nextPhase === "start-hold") {
        v.currentTime = 0;
        holdAt(0, "forward", 0);
        return;
      }

      if (typeof resumeAt === "number") v.currentTime = resumeAt;
      setRate(CRUISE);
      play();
    }, HOLD_MS);
  }

  function checkTurns() {
    if (!BOOM || holding || D <= 0) return;
    var t = v.currentTime;

    if (phase === "forward" && t >= D - ZONE) {
      holdAt(D, "reverse", Math.min(D + NUDGE, BOOM - ZONE));
      return;
    }

    if (phase === "reverse" && t >= BOOM - ZONE) {
      holdAt(Math.max(0, BOOM - 0.04), "start-hold");
    }
  }

  function setup() {
    if (BOOM) return;
    BOOM = v.duration || 0;
    if (!BOOM) return;
    D = BOOM / 2;
    v.loop = false;
    holdAt(0, "forward", 0);
  }

  function frame() {
    checkTurns();
    if (!holding && (phase === "forward" || phase === "reverse")) {
      if (Math.abs(v.playbackRate - CRUISE) > 0.001) setRate(CRUISE);
    }
    requestAnimationFrame(frame);
  }

  if (v.readyState >= 1) setup();
  else v.addEventListener("loadedmetadata", setup);

  v.addEventListener("canplay", function () {
    v.classList.add("ready");
    play();
  });

  v.addEventListener("ended", function () {
    if (phase === "reverse") holdAt(Math.max(0, BOOM - 0.04), "start-hold");
  });

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) play();
  });

  window.addEventListener("pageshow", play);
  requestAnimationFrame(frame);
})();