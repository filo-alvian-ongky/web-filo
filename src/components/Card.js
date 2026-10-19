"use client";

import Reveal from "./ui/Reveal";
import { spring } from "@/lib/motion";

// Kartu One UI. Muncul dengan animasi scroll ala Jitter (lihat Reveal),
// hover/tap tetap memakai spring bawaan 400/25: terangkat halus, tanpa membesar.
export default function Card({ children, className = "", interactive = false, tilt = true, delay = 0, ...props }) {
  return (
    <Reveal
      delay={delay}
      tilt={tilt}
      whileHover={interactive ? { y: -4 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={spring.press}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </Reveal>
  );
}
