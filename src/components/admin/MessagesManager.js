"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCheck, Clock3, Globe, Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import AdminPageHeader from "./AdminPageHeader";
import { useCloseForm, useToast } from "./fields";
import { smallBtn } from "./SortableList";
import { fullDate, timeAgo } from "./time";
import { LIST, MESSAGES, countKey } from "./tokens";
import Sheet from "@/components/ui/Sheet";
import { btn } from "@/components/ui/styles";
import { slideIn, stagger } from "@/lib/motion";
import { deleteMessage, markAllMessagesRead, setMessageRead } from "@/app/admin/actions";

// Warna avatar inisial (palet widget dasbor), dipilih tetap berdasarkan nama pengirim
const TONES = ["#0A6CF5", "#F59E0B", "#8B5CF6", "#12A150", "#F43F5E", "#0EA5E9", "#F97316"];
const toneOf = (name) => TONES[[...name].reduce((n, c) => n + c.codePointAt(0), 0) % TONES.length];

export function Avatar({ name, className = MESSAGES.avatar }) {
  return (
    <span aria-hidden className={`grid place-items-center shrink-0 text-white font-bold uppercase ${className}`} style={{ background: toneOf(name) }}>
      {[...name.trim()][0] ?? "?"}
    </span>
  );
}

/** Cuplikan isi pesan satu baris */
export const preview = (message) => message.replace(/\s+/g, " ").slice(0, 140);

/** Link balas di aplikasi email: subjek "Re: …" + kutipan pesan asli, sapaan sesuai bahasa pengirim */
function replyHref(m) {
  const en = m.lang === "en";
  const subject = `Re: ${m.subject || (en ? "Your message on FiloAlvian.com" : "Pesan Anda di FiloAlvian.com")}`;
  const quote = m.message
    .slice(0, 1500)
    .split("\n")
    .map((l) => `> ${l}`)
    .join("\n");
  const body = `${en ? "Hi" : "Halo"} ${m.name},\n\n\n\n${en ? `On ${fullDate(m.created_at, "en-US")}, ${m.name} wrote:` : `Pada ${fullDate(m.created_at)}, ${m.name} menulis:`}\n${quote}`;
  // Alamat sudah divalidasi saat dikirim; karakter selain huruf/angka/.@+- tetap di-encode agar tidak menjadi parameter mailto
  const to = m.email.replace(/[^\w.@+-]/g, (c) => encodeURIComponent(c));
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function Segmented({ value, onChange, options }) {
  return (
    <div role="group" aria-label="Filter pesan" className="inline-flex p-1 rounded-full bg-surface-2">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={`h-8 px-3.5 rounded-full text-[13px] font-semibold transition-colors ${
            value === key ? "bg-surface text-fg shadow-[0_1px_3px_rgba(0,0,0,0.12)] dark:bg-surface-3" : "text-fg-2 hover:text-fg"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * Inbox pesan dari form kontak website.
 * @param openId  id pesan dari ?id= (link di email notifikasi / dasbor) → langsung dibuka
 */
export default function MessagesManager({ messages, openId = null, limit }) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(() => (messages.some((m) => m.id === openId) ? openId : null));
  const closeDetail = useCloseForm(setSelectedId, Boolean(openId));
  const [busyId, setBusyId] = useState(null);
  // Status dibaca tampil seketika sampai data dari server (router.refresh) tiba
  const [optimistic, setOptimistic] = useState({ base: null, read: {} });
  const isRead = (m) => {
    const local = optimistic.base === messages ? optimistic.read[m.id] : undefined;
    return local ?? Boolean(m.read_at);
  };

  const unread = messages.filter((m) => !isRead(m)).length;
  const list = filter === "unread" ? messages.filter((m) => !isRead(m)) : messages;
  const selected = messages.find((m) => m.id === selectedId) ?? null;

  // Ingat jumlah pesan → skeleton saat kembali ke halaman ini menampilkan jumlah baris yang sama
  useEffect(() => {
    try {
      sessionStorage.setItem(countKey("contact_messages"), String(messages.length));
    } catch {
      // sessionStorage tidak tersedia (mode privat) — skeleton memakai jumlah bawaan
    }
  }, [messages.length]);

  // Pesan yang dibuka lewat ?id= langsung ditandai dibaca
  useEffect(() => {
    const m = messages.find((x) => x.id === openId);
    if (m && !m.read_at) setMessageRead(m.id, true).then((res) => res.ok && router.refresh());
    // Hanya saat halaman pertama dibuka
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRead = async (m, read, { silent = false } = {}) => {
    setOptimistic((o) => ({ base: messages, read: { ...(o.base === messages ? o.read : {}), [m.id]: read } }));
    const res = await setMessageRead(m.id, read);
    if (!res.ok) toast.show(res.error, true);
    else if (!silent) toast.show(read ? "Ditandai sudah dibaca." : "Ditandai belum dibaca.");
    router.refresh();
  };

  const open = (m) => {
    setSelectedId(m.id);
    if (!isRead(m)) setRead(m, true, { silent: true });
  };

  const readAll = async () => {
    setOptimistic({ base: messages, read: Object.fromEntries(messages.map((m) => [m.id, true])) });
    const res = await markAllMessagesRead();
    toast.show(res.ok ? "Semua pesan ditandai sudah dibaca." : res.error, !res.ok);
    router.refresh();
  };

  const remove = async (m) => {
    if (!window.confirm(`Hapus pesan dari "${m.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setBusyId(m.id);
    const res = await deleteMessage(m.id);
    toast.show(res.ok ? "Pesan dihapus." : res.error, !res.ok);
    if (res.ok && selectedId === m.id) closeDetail();
    router.refresh();
    setBusyId(null);
  };

  return (
    <section>
      <AdminPageHeader
        eyebrow={`${messages.length} pesan${unread ? ` · ${unread} belum dibaca` : ""}`}
        title="Pesan"
        description="Pesan dari form kontak website. Salinannya juga dikirim ke email — balas langsung dari aplikasi email."
        actions={
          unread > 0 && (
            <button onClick={readAll} className={btn.secondary}>
              <CheckCheck size={18} /> Tandai semua dibaca
            </button>
          )
        }
      />

      {messages.length > 0 && (
        <div className={MESSAGES.toolbar}>
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              ["all", "Semua"],
              ["unread", `Belum dibaca${unread ? ` (${unread})` : ""}`],
            ]}
          />
          {messages.length >= limit && <span className="text-xs text-fg-3">{limit} pesan terbaru</span>}
        </div>
      )}

      {list.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-semibold text-fg">{messages.length ? "Semua pesan sudah dibaca" : "Belum ada pesan"}</p>
          <p className="mt-1 text-sm text-fg-2">
            {messages.length ? "Tidak ada pesan baru saat ini." : "Pesan yang dikirim pengunjung lewat form kontak website akan muncul di sini."}
          </p>
        </div>
      ) : (
        <motion.ul key={filter} variants={stagger(0.04, 0.05)} initial="hidden" animate="visible" className={LIST.card}>
          {list.map((m) => {
            const read = isRead(m);
            return (
              <motion.li
                key={m.id}
                variants={slideIn}
                className={`group ${LIST.row} transition-colors hover:bg-surface-2/70 ${busyId === m.id ? "opacity-50 pointer-events-none" : ""}`}
              >
                <button onClick={() => open(m)} className="flex-1 min-w-0 flex items-center gap-2.5 md:gap-3 pl-1.5 py-1 text-left">
                  <span aria-hidden className={`${MESSAGES.dot} ${read ? "" : "bg-accent"}`} />
                  <Avatar name={m.name} />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span className={`truncate ${read ? "font-semibold text-fg-2" : "font-bold text-fg"}`}>{m.name}</span>
                      {!read && <span className="sr-only">(belum dibaca)</span>}
                      <span suppressHydrationWarning className="ml-auto shrink-0 text-xs text-fg-3">
                        {timeAgo(m.created_at)}
                      </span>
                    </span>
                    <span className="block text-sm text-fg-2 truncate">
                      {m.subject && <span className={read ? "" : "font-semibold text-fg"}>{m.subject} · </span>}
                      {preview(m.message)}
                    </span>
                  </span>
                </button>
                <div className="flex items-center">
                  <button
                    className={`${smallBtn} hidden sm:grid`}
                    onClick={() => setRead(m, !read)}
                    aria-label={read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                    title={read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                  >
                    {read ? <Mail size={17} /> : <MailOpen size={17} />}
                  </button>
                  <button className={`${smallBtn} hover:text-[#e5484d]`} onClick={() => remove(m)} aria-label="Hapus" title="Hapus">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      )}

      <Sheet open={Boolean(selected)} onClose={closeDetail} title={selected?.subject || "Tanpa subjek"} size="md" bodyClassName="p-0">
        {selected && (
          <>
            <div className="px-5 md:px-6 pb-6 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={selected.name} className="w-12 h-12 rounded-full text-lg" />
                <div className="min-w-0">
                  <p className="font-bold text-fg truncate">{selected.name}</p>
                  <a href={`mailto:${selected.email.replace(/[^\w.@+-]/g, (c) => encodeURIComponent(c))}`} className="block text-sm font-medium text-accent-fg truncate hover:underline">
                    {selected.email}
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-surface-2 text-xs font-semibold text-fg-2">
                  <Clock3 size={13} /> {fullDate(selected.created_at)}
                </span>
                <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-surface-2 text-xs font-semibold text-fg-2">
                  <Globe size={13} /> Website versi {selected.lang === "en" ? "English" : "Indonesia"}
                </span>
              </div>
              <div className="rounded-[1.25rem] bg-surface-2 p-4 text-[15px] leading-relaxed text-fg whitespace-pre-wrap break-words">{selected.message}</div>
            </div>
            <div className="sticky bottom-0 flex items-center gap-2 px-5 md:px-6 py-4 border-t border-separator bg-surface">
              <button
                type="button"
                onClick={() => remove(selected)}
                className="pressable grid place-items-center w-11 h-11 shrink-0 rounded-full bg-surface text-fg ring-1 ring-separator hover:bg-surface-2 hover:text-[#e5484d]"
                aria-label="Hapus pesan"
                title="Hapus pesan"
              >
                <Trash2 size={17} />
              </button>
              <button
                type="button"
                onClick={() => setRead(selected, !isRead(selected))}
                className={`${btn.secondary} h-11 px-4 max-sm:w-11 max-sm:px-0`}
                aria-label={isRead(selected) ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                title={isRead(selected) ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
              >
                {isRead(selected) ? <Mail size={17} /> : <MailOpen size={17} />}
                <span className="max-sm:hidden">{isRead(selected) ? "Tandai belum dibaca" : "Tandai dibaca"}</span>
              </button>
              <a href={replyHref(selected)} className={`${btn.primary} h-11 px-5 ml-auto`}>
                <Reply size={17} /> Balas via email
              </a>
            </div>
          </>
        )}
      </Sheet>
      {toast.node}
    </section>
  );
}
