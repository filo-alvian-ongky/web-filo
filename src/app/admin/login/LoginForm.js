"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Copy, Eye, EyeOff, KeyRound, LogIn, LogOut, ShieldCheck, Smartphone } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/Navbar";
import { btn } from "@/components/ui/styles";
import { inputClass } from "@/components/admin/fields";
import { fadeUp, spring, stagger } from "@/lib/motion";
import { getBrowserSupabase } from "@/lib/supabase/browser";

const field = `${inputClass} !bg-surface-2/90 !ring-separator`;
const friendlyError = (message) =>
  /invalid login credentials/i.test(message)
    ? "Email atau password salah."
    : /invalid totp|invalid code|expired/i.test(message)
      ? "Kode salah atau sudah kedaluwarsa. Coba kode terbaru di aplikasi authenticator."
      : /rate limit|too many/i.test(message)
        ? "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi."
        : message;

function CodeInput({ value, onChange }) {
  return (
    <input
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]{6}"
      maxLength={6}
      required
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      placeholder="••••••"
      aria-label="Kode 6 digit"
      className={`${field} text-center text-2xl font-bold tracking-[0.5em] tabular-nums`}
    />
  );
}

export default function LoginForm({ signedInAs, needsMfa }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  // password → (verify | enroll) → selesai
  const [step, setStep] = useState(needsMfa ? { kind: "loading" } : { kind: "password" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const started = useRef(false);

  const finish = () => {
    router.replace("/admin");
    router.refresh();
  };

  // Setelah password benar: minta kode 2FA, atau daftarkan authenticator bila belum pernah
  const continueMfa = async () => {
    const mfa = getBrowserSupabase().auth.mfa;
    try {
      const { data: aal } = await mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === "aal2") return finish();
      const { data, error: listError } = await mfa.listFactors();
      if (listError) throw listError;
      const verified = (data?.all ?? []).find((f) => f.factor_type === "totp" && f.status === "verified");
      if (verified) return setStep({ kind: "verify", factorId: verified.id });
      // Bersihkan pendaftaran lama yang belum selesai, lalu buat QR baru
      for (const f of (data?.all ?? []).filter((f) => f.status === "unverified")) await mfa.unenroll({ factorId: f.id });
      const { data: enrolled, error: enrollError } = await mfa.enroll({
        factorType: "totp",
        issuer: "FiloAlvian.com",
        friendlyName: `FiloCMS ${Date.now().toString(36)}`,
      });
      if (enrollError) throw enrollError;
      setStep({ kind: "enroll", factorId: enrolled.id, qr: enrolled.totp.qr_code, secret: enrolled.totp.secret });
    } catch (e) {
      setError(friendlyError(e.message));
      setStep({ kind: "password" });
    }
  };

  // Halaman dibuka saat sesi masih menunggu kode 2FA → langsung ke langkah kode
  useEffect(() => {
    if (!needsMfa || started.current) return;
    started.current = true;
    continueMfa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsMfa]);

  const submitPassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: authError } = await getBrowserSupabase().auth.signInWithPassword({ email: email.trim(), password });
    setPassword("");
    if (authError) {
      setError(friendlyError(authError.message));
      setBusy(false);
      return;
    }
    setStep({ kind: "loading" });
    await continueMfa();
    setBusy(false);
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: verifyError } = await getBrowserSupabase().auth.mfa.challengeAndVerify({ factorId: step.factorId, code });
    if (verifyError) {
      setError(friendlyError(verifyError.message));
      setCode("");
      setBusy(false);
      return;
    }
    finish();
  };

  const signOut = async () => {
    await getBrowserSupabase().auth.signOut();
    setStep({ kind: "password" });
    setCode("");
    router.refresh();
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(step.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="relative min-h-svh grid place-items-center px-4 py-20">
      {/* Top bar sederhana ala navbar website */}
      <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-4 md:px-6 pt-4">
        <Link href="/" className="pressable inline-flex items-center gap-1.5 h-10 pl-3 pr-4 rounded-full glass text-sm font-semibold text-fg">
          <ArrowLeft size={16} /> Website
        </Link>
        <div className="rounded-full glass">
          <ThemeToggle />
        </div>
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={spring.sheet}
        className="w-full max-w-sm rounded-[2rem] glass shadow-float p-6 md:p-8"
      >
        <motion.div variants={stagger(0.07, 0.1)} initial="hidden" animate="visible">
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <BrandLogo title="Logo FiloAlvian.com" className="w-12 h-12 text-fg" />
            <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-accent-soft text-accent-fg text-xs font-bold">
              <ShieldCheck size={14} /> Khusus admin
            </span>
          </motion.div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step.kind} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
              {step.kind === "password" && (
                <>
                  <h1 className="mt-5 text-[1.75rem] leading-tight font-extrabold tracking-tight text-fg">
                    Masuk ke <span className="text-accent-fg">Filo</span>CMS
                  </h1>
                  <p className="mt-1 text-sm text-fg-2">Kelola pengalaman, pencapaian, proyek, dan teknologi di FiloAlvian.com.</p>

                  {signedInAs && (
                    <div className="mt-5 p-3.5 rounded-2xl bg-[color-mix(in_srgb,#f59e0b_14%,transparent)] text-sm text-fg">
                      Akun <b>{signedInAs}</b> bukan admin.
                      <button onClick={signOut} className={`${btn.small} mt-3 w-full`}>
                        <LogOut size={15} /> Keluar
                      </button>
                    </div>
                  )}

                  <form onSubmit={submitPassword} className="mt-6 space-y-3">
                    <label className="block">
                      <span className="text-[13px] font-semibold text-fg-2">Email</span>
                      <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} mt-1`} />
                    </label>
                    <label className="block">
                      <span className="text-[13px] font-semibold text-fg-2">Password</span>
                      <span className="relative block mt-1">
                        <input
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`${field} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full text-fg-3 hover:text-fg"
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </span>
                    </label>
                    {error && <p className="text-sm font-medium text-[#e5484d]">{error}</p>}
                    <button type="submit" disabled={busy} className={`${btn.primary} w-full !mt-5`}>
                      <LogIn size={18} /> {busy ? "Memeriksa…" : "Masuk"}
                    </button>
                  </form>
                </>
              )}

              {step.kind === "loading" && <p className="mt-6 text-sm text-fg-2">Menyiapkan verifikasi 2 langkah…</p>}

              {step.kind === "verify" && (
                <>
                  <h1 className="mt-5 text-[1.6rem] leading-tight font-extrabold tracking-tight text-fg">Verifikasi 2 langkah</h1>
                  <p className="mt-1 text-sm text-fg-2">Masukkan kode 6 digit dari aplikasi authenticator di HP-mu.</p>
                  <form onSubmit={submitCode} className="mt-6 space-y-3">
                    <CodeInput value={code} onChange={setCode} />
                    {error && <p className="text-sm font-medium text-[#e5484d]">{error}</p>}
                    <button type="submit" disabled={busy || code.length !== 6} className={`${btn.primary} w-full !mt-5`}>
                      <KeyRound size={18} /> {busy ? "Memeriksa…" : "Verifikasi"}
                    </button>
                  </form>
                  <button onClick={signOut} className="mt-3 w-full text-sm font-semibold text-fg-3 hover:text-fg">
                    Batal & keluar
                  </button>
                </>
              )}

              {step.kind === "enroll" && (
                <>
                  <h1 className="mt-5 text-[1.5rem] leading-tight font-extrabold tracking-tight text-fg">Aktifkan verifikasi 2 langkah</h1>
                  <p className="mt-1 text-sm text-fg-2">
                    Sekali saja: pindai QR ini dengan Google Authenticator, Microsoft Authenticator, atau 1Password. Setelah itu setiap login butuh kode dari HP-mu.
                  </p>
                  <div className="mt-5 flex items-center gap-4">
                    {/* QR dari Supabase berupa data URI SVG */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={step.qr} alt="QR code verifikasi 2 langkah" className="w-36 h-36 shrink-0 rounded-2xl bg-white p-2" />
                    <div className="min-w-0 text-xs text-fg-2">
                      <p className="flex items-center gap-1.5 font-semibold text-fg">
                        <Smartphone size={14} /> Tidak bisa scan?
                      </p>
                      <p className="mt-1">Masukkan kode ini manual:</p>
                      <button onClick={copySecret} type="button" className="mt-1.5 inline-flex items-center gap-1.5 max-w-full px-2 py-1 rounded-lg bg-surface-2 font-mono text-[11px] text-fg break-all text-left">
                        {copied ? <Check size={12} className="shrink-0 text-success" /> : <Copy size={12} className="shrink-0" />}
                        {step.secret}
                      </button>
                    </div>
                  </div>
                  <form onSubmit={submitCode} className="mt-5 space-y-3">
                    <span className="block text-[13px] font-semibold text-fg-2">Kode dari aplikasi</span>
                    <CodeInput value={code} onChange={setCode} />
                    {error && <p className="text-sm font-medium text-[#e5484d]">{error}</p>}
                    <button type="submit" disabled={busy || code.length !== 6} className={`${btn.primary} w-full !mt-5`}>
                      <ShieldCheck size={18} /> {busy ? "Memeriksa…" : "Aktifkan & masuk"}
                    </button>
                  </form>
                  <button onClick={signOut} className="mt-3 w-full text-sm font-semibold text-fg-3 hover:text-fg">
                    Batal & keluar
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </main>
  );
}
