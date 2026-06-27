/* ========================================
       LOADER
       ======================================== */
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.getElementById('loader').classList.add('done');
        animateHero();
      }, 1600);
    });

    /* ========================================
       HERO ENTRANCE
       ======================================== */
    function animateHero() {
      const elements = [
        { el: document.querySelector('.hero-eyebrow'), delay: 200 },
        { el: document.querySelector('.hero-title'), delay: 400 },
        { el: document.querySelector('.hero-subtitle'), delay: 600 },
        { el: document.querySelector('.hero-ctas'), delay: 800 },
        { el: document.querySelector('.hero-metrics'), delay: 1000 },
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
    const ctx = canvas.getContext('2d');
    let animationId;

    function resizeCanvas() {
      const container = canvas.parentElement;
      canvas.width = container.offsetWidth * window.devicePixelRatio;
      canvas.height = container.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawWave(time) {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, w, h);

      const waves = [
        { amplitude: 25, frequency: 0.008, speed: 0.0008, color: 'rgba(232, 93, 48, 0.15)', offset: 0 },
        { amplitude: 18, frequency: 0.012, speed: 0.0012, color: 'rgba(232, 93, 48, 0.10)', offset: 2 },
        { amplitude: 12, frequency: 0.006, speed: 0.001, color: 'rgba(45, 155, 131, 0.08)', offset: 4 },
      ];

      waves.forEach(wave => {
        ctx.beginPath();
        ctx.moveTo(0, h);

        for (let x = 0; x <= w; x += 2) {
          const y = h / 2
            + Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude
            + Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 1.3) * wave.amplitude * 0.4;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      animationId = requestAnimationFrame(() => drawWave(time + 16));
    }

    drawWave(0);

    /* Pause waveform when not visible */
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

    heroObserver.observe(document.querySelector('.hero'));

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
