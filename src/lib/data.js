// Konten tetap website (profil, navigasi, kontak).
// Pengalaman, pencapaian, proyek & tech stack dikelola lewat CMS (/admin) —
// lihat src/lib/content (konten awalnya ada di src/lib/content/seed.js).
// Hero, sorotan, bidang fokus & profil CV dikelola di /admin → Pengaturan Website (tabel site_settings);
// nilai di file ini hanya cadangan saat tabel itu kosong / tidak bisa diakses (isinya sama dengan
// nilai awal di supabase/site-content.sql).
// Teks dwibahasa ditulis sebagai { id: "...", en: "..." } dan dibaca lewat `L()` dari useLang().

import { House, BriefcaseBusiness, Trophy, LayoutGrid } from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

export const profile = {
  name: "Filo Alvian Ongky",
  firstName: "Filo",
  role: { id: "Mahasiswa Ilmu Komputer", en: "Computer Science Student" },
  campus: "BINUS University",
  domain: "FiloAlvian.com",
  email: "filoalvianongky@gmail.com",
  phone: "+62 (821) 4046-4565",
  phoneHref: "tel:+6282140464565",
  photo: "/profile.jpeg",
  // CV dibuat otomatis dari konten CMS (lihat src/app/cv/[lang]/route.js)
  cv: { id: "/cv/id", en: "/cv/en" },
};

// Hero Home. Kalimat perkenalan: **teks** = tebal, ==teks== = tebal berwarna aksen.
export const hero = {
  badge: { id: "Terbuka untuk kolaborasi", en: "Open to collaboration" },
  typewriter: [
    { id: "Halo, pengunjung!", en: "Hello, visitor!" },
    { id: "Salam kenal ya!", en: "Nice to meet you!" },
  ],
  intro: {
    id: "Saya **Filo Alvian Ongky**, Mahasiswa Ilmu Komputer berdedikasi dengan fokus pada pengembangan sistem cerdas dan UI/UX di ==BINUS University==.",
    en: "I'm **Filo Alvian Ongky**, a dedicated Computer Science student at ==BINUS University==, focused on building intelligent systems and UI/UX.",
  },
};

// Profil CV. Pengalaman, prestasi, sertifikasi, proyek & keahlian diambil otomatis
// dari CMS (yang terbaru & terbaik) — lihat src/lib/cv/select.js
export const cvProfile = {
  headline: { id: "Mahasiswa Ilmu Komputer · BINUS University", en: "Computer Science Student · BINUS University" },
  summary: {
    id: "Mahasiswa Ilmu Komputer di BINUS University yang berfokus pada pengembangan sistem cerdas, UI/UX, dan riset IoT. Terbuka untuk membahas proyek baru dan peluang kolaborasi.",
    en: "Computer Science student at BINUS University focused on intelligent systems development, UI/UX, and IoT research. Open to discussing new projects and collaboration opportunities.",
  },
  education: { school: "BINUS University (Semarang)", major: { id: "Ilmu Komputer (Computer Science)", en: "Computer Science" } },
  publication: {
    title:
      "Optimizing Productivity: Internet of Things based Workload and Stress Monitoring using Galvanic Skin Response (GSR) Sensor Analysis and Microcontroller Arduino Uno",
    authors: "F. A. Ongky, M. E. Kartiyoso, S. R. N. Gunawan, A. L. Dewi, V. J. L. Engel",
    venue: {
      id: "Procedia Computer Science · dipresentasikan (oral) di 10th ICCSCI 2025, 31 Juli – 1 Agustus 2025",
      en: "Procedia Computer Science · oral presentation at the 10th ICCSCI 2025, July 31 – August 1, 2025",
    },
  },
  contacts: [
    { label: { id: "Email", en: "Email" }, value: "filoalvianongky@gmail.com", href: "mailto:filoalvianongky@gmail.com" },
    { label: { id: "Telepon", en: "Phone" }, value: "+62 821-4046-4565", href: "tel:+6282140464565" },
    { label: { id: "Website", en: "Website" }, value: "FiloAlvian.com", href: "https://filoalvian.com" },
    { label: { id: "LinkedIn", en: "LinkedIn" }, value: "linkedin.com/in/filoalvianongky", href: "https://www.linkedin.com/in/filoalvianongky/" },
    { label: { id: "GitHub", en: "GitHub" }, value: "github.com/filo-alvian-ongky", href: "https://github.com/filo-alvian-ongky" },
  ],
};

export const navItems = [
  { name: { id: "Beranda", en: "Home" }, path: "/", icon: House },
  { name: { id: "Pengalaman", en: "Experience" }, path: "/experience", icon: BriefcaseBusiness },
  { name: { id: "Pencapaian", en: "Achievements" }, short: { id: "Pencapaian", en: "Awards" }, path: "/achievements", icon: Trophy },
  { name: { id: "Proyek", en: "Projects" }, path: "/projects", icon: LayoutGrid },
];

export const contactLinks = [
  { name: "Gmail", detail: profile.email, iconPath: "/gmail.jpg", href: `mailto:${profile.email}` },
  { name: "Instagram", detail: "@filoalvianongky", iconPath: "/ig.jpg", href: "https://instagram.com/filoalvianongky" },
  { name: "WhatsApp", detail: profile.phone, iconPath: "/wa.png", href: "https://wa.me/6282140464565" },
];

export const socialLinks = [
  { name: "GitHub", icon: FaGithub, href: "https://github.com/filo-alvian-ongky" },
  { name: "LinkedIn", icon: FaLinkedin, href: "https://www.linkedin.com/in/filoalvianongky/" },
  { name: "Instagram", icon: FaInstagram, href: "https://instagram.com/filoalvianongky" },
];

export const highlights = [
  { value: { id: "Perak", en: "Silver" }, label: { id: "Medali AISEEF 2026", en: "AISEEF 2026 Medal" }, tone: "#F59E0B" },
  { value: { id: "Finalis", en: "Finalist" }, label: "UI/UX FasilkomFest", tone: "#0A6CF5" },
  { value: { id: "Publikasi", en: "Published" }, label: "Procedia Computer Science", tone: "#8B5CF6" },
  // countOf: angka diisi otomatis dari jumlah pencapaian di CMS
  { value: "7", countOf: "achievements", label: { id: "Sertifikat & penghargaan", en: "Certificates & awards" }, tone: "#12A150" },
];

// Judul & teks pengantar section "Eksplorasi" (di atas kartu bidang fokus)
export const focusIntro = {
  title: { id: "Eksplorasi", en: "Exploration" },
  subtitle: {
    id: "Tiga bidang yang saya tekuni — dari antarmuka web, riset IoT, hingga desain level.",
    en: "Three areas I work in — from web interfaces and IoT research to level design.",
  },
};

export const focusAreas = [
  {
    title: { id: "UI/UX & Pemrograman Web", en: "UI/UX & Web Development" },
    body: {
      id: "Perancang UI/UX & Fullstack Web Developer menggunakan Next.js & Figma.",
      en: "UI/UX designer & fullstack web developer working with Next.js & Figma.",
    },
    // Kunci ikon → src/components/ui/focusIcons.js
    icon: "web",
    tone: "#0A6CF5",
  },
  {
    title: { id: "Riset IoT", en: "IoT Research" },
    body: {
      id: "Penulis publikasi ilmiah mengenai pemantauan stres berbasis sensor biometrik di Procedia CS.",
      en: "Author of a scientific publication on biometric sensor-based stress monitoring in Procedia CS.",
    },
    icon: "cpu",
    tone: "#12A150",
  },
  {
    title: { id: "Level Design & Kreatif", en: "Level Design & Creative" },
    body: {
      id: "Berpengalaman sebagai Commissioned Level Designer dalam merancang tata letak dan pengalaman spasial interaktif.",
      en: "Experienced as a Commissioned Level Designer, crafting layouts and interactive spatial experiences.",
    },
    icon: "gamepad",
    tone: "#F97316",
  },
];

export const achievementFilters = [
  { key: "all", label: { id: "Semua", en: "All" } },
  { key: "competition", label: { id: "Kompetisi", en: "Competitions" } },
  { key: "research", label: { id: "Riset", en: "Research" } },
  { key: "certification", label: { id: "Sertifikasi", en: "Certifications" } },
];

export const categoryLabel = Object.fromEntries(
  achievementFilters.map((f) => [f.key, { id: f.label.id, en: f.label.en.replace(/s$/, "") }])
);
