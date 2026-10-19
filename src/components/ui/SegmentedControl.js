"use client";

import { motion } from "framer-motion";
import { spring } from "@/lib/motion";

// Segmented control ala iOS dengan indikator yang bergeser
export default function SegmentedControl({ options, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="flex w-full md:w-auto md:inline-flex p-1 rounded-full bg-surface-3/70 dark:bg-surface-2 overflow-x-auto no-scrollbar">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className="relative flex-1 md:flex-none h-9 px-2.5 md:px-4 rounded-full text-[13px] md:text-sm font-semibold whitespace-nowrap"
          >
            {active && (
              <motion.span
                layoutId="segment-indicator"
                transition={spring.snappy}
                className="absolute inset-0 rounded-full bg-surface dark:bg-surface-3 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_4px_12px_-6px_rgba(0,0,0,0.2)]"
              />
            )}
            <span className={`relative transition-colors ${active ? "text-fg" : "text-fg-2"}`}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
