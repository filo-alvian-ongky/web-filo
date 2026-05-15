"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Menu, X, Bot, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ onAiClick }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) return null;

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Experience", path: "/experience" },
    { name: "Achievements", path: "/achievements" },
    { name: "Projects", path: "/projects" },
  ];

  return (
    <nav className="fixed w-full z-50 top-0 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="font-bold text-2xl tracking-tighter text-black dark:text-white relative z-[60] active:scale-95 transition-transform duration-200 inline-block">
          <span className="text-blue-600">FiloAlvian</span>.com
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link key={item.name} href={item.path} className={`text-sm font-medium transition-all active:scale-95 inline-block ${pathname === item.path ? "text-blue-600" : "text-gray-500 hover:text-black dark:hover:text-white"}`}>
                {item.name}
              </Link>
            ))}
          </div>

          {/* Group Utilitas: Sama rata & Simetris */}
          <div className="flex items-center space-x-3 border-l border-gray-100 dark:border-white/10 pl-6">
            
            {/* Tombol AI (Style disamakan dengan tombol tema) */}
            <button 
              onClick={onAiClick} 
              className="p-2.5 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-all active:scale-90"
              title="Tanya AI Assistant"
            >
              <Bot size={20} strokeWidth={2.5} />
            </button>

            {/* Tombol Tema */}
            <button 
              onClick={toggleTheme} 
              className="p-2.5 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-all active:scale-90"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={theme} initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {theme === "light" ? <Moon size={20} strokeWidth={2.5} /> : <Sun size={20} strokeWidth={2.5} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Header (Tanpa Bot di Header untuk kebersihan) */}
        <div className="flex md:hidden items-center space-x-3 relative z-[60]">
          <button onClick={toggleTheme} className="p-2.5 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-700 dark:text-gray-300 active:scale-90">
            {theme === "light" ? <Moon size={20} strokeWidth={2.5} /> : <Sun size={20} strokeWidth={2.5} />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2.5 bg-blue-600 text-white rounded-2xl active:scale-90">
            {isOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Hamburger */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-0 left-0 w-full h-screen bg-white dark:bg-[#0a0a0a] z-[50] flex flex-col items-center justify-center space-y-6 px-6">
            {navItems.map((item) => (
              <Link key={item.name} href={item.path} onClick={() => setIsOpen(false)} className={`text-3xl font-bold tracking-tighter transition-all active:scale-90 inline-block ${pathname === item.path ? "text-blue-600" : "text-gray-400"}`}>
                {item.name}
              </Link>
            ))}

            <div className="w-12 h-1 bg-gray-100 dark:bg-white/10 rounded-full my-2"></div>

            {/* AI Assistant Button di Mobile */}
            <button 
              onClick={() => { setIsOpen(false); onAiClick(); }}
              className="flex items-center gap-4 px-8 py-5 bg-blue-600/10 dark:bg-blue-600/20 rounded-[2.5rem] border border-blue-600/20 active:scale-95 transition-all w-full max-w-[300px] group"
            >
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
                <Bot size={24} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">AI Assistant</p>
                <p className="text-xl font-bold text-black dark:text-white tracking-tighter italic">Tanya Filo AI</p>
              </div>
              <ChevronRight size={20} className="ml-auto text-blue-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}