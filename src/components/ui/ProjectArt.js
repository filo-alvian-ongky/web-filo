import {
  Apple,
  BarChart3,
  Bot,
  Code2,
  Cpu,
  Database,
  Gamepad2,
  Globe,
  GraduationCap,
  HeartPulse,
  Leaf,
  Palette,
  ShoppingBag,
  Smartphone,
  Sparkles,
} from "lucide-react";

// Pilihan ikon sampul proyek (dipilih di CMS). Kunci disimpan di kolom projects.icon.
export const PROJECT_ICONS = {
  sparkles: { label: "Kilau / AI", icon: Sparkles },
  chart: { label: "AI + Analitik", icon: BarChart3 },
  apple: { label: "Buah", icon: Apple },
  bot: { label: "Chatbot", icon: Bot },
  code: { label: "Kode", icon: Code2 },
  cpu: { label: "Hardware / IoT", icon: Cpu },
  database: { label: "Data", icon: Database },
  gamepad: { label: "Game", icon: Gamepad2 },
  globe: { label: "Website", icon: Globe },
  smartphone: { label: "Aplikasi mobile", icon: Smartphone },
  palette: { label: "Desain", icon: Palette },
  shopping: { label: "E-commerce", icon: ShoppingBag },
  education: { label: "Edukasi", icon: GraduationCap },
  health: { label: "Kesehatan", icon: HeartPulse },
  leaf: { label: "Lingkungan", icon: Leaf },
};

/** Ilustrasi ikon besar di sampul gradien kartu proyek */
export default function ProjectArt({ icon, size = 96 }) {
  if (icon === "chart") {
    return (
      <div className="relative">
        <Cpu size={size} strokeWidth={1.5} className="text-white drop-shadow-lg" />
        <BarChart3 size={size * 0.42} strokeWidth={2} className="absolute -bottom-2 -right-3 text-white/90" />
      </div>
    );
  }
  const Icon = (PROJECT_ICONS[icon] ?? PROJECT_ICONS.sparkles).icon;
  return <Icon size={size} strokeWidth={1.5} className="text-white drop-shadow-lg" />;
}
