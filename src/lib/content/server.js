// Pengambil konten untuk halaman publik (hanya dipakai di Server Component / route handler).

import { cache } from "react";
import { isSupabaseConfigured } from "../supabase/config";
import { createPublicSupabase } from "../supabase/server";
import { achievementView, experienceView, homeTechStack, projectView, techView } from "./normalize";
import { seedAchievements, seedExperiences, seedProjects, seedTechnologies } from "./seed";

// Halaman publik dibuat ulang paling lambat tiap 1 jam; menyimpan di /admin langsung memperbaruinya.
export const CONTENT_REVALIDATE = 3600;

function assemble({ technologies, experiences, achievements, projects }, source) {
  return {
    source,
    technologies: technologies.map(techView),
    experiences,
    achievements,
    projects,
    techStack: homeTechStack(technologies, experiences, projects),
  };
}

function fallbackContent() {
  const byName = new Map(seedTechnologies.map((t) => [t.name, techView(t)]));
  const pick = (names) => names.map((n) => byName.get(n)).filter(Boolean);
  return assemble(
    {
      technologies: seedTechnologies,
      experiences: seedExperiences.map((e) => experienceView(e, pick(e.stack))),
      achievements: seedAchievements.map(achievementView),
      projects: seedProjects.map((p) => projectView(p, pick(p.stack))),
    },
    "local"
  );
}

async function fetchFromSupabase() {
  const supabase = createPublicSupabase();
  const techJoin = "sort_order, technologies(*)";
  const [tech, exp, ach, proj] = await Promise.all([
    supabase.from("technologies").select("*").order("sort_order"),
    supabase.from("experiences").select(`*, experience_technologies(${techJoin})`).eq("published", true).order("sort_order"),
    supabase.from("achievements").select("*").eq("published", true).order("sort_order").order("date", { ascending: false }),
    supabase.from("projects").select(`*, project_technologies(${techJoin})`).eq("published", true).order("sort_order"),
  ]);
  const error = tech.error || exp.error || ach.error || proj.error;
  if (error) throw new Error(error.message);
  return {
    technologies: tech.data,
    experiences: exp.data.map((e) => experienceView(e)),
    achievements: ach.data.map(achievementView),
    projects: proj.data.map((p) => projectView(p)),
  };
}

/** Seluruh konten portfolio. Di-cache per request (dipakai bersama oleh metadata & halaman). */
export const getContent = cache(async () => {
  if (!isSupabaseConfigured) return fallbackContent();
  try {
    const data = await fetchFromSupabase();
    // Database masih kosong (belum menjalankan migrasi) → tampilkan konten lokal
    const empty = !data.technologies.length && !data.experiences.length && !data.achievements.length && !data.projects.length;
    return empty ? fallbackContent() : assemble(data, "supabase");
  } catch (error) {
    // Saat situs sudah berjalan (ISR), lempar error agar Next.js tetap menyajikan versi
    // terakhir yang berhasil, bukan konten cadangan yang mungkin sudah usang.
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") throw error;
    console.warn(`[content] Supabase tidak bisa dihubungi, memakai konten lokal: ${error.message}`);
    return fallbackContent();
  }
});
