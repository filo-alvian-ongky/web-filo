"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { Check, FileText, ImagePlus, Trash2, Upload } from "lucide-react";
import TechIcon from "@/components/ui/TechIcon";
import SortableList, { smallBtn } from "./SortableList";
import { LIST } from "./tokens";
import { mediaUrl, thumbPathOf } from "@/lib/supabase/config";

// Pembaca markdown hanya dimuat saat tab Pratinjau dibuka
const Markdown = dynamic(() => import("@/components/ui/Markdown"));

export const inputClass =
  "w-full h-11 px-3.5 rounded-xl bg-surface-2 text-fg text-[15px] ring-1 ring-transparent outline-none transition-shadow placeholder:text-fg-3 focus:ring-2 focus:ring-accent";
export const textareaClass = `${inputClass} h-auto min-h-[5.5rem] py-2.5 leading-relaxed resize-y`;

export function Field({ label, hint, children, className = "" }) {
  return (
    <div className={`block ${className}`}>
      {label && <span className="block text-[13px] font-semibold text-fg-2 mb-1.5">{label}</span>}
      {children}
      {hint && <span className="block mt-1.5 text-xs text-fg-3 leading-snug">{hint}</span>}
    </div>
  );
}

export function TextInput({ value, onChange, ...rest }) {
  return <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass} {...rest} />;
}

/**
 * Siapkan teks dwibahasa untuk form: bila EN sama persis dengan ID, kolom EN dikosongkan
 * sehingga otomatis mengikuti teks ID saat ID diubah (server mengisi EN = ID saat disimpan).
 */
export const linkEn = (v) => {
  const id = v?.id ?? "";
  const en = v?.en ?? "";
  return { id, en: en && en !== id ? en : "" };
};

/** Input dwibahasa: kolom Indonesia & English berdampingan. EN kosong = memakai teks ID. */
export function BilingualInput({ label, hint, value, onChange, multiline = false, required = false }) {
  const v = value ?? { id: "", en: "" };
  const Tag = multiline ? "textarea" : "input";
  const cls = multiline ? textareaClass : inputClass;
  return (
    <Field label={label} hint={hint}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {["id", "en"].map((lang) => (
          <div key={lang} className="relative">
            <span className="absolute top-2.5 right-3 text-[10px] font-bold uppercase text-fg-3 pointer-events-none">{lang}</span>
            <Tag
              value={v[lang] ?? ""}
              onChange={(e) => onChange({ ...v, [lang]: e.target.value })}
              required={required && lang === "id"}
              placeholder={lang === "en" ? (v.id ? `Sama dengan ID: ${v.id}` : "Opsional — kosong = sama dengan ID") : undefined}
              className={`${cls} pr-10`}
            />
          </div>
        ))}
      </div>
    </Field>
  );
}

/** Pilihan kecil berbentuk pil (mis. ID / EN, Tulis / Pratinjau) */
function Pills({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="inline-flex p-0.5 rounded-full bg-surface-3/70 dark:bg-surface">
      {options.map(([key, text]) => (
        <button
          key={String(key)}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={`h-7 px-3 rounded-full text-xs font-semibold transition-colors ${
            value === key ? "bg-surface text-fg shadow-[0_1px_3px_rgba(0,0,0,0.12)] dark:bg-surface-3" : "text-fg-2 hover:text-fg"
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

const MARKDOWN_HINT = "Format: ## Subjudul, **tebal**, *miring*, - daftar, 1. langkah, > kutipan, [teks](https://…). HTML tidak didukung.";

/**
 * Teks markdown dwibahasa untuk halaman detail (cerita proyek / deskripsi pencapaian):
 * tab ID / EN + pratinjau tampilan seperti di website. EN kosong = memakai teks ID.
 */
export function MarkdownInput({ label, hint = MARKDOWN_HINT, value, onChange, placeholder }) {
  const v = value ?? { id: "", en: "" };
  const [lang, setLang] = useState("id");
  const [preview, setPreview] = useState(false);
  const shown = lang === "en" ? v.en || v.id : v.id;
  return (
    <Field label={label} hint={hint}>
      <div className="rounded-xl bg-surface-2 ring-1 ring-transparent transition-shadow focus-within:ring-2 focus-within:ring-accent overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-2">
          <Pills
            label="Bahasa"
            options={[
              ["id", "Indonesia"],
              ["en", v.en ? "English" : "English · ikut ID"],
            ]}
            value={lang}
            onChange={setLang}
          />
          <Pills
            label="Mode"
            options={[
              [false, "Tulis"],
              [true, "Pratinjau"],
            ]}
            value={preview}
            onChange={setPreview}
          />
        </div>
        {preview ? (
          <div className="min-h-[14rem] max-h-[28rem] overflow-y-auto px-3.5 py-3">
            {shown.trim() ? <Markdown>{shown}</Markdown> : <p className="text-sm text-fg-3">Belum ada teks.</p>}
          </div>
        ) : (
          <textarea
            value={v[lang] ?? ""}
            onChange={(e) => onChange({ ...v, [lang]: e.target.value })}
            rows={10}
            aria-label={`${label} (${lang.toUpperCase()})`}
            placeholder={lang === "en" ? "Opsional — kosong = sama dengan teks Indonesia" : placeholder}
            className="block w-full min-h-[14rem] px-3.5 py-3 bg-transparent text-fg text-[15px] leading-relaxed outline-none focus-visible:outline-none resize-y placeholder:text-fg-3"
          />
        )}
      </div>
    </Field>
  );
}

/** Pratinjau gambar galeri: file baru (object URL) atau thumbnail yang sudah tersimpan */
function GalleryThumb({ item }) {
  const local = useMemo(() => (item.file ? URL.createObjectURL(item.file) : null), [item.file]);
  useEffect(() => () => local && URL.revokeObjectURL(local), [local]);
  const src = local ?? mediaUrl(thumbPathOf(item.path) ?? item.path);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" draggable={false} className="w-20 h-14 rounded-[10px] object-cover bg-surface-3 shrink-0" />;
}

/** Item galeri form: { key, path } (gambar tersimpan) atau { key, file } (baru, di-upload saat disimpan) */
export const galleryItems = (paths) => (paths ?? []).map((path) => ({ key: path, path }));

/**
 * Galeri multi-gambar: tambah beberapa sekaligus, hapus, dan urutkan (geser / tahan lalu geser / tombol naik-turun).
 * Gambar baru baru di-upload saat form disimpan; gambar tersimpan yang dihapus dibuang server saat disimpan.
 */
export function GalleryPicker({ items, onChange, max = 8 }) {
  const add = (files) => {
    const fresh = [...files]
      .filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type))
      .slice(0, Math.max(0, max - items.length))
      .map((file) => ({ key: `new-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, file }));
    if (fresh.length) onChange([...items, ...fresh]);
  };
  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <SortableList
          items={items}
          getKey={(item) => item.key}
          onReorder={onChange}
          className="rounded-2xl bg-surface-2 p-1.5 space-y-0.5"
          rowClassName={() => LIST.row}
          renderRow={(item, i) => (
            <>
              <GalleryThumb item={item} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-fg">Gambar {i + 1}</p>
                <p className="text-xs text-fg-3 truncate">{item.file ? `Baru · ${item.file.name}` : "Tersimpan"}</p>
              </div>
              <button
                type="button"
                onClick={() => onChange(items.filter((x) => x.key !== item.key))}
                aria-label={`Hapus gambar ${i + 1}`}
                className={`${smallBtn} hover:text-[#e5484d]`}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        />
      )}
      {items.length < max ? (
        <label className="flex items-center justify-center gap-2 h-16 rounded-2xl bg-surface-2 ring-1 ring-separator text-sm font-semibold text-fg-2 cursor-pointer hover:text-fg">
          <ImagePlus size={18} /> Tambah gambar ({items.length}/{max})
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              add(e.target.files ?? []);
              e.target.value = "";
            }}
            className="sr-only"
          />
        </label>
      ) : (
        <p className="text-xs text-fg-3">Galeri penuh ({max} gambar). Hapus salah satu untuk menambah.</p>
      )}
    </div>
  );
}

export function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-surface-2 cursor-pointer">
      <span>
        <span className="block text-[15px] font-semibold text-fg">{label}</span>
        {hint && <span className="block text-xs text-fg-3 mt-0.5">{hint}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative shrink-0 w-12 h-7 rounded-full bg-surface-3 transition-colors peer-checked:bg-success peer-focus-visible:ring-2 peer-focus-visible:ring-accent after:absolute after:top-0.5 after:left-0.5 after:w-6 after:h-6 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  );
}

export function ColorInput({ value, onChange, allowEmpty = false, emptyLabel = "Ikut warna teks" }) {
  const hex = value || "#0A6CF5";
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="w-11 h-11 shrink-0 rounded-xl bg-surface-2 p-1 cursor-pointer"
        aria-label="Pilih warna"
      />
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value.trim() || (allowEmpty ? null : hex))}
        placeholder={allowEmpty ? emptyLabel : "#0A6CF5"}
        className={`${inputClass} font-mono uppercase`}
      />
      {allowEmpty && value && (
        <button type="button" onClick={() => onChange(null)} className="shrink-0 h-11 px-3 rounded-xl bg-surface-2 text-sm font-semibold text-fg-2">
          Reset
        </button>
      )}
    </div>
  );
}

/** Pilih teknologi (urutan = urutan dipilih) */
export function TechPicker({ technologies, value, onChange }) {
  const selected = value ?? [];
  const toggle = (id) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  if (!technologies.length) return <p className="text-sm text-fg-3">Belum ada teknologi. Tambahkan dulu di menu Teknologi.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {technologies.map((t) => {
        const on = selected.includes(t.id);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id)}
            aria-pressed={on}
            className={`inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3 rounded-full text-[13px] font-semibold ring-1 transition-colors ${
              on ? "bg-accent-soft text-accent-fg ring-accent/40" : "bg-surface-2 text-fg-2 ring-transparent hover:text-fg"
            }`}
          >
            {on ? <Check size={14} strokeWidth={3} /> : <TechIcon tech={{ name: t.name, icon: t.icon_path, color: t.color }} className="w-3.5 h-3.5" />}
            {t.name}
            {on && <span className="text-[11px] text-accent-fg/70 tabular-nums">#{selected.indexOf(t.id) + 1}</span>}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Pilih gambar: pratinjau langsung (belum di-upload). File baru diproses & di-upload saat disimpan.
 * @param currentUrl  URL gambar yang sudah tersimpan
 * @param file        File baru yang dipilih (atau null)
 */
export function ImagePicker({ currentUrl, file, onFile, onRemove, aspect = "aspect-[1.414]", required = false }) {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  const shown = preview ?? currentUrl;
  return (
    <div className="space-y-2 max-w-md">
      <label className={`relative grid place-items-center ${aspect} w-full rounded-2xl overflow-hidden bg-surface-2 ring-1 ring-separator cursor-pointer group`}>
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="Pratinjau" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-fg-3 text-sm font-semibold">
            <ImagePlus size={28} /> Pilih gambar (JPG, PNG, WebP)
          </span>
        )}
        {shown && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 h-8 px-3 rounded-full glass text-xs font-semibold text-fg opacity-90 group-hover:opacity-100">
            <Upload size={13} /> Ganti
          </span>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={required && !shown}
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          className="sr-only"
        />
      </label>
      {shown && onRemove && (
        <button type="button" onClick={onRemove} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#e5484d]">
          <Trash2 size={14} /> Hapus gambar
        </button>
      )}
    </div>
  );
}

export function PdfPicker({ currentUrl, file, onFile, onRemove }) {
  const name = file?.name ?? (currentUrl ? decodeURIComponent(currentUrl.split("/").pop()) : null);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-surface-2 text-sm font-semibold text-fg cursor-pointer">
        <FileText size={16} /> {name ? "Ganti PDF" : "Pilih PDF"}
        <input type="file" accept="application/pdf" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} className="sr-only" />
      </label>
      {name && (
        <>
          <span className="text-sm text-fg-2 truncate max-w-[16rem]">{name}</span>
          <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-sm font-semibold text-[#e5484d]">
            <Trash2 size={14} /> Hapus
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Tutup form. Bila form dibuka lewat ?new=1 (tombol "+" / aksi cepat dasbor),
 * parameter itu dihapus dari URL supaya form tidak terbuka lagi saat halaman dimuat ulang.
 */
export function useCloseForm(setForm, startedFromUrl) {
  const router = useRouter();
  const pathname = usePathname();
  return () => {
    setForm(null);
    if (startedFromUrl) router.replace(pathname, { scroll: false });
  };
}

/** Pesan status singkat di pojok bawah */
export function useToast() {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);
  const node = toast ? (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] max-w-[90vw] px-4 py-3 rounded-2xl shadow-float text-sm font-semibold text-white ${
        toast.error ? "bg-[#e5484d]" : "bg-fg text-bg"
      }`}
      style={toast.error ? undefined : { color: "var(--bg)" }}
    >
      {toast.message}
    </div>
  ) : null;
  return { show: (message, error = false) => setToast({ message, error, at: Date.now() }), node };
}
