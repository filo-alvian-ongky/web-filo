// Mengubah baris database (atau data cadangan) menjadi bentuk yang dipakai komponen tampilan.
// Semua hasilnya objek biasa (bisa dikirim dari Server Component ke Client Component).

import { mediaUrl, thumbPathOf } from "../supabase/config";
import { safeEmbedUrl, safeHttpUrl } from "../embeds.mjs";
import { cvProfile, focusAreas, focusIntro, hero, highlights } from "../data";

/** Teks dwibahasa → { id, en }. EN kosong otomatis memakai teks ID. */
export function bilingual(value) {
  if (value && typeof value === "object") {
    const id = value.id ?? "";
    return { id, en: value.en || id };
  }
  const text = value ?? "";
  return { id: text, en: text };
}

const byOrder = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

export const techView = (t) => ({
  id: t.id ?? t.name,
  name: t.name,
  color: t.color || null,
  icon: t.icon_path || null,
});

// Relasi dari Supabase berbentuk [{ sort_order, technologies: {...} }]
const stackFromJoin = (rows = []) =>
  [...rows]
    .sort(byOrder)
    .map((r) => r.technologies)
    .filter(Boolean)
    .map(techView);

export function experienceView(row, stack) {
  return {
    id: row.id ?? row.role,
    role: row.role,
    company: row.company,
    period: bilingual(row.period),
    points: (row.points ?? []).map(bilingual),
    tone: row.tone || "#0A6CF5",
    stack: stack ?? stackFromJoin(row.experience_technologies),
  };
}

// Konten lokal (tanpa id database): id dari nama file gambar, aman dipakai di URL /achievements/[id]
const localId = (path) =>
  String(path ?? "")
    .replace(/^.*\/|\.\w+$/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

export function achievementView(row) {
  const image = mediaUrl(row.image_path);
  return {
    id: row.id ?? localId(row.image_path),
    title: bilingual(row.title),
    provider: row.provider,
    date: row.date,
    category: row.category,
    image,
    thumb: mediaUrl(row.thumb_path) ?? image,
    file: mediaUrl(row.pdf_path),
    // Lapisan pengaman kedua: link non-http(s) (mis. javascript:) tidak pernah sampai ke halaman
    link: safeHttpUrl(row.link_url),
    // Markdown halaman detail
    description: bilingual(row.description),
    updatedAt: row.updated_at ?? null,
  };
}

// Galeri proyek: path gambar penuh → { image, thumb } (thumbnail = pasangan "-thumb" bila ada)
const galleryView = (paths) =>
  (Array.isArray(paths) ? paths : [])
    .map((path) => {
      const image = mediaUrl(path);
      return image && { image, thumb: mediaUrl(thumbPathOf(path)) ?? image };
    })
    .filter(Boolean);

export function projectView(row, stack) {
  const cover = mediaUrl(row.cover_path);
  return {
    id: row.id ?? row.slug,
    slug: row.slug,
    title: row.title,
    summary: bilingual(row.summary),
    tags: row.tags ?? [],
    embedUrl: safeEmbedUrl(row.embed_url),
    linkUrl: safeHttpUrl(row.link_url),
    gradient: `linear-gradient(135deg, ${row.gradient_from || "#60A5FA"} 0%, ${row.gradient_to || "#4F46E5"} 100%)`,
    icon: row.icon || "sparkles",
    cover,
    coverThumb: mediaUrl(row.thumb_path) ?? cover,
    stack: stack ?? stackFromJoin(row.project_technologies),
    // Halaman detail (case study); story = markdown
    role: bilingual(row.role),
    period: bilingual(row.period),
    story: bilingual(row.story),
    gallery: galleryView(row.gallery),
    updatedAt: row.updated_at ?? null,
  };
}

/**
 * Tech stack untuk section "Teknologi" di Home: teknologi bertanda "featured".
 * Bila belum ada yang ditandai, pakai semua teknologi yang dipakai di pengalaman/proyek.
 */
export function homeTechStack(technologies, experiences, projects) {
  const featured = technologies.filter((t) => t.featured).sort(byOrder);
  if (featured.length) return featured.map(techView);
  const used = new Map();
  [...experiences, ...projects].forEach((item) => item.stack.forEach((t) => used.set(t.name, t)));
  return [...used.values()];
}

// -----------------------------------------------------------------------------
// Pengaturan website (tabel site_settings, satu baris per kunci)
// -----------------------------------------------------------------------------

/** Nilai bawaan tiap kunci = isi src/lib/data.js (dipakai bila barisnya belum ada) */
export const SETTING_DEFAULTS = { hero, highlights, focus_intro: focusIntro, focus_areas: focusAreas, cv_profile: cvProfile };

const HEX = /^#[0-9a-f]{6}$/i;
const toneOf = (value) => (HEX.test(value ?? "") ? value : "#0A6CF5");
const listOf = (value) => (Array.isArray(value) ? value.filter((v) => v && typeof v === "object") : []);
const textOf = (value) => (typeof value === "string" ? value : "");
// Link kontak CV: hanya http(s) / mailto / tel (lapisan pengaman kedua setelah validasi di server action)
const contactHref = (value) => (/^(https?:\/\/|mailto:|tel:)\S+$/i.test(textOf(value)) ? value : null);

const heroView = (v) => ({
  badge: bilingual(v.badge),
  typewriter: (Array.isArray(v.typewriter) ? v.typewriter : []).map(bilingual).filter((line) => line.id),
  intro: bilingual(v.intro),
});

const highlightView = (h) => ({
  value: bilingual(h.value),
  label: bilingual(h.label),
  tone: toneOf(h.tone),
  // "achievements" = angka diisi otomatis dari jumlah pencapaian di CMS
  countOf: h.countOf === "achievements" ? "achievements" : null,
});

const focusIntroView = (v) => ({ title: bilingual(v.title), subtitle: bilingual(v.subtitle) });

const focusAreaView = (f) => ({
  title: bilingual(f.title),
  body: bilingual(f.body),
  // Kunci ikon (lihat src/components/ui/focusIcons.js)
  icon: textOf(f.icon) || "sparkles",
  tone: toneOf(f.tone),
});

const cvProfileView = (v) => ({
  headline: bilingual(v.headline),
  summary: bilingual(v.summary),
  education: { school: textOf(v.education?.school), major: bilingual(v.education?.major) },
  publication: {
    title: textOf(v.publication?.title),
    authors: textOf(v.publication?.authors),
    venue: bilingual(v.publication?.venue),
  },
  contacts: listOf(v.contacts).map((c) => ({ label: bilingual(c.label), value: textOf(c.value), href: contactHref(c.href) })),
});

/**
 * Baris site_settings ([{ key, value }]) → pengaturan siap pakai.
 * Kunci yang belum ada / isinya rusak memakai nilai bawaan dari data.js.
 */
export function settingsView(rows = []) {
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const valueOf = (key, isValid) => (isValid(stored[key]) ? stored[key] : SETTING_DEFAULTS[key]);
  const isObject = (v) => Boolean(v) && typeof v === "object" && !Array.isArray(v);
  return {
    hero: heroView(valueOf("hero", isObject)),
    highlights: listOf(valueOf("highlights", Array.isArray)).map(highlightView),
    focusIntro: focusIntroView(valueOf("focus_intro", isObject)),
    focusAreas: listOf(valueOf("focus_areas", Array.isArray)).map(focusAreaView),
    cvProfile: cvProfileView(valueOf("cv_profile", isObject)),
  };
}
