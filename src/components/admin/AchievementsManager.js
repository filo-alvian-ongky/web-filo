"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormSheet from "./FormSheet";
import ResourceList from "./ResourceList";
import { MEDIA } from "./tokens";
import { BilingualInput, Field, ImagePicker, MarkdownInput, PdfPicker, TextInput, Toggle, linkEn, useCloseForm, useToast } from "./fields";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { saveAchievement } from "@/app/admin/actions";
import { achievementFilters } from "@/lib/data";
import { mediaUrl } from "@/lib/supabase/config";
import { discardUploads, uploadImageWithThumb, uploadPdf } from "@/lib/admin/media";

const categories = achievementFilters.filter((f) => f.key !== "all").map((f) => ({ value: f.key, label: f.label.id }));
const today = () => new Date().toISOString().slice(0, 10);

const empty = () => ({
  title: { id: "", en: "" },
  provider: "",
  date: today(),
  category: "competition",
  image_path: null,
  thumb_path: null,
  pdf_path: null,
  link_url: "",
  description: { id: "", en: "" },
  published: true,
});

export default function AchievementsManager({ achievements, startNew = false }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(() => (startNew ? empty() : null));
  const closeForm = useCloseForm(setForm, startNew);
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const open = (value) => {
    setForm(value);
    setImageFile(null);
    setPdfFile(null);
    setStatus(null);
  };

  const submit = async () => {
    if (!imageFile && !form.image_path) return toast.show("Pilih gambar sertifikat dulu.", true);
    setBusy(true);
    const uploaded = [];
    const removedPaths = [...(form.removedPaths ?? [])];
    try {
      const values = { ...form };
      const folder = "achievements";
      const label = form.title.id || "sertifikat";
      if (imageFile) {
        setStatus("Mengompres & meng-upload gambar…");
        const { image_path, thumb_path } = await uploadImageWithThumb(folder, imageFile, label);
        uploaded.push(image_path, thumb_path);
        removedPaths.push(form.image_path, form.thumb_path);
        Object.assign(values, { image_path, thumb_path });
      }
      if (pdfFile) {
        setStatus("Meng-upload PDF…");
        const pdf_path = await uploadPdf(folder, pdfFile, label);
        uploaded.push(pdf_path);
        removedPaths.push(form.pdf_path);
        values.pdf_path = pdf_path;
      }
      setStatus("Menyimpan…");
      const res = await saveAchievement({ ...values, removedPaths: removedPaths.filter(Boolean) });
      if (!res.ok) throw new Error(res.error);
      toast.show("Pencapaian tersimpan.");
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

  return (
    <>
      <ResourceList
        table="achievements"
        title="Pencapaian"
        description="Sertifikat, medali & penghargaan. Empat teratas tampil di galeri Home."
        items={achievements}
        createLabel="Tambah pencapaian"
        toast={toast}
        onCreate={() => open(empty())}
        onEdit={(row) => open({ ...row, title: linkEn(row.title), description: linkEn(row.description), link_url: row.link_url ?? "" })}
        describe={(a) => ({
          title: a.title?.id,
          subtitle: `${a.provider} · ${a.date}`,
          media: (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(a.thumb_path ?? a.image_path)} alt="" className={`${MEDIA.thumb} object-cover bg-surface-2 ring-1 ring-separator shrink-0`} />
          ),
        })}
      />

      <FormSheet open={!!form} onClose={closeForm} title={form?.id ? "Edit pencapaian" : "Pencapaian baru"} onSubmit={submit} busy={busy} status={status}>
        {form && (
          <>
            <Field label="Gambar sertifikat" hint="Otomatis dikompres ke WebP (maks. 2000px) + thumbnail 900px saat disimpan.">
              <ImagePicker currentUrl={mediaUrl(form.image_path)} file={imageFile} onFile={setImageFile} required />
            </Field>

            <BilingualInput label="Judul" value={form.title} onChange={(title) => set({ title })} required />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Penyelenggara">
                <TextInput value={form.provider} onChange={(provider) => set({ provider })} required placeholder="mis. AISEEF" />
              </Field>
              <Field label="Tanggal">
                <TextInput type="date" value={form.date} onChange={(date) => set({ date })} required />
              </Field>
            </div>

            <Field label="Kategori">
              <SegmentedControl label="Kategori" options={categories} value={form.category} onChange={(category) => set({ category })} />
            </Field>

            <Field label="Dokumen PDF (opsional)">
              <PdfPicker
                currentUrl={mediaUrl(form.pdf_path)}
                file={pdfFile}
                onFile={setPdfFile}
                onRemove={() => {
                  if (pdfFile) return setPdfFile(null);
                  set({ removedPaths: [...(form.removedPaths ?? []), form.pdf_path], pdf_path: null });
                }}
              />
            </Field>

            <Field label="Link verifikasi (opsional)" hint="mis. link credential Dicoding / Coursera / LinkedIn.">
              <TextInput type="url" value={form.link_url} onChange={(link_url) => set({ link_url })} placeholder="https://" />
            </Field>

            <MarkdownInput
              label="Deskripsi (halaman detail, opsional)"
              value={form.description}
              onChange={(description) => set({ description })}
              placeholder="Ceritakan kompetisi / riset / sertifikasi ini: apa yang dikerjakan, tantangannya, dan hasilnya."
            />

            <Toggle label="Tampilkan di website" checked={form.published} onChange={(published) => set({ published })} />
          </>
        )}
      </FormSheet>
      {toast.node}
    </>
  );
}
