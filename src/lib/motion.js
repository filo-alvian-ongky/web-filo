// Token animasi terpusat.
// Nilai dasar diambil dari animasi bawaan website (fade-up 20px / 0.6s, stagger 0.15,
// spring 400/25 untuk hover & tap), lalu dilengkapi spring ala iOS untuk sheet & tab.

export const EASE_IOS = [0.22, 1, 0.36, 1];

export const spring = {
  // Bawaan: hover/tap kartu & tombol
  press: { type: "spring", stiffness: 400, damping: 25 },
  // Bawaan: panel AI assistant
  panel: { type: "spring", stiffness: 200, damping: 25 },
  // Bawaan: animasi "genie" panduan
  genie: { type: "spring", stiffness: 180, damping: 25, mass: 0.8 },
  // Baru: bottom sheet iOS — cepat tapi tanpa memantul berlebihan
  sheet: { type: "spring", stiffness: 340, damping: 34, mass: 0.9 },
  // Baru: indikator tab / segmented control yang bergeser
  snappy: { type: "spring", stiffness: 520, damping: 40 },
  // Baru: "pop" ala Jitter — sedikit melewati target lalu kembali (overshoot ±7%)
  pop: { type: "spring", stiffness: 170, damping: 16, mass: 0.9 },
};

export const stagger = (staggerChildren = 0.15, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren, delayChildren } },
});

// Teks: fade-up bawaan + blur halus yang menajam saat muncul
export const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE_IOS } },
};

// Kartu: muncul dari bawah sambil membesar, blur → tajam, dengan pantulan spring
export const revealHidden = { opacity: 0, y: 56, scale: 0.9, filter: "blur(8px)" };
export const revealShown = (delay = 0) => ({
  opacity: 1,
  y: 0,
  scale: 1,
  filter: "blur(0px)",
  transition: {
    default: { ...spring.pop, delay },
    opacity: { duration: 0.45, ease: "easeOut", delay },
    filter: { duration: 0.55, ease: "easeOut", delay },
  },
});

// Isi kartu: chip yang "meletup" dan baris daftar yang bergeser masuk berurutan
export const popIn = {
  hidden: { opacity: 0, scale: 0.6, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { ...spring.pop, opacity: { duration: 0.3 } } },
};
export const slideIn = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_IOS } },
};

// Margin hanya vertikal (bawah): elemen sempit di tepi kiri/kanan layar tetap terpicu
export const viewportOnce = { once: true, margin: "0px 0px -60px 0px" };
