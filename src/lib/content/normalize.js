// Mengubah baris database (atau data cadangan) menjadi bentuk yang dipakai komponen tampilan.
// Semua hasilnya objek biasa (bisa dikirim dari Server Component ke Client Component).

import { mediaUrl } from "../supabase/config";
import { safeEmbedUrl, safeHttpUrl } from "../embeds.mjs";

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

export function achievementView(row) {
  const image = mediaUrl(row.image_path);
  return {
    id: row.id ?? row.image_path,
    title: bilingual(row.title),
    provider: row.provider,
    date: row.date,
    category: row.category,
    image,
    thumb: mediaUrl(row.thumb_path) ?? image,
    file: mediaUrl(row.pdf_path),
    // Lapisan pengaman kedua: link non-http(s) (mis. javascript:) tidak pernah sampai ke halaman
    link: safeHttpUrl(row.link_url),
  };
}

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
