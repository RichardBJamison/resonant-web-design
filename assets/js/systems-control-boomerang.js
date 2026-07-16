/**
 * Systems control-layer boomerang
 * Same family as integrations hero / IHS underconstruction motion:
 * pre-baked forward+reverse video, continuous play, slow end-caps,
 * NO pause holds — never stops at either side.
 */
(function () {
  var v = document.querySelector(".systems-control-video");
  if (!v) return;

  var CRUISE = 0.72;
  var FLOOR = 0.2; // never fully stop
  var CAP = 0.9; // seconds of soft end-cap on each side of turnarounds
  var D = 0;
  var MID = 0;
  var ready = false;
  var lastT = -1;

  v.muted = true;
  v.defaultMuted = true;
  v.setAttribute("muted", "");
  v.setAttribute("playsinline", "");
  v.setAttribute("webkit-playsinline", "");
  v.playsInline = true;
  v.controls = false;
  v.removeAttribute("controls");
  v.loop = false;

  function setRate(rate) {
    var r = Math.max(0.0625, Math.min(2, rate));
    try {
      v.playbackRate = r;
    } catch (e) {
      try {
        v.playbackRate = CRUISE;
      } catch (e2) {}
    }
  }

  function play() {
    try {
      v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  /** Distance to nearest turnaround (start, mid reverse point, end). */
  function distToCap(t) {
    return Math.min(t, Math.abs(t - MID), Math.max(0, D - t));
  }

  /** Smooth cruise with soft slow zones — never zero. */
  function rateAt(t) {
    if (D <= 0) return CRUISE;
    var d = distToCap(t);
    if (d >= CAP) return CRUISE;
    var u = d / CAP;
    // smoothstep
    u = u * u * (3 - 2 * u);
    return FLOOR + (CRUISE - FLOOR) * u;
  }

  function wrapIfNeeded(t) {
    // Seamless cycle: at end of reverse, jump to start without pause
    if (t >= D - 0.04) {
      try {
        v.currentTime = 0.02;
      } catch (e) {}
      lastT = 0.02;
      setRate(rateAt(0.02));
      play();
      return true;
    }
    return false;
  }

  function onTick() {
    if (!ready || D <= 0) return;
    if (v.paused) play();

    var t = v.currentTime || 0;
    if (wrapIfNeeded(t)) return;

    setRate(rateAt(t));
    lastT = t;
  }

  function onEnded() {
    // Hard ended — restart smoothly (no hold)
    try {
      v.currentTime = 0.02;
    } catch (e) {}
    setRate(rateAt(0.02));
    play();
  }

  function setup() {
    if (ready) return;
    D = v.duration || 0;
    if (!D || !isFinite(D)) return;
    MID = D * 0.5;
    ready = true;
    v.loop = false;
    try {
      if (v.currentTime > 0.15) v.currentTime = 0;
    } catch (e) {}
    setRate(rateAt(0));
    play();
  }

  v.addEventListener("timeupdate", onTick);
  v.addEventListener("ended", onEnded);
  v.addEventListener("seeking", function () {
    if (ready) setRate(rateAt(v.currentTime || 0));
  });

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
    if (!ready) setup();
    play();
  });
  v.addEventListener("canplaythrough", play, { once: true });

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) play();
  });
  window.addEventListener("pageshow", play);

  var unlock = function () {
    play();
    if (!ready && v.readyState >= 1) setup();
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
    if (!ready && v.readyState >= 1) setup();
  }, 1200);
})();
