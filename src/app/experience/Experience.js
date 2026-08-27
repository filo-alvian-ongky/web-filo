"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiCplusplus, SiScratch, SiFigma } from "react-icons/si";
import { FaPython, FaCss3, FaJsSquare, FaHtml5 } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { X, ArrowRight } from "lucide-react";
import Image from "next/image";
import Card from "../../components/Card";
import HelpButton from "../../components/element/help";
import IntroModal from "../../components/element/IntroModal";
import Footer from "../../components/Footer";

export default function Experience() {
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

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

  const socialLinks = [
    { name: "Gmail", iconPath: "/gmail.jpg", href: "mailto:filoalvianongky@gmail.com" },
    { name: "Instagram", iconPath: "/ig.jpg", href: "https://instagram.com/filoalvianongky" },
    { name: "WhatsApp", iconPath: "/wa.png", href: "https://wa.me/6282140464565" }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-300 flex flex-col justify-between relative overflow-hidden">
      
      {/* Konten Utama */}
      <div className="w-full pt-32 pb-20 px-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
          <motion.h1 variants={itemVariants} className="text-5xl font-extrabold mb-12 tracking-tighter italic">Pengalaman Profesional.</motion.h1>
          <div className="space-y-8">
            
            {/* Pengalaman 1: KodeKiddo */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-[2.5rem] p-10">
                <p className="text-blue-600 font-bold text-sm mb-1 uppercase tracking-widest">Februari 2026 — Februari 2027</p>
                <h2 className="text-3xl font-bold italic">Coding Instructor</h2>
                <p className="text-xl text-gray-500 font-medium mb-6">KodeKiddo</p>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-6">
                  <li className="flex gap-3"><span className="text-blue-600">●</span>Membimbing siswa memahami logika pemrograman dan algoritma melalui kurikulum berbasis proyek.</li>
                  <li className="flex gap-3"><span className="text-blue-600">●</span>Menyusun laporan evaluasi perkembangan siswa secara terstruktur.</li>
                </ul>
                {/* Tech Stack dengan Icon React lengkap */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-full">
                    <FaHtml5 className="text-orange-600" /> HTML
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-full">
                    <FaCss3 className="text-blue-500" /> CSS
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-full">
                    <FaJsSquare className="text-yellow-400" /> JavaScript
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-full">
                    <SiCplusplus className="text-blue-600" /> C++
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-full">
                    <FaPython className="text-blue-400" /> Python
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-full">
                    <SiScratch className="text-orange-500" /> Scratch
                  </span>
                </div>
              </Card>
            </motion.div>

            {/* Pengalaman 2: FruitSense Project */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-[2.5rem] p-10">
                <p className="text-blue-600 font-bold text-sm mb-1 uppercase tracking-widest">2025 — 2026</p>
                <h2 className="text-3xl font-bold italic">Team Leader & UI/UX Designer</h2>
                <p className="text-xl text-gray-500 font-medium mb-6">FruitSense Project App</p>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-6">
                  <li className="flex gap-3"><span className="text-blue-600">●</span>Merancang prototipe interaktif dan user flow menggunakan Figma.</li>
                  <li className="flex gap-3"><span className="text-blue-600">●</span>Mengembangkan desain aplikasi marketplace buah dan deteksi kualitas buah berbasis AI.</li>
                  <li className="flex gap-3"><span className="text-blue-600">●</span>Mengelola seluruh anggota tim dan memastikan seluruh sistem terintegrasi.</li>
                </ul>
                {/* Tech Stack dengan Icon React */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-full">
                    <SiFigma className="text-pink-500" /> Figma
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-full">
                    <HiSparkles className="text-purple-500" /> AI Concept
                  </span>
                </div>
              </Card>
            </motion.div>

          </div>
        </motion.div>
      </div>

      {/* Footer Component */}
      <Footer onOpenContact={() => setIsContactOpen(true)} />

      <HelpButton onClick={() => setIsIntroOpen(true)} />
      <IntroModal isOpen={isIntroOpen} onClose={closeIntro} />

      {/* Modal Hubungi Saya */}
      <AnimatePresence>
        {isContactOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsContactOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] cursor-zoom-out" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-0 flex items-center justify-center z-[111] pointer-events-none p-6">
              <div className="bg-white dark:bg-[#121212] w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl pointer-events-auto border border-gray-100 dark:border-white/10 p-8 text-left">
                <div className="flex justify-between items-center mb-8 text-black dark:text-white">
                  <h2 className="text-2xl font-bold tracking-tighter italic">Hubungi Saya</h2>
                  <button onClick={() => setIsContactOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-transform active:scale-90"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  {socialLinks.map((link) => (
                    <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 rounded-[1.8rem] border border-gray-100 dark:border-white/5 transition-all group hover:bg-blue-50 dark:hover:bg-blue-600/10 hover:border-blue-600/30 text-black dark:text-white active:scale-95">
                      <div className="relative w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl mr-5 group-hover:scale-110 transition-transform flex items-center justify-center overflow-hidden"><Image src={link.iconPath} alt={link.name} fill className="object-cover" unoptimized={true} /></div>
                      <div className="flex-1"><p className="text-lg font-bold tracking-tight group-hover:text-blue-600 transition-colors italic">{link.name}</p></div>
                      <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </main>
  );
}