"use client";

import { motion } from "framer-motion";
import Card from "../../components/Card";

export default function Experience() {
  // Variabel untuk animasi urutan (Stagger)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Jeda antar elemen 0.15 detik
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-20 px-6 transition-colors duration-300">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Judul sekarang ikut dalam urutan animasi */}
        <motion.h1 variants={itemVariants} className="text-5xl font-extrabold mb-12 tracking-tighter">
          Pengalaman Profesional.
        </motion.h1>
        
        <div className="space-y-8">
          <motion.div variants={itemVariants}>
            <Card>
              <p className="text-blue-600 font-bold text-sm mb-1 uppercase">Maret 2026 — Sekarang</p>
              <h2 className="text-3xl font-bold">Coding Instructor</h2>
              <p className="text-xl text-gray-500 font-medium mb-6">KodeKiddo</p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                <li className="flex gap-3"><span className="text-blue-600">●</span>Membimbing siswa memahami logika pemrograman dan algoritma.</li>
                <li className="flex gap-3"><span className="text-blue-600">●</span>Menyusun laporan evaluasi perkembangan siswa secara terstruktur.</li>
              </ul>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <p className="text-blue-600 font-bold text-sm mb-1 uppercase">2025 — 2026</p>
              <h2 className="text-3xl font-bold">UI/UX Designer</h2>
              <p className="text-xl text-gray-500 font-medium mb-6">Fruit Sense Project</p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                <li className="flex gap-3"><span className="text-blue-600">●</span>Merancang prototipe interaktif dan user flow menggunakan Figma.</li>
                <li className="flex gap-3"><span className="text-blue-600">●</span>Mengembangkan desain aplikasi deteksi kesegaran buah berbasis AI.</li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}