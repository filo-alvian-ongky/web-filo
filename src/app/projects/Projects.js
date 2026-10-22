"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Play } from "lucide-react";
import { track } from "@vercel/analytics";
import PageHeader from "../../components/ui/PageHeader";
import PresentationViewer from "../../components/ui/PresentationViewer";
import ProjectArt from "../../components/ui/ProjectArt";
import Reveal from "../../components/ui/Reveal";
import TechIcon from "../../components/ui/TechIcon";
import Tilt from "../../components/ui/Tilt";
import { chip, stretchedLink } from "../../components/ui/styles";
import { spring } from "@/lib/motion";
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
  const { t, L } = useLang();
  return (
    <div className="p-6 md:p-7">
      <h2 className="text-2xl font-bold tracking-tight text-fg group-hover:text-accent-fg transition-colors">
        {/* Ketuk kartu di mana saja → halaman detail */}
        <Link href={`/projects/${project.slug}`} onClick={() => track("project_open", { slug: project.slug, via: "detail" })} className={stretchedLink}>
          {project.title}
        </Link>
      </h2>
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
      <span aria-hidden className="mt-5 inline-flex items-center gap-0.5 text-sm font-semibold text-accent-fg">
        {t.viewDetails} <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
  );
}

// Aksi cepat di sampul (di atas tautan kartu): buka presentasi / link proyek tanpa ke halaman detail
const pill =
  "pressable absolute z-10 bottom-4 right-4 inline-flex items-center gap-2 h-10 pl-3 pr-4 rounded-full bg-white/90 text-[#0b0b0d] text-sm font-semibold shadow-lg";

export default function Projects({ projects }) {
  const [selectedId, setSelectedId] = useState(null);
  const active = projects.find((p) => p.id === selectedId);
  const close = useCallback(() => setSelectedId(null), []);
  const { t } = useLang();

  const quickAction = (p) => {
    if (p.embedUrl) {
      return (
        <button
          onClick={() => {
            setSelectedId(p.id);
            track("project_open", { slug: p.slug, via: "presentation" });
          }}
          aria-label={`${t.openPresentation} ${p.title}`}
          className={pill}
        >
          <Play size={16} fill="currentColor" /> {t.viewPresentation}
        </button>
      );
    }
    if (p.linkUrl) {
      return (
        <a href={p.linkUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("project_open", { slug: p.slug, via: "link" })} className={pill}>
          {t.openProject} <ArrowUpRight size={16} />
        </a>
      );
    }
    return null;
  };

  return (
    <>
      <PageHeader eyebrow={t.projEyebrow} title={t.projTitle} description={t.projDesc} />

      <section className="px-4 md:px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {projects.map((p) => (
            // Tilt hover ada di kartu; langsung datar saat ditekan agar animasi kartu → viewer tetap presisi
            <Reveal key={p.id} tilt={false}>
              <Tilt
                as="article"
                resetOnPress
                layoutId={p.embedUrl ? `project-${p.id}` : undefined}
                whileTap={{ scale: 0.98 }}
                transition={spring.press}
                className="card group relative w-full overflow-hidden"
              >
                <ProjectCover project={p} action={quickAction(p)} />
                <ProjectBody project={p} />
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Viewer presentasi — kartu "mengembang" ala App Store iOS (shared layout bawaan) */}
      <PresentationViewer project={active} layoutId={active ? `project-${active.id}` : undefined} onClose={close} />
    </>
  );
}
