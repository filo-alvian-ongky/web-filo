"use client";

import { motion } from "framer-motion";
import RevealWords from "@/components/ui/RevealWords";
import { fadeUp, stagger } from "@/lib/motion";

/** Judul besar ala One UI (sama dengan header halaman website), dengan tombol aksi di kanan */
export default function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <motion.header
      variants={stagger(0.08)}
      initial="hidden"
      animate="visible"
      className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8 px-1"
    >
      <div className="min-w-0">
        {eyebrow && (
          <motion.p variants={fadeUp} className="text-sm font-semibold text-accent-fg">
            {eyebrow}
          </motion.p>
        )}
        <h1 className="mt-1 text-[2.25rem] md:text-5xl leading-[1.05] font-extrabold tracking-tight text-fg">
          <RevealWords text={title} inView={false} delay={0.05} stagger={0.07} />
        </h1>
        {description && (
          <motion.p variants={fadeUp} className="mt-2 max-w-xl text-fg-2 leading-relaxed">
            {description}
          </motion.p>
        )}
      </div>
      {actions && (
        <motion.div variants={fadeUp} className="flex flex-wrap gap-2 shrink-0">
          {actions}
        </motion.div>
      )}
    </motion.header>
  );
}
