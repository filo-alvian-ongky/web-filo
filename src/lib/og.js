// Gambar Open Graph (preview link di WhatsApp, LinkedIn, X, dll.) bergaya One UI:
// latar gradasi biru gelap, logo dalam squircle, nama & judul halaman besar.
// Dipakai oleh opengraph-image.js di tiap rute; dibuat statis saat build & diperbarui bersama halaman
// (headline di bawah nama diambil dari Pengaturan Website → Profil CV).
// ImageResponse (Satori) hanya mengenal <img> biasa, bukan next/image.
/* eslint-disable @next/next/no-img-element */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "./data";
import { getSiteSettings } from "./content/server";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Font sama dengan website & CV (Plus Jakarta Sans, .woff didukung ImageResponse)
const FONT_DIR = path.join(process.cwd(), "src/lib/cv/fonts");
const WEIGHTS = [400, 700, 800];

let assets;
function loadAssets() {
  assets ??= Promise.all([
    ...WEIGHTS.map((w) => readFile(path.join(FONT_DIR, `plus-jakarta-sans-latin-${w}-normal.woff`))),
    readFile(path.join(process.cwd(), "public/logo.svg"), "utf8"),
  ]).then((files) => {
    const svg = files.pop().replace('fill="#000"', 'fill="#fff"');
    return {
      fonts: files.map((data, i) => ({ name: "Jakarta", data, weight: WEIGHTS[i], style: "normal" })),
      logo: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    };
  });
  return assets;
}

const glow = (color, style) => ({
  position: "absolute",
  borderRadius: 9999,
  background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
  ...style,
});

/** @param {{ eyebrow: string, title: string, subtitle: string }} page */
export async function renderOgImage({ eyebrow, title, subtitle }) {
  const [{ fonts, logo }, { cvProfile }] = await Promise.all([loadAssets(), getSiteSettings()]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          fontFamily: "Jakarta",
          background: "linear-gradient(140deg, #01040f 0%, #04143a 48%, #0a3a99 100%)",
        }}
      >
        <div style={glow("rgba(59,139,255,0.55)", { top: -220, right: -160, width: 640, height: 640 })} />
        <div style={glow("rgba(79,70,229,0.45)", { bottom: -300, left: -200, width: 720, height: 720 })} />
        {/* Logo besar samar sebagai watermark di kanan */}
        <img src={logo} width={460} height={460} alt="" style={{ position: "absolute", right: -40, bottom: -70, opacity: 0.07 }} />

        {/* Kepala: logo + nama + domain */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 88,
                height: 88,
                borderRadius: 28,
                background: "linear-gradient(135deg, #3b8bff 0%, #4f46e5 100%)",
                boxShadow: "0 16px 44px rgba(10,108,245,0.45)",
              }}
            >
              <img src={logo} width={58} height={58} alt="" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>{profile.name}</div>
              <div style={{ fontSize: 22, color: "rgba(255,255,255,0.62)" }}>{cvProfile.headline.id}</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              padding: "12px 24px",
              borderRadius: 9999,
              fontSize: 22,
              fontWeight: 700,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.16)",
            }}
          >
            {profile.domain}
          </div>
        </div>

        {/* Isi: judul halaman ala header besar One UI */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#8ab8ff" }}>{eyebrow}</div>
          <div style={{ marginTop: 14, fontSize: 80, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2.5 }}>{title}</div>
          <div style={{ marginTop: 22, fontSize: 32, color: "rgba(255,255,255,0.7)" }}>{subtitle}</div>
        </div>
      </div>
    ),
    { ...ogSize, fonts }
  );
}
