/**
 * Hero capability cascade flips — scroll-scrubbed rotateX
 * Labels step down: marketing → SEO → integrations → marketing
 *
 * Hero sits at top of page, so drive progress from window.scrollY
 * (not "distance past top of viewport" — that only fires after cards leave).
 */
(function () {
  var root = document.getElementById('hero-capabilities-flip');
  if (!root) return;

  var cards = Array.prototype.slice.call(root.querySelectorAll('.capability-flip'));
  if (!cards.length) return;

  var inners = cards.map(function (card) {
    return card.querySelector('.capability-flip-inner');
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var ticking = false;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function localFlip(progress, start, end) {
    if (progress <= start) return 0;
    if (progress >= end) return 1;
    return (progress - start) / (end - start);
  }

  function update() {
    ticking = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var y = window.scrollY || window.pageYOffset || 0;

    // Full cascade across roughly the first half-viewport of scroll —
    // while the hero cards are still clearly on screen.
    var range = Math.max(220, vh * 0.48);
    var progress = clamp(y / range, 0, 1.2);

    // Staggered cascade
    var amounts = [
      localFlip(progress, 0.02, 0.32),
      localFlip(progress, 0.22, 0.55),
      localFlip(progress, 0.42, 0.78)
    ];

    amounts.forEach(function (amount, i) {
      var deg = amount * 180;
      var inner = inners[i];
      if (!inner) return;
      inner.style.transform = 'rotateX(' + deg + 'deg)';
      cards[i].classList.toggle('is-flipped', amount >= 0.98);
      var endFace = cards[i].querySelector('.capability-flip-face--end');
      var startFace = cards[i].querySelector('.capability-flip-face--start');
      if (endFace) endFace.setAttribute('aria-hidden', amount > 0.5 ? 'false' : 'true');
      if (startFace) startFace.setAttribute('aria-hidden', amount > 0.5 ? 'true' : 'false');
    });
  }

  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  // Wheel on trackpad can fire before scrollY settles — also bind wheel lightly
  window.addEventListener('wheel', onScrollOrResize, { passive: true });
  update();
})();
