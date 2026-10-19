"use client";

// Latar animasi "jaringan titik" (ala particles.js):
// - titik bergerak acak & memantul di tepi layar
// - titik yang berdekatan otomatis terhubung garis (makin dekat makin tegas)
// - titik di sekitar kursor / jari tersambung ke kursor (mode "grab")
// Digambar di <canvas> sendiri tanpa library tambahan.

import { useEffect, useRef } from "react";
import { useUI } from "./providers/UIProvider";

const PALETTE = {
  light: { rgb: "10, 108, 245", dot: 0.55, line: 0.24, grab: 0.7 },
  dark: { rgb: "150, 192, 255", dot: 0.7, line: 0.24, grab: 0.75 },
};

function settings(width) {
  const small = width < 768;
  return {
    link: small ? 120 : 150, // jarak maksimum antar-titik agar tersambung
    grab: small ? 150 : 190, // radius kursor menarik garis
    density: small ? 7000 : 12000, // luas layar (px²) per titik
    max: small ? 48 : 130,
    speed: small ? 0.35 : 0.45,
  };
}

export default function ParticleNetwork() {
  const canvasRef = useRef(null);
  const redrawRef = useRef(null);
  const { theme } = useUI();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
    redrawRef.current?.();
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles = [];
    const pointer = { x: 0, y: 0, active: false };
    let w = 0;
    let h = 0;
    let cfg = settings(window.innerWidth);
    let raf = 0;
    let touchTimer = 0;

    const spawn = () => {
      const angle = Math.random() * Math.PI * 2;
      const v = cfg.speed * (0.4 + Math.random() * 0.6);
      return { x: Math.random() * w, y: Math.random() * h, vx: Math.cos(angle) * v, vy: Math.sin(angle) * v, r: 1.1 + Math.random() * 1.5 };
    };

    const draw = () => {
      const c = PALETTE[themeRef.current === "dark" ? "dark" : "light"];
      const link2 = cfg.link * cfg.link;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      // Garis antar-titik yang berdekatan
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > link2) continue;
          ctx.strokeStyle = `rgba(${c.rgb}, ${(1 - Math.sqrt(d2) / cfg.link) * c.line})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Garis dari kursor ke titik di sekitarnya
      if (pointer.active) {
        ctx.lineWidth = 1.25;
        for (const p of particles) {
          const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
          if (d > cfg.grab) continue;
          ctx.strokeStyle = `rgba(${c.rgb}, ${(1 - d / cfg.grab) * c.grab})`;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      // Titik
      ctx.fillStyle = `rgba(${c.rgb}, ${c.dot})`;
      ctx.beginPath();
      for (const p of particles) {
        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      }
      ctx.fill();
    };
    redrawRef.current = draw;

    const resize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Pertahankan titik yang ada (mis. saat address bar HP muncul/hilang), cukup diskalakan
      if (w && h) {
        for (const p of particles) {
          p.x *= nw / w;
          p.y *= nh / h;
        }
      }
      w = nw;
      h = nh;
      cfg = settings(w);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(cfg.max, Math.round((w * h) / cfg.density));
      while (particles.length < target) particles.push(spawn());
      particles.length = target;
      draw();
    };

    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 0 || p.x > w) {
          p.vx *= -1;
          p.x = Math.max(0, Math.min(w, p.x));
        }
        if (p.y < 0 || p.y > h) {
          p.vy *= -1;
          p.y = Math.max(0, Math.min(h, p.y));
        }
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    const setPointer = (x, y) => {
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
      if (reduceMotion) draw();
    };
    const clearPointer = () => {
      pointer.active = false;
      if (reduceMotion) draw();
    };
    const onPointerMove = (e) => setPointer(e.clientX, e.clientY);
    const onPointerOut = (e) => {
      if (!e.relatedTarget) clearPointer(); // kursor keluar dari jendela
    };
    const onTouch = (e) => {
      const t = e.touches[0];
      if (!t) return;
      clearTimeout(touchTimer);
      setPointer(t.clientX, t.clientY);
    };
    const onTouchEnd = () => {
      clearTimeout(touchTimer);
      touchTimer = setTimeout(clearPointer, 700);
    };

    resize();
    if (!reduceMotion) raf = requestAnimationFrame(tick);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", onPointerOut);
    window.addEventListener("blur", clearPointer);
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(touchTimer);
      redrawRef.current = null;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", clearPointer);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-backdrop">
      <canvas ref={canvasRef} className="block w-full h-full animate-[fade-in_1.2s_ease-out]" />
    </div>
  );
}
