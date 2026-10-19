"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Calendar, ChevronRight, FileText } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import SegmentedControl from "../../components/ui/SegmentedControl";
import Sheet from "../../components/ui/Sheet";
import { btn, chip } from "../../components/ui/styles";
import { achievementFilters, achievements, categoryLabel } from "@/lib/data";
import { spring } from "@/lib/motion";
import { useLang } from "@/lib/i18n";

export default function Achievements() {
  const { t, L, date } = useLang();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const list = filter === "all" ? achievements : achievements.filter((a) => a.category === filter);

  const openDetail = (item) => {
    setSelected(item);
    setOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow={t.achEyebrow}
        title={t.achTitle}
        description={t.achDesc}
      >
        <SegmentedControl
          label={t.filterLabel}
          options={achievementFilters.map((f) => ({ value: f.key, label: L(f.label) }))}
          value={filter}
          onChange={setFilter}
        />
      </PageHeader>

      <section className="px-4 md:px-6">
        <motion.div layout className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((a, i) => (
              <motion.button
                layout
                key={a.image}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: Math.min(i, 6) * 0.06 } }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={spring.press}
                onClick={() => openDetail(a)}
                className="card group text-left overflow-hidden"
              >
                <div className="relative aspect-[1.414] bg-surface-2 overflow-hidden">
                  <Image
                    src={a.thumb}
                    alt={`${t.certificate} ${L(a.title)}`}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center h-7 px-2.5 rounded-full glass text-[11px] font-bold text-fg">{L(categoryLabel[a.category])}</span>
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold text-fg leading-snug">{L(a.title)}</h2>
                  <p className="mt-1 text-sm text-fg-2">{a.provider}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-fg-3">
                      <Calendar size={14} /> {date(a.date)}
                    </span>
                    <span className="inline-flex items-center gap-0.5 font-semibold text-accent-fg">
                      {t.detail} <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      <Sheet open={open} onClose={() => setOpen(false)} title={L(selected?.title)} subtitle={selected?.provider} size="lg" bodyClassName="p-0">
        {selected && (
          <>
            <div className="bg-surface-2 border-y border-separator">
              <Image
                src={selected.image}
                alt={`${t.certificate} ${L(selected.title)}`}
                width={1600}
                height={1131}
                className="w-full h-auto max-h-[62vh] object-contain"
                unoptimized
              />
            </div>
            <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <span className={chip}>
                  <Calendar size={14} /> {date(selected.date)}
                </span>
                <span className={chip}>{L(categoryLabel[selected.category])}</span>
              </div>
              <div className="flex gap-2">
                {selected.file && (
                  <a href={selected.file} target="_blank" rel="noopener noreferrer" className={`${btn.tonal} h-10 px-4 text-sm`}>
                    <FileText size={16} /> {t.pdfDoc}
                  </a>
                )}
                <a href={selected.image} target="_blank" rel="noopener noreferrer" className={`${btn.secondary} h-10 px-4 text-sm`}>
                  {t.fullSize} <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </>
        )}
      </Sheet>
    </>
  );
}
