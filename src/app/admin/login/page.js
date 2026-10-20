import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import SetupNotice from "@/components/admin/SetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSession } from "@/lib/supabase/server";

export const metadata = { title: "Masuk" };

export default async function LoginPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  const { user, isAdmin, mfaVerified } = await getAdminSession();
  if (user && isAdmin && mfaVerified) redirect("/admin");
  // Sudah lolos password tapi belum verifikasi 2 langkah → form langsung ke langkah kode
  return <LoginForm signedInAs={user && !isAdmin ? user.email : null} needsMfa={Boolean(user && isAdmin)} />;
}
