"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { contactLinks } from "@/lib/data";
import { useUI } from "./providers/UIProvider";
import { useLang } from "@/lib/i18n";
import Sheet from "./ui/Sheet";

export default function ContactSheet() {
  const { contactOpen, closeContact } = useUI();
  const { t } = useLang();

  return (
    <Sheet open={contactOpen} onClose={closeContact} title={t.contactMe} subtitle={t.contactSub} size="sm">
      <div className="rounded-[1.4rem] bg-surface-2/70 overflow-hidden divide-y divide-separator">
        {contactLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-3/70 active:bg-surface-3"
          >
            <span className="relative w-11 h-11 rounded-[13px] overflow-hidden shrink-0 bg-surface">
              <Image src={link.iconPath} alt="" fill sizes="44px" className="object-cover" unoptimized />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold text-fg">{link.name}</span>
              <span className="block text-sm text-fg-2 truncate">{link.detail}</span>
            </span>
            <ArrowUpRight size={18} className="text-fg-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-fg" />
          </a>
        ))}
      </div>
    </Sheet>
  );
}
