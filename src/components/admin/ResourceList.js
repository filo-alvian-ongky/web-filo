"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import AdminPageHeader from "./AdminPageHeader";
import PreviewButton from "./PreviewButton";
import SortableList, { smallBtn } from "./SortableList";
import { LIST, countKey } from "./tokens";
import { btn } from "@/components/ui/styles";
import { deleteItem, reorderItems, setPublished } from "@/app/admin/actions";

// Halaman website tempat konten tiap tabel tampil (tujuan tombol Pratinjau)
const PREVIEW_PATH = { experiences: "/experience", achievements: "/achievements", projects: "/projects", technologies: "/" };

/**
 * Daftar konten CMS: urutkan (drag-and-drop / naik-turun), tampil/sembunyikan, edit, hapus.
 * @param describe  (item) => { title, subtitle, media? }
 */
export default function ResourceList({ table, title, description, items, describe, onCreate, onEdit, toast, canPublish = true, createLabel = "Tambah" }) {
  const router = useRouter();
  // Urutan baru tampil seketika sampai data dari server (router.refresh) tiba
  const [optimistic, setOptimistic] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const list = optimistic?.base === items ? optimistic.list : items;
  const drafts = canPublish ? items.filter((i) => !i.published).length : 0;

  // Ingat jumlah item → skeleton saat kembali ke halaman ini menampilkan jumlah baris yang sama
  useEffect(() => {
    try {
      sessionStorage.setItem(countKey(table), String(items.length));
    } catch {
      // sessionStorage tidak tersedia (mode privat) — skeleton memakai jumlah bawaan
    }
  }, [table, items.length]);

  const saveOrder = async (next) => {
    setOptimistic({ base: items, list: next });
    const res = await reorderItems(table, next.map((i) => i.id));
    if (!res.ok) {
      toast.show(res.error, true);
      setOptimistic(null);
    }
    router.refresh();
  };

  const togglePublish = async (item) => {
    setBusyId(item.id);
    const res = await setPublished(table, item.id, !item.published);
    toast.show(res.ok ? (item.published ? "Disembunyikan dari website." : "Ditampilkan di website.") : res.error, !res.ok);
    router.refresh();
    setBusyId(null);
  };

  const remove = async (item) => {
    const { title: name } = describe(item);
    if (!window.confirm(`Hapus "${name}"? File terkait juga ikut dihapus. Tindakan ini tidak bisa dibatalkan.`)) return;
    setBusyId(item.id);
    const res = await deleteItem(table, item.id);
    toast.show(res.ok ? "Terhapus." : res.error, !res.ok);
    router.refresh();
    setBusyId(null);
  };

  return (
    <section>
      <AdminPageHeader
        eyebrow={`${items.length} item${drafts ? ` · ${drafts} draft` : ""}`}
        title={title}
        description={description}
        actions={
          <>
            <PreviewButton path={PREVIEW_PATH[table]} />
            {/* HP: tambah lewat tombol bundar di tab bar. max-md:hidden (bukan hidden md:inline-flex) karena
                kelas inline-flex bawaan btn ditulis setelah .hidden di CSS sehingga selalu menang */}
            <button onClick={onCreate} className={`${btn.primary} max-md:hidden`}>
              <Plus size={18} strokeWidth={2.5} /> {createLabel}
            </button>
          </>
        }
      />

      {list.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-semibold text-fg">Belum ada data</p>
          <p className="mt-1 text-sm text-fg-2">Tambahkan item pertama — langsung tampil di website setelah disimpan.</p>
          <button onClick={onCreate} className={`${btn.tonal} mt-5`}>
            <Plus size={18} strokeWidth={2.5} /> {createLabel}
          </button>
        </div>
      ) : (
        <SortableList
          items={list}
          getKey={(item) => item.id}
          onReorder={saveOrder}
          className={LIST.card}
          rowClassName={(item) =>
            `group ${LIST.row} transition-colors hover:bg-surface-2/70 ${busyId === item.id ? "opacity-50 pointer-events-none" : ""}`
          }
          renderRow={(item) => {
            const d = describe(item);
            const hidden = canPublish && !item.published;
            return (
              <>
                {d.media}
                <button onClick={() => onEdit(item)} className="flex-1 min-w-0 text-left py-1">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className={`font-semibold truncate ${hidden ? "text-fg-3" : "text-fg"}`}>{d.title}</span>
                    {hidden && <span className="shrink-0 inline-flex items-center h-5 px-2 rounded-full bg-surface-3 text-[11px] font-bold text-fg-2">Draft</span>}
                  </span>
                  {d.subtitle && <span className="block text-sm text-fg-2 truncate">{d.subtitle}</span>}
                </button>
                <div className="flex items-center">
                  {canPublish && (
                    <button
                      className={smallBtn}
                      onClick={() => togglePublish(item)}
                      aria-label={item.published ? "Sembunyikan" : "Tampilkan"}
                      title={item.published ? "Sembunyikan dari website" : "Tampilkan di website"}
                    >
                      {item.published ? <Eye size={17} /> : <EyeOff size={17} />}
                    </button>
                  )}
                  <button className={`${smallBtn} hidden sm:grid`} onClick={() => onEdit(item)} aria-label="Edit" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button className={`${smallBtn} hover:text-[#e5484d]`} onClick={() => remove(item)} aria-label="Hapus" title="Hapus">
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            );
          }}
        />
      )}
    </section>
  );
}
