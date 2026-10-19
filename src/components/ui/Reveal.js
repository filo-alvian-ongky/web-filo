"use client";

import { useRef } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { revealHidden, revealShown } from "@/lib/motion";
import { useTilt } from "@/lib/useTilt";

/**
 * Animasi scroll ala Jitter untuk setiap kartu.
 * - Tiap elemen dipicu sendiri saat masuk layar (bukan per grup), jadi di HP
 *   kartu yang di bawah juga terlihat beranimasi.
 * - Muncul dari bawah + membesar + blur → tajam, dengan pantulan spring.
 * - Kartu dalam satu baris otomatis berurutan kiri → kanan (delay dari posisi X).
 * - `tilt`: kartu miring mengikuti kursor saat di-hover, kembali datar saat kursor keluar.
 */
const TAGS = { div: motion.div, li: motion.li, article: motion.article, section: motion.section };

export default function Reveal({ as = "div", delay = 0, tilt = true, style, children, onPointerMove, onPointerLeave, ...rest }) {
  const ref = useRef(null);
  const controls = useAnimationControls();
  const reduceMotion = useReducedMotion();
  const hoverTilt = useTilt();
  const Component = TAGS[as] ?? motion.div;

  const onEnter = () => {
    const rect = ref.current?.getBoundingClientRect();
    const fromLeft = rect ? Math.min(Math.max(rect.left / window.innerWidth, 0), 1) : 0;
    // Setelah selesai, lepas filter sepenuhnya agar kartu tidak terus dirender sebagai layer terpisah
    controls.start(revealShown(delay + fromLeft * 0.24)).then(() => controls.set({ filter: "none" }));
  };

  return (
    <Component
      ref={ref}
      initial={reduceMotion ? false : revealHidden}
      animate={controls}
      onViewportEnter={onEnter}
      viewport={{ once: true, amount: 0.15 }}
      style={tilt ? { ...hoverTilt.style, ...style } : style}
      onPointerMove={(e) => {
        if (tilt) hoverTilt.handlers.onPointerMove(e);
        onPointerMove?.(e);
      }}
      onPointerLeave={(e) => {
        if (tilt) hoverTilt.handlers.onPointerLeave(e);
        onPointerLeave?.(e);
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}
