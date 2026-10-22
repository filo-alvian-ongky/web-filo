import { notFound } from "next/navigation";
import AchievementDetail from "./AchievementDetail";
import { getContent, getPublishedContent } from "@/lib/content/server";
import { excerpt, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

// Semua pencapaian yang dipublikasikan dibuat statis saat build; yang baru dari CMS dibuat saat pertama dibuka (ISR)
export async function generateStaticParams() {
  const { achievements } = await getPublishedContent();
  return achievements.map((a) => ({ id: a.id }));
}

async function findAchievement(id) {
  const { achievements } = await getContent();
  return achievements.find((a) => a.id === id) ?? null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const a = await findAchievement(id);
  if (!a) return {};
  return pageMetadata({
    title: `${a.title.id} — ${a.provider} | Filo Alvian Ongky`,
    description: excerpt(a.description.id) || `${a.title.id} dari ${a.provider} (${a.date.slice(0, 4)}) — pencapaian Filo Alvian Ongky.`,
    path: `/achievements/${a.id}`,
  });
}

export default async function Page({ params }) {
  const { id } = await params;
  const achievement = await findAchievement(id);
  if (!achievement) notFound();
  return <AchievementDetail achievement={achievement} />;
}
