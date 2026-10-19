"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { fadeUp, viewportOnce } from "@/lib/motion";

// Subjudul bagian ala One UI dengan tautan "Lihat semua" ala iOS
export default function SectionHeader({ title, href, linkLabel = "Lihat semua" }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce} className="flex items-end justify-between gap-4 mb-4 px-1">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-fg">{title}</h2>
      {href && (
        <Link href={href} className="pressable inline-flex items-center gap-0.5 text-sm font-semibold text-accent-fg hover:opacity-80">
          {linkLabel}
          <ChevronRight size={16} strokeWidth={2.5} />
        </Link>
      )}
    </motion.div>
  );
}
