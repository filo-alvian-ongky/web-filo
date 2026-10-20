"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import RevealWords from "../ui/RevealWords";
import ScrubText from "../ui/ScrubText";
import CountUp from "../ui/CountUp";
import TechIcon from "../ui/TechIcon";
import { useMediaQuery } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";

// Posisi awal ikon (berserakan) — deterministik (sudut emas) agar sama di server & klien
const GOLDEN_ANGLE = 2.39996;
function scatter(i, spread) {
  const angle = i * GOLDEN_ANGLE + 0.6;
  const radius = spread * (0.75 + (i % 3) * 0.25);
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * 0.65, rotate: ((i * 47) % 70) - 35 };
}

// Ikon teknologi ala app icon One UI: terbang dari posisi acak lalu "terpasang" di grid mengikuti scroll
function TechTile({ tech, index, total, progress, spread, scrub }) {
  const from = scatter(index, spread);
  const start = (index / total) * 0.3;
  const range = [start, start + 0.42];
  const x = useTransform(progress, range, [from.x, 0]);
  const y = useTransform(progress, range, [from.y, 0]);
  const rotate = useTransform(progress, range, [from.rotate, 0]);
  const scale = useTransform(progress, range, [0.4, 1]);
  const opacity = useTransform(progress, [start, start + 0.18], [0, 1]);
  // Setelah semua terpasang, tiap ikon memancarkan cahaya warnanya
  const glow = useTransform(progress, [0.72, 0.9], [0, 1]);
  // Tanpa warna (mis. Next.js) → ikut warna teks agar terlihat di tema terang & gelap
  const tone = tech.color ?? "var(--fg)";

  return (
    <motion.li style={scrub ? { x, y, rotate, scale, opacity } : undefined} className="flex flex-col items-center gap-2.5 w-[4.25rem] md:w-24">
      <span
        style={{ "--tone": tone }}
        className="group relative grid place-items-center w-[4.25rem] h-[4.25rem] md:w-24 md:h-24 rounded-[1.35rem] md:rounded-[1.9rem] bg-surface ring-1 ring-separator shadow-card text-fg transition-transform duration-300 ease-[var(--ease-ios)] hover:scale-105"
      >
        <motion.span
          aria-hidden
          style={scrub ? { opacity: glow } : undefined}
          className="absolute inset-0 rounded-[inherit] shadow-[0_14px_34px_-10px_color-mix(in_srgb,var(--tone)_65%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--tone)_35%,transparent)]"
        />
        <span className="relative" style={{ color: tone }}>
          <TechIcon tech={tech} colored={false} className="w-8 h-8 md:w-11 md:h-11" />
        </span>
      </span>
      <span className="text-[13px] md:text-sm font-semibold text-fg-2 whitespace-nowrap">{tech.name}</span>
    </motion.li>
  );
}

/**
 * Scene "Teknologi": section ditahan di layar sementara ikon-ikon teknologi
 * berkumpul dari posisi berserakan menjadi satu grid rapi (maju–mundur mengikuti scroll).
 */
export default function TechScene({ items }) {
  const { t } = useLang();
  const ref = useRef(null);
  const scrub = !useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end end"] });

  return (
    <section ref={ref} className="relative mt-6 md:mt-10 h-[175svh] motion-reduce:h-auto">
      <div className="sticky top-0 h-svh overflow-clip flex items-center px-4 md:px-6 pt-14 pb-24 md:py-0 motion-reduce:static motion-reduce:h-auto motion-reduce:py-16">
        <div className="mx-auto max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-center">
          <div className="md:col-span-5 text-center md:text-left px-1">
            <p className="text-sm font-semibold text-accent-fg">
              <CountUp value={items.length} /> {t.techCount}
            </p>
            <RevealWords as="h2" text={t.techTitle} className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight text-fg" />
            <ScrubText
              text={t.techSub}
              target={ref}
              offset={["start 0.7", "end end"]}
              within={[0.08, 0.6]}
              dim={0.3}
              className="mt-3 mx-auto md:mx-0 max-w-sm text-fg-2 leading-relaxed"
            />
          </div>

          <ul className="md:col-span-7 mx-auto flex flex-wrap justify-center gap-x-4 gap-y-6 md:gap-x-8 md:gap-y-9 max-w-[21rem] md:max-w-[30rem]">
            {items.map((tech, i) => (
              <TechTile key={tech.id} tech={tech} index={i} total={items.length} progress={scrollYProgress} spread={isDesktop ? 340 : 170} scrub={scrub} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
