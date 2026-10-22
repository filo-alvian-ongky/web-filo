-- =============================================================================
-- Form kontak website: pesan pengunjung → inbox /admin (menu "Pesan").
-- Untuk proyek yang sudah menjalankan schema.sql versi lama — isinya sudah termasuk di
-- schema.sql terbaru, cukup jalankan salah satu. Aman dijalankan ulang.
--
-- Pola hak minimum:
-- - Pengunjung (anon) TIDAK punya hak apa pun atas tabel contact_messages (tanpa policy INSERT),
--   jadi orang tidak bisa mengirim / membaca pesan lewat REST API langsung dengan publishable key.
-- - Satu-satunya jalan masuk: fungsi submit_contact_message() yang hanya mau menyimpan bila
--   p_token cocok dengan rahasia di schema "private" (tidak terekspos Data API). Rahasia itu
--   hanya dipegang route handler /api/contact (env server-only CONTACT_FORM_SECRET), yang lebih
--   dulu memeriksa asal request, rate limit, honeypot & Cloudflare Turnstile.
-- - Membaca, menandai dibaca & menghapus hanya untuk admin yang sudah 2FA (is_admin()).
-- - Alamat IP pengunjung tidak disimpan.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Pesan masuk
-- -----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject text check (subject is null or char_length(subject) between 1 and 150),
  message text not null check (char_length(message) between 1 and 3000),
  lang text not null default 'id' check (lang in ('id', 'en')),   -- bahasa website saat pengunjung mengirim
  created_at timestamptz not null default now(),
  read_at timestamptz                                             -- null = belum dibaca
);

-- Inbox diurutkan dari yang terbaru
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "admin: baca" on public.contact_messages;
create policy "admin: baca" on public.contact_messages
  for select to authenticated
  using (public.is_admin());

drop policy if exists "admin: ubah" on public.contact_messages;
create policy "admin: ubah" on public.contact_messages
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin: hapus" on public.contact_messages;
create policy "admin: hapus" on public.contact_messages
  for delete to authenticated
  using (public.is_admin());

-- Hak tabel: anon tidak punya hak apa pun; admin hanya boleh mengubah kolom read_at
-- (isi pesan pengunjung tidak bisa diubah, juga oleh admin).
revoke all on public.contact_messages from public, anon, authenticated;
grant select, delete on public.contact_messages to authenticated;
grant update (read_at) on public.contact_messages to authenticated;

-- -----------------------------------------------------------------------------
-- Rahasia form kontak: schema "private" tidak termasuk "Exposed schemas" Data API,
-- dan anon / authenticated tidak punya hak apa pun di dalamnya.
-- Yang disimpan hanya hash SHA-256 dari CONTACT_FORM_SECRET (bukan rahasianya).
-- -----------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.contact_form_secret (
  id boolean primary key default true check (id),   -- selalu satu baris
  token_hash text not null check (token_hash ~ '^[0-9a-f]{64}$'),
  updated_at timestamptz not null default now()
);
alter table private.contact_form_secret enable row level security;
revoke all on private.contact_form_secret from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Simpan pesan (dipanggil route handler /api/contact lewat RPC dengan publishable key)
-- SECURITY DEFINER: berjalan sebagai pemilik tabel, jadi bisa menulis walau anon tidak punya
-- hak INSERT. search_path dikosongkan & semua nama ditulis lengkap dengan schema-nya.
-- -----------------------------------------------------------------------------
create or replace function public.submit_contact_message(
  p_token text,
  p_name text,
  p_email text,
  p_subject text,
  p_message text,
  p_lang text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  -- Token wajib cocok dengan rahasia server (dibandingkan sebagai hash)
  if p_token is null or char_length(p_token) < 32 or not exists (
    select 1 from private.contact_form_secret s
    where s.token_hash = pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_token, 'UTF8')), 'hex')
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- Batas global (cadangan bila rate limit per IP di server terlewati): maks. 30 pesan / jam
  if (select count(*) from public.contact_messages m where m.created_at > now() - interval '1 hour') >= 30 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.contact_messages (name, email, subject, message, lang)
  values (
    pg_catalog.btrim(p_name),
    pg_catalog.btrim(p_email),
    nullif(pg_catalog.btrim(coalesce(p_subject, '')), ''),
    pg_catalog.btrim(p_message),
    case when p_lang = 'en' then 'en' else 'id' end
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- Hanya anon (route handler memakai publishable key tanpa sesi) yang boleh memanggil
revoke all on function public.submit_contact_message(text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_contact_message(text, text, text, text, text, text) to anon;

-- Muat ulang cache skema API (PostgREST) agar tabel & fungsi baru langsung bisa dipakai
notify pgrst, 'reload schema';

-- =============================================================================
-- SETELAH skrip di atas: simpan hash CONTACT_FORM_SECRET (jalankan terpisah).
-- Buat rahasia + hash-nya di komputer sendiri (lihat supabase/README.md → Form kontak):
--   node -e "const c=require('crypto');const s=c.randomBytes(32).toString('base64url');console.log('CONTACT_FORM_SECRET='+s);console.log('hash: '+c.createHash('sha256').update(s).digest('hex'))"
-- Simpan CONTACT_FORM_SECRET di .env.local & Vercel, lalu ganti HASH_DI_SINI dengan hash-nya:
--
-- insert into private.contact_form_secret (id, token_hash) values (true, 'HASH_DI_SINI')
-- on conflict (id) do update set token_hash = excluded.token_hash, updated_at = now();
-- =============================================================================
