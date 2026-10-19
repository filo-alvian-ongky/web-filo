"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight, Heart, Mail, Phone, Sparkles } from "lucide-react";
import { profile, socialLinks } from "@/lib/data";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { useUI } from "./providers/UIProvider";
import { useLang } from "@/lib/i18n";
import { btn } from "./ui/styles";

function Row({ href, icon: Icon, tone, label, value, external }) {
  return (
    <a
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
    </a>
  );
}

export default function Footer() {
  const { openContact, openAI } = useUI();
  const { t } = useLang();
  const year = new Date().getFullYear();
  const tones = { GitHub: "#3d444d", LinkedIn: "#0a66c2", Instagram: "#e1306c" };

  return (
    <footer className="px-4 md:px-6 pt-10 pb-32 md:pb-10">
      <motion.div variants={stagger(0.12)} initial="hidden" whileInView="visible" viewport={viewportOnce} className="mx-auto max-w-6xl">
        <motion.div variants={fadeUp} className="card relative overflow-hidden p-6 md:p-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-semibold text-accent-fg mb-2">{t.letsWork}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-fg">{t.projectInMind}</h2>
            <p className="mt-3 text-fg-2 leading-relaxed max-w-md">{t.footerText}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={openContact} className={btn.primary}>
                {t.contactMe} <ArrowUpRight size={18} strokeWidth={2.5} />
              </button>
              <button onClick={openAI} className={btn.tonal}>
                <Sparkles size={18} strokeWidth={2.25} /> {t.askFiloAI}
              </button>
            </div>
          </div>

          <div className="relative rounded-[1.4rem] bg-bg/60 dark:bg-surface-2/60 ring-1 ring-separator overflow-hidden divide-y divide-separator">
            <Row href={`mailto:${profile.email}`} icon={Mail} tone="#0a6cf5" label="Email" value={profile.email} />
            <Row href={profile.phoneHref} icon={Phone} tone="#12a150" label={t.phone} value={profile.phone} />
            {socialLinks.map((s) => (
              <Row key={s.name} href={s.href} icon={s.icon} tone={tones[s.name]} label={s.name} external />
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-6 px-2 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-fg-3">
          <p>
            © {year} {profile.name}. {t.rights}
          </p>
          <p className="flex items-center gap-1">
            {t.madeWith} <Heart size={14} className="text-red-500 fill-red-500" /> {t.by} {profile.firstName}
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
}
