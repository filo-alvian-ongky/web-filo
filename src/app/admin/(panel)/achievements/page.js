import AchievementsManager from "@/components/admin/AchievementsManager";
import { loadAdmin } from "../load";

export const metadata = { title: "Pencapaian" };

export default async function Page({ searchParams }) {
  const { new: isNew } = await searchParams;
  const [achievements] = await loadAdmin((s) => s.from("achievements").select("*").order("sort_order").order("date", { ascending: false }));
  // ?new=1 (tombol "+" / aksi cepat dasbor) → form tambah langsung terbuka
  return <AchievementsManager key={isNew ?? "list"} startNew={isNew === "1"} achievements={achievements} />;
}
