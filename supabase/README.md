# Setup CMS (Supabase)

CMS ada di **`/admin`** untuk mengelola **Pengalaman, Pencapaian, Proyek, Teknologi**, dan **Pengaturan Website**
(teks hero, sorotan, bidang fokus di Home + profil CV), serta membaca **Pesan** dari form kontak website.
Selama Supabase belum disetel, website tetap tampil memakai konten lokal (`src/lib/content/seed.js`).

## 1. Buat proyek Supabase
1. Masuk ke <https://supabase.com/dashboard> → **New project**.
2. Isi nama (mis. `filoalvian-cms`), buat **Database password** (simpan baik-baik), pilih region **Southeast Asia (Singapore)**.
3. Tunggu sampai proyek selesai dibuat (± 1–2 menit).

## 2. Jalankan skema database
1. Buka **SQL Editor** → **New query**.
2. Salin seluruh isi [`schema.sql`](./schema.sql), tempel, lalu klik **Run**.
   - Membuat tabel, Row Level Security, bucket storage `media`, dan mendaftarkan email admin.
   - Baris terakhir mendaftarkan `filoalvianongky@gmail.com` sebagai admin — **ganti dulu** bila kamu login dengan email lain.

## 3. Buat akun admin
1. **Authentication → Users → Add user → Create new user**.
2. Isi email (sama dengan yang ada di tabel `admins`) + password, centang **Auto Confirm User**.
3. Supaya orang lain tidak bisa mendaftar: **Authentication → Sign In / Providers → Email** → matikan **Allow new users to sign up**.

## 4. Isi environment variable
Salin `.env.example` menjadi `.env.local` (atau tambahkan ke `.env.local` yang sudah ada):

| Variabel | Ambil dari | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project Settings → Data API → Project URL** | mis. `https://abcd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Project Settings → API Keys → Publishable key** (`sb_publishable_...`) | Aman untuk browser. Legacy *anon* key juga bisa. |
| `SUPABASE_SECRET_KEY` | **Project Settings → API Keys → Secret keys** (`sb_secret_...`) | **Hanya** untuk migrasi & backup di komputer sendiri. Jangan di-commit / jangan dipasang di Vercel. |

Lalu jalankan ulang `npm run dev`.

## 5. Pindahkan konten lama ke Supabase
```bash
npm run cms:migrate
```
Script mengisi tabel dari `src/lib/content/seed.js` dan meng-upload gambar sertifikat + PDF dari `/public`
ke bucket `media` (gambar dikompres ke WebP). Bila database sudah berisi, script berhenti agar tidak dobel;
`npm run cms:migrate -- --reset` menghapus semua konten CMS lalu mengisinya ulang.

Setelah selesai, `SUPABASE_SECRET_KEY` boleh dihapus dari `.env.local` (simpan bila ingin menjalankan backup di bawah).

## 6. Deploy (Vercel)
- Tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` di **Vercel → Project → Settings → Environment Variables**, lalu redeploy.
- `vercel.json` menjadwalkan `/api/keepalive` sekali sehari supaya proyek Supabase gratis tidak di-pause
  (proyek gratis di-pause setelah ± 1 minggu tanpa aktivitas).

## Backup & pemulihan
```bash
npm run cms:backup
```
Script hanya **membaca** dari Supabase (tidak mengubah/menghapus apa pun) dan menyimpan ke `backups/<tanggal>/`
(folder ini di-`.gitignore`, jangan di-commit — isinya termasuk email admin):
- `tables/*.json` — isi semua tabel CMS (`technologies`, `experiences`, `achievements`, `projects`, relasi teknologi, `site_settings`, `admins`, `contact_messages`).
- `media/` — semua file bucket `media` dengan struktur folder yang sama.
- `restore.sql` — SQL untuk mengisi ulang tabel dari backup ini.
- `manifest.json` — waktu backup, jumlah baris & file.

Backup kedua di hari yang sama disimpan ke `backups/<tanggal>_<jam>` (tidak menimpa). Simpan salinannya di tempat lain
(Google Drive / hard disk), mis. sebulan sekali atau setelah banyak mengubah konten.

**Memulihkan** (mis. proyek Supabase terhapus / pindah proyek baru):
1. Proyek baru: ikuti langkah 1–4 di atas (jalankan `schema.sql`, buat akun admin, isi env).
2. **SQL Editor** → tempel isi `backups/<tanggal>/restore.sql` → **Run**. Baris yang id-nya sudah ada dilewati, jadi aman dijalankan ulang.
3. **Storage → media** → unggah isi folder `backups/<tanggal>/media/` dengan struktur folder yang sama
   (mis. `achievements/thumbs/…`), karena database menyimpan path file tersebut.
4. Buka `/admin` → simpan salah satu konten (atau redeploy) agar halaman publik langsung diperbarui.

## Form kontak (pesan → inbox `/admin` + email)

Form di sheet **Hubungi Saya** mengirim ke `/api/contact`, yang memeriksa asal request, rate limit (3 pesan / 10 menit
& 10 / hari per IP), honeypot, dan **Cloudflare Turnstile**, lalu menyimpan pesan lewat fungsi database
`submit_contact_message()` dan mengirim notifikasi ke `filoalvianongky@gmail.com` lewat **Resend** (balas email =
langsung ke pengunjung). Pesan dibaca di **/admin → Pesan** (badge jumlah belum dibaca + widget di Dasbor).

Keamanan database (lihat [`contact.sql`](./contact.sql)): pengunjung **tidak punya hak apa pun** atas tabel
`contact_messages` (tanpa policy INSERT, jadi tidak bisa di-spam lewat REST API dengan publishable key). Pesan hanya
masuk lewat fungsi yang memeriksa token rahasia `CONTACT_FORM_SECRET`; database hanya menyimpan **hash** token itu di
schema `private` (tidak terekspos Data API). Tidak memakai secret key Supabase. IP pengunjung tidak disimpan.
Membaca / menandai / menghapus pesan hanya untuk admin yang sudah 2FA. Batas global: maks. 30 pesan / jam.

### Setup
1. **Database**: SQL Editor → jalankan [`contact.sql`](./contact.sql) (sudah termasuk di `schema.sql` terbaru).
2. **Rahasia form**: di komputer sendiri jalankan
   ```bash
   node -e "const c=require('crypto');const s=c.randomBytes(32).toString('base64url');console.log('CONTACT_FORM_SECRET='+s);console.log('hash: '+c.createHash('sha256').update(s).digest('hex'))"
   ```
   Simpan baris `CONTACT_FORM_SECRET=…` di `.env.local` & Vercel, lalu di SQL Editor jalankan (ganti `HASH` dengan hash-nya):
   ```sql
   insert into private.contact_form_secret (id, token_hash) values (true, 'HASH')
   on conflict (id) do update set token_hash = excluded.token_hash, updated_at = now();
   ```
   Mengganti rahasia = ulangi langkah ini (rahasia lama langsung tidak berlaku).
3. **Cloudflare Turnstile**: <https://dash.cloudflare.com> → daftar / masuk → **Turnstile** → **Add widget** →
   nama `FiloAlvian.com`, hostname `filoalvian.com`, `www.filoalvian.com` & `localhost`, mode **Managed** → Create.
   Salin **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY` dan **Secret Key** → `TURNSTILE_SECRET_KEY`.
   Untuk dev lokal boleh memakai key uji resmi Cloudflare (selalu lolos): site `1x00000000000000000000AA`,
   secret `1x0000000000000000000000000000000AA` — key uji **ditolak** di Vercel production.
4. **Resend**: <https://resend.com> → daftar dengan **filoalvianongky@gmail.com** → **API Keys** → **Create API key**
   (permission *Sending access*) → salin ke `RESEND_API_KEY`. Pengirim bawaan `onboarding@resend.dev` hanya bisa mengirim
   ke email pemilik akun Resend — karena itu daftar dengan email tujuan di atas. Agar pengirimnya dari domain sendiri:
   Resend → **Domains** → tambah `filoalvian.com` → salin record DNS ke Hostinger → setelah *Verified*, isi
   `CONTACT_FROM_EMAIL` (mis. `FiloAlvian.com <halo@filoalvian.com>`). Cukup record kirim (TXT `resend._domainkey`,
   CNAME `rsend` & `send`, TXT `_dmarc`); lewati MX `@` milik *Enable Receiving* agar tidak mengambil alih email masuk domain.
5. **Vercel** → Project **web-filo** → Settings → Environment Variables → tambahkan `CONTACT_FORM_SECRET`,
   `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY` (tipe **Sensitive**/Secret) dan `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   (+ `CONTACT_FROM_EMAIL` bila dipakai) → **Redeploy**. `NEXT_PUBLIC_…` dibaca saat build, jadi redeploy wajib.

Selama `NEXT_PUBLIC_TURNSTILE_SITE_KEY` kosong, form disembunyikan dan sheet hanya menampilkan link kontak.
Bila `RESEND_API_KEY` kosong / Resend gagal, pesan tetap tersimpan di inbox (hanya email notifikasinya yang tidak terkirim).

## Keamanan

- **Verifikasi 2 langkah (2FA) wajib** untuk admin. Login pertama menampilkan QR — pindai dengan Google Authenticator /
  Microsoft Authenticator / 1Password. Setelah itu setiap login butuh password **dan** kode 6 digit. Database juga
  menolak perubahan dari sesi yang belum 2FA (`is_admin()` memeriksa `aal2`).
- **HP hilang / authenticator terhapus?** Supabase Dashboard → Authentication → Users → pilih akunmu → hapus faktor MFA,
  lalu login lagi untuk memindai QR baru. Atau di SQL Editor:
  `delete from auth.mfa_factors where user_id = (select id from auth.users where email = 'EMAIL_KAMU');`
- Pendaftaran user baru **dimatikan** (Authentication → Sign In / Providers). Jangan diaktifkan lagi.
- Proyek yang sudah berjalan sebelum 2FA ditambahkan: jalankan [`security.sql`](./security.sql) sekali (isinya sudah ada di `schema.sql` terbaru).
- Proyek yang sudah berjalan sebelum menu **Pengaturan Website** ada: jalankan [`site-content.sql`](./site-content.sql) sekali
  (membuat tabel `site_settings` + RLS dan mengisinya dengan isi website saat itu; isinya sudah ada di `schema.sql` terbaru).
- Proyek yang sudah berjalan sebelum halaman detail (case study) ada: jalankan [`case-study.sql`](./case-study.sql) sekali
  (kolom `role`, `period`, `story`, `gallery` di `projects` dan `description` di `achievements`; sudah ada di `schema.sql` terbaru).
- Proyek yang sudah berjalan sebelum form kontak ada: jalankan [`contact.sql`](./contact.sql) sekali, lalu simpan hash
  rahasia form (lihat **Form kontak → Setup**).

### Rekomendasi di Vercel
- Tambahkan env **`CRON_SECRET`** (teks acak panjang) → `/api/keepalive` hanya bisa dipanggil oleh Vercel Cron.
- **Firewall → Rules**: buat rate limit untuk `/api/chat` (mis. 20 request/menit per IP), `/api/contact` (mis. 5 request/10 menit per IP) dan `/admin/login`.
  Saat diserang, aktifkan **Attack Challenge Mode** (Firewall → Bot Management).
- Di Google AI Studio / Cloud Console, pasang **batas kuota/budget** untuk `GEMINI_API_KEY` agar spam tidak menimbulkan biaya.

## Cara kerja singkat
- **Data teks & link** → tabel Postgres. Teks dwibahasa disimpan sebagai `{ "id": "...", "en": "..." }` (EN kosong = memakai ID).
- **Foto & PDF** → Supabase Storage bucket `media` (publik, maks. 20 MB/file). Gambar dikompres di browser ke WebP
  (maks. 2000 px) + thumbnail 900 px saat disimpan. Database hanya menyimpan path file. Galeri proyek (`projects.gallery`)
  hanya menyimpan path gambar penuh (`…-full.webp`); thumbnail-nya file yang sama dengan akhiran `-thumb`.
- **Tech stack** → tabel `technologies` + relasi ke pengalaman/proyek. Ikon diambil dari Simple Icons lewat pencarian di form.
  Section “Teknologi” di Home menampilkan teknologi yang dicentang **Tampilkan di Home**.
- **Keamanan** → Row Level Security: publik hanya bisa membaca konten yang dipublikasikan; menulis & upload hanya untuk email di tabel `admins`.
- **Pengaturan Website** → tabel `site_settings` (satu baris JSON per bagian: `hero`, `highlights`, `focus_intro`, `focus_areas`, `cv_profile`).
  Bila tabel kosong / belum dibuat, website memakai isi bawaan di `src/lib/data.js`.
- **Pratinjau draft** → tombol **Pratinjau** di `/admin` membuka website dalam mode pratinjau (Next.js Draft Mode, lewat
  `/api/preview`, khusus admin + 2FA): item yang disembunyikan (draft) ikut tampil. Keluar lewat tombol **Keluar** di website.
- **Kecepatan** → halaman publik tetap statis (diperbarui tiap 1 jam) dan langsung diperbarui setiap kali konten disimpan di `/admin`.
