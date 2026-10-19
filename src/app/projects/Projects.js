"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Apple, BarChart3, Cpu, Play, X } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import { chip } from "../../components/ui/styles";
import { projects } from "@/lib/data";
import { fadeUp, spring, stagger } from "@/lib/motion";
import { useEscape, useScrollLock } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";

function ProjectArt({ icon }) {
  if (icon === "apple") return <Apple size={96} strokeWidth={1.5} className="text-white drop-shadow-lg" />;
  return (
    <div className="relative">
      <Cpu size={96} strokeWidth={1.5} className="text-white drop-shadow-lg" />
      <BarChart3 size={40} strokeWidth={2} className="absolute -bottom-2 -right-3 text-white/90" />
    </div>
  );
}

export default function Projects() {
  const [selectedId, setSelectedId] = useState(null);
  const active = projects.find((p) => p.id === selectedId);
  const close = useCallback(() => setSelectedId(null), []);
  const { t, L } = useLang();

  useScrollLock(!!selectedId);
  useEscape(!!selectedId, close);

  return (
    <>
      <PageHeader eyebrow={t.projEyebrow} title={t.projTitle} description={t.projDesc} />

      <section className="px-4 md:px-6">
        <motion.div variants={stagger(0.15, 0.2)} initial="hidden" animate="visible" className="mx-auto max-w-6xl grid md:grid-cols-2 gap-4 md:gap-6">
          {projects.map((p) => (
            <motion.div key={p.id} variants={fadeUp}>
              <motion.button
                layoutId={`project-${p.id}`}
                onClick={() => setSelectedId(p.id)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={spring.press}
                className="card group w-full text-left overflow-hidden"
                aria-label={`${t.openPresentation} ${p.title}`}
              >
                <div className="relative h-60 md:h-80 grid place-items-center overflow-hidden" style={{ background: p.gradient }}>
                  <div aria-hidden className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/20 blur-2xl" />
                  <div aria-hidden className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-black/10 blur-2xl" />
                  <div className="relative transition-transform duration-500 group-hover:scale-110">
                    <ProjectArt icon={p.icon} />
                  </div>
                  <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 h-10 pl-3 pr-4 rounded-full bg-white/90 text-[#0b0b0d] text-sm font-semibold shadow-lg transition-transform duration-300 group-hover:-translate-y-0.5">
                    <Play size={16} fill="currentColor" /> {t.viewPresentation}
                  </span>
                </div>
                <div className="p-6 md:p-7">
                  <h2 className="text-2xl font-bold tracking-tight text-fg group-hover:text-accent-fg transition-colors">{p.title}</h2>
                  <p className="mt-1.5 text-fg-2 leading-relaxed">{L(p.summary)}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <span key={tag} className={chip}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Viewer presentasi — kartu "mengembang" ala App Store iOS (shared layout bawaan) */}
      <AnimatePresence>
        {active && (
          <div key="viewer" className="fixed inset-0 z-[200] flex items-center justify-center px-3 md:px-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="absolute inset-0 bg-black/80 backdrop-blur-2xl cursor-zoom-out"
            />
            <motion.div
              layoutId={`project-${active.id}`}
              transition={spring.sheet}
              role="dialog"
              aria-modal="true"
              aria-label={active.title}
              className="relative w-full max-w-6xl aspect-video rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-neutral-900 shadow-float"
            >
              <iframe src={active.embedUrl} title={`${t.presentation} ${active.title}`} className="w-full h-full border-0" allowFullScreen allow="autoplay; fullscreen" />
              <button
                onClick={close}
                aria-label={t.closePresentation}
                className="pressable absolute top-3 right-3 md:top-5 md:right-5 grid place-items-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
