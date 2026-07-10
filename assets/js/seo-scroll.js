(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function initReveal() {
    const targets = document.querySelectorAll('.seo-page .seo-reveal');
    if (!targets.length) return;

    if (prefersReducedMotion) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
  }

  function initStackPanels() {
    const stack = document.querySelector('.seo-stack');
    const panels = Array.from(document.querySelectorAll('.seo-stack-panel'));
    if (!stack || !panels.length || prefersReducedMotion) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    panels.forEach((panel, index) => {
      if (index === panels.length - 1) return;

      gsap.to(panel, {
        scale: 0.92,
        opacity: 0.55,
        borderRadius: '24px',
        ease: 'none',
        scrollTrigger: {
          trigger: panels[index + 1],
          start: 'top bottom',
          end: 'top top',
          scrub: 0.6,
        },
      });

      const content = panel.querySelector('.seo-stack-panel-inner');
      if (!content) return;

      gsap.fromTo(
        content,
        { y: 0 },
        {
          y: -48,
          ease: 'none',
          scrollTrigger: {
            trigger: panels[index + 1],
            start: 'top bottom',
            end: 'top top',
            scrub: 0.6,
          },
        }
      );
    });
  }

  function initLogoStagger() {
    const groups = document.querySelectorAll('.seo-logo-grid');
    if (!groups.length || prefersReducedMotion) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    groups.forEach((group) => {
      const items = group.querySelectorAll('.seo-logo-item');
      gsap.from(items, {
        opacity: 0,
        y: 24,
        duration: 0.55,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: group,
          start: 'top 82%',
          once: true,
        },
      });
    });
  }

  function initServiceCards() {
    const grid = document.querySelector('.seo-service-grid');
    if (!grid || prefersReducedMotion) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const cards = grid.querySelectorAll('.seo-service-card');
    gsap.from(cards, {
      opacity: 0,
      y: 36,
      duration: 0.65,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: grid,
        start: 'top 78%',
        once: true,
      },
    });
  }

  onReady(() => {
    initReveal();
    initStackPanels();
    initLogoStagger();
    initServiceCards();
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
})();