"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Moon, Hand, PanelTop, Languages } from "lucide-react";
import BrandLogo from "../ui/BrandLogo";
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
          {/* Area aman: popup tidak pernah menyentuh tepi layar / status bar / gesture bar */}
          <div
            className="absolute inset-0 flex items-center justify-center px-6 md:p-5 pointer-events-none"
            style={{ paddingTop: "max(env(safe-area-inset-top), 1.5rem)", paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="intro-title"
              initial={{ opacity: 0, scale: 0.1, x: "40vw", y: "-42vh", skewY: 30, borderRadius: "100%" }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0, skewY: 0, borderRadius: "1.75rem" }}
              exit={{ opacity: 0, scale: 0, x: "40vw", y: "-42vh", skewY: 30, borderRadius: "100%" }}
              transition={spring.genie}
              className="pointer-events-auto relative w-full max-w-[21rem] md:max-w-lg max-h-full flex flex-col overflow-hidden bg-surface shadow-float origin-top-right"
            >
              <div aria-hidden className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/15 blur-3xl" />

              {/* Isi bisa digulir bila layar pendek atau ukuran huruf perangkat diperbesar */}
              <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pt-5 pb-2 md:px-8 md:pt-8">
                <BrandLogo title="Logo FiloAlvian.com" className="w-12 h-12 md:w-14 md:h-14 text-fg mb-4 md:mb-5" />
                <h2 id="intro-title" className="text-[1.375rem] md:text-3xl leading-tight font-extrabold tracking-tight text-fg">
                  {t.welcome}
                </h2>
                <p className="mt-1.5 md:mt-2 text-sm md:text-base text-fg-2 leading-relaxed">{t.welcomeSub}</p>

                <ul className="mt-5 md:mt-6 space-y-3.5 md:space-y-4">
                  {ITEMS.map((item) => (
                    <li key={item.title} className="flex items-start gap-3 md:gap-4">
                      <span
                        className="grid place-items-center w-9 h-9 md:w-10 md:h-10 rounded-[11px] md:rounded-[12px] text-white shrink-0"
                        style={{ background: item.tone }}
                      >
                        <item.icon className="w-[18px] h-[18px] md:w-5 md:h-5" />
                      </span>
                      <div className="min-w-0 pt-px">
                        <p className="text-[15px] md:text-base font-semibold text-fg leading-snug">{t[item.title]}</p>
                        {item.body && <p className="text-[13px] md:text-sm text-fg-2 leading-snug md:leading-relaxed">{t[item.body]}</p>}
                        {item.desktop && <p className="hidden md:block text-sm text-fg-2 leading-relaxed">{t[item.desktop]}</p>}
                        {item.mobile && <p className="md:hidden text-[13px] text-fg-2 leading-snug">{t[item.mobile]}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tombol selalu terlihat di bawah */}
              <div className="relative shrink-0 px-5 pt-3 pb-5 md:px-8 md:pt-4 md:pb-8">
                <button onClick={closeIntro} className={`${btn.primary} w-full h-12 md:h-14 text-[15px] md:text-base`}>
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
