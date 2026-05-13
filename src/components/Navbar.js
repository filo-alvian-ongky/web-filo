"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
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
    { name: "Achievements", path: "/achievements" }, // Update di sini
    { name: "Projects", path: "/projects" },
  ];

  return (
    <nav className="fixed w-full z-50 top-0 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        <Link href="/" className="font-bold text-2xl tracking-tighter text-black dark:text-white relative z-[60]">
          <span className="text-blue-600">FiloAlvian</span>.com
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.path} 
                className={`text-sm font-medium transition-colors ${
                  pathname === item.path 
                  ? "text-blue-600" 
                  : "text-gray-500 hover:text-black dark:hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <button onClick={toggleTheme} className="p-2.5 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-all">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={theme} initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.2 }}>
                {theme === "light" ? <Moon size={20} strokeWidth={2.5} /> : <Sun size={20} strokeWidth={2.5} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Action */}
        <div className="flex md:hidden items-center space-x-3 relative z-[60]">
          <button onClick={toggleTheme} className="p-2.5 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-700 dark:text-gray-300">
            {theme === "light" ? <Moon size={20} strokeWidth={2.5} /> : <Sun size={20} strokeWidth={2.5} />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2.5 bg-blue-600 text-white rounded-2xl">
            {isOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-0 left-0 w-full h-screen bg-white dark:bg-[#0a0a0a] z-[50] flex flex-col items-center justify-center space-y-8 px-6">
            {navItems.map((item) => (
              <Link key={item.name} href={item.path} onClick={() => setIsOpen(false)} className={`text-3xl font-bold tracking-tighter ${pathname === item.path ? "text-blue-600" : "text-gray-400"}`}>
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}