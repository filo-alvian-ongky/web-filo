import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/**
 * Klien untuk halaman publik: tanpa sesi & tanpa cookie, jadi halaman tetap bisa
 * dibuat statis (ISR). Hanya bisa membaca konten yang dipublikasikan (RLS).
 */
export function createPublicSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Klien dengan sesi login dari cookie — untuk halaman /admin & server action */
export async function createAuthSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Dipanggil dari Server Component (cookie read-only) — sesi diperbarui oleh proxy.js
        }
      },
    },
  });
}

/**
 * User yang sedang login + status admin-nya (di-cache per request: layout, halaman & query
 * dalam satu render memakai hasil yang sama).
 * - Identitas dari getClaims(): tanda tangan JWT diverifikasi di server (kunci publik Supabase
 *   di-cache), jadi tidak perlu bolak-balik ke server Auth di setiap perpindahan halaman.
 * - isAdmin: email terdaftar di tabel admins
 * - mfaVerified: sesi sudah lolos verifikasi 2 langkah (aal2) — wajib untuk masuk panel & mengubah data
 */
export const getAdminSession = cache(async () => {
  const supabase = await createAuthSupabase();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { supabase, user: null, isAdmin: false, mfaVerified: false };
  const { data: admin } = await supabase.from("admins").select("email").maybeSingle();
  return {
    supabase,
    user: { id: claims.sub, email: claims.email },
    isAdmin: Boolean(admin),
    mfaVerified: claims.aal === "aal2",
  };
});
