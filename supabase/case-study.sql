-- =============================================================================
-- Halaman detail (case study) proyek & pencapaian: kolom tambahan.
-- Untuk proyek yang sudah menjalankan schema.sql versi lama — isinya sudah termasuk di
-- schema.sql terbaru, cukup jalankan salah satu.
-- Aman dijalankan ulang (add column if not exists / drop constraint if exists).
-- RLS tabel projects & achievements sudah berlaku untuk seluruh kolom, tidak perlu policy baru.
-- =============================================================================

-- Proyek: peran, periode, cerita (markdown: masalah → peran → proses → hasil) & galeri
alter table public.projects
  add column if not exists role jsonb not null default '{"id": "", "en": ""}',    -- { id, en }
  add column if not exists period jsonb not null default '{"id": "", "en": ""}',  -- { id, en }
  add column if not exists story jsonb not null default '{"id": "", "en": ""}',   -- { id, en } markdown
  add column if not exists gallery text[] not null default '{}';                  -- path gambar penuh di bucket "media"

-- Galeri maksimal 8 gambar (thumbnail = path yang sama dengan akhiran -thumb, tidak disimpan terpisah)
alter table public.projects drop constraint if exists projects_gallery_max;
alter table public.projects add constraint projects_gallery_max check (cardinality(gallery) <= 8);

-- Pencapaian: deskripsi (markdown)
alter table public.achievements
  add column if not exists description jsonb not null default '{"id": "", "en": ""}';  -- { id, en } markdown

-- Muat ulang cache skema API (PostgREST) agar kolom baru langsung bisa dibaca & ditulis
notify pgrst, 'reload schema';
