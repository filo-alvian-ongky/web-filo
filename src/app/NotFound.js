"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { House, LayoutGrid } from "lucide-react";
import { btn } from "../components/ui/styles";
import { fadeUp, stagger } from "@/lib/motion";
import { useLang } from "@/lib/i18n";

// Halaman 404: kartu One UI di tengah layar dengan jalan pulang ke Beranda & Proyek
export default function NotFound() {
  const { t } = useLang();

  return (
    <section className="px-4 md:px-6 min-h-svh grid place-items-center pt-24 pb-32 md:pt-32 md:pb-16">
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="visible"
        className="card relative overflow-hidden w-full max-w-xl p-8 md:p-12 text-center"
      >
        <div aria-hidden className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-accent/15 blur-3xl" />
        <motion.p variants={fadeUp} className="relative text-sm font-semibold text-accent-fg">
          {t.nfEyebrow}
        </motion.p>
        <motion.p
          variants={fadeUp}
          aria-hidden
          className="relative mt-1 text-[6.5rem] md:text-[8.5rem] leading-none font-extrabold tracking-tighter bg-linear-to-b from-accent to-accent/35 bg-clip-text text-transparent"
        >
          404
        </motion.p>
        <motion.h1 variants={fadeUp} className="relative mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-fg">
          {t.nfTitle}
        </motion.h1>
        <motion.p variants={fadeUp} className="relative mt-3 text-fg-2 leading-relaxed max-w-sm mx-auto">
          {t.nfDesc}
        </motion.p>
        <motion.div variants={fadeUp} className="relative mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/" className={btn.primary}>
            <House size={18} strokeWidth={2.25} /> {t.nfHome}
          </Link>
          <Link href="/projects" className={btn.secondary}>
            <LayoutGrid size={18} strokeWidth={2.25} /> {t.nfProjects}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
