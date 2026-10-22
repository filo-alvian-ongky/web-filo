// Memilih isi CV dari konten CMS: hanya yang TERBARU & TERBAIK, bukan semuanya,
// supaya CV tetap 1 halaman dan langsung menonjolkan hal paling kuat.

import { profile } from "../data";

// Batas jumlah item per bagian CV
export const CV_LIMITS = { experiences: 4, points: 3, awards: 3, certifications: 4, projects: 3, skills: 16 };

// Bobot "terbaik": kategori + kata kunci peringkat + kebaruan
const CATEGORY_WEIGHT = { competition: 3, research: 2.5, certification: 1 };
const RANK_KEYWORDS = [
  [/\b(gold|emas|juara\s*1|first place|winner|champion|pemenang)\b/i, 3],
  [/\b(silver|perak|juara\s*2|second place)\b/i, 2.5],
  [/\b(bronze|perunggu|juara\s*3|third place)\b/i, 2],
  [/\b(finalis|finalist)\b/i, 1.5],
  [/\b(author|penulis|publication|publikasi|oral|presenter|best paper)\b/i, 1.5],
  [/\b(peserta|participant|participation)\b/i, -1.5],
];

const pick = (v, lang) => (v && typeof v === "object" ? v[lang] || v.id : v ?? "");

function achievementScore(a, now) {
  const text = `${a.title.id} ${a.title.en} ${a.provider}`;
  let score = CATEGORY_WEIGHT[a.category] ?? 1;
  for (const [pattern, bonus] of RANK_KEYWORDS) if (pattern.test(text)) score += bonus;
  // Kebaruan: ≤ 1 tahun +1, ≤ 2 tahun +0.5
  const ageDays = (now - new Date(`${a.date}T00:00:00Z`).getTime()) / 86_400_000;
  if (ageDays <= 365) score += 1;
  else if (ageDays <= 730) score += 0.5;
  return score;
}

/**
 * Ambil N item terbaik dari daftar, lalu tampilkan urut dari yang terbaru.
 * Dari satu ajang yang sama (penyelenggara + tanggal sama, mis. Finalis & Peserta) hanya
 * peringkat tertingginya yang diambil, supaya CV tidak berisi pengulangan.
 */
function bestOf(list, limit, now) {
  const bestPerEvent = new Map();
  for (const a of list) {
    const score = achievementScore(a, now);
    const key = `${a.provider.toLowerCase()}|${a.date}`;
    if (!bestPerEvent.has(key) || bestPerEvent.get(key).score < score) bestPerEvent.set(key, { a, score });
  }
  return [...bestPerEvent.values()]
    .sort((x, y) => y.score - x.score || y.a.date.localeCompare(x.a.date))
    .slice(0, limit)
    .map(({ a }) => a)
    .sort((x, y) => y.date.localeCompare(x.date));
}

const monthYear = (iso, lang) =>
  new Intl.DateTimeFormat(lang === "en" ? "en-US" : "id-ID", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

/** Data siap-cetak untuk satu bahasa */
export function buildCv(content, lang, now = Date.now()) {
  const L = (v) => pick(v, lang);
  const { experiences, achievements, projects, technologies, techStack } = content;
  // Headline, ringkasan, pendidikan, publikasi & kontak dari Pengaturan Website → Profil CV
  const { cvProfile } = content.settings;

  const awards = bestOf(achievements.filter((a) => a.category === "competition"), CV_LIMITS.awards, now);
  const certifications = bestOf(achievements.filter((a) => a.category !== "competition"), CV_LIMITS.certifications, now);

  // Ringkasan profil + pencapaian terbaik saat ini (otomatis ikut CMS)
  const top = bestOf(achievements, 1, now)[0];
  const highlight = top
    ? lang === "en"
      ? ` Top achievement: ${L(top.title)} (${top.provider}, ${top.date.slice(0, 4)}).`
      : ` Pencapaian terbaik: ${L(top.title)} (${top.provider}, ${top.date.slice(0, 4)}).`
    : "";

  // Keahlian: teknologi unggulan dulu, lalu yang dipakai di pengalaman & proyek (tanpa duplikat)
  const seen = new Set();
  const skills = [...techStack, ...experiences.flatMap((e) => e.stack), ...projects.flatMap((p) => p.stack), ...technologies]
    .map((t) => t.name)
    .filter((name) => name && !seen.has(name) && seen.add(name))
    .slice(0, CV_LIMITS.skills);

  return {
    lang,
    name: profile.name,
    headline: L(cvProfile.headline),
    summary: L(cvProfile.summary) + highlight,
    contacts: cvProfile.contacts.map((c) => ({ label: L(c.label), value: c.value, href: c.href })),
    experiences: experiences.slice(0, CV_LIMITS.experiences).map((e) => ({
      role: e.role,
      org: e.company,
      date: L(e.period),
      points: e.points.slice(0, CV_LIMITS.points).map(L),
      stack: e.stack.map((s) => s.name),
    })),
    projects: projects.slice(0, CV_LIMITS.projects).map((p) => ({
      name: p.title,
      tags: [...p.tags, ...p.stack.map((s) => s.name)].join(" · "),
      body: L(p.summary),
    })),
    publication: { title: cvProfile.publication.title, authors: cvProfile.publication.authors, venue: L(cvProfile.publication.venue) },
    education: { school: cvProfile.education.school, major: L(cvProfile.education.major) },
    awards: awards.map((a) => ({ title: L(a.title), sub: a.provider, date: monthYear(a.date, lang) })),
    certifications: certifications.map((a) => ({ title: L(a.title), sub: a.provider, date: monthYear(a.date, lang) })),
    skills,
    labels:
      lang === "en"
        ? { profile: "Profile", experience: "Experience", projects: "Projects", publication: "Publication", education: "Education", awards: "Awards", certifications: "Certifications & Research", skills: "Skills", footer: "Full portfolio & certificates: FiloAlvian.com", updated: "Updated" }
        : { profile: "Profil", experience: "Pengalaman", projects: "Proyek", publication: "Publikasi", education: "Pendidikan", awards: "Prestasi", certifications: "Sertifikasi & Riset", skills: "Keahlian", footer: "Portofolio lengkap & sertifikat: FiloAlvian.com", updated: "Diperbarui" },
    updated: new Intl.DateTimeFormat(lang === "en" ? "en-US" : "id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(now)),
  };
}
