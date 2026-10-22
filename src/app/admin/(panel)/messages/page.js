import MessagesManager from "@/components/admin/MessagesManager";
import { loadAdmin } from "../load";

export const metadata = { title: "Pesan" };

// Pesan terbaru yang dimuat sekaligus (inbox portfolio jarang sebanyak ini)
const LIMIT = 200;

export default async function Page({ searchParams }) {
  const { id } = await searchParams;
  const [messages] = await loadAdmin((s) =>
    s.from("contact_messages").select("id, name, email, subject, message, lang, created_at, read_at").order("created_at", { ascending: false }).limit(LIMIT)
  );
  // ?id=<uuid> (link di email notifikasi / widget dasbor) → detail pesan langsung terbuka
  return <MessagesManager key={id ?? "list"} messages={messages} openId={typeof id === "string" ? id : null} limit={LIMIT} />;
}
