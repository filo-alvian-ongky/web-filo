// Situs yang boleh di-embed di halaman Proyek (viewer presentasi).
// Dipakai bersama oleh Content-Security-Policy (next.config.mjs) dan validasi form CMS,
// jadi link embed dari domain lain ditolak saat disimpan & diblokir browser.
export const EMBED_ORIGINS = [
  "https://www.canva.com",
  "https://canva.com",
  "https://www.figma.com",
  "https://embed.figma.com",
  "https://docs.google.com",
  "https://www.youtube.com",
  "https://www.youtube-nocookie.com",
  "https://player.vimeo.com",
];

/** URL http(s) yang valid, atau null (menolak javascript:, data:, dll.) */
export function safeHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** URL embed yang diizinkan (https + domain di EMBED_ORIGINS), atau null */
export function safeEmbedUrl(value) {
  const url = safeHttpUrl(value);
  if (!url) return null;
  const { protocol, origin } = new URL(url);
  return protocol === "https:" && EMBED_ORIGINS.includes(origin) ? url : null;
}
