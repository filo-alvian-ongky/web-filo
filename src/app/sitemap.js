import { SITE_URL } from "@/lib/seo";

// /sitemap.xml — halaman publik + PDF CV (dibuat ulang setiap build)
const PAGES = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/experience", changeFrequency: "monthly", priority: 0.8 },
  { path: "/achievements", changeFrequency: "monthly", priority: 0.8 },
  { path: "/projects", changeFrequency: "monthly", priority: 0.8 },
  { path: "/cv/id", changeFrequency: "monthly", priority: 0.5 },
  { path: "/cv/en", changeFrequency: "monthly", priority: 0.5 },
];

export default function sitemap() {
  const lastModified = new Date();
  return PAGES.map(({ path, ...rest }) => ({ url: `${SITE_URL}${path === "/" ? "" : path}`, lastModified, ...rest }));
}
