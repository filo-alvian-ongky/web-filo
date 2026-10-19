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
};

export const stagger = (staggerChildren = 0.15, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren, delayChildren } },
});

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_IOS } },
};

export const viewportOnce = { once: true, margin: "-60px" };
