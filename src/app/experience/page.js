"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "../../components/Card";
import HelpButton from "../../components/element/help";
import IntroModal from "../../components/element/IntroModal";

export default function Experience() {
  const [isIntroOpen, setIsIntroOpen] = useState(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");
    if (!hasSeenIntro) { setIsIntroOpen(true); }
  }, []);

  const closeIntro = () => {
    setIsIntroOpen(false);
    localStorage.setItem("hasSeenIntro", "true");
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-20 px-6 transition-colors duration-300 relative">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
        <motion.h1 variants={itemVariants} className="text-5xl font-extrabold mb-12 tracking-tighter italic">Pengalaman Profesional.</motion.h1>
        <div className="space-y-8">
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2.5rem] p-10">
              <p className="text-blue-600 font-bold text-sm mb-1 uppercase tracking-widest">Maret 2026 — Sekarang</p>
              <h2 className="text-3xl font-bold italic">Coding Instructor</h2>
              <p className="text-xl text-gray-500 font-medium mb-6">KodeKiddo</p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                <li className="flex gap-3"><span className="text-blue-600">●</span>Membimbing siswa memahami logika pemrograman dan algoritma melalui kurikulum berbasis proyek.</li>
                <li className="flex gap-3"><span className="text-blue-600">●</span>Menyusun laporan evaluasi perkembangan siswa secara terstruktur.</li>
              </ul>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2.5rem] p-10">
              <p className="text-blue-600 font-bold text-sm mb-1 uppercase tracking-widest">2025 — 2026</p>
              <h2 className="text-3xl font-bold italic">UI/UX Designer</h2>
              <p className="text-xl text-gray-500 font-medium mb-6">Fruit Sense Project</p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                <li className="flex gap-3"><span className="text-blue-600">●</span>Merancang prototipe interaktif dan user flow menggunakan Figma.</li>
                <li className="flex gap-3"><span className="text-blue-600">●</span>Mengembangkan desain aplikasi deteksi kesegaran buah berbasis AI.</li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </motion.div>
      <HelpButton onClick={() => setIsIntroOpen(true)} />
      <IntroModal isOpen={isIntroOpen} onClose={closeIntro} />
    </main>
  );
}