"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { safeStorage } from "./hooks";

// Bahasa disimpan di atribut <html lang> (diatur sebelum halaman tampil oleh skrip di layout)
// dan di localStorage agar pilihan pengunjung diingat.
export const LANGS = ["id", "en"];

const listeners = new Set();

function read() {
  return document.documentElement.lang === "en" ? "en" : "id";
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function apply(lang) {
  document.documentElement.lang = lang;
  safeStorage("lang", lang);
  listeners.forEach((l) => l());
}

/** Ambil teks sesuai bahasa: nilai `{ id, en }` → string, nilai lain dikembalikan apa adanya */
export function tr(value, lang) {
  if (value && typeof value === "object" && !Array.isArray(value) && "id" in value && "en" in value) return value[lang];
  return value;
}

const dict = {
  id: {
    mainNav: "Navigasi utama",
    askAI: "Tanya AI",
    askFiloAI: "Tanya Filo AI",
    openGuide: "Buka panduan website",
    needGuide: "Butuh panduan?",
    useLight: "Gunakan tema terang",
    useDark: "Gunakan tema gelap",
    toggleTheme: "Ganti tema",
    language: "Bahasa",
    close: "Tutup",
    home: "beranda",

    openToCollab: "Terbuka untuk kolaborasi",
    typewriter: ["Halo, pengunjung!", "Salam kenal ya!"],
    contactMe: "Hubungi Saya",
    downloadCV: "Unduh CV",
    dragHint: "Tarik & ayunkan kartu ID di samping — ketuk untuk melihat foto.",
    explore: "Eksplorasi",
    techTitle: "Teknologi yang Digunakan",
    techSub: "Alat utama untuk merancang dan membangun produk web.",
    latestAchievements: "Pencapaian Terbaru",
    seeAll: "Lihat semua",
    photoOf: "Foto",
    badgeLabel: "Kartu ID 3D — tarik untuk berinteraksi",
    badgeTagline: "Mari bekerja sama.",
    flipCard: "Balik kartu",

    expEyebrow: "Perjalanan Karier",
    expTitle: "Pengalaman",
    expDesc: "Jejak pengalaman kerja dan organisasi sebagai Coding Instructor serta Team Leader & UI/UX Designer.",

    achEyebrow: "Pencapaian & Penghargaan",
    achTitle: "Pencapaian",
    achDesc: "Kumpulan sertifikasi kompetensi, medali internasional, dan pengakuan riset akademik yang divalidasi oleh institusi global.",
    filterLabel: "Filter kategori",
    detail: "Detail",
    certificate: "Sertifikat",
    pdfDoc: "Dokumen PDF",
    fullSize: "Ukuran penuh",

    projEyebrow: "Portofolio",
    projTitle: "Proyek",
    projDesc: "Karya pilihan yang saya rancang dan kembangkan. Ketuk kartu untuk membuka presentasinya.",
    viewPresentation: "Lihat presentasi",
    openPresentation: "Buka presentasi",
    closePresentation: "Tutup presentasi",
    presentation: "Presentasi",

    letsWork: "Mari bekerja sama",
    projectInMind: "Punya proyek di pikiran?",
    footerText: "Saya selalu terbuka untuk membahas proyek baru dan peluang. Ayo ciptakan sesuatu yang luar biasa bersama!",
    phone: "Telepon",
    rights: "Hak cipta dilindungi.",

    contactSub: "Pilih kanal yang paling nyaman untuk Anda.",

    welcome: "Selamat datang!",
    welcomeSub: "Agar pengalaman menjelajah lebih nyaman, berikut fitur utama website ini:",
    guideNav: "Navigasi",
    guideNavDesktop: "Gunakan menu di bagian atas untuk berpindah halaman.",
    guideNavMobile: "Gunakan tab bar di bagian bawah layar untuk berpindah halaman.",
    guideBadge: "Kartu ID 3D",
    guideBadgeBody: "Tarik dan ayunkan kartu di beranda. Ketuk untuk melihat foto.",
    guideAI: "AI Assistant",
    guideAIBody: "Tanya AI seputar karier & portofolio saya.",
    guideTheme: "Tema",
    guideThemeBody: "Ubah tampilan menjadi terang atau gelap.",
    guideLang: "Bahasa",
    guideLangBody: "Pilih Bahasa Indonesia atau English.",
    guideCta: "Paham, Mulai Jelajahi!",

    aiGreeting: "Halo! Saya AI asisten portofolio Filo. Ada yang ingin Anda ketahui tentang proyek, publikasi riset, atau pengalaman kerja Filo?",
    aiError: "Maaf, sistem AI sedang sibuk. Silakan coba beberapa saat lagi.",
    aiSuggestions: ["Apa saja prestasi Filo?", "Ceritakan proyek FruitSense", "Tech stack apa yang dikuasai Filo?"],
    aiPlaceholder: "Tanyakan riset atau proyek Filo...",
    aiActive: "Aktif",
    aiTyping: "AI sedang mengetik",
    aiInput: "Pesan untuk AI",
    aiSend: "Kirim pesan",
    aiClose: "Tutup chat",
  },
  en: {
    mainNav: "Main navigation",
    askAI: "Ask AI",
    askFiloAI: "Ask Filo AI",
    openGuide: "Open site guide",
    needGuide: "Need a guide?",
    useLight: "Use light theme",
    useDark: "Use dark theme",
    toggleTheme: "Toggle theme",
    language: "Language",
    close: "Close",
    home: "home",

    openToCollab: "Open to collaboration",
    typewriter: ["Hello, visitor!", "Nice to meet you!"],
    contactMe: "Contact Me",
    downloadCV: "Download CV",
    dragHint: "Drag & swing the ID card — tap it to view the photo.",
    explore: "Exploration",
    techTitle: "Tech Stack",
    techSub: "Core tools I use to design and build web products.",
    latestAchievements: "Latest Achievements",
    seeAll: "See all",
    photoOf: "Photo of",
    badgeLabel: "3D ID card — drag to interact",
    badgeTagline: "Let's work together.",
    flipCard: "Flip card",

    expEyebrow: "Career Journey",
    expTitle: "Experience",
    expDesc: "A record of my work and organizational experience as a Coding Instructor and as Team Leader & UI/UX Designer.",

    achEyebrow: "Achievements & Awards",
    achTitle: "Achievements",
    achDesc: "A collection of competency certifications, international medals, and academic research recognition validated by global institutions.",
    filterLabel: "Filter by category",
    detail: "Details",
    certificate: "Certificate",
    pdfDoc: "PDF document",
    fullSize: "Full size",

    projEyebrow: "Portfolio",
    projTitle: "Projects",
    projDesc: "Selected work I have designed and built. Tap a card to open its presentation.",
    viewPresentation: "View presentation",
    openPresentation: "Open presentation",
    closePresentation: "Close presentation",
    presentation: "Presentation",

    letsWork: "Let's work together",
    projectInMind: "Have a project in mind?",
    footerText: "I'm always open to discussing new projects and opportunities. Let's create something amazing together!",
    phone: "Phone",
    rights: "All rights reserved.",

    contactSub: "Pick whichever channel suits you best.",

    welcome: "Welcome!",
    welcomeSub: "To make browsing easier, here are the main features of this site:",
    guideNav: "Navigation",
    guideNavDesktop: "Use the menu at the top to switch pages.",
    guideNavMobile: "Use the tab bar at the bottom of the screen to switch pages.",
    guideBadge: "3D ID Card",
    guideBadgeBody: "Drag and swing the card on the home page. Tap it to view the photo.",
    guideAI: "AI Assistant",
    guideAIBody: "Ask the AI about my career & portfolio.",
    guideTheme: "Theme",
    guideThemeBody: "Switch between light and dark mode.",
    guideLang: "Language",
    guideLangBody: "Choose Bahasa Indonesia or English.",
    guideCta: "Got it, let's explore!",

    aiGreeting: "Hi! I'm Filo's portfolio AI assistant. Is there anything you'd like to know about Filo's projects, research publications, or work experience?",
    aiError: "Sorry, the AI system is busy right now. Please try again in a moment.",
    aiSuggestions: ["What are Filo's achievements?", "Tell me about the FruitSense project", "Which tech stack does Filo use?"],
    aiPlaceholder: "Ask about Filo's research or projects...",
    aiActive: "Online",
    aiTyping: "AI is typing",
    aiInput: "Message to the AI",
    aiSend: "Send message",
    aiClose: "Close chat",
  },
};

export function useLang() {
  const lang = useSyncExternalStore(subscribe, read, () => "id");
  const setLang = useCallback((next) => apply(next), []);
  return useMemo(
    () => ({
      lang,
      setLang,
      t: dict[lang],
      L: (value) => tr(value, lang),
      // Format tanggal ISO (YYYY-MM-DD) sesuai bahasa, mis. "02 Februari 2026" / "February 02, 2026"
      date: (iso, opts = { day: "2-digit", month: "long", year: "numeric" }) =>
        new Intl.DateTimeFormat(lang === "en" ? "en-US" : "id-ID", { ...opts, timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)),
    }),
    [lang, setLang]
  );
}
