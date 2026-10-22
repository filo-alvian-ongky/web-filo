// Format waktu bersama panel admin (modul biasa, bisa dipakai Server & Client Component)

const rtf = new Intl.RelativeTimeFormat("id", { numeric: "auto" });

/** "5 menit yang lalu", "kemarin", … (waktu relatif dalam bahasa Indonesia) */
export function timeAgo(iso) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  return "baru saja";
}

/** Tanggal & jam lengkap di zona waktu Indonesia (WIB), mis. "23 Okt 2026, 14.05" (locale "en-US" untuk balasan berbahasa Inggris) */
export const fullDate = (iso, locale = "id-ID") =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(iso));
