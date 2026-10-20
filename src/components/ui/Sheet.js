"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { X } from "lucide-react";
import { spring } from "@/lib/motion";
import { useEscape, useIsClient, useMediaQuery, useScrollLock } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";

const SIZES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-4xl",
};

/**
 * Sheet ala iOS.
 * - Ponsel: muncul dari bawah, bisa ditutup dengan menarik grabber ke bawah.
 * - Desktop: dialog di tengah dengan animasi skala bawaan website.
 */
export default function Sheet({ open, onClose, title, subtitle, children, size = "md", bodyClassName = "p-5 md:p-6" }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isClient = useIsClient();
  const controls = useDragControls();
  const panelRef = useRef(null);
  const { t } = useLang();

  useScrollLock(open);
  useEscape(open, onClose);

  // Fokus ke sheet saat terbuka, kembalikan fokus saat ditutup
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const id = requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(id);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!isClient) return null;

  const header = (
    <div className="flex items-start justify-between gap-4 px-5 md:px-6 pt-2 md:pt-6 pb-3">
      <div className="min-w-0">
        {title && <h2 className="text-xl md:text-2xl font-bold tracking-tight text-fg">{title}</h2>}
        {subtitle && <p className="text-sm text-fg-2 mt-0.5">{subtitle}</p>}
      </div>
      <button onClick={onClose} aria-label={t.close} className="pressable shrink-0 grid place-items-center w-9 h-9 rounded-full bg-surface-2 text-fg-2 hover:text-fg">
        <X size={18} strokeWidth={2.5} />
      </button>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {open && (
        // data-lenis-prevent: isi sheet di-scroll secara native, bukan oleh smooth scroll halaman
        <div key="sheet" data-lenis-prevent className="fixed inset-0 z-[200]">
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          {isDesktop ? (
            <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
              <motion.div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                tabIndex={-1}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                transition={spring.sheet}
                className={`pointer-events-auto w-full ${SIZES[size]} max-h-[88vh] flex flex-col bg-surface rounded-[2rem] shadow-float overflow-hidden outline-none`}
              >
                {header}
                <div className={`overflow-y-auto overscroll-contain ${bodyClassName}`}>{children}</div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              tabIndex={-1}
              drag="y"
              dragControls={controls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.04, bottom: 0.9 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 110 || info.velocity.y > 550) onClose();
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={spring.sheet}
              className="absolute inset-x-0 bottom-0 max-h-[92svh] flex flex-col bg-surface rounded-t-[2rem] shadow-float outline-none"
            >
              <div onPointerDown={(e) => controls.start(e)} className="touch-none cursor-grab active:cursor-grabbing shrink-0">
                <div className="mx-auto mt-2.5 mb-1 h-1.5 w-10 rounded-full bg-fg-3/40" />
                {header}
              </div>
              <div className={`overflow-y-auto overscroll-contain pb-safe ${bodyClassName}`}>{children}</div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
