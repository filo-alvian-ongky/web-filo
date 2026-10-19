"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { useUI } from "../providers/UIProvider";
import { useLang } from "@/lib/i18n";
import { spring } from "@/lib/motion";

// Three.js hanya dimuat di browser & hanya di halaman yang memakai lanyard
const LanyardScene = dynamic(() => import("./LanyardScene"), { ssr: false });

// Ditampilkan bila perangkat tidak mendukung WebGL
function StaticBadge({ profile }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="card w-48 p-3 text-center">
        <div className="relative aspect-square rounded-[1.1rem] overflow-hidden bg-surface-2">
          <Image src={profile.photo} alt={profile.name} fill sizes="192px" className="object-cover" />
        </div>
        <p className="mt-3 font-bold text-fg leading-tight">{profile.name}</p>
        <p className="text-xs text-fg-2 mt-0.5">{profile.campus}</p>
      </div>
    </div>
  );
}

/**
 * @param eventSource  elemen induk yang menerima event pointer (mis. section hero),
 *                     agar kanvas bisa menutupi area luas tanpa menghalangi klik.
 * @param anchorRef    elemen yang menentukan posisi horizontal titik gantung lanyard.
 */
export default function Lanyard({ profile, onTap, eventSource, anchorRef, className = "" }) {
  const ref = useRef(null);
  const { theme } = useUI();
  const { t } = useLang();
  const [active, setActive] = useState(true);
  const [anchor, setAnchor] = useState(0.5);
  const [flipped, setFlipped] = useState(false);

  // Hentikan render & fisika saat lanyard tidak terlihat (hemat baterai)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Hitung posisi titik gantung relatif terhadap lebar kanvas
  useEffect(() => {
    const el = ref.current;
    const slot = anchorRef?.current;
    if (!el || !slot) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      setAnchor(s.width === 0 || box.width === 0 ? 0.5 : (s.left + s.width / 2 - box.left) / box.width);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(slot);
    return () => ro.disconnect();
  }, [anchorRef]);

  return (
    <div ref={ref} className={className}>
      <LanyardScene
        profile={profile}
        dark={theme === "dark"}
        active={active}
        anchor={anchor}
        flipped={flipped}
        eventSource={eventSource}
        onTap={onTap}
        fallback={<StaticBadge profile={profile} />}
      />

      {/* Tombol balik kartu — diletakkan tepat di bawah kartu yang tergantung */}
      <motion.button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        // Jangan sampai klik tombol ikut dianggap "menarik kartu" oleh kanvas 3D
        onPointerDown={(e) => e.stopPropagation()}
        aria-pressed={flipped}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        whileTap={{ scale: 0.94 }}
        style={{ left: `${anchor * 100}%` }}
        className="pointer-events-auto absolute top-[91%] md:top-[81%] -translate-x-1/2 inline-flex items-center gap-1.5 h-9 pl-3 pr-3.5 rounded-full glass shadow-float text-[13px] font-semibold text-fg"
      >
        <motion.span animate={{ rotate: flipped ? 180 : 0 }} transition={spring.pop} className="grid place-items-center">
          <RotateCw size={15} strokeWidth={2.5} />
        </motion.span>
        {t.flipCard}
      </motion.button>
    </div>
  );
}
