"use client";

import { usePathname } from "next/navigation";
import { X } from "lucide-react";

/**
 * Penanda mode pratinjau admin (item draft ikut tampil) + tombol keluar.
 * Hanya dirender saat draftMode aktif (lihat src/app/api/preview/route.js).
 */
export default function PreviewBanner() {
  const pathname = usePathname();
  return (
    <form
      method="post"
      action="/api/preview"
      role="status"
      className="fixed z-[60] left-1/2 -translate-x-1/2 top-[calc(env(safe-area-inset-top)+64px)] md:top-auto md:bottom-6 md:left-6 md:translate-x-0 flex items-center gap-2.5 h-11 pl-4 pr-1.5 rounded-full glass shadow-float text-[13px] font-semibold text-fg whitespace-nowrap"
    >
      <span aria-hidden className="w-2 h-2 rounded-full bg-[#F59E0B]" />
      Mode pratinjau · draft ikut tampil
      <input type="hidden" name="path" value={pathname} />
      <button type="submit" className="pressable inline-flex items-center gap-1 h-8 pl-2.5 pr-3 rounded-full bg-accent text-white">
        <X size={14} strokeWidth={2.5} /> Keluar
      </button>
    </form>
  );
}
