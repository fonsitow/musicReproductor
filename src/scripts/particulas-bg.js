(() => {
  const canvas = document.getElementById('bgParticles');
  const ctx = canvas.getContext('2d', { alpha: true });

  // Opciones
  const CONFIG = {
    baseCount: 150,          // nº base de partículas (se ajusta por tamaño)
    maxLinkDist: 130,        // distancia para dibujar líneas
    particleSize: [1, 3],    // rango de tamaño
    speed: [0.2, 0.8],       // rango de velocidad (px/frame)
    colors: ['#6a11cb', '#2575fc'], // morado → azul
    mouseInfluence: 90,      // radio de repulsión del mouse
    mouseForce: 0.03,        // fuerza de repulsión
    opacity: 0.8,            // opacidad base de las partículas
    lineAlpha: 0.25          // alfa de las líneas
  };

  let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  let W = 0, H = 0;
  let particles = [];
  let animId = null;
  const mouse = { x: null, y: null, active: false };

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function mixColors(c1, c2, t) {
    // c1/c2 formato #rrggbb
    const p = (c) => [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
    const a = p(c1), b = p(c2);
    const r = Math.round(lerp(a[0], b[0], t));
    const g = Math.round(lerp(a[1], b[1], t));
    const b2 = Math.round(lerp(a[2], b[2], t));
    return `rgb(${r},${g},${b2})`;
  }

  function resize() {
    const { innerWidth, innerHeight } = window;
    W = canvas.width = Math.floor(innerWidth * dpr);
    H = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';

    // Recalcula cantidad según área (mantiene densidad similar en pantallas grandes)
    const target = Math.round(CONFIG.baseCount * (innerWidth * innerHeight) / (1280 * 720));
    if (particles.length < target) {
      addParticles(target - particles.length);
    } else if (particles.length > target) {
      particles.length = target;
    }
  }

  function addParticles(n) {
    for (let i = 0; i < n; i++) {
      const t = Math.random(); // para mezclar color morado→azul
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() < 0.5 ? -1 : 1) * rand(CONFIG.speed[0], CONFIG.speed[1]) * dpr,
        vy: (Math.random() < 0.5 ? -1 : 1) * rand(CONFIG.speed[0], CONFIG.speed[1]) * dpr,
        r: rand(CONFIG.particleSize[0], CONFIG.particleSize[1]) * dpr,
        color: mixColors(CONFIG.colors[0], CONFIG.colors[1], t),
        alpha: CONFIG.opacity
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    // Actualiza partículas
    for (let p of particles) {
      // Repulsión del mouse
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        const radius = CONFIG.mouseInfluence * dpr;
        if (dist > 0 && dist < radius) {
          const f = CONFIG.mouseForce * (1 - dist / radius);
          p.vx += (dx / dist) * f * dpr;
          p.vy += (dy / dist) * f * dpr;
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      // Rebote en bordes
      if (p.x <= 0 || p.x >= W) p.vx *= -1;
      if (p.y <= 0 || p.y >= H) p.vy *= -1;

      // Dibuja partícula
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dibuja líneas entre partículas cercanas
    const maxDist2 = (CONFIG.maxLinkDist * dpr) ** 2;
    ctx.lineWidth = 1 * dpr;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < maxDist2) {
          const alpha = CONFIG.lineAlpha * (1 - d2 / maxDist2);
          ctx.strokeStyle = 'rgba(144, 120, 255,' + alpha + ')'; // tono violeta sutil
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(step);
  }

  // Eventos
  window.addEventListener('resize', () => {
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    resize();
  });

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * dpr;
    mouse.y = (e.clientY - rect.top) * dpr;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => { mouse.active = false; });

  // Pausar cuando la pestaña no está visible (ahorra batería)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animId) cancelAnimationFrame(animId);
      animId = null;
    } else if (!animId) {
      animId = requestAnimationFrame(step);
    }
  });

  // Init
  resize();
  addParticles(Math.round(CONFIG.baseCount));
  animId = requestAnimationFrame(step);
})();
