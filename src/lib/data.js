// Konten tetap website (profil, navigasi, sorotan, bidang fokus).
// Pengalaman, pencapaian, proyek & tech stack dikelola lewat CMS (/admin) —
// lihat src/lib/content (konten awalnya ada di src/lib/content/seed.js).
// Teks dwibahasa ditulis sebagai { id: "...", en: "..." } dan dibaca lewat `L()` dari useLang().

import { House, BriefcaseBusiness, Trophy, LayoutGrid, PanelsTopLeft, Cpu, Gamepad2 } from "lucide-react";
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
  cv: { id: "/cv.pdf", en: "/cv-en.pdf" },
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

export const focusAreas = [
  {
    title: { id: "UI/UX & Pemrograman Web", en: "UI/UX & Web Development" },
    body: {
      id: "Perancang UI/UX & Fullstack Web Developer menggunakan Next.js & Figma.",
      en: "UI/UX designer & fullstack web developer working with Next.js & Figma.",
    },
    icon: PanelsTopLeft,
    tone: "#0A6CF5",
  },
  {
    title: { id: "Riset IoT", en: "IoT Research" },
    body: {
      id: "Penulis publikasi ilmiah mengenai pemantauan stres berbasis sensor biometrik di Procedia CS.",
      en: "Author of a scientific publication on biometric sensor-based stress monitoring in Procedia CS.",
    },
    icon: Cpu,
    tone: "#12A150",
  },
  {
    title: { id: "Level Design & Kreatif", en: "Level Design & Creative" },
    body: {
      id: "Berpengalaman sebagai Commissioned Level Designer dalam merancang tata letak dan pengalaman spasial interaktif.",
      en: "Experienced as a Commissioned Level Designer, crafting layouts and interactive spatial experiences.",
    },
    icon: Gamepad2,
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
