"use client";

import { useSyncExternalStore } from "react";
import { DASHBOARD, LIST, MEDIA, MEDIA_OF, PAGE_HEADER, SETTINGS, countKey } from "./tokens";

// Skeleton panel admin. Tata letaknya memakai token yang sama dengan komponen aslinya
// (tokens.js), jadi saat halaman berpindah, bentuk placeholder = bentuk konten yang akan muncul.

const Bone = ({ className = "" }) => <span aria-hidden className={`block skeleton ${className}`} />;

// Lebar teks bervariasi (deterministik) agar terlihat seperti daftar sungguhan
const WIDTHS = ["w-3/5", "w-2/5", "w-1/2", "w-2/3", "w-[45%]", "w-[55%]"];
const SUB_WIDTHS = ["w-1/3", "w-1/4", "w-2/5", "w-[30%]"];

const noopSubscribe = () => () => {};

/** Jumlah baris = jumlah item saat halaman ini terakhir dibuka (fallback bila belum pernah) */
function useRememberedCount(table, fallback) {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        const n = Number(sessionStorage.getItem(countKey(table)));
        return Number.isFinite(n) && n > 0 ? Math.min(n, 12) : fallback;
      } catch {
        return fallback;
      }
    },
    () => fallback
  );
}

// Tombol header: [lebar, tampil juga di HP?] — default = Pratinjau (semua layar) + aksi utama (desktop)
const HEADER_ACTIONS = [
  ["w-36", true],
  ["w-48", false],
];

function HeaderSkeleton({ actions = HEADER_ACTIONS }) {
  return (
    <div className={PAGE_HEADER.root}>
      <div className="min-w-0 flex-1">
        <Bone className="h-4 w-24 rounded-full" />
        {/* Tinggi = tinggi baris judul besar (2.25rem / 3rem × leading 1.05) */}
        <Bone className="mt-2 h-[2.36rem] md:h-[3.15rem] w-52 md:w-72 rounded-2xl" />
        <Bone className="mt-3 h-4 w-full max-w-md rounded-full" />
      </div>
      {actions.length > 0 && (
        <div className="flex gap-2 shrink-0">
          {actions.map(([width, mobile], i) => (
            <Bone key={i} className={`${mobile ? "block" : "hidden md:block"} h-12 ${width} rounded-full`} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Skeleton halaman daftar (Pengalaman, Pencapaian, Proyek, Teknologi) */
export function ListSkeleton({ table, fallback = 5, canPublish = true }) {
  const rows = useRememberedCount(table, fallback);
  const media = MEDIA[MEDIA_OF[table]];
  return (
    <section aria-busy="true" aria-label="Memuat data">
      <HeaderSkeleton />
      <div className={LIST.card}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className={LIST.row}>
            {/* Pegangan drag (bukan di HP) + tombol naik / turun */}
            <Bone className="hidden sm:block w-3 h-5 ml-1.5 mr-0.5 shrink-0 rounded-md" />
            <div className="flex flex-col items-center gap-2 w-8 py-0.5">
              <Bone className="w-4 h-4 rounded-md" />
              <Bone className="w-4 h-4 rounded-md" />
            </div>
            <Bone className={`${media} shrink-0`} />
            <div className="flex-1 min-w-0 py-1 space-y-2">
              <Bone className={`h-4 rounded-full ${WIDTHS[i % WIDTHS.length]}`} />
              <Bone className={`h-3 rounded-full ${SUB_WIDTHS[i % SUB_WIDTHS.length]}`} />
            </div>
            {/* Tombol tampil / edit / hapus (edit tersembunyi di HP, sama seperti daftar asli) */}
            <div className="flex items-center gap-1.5">
              {canPublish && <Bone className="w-8 h-8 rounded-full" />}
              <Bone className="hidden sm:block w-8 h-8 rounded-full" />
              <Bone className="w-8 h-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Kartu bagian Pengaturan Website: judul + isi (baris teks atau baris daftar) */
function SettingsCardSkeleton({ rows, list = false }) {
  return (
    <div className={SETTINGS.card}>
      <div className={SETTINGS.head}>
        <div className="flex-1 space-y-2">
          <Bone className="h-5 w-32 rounded-full" />
          <Bone className="h-3.5 w-3/5 max-w-xs rounded-full" />
        </div>
        <Bone className="h-9 w-24 rounded-full shrink-0" />
      </div>
      {list ? (
        Array.from({ length: rows }, (_, i) => (
          <div key={i} className={LIST.row}>
            <Bone className="hidden sm:block w-3 h-5 ml-1.5 mr-0.5 shrink-0 rounded-md" />
            <div className="flex flex-col items-center gap-2 w-8 py-0.5">
              <Bone className="w-4 h-4 rounded-md" />
              <Bone className="w-4 h-4 rounded-md" />
            </div>
            <Bone className={`${MEDIA.tile} shrink-0`} />
            <div className="flex-1 min-w-0 py-1 space-y-2">
              <Bone className={`h-4 rounded-full ${WIDTHS[i % WIDTHS.length]}`} />
              <Bone className={`h-3 rounded-full ${SUB_WIDTHS[i % SUB_WIDTHS.length]}`} />
            </div>
            <div className="flex items-center gap-1.5">
              <Bone className="hidden sm:block w-8 h-8 rounded-full" />
              <Bone className="w-8 h-8 rounded-full" />
            </div>
          </div>
        ))
      ) : (
        <div className={`${SETTINGS.body} space-y-2.5`}>
          {Array.from({ length: rows }, (_, i) => (
            <Bone key={i} className={`h-4 rounded-full ${i === rows - 1 ? "w-2/5" : WIDTHS[(i + 3) % WIDTHS.length]}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Skeleton Pengaturan Website: hero, sorotan, bidang fokus, profil CV */
export function SettingsSkeleton() {
  return (
    <section aria-busy="true" aria-label="Memuat pengaturan">
      <HeaderSkeleton
        actions={[
          ["w-36", true],
          ["w-32", false],
        ]}
      />
      <div className={SETTINGS.stack}>
        <SettingsCardSkeleton rows={3} />
        <SettingsCardSkeleton rows={4} list />
        <SettingsCardSkeleton rows={3} list />
        <SettingsCardSkeleton rows={4} />
      </div>
    </section>
  );
}

/** Skeleton dasbor: widget jumlah konten, tambah cepat, aktivitas terbaru */
export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat dasbor">
      <HeaderSkeleton
        actions={[
          ["w-36", true],
          ["w-44", true],
        ]}
      />
      <div className={DASHBOARD.widgets}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={`card ${DASHBOARD.widget}`}>
            <Bone className={MEDIA.tile} />
            <Bone className="mt-5 h-8 md:h-10 w-12 rounded-xl" />
            <Bone className="mt-2.5 h-3.5 w-20 rounded-full" />
          </div>
        ))}
      </div>
      <div className={DASHBOARD.lower}>
        <div className={`card ${DASHBOARD.quick}`}>
          <div className={DASHBOARD.cardTitle}>
            <Bone className="h-5 w-32 rounded-full" />
          </div>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={DASHBOARD.row}>
              <Bone className="w-9 h-9 rounded-[14px] shrink-0" />
              <Bone className={`h-4 rounded-full ${WIDTHS[i % WIDTHS.length]}`} />
            </div>
          ))}
        </div>
        <div className={`card ${DASHBOARD.activity}`}>
          <div className={DASHBOARD.cardTitle}>
            <Bone className="h-5 w-36 rounded-full" />
          </div>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={DASHBOARD.row}>
              <Bone className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Bone className={`h-4 rounded-full ${WIDTHS[(i + 2) % WIDTHS.length]}`} />
                <Bone className={`h-3 rounded-full ${SUB_WIDTHS[i % SUB_WIDTHS.length]}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
