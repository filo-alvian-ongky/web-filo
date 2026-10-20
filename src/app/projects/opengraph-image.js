import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Karya & Proyek | Filo Alvian Ongky";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({ eyebrow: "Proyek", title: "Karya & Proyek", subtitle: "Work & Projects" });
}
