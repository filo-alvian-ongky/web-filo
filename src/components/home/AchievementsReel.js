"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import Reveal from "../ui/Reveal";
import RevealWords from "../ui/RevealWords";
import { categoryLabel } from "@/lib/data";
import { useLang } from "@/lib/i18n";

const pad = (n) => String(n).padStart(2, "0");

function ReelCard({ item, index, progress, scrub }) {
  const { L } = useLang();
  // Parallax di dalam bingkai: gambar bergeser sedikit berlawanan arah geser kartu
  const imageX = useTransform(progress, [0, 1], ["6%", "-6%"]);
  return (
    <Reveal as="li" className="shrink-0 w-[78vw] max-w-[22rem] md:w-[26rem] md:max-w-none">
      <Link href="/achievements" className="group card block h-full overflow-hidden">
        <div className="relative aspect-[1.414] overflow-hidden bg-surface-2">
          {/* Gambar dibuat 16% lebih lebar agar tepinya tidak terlihat saat bergeser */}
          <motion.div style={scrub ? { x: imageX } : undefined} className="absolute inset-y-0 -inset-x-[8%]">
            <Image
              src={item.thumb}
              alt=""
              fill
              sizes="(min-width: 768px) 450px, 85vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-ios)] group-hover:scale-105"
            />
          </motion.div>
          <span className="absolute top-3 left-3 inline-flex items-center h-7 px-2.5 rounded-full glass text-[11px] font-bold text-fg">
            {L(categoryLabel[item.category])}
          </span>
        </div>
        <div className="p-5 md:p-6">
          <p className="text-xs font-bold tabular-nums text-fg-3">{pad(index + 1)}</p>
          <h3 className="mt-1 text-lg md:text-xl font-bold leading-snug text-fg">{L(item.title)}</h3>
          <p className="mt-1 text-sm text-fg-2 truncate">
            {item.provider} · {item.date.slice(0, 4)}
          </p>
        </div>
      </Link>
    </Reveal>
  );
}

/**
 * Galeri "Pencapaian Terbaru": section ditahan di layar, scroll ke bawah menggeser
 * kartu-kartu ke samping (horizontal scroll ala scrollytelling) dengan bilah progres.
 */
/**
 * @param items  pencapaian terbaru yang ditampilkan
 * @param total  jumlah seluruh pencapaian (ditampilkan di kartu "Lihat semua")
 */
export default function AchievementsReel({ items, total: allCount }) {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(1);
  const scrub = !useReducedMotion();
  const total = items.length;

  // Jarak geser = lebar seluruh kartu − lebar layar (diukur ulang saat ukuran berubah)
  useEffect(() => {
    const track = trackRef.current;
    const frame = frameRef.current;
    if (!track || !frame) return;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - frame.clientWidth));
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (v) => -v * distance);
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(total, Math.floor(v * total) + 1)));

  return (
    <section
      ref={sectionRef}
      // Tinggi section = 1 layar + jarak geser → tiap px scroll vertikal = 1 px geser horizontal
      style={{ "--reel": `${distance}px` }}
      className="relative h-[calc(100svh+var(--reel))] motion-reduce:h-auto"
    >
      <div
        ref={frameRef}
        className="sticky top-0 h-svh overflow-hidden flex flex-col justify-center pt-16 pb-24 md:pt-24 md:pb-8 motion-reduce:static motion-reduce:h-auto motion-reduce:py-16"
      >
        <div className="mx-auto max-w-6xl w-full px-4 md:px-6 flex items-end justify-between gap-4 mb-6 md:mb-8">
          <div className="px-1">
            <p className="text-sm font-semibold tabular-nums text-accent-fg">
              {pad(active)} / {pad(total)}
            </p>
            <RevealWords as="h2" text={t.latestAchievements} className="mt-1 text-3xl md:text-5xl font-extrabold tracking-tight text-fg" />
          </div>
          <Link href="/achievements" className="pressable shrink-0 inline-flex items-center gap-0.5 mb-1 text-sm font-semibold text-accent-fg">
            {t.seeAll} <ChevronRight size={16} strokeWidth={2.5} />
          </Link>
        </div>

        <div className="motion-reduce:overflow-x-auto motion-reduce:no-scrollbar">
          <motion.ul
            ref={trackRef}
            style={scrub ? { x } : undefined}
            // Tepi kiri sejajar dengan konten (max-w-6xl) di layar lebar
            className="flex gap-3 md:gap-5 w-max py-2 px-4 md:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
          >
            {items.map((item, i) => (
              <ReelCard key={item.id} item={item} index={i} progress={scrollYProgress} scrub={scrub} />
            ))}
            <Reveal as="li" tilt={false} className="shrink-0 w-[62vw] max-w-[16rem] md:w-[18rem]">
              <Link
                href="/achievements"
                style={{ background: "var(--accent)" }}
                className="group grid content-center justify-items-center h-full p-6 rounded-[var(--radius-card)] text-center text-white shadow-float"
              >
                <span className="grid place-items-center w-14 h-14 rounded-full bg-white/15 transition-transform duration-300 ease-[var(--ease-ios)] group-hover:translate-x-1">
                  <ArrowRight size={24} strokeWidth={2.25} />
                </span>
                <span className="mt-4 text-lg font-bold leading-snug">{t.allAchievements}</span>
                <span className="mt-1 text-sm text-white/80">
                  {allCount} {t.achievementsCount}
                </span>
              </Link>
            </Reveal>
          </motion.ul>
        </div>

        {/* Bilah progres geser */}
        <div className="mx-auto max-w-6xl w-full px-5 md:px-7 mt-6 md:mt-8 motion-reduce:hidden">
          <div className="h-1 rounded-full bg-separator overflow-hidden">
            <motion.div style={{ scaleX: scrollYProgress }} className="h-full rounded-full bg-accent origin-left" />
          </div>
        </div>
      </div>
    </section>
  );
}
