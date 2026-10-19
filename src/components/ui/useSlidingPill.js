"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import { animate, useMotionValue } from "framer-motion";
import { spring } from "@/lib/motion";

/**
 * Indikator "pil" yang bergeser di antara item navigasi.
 * Posisi diukur dari offsetLeft/Top item terhadap container-nya, sehingga
 * tidak terpengaruh posisi scroll halaman (masalah umum layoutId pada elemen fixed).
 *
 * Pakai: container `relative`, pil `absolute top-0 left-0` dengan `style={style}`,
 * dan setiap item diberi `ref={register(key)}`.
 */
export function useSlidingPill(activeKey, transition = spring.snappy) {
  const items = useRef({});
  const callbacks = useRef({});
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const opacity = useMotionValue(0);

  const register = useCallback((key) => {
    if (!callbacks.current[key]) {
      callbacks.current[key] = (el) => {
        if (el) items.current[key] = el;
        else delete items.current[key];
      };
    }
    return callbacks.current[key];
  }, []);

  useLayoutEffect(() => {
    const update = (instant) => {
      const el = items.current[activeKey];
      if (!el) {
        opacity.set(0);
        return;
      }
      const target = { x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight };
      if (instant || opacity.get() === 0) {
        // jump() juga menghentikan animasi yang sedang berjalan
        x.jump(target.x);
        y.jump(target.y);
        width.jump(target.width);
        height.jump(target.height);
        opacity.set(1);
      } else {
        animate(x, target.x, transition);
        animate(y, target.y, transition);
        animate(width, target.width, transition);
        animate(height, target.height, transition);
      }
    };

    update(false);

    // Ukur ulang tanpa animasi saat ukuran berubah (font selesai dimuat, resize, ganti bahasa)
    let initial = true;
    const ro = new ResizeObserver(() => {
      if (initial) {
        initial = false; // panggilan pertama terjadi otomatis saat observe — abaikan
        return;
      }
      update(true);
    });
    Object.values(items.current).forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [activeKey, transition, x, y, width, height, opacity]);

  return { register, style: { x, y, width, height, opacity } };
}
