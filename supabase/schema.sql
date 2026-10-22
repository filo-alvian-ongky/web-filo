-- =============================================================================
-- Skema CMS portfolio FiloAlvian.com
-- Jalankan SEKALI di Supabase Dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang (memakai IF NOT EXISTS / OR REPLACE / ON CONFLICT).
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Admin: hanya email di tabel ini yang boleh menambah / mengubah / menghapus konten
-- -----------------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key
);

-- Admin = email terdaftar di tabel admins DAN sesi sudah lolos verifikasi 2 langkah (aal2).
-- SECURITY INVOKER: berjalan dengan hak pemanggil; tabel admins dilindungi RLS
-- (user hanya bisa melihat barisnya sendiri), jadi tidak membocorkan daftar admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
     and exists (
       select 1 from public.admins a
       where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
     );
$$;

-- updated_at otomatis
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Teknologi (dipakai di Tech Stack Home, pengalaman & proyek)
-- -----------------------------------------------------------------------------
create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text,                         -- slug Simple Icons (opsional), mis. "react"
  icon_path text,                    -- path SVG 24×24 (otomatis dari Simple Icons atau ditempel manual)
  color text,                        -- warna hex; kosong = ikut warna teks (tema terang/gelap)
  featured boolean not null default false,  -- tampil di section "Teknologi" di Home
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Pengalaman
-- -----------------------------------------------------------------------------
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  company text not null,
  period jsonb not null default '{"id": "", "en": ""}',   -- { id, en }
  points jsonb not null default '[]',                     -- [{ id, en }, ...]
  tone text not null default '#0A6CF5',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Pencapaian
-- -----------------------------------------------------------------------------
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null,                                   -- { id, en }
  provider text not null,
  date date not null,
  category text not null check (category in ('competition', 'research', 'certification')),
  image_path text,                                        -- path di bucket "media" (atau "/..." untuk file lokal)
  thumb_path text,
  pdf_path text,
  link_url text,                                          -- link verifikasi sertifikat (opsional)
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Proyek
-- -----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary jsonb not null default '{"id": "", "en": ""}',  -- { id, en }
  tags text[] not null default '{}',
  embed_url text,                                         -- link embed presentasi (mis. Canva "...view?embed")
  link_url text,                                          -- link demo / GitHub (opsional)
  gradient_from text not null default '#60A5FA',
  gradient_to text not null default '#4F46E5',
  icon text not null default 'sparkles',
  cover_path text,                                        -- gambar sampul (opsional, menggantikan gradien + ikon)
  thumb_path text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Relasi teknologi ↔ pengalaman / proyek (banyak-ke-banyak)
-- -----------------------------------------------------------------------------
create table if not exists public.experience_technologies (
  experience_id uuid not null references public.experiences (id) on delete cascade,
  technology_id uuid not null references public.technologies (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (experience_id, technology_id)
);

create table if not exists public.project_technologies (
  project_id uuid not null references public.projects (id) on delete cascade,
  technology_id uuid not null references public.technologies (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (project_id, technology_id)
);

-- -----------------------------------------------------------------------------
-- Pengaturan Website (/admin → Pengaturan Website): satu baris per kunci
-- hero, highlights (sorotan), focus_intro (judul & pengantar Eksplorasi), focus_areas (bidang fokus), cv_profile (profil CV)
-- -----------------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Trigger updated_at
do $$
declare t text;
begin
  foreach t in array array['technologies', 'experiences', 'achievements', 'projects', 'site_settings'] loop
    execute format('drop trigger if exists touch_updated_at on public.%I', t);
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- =============================================================================
-- Row Level Security: publik hanya bisa MEMBACA konten yang dipublikasikan,
-- hanya admin yang bisa menulis.
-- =============================================================================
alter table public.admins enable row level security;
alter table public.technologies enable row level security;
alter table public.experiences enable row level security;
alter table public.achievements enable row level security;
alter table public.projects enable row level security;
alter table public.experience_technologies enable row level security;
alter table public.project_technologies enable row level security;
alter table public.site_settings enable row level security;

-- Admin hanya bisa melihat barisnya sendiri (dipakai untuk cek akses di /admin)
drop policy if exists "admins: lihat diri sendiri" on public.admins;
create policy "admins: lihat diri sendiri" on public.admins
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

do $$
declare t text;
begin
  -- Tabel konten: baca publik (yang published), tulis khusus admin
  foreach t in array array['experiences', 'achievements', 'projects'] loop
    execute format('drop policy if exists "publik: baca yang dipublikasikan" on public.%I', t);
    execute format('create policy "publik: baca yang dipublikasikan" on public.%I for select using (published or public.is_admin())', t);
    execute format('drop policy if exists "admin: kelola" on public.%I', t);
    execute format('create policy "admin: kelola" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;

  -- Teknologi, tabel relasi & pengaturan website: baca publik, tulis khusus admin
  foreach t in array array['technologies', 'experience_technologies', 'project_technologies', 'site_settings'] loop
    execute format('drop policy if exists "publik: baca" on public.%I', t);
    execute format('create policy "publik: baca" on public.%I for select using (true)', t);
    execute format('drop policy if exists "admin: kelola" on public.%I', t);
    execute format('create policy "admin: kelola" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

-- =============================================================================
-- Storage: bucket publik "media" untuk foto & PDF (maks. 20 MB per file)
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 20971520, array['image/webp', 'image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- File di bucket publik dibaca pengunjung lewat URL publik (tanpa policy).
-- Policy SELECT ini dibutuhkan API storage saat admin menghapus / mengganti file.
drop policy if exists "media: admin lihat" on storage.objects;
create policy "media: admin lihat" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: admin upload" on storage.objects;
create policy "media: admin upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: admin ubah" on storage.objects;
create policy "media: admin ubah" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: admin hapus" on storage.objects;
create policy "media: admin hapus" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- =============================================================================
-- Pengaturan Website: nilai awal = isi website saat ini (src/lib/data.js).
-- Hanya diisi bila kuncinya belum ada, jadi tidak menimpa perubahan dari /admin.
-- Di kalimat perkenalan hero, **teks** = tebal dan ==teks== = tebal berwarna aksen.
-- =============================================================================
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

-- =============================================================================
-- Daftarkan email admin (GANTI bila email login Supabase-mu berbeda)
-- =============================================================================
insert into public.admins (email) values ('filoalvianongky@gmail.com')
on conflict (email) do nothing;
