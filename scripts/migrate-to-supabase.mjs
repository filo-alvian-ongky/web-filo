// Memindahkan konten lama (src/lib/content/seed.js + file di /public) ke Supabase.
//
//   npm run cms:migrate            → isi database (berhenti bila database sudah berisi)
//   npm run cms:migrate -- --reset → HAPUS semua konten CMS lalu isi ulang dari awal
//
// Butuh NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SECRET_KEY di .env.local.
// Secret key hanya dipakai di komputer ini — jangan dimasukkan ke Vercel / di-commit.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { seedAchievements, seedExperiences, seedProjects, seedTechnologies } from "../src/lib/content/seed.js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✖ Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SECRET_KEY di .env.local terlebih dahulu.");
  process.exit(1);
}

const reset = process.argv.includes("--reset");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const BUCKET = "media";
const TABLES = ["technologies", "experiences", "achievements", "projects"];

const check = ({ data, error }, what) => {
  if (error) throw new Error(`${what}: ${error.message}`);
  return data;
};

// sharp (sudah ikut terpasang bersama Next.js) dipakai untuk mengecilkan gambar asli ke WebP
const sharp = await import("sharp").then((m) => m.default).catch(() => null);

const CONTENT_TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".pdf": "application/pdf" };

/** Upload file dari /public ke bucket "media". Gambar besar diperkecil ke WebP maks. 2000px. */
async function uploadLocal(publicPath, folder, { optimize = false } = {}) {
  if (!publicPath) return null;
  const source = path.join("public", publicPath.replace(/^\//, ""));
  let body = await readFile(source);
  let ext = path.extname(source).toLowerCase();
  let base = path.basename(source, path.extname(source));
  if (optimize && sharp && ext !== ".webp" && ext !== ".pdf") {
    body = await sharp(body).resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 86 }).toBuffer();
    ext = ".webp";
  }
  if (folder === "achievements/thumbs") base = `${base}-thumb`;
  const dest = `${folder}/${base}${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(dest, body, { contentType: CONTENT_TYPES[ext], upsert: true, cacheControl: "31536000" });
  if (error) throw new Error(`Upload ${publicPath}: ${error.message}`);
  return dest;
}

async function main() {
  // Cek koneksi & tabel (head: true → hanya menghitung jumlah baris)
  const counts = [];
  for (const t of TABLES) {
    const res = await supabase.from(t).select("id", { count: "exact", head: true });
    if (res.error) throw new Error(`Tabel ${t}: ${res.error.message}. Sudahkah supabase/schema.sql dijalankan?`);
    counts.push(res.count ?? 0);
  }
  const filled = counts.some((c) => c > 0);
  if (filled && !reset) {
    console.log(`ℹ Database sudah berisi (${TABLES.map((t, i) => `${t}: ${counts[i]}`).join(", ")}).`);
    console.log("  Migrasi dibatalkan agar data tidak dobel. Pakai --reset untuk menghapus & mengisi ulang.");
    return;
  }
  if (reset) {
    console.log("⚠ --reset: menghapus semua konten CMS…");
    for (const t of ["experience_technologies", "project_technologies"]) check(await supabase.from(t).delete().not("technology_id", "is", null), `Kosongkan ${t}`);
    for (const t of TABLES) check(await supabase.from(t).delete().not("id", "is", null), `Kosongkan ${t}`);
  }

  console.log("→ Teknologi");
  const techRows = check(
    await supabase.from("technologies").insert(seedTechnologies.map(({ name, slug, icon_path, color, featured, sort_order }) => ({ name, slug, icon_path, color, featured, sort_order }))).select("id, name"),
    "Insert teknologi"
  );
  const techId = new Map(techRows.map((t) => [t.name, t.id]));
  const joinRows = (key, id, names) => names.filter((n) => techId.has(n)).map((n, i) => ({ [key]: id, technology_id: techId.get(n), sort_order: i }));

  console.log("→ Pengalaman");
  for (const { stack, ...row } of seedExperiences) {
    const { id } = check(await supabase.from("experiences").insert(row).select("id").single(), `Insert pengalaman ${row.role}`);
    const joins = joinRows("experience_id", id, stack);
    if (joins.length) check(await supabase.from("experience_technologies").insert(joins), "Relasi teknologi pengalaman");
  }

  console.log(`→ Pencapaian (upload file${sharp ? ", gambar dikompres ke WebP" : ""})`);
  for (const a of seedAchievements) {
    const image_path = await uploadLocal(a.image_path, "achievements", { optimize: true });
    const thumb_path = await uploadLocal(a.thumb_path, "achievements/thumbs");
    const pdf_path = await uploadLocal(a.pdf_path, "achievements");
    check(await supabase.from("achievements").insert({ ...a, image_path, thumb_path, pdf_path }).select("id").single(), `Insert pencapaian ${a.title.id}`);
    console.log(`   ✓ ${a.title.id}`);
  }

  console.log("→ Proyek");
  for (const { stack, ...row } of seedProjects) {
    const { id } = check(await supabase.from("projects").insert(row).select("id").single(), `Insert proyek ${row.title}`);
    const joins = joinRows("project_id", id, stack);
    if (joins.length) check(await supabase.from("project_technologies").insert(joins), "Relasi teknologi proyek");
  }

  console.log(`\n✔ Selesai: ${seedTechnologies.length} teknologi, ${seedExperiences.length} pengalaman, ${seedAchievements.length} pencapaian, ${seedProjects.length} proyek.`);
  console.log("  Buka /admin untuk mengelola konten.");
}

main().catch((error) => {
  console.error(`✖ ${error.message}`);
  process.exit(1);
});
