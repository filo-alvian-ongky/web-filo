"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/Card";
import Typewriter from "typewriter-effect";
import Image from "next/image";
import { X, ArrowRight } from "lucide-react"; 
import HelpButton from "../components/element/help";
import IntroModal from "../components/element/IntroModal";

export default function Home() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
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
  const textVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  const socialLinks = [
    { name: "Gmail", iconPath: "/gmail.jpg", href: "mailto:filoalvianongky@gmail.com" },
    { name: "Instagram", iconPath: "/ig.jpg", href: "https://instagram.com/filoalvianongky" },
    { name: "WhatsApp", iconPath: "/wa.png", href: "https://wa.me/6282140464565" }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-300 pb-20 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <motion.section initial="hidden" animate="visible" variants={containerVariants} className="pt-32 pb-16 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <div className="flex-1 space-y-6 w-full">
            <motion.div variants={textVariants} className="flex items-center justify-center md:justify-start min-h-[100px] md:min-h-[140px] overflow-hidden">
              <h1 className="font-extrabold tracking-tighter leading-tight whitespace-nowrap text-[clamp(1.5rem,6vw,4rem)] w-full">
                <Typewriter options={{ autoStart: true, loop: true, delay: 60, deleteSpeed: 40 }} onInit={(tw) => { tw.typeString('Halo, pengunjung!').pauseFor(1500).deleteAll().typeString('Salam kenal ya!').pauseFor(1500).deleteAll().start(); }} />
              </h1>
            </motion.div>
            <motion.p variants={textVariants} className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-light max-w-lg mx-auto md:mx-0 leading-relaxed text-center md:text-left">
              Saya <span className="font-bold text-blue-600">Filo Alvian Ongky</span>, Mahasiswa Ilmu Komputer berdedikasi dengan fokus pada pengembangan sistem cerdas dan UI/UX di <span className="font-bold text-blue-600">BINUS University</span>.
            </motion.p>
            <motion.div variants={textVariants} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <button onClick={() => setIsContactOpen(true)} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-blue-700 transition-all text-center shadow-lg shadow-blue-500/20 active:scale-95 font-bold">Hubungi Saya</button>
              <a href="/cv.pdf" className="border border-gray-200 dark:border-white/10 px-8 py-3.5 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-center active:scale-95 inline-block font-bold">Unduh CV</a>
            </motion.div>
          </div>
          <motion.div variants={textVariants} className="w-48 h-48 md:w-72 md:h-72 shrink-0 relative order-first md:order-last cursor-pointer group" onClick={() => setIsPreviewOpen(true)} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <div className="bg-gray-50 dark:bg-neutral-900 rounded-[3.5rem] w-full h-full relative z-10 shadow-2xl border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-blue-500/20 group-hover:border-blue-600/30"><Image src="/profile.jpeg" alt="Foto Profil" fill className="object-cover" priority /></div>
          </motion.div>
        </motion.section>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="h-full flex flex-col justify-center gap-6 border-none text-left transition-all hover:shadow-lg rounded-[2.5rem] p-8">
              <h2 className="text-2xl font-bold tracking-tight text-blue-600">🏆 Achievements</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-600 pl-4 transition-transform hover:translate-x-1 cursor-default"><h3 className="font-bold">🥈 Silver Medalist</h3><p className="text-sm text-gray-500">AISEEF - 2026</p></div>
                <div className="border-l-4 border-blue-600 pl-4 transition-transform hover:translate-x-1 cursor-default"><h3 className="font-bold">🎖️ National Finalist</h3><p className="text-sm text-gray-500">Fasilkomfest - 2026</p></div>
              </div>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="h-full border-none text-left rounded-[2.5rem] p-8">
              <h2 className="text-2xl font-bold tracking-tight mb-6 text-blue-600">🌟 Eksplorasi</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="bg-white dark:bg-black p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 transition-all hover:-translate-y-1 hover:shadow-md active:scale-[0.98] cursor-default font-bold"><p className="text-blue-600 mb-2">🎨 UI/UX & Web Dev</p><p className="text-gray-600 dark:text-gray-400 font-medium">Freelance UI/UX Designer & Fullstack Developer menggunakan Next.js & Figma.</p></div>
                <div className="bg-white dark:bg-black p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 transition-all hover:-translate-y-1 hover:shadow-md active:scale-[0.98] cursor-default font-bold"><p className="text-blue-600 mb-2">📑 Riset IoT</p><p className="text-gray-600 dark:text-gray-400 font-medium">Penulis publikasi ilmiah mengenai pemantauan stres berbasis sensor biometrik di Procedia CS.</p></div>
                <div className="bg-white dark:bg-black p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 sm:col-span-2 text-left transition-all hover:-translate-y-1 hover:shadow-md active:scale-[0.98] cursor-default font-bold"><p className="text-blue-600 mb-2">📈 Analisis Pasar</p><p className="text-gray-600 dark:text-gray-400 font-medium">Investasi rutin aset emas dan pemantauan saham NASDAQ-100 (QQQ) & NVIDIA.</p></div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>

      <HelpButton onClick={() => setIsIntroOpen(true)} />
      <IntroModal isOpen={isIntroOpen} onClose={closeIntro} />

      <AnimatePresence>
        {isContactOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsContactOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] cursor-zoom-out" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-0 flex items-center justify-center z-[111] pointer-events-none p-6">
              <div className="bg-white dark:bg-[#121212] w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl pointer-events-auto border border-gray-100 dark:border-white/10 p-8 text-left">
                <div className="flex justify-between items-center mb-8 text-black dark:text-white"><h2 className="text-2xl font-bold tracking-tighter italic">Hubungi Saya</h2><button onClick={() => setIsContactOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-transform active:scale-90"><X size={20} /></button></div>
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

      <AnimatePresence>
        {isPreviewOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPreviewOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] cursor-zoom-out" />
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-6">
              <div className="relative w-full max-w-lg aspect-square bg-gray-900 rounded-[3.5rem] overflow-hidden shadow-2xl pointer-events-auto border border-white/10">
                <Image src="/profile.jpeg" alt="Preview Profil" fill className="object-cover" />
                <button onClick={() => setIsPreviewOpen(false)} className="absolute top-6 right-6 p-3 bg-black/50 backdrop-blur-md text-white rounded-2xl hover:bg-red-500 transition-transform active:scale-90"><X size={24} strokeWidth={2.5} /></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}