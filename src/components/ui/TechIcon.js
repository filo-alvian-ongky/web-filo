// Ikon teknologi dari path SVG (Simple Icons / tempelan manual di CMS).
// Tanpa ikon → lencana huruf awal. Warna kosong → ikut warna teks (aman di tema terang & gelap).
export default function TechIcon({ tech, className = "w-4 h-4", colored = true }) {
  const color = colored ? tech.color ?? undefined : undefined;
  if (tech.icon) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={`shrink-0 ${className}`} style={{ color }}>
        <path d={tech.icon} />
      </svg>
    );
  }
  return (
    <span
      aria-hidden
      className={`shrink-0 grid place-items-center rounded-full text-[0.55em] font-extrabold leading-none text-white ${className}`}
      style={{ background: tech.color ?? "var(--fg-3)" }}
    >
      {tech.name.slice(0, 2).toUpperCase()}
    </span>
  );
}
