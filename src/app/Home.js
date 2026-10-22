"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Typewriter from "typewriter-effect";
import { track } from "@vercel/analytics";
import { ArrowUpRight, Download, Hand } from "lucide-react";
import Card from "../components/Card";
import Lanyard from "../components/lanyard/Lanyard";
import Sheet from "../components/ui/Sheet";
import CountUp from "../components/ui/CountUp";
import FocusStack from "../components/home/FocusStack";
import TechScene from "../components/home/TechScene";
import AchievementsReel from "../components/home/AchievementsReel";
import { useUI } from "../components/providers/UIProvider";
import { btn } from "../components/ui/styles";
import { highlights, profile } from "@/lib/data";
import { fadeUp, stagger } from "@/lib/motion";
import { useLowPower, useMediaQuery } from "@/lib/hooks";
import { tr, useLang } from "@/lib/i18n";

// Widget sorotan: di desktop naik bergelombang (kiri lebih dulu) mengikuti scroll
function Highlight({ item, index, progress, wave }) {
  const { L } = useLang();
  const y = useTransform(progress, [0, 1], [index * 26, 0]);
  const value = L(item.value);
  return (
    <motion.div style={wave ? { y } : undefined}>
      <Card className="h-full p-5 md:p-6">
        <p className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: item.tone }}>
          {/^\d+$/.test(value) ? <CountUp value={Number(value)} /> : value}
        </p>
        <p className="mt-1 text-sm text-fg-2 leading-snug">{L(item.label)}</p>
      </Card>
    </motion.div>
  );
}

/**
 * @param techStack         teknologi untuk section "Teknologi" (dari CMS)
 * @param achievements      pencapaian terbaru untuk galeri
 * @param achievementCount  jumlah seluruh pencapaian (widget sorotan "N sertifikat")
 */
export default function Home({ techStack, achievements, achievementCount }) {
  const { openContact } = useUI();
  const { lang, t, L } = useLang();
  const [photoOpen, setPhotoOpen] = useState(false);
  const role = L(profile.role);
  // Data kartu ID 3D mengikuti bahasa aktif (tekstur digambar ulang saat bahasa berganti)
  const badge = useMemo(() => ({ ...profile, role: tr(profile.role, lang), tagline: t.badgeTagline, label: t.badgeLabel }), [lang, t]);
  const heroRef = useRef(null);
  const slotRef = useRef(null);
  const highlightRef = useRef(null);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Perangkat lemah / kurangi gerakan: kartu ID tampil statis, jadi petunjuk "tarik & ayunkan" tidak relevan
  const lowPower = useLowPower();
  const scrub = !useReducedMotion();

  // Hero "menjauh" saat digulir: teks naik & memudar, lanyard tertinggal (parallax) lalu memudar.
  // Lanyard sengaja tidak di-scale: kanvas 3D mengukur ukurannya lewat getBoundingClientRect,
  // jadi scale CSS membuat kanvas di-resize ulang tiap scroll berhenti → kartu terlihat "patah".
  const { scrollYProgress: hero } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const textY = useTransform(hero, [0, 1], [0, -140]);
  const textOpacity = useTransform(hero, [0.25, 0.7], [1, 0]);
  const lanyardY = useTransform(hero, [0, 1], isDesktop ? [0, 180] : [0, 60]);
  const lanyardOpacity = useTransform(hero, isDesktop ? [0.35, 0.9] : [0.15, 0.55], [1, 0]);

  const { scrollYProgress: highlightProgress } = useScroll({ target: highlightRef, offset: ["start end", "start 0.55"] });

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
          style={scrub ? { y: lanyardY, opacity: lanyardOpacity } : undefined}
          className="pointer-events-none relative z-10 h-[56svh] min-h-[390px] max-h-[520px] md:absolute md:inset-0 md:h-auto md:min-h-0 md:max-h-none"
        />
        <div className="mx-auto max-w-6xl md:px-6 grid grid-cols-1 md:grid-cols-12 md:min-h-[max(100svh,680px)]">
          <div ref={slotRef} aria-hidden className="hidden md:block md:order-last md:col-span-5" />

          {/* Di HP teks tetap diam agar nyaman dibaca; efek menjauh hanya di desktop */}
          <motion.div style={scrub && isDesktop ? { y: textY, opacity: textOpacity } : undefined} className="md:col-span-7 flex flex-col justify-center">
            <motion.div
              variants={stagger(0.15)}
              initial="hidden"
              animate="visible"
              className="px-4 md:px-0 flex flex-col items-center md:items-start text-center md:text-left pt-4 pb-6 md:pt-24 md:pb-16"
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
                <a href={L(profile.cv)} download onClick={() => track("cv_download", { lang })} className={btn.secondary}>
                  <Download size={18} strokeWidth={2.25} /> {t.downloadCV}
                </a>
              </motion.div>

              {!lowPower && (
                <motion.p variants={fadeUp} className="hidden md:flex mt-10 items-center gap-2 text-sm text-fg-3">
                  <Hand size={16} /> {t.dragHint}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sorotan — gaya widget One UI */}
      <section ref={highlightRef} className="px-4 md:px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {highlights.map((h, i) => (
            <Highlight
              key={h.tone}
              // Widget jumlah sertifikat mengikuti isi CMS secara otomatis
              item={h.countOf === "achievements" ? { ...h, value: String(achievementCount) } : h}
              index={i}
              progress={highlightProgress}
              wave={scrub && isDesktop}
            />
          ))}
        </div>
      </section>

      {/* Eksplorasi — kartu menempel & menumpuk */}
      <FocusStack />

      {/* Teknologi — ikon berkumpul menjadi grid saat digulir */}
      {techStack.length > 0 && <TechScene items={techStack} />}

      {/* Pencapaian terbaru — galeri yang bergeser ke samping saat digulir */}
      {achievements.length > 0 && <AchievementsReel items={achievements} total={achievementCount} />}

      <Sheet open={photoOpen} onClose={() => setPhotoOpen(false)} title={profile.name} subtitle={`${role} · ${profile.campus}`} size="sm">
        <div className="relative aspect-square rounded-[1.4rem] overflow-hidden bg-surface-2">
          <Image src={profile.photo} alt={`${t.photoOf} ${profile.name}`} fill sizes="(min-width: 768px) 448px, 100vw" className="object-cover" />
        </div>
      </Sheet>
    </>
  );
}
