import { ogContentType, ogSize, renderOgImage } from "@/lib/og";
import { getPublishedContent } from "@/lib/content/server";

export const alt = "Pencapaian | Filo Alvian Ongky";
export const size = ogSize;
export const contentType = ogContentType;
// Diperbarui bersama halaman (tiap 1 jam / saat disimpan di /admin)
export const revalidate = 3600;

// Dibuat statis saat build untuk tiap pencapaian (sama dengan halamannya)
export async function generateStaticParams() {
  const { achievements } = await getPublishedContent();
  return achievements.map((a) => ({ id: a.id }));
}

export default async function Image({ params }) {
  const { id } = await params;
  const { achievements } = await getPublishedContent();
  const a = achievements.find((item) => item.id === id);
  return renderOgImage({
    eyebrow: "Pencapaian",
    title: a?.title.id ?? "Pencapaian & Penghargaan",
    subtitle: a ? `${a.provider} · ${a.date.slice(0, 4)}` : "Achievements & Awards",
  });
}
