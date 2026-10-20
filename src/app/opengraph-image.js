import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Portfolio Filo Alvian Ongky - Mahasiswa Ilmu Komputer & Pengembang";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({ eyebrow: "Portfolio", title: "Mahasiswa Ilmu Komputer & Pengembang", subtitle: "Computer Science Student & Developer" });
}
