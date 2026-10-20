"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import FormSheet from "./FormSheet";
import ResourceList from "./ResourceList";
import { MEDIA } from "./tokens";
import { BilingualInput, ColorInput, Field, TechPicker, TextInput, Toggle, linkEn, useCloseForm, useToast } from "./fields";
import { saveExperience } from "@/app/admin/actions";

const empty = () => ({
  role: "",
  company: "",
  period: { id: "", en: "" },
  points: [{ id: "", en: "" }],
  tone: "#0A6CF5",
  published: true,
  technologyIds: [],
});

const fromRow = (row) => ({
  ...row,
  period: linkEn(row.period),
  points: row.points?.length ? row.points.map(linkEn) : [{ id: "", en: "" }],
  technologyIds: [...(row.experience_technologies ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((j) => j.technology_id),
});

export default function ExperiencesManager({ experiences, technologies, startNew = false }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(() => (startNew ? empty() : null));
  const [busy, setBusy] = useState(false);
  const closeForm = useCloseForm(setForm, startNew);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setPoint = (i, value) => set({ points: form.points.map((p, j) => (j === i ? value : p)) });

  const submit = async () => {
    setBusy(true);
    const res = await saveExperience(form);
    setBusy(false);
    if (!res.ok) return toast.show(res.error, true);
    toast.show("Pengalaman tersimpan.");
    closeForm();
    router.refresh();
  };

  return (
    <>
      <ResourceList
        table="experiences"
        title="Pengalaman"
        description="Tampil di halaman Pengalaman, berurutan dari atas."
        items={experiences}
        createLabel="Tambah pengalaman"
        toast={toast}
        onCreate={() => setForm(empty())}
        onEdit={(row) => setForm(fromRow(row))}
        describe={(e) => ({
          title: `${e.role} · ${e.company}`,
          subtitle: e.period?.id,
          media: <span className={`${MEDIA.bar} shrink-0`} style={{ background: e.tone }} />,
        })}
      />

      <FormSheet open={!!form} onClose={closeForm} title={form?.id ? "Edit pengalaman" : "Pengalaman baru"} onSubmit={submit} busy={busy}>
        {form && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Posisi / peran">
                <TextInput value={form.role} onChange={(role) => set({ role })} required placeholder="mis. Coding Instructor" />
              </Field>
              <Field label="Perusahaan / organisasi">
                <TextInput value={form.company} onChange={(company) => set({ company })} required placeholder="mis. KodeKiddo" />
              </Field>
            </div>

            <BilingualInput label="Periode" hint="Teks bebas, mis. “Februari 2026 — Sekarang”." value={form.period} onChange={(period) => set({ period })} required />

            <Field label="Poin pencapaian / tanggung jawab">
              <div className="space-y-3">
                {form.points.map((p, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="mt-3 w-6 shrink-0 text-center text-sm font-bold text-fg-3 tabular-nums">{i + 1}</span>
                    <div className="flex-1">
                      <BilingualInput label="" value={p} onChange={(v) => setPoint(i, v)} multiline />
                    </div>
                    <button
                      type="button"
                      onClick={() => set({ points: form.points.filter((_, j) => j !== i) })}
                      className="mt-1.5 grid place-items-center w-9 h-9 rounded-full text-fg-3 hover:text-[#e5484d] hover:bg-surface-2"
                      aria-label="Hapus poin"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => set({ points: [...form.points, { id: "", en: "" }] })} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-surface-2 text-sm font-semibold text-fg">
                  <Plus size={15} /> Tambah poin
                </button>
              </div>
            </Field>

            <Field label="Teknologi yang dipakai" hint="Urutan tampil mengikuti urutan dipilih.">
              <TechPicker technologies={technologies} value={form.technologyIds} onChange={(technologyIds) => set({ technologyIds })} />
            </Field>

            <Field label="Warna aksen" hint="Warna ikon & garis waktu.">
              <ColorInput value={form.tone} onChange={(tone) => set({ tone })} />
            </Field>

            <Toggle label="Tampilkan di website" checked={form.published} onChange={(published) => set({ published })} />
          </>
        )}
      </FormSheet>
      {toast.node}
    </>
  );
}
