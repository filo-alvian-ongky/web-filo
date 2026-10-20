import ProjectsManager from "@/components/admin/ProjectsManager";
import { loadAdmin } from "../load";

export const metadata = { title: "Proyek" };

export default async function Page({ searchParams }) {
  const { new: isNew } = await searchParams;
  const [projects, technologies] = await loadAdmin(
    (s) => s.from("projects").select("*, project_technologies(technology_id, sort_order)").order("sort_order"),
    (s) => s.from("technologies").select("*").order("sort_order")
  );
  // ?new=1 (tombol "+" / aksi cepat dasbor) → form tambah langsung terbuka
  return <ProjectsManager key={isNew ?? "list"} startNew={isNew === "1"} projects={projects} technologies={technologies} />;
}
