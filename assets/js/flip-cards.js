/**
 * Integration Layers flip cards — scroll-scrubbed vertical flips
 * Mid tempo: slower than the first snap version, earlier than the
 * long-runway version (so cards finish flipping while still on screen).
 */
(function () {
  var root = document.getElementById('integration-layers-flip');
  if (!root) return;

  var cards = Array.prototype.slice.call(root.querySelectorAll('.proof-flip'));
  if (!cards.length) return;

  var inners = cards.map(function (card) {
    return card.querySelector('.proof-flip-inner');
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    cards.forEach(function (card, i) {
      card.classList.add('is-flipped');
      if (inners[i]) inners[i].style.transform = 'rotateX(180deg)';
    });
    return;
  }

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
    var rect = root.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;

    // Halfway between first (short/fast) and second (1.85vh, too late) runways
    var scrolled = vh - rect.top;
    var range = vh * 1.15;
    var progress = clamp(scrolled / range, 0, 1.2);

    // Finish while grid is still mid-viewport — not after it leaves the top.
    // Capture first, Route after a beat, Report last; all done ~progress 0.85
    var amounts = [
      localFlip(progress, 0.08, 0.36),
      localFlip(progress, 0.30, 0.58),
      localFlip(progress, 0.52, 0.82)
    ];

    amounts.forEach(function (amount, i) {
      var deg = amount * 180;
      var inner = inners[i];
      if (!inner) return;
      inner.style.transform = 'rotateX(' + deg + 'deg)';
      cards[i].classList.toggle('is-flipped', amount >= 0.98);
      cards[i].classList.toggle('is-flipping', amount > 0.02 && amount < 0.98);
      var back = cards[i].querySelector('.proof-flip-face--back');
      if (back) back.setAttribute('aria-hidden', amount > 0.5 ? 'true' : 'false');
    });
  }

  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  update();
})();
