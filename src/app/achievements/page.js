"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../components/Card";
import { X, ArrowRight, Award, Calendar, ExternalLink } from "lucide-react";
import Image from "next/image";
import HelpButton from "../../components/element/help";
import IntroModal from "../../components/element/IntroModal";
import Footer from "../../components/Footer";

export default function Achievements() {
  const [selectedCert, setSelectedCert] = useState(null);
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");
    if (!hasSeenIntro) { setIsIntroOpen(true); }
  }, []);

  const closeIntro = () => { setIsIntroOpen(false); localStorage.setItem("hasSeenIntro", "true"); };

  const achievementList = [
    { title: "Python Dev", provider: "SoloLearn", date: "04 Februari 2026", image: "/SoloLearn_PythonDev.jpg" },
    { title: "Teaching Fundamentals", provider: "Code.org", date: "04 Februari 2026", image: "/code.org_Teaching.jpg" },
    { title: "Silver Medal", provider: "AISEEF", date: "02 Februari 2026", image: "/AISEEF_Preview.png" },
    { title: "Finalist UI/UX", provider: "FasilkomFest (UPN Jatim)", date: "29 November 2025", image: "/FasilkomFest_Finalist.png" },
    { title: "Peserta UI/UX", provider: "FasilkomFest (UPN Jatim)", date: "29 November 2025", image: "/FasilkomFest_Peserta.png" },
    { title: "Certificate of Author", provider: "10th ICCSCI", date: "01 Agustus 2025", image: "/ICCSCI_Authors.jpg" },
    { title: "Certificate of Oral Presentation", provider: "10th ICCSCI", date: "01 Agustus 2025", image: "/ICCSCI_OralPresentation.jpg" },
  ];

  const socialLinks = [
    { name: "Gmail", iconPath: "/gmail.jpg", href: "mailto:filoalvianongky@gmail.com" },
    { name: "Instagram", iconPath: "/ig.jpg", href: "https://instagram.com/filoalvianongky" },
    { name: "WhatsApp", iconPath: "/wa.png", href: "https://wa.me/6282140464565" }
  ];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-300 flex flex-col justify-between relative overflow-hidden">
      
      {/* Konten Utama */}
      <div className="w-full pt-32 pb-20 px-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto">
          <motion.div variants={itemVariants} className="mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tighter italic">Pencapaian <span className="text-blue-600">&</span> Penghargaan.</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl font-medium">Kumpulan sertifikasi kompetensi, medali internasional, dan pengakuan riset akademik yang divalidasi oleh institusi global.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievementList.map((ach, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="group h-full flex flex-col justify-between border-none bg-gray-50 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-800 transition-all border border-transparent hover:border-blue-600/30 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 rounded-[2rem] p-8">
                  <div>
                    <div className="flex justify-between items-start mb-4"><div className="p-3 bg-blue-100 dark:bg-blue-600/20 text-blue-600 rounded-2xl"><Award size={24} /></div><span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-200/50 dark:bg-white/5 px-3 py-1 rounded-full">{ach.date.split(" ").pop()}</span></div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors italic tracking-tight">{ach.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium text-sm mb-6 flex items-center gap-2"><ExternalLink size={14} className="text-blue-600" /> {ach.provider}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-2 text-gray-400"><Calendar size={14} /><span className="text-xs font-medium">{ach.date}</span></div>
                    <button onClick={() => setSelectedCert(ach)} className="flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all active:scale-90">View Detail <ArrowRight size={16} /></button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer Component */}
      <Footer onOpenContact={() => setIsContactOpen(true)} />

      <HelpButton onClick={() => setIsIntroOpen(true)} />
      <IntroModal isOpen={isIntroOpen} onClose={closeIntro} />

      {/* Modal Detail Sertifikat */}
      <AnimatePresence>
        {selectedCert && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCert(null)} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] cursor-zoom-out" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="fixed inset-0 flex items-center justify-center z-[151] pointer-events-none p-6">
              <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden shadow-2xl pointer-events-auto border border-gray-200 dark:border-white/10">
                <div className="p-6 md:px-10 flex justify-between items-center border-b dark:border-white/5 bg-white dark:bg-neutral-900">
                  <div><h2 className="text-xl font-bold italic">{selectedCert.title}</h2><p className="text-sm text-blue-600 font-medium">{selectedCert.provider}</p></div>
                  <button onClick={() => setSelectedCert(null)} className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90"><X size={24} /></button>
                </div>
                <div className="bg-gray-50 dark:bg-black w-full overflow-hidden flex flex-col items-center">
                  <Image src={selectedCert.image} alt={selectedCert.title} width={1200} height={800} className="w-full h-auto object-contain max-h-[70vh]" unoptimized />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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