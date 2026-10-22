"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ExternalLink, Globe, Inbox, LogOut, Plus } from "lucide-react";
import { ADMIN_NAV, activeAdminNav } from "./nav";
import PreviewButton from "./PreviewButton";
import BrandLogo from "@/components/ui/BrandLogo";
import { SwapTitle, ThemeToggle } from "@/components/Navbar";
import { useUI } from "@/components/providers/UIProvider";
import { iconBtn } from "@/components/ui/styles";
import { useSlidingPill } from "@/components/ui/useSlidingPill";
import { getBrowserSupabase } from "@/lib/supabase/browser";

// Jumlah pesan belum dibaca (bulatan merah ala badge aplikasi). 99+ bila lebih.
function UnreadBadge({ count, className = "" }) {
  if (!count) return null;
  return (
    <span className={`inline-grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-[#e5484d] text-white text-[11px] font-bold leading-none tabular-nums ${className}`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

const unreadLabel = (count) => (count ? `, ${count} belum dibaca` : "");

function useSignOut() {
  const router = useRouter();
  return async () => {
    await getBrowserSupabase().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };
}

// Desktop: sidebar kaca melayang (gaya navbar website), indikator pil bergeser vertikal
function Sidebar({ email, active, unread }) {
  const pill = useSlidingPill(active.href);
  const signOut = useSignOut();
  return (
    <aside className="hidden md:flex fixed left-4 top-4 bottom-4 z-40 w-64 flex-col rounded-[2rem] glass shadow-float p-3">
      <Link href="/admin" className="pressable flex items-center gap-2.5 px-3 pt-2 pb-6">
        <BrandLogo title="Logo FiloAlvian.com" className="w-9 h-9 text-fg" />
        <span className="leading-tight">
          <span className="block text-[17px] font-bold tracking-tight text-fg">
            <span className="text-accent-fg">Filo</span>CMS
          </span>
          <span className="block text-xs font-medium text-fg-3">FiloAlvian.com</span>
        </span>
      </Link>

      <p className="px-3.5 pb-2 text-[11px] font-bold uppercase tracking-wider text-fg-3">Menu</p>
      <nav aria-label="Menu CMS" className="relative">
        <motion.span aria-hidden style={pill.style} className="absolute top-0 left-0 rounded-2xl bg-accent-soft" />
        <ul className="space-y-1">
          {ADMIN_NAV.map((item) => {
            const on = item.href === active.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  ref={pill.register(item.href)}
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  aria-label={item.badge && unread ? `${item.label}${unreadLabel(unread)}` : undefined}
                  className={`relative flex items-center gap-3 h-11 px-3.5 rounded-2xl text-[15px] font-semibold transition-colors ${
                    on ? "text-accent-fg" : "text-fg-2 hover:text-fg"
                  }`}
                >
                  <Icon size={19} strokeWidth={on ? 2.4 : 2} /> {item.label}
                  {item.badge && <UnreadBadge count={unread} className="ml-auto" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="pressable flex items-center gap-3 h-11 px-3.5 rounded-2xl text-[15px] font-semibold text-fg-2 hover:text-fg hover:bg-surface-2"
        >
          <Globe size={19} /> Lihat website <ExternalLink size={14} className="ml-auto text-fg-3" />
        </a>
        <PreviewButton
          label={
            <>
              Pratinjau draft <ExternalLink size={14} className="ml-auto text-fg-3" />
            </>
          }
          className="pressable flex items-center gap-3 h-11 px-3.5 rounded-2xl text-[15px] font-semibold text-fg-2 hover:text-fg hover:bg-surface-2"
        />
        <div className="flex items-center gap-2 p-2 rounded-[1.25rem] bg-surface/60 ring-1 ring-separator">
          <span aria-hidden className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-accent text-white text-sm font-bold uppercase">
            {email?.[0] ?? "A"}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] font-semibold text-fg leading-tight">Admin</span>
            <span className="block text-[11px] text-fg-3 truncate">{email}</span>
          </span>
          <ThemeToggle />
          <button onClick={signOut} className={iconBtn} aria-label="Keluar" title="Keluar">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// Ponsel: top bar kaca ala iOS + tombol inbox (Pesan tidak muat di tab bar). Teks di samping logo
// "FiloCMS", berganti jadi judul halaman saat judul besarnya tergulir (sama seperti navbar website).
function MobileHeader({ active, unread }) {
  const signOut = useSignOut();
  const { compactTitle } = useUI();
  return (
    <header className="md:hidden sticky top-0 z-40 bg-glass backdrop-blur-xl backdrop-saturate-150 border-b border-separator" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="h-14 pl-4 pr-2 flex items-center justify-between">
        <Link href="/admin" aria-label="FiloCMS — Dasbor" className="pressable flex items-center gap-2.5 min-w-0">
          <BrandLogo className="w-9 h-9 text-fg" />
          <SwapTitle
            title={compactTitle}
            className="min-w-0"
            brand={
              <>
                <span className="text-accent-fg">Filo</span>CMS
              </>
            }
          />
        </Link>
        <div className="flex items-center">
          <Link
            href="/admin/messages"
            aria-current={active.href === "/admin/messages" ? "page" : undefined}
            aria-label={`Pesan${unreadLabel(unread)}`}
            className={`${iconBtn} relative ${active.href === "/admin/messages" ? "text-accent-fg bg-accent-soft" : ""}`}
          >
            <Inbox size={19} />
            <UnreadBadge count={unread} className="absolute -top-0.5 -right-0.5 ring-2 ring-surface" />
          </Link>
          <ThemeToggle />
          <button onClick={signOut} className={iconBtn} aria-label="Keluar" title="Keluar">
            <LogOut size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}

const LABEL_BREATHING = 10;

const TAB_NAV = ADMIN_NAV.filter((n) => n.tab !== false);

// Ponsel: tab bar melayang (sama seperti website) + tombol bundar aksi utama
function MobileTabBar({ active }) {
  const pill = useSlidingPill(active.href);
  const listRef = useRef(null);
  const labels = useRef([]);
  const [iconsOnly, setIconsOnly] = useState(false);

  // Label disembunyikan bila tidak muat (layar sempit / huruf perangkat besar)
  useEffect(() => {
    const check = () => {
      const list = listRef.current;
      const items = labels.current.filter(Boolean);
      if (!list || !items.length) return;
      const style = getComputedStyle(list);
      const tabWidth = (list.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)) / items.length;
      setIconsOnly(Math.max(...items.map((el) => el.scrollWidth)) + LABEL_BREATHING > tabWidth);
    };
    const ro = new ResizeObserver(check);
    if (listRef.current) ro.observe(listRef.current);
    labels.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, []);

  // Di halaman konten tombol bundar = tambah data; di dasbor = buka website
  const fab = active.table
    ? { href: `${active.href}?new=1`, label: `Tambah ${active.noun}`, icon: Plus, external: false }
    : { href: "/", label: "Lihat website", icon: Globe, external: true };
  const FabIcon = fab.icon;

  return (
    <nav aria-label="Menu CMS" className="md:hidden fixed inset-x-0 bottom-0 z-50 px-3 pointer-events-none" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}>
      <div className="flex items-center gap-2.5">
        <ul ref={listRef} className="relative pointer-events-auto flex-1 flex items-center h-16 px-1.5 rounded-full glass shadow-float">
          <motion.span aria-hidden style={pill.style} className="absolute top-0 left-0 rounded-full bg-accent-soft" />
          {TAB_NAV.map((item, i) => {
            const on = item.href === active.href;
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1 basis-0 min-w-0">
                <Link
                  ref={pill.register(item.href)}
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  aria-label={item.label}
                  className={`pressable relative flex flex-col items-center justify-center h-[52px] rounded-full ${iconsOnly ? "gap-0" : "gap-0.5"}`}
                >
                  <Icon strokeWidth={on ? 2.4 : 2} className={`transition-all duration-200 ${iconsOnly ? "w-6 h-6" : "w-[21px] h-[21px]"} ${on ? "text-accent-fg" : "text-fg-2"}`} />
                  <span
                    ref={(el) => (labels.current[i] = el)}
                    aria-hidden
                    className={`max-w-full truncate text-[10px] tracking-[-0.01em] font-semibold transition-all duration-200 ${
                      iconsOnly ? "h-0 opacity-0 leading-[0]" : "h-auto opacity-100 leading-none"
                    } ${on ? "text-accent-fg" : "text-fg-2"}`}
                  >
                    {item.short ?? item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {fab.external ? (
          <a
            href={fab.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={fab.label}
            className="pointer-events-auto pressable grid place-items-center w-16 h-16 shrink-0 rounded-full bg-accent text-white shadow-float"
          >
            <FabIcon size={24} strokeWidth={2.25} />
          </a>
        ) : (
          <Link
            href={fab.href}
            aria-label={fab.label}
            className="pointer-events-auto pressable grid place-items-center w-16 h-16 shrink-0 rounded-full bg-accent text-white shadow-float"
          >
            <FabIcon size={26} strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </nav>
  );
}

export default function AdminShell({ email, unread = 0, children }) {
  const pathname = usePathname();
  const active = activeAdminNav(pathname);
  return (
    <div className="min-h-svh">
      <Sidebar email={email} active={active} unread={unread} />
      <MobileHeader active={active} unread={unread} />
      <main className="md:pl-[18.5rem] px-4 md:pr-8 pt-6 md:pt-10 pb-36 md:pb-14">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
      <MobileTabBar active={active} />
    </div>
  );
}
