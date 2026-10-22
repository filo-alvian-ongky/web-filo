import Home from "./Home";
import { getContent } from "@/lib/content/server";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Portfolio Filo Alvian Ongky - Mahasiswa Ilmu Komputer & Pengembang",
  description: "Situs web pribadi Filo Alvian Ongky, Mahasiswa Ilmu Komputer di BINUS University yang berfokus pada pengembangan sistem cerdas, UI/UX, dan riset IoT.",
  path: "/",
});

// Halaman statis yang diperbarui tiap 1 jam / langsung saat konten disimpan di /admin
export const revalidate = 3600;

export default async function Page() {
  const { techStack, achievements, settings } = await getContent();
  return (
    <Home
      hero={settings.hero}
      highlights={settings.highlights}
      focusIntro={settings.focusIntro}
      focusAreas={settings.focusAreas}
      techStack={techStack}
      achievements={achievements.slice(0, 4)}
      achievementCount={achievements.length}
    />
  );
}
