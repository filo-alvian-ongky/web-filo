"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { navItems } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { useUI } from "./providers/UIProvider";
import { isActivePath } from "./Navbar";
import { useSlidingPill } from "./ui/useSlidingPill";

// Tab bar melayang di bawah (zona jangkauan jempol One UI + gaya tab bar iOS)
export default function TabBar() {
  const pathname = usePathname();
  const { openAI } = useUI();
  const { t, L } = useLang();
  const activePath = navItems.find((item) => isActivePath(pathname, item.path))?.path;
  const pill = useSlidingPill(activePath);

  return (
    <nav
      aria-label={t.mainNav}
      className="md:hidden fixed inset-x-0 bottom-0 z-50 px-3 pointer-events-none"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      <div className="flex items-center gap-2.5">
        <ul className="relative pointer-events-auto flex-1 flex items-center h-16 px-1.5 rounded-full glass shadow-float">
          {/* Satu indikator yang bergeser ke samping mengikuti tab aktif */}
          <motion.span aria-hidden style={pill.style} className="absolute top-0 left-0 rounded-full bg-accent-soft" />
          {navItems.map((item) => {
            const active = item.path === activePath;
            const Icon = item.icon;
            return (
              <li key={item.path} className="flex-auto min-w-0">
                <Link
                  ref={pill.register(item.path)}
                  href={item.path}
                  aria-current={active ? "page" : undefined}
                  className="pressable relative flex flex-col items-center justify-center gap-0.5 h-[52px] rounded-full"
                >
                  <Icon size={21} strokeWidth={active ? 2.4 : 2} className={`transition-colors ${active ? "text-accent-fg" : "text-fg-2"}`} />
                  <span className={`max-w-full truncate px-0.5 text-[10px] tracking-[-0.01em] font-semibold leading-none transition-colors ${active ? "text-accent-fg" : "text-fg-2"}`}>
                    {L(item.short ?? item.name)}
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
