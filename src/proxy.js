import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Proxy (dulu "middleware"): memperbarui token login Supabase di cookie.
// - /admin: sekaligus mengarahkan pengunjung yang belum login ke halaman login admin.
// - Halaman publik dalam mode pratinjau (cookie draftMode): sesi admin diperbarui di sini karena
//   Server Component tidak bisa menulis cookie — tanpa ini token kedaluwarsa membuat draft hilang.
export async function proxy(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims(): memperbarui token bila kedaluwarsa & memverifikasi JWT secara lokal
  // (tanpa panggilan jaringan ke Supabase di setiap request)
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const { pathname } = request.nextUrl;
  const protectedAdmin = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  if (!signedIn && protectedAdmin) {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.search = "";
    return NextResponse.redirect(login);
  }
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    // Halaman publik hanya saat mode pratinjau aktif (pengunjung biasa tidak melewati proxy)
    { source: "/((?!admin|api/|_next/|.*\\..*).*)", has: [{ type: "cookie", key: "__prerender_bypass" }] },
  ],
};
