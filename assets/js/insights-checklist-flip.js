/**
 * Insights checklist — single flip with scroll (rotateX scrub)
 * Same behavior family as Integration Layers flip cards.
 */
(function () {
  var root = document.getElementById("insights-checklist-flip");
  if (!root) return;

  var cards = Array.prototype.slice.call(root.querySelectorAll(".proof-flip"));
  if (!cards.length) return;

  var inners = cards.map(function (card) {
    return card.querySelector(".proof-flip-inner");
  });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    cards.forEach(function (card, i) {
      card.classList.add("is-flipped");
      if (inners[i]) inners[i].style.transform = "rotateX(180deg)";
      var back = card.querySelector(".proof-flip-face--back");
      if (back) back.setAttribute("aria-hidden", "true");
    });
    return;
  }

  var ticking = false;
  var n = cards.length;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function localFlip(progress, start, end) {
    if (progress <= start) return 0;
    if (progress >= end) return 1;
    return (progress - start) / (end - start);
  }

  function update() {
    ticking = false;
    var rect = root.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    // Mid-tempo runway (~same family as flip-cards.js 1.15vh)
    var scrolled = vh - rect.top;
    var range = vh * 1.2;
    var progress = clamp(scrolled / range, 0, 1.15);

    // Stagger five cards; each gets a single full flip
    var amounts = [];
    for (var i = 0; i < n; i++) {
      var start = 0.06 + i * 0.14;
      var end = start + 0.28;
      amounts.push(localFlip(progress, start, Math.min(end, 0.95)));
    }

    amounts.forEach(function (amount, i) {
      var deg = amount * 180;
      var inner = inners[i];
      if (!inner) return;
      inner.style.transform = "rotateX(" + deg + "deg)";
      cards[i].classList.toggle("is-flipped", amount >= 0.98);
      cards[i].classList.toggle("is-flipping", amount > 0.02 && amount < 0.98);
      var back = cards[i].querySelector(".proof-flip-face--back");
      if (back) back.setAttribute("aria-hidden", amount > 0.5 ? "true" : "false");
    });
  }

  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize, { passive: true });
  update();
})();
