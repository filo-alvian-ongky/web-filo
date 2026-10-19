// Logo website (bintang "AFO") dari public/logo.svg — versi bersih dari src/app/icon.svg.
// Ditampilkan lewat CSS mask sehingga warnanya mengikuti `color` (currentColor):
// hitam di tema terang, putih di tema gelap, atau warna lain lewat class text-*.

export const LOGO_SRC = "/logo.svg";

export default function BrandLogo({ className = "", title }) {
  return (
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        WebkitMask: `url(${LOGO_SRC}) center / contain no-repeat`,
        mask: `url(${LOGO_SRC}) center / contain no-repeat`,
      }}
    />
  );
}
