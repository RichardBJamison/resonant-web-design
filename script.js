(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function onIdle(callback) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: 1500 });
    } else {
      setTimeout(callback, 1);
    }
  }

  function animateHero() {
    if (prefersReducedMotion) {
      document
        .querySelectorAll('.hero-title, .hero-subtitle, .hero-ctas, .hero-visual, .hero-capabilities')
        .forEach((el) => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      return;
    }

    const elements = [
      { el: document.querySelector('.hero-title'), delay: 400 },
      { el: document.querySelector('.hero-subtitle'), delay: 600 },
      { el: document.querySelector('.hero-ctas'), delay: 800 },
      { el: document.querySelector('.hero-visual'), delay: 900 },
      { el: document.querySelector('.hero-capabilities'), delay: 1000 },
    ];

    elements.forEach(({ el, delay }) => {
      if (!el) return;
      setTimeout(() => {
        el.style.transition =
          'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, delay);
    });
  }

  function initScrollProgress() {
    const scrollProgress = document.getElementById('scroll-progress');
    if (!scrollProgress) return;

    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          scrollProgress.style.width = progress + '%';
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    window.addEventListener(
      'scroll',
      () => {
        nav.classList.toggle('scrolled', window.scrollY > 80);
      },
      { passive: true }
    );
  }

  function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileToggle || !mobileMenu) return;

    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileToggle.classList.toggle('open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.classList.remove('open');
        document.body.classList.remove('menu-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  function initFitReviewRouting() {
    document.querySelectorAll('a.btn, a.nav-cta').forEach((link) => {
      if (link.dataset.preserveHref === 'true') return;

      const url = new URL('/start/', window.location.origin);
      url.searchParams.set('source', 'resonant');
      url.searchParams.set('from', window.location.pathname || '/');
      url.hash = 'fit-review';
      link.href = url.href;
      link.removeAttribute('target');
      link.removeAttribute('rel');

      if (link.classList.contains('nav-cta')) {
        link.textContent = "Let's Talk";
        link.setAttribute('aria-label', "Let's talk — request a fit review");
      }
    });
  }

  function initHospitalityCobrand() {
    const mainScript = document.querySelector('script[src*="script.js"]');
    const globeUrl = new URL('ihs-globe-nav.png', mainScript?.src || document.baseURI).href;
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.type = 'image/png';
    favicon.href = '/ihs-favicon-48.png';
    favicon.sizes = '48x48';

    const nav = document.querySelector('.nav');
    const logo = nav?.querySelector('.nav-logo');
    if (nav && logo) {
      let lockup = nav.querySelector('.nav-brand-lockup');
      if (!lockup) {
        lockup = document.createElement('div');
        lockup.className = 'nav-brand-lockup';
        logo.insertAdjacentElement('beforebegin', lockup);
        lockup.appendChild(logo);
      } else if (!lockup.contains(logo)) {
        lockup.appendChild(logo);
      }
      let cobrand = nav.querySelector('.ihs-cobrand');
      if (!cobrand) {
        cobrand = document.createElement('a');
        cobrand.className = 'ihs-cobrand';
        cobrand.href = 'https://intelligenthospitalitysystems.com/';
        cobrand.setAttribute('aria-label', 'Intelligent Hospitality Systems');
        cobrand.title = 'Intelligent Hospitality Systems';
        cobrand.innerHTML = '<img src="' + globeUrl + '" alt="" width="38" height="38">';
      }
      if (!lockup.contains(cobrand) || cobrand.nextElementSibling !== logo) {
        lockup.insertBefore(cobrand, logo);
      }
    }
  }

  function initReveal() {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  }

  function initStarterFeatureFlip() {
    const root = document.getElementById('starter-feature-flip');
    if (!root) return;
    const cards = Array.from(root.querySelectorAll('.starter-feature-card'));
    if (!cards.length || prefersReducedMotion) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      cards.forEach((card, index) => {
        window.setTimeout(() => card.classList.add('is-flipped'), index * 170);
      });
      observer.disconnect();
    }, { threshold: 0.3 });

    observer.observe(root);
  }

  function initFaqRollout() {
    if (prefersReducedMotion) return;

    const rows = Array.from(document.querySelectorAll('.home-faq-list details'));
    if (rows.length < 2) return;
    const faqTitle = document.querySelector('.home-faq-title');
    const titleLetters = faqTitle
      ? {
          q: faqTitle.querySelector('.faq-letter-q'),
          a: faqTitle.querySelector('.faq-letter-a'),
          f: faqTitle.querySelector('.faq-letter-f'),
        }
      : null;

    const rolled = new WeakSet();
    const queued = new WeakSet();
    const queue = [];
    let ticking = false;
    let queueTimer = 0;
    let discoveryTimer = 0;
    let discoveryTicks = 0;

    if (faqTitle && titleLetters) {
      faqTitle.classList.add('faq-title-armed');
    }

    function roll(row) {
      if (rolled.has(row)) return;
      rolled.add(row);
      row.classList.add('faq-roll-once');
    }

    function drainQueue() {
      const row = queue.shift();
      if (row) roll(row);

      if (queue.length) {
        queueTimer = window.setTimeout(drainQueue, 170);
      } else {
        queueTimer = 0;
      }
    }

    function queueRoll(row) {
      if (rolled.has(row) || queued.has(row)) return;
      queued.add(row);
      queue.push(row);
    }

    function revealTitleLetter(letter) {
      if (!letter) return;
      letter.classList.add('is-in-place');
    }

    function update() {
      ticking = false;
      const vh = window.innerHeight || document.documentElement.clientHeight;

      rows.forEach((row, index) => {
        const trigger = rows[index + 1] || row;
        if (trigger.getBoundingClientRect().bottom <= vh) {
          queueRoll(row);
        }
      });

      if (titleLetters) {
        if (rows[1]?.getBoundingClientRect().bottom <= vh) {
          revealTitleLetter(titleLetters.q);
        }
        if (rows[3]?.getBoundingClientRect().bottom <= vh) {
          revealTitleLetter(titleLetters.a);
        }
        if (rows[5]?.getBoundingClientRect().bottom <= vh) {
          revealTitleLetter(titleLetters.f);
        }
      }

      if (!queueTimer && queue.length) {
        queueTimer = window.setTimeout(drainQueue, 0);
      }
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    function titleIsComplete() {
      return !titleLetters || titleLetters.f?.classList.contains('is-in-place');
    }

    function stopDiscoveryTimer() {
      if (!discoveryTimer) return;
      window.clearInterval(discoveryTimer);
      discoveryTimer = 0;
    }

    function startDiscoveryTimer() {
      if (discoveryTimer) return;
      discoveryTimer = window.setInterval(() => {
        requestUpdate();
        discoveryTicks += 1;
        if (titleIsComplete() || discoveryTicks > 1800) {
          stopDiscoveryTimer();
        }
      }, 160);
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    requestUpdate();
    startDiscoveryTimer();
  }

  function initWaveform() {
    if (prefersReducedMotion) return;

    const canvas = document.getElementById('waveform');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId = null;
    let renderDpr = 1;

    function resizeCanvas() {
      const container = canvas.parentElement;
      renderDpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = container.offsetWidth * renderDpr;
      canvas.height = container.offsetHeight * renderDpr;
      ctx.setTransform(renderDpr, 0, 0, renderDpr, 0, 0);
    }

    function drawWave(time) {
      const w = canvas.width / renderDpr;
      const h = canvas.height / renderDpr;

      ctx.clearRect(0, 0, w, h);

      const waves = [
        { amplitude: 34, frequency: 0.009, speed: 0.0008, color: 'rgba(31, 247, 242, 0.26)', offset: 0, width: 1.2 },
        { amplitude: 26, frequency: 0.012, speed: 0.001, color: 'rgba(122, 190, 255, 0.16)', offset: 2.2, width: 1 },
        { amplitude: 18, frequency: 0.016, speed: 0.0013, color: 'rgba(240, 82, 216, 0.14)', offset: 4.4, width: 1 },
      ];

      // Lighter draw: fewer lines + larger x step; cap DPR for mobile perf
      waves.forEach((wave) => {
        for (let line = -2; line <= 2; line += 1) {
          ctx.beginPath();
          for (let x = 0; x <= w; x += 6) {
            const center = h * 0.55 + line * 14;
            const y =
              center +
              Math.sin(x * wave.frequency + time * wave.speed + wave.offset + line * 0.22) * wave.amplitude +
              Math.sin(x * wave.frequency * 0.52 + time * wave.speed * 1.3) * wave.amplitude * 0.38;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = wave.color;
          ctx.lineWidth = wave.width;
          ctx.stroke();
        }
      });

      animationId = requestAnimationFrame(() => drawWave(time + 32));
    }

    function startWaveform() {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas, { passive: true });
      drawWave(0);

      const hero = document.querySelector('.hero');
      if (!hero) return;

      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!animationId) drawWave(performance.now());
            } else if (animationId) {
              cancelAnimationFrame(animationId);
              animationId = null;
            }
          });
        },
        { threshold: 0 }
      );

      heroObserver.observe(hero);
    }

    onIdle(startWaveform);
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  onReady(() => {
    initFitReviewRouting();
    initHospitalityCobrand();
    requestAnimationFrame(animateHero);
    initScrollProgress();
    initNavScroll();
    initMobileMenu();
    initReveal();
    initStarterFeatureFlip();
    initFaqRollout();
    initSmoothScroll();
    initWaveform();
  });
})();
(() => {
  const canUseCursor =
    window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 992px)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canUseCursor || document.querySelector(".ambient-cursor")) return;

  const cursor = document.createElement("div");
  cursor.className = "ambient-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML =
    '<svg viewBox="0 0 36 36" focusable="false"><circle cx="18" cy="18" r="16" pathLength="100"></circle></svg>';
  document.body.appendChild(cursor);

  const progressRing = cursor.querySelector("circle");
  const interactiveSelector =
    'a, button, input, textarea, select, summary, [role="button"], [tabindex]:not([tabindex="-1"])';

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let hasPosition = false;
  let frameId = 0;

  const render = () => {
    currentX += (targetX - currentX) * 0.25;
    currentY += (targetY - currentY) * 0.25;
    cursor.style.transform =
      `translate3d(${currentX - 3}px, ${currentY - 3}px, 0)`;
    frameId = window.requestAnimationFrame(render);
  };

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressRing.style.strokeDashoffset = String(100 - progress * 100);
  };

  document.addEventListener(
    "mousemove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!hasPosition) {
        currentX = targetX;
        currentY = targetY;
        hasPosition = true;
        cursor.classList.add("is-visible");
        frameId = window.requestAnimationFrame(render);
      }

      const target = event.target instanceof Element ? event.target : null;
      cursor.classList.toggle("is-interactive", Boolean(target?.closest(interactiveSelector)));
    },
    { passive: true }
  );

  document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));
  document.addEventListener("mouseenter", () => {
    if (hasPosition) cursor.classList.add("is-visible");
  });
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener(
    "pagehide",
    () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    },
    { once: true }
  );

  updateProgress();
})();
