"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight, Clock3, Plus } from "lucide-react";
import AdminPageHeader from "./AdminPageHeader";
import { ADMIN_NAV } from "./nav";
import Card from "@/components/Card";
import CountUp from "@/components/ui/CountUp";
import { btn } from "@/components/ui/styles";
import { slideIn, stagger } from "@/lib/motion";

const NAV = Object.fromEntries(ADMIN_NAV.map((n) => [n.href, n]));
const rtf = new Intl.RelativeTimeFormat("id", { numeric: "auto" });

function timeAgo(iso) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  return "baru saja";
}

// Ikon kotak berwarna ala app icon One UI
const Tile = ({ tone, icon: Icon, size = "w-11 h-11", iconSize = 20 }) => (
  <span className={`grid place-items-center ${size} shrink-0 rounded-[14px] text-white`} style={{ background: tone }}>
    <Icon size={iconSize} />
  </span>
);

export default function Dashboard({ greeting, stats, activity, setupError }) {
  const empty = !setupError && stats.every((s) => !s.count);
  const drafts = stats.reduce((n, s) => n + s.drafts, 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow={greeting}
        title="Dasbor"
        description="Kelola konten portfolio. Setiap perubahan yang disimpan langsung tampil di website."
        actions={
          <a href="/" target="_blank" rel="noopener noreferrer" className={btn.secondary}>
            Lihat website <ArrowUpRight size={17} />
          </a>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s) => {
          const nav = NAV[s.href];
          return (
            <Link key={s.href} href={s.href} className="group block">
              <Card className="h-full p-4 md:p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Tile tone={nav.tone} icon={nav.icon} />
                  <ChevronRight size={18} className="text-fg-3 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-5 text-[2rem] md:text-[2.5rem] leading-none font-extrabold tracking-tight text-fg">
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

      <div className="mt-3 md:mt-4 grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Aksi cepat */}
        <Card className="lg:col-span-2 p-2 md:p-3">
          <h2 className="px-3 pt-3 pb-2 text-lg font-bold text-fg">Tambah cepat</h2>
          <motion.ul variants={stagger(0.06, 0.2)} initial="hidden" animate="visible">
            {stats.map((s) => {
              const nav = NAV[s.href];
              return (
                <motion.li key={s.href} variants={slideIn}>
                  <Link href={`${s.href}?new=1`} className="group flex items-center gap-3 px-3 py-2.5 rounded-[1.1rem] transition-colors hover:bg-surface-2 active:bg-surface-3">
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
        <Card className="lg:col-span-3 p-2 md:p-3">
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
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
                    <Link href={a.href} className="group flex items-center gap-3 px-3 py-2.5 rounded-[1.1rem] transition-colors hover:bg-surface-2 active:bg-surface-3">
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
