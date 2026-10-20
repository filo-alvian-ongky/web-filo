// Data SEO bersama: alamat situs, metadata Open Graph / Twitter per halaman & JSON-LD profil.
// Dipakai oleh layout, page.js, robots.js, sitemap.js dan opengraph-image.js.

import { cvProfile, profile, socialLinks } from "./data";

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

/** JSON-LD schema.org `Person` untuk mesin pencari (dipasang di layout). */
export const personJsonLd = {
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
};
