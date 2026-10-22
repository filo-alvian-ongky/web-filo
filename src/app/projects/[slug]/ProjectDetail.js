"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, ChevronLeft, ChevronRight, Play, UserRound } from "lucide-react";
import { track } from "@vercel/analytics";
import BackLink from "@/components/ui/BackLink";
import GalleryViewer from "@/components/ui/GalleryViewer";
import InfoRow, { infoHeading } from "@/components/ui/InfoRow";
import Markdown from "@/components/ui/Markdown";
import PageHeader from "@/components/ui/PageHeader";
import PresentationViewer from "@/components/ui/PresentationViewer";
import ProjectArt from "@/components/ui/ProjectArt";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import TechIcon from "@/components/ui/TechIcon";
import { btn, chip } from "@/components/ui/styles";
import { spring } from "@/lib/motion";
import { useLang } from "@/lib/i18n";

const pill =
  "pressable absolute bottom-4 right-4 inline-flex items-center gap-2 h-10 pl-3 pr-4 rounded-full bg-white/90 text-[#0b0b0d] text-sm font-semibold shadow-lg";

/** Kartu navigasi ke proyek sebelum / sesudahnya */
function SiblingLink({ project, next }) {
  const { t, L } = useLang();
  return (
    <Reveal tilt={false} className={next ? "sm:col-start-2" : ""}>
      <Link
        href={`/projects/${project.slug}`}
        className={`card pressable group flex items-center gap-4 h-full p-3 ${next ? "flex-row-reverse text-right pl-5" : "pr-5"}`}
      >
        <span className="relative grid place-items-center w-20 h-16 md:w-24 md:h-[4.5rem] shrink-0 rounded-2xl overflow-hidden" style={{ background: project.gradient }}>
          {project.cover ? (
            <Image src={project.coverThumb} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <ProjectArt icon={project.icon} size={28} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`flex items-center gap-0.5 text-xs font-semibold text-accent-fg ${next ? "justify-end" : ""}`}>
            {!next && <ChevronLeft size={14} strokeWidth={2.5} />}
            {next ? t.nextProject : t.prevProject}
            {next && <ChevronRight size={14} strokeWidth={2.5} />}
          </span>
          <span className="block mt-0.5 font-bold text-fg truncate group-hover:text-accent-fg transition-colors">{project.title}</span>
          <span className="block text-sm text-fg-2 truncate">{L(project.summary)}</span>
        </span>
      </Link>
    </Reveal>
  );
}

/**
 * Halaman detail (case study) proyek: sampul, info (peran, periode, tag, teknologi, tautan),
 * cerita markdown, galeri dengan viewer, dan navigasi proyek sebelum/berikutnya.
 */
export default function ProjectDetail({ project, prev, next }) {
  const { t, L } = useLang();
  const [presenting, setPresenting] = useState(false);
  const [shown, setShown] = useState(null);
  const closePresentation = useCallback(() => setPresenting(false), []);
  const closeGallery = useCallback(() => setShown(null), []);

  const role = L(project.role);
  const period = L(project.period);
  const story = L(project.story);
  const hasInfo = Boolean(role || period || project.tags.length || project.stack.length || project.embedUrl || project.linkUrl);
  const coverId = `project-cover-${project.id}`;
  const altOf = (i) => `${t.galleryImage} ${i + 1} — ${project.title}`;

  const openPresentation = () => {
    setPresenting(true);
    track("project_open", { slug: project.slug, via: "presentation" });
  };

  return (
    <>
      <PageHeader eyebrow={<BackLink href="/projects" label={t.projTitle} />} title={project.title} description={L(project.summary)} />

      <section className="px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal tilt={false}>
            <motion.div
              layoutId={coverId}
              className="card relative grid place-items-center aspect-[16/10] md:aspect-[21/9] overflow-hidden"
              style={{ background: project.gradient }}
            >
              {project.cover ? (
                <Image src={project.cover} alt={project.title} fill preload sizes="(min-width: 1200px) 1104px, 100vw" className="object-cover" />
              ) : (
                <>
                  <div aria-hidden className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/20 blur-2xl" />
                  <div aria-hidden className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-black/10 blur-2xl" />
                  <div className="relative">
                    <ProjectArt icon={project.icon} size={120} />
                  </div>
                </>
              )}
              {project.embedUrl && (
                <button onClick={openPresentation} className={pill}>
                  <Play size={16} fill="currentColor" /> {t.viewPresentation}
                </button>
              )}
            </motion.div>
          </Reveal>

          {(hasInfo || story) && (
            <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
              {hasInfo && (
                <Reveal tilt={false} className={`lg:row-start-1 lg:sticky lg:top-24 ${story ? "lg:col-start-3" : "lg:col-span-3"}`}>
                  {/* Tanpa cerita kartu ini selebar halaman → isinya dibagi menjadi kolom berdampingan */}
                  <aside className={`card p-5 md:p-6 ${story ? "space-y-5" : "grid gap-5 sm:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] items-start"}`}>
                    {(role || period) && (
                      <div className="space-y-4">
                        {role && (
                          <InfoRow icon={UserRound} label={t.role}>
                            {role}
                          </InfoRow>
                        )}
                        {period && (
                          <InfoRow icon={Calendar} label={t.period}>
                            {period}
                          </InfoRow>
                        )}
                      </div>
                    )}
                    {project.tags.length > 0 && (
                      <div>
                        <p className={infoHeading}>{t.categories}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <span key={tag} className={chip}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {project.stack.length > 0 && (
                      <div>
                        <p className={infoHeading}>{t.techStack}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.stack.map((s) => (
                            <span key={s.id} className={chip}>
                              <TechIcon tech={s} className="w-3.5 h-3.5" /> {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(project.embedUrl || project.linkUrl) && (
                      <div className={`flex flex-col gap-2 ${story ? "pt-1" : ""}`}>
                        {project.embedUrl && (
                          <button onClick={openPresentation} className={`${btn.primary} w-full`}>
                            <Play size={16} fill="currentColor" /> {t.viewPresentation}
                          </button>
                        )}
                        {project.linkUrl && (
                          <a
                            href={project.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track("project_open", { slug: project.slug, via: "link" })}
                            className={`${project.embedUrl ? btn.secondary : btn.primary} w-full`}
                          >
                            {t.openProject} <ArrowUpRight size={16} />
                          </a>
                        )}
                      </div>
                    )}
                  </aside>
                </Reveal>
              )}

              {story && (
                <Reveal tilt={false} className={`lg:row-start-1 ${hasInfo ? "lg:col-span-2 lg:col-start-1" : "lg:col-span-3"}`}>
                  <article className="card p-6 md:p-8">
                    <h2 className="mb-4 text-sm font-semibold text-accent-fg">{t.caseStudy}</h2>
                    <Markdown>{story}</Markdown>
                  </article>
                </Reveal>
              )}
            </div>
          )}

          {project.gallery.length > 0 && (
            <div className="mt-10 md:mt-14">
              <SectionHeader title={t.gallery} />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {project.gallery.map((g, i) => (
                  <Reveal key={g.image} tilt={false}>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      transition={spring.press}
                      onClick={() => setShown(i)}
                      aria-label={altOf(i)}
                      className="card group relative block w-full aspect-[4/3] overflow-hidden cursor-zoom-in"
                    >
                      <Image src={g.thumb} alt="" fill sizes="(min-width: 768px) 370px, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </motion.button>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {(prev || next) && (
            <nav aria-label={t.projTitle} className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {prev && <SiblingLink project={prev} />}
              {next && <SiblingLink project={next} next />}
            </nav>
          )}
        </div>
      </section>

      <PresentationViewer project={presenting ? project : null} layoutId={coverId} onClose={closePresentation} />
      <GalleryViewer images={project.gallery} index={shown} onIndex={setShown} onClose={closeGallery} altOf={altOf} />
    </>
  );
}
