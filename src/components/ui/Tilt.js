"use client";

import { motion } from "framer-motion";
import { useTilt } from "@/lib/useTilt";

const TAGS = { div: motion.div, article: motion.article, button: motion.button, a: motion.a };

/**
 * Elemen motion dengan kemiringan 3D mengikuti kursor saat hover.
 * `resetOnPress`: langsung datar saat ditekan (dipakai kartu proyek sebelum animasi ke viewer).
 */
export default function Tilt({ as = "div", resetOnPress = false, style, children, onPointerMove, onPointerLeave, onPointerDown, ...rest }) {
  const tilt = useTilt();
  const Component = TAGS[as] ?? motion.div;

  return (
    <Component
      style={{ ...tilt.style, ...style }}
      onPointerMove={(e) => {
        tilt.handlers.onPointerMove(e);
        onPointerMove?.(e);
      }}
      onPointerLeave={(e) => {
        tilt.handlers.onPointerLeave(e);
        onPointerLeave?.(e);
      }}
      onPointerDown={(e) => {
        if (resetOnPress) tilt.reset();
        onPointerDown?.(e);
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}
