"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import AdminPageHeader from "./AdminPageHeader";
import FormSheet from "./FormSheet";
import PreviewButton from "./PreviewButton";
import SortableList, { smallBtn } from "./SortableList";
import { LIST, MEDIA, SETTINGS } from "./tokens";
import { BilingualInput, ColorInput, Field, TextInput, Toggle, linkEn, useToast } from "./fields";
import RichText from "@/components/ui/RichText";
import { FOCUS_ICONS } from "@/components/ui/focusIcons";
import { btn } from "@/components/ui/styles";
import { saveSiteSetting } from "@/app/admin/actions";

// Batas jumlah item (sama dengan validasi di server action)
const MAX = { typewriter: 6, highlights: 8, focus_areas: 8, contacts: 8 };
// Palet warna cepat (sama dengan warna aksen yang dipakai di website)
const TONES = ["#0A6CF5", "#12A150", "#F59E0B", "#8B5CF6", "#F97316", "#E5484D", "#0EA5E9", "#EC4899"];

const blank = () => ({ id: "", en: "" });
const updated = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

/** Daftar dari server + perubahan yang sudah dikirim, sampai data baru (router.refresh) tiba */
function useOptimisticList(items) {
  const [state, setState] = useState(null);
  const list = state?.base === items ? state.list : items;
  return [list, (next) => setState(next ? { base: items, list: next } : null)];
}

function Section({ title, description, meta, action, children }) {
  return (
    <section className={SETTINGS.card}>
      <div className={SETTINGS.head}>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-fg">{title}</h2>
          <p className="text-sm text-fg-2 leading-snug">{description}</p>
          <p className="mt-1 text-xs text-fg-3" suppressHydrationWarning>
            {meta ? `Disimpan ${updated.format(new Date(meta))}` : "Belum pernah disimpan — memakai isi bawaan website"}
          </p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const EditButton = ({ onClick, children = "Edit" }) => (
  <button type="button" onClick={onClick} className={`${btn.small} shrink-0`}>
    <Pencil size={14} /> {children}
  </button>
);

const AddButton = ({ onClick, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled} className={`${btn.small} shrink-0`}>
    <Plus size={15} strokeWidth={2.5} /> Tambah
  </button>
);

/** Warna: palet cepat + input hex */
function ToneField({ value, onChange, hint }) {
  return (
    <Field label="Warna" hint={hint}>
      <div className="flex flex-wrap gap-2 mb-2.5">
        {TONES.map((tone) => (
          <button
            key={tone}
            type="button"
            onClick={() => onChange(tone)}
            aria-label={`Warna ${tone}`}
            aria-pressed={value?.toUpperCase() === tone}
            className={`w-8 h-8 rounded-full ring-offset-2 ring-offset-surface transition-shadow ${value?.toUpperCase() === tone ? "ring-2 ring-accent" : ""}`}
            style={{ background: tone }}
          />
        ))}
      </div>
      <ColorInput value={value} onChange={onChange} />
    </Field>
  );
}

/** Pilih ikon bidang fokus (kunci disimpan, lihat src/components/ui/focusIcons.js) */
function IconPicker({ value, tone, onChange }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {Object.entries(FOCUS_ICONS).map(([key, { label, icon: Icon }]) => {
        const on = key === value;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={on}
            title={label}
            className={`flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-2xl text-center transition-shadow ${
              on ? "bg-accent-soft ring-2 ring-accent" : "bg-surface-2 hover:ring-1 hover:ring-separator"
            }`}
          >
            <span className="grid place-items-center w-9 h-9 rounded-[12px] text-white" style={{ background: on ? tone : "var(--fg-3)" }}>
              <Icon size={18} />
            </span>
            <span className="text-[10.5px] font-semibold text-fg-2 leading-tight line-clamp-2">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Baris isian berulang (baris typewriter, kontak CV): naik / turun / hapus */
function RepeatRow({ index, count, onMove, onRemove, children }) {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex flex-col pt-1">
        <button type="button" className={`${smallBtn} w-8 h-7`} disabled={index === 0} onClick={() => onMove(index, -1)} aria-label="Naikkan">
          <ArrowUp size={15} />
        </button>
        <button type="button" className={`${smallBtn} w-8 h-7`} disabled={index === count - 1} onClick={() => onMove(index, 1)} aria-label="Turunkan">
          <ArrowDown size={15} />
        </button>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={count <= 1}
        className="mt-1.5 grid place-items-center w-9 h-9 rounded-full text-fg-3 hover:text-[#e5484d] hover:bg-surface-2 disabled:opacity-30"
        aria-label="Hapus"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

const moved = (list, index, delta) => {
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(index + delta, 0, item);
  return next;
};

// -----------------------------------------------------------------------------
// Form tiap bagian
// -----------------------------------------------------------------------------
function HeroForm({ form, set }) {
  const setLine = (i, value) => set({ typewriter: form.typewriter.map((l, j) => (j === i ? value : l)) });
  return (
    <>
      <BilingualInput label="Label status" hint="Pil kecil di atas judul (mis. “Terbuka untuk kolaborasi”). Kosongkan untuk menyembunyikan." value={form.badge} onChange={(badge) => set({ badge })} />
      <Field label="Baris typewriter" hint={`Diketik bergantian di judul besar, maks. ${MAX.typewriter} baris & 40 karakter per baris.`}>
        <div className="space-y-3">
          {form.typewriter.map((line, i) => (
            <RepeatRow
              key={i}
              index={i}
              count={form.typewriter.length}
              onMove={(index, delta) => set({ typewriter: moved(form.typewriter, index, delta) })}
              onRemove={(index) => set({ typewriter: form.typewriter.filter((_, j) => j !== index) })}
            >
              <BilingualInput label="" value={line} onChange={(v) => setLine(i, v)} required />
            </RepeatRow>
          ))}
          {form.typewriter.length < MAX.typewriter && (
            <button type="button" onClick={() => set({ typewriter: [...form.typewriter, blank()] })} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-surface-2 text-sm font-semibold text-fg">
              <Plus size={15} /> Tambah baris
            </button>
          )}
        </div>
      </Field>
      <BilingualInput
        label="Kalimat perkenalan"
        hint="**teks** = tebal, ==teks== = tebal berwarna aksen (mis. **Filo Alvian Ongky** dan ==BINUS University==)."
        value={form.intro}
        onChange={(intro) => set({ intro })}
        multiline
        required
      />
      <div className="p-4 rounded-2xl bg-surface-2">
        <p className="text-xs font-semibold text-fg-3 mb-1.5">Pratinjau (ID)</p>
        <p className="text-fg-2 leading-relaxed">
          <RichText text={form.intro.id} />
        </p>
      </div>
    </>
  );
}

function HighlightForm({ form, set }) {
  return (
    <>
      <Toggle
        label="Angka otomatis"
        hint="Nilai diisi jumlah pencapaian yang tampil di website (ikut CMS)."
        checked={form.auto}
        onChange={(auto) => set({ auto })}
      />
      {!form.auto && (
        <BilingualInput label="Nilai" hint="Teks besar berwarna, mis. “Perak” / “Finalis”. Angka saja = animasi menghitung." value={form.value} onChange={(value) => set({ value })} required />
      )}
      <BilingualInput label="Keterangan" hint="Teks kecil di bawah nilai." value={form.label} onChange={(label) => set({ label })} required />
      <ToneField value={form.tone} onChange={(tone) => set({ tone })} hint="Warna teks nilai." />
    </>
  );
}

function FocusIntroForm({ form, set }) {
  return (
    <>
      <BilingualInput label="Judul section" value={form.title} onChange={(title) => set({ title })} required />
      <BilingualInput
        label="Teks pengantar"
        hint="Di bawah judul. Sesuaikan bila jumlah bidang fokus berubah (mis. “Tiga bidang …”). Kosongkan untuk menyembunyikan."
        value={form.subtitle}
        onChange={(subtitle) => set({ subtitle })}
        multiline
      />
    </>
  );
}

function FocusForm({ form, set }) {
  return (
    <>
      <BilingualInput label="Judul" value={form.title} onChange={(title) => set({ title })} required />
      <BilingualInput label="Deskripsi" value={form.body} onChange={(body) => set({ body })} multiline required />
      <Field label="Ikon">
        <IconPicker value={form.icon} tone={form.tone} onChange={(icon) => set({ icon })} />
      </Field>
      <ToneField value={form.tone} onChange={(tone) => set({ tone })} hint="Warna ikon & cahaya kartu." />
    </>
  );
}

function CvForm({ form, set }) {
  const setNested = (key, patch) => set({ [key]: { ...form[key], ...patch } });
  const setContact = (i, patch) => set({ contacts: form.contacts.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  return (
    <>
      <BilingualInput label="Headline" hint="Di bawah nama pada CV." value={form.headline} onChange={(headline) => set({ headline })} required />
      <BilingualInput
        label="Ringkasan profil"
        hint="Pencapaian terbaik dari CMS ditambahkan otomatis di akhir ringkasan."
        value={form.summary}
        onChange={(summary) => set({ summary })}
        multiline
        required
      />

      <div className="grid grid-cols-1 gap-4 p-4 rounded-2xl bg-surface-2/60 ring-1 ring-separator">
        <p className="text-[15px] font-bold text-fg">Pendidikan</p>
        <Field label="Kampus / sekolah" hint="Kosongkan untuk menyembunyikan bagian Pendidikan.">
          <TextInput value={form.education.school} onChange={(school) => setNested("education", { school })} placeholder="mis. BINUS University (Semarang)" />
        </Field>
        <BilingualInput label="Jurusan" value={form.education.major} onChange={(major) => setNested("education", { major })} />
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 rounded-2xl bg-surface-2/60 ring-1 ring-separator">
        <p className="text-[15px] font-bold text-fg">Publikasi</p>
        <Field label="Judul" hint="Kosongkan untuk menyembunyikan bagian Publikasi.">
          <TextInput value={form.publication.title} onChange={(title) => setNested("publication", { title })} />
        </Field>
        <Field label="Penulis">
          <TextInput value={form.publication.authors} onChange={(authors) => setNested("publication", { authors })} placeholder="mis. F. A. Ongky, …" />
        </Field>
        <BilingualInput label="Jurnal / konferensi" value={form.publication.venue} onChange={(venue) => setNested("publication", { venue })} />
      </div>

      <Field label="Kontak" hint="Tampil di kepala CV. Link: https://…, mailto:… atau tel:… (boleh kosong).">
        <div className="space-y-3">
          {form.contacts.map((c, i) => (
            <RepeatRow
              key={i}
              index={i}
              count={form.contacts.length}
              onMove={(index, delta) => set({ contacts: moved(form.contacts, index, delta) })}
              onRemove={(index) => set({ contacts: form.contacts.filter((_, j) => j !== index) })}
            >
              <div className="space-y-2 p-3 rounded-2xl bg-surface-2/60 ring-1 ring-separator">
                <BilingualInput label="" value={c.label} onChange={(label) => setContact(i, { label })} required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <TextInput value={c.value} onChange={(value) => setContact(i, { value })} placeholder="Teks, mis. FiloAlvian.com" required aria-label="Teks kontak" />
                  <TextInput value={c.href ?? ""} onChange={(href) => setContact(i, { href })} placeholder="Link, mis. https://filoalvian.com" aria-label="Link kontak" />
                </div>
              </div>
            </RepeatRow>
          ))}
          {form.contacts.length < MAX.contacts && (
            <button
              type="button"
              onClick={() => set({ contacts: [...form.contacts, { label: blank(), value: "", href: "" }] })}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-surface-2 text-sm font-semibold text-fg"
            >
              <Plus size={15} /> Tambah kontak
            </button>
          )}
        </div>
      </Field>
    </>
  );
}

// Bentuk form (teks EN yang sama dengan ID dikosongkan → otomatis mengikuti ID, lihat linkEn)
const heroForm = (h) => ({ badge: linkEn(h.badge), typewriter: h.typewriter.length ? h.typewriter.map(linkEn) : [blank()], intro: linkEn(h.intro) });
const highlightForm = (h) => ({ value: linkEn(h.value), label: linkEn(h.label), tone: h.tone, auto: h.countOf === "achievements" });
const focusIntroForm = (v) => ({ title: linkEn(v.title), subtitle: linkEn(v.subtitle) });
const focusForm = (f) => ({ title: linkEn(f.title), body: linkEn(f.body), icon: f.icon, tone: f.tone });
const cvForm = (cv) => ({
  headline: linkEn(cv.headline),
  summary: linkEn(cv.summary),
  education: { school: cv.education.school, major: linkEn(cv.education.major) },
  publication: { title: cv.publication.title, authors: cv.publication.authors, venue: linkEn(cv.publication.venue) },
  contacts: cv.contacts.map((c) => ({ label: linkEn(c.label), value: c.value, href: c.href ?? "" })),
});

const SHEET_TITLE = { hero: "Edit hero", highlight: "sorotan", focus_intro: "Edit section Eksplorasi", focus: "bidang fokus", cv: "Edit profil CV" };

/**
 * Pengaturan Website: teks hero, sorotan, section Eksplorasi (judul + bidang fokus) di Home, profil CV.
 * @param settings   hasil settingsView() (isi bawaan dipakai untuk kunci yang belum tersimpan)
 * @param updatedAt  { [kunci]: waktu terakhir disimpan }
 */
export default function SettingsManager({ settings, updatedAt }) {
  const router = useRouter();
  const toast = useToast();
  // { kind: "hero" | "highlight" | "focus" | "cv", index?: number (null = item baru), form }
  const [sheet, setSheet] = useState(null);
  const [busy, setBusy] = useState(false);

  // Kunci unik per item (untuk drag-and-drop), dibuat ulang setiap data dari server berubah
  const highlightItems = useMemo(() => settings.highlights.map((h, i) => ({ ...h, key: `h${i}` })), [settings.highlights]);
  const focusItems = useMemo(() => settings.focusAreas.map((f, i) => ({ ...f, key: `f${i}` })), [settings.focusAreas]);
  const [highlights, setHighlights] = useOptimisticList(highlightItems);
  const [focusAreas, setFocusAreas] = useOptimisticList(focusItems);

  const set = (patch) => setSheet((s) => ({ ...s, form: { ...s.form, ...patch } }));
  const open = (kind, form, index = null) => setSheet({ kind, form, index });

  /** Simpan satu kunci site_settings. setList = tampilkan daftar baru seketika (opsional). */
  const save = async (key, value, message, setList) => {
    setList?.(value);
    setBusy(true);
    const res = await saveSiteSetting(key, value);
    setBusy(false);
    if (!res.ok) {
      setList?.(null);
      toast.show(res.error, true);
      return false;
    }
    toast.show(message);
    router.refresh();
    return true;
  };

  // Simpan item daftar dari form (index null = tambah di akhir)
  const upsertItem = (list, index, item) => (index === null ? [...list, item] : list.map((x, i) => (i === index ? { ...x, ...item } : x)));

  const submit = async () => {
    const { kind, form, index } = sheet;
    let ok = false;
    if (kind === "hero") ok = await save("hero", form, "Hero tersimpan.");
    if (kind === "cv") ok = await save("cv_profile", form, "Profil CV tersimpan.");
    if (kind === "focus_intro") ok = await save("focus_intro", form, "Teks section Eksplorasi tersimpan.");
    if (kind === "highlight") {
      const { auto, ...rest } = form;
      const item = { ...rest, countOf: auto ? "achievements" : null, key: highlights[index]?.key ?? `new-${Date.now()}` };
      ok = await save("highlights", upsertItem(highlights, index, item), "Sorotan tersimpan.", setHighlights);
    }
    if (kind === "focus") {
      const item = { ...form, key: focusAreas[index]?.key ?? `new-${Date.now()}` };
      ok = await save("focus_areas", upsertItem(focusAreas, index, item), "Bidang fokus tersimpan.", setFocusAreas);
    }
    if (ok) setSheet(null);
  };

  const remove = (key, list, index, name, setList) => {
    if (!window.confirm(`Hapus "${name}"?`)) return;
    save(key, list.filter((_, i) => i !== index), "Terhapus.", setList);
  };

  const { hero, focusIntro, cvProfile } = settings;
  const sheetTitle =
    sheet?.kind === "highlight" || sheet?.kind === "focus" ? `${sheet.index === null ? "Tambah" : "Edit"} ${SHEET_TITLE[sheet.kind]}` : SHEET_TITLE[sheet?.kind];

  return (
    <>
      <AdminPageHeader
        eyebrow="Home & CV"
        title="Pengaturan Website"
        description="Teks hero, sorotan, dan bidang fokus di Home, serta profil di CV PDF. Perubahan langsung tampil setelah disimpan."
        actions={
          <>
            <PreviewButton path="/" />
            <a href="/cv/id" target="_blank" rel="noopener noreferrer" className={btn.secondary}>
              <FileText size={17} /> Lihat CV
            </a>
          </>
        }
      />

      <div className={SETTINGS.stack}>
        {/* Hero */}
        <Section title="Hero" description="Bagian paling atas Home." meta={updatedAt.hero} action={<EditButton onClick={() => open("hero", heroForm(hero))} />}>
          <div className={SETTINGS.body}>
            <div className="p-4 md:p-5 rounded-2xl bg-surface-2">
              {hero.badge.id && (
                <span className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-surface ring-1 ring-separator text-xs font-semibold text-fg-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" /> {hero.badge.id}
                </span>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {hero.typewriter.map((line, i) => (
                  <span key={i} className="inline-flex items-center h-8 px-3 rounded-full bg-surface text-[15px] font-extrabold tracking-tight text-fg">
                    {line.id}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-fg-2 leading-relaxed">
                <RichText text={hero.intro.id} />
              </p>
            </div>
          </div>
        </Section>

        {/* Sorotan */}
        <Section
          title="Sorotan"
          description="Widget angka di bawah hero. Geser atau pakai tombol panah untuk mengurutkan."
          meta={updatedAt.highlights}
          action={<AddButton disabled={highlights.length >= MAX.highlights} onClick={() => open("highlight", highlightForm({ value: blank(), label: blank(), tone: TONES[0] }))} />}
        >
          {highlights.length === 0 ? (
            <p className={`${SETTINGS.body} text-sm text-fg-3`}>Belum ada sorotan — bagian ini disembunyikan di Home.</p>
          ) : (
            <SortableList
              items={highlights}
              getKey={(h) => h.key}
              onReorder={(next) => save("highlights", next, "Urutan sorotan tersimpan.", setHighlights)}
              rowClassName={() => `group ${LIST.row} transition-colors hover:bg-surface-2/70 ${busy ? "pointer-events-none" : ""}`}
              renderRow={(h, i) => (
                <>
                  <span className={`${MEDIA.bar} shrink-0`} style={{ background: h.tone }} />
                  <button type="button" onClick={() => open("highlight", highlightForm(h), i)} className="flex-1 min-w-0 text-left py-1">
                    <span className="block font-semibold truncate" style={{ color: h.tone }}>
                      {h.countOf === "achievements" ? "Jumlah pencapaian (otomatis)" : h.value.id}
                    </span>
                    <span className="block text-sm text-fg-2 truncate">{h.label.id}</span>
                  </button>
                  <div className="flex items-center">
                    <button type="button" className={`${smallBtn} hidden sm:grid`} onClick={() => open("highlight", highlightForm(h), i)} aria-label="Edit" title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className={`${smallBtn} hover:text-[#e5484d]`}
                      onClick={() => remove("highlights", highlights, i, h.label.id, setHighlights)}
                      aria-label="Hapus"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            />
          )}
        </Section>

        {/* Bidang fokus */}
        <Section
          title="Bidang Fokus"
          description="Judul, teks pengantar & kartu bertumpuk di section Eksplorasi."
          meta={updatedAt.focus_areas}
          action={<AddButton disabled={focusAreas.length >= MAX.focus_areas} onClick={() => open("focus", focusForm({ title: blank(), body: blank(), icon: "sparkles", tone: TONES[0] }))} />}
        >
          <div className={SETTINGS.body}>
            <button
              type="button"
              onClick={() => open("focus_intro", focusIntroForm(focusIntro))}
              className="group flex items-start gap-3 w-full p-4 rounded-2xl bg-surface-2 text-left transition-shadow hover:ring-1 hover:ring-separator"
            >
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-semibold text-fg-3">Judul & teks pengantar</span>
                <span className="block mt-0.5 text-lg font-extrabold tracking-tight text-fg">{focusIntro.title.id}</span>
                {focusIntro.subtitle.id && <span className="block mt-0.5 text-sm text-fg-2 leading-snug">{focusIntro.subtitle.id}</span>}
              </span>
              <Pencil size={16} className="mt-1 shrink-0 text-fg-3 group-hover:text-fg" />
            </button>
          </div>
          {focusAreas.length === 0 ? (
            <p className={`${SETTINGS.body} text-sm text-fg-3`}>Belum ada bidang fokus — section Eksplorasi disembunyikan di Home.</p>
          ) : (
            <SortableList
              items={focusAreas}
              getKey={(f) => f.key}
              onReorder={(next) => save("focus_areas", next, "Urutan bidang fokus tersimpan.", setFocusAreas)}
              rowClassName={() => `group ${LIST.row} transition-colors hover:bg-surface-2/70 ${busy ? "pointer-events-none" : ""}`}
              renderRow={(f, i) => {
                const Icon = (FOCUS_ICONS[f.icon] ?? FOCUS_ICONS.sparkles).icon;
                return (
                  <>
                    <span className={`grid place-items-center ${MEDIA.tile} shrink-0 text-white`} style={{ background: f.tone }}>
                      <Icon size={20} />
                    </span>
                    <button type="button" onClick={() => open("focus", focusForm(f), i)} className="flex-1 min-w-0 text-left py-1">
                      <span className="block font-semibold text-fg truncate">{f.title.id}</span>
                      <span className="block text-sm text-fg-2 truncate">{f.body.id}</span>
                    </button>
                    <div className="flex items-center">
                      <button type="button" className={`${smallBtn} hidden sm:grid`} onClick={() => open("focus", focusForm(f), i)} aria-label="Edit" title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className={`${smallBtn} hover:text-[#e5484d]`}
                        onClick={() => remove("focus_areas", focusAreas, i, f.title.id, setFocusAreas)}
                        aria-label="Hapus"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                );
              }}
            />
          )}
        </Section>

        {/* Profil CV */}
        <Section
          title="Profil CV"
          description="Kepala, ringkasan, pendidikan, publikasi & kontak di CV PDF. Pengalaman, prestasi & proyek diambil otomatis dari CMS."
          meta={updatedAt.cv_profile}
          action={<EditButton onClick={() => open("cv", cvForm(cvProfile))} />}
        >
          <div className={`${SETTINGS.body} space-y-3`}>
            <div className="p-4 md:p-5 rounded-2xl bg-surface-2">
              <p className="font-bold text-fg">{cvProfile.headline.id}</p>
              <p className="mt-1 text-sm text-fg-2 leading-relaxed line-clamp-3">{cvProfile.summary.id}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {[
                cvProfile.education.school && `Pendidikan: ${cvProfile.education.school}`,
                cvProfile.publication.title ? "Publikasi: 1" : "Tanpa publikasi",
                `${cvProfile.contacts.length} kontak`,
              ]
                .filter(Boolean)
                .map((chip) => (
                  <span key={chip} className="inline-flex items-center h-7 px-3 rounded-full bg-surface-2 text-fg-2">
                    {chip}
                  </span>
                ))}
              <a href="/cv/id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center h-7 px-3 rounded-full bg-accent-soft text-accent-fg">
                CV (ID)
              </a>
              <a href="/cv/en" target="_blank" rel="noopener noreferrer" className="inline-flex items-center h-7 px-3 rounded-full bg-accent-soft text-accent-fg">
                CV (EN)
              </a>
            </div>
          </div>
        </Section>
      </div>

      <FormSheet open={!!sheet} onClose={() => setSheet(null)} title={sheetTitle ?? ""} onSubmit={submit} busy={busy}>
        {sheet?.kind === "hero" && <HeroForm form={sheet.form} set={set} />}
        {sheet?.kind === "highlight" && <HighlightForm form={sheet.form} set={set} />}
        {sheet?.kind === "focus_intro" && <FocusIntroForm form={sheet.form} set={set} />}
        {sheet?.kind === "focus" && <FocusForm form={sheet.form} set={set} />}
        {sheet?.kind === "cv" && <CvForm form={sheet.form} set={set} />}
      </FormSheet>
      {toast.node}
    </>
  );
}
