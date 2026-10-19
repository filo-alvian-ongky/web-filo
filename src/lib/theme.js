"use client";

import { useCallback, useSyncExternalStore } from "react";
import { safeStorage } from "./hooks";

const listeners = new Set();

function read() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function apply(theme, persist) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  if (persist) safeStorage("theme", theme);
  listeners.forEach((l) => l());
}

function subscribe(cb) {
  listeners.add(cb);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = (e) => {
    if (!safeStorage("theme")) apply(e.matches ? "dark" : "light", false);
  };
  mq.addEventListener("change", onSystemChange);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", onSystemChange);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "light");
  const toggleTheme = useCallback(() => apply(read() === "dark" ? "light" : "dark", true), []);
  return { theme, toggleTheme };
}
