import { EMBED_ORIGINS } from "./src/lib/embeds.mjs";

const isDev = process.env.NODE_ENV !== "production";
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Content-Security-Policy: browser hanya boleh memuat script/gambar/koneksi dari sumber yang dikenal.
// 'unsafe-inline' tetap dibutuhkan untuk script inline Next.js & tema (halaman statis tanpa nonce);
// 'wasm-unsafe-eval' untuk mesin fisika lanyard (Rapier/WebAssembly).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabase}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabase}${isDev ? " ws: wss:" : ""}`,
  `frame-src ${EMBED_ORIGINS.join(" ")}`,
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Anti-clickjacking (website tidak boleh dimuat di dalam iframe situs lain).
  // Di mode dev dibiarkan agar pratinjau di VS Code tetap jalan.
  ...(isDev ? [] : ["frame-ancestors 'none'", "upgrade-insecure-requests"]),
]
  .join("; ")
  .replace(/\s+/g, " ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev
    ? []
    : [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      ]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  // Jangan umumkan framework & versi di header respons
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Panel admin (termasuk /admin itu sendiri): jangan pernah di-cache CDN/browser & jangan diindeks
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
