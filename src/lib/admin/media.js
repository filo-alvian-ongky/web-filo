"use client";

// Pengolahan & upload file CMS langsung dari browser ke Supabase Storage
// (tanpa lewat server Next.js, jadi tidak terkena batas ukuran request serverless).

import { getBrowserSupabase } from "../supabase/browser";
import { MEDIA_BUCKET } from "../supabase/config";

/**
 * Perkecil gambar & konversi ke WebP (fallback JPEG bila browser tidak bisa encode WebP).
 * @param maxSize  sisi terpanjang maksimum (px)
 */
export async function compressImage(file, maxSize, quality) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const encode = (type) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  let blob = await encode("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg");
  return blob;
}

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "file";

const extOf = (type) => ({ "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "application/pdf": "pdf" })[type] ?? "bin";

// Nama unik → tidak pernah menimpa file lama (aman untuk cache CDN)
const uniqueName = (folder, label) => `${folder}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}-${slugify(label)}`;

async function upload(name, blob) {
  const path = `${name}.${extOf(blob.type)}`;
  const { error } = await getBrowserSupabase().storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType: blob.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Upload gagal: ${error.message}`);
  return path;
}

/**
 * Gambar → versi penuh (maks. 2000px) + thumbnail (maks. 900px), keduanya WebP.
 * Keduanya bernama sama dengan akhiran -full / -thumb, jadi path thumbnail bisa diturunkan dari
 * path gambar penuh (thumbPathOf) — dipakai galeri proyek yang hanya menyimpan path gambar penuh.
 */
export async function uploadImageWithThumb(folder, file, label) {
  const [full, thumb] = await Promise.all([compressImage(file, 2000, 0.86), compressImage(file, 900, 0.8)]);
  const name = uniqueName(folder, label);
  const image_path = await upload(`${name}-full`, full);
  const thumb_path = await upload(`${name}-thumb`, thumb);
  return { image_path, thumb_path };
}

export async function uploadPdf(folder, file, label) {
  if (file.type !== "application/pdf") throw new Error("File harus berformat PDF.");
  return upload(uniqueName(folder, label), file);
}

/** Hapus file yang baru di-upload bila penyimpanan data gagal (mencegah file yatim) */
export async function discardUploads(paths) {
  const list = paths.filter((p) => p && !p.startsWith("/") && !/^https?:/.test(p));
  if (list.length) await getBrowserSupabase().storage.from(MEDIA_BUCKET).remove(list);
}
