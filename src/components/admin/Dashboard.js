"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight, Clock3, Inbox, Plus } from "lucide-react";
import AdminPageHeader from "./AdminPageHeader";
import { Avatar } from "./MessagesManager";
import { ADMIN_NAV } from "./nav";
import PreviewButton from "./PreviewButton";
import { timeAgo } from "./time";
import { DASHBOARD } from "./tokens";
import Card from "@/components/Card";
import CountUp from "@/components/ui/CountUp";
import { btn } from "@/components/ui/styles";
import { slideIn, stagger } from "@/lib/motion";

const NAV = Object.fromEntries(ADMIN_NAV.map((n) => [n.href, n]));

// Ikon kotak berwarna ala app icon One UI
const Tile = ({ tone, icon: Icon, size = "w-11 h-11", iconSize = 20 }) => (
  <span className={`grid place-items-center ${size} shrink-0 rounded-[14px] text-white`} style={{ background: tone }}>
    <Icon size={iconSize} />
  </span>
);

/** Pesan dari form kontak: jumlah belum dibaca + 3 pesan terbaru (yang belum dibaca ditebalkan) */
function InboxWidget({ inbox }) {
  const nav = NAV["/admin/messages"];
  return (
    <Card className={DASHBOARD.inbox}>
      <Link href={nav.href} className={`group ${DASHBOARD.inboxHead} rounded-[1.1rem]`}>
        <Tile tone={nav.tone} icon={Inbox} />
        <span className="flex-1 min-w-0">
          <span className="block text-lg font-bold text-fg leading-tight">Pesan belum dibaca</span>
          <span className="block text-sm text-fg-2">
            {inbox.unread ? `${inbox.unread} pesan baru dari form kontak` : inbox.latest.length ? "Semua pesan sudah dibaca" : "Belum ada pesan masuk"}
          </span>
        </span>
        {inbox.unread > 0 && (
          <span className="grid place-items-center min-w-8 h-8 px-2.5 rounded-full bg-[#e5484d] text-white text-sm font-bold tabular-nums">
            <CountUp value={inbox.unread} />
          </span>
        )}
        <ChevronRight size={18} className="text-fg-3 transition-transform group-hover:translate-x-0.5" />
      </Link>
      {inbox.latest.length > 0 && (
        <motion.ul variants={stagger(0.05, 0.2)} initial="hidden" animate="visible">
          {inbox.latest.map((m) => (
            <motion.li key={m.id} variants={slideIn}>
              <Link href={`${nav.href}?id=${m.id}`} className={`group ${DASHBOARD.row} transition-colors hover:bg-surface-2 active:bg-surface-3`}>
                <Avatar name={m.name} className="w-9 h-9 rounded-full text-sm" />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className={`truncate ${m.read ? "font-semibold text-fg-2" : "font-bold text-fg"}`}>{m.name}</span>
                    {!m.read && (
                      <>
                        <span aria-hidden className="shrink-0 w-2 h-2 rounded-full bg-accent" />
                        <span className="sr-only">(belum dibaca)</span>
                      </>
                    )}
                  </span>
                  <span className="block text-sm text-fg-2 truncate">
                    {m.subject ? `${m.subject} · ` : ""}
                    {m.preview}
                  </span>
                </span>
                <span suppressHydrationWarning className="shrink-0 text-xs text-fg-3">
                  {timeAgo(m.createdAt)}
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </Card>
  );
}

export default function Dashboard({ greeting, stats, inbox, activity, setupError }) {
  const empty = !setupError && stats.every((s) => !s.count);
  const drafts = stats.reduce((n, s) => n + s.drafts, 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow={greeting}
        title="Dasbor"
        description="Kelola konten portfolio. Setiap perubahan yang disimpan langsung tampil di website."
        actions={
          <>
            <PreviewButton />
            <a href="/" target="_blank" rel="noopener noreferrer" className={btn.secondary}>
              Lihat website <ArrowUpRight size={17} />
            </a>
          </>
        }
      />

      {setupError && (
        <div className="card mb-5 p-5 ring-1 ring-[#e5484d]/30">
          <p className="font-bold text-fg">Tabel CMS belum siap</p>
          <p className="mt-1 text-sm text-fg-2">
            {setupError}. Jalankan isi <code className="font-mono">supabase/schema.sql</code> di Supabase SQL Editor.
          </p>
        </div>
      )}
      {empty && (
        <div className="card mb-5 p-5 bg-accent-soft">
          <p className="font-bold text-fg">Database masih kosong</p>
          <p className="mt-1 text-sm text-fg-2">
            Website sementara menampilkan konten lokal. Jalankan <code className="font-mono">npm run cms:migrate</code> untuk memindahkan konten lama.
          </p>
        </div>
      )}

      {/* Widget jumlah konten */}
      <div className={DASHBOARD.widgets}>
        {stats.map((s) => {
          const nav = NAV[s.href];
          return (
            <Link key={s.href} href={s.href} className="group block">
              <Card className={DASHBOARD.widget}>
                <div className="flex items-start justify-between gap-2">
                  <Tile tone={nav.tone} icon={nav.icon} />
                  <ChevronRight size={18} className="text-fg-3 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className={`${DASHBOARD.number} text-fg`}>
                  <CountUp value={s.count} />
                </p>
                <p className="mt-1.5 text-sm font-semibold text-fg-2">{nav.label}</p>
                {s.drafts > 0 && (
                  <span className="mt-2 self-start inline-flex items-center h-6 px-2.5 rounded-full bg-surface-2 text-[11px] font-bold text-fg-2">{s.drafts} draft</span>
                )}
              </Card>
            </Link>
          );
        })}
      </div>

      {inbox && <InboxWidget inbox={inbox} />}

      <div className={DASHBOARD.lower}>
        {/* Aksi cepat */}
        <Card className={DASHBOARD.quick}>
          <h2 className={`${DASHBOARD.cardTitle} text-lg font-bold text-fg`}>Tambah cepat</h2>
          <motion.ul variants={stagger(0.06, 0.2)} initial="hidden" animate="visible">
            {stats.map((s) => {
              const nav = NAV[s.href];
              return (
                <motion.li key={s.href} variants={slideIn}>
                  <Link href={`${s.href}?new=1`} className={`group ${DASHBOARD.row} transition-colors hover:bg-surface-2 active:bg-surface-3`}>
                    <Tile tone={nav.tone} icon={Plus} size="w-9 h-9" iconSize={18} />
                    <span className="flex-1 font-semibold text-fg">Tambah {nav.noun}</span>
                    <ChevronRight size={18} className="text-fg-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        </Card>

        {/* Aktivitas terbaru */}
        <Card className={DASHBOARD.activity}>
          <div className={`flex items-center justify-between ${DASHBOARD.cardTitle}`}>
            <h2 className="text-lg font-bold text-fg">Terakhir diubah</h2>
            {drafts > 0 && <span className="text-sm font-semibold text-fg-3">{drafts} draft belum tampil</span>}
          </div>
          {activity.length === 0 ? (
            <p className="px-3 pb-4 text-sm text-fg-3">Belum ada aktivitas.</p>
          ) : (
            <motion.ul variants={stagger(0.05, 0.25)} initial="hidden" animate="visible">
              {activity.map((a) => {
                const nav = NAV[a.href];
                const Icon = nav.icon;
                return (
                  <motion.li key={a.id} variants={slideIn}>
                    <Link href={a.href} className={`group ${DASHBOARD.row} transition-colors hover:bg-surface-2 active:bg-surface-3`}>
                      <span className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-surface-2" style={{ color: nav.tone }}>
                        <Icon size={17} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="font-semibold text-fg truncate">{a.title}</span>
                          {a.draft && <span className="shrink-0 inline-flex items-center h-5 px-2 rounded-full bg-surface-3 text-[11px] font-bold text-fg-2">Draft</span>}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-fg-2">
                          {nav.label} · <Clock3 size={13} className="text-fg-3" />
                          <span suppressHydrationWarning>{timeAgo(a.updatedAt)}</span>
                        </span>
                      </span>
                      <ChevronRight size={18} className="text-fg-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </Card>
      </div>
    </div>
  );
}
