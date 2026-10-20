"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import RevealWords from "./RevealWords";
import { fadeUp, viewportOnce } from "@/lib/motion";

// Subjudul bagian ala One UI dengan tautan "Lihat semua" ala iOS. Judul muncul kata demi kata.
export default function SectionHeader({ title, href, linkLabel = "Lihat semua" }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4 px-1">
      <RevealWords as="h2" text={title} className="text-xl md:text-2xl font-bold tracking-tight text-fg" />
      {href && (
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce}>
          <Link href={href} className="pressable inline-flex items-center gap-0.5 text-sm font-semibold text-accent-fg hover:opacity-80">
            {linkLabel}
            <ChevronRight size={16} strokeWidth={2.5} />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
