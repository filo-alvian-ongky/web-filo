import TechnologiesManager from "@/components/admin/TechnologiesManager";
import { loadAdmin } from "../load";

export const metadata = { title: "Teknologi" };

export default async function Page({ searchParams }) {
  const { new: isNew } = await searchParams;
  const [technologies] = await loadAdmin((s) => s.from("technologies").select("*").order("sort_order"));
  // ?new=1 (tombol "+" / aksi cepat dasbor) → form tambah langsung terbuka
  return <TechnologiesManager key={isNew ?? "list"} startNew={isNew === "1"} technologies={technologies} />;
}
