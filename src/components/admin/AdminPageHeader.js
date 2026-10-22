"use client";

import { motion } from "framer-motion";
import { PAGE_HEADER } from "./tokens";
import { useCompactTitle } from "@/components/ui/PageHeader";
import RevealWords from "@/components/ui/RevealWords";
import { fadeUp, stagger } from "@/lib/motion";

/**
 * Judul besar ala One UI (sama dengan header halaman website), dengan tombol aksi di kanan.
 * Di ponsel judulnya pindah ke top bar (menggantikan "FiloCMS") setelah tergulir.
 */
export default function AdminPageHeader({ eyebrow, title, description, actions }) {
  const titleRef = useCompactTitle(title);
  return (
    <motion.header variants={stagger(0.08)} initial="hidden" animate="visible" className={PAGE_HEADER.root}>
      <div className="min-w-0">
        {eyebrow && (
          <motion.p variants={fadeUp} className="text-sm font-semibold text-accent-fg">
            {eyebrow}
          </motion.p>
        )}
        <h1 ref={titleRef} className={`${PAGE_HEADER.title} text-fg`}>
          <RevealWords text={title} inView={false} delay={0.05} stagger={0.07} />
        </h1>
        {description && (
          <motion.p variants={fadeUp} className={`${PAGE_HEADER.description} text-fg-2`}>
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
