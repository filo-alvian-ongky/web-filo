"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/Card";
import Typewriter from "typewriter-effect";
import Image from "next/image";
import { X, ArrowRight, ExternalLink, Trophy, Sparkles, Medal, Star, Gamepad2, Layout, Cpu } from "lucide-react"; 
import HelpButton from "../components/element/help";
import IntroModal from "../components/element/IntroModal";
import Footer from "../components/Footer";

// Import Ikon Tech Stack
import { 
  FaHtml5, 
  FaCss3, 
  FaJsSquare, 
  FaReact, 
  FaNode, 
  FaGitAlt
} from 'react-icons/fa';
import {
  RiNextjsFill
} from 'react-icons/ri';

export default function Home() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [activeTech, setActiveTech] = useState(null);

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
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-300 flex flex-col justify-between relative overflow-hidden">
      
      {/* Konten Utama */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Hero Section */}
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
              
              {/* Tombol Aksi Utama dengan ExternalLink */}
              <motion.div variants={textVariants} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                <button onClick={() => setIsContactOpen(true)} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-blue-700 transition-all text-center shadow-lg shadow-blue-500/20 active:scale-95 font-bold flex items-center justify-center gap-2">
                  Hubungi Saya <ExternalLink className="w-5 h-5" />
                </button>
                <a href="/cv.pdf" className="border border-gray-200 dark:border-white/10 px-8 py-3.5 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-center active:scale-95 inline-block font-bold">Unduh CV</a>
              </motion.div>

              {/* Dynamic Tech Icons */}
              <motion.div variants={textVariants} className="pt-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center md:text-left">
                  Teknologi yang Digunakan
                </p>
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                  
                  {/* HTML5 */}
                  <div 
                    onClick={() => setActiveTech(activeTech === 'HTML5' ? null : 'HTML5')}
                    className={`group flex items-center p-3 bg-gray-50 dark:bg-neutral-900 border rounded-xl transition-all duration-300 cursor-pointer ${
                      activeTech === 'HTML5' ? 'border-[#E34F26] bg-[#E34F26]/10' : 'border-gray-200 dark:border-neutral-800 hover:border-[#E34F26] hover:bg-[#E34F26]/10'
                    }`}
                  >
                    <FaHtml5 className={`w-5 h-5 transition-colors duration-300 ${activeTech === 'HTML5' ? 'text-[#E34F26]' : 'text-gray-500 group-hover:text-[#E34F26]'}`} />
                    <span className={`overflow-hidden whitespace-nowrap text-xs font-semibold text-black dark:text-white transition-all duration-300 ease-in-out ${activeTech === 'HTML5' ? 'max-w-xs opacity-100 ml-2' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2'}`}>
                      HTML5
                    </span>
                  </div>

                  {/* CSS3 */}
                  <div 
                    onClick={() => setActiveTech(activeTech === 'CSS3' ? null : 'CSS3')}
                    className={`group flex items-center p-3 bg-gray-50 dark:bg-neutral-900 border rounded-xl transition-all duration-300 cursor-pointer ${
                      activeTech === 'CSS3' ? 'border-[#1572B6] bg-[#1572B6]/10' : 'border-gray-200 dark:border-neutral-800 hover:border-[#1572B6] hover:bg-[#1572B6]/10'
                    }`}
                  >
                    <FaCss3 className={`w-5 h-5 transition-colors duration-300 ${activeTech === 'CSS3' ? 'text-[#1572B6]' : 'text-gray-500 group-hover:text-[#1572B6]'}`} />
                    <span className={`overflow-hidden whitespace-nowrap text-xs font-semibold text-black dark:text-white transition-all duration-300 ease-in-out ${activeTech === 'CSS3' ? 'max-w-xs opacity-100 ml-2' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2'}`}>
                      CSS3
                    </span>
                  </div>

                  {/* JavaScript */}
                  <div 
                    onClick={() => setActiveTech(activeTech === 'JavaScript' ? null : 'JavaScript')}
                    className={`group flex items-center p-3 bg-gray-50 dark:bg-neutral-900 border rounded-xl transition-all duration-300 cursor-pointer ${
                      activeTech === 'JavaScript' ? 'border-[#F7DF1E] bg-[#F7DF1E]/10' : 'border-gray-200 dark:border-neutral-800 hover:border-[#F7DF1E] hover:bg-[#F7DF1E]/10'
                    }`}
                  >
                    <FaJsSquare className={`w-5 h-5 transition-colors duration-300 ${activeTech === 'JavaScript' ? 'text-[#F7DF1E]' : 'text-gray-500 group-hover:text-[#F7DF1E]'}`} />
                    <span className={`overflow-hidden whitespace-nowrap text-xs font-semibold text-black dark:text-white transition-all duration-300 ease-in-out ${activeTech === 'JavaScript' ? 'max-w-xs opacity-100 ml-2' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2'}`}>
                      JavaScript
                    </span>
                  </div>

                  {/* React */}
                  <div 
                    onClick={() => setActiveTech(activeTech === 'React' ? null : 'React')}
                    className={`group flex items-center p-3 bg-gray-50 dark:bg-neutral-900 border rounded-xl transition-all duration-300 cursor-pointer ${
                      activeTech === 'React' ? 'border-[#61DAFB] bg-[#61DAFB]/10' : 'border-gray-200 dark:border-neutral-800 hover:border-[#61DAFB] hover:bg-[#61DAFB]/10'
                    }`}
                  >
                    <FaReact className={`w-5 h-5 transition-colors duration-300 ${activeTech === 'React' ? 'text-[#61DAFB]' : 'text-gray-500 group-hover:text-[#61DAFB]'}`} />
                    <span className={`overflow-hidden whitespace-nowrap text-xs font-semibold text-black dark:text-white transition-all duration-300 ease-in-out ${activeTech === 'React' ? 'max-w-xs opacity-100 ml-2' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2'}`}>
                      React
                    </span>
                  </div>

                  {/* Next.js */}
                  <div 
                    onClick={() => setActiveTech(activeTech === 'Next.js' ? null : 'Next.js')}
                    className={`group flex items-center p-3 bg-gray-50 dark:bg-neutral-900 border rounded-xl transition-all duration-300 cursor-pointer ${
                      activeTech === 'Next.js' ? 'border-black dark:border-white bg-black/5 dark:bg-white/10' : 'border-gray-200 dark:border-neutral-800 hover:border-black dark:hover:border-white hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    <RiNextjsFill className={`w-5 h-5 transition-colors duration-300 ${activeTech === 'Next.js' ? 'text-black dark:text-white' : 'text-gray-500 dark:group-hover:text-white group-hover:text-black'}`} />
                    <span className={`overflow-hidden whitespace-nowrap text-xs font-semibold text-black dark:text-white transition-all duration-300 ease-in-out ${activeTech === 'Next.js' ? 'max-w-xs opacity-100 ml-2' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2'}`}>
                      Next.js
                    </span>
                  </div>

                  {/* Node.js */}
                  <div 
                    onClick={() => setActiveTech(activeTech === 'Node.js' ? null : 'Node.js')}
                    className={`group flex items-center p-3 bg-gray-50 dark:bg-neutral-900 border rounded-xl transition-all duration-300 cursor-pointer ${
                      activeTech === 'Node.js' ? 'border-[#5FA04E] bg-[#5FA04E]/10' : 'border-gray-200 dark:border-neutral-800 hover:border-[#5FA04E] hover:bg-[#5FA04E]/10'
                    }`}
                  >
                    <FaNode className={`w-5 h-5 transition-colors duration-300 ${activeTech === 'Node.js' ? 'text-[#5FA04E]' : 'text-gray-500 group-hover:text-[#5FA04E]'}`} />
                    <span className={`overflow-hidden whitespace-nowrap text-xs font-semibold text-black dark:text-white transition-all duration-300 ease-in-out ${activeTech === 'Node.js' ? 'max-w-xs opacity-100 ml-2' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2'}`}>
                      Node.js
                    </span>
                  </div>

                  {/* Git */}
                  <div 
                    onClick={() => setActiveTech(activeTech === 'Git' ? null : 'Git')}
                    className={`group flex items-center p-3 bg-gray-50 dark:bg-neutral-900 border rounded-xl transition-all duration-300 cursor-pointer ${
                      activeTech === 'Git' ? 'border-[#F05032] bg-[#F05032]/10' : 'border-gray-200 dark:border-neutral-800 hover:border-[#F05032] hover:bg-[#F05032]/10'
                    }`}
                  >
                    <FaGitAlt className={`w-5 h-5 transition-colors duration-300 ${activeTech === 'Git' ? 'text-[#F05032]' : 'text-gray-500 group-hover:text-[#F05032]'}`} />
                    <span className={`overflow-hidden whitespace-nowrap text-xs font-semibold text-black dark:text-white transition-all duration-300 ease-in-out ${activeTech === 'Git' ? 'max-w-xs opacity-100 ml-2' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2'}`}>
                      Git
                    </span>
                  </div>

                </div>
              </motion.div>

            </div>

            <motion.div variants={textVariants} className="w-48 h-48 md:w-72 md:h-72 shrink-0 relative order-first md:order-last cursor-pointer group" onClick={() => setIsPreviewOpen(true)} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-[3.5rem] w-full h-full relative z-10 shadow-2xl border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-blue-500/20 group-hover:border-blue-600/30"><Image src="/profile.jpeg" alt="Foto Profil" fill className="object-cover" priority /></div>
            </motion.div>
          </motion.section>

          {/* Achievements & Eksplorasi Section */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="md:col-span-1">
              <Card className="h-full flex flex-col justify-center gap-6 border-none text-left transition-all hover:shadow-lg rounded-[2.5rem] p-8">
                <h2 className="text-2xl font-bold tracking-tight text-blue-600 flex items-center gap-2">
                  <Trophy className="w-6 h-6" /> Pencapaian
                </h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-600 pl-4 transition-transform hover:translate-x-1 cursor-default">
                    <h3 className="font-bold flex items-center gap-2"><Medal className="w-4 h-4 text-blue-500" /> Peraih Medali Perak</h3>
                    <p className="text-sm text-gray-500">AISEEF - 2026</p>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4 transition-transform hover:translate-x-1 cursor-default">
                    <h3 className="font-bold flex items-center gap-2"><Star className="w-4 h-4 text-blue-500" /> Finalis Nasional</h3>
                    <p className="text-sm text-gray-500">Fasilkomfest - 2026</p>
                  </div>
                </div>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card className="h-full border-none text-left rounded-[2.5rem] p-8">
                <h2 className="text-2xl font-bold tracking-tight mb-6 text-blue-600 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" /> Eksplorasi
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div className="bg-white dark:bg-black p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 transition-all hover:-translate-y-1 hover:shadow-md active:scale-[0.98] cursor-default font-bold">
                    <p className="text-black dark:text-white mb-2 flex items-center gap-2">
                      <Layout className="w-4 h-4 text-blue-500" /> UI/UX & Pemrograman Web
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Perancang UI/UX & Fullstack Web Developer menggunakan Next.js & Figma.</p>
                  </div>
                  <div className="bg-white dark:bg-black p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 transition-all hover:-translate-y-1 hover:shadow-md active:scale-[0.98] cursor-default font-bold">
                    <p className="text-black dark:text-white mb-2 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-500" /> Riset IoT
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Penulis publikasi ilmiah mengenai pemantauan stres berbasis sensor biometrik di Procedia CS.</p>
                  </div>
                  <div className="bg-white dark:bg-black p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 sm:col-span-2 text-left transition-all hover:-translate-y-1 hover:shadow-md active:scale-[0.98] cursor-default font-bold">
                    <p className="text-black dark:text-white mb-2 flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-blue-500" /> Level Design & Kreatif
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Berpengalaman sebagai Commissioned Level Designer dalam merancang tata letak dan pengalaman spasial interaktif.</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Footer Component Dipanggil Disini */}
      <Footer onOpenContact={() => setIsContactOpen(true)} />

      <HelpButton onClick={() => setIsIntroOpen(true)} />
      <IntroModal isOpen={isIntroOpen} onClose={closeIntro} />

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

      <AnimatePresence>
        {isPreviewOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPreviewOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] cursor-zoom-out" />
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-6">
              <div className="relative w-full max-w-lg aspect-square bg-gray-900 rounded-[3.5rem] overflow-hidden shadow-2xl pointer-events-auto border border-white/10">
                <Image src="/profile.jpeg" alt="Pratinjau Profil" fill className="object-cover" />
                <button onClick={() => setIsPreviewOpen(false)} className="absolute top-6 right-6 p-3 bg-black/50 backdrop-blur-md text-white rounded-2xl hover:bg-red-500 transition-transform active:scale-90"><X size={24} strokeWidth={2.5} /></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}