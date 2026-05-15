"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../components/Card";
import { X, ArrowRight, Award, Calendar, ExternalLink } from "lucide-react";
import Image from "next/image";
import HelpButton from "../../components/element/help"; 
import IntroModal from "../../components/element/IntroModal";

export default function Achievements() {
  const [selectedCert, setSelectedCert] = useState(null);
  const [isIntroOpen, setIsIntroOpen] = useState(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");
    if (!hasSeenIntro) { setIsIntroOpen(true); }
  }, []);

  const closeIntro = () => {
    setIsIntroOpen(false);
    localStorage.setItem("hasSeenIntro", "true");
  };

  const achievementList = [
    { title: "Python Dev", provider: "SoloLearn", date: "04 Februari 2026", image: "/SoloLearn_PythonDev.jpg" },
    { title: "Teaching Fundamentals", provider: "Code.org", date: "04 Februari 2026", image: "/code.org_Teaching.jpg" },
    { title: "Silver Medal", provider: "AISEEF", date: "02 Februari 2026", image: "/AISEEF_Preview.png" },
    { title: "Finalist UI/UX", provider: "FasilkomFest (UPN Jatim)", date: "29 November 2025", image: "/FasilkomFest_Finalist.png" },
    { title: "Peserta UI/UX", provider: "FasilkomFest (UPN Jatim)", date: "29 November 2025", image: "/FasilkomFest_Peserta.png" },
    { title: "Certificate of Author", provider: "10th ICCSCI", date: "01 Agustus 2025", image: "/ICCSCI_Authors.jpg" },
    { title: "Certificate of Oral Presentation", provider: "10th ICCSCI", date: "01 Agustus 2025", image: "/ICCSCI_OralPresentation.jpg" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-20 px-6 transition-colors relative">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto">
        <motion.div variants={itemVariants} className="mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tighter italic">Pencapaian <span className="text-blue-600">&</span> Penghargaan.</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">Kumpulan sertifikasi, kompetisi, dan pengakuan akademik yang telah saya raih sepanjang perjalanan studi dan karier profesional.</p>
        </motion.div>

        {/* --- GRID LIST --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievementList.map((ach, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="group h-full flex flex-col justify-between border-none bg-gray-50 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-800 transition-all border border-transparent hover:border-blue-600/30 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 rounded-[2rem] p-8">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-600/20 text-blue-600 rounded-2xl"><Award size={24} /></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-200/50 dark:bg-white/5 px-3 py-1 rounded-full">{ach.date.split(" ").pop()}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{ach.title}</h3>
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

      {/* MODAL KOMPONEN */}
      <HelpButton onClick={() => setIsIntroOpen(true)} />
      <IntroModal isOpen={isIntroOpen} onClose={closeIntro} />

      {/* --- MODAL PREVIEW --- */}
      <AnimatePresence>
        {selectedCert && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCert(null)} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] cursor-zoom-out" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="fixed inset-0 flex items-center justify-center z-[151] pointer-events-none p-6">
              <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-t-[2.5rem] rounded-b-none overflow-hidden shadow-2xl pointer-events-auto border border-gray-200 dark:border-white/10">
                <div className="p-6 md:px-10 flex justify-between items-center border-b dark:border-white/5 bg-white dark:bg-neutral-900">
                  <div><h2 className="text-xl font-bold italic">{selectedCert.title}</h2><p className="text-sm text-blue-600 font-medium">{selectedCert.provider}</p></div>
                  <button onClick={() => setSelectedCert(null)} className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90"><X size={24} /></button>
                </div>
                <div className="bg-gray-50 dark:bg-black w-full overflow-hidden">
                  {selectedCert.image.endsWith('.pdf') ? (
                    <div className="w-full aspect-video"><iframe src={`${selectedCert.image}#toolbar=0`} className="w-full h-full" title={selectedCert.title} /></div>
                  ) : (
                    <div className="w-full flex flex-col">
                      <Image src={selectedCert.image} alt={selectedCert.title} width={1200} height={800} className="w-full h-auto object-contain" unoptimized />
                      {selectedCert.pdfLink && (
                        <div className="p-6 flex justify-center bg-gray-50 dark:bg-black/40">
                          <a href={selectedCert.pdfLink} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-xl transition-all active:scale-95"><ExternalLink size={16} /> Lihat List Juara Lengkap (PDF)</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}