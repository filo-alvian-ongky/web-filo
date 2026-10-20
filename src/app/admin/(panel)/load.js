import { getAdminSession } from "@/lib/supabase/server";

/**
 * Jalankan beberapa query admin sekaligus (dengan sesi login, jadi draft ikut terbaca).
 * Error query ditampilkan lewat error boundary panel admin.
 */
export async function loadAdmin(...queries) {
  const { supabase } = await getAdminSession();
  const results = await Promise.all(queries.map((q) => q(supabase)));
  return results.map(({ data, error }) => {
    if (error) throw new Error(`Gagal memuat data: ${error.message}. Sudahkah supabase/schema.sql dijalankan?`);
    return data;
  });
}
