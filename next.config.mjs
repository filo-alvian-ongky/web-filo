/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false, // Settingan lama kamu tetap ada
  output: 'export',     // Tambahan: Agar Next.js bisa jadi file statis
  images: {
    unoptimized: true,  // Tambahan: Wajib supaya logo medsos kamu muncul di GitHub Pages
  },
};

export default nextConfig;