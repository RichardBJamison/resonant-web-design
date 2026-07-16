/**
 * Systems control-layer network FX
 * Animated cyan/amber data pulses along radial paths over the static art.
 * Respects prefers-reduced-motion; pauses when off-screen.
 */
(function () {
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function init(root) {
    if (!root || prefersReducedMotion()) return;

    var img = root.querySelector("img");
    if (!img) return;

    var canvas = document.createElement("canvas");
    canvas.className = "systems-network-fx";
    canvas.setAttribute("aria-hidden", "true");
    root.appendChild(canvas);

    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Hub is visually centered, slightly above geometric mid (operator at bottom)
    var HUB = { x: 0.5, y: 0.465 };

    // Spoke angles (radians) + color family matching the art
    var SPOKES = [
      { a: -Math.PI * 0.92, color: "cyan", bend: 0.12 },
      { a: -Math.PI * 0.78, color: "cyan", bend: -0.08 },
      { a: -Math.PI * 0.62, color: "amber", bend: 0.1 },
      { a: -Math.PI * 0.42, color: "cyan", bend: -0.06 },
      { a: -Math.PI * 0.22, color: "amber", bend: 0.14 },
      { a: -Math.PI * 0.05, color: "cyan", bend: -0.1 },
      { a: Math.PI * 0.12, color: "amber", bend: 0.08 },
      { a: Math.PI * 0.28, color: "cyan", bend: -0.12 },
      { a: Math.PI * 0.45, color: "amber", bend: 0.06 },
      { a: Math.PI * 0.62, color: "cyan", bend: -0.09 },
      { a: Math.PI * 0.78, color: "amber", bend: 0.11 },
      { a: Math.PI * 0.95, color: "cyan", bend: -0.07 },
      { a: Math.PI * 1.12, color: "amber", bend: 0.09 },
      { a: Math.PI * 1.28, color: "cyan", bend: -0.11 },
      { a: Math.PI * 1.48, color: "amber", bend: 0.05 },
      { a: Math.PI * 1.68, color: "cyan", bend: -0.08 }
    ];

    var COLORS = {
      cyan: { rgb: "56, 210, 230", core: "#7ef9ff" },
      amber: { rgb: "255, 168, 64", core: "#ffd08a" }
    };

    var particles = [];
    var sparks = [];
    var running = false;
    var raf = 0;
    var last = 0;
    var hubPulse = 0;
    var dpr = 1;
    var w = 0;
    var h = 0;

    function resize() {
      var rect = root.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function pointOnSpoke(spoke, t, radius) {
      // t 0 at hub → 1 at rim; slight quadratic bend for organic curves
      var cx = HUB.x * w;
      var cy = HUB.y * h;
      var maxR = radius * (0.38 + 0.22 * Math.abs(Math.sin(spoke.a * 2)));
      var ang = spoke.a + spoke.bend * Math.sin(t * Math.PI);
      var r = maxR * t;
      return {
        x: cx + Math.cos(ang) * r,
        y: cy + Math.sin(ang) * r * 0.92
      };
    }

    function spawnParticle(forceSpoke) {
      var spoke = forceSpoke || SPOKES[(Math.random() * SPOKES.length) | 0];
      var outbound = Math.random() > 0.28;
      var speed = 0.18 + Math.random() * 0.35;
      particles.push({
        spoke: spoke,
        t: outbound ? Math.random() * 0.12 : 0.75 + Math.random() * 0.2,
        dir: outbound ? 1 : -1,
        speed: speed * (outbound ? 1 : 0.7),
        size: 1.2 + Math.random() * 2.4,
        life: 1,
        trail: Math.random() > 0.55,
        color: spoke.color
      });
    }

    function seed() {
      particles = [];
      for (var i = 0; i < 42; i++) spawnParticle(SPOKES[i % SPOKES.length]);
    }

    function spawnSpark() {
      var c = Math.random() > 0.5 ? "cyan" : "amber";
      sparks.push({
        x: HUB.x * w,
        y: HUB.y * h,
        vx: (Math.random() - 0.5) * 2.8,
        vy: (Math.random() - 0.5) * 2.8,
        life: 1,
        size: 1 + Math.random() * 1.8,
        color: c
      });
    }

    function drawDot(x, y, size, colorKey, alpha) {
      var c = COLORS[colorKey] || COLORS.cyan;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.shadowBlur = size * 6;
      ctx.shadowColor = "rgba(" + c.rgb + ", 0.95)";
      ctx.fillStyle = c.core;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      // bright core
      ctx.shadowBlur = 0;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 1.1));
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawHubGlow(dt) {
      hubPulse += dt * 0.0025;
      var cx = HUB.x * w;
      var cy = HUB.y * h;
      var pulse = 0.55 + Math.sin(hubPulse) * 0.2;
      var r = Math.min(w, h) * 0.075 * (1 + Math.sin(hubPulse * 1.3) * 0.04);

      var g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.4);
      g.addColorStop(0, "rgba(255, 200, 120, " + 0.12 * pulse + ")");
      g.addColorStop(0.35, "rgba(56, 210, 230, " + 0.08 * pulse + ")");
      g.addColorStop(1, "rgba(56, 210, 230, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.4, 0, Math.PI * 2);
      ctx.fill();

      // soft ring
      ctx.strokeStyle = "rgba(255, 176, 72, " + 0.22 * pulse + ")";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(90, 230, 255, " + 0.18 * pulse + ")";
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.45, 0, Math.PI * 2);
      ctx.stroke();
    }

    function tick(now) {
      if (!running) return;
      if (!last) last = now;
      var dt = Math.min(48, now - last);
      last = now;

      ctx.clearRect(0, 0, w, h);
      drawHubGlow(dt);

      // soft spoke hints (very light — art already has lines)
      var radius = Math.min(w, h);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (var s = 0; s < SPOKES.length; s++) {
        var spoke = SPOKES[s];
        var c = COLORS[spoke.color];
        var p0 = pointOnSpoke(spoke, 0.12, radius);
        var p1 = pointOnSpoke(spoke, 0.92, radius);
        ctx.strokeStyle = "rgba(" + c.rgb + ", 0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.quadraticCurveTo(
          (p0.x + p1.x) / 2 + Math.cos(spoke.a + Math.PI / 2) * 12 * spoke.bend,
          (p0.y + p1.y) / 2 + Math.sin(spoke.a + Math.PI / 2) * 12 * spoke.bend,
          p1.x,
          p1.y
        );
        ctx.stroke();
      }

      // particles
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.t += p.dir * p.speed * (dt / 1000);
        p.life -= dt * 0.00008;

        if (p.t > 0.98 || p.t < 0.05 || p.life <= 0) {
          particles.splice(i, 1);
          spawnParticle();
          continue;
        }

        var pos = pointOnSpoke(p.spoke, p.t, radius);

        if (p.trail) {
          var back = pointOnSpoke(p.spoke, Math.max(0.05, p.t - 0.045 * p.dir), radius);
          ctx.strokeStyle = "rgba(" + COLORS[p.color].rgb + ", 0.35)";
          ctx.lineWidth = p.size * 0.7;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(back.x, back.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        }

        var alpha = 0.55 + 0.45 * Math.sin(p.t * Math.PI);
        drawDot(pos.x, pos.y, p.size, p.color, alpha);
      }

      // center sparks
      if (Math.random() < 0.04) spawnSpark();
      for (var j = sparks.length - 1; j >= 0; j--) {
        var sp = sparks[j];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= dt * 0.0022;
        if (sp.life <= 0) {
          sparks.splice(j, 1);
          continue;
        }
        drawDot(sp.x, sp.y, sp.size * sp.life, sp.color, sp.life * 0.85);
      }

      ctx.restore();

      // keep density
      if (particles.length < 36) spawnParticle();

      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running || prefersReducedMotion()) return;
      running = true;
      last = 0;
      resize();
      if (!particles.length) seed();
      raf = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      ctx && ctx.clearRect(0, 0, w, h);
    }

    var ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(function () {
        resize();
      });
      ro.observe(root);
    } else {
      window.addEventListener("resize", resize);
    }

    if (typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) start();
            else stop();
          });
        },
        { threshold: 0.12 }
      );
      io.observe(root);
    } else {
      start();
    }

    // size once image layout is known
    if (img.complete) resize();
    else img.addEventListener("load", resize, { once: true });
  }

  function boot() {
    document.querySelectorAll(".systems-showcase--art").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
