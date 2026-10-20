import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Pencapaian & Penghargaan | Filo Alvian Ongky";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({ eyebrow: "Pencapaian", title: "Pencapaian & Penghargaan", subtitle: "Achievements & Awards" });
}
