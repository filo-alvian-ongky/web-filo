"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import AdminPageHeader from "./AdminPageHeader";
import { LIST, countKey } from "./tokens";
import { btn } from "@/components/ui/styles";
import { slideIn, stagger } from "@/lib/motion";
import { deleteItem, reorderItems, setPublished } from "@/app/admin/actions";

const smallBtn =
  "pressable grid place-items-center w-9 h-9 rounded-full text-fg-2 hover:text-fg hover:bg-surface-2 disabled:opacity-30 disabled:pointer-events-none";

/**
 * Daftar konten CMS: urutkan (naik/turun), tampil/sembunyikan, edit, hapus.
 * @param describe  (item) => { title, subtitle, media? }
 */
export default function ResourceList({ table, title, description, items, describe, onCreate, onEdit, toast, canPublish = true, createLabel = "Tambah" }) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const list = order ?? items;
  const drafts = canPublish ? items.filter((i) => !i.published).length : 0;

  // Ingat jumlah item → skeleton saat kembali ke halaman ini menampilkan jumlah baris yang sama
  useEffect(() => {
    try {
      sessionStorage.setItem(countKey(table), String(items.length));
    } catch {
      // sessionStorage tidak tersedia (mode privat) — skeleton memakai jumlah bawaan
    }
  }, [table, items.length]);

  const move = async (index, delta) => {
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setOrder(next);
    const res = await reorderItems(table, next.map((i) => i.id));
    if (!res.ok) toast.show(res.error, true);
    router.refresh();
    setOrder(null);
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
          <button onClick={onCreate} className={`${btn.primary} hidden md:inline-flex`}>
            <Plus size={18} strokeWidth={2.5} /> {createLabel}
          </button>
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
        <motion.ol variants={stagger(0.04, 0.15)} initial="hidden" animate="visible" className={LIST.card}>
          {list.map((item, i) => {
            const d = describe(item);
            const hidden = canPublish && !item.published;
            return (
              <motion.li
                key={item.id}
                variants={slideIn}
                className={`group ${LIST.row} transition-colors hover:bg-surface-2/70 ${
                  busyId === item.id ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="flex flex-col">
                  <button className={`${smallBtn} w-8 h-7`} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Naikkan">
                    <ArrowUp size={15} />
                  </button>
                  <button className={`${smallBtn} w-8 h-7`} disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Turunkan">
                    <ArrowDown size={15} />
                  </button>
                </div>
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
              </motion.li>
            );
          })}
        </motion.ol>
      )}
    </section>
  );
}
