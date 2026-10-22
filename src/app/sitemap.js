import { SITE_URL } from "@/lib/seo";
import { getPublishedContent } from "@/lib/content/server";

// /sitemap.xml — halaman publik, halaman detail proyek & pencapaian, PDF CV.
// Diperbarui tiap 1 jam / saat konten disimpan di /admin (refreshSite).
export const revalidate = 3600;

const PAGES = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/experience", changeFrequency: "monthly", priority: 0.8 },
  { path: "/achievements", changeFrequency: "monthly", priority: 0.8 },
  { path: "/projects", changeFrequency: "monthly", priority: 0.8 },
  { path: "/cv/id", changeFrequency: "monthly", priority: 0.5 },
  { path: "/cv/en", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap() {
  const now = new Date();
  const { projects, achievements } = await getPublishedContent();
  const details = [
    ...projects.map((p) => ({ path: `/projects/${p.slug}`, updatedAt: p.updatedAt, priority: 0.7 })),
    ...achievements.map((a) => ({ path: `/achievements/${a.id}`, updatedAt: a.updatedAt, priority: 0.6 })),
  ].map(({ updatedAt, ...page }) => ({ ...page, changeFrequency: "monthly", lastModified: updatedAt ? new Date(updatedAt) : now }));

  return [...PAGES.map((page) => ({ ...page, lastModified: now })), ...details].map(({ path, ...rest }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    ...rest,
  }));
}
