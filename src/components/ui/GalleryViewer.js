"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { EASE_IOS, spring } from "@/lib/motion";
import { useEscape, useIsClient, useScrollLock } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";

const SWIPE = 80; // px
const SWIPE_VELOCITY = 500; // px/detik

// Gambar baru masuk dari arah geser, gambar lama keluar ke arah sebaliknya
const slide = {
  enter: (dir) => ({ x: dir > 0 ? "40%" : dir < 0 ? "-40%" : 0, opacity: 0, scale: dir ? 1 : 0.94 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { ...spring.sheet, opacity: { duration: 0.2 } } },
  exit: (dir) => ({ x: dir > 0 ? "-40%" : "40%", opacity: 0, transition: { duration: 0.25, ease: EASE_IOS } }),
};

const navBtn =
  "pressable max-md:hidden grid place-items-center absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none";

/**
 * Viewer galeri layar penuh ala Foto iOS: geser (swipe), tombol, atau panah keyboard untuk
 * berpindah gambar; ketuk area kosong / Esc untuk menutup.
 * @param images   [{ image, thumb }]
 * @param index    gambar yang dibuka (null = tertutup)
 * @param onIndex  (index) => void
 * @param altOf    (index) => teks alternatif gambar
 */
export default function GalleryViewer({ images, index, onIndex, onClose, altOf }) {
  const { t } = useLang();
  const isClient = useIsClient();
  const [direction, setDirection] = useState(0);
  const closeRef = useRef(null);
  // Gerakan geser jangan dianggap ketukan "tutup" saat jari dilepas
  const dragged = useRef(false);
  const open = index !== null && index >= 0 && index < images.length;
  const count = images.length;

  useScrollLock(open);
  useEscape(open, onClose);

  const show = useCallback(
    (next) => {
      if (next < 0 || next >= count || next === index) return;
      setDirection(next > index ? 1 : -1);
      onIndex(next);
    },
    [count, index, onIndex]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "ArrowLeft") show(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, show]);

  // Fokus ke tombol tutup saat terbuka, kembalikan fokus saat ditutup
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const id = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(id);
      setDirection(0);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="gallery"
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label={altOf(index)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex flex-col bg-black/90 backdrop-blur-2xl text-white"
        >
          <div className="flex items-center justify-between gap-4 px-4 md:px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
            <p className="text-sm font-semibold tabular-nums text-white/75" aria-live="polite">
              {count > 1 ? `${index + 1} / ${count}` : ""}
            </p>
            <button ref={closeRef} onClick={onClose} aria-label={t.close} className="pressable grid place-items-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20">
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className="relative flex-1 min-h-0 overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                drag={count > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragStart={() => (dragged.current = true)}
                onDragEnd={(_, { offset, velocity }) => {
                  if (offset.x < -SWIPE || velocity.x < -SWIPE_VELOCITY) show(index + 1);
                  else if (offset.x > SWIPE || velocity.x > SWIPE_VELOCITY) show(index - 1);
                }}
                onClick={(e) => {
                  const wasDrag = dragged.current;
                  dragged.current = false;
                  if (!wasDrag && e.target === e.currentTarget) onClose();
                }}
                className="absolute inset-0 flex items-center justify-center p-4 md:px-24 md:py-6"
              >
                <Image
                  src={images[index].image}
                  alt={altOf(index)}
                  width={1600}
                  height={1000}
                  draggable={false}
                  className="w-auto h-auto max-w-full max-h-full object-contain rounded-2xl select-none shadow-float"
                />
              </motion.div>
            </AnimatePresence>

            {count > 1 && (
              <>
                <button onClick={() => show(index - 1)} disabled={index === 0} aria-label={t.prevImage} className={`${navBtn} left-5`}>
                  <ChevronLeft size={24} strokeWidth={2.25} />
                </button>
                <button onClick={() => show(index + 1)} disabled={index === count - 1} aria-label={t.nextImage} className={`${navBtn} right-5`}>
                  <ChevronRight size={24} strokeWidth={2.25} />
                </button>
              </>
            )}
          </div>

          {/* Strip thumbnail: lompat langsung ke gambar tertentu */}
          {count > 1 ? (
            <div className="overflow-x-auto no-scrollbar px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex gap-2 w-max mx-auto">
                {images.map((img, i) => (
                  <button
                    key={img.image}
                    onClick={() => show(i)}
                    aria-label={altOf(i)}
                    aria-current={i === index}
                    className={`pressable relative shrink-0 w-14 h-14 rounded-xl overflow-hidden ring-2 transition-opacity ${
                      i === index ? "ring-white opacity-100" : "ring-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image src={img.thumb} alt="" fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-[max(1rem,env(safe-area-inset-bottom))]" />
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
