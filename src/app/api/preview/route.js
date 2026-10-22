import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/supabase/server";

// Mode pratinjau (Next.js draftMode) untuk admin: halaman publik dirender per request dan
// ikut menampilkan item draft (lihat getContent di src/lib/content/server.js).
// Pengunjung biasa tidak terpengaruh — halaman mereka tetap statis (ISR).

/** Hanya path internal website (bukan /admin, /api, "//domain-lain", dll.) → cegah open redirect */
function safePath(value) {
  return typeof value === "string" && /^\/(?!\/|admin|api\/)[\w\-/]*$/.test(value) ? value : "/";
}

/** GET /api/preview?path=/projects — aktifkan pratinjau lalu buka halamannya (khusus admin + 2FA) */
export async function GET(request) {
  const { user, isAdmin, mfaVerified } = await getAdminSession();
  if (!user || !isAdmin || !mfaVerified) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  (await draftMode()).enable();
  const path = safePath(request.nextUrl.searchParams.get("path"));
  return NextResponse.redirect(new URL(path, request.url), { headers: { "Cache-Control": "private, no-store" } });
}

/** POST (form "Keluar pratinjau" di website) — matikan pratinjau, kembali ke halaman yang sama */
export async function POST(request) {
  (await draftMode()).disable();
  const form = await request.formData().catch(() => null);
  // 303: browser membuka halaman tujuan dengan GET (bukan mengulang POST)
  return NextResponse.redirect(new URL(safePath(form?.get("path")), request.url), 303);
}
