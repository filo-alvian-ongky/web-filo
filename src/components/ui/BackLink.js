"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useLang } from "@/lib/i18n";

// Tombol kembali ala iOS ("‹ Proyek") di atas judul halaman detail
export default function BackLink({ href, label }) {
  const { t } = useLang();
  return (
    <Link href={href} aria-label={`${t.backTo} ${label}`} className="pressable inline-flex items-center gap-0.5 -ml-1 hover:opacity-80">
      <ChevronLeft size={18} strokeWidth={2.5} />
      {label}
    </Link>
  );
}
