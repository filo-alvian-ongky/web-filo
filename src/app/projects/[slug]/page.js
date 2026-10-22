import { notFound } from "next/navigation";
import ProjectDetail from "./ProjectDetail";
import { getContent, getPublishedContent } from "@/lib/content/server";
import { excerpt, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

// Semua proyek yang dipublikasikan dibuat statis saat build; proyek baru dari CMS dibuat saat pertama dibuka (ISR)
export async function generateStaticParams() {
  const { projects } = await getPublishedContent();
  return projects.map((p) => ({ slug: p.slug }));
}

/** Proyek + tetangganya (urutan sama dengan halaman Proyek), atau null bila slug tidak ada */
async function findProject(slug) {
  const { projects } = await getContent();
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) return null;
  return { project: projects[i], prev: projects[i - 1] ?? null, next: projects[i + 1] ?? null };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const found = await findProject(slug);
  if (!found) return {};
  const { project } = found;
  return pageMetadata({
    title: `${project.title} | Filo Alvian Ongky`,
    description: excerpt(project.summary.id || project.story.id) || `Proyek ${project.title} oleh Filo Alvian Ongky.`,
    path: `/projects/${project.slug}`,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const found = await findProject(slug);
  if (!found) notFound();
  return <ProjectDetail {...found} />;
}
