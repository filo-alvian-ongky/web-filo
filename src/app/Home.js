"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Typewriter from "typewriter-effect";
import { ArrowUpRight, ChevronRight, Download, Hand } from "lucide-react";
import Card from "../components/Card";
import Lanyard from "../components/lanyard/Lanyard";
import Sheet from "../components/ui/Sheet";
import SectionHeader from "../components/ui/SectionHeader";
import { useUI } from "../components/providers/UIProvider";
import { btn } from "../components/ui/styles";
import { achievements, focusAreas, highlights, profile, techStack } from "@/lib/data";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { tr, useLang } from "@/lib/i18n";

export default function Home() {
  const { openContact } = useUI();
  const { lang, t, L } = useLang();
  const [photoOpen, setPhotoOpen] = useState(false);
  const role = L(profile.role);
  // Data kartu ID 3D mengikuti bahasa aktif (tekstur digambar ulang saat bahasa berganti)
  const badge = useMemo(() => ({ ...profile, role: tr(profile.role, lang), tagline: t.badgeTagline, label: t.badgeLabel }), [lang, t]);
  const heroRef = useRef(null);
  const slotRef = useRef(null);

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="relative">
        {/* Ponsel: lanyard di atas teks. Desktop: kanvas menutupi seluruh hero agar kartu bebas berayun */}
        <Lanyard
          profile={badge}
          onTap={() => setPhotoOpen(true)}
          eventSource={heroRef}
          anchorRef={slotRef}
          className="pointer-events-none relative z-10 h-[56svh] min-h-[390px] max-h-[520px] md:absolute md:inset-0 md:h-auto md:min-h-0 md:max-h-none"
        />
        <div className="mx-auto max-w-6xl md:px-6 grid grid-cols-1 md:grid-cols-12 md:min-h-[max(100svh,680px)]">
          <div ref={slotRef} aria-hidden className="hidden md:block md:order-last md:col-span-5" />

          <motion.div
            variants={stagger(0.15)}
            initial="hidden"
            animate="visible"
            className="px-4 md:px-0 md:col-span-7 flex flex-col justify-center items-center md:items-start text-center md:text-left pb-6 md:pt-24 md:pb-16"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full bg-surface ring-1 ring-separator shadow-card text-[13px] font-semibold text-fg-2"
            >
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-success opacity-60 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-success" />
              </span>
              {t.openToCollab}
            </motion.span>

            <h1 className="sr-only">
              {profile.name} — {role}, {profile.campus}
            </h1>
            <motion.div
              variants={fadeUp}
              aria-hidden
              className="mt-5 w-full min-h-[1.15em] whitespace-nowrap text-[clamp(1.75rem,8.4vw,4.75rem)] font-extrabold tracking-tight leading-[1.1] text-fg"
            >
              <Typewriter
                key={lang}
                options={{ autoStart: true, loop: true, delay: 60, deleteSpeed: 40 }}
                onInit={(tw) => {
                  const [first, second] = t.typewriter;
                  tw.typeString(first).pauseFor(1500).deleteAll().typeString(second).pauseFor(1500).deleteAll().start();
                }}
              />
            </motion.div>

            <motion.p variants={fadeUp} className="mt-4 max-w-xl text-lg md:text-xl text-fg-2 leading-relaxed">
              {lang === "en" ? (
                <>
                  I&apos;m <span className="font-bold text-fg">{profile.name}</span>, a dedicated Computer Science student at{" "}
                  <span className="font-bold text-accent-fg">{profile.campus}</span>, focused on building intelligent systems and UI/UX.
                </>
              ) : (
                <>
                  Saya <span className="font-bold text-fg">{profile.name}</span>, Mahasiswa Ilmu Komputer berdedikasi dengan fokus pada pengembangan
                  sistem cerdas dan UI/UX di <span className="font-bold text-accent-fg">{profile.campus}</span>.
                </>
              )}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button onClick={openContact} className={btn.primary}>
                {t.contactMe} <ArrowUpRight size={18} strokeWidth={2.5} />
              </button>
              <a href={L(profile.cv)} download className={btn.secondary}>
                <Download size={18} strokeWidth={2.25} /> {t.downloadCV}
              </a>
            </motion.div>

            <motion.p variants={fadeUp} className="hidden md:flex mt-10 items-center gap-2 text-sm text-fg-3">
              <Hand size={16} /> {t.dragHint}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Sorotan — gaya widget One UI */}
      <section className="px-4 md:px-6">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {highlights.map((h) => (
            <Card key={h.tone} className="p-5 md:p-6">
              <p className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: h.tone }}>
                {L(h.value)}
              </p>
              <p className="mt-1 text-sm text-fg-2 leading-snug">{L(h.label)}</p>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* Eksplorasi */}
      <section className="px-4 md:px-6 mt-14 md:mt-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader title={t.explore} />
          <motion.div
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
          >
            {focusAreas.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.tone} interactive className="p-6 md:p-7">
                  <span className="grid place-items-center w-12 h-12 rounded-[15px] text-white" style={{ background: f.tone }}>
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-fg">{L(f.title)}</h3>
                  <p className="mt-2 text-[15px] text-fg-2 leading-relaxed">{L(f.body)}</p>
                </Card>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Teknologi & pencapaian terbaru */}
      <section className="px-4 md:px-6 mt-14 md:mt-20">
        <motion.div
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4"
        >
          <Card className="md:col-span-2 p-6 md:p-7">
            <h2 className="text-lg font-bold text-fg">{t.techTitle}</h2>
            <p className="mt-1 text-sm text-fg-2">{t.techSub}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {techStack.map((tech) => {
                const Icon = tech.icon;
                return (
                  <span
                    key={tech.name}
                    style={{ "--tone": tech.color }}
                    className="group inline-flex items-center gap-2 h-10 pl-3 pr-3.5 rounded-full bg-surface-2 ring-1 ring-transparent text-sm font-semibold text-fg-2 transition-colors duration-300 hover:text-fg hover:ring-[var(--tone)] hover:bg-[color-mix(in_srgb,var(--tone)_10%,transparent)]"
                  >
                    <Icon className="w-[18px] h-[18px] text-fg-3 transition-colors duration-300 group-hover:text-[var(--tone)]" />
                    {tech.name}
                  </span>
                );
              })}
            </div>
          </Card>

          <Card className="md:col-span-3 p-2 md:p-3">
            <div className="flex items-center justify-between gap-4 px-4 pt-4 pb-2">
              <h2 className="text-lg font-bold text-fg">{t.latestAchievements}</h2>
              <Link href="/achievements" className="pressable inline-flex items-center gap-0.5 text-sm font-semibold text-accent-fg">
                {t.seeAll} <ChevronRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
            <ul>
              {achievements.slice(0, 4).map((a) => (
                <li key={a.image}>
                  <Link href="/achievements" className="group flex items-center gap-4 px-4 py-3 rounded-[1.1rem] transition-colors hover:bg-surface-2 active:bg-surface-3">
                    <span className="relative w-16 h-11 rounded-[10px] overflow-hidden bg-surface-2 shrink-0 ring-1 ring-separator">
                      <Image src={a.thumb} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-fg truncate">{L(a.title)}</span>
                      <span className="block text-sm text-fg-2 truncate">
                        {a.provider} · {a.date.slice(0, 4)}
                      </span>
                    </span>
                    <ChevronRight size={18} className="text-fg-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </section>

      <Sheet open={photoOpen} onClose={() => setPhotoOpen(false)} title={profile.name} subtitle={`${role} · ${profile.campus}`} size="sm">
        <div className="relative aspect-square rounded-[1.4rem] overflow-hidden bg-surface-2">
          <Image src={profile.photo} alt={`${t.photoOf} ${profile.name}`} fill sizes="(min-width: 768px) 448px, 100vw" className="object-cover" />
        </div>
      </Sheet>
    </>
  );
}
