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

    contactMe: "Hubungi Saya",
    downloadCV: "Unduh CV",
    dragHint: "Tarik & ayunkan kartu ID di samping — ketuk untuk melihat foto.",
    techTitle: "Teknologi yang Digunakan",
    techSub: "Alat utama untuk merancang dan membangun produk web.",
    latestAchievements: "Pencapaian Terbaru",
    seeAll: "Lihat semua",
    techCount: "teknologi utama",
    allAchievements: "Lihat semua pencapaian",
    achievementsCount: "sertifikat & penghargaan",
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
    verifyLink: "Verifikasi",
    fullSize: "Ukuran penuh",

    projEyebrow: "Portofolio",
    projTitle: "Proyek",
    projDesc: "Karya pilihan yang saya rancang dan kembangkan. Ketuk kartu untuk membaca cerita lengkapnya.",
    viewPresentation: "Lihat presentasi",
    openProject: "Buka proyek",
    openPresentation: "Buka presentasi",
    closePresentation: "Tutup presentasi",
    presentation: "Presentasi",

    // Halaman detail proyek & pencapaian
    backTo: "Kembali ke",
    viewDetails: "Lihat detail",
    quickView: "Lihat cepat",
    role: "Peran",
    period: "Periode",
    caseStudy: "Cerita Proyek",
    techStack: "Teknologi",
    categories: "Kategori",
    gallery: "Galeri",
    galleryImage: "Gambar",
    prevImage: "Gambar sebelumnya",
    nextImage: "Gambar berikutnya",
    prevProject: "Sebelumnya",
    nextProject: "Berikutnya",
    aboutAchievement: "Tentang Pencapaian Ini",
    organizer: "Penyelenggara",
    dateLabel: "Tanggal",
    category: "Kategori",

    letsWork: "Mari bekerja sama",
    projectInMind: "Punya proyek di pikiran?",
    footerText: "Saya selalu terbuka untuk membahas proyek baru dan peluang. Ayo ciptakan sesuatu yang luar biasa bersama!",
    phone: "Telepon",
    rights: "Hak cipta dilindungi.",

    contactSub: "Kirim pesan langsung di sini, atau pilih kanal yang paling nyaman.",
    contactSubLinks: "Pilih kanal yang paling nyaman untuk Anda.",
    contactDirect: "Hubungi langsung",
    contactFormTitle: "Kirim pesan",
    contactName: "Nama",
    contactNamePh: "Nama Anda",
    contactEmailPh: "nama@email.com",
    contactSubject: "Subjek (opsional)",
    contactSubjectPh: "Mis. tawaran proyek, kolaborasi",
    contactMessage: "Pesan",
    contactMessagePh: "Ceritakan apa yang bisa saya bantu…",
    contactSend: "Kirim pesan",
    contactSending: "Mengirim…",
    contactVerifying: "Memverifikasi…",
    contactNote: "Dilindungi Cloudflare Turnstile. Nama & email Anda hanya dipakai untuk membalas pesan ini.",
    contactSentTitle: "Pesan terkirim!",
    contactSentBody: "Terima kasih, {name}. Saya akan membalas ke {email} secepatnya.",
    contactAnother: "Kirim pesan lain",
    contactCaptchaFailed: "Verifikasi Cloudflare gagal di browser ini. Ulangi verifikasi, atau hubungi lewat email / WhatsApp.",
    contactRetry: "Ulangi verifikasi",
    contactErrors: {
      invalid: "Periksa kembali isian form, lalu coba lagi.",
      rate_limited: "Terlalu banyak pesan dalam waktu singkat. Coba lagi nanti.",
      captcha: "Verifikasi anti-spam gagal. Silakan coba kirim lagi.",
      unavailable: "Pesan belum bisa dikirim. Coba lagi nanti, atau hubungi lewat email / WhatsApp.",
    },

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

    nfEyebrow: "Galat 404",
    nfTitle: "Halaman tidak ditemukan",
    nfDesc: "Halaman yang Anda cari mungkin sudah dipindahkan, dihapus, atau alamatnya salah ketik.",
    nfHome: "Kembali ke Beranda",
    nfProjects: "Lihat Proyek",
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

    contactMe: "Contact Me",
    downloadCV: "Download CV",
    dragHint: "Drag & swing the ID card — tap it to view the photo.",
    techTitle: "Tech Stack",
    techSub: "Core tools I use to design and build web products.",
    latestAchievements: "Latest Achievements",
    seeAll: "See all",
    techCount: "core technologies",
    allAchievements: "See all achievements",
    achievementsCount: "certificates & awards",
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
    verifyLink: "Verify",
    fullSize: "Full size",

    projEyebrow: "Portfolio",
    projTitle: "Projects",
    projDesc: "Selected work I have designed and built. Tap a card to read the full story.",
    viewPresentation: "View presentation",
    openProject: "Open project",
    openPresentation: "Open presentation",
    closePresentation: "Close presentation",
    presentation: "Presentation",

    backTo: "Back to",
    viewDetails: "View details",
    quickView: "Quick view",
    role: "Role",
    period: "Period",
    caseStudy: "Case Study",
    techStack: "Tech Stack",
    categories: "Categories",
    gallery: "Gallery",
    galleryImage: "Image",
    prevImage: "Previous image",
    nextImage: "Next image",
    prevProject: "Previous",
    nextProject: "Next",
    aboutAchievement: "About This Achievement",
    organizer: "Organizer",
    dateLabel: "Date",
    category: "Category",

    letsWork: "Let's work together",
    projectInMind: "Have a project in mind?",
    footerText: "I'm always open to discussing new projects and opportunities. Let's create something amazing together!",
    phone: "Phone",
    rights: "All rights reserved.",

    contactSub: "Send a message right here, or pick whichever channel suits you best.",
    contactSubLinks: "Pick whichever channel suits you best.",
    contactDirect: "Reach me directly",
    contactFormTitle: "Send a message",
    contactName: "Name",
    contactNamePh: "Your name",
    contactEmailPh: "name@email.com",
    contactSubject: "Subject (optional)",
    contactSubjectPh: "E.g. project offer, collaboration",
    contactMessage: "Message",
    contactMessagePh: "Tell me how I can help…",
    contactSend: "Send message",
    contactSending: "Sending…",
    contactVerifying: "Verifying…",
    contactNote: "Protected by Cloudflare Turnstile. Your name & email are only used to reply to this message.",
    contactSentTitle: "Message sent!",
    contactSentBody: "Thank you, {name}. I'll reply to {email} as soon as I can.",
    contactAnother: "Send another message",
    contactCaptchaFailed: "Cloudflare verification failed in this browser. Try again, or reach me via email / WhatsApp.",
    contactRetry: "Try again",
    contactErrors: {
      invalid: "Please check the form and try again.",
      rate_limited: "Too many messages in a short time. Please try again later.",
      captcha: "Spam check failed. Please try sending again.",
      unavailable: "Your message couldn't be sent yet. Please try again later, or reach me via email / WhatsApp.",
    },

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

    nfEyebrow: "Error 404",
    nfTitle: "Page not found",
    nfDesc: "The page you're looking for may have been moved, removed, or the address was mistyped.",
    nfHome: "Back to Home",
    nfProjects: "View Projects",
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
