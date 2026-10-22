// Pengambil konten untuk halaman publik (hanya dipakai di Server Component / route handler).

import { cache } from "react";
import { draftMode } from "next/headers";
import { isSupabaseConfigured } from "../supabase/config";
import { createPublicSupabase, getAdminSession } from "../supabase/server";
import { achievementView, experienceView, homeTechStack, projectView, settingsView, techView } from "./normalize";
import { seedAchievements, seedExperiences, seedProjects, seedTechnologies } from "./seed";

// Halaman publik dibuat ulang paling lambat tiap 1 jam; menyimpan di /admin langsung memperbaruinya.
export const CONTENT_REVALIDATE = 3600;

function assemble({ technologies, experiences, achievements, projects }, settings, source, preview = false) {
  return {
    source,
    // true = mode pratinjau admin (draft ikut tampil)
    preview,
    technologies: technologies.map(techView),
    experiences,
    achievements,
    projects,
    techStack: homeTechStack(technologies, experiences, projects),
    settings,
  };
}

function fallbackContent(settings = settingsView()) {
  const byName = new Map(seedTechnologies.map((t) => [t.name, techView(t)]));
  const pick = (names) => names.map((n) => byName.get(n)).filter(Boolean);
  return assemble(
    {
      technologies: seedTechnologies,
      experiences: seedExperiences.map((e) => experienceView(e, pick(e.stack))),
      achievements: seedAchievements.map(achievementView),
      projects: seedProjects.map((p) => projectView(p, pick(p.stack))),
    },
    settings,
    "local"
  );
}

/**
 * @param supabase  klien publik, atau klien sesi admin saat pratinjau
 * @param drafts    true = ikut ambil item draft (published = false). RLS tetap hanya
 *                  mengembalikan draft untuk admin yang sudah verifikasi 2 langkah.
 */
async function fetchFromSupabase(supabase, drafts) {
  const techJoin = "sort_order, technologies(*)";
  const visible = (query) => (drafts ? query : query.eq("published", true));
  const [tech, exp, ach, proj] = await Promise.all([
    supabase.from("technologies").select("*").order("sort_order"),
    visible(supabase.from("experiences").select(`*, experience_technologies(${techJoin})`)).order("sort_order"),
    visible(supabase.from("achievements").select("*")).order("sort_order").order("date", { ascending: false }),
    visible(supabase.from("projects").select(`*, project_technologies(${techJoin})`)).order("sort_order"),
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

/**
 * Pengaturan Website (hero, sorotan, bidang fokus, profil CV). Di-cache per request: dipakai
 * bersama oleh getContent(), layout (JSON-LD) & gambar Open Graph. Tidak pernah melempar error —
 * tabel kosong / belum dibuat / tidak bisa dihubungi → nilai bawaan dari data.js.
 */
export const getSiteSettings = cache(async () => {
  if (!isSupabaseConfigured) return settingsView();
  try {
    const { data, error } = await createPublicSupabase().from("site_settings").select("key, value");
    if (error) throw new Error(error.message);
    return settingsView(data);
  } catch (error) {
    console.warn(`[content] site_settings tidak bisa dibaca, memakai nilai bawaan: ${error.message}`);
    return settingsView();
  }
});

/**
 * Mode pratinjau (draftMode, diaktifkan lewat /api/preview) hanya berlaku untuk admin yang
 * login + 2FA. Saat halaman dibuat statis (build / ISR) draftMode selalu nonaktif, jadi
 * pengunjung biasa tetap mendapat halaman statis dan cookie tidak pernah dibaca.
 */
async function previewClient() {
  if (!(await draftMode()).isEnabled) return null;
  const { supabase, isAdmin, mfaVerified } = await getAdminSession();
  return isAdmin && mfaVerified ? supabase : null;
}

/** @param getAdmin  () => klien sesi admin untuk mode pratinjau, atau null (konten publik) */
async function loadContent(getAdmin) {
  if (!isSupabaseConfigured) return fallbackContent();
  try {
    const admin = await getAdmin();
    const [data, settings] = await Promise.all([fetchFromSupabase(admin ?? createPublicSupabase(), Boolean(admin)), getSiteSettings()]);
    // Database masih kosong (belum menjalankan migrasi) → tampilkan konten lokal
    const empty = !data.technologies.length && !data.experiences.length && !data.achievements.length && !data.projects.length;
    return empty ? fallbackContent(settings) : assemble(data, settings, "supabase", Boolean(admin));
  } catch (error) {
    // Saat situs sudah berjalan (ISR), lempar error agar Next.js tetap menyajikan versi
    // terakhir yang berhasil, bukan konten cadangan yang mungkin sudah usang.
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") throw error;
    console.warn(`[content] Supabase tidak bisa dihubungi, memakai konten lokal: ${error.message}`);
    return fallbackContent();
  }
}

/** Seluruh konten portfolio. Di-cache per request (dipakai bersama oleh metadata & halaman). */
export const getContent = cache(() => loadContent(previewClient));

/**
 * Konten yang dipublikasikan saja, tanpa membaca request (draftMode / cookie). Untuk kode yang
 * berjalan di luar request halaman: generateStaticParams, sitemap & gambar Open Graph.
 */
export const getPublishedContent = cache(() => loadContent(async () => null));
