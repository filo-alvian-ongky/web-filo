import { SITE_URL } from "@/lib/seo";

// /robots.txt — semua halaman publik boleh diindeks, kecuali panel admin & endpoint API
export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
