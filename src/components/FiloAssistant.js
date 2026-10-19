"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { ArrowUp, Bot, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { spring } from "@/lib/motion";
import { useEscape, useIsClient, useMediaQuery, useScrollLock } from "@/lib/hooks";
import { useUI } from "./providers/UIProvider";
import { useLang } from "@/lib/i18n";

const markdown = {
  p: (props) => <p className="mb-2 last:mb-0" {...props} />,
  ul: (props) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
  ol: (props) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  strong: (props) => <strong className="font-semibold text-accent-fg" {...props} />,
  em: (props) => <em className="italic" {...props} />,
};

function TypingBubble({ label }) {
  return (
    <div className="flex justify-start" aria-label={label}>
      <div className="flex items-center gap-1 px-4 py-3.5 rounded-[20px] rounded-bl-md bg-surface-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-fg-3"
            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

export default function FiloAssistant() {
  const { aiOpen: isOpen, closeAI: onClose } = useUI();
  const { lang, t } = useLang();
  // Sapaan pembuka dirender dari kamus (ikut bahasa aktif), riwayat chat dimulai kosong
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const isSendingRef = useRef(false);

  const isClient = useIsClient();
  const isMobile = !useMediaQuery("(min-width: 768px)", true);
  const controls = useDragControls();

  useScrollLock(isOpen && isMobile);
  useEscape(isOpen, onClose);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen || isMobile) return;
    const id = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(id);
  }, [isOpen, isMobile]);

  const sendMessage = async (preset) => {
    const text = (preset ?? input).trim();
    if (!text || isTyping || isSendingRef.current) return;

    isSendingRef.current = true;
    setIsTyping(true);

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], lang }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghubungi AI");

      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: t.aiError }]);
    } finally {
      setIsTyping(false);
      isSendingRef.current = false;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isClient) return null;

  const panelMotion = isMobile
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: spring.sheet }
    : { initial: { opacity: 0, x: 100 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 100 }, transition: spring.panel };

  const dragProps = isMobile
    ? {
        drag: "y",
        dragControls: controls,
        dragListener: false,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0.04, bottom: 0.9 },
        onDragEnd: (_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 550) onClose();
        },
      }
    : {};

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div key="ai" className="fixed inset-0 z-[190] pointer-events-none">
          {isMobile && (
            <motion.div
              className="absolute inset-0 bg-black/45 backdrop-blur-[3px] pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
          )}
          <motion.div
            role="dialog"
            aria-label="Filo Career AI"
            {...panelMotion}
            {...dragProps}
            className="pointer-events-auto absolute inset-x-0 bottom-0 h-[88svh] rounded-t-[2rem] md:inset-x-auto md:bottom-6 md:right-6 md:h-[600px] md:max-h-[calc(100vh-7rem)] md:w-[400px] md:rounded-[2rem] bg-surface shadow-float flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div onPointerDown={(e) => isMobile && controls.start(e)} className={`shrink-0 border-b border-separator ${isMobile ? "touch-none" : ""}`}>
              {isMobile && <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-fg-3/40" />}
              <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center w-10 h-10 rounded-[13px] bg-gradient-to-br from-[#3b8bff] to-[#4f46e5] text-white">
                    <Bot size={21} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-fg leading-tight">Filo Career AI</h3>
                    <p className="flex items-center gap-1.5 text-xs text-fg-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> {t.aiActive}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} aria-label={t.aiClose} className="pressable grid place-items-center w-9 h-9 rounded-full bg-surface-2 text-fg-2 hover:text-fg">
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Riwayat chat */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-2.5" aria-live="polite">
              <div className="flex justify-start">
                <div className="max-w-[82%] px-4 py-2.5 text-[14px] leading-relaxed bg-surface-2 text-fg rounded-[20px] rounded-bl-md">{t.aiGreeting}</div>
              </div>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] px-4 py-2.5 text-[14px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent text-white rounded-[20px] rounded-br-md whitespace-pre-wrap"
                        : "bg-surface-2 text-fg rounded-[20px] rounded-bl-md"
                    }`}
                  >
                    {msg.role === "user" ? msg.content : <ReactMarkdown components={markdown}>{msg.content}</ReactMarkdown>}
                  </div>
                </div>
              ))}
              {isTyping && <TypingBubble label={t.aiTyping} />}

              {messages.length === 0 && !isTyping && (
                <div className="pt-3 flex flex-wrap gap-2">
                  {t.aiSuggestions.map((s) => (
                    <button key={s} onClick={() => sendMessage(s)} className="pressable h-9 px-3.5 rounded-full text-[13px] font-semibold bg-accent-soft text-accent-fg">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-separator px-3 pt-3 pb-3 md:pb-3" style={{ paddingBottom: isMobile ? "max(env(safe-area-inset-bottom), 12px)" : undefined }}>
              <div className="flex items-center gap-2 pl-4 pr-1.5 h-12 rounded-full bg-surface-2 ring-1 ring-transparent focus-within:ring-accent/50 transition-shadow">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.aiPlaceholder}
                  aria-label={t.aiInput}
                  className="flex-1 min-w-0 bg-transparent outline-none text-base md:text-[15px] text-fg placeholder:text-fg-3"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isTyping || !input.trim()}
                  aria-label={t.aiSend}
                  className="pressable grid place-items-center w-9 h-9 rounded-full bg-accent text-white disabled:opacity-40"
                >
                  <ArrowUp size={18} strokeWidth={2.75} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
