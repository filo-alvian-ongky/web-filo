"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Sun, Moon, Sparkles, CircleHelp } from "lucide-react";
import { navItems, profile } from "@/lib/data";
import { LANGS, useLang } from "@/lib/i18n";
import { useUI } from "./providers/UIProvider";
import { iconBtn } from "./ui/styles";
import BrandLogo from "./ui/BrandLogo";
import { useSlidingPill } from "./ui/useSlidingPill";

export const isActivePath = (pathname, path) => (path === "/" ? pathname === "/" : pathname?.startsWith(path));

const SWAP = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.22 } };

/**
 * Teks di samping logo: `brand` berganti menjadi `title` (judul halaman yang sudah tergulir)
 * dengan animasi geser ala iOS. Dipakai navbar website & top bar CMS.
 */
export function SwapTitle({ brand, title = null, className = "" }) {
  return (
    // Kedua teks ditumpuk di sel grid yang sama agar bisa bertukar tanpa lompatan layout
    <span className={`grid items-center overflow-hidden py-0.5 text-[17px] font-bold tracking-tight text-fg ${className}`}>
      <AnimatePresence initial={false}>
        {title ? (
          <motion.span key={title} {...SWAP} className="[grid-area:1/1] truncate">
            {title}
          </motion.span>
        ) : (
          <motion.span key="brand" {...SWAP} className="[grid-area:1/1] truncate">
            {brand}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Logo + teks di sampingnya; `title` diisi saat judul halaman selain Beranda sudah digulir */
export function Logo({ compactUntilLg = false, title = null }) {
  const { t } = useLang();
  return (
    <Link href="/" aria-label={`${profile.domain} — ${t.home}`} className="pressable inline-flex items-center gap-2.5 shrink-0">
      <BrandLogo className="w-9 h-9 text-fg transition-colors" />
      <SwapTitle
        title={title}
        className={compactUntilLg ? "hidden lg:grid" : ""}
        brand={
          <>
            <span className="text-accent-fg">FiloAlvian</span>.com
          </>
        }
      />
    </Link>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useUI();
  const { t } = useLang();
  const dark = theme === "dark";
  return (
    <button onClick={toggleTheme} className={iconBtn} aria-label={dark ? t.useLight : t.useDark} title={t.toggleTheme}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: 45, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: -45, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid place-items-center"
        >
          {dark ? <Sun size={20} strokeWidth={2.25} /> : <Moon size={20} strokeWidth={2.25} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function HelpButton() {
  const { openIntro } = useUI();
  const { t } = useLang();
  return (
    <button onClick={openIntro} className={iconBtn} aria-label={t.openGuide} title={t.needGuide}>
      <CircleHelp size={20} strokeWidth={2.25} />
    </button>
  );
}

// Ponsel: satu tombol bundar yang berganti ID ⇄ EN (hemat ruang di top bar)
function LanguageButton() {
  const { lang, setLang, t } = useLang();
  const next = lang === "id" ? "en" : "id";
  return (
    <button
      onClick={() => setLang(next)}
      className={`${iconBtn} text-[13px] font-bold uppercase`}
      aria-label={`${t.language}: ${lang === "id" ? "Bahasa Indonesia" : "English"}`}
      title={t.language}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={lang} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.18 }}>
          {lang}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

// Desktop: pilihan bahasa ala segmented control iOS
export function LanguageToggle() {
  const { lang, setLang, t } = useLang();
  const { register, style } = useSlidingPill(lang);
  return (
    <div role="radiogroup" aria-label={t.language} className="relative flex items-center p-0.5 rounded-full bg-surface-2 ring-1 ring-separator">
      <motion.span aria-hidden style={style} className="absolute top-0 left-0 rounded-full bg-surface dark:bg-surface-3 shadow-[0_1px_3px_rgba(0,0,0,0.15)]" />
      {LANGS.map((code) => (
        <button
          key={code}
          ref={register(code)}
          role="radio"
          aria-checked={lang === code}
          aria-label={code === "id" ? "Bahasa Indonesia" : "English"}
          onClick={() => setLang(code)}
          className={`relative h-8 min-w-9 px-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
            lang === code ? "text-fg" : "text-fg-3 hover:text-fg-2"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { openAI, compactTitle } = useUI();
  const { t, L } = useLang();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const activePath = navItems.find((item) => isActivePath(pathname, item.path))?.path;
  const pill = useSlidingPill(activePath);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  return (
    <>
      {/* Desktop: di puncak halaman navbar melebar tanpa latar (logo di pojok kiri, menu di tengah,
          tombol di pojok kanan); saat digulir menyusut mulus menjadi pil kaca melayang */}
      <header
        className={`hidden md:block fixed inset-x-0 top-0 z-50 pointer-events-none transition-[padding] duration-500 ease-[var(--ease-ios)] ${
          scrolled ? "px-6 pt-4" : "px-0 pt-0"
        }`}
      >
        <nav
          aria-label={t.mainNav}
          className={`pointer-events-auto mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-3 border transition-[max-width,height,padding,border-radius,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-[var(--ease-ios)] ${
            scrolled
              ? "max-w-6xl h-16 rounded-[2rem] pl-4 pr-2 bg-glass border-[color:var(--glass-border)] shadow-float backdrop-blur-[22px] backdrop-saturate-[1.8]"
              : "max-w-full h-[76px] rounded-none px-6 bg-transparent border-transparent shadow-none backdrop-blur-[0px] backdrop-saturate-100"
          }`}
        >
          <div className="justify-self-start">
            <Logo compactUntilLg />
          </div>
          <ul className="relative flex items-center gap-1 justify-self-center">
            {/* Satu indikator yang bergeser ke samping mengikuti halaman aktif */}
            <motion.span aria-hidden style={pill.style} className="absolute top-0 left-0 rounded-full bg-accent-soft" />
            {navItems.map((item) => {
              const active = item.path === activePath;
              return (
                <li key={item.path}>
                  <Link
                    ref={pill.register(item.path)}
                    href={item.path}
                    aria-current={active ? "page" : undefined}
                    className={`relative inline-flex items-center h-10 px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                      active ? "text-accent-fg" : "text-fg-2 hover:text-fg"
                    }`}
                  >
                    {L(item.name)}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-1 justify-self-end">
            <button
              onClick={openAI}
              aria-label={t.askFiloAI}
              className="pressable inline-flex items-center justify-center gap-2 h-10 w-10 lg:w-auto lg:px-4 mr-1 rounded-full bg-accent text-white text-sm font-semibold hover:brightness-110"
            >
              <Sparkles size={16} strokeWidth={2.5} /> <span className="hidden lg:inline whitespace-nowrap">{t.askAI}</span>
            </button>
            <LanguageToggle />
            <HelpButton />
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Ponsel: top bar ala iOS — transparan di atas, kaca saat digulir */}
      <header
        className={`md:hidden fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 border-b ${
          scrolled ? "bg-glass backdrop-blur-xl backdrop-saturate-150 border-separator" : "bg-transparent border-transparent"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="relative h-14 pl-4 pr-2 flex items-center justify-between">
          {/* Logo tetap; teks di sampingnya berganti jadi nama halaman saat digulir (Beranda tetap FiloAlvian.com) */}
          <Logo title={compactTitle} />
          <div className="relative flex items-center">
            <LanguageButton />
            <HelpButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
}
