"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { navItems } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { useUI } from "./providers/UIProvider";
import { isActivePath } from "./Navbar";
import { useSlidingPill } from "./ui/useSlidingPill";

// Ruang kosong minimum per label (px, total kiri + kanan) agar teks tab tidak terlihat berhimpitan
const LABEL_BREATHING = 10;

// Tab bar melayang di bawah (zona jangkauan jempol One UI + gaya tab bar iOS)
export default function TabBar() {
  const pathname = usePathname();
  const { openAI } = useUI();
  const { t, L } = useLang();
  const activePath = navItems.find((item) => isActivePath(pathname, item.path))?.path;
  const pill = useSlidingPill(activePath);
  const listRef = useRef(null);
  const labels = useRef([]);
  // true = layar terlalu sempit (atau ukuran huruf perangkat besar) sehingga label berhimpitan → tampilkan ikon saja
  const [iconsOnly, setIconsOnly] = useState(false);

  // Semua tab sama lebar. Label selalu ikut dihitung lebarnya (hanya disembunyikan secara visual),
  // jadi bisa dicek kapan saja: label tampil hanya bila label terpanjang masih muat di satu tab
  // dengan ruang lega di kiri-kanannya.
  useEffect(() => {
    const check = () => {
      const list = listRef.current;
      const items = labels.current.filter(Boolean);
      if (!list || !items.length) return;
      const style = getComputedStyle(list);
      const tabWidth = (list.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)) / items.length;
      const widest = Math.max(...items.map((el) => el.scrollWidth));
      setIconsOnly(widest + LABEL_BREATHING > tabWidth);
    };
    const ro = new ResizeObserver(check);
    if (listRef.current) ro.observe(listRef.current);
    labels.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [t]);

  return (
    <nav
      aria-label={t.mainNav}
      className="md:hidden fixed inset-x-0 bottom-0 z-50 px-3 pointer-events-none"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      <div className="flex items-center gap-2.5">
        <ul ref={listRef} className="relative pointer-events-auto flex-1 flex items-center h-16 px-1.5 rounded-full glass shadow-float">
          {/* Satu indikator yang bergeser ke samping mengikuti tab aktif */}
          <motion.span aria-hidden style={pill.style} className="absolute top-0 left-0 rounded-full bg-accent-soft" />
          {navItems.map((item, i) => {
            const active = item.path === activePath;
            const Icon = item.icon;
            const label = L(item.short ?? item.name);
            return (
              <li key={item.path} className="flex-1 basis-0 min-w-0">
                <Link
                  ref={pill.register(item.path)}
                  href={item.path}
                  aria-current={active ? "page" : undefined}
                  aria-label={label}
                  title={iconsOnly ? label : undefined}
                  className={`pressable relative flex flex-col items-center justify-center h-[52px] rounded-full transition-[gap] duration-200 ${
                    iconsOnly ? "gap-0" : "gap-0.5"
                  }`}
                >
                  <Icon
                    strokeWidth={active ? 2.4 : 2}
                    className={`transition-all duration-200 ${iconsOnly ? "w-6 h-6" : "w-[21px] h-[21px]"} ${active ? "text-accent-fg" : "text-fg-2"}`}
                  />
                  <span
                    ref={(el) => (labels.current[i] = el)}
                    aria-hidden
                    className={`max-w-full truncate text-[10px] tracking-[-0.01em] font-semibold transition-all duration-200 ${
                      iconsOnly ? "h-0 opacity-0 leading-[0]" : "h-auto opacity-100 leading-none"
                    } ${active ? "text-accent-fg" : "text-fg-2"}`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <button
          onClick={openAI}
          aria-label={t.askFiloAI}
          className="pointer-events-auto pressable grid place-items-center w-16 h-16 shrink-0 rounded-full bg-accent text-white shadow-float"
        >
          <Sparkles size={24} strokeWidth={2.25} />
        </button>
      </div>
    </nav>
  );
}
