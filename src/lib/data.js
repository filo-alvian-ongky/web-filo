// Seluruh konten website dikumpulkan di sini supaya mudah diperbarui
// tanpa harus menyentuh komponen tampilan.
// Teks dwibahasa ditulis sebagai { id: "...", en: "..." } dan dibaca lewat `L()` dari useLang().

import { House, BriefcaseBusiness, Trophy, LayoutGrid, PanelsTopLeft, Cpu, Gamepad2 } from "lucide-react";
import { FaHtml5, FaCss3, FaJsSquare, FaReact, FaNode, FaGitAlt, FaPython, FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { RiNextjsFill } from "react-icons/ri";
import { SiCplusplus, SiScratch, SiFigma } from "react-icons/si";
import { HiSparkles } from "react-icons/hi";

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

export const techStack = [
  { name: "HTML5", icon: FaHtml5, color: "#E34F26" },
  { name: "CSS3", icon: FaCss3, color: "#1572B6" },
  { name: "JavaScript", icon: FaJsSquare, color: "#E8C400" },
  { name: "React", icon: FaReact, color: "#149ECA" },
  { name: "Next.js", icon: RiNextjsFill, color: "currentColor" },
  { name: "Node.js", icon: FaNode, color: "#5FA04E" },
  { name: "Git", icon: FaGitAlt, color: "#F05032" },
];

export const highlights = [
  { value: { id: "Perak", en: "Silver" }, label: { id: "Medali AISEEF 2026", en: "AISEEF 2026 Medal" }, tone: "#F59E0B" },
  { value: { id: "Finalis", en: "Finalist" }, label: "UI/UX FasilkomFest", tone: "#0A6CF5" },
  { value: { id: "Publikasi", en: "Published" }, label: "Procedia Computer Science", tone: "#8B5CF6" },
  { value: "7", label: { id: "Sertifikat & penghargaan", en: "Certificates & awards" }, tone: "#12A150" },
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

export const experiences = [
  {
    period: { id: "Februari 2026 — Februari 2027", en: "February 2026 — February 2027" },
    role: "Coding Instructor",
    company: "KodeKiddo",
    tone: "#0A6CF5",
    points: [
      {
        id: "Membimbing siswa memahami logika pemrograman dan algoritma melalui kurikulum berbasis proyek.",
        en: "Guided students in understanding programming logic and algorithms through a project-based curriculum.",
      },
      {
        id: "Menyusun laporan evaluasi perkembangan siswa secara terstruktur.",
        en: "Prepared structured reports evaluating each student's progress.",
      },
    ],
    stack: [
      { name: "HTML", icon: FaHtml5, color: "#E34F26" },
      { name: "CSS", icon: FaCss3, color: "#1572B6" },
      { name: "JavaScript", icon: FaJsSquare, color: "#E8C400" },
      { name: "C++", icon: SiCplusplus, color: "#00599C" },
      { name: "Python", icon: FaPython, color: "#3776AB" },
      { name: "Scratch", icon: SiScratch, color: "#F7A814" },
    ],
  },
  {
    period: "2025 — 2026",
    role: "Team Leader & UI/UX Designer",
    company: "FruitSense Project App",
    tone: "#12A150",
    points: [
      {
        id: "Merancang prototipe interaktif dan user flow menggunakan Figma.",
        en: "Designed interactive prototypes and user flows in Figma.",
      },
      {
        id: "Mengembangkan desain aplikasi marketplace buah dan deteksi kualitas buah berbasis AI.",
        en: "Developed the design of a fruit marketplace app with AI-based fruit quality detection.",
      },
      {
        id: "Mengelola seluruh anggota tim dan memastikan seluruh sistem terintegrasi.",
        en: "Managed the whole team and made sure every part of the system was integrated.",
      },
    ],
    stack: [
      { name: "Figma", icon: SiFigma, color: "#F24E1E" },
      { name: "AI Concept", icon: HiSparkles, color: "#8B5CF6" },
    ],
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

export const achievements = [
  { title: "Silver Medal", provider: "AISEEF", date: "2026-02-02", category: "competition", image: "/AISEEF_Preview.png", thumb: "/thumbs/AISEEF_Preview.webp", file: "/AISEEF2026.pdf" },
  { title: "Finalist UI/UX", provider: "FasilkomFest (UPN Jatim)", date: "2025-11-29", category: "competition", image: "/FasilkomFest_Finalist.png", thumb: "/thumbs/FasilkomFest_Finalist.webp" },
  { title: { id: "Peserta UI/UX", en: "UI/UX Participant" }, provider: "FasilkomFest (UPN Jatim)", date: "2025-11-29", category: "competition", image: "/FasilkomFest_Peserta.png", thumb: "/thumbs/FasilkomFest_Peserta.webp" },
  { title: "Certificate of Author", provider: "10th ICCSCI", date: "2025-08-01", category: "research", image: "/ICCSCI_Authors.jpg", thumb: "/thumbs/ICCSCI_Authors.webp" },
  { title: "Certificate of Oral Presentation", provider: "10th ICCSCI", date: "2025-08-01", category: "research", image: "/ICCSCI_OralPresentation.jpg", thumb: "/thumbs/ICCSCI_OralPresentation.webp" },
  { title: "Python Dev", provider: "SoloLearn", date: "2026-02-04", category: "certification", image: "/SoloLearn_PythonDev.jpg", thumb: "/thumbs/SoloLearn_PythonDev.webp" },
  { title: "Teaching Fundamentals", provider: "Code.org", date: "2026-02-04", category: "certification", image: "/code.org_Teaching.jpg", thumb: "/thumbs/code.org_Teaching.webp" },
];

export const projects = [
  {
    id: "fruitsense",
    title: "FruitSense App",
    summary: {
      id: "Marketplace buah dengan deteksi kualitas buah berbasis AI.",
      en: "A fruit marketplace with AI-based fruit quality detection.",
    },
    tags: ["AI & Mobile", "Machine Learning"],
    embedUrl: "https://www.canva.com/design/DAHJjRnShp0/NP4NuZwDhYS4VWi6dQZoYQ/view?embed",
    gradient: "linear-gradient(135deg, #34D399 0%, #059669 100%)",
    icon: "apple",
  },
  {
    id: "fortunas",
    title: "Fortunas AI",
    summary: {
      id: "Solusi berbasis AI untuk business intelligence dan produktivitas.",
      en: "An AI-based solution for business intelligence and productivity.",
    },
    tags: ["Business Intelligence", "Productivity"],
    embedUrl: "https://www.canva.com/design/DAHJjUdm9xQ/9zYv0ehSrRekGfcrBe9ktw/view?embed",
    gradient: "linear-gradient(135deg, #60A5FA 0%, #4F46E5 100%)",
    icon: "chart",
  },
];
