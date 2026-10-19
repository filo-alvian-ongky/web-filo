"use client";

import { motion } from "framer-motion";

// Transisi antar halaman: fade lembut. Hanya opacity (tanpa transform)
// supaya elemen `position: fixed` di dalam halaman tetap aman.
export default function Template({ children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
