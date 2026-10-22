// Baris info ala daftar One UI: ikon dalam kotak berwarna + label kecil + nilai
export default function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden className="grid place-items-center w-10 h-10 rounded-[14px] bg-accent-soft text-accent-fg shrink-0">
        <Icon size={18} />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-xs font-semibold text-fg-3">{label}</p>
        <p className="text-[15px] font-semibold leading-snug text-fg">{children}</p>
      </div>
    </div>
  );
}

// Judul kecil kelompok info (mis. "Kategori", "Teknologi")
export const infoHeading = "mb-2.5 text-xs font-semibold text-fg-3";
