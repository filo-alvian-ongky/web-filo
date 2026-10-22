import SettingsManager from "@/components/admin/SettingsManager";
import { settingsView } from "@/lib/content/normalize";
import { loadAdmin } from "../load";

export const metadata = { title: "Pengaturan Website" };

export default async function Page() {
  const [rows] = await loadAdmin((s) => s.from("site_settings").select("key, value, updated_at"));
  // Kunci yang belum tersimpan tampil dengan isi bawaan website (src/lib/data.js)
  return <SettingsManager settings={settingsView(rows)} updatedAt={Object.fromEntries(rows.map((r) => [r.key, r.updated_at]))} />;
}
