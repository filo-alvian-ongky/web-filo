// Data SEO bersama: alamat situs, metadata Open Graph / Twitter per halaman & JSON-LD profil.
// Dipakai oleh layout, page.js, robots.js, sitemap.js dan opengraph-image.js.

import { profile, socialLinks } from "./data";

export const SITE_URL = "https://filoalvian.com";

/**
 * Metadata lengkap satu halaman publik (title & description tetap dari halaman itu sendiri).
 * Catatan: objek `openGraph` / `twitter` milik halaman MENGGANTIKAN milik layout (tidak digabung),
 * jadi semua field ditulis ulang di sini. Gambar diisi otomatis oleh opengraph-image.js di rutenya.
 */
export function pageMetadata({ title, description, path }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: profile.domain,
      locale: "id_ID",
      alternateLocale: ["en_US"],
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * Teks polos singkat dari markdown CMS untuk meta description / gambar OG.
 * Tanda format (judul, daftar, tebal, link) dibuang lalu dipotong di batas kata.
 */
export function excerpt(markdown, max = 160) {
  const text = String(markdown ?? "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_`~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  // Potong di batas kata (kecuali kata terakhirnya sangat panjang)
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:—-]+$/, "")}…`;
}

/**
 * JSON-LD schema.org `Person` untuk mesin pencari (dipasang di layout).
 * @param cvProfile  profil CV dari Pengaturan Website (ringkasannya dipakai sebagai deskripsi)
 */
export const personJsonLd = (cvProfile) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: SITE_URL,
  image: `${SITE_URL}${profile.photo}`,
  email: `mailto:${profile.email}`,
  jobTitle: profile.role.en,
  description: cvProfile.summary.en,
  alumniOf: { "@type": "CollegeOrUniversity", name: profile.campus },
  sameAs: socialLinks.filter((s) => s.name === "LinkedIn" || s.name === "GitHub").map((s) => s.href),
});
