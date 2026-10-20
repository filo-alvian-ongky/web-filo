import ExperiencesManager from "@/components/admin/ExperiencesManager";
import { loadAdmin } from "../load";

export const metadata = { title: "Pengalaman" };

export default async function Page({ searchParams }) {
  const { new: isNew } = await searchParams;
  const [experiences, technologies] = await loadAdmin(
    (s) => s.from("experiences").select("*, experience_technologies(technology_id, sort_order)").order("sort_order"),
    (s) => s.from("technologies").select("*").order("sort_order")
  );
  // ?new=1 (tombol "+" / aksi cepat dasbor) → form tambah langsung terbuka
  return <ExperiencesManager key={isNew ?? "list"} startNew={isNew === "1"} experiences={experiences} technologies={technologies} />;
}
