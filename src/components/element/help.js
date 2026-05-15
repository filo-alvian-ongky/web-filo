"use client";

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function HelpButton({ onClick }) {
  // Mencegah error hidrasi di Next.js dengan memastikan komponen render di client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.button
      // Animasi disederhanakan agar lebih cepat merespons
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: 0.3, // <-- Waktu tunggu dipercepat dari 1.2s menjadi 0.3s
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      // Z-index dinaikkan menjadi z-[90] agar tidak tertutup elemen lain
      className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-[90] p-3 bg-white dark:bg-[#1a1a1a] text-blue-600 rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.1)] border border-gray-200 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-white/5 transition-colors group flex items-center justify-center"
      aria-label="Buka Panduan Navigasi"
    >
      <HelpCircle size={22} strokeWidth={2.5} />
      
      {/* Tooltip */}
      <span className="absolute -top-10 right-0 bg-black dark:bg-white text-white dark:text-black text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block font-medium shadow-md">
        Butuh panduan?
      </span>
    </motion.button>
  );
}