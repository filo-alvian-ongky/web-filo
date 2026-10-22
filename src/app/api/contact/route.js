import { NextResponse, after } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicSupabase } from "@/lib/supabase/server";
import { clientIp, isSameOrigin, rateLimit } from "@/lib/security/requestGuard";
import { SITE_URL } from "@/lib/seo";

// Form kontak: simpan pesan ke inbox /admin (Supabase) lalu kirim notifikasi ke email Filo (Resend).
// Pengunjung hanya menerima kode error umum (teksnya diterjemahkan di browser), detail hanya di log server.

const MAX_BODY = 10_000; // karakter (pesan 3000 + token Turnstile ± 2000 + field lain)
const LIMITS = { name: 100, email: 200, subject: 150, message: 3000 };
const PER_10_MIN = { limit: 3, windowMs: 600_000 };
const PER_DAY = { limit: 10, windowMs: 86_400_000 };

const TO_EMAIL = "filoalvianongky@gmail.com";
const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
// Secret key uji resmi Cloudflare (selalu lolos / gagal) — hanya untuk dev lokal, ditolak di Vercel production
const TEST_SECRET = /^[123]x0{31}AA$/;

const fail = (error, status, headers) => NextResponse.json({ ok: false, error }, { status, headers });

// Karakter kontrol dibuang (kecuali baris baru & tab di isi pesan)
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028-\u202E\u2060-\u2064\uFEFF]/g;
const line = (v) => (typeof v === "string" ? v.replace(CONTROL, "").replace(/\s+/g, " ").trim() : "");
const paragraph = (v) =>
  typeof v === "string"
    ? v
        .replace(/\r\n?/g, "\n")
        .replace(CONTROL, "")
        .replace(/\n{4,}/g, "\n\n\n")
        .trim()
    : "";
// Domain hanya huruf/angka/tanda hubung (IDN memakai bentuk punycode) → tidak bisa menyelipkan "?…" ke link mailto:
const EMAIL = /^[^\s@<>()[\]\\,;:"?&=%/]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

/** Bentuk & batas input. null = tidak valid (browser sudah memvalidasi lebih dulu, jadi ini jarang terjadi). */
function parseInput(body) {
  const input = {
    name: line(body?.name),
    email: line(body?.email),
    subject: line(body?.subject),
    message: paragraph(body?.message),
    lang: body?.lang === "en" ? "en" : "id",
  };
  if (!input.name || !input.message || !EMAIL.test(input.email)) return null;
  for (const [key, max] of Object.entries(LIMITS)) if (input[key].length > max) return null;
  return input;
}

/** Verifikasi token Cloudflare Turnstile ke server Cloudflare */
async function verifyTurnstile(token, ip, host) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("[contact] TURNSTILE_SECRET_KEY belum diisi");
    return { ok: false, unavailable: true };
  }
  const isTest = TEST_SECRET.test(secret);
  if (isTest && process.env.VERCEL_ENV === "production") {
    console.error("[contact] TURNSTILE_SECRET_KEY di production masih memakai key uji Cloudflare");
    return { ok: false, unavailable: true };
  }
  if (typeof token !== "string" || !token || token.length > 2048) return { ok: false };

  const form = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") form.set("remoteip", ip);
  try {
    const res = await fetch(SITEVERIFY, { method: "POST", body: form, signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    if (!data.success) return { ok: false };
    // Token harus dibuat widget form kontak di domain ini (key uji selalu mengembalikan nilai contoh)
    if (!isTest && (data.action !== "contact" || data.hostname !== host.replace(/:\d+$/, ""))) {
      console.error("[contact] Token Turnstile dari action/hostname lain:", data.action, data.hostname);
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.error("[contact] Turnstile tidak bisa dihubungi:", error);
    return { ok: false, unavailable: true };
  }
}

/** Simpan ke tabel contact_messages lewat fungsi database (anon tidak punya hak INSERT langsung) */
async function saveMessage(input) {
  const secret = process.env.CONTACT_FORM_SECRET;
  if (!isSupabaseConfigured || !secret) {
    console.error("[contact] Supabase / CONTACT_FORM_SECRET belum disetel — pesan tidak tersimpan di inbox");
    return { ok: false };
  }
  const { data, error } = await createPublicSupabase().rpc("submit_contact_message", {
    p_token: secret,
    p_name: input.name,
    p_email: input.email,
    p_subject: input.subject || null,
    p_message: input.message,
    p_lang: input.lang,
  });
  if (error) {
    if (error.message === "rate_limited") return { ok: false, rateLimited: true };
    console.error("[contact] Gagal menyimpan pesan:", error.code, error.message);
    return { ok: false };
  }
  return { ok: true, id: data };
}

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Email notifikasi ke Filo via REST API Resend. Balas email = langsung ke pengunjung (reply_to). */
async function sendEmail(input, id) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[contact] RESEND_API_KEY belum diisi — email notifikasi tidak dikirim");
    return false;
  }
  const subject = `[FiloAlvian.com] ${input.subject || "Pesan baru"} — ${input.name}`.slice(0, 200);
  const inbox = id ? `${SITE_URL}/admin/messages?id=${id}` : `${SITE_URL}/admin/messages`;
  const language = input.lang === "en" ? "English" : "Indonesia";
  const rows = [
    ["Nama", input.name],
    ["Email", input.email],
    ["Subjek", input.subject || "—"],
    ["Bahasa", language],
  ];
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#111">
<p style="margin:0 0 16px">Pesan baru dari form kontak <b>FiloAlvian.com</b>:</p>
<table style="border-collapse:collapse;margin:0 0 16px">${rows
    .map(([k, v]) => `<tr><td style="padding:2px 16px 2px 0;color:#666;vertical-align:top">${k}</td><td style="padding:2px 0">${escapeHtml(v)}</td></tr>`)
    .join("")}</table>
<div style="padding:16px;border-radius:12px;background:#f4f5f7;white-space:pre-wrap">${escapeHtml(input.message)}</div>
<p style="margin:16px 0 0;color:#666;font-size:13px">Balas email ini untuk menjawab langsung ke pengirim. Inbox: <a href="${inbox}">${inbox}</a></p>
</div>`;
  const text = `Pesan baru dari form kontak FiloAlvian.com\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${input.message}\n\n---\nBalas email ini untuk menjawab langsung ke pengirim.\nInbox: ${inbox}\n`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        // Mencegah email ganda bila request diulang untuk pesan yang sama
        ...(id ? { "Idempotency-Key": `contact-${id}` } : {}),
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio FiloAlvian.com <onboarding@resend.dev>",
        to: [TO_EMAIL],
        reply_to: input.email,
        subject,
        html,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[contact] Resend menolak email:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (error) {
    console.error("[contact] Resend tidak bisa dihubungi:", error);
    return false;
  }
}

export async function POST(req) {
  // PENGAMAN 1: hanya dari halaman website ini sendiri
  if (!isSameOrigin(req)) return fail("forbidden", 403);

  // PENGAMAN 2: ukuran & bentuk data dibatasi
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY * 4) return fail("invalid", 413);
  const raw = await req.text();
  if (raw.length > MAX_BODY) return fail("invalid", 413);
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail("invalid", 400);
  }

  // PENGAMAN 3: honeypot — kolom tersembunyi yang hanya diisi bot. Dibalas "berhasil" agar bot tidak mencoba cara lain.
  if (typeof body?.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });

  const input = parseInput(body);
  if (!input) return fail("invalid", 400);

  // PENGAMAN 4: batasi jumlah pesan per pengunjung
  const ip = clientIp(req);
  for (const [name, rule] of [["10m", PER_10_MIN], ["day", PER_DAY]]) {
    const result = rateLimit(`contact:${name}:${ip}`, rule);
    if (!result.ok) return fail("rate_limited", 429, { "Retry-After": String(result.retryAfter) });
  }

  // PENGAMAN 5: Cloudflare Turnstile (bukti pengirim bukan bot)
  const captcha = await verifyTurnstile(body.turnstileToken, ip, req.headers.get("host") ?? "");
  if (!captcha.ok) return captcha.unavailable ? fail("unavailable", 503) : fail("captcha", 400);

  const saved = await saveMessage(input);
  if (saved.rateLimited) return fail("rate_limited", 429);

  if (saved.ok) {
    // Pesan sudah aman di inbox → email dikirim setelah respons terkirim; gagal kirim email tidak memengaruhi pengunjung
    after(() => sendEmail(input, saved.id));
    return NextResponse.json({ ok: true });
  }

  // Inbox sedang bermasalah → email jadi satu-satunya salinan; pengunjung hanya diberi tahu berhasil bila email terkirim
  if (await sendEmail(input, null)) return NextResponse.json({ ok: true });
  return fail("unavailable", 503);
}
