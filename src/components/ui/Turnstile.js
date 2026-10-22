"use client";

import { useEffect, useRef } from "react";

// Widget anti-spam Cloudflare Turnstile. Skrip dimuat langsung dari Cloudflare (tidak boleh di-cache /
// di-proxy sendiri) dan hanya saat widget pertama kali tampil — halaman lain tidak ikut memuatnya.
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading = null;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile tidak tersedia")));
    script.onerror = () => {
      // Gagal (mis. jaringan / pemblokir iklan) → boleh dicoba lagi saat widget dibuka ulang
      loading = null;
      script.remove();
      reject(new Error("Skrip Turnstile gagal dimuat"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/**
 * Widget Turnstile mode "interaction-only": tidak terlihat kecuali Cloudflare butuh pengunjung mencentang.
 * Untuk token baru (token hanya sekali pakai), pasang ulang komponen dengan `key` berbeda.
 * @param onToken  (token | null) => void — null saat token kedaluwarsa / gagal
 */
export default function Turnstile({ siteKey, action, theme = "auto", lang = "id", onToken, onError, className = "" }) {
  const ref = useRef(null);
  const handlers = useRef({ onToken, onError });
  useEffect(() => {
    handlers.current = { onToken, onError };
  });

  useEffect(() => {
    let cancelled = false;
    let widgetId = null;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !ref.current) return;
        widgetId = turnstile.render(ref.current, {
          sitekey: siteKey,
          action,
          theme,
          language: lang,
          size: "flexible",
          appearance: "interaction-only",
          callback: (token) => handlers.current.onToken?.(token),
          "expired-callback": () => handlers.current.onToken?.(null),
          "timeout-callback": () => handlers.current.onToken?.(null),
          "error-callback": () => {
            handlers.current.onToken?.(null);
            handlers.current.onError?.();
          },
        });
      })
      .catch(() => handlers.current.onError?.());
    return () => {
      cancelled = true;
      if (widgetId !== null) window.turnstile?.remove(widgetId);
    };
  }, [siteKey, action, theme, lang]);

  return <div ref={ref} className={className} />;
}
