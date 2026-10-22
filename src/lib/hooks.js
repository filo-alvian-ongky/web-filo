"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { getLenis } from "./smoothScroll";

const noopSubscribe = () => () => {};

/** true setelah komponen berjalan di browser (aman untuk portal / API window) */
export function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function useMediaQuery(query, serverValue = false) {
  const subscribe = useCallback(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    [query]
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => serverValue);
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Mode hemat data, RAM ≤ 2 GB, atau "kurangi gerakan" aktif → pakai versi ringan (tanpa 3D, partikel lebih sedikit) */
export function isLowPowerDevice() {
  return !!navigator.connection?.saveData || (navigator.deviceMemory ?? Infinity) <= 2 || window.matchMedia(REDUCED_MOTION).matches;
}

function subscribeLowPower(cb) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", cb);
  navigator.connection?.addEventListener?.("change", cb);
  return () => {
    mq.removeEventListener("change", cb);
    navigator.connection?.removeEventListener?.("change", cb);
  };
}

/** null saat render server & hidrasi (belum diketahui), lalu true/false di browser — bebas hydration mismatch */
export function useLowPower() {
  return useSyncExternalStore(subscribeLowPower, isLowPowerDevice, () => null);
}

let scrollLocks = 0;

/** Kunci scroll halaman selama sheet/modal terbuka */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    scrollLocks += 1;
    document.documentElement.style.overflow = "hidden";
    getLenis()?.stop();
    return () => {
      scrollLocks -= 1;
      if (scrollLocks === 0) {
        document.documentElement.style.overflow = "";
        getLenis()?.start();
      }
    };
  }, [active]);
}

export function useEscape(active, onEscape) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onEscape]);
}

export function safeStorage(key, value) {
  try {
    if (value === undefined) return window.localStorage.getItem(key);
    window.localStorage.setItem(key, value);
  } catch {
    return null;
  }
  return null;
}
