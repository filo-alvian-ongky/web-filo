"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { spring } from "@/lib/motion";
import { useEscape, useScrollLock } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";

/**
 * Viewer presentasi proyek (embed Canva / Figma / Slides / YouTube) layar penuh.
 * Kartu / sampul dengan `layoutId` yang sama "mengembang" menjadi viewer ala App Store iOS.
 * @param project   proyek yang dibuka (null = tertutup)
 * @param layoutId  layoutId elemen asal animasi
 */
export default function PresentationViewer({ project, layoutId, onClose }) {
  const { t } = useLang();
  useScrollLock(!!project);
  useEscape(!!project, onClose);

  return (
    <AnimatePresence>
      {project && (
        <div key="viewer" className="fixed inset-0 z-[200] flex items-center justify-center px-3 md:px-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl cursor-zoom-out"
          />
          <motion.div
            layoutId={layoutId}
            transition={spring.sheet}
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            className="relative w-full max-w-6xl aspect-video rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-neutral-900 shadow-float"
          >
            {/* sandbox: konten embed tidak bisa mengarahkan / mengubah halaman website ini */}
            <iframe
              src={project.embedUrl}
              title={`${t.presentation} ${project.title}`}
              className="w-full h-full border-0"
              allowFullScreen
              allow="autoplay; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <div className="absolute top-3 right-3 md:top-5 md:right-5 flex gap-2">
              {project.linkUrl && (
                <a
                  href={project.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-black/50 backdrop-blur-md text-white text-sm font-semibold hover:bg-black/70"
                >
                  {t.openProject} <ArrowUpRight size={16} />
                </a>
              )}
              <button
                onClick={onClose}
                aria-label={t.closePresentation}
                className="pressable grid place-items-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
