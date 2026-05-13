import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Portfolio | Filo Alvian Ongky",
  description: "Computer Science Student & UI/UX Enthusiast",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="antialiased bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors">
        <Navbar />
        {children}
      </body>
    </html>
  );
}