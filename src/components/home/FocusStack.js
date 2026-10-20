"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Card from "../Card";
import RevealWords from "../ui/RevealWords";
import { focusAreas } from "@/lib/data";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { useLang } from "@/lib/i18n";
import { getLenis } from "@/lib/smoothScroll";

// Jarak tingkat antar kartu yang menempel (px) → tepi atas kartu sebelumnya tetap terlihat
const STEP = 18;
const pad = (n) => String(n).padStart(2, "0");

function StackCard({ area, index, total, progress, sentinelRef }) {
  const { L } = useLang();
  const reduceMotion = useReducedMotion();
  const Icon = area.icon;
  // Kartu yang tertimpa kartu berikutnya mengecil sedikit → kesan tumpukan yang dalam
  const scale = useTransform(progress, [index / total, 1], [1, 1 - (total - 1 - index) * 0.05]);

  return (
    <>
      {/* Penanda posisi asli kartu (tidak ikut menempel) untuk menghitung kartu aktif */}
      <div ref={sentinelRef} aria-hidden />
      <div className="sticky" style={{ top: `calc(var(--stack-top) + ${index * STEP}px)` }}>
        <motion.div style={reduceMotion ? undefined : { scale }} className="origin-top">
          <Card style={{ boxShadow: "var(--elev-float)" }} className="relative overflow-hidden p-6 md:p-9 min-h-[15rem] md:min-h-[19rem] flex flex-col">
            <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: area.tone }} />
            <div className="relative flex items-start justify-between gap-4">
              <span className="grid place-items-center w-12 h-12 md:w-14 md:h-14 rounded-[15px] md:rounded-[18px] text-white" style={{ background: area.tone }}>
                <Icon size={24} />
              </span>
              <span aria-hidden className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none tabular-nums text-fg/[0.07]">
                {pad(index + 1)}
              </span>
            </div>
            <h3 className="relative mt-auto pt-8 text-2xl md:text-3xl font-bold tracking-tight text-fg">{L(area.title)}</h3>
            <p className="relative mt-2 max-w-md text-[15px] md:text-base text-fg-2 leading-relaxed">{L(area.body)}</p>
          </Card>
        </motion.div>
      </div>
      {/* Jarak scroll sebelum kartu berikutnya tiba. Sengaja berupa elemen (bukan margin/padding):
          kartu sticky hanya bisa menempel di dalam area konten induknya, jadi setelah kartu terakhir
          spacer ini memberi waktu tumpukan lengkap tertahan sejenak sebelum ikut tergulir. */}
      <div aria-hidden className={index === total - 1 ? "h-[22svh]" : "h-[24svh] md:h-[30svh]"} />
    </>
  );
}

/**
 * Scene "Eksplorasi": kartu bidang fokus menempel & menumpuk satu per satu saat digulir.
 * Desktop: judul + daftar kemajuan menempel di kiri, tumpukan kartu di kanan.
 */
export default function FocusStack() {
  const { t, L } = useLang();
  const stackRef = useRef(null);
  const sentinels = useRef([]);
  const [active, setActive] = useState(0);
  const total = focusAreas.length;

  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start 0.25", "end end"] });
  const { scrollY } = useScroll();

  // Kartu aktif = kartu terakhir yang posisi aslinya sudah melewati 55% tinggi layar
  const update = useCallback(() => {
    const line = window.innerHeight * 0.55;
    let next = 0;
    sentinels.current.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top < line) next = i;
    });
    setActive(next);
  }, []);
  useMotionValueEvent(scrollY, "change", update);

  const goTo = (i) => {
    const el = sentinels.current[i];
    const stack = stackRef.current;
    if (!el || !stack) return;
    const stackTop = parseFloat(getComputedStyle(stack).getPropertyValue("--stack-top")) || 0;
    const top = el.getBoundingClientRect().top + window.scrollY - stackTop - i * STEP;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top, { duration: 1.1 });
    else window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section className="px-4 md:px-6 mt-16 md:mt-28">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32 px-1">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="hidden md:block text-sm font-semibold tabular-nums text-accent-fg"
            >
              {pad(active + 1)} / {pad(total)}
            </motion.p>
            <RevealWords as="h2" text={t.explore} className="md:mt-2 text-3xl md:text-5xl font-extrabold tracking-tight text-fg" />
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce} className="mt-3 max-w-sm text-fg-2 leading-relaxed">
              {t.exploreSub}
            </motion.p>

            <ol className="hidden md:block mt-10 space-y-1">
              {focusAreas.map((f, i) => {
                const on = i === active;
                return (
                  <li key={f.tone}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={on ? "step" : undefined}
                      className="group flex items-center gap-3 w-full py-2 text-left"
                    >
                      <span
                        aria-hidden
                        className="h-[3px] rounded-full transition-all duration-500 ease-[var(--ease-ios)]"
                        style={{ width: on ? 40 : 16, background: on ? f.tone : "var(--fg-3)", opacity: on ? 1 : 0.45 }}
                      />
                      <span className={`text-[15px] font-semibold transition-colors duration-300 ${on ? "text-fg" : "text-fg-3 group-hover:text-fg-2"}`}>
                        {L(f.title)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div ref={stackRef} className="md:col-span-7 [--stack-top:80px] md:[--stack-top:128px]">
          {focusAreas.map((f, i) => (
            <StackCard key={f.tone} area={f} index={i} total={total} progress={scrollYProgress} sentinelRef={(el) => (sentinels.current[i] = el)} />
          ))}
        </div>
      </div>
    </section>
  );
}
