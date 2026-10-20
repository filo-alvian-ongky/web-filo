import { NextResponse } from "next/server";
import { getContent } from "@/lib/content/server";

// Chip saran pertanyaan pembuka Filo AI, diambil dari konten CMS (proyek & pencapaian teratas).
// Data publik yang sama dengan isi halaman → dibuat statis & diperbarui tiap 1 jam / saat konten disimpan di /admin.
export const revalidate = 3600;

const MAX_TITLE = 40;
const short = (text) => (text.length > MAX_TITLE ? `${text.slice(0, MAX_TITLE - 1).trimEnd()}…` : text);

export async function GET() {
  const { projects, achievements } = await getContent();
  const [first, second] = projects;
  const top = achievements[0];
  const award = top && short(`${top.title.id} ${top.provider}`);
  const awardEn = top && short(`${top.provider} ${top.title.en}`);

  const suggestions = {
    id: [
      first && `Ceritakan proyek ${short(first.title)}`,
      top && `Ceritakan pencapaian ${award}`,
      second && `Apa itu ${short(second.title)}?`,
      "Tech stack apa yang dikuasai Filo?",
    ],
    en: [
      first && `Tell me about the ${short(first.title)} project`,
      top && `Tell me about the ${awardEn}`,
      second && `What is ${short(second.title)}?`,
      "Which tech stack does Filo use?",
    ],
  };
  return NextResponse.json({ id: suggestions.id.filter(Boolean), en: suggestions.en.filter(Boolean) });
}
