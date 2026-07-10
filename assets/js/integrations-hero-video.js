(function () {
  var v = document.getElementById("integrations-hero-video");
  if (!v) return;

  var CRUISE = 0.65, EASE = 4, MINRATE = 0.04;
  var BOOM = 0, D = 0;

  function smoothstep(x) {
    if (x < 0) x = 0; else if (x > 1) x = 1;
    return x * x * (3 - 2 * x);
  }
  function play() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  function setup() { BOOM = v.duration || 0; D = BOOM / 2; v.playbackRate = MINRATE; play(); }

  function frame() {
    if (D > 0) {
      var t = v.currentTime;
      var d = Math.min(t, Math.abs(t - D), BOOM - t);
      var rate = MINRATE + (CRUISE - MINRATE) * smoothstep(d / EASE);
      if (Math.abs(v.playbackRate - rate) > 0.001) v.playbackRate = rate;
    }
    requestAnimationFrame(frame);
  }

  if (v.readyState >= 1) setup();
  else v.addEventListener("loadedmetadata", setup);
  v.addEventListener("canplay", function () { v.classList.add("ready"); play(); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) play(); });
  window.addEventListener("pageshow", play);
  requestAnimationFrame(frame);
})();