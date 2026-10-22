import NotFound from "./NotFound";

// Dipakai untuk semua URL yang tidak dikenal (Next.js otomatis menambahkan noindex)
export const metadata = {
  title: "Halaman Tidak Ditemukan | Filo Alvian Ongky",
};

export default function NotFoundPage() {
  return <NotFound />;
}
