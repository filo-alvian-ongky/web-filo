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

async function upload(folder, name, blob) {
  // Nama unik → tidak pernah menimpa file lama (aman untuk cache CDN)
  const path = `${folder}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}-${slugify(name)}.${extOf(blob.type)}`;
  const { error } = await getBrowserSupabase().storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType: blob.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Upload gagal: ${error.message}`);
  return path;
}

/** Gambar → versi penuh (maks. 2000px) + thumbnail (maks. 900px), keduanya WebP */
export async function uploadImageWithThumb(folder, file, label) {
  const [full, thumb] = await Promise.all([compressImage(file, 2000, 0.86), compressImage(file, 900, 0.8)]);
  const image_path = await upload(folder, `${label}-full`, full);
  const thumb_path = await upload(folder, `${label}-thumb`, thumb);
  return { image_path, thumb_path };
}

export async function uploadPdf(folder, file, label) {
  if (file.type !== "application/pdf") throw new Error("File harus berformat PDF.");
  return upload(folder, label, file);
}

/** Hapus file yang baru di-upload bila penyimpanan data gagal (mencegah file yatim) */
export async function discardUploads(paths) {
  const list = paths.filter((p) => p && !p.startsWith("/") && !/^https?:/.test(p));
  if (list.length) await getBrowserSupabase().storage.from(MEDIA_BUCKET).remove(list);
}
