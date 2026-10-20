-- =============================================================================
-- Pengerasan keamanan CMS (untuk proyek yang sudah menjalankan schema.sql versi lama).
-- Isinya sudah termasuk di schema.sql terbaru — cukup jalankan salah satu.
-- =============================================================================

-- 1) Admin wajib verifikasi 2 langkah (aal2) + fungsi tidak lagi SECURITY DEFINER
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

-- 2) search_path dikunci (peringatan "Function Search Path Mutable")
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
