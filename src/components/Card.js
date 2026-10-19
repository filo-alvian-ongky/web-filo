"use client";

import { motion } from "framer-motion";
import { fadeUp, spring } from "@/lib/motion";

// Kartu One UI. Tetap memakai animasi bawaan (fade-up + spring 400/25),
// namun efek hover dibuat lebih halus: hanya terangkat, tanpa membesar.
export default function Card({ children, className = "", interactive = false, ...props }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={interactive ? { y: -4 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={spring.press}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
