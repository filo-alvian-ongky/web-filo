import { Award, BriefcaseBusiness, Cpu, LayoutDashboard, LayoutGrid, SlidersHorizontal } from "lucide-react";

// Menu CMS (modul biasa, bukan "use client", agar bisa dipakai Server & Client Component).
// tone = warna aksen widget dasbor (sama dengan palet widget sorotan di Home)
// short = label tab bar ponsel (bila label lengkap terlalu panjang)
export const ADMIN_NAV = [
  { href: "/admin", label: "Dasbor", icon: LayoutDashboard },
  { href: "/admin/experiences", label: "Pengalaman", noun: "pengalaman", icon: BriefcaseBusiness, table: "experiences", tone: "#0A6CF5" },
  { href: "/admin/achievements", label: "Pencapaian", noun: "pencapaian", icon: Award, table: "achievements", tone: "#F59E0B" },
  { href: "/admin/projects", label: "Proyek", noun: "proyek", icon: LayoutGrid, table: "projects", tone: "#8B5CF6" },
  { href: "/admin/technologies", label: "Teknologi", noun: "teknologi", icon: Cpu, table: "technologies", tone: "#12A150" },
  { href: "/admin/settings", label: "Pengaturan Website", short: "Pengaturan", icon: SlidersHorizontal },
];

/** Menu aktif untuk pathname tertentu */
export const activeAdminNav = (pathname) =>
  [...ADMIN_NAV].reverse().find((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href))) ?? ADMIN_NAV[0];
