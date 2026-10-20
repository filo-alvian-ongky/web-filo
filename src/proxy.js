import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Proxy (dulu "middleware") khusus /admin: memperbarui token login Supabase di cookie
// dan mengarahkan pengunjung yang belum login ke halaman login admin.
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

  const onLogin = request.nextUrl.pathname.startsWith("/admin/login");
  if (!signedIn && !onLogin) {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.search = "";
    return NextResponse.redirect(login);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
