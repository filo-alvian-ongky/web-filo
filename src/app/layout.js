import { Plus_Jakarta_Sans } from "next/font/google";
import { draftMode } from "next/headers";
import "./globals.css";
import AppShell from "../components/AppShell";
import { SITE_URL, personJsonLd } from "@/lib/seo";
import { profile } from "@/lib/data";
import { getSiteSettings } from "@/lib/content/server";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  // Alamat dasar untuk URL absolut (canonical, og:url, og:image)
  metadataBase: new URL(SITE_URL),
  title: "Portfolio Filo Alvian Ongky - Mahasiswa Ilmu Komputer & Pengembang",
  description:
    "Situs web pribadi Filo Alvian Ongky, Mahasiswa Ilmu Komputer di BINUS University yang berfokus pada pengembangan sistem cerdas, UI/UX, dan riset IoT.",
  applicationName: profile.domain,
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  // Bawaan untuk halaman yang tidak menulis sendiri (canonical ditulis per halaman di page.js)
  openGraph: { type: "website", siteName: profile.domain, locale: "id_ID", alternateLocale: ["en_US"] },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  // Tampilan dikunci seperti aplikasi: tidak bisa di-zoom (pinch / ketuk dua kali)
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f6" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// Dijalankan sebelum halaman tampil agar tidak ada "kedipan" tema & bahasa.
// Tanpa pilihan tersimpan, tema mengikuti pengaturan perangkat (seperti iOS / One UI)
// dan bahasa default-nya Indonesia.
const themeInitScript = `(function(){try{var h=document.documentElement;var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)h.classList.add('dark');if(localStorage.getItem('lang')==='en')h.lang='en';}catch(e){}})();`;

export default async function RootLayout({ children }) {
  // Saat build / ISR selalu false (halaman tetap statis); true hanya untuk admin yang membuka /api/preview
  const { isEnabled: preview } = await draftMode();
  const { cvProfile } = await getSiteSettings();
  return (
    <html lang="id" className={jakarta.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Data terstruktur profil (schema.org Person) untuk mesin pencari; "<" di-escape agar aman di dalam <script> */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(cvProfile)).replace(/</g, "\\u003c") }} />
      </head>
      <body className="antialiased">
        <AppShell preview={preview}>{children}</AppShell>
      </body>
    </html>
  );
}
