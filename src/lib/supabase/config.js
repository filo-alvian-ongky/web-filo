// Konfigurasi Supabase dari environment variable (lihat .env.example).
// Publishable key (sb_publishable_...) aman dipakai di browser: akses dibatasi oleh Row Level Security.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const MEDIA_BUCKET = "media";

/**
 * Path file → URL yang bisa ditampilkan.
 * - "/..." atau "http..." dipakai apa adanya (file lokal di /public atau link luar)
 * - selain itu dianggap path di bucket "media" Supabase Storage
 */
export function mediaUrl(path) {
  if (!path || typeof path !== "string") return null;
  // "/file" lokal (bukan "//domain-lain") atau link https
  if ((path.startsWith("/") && !path.startsWith("//")) || /^https:\/\//.test(path)) return path;
  if (/^[a-z]+:/i.test(path) || path.startsWith("//")) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

/**
 * Path thumbnail pasangan gambar yang di-upload CMS ("…-full.webp" → "…-thumb.webp").
 * Dipakai galeri proyek yang hanya menyimpan path gambar penuh. Path lain → null.
 */
export function thumbPathOf(path) {
  const FULL = /-full(\.[a-z0-9]+)$/i;
  return typeof path === "string" && FULL.test(path) ? path.replace(FULL, "-thumb$1") : null;
}
