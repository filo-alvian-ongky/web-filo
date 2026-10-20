"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { EASE_IOS } from "@/lib/motion";

/** Angka yang menghitung naik saat pertama kali terlihat */
export default function CountUp({ value, duration = 1.6, className }) {
  const ref = useRef(null);
  // Margin hanya vertikal: angka kecil di tepi kiri layar tetap dianggap terlihat
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const controls = animate(count, value, { duration, ease: EASE_IOS });
    return () => controls.stop();
  }, [inView, reduceMotion, value, duration, count]);

  return (
    <motion.span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {reduceMotion ? value : rounded}
    </motion.span>
  );
}
