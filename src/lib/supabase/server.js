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
 * User yang sedang login + status admin-nya.
 * - isAdmin: email terdaftar di tabel admins
 * - mfaVerified: sesi sudah lolos verifikasi 2 langkah (AAL2) — wajib untuk masuk panel & mengubah data
 */
export async function getAdminSession() {
  const supabase = await createAuthSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false, mfaVerified: false };
  const [{ data: admin }, { data: aal }] = await Promise.all([
    supabase.from("admins").select("email").maybeSingle(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  return { supabase, user, isAdmin: Boolean(admin), mfaVerified: aal?.currentLevel === "aal2" };
}
