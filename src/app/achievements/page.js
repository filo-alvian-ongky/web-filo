"use client";

import { motion } from "framer-motion";
import Card from "../../components/Card";

export default function achievements() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-20 px-6 transition-colors">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        <motion.h1 variants={itemVariants} className="text-5xl font-extrabold mb-12 tracking-tighter">
          Pencapaian & Penghargaan.
        </motion.h1>

        <motion.div variants={itemVariants}>
          <Card className="border-l-8 border-l-blue-600">
            <p className="text-blue-600 font-bold text-sm mb-2 uppercase">Capstone Project | 2025</p>
            <h2 className="text-3xl font-bold mb-4 leading-tight">Implementasi Machine Learning untuk Klasifikasi Kualitas Organik</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              Riset komprehensif pemanfaatan algoritma pendeteksi visual untuk mengklasifikasikan tingkat kesegaran objek melalui pemrosesan citra secara real-time.
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
              Baca Dokumen Lengkap
            </button>
          </Card>
        </motion.div>
      </motion.div>
    </main>
  );
}