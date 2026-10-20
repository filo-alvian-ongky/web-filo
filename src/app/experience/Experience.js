"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { BriefcaseBusiness, Calendar } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Reveal from "../../components/ui/Reveal";
import Tilt from "../../components/ui/Tilt";
import TechIcon from "../../components/ui/TechIcon";
import { chip } from "../../components/ui/styles";
import { useLang } from "@/lib/i18n";

// Garis waktu "terisi" saat titiknya melewati garis ini (proporsi tinggi layar)
const LINE = 0.6;

// Ikon pengalaman: abu-abu sebelum dilewati, menyala dengan warnanya setelah garis waktu sampai
function Marker({ tone, reached, size, className = "" }) {
  return (
    <span aria-hidden className={`relative grid place-items-center shrink-0 overflow-hidden transition-transform duration-500 ease-[var(--ease-ios)] ${reached ? "scale-100" : "scale-90"} ${className}`}>
      <span className="absolute inset-0 bg-surface-2" />
      <span className={`absolute inset-0 transition-opacity duration-500 ${reached ? "opacity-100" : "opacity-0"}`} style={{ background: tone }} />
      <BriefcaseBusiness size={size} className={`relative transition-colors duration-500 ${reached ? "text-white" : "text-fg-3"}`} />
    </span>
  );
}

export default function Experience({ experiences }) {
  const { t, L } = useLang();
  const listRef = useRef(null);
  const markers = useRef([]);
  const reduceMotion = useReducedMotion();
  const [reached, setReached] = useState(reduceMotion ? experiences.length : 0);

  // Isi garis waktu mengikuti scroll (dihaluskan spring agar tetap lembut di HP tanpa smooth scroll)
  const { scrollYProgress, scrollY } = useScroll({ target: listRef, offset: [`start ${LINE}`, `end ${LINE}`] });
  const fill = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });

  const update = useCallback(() => {
    const line = window.innerHeight * LINE;
    let count = 0;
    markers.current.forEach((el) => {
      if (el && el.getBoundingClientRect().top < line) count += 1;
    });
    setReached(count);
  }, []);
  useMotionValueEvent(scrollY, "change", update);

  const isReached = (i) => reduceMotion || i < reached;

  return (
    <>
      <PageHeader eyebrow={t.expEyebrow} title={t.expTitle} description={t.expDesc} />

      <section className="px-4 md:px-6">
        <ol ref={listRef} className="relative mx-auto max-w-4xl space-y-3 md:space-y-6">
          {/* Garis waktu (desktop): jalur abu-abu + isian berwarna yang memanjang mengikuti scroll */}
          <span aria-hidden className="hidden md:block absolute left-5 top-12 bottom-10 w-[2px] -translate-x-1/2 rounded-full bg-separator" />
          <motion.span
            aria-hidden
            style={{ scaleY: reduceMotion ? 1 : fill, background: `linear-gradient(to bottom, ${[...experiences.map((e) => e.tone), experiences.at(-1)?.tone ?? "#0A6CF5"].join(", ")})` }}
            className="hidden md:block absolute left-5 top-12 bottom-10 w-[3px] -translate-x-1/2 rounded-full origin-top [mask-image:linear-gradient(to_bottom,black_85%,transparent)]"
          />

          {experiences.map((exp, i) => (
            <Reveal as="li" key={exp.id} tilt={false} className="relative md:pl-16">
              {/* Titik ukur (selalu ada, juga di HP) sejajar pusat ikon */}
              <span ref={(el) => (markers.current[i] = el)} aria-hidden className="absolute left-0 top-12 w-px h-px" />
              <span className="hidden md:block absolute left-0 top-7">
                <Marker tone={exp.tone} reached={isReached(i)} size={18} className="w-10 h-10 rounded-full ring-[6px] ring-bg" />
              </span>

              <Tilt as="article" className="card p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Marker tone={exp.tone} reached={isReached(i)} size={20} className="md:hidden w-11 h-11 rounded-[14px]" />
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-fg">{exp.role}</h2>
                      <p className="text-fg-2 font-medium">{exp.company}</p>
                    </div>
                  </div>
                  <span className="self-start inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-accent-soft text-accent-fg text-xs font-semibold whitespace-nowrap">
                    <Calendar size={14} /> {L(exp.period)}
                  </span>
                </div>

                <ul className="mt-6 space-y-3">
                  {exp.points.map((point, pi) => (
                    <li key={pi} className="flex gap-3 text-fg-2 leading-relaxed">
                      <span className="mt-[0.6rem] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: exp.tone }} />
                      {L(point)}
                    </li>
                  ))}
                </ul>

                {exp.stack.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-separator flex flex-wrap gap-2">
                    {exp.stack.map((s) => (
                      <span key={s.id} className={chip}>
                        <TechIcon tech={s} className="w-3.5 h-3.5" /> {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </Tilt>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  );
}
