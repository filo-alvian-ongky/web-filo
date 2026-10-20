import Dashboard from "@/components/admin/Dashboard";
import { ADMIN_NAV } from "@/components/admin/nav";
import { getAdminSession } from "@/lib/supabase/server";
import { profile } from "@/lib/data";

export const metadata = { title: "Dasbor" };

// Kolom judul tiap tabel untuk daftar "Aktivitas terbaru"
const RECENT_COLUMNS = {
  experiences: "id, role, company, updated_at, published",
  achievements: "id, title, updated_at, published",
  projects: "id, title, updated_at, published",
  technologies: "id, name, updated_at",
};
const titleOf = (table, row) =>
  table === "experiences" ? `${row.role} · ${row.company}` : table === "achievements" ? row.title?.id : table === "projects" ? row.title : row.name;

// Sapaan sesuai jam di Indonesia (WIB), bukan zona waktu server
function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Jakarta" }).format(new Date()));
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export default async function Page() {
  const { supabase } = await getAdminSession();
  const sections = ADMIN_NAV.filter((n) => n.table);

  const stats = await Promise.all(
    sections.map(async (n) => {
      const hasDraft = n.table !== "technologies";
      // head: true → hanya menghitung jumlah baris
      const [all, drafts, recent] = await Promise.all([
        supabase.from(n.table).select("id", { count: "exact", head: true }),
        hasDraft ? supabase.from(n.table).select("id", { count: "exact", head: true }).eq("published", false) : Promise.resolve({ count: 0 }),
        supabase.from(n.table).select(RECENT_COLUMNS[n.table]).order("updated_at", { ascending: false }).limit(6),
      ]);
      return {
        href: n.href,
        table: n.table,
        count: all.count ?? 0,
        drafts: drafts.count ?? 0,
        error: all.error?.message ?? recent.error?.message ?? null,
        recent: (recent.data ?? []).map((row) => ({
          id: `${n.table}-${row.id}`,
          href: n.href,
          title: titleOf(n.table, row),
          updatedAt: row.updated_at,
          draft: hasDraft && row.published === false,
        })),
      };
    })
  );

  const activity = stats
    .flatMap((s) => s.recent)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  return (
    <Dashboard
      greeting={`${greeting()}, ${profile.firstName}`}
      stats={stats.map(({ recent, ...s }) => s)}
      activity={activity}
      setupError={stats.find((s) => s.error)?.error ?? null}
    />
  );
}
