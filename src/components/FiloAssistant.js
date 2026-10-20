"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { ArrowUp, Bot, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { spring } from "@/lib/motion";
import { safeHttpUrl } from "@/lib/embeds.mjs";
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
  // Link dari jawaban AI: hanya http(s)/mailto, selalu tab baru tanpa akses ke halaman ini
  a: ({ node, href, children, ...props }) => {
    const safe = href?.startsWith("mailto:") ? href : safeHttpUrl(href);
    if (!safe) return <span>{children}</span>;
    return (
      <a href={safe} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-accent-fg underline underline-offset-2" {...props}>
        {children}
      </a>
    );
  },
  // Gambar dari jawaban AI tidak ditampilkan (mencegah pelacakan / konten asing)
  img: () => null,
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

// Riwayat yang dikirim ke AI (sama dengan batas di server /api/chat)
const MAX_TURNS = 12;
const MAX_CHARS = 1000;

// Ditolak server karena aturan (batas pesan, validasi, dll.) → tidak perlu diulang tanpa streaming
class ChatRejected extends Error {}

/**
 * Minta jawaban AI. Utamanya streaming (teks muncul bertahap lewat `onChunk`);
 * bila browser/jaringan/server gagal mengalirkan, ulangi sekali tanpa streaming.
 */
async function requestAnswer(history, lang, onChunk) {
  const post = (stream) =>
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, lang, stream }),
    });

  let streamed = "";
  try {
    const res = await post(true);
    if (res.ok && res.body && res.headers.get("content-type")?.startsWith("text/plain")) {
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        streamed += value;
        onChunk(streamed);
      }
      if (streamed.trim()) return streamed;
    } else if (res.status < 500) {
      const data = await res.json().catch(() => ({}));
      throw new ChatRejected(data.error);
    }
  } catch (error) {
    if (error instanceof ChatRejected) throw error;
    // Aliran terputus di tengah jalan → pertahankan jawaban yang sudah sampai
    if (streamed.trim()) return streamed;
    console.warn("Streaming gagal, beralih ke mode biasa:", error);
  }

  const res = await post(false);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal menghubungi AI");
  return data.content;
}

export default function FiloAssistant() {
  const { aiOpen: isOpen, closeAI: onClose } = useUI();
  const { lang, t } = useLang();
  // Sapaan pembuka dirender dari kamus (ikut bahasa aktif), riwayat chat dimulai kosong
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // Saran pertanyaan dari konten CMS ({ id: [...], en: [...] }); sebelum termuat pakai kamus
  const [suggestions, setSuggestions] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const isSendingRef = useRef(false);
  const nextIdRef = useRef(0);
  // Ikuti jawaban yang sedang mengalir hanya bila pengunjung tidak sedang menggulir ke atas
  const stickToBottomRef = useRef(true);

  const isClient = useIsClient();
  const isMobile = !useMediaQuery("(min-width: 768px)", true);
  const controls = useDragControls();

  useScrollLock(isOpen && isMobile);
  useEscape(isOpen, onClose);

  useEffect(() => {
    if (scrollRef.current && stickToBottomRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen || isMobile) return;
    const id = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(id);
  }, [isOpen, isMobile]);

  // Saran dimuat sekali saat panel pertama kali dibuka (gagal → tetap saran bawaan)
  useEffect(() => {
    if (!isOpen || suggestions) return;
    let alive = true;
    fetch("/api/chat/suggestions")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (alive && data?.id?.length) setSuggestions(data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [isOpen, suggestions]);

  const sendMessage = async (preset) => {
    const text = (preset ?? input).trim();
    if (!text || isTyping || isSendingRef.current) return;

    isSendingRef.current = true;
    stickToBottomRef.current = true;
    setIsTyping(true);

    const userMsg = { id: nextIdRef.current++, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Riwayat untuk AI: tanpa pesan error, hanya beberapa pesan terakhir & dipotong
    const history = [...messages, userMsg]
      .filter((m) => !m.error)
      .slice(-MAX_TURNS)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

    const replyId = nextIdRef.current++;
    const showReply = (content, extra) =>
      setMessages((prev) => {
        const reply = { id: replyId, role: "assistant", content, ...extra };
        const i = prev.findIndex((m) => m.id === replyId);
        return i === -1 ? [...prev, reply] : prev.map((m, j) => (j === i ? reply : m));
      });

    try {
      showReply(await requestAnswer(history, lang, (partial) => showReply(partial, { streaming: true })));
    } catch (error) {
      console.error("Chat Error:", error);
      showReply(t.aiError, { error: true });
    } finally {
      setIsTyping(false);
      isSendingRef.current = false;
    }
  };

  const chips = suggestions?.[lang]?.length ? suggestions[lang] : t.aiSuggestions;
  // Titik "mengetik" hanya sampai potongan jawaban pertama muncul
  const waiting = isTyping && messages.at(-1)?.role === "user";

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
            // Riwayat chat di-scroll native (bukan ikut menggulir halaman lewat smooth scroll)
            data-lenis-prevent
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
            <div
              ref={scrollRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
              }}
              className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-2.5"
              aria-live="polite"
              // Pembaca layar menunggu jawaban selesai mengalir sebelum membacakannya
              aria-busy={isTyping}
            >
              <div className="flex justify-start">
                <div className="max-w-[82%] px-4 py-2.5 text-[14px] leading-relaxed bg-surface-2 text-fg rounded-[20px] rounded-bl-md">{t.aiGreeting}</div>
              </div>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
              {waiting && <TypingBubble label={t.aiTyping} />}

              {messages.length === 0 && !isTyping && (
                <div className="pt-3 flex flex-wrap gap-2">
                  {chips.map((s) => (
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
                  maxLength={1000}
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
