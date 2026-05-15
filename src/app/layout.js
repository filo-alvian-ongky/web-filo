"use client"; // Ubah menjadi client component

import { useState } from "react";
import "./globals.css";
import Navbar from "../components/Navbar";
import FiloAssistant from "../components/FiloAssistant";

export default function RootLayout({ children }) {
  // State global untuk membuka/menutup AI
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <html lang="id" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="antialiased bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors relative">
        {/* Kirim fungsi buka AI ke Navbar */}
        <Navbar onAiClick={() => setIsAiOpen(true)} />
        
        {children}

        {/* Panggil komponen Chat, kirim state dan fungsi tutup */}
        <FiloAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      </body>
    </html>
  );
}