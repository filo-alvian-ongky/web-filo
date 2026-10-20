import Link from "next/link";
import BrandLogo from "@/components/ui/BrandLogo";

// Ditampilkan di /admin bila environment variable Supabase belum diisi
export default function SetupNotice() {
  return (
    <main className="min-h-svh grid place-items-center px-4 py-10">
      <div className="w-full max-w-lg rounded-[2rem] glass shadow-float p-6 md:p-8">
        <BrandLogo title="Logo FiloAlvian.com" className="w-12 h-12 text-fg" />
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-fg">CMS belum terhubung ke Supabase</h1>
        <p className="mt-2 text-fg-2 leading-relaxed">
          Isi <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> di file <code>.env.local</code>, lalu
          jalankan ulang <code>npm run dev</code>. Langkah lengkapnya ada di <code>supabase/README.md</code>.
        </p>
        <p className="mt-3 text-sm text-fg-3">Selama belum terhubung, website tetap tampil memakai konten lokal.</p>
        <Link href="/" className="mt-5 inline-flex items-center h-10 px-4 rounded-full bg-accent-soft text-accent-fg text-sm font-semibold">
          ← Kembali ke website
        </Link>
      </div>
    </main>
  );
}
