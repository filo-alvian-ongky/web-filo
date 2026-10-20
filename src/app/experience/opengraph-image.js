import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Pengalaman Profesional | Filo Alvian Ongky";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({ eyebrow: "Pengalaman", title: "Pengalaman Profesional", subtitle: "Professional Experience" });
}
