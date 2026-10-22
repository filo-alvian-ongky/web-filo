// Ukuran & tata letak bersama komponen panel admin.
// Dipakai oleh komponen asli DAN skeleton loading-nya, jadi bentuk skeleton otomatis
// ikut berubah bila tata letak komponen diubah di sini.

export const PAGE_HEADER = {
  root: "flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8 px-1",
  title: "mt-1 text-[2.25rem] md:text-5xl leading-[1.05] font-extrabold tracking-tight",
  description: "mt-2 max-w-xl leading-relaxed",
};

export const LIST = {
  card: "card p-1.5 md:p-2 space-y-0.5",
  row: "flex items-center gap-2 md:gap-3 pl-1 pr-1.5 md:pr-2 py-1.5 rounded-[1.15rem]",
};

// Bentuk gambar/ikon di kiri tiap baris daftar
export const MEDIA = {
  thumb: "w-16 h-11 rounded-[10px]",
  tile: "w-11 h-11 rounded-[14px]",
  bar: "w-2.5 h-11 rounded-full",
};
export const MEDIA_OF = { experiences: "bar", achievements: "thumb", projects: "thumb", technologies: "tile" };

export const DASHBOARD = {
  widgets: "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4",
  widget: "h-full p-4 md:p-5 flex flex-col",
  number: "mt-5 text-[2rem] md:text-[2.5rem] leading-none font-extrabold tracking-tight",
  lower: "mt-3 md:mt-4 grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-4",
  quick: "lg:col-span-2 p-2 md:p-3",
  activity: "lg:col-span-3 p-2 md:p-3",
  cardTitle: "px-3 pt-3 pb-2",
  row: "flex items-center gap-3 px-3 py-2.5 rounded-[1.1rem]",
};

// Halaman Pengaturan Website: satu kartu per bagian (hero, sorotan, bidang fokus, profil CV)
export const SETTINGS = {
  stack: "space-y-3 md:space-y-4",
  card: "card p-1.5 md:p-2",
  head: "flex items-start justify-between gap-3 px-3 pt-3 pb-2",
  body: "px-3 pb-3",
};

/** Kunci sessionStorage jumlah item terakhir per tabel (skeleton menampilkan jumlah baris yang sama) */
export const countKey = (table) => `cms:count:${table}`;
