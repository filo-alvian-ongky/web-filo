import Achievements from "./Achievements";
import { getContent } from "@/lib/content/server";

export const metadata = {
  title: "Pencapaian & Penghargaan | Filo Alvian Ongky",
  description: "Kumpulan sertifikasi kompetensi, medali internasional, dan pengakuan riset akademik yang divalidasi oleh institusi global.",
};

export const revalidate = 3600;

export default async function Page() {
  const { achievements } = await getContent();
  return <Achievements achievements={achievements} />;
}