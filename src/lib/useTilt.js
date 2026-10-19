"use client";

import { useCallback } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "framer-motion";

const SPRING = { stiffness: 260, damping: 22, mass: 0.6 };

/**
 * Kemiringan 3D yang mengikuti kursor saat kartu di-hover, lalu kembali datar saat kursor keluar.
 * Hanya untuk mouse/trackpad (di layar sentuh tidak aktif).
 * Kartu lebar/tinggi otomatis dimiringkan lebih sedikit supaya tetap nyaman dilihat.
 */
export function useTilt({ max = 8 } = {}) {
  const reduceMotion = useReducedMotion();
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const rotateX = useSpring(targetX, SPRING);
  const rotateY = useSpring(targetY, SPRING);

  const onPointerMove = useCallback(
    (e) => {
      if (reduceMotion || e.pointerType !== "mouse") return;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 (kiri) … 0.5 (kanan)
      const py = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 (atas) … 0.5 (bawah)
      const degX = Math.min(max, 1800 / rect.height);
      const degY = Math.min(max, 2400 / rect.width);
      // Sisi yang didekati kursor terangkat ke arah pengunjung
      targetX.set(py * 2 * degX);
      targetY.set(-px * 2 * degY);
    },
    [max, reduceMotion, targetX, targetY]
  );

  const onPointerLeave = useCallback(() => {
    targetX.set(0);
    targetY.set(0);
  }, [targetX, targetY]);

  // Kembalikan datar seketika (mis. sebelum animasi kartu → viewer)
  const reset = useCallback(() => {
    targetX.jump(0);
    targetY.jump(0);
    rotateX.jump(0);
    rotateY.jump(0);
  }, [targetX, targetY, rotateX, rotateY]);

  return {
    style: { rotateX, rotateY, transformPerspective: 1000 },
    handlers: { onPointerMove, onPointerLeave },
    reset,
  };
}
