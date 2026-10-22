import { ogContentType, ogSize, renderOgImage } from "@/lib/og";
import { getPublishedContent } from "@/lib/content/server";
import { excerpt } from "@/lib/seo";

export const alt = "Proyek | Filo Alvian Ongky";
export const size = ogSize;
export const contentType = ogContentType;
// Diperbarui bersama halaman (tiap 1 jam / saat disimpan di /admin)
export const revalidate = 3600;

// Dibuat statis saat build untuk tiap proyek (sama dengan halamannya)
export async function generateStaticParams() {
  const { projects } = await getPublishedContent();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }) {
  const { slug } = await params;
  const { projects } = await getPublishedContent();
  const project = projects.find((p) => p.slug === slug);
  return renderOgImage({
    eyebrow: "Proyek",
    title: project?.title ?? "Karya & Proyek",
    subtitle: project ? excerpt(project.summary.id, 90) : "Work & Projects",
  });
}
