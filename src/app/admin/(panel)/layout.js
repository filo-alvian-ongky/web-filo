import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import SetupNotice from "@/components/admin/SetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSession } from "@/lib/supabase/server";

// Semua halaman panel butuh login admin + verifikasi 2 langkah (dicek di server pada tiap permintaan,
// tidak hanya di proxy — jadi tetap aman walau proxy dilewati)
export default async function PanelLayout({ children }) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  const { user, isAdmin, mfaVerified } = await getAdminSession();
  if (!user || !isAdmin || !mfaVerified) redirect("/admin/login");
  return <AdminShell email={user.email}>{children}</AdminShell>;
}
