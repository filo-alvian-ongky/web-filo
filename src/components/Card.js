"use client";

import { motion } from "framer-motion";

export default function Card({ children, className = "" }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -5, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.98 }}
      className={`bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-10 rounded-[32px] hover:border-blue-600/30 dark:hover:border-blue-600/30 transition-colors duration-300 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}