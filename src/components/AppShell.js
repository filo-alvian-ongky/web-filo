"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { UIProvider } from "./providers/UIProvider";
import Navbar from "./Navbar";
import TabBar from "./TabBar";
import Footer from "./Footer";
import ContactSheet from "./ContactSheet";
import IntroModal from "./element/IntroModal";
import FiloAssistant from "./FiloAssistant";
import ParticleNetwork from "./ParticleNetwork";
import SmoothScroll from "./providers/SmoothScroll";

// Judul tab browser ikut bahasa yang dipilih (metadata server tetap versi Indonesia)
const TITLES = {
  "/": { id: "Portfolio Filo Alvian Ongky - Mahasiswa Ilmu Komputer & Pengembang", en: "Filo Alvian Ongky Portfolio - Computer Science Student & Developer" },
  "/experience": { id: "Pengalaman Profesional | Filo Alvian Ongky", en: "Professional Experience | Filo Alvian Ongky" },
  "/achievements": { id: "Pencapaian & Penghargaan | Filo Alvian Ongky", en: "Achievements & Awards | Filo Alvian Ongky" },
  "/projects": { id: "Karya & Proyek | Filo Alvian Ongky", en: "Work & Projects | Filo Alvian Ongky" },
};

function DocumentTitle() {
  const pathname = usePathname();
  const { lang } = useLang();
  useEffect(() => {
    const title = TITLES[pathname]?.[lang];
    if (!title) return;
    const sync = () => {
      if (document.title !== title) document.title = title;
    };
    sync();
    // Metadata Next.js bisa dipasang/diperbarui setelah hidrasi — pastikan judul tetap sesuai bahasa
    const mo = new MutationObserver(sync);
    mo.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, [pathname, lang]);
  return null;
}

export default function AppShell({ children }) {
  const pathname = usePathname();

  // Panel admin (CMS): latar yang sama dengan website, tapi tanpa navbar, tab bar & footer publik
  if (pathname.startsWith("/admin")) {
    return (
      <UIProvider>
        <MotionConfig reducedMotion="user">
          <ParticleNetwork />
          {children}
        </MotionConfig>
      </UIProvider>
    );
  }

  return (
    <UIProvider>
      {/* Hormati pengaturan "kurangi gerakan" di perangkat pengguna */}
      <MotionConfig reducedMotion="user">
        <DocumentTitle />
        <SmoothScroll />
        <ParticleNetwork />
        <Navbar />
        <main id="konten" className="min-h-svh">
          {children}
        </main>
        <Footer />
        <TabBar />
        <ContactSheet />
        <IntroModal />
        <FiloAssistant />
      </MotionConfig>
    </UIProvider>
  );
}
