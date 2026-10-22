-- =============================================================================
-- Pengaturan Website (CMS → Pengaturan Website): hero, sorotan, bidang fokus & profil CV.
-- Untuk proyek yang sudah menjalankan schema.sql versi lama — isinya sudah termasuk di
-- schema.sql terbaru, cukup jalankan salah satu.
-- Aman dijalankan ulang: nilai awal hanya diisi bila kuncinya belum ada (tidak menimpa
-- perubahan dari /admin).
-- =============================================================================

-- Satu baris per kunci: hero, highlights, focus_intro, focus_areas, cv_profile
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists touch_updated_at on public.site_settings;
create trigger touch_updated_at before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- Baca publik, tulis khusus admin (is_admin() mewajibkan verifikasi 2 langkah / aal2)
alter table public.site_settings enable row level security;

drop policy if exists "publik: baca" on public.site_settings;
create policy "publik: baca" on public.site_settings for select using (true);

drop policy if exists "admin: kelola" on public.site_settings;
create policy "admin: kelola" on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

-- Nilai awal = isi website saat ini (src/lib/data.js). Teks dwibahasa { "id", "en" };
-- di kalimat perkenalan hero, **teks** = tebal dan ==teks== = tebal berwarna aksen.
insert into public.site_settings (key, value) values
  ('hero', $json${
    "badge": {"id": "Terbuka untuk kolaborasi", "en": "Open to collaboration"},
    "typewriter": [{"id": "Halo, pengunjung!", "en": "Hello, visitor!"}, {"id": "Salam kenal ya!", "en": "Nice to meet you!"}],
    "intro": {
      "id": "Saya **Filo Alvian Ongky**, Mahasiswa Ilmu Komputer berdedikasi dengan fokus pada pengembangan sistem cerdas dan UI/UX di ==BINUS University==.",
      "en": "I'm **Filo Alvian Ongky**, a dedicated Computer Science student at ==BINUS University==, focused on building intelligent systems and UI/UX."
    }
  }$json$::jsonb),
  ('highlights', $json$[
    {"value": {"id": "Perak", "en": "Silver"}, "label": {"id": "Medali AISEEF 2026", "en": "AISEEF 2026 Medal"}, "tone": "#F59E0B", "countOf": null},
    {
      "value": {"id": "Finalis", "en": "Finalist"},
      "label": {"id": "UI/UX FasilkomFest", "en": "UI/UX FasilkomFest"},
      "tone": "#0A6CF5",
      "countOf": null
    },
    {
      "value": {"id": "Publikasi", "en": "Published"},
      "label": {"id": "Procedia Computer Science", "en": "Procedia Computer Science"},
      "tone": "#8B5CF6",
      "countOf": null
    },
    {
      "value": {"id": "7", "en": "7"},
      "label": {"id": "Sertifikat & penghargaan", "en": "Certificates & awards"},
      "tone": "#12A150",
      "countOf": "achievements"
    }
  ]$json$::jsonb),
  ('focus_areas', $json$[
    {
      "title": {"id": "UI/UX & Pemrograman Web", "en": "UI/UX & Web Development"},
      "body": {
        "id": "Perancang UI/UX & Fullstack Web Developer menggunakan Next.js & Figma.",
        "en": "UI/UX designer & fullstack web developer working with Next.js & Figma."
      },
      "icon": "web",
      "tone": "#0A6CF5"
    },
    {
      "title": {"id": "Riset IoT", "en": "IoT Research"},
      "body": {
        "id": "Penulis publikasi ilmiah mengenai pemantauan stres berbasis sensor biometrik di Procedia CS.",
        "en": "Author of a scientific publication on biometric sensor-based stress monitoring in Procedia CS."
      },
      "icon": "cpu",
      "tone": "#12A150"
    },
    {
      "title": {"id": "Level Design & Kreatif", "en": "Level Design & Creative"},
      "body": {
        "id": "Berpengalaman sebagai Commissioned Level Designer dalam merancang tata letak dan pengalaman spasial interaktif.",
        "en": "Experienced as a Commissioned Level Designer, crafting layouts and interactive spatial experiences."
      },
      "icon": "gamepad",
      "tone": "#F97316"
    }
  ]$json$::jsonb),
  ('focus_intro', $json${
    "title": {"id": "Eksplorasi", "en": "Exploration"},
    "subtitle": {
      "id": "Tiga bidang yang saya tekuni — dari antarmuka web, riset IoT, hingga desain level.",
      "en": "Three areas I work in — from web interfaces and IoT research to level design."
    }
  }$json$::jsonb),
  ('cv_profile', $json${
    "headline": {"id": "Mahasiswa Ilmu Komputer · BINUS University", "en": "Computer Science Student · BINUS University"},
    "summary": {
      "id": "Mahasiswa Ilmu Komputer di BINUS University yang berfokus pada pengembangan sistem cerdas, UI/UX, dan riset IoT. Terbuka untuk membahas proyek baru dan peluang kolaborasi.",
      "en": "Computer Science student at BINUS University focused on intelligent systems development, UI/UX, and IoT research. Open to discussing new projects and collaboration opportunities."
    },
    "education": {"school": "BINUS University (Semarang)", "major": {"id": "Ilmu Komputer (Computer Science)", "en": "Computer Science"}},
    "publication": {
      "title": "Optimizing Productivity: Internet of Things based Workload and Stress Monitoring using Galvanic Skin Response (GSR) Sensor Analysis and Microcontroller Arduino Uno",
      "authors": "F. A. Ongky, M. E. Kartiyoso, S. R. N. Gunawan, A. L. Dewi, V. J. L. Engel",
      "venue": {
        "id": "Procedia Computer Science · dipresentasikan (oral) di 10th ICCSCI 2025, 31 Juli – 1 Agustus 2025",
        "en": "Procedia Computer Science · oral presentation at the 10th ICCSCI 2025, July 31 – August 1, 2025"
      }
    },
    "contacts": [
      {"label": {"id": "Email", "en": "Email"}, "value": "filoalvianongky@gmail.com", "href": "mailto:filoalvianongky@gmail.com"},
      {"label": {"id": "Telepon", "en": "Phone"}, "value": "+62 821-4046-4565", "href": "tel:+6282140464565"},
      {"label": {"id": "Website", "en": "Website"}, "value": "FiloAlvian.com", "href": "https://filoalvian.com"},
      {
        "label": {"id": "LinkedIn", "en": "LinkedIn"},
        "value": "linkedin.com/in/filoalvianongky",
        "href": "https://www.linkedin.com/in/filoalvianongky/"
      },
      {"label": {"id": "GitHub", "en": "GitHub"}, "value": "github.com/filo-alvian-ongky", "href": "https://github.com/filo-alvian-ongky"}
    ]
  }$json$::jsonb)
on conflict (key) do nothing;
