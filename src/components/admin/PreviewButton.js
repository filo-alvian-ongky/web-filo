import { Eye } from "lucide-react";
import { btn } from "@/components/ui/styles";

/**
 * Buka website di tab baru dalam mode pratinjau (Next.js draftMode): item draft ikut tampil,
 * hanya untuk admin yang login. Keluar lewat tombol "Keluar" di website.
 * Sengaja <a> biasa (bukan <Link>) agar tidak di-prefetch.
 */
export default function PreviewButton({ path = "/", label = "Pratinjau", className = btn.secondary }) {
  return (
    <a
      href={`/api/preview?path=${encodeURIComponent(path)}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Buka website dengan draft ikut tampil"
      className={className}
    >
      <Eye size={17} /> {label}
    </a>
  );
}
