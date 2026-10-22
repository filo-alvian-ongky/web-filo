"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CircleAlert, CircleCheck, LoaderCircle, Send } from "lucide-react";
import { track } from "@vercel/analytics";
import { contactLinks } from "@/lib/data";
import { useUI } from "./providers/UIProvider";
import { useLang } from "@/lib/i18n";
import { EASE_IOS } from "@/lib/motion";
import Sheet from "./ui/Sheet";
import Turnstile from "./ui/Turnstile";
import { btn } from "./ui/styles";

// Nama kanal untuk statistik: "Gmail" → email, lainnya huruf kecil (instagram, whatsapp)
const channelOf = (name) => (name === "Gmail" ? "email" : name.toLowerCase());

// Site key Turnstile (publik). Belum diisi → form disembunyikan, sheet hanya menampilkan link kontak.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

// Batas sama dengan /api/contact & tabel contact_messages
const MAX = { name: 100, email: 200, subject: 150, message: 3000 };
const EMPTY = { name: "", email: "", subject: "", message: "", website: "" };

const sectionLabel = "px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-fg-3";
const inputClass =
  "w-full h-12 px-4 rounded-2xl bg-surface-2 text-fg text-[15px] ring-1 ring-transparent outline-none transition-shadow placeholder:text-fg-3 focus:ring-2 focus:ring-accent";
const alertClass = "flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-[#e5484d]/10 text-sm text-[#d93d42] dark:text-[#ff6b70]";
const swap = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.3, ease: EASE_IOS } };

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2 px-1 mb-1.5">
        <span className="text-[13px] font-semibold text-fg-2">{label}</span>
        {hint && <span className="text-xs text-fg-3 tabular-nums">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function ContactForm({ values, setValues, status, setStatus }) {
  const { t, lang } = useLang();
  const { theme } = useUI();
  const [token, setToken] = useState(null);
  // Token Turnstile hanya sekali pakai → widget dipasang ulang (key baru) setelah tiap pengiriman
  const [attempt, setAttempt] = useState(0);
  const [captchaError, setCaptchaError] = useState(false);
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const sending = status.state === "sending";
  const retryCaptcha = () => {
    setCaptchaError(false);
    setToken(null);
    setAttempt((n) => n + 1);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!token || sending) return;
    setStatus({ state: "sending" });
    let error = "unavailable";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, lang, turnstileToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      error = res.ok && data.ok ? null : (data.error ?? "unavailable");
    } catch {
      // Jaringan terputus — isi form tetap ada, pengunjung bisa mencoba lagi
    }
    track("contact_submit", { result: error ?? "sent", lang });
    setToken(null);
    setAttempt((n) => n + 1);
    setStatus(error ? { state: "error", error } : { state: "sent", name: values.name.trim(), email: values.email.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label={t.contactName}>
          <input required maxLength={MAX.name} autoComplete="name" value={values.name} onChange={set("name")} placeholder={t.contactNamePh} className={inputClass} />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            inputMode="email"
            maxLength={MAX.email}
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            placeholder={t.contactEmailPh}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label={t.contactSubject}>
        <input maxLength={MAX.subject} value={values.subject} onChange={set("subject")} placeholder={t.contactSubjectPh} className={inputClass} />
      </Field>
      <Field label={t.contactMessage} hint={`${values.message.length}/${MAX.message}`}>
        <textarea
          required
          rows={5}
          maxLength={MAX.message}
          value={values.message}
          onChange={set("message")}
          placeholder={t.contactMessagePh}
          className={`${inputClass} h-auto min-h-[8.5rem] py-3 leading-relaxed resize-y`}
        />
      </Field>

      {/* Honeypot: tidak terlihat & tidak bisa difokus pengunjung, tapi sering diisi bot */}
      <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
        </label>
      </div>

      <Turnstile
        key={attempt}
        siteKey={TURNSTILE_SITE_KEY}
        action="contact"
        theme={theme}
        lang={lang}
        onToken={(value) => {
          setToken(value);
          if (value) setCaptchaError(false);
        }}
        onError={() => setCaptchaError(true)}
        className="empty:hidden"
      />

      {/* Widget Turnstile gagal di browser (mis. dianggap bot) → pengunjung bisa memasang ulang widget */}
      {captchaError ? (
        <div role="alert" className={alertClass}>
          <CircleAlert size={18} className="shrink-0 mt-px" />
          <span className="flex-1">{t.contactCaptchaFailed}</span>
          <button type="button" onClick={retryCaptcha} className="pressable shrink-0 font-semibold underline underline-offset-2">
            {t.contactRetry}
          </button>
        </div>
      ) : (
        status.state === "error" && (
          <p role="alert" className={alertClass}>
            <CircleAlert size={18} className="shrink-0 mt-px" />
            {t.contactErrors[status.error] ?? t.contactErrors.unavailable}
          </p>
        )
      )}

      <button type="submit" disabled={!token || sending} className={`${btn.primary} w-full`}>
        {sending ? (
          <>
            <LoaderCircle size={18} className="animate-spin" /> {t.contactSending}
          </>
        ) : token ? (
          <>
            <Send size={17} /> {t.contactSend}
          </>
        ) : (
          <>
            <LoaderCircle size={18} className="animate-spin" /> {t.contactVerifying}
          </>
        )}
      </button>
      <p className="px-1 text-xs leading-snug text-fg-3">{t.contactNote}</p>
    </form>
  );
}

function SentNotice({ status, onReset }) {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center text-center px-4 py-10 rounded-[1.4rem] bg-surface-2/70">
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
        className="grid place-items-center w-16 h-16 rounded-full bg-success/15 text-success"
      >
        <CircleCheck size={34} strokeWidth={2.25} />
      </motion.span>
      <p className="mt-4 text-xl font-bold tracking-tight text-fg">{t.contactSentTitle}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-fg-2">
        {t.contactSentBody.replace("{name}", status.name).replace("{email}", status.email)}
      </p>
      <button type="button" onClick={onReset} className={`${btn.tonal} mt-6 h-11`}>
        {t.contactAnother}
      </button>
    </div>
  );
}

export default function ContactSheet() {
  const { contactOpen, closeContact } = useUI();
  const { t } = useLang();
  // Isi form disimpan di sini (komponen ini tetap terpasang saat sheet ditutup) → draf tidak hilang
  // bila sheet tertutup tak sengaja
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState({ state: "idle" });
  const reset = () => {
    setValues(EMPTY);
    setStatus({ state: "idle" });
  };
  const close = () => {
    closeContact();
    if (status.state === "sent") reset();
  };
  const withForm = Boolean(TURNSTILE_SITE_KEY);

  const links = (
    <div className="rounded-[1.4rem] bg-surface-2/70 overflow-hidden divide-y divide-separator">
      {contactLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("contact_click", { channel: channelOf(link.name) })}
          className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-3/70 active:bg-surface-3"
        >
          <span className="relative w-11 h-11 rounded-[13px] overflow-hidden shrink-0 bg-surface">
            <Image src={link.iconPath} alt="" fill sizes="44px" className="object-cover" unoptimized />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[15px] font-semibold text-fg">{link.name}</span>
            <span className="block text-sm text-fg-2 truncate">{link.detail}</span>
          </span>
          <ArrowUpRight size={18} className="text-fg-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-fg" />
        </a>
      ))}
    </div>
  );

  if (!withForm) {
    return (
      <Sheet open={contactOpen} onClose={closeContact} title={t.contactMe} subtitle={t.contactSubLinks} size="sm">
        {links}
      </Sheet>
    );
  }

  return (
    <Sheet open={contactOpen} onClose={close} title={t.contactMe} subtitle={t.contactSub} size="lg">
      {/* Ponsel: kanal kontak dulu (singkat), lalu form. Desktop: form di kiri, kanal kontak di kanan. */}
      <div className="grid gap-6 md:gap-8 md:grid-cols-[minmax(0,1fr)_17rem]">
        <section className="md:order-2">
          <h3 className={sectionLabel}>{t.contactDirect}</h3>
          {links}
        </section>
        <section className="relative md:order-1">
          <h3 className={sectionLabel}>{t.contactFormTitle}</h3>
          <AnimatePresence mode="wait" initial={false}>
            {status.state === "sent" ? (
              <motion.div key="sent" {...swap}>
                <SentNotice status={status} onReset={reset} />
              </motion.div>
            ) : (
              <motion.div key="form" {...swap}>
                <ContactForm values={values} setValues={setValues} status={status} setStatus={setStatus} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </Sheet>
  );
}
