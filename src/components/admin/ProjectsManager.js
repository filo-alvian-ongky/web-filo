"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormSheet from "./FormSheet";
import ResourceList from "./ResourceList";
import { MEDIA } from "./tokens";
import {
  BilingualInput,
  ColorInput,
  Field,
  GalleryPicker,
  ImagePicker,
  MarkdownInput,
  TechPicker,
  TextInput,
  Toggle,
  galleryItems,
  linkEn,
  useCloseForm,
  useToast,
} from "./fields";
import ProjectArt, { PROJECT_ICONS } from "@/components/ui/ProjectArt";
import { saveProject } from "@/app/admin/actions";
import { mediaUrl } from "@/lib/supabase/config";
import { discardUploads, uploadImageWithThumb } from "@/lib/admin/media";

const empty = () => ({
  title: "",
  slug: "",
  summary: { id: "", en: "" },
  tags: [],
  embed_url: "",
  link_url: "",
  gradient_from: "#60A5FA",
  gradient_to: "#4F46E5",
  icon: "sparkles",
  cover_path: null,
  thumb_path: null,
  role: { id: "", en: "" },
  period: { id: "", en: "" },
  story: { id: "", en: "" },
  gallery: [],
  published: true,
  technologyIds: [],
});

const fromRow = (row) => ({
  ...row,
  summary: linkEn(row.summary),
  role: linkEn(row.role),
  period: linkEn(row.period),
  story: linkEn(row.story),
  embed_url: row.embed_url ?? "",
  link_url: row.link_url ?? "",
  technologyIds: [...(row.project_technologies ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((j) => j.technology_id),
});

// Kerangka awal cerita proyek (placeholder): masalah → peran → proses → hasil
const STORY_TEMPLATE = "## Masalah\nApa yang ingin diselesaikan?\n\n## Peran Saya\n…\n\n## Proses\n- …\n\n## Hasil\n…";

const MAX_GALLERY = 8;

const gradientOf = (p) => `linear-gradient(135deg, ${p.gradient_from} 0%, ${p.gradient_to} 100%)`;

export default function ProjectsManager({ projects, technologies, startNew = false }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(() => (startNew ? empty() : null));
  const closeForm = useCloseForm(setForm, startNew);
  const [tagsText, setTagsText] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  // Galeri form: { key, path } tersimpan / { key, file } baru
  const [gallery, setGallery] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const open = (value) => {
    setForm(value);
    setTagsText(value.tags.join(", "));
    setCoverFile(null);
    setGallery(galleryItems(value.gallery));
  };

  const submit = async () => {
    setBusy(true);
    const uploaded = [];
    const removedPaths = [...(form.removedPaths ?? [])];
    try {
      const values = { ...form, tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean) };
      if (coverFile) {
        setStatus("Mengompres & meng-upload sampul…");
        const { image_path, thumb_path } = await uploadImageWithThumb("projects", coverFile, form.slug || form.title || "proyek");
        uploaded.push(image_path, thumb_path);
        removedPaths.push(form.cover_path, form.thumb_path);
        Object.assign(values, { cover_path: image_path, thumb_path });
      }
      // Gambar galeri baru di-upload berurutan; galeri lama yang dihapus dibuang server saat disimpan
      const fresh = gallery.filter((g) => g.file).length;
      let done = 0;
      values.gallery = [];
      for (const item of gallery) {
        if (item.path) {
          values.gallery.push(item.path);
          continue;
        }
        done += 1;
        setStatus(`Mengompres & meng-upload galeri ${done}/${fresh}…`);
        const { image_path, thumb_path } = await uploadImageWithThumb("projects", item.file, `${form.slug || form.title || "proyek"}-galeri`);
        uploaded.push(image_path, thumb_path);
        values.gallery.push(image_path);
      }
      setStatus("Menyimpan…");
      const res = await saveProject({ ...values, removedPaths: removedPaths.filter(Boolean) });
      if (!res.ok) throw new Error(res.error);
      toast.show("Proyek tersimpan.");
      closeForm();
      router.refresh();
    } catch (error) {
      await discardUploads(uploaded).catch(() => {});
      toast.show(error.message, true);
    } finally {
      setBusy(false);
      setStatus(null);
    }
  };

  const coverUrl = form ? mediaUrl(form.cover_path) : null;

  return (
    <>
      <ResourceList
        table="projects"
        title="Proyek"
        description="Tampil di halaman Proyek."
        items={projects}
        createLabel="Tambah proyek"
        toast={toast}
        onCreate={() => open(empty())}
        onEdit={(row) => open(fromRow(row))}
        describe={(p) => ({
          title: p.title,
          subtitle: p.summary?.id,
          media: p.cover_path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(p.thumb_path ?? p.cover_path)} alt="" className={`${MEDIA.thumb} object-cover shrink-0`} />
          ) : (
            <span className={`grid place-items-center ${MEDIA.thumb} shrink-0`} style={{ background: gradientOf(p) }}>
              <ProjectArt icon={p.icon} size={22} />
            </span>
          ),
        })}
      />

      <FormSheet open={!!form} onClose={closeForm} title={form?.id ? "Edit proyek" : "Proyek baru"} onSubmit={submit} busy={busy} status={status}>
        {form && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Judul">
                <TextInput value={form.title} onChange={(title) => set({ title })} required placeholder="mis. FruitSense App" />
              </Field>
              <Field label="Slug (URL)" hint="Kosong = dibuat otomatis dari judul.">
                <TextInput value={form.slug} onChange={(slug) => set({ slug })} placeholder="fruitsense" />
              </Field>
            </div>

            <BilingualInput label="Ringkasan" value={form.summary} onChange={(summary) => set({ summary })} multiline required />

            <BilingualInput label="Peran (opsional)" hint="Tampil di halaman detail, mis. Team Leader & UI/UX Designer." value={form.role} onChange={(role) => set({ role })} />
            <BilingualInput label="Periode (opsional)" hint="mis. Sep 2025 — Jan 2026." value={form.period} onChange={(period) => set({ period })} />

            <Field label="Tag kategori" hint="Pisahkan dengan koma, mis. AI & Mobile, Machine Learning.">
              <TextInput value={tagsText} onChange={setTagsText} />
            </Field>

            <Field label="Teknologi yang dipakai" hint="Urutan tampil mengikuti urutan dipilih.">
              <TechPicker technologies={technologies} value={form.technologyIds} onChange={(technologyIds) => set({ technologyIds })} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Link embed presentasi" hint="Canva: Bagikan → Sematkan → salin link (berakhiran ?embed).">
                <TextInput type="url" value={form.embed_url} onChange={(embed_url) => set({ embed_url })} placeholder="https://www.canva.com/design/…/view?embed" />
              </Field>
              <Field label="Link proyek (opsional)" hint="Demo, GitHub, Figma, dll.">
                <TextInput type="url" value={form.link_url} onChange={(link_url) => set({ link_url })} placeholder="https://" />
              </Field>
            </div>

            <Field label="Sampul">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-fg-3 mb-2">Gradien + ikon (dipakai bila tanpa gambar)</p>
                  <div className="grid place-items-center h-36 rounded-2xl" style={{ background: gradientOf(form) }}>
                    <ProjectArt icon={form.icon} size={56} />
                  </div>
                  <div className="mt-3 space-y-2">
                    <ColorInput value={form.gradient_from} onChange={(gradient_from) => set({ gradient_from })} />
                    <ColorInput value={form.gradient_to} onChange={(gradient_to) => set({ gradient_to })} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(PROJECT_ICONS).map(([key, { label, icon: Icon }]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => set({ icon: key })}
                        title={label}
                        aria-label={label}
                        aria-pressed={form.icon === key}
                        className={`grid place-items-center w-10 h-10 rounded-xl ${form.icon === key ? "bg-accent text-white" : "bg-surface-2 text-fg-2 hover:text-fg"}`}
                      >
                        <Icon size={18} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-fg-3 mb-2">Gambar sampul (opsional, menggantikan gradien)</p>
                  <ImagePicker
                    aspect="aspect-[16/10]"
                    currentUrl={coverUrl}
                    file={coverFile}
                    onFile={setCoverFile}
                    onRemove={() => {
                      if (coverFile) return setCoverFile(null);
                      set({ removedPaths: [...(form.removedPaths ?? []), form.cover_path, form.thumb_path], cover_path: null, thumb_path: null });
                    }}
                  />
                </div>
              </div>
            </Field>

            <MarkdownInput
              label="Cerita proyek (halaman detail)"
              hint="Saran alur: Masalah → Peran → Proses → Hasil. Format: ## Subjudul, **tebal**, *miring*, - daftar, [teks](https://…). HTML tidak didukung."
              value={form.story}
              onChange={(story) => set({ story })}
              placeholder={STORY_TEMPLATE}
            />

            <Field label="Galeri (opsional)" hint={`Maks. ${MAX_GALLERY} gambar, otomatis dikompres ke WebP + thumbnail saat disimpan. Urutan di sini = urutan tampil.`}>
              <GalleryPicker items={gallery} onChange={setGallery} max={MAX_GALLERY} />
            </Field>

            <Toggle label="Tampilkan di website" checked={form.published} onChange={(published) => set({ published })} />
          </>
        )}
      </FormSheet>
      {toast.node}
    </>
  );
}
