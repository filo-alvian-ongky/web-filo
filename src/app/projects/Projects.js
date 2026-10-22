"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Play, X } from "lucide-react";
import { track } from "@vercel/analytics";
import PageHeader from "../../components/ui/PageHeader";
import ProjectArt from "../../components/ui/ProjectArt";
import Reveal from "../../components/ui/Reveal";
import TechIcon from "../../components/ui/TechIcon";
import Tilt from "../../components/ui/Tilt";
import { chip } from "../../components/ui/styles";
import { spring } from "@/lib/motion";
import { useEscape, useScrollLock } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";

function ProjectCover({ project, action }) {
  return (
    <div className="relative h-60 md:h-80 grid place-items-center overflow-hidden" style={{ background: project.gradient }}>
      {project.cover ? (
        <Image
          src={project.coverThumb}
          alt=""
          fill
          sizes="(min-width: 768px) 560px, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <>
          <div aria-hidden className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/20 blur-2xl" />
          <div aria-hidden className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-black/10 blur-2xl" />
          <div className="relative transition-transform duration-500 group-hover:scale-110">
            <ProjectArt icon={project.icon} />
          </div>
        </>
      )}
      {action}
    </div>
  );
}

function ProjectBody({ project }) {
  const { L } = useLang();
  return (
    <div className="p-6 md:p-7">
      <h2 className="text-2xl font-bold tracking-tight text-fg group-hover:text-accent-fg transition-colors">{project.title}</h2>
      <p className="mt-1.5 text-fg-2 leading-relaxed">{L(project.summary)}</p>
      {(project.tags.length > 0 || project.stack.length > 0) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className={chip}>
              {tag}
            </span>
          ))}
          {project.stack.map((s) => (
            <span key={s.id} className={chip}>
              <TechIcon tech={s} className="w-3.5 h-3.5" /> {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const pill =
  "absolute bottom-4 right-4 inline-flex items-center gap-2 h-10 pl-3 pr-4 rounded-full bg-white/90 text-[#0b0b0d] text-sm font-semibold shadow-lg";

export default function Projects({ projects }) {
  const [selectedId, setSelectedId] = useState(null);
  const active = projects.find((p) => p.id === selectedId);
  const close = useCallback(() => setSelectedId(null), []);
  const { t } = useLang();

  useScrollLock(!!selectedId);
  useEscape(!!selectedId, close);

  return (
    <>
      <PageHeader eyebrow={t.projEyebrow} title={t.projTitle} description={t.projDesc} />

      <section className="px-4 md:px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {projects.map((p) => (
            // Tilt hover ada di kartu; langsung datar saat ditekan agar animasi kartu → viewer tetap presisi
            <Reveal key={p.id} tilt={false}>
              {p.embedUrl ? (
                // Ada presentasi → buka viewer
                <Tilt
                  as="button"
                  resetOnPress
                  layoutId={`project-${p.id}`}
                  onClick={() => {
                    setSelectedId(p.id);
                    track("project_open", { slug: p.slug });
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={spring.press}
                  className="card group w-full text-left overflow-hidden"
                  aria-label={`${t.openPresentation} ${p.title}`}
                >
                  <ProjectCover
                    project={p}
                    action={
                      <span className={pill}>
                        <Play size={16} fill="currentColor" /> {t.viewPresentation}
                      </span>
                    }
                  />
                  <ProjectBody project={p} />
                </Tilt>
              ) : p.linkUrl ? (
                // Hanya link → buka di tab baru
                <Tilt
                  as="a"
                  href={p.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("project_open", { slug: p.slug })}
                  whileTap={{ scale: 0.98 }}
                  transition={spring.press}
                  className="card group block w-full overflow-hidden"
                >
                  <ProjectCover
                    project={p}
                    action={
                      <span className={pill}>
                        {t.openProject} <ArrowUpRight size={16} />
                      </span>
                    }
                  />
                  <ProjectBody project={p} />
                </Tilt>
              ) : (
                <Tilt as="article" className="card group w-full overflow-hidden">
                  <ProjectCover project={p} />
                  <ProjectBody project={p} />
                </Tilt>
              )}
            </Reveal>
          ))}
        </div>
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
              {/* sandbox: konten embed tidak bisa mengarahkan / mengubah halaman website ini */}
              <iframe
                src={active.embedUrl}
                title={`${t.presentation} ${active.title}`}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
                referrerPolicy="strict-origin-when-cross-origin"
              />
              <div className="absolute top-3 right-3 md:top-5 md:right-5 flex gap-2">
                {active.linkUrl && (
                  <a
                    href={active.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pressable inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-black/50 backdrop-blur-md text-white text-sm font-semibold hover:bg-black/70"
                  >
                    {t.openProject} <ArrowUpRight size={16} />
                  </a>
                )}
                <button
                  onClick={close}
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
    </>
  );
}
