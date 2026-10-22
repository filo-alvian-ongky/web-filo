// Backup konten CMS Supabase ke komputer sendiri.
//
//   npm run cms:backup   → backups/<tanggal>/
//                            ├─ tables/<tabel>.json   isi tiap tabel CMS
//                            ├─ media/…               semua file bucket "media" (struktur folder sama)
//                            ├─ restore.sql           untuk memulihkan isi tabel lewat SQL Editor
//                            └─ manifest.json         ringkasan: waktu, jumlah baris & file
//
// Script ini HANYA MEMBACA dari Supabase (select, list, download) — tidak ada operasi tulis/hapus.
// Butuh NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SECRET_KEY di .env.local (secret key hanya di komputer ini).

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✖ Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SECRET_KEY di .env.local terlebih dahulu.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const BUCKET = "media";
// Urutan = urutan pemulihan (tabel induk dulu, baru tabel relasi)
const TABLES = ["technologies", "experiences", "achievements", "projects", "experience_technologies", "project_technologies", "site_settings", "admins"];
const PAGE = 1000;

const pad = (n) => String(n).padStart(2, "0");

/** backups/2026-10-22 — bila sudah ada (backup kedua di hari yang sama), tambahkan jam agar tidak tertimpa */
async function outputDir() {
  const now = new Date();
  const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const first = path.join("backups", day);
  const exists = await access(first).then(
    () => true,
    () => false
  );
  return exists ? `${first}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}` : first;
}

/** Ambil semua baris tabel, per halaman 1000 baris (batas bawaan API Supabase) */
async function readTable(table) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(table).select("*").range(from, from + PAGE - 1);
    if (error) throw new Error(`Tabel ${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}

/** Daftar semua file di bucket (rekursif). Folder di Storage ditandai dengan id null. */
async function listFiles(prefix = "") {
  const files = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: PAGE, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`List ${prefix || "/"}: ${error.message}`);
    for (const item of data) {
      const full = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) files.push(...(await listFiles(full)));
      else files.push({ path: full, size: item.metadata?.size ?? null });
    }
    if (data.length < PAGE) return files;
  }
}

/** Jalankan tugas async dengan batas paralel (agar tidak membanjiri koneksi) */
async function pool(items, limit, task) {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await task(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

const sqlString = (text) => `'${text.replace(/'/g, "''")}'`;

/** SQL pemulihan: isi tabel dari JSON. Baris yang id-nya sudah ada dilewati (on conflict do nothing). */
function restoreSql(data, stamp) {
  const lines = [
    `-- Pemulihan konten CMS dari backup ${stamp}`,
    "-- Jalankan di Supabase → SQL Editor SETELAH supabase/schema.sql. Baris yang sudah ada tidak ditimpa.",
    "begin;",
  ];
  for (const table of TABLES) {
    if (!data[table].length) continue;
    lines.push(
      `insert into public.${table} select * from jsonb_populate_recordset(null::public.${table}, ${sqlString(JSON.stringify(data[table]))}::jsonb) on conflict do nothing;`
    );
  }
  lines.push("commit;", "");
  return lines.join("\n");
}

async function main() {
  const dir = await outputDir();
  const startedAt = new Date().toISOString();
  await mkdir(path.join(dir, "tables"), { recursive: true });
  console.log(`→ Backup ke ${dir}`);

  console.log("→ Tabel");
  const data = {};
  for (const table of TABLES) {
    data[table] = await readTable(table);
    await writeFile(path.join(dir, "tables", `${table}.json`), `${JSON.stringify(data[table], null, 2)}\n`);
    console.log(`   ✓ ${table}: ${data[table].length} baris`);
  }
  await writeFile(path.join(dir, "restore.sql"), restoreSql(data, startedAt));

  console.log(`→ File bucket "${BUCKET}"`);
  const files = await listFiles();
  const mediaDir = path.resolve(dir, "media");
  let bytes = 0;
  let done = 0;
  await pool(files, 4, async (file) => {
    const dest = path.resolve(mediaDir, file.path);
    // Pengaman: nama file aneh (mis. "../") tidak boleh menulis di luar folder backup
    if (!dest.startsWith(mediaDir + path.sep)) throw new Error(`Path tidak valid: ${file.path}`);
    const { data: blob, error } = await supabase.storage.from(BUCKET).download(file.path);
    if (error) throw new Error(`Unduh ${file.path}: ${error.message}`);
    const body = Buffer.from(await blob.arrayBuffer());
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, body);
    bytes += body.length;
    done += 1;
    if (done % 10 === 0 || done === files.length) console.log(`   ${done}/${files.length} file`);
  });

  const manifest = {
    createdAt: startedAt,
    supabaseUrl: url,
    tables: Object.fromEntries(TABLES.map((t) => [t, data[t].length])),
    media: { bucket: BUCKET, files: files.length, bytes, paths: files.map((f) => f.path) },
  };
  await writeFile(path.join(dir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`\n✔ Selesai: ${TABLES.length} tabel, ${files.length} file (${(bytes / 1024 / 1024).toFixed(1)} MB) → ${dir}`);
}

main().catch((error) => {
  console.error(`✖ ${error.message}`);
  process.exit(1);
});
