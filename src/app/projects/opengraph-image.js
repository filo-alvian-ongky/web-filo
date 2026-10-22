import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Karya & Proyek | Filo Alvian Ongky";
export const size = ogSize;
export const contentType = ogContentType;
// Headline di gambar ikut Pengaturan Website → diperbarui bersama halaman (tiap 1 jam / saat disimpan di /admin)
export const revalidate = 3600;

export default function Image() {
  return renderOgImage({ eyebrow: "Proyek", title: "Karya & Proyek", subtitle: "Work & Projects" });
}
