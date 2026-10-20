"use client";

import { Save } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import { btn } from "@/components/ui/styles";

/** Sheet berisi form CMS dengan tombol simpan yang selalu terlihat di bawah */
export default function FormSheet({ open, onClose, title, onSubmit, busy, status, children }) {
  return (
    <Sheet open={open} onClose={busy ? () => {} : onClose} title={title} size="lg" bodyClassName="p-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="px-5 md:px-6 pb-6 space-y-5">{children}</div>
        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-5 md:px-6 py-4 border-t border-separator bg-surface">
          {status && <span className="mr-auto text-sm text-fg-2">{status}</span>}
          <button type="button" onClick={onClose} disabled={busy} className={`${btn.secondary} h-11`}>
            Batal
          </button>
          <button type="submit" disabled={busy} className={`${btn.primary} h-11`}>
            <Save size={17} /> {busy ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
