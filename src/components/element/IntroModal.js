"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, LayoutGrid, Moon, Hand, PanelTop, Languages } from "lucide-react";
import { spring } from "@/lib/motion";
import { useEscape, useScrollLock } from "@/lib/hooks";
import { useUI } from "../providers/UIProvider";
import { btn } from "../ui/styles";
import { useLang } from "@/lib/i18n";

// Teks diambil dari kamus i18n berdasarkan kunci
const ITEMS = [
  { icon: PanelTop, tone: "#0a6cf5", title: "guideNav", desktop: "guideNavDesktop", mobile: "guideNavMobile" },
  { icon: Hand, tone: "#f97316", title: "guideBadge", body: "guideBadgeBody" },
  { icon: Sparkles, tone: "#8b5cf6", title: "guideAI", body: "guideAIBody" },
  { icon: Languages, tone: "#12a150", title: "guideLang", body: "guideLangBody" },
  { icon: Moon, tone: "#4f46e5", title: "guideTheme", body: "guideThemeBody" },
];

// Panduan website — tetap memakai animasi "genie" bawaan,
// kini berasal dari tombol bantuan (?) di pojok kanan atas.
export default function IntroModal() {
  const { introOpen, closeIntro } = useUI();
  const { t } = useLang();
  useScrollLock(introOpen);
  useEscape(introOpen, closeIntro);

  return (
    <AnimatePresence>
      {introOpen && (
        <div key="intro" className="fixed inset-0 z-[210]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeIntro}
          />
          <div className="absolute inset-0 flex items-center justify-center p-5 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="intro-title"
              initial={{ opacity: 0, scale: 0.1, x: "40vw", y: "-42vh", skewY: 30, borderRadius: "100%" }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0, skewY: 0, borderRadius: "2rem" }}
              exit={{ opacity: 0, scale: 0, x: "40vw", y: "-42vh", skewY: 30, borderRadius: "100%" }}
              transition={spring.genie}
              className="pointer-events-auto relative w-full max-w-lg overflow-hidden bg-surface shadow-float p-6 md:p-8 origin-top-right"
            >
              <div aria-hidden className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/15 blur-3xl" />
              <div className="relative">
                <div className="grid place-items-center w-14 h-14 rounded-[18px] bg-accent text-white mb-5 shadow-[0_10px_24px_-10px_rgba(10,108,245,0.8)]">
                  <LayoutGrid size={26} />
                </div>
                <h2 id="intro-title" className="text-2xl md:text-3xl font-extrabold tracking-tight text-fg">
                  {t.welcome}
                </h2>
                <p className="mt-2 text-fg-2 leading-relaxed">{t.welcomeSub}</p>

                <ul className="mt-6 space-y-4">
                  {ITEMS.map((item) => (
                    <li key={item.title} className="flex items-start gap-4">
                      <span className="grid place-items-center w-10 h-10 rounded-[12px] text-white shrink-0" style={{ background: item.tone }}>
                        <item.icon size={20} />
                      </span>
                      <div>
                        <p className="font-semibold text-fg">{t[item.title]}</p>
                        {item.body && <p className="text-sm text-fg-2 leading-relaxed">{t[item.body]}</p>}
                        {item.desktop && <p className="hidden md:block text-sm text-fg-2 leading-relaxed">{t[item.desktop]}</p>}
                        {item.mobile && <p className="md:hidden text-sm text-fg-2 leading-relaxed">{t[item.mobile]}</p>}
                      </div>
                    </li>
                  ))}
                </ul>

                <button onClick={closeIntro} className={`${btn.primary} w-full mt-8 h-14 text-base`}>
                  {t.guideCta}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
