"use client";

import { btn } from "@/components/ui/styles";

// Error boundary panel admin (mis. tabel belum dibuat / koneksi Supabase gagal)
export default function AdminError({ error, reset }) {
  return (
    <div className="card p-6 md:p-8">
      <h1 className="text-xl font-bold text-fg">Terjadi kesalahan</h1>
      <p className="mt-2 text-fg-2 break-words">{error.message}</p>
      <button onClick={reset} className={`${btn.tonal} mt-5 h-10 px-4 text-sm`}>
        Coba lagi
      </button>
    </div>
  );
}
