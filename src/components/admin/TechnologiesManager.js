"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import FormSheet from "./FormSheet";
import ResourceList from "./ResourceList";
import { ColorInput, Field, TextInput, Toggle, inputClass, textareaClass, useCloseForm, useToast } from "./fields";
import TechIcon from "@/components/ui/TechIcon";
import { saveTechnology, searchIcons } from "@/app/admin/actions";

const empty = { name: "", slug: "", icon_path: "", color: "#0A6CF5", featured: false };
const asTech = (t) => ({ name: t.name || "?", icon: t.icon_path, color: t.color });

function IconSearch({ onPick }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const search = async () => {
    setBusy(true);
    setError(null);
    const res = await searchIcons(query);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setResults(res.icons);
    if (!res.icons.length) setError("Ikon tidak ditemukan. Coba nama lain, atau tempel path SVG manual di bawah.");
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
          placeholder="Cari logo, mis. react, figma, laravel"
          className={inputClass}
        />
        <button type="button" onClick={search} disabled={busy || query.trim().length < 2} className="shrink-0 inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-accent-soft text-accent-fg text-sm font-semibold disabled:opacity-50">
          <Search size={16} /> {busy ? "…" : "Cari"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-fg-3">{error}</p>}
      {results.length > 0 && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {results.map((icon) => (
            <button
              key={icon.slug}
              type="button"
              onClick={() => onPick(icon)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-surface-2 hover:ring-2 hover:ring-accent text-center"
            >
              <TechIcon tech={{ name: icon.title, icon: icon.path, color: icon.hex }} className="w-7 h-7" />
              <span className="text-[11px] font-semibold text-fg-2 leading-tight line-clamp-2">{icon.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TechnologiesManager({ technologies, startNew = false }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(() => (startNew ? { ...empty } : null));
  const closeForm = useCloseForm(setForm, startNew);
  const [busy, setBusy] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    setBusy(true);
    const res = await saveTechnology(form);
    setBusy(false);
    if (!res.ok) return toast.show(res.error, true);
    toast.show("Teknologi tersimpan.");
    closeForm();
    router.refresh();
  };

  return (
    <>
      <ResourceList
        table="technologies"
        title="Teknologi"
        description="Dipakai di section Teknologi (Home), pengalaman, dan proyek."
        items={technologies}
        canPublish={false}
        createLabel="Tambah teknologi"
        toast={toast}
        onCreate={() => setForm({ ...empty })}
        onEdit={(t) => setForm({ ...t, color: t.color })}
        describe={(t) => ({
          title: t.name,
          subtitle: t.featured ? "Tampil di Home" : "Hanya di pengalaman / proyek",
          media: (
            <span className="grid place-items-center w-11 h-11 rounded-[14px] bg-surface-2 shrink-0 text-fg">
              <TechIcon tech={asTech(t)} className="w-6 h-6" />
            </span>
          ),
        })}
      />

      <FormSheet open={!!form} onClose={closeForm} title={form?.id ? "Edit teknologi" : "Teknologi baru"} onSubmit={submit} busy={busy}>
        {form && (
          <>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-2">
              <span className="grid place-items-center w-16 h-16 rounded-[1.2rem] bg-surface ring-1 ring-separator text-fg">
                <TechIcon tech={asTech(form)} className="w-9 h-9" />
              </span>
              <div>
                <p className="font-bold text-fg">{form.name || "Nama teknologi"}</p>
                <p className="text-sm text-fg-3">Pratinjau ikon</p>
              </div>
            </div>

            <Field label="Nama">
              <TextInput value={form.name} onChange={(name) => set({ name })} required placeholder="mis. React" />
            </Field>

            <Field label="Ikon dari Simple Icons" hint="Pilih logo dari hasil pencarian: path ikon & warna merek terisi otomatis.">
              <IconSearch onPick={(icon) => set({ slug: icon.slug, icon_path: icon.path, color: icon.hex, name: form.name || icon.title })} />
            </Field>

            <Field label="Warna" hint="Kosongkan agar ikon ikut warna teks (cocok untuk logo hitam seperti Next.js).">
              <ColorInput value={form.color} onChange={(color) => set({ color })} allowEmpty />
            </Field>

            <Field label="Path SVG (lanjutan)" hint="Opsional. Atribut d dari SVG 24×24 bila logo tidak ada di Simple Icons. Kosong = lencana huruf awal.">
              <textarea value={form.icon_path ?? ""} onChange={(e) => set({ icon_path: e.target.value, slug: null })} className={`${textareaClass} font-mono text-xs`} />
            </Field>

            <Toggle label="Tampilkan di Home" hint="Masuk ke section “Teknologi yang Digunakan”." checked={form.featured} onChange={(featured) => set({ featured })} />
          </>
        )}
      </FormSheet>
      {toast.node}
    </>
  );
}
