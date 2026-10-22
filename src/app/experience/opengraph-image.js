import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Pengalaman Profesional | Filo Alvian Ongky";
export const size = ogSize;
export const contentType = ogContentType;
// Headline di gambar ikut Pengaturan Website → diperbarui bersama halaman (tiap 1 jam / saat disimpan di /admin)
export const revalidate = 3600;

export default function Image() {
  return renderOgImage({ eyebrow: "Pengalaman", title: "Pengalaman Profesional", subtitle: "Professional Experience" });
}
