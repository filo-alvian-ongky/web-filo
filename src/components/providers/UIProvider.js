"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTheme } from "@/lib/theme";
import { safeStorage } from "@/lib/hooks";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const { theme, toggleTheme } = useTheme();
  const [contactOpen, setContactOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  // Judul kecil yang muncul di navbar saat judul besar halaman sudah tergulir (pola iOS / One UI)
  const [compactTitle, setCompactTitle] = useState(null);

  // Panduan muncul sekali untuk pengunjung baru, setelah halaman sempat "bernapas"
  useEffect(() => {
    if (safeStorage("hasSeenIntro")) return;
    const id = setTimeout(() => setIntroOpen(true), 900);
    return () => clearTimeout(id);
  }, []);

  const closeIntro = useCallback(() => {
    setIntroOpen(false);
    safeStorage("hasSeenIntro", "true");
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      contactOpen,
      openContact: () => setContactOpen(true),
      closeContact: () => setContactOpen(false),
      aiOpen,
      openAI: () => setAiOpen(true),
      closeAI: () => setAiOpen(false),
      introOpen,
      openIntro: () => setIntroOpen(true),
      closeIntro,
      compactTitle,
      setCompactTitle,
    }),
    [theme, toggleTheme, contactOpen, aiOpen, introOpen, closeIntro, compactTitle]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI harus dipakai di dalam <UIProvider>");
  return ctx;
}
