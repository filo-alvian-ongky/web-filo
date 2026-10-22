"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Award, BadgeCheck, Building2, Calendar, FileText, FlaskConical, Maximize2, Trophy } from "lucide-react";
import BackLink from "@/components/ui/BackLink";
import GalleryViewer from "@/components/ui/GalleryViewer";
import InfoRow from "@/components/ui/InfoRow";
import Markdown from "@/components/ui/Markdown";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import { btn } from "@/components/ui/styles";
import { categoryLabel } from "@/lib/data";
import { spring } from "@/lib/motion";
import { useLang } from "@/lib/i18n";

const CATEGORY_ICONS = { competition: Trophy, research: FlaskConical, certification: Award };

/** Halaman detail pencapaian: gambar sertifikat, info, deskripsi markdown & tautan PDF / verifikasi */
export default function AchievementDetail({ achievement: a }) {
  const { t, L, date } = useLang();
  const [zoomed, setZoomed] = useState(null);
  const closeZoom = useCallback(() => setZoomed(null), []);
  const title = L(a.title);
  const description = L(a.description);
  const altOf = () => `${t.certificate} ${title}`;

  return (
    <>
      <PageHeader eyebrow={<BackLink href="/achievements" label={t.achTitle} />} title={title} description={a.provider} />

      <section className="px-4 md:px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 items-start">
          <Reveal tilt={false} className="lg:col-span-3 lg:row-start-1">
            <motion.button
              whileTap={{ scale: 0.985 }}
              transition={spring.press}
              onClick={() => setZoomed(0)}
              aria-label={`${t.fullSize}: ${altOf()}`}
              className="card group relative block w-full overflow-hidden cursor-zoom-in"
            >
              <div className="bg-surface-2">
                <Image src={a.image} alt={altOf()} width={1600} height={1131} preload sizes="(min-width: 1200px) 660px, 100vw" className="w-full h-auto" />
              </div>
              <span className="absolute top-3 right-3 grid place-items-center w-9 h-9 rounded-full glass text-fg opacity-90 group-hover:opacity-100">
                <Maximize2 size={16} />
              </span>
            </motion.button>
          </Reveal>

          <Reveal tilt={false} className="lg:col-span-2 lg:col-start-4 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24">
            <aside className="card p-5 md:p-6 space-y-4">
              <InfoRow icon={Building2} label={t.organizer}>
                {a.provider}
              </InfoRow>
              <InfoRow icon={Calendar} label={t.dateLabel}>
                {date(a.date)}
              </InfoRow>
              <InfoRow icon={CATEGORY_ICONS[a.category] ?? Award} label={t.category}>
                {L(categoryLabel[a.category])}
              </InfoRow>
              <div className="flex flex-col gap-2 pt-2">
                {a.link && (
                  <a href={a.link} target="_blank" rel="noopener noreferrer" className={`${btn.primary} w-full`}>
                    <BadgeCheck size={16} /> {t.verifyLink}
                  </a>
                )}
                {a.file && (
                  <a href={a.file} target="_blank" rel="noopener noreferrer" className={`${a.link ? btn.tonal : btn.primary} w-full`}>
                    <FileText size={16} /> {t.pdfDoc}
                  </a>
                )}
                <a href={a.image} target="_blank" rel="noopener noreferrer" className={`${btn.secondary} w-full`}>
                  {t.fullSize} <ArrowUpRight size={16} />
                </a>
              </div>
            </aside>
          </Reveal>

          {description && (
            <Reveal tilt={false} className="lg:col-span-3 lg:col-start-1 lg:row-start-2">
              <article className="card p-6 md:p-8">
                <h2 className="mb-4 text-sm font-semibold text-accent-fg">{t.aboutAchievement}</h2>
                <Markdown>{description}</Markdown>
              </article>
            </Reveal>
          )}
        </div>
      </section>

      <GalleryViewer images={[{ image: a.image, thumb: a.thumb }]} index={zoomed} onIndex={setZoomed} onClose={closeZoom} altOf={altOf} />
    </>
  );
}
