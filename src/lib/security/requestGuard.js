// Pengaman request untuk route API publik (dipakai di server saja).

const buckets = new Map();

/**
 * Pembatas laju sederhana per kunci (mis. IP) dengan jendela waktu tetap.
 * Catatan: tersimpan di memori per instance server — menahan spam dari satu sumber,
 * tapi untuk serangan besar tetap andalkan rate limit di Vercel Firewall.
 */
export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now - entry.start >= windowMs) {
    buckets.set(key, { start: now, count: 1, windowMs });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now - v.start >= v.windowMs) buckets.delete(k);
    }
    return { ok: true };
  }
  entry.count += 1;
  return { ok: entry.count <= limit, retryAfter: Math.ceil((entry.start + windowMs - now) / 1000) };
}

/** IP pengunjung (Vercel mengisi x-forwarded-for / x-real-ip) */
export function clientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}

/**
 * Hanya terima request dari halaman website ini sendiri (bukan dari situs lain / script luar
 * yang mencoba memakai endpoint & kuota API kita).
 */
export function isSameOrigin(req) {
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}
