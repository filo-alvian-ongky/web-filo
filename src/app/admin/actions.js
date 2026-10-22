"use server";

// Server action CMS. Semua penulisan memakai sesi login admin (cookie), jadi tetap
// dijaga Row Level Security di database — tanpa secret key di server.

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase/server";
import { MEDIA_BUCKET, thumbPathOf } from "@/lib/supabase/config";
import { safeEmbedUrl, safeHttpUrl } from "@/lib/embeds.mjs";
import { FOCUS_ICONS } from "@/components/ui/focusIcons";

const TABLES = ["technologies", "experiences", "achievements", "projects"];
// Kolom file per tabel (untuk dibersihkan dari storage saat baris dihapus)
const FILE_COLUMNS = { achievements: ["image_path", "thumb_path", "pdf_path"], projects: ["cover_path", "thumb_path", "gallery"] };

async function adminClient() {
  const { supabase, user, isAdmin, mfaVerified } = await getAdminSession();
  if (!user || !isAdmin) throw new Error("Sesi berakhir atau akun ini bukan admin. Silakan masuk lagi.");
  if (!mfaVerified) throw new Error("Verifikasi 2 langkah diperlukan. Silakan masuk lagi.");
  return supabase;
}

// Bungkus aksi: kembalikan { ok, ...data } atau { ok: false, error } (pesan error tetap terbaca di production)
async function run(fn) {
  try {
    const data = await fn(await adminClient());
    return { ok: true, ...(data ?? {}) };
  } catch (error) {
    return { ok: false, error: error.message ?? String(error) };
  }
}

const check = ({ error, data }) => {
  if (error) throw new Error(error.message);
  return data;
};

// Perbarui seluruh halaman publik (ISR, termasuk halaman detail proyek & pencapaian) + PDF CV +
// saran pertanyaan Filo AI + sitemap setelah konten berubah
const refreshSite = () => {
  revalidatePath("/", "layout");
  revalidatePath("/projects/[slug]", "page");
  revalidatePath("/achievements/[id]", "page");
  revalidatePath("/cv/id");
  revalidatePath("/cv/en");
  revalidatePath("/api/chat/suggestions");
  revalidatePath("/sitemap.xml");
};

const bilingual = (v) => {
  const id = (v?.id ?? "").trim();
  return { id, en: (v?.en ?? "").trim() || id };
};
const text = (v) => (typeof v === "string" ? v.trim() : "");
const optional = (v) => text(v) || null;

/** Link opsional: kosong → null, selain http(s) ditolak (mencegah link javascript:/data:) */
function optionalLink(value, label) {
  const raw = text(value);
  if (!raw) return null;
  const url = safeHttpUrl(raw);
  if (!url) throw new Error(`${label} harus berupa link lengkap yang diawali https://`);
  return url;
}

// Path file yang sah: file di bucket (mis. "achievements/xxx.webp") atau file lokal "/..." dari konten awal
const STORAGE_PATH = /^(achievements|projects)\/[\w-]+(\/[\w-]+)*\.[a-z0-9]+$/i;
const LOCAL_PATH = /^\/(?!\/)[\w./-]+$/;
function safePath(value, label) {
  if (!value) return null;
  if (typeof value === "string" && !value.includes("..") && (STORAGE_PATH.test(value) || LOCAL_PATH.test(value))) return value;
  throw new Error(`Path file ${label} tidak valid.`);
}

// Hanya file milik CMS di bucket "media" yang boleh dihapus
async function removeFiles(supabase, paths) {
  const list = paths.filter((p) => typeof p === "string" && STORAGE_PATH.test(p) && !p.includes(".."));
  if (list.length) await supabase.storage.from(MEDIA_BUCKET).remove(list);
}

// Gambar galeri + thumbnail pasangannya ("…-full.webp" → "…-thumb.webp")
const withThumbs = (paths) => paths.flatMap((p) => [p, thumbPathOf(p)]);

const MAX_GALLERY = 8;

/** Galeri proyek: daftar path gambar penuh (urutan = urutan tampil), tiap path harus lolos safePath */
function galleryField(value) {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error("Galeri tidak valid.");
  const paths = [...new Set(value.map((p, i) => safePath(p, `galeri ${i + 1}`)).filter(Boolean))];
  if (paths.length > MAX_GALLERY) throw new Error(`Galeri maksimal ${MAX_GALLERY} gambar.`);
  return paths;
}

// Teks markdown halaman detail (cerita proyek / deskripsi pencapaian)
const MARKDOWN_MAX = 20000;

async function upsertRow(supabase, table, id, values) {
  const query = id ? supabase.from(table).update(values).eq("id", id) : supabase.from(table).insert({ ...values, sort_order: values.sort_order ?? (await nextOrder(supabase, table)) });
  const row = check(await query.select("id").single());
  return row.id;
}

async function nextOrder(supabase, table) {
  const rows = check(await supabase.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1));
  return (rows[0]?.sort_order ?? -1) + 1;
}

async function replaceStack(supabase, joinTable, key, id, technologyIds = []) {
  check(await supabase.from(joinTable).delete().eq(key, id));
  if (technologyIds.length) {
    check(await supabase.from(joinTable).insert(technologyIds.map((technology_id, i) => ({ [key]: id, technology_id, sort_order: i }))));
  }
}

// -----------------------------------------------------------------------------
// Teknologi
// -----------------------------------------------------------------------------
export async function saveTechnology(input) {
  return run(async (supabase) => {
    const name = text(input.name);
    if (!name) throw new Error("Nama teknologi wajib diisi.");
    const icon_path = optional(input.icon_path);
    // Path SVG hanya boleh berisi perintah path & angka (bukan markup/script)
    if (icon_path && (icon_path.length > 20000 || !/^[MmLlHhVvCcSsQqTtAaZz0-9.,\s+-]+$/.test(icon_path))) {
      throw new Error("Path SVG tidak valid. Tempel hanya isi atribut d dari ikon 24×24.");
    }
    const color = optional(input.color);
    if (color && !HEX.test(color)) throw new Error("Warna harus kode hex, mis. #0A6CF5.");
    const id = await upsertRow(supabase, "technologies", input.id, {
      name,
      slug: optional(input.slug),
      icon_path,
      color,
      featured: Boolean(input.featured),
    });
    refreshSite();
    return { id };
  });
}

/** Cari ikon di koleksi Simple Icons (3.000+ logo teknologi) berdasarkan nama / slug */
export async function searchIcons(query) {
  return run(async () => {
    const q = text(query).toLowerCase();
    if (q.length < 2) return { icons: [] };
    const all = Object.values(await import("simple-icons"));
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const nq = norm(q);
    const scored = all
      .filter((i) => i && i.slug && (i.slug.includes(nq) || norm(i.title).includes(nq)))
      .map((i) => ({ i, score: i.slug === nq || norm(i.title) === nq ? 0 : i.slug.startsWith(nq) || norm(i.title).startsWith(nq) ? 1 : 2 }))
      .sort((a, b) => a.score - b.score || a.i.title.length - b.i.title.length)
      .slice(0, 12)
      .map(({ i }) => ({ title: i.title, slug: i.slug, hex: `#${i.hex}`, path: i.path }));
    return { icons: scored };
  });
}

// -----------------------------------------------------------------------------
// Pengalaman
// -----------------------------------------------------------------------------
export async function saveExperience(input) {
  return run(async (supabase) => {
    const role = text(input.role);
    const company = text(input.company);
    if (!role || !company) throw new Error("Posisi dan perusahaan wajib diisi.");
    const id = await upsertRow(supabase, "experiences", input.id, {
      role,
      company,
      period: bilingual(input.period),
      points: (input.points ?? []).map(bilingual).filter((p) => p.id),
      tone: HEX.test(input.tone ?? "") ? input.tone : "#0A6CF5",
      published: Boolean(input.published),
    });
    await replaceStack(supabase, "experience_technologies", "experience_id", id, input.technologyIds);
    refreshSite();
    return { id };
  });
}

// -----------------------------------------------------------------------------
// Pencapaian
// -----------------------------------------------------------------------------
const CATEGORIES = ["competition", "research", "certification"];

export async function saveAchievement(input) {
  return run(async (supabase) => {
    const title = bilingual(input.title);
    if (!title.id) throw new Error("Judul wajib diisi.");
    if (!text(input.provider)) throw new Error("Penyelenggara wajib diisi.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date ?? "")) throw new Error("Tanggal tidak valid.");
    if (!CATEGORIES.includes(input.category)) throw new Error("Kategori tidak valid.");
    const image_path = safePath(input.image_path, "gambar");
    if (!image_path) throw new Error("Gambar sertifikat wajib diisi.");
    const id = await upsertRow(supabase, "achievements", input.id, {
      title,
      provider: text(input.provider),
      date: input.date,
      category: input.category,
      image_path,
      thumb_path: safePath(input.thumb_path, "thumbnail") ?? image_path,
      pdf_path: safePath(input.pdf_path, "PDF"),
      link_url: optionalLink(input.link_url, "Link verifikasi"),
      description: bilingualField(input.description, "Deskripsi", { max: MARKDOWN_MAX, required: false }),
      published: Boolean(input.published),
    });
    // File lama yang diganti / dihapus di form
    await removeFiles(supabase, input.removedPaths ?? []);
    refreshSite();
    return { id };
  });
}

// -----------------------------------------------------------------------------
// Proyek
// -----------------------------------------------------------------------------
// Warna yang sah (dipakai di style inline, jadi jangan menerima teks bebas)
const HEX = /^#[0-9a-f]{6}$/i;

const slugify = (s) =>
  text(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function saveProject(input) {
  return run(async (supabase) => {
    const title = text(input.title);
    if (!title) throw new Error("Judul proyek wajib diisi.");
    const slug = slugify(input.slug || title);
    if (!slug) throw new Error("Slug tidak valid.");
    const embed = text(input.embed_url);
    if (embed && !safeEmbedUrl(embed)) {
      throw new Error("Link embed harus https dari Canva, Figma, Google Docs/Slides, YouTube, atau Vimeo.");
    }
    const cover_path = safePath(input.cover_path, "sampul");
    const gallery = galleryField(input.gallery);
    // Galeri lama dibaca dari database (bukan dari browser) untuk menentukan file yang dibuang
    const previous = input.id ? check(await supabase.from("projects").select("gallery").eq("id", input.id).maybeSingle()) : null;
    const id = await upsertRow(supabase, "projects", input.id, {
      slug,
      title,
      summary: bilingual(input.summary),
      tags: (input.tags ?? []).map(text).filter(Boolean).slice(0, 12),
      embed_url: embed ? safeEmbedUrl(embed) : null,
      link_url: optionalLink(input.link_url, "Link proyek"),
      gradient_from: HEX.test(input.gradient_from) ? input.gradient_from : "#60A5FA",
      gradient_to: HEX.test(input.gradient_to) ? input.gradient_to : "#4F46E5",
      icon: /^[a-z]{2,20}$/.test(input.icon ?? "") ? input.icon : "sparkles",
      cover_path,
      thumb_path: safePath(input.thumb_path, "thumbnail") ?? cover_path,
      role: bilingualField(input.role, "Peran", { max: 120, required: false }),
      period: bilingualField(input.period, "Periode", { max: 60, required: false }),
      story: bilingualField(input.story, "Cerita proyek", { max: MARKDOWN_MAX, required: false }),
      gallery,
      published: Boolean(input.published),
    });
    await replaceStack(supabase, "project_technologies", "project_id", id, input.technologyIds);
    const dropped = (previous?.gallery ?? []).filter((p) => !gallery.includes(p));
    await removeFiles(supabase, [...(input.removedPaths ?? []), ...withThumbs(dropped)]);
    refreshSite();
    return { id };
  });
}

// -----------------------------------------------------------------------------
// Pengaturan Website (tabel site_settings): hero, sorotan, bidang fokus, profil CV
// -----------------------------------------------------------------------------

/** Teks dwibahasa dengan batas panjang (kolom jsonb tidak punya batas sendiri) */
function bilingualField(value, label, { max = 300, required = true } = {}) {
  const v = bilingual(value);
  if (required && !v.id) throw new Error(`${label} wajib diisi.`);
  if (v.id.length > max || v.en.length > max) throw new Error(`${label} maksimal ${max} karakter.`);
  return v;
}

function textField(value, label, { max = 300, required = true } = {}) {
  const v = text(value);
  if (required && !v) throw new Error(`${label} wajib diisi.`);
  if (v.length > max) throw new Error(`${label} maksimal ${max} karakter.`);
  return v;
}

function listField(value, label, { min = 0, max }) {
  if (!Array.isArray(value)) throw new Error(`${label} tidak valid.`);
  if (value.length < min) throw new Error(`${label} minimal ${min} item.`);
  if (value.length > max) throw new Error(`${label} maksimal ${max} item.`);
  return value;
}

function hexField(value, label) {
  const v = text(value);
  if (!HEX.test(v)) throw new Error(`Warna ${label} harus kode hex, mis. #0A6CF5.`);
  return v.toUpperCase();
}

/** Link kontak CV: kosong, https://…, mailto:… atau tel:… */
function contactHref(value, label) {
  const raw = text(value);
  if (!raw) return null;
  if (/^(mailto:|tel:)[^\s<>"']+$/i.test(raw) || (/^https?:\/\/\S+$/i.test(raw) && safeHttpUrl(raw))) return raw;
  throw new Error(`Link kontak "${label}" harus diawali https://, mailto: atau tel:.`);
}

// Validasi + bentuk akhir tiap kunci (field lain yang dikirim browser diabaikan)
const SETTINGS = {
  hero: (v) => ({
    badge: bilingualField(v?.badge, "Label status", { max: 60, required: false }),
    typewriter: listField(v?.typewriter, "Baris typewriter", { min: 1, max: 6 }).map((line, i) =>
      bilingualField(line, `Baris typewriter ${i + 1}`, { max: 40 })
    ),
    intro: bilingualField(v?.intro, "Kalimat perkenalan", { max: 400 }),
  }),
  highlights: (v) =>
    listField(v, "Sorotan", { max: 8 }).map((h, i) => {
      const countOf = h?.countOf === "achievements" ? "achievements" : null;
      return {
        // Widget hitung otomatis: angka diisi dari jumlah pencapaian, nilai hanya cadangan
        value: bilingualField(countOf ? { id: text(h?.value?.id) || "0" } : h?.value, `Nilai sorotan ${i + 1}`, { max: 24 }),
        label: bilingualField(h?.label, `Keterangan sorotan ${i + 1}`, { max: 60 }),
        tone: hexField(h?.tone, `sorotan ${i + 1}`),
        countOf,
      };
    }),
  focus_intro: (v) => ({
    title: bilingualField(v?.title, "Judul section", { max: 40 }),
    subtitle: bilingualField(v?.subtitle, "Teks pengantar", { max: 200, required: false }),
  }),
  focus_areas: (v) =>
    listField(v, "Bidang fokus", { max: 8 }).map((f, i) => {
      if (!FOCUS_ICONS[f?.icon]) throw new Error(`Ikon bidang fokus ${i + 1} tidak dikenal.`);
      return {
        title: bilingualField(f?.title, `Judul bidang fokus ${i + 1}`, { max: 80 }),
        body: bilingualField(f?.body, `Deskripsi bidang fokus ${i + 1}`, { max: 300 }),
        icon: f.icon,
        tone: hexField(f?.tone, `bidang fokus ${i + 1}`),
      };
    }),
  cv_profile: (v) => ({
    headline: bilingualField(v?.headline, "Headline CV", { max: 120 }),
    summary: bilingualField(v?.summary, "Ringkasan CV", { max: 600 }),
    education: {
      school: textField(v?.education?.school, "Nama kampus / sekolah", { max: 120, required: false }),
      major: bilingualField(v?.education?.major, "Jurusan", { max: 120, required: false }),
    },
    publication: {
      title: textField(v?.publication?.title, "Judul publikasi", { max: 400, required: false }),
      authors: textField(v?.publication?.authors, "Penulis publikasi", { max: 300, required: false }),
      venue: bilingualField(v?.publication?.venue, "Tempat terbit", { max: 300, required: false }),
    },
    contacts: listField(v?.contacts, "Kontak CV", { max: 8 }).map((c, i) => {
      const label = bilingualField(c?.label, `Label kontak ${i + 1}`, { max: 30 });
      return { label, value: textField(c?.value, `Isi kontak "${label.id}"`, { max: 120 }), href: contactHref(c?.href, label.id) };
    }),
  }),
};

/** Simpan satu bagian Pengaturan Website (menggantikan isi kunci itu seluruhnya) */
export async function saveSiteSetting(key, value) {
  return run(async (supabase) => {
    const shape = SETTINGS[key];
    if (!shape) throw new Error("Pengaturan tidak dikenal.");
    check(await supabase.from("site_settings").upsert({ key, value: shape(value) }));
    refreshSite();
  });
}

// -----------------------------------------------------------------------------
// Umum: hapus, tampil/sembunyikan, urutan
// -----------------------------------------------------------------------------
export async function deleteItem(table, id) {
  return run(async (supabase) => {
    if (!TABLES.includes(table)) throw new Error("Tabel tidak dikenal.");
    const columns = FILE_COLUMNS[table];
    const row = columns ? check(await supabase.from(table).select(columns.join(",")).eq("id", id).single()) : null;
    check(await supabase.from(table).delete().eq("id", id));
    if (row) await removeFiles(supabase, columns.flatMap((c) => (Array.isArray(row[c]) ? withThumbs(row[c]) : [row[c]])));
    refreshSite();
  });
}

export async function setPublished(table, id, published) {
  return run(async (supabase) => {
    if (!["experiences", "achievements", "projects"].includes(table)) throw new Error("Tabel tidak dikenal.");
    check(await supabase.from(table).update({ published: Boolean(published) }).eq("id", id));
    refreshSite();
  });
}

/** Simpan urutan baru (index dalam array = sort_order) */
export async function reorderItems(table, ids) {
  return run(async (supabase) => {
    if (!TABLES.includes(table)) throw new Error("Tabel tidak dikenal.");
    await Promise.all(ids.map(async (id, i) => check(await supabase.from(table).update({ sort_order: i }).eq("id", id))));
    refreshSite();
  });
}
