    /* ========================================
       INIT
       ======================================== */
    window.addEventListener('load', () => {
      requestAnimationFrame(animateHero);
    });

    /* ========================================
       HERO ENTRANCE
       ======================================== */
    function animateHero() {
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
          el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay);
      });
    }

    /* ========================================
       SCROLL PROGRESS
       ======================================== */
    const scrollProgress = document.getElementById('scroll-progress');

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (scrollProgress) scrollProgress.style.width = progress + '%';
    }, { passive: true });

    /* ========================================
       NAV SCROLL
       ======================================== */
    const nav = document.getElementById('nav');

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });

    /* ========================================
       MOBILE MENU
       ======================================== */
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        mobileToggle.classList.toggle('open', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        mobileToggle.setAttribute('aria-expanded', isOpen);
      });

      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          mobileToggle.classList.remove('open');
          document.body.classList.remove('menu-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* ========================================
       SCROLL REVEAL
       ======================================== */
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => {
      revealObserver.observe(el);
    });

    /* ========================================
       WAVEFORM CANVAS
       ======================================== */
    const canvas = document.getElementById('waveform');

    if (canvas) {
      const ctx = canvas.getContext('2d');
      let animationId;

      function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth * window.devicePixelRatio;
        canvas.height = container.offsetHeight * window.devicePixelRatio;
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      }

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      function drawWave(time) {
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;

        ctx.clearRect(0, 0, w, h);

        const waves = [
          { amplitude: 34, frequency: 0.009, speed: 0.0008, color: 'rgba(31, 247, 242, 0.26)', offset: 0, width: 1.2 },
          { amplitude: 26, frequency: 0.012, speed: 0.001, color: 'rgba(122, 190, 255, 0.16)', offset: 2.2, width: 1 },
          { amplitude: 18, frequency: 0.016, speed: 0.0013, color: 'rgba(240, 82, 216, 0.14)', offset: 4.4, width: 1 },
        ];

        waves.forEach(wave => {
          for (let line = -5; line <= 5; line += 1) {
            ctx.beginPath();

            for (let x = 0; x <= w; x += 3) {
              const center = h * 0.55 + line * 11;
              const y = center
                + Math.sin(x * wave.frequency + time * wave.speed + wave.offset + line * 0.22) * wave.amplitude
                + Math.sin(x * wave.frequency * 0.52 + time * wave.speed * 1.3) * wave.amplitude * 0.38;

              if (x === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }

            ctx.strokeStyle = wave.color;
            ctx.lineWidth = wave.width;
            ctx.stroke();
          }
        });

        animationId = requestAnimationFrame(() => drawWave(time + 16));
      }

      drawWave(0);

      const hero = document.querySelector('.hero');
      if (hero) {
        const heroObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              if (!animationId) drawWave(performance.now());
            } else {
              cancelAnimationFrame(animationId);
              animationId = null;
            }
          });
        }, { threshold: 0 });

        heroObserver.observe(hero);
      }
    }

    /* ========================================
       SMOOTH SCROLL FOR NAV LINKS
       ======================================== */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
