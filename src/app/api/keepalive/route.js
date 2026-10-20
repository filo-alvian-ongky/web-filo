import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicSupabase } from "@/lib/supabase/server";

// Dipanggil Vercel Cron sekali sehari (lihat vercel.json) agar proyek Supabase gratis
// tidak di-pause karena "tidak aktif" — halaman publik di-cache sehingga jarang menyentuh database.
export const dynamic = "force-dynamic";

export async function GET(req) {
  // Bila CRON_SECRET diisi di Vercel, hanya Vercel Cron (yang mengirim header ini) yang boleh memanggil
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }
  if (!isSupabaseConfigured) return Response.json({ ok: true, supabase: "not-configured" });
  const { error } = await createPublicSupabase().from("technologies").select("id").limit(1);
  if (error) console.error("[keepalive]", error.message);
  return Response.json({ ok: !error }, { status: error ? 503 : 200 });
}
