"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, Zap } from "lucide-react";

export default function FiloAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      // Sapaan disesuaikan agar lebih profesional dan tidak terlalu panjang
      content: "Halo! Saya AI asisten portofolio Filo. Ada yang ingin Anda ketahui tentang proyek, publikasi riset, atau pengalaman kerja Filo?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  
  // State untuk mendeteksi apakah layar saat ini Mobile atau Desktop
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fungsi mengecek lebar layar (768px adalah breakpoint 'md' di Tailwind)
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Cek saat pertama kali komponen dimuat
    checkScreenSize();

    // Pasang event listener jika user meresize browser
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghubungi AI");

      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "Maaf, sistem AI sedang sibuk. Silakan coba beberapa saat lagi." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 🚀 LOGIKA ANIMASI DINAMIS (RESPONSIVE ANIMATION)
  const animationVariants = isMobile
    ? {
        // MOBILE: Slide dari bawah (Y axis)
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" },
      }
    : {
        // DESKTOP: Slide dari samping kanan (X axis)
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // Terapkan varian animasi berdasarkan deteksi layar
          initial={animationVariants.initial}
          animate={animationVariants.animate}
          exit={animationVariants.exit}
          // Transisi tipe pegas (spring) untuk efek slide yang elegan
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 right-0 md:bottom-24 md:right-8 z-[999] w-full md:w-[400px] h-[calc(100vh-80px)] md:h-[550px] bg-white dark:bg-[#0d0d0d] border-t md:border border-gray-200 dark:border-white/10 rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-tight uppercase">Filo Career AI</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <p className="text-[9px] font-mono opacity-80 uppercase tracking-widest">Active</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors active:scale-90">
              <X size={20} />
            </button>
          </div>

          {/* Chat History */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 dark:bg-neutral-900/20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-white/5"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-[10px] text-blue-500 font-mono italic p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 w-fit">
                <Zap size={12} className="animate-bounce" />
                Thinking...
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Tanyakan riset atau proyek Filo..."
                className="w-full bg-white dark:bg-neutral-800 border-none rounded-2xl px-5 py-3.5 text-sm shadow-inner focus:ring-2 ring-blue-500/50 outline-none transition-all dark:text-white placeholder:text-gray-400"
              />
              <button onClick={sendMessage} disabled={isTyping} className="absolute right-1.5 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md active:scale-95">
                <Send size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}