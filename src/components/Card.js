"use client";

import Reveal from "./ui/Reveal";

// Kartu One UI. Muncul dengan animasi scroll ala Jitter (lihat Reveal); saat hover hanya miring
// mengikuti kursor. Tidak ada whileHover/whileTap di sini: setelah gesture selesai, framer
// mengembalikan nilainya ke `initial` reveal (turun 56px), sehingga kartu jadi bergeser.
export default function Card({ children, className = "", tilt = true, delay = 0, ...props }) {
  return (
    <Reveal delay={delay} tilt={tilt} className={`card ${className}`} {...props}>
      {children}
    </Reveal>
  );
}
