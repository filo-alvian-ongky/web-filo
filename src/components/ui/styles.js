// Kelas tombol One UI: bentuk pil, label tebal, umpan balik tekan ala iOS.
const base =
  "pressable inline-flex items-center justify-center gap-2 rounded-full font-semibold select-none disabled:opacity-50 disabled:pointer-events-none";

export const btn = {
  primary: `${base} h-12 px-6 text-[15px] bg-accent text-white shadow-[0_10px_24px_-10px_rgba(10,108,245,0.7)] hover:brightness-110`,
  secondary: `${base} h-12 px-6 text-[15px] bg-surface text-fg ring-1 ring-separator hover:bg-surface-2`,
  tonal: `${base} h-12 px-6 text-[15px] bg-accent-soft text-accent-fg hover:brightness-105`,
  small: `${base} h-9 px-4 text-sm bg-accent-soft text-accent-fg`,
};

export const iconBtn =
  "pressable inline-flex items-center justify-center w-10 h-10 rounded-full text-fg-2 hover:text-fg hover:bg-surface-2";

// Tautan "melebar" di judul kartu: ::after menutupi seluruh kartu (kartu wajib `relative`), jadi kartu bisa
// diketuk di mana saja tanpa membungkus tombol lain di dalamnya. Tombol aksi cepat di kartu memakai z-10.
export const stretchedLink =
  "after:absolute after:inset-0 after:rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:after:outline-solid focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent-fg";

export const chip =
  "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold bg-surface-2 text-fg-2";
