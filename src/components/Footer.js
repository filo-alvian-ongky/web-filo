"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight, Mail, Phone, Sparkles } from "lucide-react";
import { profile, socialLinks } from "@/lib/data";
import Reveal from "./ui/Reveal";
import ScrubText from "./ui/ScrubText";
import { slideIn, stagger, viewportOnce } from "@/lib/motion";
import { useUI } from "./providers/UIProvider";
import { useLang } from "@/lib/i18n";
import { btn } from "./ui/styles";

function Row({ href, icon: Icon, tone, label, value, external }) {
  return (
    <motion.a
      variants={slideIn}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-2 active:bg-surface-3"
    >
      <span className="grid place-items-center w-9 h-9 rounded-[11px] text-white shrink-0" style={{ background: tone }}>
        <Icon size={18} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-semibold text-fg">{label}</span>
        {value && <span className="block text-sm text-fg-2 truncate">{value}</span>}
      </span>
      {external ? (
        <ArrowUpRight size={18} className="text-fg-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      ) : (
        <ChevronRight size={18} className="text-fg-3 transition-transform group-hover:translate-x-0.5" />
      )}
    </motion.a>
  );
}

// Progres 0 saat footer mulai masuk layar → 1 saat dasar halaman tercapai
const FOOTER_SCRUB = ["start 0.85", "end end"];

export default function Footer() {
  const footerRef = useRef(null);
  const { openContact, openAI } = useUI();
  const { t } = useLang();
  const year = new Date().getFullYear();
  const tones = { GitHub: "#3d444d", LinkedIn: "#0a66c2", Instagram: "#e1306c" };

  return (
    <footer ref={footerRef} className="px-4 md:px-6 pt-10 pb-32 md:pb-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="card relative overflow-hidden p-6 md:p-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-semibold text-accent-fg mb-2">{t.letsWork}</p>
            {/* Huruf demi huruf "menyala" mengikuti scroll. Acuannya footer itu sendiri, jadi pasti
                tuntas tepat saat halaman mentok di bawah (tinggi layar berapa pun) */}
            <ScrubText
              as="h2"
              by="char"
              text={t.projectInMind}
              target={footerRef}
              offset={FOOTER_SCRUB}
              within={[0, 0.6]}
              className="text-3xl md:text-4xl font-extrabold tracking-tight text-fg"
            />
            <ScrubText
              text={t.footerText}
              target={footerRef}
              offset={FOOTER_SCRUB}
              within={[0.3, 0.95]}
              dim={0.3}
              className="mt-3 text-fg-2 leading-relaxed max-w-md"
            />
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={openContact} className={btn.primary}>
                {t.contactMe} <ArrowUpRight size={18} strokeWidth={2.5} />
              </button>
              <button onClick={openAI} className={btn.tonal}>
                <Sparkles size={18} strokeWidth={2.25} /> {t.askFiloAI}
              </button>
            </div>
          </div>

          <motion.div
            variants={stagger(0.07, 0.3)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="relative rounded-[1.4rem] bg-bg/60 dark:bg-surface-2/60 ring-1 ring-separator overflow-hidden divide-y divide-separator"
          >
            <Row href={`mailto:${profile.email}`} icon={Mail} tone="#0a6cf5" label="Email" value={profile.email} />
            <Row href={profile.phoneHref} icon={Phone} tone="#12a150" label={t.phone} value={profile.phone} />
            {socialLinks.map((s) => (
              <Row key={s.name} href={s.href} icon={s.icon} tone={tones[s.name]} label={s.name} external />
            ))}
          </motion.div>
        </Reveal>

        <Reveal tilt={false} delay={0.15} className="mt-6 px-2 text-center text-sm text-fg-3">
          <p>
            © {year} {profile.name}. {t.rights}
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
