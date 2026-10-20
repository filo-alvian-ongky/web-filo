import Projects from "./Projects";
import { getContent } from "@/lib/content/server";

export const metadata = {
  title: "Karya & Proyek | Filo Alvian Ongky",
  description: "Kumpulan karya dan proyek Filo Alvian Ongky, termasuk FruitSense App dan Fortunas AI.",
};

export const revalidate = 3600;

export default async function Page() {
  const { projects } = await getContent();
  return <Projects projects={projects} />;
}
