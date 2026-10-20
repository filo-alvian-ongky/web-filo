"use client";

import { Fragment, useMemo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

function Piece({ progress, range, dim, children }) {
  const opacity = useTransform(progress, range, [dim, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

/**
 * Teks yang "menyala" huruf demi huruf (atau kata demi kata) mengikuti posisi scroll —
 * maju saat digulir ke bawah, meredup lagi saat digulir ke atas.
 * @param by      "char" | "word"
 * @param target  ref elemen acuan scroll (default: teks ini sendiri)
 * @param offset  rentang scroll (format useScroll): mulai menyala → selesai menyala
 * @param within  bagian progres yang dipakai teks ini, mis. [0.4, 1] → baru menyala di paruh akhir
 */
export default function ScrubText({
  text,
  as: Tag = "p",
  by = "word",
  className = "",
  target,
  offset = ["start 0.9", "start 0.5"],
  within = [0, 1],
  dim = 0.18,
}) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: target ?? ref, offset });

  const { words, total } = useMemo(() => {
    let index = 0;
    const list = String(text)
      .split(" ")
      .map((w) => (by === "char" ? [...w] : [w]).map((part) => ({ part, index: index++ })));
    return { words: list, total: index };
  }, [text, by]);

  if (reduceMotion) {
    return (
      <Tag ref={ref} className={className}>
        {text}
      </Tag>
    );
  }

  // Tiap potongan menyala dalam jendela kecil yang saling tumpang-tindih → gradasi halus
  const span = Math.min(0.35, 4 / total);
  const [from, to] = within;
  const rangeOf = (i) => {
    const start = (i / total) * (1 - span);
    return [from + start * (to - from), from + (start + span) * (to - from)];
  };

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((parts, wi) => (
          <Fragment key={wi}>
            <span className="inline-block whitespace-nowrap">
              {parts.map(({ part, index }) => (
                <Piece key={index} progress={scrollYProgress} range={rangeOf(index)} dim={dim}>
                  {part}
                </Piece>
              ))}
            </span>
            {wi < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
