export const metadata = {
  title: { default: "Admin | FiloAlvian.com", template: "%s · Admin FiloAlvian.com" },
  robots: { index: false, follow: false },
};

// Latar (gradasi + jaringan partikel) sama dengan website, dipasang oleh AppShell
export default function AdminRootLayout({ children }) {
  return <div className="min-h-svh">{children}</div>;
}
