import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import SetupNotice from "@/components/admin/SetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSession } from "@/lib/supabase/server";

// Semua halaman panel butuh login admin + verifikasi 2 langkah (dicek di server pada tiap permintaan,
// tidak hanya di proxy — jadi tetap aman walau proxy dilewati)
export default async function PanelLayout({ children }) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  const { supabase, user, isAdmin, mfaVerified } = await getAdminSession();
  if (!user || !isAdmin || !mfaVerified) redirect("/admin/login");
  // Badge menu "Pesan". Tabel belum dibuat (contact.sql belum dijalankan) → error diabaikan, badge 0.
  const { count } = await supabase.from("contact_messages").select("id", { count: "exact", head: true }).is("read_at", null);
  return (
    <AdminShell email={user.email} unread={count ?? 0}>
      {children}
    </AdminShell>
  );
}
