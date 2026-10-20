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

-- Trigger updated_at
do $$
declare t text;
begin
  foreach t in array array['technologies', 'experiences', 'achievements', 'projects'] loop
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

  -- Teknologi & tabel relasi: baca publik, tulis khusus admin
  foreach t in array array['technologies', 'experience_technologies', 'project_technologies'] loop
    execute format('drop policy if exists "publik: baca" on public.%I', t);
    execute format('create policy "publik: baca" on public.%I for select using (true)', t);
    execute format('drop policy if exists "admin: kelola" on public.%I', t);
    execute format('create policy "admin: kelola" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

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
-- Daftarkan email admin (GANTI bila email login Supabase-mu berbeda)
-- =============================================================================
insert into public.admins (email) values ('filoalvianongky@gmail.com')
on conflict (email) do nothing;
