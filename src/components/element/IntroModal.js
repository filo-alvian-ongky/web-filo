"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Layout, Menu, Moon, Bot } from "lucide-react"; // Tambahkan import Bot

export default function IntroModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120]" 
          />
          <div className="fixed inset-0 flex items-center justify-center z-[121] p-6 pointer-events-none perspective-[1000px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.1, x: "42vw", y: "42vh", skewY: -30, borderRadius: "100%" }} 
              animate={{ opacity: 1, scale: 1, x: 0, y: 0, skewY: 0, borderRadius: "2.5rem" }} 
              exit={{ opacity: 0, scale: 0, x: "42vw", y: "42vh", skewY: -30, borderRadius: "100%" }} 
              transition={{ type: "spring", stiffness: 180, damping: 25, mass: 0.8 }}
              className="bg-white dark:bg-[#121212] w-full max-w-lg shadow-[0_30px_70px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-white/10 p-8 text-left relative overflow-hidden pointer-events-auto origin-bottom-right"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -z-10 blur-2xl"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 dark:bg-blue-600/20 text-blue-600 rounded-2xl"><Sparkles size={24} /></div>
                <h2 className="text-2xl font-bold tracking-tighter text-black dark:text-white">Panduan Website</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Selamat datang! Agar pengalaman menjelajah Anda lebih nyaman, berikut adalah fungsi menu di bagian atas layar:</p>
              
              {/* DESKTOP LAYOUT (TANPA HAMBURGER MENU) */}
              <div className="hidden md:block space-y-4 mb-8">
                {/* Baris Navigasi */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-default"><p className="font-bold text-black dark:text-white flex items-center gap-2 mb-1"><Layout size={16} className="text-blue-500"/> Home</p><p className="text-xs text-gray-500 dark:text-gray-400">Kembali ke beranda utama ini.</p></div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-default"><p className="font-bold text-black dark:text-white flex items-center gap-2 mb-1"><Layout size={16} className="text-blue-500"/> Experience</p><p className="text-xs text-gray-500 dark:text-gray-400">Melihat riwayat perjalanan.</p></div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-default"><p className="font-bold text-black dark:text-white flex items-center gap-2 mb-1"><Layout size={16} className="text-blue-500"/> Achievements</p><p className="text-xs text-gray-500 dark:text-gray-400">Kumpulan penghargaan saya.</p></div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-default"><p className="font-bold text-black dark:text-white flex items-center gap-2 mb-1"><Layout size={16} className="text-blue-500"/> Projects</p><p className="text-xs text-gray-500 dark:text-gray-400">Melihat detail portofolio.</p></div>
                </div>
                
                {/* Baris Utilitas: AI & Tema */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 flex items-start gap-3 cursor-default">
                    <Bot size={20} className="text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-black dark:text-white text-sm">AI Assistant</p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">Tanya AI seputar karir & portofolio saya.</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-start gap-3 cursor-default">
                    <Moon size={20} className="text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-black dark:text-white text-sm">Tombol Tema</p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">Ubah warna website menjadi Terang/Gelap.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MOBILE LAYOUT (DENGAN HAMBURGER MENU) */}
              <div className="block md:hidden space-y-4 mb-8">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-start gap-3"><Menu size={24} className="text-blue-600 mt-1 shrink-0" /><div><p className="font-bold text-black dark:text-white">Menu Hamburger (☰)</p><p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ketuk ikon garis tiga di pojok atas untuk membuka daftar halaman.</p></div></div>
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-start gap-3"><Moon size={24} className="text-blue-600 mt-1 shrink-0" /><div><p className="font-bold text-black dark:text-white">Tombol Tema</p><p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ketuk ikon untuk mengubah tampilan layar Terang atau Gelap.</p></div></div>
              </div>

              <button onClick={onClose} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg">Paham, Mulai Jelajahi!</button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}