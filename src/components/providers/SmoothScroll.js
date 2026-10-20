"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { setLenis } from "@/lib/smoothScroll";

/**
 * Smooth scroll ber-inersia (Lenis) — fondasi efek scrollytelling.
 * Hanya untuk perangkat dengan kursor (mouse/trackpad); di HP scroll bawaan
 * sudah halus dan lebih hemat baterai. Nonaktif bila pengguna memilih "kurangi gerakan".
 */
export default function SmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis = null;

    const sync = () => {
      const enable = fine.matches && !reduce.matches;
      if (enable && !lenis) {
        lenis = new Lenis({
          autoRaf: true,
          lerp: 0.1,
          anchors: true,
          // Klik tautan internal menghentikan sisa luncuran agar halaman baru mulai dari atas dengan tenang
          stopInertiaOnNavigate: true,
        });
        setLenis(lenis);
      } else if (!enable && lenis) {
        lenis.destroy();
        lenis = null;
        setLenis(null);
      }
    };

    sync();
    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
