// Konten awal portfolio (dipindahkan dari data.js).
// Dipakai untuk dua hal:
// 1. Cadangan tampilan saat Supabase belum disetel / tidak bisa dihubungi
// 2. Sumber data script migrasi (scripts/migrate-to-supabase.mjs)
// Setelah migrasi, konten diubah lewat /admin — file ini tidak perlu disunting lagi.
// Ditulis tanpa alias "@/..." agar bisa di-import langsung oleh Node.

import {
  siCplusplus,
  siCss,
  siFigma,
  siGit,
  siHtml5,
  siJavascript,
  siNextdotjs,
  siNodedotjs,
  siPython,
  siReact,
  siScratch,
} from "simple-icons";

const icon = (si) => ({ slug: si.slug, icon_path: si.path });

// Ikon "kilau" untuk konsep non-merek (mis. AI)
export const SPARKLE_PATH = "M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6L12 22.5l-2.6-7.9L1.5 12l7.9-2.6z";

export const seedTechnologies = [
  { name: "HTML5", ...icon(siHtml5), color: "#E34F26", featured: true },
  { name: "CSS3", ...icon(siCss), color: "#1572B6", featured: true },
  { name: "JavaScript", ...icon(siJavascript), color: "#E8C400", featured: true },
  { name: "React", ...icon(siReact), color: "#149ECA", featured: true },
  // color null = ikut warna teks (hitam di tema terang, putih di tema gelap)
  { name: "Next.js", ...icon(siNextdotjs), color: null, featured: true },
  { name: "Node.js", ...icon(siNodedotjs), color: "#5FA04E", featured: true },
  { name: "Git", ...icon(siGit), color: "#F05032", featured: true },
  { name: "C++", ...icon(siCplusplus), color: "#00599C", featured: false },
  { name: "Python", ...icon(siPython), color: "#3776AB", featured: false },
  { name: "Scratch", ...icon(siScratch), color: "#F7A814", featured: false },
  { name: "Figma", ...icon(siFigma), color: "#F24E1E", featured: false },
  { name: "AI Concept", slug: null, icon_path: SPARKLE_PATH, color: "#8B5CF6", featured: false },
].map((t, i) => ({ ...t, sort_order: i }));

export const seedExperiences = [
  {
    role: "Coding Instructor",
    company: "KodeKiddo",
    period: { id: "Februari 2026 — Februari 2027", en: "February 2026 — February 2027" },
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
    stack: ["HTML5", "CSS3", "JavaScript", "C++", "Python", "Scratch"],
  },
  {
    role: "Team Leader & UI/UX Designer",
    company: "FruitSense Project App",
    period: { id: "2025 — 2026", en: "2025 — 2026" },
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
    stack: ["Figma", "AI Concept"],
  },
].map((e, i) => ({ ...e, sort_order: i, published: true }));

const same = (s) => ({ id: s, en: s });

export const seedAchievements = [
  { title: same("Silver Medal"), provider: "AISEEF", date: "2026-02-02", category: "competition", image_path: "/AISEEF_Preview.png", thumb_path: "/thumbs/AISEEF_Preview.webp", pdf_path: "/AISEEF2026.pdf" },
  { title: same("Finalist UI/UX"), provider: "FasilkomFest (UPN Jatim)", date: "2025-11-29", category: "competition", image_path: "/FasilkomFest_Finalist.png", thumb_path: "/thumbs/FasilkomFest_Finalist.webp" },
  { title: { id: "Peserta UI/UX", en: "UI/UX Participant" }, provider: "FasilkomFest (UPN Jatim)", date: "2025-11-29", category: "competition", image_path: "/FasilkomFest_Peserta.png", thumb_path: "/thumbs/FasilkomFest_Peserta.webp" },
  { title: same("Certificate of Author"), provider: "10th ICCSCI", date: "2025-08-01", category: "research", image_path: "/ICCSCI_Authors.jpg", thumb_path: "/thumbs/ICCSCI_Authors.webp" },
  { title: same("Certificate of Oral Presentation"), provider: "10th ICCSCI", date: "2025-08-01", category: "research", image_path: "/ICCSCI_OralPresentation.jpg", thumb_path: "/thumbs/ICCSCI_OralPresentation.webp" },
  { title: same("Python Dev"), provider: "SoloLearn", date: "2026-02-04", category: "certification", image_path: "/SoloLearn_PythonDev.jpg", thumb_path: "/thumbs/SoloLearn_PythonDev.webp" },
  { title: same("Teaching Fundamentals"), provider: "Code.org", date: "2026-02-04", category: "certification", image_path: "/code.org_Teaching.jpg", thumb_path: "/thumbs/code.org_Teaching.webp" },
].map((a, i) => ({ pdf_path: null, link_url: null, ...a, sort_order: i, published: true }));

export const seedProjects = [
  {
    slug: "fruitsense",
    title: "FruitSense App",
    summary: {
      id: "Marketplace buah dengan deteksi kualitas buah berbasis AI.",
      en: "A fruit marketplace with AI-based fruit quality detection.",
    },
    tags: ["AI & Mobile", "Machine Learning"],
    embed_url: "https://www.canva.com/design/DAHJjRnShp0/NP4NuZwDhYS4VWi6dQZoYQ/view?embed",
    gradient_from: "#34D399",
    gradient_to: "#059669",
    icon: "apple",
    stack: [],
  },
  {
    slug: "fortunas",
    title: "Fortunas AI",
    summary: {
      id: "Solusi berbasis AI untuk business intelligence dan produktivitas.",
      en: "An AI-based solution for business intelligence and productivity.",
    },
    tags: ["Business Intelligence", "Productivity"],
    embed_url: "https://www.canva.com/design/DAHJjUdm9xQ/9zYv0ehSrRekGfcrBe9ktw/view?embed",
    gradient_from: "#60A5FA",
    gradient_to: "#4F46E5",
    icon: "chart",
    stack: [],
  },
].map((p, i) => ({ link_url: null, cover_path: null, thumb_path: null, ...p, sort_order: i, published: true }));
